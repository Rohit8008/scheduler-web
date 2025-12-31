package com.scheduler.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "\"MeetingRequest\"")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class MeetingRequest {

    @Id
    private String id;

    @Column(nullable = false)
    private String requesterId; // User who is requesting the meeting

    @Column(nullable = false)
    private String receiverId; // User who will receive the request

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(nullable = false)
    private LocalDateTime startTime;

    @Column(nullable = false)
    private LocalDateTime endTime;

    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    private MeetingRequestStatus status = MeetingRequestStatus.PENDING;

    private String meetLink;

    private String googleEventId;

    @Column(columnDefinition = "TEXT")
    private String rejectionReason;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;

    @PrePersist
    public void prePersist() {
        if (id == null) {
            id = java.util.UUID.randomUUID().toString();
        }
        if (status == null) {
            status = MeetingRequestStatus.PENDING;
        }
    }

    public enum MeetingRequestStatus {
        PENDING,
        APPROVED,
        REJECTED,
        CANCELLED
    }
}
