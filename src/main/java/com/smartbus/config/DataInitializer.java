package com.smartbus.config;

import com.smartbus.model.Bus;
import com.smartbus.model.BusStop;
import com.smartbus.model.Route;
import com.smartbus.model.User;
import com.smartbus.repository.BusRepository;
import com.smartbus.repository.BusStopRepository;
import com.smartbus.repository.RouteRepository;
import com.smartbus.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;

@Component
public class DataInitializer implements CommandLineRunner {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RouteRepository routeRepository;

    @Autowired
    private BusStopRepository busStopRepository;

    @Autowired
    private BusRepository busRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        if (routeRepository.count() > 0) {
            System.out.println("ℹ️ SmartBus database already initialized with " + routeRepository.count() + " routes.");
            return;
        }

        System.out.println("🚀 Initializing SmartBus statewide Tamil Nadu transit database...");

        // 1. Create Demo User
        User demoUser = new User();
        demoUser.setUsername("demo");
        demoUser.setEmail("demo@smartbus.com");
        demoUser.setPassword(passwordEncoder.encode("demo123"));
        demoUser.setFullName("Demo Passenger");
        demoUser.setPhone("9876543210");
        demoUser.setRole("PASSENGER");
        demoUser.setSeniorCitizenMode(false);
        demoUser.setPreferredLanguage("en");
        userRepository.save(demoUser);

        // ----------------------------------------------------
        // ROUTE 1: Chennai <-> Salem Express Way (340 km)
        // ----------------------------------------------------
        Route rSalem = new Route();
        rSalem.setRouteName("Chennai - Salem Express Way");
        rSalem.setSource("Chennai");
        rSalem.setDestination("Salem");
        rSalem.setDistanceKm(340.0);
        rSalem.setEstimatedDurationMinutes(380);
        rSalem = routeRepository.save(rSalem);

        addStop(rSalem, "Koyambedu CMBT", 13.0694, 80.1948, 1, 0, 0);
        addStop(rSalem, "Tambaram", 12.9249, 80.1000, 2, 25, 35);
        addStop(rSalem, "Chengalpattu", 12.6819, 79.9888, 3, 57, 70);
        addStop(rSalem, "Tindivanam", 12.2340, 79.6554, 4, 112, 130);
        addStop(rSalem, "Ulundurpettai", 11.7550, 79.3300, 5, 190, 215);
        addStop(rSalem, "Attur", 11.5975, 78.6010, 6, 280, 310);
        addStop(rSalem, "Salem Central Bus Stand", 11.6643, 78.1460, 7, 340, 380);

        createBus("TN27-SL-1001", "Ultra Deluxe", "Chennai", "Salem", "05:30", "11:50", 1, "LOW", 4.6, 4.7, 4.5, 4.6, "Murugan K", rSalem.getId());
        createBus("TN27-SL-2002", "Express", "Chennai", "Salem", "07:15", "13:35", 2, "MEDIUM", 4.3, 4.2, 4.3, 4.4, "Senthil Nathan", rSalem.getId());
        createBus("TN27-SL-3003", "AC Sleeper", "Chennai", "Salem", "10:00", "16:20", 1, "LOW", 4.9, 4.9, 4.8, 4.8, "Velu M", rSalem.getId());
        createBus("TN27-SL-4004", "SuperDeluxe", "Chennai", "Salem", "13:30", "19:50", 3, "HIGH", 4.1, 4.0, 4.1, 4.2, "Raja Gopalan", rSalem.getId());
        createBus("TN27-SL-5005", "Express", "Chennai", "Salem", "16:45", "23:05", 1, "MEDIUM", 4.4, 4.3, 4.4, 4.5, "Karthik R", rSalem.getId());
        createBus("TN27-SL-6006", "AC Seater", "Chennai", "Salem", "21:30", "03:50", 1, "LOW", 4.7, 4.8, 4.7, 4.7, "Dhanasekar P", rSalem.getId());

