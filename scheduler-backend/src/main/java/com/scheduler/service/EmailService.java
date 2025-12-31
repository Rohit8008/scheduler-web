package com.scheduler.service;

import com.scheduler.model.Booking;
import com.scheduler.model.Connection;
import com.scheduler.model.MeetingRequest;
import com.scheduler.model.User;

public interface EmailService {

    /**
     * Send booking confirmation email to attendee
     * @param booking The created booking
     */
    void sendBookingConfirmationToAttendee(Booking booking);

    /**
     * Send booking notification email to event creator
     * @param booking The created booking
     */
    void sendBookingNotificationToCreator(Booking booking);

    /**
     * Send both confirmation and notification emails asynchronously
     * @param booking The created booking
     */
    void sendBookingEmails(Booking booking);

    /**
     * Send booking cancellation email
     * @param booking The cancelled booking
     */
    void sendCancellationEmail(Booking booking);

    /**
     * Send meeting request notification to receiver
     * @param request The meeting request
     * @param requester The user requesting the meeting
     * @param receiver The user receiving the request
     */
    void sendMeetingRequestNotification(MeetingRequest request, User requester, User receiver);

    /**
     * Send meeting request approval emails to both parties
     * @param request The approved meeting request
     * @param requester The user who requested the meeting
     * @param receiver The user who approved the request
     */
    void sendMeetingRequestApproval(MeetingRequest request, User requester, User receiver);

    /**
     * Send meeting request rejection email to requester
     * @param request The rejected meeting request
     * @param requester The user who requested the meeting
     * @param receiver The user who rejected the request
     */
    void sendMeetingRequestRejection(MeetingRequest request, User requester, User receiver);

    /**
     * Send connection request notification to receiver
     * @param connection The connection request
     * @param sender The user sending the connection request
     * @param receiver The user receiving the request
     */
    void sendConnectionRequestNotification(Connection connection, User sender, User receiver);

    /**
     * Send connection accepted notification to both parties
     * @param connection The accepted connection
     * @param sender The user who sent the connection request
     * @param receiver The user who accepted the request
     */
    void sendConnectionAcceptedNotification(Connection connection, User sender, User receiver);

    /**
     * Send connection rejected notification to sender
     * @param connection The rejected connection
     * @param sender The user who sent the connection request
     * @param receiver The user who rejected the request
     */
    void sendConnectionRejectedNotification(Connection connection, User sender, User receiver);
}
