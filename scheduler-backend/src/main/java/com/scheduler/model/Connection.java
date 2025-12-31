package com.scheduler.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "connections")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Connection {

    @Id
    private String id;

    @Column(nullable = false)
    private String senderId; // User who sent the connection request

    @Column(nullable = false)
    private String receiverId; // User who received the connection request

    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    private ConnectionStatus status = ConnectionStatus.PENDING;

    @Column(columnDefinition = "TEXT")
    private String message; // Optional message from sender

    private LocalDateTime connectedAt; // When connection was accepted

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
            status = ConnectionStatus.PENDING;
        }
    }

    public enum ConnectionStatus {
        PENDING,    // Request sent, awaiting response
        ACCEPTED,   // Both users are connected
        REJECTED,   // Request was declined
        BLOCKED     // User blocked the sender
    }
}
