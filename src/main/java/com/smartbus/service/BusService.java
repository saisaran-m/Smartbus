package com.smartbus.service;

import com.smartbus.dto.BusSearchResult;
import com.smartbus.model.Bus;
import com.smartbus.model.BusStop;
import com.smartbus.model.Route;
import com.smartbus.repository.BusRepository;
import com.smartbus.repository.BusStopRepository;
import com.smartbus.repository.RouteRepository;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class BusService {
    private final BusRepository busRepository;
    private final RouteRepository routeRepository;
    private final BusStopRepository busStopRepository;

    // Comprehensive GPS Directory for Tamil Nadu Districts & Key Transit Towns
    private static final Map<String, double[]> TN_COORDINATES = new LinkedHashMap<>();
    private static final Map<String, String> TN_RTO = new LinkedHashMap<>();

    static {
        // Northern Region & Chennai Metro
        addLocation("chennai", 13.0827, 80.2707, "TN01");
        addLocation("koyambedu", 13.0694, 80.1948, "TN02");
        addLocation("tambaram", 12.9249, 80.1000, "TN11");
        addLocation("chengalpattu", 12.6819, 79.9888, "TN19");
        addLocation("kanchipuram", 12.8342, 79.7036, "TN21");
        addLocation("tiruvallur", 13.1432, 79.9079, "TN20");
        addLocation("vellore", 12.9165, 79.1325, "TN23");
        addLocation("ranipet", 12.9270, 79.3330, "TN73");
        addLocation("tirupathur", 12.4930, 78.5670, "TN83");
        addLocation("ambur", 12.7904, 78.7166, "TN83");
        addLocation("tiruvannamalai", 12.2253, 79.0747, "TN25");
        addLocation("sriperumbudur", 12.9691, 79.9416, "TN11");
        addLocation("mahabalipuram", 12.6269, 80.1927, "TN19");

        // Western Region (Kongu Nadu) & Hills
        addLocation("coimbatore", 11.0168, 76.9558, "TN38");
        addLocation("tiruppur", 11.1085, 77.3411, "TN39");
        addLocation("erode", 11.3410, 77.7172, "TN33");
        addLocation("salem", 11.6643, 78.1460, "TN27");
        addLocation("namakkal", 11.2189, 78.1674, "TN28");
        addLocation("dharmapuri", 12.1211, 78.1582, "TN29");
        addLocation("krishnagiri", 12.5186, 78.2137, "TN24");
        addLocation("hosur", 12.7409, 77.8253, "TN70");
        addLocation("karur", 10.9601, 78.0766, "TN47");
        addLocation("pollachi", 10.6609, 77.0048, "TN41");
        addLocation("mettupalayam", 11.3000, 76.9400, "TN40");
        addLocation("ooty", 11.4102, 76.6950, "TN43");
        addLocation("coonoor", 11.3530, 76.7959, "TN43");
        addLocation("attur", 11.5975, 78.6010, "TN77");
        addLocation("sankari", 11.4880, 77.8680, "TN27");
        addLocation("bhavani", 11.4503, 77.6835, "TN33");

        // Central Region & Cauvery Delta
        addLocation("trichy", 10.7905, 78.7047, "TN45");
        addLocation("thanjavur", 10.7870, 79.1378, "TN49");
        addLocation("kumbakonam", 10.9602, 79.3845, "TN68");
        addLocation("tiruvarur", 10.7725, 79.6365, "TN50");
        addLocation("nagapattinam", 10.7672, 79.8449, "TN51");
        addLocation("mayiladuthurai", 11.1075, 79.6524, "TN82");
        addLocation("perambalur", 11.2330, 78.8830, "TN46");
        addLocation("ariyalur", 11.1400, 79.0786, "TN61");
        addLocation("pudukkottai", 10.3797, 78.8208, "TN55");

        // Southern Region
        addLocation("madurai", 9.9252, 78.1198, "TN58");
        addLocation("dindigul", 10.3624, 77.9695, "TN57");
        addLocation("palani", 10.4500, 77.5167, "TN57");
        addLocation("theni", 10.0104, 77.4768, "TN60");
        addLocation("virudhunagar", 9.5872, 77.9515, "TN67");
        addLocation("sivakasi", 9.4533, 77.7977, "TN84");
        addLocation("ramanathapuram", 9.3639, 78.8395, "TN65");
        addLocation("rameswaram", 9.2876, 79.3129, "TN65");
        addLocation("sivaganga", 9.8433, 78.4809, "TN63");
        addLocation("manamadurai", 9.7042, 78.4485, "TN63");
        addLocation("paramakudi", 9.5447, 78.5900, "TN65");
        addLocation("mandapam", 9.2789, 79.1235, "TN65");

        // Deep South (Nellai & Kumari)
        addLocation("tirunelveli", 8.7139, 77.7567, "TN72");
        addLocation("tenkasi", 8.9594, 77.3152, "TN76");
        addLocation("thoothukudi", 8.7642, 78.1348, "TN69");
        addLocation("kovilpatti", 9.1738, 77.8683, "TN69");
        addLocation("kanyakumari", 8.0883, 77.5385, "TN74");
        addLocation("nagercoil", 8.1833, 77.4119, "TN74");
        addLocation("valliyur", 8.3844, 77.6108, "TN72");

        // Coastal & Central East
        addLocation("villupuram", 11.9401, 79.4861, "TN32");
        addLocation("tindivanam", 12.2340, 79.6554, "TN32");
        addLocation("gingee", 12.2536, 79.4182, "TN32");
        addLocation("senji", 12.2536, 79.4182, "TN32");
        addLocation("arani", 12.6710, 79.2840, "TN25");
        addLocation("cheyyar", 12.6580, 79.5420, "TN25");
        addLocation("polur", 12.5080, 79.1280, "TN25");
        addLocation("vandavasi", 12.5030, 79.6100, "TN25");
        addLocation("cuddalore", 11.7480, 79.7714, "TN31");
        addLocation("panruti", 11.7700, 79.5500, "TN31");
        addLocation("neyveli", 11.5990, 79.4840, "TN31");
        addLocation("vridhachalam", 11.5300, 79.3300, "TN31");
        addLocation("virudhachalam", 11.5300, 79.3300, "TN31");
        addLocation("chidambaram", 11.3992, 79.6936, "TN31");
        addLocation("kallakurichi", 11.7380, 78.9630, "TN15");
        addLocation("ulundurpettai", 11.7550, 79.3300, "TN32");
        addLocation("vikravandi", 12.0100, 79.5400, "TN32");
        addLocation("arakkonam", 13.0780, 79.6670, "TN73");
        addLocation("tiruttani", 13.1800, 79.6100, "TN20");
        addLocation("pondicherry", 11.9416, 79.8083, "PY01");
        addLocation("puducherry", 11.9416, 79.8083, "PY01");
    }

    private static void addLocation(String name, double lat, double lng, String rto) {
        TN_COORDINATES.put(name, new double[]{lat, lng});
        TN_RTO.put(name, rto);
    }

    public BusService(BusRepository busRepository, RouteRepository routeRepository, BusStopRepository busStopRepository) {
        this.busRepository = busRepository;
        this.routeRepository = routeRepository;
        this.busStopRepository = busStopRepository;
    }

    public String normalizeCity(String city) {
        if (city == null) return "";
        String c = city.trim().toLowerCase();
        if (c.equals("kovai") || c.equals("coimbatore")) return "coimbatore";
        if (c.equals("nellai") || c.equals("tirunelveli")) return "tirunelveli";
        if (c.equals("madras") || c.equals("chennai")) return "chennai";
        if (c.equals("kanchi") || c.equals("kanchipuram")) return "kanchipuram";
        if (c.equals("tanjore") || c.equals("thanjavur")) return "thanjavur";
        if (c.equals("pondy") || c.equals("puducherry") || c.equals("pondicherry")) return "pondicherry";
        if (c.equals("cape") || c.equals("kanyakumari")) return "kanyakumari";
        if (c.equals("ootacamund") || c.equals("udhagamandalam") || c.equals("ooty")) return "ooty";
        if (c.equals("tuticorin") || c.equals("thoothukudi")) return "thoothukudi";
        if (c.equals("trichy") || c.equals("tiruchirappalli") || c.equals("tiruchirapalli")) return "trichy";
        return c;
    }

    public List<BusSearchResult> searchBuses(String from, String to) {
        final String searchFrom = from != null ? from.trim() : "";
        final String searchTo = to != null ? to.trim() : "";
        final String fromNorm = normalizeCity(searchFrom);
        final String toNorm = normalizeCity(searchTo);

        if (fromNorm.isEmpty() && toNorm.isEmpty()) {
            return busRepository.findAll().stream()
                    .filter(Bus::isActive)
                    .limit(10)
                    .map(b -> mapToSearchResult(b, searchFrom, searchTo))
                    .collect(Collectors.toList());
        }

        List<Bus> allBuses = busRepository.findAll().stream()
                .filter(Bus::isActive)
                .collect(Collectors.toList());

        List<BusSearchResult> exactMatches = new ArrayList<>();
        List<BusSearchResult> stopMatches = new ArrayList<>();

        for (Bus bus : allBuses) {
            String busSrc = bus.getSource() != null ? bus.getSource().toLowerCase() : "";
            String busDst = bus.getDestination() != null ? bus.getDestination().toLowerCase() : "";

            // 1. Direct match: Bus source matches from AND bus destination matches to
            if (busSrc.contains(fromNorm) && busDst.contains(toNorm)) {
                exactMatches.add(mapToSearchResult(bus, from, to));
                continue;
            }

            // 2. Intermediate stop match: Bus stops along its route include from and to in order
            if (bus.getRouteId() != null) {
                Optional<Route> optRoute = routeRepository.findById(bus.getRouteId());
                if (optRoute.isPresent() && optRoute.get().getStops() != null) {
                    List<BusStop> stops = optRoute.get().getStops();
                    int fromIdx = -1;
                    int toIdx = -1;

                    for (int i = 0; i < stops.size(); i++) {
                        String stopName = stops.get(i).getStopName().toLowerCase();
                        if (fromIdx == -1 && (stopName.contains(fromNorm) || fromNorm.contains(stopName))) {
                            fromIdx = i;
                        }
                        if (stopName.contains(toNorm) || toNorm.contains(stopName)) {
                            toIdx = i;
                        }
                    }

                    // If both stops exist and from is before to (or either terminal matches)
                    boolean fromMatched = (fromIdx != -1) || busSrc.contains(fromNorm);
                    boolean toMatched = (toIdx != -1) || busDst.contains(toNorm);

                    if (fromMatched && toMatched) {
                        if (fromIdx == -1) fromIdx = 0;
                        if (toIdx == -1) toIdx = stops.size() - 1;

                        if (fromIdx < toIdx) {
                            stopMatches.add(mapToSearchResult(bus, from, to));
                        }
                    }
                }
            }
        }

        if (!exactMatches.isEmpty()) {
            return exactMatches;
        }
        if (!stopMatches.isEmpty()) {
            return stopMatches;
        }

        // 3. Dynamic On-Demand Statewide Generation:
        // When both from & to are specified anywhere in Tamil Nadu, create a dedicated
        // realistic transit route with GPS stops and live buses.
        if (!fromNorm.isEmpty() && !toNorm.isEmpty() && !fromNorm.equalsIgnoreCase(toNorm)) {
            return generateOnDemandBuses(searchFrom, searchTo);
        }

        // 4. Fallback for single-field search (e.g. only from or only to specified)
        List<BusSearchResult> fallbackMatches = new ArrayList<>();
        for (Bus bus : allBuses) {
            String busSrc = bus.getSource() != null ? bus.getSource().toLowerCase() : "";
            String busDst = bus.getDestination() != null ? bus.getDestination().toLowerCase() : "";

            if ((!fromNorm.isEmpty() && busSrc.contains(fromNorm)) ||
                (!toNorm.isEmpty() && busDst.contains(toNorm))) {
                fallbackMatches.add(mapToSearchResult(bus, searchFrom, searchTo));
            }
        }

        if (!fallbackMatches.isEmpty()) {
            return fallbackMatches;
        }

        // 5. Default: return top 5 active buses so user always sees live buses
        return allBuses.stream().limit(5).map(b -> mapToSearchResult(b, searchFrom, searchTo)).collect(Collectors.toList());
    }

    public synchronized List<BusSearchResult> generateOnDemandBuses(String searchFrom, String searchTo) {
        String fromCap = capitalize(searchFrom);
        String toCap = capitalize(searchTo);
        String routeName = fromCap + " - " + toCap + " Express Line";

        // Check if route was already created
        Optional<Route> optRoute = routeRepository.findBySourceAndDestination(fromCap, toCap);
        if (!optRoute.isPresent()) {
            optRoute = routeRepository.findBySourceAndDestination(searchFrom, searchTo);
        }

        Route route;
        if (optRoute.isPresent()) {
            route = optRoute.get();
        } else {
            double[] c1 = getCoordinatesForCity(searchFrom);
            double[] c2 = getCoordinatesForCity(searchTo);
            double distKm = calculateDistanceKm(c1[0], c1[1], c2[0], c2[1]);
            int durationMin = (int) Math.max(30, Math.round(distKm / 50.0 * 60));

            route = new Route();
            route.setRouteName(routeName);
            route.setSource(fromCap);
            route.setDestination(toCap);
            route.setDistanceKm(distKm);
            route.setEstimatedDurationMinutes(durationMin);
            route = routeRepository.save(route);

            // Generate 4 realistic stops
            // Stop 1: Origin Bus Stand
            createStop(route, fromCap + " Central Bus Stand", c1[0], c1[1], 1, 0.0, 0);

            // Stop 2: 33% intermediate
            double latMid1 = c1[0] + (c2[0] - c1[0]) * 0.33;
            double lngMid1 = c1[1] + (c2[1] - c1[1]) * 0.33;
            createStop(route, fromCap + " Outer Tollway", latMid1, lngMid1, 2,
                    Math.round(distKm * 0.33 * 10.0) / 10.0, (int) Math.round(durationMin * 0.33));

            // Stop 3: 66% intermediate
            double latMid2 = c1[0] + (c2[0] - c1[0]) * 0.66;
            double lngMid2 = c1[1] + (c2[1] - c1[1]) * 0.66;
            createStop(route, toCap + " Bypass Junction", latMid2, lngMid2, 3,
                    Math.round(distKm * 0.66 * 10.0) / 10.0, (int) Math.round(durationMin * 0.66));

            // Stop 4: Destination Bus Stand
            createStop(route, toCap + " Central Bus Stand", c2[0], c2[1], 4,
                    distKm, durationMin);

            // Refresh stops from repo into route
            List<BusStop> createdStops = busStopRepository.findByRouteIdOrderBySequenceOrder(route.getId());
            route.setStops(createdStops);
        }

        // Generate 4 active buses for this route
        String rto = getRtoForCity(searchFrom);
        String destCode = toCap.length() >= 2 ? toCap.substring(0, 2).toUpperCase() : "TN";

        String[] busTypes = {"SETC Ultra Deluxe", "TNSTC Superfast Express", "SETC AC Sleeper", "Ordinary Town Service"};
        String[] depTimes = {"06:30", "09:15", "14:30", "19:00"};
        String[] crowds = {"LOW", "MEDIUM", "LOW", "HIGH"};
        double[] ratings = {4.6, 4.3, 4.8, 4.1};
        String[] drivers = {"Murugan K", "Senthil Nathan", "Ramanathan T", "Palanisamy K"};

        int durationMins = route.getEstimatedDurationMinutes();
        List<BusSearchResult> generatedResults = new ArrayList<>();

        for (int i = 0; i < busTypes.length; i++) {
            int seed = Math.abs((searchFrom + searchTo + i).hashCode()) % 8999 + 1000;
            String busNum = rto + "-" + destCode + "-" + seed;

            Optional<Bus> optBus = busRepository.findByBusNumber(busNum);
            Bus b;
            if (!optBus.isPresent()) {
                b = new Bus();
                b.setBusNumber(busNum);
                b.setBusType(busTypes[i]);
                b.setSource(fromCap);
                b.setDestination(toCap);
                b.setDepartureTime(depTimes[i]);
                b.setArrivalTime(calculateArrivalTime(depTimes[i], durationMins));
                b.setCurrentStopIndex(i % 2); // 0 or 1 so it's actively en route
                b.setCrowdLevel(crowds[i]);
                b.setRating(ratings[i]);
                b.setCleanlinessRating(Math.round((ratings[i] + 0.1) * 10.0) / 10.0);
                b.setComfortRating(ratings[i]);
                b.setSafetyRating(Math.round((ratings[i] + 0.2) * 10.0) / 10.0);
                b.setDriverName(drivers[i]);
                b.setActive(true);
                b.setRouteId(route.getId());
                b = busRepository.save(b);
            } else {
                b = optBus.get();
            }
            generatedResults.add(mapToSearchResult(b, searchFrom, searchTo));
        }

        return generatedResults;
    }

    private void createStop(Route route, String name, double lat, double lng, int seq, double distKm, int timeMin) {
        BusStop stop = new BusStop();
        stop.setRoute(route);
        stop.setStopName(name);
        stop.setLatitude(lat);
        stop.setLongitude(lng);
        stop.setSequenceOrder(seq);
        stop.setDistanceFromSourceKm(distKm);
        stop.setEstimatedTimeFromSourceMinutes(timeMin);
        busStopRepository.save(stop);
    }

    private double calculateDistanceKm(double lat1, double lon1, double lat2, double lon2) {
        final int R = 6371; // Earth radius in km
        double latDistance = Math.toRadians(lat2 - lat1);
        double lonDistance = Math.toRadians(lon2 - lon1);
        double a = Math.sin(latDistance / 2) * Math.sin(latDistance / 2)
                + Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2))
                * Math.sin(lonDistance / 2) * Math.sin(lonDistance / 2);
        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        double crow = R * c;
        double distance = Math.max(15.0, crow * 1.25);
        return Math.round(distance * 10.0) / 10.0;
    }

    public double[] getCoordinatesForCity(String cityName) {
        String norm = normalizeCity(cityName);
        for (Map.Entry<String, double[]> entry : TN_COORDINATES.entrySet()) {
            if (norm.contains(entry.getKey()) || entry.getKey().contains(norm)) {
                return entry.getValue();
            }
        }
        // Fallback: Deterministic coordinate within Tamil Nadu bounds (lat 8.5 to 13.0, lng 76.5 to 80.2)
        int hash = Math.abs(norm.hashCode());
        double lat = 9.0 + (hash % 380) / 100.0;
        double lng = 77.0 + ((hash / 380) % 280) / 100.0;
        return new double[]{lat, lng};
    }

    private String getRtoForCity(String cityName) {
        String norm = normalizeCity(cityName);
        for (Map.Entry<String, String> entry : TN_RTO.entrySet()) {
            if (norm.contains(entry.getKey()) || entry.getKey().contains(norm)) {
                return entry.getValue();
            }
        }
        return "TN" + (10 + (Math.abs(norm.hashCode()) % 80));
    }

    private String calculateArrivalTime(String depTime, int durationMinutes) {
        try {
            String[] parts = depTime.split(":");
            int depH = Integer.parseInt(parts[0]);
            int depM = Integer.parseInt(parts[1]);
            int totalM = depH * 60 + depM + durationMinutes;
            int arrH = (totalM / 60) % 24;
            int arrM = totalM % 60;
            return String.format("%02d:%02d", arrH, arrM);
        } catch (Exception e) {
            return "22:00";
        }
    }

    private String capitalize(String str) {
        if (str == null || str.isEmpty()) return "";
        String s = str.trim();
        return s.substring(0, 1).toUpperCase() + s.substring(1);
    }

    public Bus getBusById(Long id) {
        return busRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Bus not found with id: " + id));
    }

    public BusSearchResult getNextBus(String from, String to) {
        List<BusSearchResult> buses = searchBuses(from, to);
        if (buses.isEmpty()) {
            return null;
        }
        return buses.get(0);
    }

    public List<Bus> getAllActiveBuses() {
        return busRepository.findAll().stream()
                .filter(Bus::isActive)
                .collect(Collectors.toList());
    }

    public Bus updateBusPosition(Long busId, int newStopIndex) {
        Bus bus = getBusById(busId);
        bus.setCurrentStopIndex(newStopIndex);
        return busRepository.save(bus);
    }

    private BusSearchResult mapToSearchResult(Bus bus, String searchFrom, String searchTo) {
        BusSearchResult result = new BusSearchResult();
        result.setBusId(bus.getId());
        result.setBusNumber(bus.getBusNumber());
        result.setBusType(bus.getBusType());
        result.setSource(bus.getSource());
        result.setDestination(bus.getDestination());
        result.setDepartureTime(bus.getDepartureTime());
        result.setArrivalTime(bus.getArrivalTime());
        result.setCrowdLevel(bus.getCrowdLevel());
        result.setRating(bus.getRating());
        result.setCleanlinessRating(bus.getCleanlinessRating());
        result.setComfortRating(bus.getComfortRating());
        result.setSafetyRating(bus.getSafetyRating());
        result.setRouteId(bus.getRouteId());

        if (bus.getRouteId() != null) {
            routeRepository.findById(bus.getRouteId()).ifPresent(route -> {
                List<BusStop> stops = route.getStops();
                int idx = bus.getCurrentStopIndex();
                if (stops != null && idx >= 0 && idx < stops.size() - 1) {
                    BusStop nextStop = stops.get(idx + 1);
                    result.setNextStop(nextStop.getStopName());
                    int etaMinutes = nextStop.getEstimatedTimeFromSourceMinutes() -
                        stops.get(idx).getEstimatedTimeFromSourceMinutes();
                    result.setEstimatedMinutesToArrival(Math.max(etaMinutes, 5));
                } else if (stops != null && !stops.isEmpty()) {
                    result.setNextStop(stops.get(0).getStopName());
                    result.setEstimatedMinutesToArrival(15);
                }
            });
        }
        return result;
    }
}
