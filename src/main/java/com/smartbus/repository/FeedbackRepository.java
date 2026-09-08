package com.smartbus.repository;

import com.smartbus.model.Feedback;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FeedbackRepository extends JpaRepository<Feedback, Long> {
    List<Feedback> findByBusId(Long busId);
    List<Feedback> findByUserId(Long userId);
}
