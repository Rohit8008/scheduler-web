package com.scheduler.model;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "\"DayAvailability\"")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class DayAvailability {

    @Id
    private String id;

    @Column(nullable = false)
    private String availabilityId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "availabilityId", insertable = false, updatable = false)
    @JsonBackReference("availability-days")
    private Availability availability;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private DayOfWeek day;

    @Column(nullable = false)
    private LocalDateTime startTime;

    @Column(nullable = false)
    private LocalDateTime endTime;

    @PrePersist
    public void prePersist() {
        if (id == null) {
            id = java.util.UUID.randomUUID().toString();
        }
    }
}
