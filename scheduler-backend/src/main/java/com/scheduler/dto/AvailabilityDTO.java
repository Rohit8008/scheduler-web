package com.scheduler.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AvailabilityDTO {
    private String id;
    private String userId;
    private Integer timeGap;
    private List<DayAvailabilityDTO> days;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
