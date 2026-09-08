package com.smartbus.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "safety_reports")
public class SafetyReport {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    private Long userId;
    private Long busId;
    private String busNumber;
    private String reportType; // SPEEDING/RASH_DRIVING/OVERCROWDING/DIRTY_BUS/SKIPPED_STOP/STAFF_BEHAVIOUR/BREAKDOWN/OTHER
    
    @Column(length = 500)
    private String description;
    
    private LocalDateTime timestamp = LocalDateTime.now();
    private String status = "PENDING";

    public SafetyReport() {}

    public SafetyReport(Long userId, Long busId, String busNumber, String reportType, String description, LocalDateTime timestamp, String status) {
        this.userId = userId;
        this.busId = busId;
        this.busNumber = busNumber;
        this.reportType = reportType;
        this.description = description;
        this.timestamp = timestamp;
        this.status = status;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }
    public Long getBusId() { return busId; }
    public void setBusId(Long busId) { this.busId = busId; }
    public String getBusNumber() { return busNumber; }
    public void setBusNumber(String busNumber) { this.busNumber = busNumber; }
    public String getReportType() { return reportType; }
    public void setReportType(String reportType) { this.reportType = reportType; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public LocalDateTime getTimestamp() { return timestamp; }
    public void setTimestamp(LocalDateTime timestamp) { this.timestamp = timestamp; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
}
