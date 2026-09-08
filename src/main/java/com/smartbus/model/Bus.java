package com.smartbus.model;

import jakarta.persistence.*;

@Entity
@Table(name = "buses")
public class Bus {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(unique = true, nullable = false)
    private String busNumber;
    
    private String busType;
    private String source;
    private String destination;
    private String departureTime;
    private String arrivalTime;
    private int currentStopIndex;
    private String crowdLevel;
    private double rating;
    private double cleanlinessRating;
    private double comfortRating;
    private double safetyRating;
    private String driverName;
    private boolean isActive;
    private Long routeId;

    public Bus() {}

    public Bus(String busNumber, String busType, String source, String destination, String departureTime, String arrivalTime, int currentStopIndex, String crowdLevel, double rating, double cleanlinessRating, double comfortRating, double safetyRating, String driverName, boolean isActive, Long routeId) {
        this.busNumber = busNumber;
        this.busType = busType;
        this.source = source;
        this.destination = destination;
        this.departureTime = departureTime;
        this.arrivalTime = arrivalTime;
        this.currentStopIndex = currentStopIndex;
        this.crowdLevel = crowdLevel;
        this.rating = rating;
        this.cleanlinessRating = cleanlinessRating;
        this.comfortRating = comfortRating;
        this.safetyRating = safetyRating;
        this.driverName = driverName;
        this.isActive = isActive;
        this.routeId = routeId;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getBusNumber() { return busNumber; }
    public void setBusNumber(String busNumber) { this.busNumber = busNumber; }
    public String getBusType() { return busType; }
    public void setBusType(String busType) { this.busType = busType; }
    public String getSource() { return source; }
    public void setSource(String source) { this.source = source; }
    public String getDestination() { return destination; }
    public void setDestination(String destination) { this.destination = destination; }
    public String getDepartureTime() { return departureTime; }
    public void setDepartureTime(String departureTime) { this.departureTime = departureTime; }
    public String getArrivalTime() { return arrivalTime; }
    public void setArrivalTime(String arrivalTime) { this.arrivalTime = arrivalTime; }
    public int getCurrentStopIndex() { return currentStopIndex; }
    public void setCurrentStopIndex(int currentStopIndex) { this.currentStopIndex = currentStopIndex; }
    public String getCrowdLevel() { return crowdLevel; }
    public void setCrowdLevel(String crowdLevel) { this.crowdLevel = crowdLevel; }
    public double getRating() { return rating; }
    public void setRating(double rating) { this.rating = rating; }
    public double getCleanlinessRating() { return cleanlinessRating; }
    public void setCleanlinessRating(double cleanlinessRating) { this.cleanlinessRating = cleanlinessRating; }
    public double getComfortRating() { return comfortRating; }
    public void setComfortRating(double comfortRating) { this.comfortRating = comfortRating; }
    public double getSafetyRating() { return safetyRating; }
    public void setSafetyRating(double safetyRating) { this.safetyRating = safetyRating; }
    public String getDriverName() { return driverName; }
    public void setDriverName(String driverName) { this.driverName = driverName; }
    public boolean isActive() { return isActive; }
    public void setActive(boolean isActive) { this.isActive = isActive; }
    public Long getRouteId() { return routeId; }
    public void setRouteId(Long routeId) { this.routeId = routeId; }
}
