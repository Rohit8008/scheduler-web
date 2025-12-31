package com.scheduler.service;

import com.google.firebase.FirebaseApp;
import com.google.firebase.auth.FirebaseAuth;
import com.google.firebase.auth.FirebaseAuthException;
import com.google.firebase.auth.FirebaseToken;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Service
@Slf4j
public class FirebaseAuthService {

    public FirebaseToken verifyToken(String idToken) throws FirebaseAuthException {
        if (FirebaseApp.getApps().isEmpty()) {
            log.error("Firebase is not initialized. Cannot verify token.");
            throw new IllegalStateException("Firebase service is not available");
        }

        try {
            FirebaseToken decodedToken = FirebaseAuth.getInstance().verifyIdToken(idToken);
            log.info("Token verified for user: {}", decodedToken.getUid());
            return decodedToken;
        } catch (FirebaseAuthException e) {
            log.error("Error verifying Firebase token: {}", e.getMessage());
            throw e;
        }
    }

    public String getUserIdFromToken(String idToken) {
        try {
            FirebaseToken decodedToken = verifyToken(idToken);
            return decodedToken.getUid();
        } catch (FirebaseAuthException e) {
            log.error("Failed to get user ID from token: {}", e.getMessage());
            return null;
        }
    }

    public String getEmailFromToken(String idToken) {
        try {
            FirebaseToken decodedToken = verifyToken(idToken);
            return decodedToken.getEmail();
        } catch (FirebaseAuthException e) {
            log.error("Failed to get email from token: {}", e.getMessage());
            return null;
        }
    }
}