        // ----------------------------------------------------
        // ROUTE 2: Chennai <-> Coimbatore Kongu Corridor (500 km)
        // ----------------------------------------------------
        Route rCbe = new Route();
        rCbe.setRouteName("Chennai - Coimbatore Kongu Corridor");
        rCbe.setSource("Chennai");
        rCbe.setDestination("Coimbatore");
        rCbe.setDistanceKm(500.0);
        rCbe.setEstimatedDurationMinutes(550);
        rCbe = routeRepository.save(rCbe);

        addStop(rCbe, "Koyambedu CMBT", 13.0694, 80.1948, 1, 0, 0);
        addStop(rCbe, "Salem", 11.6643, 78.1460, 2, 340, 380);
        addStop(rCbe, "Erode Bus Stand", 11.3410, 77.7172, 3, 395, 440);
        addStop(rCbe, "Tiruppur Old Bus Stand", 11.1085, 77.3411, 4, 445, 490);
        addStop(rCbe, "Coimbatore Gandhipuram", 11.0168, 76.9558, 5, 500, 550);

        createBus("TN38-CB-1100", "SETC AC Sleeper (Kongu)", "Chennai", "Coimbatore", "06:00", "15:10", 1, "LOW", 4.8, 4.8, 4.7, 4.8, "Ramanathan T", rCbe.getId());
        createBus("TN38-CB-2200", "Ultra Deluxe", "Chennai", "Coimbatore", "14:00", "23:10", 2, "MEDIUM", 4.4, 4.3, 4.5, 4.4, "Kuppusamy P", rCbe.getId());
        createBus("TN38-CB-3300", "AC Multi-Axle", "Chennai", "Coimbatore", "21:00", "06:10", 1, "LOW", 4.9, 4.9, 4.9, 4.9, "Sundaram S", rCbe.getId());

        // ----------------------------------------------------
        // ROUTE 3: Chennai <-> Madurai Pandian Highway (460 km)
        // ----------------------------------------------------
        Route rMadurai = new Route();
        rMadurai.setRouteName("Chennai - Madurai Pandian Highway");
        rMadurai.setSource("Chennai");
        rMadurai.setDestination("Madurai");
        rMadurai.setDistanceKm(460.0);
        rMadurai.setEstimatedDurationMinutes(510);
        rMadurai = routeRepository.save(rMadurai);

        addStop(rMadurai, "Koyambedu CMBT", 13.0694, 80.1948, 1, 0, 0);
        addStop(rMadurai, "Villupuram", 11.9401, 79.4861, 2, 160, 185);
        addStop(rMadurai, "Trichy Central", 10.7905, 78.7047, 3, 330, 370);
        addStop(rMadurai, "Dindigul Bus Stand", 10.3624, 77.9695, 4, 400, 440);
        addStop(rMadurai, "Madurai Mattuthavani", 9.9252, 78.1198, 5, 460, 510);

        createBus("TN58-MD-5500", "SETC Ultra Deluxe (Pandian)", "Chennai", "Madurai", "07:00", "15:30", 1, "MEDIUM", 4.6, 4.6, 4.5, 4.6, "Meenakshi Sundaram", rMadurai.getId());
        createBus("TN58-MD-6600", "AC Sleeper Non-Stop", "Chennai", "Madurai", "13:30", "22:00", 2, "LOW", 4.8, 4.8, 4.8, 4.8, "Karuppiah N", rMadurai.getId());
        createBus("TN58-MD-7700", "Super Fast Express", "Chennai", "Madurai", "20:45", "05:15", 1, "HIGH", 4.2, 4.1, 4.2, 4.3, "Perumal K", rMadurai.getId());

        // ----------------------------------------------------
        // ROUTE 4: Chennai <-> Tirunelveli Nellai Express (620 km)
        // ----------------------------------------------------
        Route rNellai = new Route();
        rNellai.setRouteName("Chennai - Tirunelveli Nellai Express");
        rNellai.setSource("Chennai");
        rNellai.setDestination("Tirunelveli");
        rNellai.setDistanceKm(620.0);
        rNellai.setEstimatedDurationMinutes(680);
        rNellai = routeRepository.save(rNellai);

