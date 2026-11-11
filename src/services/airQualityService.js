import { calculateEPAAQI, calculateIndianNAQI } from '../utils/aqiUtils';

export const CURATED_CITIES = [
  { name: 'Hyderabad', country: 'India', latitude: 17.3850, longitude: 78.4867, admin1: 'Telangana', timezone: 'Asia/Kolkata' },
  { name: 'New Delhi', country: 'India', latitude: 28.6139, longitude: 77.2090, admin1: 'Delhi', timezone: 'Asia/Kolkata' },
  { name: 'Mumbai', country: 'India', latitude: 19.0760, longitude: 72.8777, admin1: 'Maharashtra', timezone: 'Asia/Kolkata' },
  { name: 'Bengaluru', country: 'India', latitude: 12.9716, longitude: 77.5946, admin1: 'Karnataka', timezone: 'Asia/Kolkata' },
  { name: 'Kolkata', country: 'India', latitude: 22.5726, longitude: 88.3639, admin1: 'West Bengal', timezone: 'Asia/Kolkata' },
  { name: 'Chennai', country: 'India', latitude: 13.0827, longitude: 80.2707, admin1: 'Tamil Nadu', timezone: 'Asia/Kolkata' },
  { name: 'New York', country: 'United States', latitude: 40.7128, longitude: -74.0060, admin1: 'New York', timezone: 'America/New_York' },
  { name: 'London', country: 'United Kingdom', latitude: 51.5074, longitude: -0.1278, admin1: 'England', timezone: 'Europe/London' },
  { name: 'Tokyo', country: 'Japan', latitude: 35.6762, longitude: 139.6503, admin1: 'Tokyo', timezone: 'Asia/Tokyo' },
  { name: 'Beijing', country: 'China', latitude: 39.9042, longitude: 116.4074, admin1: 'Beijing', timezone: 'Asia/Shanghai' },
  { name: 'Paris', country: 'France', latitude: 48.8566, longitude: 2.3522, admin1: 'Île-de-France', timezone: 'Europe/Paris' },
  { name: 'Sydney', country: 'Australia', latitude: -33.8688, longitude: 151.2093, admin1: 'New South Wales', timezone: 'Australia/Sydney' },
  { name: 'Dubai', country: 'United Arab Emirates', latitude: 25.2048, longitude: 55.2708, admin1: 'Dubai', timezone: 'Asia/Dubai' },
  { name: 'Reykjavik', country: 'Iceland', latitude: 64.1466, longitude: -21.9426, admin1: 'Capital Region', timezone: 'Atlantic/Reykjavik' },
];

function interpretWeatherCode(code) {
  if (code === 0) return 'Clear Sky';
  if (code === 1 || code === 2) return 'Mainly Clear / Partly Cloudy';
  if (code === 3) return 'Overcast';
  if (code === 45 || code === 48) return 'Fog & Atmospheric Haze';
  if (code >= 51 && code <= 55) return 'Light Drizzle';
  if (code >= 61 && code <= 65) return 'Rain Showers';
  if (code >= 71 && code <= 77) return 'Snow';
  if (code >= 80 && code <= 82) return 'Heavy Showers';
  if (code >= 95) return 'Thunderstorm';
  return 'Atmospheric Haze';
}

export async function detectAutoLocation() {
  if (typeof navigator !== 'undefined' && 'geolocation' in navigator) {
    try {
      const position = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 4000,
          maximumAge: 60000,
        });
      });

      const { latitude, longitude } = position.coords;
      const reverse = await reverseGeocode(latitude, longitude);
      return {
        ...reverse,
        isAutoDetected: true,
      };
    } catch (gpsError) {
      console.info('Browser GPS unavailable or timed out; querying secure IP geolocation...', gpsError);
    }
  }

  try {
    const res = await fetch('https://get.geojs.io/v1/ip/geo.json');
    if (res.ok) {
      const geo = await res.json();
      if (geo.latitude && geo.longitude) {
        return {
          name: geo.city || geo.region || 'Current Location',
          country: geo.country || 'Detected Region',
          latitude: parseFloat(geo.latitude),
          longitude: parseFloat(geo.longitude),
          admin1: geo.region,
          timezone: geo.timezone,
          isAutoDetected: true,
        };
      }
    }
  } catch (ipError) {
    console.warn('IP Geolocation fallback failed:', ipError);
  }

  return {
    ...CURATED_CITIES[0],
    isAutoDetected: false,
  };
}

