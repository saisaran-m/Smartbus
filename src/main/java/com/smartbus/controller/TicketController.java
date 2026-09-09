package com.smartbus.controller;

import com.smartbus.model.Ticket;
import com.smartbus.service.TicketService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/tickets")
public class TicketController {

    private final TicketService ticketService;

    public TicketController(TicketService ticketService) {
        this.ticketService = ticketService;
    }

    @PostMapping("/book")
    public ResponseEntity<?> bookTicket(@RequestBody Map<String, Object> payload) {
        try {
            Long userId = 1L; // Hardcoded for demo
            Long busId = payload.get("busId") != null ? Long.valueOf(payload.get("busId").toString()) : null;
            String busNumber = (String) payload.get("busNumber");
            String source = (String) payload.get("source");
            String destination = (String) payload.get("destination");
            String seatNumber = (String) payload.get("seatNumber");
            double fareAmount = payload.get("fareAmount") != null ? Double.parseDouble(payload.get("fareAmount").toString()) : 0.0;
            String paymentMethod = (String) payload.get("paymentMethod");
            String travelDate = (String) payload.get("travelDate");

            Ticket ticket = ticketService.bookTicket(userId, busId, busNumber, source, destination, seatNumber, fareAmount, paymentMethod, travelDate);
            return ResponseEntity.ok(ticket);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/confirm/{pnr}")
    public ResponseEntity<?> confirmPayment(@PathVariable String pnr) {
        try {
            Ticket ticket = ticketService.confirmPayment(pnr);
            return ResponseEntity.ok(ticket);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/my-tickets")
    public ResponseEntity<?> getMyTickets() {
        try {
            Long userId = 1L; // Hardcoded for demo
            List<Ticket> tickets = ticketService.getUserTickets(userId);
            return ResponseEntity.ok(tickets);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/validate/{pnr}")
    public ResponseEntity<?> validateTicket(@PathVariable String pnr) {
        try {
            Ticket ticket = ticketService.validateTicket(pnr);
            return ResponseEntity.ok(ticket);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/cancel/{pnr}")
    public ResponseEntity<?> cancelTicket(@PathVariable String pnr) {
        try {
            Ticket ticket = ticketService.cancelTicket(pnr);
            return ResponseEntity.ok(ticket);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}
