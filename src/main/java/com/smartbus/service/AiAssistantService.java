package com.smartbus.service;

import com.smartbus.dto.BusSearchResult;
import com.smartbus.repository.BusRepository;
import com.smartbus.repository.RouteRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
public class AiAssistantService {

    @Autowired
    private BusService busService;

    @Autowired
    private RouteRepository routeRepository;

    @Autowired
    private BusRepository busRepository;

    @Autowired
    private FareCalculationService fareCalculationService;

    // Comprehensive list of 150+ Tamil Nadu cities, towns, and taluk hubs
    private static final List<String> TN_ALL_TOWNS = Arrays.asList(
        "chennai", "gingee", "senji", "tindivanam", "villupuram", "salem", "coimbatore", "madurai",
        "trichy", "tirunelveli", "kanyakumari", "nagercoil", "ooty", "pondicherry", "puducherry",
        "vellore", "thanjavur", "erode", "dindigul", "rameswaram", "hosur", "tiruppur",
        "tambaram", "chengalpattu", "kanchipuram", "tiruvallur", "arakkonam", "tiruttani",
        "ranipet", "arcot", "walajapet", "ambur", "vaniyambadi", "tirupathur", "jolarpet",
        "arani", "cheyyar", "polur", "vandavasi", "tiruvannamalai", "sriperumbudur", "mahabalipuram",
        "dharmapuri", "harur", "palacode", "krishnagiri", "denkanikottai", "attur", "omallur",
        "sankari", "namakkal", "rasipuram", "tiruchengode", "bhavani", "gobichettipalayam",
        "sathyamangalam", "perundurai", "pollachi", "mettupalayam", "valparai", "coonoor", "kotagiri",
        "gudalur", "karur", "kulithalai", "perambalur", "ariyalur", "jayankondam", "pudukkottai",
        "aranthangi", "kumbakonam", "pattukkottai", "tiruvarur", "mannargudi", "nagapattinam",
        "velankanni", "mayiladuthurai", "sirkazhi", "cuddalore", "panruti", "neyveli", "vridhachalam",
        "virudhachalam", "chidambaram", "kallakurichi", "ulundurpettai", "vikravandi",
        "palani", "kodaikanal", "theni", "periyakulam", "bodinayakanur", "cumbum", "virudhunagar",
        "sivakasi", "sattur", "aruppukkottai", "srivilliputhur", "rajapalayam", "ramanathapuram",
        "paramakudi", "mandapam", "sivaganga", "karaikudi", "devakottai", "manamadurai",
        "tenkasi", "shenkottai", "kadayanallur", "puliyangudi", "sankarankovil", "thoothukudi",
        "kovilpatti", "tiruchendur", "valliyur", "colachel", "marthandam", "kuzhithurai"
    );

