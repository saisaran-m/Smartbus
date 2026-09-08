package com.smartbus.repository;

import com.smartbus.model.SafetyReport;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SafetyReportRepository extends JpaRepository<SafetyReport, Long> {
    List<SafetyReport> findByBusId(Long busId);
    List<SafetyReport> findByReportType(String reportType);
    long countByBusIdAndReportType(Long busId, String reportType);
}
