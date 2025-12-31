package com.scheduler.service;

import com.scheduler.dto.AvailabilityDTO;
import com.scheduler.dto.DayAvailabilityDTO;
import com.scheduler.model.Availability;
import com.scheduler.model.DayAvailability;
import com.scheduler.repository.AvailabilityRepository;
import com.scheduler.repository.DayAvailabilityRepository;
import com.scheduler.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AvailabilityService {

    private final AvailabilityRepository availabilityRepository;
    private final DayAvailabilityRepository dayAvailabilityRepository;
    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public AvailabilityDTO getAvailabilityByUserId(String userId) {
        Availability availability = availabilityRepository.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("Availability not found for userId: " + userId));
        return convertToDTO(availability);
    }

    @Transactional
    public AvailabilityDTO createAvailability(AvailabilityDTO availabilityDTO) {
        if (!userRepository.existsById(availabilityDTO.getUserId())) {
            throw new RuntimeException("User not found with id: " + availabilityDTO.getUserId());
        }
        if (availabilityRepository.existsByUserId(availabilityDTO.getUserId())) {
            throw new RuntimeException("Availability already exists for userId: " + availabilityDTO.getUserId());
        }

        Availability availability = convertToEntity(availabilityDTO);
        Availability savedAvailability = availabilityRepository.save(availability);

        if (availabilityDTO.getDays() != null && !availabilityDTO.getDays().isEmpty()) {
            for (DayAvailabilityDTO dayDTO : availabilityDTO.getDays()) {
                DayAvailability dayAvailability = new DayAvailability();
                dayAvailability.setAvailabilityId(savedAvailability.getId());
                dayAvailability.setDay(dayDTO.getDay());
                dayAvailability.setStartTime(dayDTO.getStartTime());
                dayAvailability.setEndTime(dayDTO.getEndTime());
                dayAvailabilityRepository.save(dayAvailability);
            }
        }

        return getAvailabilityByUserId(availabilityDTO.getUserId());
    }

    @Transactional
    public AvailabilityDTO updateAvailability(String id, AvailabilityDTO availabilityDTO) {
        Availability existingAvailability = availabilityRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Availability not found with id: " + id));

        existingAvailability.setTimeGap(availabilityDTO.getTimeGap());
        availabilityRepository.save(existingAvailability);

        dayAvailabilityRepository.deleteAll(
            dayAvailabilityRepository.findByAvailabilityId(id)
        );

        if (availabilityDTO.getDays() != null && !availabilityDTO.getDays().isEmpty()) {
            for (DayAvailabilityDTO dayDTO : availabilityDTO.getDays()) {
                DayAvailability dayAvailability = new DayAvailability();
                dayAvailability.setAvailabilityId(id);
                dayAvailability.setDay(dayDTO.getDay());
                dayAvailability.setStartTime(dayDTO.getStartTime());
                dayAvailability.setEndTime(dayDTO.getEndTime());
                dayAvailabilityRepository.save(dayAvailability);
            }
        }

        return getAvailabilityByUserId(existingAvailability.getUserId());
    }

    @Transactional
    public void deleteAvailability(String id) {
        if (!availabilityRepository.existsById(id)) {
            throw new RuntimeException("Availability not found with id: " + id);
        }
        availabilityRepository.deleteById(id);
    }

    private AvailabilityDTO convertToDTO(Availability availability) {
        AvailabilityDTO dto = new AvailabilityDTO();
        dto.setId(availability.getId());
        dto.setUserId(availability.getUserId());
        dto.setTimeGap(availability.getTimeGap());
        dto.setCreatedAt(availability.getCreatedAt());
        dto.setUpdatedAt(availability.getUpdatedAt());

        List<DayAvailabilityDTO> dayDTOs = dayAvailabilityRepository
            .findByAvailabilityId(availability.getId())
            .stream()
            .map(this::convertDayToDTO)
            .collect(Collectors.toList());
        dto.setDays(dayDTOs);

        return dto;
    }

    private DayAvailabilityDTO convertDayToDTO(DayAvailability dayAvailability) {
        DayAvailabilityDTO dto = new DayAvailabilityDTO();
        dto.setId(dayAvailability.getId());
        dto.setAvailabilityId(dayAvailability.getAvailabilityId());
        dto.setDay(dayAvailability.getDay());
        dto.setStartTime(dayAvailability.getStartTime());
        dto.setEndTime(dayAvailability.getEndTime());
        return dto;
    }

    private Availability convertToEntity(AvailabilityDTO dto) {
        Availability availability = new Availability();
        availability.setId(dto.getId());
        availability.setUserId(dto.getUserId());
        availability.setTimeGap(dto.getTimeGap());
        return availability;
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> getUserAvailableTimeSlots(String userId, int duration) {
        // Return empty list if user hasn't configured availability yet
        Availability availability = availabilityRepository.findByUserId(userId)
                .orElse(null);

        if (availability == null) {
            return new ArrayList<>();
        }

        List<DayAvailability> days = dayAvailabilityRepository.findByAvailabilityId(availability.getId());

        List<Map<String, Object>> availableDates = new ArrayList<>();
        LocalDate startDate = LocalDate.now();
        LocalDate endDate = startDate.plusDays(30); // Next 30 days

        for (LocalDate date = startDate; !date.isAfter(endDate); date = date.plusDays(1)) {
            java.time.DayOfWeek javaDayOfWeek = date.getDayOfWeek();
            com.scheduler.model.DayOfWeek modelDayOfWeek;

            // Convert java.time.DayOfWeek to custom DayOfWeek enum
            switch (javaDayOfWeek) {
                case MONDAY: modelDayOfWeek = com.scheduler.model.DayOfWeek.MONDAY; break;
                case TUESDAY: modelDayOfWeek = com.scheduler.model.DayOfWeek.TUESDAY; break;
                case WEDNESDAY: modelDayOfWeek = com.scheduler.model.DayOfWeek.WEDNESDAY; break;
                case THURSDAY: modelDayOfWeek = com.scheduler.model.DayOfWeek.THURSDAY; break;
                case FRIDAY: modelDayOfWeek = com.scheduler.model.DayOfWeek.FRIDAY; break;
                case SATURDAY: modelDayOfWeek = com.scheduler.model.DayOfWeek.SATURDAY; break;
                case SUNDAY: modelDayOfWeek = com.scheduler.model.DayOfWeek.SUNDAY; break;
                default: continue;
            }

            Optional<DayAvailability> dayAvailability = days.stream()
                .filter(d -> d.getDay() == modelDayOfWeek)
                .findFirst();

            if (dayAvailability.isPresent()) {
                DayAvailability day = dayAvailability.get();
                List<Map<String, String>> slots = generateTimeSlots(
                    day.getStartTime(),
                    day.getEndTime(),
                    duration,
                    availability.getTimeGap()
                );

                if (!slots.isEmpty()) {
                    Map<String, Object> dateSlots = new HashMap<>();
                    dateSlots.put("date", date.toString());
                    dateSlots.put("slots", slots);
                    availableDates.add(dateSlots);
                }
            }
        }

        return availableDates;
    }

    private List<Map<String, String>> generateTimeSlots(LocalDateTime startTime, LocalDateTime endTime, int duration, int timeGap) {
        List<Map<String, String>> slots = new ArrayList<>();
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("HH:mm");

        LocalTime start = startTime.toLocalTime();
        LocalTime end = endTime.toLocalTime();
        LocalTime current = start;

        while (current.plusMinutes(duration).isBefore(end) || current.plusMinutes(duration).equals(end)) {
            Map<String, String> slot = new HashMap<>();
            slot.put("time", current.format(formatter));
            slots.add(slot);
            current = current.plusMinutes(duration + timeGap);
        }

        return slots;
    }
}
