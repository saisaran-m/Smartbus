package com.smartbus.controller;

import com.smartbus.model.Bus;
import com.smartbus.repository.BusRepository;
import com.smartbus.service.TrackingService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/driver")
public class DriverController {

    private final TrackingService trackingService;
    private final BusRepository busRepository;

    public DriverController(TrackingService trackingService, BusRepository busRepository) {
        this.trackingService = trackingService;
        this.busRepository = busRepository;
    }

    @PostMapping("/broadcast")
    public ResponseEntity<?> broadcastLocation(@RequestBody Map<String, Object> payload) {
        try {
            Long busId = Long.valueOf(payload.get("busId").toString());
            double lat = Double.parseDouble(payload.get("lat").toString());
            double lng = Double.parseDouble(payload.get("lng").toString());
            double speed = payload.get("speed") != null ? Double.parseDouble(payload.get("speed").toString()) : 0.0;
            String nextStop = payload.get("nextStop") != null ? payload.get("nextStop").toString() : "";

            trackingService.updateDriverPosition(busId, lat, lng, speed, nextStop);

            return ResponseEntity.ok(Map.of("success", true, "message", "GPS position updated"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/occupancy")
    public ResponseEntity<?> updateOccupancy(@RequestBody Map<String, Object> payload) {
        try {
            Long busId = Long.valueOf(payload.get("busId").toString());
            String crowdLevel = (String) payload.get("crowdLevel");

            Bus bus = busRepository.findById(busId)
                    .orElseThrow(() -> new RuntimeException("Bus not found"));
            bus.setCrowdLevel(crowdLevel);
            busRepository.save(bus);

            return ResponseEntity.ok(Map.of("success", true, "message", "Occupancy updated"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/active")
    public ResponseEntity<?> getActiveBuses() {
        try {
            return ResponseEntity.ok(trackingService.getActiveDriverPositions());
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}
