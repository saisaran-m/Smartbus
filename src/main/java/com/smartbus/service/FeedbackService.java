package com.smartbus.service;

import com.smartbus.model.Bus;
import com.smartbus.model.Feedback;
import com.smartbus.model.SafetyReport;
import com.smartbus.repository.BusRepository;
import com.smartbus.repository.FeedbackRepository;
import com.smartbus.repository.SafetyReportRepository;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * Service for feedback and safety reports operations.
 */
@Service
public class FeedbackService {
    private final FeedbackRepository feedbackRepository;
    private final SafetyReportRepository safetyReportRepository;
    private final BusRepository busRepository;

    public FeedbackService(FeedbackRepository feedbackRepository, SafetyReportRepository safetyReportRepository, BusRepository busRepository) {
        this.feedbackRepository = feedbackRepository;
        this.safetyReportRepository = safetyReportRepository;
        this.busRepository = busRepository;
    }

    public Feedback submitFeedback(Feedback feedback) {
        Feedback saved = feedbackRepository.save(feedback);
        
        if (feedback.getBusId() != null) {
            busRepository.findById(feedback.getBusId()).ifPresent(bus -> {
                List<Feedback> allFeedback = feedbackRepository.findByBusId(bus.getId());
                if (!allFeedback.isEmpty()) {
                    double cleanliness = allFeedback.stream().mapToInt(Feedback::getCleanliness).filter(v -> v > 0).average().orElse(4.0);
                    double comfort = allFeedback.stream().mapToInt(Feedback::getComfort).filter(v -> v > 0).average().orElse(4.0);
                    double overall = allFeedback.stream().mapToInt(Feedback::getDrivingExperience).filter(v -> v > 0).average().orElse(4.0);
                    
                    bus.setCleanlinessRating(Math.round(cleanliness * 10.0) / 10.0);
                    bus.setComfortRating(Math.round(comfort * 10.0) / 10.0);
                    bus.setRating(Math.round(overall * 10.0) / 10.0);
                    busRepository.save(bus);
                }
            });
        }
        
        return saved;
    }

    public List<Feedback> getFeedbackForBus(Long busId) {
        return feedbackRepository.findByBusId(busId);
    }

    public Map<String, Double> getAggregatedRatings(Long busId) {
        List<Feedback> allFeedback = feedbackRepository.findByBusId(busId);
        Map<String, Double> ratings = new HashMap<>();
        
        ratings.put("cleanliness", allFeedback.stream().mapToInt(Feedback::getCleanliness).filter(v -> v > 0).average().orElse(4.0));
        ratings.put("comfort", allFeedback.stream().mapToInt(Feedback::getComfort).filter(v -> v > 0).average().orElse(4.0));
        ratings.put("crowding", allFeedback.stream().mapToInt(Feedback::getCrowding).filter(v -> v > 0).average().orElse(3.0));
        ratings.put("punctuality", allFeedback.stream().mapToInt(Feedback::getPunctuality).filter(v -> v > 0).average().orElse(4.0));
        ratings.put("staffBehaviour", allFeedback.stream().mapToInt(Feedback::getStaffBehaviour).filter(v -> v > 0).average().orElse(4.0));
        ratings.put("drivingExperience", allFeedback.stream().mapToInt(Feedback::getDrivingExperience).filter(v -> v > 0).average().orElse(4.0));
        
        double overall = ratings.values().stream().mapToDouble(Double::doubleValue).average().orElse(4.0);
        ratings.put("overall", Math.round(overall * 10.0) / 10.0);
        
        return ratings;
    }

    public SafetyReport submitSafetyReport(SafetyReport report) {
        return safetyReportRepository.save(report);
    }

    public Map<String, Object> getSafetyReportsForBus(Long busId) {
        List<SafetyReport> reports = safetyReportRepository.findByBusId(busId);
        Map<String, Object> response = new HashMap<>();
        response.put("reports", reports);
        
        boolean repeated = reports.stream()
            .collect(Collectors.groupingBy(SafetyReport::getReportType, Collectors.counting()))
            .values().stream()
            .anyMatch(count -> count > 3);
            
        response.put("repeatedReports", repeated);
        return response;
    }

    public Map<String, Long> getReportSummary(Long busId) {
        List<SafetyReport> reports = safetyReportRepository.findByBusId(busId);
        return reports.stream()
                .filter(r -> r.getReportType() != null)
                .collect(Collectors.groupingBy(SafetyReport::getReportType, Collectors.counting()));
    }
}
