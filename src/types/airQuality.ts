// Air Quality Data Types & Definitions

export type AQICategory = 
  | 'Good' 
  | 'Moderate' 
  | 'Unhealthy for Sensitive Groups' 
  | 'Unhealthy' 
  | 'Very Unhealthy' 
  | 'Hazardous';

export type MicroProfile = 
  | 'General' 
  | 'Asthmatic' 
  | 'Senior' 
  | 'Pregnant' 
  | 'Athlete' 
  | 'Child';

export interface LocationInfo {
  name: string;
  country: string;
  latitude: number;
  longitude: number;
  admin1?: string;
  timezone?: string;
  isAutoDetected?: boolean;
}

export interface CurrentPollutants {
  time: string;
  us_aqi: number;
  european_aqi: number;
  pm2_5: number;       // µg/m³
  pm10: number;        // µg/m³
  carbon_monoxide: number; // µg/m³
  nitrogen_dioxide: number; // µg/m³
  sulphur_dioxide: number;  // µg/m³
  ozone: number;            // µg/m³
  dust?: number;            // µg/m³
  uv_index?: number;
  // Authentic meteorological data
  temperature?: number;      // °C
  humidity?: number;         // %
  wind_speed?: number;       // km/h
  wind_direction?: number;   // degrees
  weather_condition?: string;
}

export interface HourlyDataPoint {
  time: string;
  us_aqi: number;
  european_aqi?: number;
  pm2_5: number;
  pm10: number;
  carbon_monoxide?: number;
  nitrogen_dioxide?: number;
  sulphur_dioxide?: number;
  ozone?: number;
  isForecast: boolean;
}

export interface AirQualityResponse {
  location: LocationInfo;
  current: CurrentPollutants;
  hourly: HourlyDataPoint[];
  history: HourlyDataPoint[]; // Past 7 days
  forecast: HourlyDataPoint[]; // Next 7 days
  lastUpdated: string;
  dataSource: {
    name: string;
    model: string;
    endpoint: string;
    latencyMs: number;
    sensorType: 'Satellite Reanalysis + CAMS Ground Ensemble' | 'Verified Atmospheric Model';
  };
}

export interface AnomalySpike {
  time: string;
  pollutant: 'PM2.5' | 'PM10' | 'AQI';
  value: number;
  baseline: number;
  percentageSpike: number;
  severity: 'Moderate' | 'Severe' | 'Critical';
  potentialCause: string;
}

export interface SafeWindowResult {
  startTime: string;
  endTime: string;
  avgAqi: number;
  avgPm25: number;
  qualityLevel: string;
  activityRecommendation: string;
  confidenceScore: number;
}

export interface CommuteExposureResult {
  mode: 'walking' | 'cycling' | 'driving' | 'transit';
  durationMinutes: number;
  hourlyPm25: number;
  ventilationRateLpm: number;
  filtrationEfficiency: number;
  inhaledDoseMicrograms: number;
  dailyThresholdPercent: number;
  riskRating: 'Low' | 'Moderate' | 'Elevated' | 'Severe';
  betterWindowRecommendation?: string;
}

export interface WhatIfSimulationResult {
  baselineCurve: { time: string; pm25: number }[];
  simulatedCurve: { time: string; pm25: number }[];
  averageReductionPercent: number;
  projectedCategory: AQICategory;
}
