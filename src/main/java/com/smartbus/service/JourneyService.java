package com.smartbus.service;

import com.smartbus.model.Bus;
import com.smartbus.model.Journey;
import com.smartbus.repository.BusRepository;
import com.smartbus.repository.JourneyRepository;
import com.smartbus.repository.RouteRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Service for journey operations.
 */
@Service
public class JourneyService {
    private final JourneyRepository journeyRepository;
    private final BusRepository busRepository;
    private final RouteRepository routeRepository;

    public JourneyService(JourneyRepository journeyRepository, BusRepository busRepository, RouteRepository routeRepository) {
        this.journeyRepository = journeyRepository;
        this.busRepository = busRepository;
        this.routeRepository = routeRepository;
    }

    public Journey startJourney(Long userId, Long busId, String source, String destination) {
        Bus bus = busRepository.findById(busId)
                .orElseThrow(() -> new RuntimeException("Bus not found"));
        
        Journey journey = new Journey();
        journey.setUserId(userId);
        journey.setBusId(busId);
        journey.setBusNumber(bus.getBusNumber());
        journey.setSource(source);
        journey.setDestination(destination);
        journey.setStartTime(LocalDateTime.now());
        journey.setStatus("ACTIVE");
        journey.setCurrentStopIndex(bus.getCurrentStopIndex());
        journey.setRouteId(bus.getRouteId());
        
        if (bus.getRouteId() != null) {
            routeRepository.findById(bus.getRouteId()).ifPresent(route -> {
                if (route.getStops() != null && !route.getStops().isEmpty()) {
                    int destIndex = route.getStops().size() - 1;
                    for (int i = 0; i < route.getStops().size(); i++) {
                        String name = route.getStops().get(i).getStopName();
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

    public Journey getJourney(Long journeyId) {
        return journeyRepository.findById(journeyId).orElse(null);
    }

    public Journey getActiveJourney(Long userId) {
        return journeyRepository.findByUserIdAndStatus(userId, "ACTIVE").stream().findFirst().orElse(null);
    }

    public Journey advanceJourney(Long journeyId) {
        Journey journey = journeyRepository.findById(journeyId)
                .orElseThrow(() -> new RuntimeException("Journey not found"));
        journey.setCurrentStopIndex(journey.getCurrentStopIndex() + 1);
        return journeyRepository.save(journey);
    }

    public Journey completeJourney(Long journeyId) {
        Journey journey = journeyRepository.findById(journeyId)
                .orElseThrow(() -> new RuntimeException("Journey not found"));
        journey.setStatus("COMPLETED");
        journey.setEndTime(LocalDateTime.now());
        return journeyRepository.save(journey);
    }

    public Journey reportMissedStop(Long journeyId) {
        Journey journey = journeyRepository.findById(journeyId)
                .orElseThrow(() -> new RuntimeException("Journey not found"));
        journey.setStatus("MISSED_STOP");
        return journeyRepository.save(journey);
    }

    public List<Journey> getJourneyHistory(Long userId) {
        return journeyRepository.findByUserId(userId);
    }
}
