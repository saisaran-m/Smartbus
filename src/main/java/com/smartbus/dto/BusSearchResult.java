package com.smartbus.dto;

public class BusSearchResult {
    private Long busId;
    private String busNumber;
    private String busType;
    private String source;
    private String destination;
    private String departureTime;
    private String arrivalTime;
    private String nextStop;
    private int estimatedMinutesToArrival;
    private String crowdLevel;
    private double rating;
    private double cleanlinessRating;
    private double comfortRating;
    private double safetyRating;
    private Long routeId;

    public BusSearchResult() {}

    public BusSearchResult(Long busId, String busNumber, String busType, String source, String destination, String departureTime, String arrivalTime, String nextStop, int estimatedMinutesToArrival, String crowdLevel, double rating, double cleanlinessRating, double comfortRating, double safetyRating, Long routeId) {
        this.busId = busId;
        this.busNumber = busNumber;
        this.busType = busType;
        this.source = source;
        this.destination = destination;
        this.departureTime = departureTime;
        this.arrivalTime = arrivalTime;
        this.nextStop = nextStop;
        this.estimatedMinutesToArrival = estimatedMinutesToArrival;
        this.crowdLevel = crowdLevel;
        this.rating = rating;
        this.cleanlinessRating = cleanlinessRating;
        this.comfortRating = comfortRating;
        this.safetyRating = safetyRating;
        this.routeId = routeId;
    }

    public Long getBusId() { return busId; }
    public void setBusId(Long busId) { this.busId = busId; }
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
    public String getNextStop() { return nextStop; }
    public void setNextStop(String nextStop) { this.nextStop = nextStop; }
    public int getEstimatedMinutesToArrival() { return estimatedMinutesToArrival; }
    public void setEstimatedMinutesToArrival(int estimatedMinutesToArrival) { this.estimatedMinutesToArrival = estimatedMinutesToArrival; }
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
    public Long getRouteId() { return routeId; }
    public void setRouteId(Long routeId) { this.routeId = routeId; }
}
