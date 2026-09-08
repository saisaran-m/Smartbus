package com.smartbus.service;

import com.smartbus.model.Route;
import com.smartbus.repository.RouteRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class FareCalculationService {

    @Autowired
    private RouteRepository routeRepository;

    /**
     * Tamil Nadu State Transport Standard Fare Rates:
     * - Ordinary / Town Bus: Rs. 0.58 / km (min Rs. 7)
     * - Express / Mofussil: Rs. 0.75 / km (min Rs. 14)
     * - Ultra Deluxe: Rs. 0.85 / km (min Rs. 25)
     * - AC Sleeper / Multi-Axle: Rs. 1.40 / km (min Rs. 50)
     * - Senior Citizen discount: 50% concession on basic fare
     */
    public Map<String, Object> calculateFare(String from, String to, String busType, boolean isSenior) {
        double distanceKm = estimateDistance(from, to);

        int ordinary = Math.max(7, (int) Math.round(distanceKm * 0.58));
        int express = Math.max(14, (int) Math.round(distanceKm * 0.75));
        int deluxe = Math.max(25, (int) Math.round(distanceKm * 0.85));
        int ac = Math.max(50, (int) Math.round(distanceKm * 1.40));

        int selectedFare;
        if (busType != null && busType.toLowerCase().contains("ac")) {
            selectedFare = ac;
        } else if (busType != null && busType.toLowerCase().contains("deluxe")) {
            selectedFare = deluxe;
        } else if (busType != null && busType.toLowerCase().contains("express")) {
            selectedFare = express;
        } else {
            selectedFare = ordinary;
        }

        int finalFare = isSenior ? Math.max(5, (int) Math.round(selectedFare * 0.50)) : selectedFare;

        Map<String, Object> res = new HashMap<>();
        res.put("from", from);
        res.put("to", to);
        res.put("distanceKm", distanceKm);
        res.put("busType", busType != null ? busType : "Express");
        res.put("ordinaryFare", ordinary);
        res.put("expressFare", express);
        res.put("deluxeFare", deluxe);
        res.put("acFare", ac);
        res.put("baseFare", selectedFare);
        res.put("isSenior", isSenior);
        res.put("finalFare", finalFare);
        res.put("discountApplied", isSenior ? selectedFare - finalFare : 0);
        res.put("tollCharges", distanceKm > 100 ? 30 : 0);
        return res;
    }

    private double estimateDistance(String from, String to) {
        if (from == null || to == null) return 150.0;
        String f = from.toLowerCase().trim();
        String t = to.toLowerCase().trim();

        // Check if there is a matching route in database
        List<Route> routes = routeRepository.findAll();
        for (Route r : routes) {
            if ((r.getSource().toLowerCase().contains(f) && r.getDestination().toLowerCase().contains(t)) ||
                (r.getSource().toLowerCase().contains(t) && r.getDestination().toLowerCase().contains(f))) {
                return r.getDistanceKm();
            }
        }

        // Standard Tamil Nadu Intercity Road Distances (approx km)
        Map<String, Double> distances = new HashMap<>();
        distances.put("chennai-salem", 345.0);
        distances.put("chennai-coimbatore", 505.0);
        distances.put("chennai-madurai", 460.0);
        distances.put("chennai-trichy", 330.0);
        distances.put("chennai-tirunelveli", 620.0);
        distances.put("chennai-kanyakumari", 705.0);
        distances.put("chennai-villupuram", 160.0);
        distances.put("chennai-pondicherry", 150.0);
        distances.put("chennai-vellore", 138.0);
        distances.put("chennai-hosur", 305.0);
        distances.put("salem-coimbatore", 165.0);
        distances.put("coimbatore-ooty", 86.0);
        distances.put("madurai-tirunelveli", 160.0);
        distances.put("madurai-rameswaram", 172.0);
        distances.put("trichy-thanjavur", 58.0);
        distances.put("trichy-madurai", 135.0);
        distances.put("salem-trichy", 140.0);
        distances.put("erode-coimbatore", 100.0);

        String key1 = f + "-" + t;
        String key2 = t + "-" + f;

        if (distances.containsKey(key1)) return distances.get(key1);
        if (distances.containsKey(key2)) return distances.get(key2);

        // Fallback estimate
        return 220.0;
    }
}
