package com.smartbus.repository;

import com.smartbus.model.Bus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface BusRepository extends JpaRepository<Bus, Long> {
    List<Bus> findBySourceAndDestination(String source, String destination);
    List<Bus> findByRouteId(Long routeId);
    Optional<Bus> findByBusNumber(String busNumber);
    List<Bus> findByIsActiveTrue();
    List<Bus> findBySourceAndDestinationAndIsActiveTrue(String source, String destination);
}
