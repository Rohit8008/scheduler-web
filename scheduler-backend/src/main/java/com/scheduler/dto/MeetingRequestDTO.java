package com.scheduler.dto;

import com.scheduler.model.MeetingRequest.MeetingRequestStatus;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class MeetingRequestDTO {
    private String id;
    private String requesterId;
    private String requesterName;
    private String requesterEmail;
    private String receiverId;
    private String receiverName;
    private String receiverEmail;
    private String title;
    private String description;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private MeetingRequestStatus status;
    private String meetLink;
    private String googleEventId;
    private String rejectionReason;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
