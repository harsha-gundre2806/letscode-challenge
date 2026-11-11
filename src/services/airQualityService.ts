import { 
  AirQualityResponse, 
  LocationInfo, 
  HourlyDataPoint, 
  AnomalySpike 
} from '../types/airQuality';

export const CURATED_CITIES: LocationInfo[] = [
  { name: 'New Delhi', country: 'India', latitude: 28.6139, longitude: 77.2090, admin1: 'Delhi', timezone: 'Asia/Kolkata' },
  { name: 'Mumbai', country: 'India', latitude: 19.0760, longitude: 72.8777, admin1: 'Maharashtra', timezone: 'Asia/Kolkata' },
  { name: 'Bengaluru', country: 'India', latitude: 12.9716, longitude: 77.5946, admin1: 'Karnataka', timezone: 'Asia/Kolkata' },
  { name: 'Kolkata', country: 'India', latitude: 22.5726, longitude: 88.3639, admin1: 'West Bengal', timezone: 'Asia/Kolkata' },
  { name: 'New York', country: 'United States', latitude: 40.7128, longitude: -74.0060, admin1: 'New York', timezone: 'America/New_York' },
  { name: 'London', country: 'United Kingdom', latitude: 51.5074, longitude: -0.1278, admin1: 'England', timezone: 'Europe/London' },
  { name: 'Tokyo', country: 'Japan', latitude: 35.6762, longitude: 139.6503, admin1: 'Tokyo', timezone: 'Asia/Tokyo' },
  { name: 'Beijing', country: 'China', latitude: 39.9042, longitude: 116.4074, admin1: 'Beijing', timezone: 'Asia/Shanghai' },
  { name: 'Paris', country: 'France', latitude: 48.8566, longitude: 2.3522, admin1: 'Île-de-France', timezone: 'Europe/Paris' },
  { name: 'Sydney', country: 'Australia', latitude: -33.8688, longitude: 151.2093, admin1: 'New South Wales', timezone: 'Australia/Sydney' },
  { name: 'Dubai', country: 'United Arab Emirates', latitude: 25.2048, longitude: 55.2708, admin1: 'Dubai', timezone: 'Asia/Dubai' },
  { name: 'Reykjavik', country: 'Iceland', latitude: 64.1466, longitude: -21.9426, admin1: 'Capital Region', timezone: 'Atlantic/Reykjavik' },
];

export async function searchLocations(query: string): Promise<LocationInfo[]> {
  if (!query || query.trim().length < 2) return [];
  try {
    const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=6&language=en&format=json`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('Geocoding search failed');
    const data = await res.json();
    if (!data.results) return [];

    return data.results.map((item: any) => ({
      name: item.name,
      country: item.country || '',
      latitude: item.latitude,
      longitude: item.longitude,
      admin1: item.admin1,
      timezone: item.timezone,
    }));
  } catch (err) {
    console.error('Error searching locations:', err);
    return [];
  }
}

export async function reverseGeocode(lat: number, lon: number): Promise<LocationInfo> {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=10&addressdetails=1`,
      { headers: { 'User-Agent': 'BreatheBetter-AQI-Platform/1.0' } }
    );
    if (res.ok) {
      const data = await res.json();
      const name = data.address?.city || data.address?.town || data.address?.suburb || data.address?.county || 'Current Coordinates';
      const country = data.address?.country || 'Detected Region';
      return {
        name,
        country,
        latitude: lat,
        longitude: lon,
      };
    }
  } catch (e) {
    console.warn('Reverse geocode fallback:', e);
  }

  return {
    name: `Lat ${lat.toFixed(2)}, Lon ${lon.toFixed(2)}`,
    country: 'Custom Location',
    latitude: lat,
    longitude: lon,
  };
}

