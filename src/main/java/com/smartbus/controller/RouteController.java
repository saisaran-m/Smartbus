package com.smartbus.controller;

import com.smartbus.model.BusStop;
import com.smartbus.model.Route;
import com.smartbus.service.RouteService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/routes")
public class RouteController {

    private final RouteService routeService;

    public RouteController(RouteService routeService) {
        this.routeService = routeService;
    }

    @GetMapping("/{id}")
    public ResponseEntity<Route> getRouteById(@PathVariable("id") Long id) {
        Route route = routeService.getRouteById(id);
        return route != null ? ResponseEntity.ok(route) : ResponseEntity.notFound().build();
    }

    @GetMapping("/{id}/stops")
    public ResponseEntity<List<BusStop>> getStopsForRoute(@PathVariable("id") Long id) {
        return ResponseEntity.ok(routeService.getStopsForRoute(id));
    }

    @GetMapping("/{id}/offline")
    public ResponseEntity<Map<String, Object>> getOfflineRouteData(@PathVariable("id") Long id) {
        return ResponseEntity.ok(routeService.getOfflineRouteData(id));
    }

    @GetMapping("/search")
    public ResponseEntity<Route> getRouteBySourceAndDestination(@RequestParam("from") String from,
                                                                @RequestParam("to") String to) {
        Route route = routeService.getRouteBySourceAndDestination(from, to);
        return route != null ? ResponseEntity.ok(route) : ResponseEntity.notFound().build();
    }
}
