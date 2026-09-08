package com.smartbus.controller;

import com.smartbus.model.Feedback;
import com.smartbus.model.SafetyReport;
import com.smartbus.service.FeedbackService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
public class FeedbackController {

    private final FeedbackService feedbackService;

    public FeedbackController(FeedbackService feedbackService) {
        this.feedbackService = feedbackService;
    }

    @PostMapping("/api/feedback")
    public ResponseEntity<Feedback> submitFeedback(@RequestBody Feedback feedback) {
        return ResponseEntity.ok(feedbackService.submitFeedback(feedback));
    }

    @GetMapping("/api/feedback/bus/{busId}")
    public ResponseEntity<List<Feedback>> getFeedbackForBus(@PathVariable("busId") Long busId) {
        return ResponseEntity.ok(feedbackService.getFeedbackForBus(busId));
    }

    @GetMapping("/api/feedback/bus/{busId}/ratings")
    public ResponseEntity<Map<String, Double>> getAggregatedRatings(@PathVariable("busId") Long busId) {
        return ResponseEntity.ok(feedbackService.getAggregatedRatings(busId));
    }

    @PostMapping({"/api/safety-report", "/api/feedback/safety-report"})
    public ResponseEntity<SafetyReport> submitSafetyReport(@RequestBody SafetyReport report) {
        return ResponseEntity.ok(feedbackService.submitSafetyReport(report));
    }

    @GetMapping({"/api/safety-report/bus/{busId}", "/api/feedback/safety-report/bus/{busId}"})
    public ResponseEntity<Map<String, Object>> getSafetyReportsForBus(@PathVariable("busId") Long busId) {
        return ResponseEntity.ok(feedbackService.getSafetyReportsForBus(busId));
    }

    @GetMapping({"/api/safety-report/bus/{busId}/summary", "/api/feedback/safety-report/bus/{busId}/summary"})
    public ResponseEntity<Map<String, Long>> getReportSummary(@PathVariable("busId") Long busId) {
        return ResponseEntity.ok(feedbackService.getReportSummary(busId));
    }
}