export async function fetchAirQualityData(location: LocationInfo): Promise<AirQualityResponse> {
  const startTime = performance.now();
  const endpoint = `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${location.latitude}&longitude=${location.longitude}&current=european_aqi,us_aqi,pm10,pm2_5,carbon_monoxide,nitrogen_dioxide,sulphur_dioxide,ozone,dust,uv_index&hourly=pm10,pm2_5,carbon_monoxide,nitrogen_dioxide,sulphur_dioxide,ozone,us_aqi,european_aqi&past_days=7&forecast_days=7&timezone=auto`;

  const res = await fetch(endpoint);
  const latencyMs = Math.round(performance.now() - startTime);

  if (!res.ok) {
    throw new Error(`Air Quality API error: HTTP ${res.status}`);
  }

  const json = await res.json();
  const currentRaw = json.current;
  const hourlyRaw = json.hourly;

  if (!currentRaw || !hourlyRaw) {
    throw new Error('Incomplete data received from atmospheric monitoring network');
  }

  // Parse hourly data points
  const allHourly: HourlyDataPoint[] = [];
  const nowIso = new Date().toISOString();

  if (hourlyRaw.time && Array.isArray(hourlyRaw.time)) {
    for (let i = 0; i < hourlyRaw.time.length; i++) {
      const timeStr = hourlyRaw.time[i];
      const isForecast = new Date(timeStr).getTime() > new Date(nowIso).getTime();
      allHourly.push({
        time: timeStr,
        us_aqi: hourlyRaw.us_aqi?.[i] ?? 0,
        european_aqi: hourlyRaw.european_aqi?.[i] ?? 0,
        pm2_5: hourlyRaw.pm2_5?.[i] ?? 0,
        pm10: hourlyRaw.pm10?.[i] ?? 0,
        carbon_monoxide: hourlyRaw.carbon_monoxide?.[i] ?? 0,
        nitrogen_dioxide: hourlyRaw.nitrogen_dioxide?.[i] ?? 0,
        sulphur_dioxide: hourlyRaw.sulphur_dioxide?.[i] ?? 0,
        ozone: hourlyRaw.ozone?.[i] ?? 0,
        isForecast,
      });
    }
  }

  // Split into verified history (past) and forecast model (future)
  const history = allHourly.filter(p => !p.isForecast);
  const forecast = allHourly.filter(p => p.isForecast);

  return {
    location,
    current: {
      time: currentRaw.time,
      us_aqi: currentRaw.us_aqi ?? 0,
      european_aqi: currentRaw.european_aqi ?? 0,
      pm2_5: currentRaw.pm2_5 ?? 0,
      pm10: currentRaw.pm10 ?? 0,
      carbon_monoxide: currentRaw.carbon_monoxide ?? 0,
      nitrogen_dioxide: currentRaw.nitrogen_dioxide ?? 0,
      sulphur_dioxide: currentRaw.sulphur_dioxide ?? 0,
      ozone: currentRaw.ozone ?? 0,
      dust: currentRaw.dust ?? 0,
      uv_index: currentRaw.uv_index ?? 0,
    },
    hourly: allHourly,
    history,
    forecast,
    lastUpdated: currentRaw.time || new Date().toISOString(),
    dataSource: {
      name: 'Open-Meteo Air Quality Platform',
      model: 'Copernicus Atmosphere Monitoring Service (CAMS) & NOAA GEFS-Aerosols',
      endpoint,
      latencyMs,
      sensorType: 'Satellite Reanalysis + CAMS Ground Ensemble',
    },
  };
}

// Statistical Anomaly Detection in atmospheric records
export function detectAnomalies(history: HourlyDataPoint[]): AnomalySpike[] {
  if (history.length < 12) return [];

  const anomalies: AnomalySpike[] = [];
  const windowSize = 12; // 12-hour moving window

  for (let i = windowSize; i < history.length; i++) {
    const windowSlice = history.slice(i - windowSize, i);
    const avgPm25 = windowSlice.reduce((sum, p) => sum + p.pm2_5, 0) / windowSize;
    const currentPoint = history[i];

    if (avgPm25 > 10 && currentPoint.pm2_5 > avgPm25 * 1.55) {
      const percentageSpike = Math.round(((currentPoint.pm2_5 - avgPm25) / avgPm25) * 100);
      let severity: 'Moderate' | 'Severe' | 'Critical' = 'Moderate';
      let potentialCause = 'Localized particulate buildup, thermal inversion, or vehicular congestion surge.';

      if (percentageSpike > 120 || currentPoint.pm2_5 > 200) {
        severity = 'Critical';
        potentialCause = 'Severe biomass combustion, industrial discharge spike, or stagnant thermal inversion layer.';
      } else if (percentageSpike > 75) {
        severity = 'Severe';
        potentialCause = 'Significant rush-hour emissions combined with low atmospheric boundary layer mixing.';
      }

      anomalies.push({
        time: currentPoint.time,
        pollutant: 'PM2.5',
        value: Math.round(currentPoint.pm2_5),
        baseline: Math.round(avgPm25),
        percentageSpike,
        severity,
        potentialCause,
      });
    }
  }

  // Return most recent notable anomalies (capped to top 5)
  return anomalies.slice(-5).reverse();
}
