package com.scheduler.repository;

import com.scheduler.model.Booking;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface BookingRepository extends JpaRepository<Booking, String> {
    List<Booking> findByUserId(String userId);
    List<Booking> findByEventId(String eventId);
    Optional<Booking> findByGoogleEventId(String googleEventId);

    @Query("SELECT b FROM Booking b " +
           "LEFT JOIN FETCH b.event e " +
           "LEFT JOIN FETCH e.user " +
           "LEFT JOIN FETCH b.user " +
           "WHERE b.id = :id")
    Optional<Booking> findByIdWithRelations(@Param("id") String id);

    @Query("SELECT b FROM Booking b WHERE b.eventId = :eventId " +
           "AND ((b.startTime <= :endTime AND b.endTime >= :startTime))")
    List<Booking> findConflictingBookings(
        @Param("eventId") String eventId,
        @Param("startTime") LocalDateTime startTime,
        @Param("endTime") LocalDateTime endTime
    );

    @Query("SELECT b FROM Booking b WHERE b.userId = :userId " +
           "AND b.startTime >= :startDate AND b.endTime <= :endDate " +
           "ORDER BY b.startTime")
    List<Booking> findByUserIdAndDateRange(
        @Param("userId") String userId,
        @Param("startDate") LocalDateTime startDate,
        @Param("endDate") LocalDateTime endDate
    );
}