    public Map<String, Object> askAssistant(String query, String language) {
        if (query == null || query.trim().isEmpty()) {
            return buildResponse(
                "Hello! I am **SmartBus AI**, your 24x7 intelligent transit assistant across Tamil Nadu. How can I help your journey today?",
                "Hello! I am SmartBus AI. How can I help your travel today?",
                Arrays.asList("How to use this app?", "Buses from Chennai to Gingee", "Check ticket fares", "How Stop Guardian works"),
                null
            );
        }

        String q = query.toLowerCase().trim();
        boolean isTamil = "ta".equalsIgnoreCase(language) || containsTamil(query);

        // =========================================================================
        // 1. DYNAMIC ROUTE EXTRACTION VIA NLP REGEX (e.g. "bus from chennai to gingee")
        // =========================================================================
        String[] routePair = extractOriginAndDestination(q);
        if (routePair != null && routePair[0] != null && routePair[1] != null) {
            String from = routePair[0];
            String to = routePair[1];

            if (!from.equalsIgnoreCase(to)) {
                return handleRouteSearchResponse(from, to, isTamil);
            }
        }

        // =========================================================================
        // 2. APP USAGE GUIDE / TUTORIAL ("how i use this app", "guide", "help")
        // =========================================================================
        if (q.contains("use this app") || q.contains("how to use") || q.contains("how i use") ||
            q.contains("how do i use") || q.contains("what is this app") || q.contains("how does it work") ||
            q.contains("help me use") || q.contains("features") || q.contains("app guide") ||
            q.contains("எப்படி பயன்படுத்துவது") || q.contains("பயன்படுத்துவது எப்படி") || q.contains("வழிகாட்டி")) {
            
            if (isTamil) {
                return buildResponse(
                    "🚌 **SmartBus செயலியை எவ்வாறு பயன்படுத்துவது (முழுமையான வழிகாட்டி):**\n\n" +
                    "1. 🔍 **பஸ் தேட (Find Buses):**\n" +
                    "   • முகப்பு திரையில் புறப்படும் இடம் (From) மற்றும் சேரும் இடத்தை (To) உள்ளிடவும்.\n" +
                    "   • **Find Buses** பொத்தானைத் தட்டினால் தமிழ்நாடு முழுவதும் இயங்கும் அனைத்து பஸ்களும் வரும்.\n\n" +
                    "2. 📍 **நேரலை கூகுள் மேப் (Live Map Radar):**\n" +
                    "   • பஸ்சை தேர்ந்தெடுத்து, அது தற்போது எந்த ஊரில் செல்கிறது, அடுத்த ஸ்டாப் என்ன என்பதை நேரலையாக மேப்பில் பார்க்கலாம்.\n\n" +
                    "3. 🔔 **ஸ்டாப் கார்டியன் (இறங்கும் இடம் தவறாமல் இருக்க):**\n" +
                    "   • தூங்கினாலும் கவலையில்லை! உங்கள் ஊர் வருவதற்கு **10 நிமிடம், 5 நிமிடம் மற்றும் 1 நிமிடத்திற்கு முன்** செயலி சத்தமான அலாரம் மற்றும் குரல் மூலம் விழிப்பூட்டும்!\n\n" +
                    "4. 💰 **கட்டண கால்குலேட்டர் (Fare Calculator):**\n" +
                    "   • அரசு கட்டணங்களை உடனே கணக்கிடலாம். மூத்த குடிமக்களுக்கு 50% கட்டண சலுகை உண்டு.\n\n" +
                    "5. 🎤 **குரல் வழி தேடல் (Voice Input):**\n" +
                    "   • தட்டச்சு செய்யத் தெரியாதவர்கள் கீழே உள்ள **🎤 மைக்ரோஃபோன்** பொத்தானைத் தட்டி தமிழில் பேசலாம்!\n\n" +
                    "6. 🚨 **அவசர உதவி (Emergency SOS):**\n" +
                    "   • மேலே உள்ள **🚨 SOS** பொத்தானைத் தட்டினால் போலீஸ் சைரன் ஒலிக்கும், 112 / 108 அவசர எண்களை 1-டேப்பில் அழைக்கலாம்.",
                    "SmartBus செயலியில் நீங்கள் பஸ் தேடலாம், வரைபடத்தில் கண்காணிக்கலாம், மற்றும் ஸ்டாப் கார்டியன் அலாரம் மூலம் இறங்கும் இடத்தை தவறாமல் அடையலாம்.",
                    Arrays.asList("பஸ் தேட செல்ல", "ஸ்டாப் கார்டியன் உதவி", "கட்டணம் பார்க்க", "அவசர எண்கள்"),
                    "action_guide"
                );
            } else {
                return buildResponse(
                    "🚌 **Welcome to SmartBus! Here is how to use the app in 6 easy steps:**\n\n" +
                    "1. 🔍 **Search Buses (Any Town in Tamil Nadu):**\n" +
                    "   • Enter your **From** and **To** town (e.g. *Chennai to Gingee, Salem to Trichy, Coimbatore to Madurai*).\n" +
                    "   • Tap **Find Buses** to see active TNSTC/SETC buses with departure times, live ratings, and crowd levels.\n\n" +
                    "2. 📍 **Live Bus Tracking & Google Map Radar:**\n" +
                    "   • Tap **Select This Bus** on any card to open the live journey view.\n" +
                    "   • See the bus moving on the real Google Map with current stop, next stop, and exact ETA.\n\n" +
                    "3. 🔔 **Stop Guardian (Never Miss Your Stop!):**\n" +
                    "   • On your journey, tap **Enable Stop Guardian**.\n" +
                    "   • You can sleep peacefully! The app alerts you **10 min**, **5 min**, and **1 min** before your stop with sound & vibration.\n" +
                    "   • If you ever miss your stop, it immediately shows the return bus back!\n\n" +
                    "4. 💰 **Fare Calculator & Senior Pass:**\n" +
                    "   • Tap **Fare Calculator** to compute exact government fares across all bus classes (Ordinary, Express, Deluxe, AC Sleeper).\n" +
                    "   • Senior citizens (60+) get an automatic **50% concession**.\n\n" +
                    "5. 🎤 **Voice Assistant (For Elderly & Non-Typing Passengers):**\n" +
                    "   • Tap the **🎤 Microphone** button below in this chat to speak your question in English or Tamil—no typing needed!\n\n" +
                    "6. 🚨 **Emergency SOS & Police Siren:**\n" +
                    "   • Tap the red **🚨 SOS** button in the header for an audible police wail and 1-tap dials to 112, 108, and 1091.",
                    "Welcome to SmartBus. You can find buses across Tamil Nadu, track them live on Google Maps, and use Stop Guardian sleep alerts so you never miss your stop.",
                    Arrays.asList("Search Buses Now", "How Stop Guardian Works", "Calculate Fares", "Emergency SOS Help"),
                    "action_guide"
                );
            }
        }

        // =========================================================================
        // 3. GREETINGS & CASUAL CONVERSATION ("hi", "hello", "how are you", "who are you")
        // =========================================================================
        if (q.matches("^(hi|hello|hey|vanakkam|வணக்கம்|hola).*") || q.equals("hi") || q.equals("hello")) {
            if (isTamil) {
                return buildResponse(
                    "வணக்கம்! நான் **SmartBus AI** - உங்கள் தமிழ்நாடு பயண வழிகாட்டி. தமிழ்நாடு முழுவதும் இயங்கும் பஸ்கள், புறப்படும் நேரங்கள், கட்டணம், அல்லது இறங்கும் இடத்தை விழிப்பூட்டும் ஸ்டாப் கார்டியன் பற்றி எதையும் கேட்கலாம். கீழே உள்ள **🎤 மைக்ரோஃபோனைத்** தட்டி பேசவும் செய்யலாம்!",
                    "வணக்கம்! நான் SmartBus AI. உங்கள் பயணத்திற்கு நான் எவ்வாறு உதவ வேண்டும்?",
                    Arrays.asList("செயலியை எப்படி பயன்படுத்துவது?", "பஸ் தேட", "கட்டணம் பார்க்க", "ஸ்டாப் கார்டியன்"),
                    null
                );
            } else {
                return buildResponse(
                    "Hello! I am **SmartBus AI**, your intelligent transit assistant for rural and intercity travel across Tamil Nadu.\n\n" +
                    "You can ask me about bus schedules between any towns (e.g. *Chennai to Gingee*), government fares, or tap the **🎤 Microphone** below to speak your destination!",
                    "Hello! I am SmartBus AI. How can I assist your travel today?",
                    Arrays.asList("How to use this app?", "Search Buses", "Calculate Fares", "How Stop Guardian works"),
                    null
                );
            }
        }

        if (q.contains("who are you") || q.contains("what are you") || q.contains("your name") || q.contains("யாரு")) {
            return buildResponse(
                "I am **SmartBus AI**, an AI transit assistant created for Tamil Nadu bus passengers. I help travellers with:\n\n" +
                "• Live bus schedules between ANY towns in Tamil Nadu\n" +
                "• Real-time GPS tracking on Google Maps\n" +
                "• Stop Guardian destination sleep alarms\n" +
                "• Government TNSTC / SETC fare calculations & senior citizen pass discounts\n" +
                "• Voice recognition for elderly passengers who prefer speaking over typing!",
                "I am SmartBus AI, an intelligent passenger assistant built for Tamil Nadu state bus travel.",
                Arrays.asList("How to use this app?", "Search bus route", "Calculate Fare", "Stop Guardian"),
                null
            );
        }

        // =========================================================================
        // 4. WOMEN FREE TRAVEL / VIDIYAL PAYANAM / CONCESSIONS & PASSES
        // =========================================================================
        if (q.contains("free") || q.contains("women") || q.contains("ladies") || q.contains("girl") ||
            q.contains("vidiyal") || q.contains("pass") || q.contains("concession") || q.contains("student") ||
            q.contains("இலவசம்") || q.contains("பெண்கள்") || q.contains("சலுகை")) {
            
            if (isTamil) {
                return buildResponse(
                    "👩 **விடியல் பயணம் - மகளிர் இலவச பேருந்து பயணம் & சலுகை விவரங்கள்:**\n\n" +
                    "• **மகளிர் இலவச பயணம்:** தமிழ்நாடு அரசு அனைத்து சாதாரண நகரப் பேருந்துகளிலும் (Pink Board / White Board Ordinary Buses) பெண்கள், திருநங்கைகள் மற்றும் மாற்றுத்திறனாளிகளுக்கு **100% இலவச பயணம்** (கட்டணமில்லா பயணச் சீட்டு) வழங்குகிறது.\n" +
                    "• **மூத்த குடிமக்கள் சலுகை (Senior Citizen):** 60 வயதுக்கு மேற்பட்ட மூத்த குடிமக்களுக்கு எக்ஸ்பிரஸ் மற்றும் அரசு பேருந்துகளில் **50% கட்டணச் சலுகை** உண்டு.\n" +
                    "• **மாணவர் இலவச பாஸ் (Student Pass):** பள்ளி மற்றும் அரசு கல்லூரி மாணவர்கள் அரசு பேருந்துகளில் இலவசமாக பயணிக்கலாம்.",
                    "தமிழ்நாட்டில் அனைத்து சாதாரண நகரப் பேருந்துகளிலும் பெண்கள் இலவசமாக பயணிக்கலாம். மூத்த குடிமக்களுக்கு 50 சதவீத கட்டணச் சலுகை உண்டு.",
                    Arrays.asList("கட்டணம் கணக்கிட", "பஸ் தேட", "செயலியை பயன்படுத்துவது எப்படி"),
                    "action_fare"
                );
            } else {
                return buildResponse(
                    "👩 **Vidiyal Payanam - Women Free Travel & Concession Guidelines in Tamil Nadu:**\n\n" +
                    "• **100% Free Travel for Women:** Under the Tamil Nadu Government's *Vidiyal Payanam Scheme*, women, transpersons, and persons with disabilities travel completely **FREE** (zero-fare tickets) on all Ordinary Town Buses (identified by pink fronts or white destination boards).\n" +
                    "• **Senior Citizen Concession (60+):** Eligible senior citizens receive a **50% fare discount** on state transport.\n" +
                    "• **Student Bus Pass:** School students in uniform and college students with valid passes travel free on designated routes.\n" +
                    "• **Express & SETC Buses:** Normal standard tariffs apply with no gender exemption.",
                    "Women travel 100% free on all government ordinary town buses under the Vidiyal Payanam scheme. Senior citizens get 50% concession.",
                    Arrays.asList("Calculate Bus Fare", "Search Buses", "How to use this app?"),
                    "action_fare"
                );
            }
        }

        // =========================================================================
        // 5. TIMINGS, FREQUENCY, FIRST & LAST BUS
        // =========================================================================
        if (q.contains("timing") || q.contains("time") || q.contains("schedule") || q.contains("frequency") ||
            q.contains("first bus") || q.contains("last bus") || q.contains("night bus") || q.contains("நேரம்")) {
            
            return buildResponse(
                "⏰ **Tamil Nadu State Transport (TNSTC/SETC) Bus Timing & Frequency:**\n\n" +
                "• **Intercity & National Highways (NH 45, NH 44, NH 544):** Buses operate **24 hours a day**. Key corridors (like Chennai–Villupuram–Gingee–Tiruvannamalai, Chennai–Salem, Coimbatore–Madurai) have departures every **10 to 15 minutes** during daytime.\n" +
                "• **Rural & Town Services:** Town buses start from **05:00 AM** and run till **10:30 PM**.\n" +
                "• **Night Express & Sleeper Buses:** Depart between **08:00 PM and 11:30 PM** for overnight long-distance travel.\n\n" +
                "Tell me your route (e.g. *'Chennai to Gingee'*) to check live departure times and seat availability!",
                "Government buses run 24 hours on all major highway corridors. Tell me your start and destination town to see live timings.",
                Arrays.asList("Buses from Chennai to Gingee", "Calculate Fares", "How to use this app?"),
                null
            );
        }

        // =========================================================================
        // 6. BUS TERMINALS IN CHENNAI & MAJOR CITIES (KCBT, CMBT, Koyambedu)
        // =========================================================================
        if (q.contains("kilambakkam") || q.contains("kcbt") || q.contains("koyambedu") || q.contains("cmbt") ||
            q.contains("madhavaram") || q.contains("bus stand") || q.contains("terminus") || q.contains("பேருந்து நிலையம்")) {
            
            return buildResponse(
                "🚏 **Chennai Major Bus Terminus Guide:**\n\n" +
                "• **KCBT (Kilambakkam - Kalaignar Centenary Bus Terminus):**\n" +
                "  All buses to **Southern & Central Tamil Nadu** (Villupuram, Gingee, Tiruvannamalai, Trichy, Madurai, Salem, Coimbatore, Tirunelveli, Kanyakumari) now depart exclusively from Kilambakkam.\n" +
                "• **CMBT (Koyambedu):**\n" +
                "  Buses towards **Pondicherry (via ECR/Tindivanam)**, Kanchipuram, and Vellore depart from here.\n" +
                "• **MMBT (Madhavaram):**\n" +
                "  Buses heading towards **Andhra Pradesh, Ponneri, and Tiruvallur** depart from Madhavaram.",
                "All buses to South and Central Tamil Nadu including Gingee, Salem, and Madurai depart from Kilambakkam KCBT bus terminus.",
                Arrays.asList("Buses from Chennai to Gingee", "How to use this app?", "Emergency SOS"),
                null
            );
        }

        // =========================================================================
        // 7. LUGGAGE & PARCEL RULES
        // =========================================================================
        if (q.contains("luggage") || q.contains("bag") || q.contains("weight") || q.contains("parcel") ||
            q.contains("cargo") || q.contains("pet") || q.contains("dog") || q.contains("பொருள்")) {
            
            return buildResponse(
                "🧳 **TNSTC Passenger Luggage & Goods Guidelines:**\n\n" +
                "• **Personal Baggage:** Passengers can carry up to **30 kg of personal luggage free of charge**.\n" +
                "• **Excess / Commercial Luggage:** Parcels exceeding 30 kg or bulky boxes are charged nominal TNSTC parcel luggage tariff.\n" +
                "• **Prohibited Items:** Inflammable items, gas cylinders, and hazardous chemicals are strictly prohibited.\n" +
                "• **Pets:** Small domestic pets inside pet carriers are permitted in Non-AC Ordinary/Express buses with permission from the conductor.",
                "Passengers can carry up to 30 kilograms of personal luggage for free on all government buses.",
                Arrays.asList("How to use this app?", "Search buses", "Calculate Fares"),
                null
            );
        }

        // =========================================================================
        // 8. TICKET BOOKING & RESERVATION
        // =========================================================================
        if (q.contains("booking") || q.contains("book ticket") || q.contains("reserve") || q.contains("online ticket") ||
            q.contains("முன்பதிவு") || q.contains("டிக்கெட்")) {
            
            return buildResponse(
                "🎟️ **Tamil Nadu Bus Ticket Booking Information:**\n\n" +
                "• **Ordinary & Express Buses:** No advance booking required! Simply board the bus and purchase your ticket directly from the conductor via cash or UPI QR.\n" +
                "• **SETC Ultra Deluxe, AC Sleeper & Super Deluxe:** Can be booked up to 30 days in advance via the official TNSTC portal (`www.tnstc.in`) or at any government bus depot counter.\n\n" +
                "You can search real-time bus availability and track them live right here on SmartBus!",
                "Ordinary and Express buses do not require advance booking. You can buy tickets on-board directly from the conductor.",
                Arrays.asList("Search Buses", "Calculate Fares", "How to use this app?"),
                null
            );
        }

        // =========================================================================
        // 9. STOP GUARDIAN DOUBTS & SLEEP ALERTS
        // =========================================================================
        if (q.contains("guardian") || q.contains("wake") || q.contains("alert") || q.contains("miss") ||
            q.contains("விழிப்பூட்டல்") || q.contains("ஸ்டாப் கார்டியன்") || q.contains("sleep") || q.contains("தூங்க")) {
            if (isTamil) {
                return buildResponse(
                    "🔔 **Smart Stop Guardian எவ்வாறு செயல்படுகிறது:**\n\n" +
                    "1. பஸ்சை தேர்ந்தெடுத்ததும் **'Enable Stop Guardian'** பொத்தானைத் தட்டவும்.\n" +
                    "2. உங்கள் ஊர் வருவதற்கு **10 நிமிடங்களுக்கு முன்** நீல நிற தகவல் அறிவிப்பு வரும்.\n" +
                    "3. **5 நிமிடங்களுக்கு முன்** எச்சரிக்கை அதிர்வு மற்றும் குரல் அறிவிப்பு ஒலிக்கும்.\n" +
                    "4. **1 நிமிடத்தில்** சத்தமான அலாரம் அடித்து நீங்கள் இறங்குவதற்கு விழிப்பூட்டும்!\n" +
                    "5. தவறுதலாக ஸ்டாப் தவறினால், அடுத்த எதிர் திசை பஸ் விவரம் மற்றும் மீட்பு வழிகள் காண்பிக்கப்படும்.",
                    "ஸ்டாப் கார்டியன் உங்கள் இறங்கும் இடம் வருவதற்கு 10 நிமிடம், 5 நிமிடம் மற்றும் 1 நிமிடம் முன்னதாக எச்சரிக்கும்.",
                    Arrays.asList("செயலியை எப்படி பயன்படுத்துவது?", "பஸ் தேட", "கட்டணம் பார்க்க"),
                    "action_guardian"
                );
            } else {
                return buildResponse(
                    "🔔 **How Smart Stop Guardian Protects You:**\n\n" +
                    "1. When tracking any bus, tap **'Enable Stop Guardian'**.\n" +
                    "2. **10 Minutes Before Stop**: Gentle blue alert to remind you to pack your bags.\n" +
                    "3. **5 Minutes Before Stop**: Warning card with vibration and audio prompt.\n" +
                    "4. **1 Minute / Next Stop**: High-priority flashing red alarm & spoken Tamil/English audio to ensure you get down safely!\n" +
                    "5. **Missed Stop Recovery**: If you accidentally sleep past your destination, the system instantly computes the next return bus number, nearest bus stop, and ETA to get back safely.",
                    "Stop Guardian monitors your bus GPS and announces audio alerts 10, 5, and 1 minute before your destination.",
                    Arrays.asList("How to use this app?", "Search buses now", "Safety Helplines"),
                    "action_guardian"
                );
            }
        }

        // =========================================================================
        // 10. FARE ENQUIRY (STANDALONE)
        // =========================================================================
        if (q.contains("fare") || q.contains("price") || q.contains("cost") ||
            q.contains("rate") || q.contains("கட்டணம்") || q.contains("விலை") || q.contains("ரூபாய்")) {
            
            return buildResponse(
                "💰 **Tamil Nadu Government Bus Tariff Rates:**\n\n" +
                "• **Ordinary / Town Bus:** ₹0.58 / km (Minimum ₹7)\n" +
                "• **Express (Mofussil):** ₹0.75 / km (Minimum ₹14)\n" +
                "• **Ultra Deluxe (SETC):** ₹0.85 / km (Minimum ₹25)\n" +
                "• **AC Sleeper / Multi-Axle:** ₹1.40 / km (Minimum ₹50)\n\n" +
                "👴 *Senior Citizens (60+) receive an automatic 50% concession on government buses.*\n" +
                "👩 *Women travel 100% free on Ordinary town buses.*",
                "Express bus tariff is 75 paise per kilometer. Senior citizens get 50% discount.",
                Arrays.asList("Calculate route fare", "Search buses", "How to use this app?"),
                "action_fare"
            );
        }

        // =========================================================================
        // 11. EMERGENCY, SOS & HELPLINES
        // =========================================================================
        if (q.contains("emergency") || q.contains("sos") || q.contains("safety") || q.contains("police") ||
            q.contains("accident") || q.contains("ஹெல்ப்") || q.contains("அவசரம்") || q.contains("பாதுகாப்பு") ||
            q.contains("lost") || q.contains("complaint")) {
            if (isTamil) {
                return buildResponse(
                    "🚨 **தமிழ்நாடு அவசர உதவி எண்கள் (24x7 இலவசம்):**\n\n" +
                    "• **112** - அனைத்து அவசர தேவைகளுக்கும் (காவல்துறை, தீயணைப்பு)\n" +
                    "• **108** - இலவச ஆம்புலன்ஸ் அவசர ஊர்தி\n" +
                    "• **1091** - பெண்கள் பாதுகாப்பு உதவி மையம்\n" +
                    "• **1073** - தேசிய நெடுஞ்சாலை விபத்து உதவி\n" +
                    "• **1800-419-4287** - TNSTC மாநில அரசு போக்குவரத்து உதவி & தவறவிட்ட பொருட்கள்\n\n" +
                    "செயலியின் மேல் பட்டியில் உள்ள **🚨 SOS** பொத்தானைத் தட்டினால் அபாய போலீஸ் சைரன் சத்தமாக ஒலிக்கும்.",
                    "அவசர உதவிக்கு 112 அல்லது 108 எண்களை அழைக்கவும். பெண்கள் உதவிக்கு 1091.",
                    Arrays.asList("🚨 SOS இயக்கு", "ஸ்டாப் கார்டியன்", "செயலியை பயன்படுத்துவது எப்படி"),
                    "action_sos"
                );
            } else {
                return buildResponse(
                    "🚨 **Tamil Nadu 24x7 Emergency Transit Helplines:**\n\n" +
                    "• **112** - All-in-One National Emergency (Police & Fire)\n" +
                    "• **108** - Medical Emergency & Free Ambulance\n" +
                    "• **1091** - Women Safety & Passenger Helpline\n" +
                    "• **1073** - National Highway Accident Assistance\n" +
                    "• **1800-419-4287** - TNSTC / SETC Transport Enquiry & Lost Luggage Assistance\n\n" +
                    "Tap the red **🚨 SOS** button in the header bar to trigger an immediate audible police siren and emergency beacon.",
                    "For emergencies, call 112 or 108. For women safety, call 1091. You can also press the SOS button.",
                    Arrays.asList("Trigger SOS Alarm", "Report Rash Driving", "How to use this app?"),
                    "action_sos"
                );
            }
        }

        // =========================================================================
        // 12. SINGLE DESTINATION SEARCH (e.g., "buses to gingee" or "how to go to gingee")
        // =========================================================================
        String matchedTown = findAnyTownInQuery(q);
        if (matchedTown != null) {
            String defaultFrom = "chennai";
            if (matchedTown.equalsIgnoreCase("chennai")) {
                defaultFrom = "villupuram";
            }
            return handleRouteSearchResponse(defaultFrom, matchedTown, isTamil);
        }

        // =========================================================================
        // 13. THANKS / PRAISE
        // =========================================================================
        if (q.contains("thank") || q.contains("nandri") || q.contains("நன்றி") || q.contains("super") ||
            q.contains("great") || q.contains("good") || q.contains("awesome") || q.contains("nice")) {
            return buildResponse(
                "You are very welcome! 🚌 Wishing you a safe, smooth, and happy journey with **SmartBus**. Let me know if you need anything else or tap the **🎤 Microphone** to speak!",
                "You are very welcome! Wishing you a safe journey with SmartBus.",
                Arrays.asList("Search another bus", "Calculate Fares", "How Stop Guardian works"),
                null
            );
        }

        // =========================================================================
        // 14. TRULY INTELLIGENT CONVERSATIONAL FALLBACK
        // =========================================================================
        // (NO hardcoded "Chennai to Salem"!)
        if (isTamil) {
            return buildResponse(
                "நான் உங்கள் **SmartBus AI** பயண உதவியாளர். உங்கள் கேள்வியைப் புரிந்து கொள்ள நான் தயாராக உள்ளேன்.\n\n" +
                "தமிழ்நாட்டின் எந்த இரண்டு ஊர்களுக்கு இடையே உள்ள பஸ்களையும், நேரலை வரைபடத்தையும், அரசு கட்டணத்தையும் உடனே தெரிந்துகொள்ள:\n" +
                "• *'சென்னை முதல் செஞ்சி வரை பஸ்'* போன்ற உங்கள் பயண வழியைக் கேளுங்கள்.\n" +
                "• அல்லது கீழே உள்ள **🎤 மைக்ரோஃபோன்** பொத்தானைத் தட்டி நேரடியாக பேசலாம்!",
                "நான் SmartBus AI. தமிழ்நாடு முழுவதும் உள்ள பஸ்கள் மற்றும் வழிகள் பற்றி என்னிடம் தாராளமாகக் கேளுங்கள்.",
                Arrays.asList("செயலியை எப்படி பயன்படுத்துவது?", "பஸ் தேட செல்ல", "கட்டணம் பார்க்க", "அவசர எண்கள்"),
                null
            );
        } else {
            return buildResponse(
                "I am **SmartBus AI**, your real-time passenger assistant for Tamil Nadu.\n\n" +
                "I can search active buses, calculate exact government fares, track journeys live on Google Maps, and sound Stop Guardian sleep alarms.\n\n" +
                "Try asking or tapping the **🎤 Microphone** below to say:\n" +
                "• *'Is there any bus from Chennai to Gingee?'*\n" +
                "• *'Buses from Salem to Trichy'*\n" +
                "• *'What is the ticket fare to Madurai?'*\n" +
                "• *'How does Stop Guardian protect me?'*\n" +
                "• *'Are town buses free for women?'*",
                "I am SmartBus AI. Tell me any two towns in Tamil Nadu to find live buses and fares.",
                Arrays.asList("How to use this app?", "Search Buses", "Calculate Fares", "Emergency SOS Help"),
                null
            );
        }
    }

