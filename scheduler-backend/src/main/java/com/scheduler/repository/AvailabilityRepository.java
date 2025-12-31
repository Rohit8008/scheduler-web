package com.scheduler.repository;

import com.scheduler.model.Availability;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface AvailabilityRepository extends JpaRepository<Availability, String> {
    Optional<Availability> findByUserId(String userId);
    boolean existsByUserId(String userId);
}