        addStop(rNellai, "Koyambedu CMBT", 13.0694, 80.1948, 1, 0, 0);
        addStop(rNellai, "Trichy", 10.7905, 78.7047, 2, 330, 370);
        addStop(rNellai, "Madurai", 9.9252, 78.1198, 3, 460, 510);
        addStop(rNellai, "Virudhunagar", 9.5872, 77.9515, 4, 510, 560);
        addStop(rNellai, "Kovilpatti", 9.1738, 77.8683, 5, 565, 620);
        addStop(rNellai, "Tirunelveli New Bus Stand", 8.7139, 77.7567, 6, 620, 680);

        createBus("TN72-TV-8811", "SETC Ultra Deluxe (Nellai)", "Chennai", "Tirunelveli", "08:00", "19:20", 1, "LOW", 4.7, 4.7, 4.6, 4.7, "Muthu Pandian", rNellai.getId());
        createBus("TN72-TV-8822", "AC Sleeper Express", "Chennai", "Tirunelveli", "18:00", "05:20", 2, "LOW", 4.9, 4.9, 4.8, 4.9, "Sankara Narayanan", rNellai.getId());
        createBus("TN72-TV-8833", "Point-to-Point Express", "Chennai", "Tirunelveli", "21:30", "08:50", 1, "HIGH", 4.3, 4.2, 4.3, 4.3, "Essakki Muthu", rNellai.getId());

        // ----------------------------------------------------
        // ROUTE 5: Chennai <-> Kanyakumari Southern Tip (705 km)
        // ----------------------------------------------------
        Route rCape = new Route();
        rCape.setRouteName("Chennai - Kanyakumari Cape Express");
        rCape.setSource("Chennai");
        rCape.setDestination("Kanyakumari");
        rCape.setDistanceKm(705.0);
        rCape.setEstimatedDurationMinutes(780);
        rCape = routeRepository.save(rCape);

        addStop(rCape, "Koyambedu CMBT", 13.0694, 80.1948, 1, 0, 0);
        addStop(rCape, "Madurai", 9.9252, 78.1198, 2, 460, 510);
        addStop(rCape, "Tirunelveli", 8.7139, 77.7567, 3, 620, 680);
        addStop(rCape, "Valliyur", 8.3844, 77.6108, 4, 655, 720);
        addStop(rCape, "Nagercoil Central", 8.1833, 77.4119, 5, 685, 755);
        addStop(rCape, "Kanyakumari Pier", 8.0883, 77.5385, 6, 705, 780);

        createBus("TN74-KK-9090", "SETC AC Sleeper (Kumari)", "Chennai", "Kanyakumari", "15:30", "04:30", 1, "LOW", 4.9, 4.9, 4.9, 4.9, "Subramaniam V", rCape.getId());
        createBus("TN74-KK-9091", "Ultra Deluxe Superfast", "Chennai", "Kanyakumari", "18:30", "07:30", 2, "MEDIUM", 4.5, 4.4, 4.5, 4.6, "Arumugam P", rCape.getId());

        // ----------------------------------------------------
        // ROUTE 6: Chennai <-> Villupuram Rural Line (160 km)
        // ----------------------------------------------------
        Route rVlp = new Route();
        rVlp.setRouteName("Chennai - Villupuram Rural Line");
        rVlp.setSource("Chennai");
        rVlp.setDestination("Villupuram");
        rVlp.setDistanceKm(160.0);
        rVlp.setEstimatedDurationMinutes(185);
        rVlp = routeRepository.save(rVlp);

        addStop(rVlp, "Koyambedu CMBT", 13.0694, 80.1948, 1, 0, 0);
        addStop(rVlp, "Tambaram", 12.9249, 80.1000, 2, 25, 35);
        addStop(rVlp, "Chengalpattu", 12.6819, 79.9888, 3, 57, 70);
        addStop(rVlp, "Tindivanam", 12.2340, 79.6554, 4, 112, 130);
        addStop(rVlp, "Vikravandi", 12.0100, 79.5400, 5, 140, 160);
        addStop(rVlp, "Villupuram Bus Stand", 11.9401, 79.4861, 6, 160, 185);