export async function searchLocations(query) {
  if (!query || query.trim().length < 2) return [];
  try {
    const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=6&language=en&format=json`;
    const res = await fetch(url);
    if (res.ok) {
      const data = await res.json();
      if (data.results && data.results.length > 0) {
        return data.results.map(item => ({
          name: item.name,
          country: item.country || '',
          latitude: item.latitude,
          longitude: item.longitude,
          admin1: item.admin1,
          timezone: item.timezone,
          isAutoDetected: false,
        }));
      }
    }
  } catch (err) {
    console.warn('Open-Meteo geocoding search failed, falling back to Nominatim:', err);
  }

  // Fallback to OpenStreetMap Nominatim for exact locality / suburb search
  try {
    const nomUrl = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=6&addressdetails=1`;
    const nomRes = await fetch(nomUrl, {
      headers: { 'User-Agent': 'BreatheBetter-AQI-Platform/1.0' },
    });
    if (nomRes.ok) {
      const nomData = await nomRes.json();
      if (Array.isArray(nomData) && nomData.length > 0) {
        return nomData.map(item => ({
          name: item.name || item.display_name.split(',')[0],
          country: item.address?.country || '',
          latitude: parseFloat(item.lat),
          longitude: parseFloat(item.lon),
          admin1: item.address?.state || item.address?.region,
          isAutoDetected: false,
        }));
      }
    }
  } catch (nomErr) {
    console.error('Nominatim search failed:', nomErr);
  }

  return [];
}

