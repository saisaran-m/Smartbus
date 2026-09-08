package com.smartbus.dto;

public class RecoveryOption {
    private String nextBusNumber;
    private int nextBusArrivalMinutes;
    private String nearestBusStop;
    private double distanceFromDestinationKm;
    private String message;

    public RecoveryOption() {}

    public RecoveryOption(String nextBusNumber, int nextBusArrivalMinutes, String nearestBusStop, double distanceFromDestinationKm, String message) {
        this.nextBusNumber = nextBusNumber;
        this.nextBusArrivalMinutes = nextBusArrivalMinutes;
        this.nearestBusStop = nearestBusStop;
        this.distanceFromDestinationKm = distanceFromDestinationKm;
        this.message = message;
    }

    public String getNextBusNumber() { return nextBusNumber; }
    public void setNextBusNumber(String nextBusNumber) { this.nextBusNumber = nextBusNumber; }
    public int getNextBusArrivalMinutes() { return nextBusArrivalMinutes; }
    public void setNextBusArrivalMinutes(int nextBusArrivalMinutes) { this.nextBusArrivalMinutes = nextBusArrivalMinutes; }
    public String getNearestBusStop() { return nearestBusStop; }
    public void setNearestBusStop(String nearestBusStop) { this.nearestBusStop = nearestBusStop; }
    public double getDistanceFromDestinationKm() { return distanceFromDestinationKm; }
    public void setDistanceFromDestinationKm(double distanceFromDestinationKm) { this.distanceFromDestinationKm = distanceFromDestinationKm; }
    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }
}