        createBus("TN32-VL-1234", "Express", "Chennai", "Villupuram", "06:00", "09:05", 1, "LOW", 4.2, 4.3, 4.1, 4.4, "Anbazhagan G", rVlp.getId());
        createBus("TN32-VL-5678", "Deluxe", "Chennai", "Villupuram", "07:30", "10:35", 2, "MEDIUM", 3.8, 3.8, 3.9, 4.0, "Saravanan T", rVlp.getId());
        createBus("TN32-VL-9012", "Ordinary (Town)", "Chennai", "Villupuram", "09:00", "12:30", 1, "HIGH", 3.5, 3.4, 3.5, 3.6, "Selvam M", rVlp.getId());
        createBus("TN32-VL-3456", "AC Seater", "Chennai", "Villupuram", "10:30", "13:35", 1, "LOW", 4.5, 4.6, 4.5, 4.6, "Rajendran P", rVlp.getId());

        // ----------------------------------------------------
        // ROUTE 7: Chennai <-> Pondicherry ECR Line (150 km)
        // ----------------------------------------------------
        Route rPondy = new Route();
        rPondy.setRouteName("Chennai - Pondicherry ECR Coastal");
        rPondy.setSource("Chennai");
        rPondy.setDestination("Pondicherry");
        rPondy.setDistanceKm(150.0);
        rPondy.setEstimatedDurationMinutes(170);
        rPondy = routeRepository.save(rPondy);

        addStop(rPondy, "Koyambedu CMBT", 13.0694, 80.1948, 1, 0, 0);
        addStop(rPondy, "Thiruvanmiyur ECR", 12.9830, 80.2594, 2, 20, 30);
        addStop(rPondy, "Mahabalipuram", 12.6269, 80.1927, 3, 55, 65);
        addStop(rPondy, "Marakkanam", 12.1972, 79.9510, 4, 115, 130);
        addStop(rPondy, "Pondicherry New Bus Stand", 11.9416, 79.8083, 5, 150, 170);

        createBus("TN01-KL-1111", "Ultra Deluxe", "Chennai", "Pondicherry", "06:30", "09:20", 1, "LOW", 4.5, 4.5, 4.4, 4.6, "Kathiravan R", rPondy.getId());
        createBus("TN01-MN-2222", "AC Volvo", "Chennai", "Pondicherry", "10:00", "12:50", 2, "MEDIUM", 4.7, 4.8, 4.7, 4.7, "Dharmaraj C", rPondy.getId());
        createBus("TN01-OP-3333", "Express", "Chennai", "Pondicherry", "15:00", "17:50", 1, "LOW", 4.1, 4.0, 4.1, 4.2, "Bala Murugan", rPondy.getId());

        // ----------------------------------------------------
        // ROUTE 8: Chennai <-> Trichy Rockfort Line (330 km)
        // ----------------------------------------------------
        Route rTrichy = new Route();
        rTrichy.setRouteName("Chennai - Trichy Rockfort Line");
        rTrichy.setSource("Chennai");
        rTrichy.setDestination("Trichy");
        rTrichy.setDistanceKm(330.0);
        rTrichy.setEstimatedDurationMinutes(370);
        rTrichy = routeRepository.save(rTrichy);

        addStop(rTrichy, "Koyambedu CMBT", 13.0694, 80.1948, 1, 0, 0);
        addStop(rTrichy, "Villupuram", 11.9401, 79.4861, 2, 160, 185);
        addStop(rTrichy, "Ulundurpettai", 11.7550, 79.3300, 3, 190, 215);
        addStop(rTrichy, "Perambalur", 11.2330, 78.8830, 4, 260, 290);
        addStop(rTrichy, "Trichy Central Bus Stand", 10.7905, 78.7047, 5, 330, 370);