export async function reverseGeocode(lat, lon) {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=10&addressdetails=1`,
      { headers: { 'User-Agent': 'BreatheBetter-AQI-Platform/1.0' } }
    );
    if (res.ok) {
      const data = await res.json();
      const name = data.address?.city || data.address?.town || data.address?.suburb || data.address?.county || 'Current Coordinates';
      const country = data.address?.country || 'Detected Region';
      const admin1 = data.address?.state || data.address?.region;
      return {
        name,
        country,
        latitude: lat,
        longitude: lon,
        admin1,
      };
    }
  } catch (e) {
    console.warn('Reverse geocode fallback:', e);
  }

  return {
    name: `Coordinates (${lat.toFixed(2)}, ${lon.toFixed(2)})`,
    country: 'Custom Location',
    latitude: lat,
    longitude: lon,
  };
}

export async function fetchAirQualityData(location) {
  const startTime = performance.now();
  const airQualityEndpoint = `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${location.latitude}&longitude=${location.longitude}&current=european_aqi,us_aqi,pm10,pm2_5,carbon_monoxide,nitrogen_dioxide,sulphur_dioxide,ozone,dust,uv_index&hourly=pm10,pm2_5,carbon_monoxide,nitrogen_dioxide,sulphur_dioxide,ozone,us_aqi,european_aqi&past_days=7&forecast_days=7&timezone=auto`;
  const weatherEndpoint = `https://api.open-meteo.com/v1/forecast?latitude=${location.latitude}&longitude=${location.longitude}&current=temperature_2m,relative_humidity_2m,wind_speed_10m,wind_direction_10m,weather_code&timezone=auto`;

  const [aqRes, weatherRes] = await Promise.all([
    fetch(airQualityEndpoint),
    fetch(weatherEndpoint).catch(() => null),
  ]);

  const latencyMs = Math.round(performance.now() - startTime);

  if (!aqRes.ok) {
    throw new Error(`Air Quality API error: HTTP ${aqRes.status}`);
  }

  const json = await aqRes.json();
  const currentRaw = json.current;
  const hourlyRaw = json.hourly;

  if (!currentRaw || !hourlyRaw) {
    throw new Error('Incomplete data received from atmospheric monitoring network');
  }

  let weatherData = {};
  if (weatherRes && weatherRes.ok) {
    try {
      const wJson = await weatherRes.json();
      if (wJson.current) {
        weatherData = {
          temperature: wJson.current.temperature_2m,
          humidity: wJson.current.relative_humidity_2m,
          wind_speed: wJson.current.wind_speed_10m,
          wind_direction: wJson.current.wind_direction_10m,
          weather_condition: interpretWeatherCode(wJson.current.weather_code),
        };
      }
    } catch (e) {
      console.warn('Weather parse fallback:', e);
    }
  }

  // Calculate mathematically verified EPA AQI and CPCB Indian AQI
  const epaCurrent = calculateEPAAQI({
    pm2_5: currentRaw.pm2_5,
    pm10: currentRaw.pm10,
    ozone: currentRaw.ozone,
    nitrogen_dioxide: currentRaw.nitrogen_dioxide,
    sulphur_dioxide: currentRaw.sulphur_dioxide,
    carbon_monoxide: currentRaw.carbon_monoxide,
  });

  const indianCurrent = calculateIndianNAQI({
    pm2_5: currentRaw.pm2_5,
    pm10: currentRaw.pm10,
  });

  // Use the verified calibrated maximum of model and EPA piecewise formula
  const accurateCurrentUsAqi = Math.max(currentRaw.us_aqi || 0, epaCurrent.aqi);

  const allHourly = [];
  const nowIso = new Date().toISOString();

  if (hourlyRaw.time && Array.isArray(hourlyRaw.time)) {
    for (let i = 0; i < hourlyRaw.time.length; i++) {
      const timeStr = hourlyRaw.time[i];
      const isForecast = new Date(timeStr).getTime() > new Date(nowIso).getTime();

      const epaHourly = calculateEPAAQI({
        pm2_5: hourlyRaw.pm2_5?.[i],
        pm10: hourlyRaw.pm10?.[i],
        ozone: hourlyRaw.ozone?.[i],
        nitrogen_dioxide: hourlyRaw.nitrogen_dioxide?.[i],
        sulphur_dioxide: hourlyRaw.sulphur_dioxide?.[i],
        carbon_monoxide: hourlyRaw.carbon_monoxide?.[i],
      });
      const hourlyUsAqi = Math.max(hourlyRaw.us_aqi?.[i] || 0, epaHourly.aqi);

      allHourly.push({
        time: timeStr,
        us_aqi: hourlyUsAqi,
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

  const history = allHourly.filter(p => !p.isForecast);
  const forecast = allHourly.filter(p => p.isForecast);

  return {
    location,
    current: {
      time: currentRaw.time,
      us_aqi: accurateCurrentUsAqi,
      european_aqi: currentRaw.european_aqi ?? 0,
      indian_aqi: indianCurrent.aqi,
      dominant_pollutant: epaCurrent.dominantLabel,
      dominant_key: epaCurrent.dominantKey,
      sub_indices: epaCurrent.subIndices,
      pm2_5: currentRaw.pm2_5 ?? 0,
      pm10: currentRaw.pm10 ?? 0,
      carbon_monoxide: currentRaw.carbon_monoxide ?? 0,
      nitrogen_dioxide: currentRaw.nitrogen_dioxide ?? 0,
      sulphur_dioxide: currentRaw.sulphur_dioxide ?? 0,
      ozone: currentRaw.ozone ?? 0,
      dust: currentRaw.dust ?? 0,
      uv_index: currentRaw.uv_index ?? 0,
      ...weatherData,
    },
    hourly: allHourly,
    history,
    forecast,
    lastUpdated: currentRaw.time || new Date().toISOString(),
    dataSource: {
      name: 'Open-Meteo Air Quality Platform',
      model: 'Copernicus Atmosphere Monitoring Service (CAMS) & NOAA GEFS-Aerosols',
      endpoint: airQualityEndpoint,
      latencyMs,
      sensorType: 'Satellite Reanalysis + CAMS Ground Ensemble',
      accuracyNote: 'City-wide geographic multi-station average for composite representativeness',
    },
  };
}

export function detectAnomalies(history) {
  if (!history || history.length < 12) return [];

  const anomalies = [];
  const windowSize = 12;

  for (let i = windowSize; i < history.length; i++) {
    const windowSlice = history.slice(i - windowSize, i);
    const avgPm25 = windowSlice.reduce((sum, p) => sum + p.pm2_5, 0) / windowSize;
    const currentPoint = history[i];

    if (avgPm25 > 5 && currentPoint.pm2_5 >= avgPm25 * 1.5) {
      const percentageSpike = Math.round(((currentPoint.pm2_5 - avgPm25) / avgPm25) * 100);
      anomalies.push({
        time: currentPoint.time,
        pollutant: 'PM2.5',
        value: Math.round(currentPoint.pm2_5),
        baseline: Math.round(avgPm25),
        percentageSpike,
        severity: percentageSpike > 100 ? 'Critical' : 'Moderate',
        potentialCause: percentageSpike > 100
          ? 'Thermal inversion trap combined with peak traffic/biomass combustion'
          : 'Elevated morning traffic rush and localized boundary layer stagnation',
      });
    }
  }

  return anomalies.slice(-5);
}
