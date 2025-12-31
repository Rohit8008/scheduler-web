package com.scheduler.repository;

import com.scheduler.model.Event;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface EventRepository extends JpaRepository<Event, String> {
    List<Event> findByUserId(String userId);
    List<Event> findByUserIdAndIsPrivate(String userId, Boolean isPrivate);
}