        createBus("TN01-QR-4444", "SETC Deluxe (Rockfort)", "Chennai", "Trichy", "06:15", "12:25", 1, "LOW", 4.4, 4.4, 4.3, 4.5, "Mani Kandan", rTrichy.getId());
        createBus("TN01-ST-5555", "Express", "Chennai", "Trichy", "12:30", "18:40", 2, "MEDIUM", 4.0, 3.9, 4.0, 4.2, "Ganesan P", rTrichy.getId());
        createBus("TN01-UV-6666", "AC Sleeper", "Chennai", "Trichy", "22:00", "04:10", 1, "LOW", 4.8, 4.9, 4.8, 4.8, "Vinoth Kumar", rTrichy.getId());

        // ----------------------------------------------------
        // ROUTE 9: Chennai <-> Vellore <-> Hosur (305 km)
        // ----------------------------------------------------
        Route rHosur = new Route();
        rHosur.setRouteName("Chennai - Vellore - Hosur Highway");
        rHosur.setSource("Chennai");
        rHosur.setDestination("Hosur");
        rHosur.setDistanceKm(305.0);
        rHosur.setEstimatedDurationMinutes(340);
        rHosur = routeRepository.save(rHosur);

        addStop(rHosur, "Koyambedu CMBT", 13.0694, 80.1948, 1, 0, 0);
        addStop(rHosur, "Sriperumbudur", 12.9691, 79.9416, 2, 40, 50);
        addStop(rHosur, "Kanchipuram Bypass", 12.8342, 79.7036, 3, 75, 90);
        addStop(rHosur, "Vellore New Bus Stand", 12.9165, 79.1325, 4, 138, 160);
        addStop(rHosur, "Ambur", 12.7904, 78.7166, 5, 185, 210);
        addStop(rHosur, "Krishnagiri Bus Stand", 12.5186, 78.2137, 6, 255, 290);
        addStop(rHosur, "Hosur Central Bus Stand", 12.7409, 77.8253, 7, 305, 340);

        createBus("TN23-VL-7788", "Express Point-to-Point", "Chennai", "Hosur", "05:45", "11:25", 1, "LOW", 4.3, 4.3, 4.2, 4.4, "Munisamy D", rHosur.getId());
        createBus("TN23-VL-8899", "Ultra Deluxe", "Chennai", "Hosur", "14:15", "19:55", 2, "MEDIUM", 4.5, 4.5, 4.4, 4.6, "Chinnathambi K", rHosur.getId());

        // ----------------------------------------------------
        // ROUTE 10: Salem <-> Coimbatore Kongu Link (165 km)
        // ----------------------------------------------------
        Route rSlmCbe = new Route();
        rSlmCbe.setRouteName("Salem - Coimbatore Kongu Link");
        rSlmCbe.setSource("Salem");
        rSlmCbe.setDestination("Coimbatore");
        rSlmCbe.setDistanceKm(165.0);
        rSlmCbe.setEstimatedDurationMinutes(190);
        rSlmCbe = routeRepository.save(rSlmCbe);

        addStop(rSlmCbe, "Salem Central Bus Stand", 11.6643, 78.1460, 1, 0, 0);
        addStop(rSlmCbe, "Sankari", 11.4880, 77.8680, 2, 40, 45);
        addStop(rSlmCbe, "Bhavani", 11.4503, 77.6835, 3, 60, 70);
        addStop(rSlmCbe, "Erode Bus Stand", 11.3410, 77.7172, 4, 75, 90);
        addStop(rSlmCbe, "Tiruppur Old Bus Stand", 11.1085, 77.3411, 5, 120, 140);
        addStop(rSlmCbe, "Coimbatore Gandhipuram", 11.0168, 76.9558, 6, 165, 190);

