package com.smartbus.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;

@Entity
@Table(name = "bus_stops")
public class BusStop {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    private String stopName;
    private double latitude;
    private double longitude;
    private int sequenceOrder;
    private double distanceFromSourceKm;
    private int estimatedTimeFromSourceMinutes;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "route_id")
    @JsonIgnore
    private Route route;

    public BusStop() {}

    public BusStop(String stopName, double latitude, double longitude, int sequenceOrder, double distanceFromSourceKm, int estimatedTimeFromSourceMinutes, Route route) {
        this.stopName = stopName;
        this.latitude = latitude;
        this.longitude = longitude;
        this.sequenceOrder = sequenceOrder;
        this.distanceFromSourceKm = distanceFromSourceKm;
        this.estimatedTimeFromSourceMinutes = estimatedTimeFromSourceMinutes;
        this.route = route;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getStopName() { return stopName; }
    public void setStopName(String stopName) { this.stopName = stopName; }
    public double getLatitude() { return latitude; }
    public void setLatitude(double latitude) { this.latitude = latitude; }
    public double getLongitude() { return longitude; }
    public void setLongitude(double longitude) { this.longitude = longitude; }
    public int getSequenceOrder() { return sequenceOrder; }
    public void setSequenceOrder(int sequenceOrder) { this.sequenceOrder = sequenceOrder; }
    public double getDistanceFromSourceKm() { return distanceFromSourceKm; }
    public void setDistanceFromSourceKm(double distanceFromSourceKm) { this.distanceFromSourceKm = distanceFromSourceKm; }
    public int getEstimatedTimeFromSourceMinutes() { return estimatedTimeFromSourceMinutes; }
    public void setEstimatedTimeFromSourceMinutes(int estimatedTimeFromSourceMinutes) { this.estimatedTimeFromSourceMinutes = estimatedTimeFromSourceMinutes; }
    public Route getRoute() { return route; }
    public void setRoute(Route route) { this.route = route; }
}
