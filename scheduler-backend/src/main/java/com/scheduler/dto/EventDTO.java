package com.scheduler.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class EventDTO {
    private String id;
    private String title;
    private String description;
    private Integer duration;
    private String userId;
    private Boolean isPrivate;
    private String meetLink;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