        createBus("TN27-SC-7001", "Express Point-to-Point", "Salem", "Coimbatore", "06:30", "09:40", 1, "LOW", 4.3, 4.3, 4.2, 4.3, "Palanisamy K", rSlmCbe.getId());
        createBus("TN27-SC-7002", "Deluxe", "Salem", "Coimbatore", "11:00", "14:10", 2, "MEDIUM", 4.1, 4.0, 4.1, 4.2, "Thangavel M", rSlmCbe.getId());
        createBus("TN27-SC-7003", "Super Fast Non-Stop", "Salem", "Coimbatore", "17:15", "20:25", 1, "LOW", 4.6, 4.6, 4.5, 4.6, "Subbu R", rSlmCbe.getId());

        // ----------------------------------------------------
        // ROUTE 11: Coimbatore <-> Ooty Nilgiris Mountain Line (86 km)
        // ----------------------------------------------------
        Route rOoty = new Route();
        rOoty.setRouteName("Coimbatore - Ooty Nilgiris Mountain Line");
        rOoty.setSource("Coimbatore");
        rOoty.setDestination("Ooty");
        rOoty.setDistanceKm(86.0);
        rOoty.setEstimatedDurationMinutes(180);
        rOoty = routeRepository.save(rOoty);

        addStop(rOoty, "Coimbatore Mettupalayam Road Stand", 11.0168, 76.9558, 1, 0, 0);
        addStop(rOoty, "Mettupalayam", 11.3000, 76.9400, 2, 35, 50);
        addStop(rOoty, "Coonoor Bus Stand", 11.3530, 76.7959, 3, 68, 130);
        addStop(rOoty, "Ooty Central Bus Stand", 11.4102, 76.6950, 4, 86, 180);

        createBus("TN43-OT-3301", "Nilgiris Mountain Rider", "Coimbatore", "Ooty", "06:00", "09:00", 1, "LOW", 4.8, 4.7, 4.8, 4.9, "Ravi Chandran", rOoty.getId());
        createBus("TN43-OT-3302", "Ghat Special Express", "Coimbatore", "Ooty", "12:30", "15:30", 2, "MEDIUM", 4.6, 4.5, 4.6, 4.8, "Francis Xavier", rOoty.getId());

        // ----------------------------------------------------
        // ROUTE 12: Madurai <-> Rameswaram Coastal Corridor (172 km)
        // ----------------------------------------------------
        Route rRam = new Route();
        rRam.setRouteName("Madurai - Rameswaram Coastal Corridor");
        rRam.setSource("Madurai");
        rRam.setDestination("Rameswaram");
        rRam.setDistanceKm(172.0);
        rRam.setEstimatedDurationMinutes(210);
        rRam = routeRepository.save(rRam);

        addStop(rRam, "Madurai Mattuthavani", 9.9252, 78.1198, 1, 0, 0);
        addStop(rRam, "Manamadurai", 9.7042, 78.4485, 2, 48, 60);
        addStop(rRam, "Paramakudi", 9.5447, 78.5900, 3, 82, 100);
        addStop(rRam, "Ramanathapuram New Bus Stand", 9.3639, 78.8395, 4, 118, 145);
        addStop(rRam, "Mandapam (Pamban Bridge)", 9.2789, 79.1235, 5, 153, 185);
        addStop(rRam, "Rameswaram Temple Stand", 9.2876, 79.3129, 6, 172, 210);

        createBus("TN58-RM-4411", "SETC Deluxe (Sethu)", "Madurai", "Rameswaram", "05:30", "09:00", 1, "LOW", 4.7, 4.6, 4.7, 4.8, "Alagarsamy S", rRam.getId());
        createBus("TN58-RM-4422", "Coastal Express", "Madurai", "Rameswaram", "13:00", "16:30", 2, "MEDIUM", 4.4, 4.3, 4.4, 4.5, "Murugesan V", rRam.getId());

        // ----------------------------------------------------
        // ROUTE 13: Trichy <-> Thanjavur Delta Route (58 km)
        // ----------------------------------------------------
        Route rThanjavur = new Route();
        rThanjavur.setRouteName("Trichy - Thanjavur Delta Route");
        rThanjavur.setSource("Trichy");
        rThanjavur.setDestination("Thanjavur");
        rThanjavur.setDistanceKm(58.0);
        rThanjavur.setEstimatedDurationMinutes(75);
        rThanjavur = routeRepository.save(rThanjavur);

