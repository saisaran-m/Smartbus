package com.smartbus.controller;

import com.smartbus.dto.GuardianStatus;
import com.smartbus.dto.RecoveryOption;
import com.smartbus.model.Journey;
import com.smartbus.model.User;
import com.smartbus.service.JourneyService;
import com.smartbus.service.StopGuardianService;
import com.smartbus.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/journey")
public class JourneyController {

    private final JourneyService journeyService;
    private final StopGuardianService stopGuardianService;
    private final UserService userService;

    public JourneyController(JourneyService journeyService, StopGuardianService stopGuardianService, UserService userService) {
        this.journeyService = journeyService;
        this.stopGuardianService = stopGuardianService;
        this.userService = userService;
    }

    private Long getCurrentUserId() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated() || "anonymousUser".equals(auth.getName())) {
            return 1L; // Fallback or handle differently
        }
        String username = auth.getName();
        return userService.findByUsername(username).map(User::getId).orElse(1L);
    }

    @PostMapping("/start")
    public ResponseEntity<Journey> startJourney(@RequestBody Map<String, Object> request) {
        Long busId = Long.valueOf(request.get("busId").toString());
        String source = request.get("source").toString();
        String destination = request.get("destination").toString();
        Long userId = getCurrentUserId();
        return ResponseEntity.ok(journeyService.startJourney(userId, busId, source, destination));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Journey> getJourney(@PathVariable("id") Long id) {
        Journey journey = journeyService.getJourney(id);
        return journey != null ? ResponseEntity.ok(journey) : ResponseEntity.notFound().build();
    }

    @GetMapping("/active")
    public ResponseEntity<Journey> getActiveJourney() {
        Journey activeJourney = journeyService.getActiveJourney(getCurrentUserId());
        return activeJourney != null ? ResponseEntity.ok(activeJourney) : ResponseEntity.notFound().build();
    }

    @PostMapping("/{id}/advance")
    public ResponseEntity<Journey> advanceJourney(@PathVariable("id") Long id) {
        return ResponseEntity.ok(journeyService.advanceJourney(id));
    }

    @PostMapping("/{id}/complete")
    public ResponseEntity<Journey> completeJourney(@PathVariable("id") Long id) {
        return ResponseEntity.ok(journeyService.completeJourney(id));
    }

    @PostMapping("/{id}/guardian/enable")
    public ResponseEntity<Journey> enableGuardian(@PathVariable("id") Long id, @RequestBody Map<String, String> request) {
        String destination = request.get("destination");
        return ResponseEntity.ok(stopGuardianService.enableGuardian(id, destination));
    }

    @GetMapping("/{id}/guardian/status")
    public ResponseEntity<GuardianStatus> getGuardianStatus(@PathVariable("id") Long id) {
        return ResponseEntity.ok(stopGuardianService.getGuardianStatus(id));
    }

    @PostMapping("/{id}/missed-stop")
    public ResponseEntity<Journey> reportMissedStop(@PathVariable("id") Long id) {
        return ResponseEntity.ok(journeyService.reportMissedStop(id));
    }

    @GetMapping("/{id}/recovery")
    public ResponseEntity<RecoveryOption> getRecoveryOptions(@PathVariable("id") Long id) {
        return ResponseEntity.ok(stopGuardianService.getRecoveryOptions(id));
    }

    @GetMapping("/history")
    public ResponseEntity<List<Journey>> getJourneyHistory() {
        return ResponseEntity.ok(journeyService.getJourneyHistory(getCurrentUserId()));
    }
}
