package com.smartbus.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "journeys")
public class Journey {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    private Long userId;
    private Long busId;
    private String busNumber;
    private String source;
    private String destination;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private String status; // PLANNED/ACTIVE/COMPLETED/MISSED_STOP
    private int currentStopIndex;
    private int destinationStopIndex;
    private Long routeId;
    
    private boolean guardianEnabled = false;
    private String guardianAlertLevel = "NONE"; // NONE/APPROACHING_10/APPROACHING_5/APPROACHING_1/ARRIVED/MISSED

    public Journey() {}

    public Journey(Long userId, Long busId, String busNumber, String source, String destination, LocalDateTime startTime, LocalDateTime endTime, String status, int currentStopIndex, int destinationStopIndex, Long routeId, boolean guardianEnabled, String guardianAlertLevel) {
        this.userId = userId;
        this.busId = busId;
        this.busNumber = busNumber;
        this.source = source;
        this.destination = destination;
        this.startTime = startTime;
        this.endTime = endTime;
        this.status = status;
        this.currentStopIndex = currentStopIndex;
        this.destinationStopIndex = destinationStopIndex;
        this.routeId = routeId;
        this.guardianEnabled = guardianEnabled;
        this.guardianAlertLevel = guardianAlertLevel;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }
    public Long getBusId() { return busId; }
    public void setBusId(Long busId) { this.busId = busId; }
    public String getBusNumber() { return busNumber; }
    public void setBusNumber(String busNumber) { this.busNumber = busNumber; }
    public String getSource() { return source; }
    public void setSource(String source) { this.source = source; }
    public String getDestination() { return destination; }
    public void setDestination(String destination) { this.destination = destination; }
    public LocalDateTime getStartTime() { return startTime; }
    public void setStartTime(LocalDateTime startTime) { this.startTime = startTime; }
    public LocalDateTime getEndTime() { return endTime; }
    public void setEndTime(LocalDateTime endTime) { this.endTime = endTime; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public int getCurrentStopIndex() { return currentStopIndex; }
    public void setCurrentStopIndex(int currentStopIndex) { this.currentStopIndex = currentStopIndex; }
    public int getDestinationStopIndex() { return destinationStopIndex; }
    public void setDestinationStopIndex(int destinationStopIndex) { this.destinationStopIndex = destinationStopIndex; }
    public Long getRouteId() { return routeId; }
    public void setRouteId(Long routeId) { this.routeId = routeId; }
    public boolean isGuardianEnabled() { return guardianEnabled; }
    public void setGuardianEnabled(boolean guardianEnabled) { this.guardianEnabled = guardianEnabled; }
    public String getGuardianAlertLevel() { return guardianAlertLevel; }
    public void setGuardianAlertLevel(String guardianAlertLevel) { this.guardianAlertLevel = guardianAlertLevel; }
}
