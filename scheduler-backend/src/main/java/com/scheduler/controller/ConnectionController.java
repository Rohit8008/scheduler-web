package com.scheduler.controller;

import com.scheduler.dto.ConnectionDTO;
import com.scheduler.service.ConnectionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/connections")
@RequiredArgsConstructor
public class ConnectionController {

    private final ConnectionService connectionService;

    @PostMapping
    public ResponseEntity<ConnectionDTO> sendConnectionRequest(@RequestBody Map<String, String> body) {
        String senderId = body.get("senderId");
        String receiverId = body.get("receiverId");
        String message = body.getOrDefault("message", "");

        ConnectionDTO created = connectionService.sendConnectionRequest(senderId, receiverId, message);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @GetMapping("/accepted/{userId}")
    public ResponseEntity<List<ConnectionDTO>> getAcceptedConnections(@PathVariable String userId) {
        return ResponseEntity.ok(connectionService.getAcceptedConnections(userId));
    }

    @GetMapping("/pending-sent/{userId}")
    public ResponseEntity<List<ConnectionDTO>> getPendingSentConnections(@PathVariable String userId) {
        return ResponseEntity.ok(connectionService.getPendingSentConnections(userId));
    }

    @GetMapping("/pending-received/{userId}")
    public ResponseEntity<List<ConnectionDTO>> getPendingReceivedConnections(@PathVariable String userId) {
        return ResponseEntity.ok(connectionService.getPendingReceivedConnections(userId));
    }

    @GetMapping("/blocked/{userId}")
    public ResponseEntity<List<ConnectionDTO>> getBlockedConnections(@PathVariable String userId) {
        return ResponseEntity.ok(connectionService.getBlockedConnections(userId));
    }

    @PostMapping("/{connectionId}/accept")
    public ResponseEntity<ConnectionDTO> acceptConnection(@PathVariable String connectionId) {
        ConnectionDTO accepted = connectionService.acceptConnection(connectionId);
        return ResponseEntity.ok(accepted);
    }

    @PostMapping("/{connectionId}/reject")
    public ResponseEntity<ConnectionDTO> rejectConnection(@PathVariable String connectionId) {
        ConnectionDTO rejected = connectionService.rejectConnection(connectionId);
        return ResponseEntity.ok(rejected);
    }

    @PostMapping("/{connectionId}/block")
    public ResponseEntity<Void> blockConnection(@PathVariable String connectionId) {
        connectionService.blockConnection(connectionId);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{connectionId}")
    public ResponseEntity<Void> removeConnection(@PathVariable String connectionId) {
        connectionService.removeConnection(connectionId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/check/{userId1}/{userId2}")
    public ResponseEntity<Map<String, Boolean>> checkConnection(
            @PathVariable String userId1,
            @PathVariable String userId2) {
        boolean connected = connectionService.areConnected(userId1, userId2);
        return ResponseEntity.ok(Map.of("connected", connected));
    }
}
