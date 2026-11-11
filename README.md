# BreatheBetter — Real-Time Air Quality Intelligence Platform

> **Theme**: Technology for Cleaner Air  
> **Challenge**: BREATHE BETTER — Real-Time Air Quality Intelligence Platform  
> **Diwali Challenge 2026 Submission**

---

## 1. Executive Summary & Problem Statement

Air pollution is an urgent global environmental and public health crisis. Citizens, athletes, elderly populations, and patients suffering from respiratory diseases frequently lack timely, accessible, and actionable atmospheric intelligence to safeguard their daily lives. 

**BreatheBetter** turns raw environmental telemetry into human-centered, life-saving decisions. Built with React 19, TypeScript, Tailwind CSS, Leaflet, and Recharts, the platform integrates authentic satellite reanalysis and ground-station ensemble data from the **Copernicus Atmosphere Monitoring Service (CAMS)** and **NOAA** via the open **Open-Meteo Air Quality API**.

---

## 2. Authentic Public APIs Integrated (Rule 2 & Rule 10 Compliance)

1. **Open-Meteo Air Quality API**:
   - **Endpoint**: `https://air-quality-api.open-meteo.com/v1/air-quality`
   - **Data Models**: Copernicus Atmosphere Monitoring Service (CAMS) + NOAA GEFS-Aerosols.
   - **Metrics Monitored**: US AQI, European AQI, PM2.5, PM10, Carbon Monoxide (CO), Nitrogen Dioxide (NO2), Sulphur Dioxide (SO2), Ozone (O3), Dust, and UV Index.
   - **Temporal Scope**: Real-time current measurements, 7-day verified historical archive, and 7-day hourly forward-looking predictive models.
2. **Open-Meteo Geocoding API**:
   - **Endpoint**: `https://geocoding-api.open-meteo.com/v1/search`
   - Global instant city search with administrative region and timezone resolution.
3. **OpenStreetMap Nominatim Reverse Geocoder**:
   - Converts browser GPS coordinates to city names for automatic location detection.
4. **Native Browser Web Speech API (`window.speechSynthesis`)**:
   - Delivers synthesized 30-second audio briefings of local atmospheric conditions and precautions.

---

## 3. Strict Aesthetic & UX Standards Compliance

- **Zero Shadows**: Absolute elimination of all `box-shadow` or drop-shadow effects (`box-shadow: none !important`). Modern, flat, crisp enterprise design with border-defined depth.
- **Zero Emojis**: 100% clean SVG icons from `lucide-react` across all indicators, metrics, and badges.
- **Pleasant Soothing Colors**: Muted emeralds, soft ambers, warm corals, lavender violets, and deep calm slate.
- **Short Sleek Transitions**: 200ms smooth state and tab transitions (`cubic-bezier(0.16, 1, 0.3, 1)`) for high-performance responsiveness.
- **Guided "Next Step" UX**: Interactive `NextStepGuide` banner present on every view advising users on the exact next step based on active AQI severity.

---

## 4. Implemented Feature Suite

### A. Mandatory Modules (Challenge Section 3)
1. **Live AQI Dashboard**:
   - Real-time US AQI and European AQI dual meter.
   - 6 criteria pollutants (PM2.5, PM10, NO2, SO2, CO, O3) compared against strict **WHO 24-hour guidelines**.
   - Verified sensor timestamps and live data source badges.
   - Quick-select cities across India and global hubs.
2. **Interactive Air Quality Map**:
   - Leaflet interactive map with custom flat color-coded pins.
   - Click anywhere on Earth to query authentic GPS coordinate air quality.
   - Hotspot highlights with warning borders and clean air havens.
   - Dual layer switcher: US AQI and PM2.5 (µg/m³).
3. **Historical Pollution Tracker**:
   - 7-day retrospective time-series area charts using Recharts.
   - PM2.5 vs PM10 dual comparative tracking.
   - Automated Week-over-Week trend percentage calculation (+/- % change).
   - Statistical Anomaly Spike Detector highlighting sudden diurnal surges.
4. **Multi-Location Comparison Tool**:
   - Side-by-side benchmarking of up to 4 cities simultaneously.
   - Multi-pollutant comparative bar charts and metrics table.
   - **Clean Air Winner** scientific algorithm evaluating and crowning the healthiest environment.
5. **Health & Safety Intelligence Center**:
   - Comprehensive EPA & WHO AQI reference scale (0–500+).
   - Outdoor activity suitability matrix (Jogging, Cycling, Children outdoor play, Window ventilation).
   - Deep-dive microscopic biological explainer: PM2.5 vs PM10 alveolar penetration and vascular risks.
   - Mask selection guide (N95 vs surgical vs cloth) and true HEPA CADR purifier standards.
6. **7-Day AQI Forecast**:
   - 7-day daily and 72-hour hourly continuous aerosol projection curves.
   - Explicit `[Copernicus Atmospheric Forecast Model]` badges (Rule 11 compliance).

### B. High-Impact Innovation & Real-World Features (User Requested)
7. **Hyper-Local Personalized Exposure Score (Commute Life-Log Tracker)**:
   - Input commute method (Walking, Cycling, Driving, Public Transit) and duration.
   - Uses physical minute ventilation rates ($V_E$) and cabin filtration factors to compute inhaled PM2.5 dosage ($\mu g$).
   - Calculates percentage consumed against WHO daily safe particulate budget (225 µg).
   - Identifies safer alternative departure windows from forecast diurnal curves.
8. **Aero-Predictive "Safe Window" Engine**:
   - Sliding 2-hour window algorithm across upcoming forecast hours.
   - Pinpoints the lowest-pollution 2-hour daylight slot today for outdoor workouts and room airing.
