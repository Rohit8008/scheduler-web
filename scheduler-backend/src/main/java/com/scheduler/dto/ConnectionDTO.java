package com.scheduler.dto;

import com.scheduler.model.Connection.ConnectionStatus;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ConnectionDTO {
    private String id;
    private String senderId;
    private String senderName;
    private String senderEmail;
    private String receiverId;
    private String receiverName;
    private String receiverEmail;
    private ConnectionStatus status;
    private String message;
    private LocalDateTime connectedAt;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
