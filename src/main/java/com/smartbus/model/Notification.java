package com.smartbus.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "notifications")
public class Notification {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    private Long journeyId;
    private Long userId;
    private String message;
    private String type; // APPROACHING/WARNING/MISSED_STOP/INFO
    private LocalDateTime timestamp = LocalDateTime.now();
    private boolean acknowledged = false;

    public Notification() {}

    public Notification(Long journeyId, Long userId, String message, String type, LocalDateTime timestamp, boolean acknowledged) {
        this.journeyId = journeyId;
        this.userId = userId;
        this.message = message;
        this.type = type;
        this.timestamp = timestamp;
        this.acknowledged = acknowledged;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getJourneyId() { return journeyId; }
    public void setJourneyId(Long journeyId) { this.journeyId = journeyId; }
    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }
    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }
    public String getType() { return type; }
    public void setType(String type) { this.type = type; }
    public LocalDateTime getTimestamp() { return timestamp; }
    public void setTimestamp(LocalDateTime timestamp) { this.timestamp = timestamp; }
    public boolean isAcknowledged() { return acknowledged; }
    public void setAcknowledged(boolean acknowledged) { this.acknowledged = acknowledged; }
}
