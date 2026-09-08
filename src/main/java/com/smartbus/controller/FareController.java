package com.smartbus.controller;

import com.smartbus.service.FareCalculationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/fare")
public class FareController {

    @Autowired
    private FareCalculationService fareCalculationService;

    @GetMapping("/calculate")
    public ResponseEntity<Map<String, Object>> calculate(
            @RequestParam String from,
            @RequestParam String to,
            @RequestParam(defaultValue = "Express") String type,
            @RequestParam(defaultValue = "false") boolean senior) {
        Map<String, Object> fare = fareCalculationService.calculateFare(from, to, type, senior);
        return ResponseEntity.ok(fare);
    }
}
