package com.smartbus.controller;

import com.smartbus.dto.BusSearchResult;
import com.smartbus.model.Bus;
import com.smartbus.service.BusService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/buses")
public class BusController {

    private final BusService busService;

    public BusController(BusService busService) {
        this.busService = busService;
    }

    @GetMapping("/search")
    public ResponseEntity<List<BusSearchResult>> searchBuses(@RequestParam("from") String from,
                                                             @RequestParam("to") String to) {
        return ResponseEntity.ok(busService.searchBuses(from, to));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Bus> getBusById(@PathVariable("id") Long id) {
        Bus bus = busService.getBusById(id);
        return bus != null ? ResponseEntity.ok(bus) : ResponseEntity.notFound().build();
    }

    @GetMapping("/next")
    public ResponseEntity<BusSearchResult> getNextBus(@RequestParam("from") String from,
                                                      @RequestParam("to") String to) {
        BusSearchResult result = busService.getNextBus(from, to);
        return result != null ? ResponseEntity.ok(result) : ResponseEntity.notFound().build();
    }

    @GetMapping("/active")
    public ResponseEntity<List<Bus>> getActiveBuses() {
        return ResponseEntity.ok(busService.getAllActiveBuses());
    }
}