    private Map<String, Object> handleRouteSearchResponse(String from, String to, boolean isTamil) {
        String fromCap = capitalize(from);
        String toCap = capitalize(to);

        List<BusSearchResult> buses = busService.searchBuses(from, to);
        if (buses == null || buses.isEmpty()) {
            buses = busService.generateOnDemandBuses(from, to);
        }

        Map<String, Object> fareData = fareCalculationService.calculateFare(from, to, "Express", false);
        double distKm = fareData.get("distanceKm") != null ? (double) fareData.get("distanceKm") : 120.0;
        int expFare = fareData.get("expressFare") != null ? (int) fareData.get("expressFare") : 90;
        int ordFare = fareData.get("ordinaryFare") != null ? (int) fareData.get("ordinaryFare") : 70;
        int delFare = fareData.get("deluxeFare") != null ? (int) fareData.get("deluxeFare") : 110;
        int acFare = fareData.get("acFare") != null ? (int) fareData.get("acFare") : 180;
        int estTimeMin = (int) Math.max(30, Math.round(distKm / 48.0 * 60));

        StringBuilder sb = new StringBuilder();
        if (isTamil) {
            sb.append(String.format("🚌 **ஆம்! %s முதல் %s வரை %d பஸ்கள் இயக்கத்தில் உள்ளன:**\n\n",
                    fromCap, toCap, buses.size()));
            sb.append(String.format("• **பயண தூரம்:** ~%.0f கி.மீ (சுமார் %d மணி %d நிமிடம்)\n",
                    distKm, estTimeMin / 60, estTimeMin % 60));
            sb.append(String.format("• **அரசு கட்டணம்:** விரைவு பஸ்: ₹%d | சாதாரண பஸ்: ₹%d | டீலக்ஸ்: ₹%d | ஏசி: ₹%d\n",
                    expFare, ordFare, delFare, acFare));
            sb.append("• 👴 *மூத்த குடிமக்களுக்கு 50% கட்டணச் சலுகை உண்டு!*\n\n");
            sb.append("**அடுத்து புறப்படும் பஸ்கள்:**\n");

            for (int i = 0; i < Math.min(buses.size(), 4); i++) {
                BusSearchResult b = buses.get(i);
                sb.append(String.format("%d. **%s** (%s) - புறப்பாடு: **%s** | கூட்டம்: **%s** | ⭐ %.1f\n",
                        i + 1, b.getBusNumber(), b.getBusType(), b.getDepartureTime(), b.getCrowdLevel(), b.getRating()));
            }
            sb.append("\nபஸ்சை நேரலையாக கூகுள் மேப்பில் காண கீழே உள்ள பொத்தானைத் தட்டவும்!");
        } else {
            sb.append(String.format("🚌 **Yes! Found %d active buses between %s and %s:**\n\n",
                    buses.size(), fromCap, toCap));
            sb.append(String.format("• **Route Distance:** ~%.0f km (~%d hrs %d mins)\n",
                    distKm, estTimeMin / 60, estTimeMin % 60));
            sb.append(String.format("• **Government Fare:** Express: ₹%d | Ordinary: ₹%d | Deluxe: ₹%d | AC: ₹%d\n",
                    expFare, ordFare, delFare, acFare));
            sb.append("• 👴 *Senior citizens get 50% concession on government buses.*\n\n");
            sb.append("**Next Available Buses:**\n");

            for (int i = 0; i < Math.min(buses.size(), 4); i++) {
                BusSearchResult b = buses.get(i);
                sb.append(String.format("%d. **%s** (%s) - Depart: **%s** | Crowd: **%s** | ⭐ %.1f\n",
                        i + 1, b.getBusNumber(), b.getBusType(), b.getDepartureTime(), b.getCrowdLevel(), b.getRating()));
            }
            sb.append("\nTap below to view full details and track on the live Google Map!");
        }

        String speechText = String.format("Found %d buses from %s to %s. First bus leaves at %s, express fare is %d rupees.",
                buses.size(), fromCap, toCap, buses.get(0).getDepartureTime(), expFare);

        return buildResponse(
            sb.toString(),
            speechText,
            Arrays.asList(
                String.format("View %s to %s on Map", fromCap, toCap),
                String.format("%s to %s fare", fromCap, toCap),
                "How Stop Guardian works"
            ),
            "action_search:" + from + ":" + to
        );
    }

