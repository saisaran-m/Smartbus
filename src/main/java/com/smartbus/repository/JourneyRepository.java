package com.smartbus.repository;

import com.smartbus.model.Journey;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface JourneyRepository extends JpaRepository<Journey, Long> {
    List<Journey> findByUserId(Long userId);
    List<Journey> findByUserIdAndStatus(Long userId, String status);
    List<Journey> findByStatus(String status);
}
