package com.scheduler.controller;

import com.scheduler.dto.MeetingRequestDTO;
import com.scheduler.service.ConnectionService;
import com.scheduler.service.MeetingRequestService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/meeting-requests")
@RequiredArgsConstructor
public class MeetingRequestController {

    private final MeetingRequestService meetingRequestService;
    private final ConnectionService connectionService;

    @GetMapping("/pending/{userId}")
    public ResponseEntity<List<MeetingRequestDTO>> getPendingRequests(@PathVariable String userId) {
        return ResponseEntity.ok(meetingRequestService.getPendingRequestsForUser(userId));
    }

    @GetMapping("/sent/{userId}")
    public ResponseEntity<List<MeetingRequestDTO>> getSentRequests(@PathVariable String userId) {
        return ResponseEntity.ok(meetingRequestService.getSentRequests(userId));
    }

    @GetMapping("/received/{userId}")
    public ResponseEntity<List<MeetingRequestDTO>> getReceivedRequests(@PathVariable String userId) {
        return ResponseEntity.ok(meetingRequestService.getReceivedRequests(userId));
    }

    @PostMapping
    public ResponseEntity<MeetingRequestDTO> createMeetingRequest(@RequestBody MeetingRequestDTO requestDTO) {
        // Validate that users are connected before allowing meeting request
        boolean areConnected = connectionService.areConnected(requestDTO.getRequesterId(), requestDTO.getReceiverId());
        if (!areConnected) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(null); // Or throw exception: throw new RuntimeException("You must be connected with this user to send a meeting request");
        }

        MeetingRequestDTO created = meetingRequestService.createMeetingRequest(requestDTO);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PostMapping("/{requestId}/approve")
    public ResponseEntity<MeetingRequestDTO> approveMeetingRequest(@PathVariable String requestId) {
        MeetingRequestDTO approved = meetingRequestService.approveMeetingRequest(requestId);
        return ResponseEntity.ok(approved);
    }

    @PostMapping("/{requestId}/reject")
    public ResponseEntity<MeetingRequestDTO> rejectMeetingRequest(
            @PathVariable String requestId,
            @RequestBody Map<String, String> body) {
        String reason = body.getOrDefault("reason", "No reason provided");
        MeetingRequestDTO rejected = meetingRequestService.rejectMeetingRequest(requestId, reason);
        return ResponseEntity.ok(rejected);
    }
}