    /**
     * Advanced NLP Regex matcher that extracts origin and destination from conversational queries.
     */
    private String[] extractOriginAndDestination(String query) {
        if (query == null) return null;
        String q = query.toLowerCase().trim();

        // Pattern 1: "(from|between) <origin> (to|towards|and) <destination>"
        Pattern p1 = Pattern.compile("(?i)(?:from|between)\\s+([a-zA-Z\\u0B80-\\u0BFF\\s]+?)\\s+(?:to|towards|-|–|and)\\s+([a-zA-Z\\u0B80-\\u0BFF\\s]+)");
        Matcher m1 = p1.matcher(q);
        if (m1.find()) {
            String from = cleanCityToken(m1.group(1));
            String to = cleanCityToken(m1.group(2));
            if (isValidTownToken(from) && isValidTownToken(to)) {
                return new String[]{from, to};
            }
        }

        // Pattern 2: "<origin> (to|towards|->) <destination>"
        Pattern p2 = Pattern.compile("(?i)(?:buses?\\s+)?(?:available\\s+)?([a-zA-Z\\u0B80-\\u0BFF\\s]+?)\\s+(?:to|towards|-|–)\\s+([a-zA-Z\\u0B80-\\u0BFF\\s]+)");
        Matcher m2 = p2.matcher(q);
        if (m2.find()) {
            String from = cleanCityToken(m2.group(1));
            String to = cleanCityToken(m2.group(2));
            if (isValidTownToken(from) && isValidTownToken(to)) {
                return new String[]{from, to};
            }
        }

        // Pattern 3: Tamil pattern: "<origin> (லிருந்து|முதல்) <destination> (க்கு|வரை)"
        Pattern p3 = Pattern.compile("(?i)([a-zA-Z\\u0B80-\\u0BFF\\s]+?)(?:லிருந்து|ல இருந்து|முதல்)\\s+([a-zA-Z\\u0B80-\\u0BFF\\s]+?)(?:க்கு|வரை|போக)?");
        Matcher m3 = p3.matcher(q);
        if (m3.find()) {
            String from = cleanCityToken(m3.group(1));
            String to = cleanCityToken(m3.group(2));
            if (isValidTownToken(from) && isValidTownToken(to)) {
                return new String[]{from, to};
            }
        }

        // Pattern 4: Dictionary search for any two known towns present in the string
        String first = null;
        String second = null;
        for (String town : TN_ALL_TOWNS) {
            if (q.contains(town)) {
                if (first == null) {
                    first = town;
                } else if (!town.equalsIgnoreCase(first)) {
                    second = town;
                    break;
                }
            }
        }

        if (first != null && second != null) {
            // Check which comes first in the text
            int idx1 = q.indexOf(first);
            int idx2 = q.indexOf(second);
            if (idx1 <= idx2) {
                return new String[]{first, second};
            } else {
                return new String[]{second, first};
            }
        }

        return null;
    }

