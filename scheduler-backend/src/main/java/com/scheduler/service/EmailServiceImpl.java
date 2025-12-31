package com.scheduler.service;

import com.scheduler.model.Booking;
import com.scheduler.model.Event;
import com.scheduler.model.MeetingRequest;
import com.scheduler.model.User;
import com.scheduler.repository.BookingRepository;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.context.Context;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailServiceImpl implements EmailService {

    private final JavaMailSender mailSender;
    private final TemplateEngine templateEngine;
    private final BookingRepository bookingRepository;

    @Value("${app.email.from}")
    private String fromEmail;

    @Value("${app.email.enabled:true}")
    private boolean emailEnabled;

    private static final DateTimeFormatter DATE_FORMATTER =
            DateTimeFormatter.ofPattern("EEEE, MMMM d, yyyy");
    private static final DateTimeFormatter TIME_FORMATTER =
            DateTimeFormatter.ofPattern("h:mm a");

    @Override
    @Async("emailTaskExecutor")
    public void sendBookingEmails(Booking booking) {
        try {
            // Add a small delay to ensure transaction is committed
            Thread.sleep(500);

            // Fetch booking with all relationships loaded
            Booking fullBooking = bookingRepository.findByIdWithRelations(booking.getId())
                    .orElseThrow(() -> new RuntimeException("Booking not found: " + booking.getId()));

            // Verify relationships are loaded
            if (fullBooking.getEvent() == null) {
                log.error("Event is null for booking: {}", booking.getId());
                return;
            }
            if (fullBooking.getEvent().getUser() == null) {
                log.error("Event creator is null for booking: {}", booking.getId());
                return;
            }

            // Send emails synchronously (we're already in async context)
            sendBookingConfirmationEmail(fullBooking);
            sendBookingNotificationEmail(fullBooking);
        } catch (InterruptedException e) {
            log.error("Thread interrupted while sending booking emails", e);
            Thread.currentThread().interrupt();
        } catch (Exception e) {
            log.error("Failed to send booking emails: {}", e.getMessage(), e);
        }
    }

    private void sendBookingConfirmationEmail(Booking booking) {
        if (!emailEnabled) {
            log.info("Email disabled. Skipping confirmation to: {}", booking.getEmail());
            return;
        }

        try {
            Event event = booking.getEvent();
            User creator = event.getUser();

            Context context = new Context();
            context.setVariable("attendeeName", booking.getName());
            context.setVariable("eventTitle", event.getTitle());
            context.setVariable("eventDescription", event.getDescription());
            context.setVariable("creatorName", creator.getName());
            context.setVariable("creatorEmail", creator.getEmail());
            context.setVariable("date", booking.getStartTime().format(DATE_FORMATTER));
            context.setVariable("startTime", booking.getStartTime().format(TIME_FORMATTER));
            context.setVariable("endTime", booking.getEndTime().format(TIME_FORMATTER));
            context.setVariable("meetLink", booking.getMeetLink());
            context.setVariable("additionalInfo", booking.getAdditionalInfo());
            context.setVariable("bookingId", booking.getId());

            String htmlContent = templateEngine.process("booking-confirmation", context);

            // Generate ICS calendar file
            String icsContent = generateICSFile(booking);

            sendEmailWithAttachment(
                    booking.getEmail(),
                    "Booking Confirmed: " + event.getTitle(),
                    htmlContent,
                    icsContent,
                    "event.ics"
            );

            log.info("Sent booking confirmation with calendar invite to: {}", booking.getEmail());

        } catch (Exception e) {
            log.error("Failed to send confirmation email to: {}. Error: {}",
                    booking.getEmail(), e.getMessage(), e);
        }
    }

    private void sendBookingNotificationEmail(Booking booking) {
        if (!emailEnabled) {
            log.info("Email disabled. Skipping notification to creator");
            return;
        }

        try {
            Event event = booking.getEvent();
            User creator = event.getUser();

            Context context = new Context();
            context.setVariable("creatorName", creator.getName());
            context.setVariable("attendeeName", booking.getName());
            context.setVariable("attendeeEmail", booking.getEmail());
            context.setVariable("eventTitle", event.getTitle());
            context.setVariable("date", booking.getStartTime().format(DATE_FORMATTER));
            context.setVariable("startTime", booking.getStartTime().format(TIME_FORMATTER));
            context.setVariable("endTime", booking.getEndTime().format(TIME_FORMATTER));
            context.setVariable("meetLink", booking.getMeetLink());
            context.setVariable("additionalInfo", booking.getAdditionalInfo());

            String htmlContent = templateEngine.process("booking-notification", context);

            sendEmail(
                    creator.getEmail(),
                    "New Booking: " + booking.getName() + " - " + event.getTitle(),
                    htmlContent
            );

            log.info("Sent booking notification to creator: {}", creator.getEmail());

        } catch (Exception e) {
            log.error("Failed to send notification email to creator. Error: {}",
                    e.getMessage(), e);
        }
    }

    @Override
    @Async("emailTaskExecutor")
    public void sendBookingConfirmationToAttendee(Booking booking) {
        sendBookingConfirmationEmail(booking);
    }

    @Override
    @Async("emailTaskExecutor")
    public void sendBookingNotificationToCreator(Booking booking) {
        sendBookingNotificationEmail(booking);
    }

    @Override
    @Async("emailTaskExecutor")
    public void sendCancellationEmail(Booking booking) {
        // Future implementation for cancellation emails
        log.info("Cancellation email not yet implemented");
    }

    private void sendEmail(String to, String subject, String htmlContent)
            throws MessagingException {
        MimeMessage message = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

        helper.setFrom(fromEmail);
        helper.setTo(to);
        helper.setSubject(subject);
        helper.setText(htmlContent, true); // true = HTML

        mailSender.send(message);
    }

    private void sendEmailWithAttachment(String to, String subject, String htmlContent,
                                          String attachmentContent, String attachmentName)
            throws MessagingException {
        MimeMessage message = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

        helper.setFrom(fromEmail);
        helper.setTo(to);
        helper.setSubject(subject);
        helper.setText(htmlContent, true); // true = HTML

        // Add ICS attachment
        helper.addAttachment(attachmentName, () ->
            new java.io.ByteArrayInputStream(attachmentContent.getBytes(java.nio.charset.StandardCharsets.UTF_8)),
            "text/calendar");

        mailSender.send(message);
    }

    /**
     * Generate ICS calendar file for booking
     * @param booking The booking to create calendar event for
     * @return ICS file content as string
     */
    private String generateICSFile(Booking booking) {
        Event event = booking.getEvent();
        User creator = event.getUser();

        StringBuilder ics = new StringBuilder();
        ics.append("BEGIN:VCALENDAR\n");
        ics.append("VERSION:2.0\n");
        ics.append("PRODID:-//Scheduler//Booking//EN\n");
        ics.append("CALSCALE:GREGORIAN\n");
        ics.append("METHOD:REQUEST\n");
        ics.append("BEGIN:VEVENT\n");
        ics.append("UID:").append(booking.getId()).append("@scheduler.com\n");
        ics.append("DTSTAMP:").append(formatDateForICS(LocalDateTime.now())).append("\n");
        ics.append("DTSTART:").append(formatDateForICS(booking.getStartTime())).append("\n");
        ics.append("DTEND:").append(formatDateForICS(booking.getEndTime())).append("\n");
        ics.append("SUMMARY:").append(event.getTitle()).append("\n");
        ics.append("DESCRIPTION:").append(escapeICSText(event.getDescription())).append("\\n\\n");
        ics.append("Meeting Link: ").append(booking.getMeetLink()).append("\n");
        ics.append("LOCATION:").append(booking.getMeetLink()).append("\n");
        ics.append("ORGANIZER;CN=").append(creator.getName()).append(":mailto:").append(creator.getEmail()).append("\n");
        ics.append("ATTENDEE;CN=").append(booking.getName()).append(";RSVP=TRUE:mailto:").append(booking.getEmail()).append("\n");
        ics.append("STATUS:CONFIRMED\n");
        ics.append("SEQUENCE:0\n");
        ics.append("END:VEVENT\n");
        ics.append("END:VCALENDAR\n");

        return ics.toString();
    }

    private String formatDateForICS(LocalDateTime dateTime) {
        return dateTime.format(DateTimeFormatter.ofPattern("yyyyMMdd'T'HHmmss'Z'"));
    }

    private String escapeICSText(String text) {
        if (text == null) return "";
        return text.replace("\\", "\\\\")
                .replace(",", "\\,")
                .replace(";", "\\;")
                .replace("\n", "\\n");
    }

    @Override
    @Async("emailTaskExecutor")
    public void sendMeetingRequestNotification(MeetingRequest request, User requester, User receiver) {
        if (!emailEnabled) {
            log.info("Email disabled. Skipping meeting request notification to: {}", receiver.getEmail());
            return;
        }

        try {
            Context context = new Context();
            context.setVariable("receiverName", receiver.getName());
            context.setVariable("requesterName", requester.getName());
            context.setVariable("requesterEmail", requester.getEmail());
            context.setVariable("meetingTitle", request.getTitle());
            context.setVariable("meetingDescription", request.getDescription());
            context.setVariable("date", request.getStartTime().format(DATE_FORMATTER));
            context.setVariable("startTime", request.getStartTime().format(TIME_FORMATTER));
            context.setVariable("endTime", request.getEndTime().format(TIME_FORMATTER));
            context.setVariable("requestId", request.getId());

            String htmlContent = templateEngine.process("meeting-request-notification", context);

            sendEmail(
                    receiver.getEmail(),
                    "Meeting Request from " + requester.getName(),
                    htmlContent
            );

            log.info("Sent meeting request notification to: {}", receiver.getEmail());

        } catch (Exception e) {
            log.error("Failed to send meeting request notification to: {}. Error: {}",
                    receiver.getEmail(), e.getMessage(), e);
        }
    }

    @Override
    @Async("emailTaskExecutor")
    public void sendMeetingRequestApproval(MeetingRequest request, User requester, User receiver) {
        if (!emailEnabled) {
            log.info("Email disabled. Skipping meeting request approval emails");
            return;
        }

        try {
            // Send approval email to requester
            Context requesterContext = new Context();
            requesterContext.setVariable("userName", requester.getName());
            requesterContext.setVariable("receiverName", receiver.getName());
            requesterContext.setVariable("meetingTitle", request.getTitle());
            requesterContext.setVariable("meetingDescription", request.getDescription());
            requesterContext.setVariable("date", request.getStartTime().format(DATE_FORMATTER));
            requesterContext.setVariable("startTime", request.getStartTime().format(TIME_FORMATTER));
            requesterContext.setVariable("endTime", request.getEndTime().format(TIME_FORMATTER));
            requesterContext.setVariable("meetLink", request.getMeetLink());

            String requesterHtmlContent = templateEngine.process("meeting-request-approval", requesterContext);

            // Generate ICS for requester
            String requesterICS = generateMeetingRequestICS(request, requester, receiver, requester.getEmail());

            sendEmailWithAttachment(
                    requester.getEmail(),
                    "Meeting Approved: " + request.getTitle(),
                    requesterHtmlContent,
                    requesterICS,
                    "meeting.ics"
            );

            log.info("Sent meeting approval email to requester: {}", requester.getEmail());

            // Send approval email to receiver
            Context receiverContext = new Context();
            receiverContext.setVariable("userName", receiver.getName());
            receiverContext.setVariable("requesterName", requester.getName());
            receiverContext.setVariable("meetingTitle", request.getTitle());
            receiverContext.setVariable("meetingDescription", request.getDescription());
            receiverContext.setVariable("date", request.getStartTime().format(DATE_FORMATTER));
            receiverContext.setVariable("startTime", request.getStartTime().format(TIME_FORMATTER));
            receiverContext.setVariable("endTime", request.getEndTime().format(TIME_FORMATTER));
            receiverContext.setVariable("meetLink", request.getMeetLink());

            String receiverHtmlContent = templateEngine.process("meeting-request-approval", receiverContext);

            // Generate ICS for receiver
            String receiverICS = generateMeetingRequestICS(request, requester, receiver, receiver.getEmail());

            sendEmailWithAttachment(
                    receiver.getEmail(),
                    "Meeting Confirmed: " + request.getTitle(),
                    receiverHtmlContent,
                    receiverICS,
                    "meeting.ics"
            );

            log.info("Sent meeting approval email to receiver: {}", receiver.getEmail());

        } catch (Exception e) {
            log.error("Failed to send meeting approval emails. Error: {}", e.getMessage(), e);
        }
    }

    @Override
    @Async("emailTaskExecutor")
    public void sendMeetingRequestRejection(MeetingRequest request, User requester, User receiver) {
        if (!emailEnabled) {
            log.info("Email disabled. Skipping meeting request rejection email");
            return;
        }

        try {
            Context context = new Context();
            context.setVariable("requesterName", requester.getName());
            context.setVariable("receiverName", receiver.getName());
            context.setVariable("meetingTitle", request.getTitle());
            context.setVariable("meetingDescription", request.getDescription());
            context.setVariable("date", request.getStartTime().format(DATE_FORMATTER));
            context.setVariable("startTime", request.getStartTime().format(TIME_FORMATTER));
            context.setVariable("endTime", request.getEndTime().format(TIME_FORMATTER));
            context.setVariable("rejectionReason", request.getRejectionReason());

            String htmlContent = templateEngine.process("meeting-request-rejection", context);

            sendEmail(
                    requester.getEmail(),
                    "Meeting Request Declined: " + request.getTitle(),
                    htmlContent
            );

            log.info("Sent meeting rejection email to: {}", requester.getEmail());

        } catch (Exception e) {
            log.error("Failed to send meeting rejection email to: {}. Error: {}",
                    requester.getEmail(), e.getMessage(), e);
        }
    }

    /**
     * Generate ICS calendar file for meeting request
     */
    private String generateMeetingRequestICS(MeetingRequest request, User requester, User receiver, String attendeeEmail) {
        StringBuilder ics = new StringBuilder();
        ics.append("BEGIN:VCALENDAR\n");
        ics.append("VERSION:2.0\n");
        ics.append("PRODID:-//Scheduler//Meeting Request//EN\n");
        ics.append("CALSCALE:GREGORIAN\n");
        ics.append("METHOD:REQUEST\n");
        ics.append("BEGIN:VEVENT\n");
        ics.append("UID:").append(request.getId()).append("@scheduler.com\n");
        ics.append("DTSTAMP:").append(formatDateForICS(LocalDateTime.now())).append("\n");
        ics.append("DTSTART:").append(formatDateForICS(request.getStartTime())).append("\n");
        ics.append("DTEND:").append(formatDateForICS(request.getEndTime())).append("\n");
        ics.append("SUMMARY:").append(request.getTitle()).append("\n");
        ics.append("DESCRIPTION:").append(escapeICSText(request.getDescription())).append("\\n\\n");
        ics.append("Meeting Link: ").append(request.getMeetLink()).append("\n");
        ics.append("LOCATION:").append(request.getMeetLink()).append("\n");
        ics.append("ORGANIZER;CN=").append(receiver.getName()).append(":mailto:").append(receiver.getEmail()).append("\n");
        ics.append("ATTENDEE;CN=").append(requester.getName()).append(";RSVP=TRUE:mailto:").append(requester.getEmail()).append("\n");
        ics.append("ATTENDEE;CN=").append(receiver.getName()).append(";RSVP=TRUE:mailto:").append(receiver.getEmail()).append("\n");
        ics.append("STATUS:CONFIRMED\n");
        ics.append("SEQUENCE:0\n");
        ics.append("END:VEVENT\n");
        ics.append("END:VCALENDAR\n");

        return ics.toString();
    }

    @Override
    @Async("emailTaskExecutor")
    public void sendConnectionRequestNotification(com.scheduler.model.Connection connection, User sender, User receiver) {
        if (!emailEnabled) {
            log.info("Email disabled. Skipping connection request notification to: {}", receiver.getEmail());
            return;
        }

        try {
            Context context = new Context();
            context.setVariable("receiverName", receiver.getName());
            context.setVariable("senderName", sender.getName());
            context.setVariable("senderEmail", sender.getEmail());
            context.setVariable("message", connection.getMessage() != null ? connection.getMessage() : "");
            context.setVariable("connectionId", connection.getId());

            String htmlContent = templateEngine.process("connection-request-notification", context);

            sendEmail(
                    receiver.getEmail(),
                    "Connection Request from " + sender.getName(),
                    htmlContent
            );

            log.info("Sent connection request notification to: {}", receiver.getEmail());

        } catch (Exception e) {
            log.error("Failed to send connection request notification to: {}. Error: {}",
                    receiver.getEmail(), e.getMessage(), e);
        }
    }

    @Override
    @Async("emailTaskExecutor")
    public void sendConnectionAcceptedNotification(com.scheduler.model.Connection connection, User sender, User receiver) {
        if (!emailEnabled) {
            log.info("Email disabled. Skipping connection accepted notification emails");
            return;
        }

        try {
            // Send email to sender (person who sent original request)
            Context senderContext = new Context();
            senderContext.setVariable("userName", sender.getName());
            senderContext.setVariable("accepterName", receiver.getName());
            senderContext.setVariable("accepterEmail", receiver.getEmail());

            String senderHtmlContent = templateEngine.process("connection-accepted", senderContext);

            sendEmail(
                    sender.getEmail(),
                    receiver.getName() + " accepted your connection request",
                    senderHtmlContent
            );

            log.info("Sent connection accepted notification to sender: {}", sender.getEmail());

            // Send email to receiver (person who accepted)
            Context receiverContext = new Context();
            receiverContext.setVariable("userName", receiver.getName());
            receiverContext.setVariable("accepterName", sender.getName());
            receiverContext.setVariable("accepterEmail", sender.getEmail());

            String receiverHtmlContent = templateEngine.process("connection-accepted", receiverContext);

            sendEmail(
                    receiver.getEmail(),
                    "You're now connected with " + sender.getName(),
                    receiverHtmlContent
            );

            log.info("Sent connection accepted notification to receiver: {}", receiver.getEmail());

        } catch (Exception e) {
            log.error("Failed to send connection accepted emails. Error: {}", e.getMessage(), e);
        }
    }

    @Override
    @Async("emailTaskExecutor")
    public void sendConnectionRejectedNotification(com.scheduler.model.Connection connection, User sender, User receiver) {
        if (!emailEnabled) {
            log.info("Email disabled. Skipping connection rejected notification to: {}", sender.getEmail());
            return;
        }

        try {
            Context context = new Context();
            context.setVariable("userName", sender.getName());
            context.setVariable("rejecterName", receiver.getName());

            String htmlContent = templateEngine.process("connection-rejected", context);

            sendEmail(
                    sender.getEmail(),
                    "Connection request declined",
                    htmlContent
            );

            log.info("Sent connection rejection notification to: {}", sender.getEmail());

        } catch (Exception e) {
            log.error("Failed to send connection rejection notification to: {}. Error: {}",
                    sender.getEmail(), e.getMessage(), e);
        }
    }
}
