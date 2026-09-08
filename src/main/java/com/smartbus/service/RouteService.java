package com.smartbus.service;

import com.smartbus.model.BusStop;
import com.smartbus.model.Route;
import com.smartbus.repository.BusStopRepository;
import com.smartbus.repository.RouteRepository;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Service for route operations.
 */
@Service
public class RouteService {
    private final RouteRepository routeRepository;
    private final BusStopRepository busStopRepository;

    public RouteService(RouteRepository routeRepository, BusStopRepository busStopRepository) {
        this.routeRepository = routeRepository;
        this.busStopRepository = busStopRepository;
    }

    public Route getRouteById(Long id) {
        return routeRepository.findById(id).orElse(null);
    }

    public Route getRouteBySourceAndDestination(String from, String to) {
        return routeRepository.findBySourceAndDestination(from, to).orElse(null);
    }

    public List<BusStop> getStopsForRoute(Long routeId) {
        Route route = getRouteById(routeId);
        if (route != null) {
            return route.getStops();
        }
        return List.of();
    }

    public Map<String, Object> getOfflineRouteData(Long routeId) {
        Route route = getRouteById(routeId);
        Map<String, Object> data = new HashMap<>();
        if (route != null) {
            data.put("id", route.getId());
            data.put("routeName", route.getRouteName());
            data.put("source", route.getSource());
            data.put("destination", route.getDestination());
            data.put("distanceKm", route.getDistanceKm());
            data.put("estimatedDurationMinutes", route.getEstimatedDurationMinutes());
            data.put("stops", route.getStops());
        }
        return data;
    }
}
