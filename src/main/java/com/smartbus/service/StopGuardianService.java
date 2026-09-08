package com.smartbus.service;

import com.smartbus.dto.GuardianStatus;
import com.smartbus.dto.RecoveryOption;
import com.smartbus.model.BusStop;
import com.smartbus.model.Journey;
import com.smartbus.model.Notification;
import com.smartbus.model.Route;
import com.smartbus.repository.JourneyRepository;
import com.smartbus.repository.NotificationRepository;
import com.smartbus.repository.RouteRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class StopGuardianService {
    private final JourneyRepository journeyRepository;
    private final RouteRepository routeRepository;
    private final NotificationRepository notificationRepository;

    public StopGuardianService(JourneyRepository journeyRepository, RouteRepository routeRepository,
                               NotificationRepository notificationRepository) {
        this.journeyRepository = journeyRepository;
        this.routeRepository = routeRepository;
        this.notificationRepository = notificationRepository;
    }

    public GuardianStatus getGuardianStatus(Long journeyId) {
        Journey journey = journeyRepository.findById(journeyId)
                .orElseThrow(() -> new RuntimeException("Journey not found"));

        GuardianStatus status = new GuardianStatus();
        status.setJourneyId(journeyId);
        status.setDestination(journey.getDestination());

        if (journey.getRouteId() == null || !journey.isGuardianEnabled()) {
            status.setAlertLevel("NONE");
            return status;
        }

        Route route = routeRepository.findById(journey.getRouteId()).orElse(null);
        if (route == null) {
            status.setAlertLevel("NONE");
            return status;
        }

        List<BusStop> stops = route.getStops();
        if (stops == null || stops.isEmpty()) {
            status.setAlertLevel("NONE");
            return status;
        }

        int currentIdx = journey.getCurrentStopIndex();
        int destIdx = journey.getDestinationStopIndex();

        // Bounds checking
        if (currentIdx < 0) currentIdx = 0;
        if (destIdx <= 0) destIdx = stops.size() - 1;
        if (currentIdx >= stops.size()) currentIdx = stops.size() - 1;
        if (destIdx >= stops.size()) destIdx = stops.size() - 1;

        int stopsRemaining = destIdx - currentIdx;
        status.setStopsRemaining(stopsRemaining);

        BusStop currentStop = stops.get(currentIdx);
        BusStop destStop = stops.get(destIdx);
        status.setCurrentStop(currentStop.getStopName());

        int estimatedMinutes = destStop.getEstimatedTimeFromSourceMinutes() - currentStop.getEstimatedTimeFromSourceMinutes();
        status.setEstimatedMinutes(Math.max(estimatedMinutes, 0));

        // Determine alert level
        String alertLevel;
        if (currentIdx > destIdx) {
            alertLevel = "MISSED";
            status.setMissedStop(true);
            status.setMessage("You appear to have passed " + journey.getDestination());
        } else if (estimatedMinutes <= 2) {
            alertLevel = "APPROACHING_1";
            status.setMessage("YOUR STOP IS APPROACHING! " + journey.getDestination() + " is the next stop.");
        } else if (estimatedMinutes <= 5) {
            alertLevel = "APPROACHING_5";
            status.setMessage(journey.getDestination() + " is " + estimatedMinutes + " minutes away. Please prepare to get down.");
        } else if (estimatedMinutes <= 10) {
            alertLevel = "APPROACHING_10";
            status.setMessage("Your destination " + journey.getDestination() + " is approaching.");
        } else {
            alertLevel = "NONE";
            status.setMessage("Journey in progress. " + stopsRemaining + " stops to " + journey.getDestination());
        }

        status.setAlertLevel(alertLevel);

        // Save alert level change and create notification
        if (!alertLevel.equals(journey.getGuardianAlertLevel())) {
            journey.setGuardianAlertLevel(alertLevel);
            journeyRepository.save(journey);

            if (!"NONE".equals(alertLevel)) {
                Notification notif = new Notification();
                notif.setJourneyId(journeyId);
                notif.setUserId(journey.getUserId());
                notif.setMessage(status.getMessage());
                notif.setType(alertLevel.startsWith("APPROACHING") ? "APPROACHING" : alertLevel);
                notificationRepository.save(notif);
            }
        }

        return status;
    }

    public RecoveryOption getRecoveryOptions(Long journeyId) {
        Journey journey = journeyRepository.findById(journeyId)
                .orElseThrow(() -> new RuntimeException("Journey not found"));

        RecoveryOption option = new RecoveryOption();
        option.setNextBusNumber("TN01-RET-" + (1000 + (int)(Math.random() * 9000)));
        option.setNextBusArrivalMinutes(10 + (int)(Math.random() * 20));
        option.setNearestBusStop(journey.getDestination() + " Bus Stand");
        option.setDistanceFromDestinationKm(Math.round(Math.random() * 100.0) / 10.0);
        option.setMessage("Don't worry! We'll help you get back to " + journey.getDestination() + ". The next bus back is arriving shortly.");
        return option;
    }

    public Journey enableGuardian(Long journeyId, String destination) {
        Journey journey = journeyRepository.findById(journeyId)
                .orElseThrow(() -> new RuntimeException("Journey not found"));
        journey.setGuardianEnabled(true);
        journey.setGuardianAlertLevel("NONE");

        if (journey.getRouteId() != null) {
            routeRepository.findById(journey.getRouteId()).ifPresent(route -> {
                List<BusStop> stops = route.getStops();
                if (stops != null && !stops.isEmpty()) {
                    int destIndex = stops.size() - 1;
                    for (int i = 0; i < stops.size(); i++) {
                        String name = stops.get(i).getStopName();
                        if (name != null && (name.equalsIgnoreCase(destination) ||
                            destination.toLowerCase().contains(name.toLowerCase()) ||
                            name.toLowerCase().contains(destination.toLowerCase()))) {
                            destIndex = i;
                            break;
                        }
                    }
                    journey.setDestinationStopIndex(destIndex);
                }
            });
        }
        return journeyRepository.save(journey);
    }
}
