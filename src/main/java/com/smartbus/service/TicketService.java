package com.smartbus.service;

import com.smartbus.model.Ticket;
import com.smartbus.repository.TicketRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Random;

@Service
public class TicketService {

    private final TicketRepository ticketRepository;
    private final Random random = new Random();

    public TicketService(TicketRepository ticketRepository) {
        this.ticketRepository = ticketRepository;
    }

    public Ticket bookTicket(Long userId, Long busId, String busNumber, String source, String destination, String seatNumber, double fareAmount, String paymentMethod, String travelDate) {
        Ticket ticket = new Ticket();
        ticket.setUserId(userId);
        ticket.setBusId(busId);
        ticket.setBusNumber(busNumber);
        ticket.setSource(source);
        ticket.setDestination(destination);
        ticket.setSeatNumber(seatNumber);
        ticket.setFareAmount(fareAmount);
        ticket.setPaymentMethod(paymentMethod);
        ticket.setTravelDate(travelDate);
        
        String pnr = "SB" + System.currentTimeMillis() + String.format("%04d", random.nextInt(10000));
        ticket.setPnrNumber(pnr);
        
        String qrData = String.format("{\"pnr\":\"%s\", \"passenger\":\"%s\", \"bus\":\"%s\", \"seat\":\"%s\", \"from\":\"%s\", \"to\":\"%s\", \"date\":\"%s\", \"status\":\"PENDING\"}",
                pnr, userId, busNumber, seatNumber, source, destination, travelDate);
        ticket.setQrData(qrData);
        
        return ticketRepository.save(ticket);
    }

    public Ticket confirmPayment(String pnrNumber) {
        Ticket ticket = ticketRepository.findByPnrNumber(pnrNumber)
                .orElseThrow(() -> new RuntimeException("Ticket not found"));
        ticket.setPaymentStatus("PAID");
        
        String currentQr = ticket.getQrData();
        if (currentQr != null) {
            ticket.setQrData(currentQr.replace("\"status\":\"PENDING\"", "\"status\":\"PAID\""));
        }
        
        return ticketRepository.save(ticket);
    }

    public List<Ticket> getUserTickets(Long userId) {
        List<Ticket> tickets = ticketRepository.findByUserId(userId);
        tickets.sort((t1, t2) -> t2.getCreatedAt().compareTo(t1.getCreatedAt()));
        return tickets;
    }

    public Ticket validateTicket(String pnrNumber) {
        Ticket ticket = ticketRepository.findByPnrNumber(pnrNumber)
                .orElseThrow(() -> new RuntimeException("Ticket not found"));
        if (!"PAID".equals(ticket.getPaymentStatus())) {
            throw new RuntimeException("Ticket is not paid");
        }
        return ticket;
    }

    public Ticket cancelTicket(String pnrNumber) {
        Ticket ticket = ticketRepository.findByPnrNumber(pnrNumber)
                .orElseThrow(() -> new RuntimeException("Ticket not found"));
        ticket.setPaymentStatus("CANCELLED");
        return ticketRepository.save(ticket);
    }
}
