package com.scheduler.repository;

import com.scheduler.model.MeetingRequest;
import com.scheduler.model.MeetingRequest.MeetingRequestStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MeetingRequestRepository extends JpaRepository<MeetingRequest, String> {
    List<MeetingRequest> findByRequesterId(String requesterId);
    List<MeetingRequest> findByReceiverId(String receiverId);
    List<MeetingRequest> findByReceiverIdAndStatus(String receiverId, MeetingRequestStatus status);
    List<MeetingRequest> findByRequesterIdAndStatus(String requesterId, MeetingRequestStatus status);
}
