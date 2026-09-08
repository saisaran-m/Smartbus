package com.smartbus.model;

import jakarta.persistence.*;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "routes")
public class Route {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    private String routeName;
    private String source;
    private String destination;
    private double distanceKm;
    private int estimatedDurationMinutes;

    @OneToMany(mappedBy = "route", cascade = CascadeType.ALL, fetch = FetchType.EAGER)
    @OrderBy("sequenceOrder ASC")
    private List<BusStop> stops = new ArrayList<>();

    public Route() {}

    public Route(String routeName, String source, String destination, double distanceKm, int estimatedDurationMinutes, List<BusStop> stops) {
        this.routeName = routeName;
        this.source = source;
        this.destination = destination;
        this.distanceKm = distanceKm;
        this.estimatedDurationMinutes = estimatedDurationMinutes;
        this.stops = stops;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getRouteName() { return routeName; }
    public void setRouteName(String routeName) { this.routeName = routeName; }
    public String getSource() { return source; }
    public void setSource(String source) { this.source = source; }
    public String getDestination() { return destination; }
    public void setDestination(String destination) { this.destination = destination; }
    public double getDistanceKm() { return distanceKm; }
    public void setDistanceKm(double distanceKm) { this.distanceKm = distanceKm; }
    public int getEstimatedDurationMinutes() { return estimatedDurationMinutes; }
    public void setEstimatedDurationMinutes(int estimatedDurationMinutes) { this.estimatedDurationMinutes = estimatedDurationMinutes; }
    public List<BusStop> getStops() { return stops; }
    public void setStops(List<BusStop> stops) { this.stops = stops; }
}
