package com.scheduler.service;

import com.scheduler.dto.BookingDTO;
import com.scheduler.model.Booking;
import com.scheduler.repository.BookingRepository;
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
public class BookingService {

    private final BookingRepository bookingRepository;
    private final EventRepository eventRepository;
    private final UserRepository userRepository;
    private final EmailService emailService;

    @Transactional(readOnly = true)
    public List<BookingDTO> getAllBookings() {
        return bookingRepository.findAll().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public BookingDTO getBookingById(String id) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Booking not found with id: " + id));
        return convertToDTO(booking);
    }

    @Transactional(readOnly = true)
    public List<BookingDTO> getBookingsByUserId(String userId) {
        return bookingRepository.findByUserId(userId).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<BookingDTO> getBookingsByEventId(String eventId) {
        return bookingRepository.findByEventId(eventId).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<BookingDTO> getBookingsByUserAndDateRange(String userId, LocalDateTime startDate, LocalDateTime endDate) {
        return bookingRepository.findByUserIdAndDateRange(userId, startDate, endDate).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public BookingDTO createBooking(BookingDTO bookingDTO) {
        // Fetch event
        com.scheduler.model.Event event = eventRepository.findById(bookingDTO.getEventId())
                .orElseThrow(() -> new RuntimeException("Event not found with id: " + bookingDTO.getEventId()));

        if (!userRepository.existsById(bookingDTO.getUserId())) {
            throw new RuntimeException("User not found with id: " + bookingDTO.getUserId());
        }

        List<Booking> conflicts = bookingRepository.findConflictingBookings(
            bookingDTO.getEventId(),
            bookingDTO.getStartTime(),
            bookingDTO.getEndTime()
        );

        if (!conflicts.isEmpty()) {
            throw new RuntimeException("Booking conflicts with existing bookings");
        }

        Booking booking = convertToEntity(bookingDTO);

        // Use the event's permanent Meet link for this booking
        // All bookings for the same event will share this link
        String meetLink = event.getMeetLink();
        if (meetLink == null || meetLink.isEmpty()) {
            log.warn("Event {} doesn't have a Meet link, using fallback", event.getId());
            meetLink = "https://meet.google.com/new";
        }

        booking.setMeetLink(meetLink);
        log.info("Booking created with event's permanent Meet link: {}", meetLink);

        Booking savedBooking = bookingRepository.save(booking);

        // Send emails asynchronously - won't block response
        try {
            emailService.sendBookingEmails(savedBooking);
        } catch (Exception e) {
            log.error("Failed to trigger email sending for booking: {}. Error: {}",
                    savedBooking.getId(), e.getMessage(), e);
            // Continue - don't fail booking creation due to email issues
        }

        return convertToDTO(savedBooking);
    }

    @Transactional
    public BookingDTO updateBooking(String id, BookingDTO bookingDTO) {
        Booking existingBooking = bookingRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Booking not found with id: " + id));

        existingBooking.setName(bookingDTO.getName());
        existingBooking.setEmail(bookingDTO.getEmail());
        existingBooking.setAdditionalInfo(bookingDTO.getAdditionalInfo());
        existingBooking.setStartTime(bookingDTO.getStartTime());
        existingBooking.setEndTime(bookingDTO.getEndTime());
        existingBooking.setMeetLink(bookingDTO.getMeetLink());

        Booking updatedBooking = bookingRepository.save(existingBooking);
        return convertToDTO(updatedBooking);
    }

    @Transactional
    public void deleteBooking(String id) {
        if (!bookingRepository.existsById(id)) {
            throw new RuntimeException("Booking not found with id: " + id);
        }
        bookingRepository.deleteById(id);
    }

    private BookingDTO convertToDTO(Booking booking) {
        BookingDTO dto = new BookingDTO();
        dto.setId(booking.getId());
        dto.setEventId(booking.getEventId());
        dto.setUserId(booking.getUserId());
        dto.setName(booking.getName());
        dto.setEmail(booking.getEmail());
        dto.setAdditionalInfo(booking.getAdditionalInfo());
        dto.setStartTime(booking.getStartTime());
        dto.setEndTime(booking.getEndTime());
        dto.setMeetLink(booking.getMeetLink());
        dto.setGoogleEventId(booking.getGoogleEventId());
        dto.setCreatedAt(booking.getCreatedAt());
        dto.setUpdatedAt(booking.getUpdatedAt());
        return dto;
    }

    private Booking convertToEntity(BookingDTO dto) {
        Booking booking = new Booking();
        booking.setId(dto.getId());
        booking.setEventId(dto.getEventId());
        booking.setUserId(dto.getUserId());
        booking.setName(dto.getName());
        booking.setEmail(dto.getEmail());
        booking.setAdditionalInfo(dto.getAdditionalInfo());
        booking.setStartTime(dto.getStartTime());
        booking.setEndTime(dto.getEndTime());
        booking.setMeetLink(dto.getMeetLink());
        booking.setGoogleEventId(dto.getGoogleEventId());
        return booking;
    }
}
