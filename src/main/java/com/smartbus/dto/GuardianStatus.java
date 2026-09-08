package com.smartbus.dto;

public class GuardianStatus {
    private Long journeyId;
    private String alertLevel;
    private String message;
    private String destination;
    private String currentStop;
    private int stopsRemaining;
    private int estimatedMinutes;
    private boolean missedStop;

    public GuardianStatus() {}

    public GuardianStatus(Long journeyId, String alertLevel, String message, String destination, String currentStop, int stopsRemaining, int estimatedMinutes, boolean missedStop) {
        this.journeyId = journeyId;
        this.alertLevel = alertLevel;
        this.message = message;
        this.destination = destination;
        this.currentStop = currentStop;
        this.stopsRemaining = stopsRemaining;
        this.estimatedMinutes = estimatedMinutes;
        this.missedStop = missedStop;
    }

    public Long getJourneyId() { return journeyId; }
    public void setJourneyId(Long journeyId) { this.journeyId = journeyId; }
    public String getAlertLevel() { return alertLevel; }
    public void setAlertLevel(String alertLevel) { this.alertLevel = alertLevel; }
    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }
    public String getDestination() { return destination; }
    public void setDestination(String destination) { this.destination = destination; }
    public String getCurrentStop() { return currentStop; }
    public void setCurrentStop(String currentStop) { this.currentStop = currentStop; }
    public int getStopsRemaining() { return stopsRemaining; }
    public void setStopsRemaining(int stopsRemaining) { this.stopsRemaining = stopsRemaining; }
    public int getEstimatedMinutes() { return estimatedMinutes; }
    public void setEstimatedMinutes(int estimatedMinutes) { this.estimatedMinutes = estimatedMinutes; }
    public boolean isMissedStop() { return missedStop; }
    public void setMissedStop(boolean missedStop) { this.missedStop = missedStop; }
}
