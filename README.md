# BreatheBetter — Real-Time Air Quality Intelligence Platform

A high-performance, real-time atmospheric intelligence and air pollution monitoring platform built in pure JavaScript. BreatheBetter transforms raw satellite and ground telemetry from Copernicus CAMS and Open-Meteo into actionable, hyper-local respiratory health guidance.

---

## Key Features

### 1. Live AQI Dashboard
- Dual US EPA AQI (0–500+) and European CAQI atmospheric meter scales.
- Real-time measurements for all 6 criteria pollutants: PM2.5, PM10, NO2, SO2, CO, and Ozone (O3).
- Dynamic Dominant Pollutant detection identifying the primary cause of poor air.
- Comparison against strict World Health Organization (WHO) 24-hour exposure limits.
- Real-time weather telemetry: temperature, humidity, wind velocity, and compass bearing.
- Quick Benchmark Bar with instant 1-click access to **"Your Location"** and major metropolitan capitals.

### 2. Interactive Global Pollution Map
- Leaflet-powered global mapping with CartoDB Voyager (light) and Dark Matter (dark) tile layers.
- Custom vector color-coded AQI pins displaying live pollution levels.
- Full-Earth Click-to-Query: click any latitude and longitude on the planet to reverse-geocode and fetch authentic atmospheric data.
- Quick "Center on My Location" navigation camera control.

### 3. Historical Pollution Tracker & Anomaly Spike Detector
- 7-day retrospective hourly aerosol time-series area charts.
- Automated Week-over-Week trend percentage calculation (+/- % change against past baselines).
- Automated Anomaly Spike Detector highlighting sudden diurnal surges with meteorological root cause explanations.

### 4. Multi-Location Comparative Benchmarking
- Side-by-side multi-city analytical benchmarking supporting up to 4 locations simultaneously.
- Cross-pollutant comparative bar charts.
- Automated "Clean Air Winner" scientific evaluation algorithm ranking cities by atmospheric safety.

### 5. Health & Safety Intelligence Center
- EPA & WHO Air Quality Index reference scale (Good, Moderate, Sensitive, Unhealthy, Very Unhealthy, Hazardous).
- Outdoor activity suitability matrix (Jogging, Cycling, Children outdoor play, Window ventilation).
- Microscopic Pulmonary Impact explainer: PM2.5 alveolar infiltration vs. PM10 upper respiratory tract capture.
- Protective equipment guide (N95/FFP2 vs. Surgical vs. Cloth masks) and HEPA CADR air purifier room sizing calculator.
- Printable, 1-click Emergency Health Action Plan for sensitive individuals.

### 6. 7-Day & 72-Hour Continuous Aerosol Forecast
- 7-day daily overview and 72-hour continuous projection curves.
- Explicit Copernicus Atmospheric Forecast Model source attribution.
- Predictive outlook alerting users to upcoming hazardous days before they occur.

### 7. Innovation & AI/ML Modules
- **Hyper-Local Personalized Exposure Score (Life-Log Tracker):** Calculates inhaled pollutant dosage (micrograms of PM2.5 absorbed) based on commute duration, transportation mode (walking, cycling, driving, transit), and physiological minute ventilation rates.
- **Aero-Predictive Safe Window Engine:** Lightweight client-side regression algorithm scanning forecast curves to automatically identify the optimal 2-hour window for outdoor activities.
- **Interactive "What-If" Policy Simulator:** Mathematical projection slider modeling the air quality impact of traffic emission reductions and green canopy expansions.
- **BreatheAI Context-Aware Pollution Assistant:** Embedded advisory assistant pre-loaded with local atmospheric context, complete with Web Speech API audio narration.
- **Emergency Action Plan Generator:** Generates a personalized medical guidance protocol formatted for standard print/PDF export.

---

## Design System & Principles

- **Zero Shadows:** Fully compliant with flat enterprise design principles (`box-shadow: none !important; text-shadow: none !important;`).
- **Zero Emojis:** 100% clean vector SVG icons powered by Lucide React.
- **Pleasant Professional Colors:** Calming slate backgrounds with soft emerald, warm amber, and coral accents.
- **Theme Support:** Fully synchronized, high-contrast Dark and Light modes.
- **Sleek Transitions:** 200ms cubic-bezier page transitions between modules.
- **Pure JavaScript:** Built completely in standard JavaScript JSX (`.js` and `.jsx`) for maximum compatibility.

---

## Authentic Public APIs

| Provider | Service | Usage |
| :--- | :--- | :--- |
| **Open-Meteo Air Quality** | Copernicus CAMS & NOAA GEFS Models | Real-time criteria pollutants, historical hourly archives, and 7-day projections |
| **Open-Meteo Weather** | Numerical Weather Prediction Models | Ambient temperature, relative humidity, wind speed, and direction |
| **Open-Meteo Geocoding** | Global Geographic Gazetteer | City, state, and country name search autocomplete |
| **OpenStreetMap Nominatim** | Global Geocoding & POI Database | Locality and neighborhood coordinate reverse-geocoding |
| **GeoJS** | IP Geolocation Service | Zero-permission fallback to detect the user's city on application boot |
| **Web Speech API** | Browser Native Voice Engine | Auditory speech synthesis for accessibility briefings |
