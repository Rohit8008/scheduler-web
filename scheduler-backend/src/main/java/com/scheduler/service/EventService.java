package com.scheduler.service;

import com.scheduler.dto.EventDTO;
import com.scheduler.model.Event;
import com.scheduler.model.User;
import com.scheduler.repository.EventRepository;
import com.scheduler.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class EventService {

    private final EventRepository eventRepository;
    private final UserRepository userRepository;
    private final GoogleCalendarService googleCalendarService;

    @Transactional(readOnly = true)
    public List<EventDTO> getAllEvents() {
        return eventRepository.findAll().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public EventDTO getEventById(String id) {
        Event event = eventRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Event not found with id: " + id));
        return convertToDTO(event);
    }

    @Transactional(readOnly = true)
    public List<EventDTO> getEventsByUserId(String userId) {
        return eventRepository.findByUserId(userId).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<EventDTO> getPublicEventsByUserId(String userId) {
        return eventRepository.findByUserIdAndIsPrivate(userId, false).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public EventDTO createEvent(EventDTO eventDTO) {
        User user = userRepository.findById(eventDTO.getUserId())
                .orElseThrow(() -> new RuntimeException("User not found with id: " + eventDTO.getUserId()));

        Event event = convertToEntity(eventDTO);

        // Generate permanent Meet link for this event
        String meetLink = generatePermanentMeetLink(user, event);
        event.setMeetLink(meetLink);

        Event savedEvent = eventRepository.save(event);
        log.info("Created event with permanent Meet link: {}", meetLink);
        return convertToDTO(savedEvent);
    }

    @Transactional
    public EventDTO updateEvent(String id, EventDTO eventDTO) {
        Event existingEvent = eventRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Event not found with id: " + id));

        existingEvent.setTitle(eventDTO.getTitle());
        existingEvent.setDescription(eventDTO.getDescription());
        existingEvent.setDuration(eventDTO.getDuration());
        existingEvent.setIsPrivate(eventDTO.getIsPrivate());

        Event updatedEvent = eventRepository.save(existingEvent);
        return convertToDTO(updatedEvent);
    }

    @Transactional
    public void deleteEvent(String id) {
        if (!eventRepository.existsById(id)) {
            throw new RuntimeException("Event not found with id: " + id);
        }
        eventRepository.deleteById(id);
    }

    private EventDTO convertToDTO(Event event) {
        EventDTO dto = new EventDTO();
        dto.setId(event.getId());
        dto.setTitle(event.getTitle());
        dto.setDescription(event.getDescription());
        dto.setDuration(event.getDuration());
        dto.setUserId(event.getUserId());
        dto.setIsPrivate(event.getIsPrivate());
        dto.setMeetLink(event.getMeetLink());
        dto.setCreatedAt(event.getCreatedAt());
        dto.setUpdatedAt(event.getUpdatedAt());
        return dto;
    }

    private Event convertToEntity(EventDTO dto) {
        Event event = new Event();
        event.setId(dto.getId());
        event.setTitle(dto.getTitle());
        event.setDescription(dto.getDescription());
        event.setDuration(dto.getDuration());
        event.setUserId(dto.getUserId());
        event.setIsPrivate(dto.getIsPrivate() != null ? dto.getIsPrivate() : true);
        return event;
    }

    /**
     * Generate a permanent Google Meet link for an event
     * This link will be reused for all bookings of this event
     */
    private String generatePermanentMeetLink(User user, Event event) {
        try {
            if (user.getGoogleAccessToken() != null && !user.getGoogleAccessToken().isEmpty()) {
                log.info("Creating permanent Google Calendar event for: {}", event.getTitle());

                // Create a calendar event far in the future for the permanent Meet link
                // We'll use a placeholder date since we just want the Meet link
                LocalDateTime startTime = LocalDateTime.now().plusYears(1);
                LocalDateTime endTime = startTime.plusMinutes(event.getDuration() != null ? event.getDuration() : 30);

                com.google.api.services.calendar.model.Event calendarEvent =
                        googleCalendarService.createCalendarEvent(
                                user.getGoogleAccessToken(),
                                event.getTitle() + " (Permanent Meet Link)",
                                event.getDescription() != null ? event.getDescription() : "",
                                "",
                                startTime,
                                endTime
                        );

                if (calendarEvent.getConferenceData() != null &&
                        calendarEvent.getConferenceData().getEntryPoints() != null &&
                        !calendarEvent.getConferenceData().getEntryPoints().isEmpty()) {
                    String meetLink = calendarEvent.getConferenceData().getEntryPoints().get(0).getUri();
                    log.info("Successfully created permanent Meet link: {}", meetLink);
                    return meetLink;
                }
            } else {
                log.warn("User {} doesn't have Google access token", user.getId());
            }
        } catch (Exception e) {
            log.error("Failed to create permanent Google Calendar event: {}", e.getMessage(), e);
        }

        // Fallback to new meeting link
        log.info("Using Google Meet 'new' link as fallback for event: {}", event.getTitle());
        return "https://meet.google.com/new";
    }
}
