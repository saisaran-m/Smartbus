package com.smartbus.service;

import com.smartbus.model.Bus;
import com.smartbus.model.BusStop;
import com.smartbus.model.Route;
import com.smartbus.repository.BusRepository;
import com.smartbus.repository.RouteRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class TrackingService {
    private final BusRepository busRepository;
    private final RouteRepository routeRepository;

    public TrackingService(BusRepository busRepository, RouteRepository routeRepository) {
        this.busRepository = busRepository;
        this.routeRepository = routeRepository;
    }

    public Map<String, Object> getTrackingData(Long busId) {
        Bus bus = busRepository.findById(busId)
                .orElseThrow(() -> new RuntimeException("Bus not found"));
        Map<String, Object> data = new LinkedHashMap<>();
        data.put("busId", bus.getId());
        data.put("busNumber", bus.getBusNumber());
        data.put("lastUpdated", LocalDateTime.now().toString());

        if (bus.getRouteId() != null) {
            routeRepository.findById(bus.getRouteId()).ifPresent(route -> {
                List<BusStop> stops = route.getStops();
                int currentIndex = bus.getCurrentStopIndex();

                if (stops != null && !stops.isEmpty()) {
                    if (currentIndex >= 0 && currentIndex < stops.size()) {
                        BusStop currentStop = stops.get(currentIndex);
                        data.put("currentStop", currentStop.getStopName());
                        data.put("currentLat", currentStop.getLatitude());
                        data.put("currentLng", currentStop.getLongitude());
                    }

                    if (currentIndex + 1 < stops.size()) {
                        BusStop nextStop = stops.get(currentIndex + 1);
                        data.put("nextStop", nextStop.getStopName());
                        int eta = nextStop.getEstimatedTimeFromSourceMinutes() -
                            stops.get(currentIndex).getEstimatedTimeFromSourceMinutes();
                        data.put("estimatedArrivalMinutes", Math.max(eta, 1));
                    } else {
                        data.put("nextStop", "Final Stop");
                        data.put("estimatedArrivalMinutes", 0);
                    }

                    double progress = stops.size() > 1 ? ((double) currentIndex / (stops.size() - 1)) * 100.0 : 0;
                    data.put("routeProgress", Math.round(progress * 10.0) / 10.0);

                    List<Map<String, Object>> stopsData = new ArrayList<>();
                    for (int i = 0; i < stops.size(); i++) {
                        BusStop stop = stops.get(i);
                        Map<String, Object> stopMap = new LinkedHashMap<>();
                        stopMap.put("name", stop.getStopName());
                        stopMap.put("lat", stop.getLatitude());
                        stopMap.put("lng", stop.getLongitude());
                        stopMap.put("visited", i <= currentIndex);
                        stopsData.add(stopMap);
                    }
                    data.put("stops", stopsData);
                }
            });
        }
        return data;
    }

    public Map<String, Object> advanceBus(Long busId) {
        Bus bus = busRepository.findById(busId)
                .orElseThrow(() -> new RuntimeException("Bus not found"));

        if (bus.getRouteId() != null) {
            routeRepository.findById(bus.getRouteId()).ifPresent(route -> {
                if (route.getStops() != null && !route.getStops().isEmpty()) {
                    int nextIndex = bus.getCurrentStopIndex() + 1;
                    if (nextIndex >= route.getStops().size()) {
                        nextIndex = 0;
                    }
                    bus.setCurrentStopIndex(nextIndex);
                    busRepository.save(bus);
                }
            });
        }
        return getTrackingData(busId);
    }

    public List<double[]> getRouteCoordinates(Long busId) {
        Bus bus = busRepository.findById(busId)
                .orElseThrow(() -> new RuntimeException("Bus not found"));
        if (bus.getRouteId() != null) {
            Optional<Route> optRoute = routeRepository.findById(bus.getRouteId());
            if (optRoute.isPresent() && optRoute.get().getStops() != null) {
                return optRoute.get().getStops().stream()
                        .map(stop -> new double[]{stop.getLatitude(), stop.getLongitude()})
                        .collect(Collectors.toList());
            }
        }
        return List.of();
    }
}