        addStop(rThanjavur, "Trichy Central Bus Stand", 10.7905, 78.7047, 1, 0, 0);
        addStop(rThanjavur, "Tiruverumbur BHEL", 10.7760, 78.7750, 2, 14, 20);
        addStop(rThanjavur, "Thuvakudi NIT", 10.7550, 78.8100, 3, 22, 30);
        addStop(rThanjavur, "Budalur", 10.7950, 78.9800, 4, 38, 50);
        addStop(rThanjavur, "Vallam SASTRA", 10.7180, 79.0550, 5, 48, 62);
        addStop(rThanjavur, "Thanjavur Old Bus Stand", 10.7870, 79.1378, 6, 58, 75);

        createBus("TN68-KM-9911", "Delta Point-to-Point", "Trichy", "Thanjavur", "07:00", "08:15", 1, "LOW", 4.5, 4.5, 4.4, 4.6, "Swaminathan G", rThanjavur.getId());
        createBus("TN68-KM-9922", "Ordinary (Chola Queen)", "Trichy", "Thanjavur", "11:30", "12:45", 2, "HIGH", 4.1, 4.0, 4.0, 4.2, "Thangamuthu A", rThanjavur.getId());

        // ----------------------------------------------------
        // ROUTE 14: Madurai <-> Kanyakumari South Link (245 km)
        // ----------------------------------------------------
        Route rMduCape = new Route();
        rMduCape.setRouteName("Madurai - Kanyakumari South Link");
        rMduCape.setSource("Madurai");
        rMduCape.setDestination("Kanyakumari");
        rMduCape.setDistanceKm(245.0);
        rMduCape.setEstimatedDurationMinutes(270);
        rMduCape = routeRepository.save(rMduCape);

        addStop(rMduCape, "Madurai Mattuthavani", 9.9252, 78.1198, 1, 0, 0);
        addStop(rMduCape, "Virudhunagar", 9.5872, 77.9515, 2, 50, 55);
        addStop(rMduCape, "Tirunelveli New Bus Stand", 8.7139, 77.7567, 3, 160, 175);
        addStop(rMduCape, "Nagercoil Central", 8.1833, 77.4119, 4, 225, 245);
        addStop(rMduCape, "Kanyakumari Beach Stand", 8.0883, 77.5385, 5, 245, 270);

        createBus("TN74-KK-5050", "Ultra Deluxe (South Coast)", "Madurai", "Kanyakumari", "06:30", "11:00", 1, "LOW", 4.6, 4.6, 4.5, 4.7, "Chelladurai M", rMduCape.getId());
        createBus("TN74-KK-5051", "Super Fast Express", "Madurai", "Kanyakumari", "14:00", "18:30", 2, "MEDIUM", 4.3, 4.2, 4.3, 4.4, "Mariappan K", rMduCape.getId());

        System.out.println("✅ SmartBus loaded: 14 statewide routes, 42 buses covering all Tamil Nadu regions with real GPS coords!");
    }

    private void addStop(Route route, String name, double lat, double lng, int seq, double distKm, int timeMin) {
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

    private void createBus(String busNum, String type, String src, String dest, String dep, String arr,
                           int stopIdx, String crowd, double rating, double clean, double comf, double safe,
                           String driver, Long routeId) {
        Bus b = new Bus();
        b.setBusNumber(busNum);
        b.setBusType(type);
        b.setSource(src);
        b.setDestination(dest);
        b.setDepartureTime(dep);
        b.setArrivalTime(arr);
        b.setCurrentStopIndex(stopIdx);
        b.setCrowdLevel(crowd);
        b.setRating(rating);
        b.setCleanlinessRating(clean);
        b.setComfortRating(comf);
        b.setSafetyRating(safe);
        b.setDriverName(driver);
        b.setActive(true);
        b.setRouteId(routeId);
        busRepository.save(b);
    }
}