    private String cleanCityToken(String token) {
        if (token == null) return "";
        String s = token.trim().toLowerCase();

        // Strip leading filler words
        s = s.replaceAll("^(?:is\\s+there\\s+any|are\\s+there\\s+any|any|are|is|there|can\\s+i\\s+get|can\\s+i\\s+go|i\\s+want\\s+to\\s+go|how\\s+to\\s+go|how\\s+to\\s+reach|show\\s+me|tell\\s+me|find|search|please|pls)\\s+", "");
        s = s.replaceAll("^(?:buses?|services?|routes?|tickets?|fares?)\\s+(?:available\\s+)?(?:from\\s+)?", "");
        s = s.replaceAll("^(?:available\\s+from|from)\\s+", "");

        // Strip trailing filler words
        s = s.replaceAll("\\s+(?:available|buses?|services?|routes?|timing|timings|ticket|tickets|fare|fares|please|today|tomorrow|now|morning|night|evening|afternoon|bus\\s+stand|bus\\s+stop|station|city|town)$", "");
        s = s.replaceAll("[?.!,;:]+", "");
        return s.trim();
    }

    private boolean isValidTownToken(String token) {
        if (token == null) return false;
        String s = token.trim().toLowerCase();
        if (s.length() < 2 || s.length() > 35) return false;
        // Ignore generic English/Tamil pronouns/stop words
        List<String> stopWords = Arrays.asList(
            "here", "there", "anywhere", "bus", "buses", "today", "tomorrow", "now", "where",
            "which", "what", "how", "this", "that", "route", "service", "station"
        );
        return !stopWords.contains(s);
    }

