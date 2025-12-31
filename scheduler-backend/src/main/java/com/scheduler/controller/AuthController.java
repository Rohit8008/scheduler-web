package com.scheduler.controller;

import com.google.firebase.auth.FirebaseToken;
import com.scheduler.dto.UserDTO;
import com.scheduler.service.FirebaseAuthService;
import com.scheduler.service.UserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@Slf4j
public class AuthController {

    private final FirebaseAuthService firebaseAuthService;
    private final UserService userService;

    @PostMapping("/verify")
    public ResponseEntity<Map<String, Object>> verifyToken(@RequestBody Map<String, String> request) {
        try {
            String idToken = request.get("idToken");
            FirebaseToken decodedToken = firebaseAuthService.verifyToken(idToken);

            Map<String, Object> response = new HashMap<>();
            response.put("uid", decodedToken.getUid());
            response.put("email", decodedToken.getEmail());
            response.put("verified", true);

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Token verification failed: {}", e.getMessage());
            Map<String, Object> error = new HashMap<>();
            error.put("verified", false);
            error.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(error);
        }
    }

    @PostMapping("/register")
    public ResponseEntity<UserDTO> registerUser(@RequestBody UserDTO userDTO,
                                                @RequestHeader("Authorization") String authHeader) {
        try {
            String token = authHeader.substring(7);
            FirebaseToken decodedToken = firebaseAuthService.verifyToken(token);

            // Set Firebase UID from token
            userDTO.setFirebaseUid(decodedToken.getUid());

            // Set email from token if not provided
            if (userDTO.getEmail() == null || userDTO.getEmail().isEmpty()) {
                userDTO.setEmail(decodedToken.getEmail());
            }

            UserDTO createdUser = userService.createUser(userDTO);
            return ResponseEntity.status(HttpStatus.CREATED).body(createdUser);
        } catch (Exception e) {
            log.error("User registration failed: {}", e.getMessage());
            throw new RuntimeException("Registration failed: " + e.getMessage());
        }
    }

    @GetMapping("/me")
    public ResponseEntity<UserDTO> getCurrentUser(@RequestHeader("Authorization") String authHeader) {
        try {
            String token = authHeader.substring(7);
            String firebaseUid = firebaseAuthService.getUserIdFromToken(token);

            UserDTO user = userService.getUserByFirebaseUid(firebaseUid);
            return ResponseEntity.ok(user);
        } catch (Exception e) {
            log.error("Failed to get current user: {}", e.getMessage());
            throw new RuntimeException("Failed to get user: " + e.getMessage());
        }
    }
}
