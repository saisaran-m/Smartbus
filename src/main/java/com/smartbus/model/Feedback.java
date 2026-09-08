package com.smartbus.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "feedbacks")
public class Feedback {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    private Long journeyId;
    private Long userId;
    private Long busId;
    private String busNumber;
    
    private int cleanliness;
    private int comfort;
    private int crowding;
    private int punctuality;
    private int staffBehaviour;
    private int drivingExperience;
    
    @Column(length = 500)
    private String comments;
    
    private LocalDateTime timestamp = LocalDateTime.now();

    public Feedback() {}

    public Feedback(Long journeyId, Long userId, Long busId, String busNumber, int cleanliness, int comfort, int crowding, int punctuality, int staffBehaviour, int drivingExperience, String comments, LocalDateTime timestamp) {
        this.journeyId = journeyId;
        this.userId = userId;
        this.busId = busId;
        this.busNumber = busNumber;
        this.cleanliness = cleanliness;
        this.comfort = comfort;
        this.crowding = crowding;
        this.punctuality = punctuality;
        this.staffBehaviour = staffBehaviour;
        this.drivingExperience = drivingExperience;
        this.comments = comments;
        this.timestamp = timestamp;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getJourneyId() { return journeyId; }
    public void setJourneyId(Long journeyId) { this.journeyId = journeyId; }
    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }
    public Long getBusId() { return busId; }
    public void setBusId(Long busId) { this.busId = busId; }
    public String getBusNumber() { return busNumber; }
    public void setBusNumber(String busNumber) { this.busNumber = busNumber; }
    public int getCleanliness() { return cleanliness; }
    public void setCleanliness(int cleanliness) { this.cleanliness = cleanliness; }
    public int getComfort() { return comfort; }
    public void setComfort(int comfort) { this.comfort = comfort; }
    public int getCrowding() { return crowding; }
    public void setCrowding(int crowding) { this.crowding = crowding; }
    public int getPunctuality() { return punctuality; }
    public void setPunctuality(int punctuality) { this.punctuality = punctuality; }
    public int getStaffBehaviour() { return staffBehaviour; }
    public void setStaffBehaviour(int staffBehaviour) { this.staffBehaviour = staffBehaviour; }
    public int getDrivingExperience() { return drivingExperience; }
    public void setDrivingExperience(int drivingExperience) { this.drivingExperience = drivingExperience; }
    public String getComments() { return comments; }
    public void setComments(String comments) { this.comments = comments; }
    public LocalDateTime getTimestamp() { return timestamp; }
    public void setTimestamp(LocalDateTime timestamp) { this.timestamp = timestamp; }
}
