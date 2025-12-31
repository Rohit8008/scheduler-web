package com.scheduler.service;

import com.scheduler.dto.MeetingRequestDTO;
import com.scheduler.model.MeetingRequest;
import com.scheduler.model.MeetingRequest.MeetingRequestStatus;
import com.scheduler.model.User;
import com.scheduler.repository.MeetingRequestRepository;
import com.scheduler.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class MeetingRequestService {

    private final MeetingRequestRepository meetingRequestRepository;
    private final UserRepository userRepository;
    private final GoogleCalendarService googleCalendarService;
    private final EmailService emailService;

    @Transactional(readOnly = true)
    public List<MeetingRequestDTO> getPendingRequestsForUser(String userId) {
        return meetingRequestRepository.findByReceiverIdAndStatus(userId, MeetingRequestStatus.PENDING)
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<MeetingRequestDTO> getSentRequests(String userId) {
        return meetingRequestRepository.findByRequesterId(userId)
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<MeetingRequestDTO> getReceivedRequests(String userId) {
        return meetingRequestRepository.findByReceiverId(userId)
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public MeetingRequestDTO createMeetingRequest(MeetingRequestDTO requestDTO) {
        // Validate users exist
        User requester = userRepository.findById(requestDTO.getRequesterId())
                .orElseThrow(() -> new RuntimeException("Requester not found"));
        User receiver = userRepository.findById(requestDTO.getReceiverId())
                .orElseThrow(() -> new RuntimeException("Receiver not found"));

        MeetingRequest request = new MeetingRequest();
        request.setRequesterId(requestDTO.getRequesterId());
        request.setReceiverId(requestDTO.getReceiverId());
        request.setTitle(requestDTO.getTitle());
        request.setDescription(requestDTO.getDescription());
        request.setStartTime(requestDTO.getStartTime());
        request.setEndTime(requestDTO.getEndTime());
        request.setStatus(MeetingRequestStatus.PENDING);

        MeetingRequest savedRequest = meetingRequestRepository.save(request);

        // Send notification email to receiver
        try {
            emailService.sendMeetingRequestNotification(savedRequest, requester, receiver);
        } catch (Exception e) {
            log.error("Failed to send meeting request notification", e);
        }

        return convertToDTO(savedRequest);
    }

    @Transactional
    public MeetingRequestDTO approveMeetingRequest(String requestId) {
        MeetingRequest request = meetingRequestRepository.findById(requestId)
                .orElseThrow(() -> new RuntimeException("Meeting request not found"));

        if (request.getStatus() != MeetingRequestStatus.PENDING) {
            throw new RuntimeException("Meeting request is not pending");
        }

        User requester = userRepository.findById(request.getRequesterId())
                .orElseThrow(() -> new RuntimeException("Requester not found"));
        User receiver = userRepository.findById(request.getReceiverId())
                .orElseThrow(() -> new RuntimeException("Receiver not found"));

        // Generate Meet link
        String meetLink = generateMeetLink(receiver, request);
        request.setMeetLink(meetLink);
        request.setStatus(MeetingRequestStatus.APPROVED);

        MeetingRequest approvedRequest = meetingRequestRepository.save(request);

        // Send approval emails to both parties
        try {
            emailService.sendMeetingRequestApproval(approvedRequest, requester, receiver);
        } catch (Exception e) {
            log.error("Failed to send meeting approval emails", e);
        }

        return convertToDTO(approvedRequest);
    }

    @Transactional
    public MeetingRequestDTO rejectMeetingRequest(String requestId, String rejectionReason) {
        MeetingRequest request = meetingRequestRepository.findById(requestId)
                .orElseThrow(() -> new RuntimeException("Meeting request not found"));

        if (request.getStatus() != MeetingRequestStatus.PENDING) {
            throw new RuntimeException("Meeting request is not pending");
        }

        User requester = userRepository.findById(request.getRequesterId())
                .orElseThrow(() -> new RuntimeException("Requester not found"));
        User receiver = userRepository.findById(request.getReceiverId())
                .orElseThrow(() -> new RuntimeException("Receiver not found"));

        request.setStatus(MeetingRequestStatus.REJECTED);
        request.setRejectionReason(rejectionReason);

        MeetingRequest rejectedRequest = meetingRequestRepository.save(request);

        // Send rejection email to requester
        try {
            emailService.sendMeetingRequestRejection(rejectedRequest, requester, receiver);
        } catch (Exception e) {
            log.error("Failed to send meeting rejection email", e);
        }

        return convertToDTO(rejectedRequest);
    }

    private String generateMeetLink(User user, MeetingRequest request) {
        try {
            if (user.getGoogleAccessToken() != null && !user.getGoogleAccessToken().isEmpty()) {
                log.info("Creating Google Calendar event for meeting request");
                com.google.api.services.calendar.model.Event calendarEvent =
                        googleCalendarService.createCalendarEvent(
                                user.getGoogleAccessToken(),
                                request.getTitle(),
                                request.getDescription() != null ? request.getDescription() : "",
                                "", // No specific attendee email here, will be in the email
                                request.getStartTime(),
                                request.getEndTime()
                        );

                if (calendarEvent.getConferenceData() != null &&
                        calendarEvent.getConferenceData().getEntryPoints() != null &&
                        !calendarEvent.getConferenceData().getEntryPoints().isEmpty()) {
                    String meetLink = calendarEvent.getConferenceData().getEntryPoints().get(0).getUri();
                    log.info("Successfully created Meet link: {}", meetLink);
                    request.setGoogleEventId(calendarEvent.getId());
                    return meetLink;
                }
            }
        } catch (Exception e) {
            log.error("Failed to create Google Calendar event: {}", e.getMessage(), e);
        }

        // Fallback to new meeting link
        return "https://meet.google.com/new";
    }

    private MeetingRequestDTO convertToDTO(MeetingRequest request) {
        MeetingRequestDTO dto = new MeetingRequestDTO();
        dto.setId(request.getId());
        dto.setRequesterId(request.getRequesterId());
        dto.setReceiverId(request.getReceiverId());
        dto.setTitle(request.getTitle());
        dto.setDescription(request.getDescription());
        dto.setStartTime(request.getStartTime());
        dto.setEndTime(request.getEndTime());
        dto.setStatus(request.getStatus());
        dto.setMeetLink(request.getMeetLink());
        dto.setGoogleEventId(request.getGoogleEventId());
        dto.setRejectionReason(request.getRejectionReason());
        dto.setCreatedAt(request.getCreatedAt());
        dto.setUpdatedAt(request.getUpdatedAt());

        // Fetch user details
        try {
            User requester = userRepository.findById(request.getRequesterId()).orElse(null);
            if (requester != null) {
                dto.setRequesterName(requester.getName());
                dto.setRequesterEmail(requester.getEmail());
            }

            User receiver = userRepository.findById(request.getReceiverId()).orElse(null);
            if (receiver != null) {
                dto.setReceiverName(receiver.getName());
                dto.setReceiverEmail(receiver.getEmail());
            }
        } catch (Exception e) {
            log.error("Failed to fetch user details for meeting request", e);
        }

        return dto;
    }
}
