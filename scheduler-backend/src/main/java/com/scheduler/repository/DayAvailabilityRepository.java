package com.scheduler.repository;

import com.scheduler.model.DayAvailability;
import com.scheduler.model.DayOfWeek;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DayAvailabilityRepository extends JpaRepository<DayAvailability, String> {
    List<DayAvailability> findByAvailabilityId(String availabilityId);
    List<DayAvailability> findByAvailabilityIdAndDay(String availabilityId, DayOfWeek day);
}
