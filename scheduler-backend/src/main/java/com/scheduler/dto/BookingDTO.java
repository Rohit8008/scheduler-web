package com.scheduler.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class BookingDTO {
    private String id;
    private String eventId;
    private String userId;
    private String name;
    private String email;
    private String additionalInfo;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private String meetLink;
    private String googleEventId;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
