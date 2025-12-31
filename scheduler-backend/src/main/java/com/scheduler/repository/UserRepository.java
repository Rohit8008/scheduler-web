package com.scheduler.repository;

import com.scheduler.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, String> {
    Optional<User> findByFirebaseUid(String firebaseUid);
    Optional<User> findByEmail(String email);
    Optional<User> findByUsername(String username);
    boolean existsByFirebaseUid(String firebaseUid);
    boolean existsByEmail(String email);
    boolean existsByUsername(String username);
}