9. **Interactive "What-If" Pollution Policy Simulator**:
   - Policy intervention sliders: Traffic curbs (-0% to -60%), Industrial dust mitigation (-0% to -50%), Urban green canopy (+0% to +40%), Wind dispersion (-30% to +30%).
   - Generates simulated 48-hour comparative curve vs Copernicus baseline.
   - Displays projected average PM2.5 drop percentage and resulting AQI category.
10. **Vulnerable Group Guard (Micro-Profiles)**:
    - Profile switcher: General Public, Asthmatic Patients, Senior Citizens (65+), Pregnant Women, Outdoor Athletes, and Children.
    - Dynamically recalibrates health advisories, threshold sensitivity, and warning severity.
11. **Emergency Health Action Plan Generator**:
    - One-click generation of a printable/downloadable Emergency Action Plan for high AQI events.
    - Includes containment checklists, profile-specific directives, symptom red-flags, and emergency helpline numbers.
12. **The "Live Status & Source" Audit Drawer (Transparency Log)**:
    - Inspects exact API query endpoint, round-trip network latency (ms), payload timestamps, and live raw JSON data.
13. **Immersive Audio Briefing (Text-to-Speech)**:
    - Web Speech API integration synthesizing a 30-second situational atmospheric briefing on command.
14. **BreatheAI Environmental Assistant**:
    - Context-aware conversational assistant pre-loaded with live local data and audio playback.
15. **Global Pollution Leaderboard**:
    - Live rankings of the world's cleanest havens vs critical metropolitan hotspots.

---

## 5. Getting Started & Setup

### Prerequisites
- Node.js 18+ (tested on Node v24.19.0)
- npm 9+ (tested on npm 11.17.0)

### Installation
```bash
# Clone the repository
git clone https://github.com/your-username/letscode-challenge.git
cd letscode-challenge

# Install dependencies
npm install

# Start local development server
npm run dev
```
Open `http://localhost:5173` in your browser.

### Production Build
```bash
# Compile TypeScript and bundle with Vite
npm run build

# Preview production build locally
npm run preview
```

---

## 6. Project Architecture

```
letscode-challenge/
├── src/
│   ├── components/
│   │   ├── Navbar.tsx             # Header, search autocomplete, profile switcher, audio briefing
│   │   ├── NavigationTabs.tsx     # Tab strip with 200ms transitions
│   │   ├── NextStepGuide.tsx      # Contextual guided next action banner
│   │   ├── AuditDrawer.tsx        # Transparency log & API endpoint audit
│   │   ├── EmergencyPlanModal.tsx # Printable Emergency Action Plan generator
│   │   ├── SocialShareModal.tsx   # Social media share card generator
│   │   └── tabs/
│   │       ├── DashboardTab.tsx   # Live AQI & 6 WHO criteria pollutants
│   │       ├── MapTab.tsx         # Leaflet interactive map with click-to-query
│   │       ├── HistoryTab.tsx     # 7-day Recharts trends & anomaly detection
│   │       ├── ForecastTab.tsx    # 7-day model & Safe Window Engine
│   │       ├── ComparisonTab.tsx  # Multi-city benchmark & Clean Air Winner
│   │       ├── HealthCenterTab.tsx# Biological impact, activity matrix & masks
│   │       ├── ExposureTrackerTab.tsx # Commute life-log & inhaled dosage (µg)
│   │       ├── SimulatorTab.tsx   # What-If policy sliders & 48h projection
│   │       ├── AiAssistantTab.tsx # BreatheAI conversational assistant
│   │       └── LeaderboardTab.tsx # Clean havens vs critical hotspots
│   ├── services/
│   │   ├── airQualityService.ts   # Open-Meteo & Copernicus API client
│   │   ├── exposureCalculator.ts  # Ventilation dose mathematics
│   │   ├── safeWindowEngine.ts    # Diurnal safe window algorithm
│   │   ├── whatIfSimulator.ts     # Aerosol policy intervention simulator
│   │   └── speechService.ts       # Web Speech API voice synthesis
│   ├── types/
│   │   └── airQuality.ts          # TypeScript domain models
│   ├── utils/
│   │   └── aqiUtils.ts            # EPA/WHO category thresholds & color maps
│   ├── App.tsx                    # Root container & state orchestration
│   ├── main.tsx                   # Application entrypoint
│   └── index.css                  # Tailwind v4, Leaflet CSS & zero-shadow overrides
├── index.html                     # HTML5 shell & SVG icon
├── package.json                   # Dependencies & scripts
├── tsconfig.app.json              # TypeScript compilation rules
├── vite.config.ts                 # Vite + Tailwind plugin config
└── README.md                      # Comprehensive project documentation
```

---

## 7. Submission Checklist (Rule 6)

- [x] **Project Name & Description**: BreatheBetter — Real-Time Air Quality Intelligence Platform.
- [x] **Public APIs Integrated**: Open-Meteo Air Quality (Copernicus CAMS & NOAA), Geocoding, OpenStreetMap, Web Speech API.
- [x] **Mandatory Features (100% Implemented)**: Live AQI Dashboard, Interactive Map, Historical Tracker, Location Comparison, Health Dashboard, Forecast.
- [x] **Bonus & Innovation Features (100% Implemented)**: Commute Exposure Life-Log, Aero Safe Window Engine, What-If Simulator, Vulnerable Group Guard, Emergency Plan PDF Generator, Audit Drawer, Audio Briefing, BreatheAI, Anomaly Detection, Leaderboard.
- [x] **Style & Design Constraints**: Zero shadows (`box-shadow: none`), Zero emojis (pure Lucide SVGs), pleasant colors, 200ms transitions, guided next-step UX.
