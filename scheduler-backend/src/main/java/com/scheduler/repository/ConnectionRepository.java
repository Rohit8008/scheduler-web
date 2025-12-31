package com.scheduler.repository;

import com.scheduler.model.Connection;
import com.scheduler.model.Connection.ConnectionStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ConnectionRepository extends JpaRepository<Connection, String> {
    List<Connection> findBySenderId(String senderId);
    List<Connection> findByReceiverId(String receiverId);
    List<Connection> findBySenderIdAndStatus(String senderId, ConnectionStatus status);
    List<Connection> findByReceiverIdAndStatus(String receiverId, ConnectionStatus status);
    Optional<Connection> findBySenderIdAndReceiverId(String senderId, String receiverId);

    // Check if connection exists in either direction with specific status
    @Query("SELECT c FROM Connection c WHERE " +
           "((c.senderId = :userId1 AND c.receiverId = :userId2) OR " +
           "(c.senderId = :userId2 AND c.receiverId = :userId1)) AND " +
           "c.status = :status")
    Optional<Connection> findConnectionBetweenUsers(
        @Param("userId1") String userId1,
        @Param("userId2") String userId2,
        @Param("status") ConnectionStatus status
    );
}
