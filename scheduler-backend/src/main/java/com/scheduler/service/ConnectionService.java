package com.scheduler.service;

import com.scheduler.dto.ConnectionDTO;
import com.scheduler.model.Connection;
import com.scheduler.model.Connection.ConnectionStatus;
import com.scheduler.model.User;
import com.scheduler.repository.ConnectionRepository;
import com.scheduler.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;
import java.util.stream.Stream;

@Service
@RequiredArgsConstructor
@Slf4j
public class ConnectionService {

    private final ConnectionRepository connectionRepository;
    private final UserRepository userRepository;
    private final EmailService emailService;

    @Transactional
    public ConnectionDTO sendConnectionRequest(String senderId, String receiverId, String message) {
        // Validate users exist
        User sender = userRepository.findById(senderId)
                .orElseThrow(() -> new RuntimeException("Sender not found"));
        User receiver = userRepository.findById(receiverId)
                .orElseThrow(() -> new RuntimeException("Receiver not found"));

        // Check if connection already exists (either direction)
        var existingConnection = connectionRepository.findBySenderIdAndReceiverId(senderId, receiverId);
        if (existingConnection.isPresent()) {
            throw new RuntimeException("Connection request already exists");
        }
        var reverseConnection = connectionRepository.findBySenderIdAndReceiverId(receiverId, senderId);
        if (reverseConnection.isPresent()) {
            throw new RuntimeException("Connection request already exists");
        }

        Connection connection = new Connection();
        connection.setSenderId(senderId);
        connection.setReceiverId(receiverId);
        connection.setMessage(message);
        connection.setStatus(ConnectionStatus.PENDING);

        Connection savedConnection = connectionRepository.save(connection);

        // Send notification email to receiver
        try {
            emailService.sendConnectionRequestNotification(savedConnection, sender, receiver);
        } catch (Exception e) {
            log.error("Failed to send connection request notification", e);
        }

        return convertToDTO(savedConnection);
    }

    @Transactional
    public ConnectionDTO acceptConnection(String connectionId) {
        Connection connection = connectionRepository.findById(connectionId)
                .orElseThrow(() -> new RuntimeException("Connection not found"));

        if (connection.getStatus() != ConnectionStatus.PENDING) {
            throw new RuntimeException("Connection is not pending");
        }

        User sender = userRepository.findById(connection.getSenderId())
                .orElseThrow(() -> new RuntimeException("Sender not found"));
        User receiver = userRepository.findById(connection.getReceiverId())
                .orElseThrow(() -> new RuntimeException("Receiver not found"));

        connection.setStatus(ConnectionStatus.ACCEPTED);
        connection.setConnectedAt(LocalDateTime.now());

        Connection acceptedConnection = connectionRepository.save(connection);

        // Send acceptance emails to both parties
        try {
            emailService.sendConnectionAcceptedNotification(acceptedConnection, sender, receiver);
        } catch (Exception e) {
            log.error("Failed to send connection acceptance emails", e);
        }

        return convertToDTO(acceptedConnection);
    }

    @Transactional
    public ConnectionDTO rejectConnection(String connectionId) {
        Connection connection = connectionRepository.findById(connectionId)
                .orElseThrow(() -> new RuntimeException("Connection not found"));

        if (connection.getStatus() != ConnectionStatus.PENDING) {
            throw new RuntimeException("Connection is not pending");
        }

        User sender = userRepository.findById(connection.getSenderId())
                .orElseThrow(() -> new RuntimeException("Sender not found"));
        User receiver = userRepository.findById(connection.getReceiverId())
                .orElseThrow(() -> new RuntimeException("Receiver not found"));

        connection.setStatus(ConnectionStatus.REJECTED);

        Connection rejectedConnection = connectionRepository.save(connection);

        // Send rejection email to sender
        try {
            emailService.sendConnectionRejectedNotification(rejectedConnection, sender, receiver);
        } catch (Exception e) {
            log.error("Failed to send connection rejection email", e);
        }

        return convertToDTO(rejectedConnection);
    }

    @Transactional
    public void blockConnection(String connectionId) {
        Connection connection = connectionRepository.findById(connectionId)
                .orElseThrow(() -> new RuntimeException("Connection not found"));

        connection.setStatus(ConnectionStatus.BLOCKED);
        connectionRepository.save(connection);
    }

    @Transactional
    public void removeConnection(String connectionId) {
        Connection connection = connectionRepository.findById(connectionId)
                .orElseThrow(() -> new RuntimeException("Connection not found"));

        connectionRepository.delete(connection);
    }

    @Transactional(readOnly = true)
    public List<ConnectionDTO> getAcceptedConnections(String userId) {
        // Get connections where user is sender
        List<Connection> asSender = connectionRepository.findBySenderIdAndStatus(userId, ConnectionStatus.ACCEPTED);
        // Get connections where user is receiver
        List<Connection> asReceiver = connectionRepository.findByReceiverIdAndStatus(userId, ConnectionStatus.ACCEPTED);

        return Stream.concat(asSender.stream(), asReceiver.stream())
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<ConnectionDTO> getPendingSentConnections(String userId) {
        return connectionRepository.findBySenderIdAndStatus(userId, ConnectionStatus.PENDING)
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<ConnectionDTO> getPendingReceivedConnections(String userId) {
        return connectionRepository.findByReceiverIdAndStatus(userId, ConnectionStatus.PENDING)
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<ConnectionDTO> getBlockedConnections(String userId) {
        // Get connections where user blocked someone (as receiver)
        List<Connection> blockedConnections = connectionRepository.findByReceiverIdAndStatus(userId, ConnectionStatus.BLOCKED);

        return blockedConnections.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public boolean areConnected(String userId1, String userId2) {
        var connection = connectionRepository.findConnectionBetweenUsers(userId1, userId2, ConnectionStatus.ACCEPTED);
        return connection.isPresent();
    }

    private ConnectionDTO convertToDTO(Connection connection) {
        ConnectionDTO dto = new ConnectionDTO();
        dto.setId(connection.getId());
        dto.setSenderId(connection.getSenderId());
        dto.setReceiverId(connection.getReceiverId());
        dto.setStatus(connection.getStatus());
        dto.setMessage(connection.getMessage());
        dto.setConnectedAt(connection.getConnectedAt());
        dto.setCreatedAt(connection.getCreatedAt());
        dto.setUpdatedAt(connection.getUpdatedAt());

        // Fetch user details
        try {
            User sender = userRepository.findById(connection.getSenderId()).orElse(null);
            if (sender != null) {
                dto.setSenderName(sender.getName());
                dto.setSenderEmail(sender.getEmail());
            }

            User receiver = userRepository.findById(connection.getReceiverId()).orElse(null);
            if (receiver != null) {
                dto.setReceiverName(receiver.getName());
                dto.setReceiverEmail(receiver.getEmail());
            }
        } catch (Exception e) {
            log.error("Failed to fetch user details for connection", e);
        }

        return dto;
    }
}
