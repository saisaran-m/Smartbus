package com.smartbus.controller;

import com.smartbus.service.TrackingService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/tracking")
public class TrackingController {

    private final TrackingService trackingService;

    public TrackingController(TrackingService trackingService) {
        this.trackingService = trackingService;
    }

    @GetMapping("/{busId}")
    public ResponseEntity<Map<String, Object>> getTrackingData(@PathVariable("busId") Long busId) {
        return ResponseEntity.ok(trackingService.getTrackingData(busId));
    }

    @PostMapping("/{busId}/advance")
    public ResponseEntity<Map<String, Object>> advanceBus(@PathVariable("busId") Long busId) {
        return ResponseEntity.ok(trackingService.advanceBus(busId));
    }

    @GetMapping("/{busId}/coordinates")
    public ResponseEntity<List<double[]>> getRouteCoordinates(@PathVariable("busId") Long busId) {
        return ResponseEntity.ok(trackingService.getRouteCoordinates(busId));
    }
}
