package com.scheduler.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserDTO {
    private String id;
    private String firebaseUid;
    private String email;
    private String username;
    private String name;
    private String imageUrl;
    private String phoneNumber;
    private String googleAccessToken;
    private String googleRefreshToken;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
