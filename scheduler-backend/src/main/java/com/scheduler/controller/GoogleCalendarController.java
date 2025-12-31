package com.scheduler.controller;

import com.scheduler.service.GoogleCalendarService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/google-calendar")
@RequiredArgsConstructor
public class GoogleCalendarController {

    private final GoogleCalendarService googleCalendarService;

    @GetMapping("/auth-url")
    public ResponseEntity<Map<String, String>> getAuthorizationUrl() {
        try {
            String authUrl = googleCalendarService.getAuthorizationUrl();
            Map<String, String> response = new HashMap<>();
            response.put("authUrl", authUrl);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    @PostMapping("/exchange-token")
    public ResponseEntity<Map<String, String>> exchangeToken(@RequestBody Map<String, String> request) {
        try {
            String code = request.get("code");
            Map<String, String> tokens = googleCalendarService.exchangeCodeForTokens(code);
            return ResponseEntity.ok(tokens);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }
}
