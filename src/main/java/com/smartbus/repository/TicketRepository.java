package com.smartbus.repository;

import com.smartbus.model.Ticket;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TicketRepository extends JpaRepository<Ticket, Long> {
    List<Ticket> findByUserId(Long userId);
    Optional<Ticket> findByPnrNumber(String pnrNumber);
    List<Ticket> findByUserIdAndPaymentStatus(Long userId, String paymentStatus);
}
