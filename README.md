# 🚌 SmartBus – Rural Bus Tracking & Passenger Assistance System

[![Java](https://img.shields.io/badge/Java-17%20%2F%2026-orange.svg?style=flat-square&logo=openjdk)](https://www.oracle.com/java/)
[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.2.5-brightgreen.svg?style=flat-square&logo=springboot)](https://spring.io/projects/spring-boot)
[![Cloud Live](https://img.shields.io/badge/Live%20Demo-smartbus--sxre.onrender.com-blue?style=flat-square&logo=render)](https://smartbus-sxre.onrender.com)
[![Android APK](https://img.shields.io/badge/Android-Download%20APK-success?style=flat-square&logo=android)](https://smartbus-sxre.onrender.com/downloads/SmartBus.apk)
[![License](https://img.shields.io/badge/License-MIT-green.svg?style=flat-square)](LICENSE)

> 🌐 **Live 24/7 Cloud App:** **[https://smartbus-sxre.onrender.com](https://smartbus-sxre.onrender.com)**  
> 📲 **Native Android APK (Instant Direct Download):** **[👉 Download SmartBus.apk (998 KB)](https://smartbus-sxre.onrender.com/downloads/SmartBus.apk)**  
> 📁 **GitHub Repository APK File:** **[SmartBus.apk in /apk folder](https://github.com/saisaran-m/Smartbus/raw/main/apk/SmartBus.apk)**  
> 🔑 **Demo Credentials:** `demo` / `demo123` *(or register a new account)*

**SmartBus** is an end-to-end intelligent passenger assistance and live bus tracking platform designed especially for rural, semi-urban, and interstate bus transit across **Tamil Nadu, India**. 

It addresses key transit uncertainties by providing real-time Google Maps radar tracking, a voice-enabled conversational AI assistant (**SmartBus AI**), an automatic **Stop Guardian** destination proximity alert system to prevent missed stops, accurate state government fare calculators with senior citizen concessions, and emergency SOS helplines.

---

## 🌟 Key Features

### 1. 🌐 Statewide Transit Engine (All 38 Tamil Nadu Districts)
- **Any-to-Any Journey Routing:** Search and track buses between any towns across Tamil Nadu (e.g., *Chennai ↔ Gingee*, *Salem ↔ Trichy*, *Coimbatore ↔ Madurai*, *Ooty ↔ Coimbatore*, *Tirunelveli ↔ Kanyakumari*).
- **On-Demand Dynamic Transit Simulator:** If a specific origin-destination corridor was not pre-seeded, SmartBus dynamically computes road distances, realistic intermediate GPS stops, and active bus schedules on the fly.
- **20 One-Tap City Chips & 60+ Town Autocomplete:** Fast one-tap selection for major regional transit hubs.

### 2. 🤖 SmartBus AI Assistant with Voice Recognition
- **NLP Natural Language Understanding:** Ask questions naturally (e.g., *"Is there any bus from Chennai to Gingee?"*, *"How much is the fare to Madurai?"*, *"Are town buses free for women?"*).
- **🎤 Microphone Voice Input for Elderly Passengers:** One-touch voice recording in **English** and **Tamil (தமிழ்)** using the Web Speech API—no typing needed!
- **🔊 Text-to-Speech (Read-Aloud):** Answers are spoken aloud clearly for rural travellers and senior citizens.
- **Transit Knowledge Base:** Built-in guidance on luggage limits (30kg free), Chennai bus terminuses (*Kilambakkam KCBT, Koyambedu CMBT, Madhavaram MMBT*), *Vidiyal Payanam* free travel for women, and night bus services.

### 3. 🗺️ Live Google Maps Bus Radar
- **Tamil Nadu Clamped Interactive Radar:** Locked bounds prevent map drift into ocean/neighboring countries.
- **Sleek Transit Marker Pins:** 34px circular radar pins with golden-angle micro-dispersion so buses at the same bus stand do not pile up.
- **Interactive Controls:**
  - `📍 Center TN`: Smoothly re-centers to central Tamil Nadu.
  - `🎯 Locate Me`: Pinpoints live GPS position via HTML5 Geolocation.
  - `⛶ Expand`: Fullscreen map expansion.
  - `🔄 Refresh`: Updates live positions immediately.

### 4. 🔔 Stop Guardian Proximity & Missed Stop Recovery (USP)
- **Multi-Stage Audio/Visual Proximity Warnings:**
  - **10 Minutes to Destination:** Informational notification.
  - **5 Minutes to Destination:** Warning card with vibration prompt.
  - **1 Minute / Approaching Stop:** High-visibility pulsing red alert and audible alarm so passengers never miss their stop even if they fall asleep!
- **Missed Stop Recovery:** If a passenger accidentally misses their stop, SmartBus immediately calculates the nearest return bus number, next stop, and ETA to return safely.

### 5. 💰 TNSTC / SETC Rural Fare Calculator
- Instant calculation based on official Tamil Nadu State Transport Corporation tariffs:
  - **Ordinary / Town Bus:** ₹0.58 / km (Min ₹7)
  - **Express (Mofussil):** ₹0.75 / km (Min ₹14)
  - **SETC Ultra Deluxe:** ₹0.85 / km (Min ₹25)
  - **AC Sleeper / Multi-Axle:** ₹1.40 / km (Min ₹50)
- **Senior Citizen Concession:** Automatic 50% discount calculation for passengers aged 60+.

### 6. 🚨 Emergency Passenger SOS & Siren
- One-tap audible police wail (600Hz–1200Hz synthesized via Web Audio API).
- Instant dials to **112** (National Emergency), **108** (Ambulance), **1091** (Women Safety), **1073** (Highway Patrol), and **1800-419-4287** (TNSTC Control Room).
- WhatsApp live trip coordinate sharing with family and guardians.

### 7. 🌙 Night Mode & Modern Responsive Design
- Toggle between **Day (Light)** and **Night (Dark)** themes with persistent `localStorage` memory.
- Dynamic dark mode map tiles powered by CartoDB Dark Matter.
- 2-column desktop dashboard with top navigation bar; floating glassmorphism pill dock on mobile devices.

---

## 🛠️ Technology Stack

| Layer | Technology |
|---|---|
| **Backend Framework** | Java 17+, Spring Boot 3.2.5 |
| **Security & Auth** | Spring Security 6 (BCrypt password encoding, CSRF protection) |
| **Database & ORM** | H2 Database (File-persisted), Spring Data JPA, Hibernate |
| **Frontend** | HTML5, Thymeleaf, Vanilla Modern CSS3, JavaScript (ES6+) |
| **Maps & Geo** | Leaflet.js, Google Maps Roadmap Tiles, CartoDB Dark Matter |
| **Voice & Audio** | Web Speech API (`SpeechRecognition`), `SpeechSynthesisUtterance`, Web Audio API |
| **Build Tool** | Apache Maven 3.9+ |

---

## 🚀 Quick Start Guide

### Prerequisites
- **Java JDK 17** or higher (Java 21 / 26 supported)
- **Apache Maven 3.8+**
- Modern web browser (Chrome, Edge, Firefox, Safari)

### Installation & Run

1. **Clone the Repository:**
   ```bash
   git clone https://github.com/saisaran-m/smartbus.git
   cd smartbus
   ```

2. **Build the Application:**
   ```bash
   mvn clean package -DskipTests
   ```

3. **Run the Server:**
   ```bash
   java -jar target/smartbus-1.0.0.jar
   ```

4. **Access the Application:**
   - Open your browser at: **[http://localhost:8080](http://localhost:8080)**
   - Default Demo Credentials:
     - **Username:** `demo`
     - **Password:** `demo123`

---

## 📂 Project Structure

```
smartbus/
├── src/
│   ├── main/
│   │   ├── java/com/smartbus/
│   │   │   ├── config/          # Spring Security, Data Initializers
│   │   │   ├── controller/      # REST API & Page Controllers
│   │   │   ├── dto/             # Data Transfer Objects (SearchResults, Status)
│   │   │   ├── model/           # JPA Entities (Bus, Route, BusStop, Journey, User)
│   │   │   ├── repository/     # Spring Data JPA Repositories
│   │   │   └── service/        # BusService, AiAssistantService, StopGuardianService
│   │   └── resources/
│   │       ├── static/
│   │       │   ├── css/style.css    # Full theme, night mode & responsive CSS
│   │       │   └── js/              # app.js, map.js, tracking.js, guardian.js
│   │       ├── templates/           # dashboard.html, login.html, register.html
│   │       └── application.properties
├── pom.xml                      # Maven Build Configuration
└── README.md
```

---

## 📄 License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
