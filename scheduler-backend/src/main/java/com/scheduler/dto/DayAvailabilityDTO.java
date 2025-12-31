package com.scheduler.dto;

import com.scheduler.model.DayOfWeek;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DayAvailabilityDTO {
    private String id;
    private String availabilityId;
    private DayOfWeek day;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
}