    private String findAnyTownInQuery(String q) {
        for (String town : TN_ALL_TOWNS) {
            if (q.contains(town)) {
                return town;
            }
        }
        if (q.contains("செஞ்சி") || q.contains("ஜிஞ்சி")) return "gingee";
        if (q.contains("சென்னை")) return "chennai";
        if (q.contains("சேலம்")) return "salem";
        if (q.contains("கோவை") || q.contains("கோயம்புத்தூர்")) return "coimbatore";
        if (q.contains("மதுரை")) return "madurai";
        if (q.contains("திருச்சி")) return "trichy";
        if (q.contains("நெல்லை") || q.contains("திருநெல்வேலி")) return "tirunelveli";
        if (q.contains("கன்னியாகுமரி")) return "kanyakumari";
        if (q.contains("ஊட்டி")) return "ooty";
        if (q.contains("விழுப்புரம்")) return "villupuram";
        if (q.contains("பாண்டிச்சேரி") || q.contains("புதுச்சேரி")) return "pondicherry";
        if (q.contains("தஞ்சாவூர்") || q.contains("தஞ்சை")) return "thanjavur";
        if (q.contains("வேலூர்")) return "vellore";
        if (q.contains("திண்டுக்கல்")) return "dindigul";
        if (q.contains("ஈரோடு")) return "erode";
        if (q.contains("திருப்பூர்")) return "tiruppur";
        if (q.contains("தேனி")) return "theni";
        return null;
    }

    private Map<String, Object> buildResponse(String text, String speech, List<String> suggestions, String action) {
        Map<String, Object> res = new HashMap<>();
        res.put("reply", text);
        res.put("speechText", speech);
        res.put("suggestions", suggestions != null ? suggestions : Collections.emptyList());
        res.put("action", action);
        res.put("timestamp", new Date());
        return res;
    }

    private boolean containsTamil(String text) {
        if (text == null) return false;
        for (char c : text.toCharArray()) {
            if (c >= '\u0B80' && c <= '\u0BFF') return true;
        }
        return false;
    }

    private String capitalize(String str) {
        if (str == null || str.isEmpty()) return "";
        String s = str.trim();
        return Character.toUpperCase(s.charAt(0)) + s.substring(1);
    }
}
