package com.scheduler.controller;

import com.scheduler.dto.AvailabilityDTO;
import com.scheduler.service.AvailabilityService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/availability")
@RequiredArgsConstructor
public class AvailabilityController {

    private final AvailabilityService availabilityService;

    @GetMapping("/user/{userId}")
    public ResponseEntity<AvailabilityDTO> getAvailabilityByUserId(@PathVariable String userId) {
        return ResponseEntity.ok(availabilityService.getAvailabilityByUserId(userId));
    }

    @PostMapping
    public ResponseEntity<AvailabilityDTO> createAvailability(@RequestBody AvailabilityDTO availabilityDTO) {
        AvailabilityDTO createdAvailability = availabilityService.createAvailability(availabilityDTO);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdAvailability);
    }

    @PutMapping("/{id}")
    public ResponseEntity<AvailabilityDTO> updateAvailability(@PathVariable String id, @RequestBody AvailabilityDTO availabilityDTO) {
        return ResponseEntity.ok(availabilityService.updateAvailability(id, availabilityDTO));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteAvailability(@PathVariable String id) {
        availabilityService.deleteAvailability(id);
        return ResponseEntity.noContent().build();
    }
}
