package com.smartbus.repository;

import com.smartbus.model.BusStop;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BusStopRepository extends JpaRepository<BusStop, Long> {
    @Query("SELECT bs FROM BusStop bs WHERE bs.route.id = :routeId ORDER BY bs.sequenceOrder")
    List<BusStop> findByRouteIdOrderBySequenceOrder(@Param("routeId") Long routeId);
}
