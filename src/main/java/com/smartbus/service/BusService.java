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
        addLocation("thiruvannamalai", 12.2253, 79.0747, "TN25");
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

        // Additional Transit Towns, Hill Stations & Junctions Across Tamil Nadu
        addLocation("kodaikanal", 10.2381, 77.4892, "TN57");
        addLocation("yercaud", 11.7753, 78.2093, "TN27");
        addLocation("valparai", 10.3262, 76.9554, "TN41");
        addLocation("gopichettipalayam", 11.4554, 77.4338, "TN36");
        addLocation("gobichettipalayam", 11.4554, 77.4338, "TN36");
        addLocation("sathyamangalam", 11.5034, 77.2343, "TN36");
        addLocation("perundurai", 11.2764, 77.5828, "TN33");
        addLocation("kangeyam", 11.0051, 77.5583, "TN42");
        addLocation("dharapuram", 10.7289, 77.5255, "TN42");
        addLocation("udumalaipettai", 10.5847, 77.2472, "TN78");
        addLocation("udumalpet", 10.5847, 77.2472, "TN78");
        addLocation("avadi", 13.1147, 80.1098, "TN12");
        addLocation("ambattur", 13.1143, 80.1548, "TN13");
        addLocation("poonamallee", 13.0487, 80.0937, "TN12");
        addLocation("sholinganallur", 12.9010, 80.2279, "TN14");
        addLocation("kelambakkam", 12.7885, 80.2209, "TN19");
        addLocation("guduvanchery", 12.8439, 80.0597, "TN19");
        addLocation("maraimalainagar", 12.7963, 80.0245, "TN19");
        addLocation("melmaruvathur", 12.4333, 79.8333, "TN19");
        addLocation("madurantakam", 12.5097, 79.8856, "TN19");
        addLocation("manapparai", 10.6074, 78.4140, "TN45");
        addLocation("musiri", 10.9416, 78.4556, "TN48");
        addLocation("thuraiyur", 11.1444, 78.5960, "TN48");
        addLocation("kulithalai", 10.9333, 78.4167, "TN47");
        addLocation("rasipuram", 11.4589, 78.1697, "TN28");
        addLocation("tiruchengode", 11.3808, 77.8966, "TN34");
        addLocation("paramathi", 11.1167, 77.9833, "TN88");
        addLocation("velur", 11.0500, 78.0167, "TN88");
        addLocation("omallur", 11.7400, 78.0400, "TN30");
        addLocation("mettur", 11.7967, 77.8010, "TN30");
        addLocation("harur", 12.0600, 78.4900, "TN29");
        addLocation("palacode", 12.3000, 78.0800, "TN29");
        addLocation("pennagaram", 12.1300, 77.9000, "TN29");
        addLocation("pochampalli", 12.3300, 78.3700, "TN24");
        addLocation("bargur", 12.5500, 78.3600, "TN24");
        addLocation("uthangarai", 12.2600, 78.5300, "TN24");
        addLocation("vaniyambadi", 12.6825, 78.6186, "TN83");
        addLocation("gudiyatham", 12.9461, 78.8711, "TN23");
        addLocation("arani", 12.6710, 79.2840, "TN25");
        addLocation("arcot", 12.9042, 79.3333, "TN73");
        addLocation("sholinghur", 13.1111, 79.4244, "TN73");
        addLocation("walajapet", 12.9272, 79.3564, "TN73");
        addLocation("sirkazhi", 11.2389, 79.7333, "TN82");
        addLocation("tarangambadi", 11.0333, 79.8500, "TN82");
        addLocation("tranquebar", 11.0333, 79.8500, "TN82");
        addLocation("velankanni", 10.6800, 79.8500, "TN51");
        addLocation("veda-ranyam", 10.3700, 79.8500, "TN51");
        addLocation("vedaranyam", 10.3700, 79.8500, "TN51");
        addLocation("thiruthuraipoondi", 10.5333, 79.6500, "TN50");
        addLocation("mannargudi", 10.6667, 79.4500, "TN50");
        addLocation("pattukkottai", 10.4333, 79.3167, "TN49");
        addLocation("peravurani", 10.2833, 79.2167, "TN49");
        addLocation("aranthangi", 10.1667, 78.9833, "TN55");
        addLocation("illuppur", 10.5167, 78.6333, "TN55");
        addLocation("karaikudi", 10.0667, 78.7833, "TN63");
        addLocation("devakottai", 9.9500, 78.8167, "TN63");
        addLocation("kalayar-kovil", 9.8500, 78.6500, "TN63");
        addLocation("usilampatti", 9.9667, 77.7833, "TN58");
        addLocation("thirumangalam", 9.8242, 77.9869, "TN58");
        addLocation("melur", 10.0333, 78.3333, "TN59");
        addLocation("sholavandan", 10.0167, 78.0167, "TN58");
        addLocation("vadipatti", 10.0833, 77.9667, "TN58");
        addLocation("bodi", 10.0100, 77.3500, "TN60");
        addLocation("bodinayakanur", 10.0100, 77.3500, "TN60");
        addLocation("periyakulam", 10.1167, 77.5500, "TN60");
        addLocation("cumbum", 9.7333, 77.2833, "TN60");
        addLocation("chinnamanur", 9.8333, 77.3833, "TN60");
        addLocation("andipatti", 9.9667, 77.6167, "TN60");
        addLocation("nilakottai", 10.1667, 77.8667, "TN57");
        addLocation("natham", 10.2333, 78.2333, "TN57");
        addLocation("vedasandur", 10.5333, 77.9500, "TN57");
        addLocation("oddanchatram", 10.4833, 77.7500, "TN57");
        addLocation("aruppukkottai", 9.5167, 78.1000, "TN67");
        addLocation("srivilliputhur", 9.5167, 77.6333, "TN84");
        addLocation("srivilliputtur", 9.5167, 77.6333, "TN84");
        addLocation("rajapalayam", 9.4500, 77.5500, "TN84");
        addLocation("sattur", 9.3667, 77.9167, "TN67");
        addLocation("kallidaikurichi", 8.6833, 77.4667, "TN72");
        addLocation("ambasamudram", 8.7000, 77.4500, "TN72");
        addLocation("cheranmahadevi", 8.6833, 77.5667, "TN72");
        addLocation("sankarankovil", 9.1667, 77.5333, "TN76");
        addLocation("sankarankoil", 9.1667, 77.5333, "TN76");
        addLocation("kadayanallur", 9.0833, 77.3500, "TN76");
        addLocation("puliyangudi", 9.1667, 77.4000, "TN76");
        addLocation("surandai", 8.9833, 77.4333, "TN76");
        addLocation("alangulam", 8.8833, 77.5000, "TN76");
        addLocation("shenkottai", 8.9833, 77.2500, "TN76");
        addLocation("courtallam", 8.9333, 77.2667, "TN76");
        addLocation("kutralam", 8.9333, 77.2667, "TN76");
        addLocation("tiruchendur", 8.4833, 78.1167, "TN92");
        addLocation("thiruchendur", 8.4833, 78.1167, "TN92");
        addLocation("kayalpattinam", 8.5667, 78.1333, "TN92");
        addLocation("arumbavur", 11.3833, 78.7333, "TN46");
        addLocation("kunnam", 11.2333, 79.0167, "TN46");
        addLocation("veppanthattai", 11.3167, 78.8333, "TN46");
        addLocation("jayankondam", 11.2167, 79.3000, "TN61");
        addLocation("sendurai", 11.2667, 79.1667, "TN61");
        addLocation("udayar-palayam", 11.1833, 79.3000, "TN61");
        addLocation("udayarpalayam", 11.1833, 79.3000, "TN61");
        addLocation("thirumayam", 10.2500, 78.7500, "TN55");
        addLocation("alangudi", 10.3667, 78.9833, "TN55");
        addLocation("karambakkudi", 10.4500, 79.0667, "TN55");
        addLocation("ponnamaravathi", 10.3333, 78.5333, "TN55");
        addLocation("gandharvakottai", 10.5833, 79.0167, "TN55");
        addLocation("thiruvaiyaru", 10.8833, 79.1000, "TN49");
        addLocation("orathanadu", 10.6333, 79.2500, "TN49");
        addLocation("papanasam", 10.9333, 79.2833, "TN68");
        addLocation("swamimalai", 10.9500, 79.3333, "TN68");
        addLocation("nannilam", 10.8833, 79.6167, "TN50");
        addLocation("kodavasal", 10.8667, 79.4833, "TN50");
        addLocation("valangaiman", 10.9000, 79.4000, "TN50");
        addLocation("needamangalam", 10.7667, 79.4167, "TN50");
        addLocation("kilvelur", 10.7333, 79.7333, "TN51");
        addLocation("thirukkuvalai", 10.5833, 79.7333, "TN51");
        addLocation("poombuhar", 11.1500, 79.8500, "TN82");
        addLocation("kuttalam", 11.1167, 79.5667, "TN82");
        addLocation("thirumullaivasal", 11.2500, 79.8333, "TN82");
        addLocation("thittakudi", 11.4167, 78.9667, "TN31");
        addLocation("kattumannarkoil", 11.2667, 79.5500, "TN31");
        addLocation("kurinjipadi", 11.5667, 79.6000, "TN31");
        addLocation("sankarapuram", 11.8833, 78.9167, "TN15");
        addLocation("chinna-salem", 11.6500, 78.8833, "TN15");
        addLocation("chinnasalem", 11.6500, 78.8833, "TN15");
        addLocation("kalrayan", 11.8500, 78.7500, "TN15");
        addLocation("tirukoilur", 11.9667, 79.2000, "TN15");
        addLocation("thirukoilur", 11.9667, 79.2000, "TN15");
        addLocation("thirukovilur", 11.9667, 79.2000, "TN15");
        addLocation("chettypalayam", 10.9167, 77.0333, "TN38");
        addLocation("sulur", 11.0333, 77.1333, "TN38");
        addLocation("kinathukadavu", 10.8167, 77.0167, "TN41");
        addLocation("annur", 11.2333, 77.1833, "TN38");
        addLocation("karamadai", 11.2500, 76.9667, "TN40");
        addLocation("sirumugai", 11.3167, 77.0000, "TN40");
        addLocation("avanshi", 11.1833, 77.2667, "TN39");
        addLocation("avinashi", 11.1833, 77.2667, "TN39");
        addLocation("palladam", 11.0000, 77.2833, "TN42");
        addLocation("madathukulam", 10.5667, 77.3833, "TN78");
        addLocation("vellakoil", 11.0500, 77.7167, "TN42");
        addLocation("kodumudi", 11.0833, 77.8833, "TN33");
        addLocation("anthiyur", 11.5833, 77.6000, "TN33");
        addLocation("kavindapadi", 11.4333, 77.5500, "TN33");
        addLocation("modakkurichi", 11.2667, 77.7500, "TN33");
        addLocation("arachalur", 11.1667, 77.7000, "TN33");
        addLocation("chennimalai", 11.1667, 77.6167, "TN33");
        addLocation("jalakandapuram", 11.7000, 77.8833, "TN30");
        addLocation("tharamangalam", 11.7000, 78.0000, "TN30");
        addLocation("mecheri", 11.8333, 77.9500, "TN30");
        addLocation("nangavalli", 11.7500, 77.8833, "TN30");
        addLocation("kolathur", 11.9167, 77.7833, "TN30");
        addLocation("edappadi", 11.6000, 77.8500, "TN30");
        addLocation("idappadi", 11.6000, 77.8500, "TN30");
        addLocation("konganapuram", 11.5833, 77.9167, "TN30");
        addLocation("valapadi", 11.6500, 78.4167, "TN77");
        addLocation("thalaivasal", 11.5833, 78.7500, "TN77");
        addLocation("gangavalli", 11.4833, 78.6500, "TN77");
        addLocation("thammampatti", 11.4333, 78.5000, "TN77");
        addLocation("ayothiyapattinam", 11.6667, 78.2500, "TN27");
        addLocation("karipatti", 11.6500, 78.3333, "TN27");
        addLocation("sendamangalam", 11.2833, 78.2500, "TN28");
        addLocation("kollihills", 11.2500, 78.3333, "TN28");
        addLocation("kolli hills", 11.2500, 78.3333, "TN28");
        addLocation("mohanur", 11.0500, 78.1500, "TN28");
        addLocation("erumaipatti", 11.1500, 78.2833, "TN28");
        addLocation("kabilarmalai", 11.1167, 77.9667, "TN88");
        addLocation("pandamangalam", 11.1167, 78.0167, "TN88");
        addLocation("pothanur", 11.0667, 78.0500, "TN88");
        addLocation("aravakurichi", 10.7667, 77.9167, "TN47");
        addLocation("pallapatti", 10.7500, 77.8833, "TN47");
        addLocation("k-paramathi", 10.9500, 77.9167, "TN47");
        addLocation("pugalur", 11.0833, 78.0000, "TN47");
        addLocation("tholcopier", 10.9667, 78.1333, "TN47");
        addLocation("velayuthampalayam", 11.0667, 78.0000, "TN47");
        addLocation("kotagiri", 11.4333, 76.8833, "TN43");
        addLocation("gudalur", 11.5000, 76.5000, "TN43");
        addLocation("pandalur", 11.4833, 76.3833, "TN43");
        addLocation("kundah", 11.2833, 76.6833, "TN43");
        addLocation("masinagudi", 11.5667, 76.6500, "TN43");
        addLocation("mudumalai", 11.5833, 76.5833, "TN43");
        addLocation("thiruvadanai", 9.7833, 78.9167, "TN65");
        addLocation("rs-mangalam", 9.6833, 78.8500, "TN65");
        addLocation("mudukulathur", 9.3333, 78.5167, "TN65");
        addLocation("kamuthi", 9.4000, 78.3667, "TN65");
        addLocation("kadalaadi", 9.2333, 78.5000, "TN65");
        addLocation("kilakarai", 9.2333, 78.7833, "TN65");
        addLocation("keelakarai", 9.2333, 78.7833, "TN65");
        addLocation("erwadi", 9.2167, 78.7167, "TN65");
        addLocation("sayalkudi", 9.1833, 78.3667, "TN65");
        addLocation("kariapatti", 9.6667, 78.1000, "TN67");
        addLocation("mallankinaru", 9.6333, 77.9833, "TN67");
        addLocation("tiruchuli", 9.5333, 78.2000, "TN67");
        addLocation("watrap", 9.6333, 77.6333, "TN84");
        addLocation("seithur", 9.4167, 77.4833, "TN84");
        addLocation("elanji", 8.9500, 77.2833, "TN76");
        addLocation("ayikudi", 8.9833, 77.3333, "TN76");
        addLocation("sambavarvadakarai", 9.0167, 77.3667, "TN76");
        addLocation("panpoli", 8.9833, 77.2667, "TN76");
        addLocation("achankovil", 9.0667, 77.1500, "TN76");
        addLocation("veeravanallur", 8.6833, 77.5167, "TN72");
        addLocation("mukkudal", 8.7333, 77.5167, "TN72");
        addLocation("kalakkad", 8.5167, 77.5500, "TN72");
        addLocation("nanguneri", 8.4833, 77.6500, "TN72");
        addLocation("radhapuram", 8.3000, 77.6833, "TN72");
        addLocation("thisayanvilai", 8.3333, 77.8667, "TN72");
        addLocation("udangudi", 8.4333, 78.0333, "TN92");
        addLocation("sathankulam", 8.4500, 77.9167, "TN92");
        addLocation("srivaikuntam", 8.6167, 77.9167, "TN69");
        addLocation("alwarthirunagari", 8.6000, 77.9500, "TN69");
        addLocation("erall", 8.6333, 78.0167, "TN69");
        addLocation("authoor", 8.5833, 78.0667, "TN92");
        addLocation("kudankulam", 8.1667, 77.7000, "TN72");
        addLocation("chettikulam", 8.2167, 77.6500, "TN72");
        addLocation("suchindram", 8.1500, 77.4667, "TN74");
        addLocation("thuckalay", 8.2500, 77.3167, "TN75");
        addLocation("marthandam", 8.3000, 77.2167, "TN75");
        addLocation("kuzhithurai", 8.3167, 77.1833, "TN75");
        addLocation("kaliyakkavilai", 8.3333, 77.1500, "TN75");
        addLocation("colachel", 8.1833, 77.2500, "TN75");
        addLocation("karungal", 8.2167, 77.2333, "TN75");
        addLocation("kulasekharam", 8.3667, 77.3000, "TN75");
        addLocation("padmanabhapuram", 8.2500, 77.3333, "TN75");
        addLocation("eriel", 8.2000, 77.3500, "TN75");
        addLocation("asambu", 8.2833, 77.4333, "TN74");
        addLocation("boothapandi", 8.2667, 77.4500, "TN74");
        addLocation("aranthangi", 10.1667, 78.9833, "TN55");
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
        // Remove common prefixes/suffixes
        c = c.replaceAll("\\b(city|town|central|bus stand|stand|junction|jn)\\b", "").trim();

        // Thiruvannamalai variations
        if (c.equals("thiruvannamalai") || c.equals("tiruvannamalai") || c.equals("tvm") || c.equals("thiruvannaamalai") || c.equals("tiruvannaamalai")) return "tiruvannamalai";
        // Chennai / Madras
        if (c.equals("madras") || c.equals("chennai") || c.equals("ms")) return "chennai";
        // Coimbatore / Kovai
        if (c.equals("kovai") || c.equals("coimbatore") || c.equals("cbe")) return "coimbatore";
        // Tirunelveli / Nellai
        if (c.equals("nellai") || c.equals("tirunelveli") || c.equals("thirunelveli")) return "tirunelveli";
        // Tiruvallur / Thiruvallur
        if (c.equals("thiruvallur") || c.equals("tiruvallur")) return "tiruvallur";
        // Tiruppur / Thiruppur
        if (c.equals("thiruppur") || c.equals("tiruppur") || c.equals("tirupur") || c.equals("thirupur")) return "tiruppur";
        // Tirupathur / Thirupathur
        if (c.equals("thirupathur") || c.equals("tirupathur") || c.equals("thirupattur") || c.equals("tirupattur")) return "tirupathur";
        // Tiruttani / Thiruttani
        if (c.equals("thiruttani") || c.equals("tiruttani")) return "tiruttani";
        // Tiruvarur / Thiruvarur
        if (c.equals("thiruvarur") || c.equals("tiruvarur")) return "tiruvarur";
        // Thanjavur / Tanjore
        if (c.equals("tanjore") || c.equals("thanjavur") || c.equals("tanjavur")) return "thanjavur";
        // Trichy / Tiruchirappalli
        if (c.equals("trichy") || c.equals("tiruchirappalli") || c.equals("tiruchirapalli") || c.equals("thiruchirapalli") || c.equals("thiruchirappalli")) return "trichy";
        // Kanchipuram / Kanchi
        if (c.equals("kanchi") || c.equals("kanchipuram") || c.equals("kanjeevaram")) return "kanchipuram";
        // Pondicherry / Puducherry
        if (c.equals("pondy") || c.equals("puducherry") || c.equals("pondicherry")) return "pondicherry";
        // Kanyakumari / Cape
        if (c.equals("cape") || c.equals("kanyakumari") || c.equals("kumari")) return "kanyakumari";
        // Ooty / Udhagamandalam
        if (c.equals("ootacamund") || c.equals("udhagamandalam") || c.equals("ooty") || c.equals("udhagai")) return "ooty";
        // Thoothukudi / Tuticorin
        if (c.equals("tuticorin") || c.equals("thoothukudi") || c.equals("tuticorin port")) return "thoothukudi";
        // Kumbakonam / Kudanthai
        if (c.equals("kumbakonam") || c.equals("kudanthai")) return "kumbakonam";
        // Villupuram / Viluppuram
        if (c.equals("villupuram") || c.equals("viluppuram")) return "villupuram";
        // Virudhunagar / Virudhunagar town
        if (c.equals("virudhunagar") || c.equals("virudunagar")) return "virudhunagar";
        // Ramanathapuram / Ramnad
        if (c.equals("ramnad") || c.equals("ramanathapuram")) return "ramanathapuram";
        // Gingee / Senji
        if (c.equals("gingee") || c.equals("senji") || c.equals("jinji")) return "gingee";
        // Vridhachalam / Virudhachalam
        if (c.equals("vridhachalam") || c.equals("virudhachalam") || c.equals("vriddhachalam")) return "vridhachalam";
        // Chengalpattu / Chenglepet
        if (c.equals("chenglepet") || c.equals("chengalpet") || c.equals("chengalpattu")) return "chengalpattu";

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

            // Generate realistic stops using real Tamil Nadu transit towns along the corridor
            // Stop 1: Origin Bus Stand
            createStop(route, fromCap + " Central Bus Stand", c1[0], c1[1], 1, 0.0, 0);

            // Find real transit towns between c1 and c2 along the highway corridor
            List<Map.Entry<String, double[]>> corridorTowns = new ArrayList<>();
            double lineDx = c2[1] - c1[1];
            double lineDy = c2[0] - c1[0];
            double lineLenSq = lineDx * lineDx + lineDy * lineDy;

            if (lineLenSq > 0.0001) {
                for (Map.Entry<String, double[]> town : TN_COORDINATES.entrySet()) {
                    String tName = town.getKey();
                    // Skip origin and destination towns
                    if (tName.equalsIgnoreCase(searchFrom) || tName.equalsIgnoreCase(searchTo) ||
                        tName.equalsIgnoreCase(fromCap) || tName.equalsIgnoreCase(toCap)) continue;

                    double[] tCoord = town.getValue();
                    // Projection t along the segment [0, 1]
                    double t = ((tCoord[0] - c1[0]) * lineDy + (tCoord[1] - c1[1]) * lineDx) / lineLenSq;
                    if (t >= 0.15 && t <= 0.85) {
                        // Perpendicular distance in degrees
                        double projLat = c1[0] + t * lineDy;
                        double projLng = c1[1] + t * lineDx;
                        double perpDist = Math.sqrt(Math.pow(tCoord[0] - projLat, 2) + Math.pow(tCoord[1] - projLng, 2));
                        if (perpDist <= 0.45) { // within ~45km corridor
                            corridorTowns.add(town);
                        }
                    }
                }
            }

            // Sort corridor towns by distance along the route (from c1 to c2)
            corridorTowns.sort((a, b) -> {
                double ta = ((a.getValue()[0] - c1[0]) * lineDy + (a.getValue()[1] - c1[1]) * lineDx);
                double tb = ((b.getValue()[0] - c1[0]) * lineDy + (b.getValue()[1] - c1[1]) * lineDx);
                return Double.compare(ta, tb);
            });

            // If we found real corridor towns, pick 2-3 well-spaced towns
            int stopSeq = 2;
            Set<String> addedNames = new HashSet<>();
            if (!corridorTowns.isEmpty()) {
                // Select up to 3 intermediate towns
                int step = Math.max(1, corridorTowns.size() / 3);
                for (int k = 0; k < corridorTowns.size() && stopSeq <= 4; k += step) {
                    Map.Entry<String, double[]> town = corridorTowns.get(k);
                    String townName = capitalize(town.getKey());
                    if (addedNames.add(townName)) {
                        double[] tc = town.getValue();
                        double dFromSrc = calculateDistanceKm(c1[0], c1[1], tc[0], tc[1]);
                        int tFromSrc = (int) Math.round((dFromSrc / Math.max(distKm, 1.0)) * durationMin);
                        createStop(route, townName + " Bus Stand", tc[0], tc[1], stopSeq++, dFromSrc, tFromSrc);
                    }
                }
            }

            // If no intermediate towns or only 1 found, add proportional intermediate corridor waypoints
            if (stopSeq == 2) {
                double latMid1 = c1[0] + (c2[0] - c1[0]) * 0.35;
                double lngMid1 = c1[1] + (c2[1] - c1[1]) * 0.35;
                createStop(route, fromCap + " Highway Tollway", latMid1, lngMid1, stopSeq++,
                        Math.round(distKm * 0.35 * 10.0) / 10.0, (int) Math.round(durationMin * 0.35));
            }
            if (stopSeq == 3) {
                double latMid2 = c1[0] + (c2[0] - c1[0]) * 0.70;
                double lngMid2 = c1[1] + (c2[1] - c1[1]) * 0.70;
                createStop(route, toCap + " Ring Junction", latMid2, lngMid2, stopSeq++,
                        Math.round(distKm * 0.70 * 10.0) / 10.0, (int) Math.round(durationMin * 0.70));
            }

            // Final Stop: Destination Bus Stand
            createStop(route, toCap + " Central Bus Stand", c2[0], c2[1], stopSeq, distKm, durationMin);

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
        if (norm.isEmpty()) {
            return new double[]{13.0827, 80.2707}; // default Chennai
        }

        // 1. Exact or substring match
        for (Map.Entry<String, double[]> entry : TN_COORDINATES.entrySet()) {
            String key = entry.getKey();
            if (norm.equals(key) || norm.contains(key) || key.contains(norm)) {
                return entry.getValue();
            }
        }

        // 2. Tokenized word matching (e.g. "North Tiruvannamalai" -> matches "tiruvannamalai")
        String[] tokens = norm.split("[\\s,-]+");
        for (String token : tokens) {
            if (token.length() >= 4) {
                for (Map.Entry<String, double[]> entry : TN_COORDINATES.entrySet()) {
                    if (entry.getKey().contains(token) || token.contains(entry.getKey())) {
                        return entry.getValue();
                    }
                }
            }
        }

        // 3. Closest Prefix / Edit-distance match (handles typos e.g. "thiruvannamlai" or "coimbatre")
        String closestMatch = null;
        int minDistance = Integer.MAX_VALUE;
        for (String candidate : TN_COORDINATES.keySet()) {
            if (Math.abs(candidate.length() - norm.length()) <= 3) {
                int dist = computeLevenshteinDistance(norm, candidate);
                if (dist < minDistance && dist <= 2) {
                    minDistance = dist;
                    closestMatch = candidate;
                }
            }
        }
        if (closestMatch != null) {
            return TN_COORDINATES.get(closestMatch);
        }

        // Fallback: Deterministic coordinate within Tamil Nadu bounds (lat 8.5 to 13.0, lng 76.5 to 80.2)
        int hash = Math.abs(norm.hashCode());
        double lat = 9.0 + (hash % 380) / 100.0;
        double lng = 77.0 + ((hash / 380) % 280) / 100.0;
        return new double[]{lat, lng};
    }

    private int computeLevenshteinDistance(String s1, String s2) {
        int[] costs = new int[s2.length() + 1];
        for (int j = 0; j < costs.length; j++) costs[j] = j;
        for (int i = 1; i <= s1.length(); i++) {
            costs[0] = i;
            int nw = i - 1;
            for (int j = 1; j <= s2.length(); j++) {
                int cj = Math.min(1 + Math.min(costs[j], costs[j - 1]),
                        s1.charAt(i - 1) == s2.charAt(j - 1) ? nw : nw + 1);
                nw = costs[j];
                costs[j] = cj;
            }
        }
        return costs[s2.length()];
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
