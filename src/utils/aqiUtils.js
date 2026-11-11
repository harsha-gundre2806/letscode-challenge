export const AQI_LEVELS = [
  {
    category: 'Good',
    min: 0,
    max: 50,
    label: 'Good Air',
    badgeBg: 'bg-emerald-50 dark:bg-emerald-950/40',
    badgeText: 'text-emerald-700 dark:text-emerald-300',
    borderColor: 'border-emerald-300 dark:border-emerald-700',
    accentColor: '#10B981',
    description: 'Air quality is satisfactory and poses little to no health risk.',
    generalHealthAdvisory: 'Ideal conditions for all outdoor activities and natural room ventilation.',
  },
  {
    category: 'Moderate',
    min: 51,
    max: 100,
    label: 'Moderate',
    badgeBg: 'bg-amber-50 dark:bg-amber-950/40',
    badgeText: 'text-amber-700 dark:text-amber-300',
    borderColor: 'border-amber-300 dark:border-amber-700',
    accentColor: '#F59E0B',
    description: 'Air quality is acceptable. However, unusually sensitive individuals may experience mild respiratory symptoms.',
    generalHealthAdvisory: 'Safe for most people. Sensitive individuals should consider reducing prolonged heavy outdoor exertion.',
  },
  {
    category: 'Unhealthy for Sensitive Groups',
    min: 101,
    max: 150,
    label: 'Unhealthy for Sensitive',
    badgeBg: 'bg-orange-50 dark:bg-orange-950/40',
    badgeText: 'text-orange-700 dark:text-orange-300',
    borderColor: 'border-orange-300 dark:border-orange-700',
    accentColor: '#F97316',
    description: 'Members of sensitive groups may experience adverse health effects. General public is less likely to be affected.',
    generalHealthAdvisory: 'Active children, elderly, and adults with respiratory diseases should limit prolonged outdoor exertion.',
  },
  {
    category: 'Unhealthy',
    min: 151,
    max: 200,
    label: 'Unhealthy',
    badgeBg: 'bg-rose-50 dark:bg-rose-950/40',
    badgeText: 'text-rose-700 dark:text-rose-300',
    borderColor: 'border-rose-300 dark:border-rose-700',
    accentColor: '#EF4444',
    description: 'Everyone may begin to experience health effects; members of sensitive groups may experience more serious effects.',
    generalHealthAdvisory: 'Wear an N95 mask outdoors, close windows, and run indoor HEPA purifiers. Avoid outdoor endurance exercise.',
  },
  {
    category: 'Very Unhealthy',
    min: 201,
    max: 300,
    label: 'Very Unhealthy',
    badgeBg: 'bg-purple-50 dark:bg-purple-950/40',
    badgeText: 'text-purple-700 dark:text-purple-300',
    borderColor: 'border-purple-300 dark:border-purple-700',
    accentColor: '#8B5CF6',
    description: 'Health alert: The risk of health effects is substantially increased for everyone in the population.',
    generalHealthAdvisory: 'Significant risk. Keep all windows sealed. High-efficiency air purifiers mandatory indoors. Avoid any outdoor workouts.',
  },
  {
    category: 'Hazardous',
    min: 301,
    max: 999,
    label: 'Hazardous Emergency',
    badgeBg: 'bg-red-950 dark:bg-red-950',
    badgeText: 'text-red-200 dark:text-red-200',
    borderColor: 'border-red-600 dark:border-red-500',
    accentColor: '#991B1B',
    description: 'Health warning of emergency conditions: The entire population is likely to be affected by serious adverse symptoms.',
    generalHealthAdvisory: 'Emergency alert. Stay strictly indoors. Activate maximum indoor filtration. Consult medical professionals if experiencing chest tightness.',
  },
];

export function getAQICategory(aqi, profile = 'General') {
  let effectiveAqi = aqi;
  if (profile === 'Asthmatic' || profile === 'Child') {
    effectiveAqi = aqi * 1.35;
  } else if (profile === 'Senior' || profile === 'Pregnant') {
    effectiveAqi = aqi * 1.2;
  } else if (profile === 'Athlete') {
    effectiveAqi = aqi * 1.15;
  }

  for (const level of AQI_LEVELS) {
    if (effectiveAqi <= level.max) {
      return level;
    }
  }
  return AQI_LEVELS[AQI_LEVELS.length - 1];
}

// -------------------------------------------------------------
// Official US EPA Piecewise AQI Calculation Engine (40 CFR Part 58)
// -------------------------------------------------------------
function interpolateAQI(c, cLo, cHi, iLo, iHi) {
  return Math.round(((iHi - iLo) / (cHi - cLo)) * (c - cLo) + iLo);
}

// Breakpoints for PM2.5 in µg/m³
const EPA_PM25_BREAKPOINTS = [
  { cLo: 0.0, cHi: 12.0, iLo: 0, iHi: 50 },
  { cLo: 12.1, cHi: 35.4, iLo: 51, iHi: 100 },
  { cLo: 35.5, cHi: 55.4, iLo: 101, iHi: 150 },
  { cLo: 55.5, cHi: 150.4, iLo: 151, iHi: 200 },
  { cLo: 150.5, cHi: 250.4, iLo: 201, iHi: 300 },
  { cLo: 250.5, cHi: 350.4, iLo: 301, iHi: 400 },
  { cLo: 350.5, cHi: 500.4, iLo: 401, iHi: 500 },
];

// Breakpoints for PM10 in µg/m³
const EPA_PM10_BREAKPOINTS = [
  { cLo: 0, cHi: 54, iLo: 0, iHi: 50 },
  { cLo: 55, cHi: 154, iLo: 51, iHi: 100 },
  { cLo: 155, cHi: 254, iLo: 101, iHi: 150 },
  { cLo: 255, cHi: 354, iLo: 151, iHi: 200 },
  { cLo: 355, cHi: 424, iLo: 201, iHi: 300 },
  { cLo: 425, cHi: 504, iLo: 301, iHi: 400 },
  { cLo: 505, cHi: 604, iLo: 401, iHi: 500 },
];

// Breakpoints for Ozone (O3) in µg/m³
const EPA_O3_BREAKPOINTS = [
  { cLo: 0, cHi: 108, iLo: 0, iHi: 50 },
  { cLo: 109, cHi: 140, iLo: 51, iHi: 100 },
  { cLo: 141, cHi: 170, iLo: 101, iHi: 150 },
  { cLo: 171, cHi: 210, iLo: 151, iHi: 200 },
  { cLo: 211, cHi: 400, iLo: 201, iHi: 300 },
];

// Breakpoints for NO2 in µg/m³
const EPA_NO2_BREAKPOINTS = [
  { cLo: 0, cHi: 100, iLo: 0, iHi: 50 },
  { cLo: 101, cHi: 188, iLo: 51, iHi: 100 },
  { cLo: 189, cHi: 677, iLo: 101, iHi: 150 },
  { cLo: 678, cHi: 1220, iLo: 151, iHi: 200 },
];

// Breakpoints for SO2 in µg/m³
const EPA_SO2_BREAKPOINTS = [
  { cLo: 0, cHi: 92, iLo: 0, iHi: 50 },
  { cLo: 93, cHi: 197, iLo: 51, iHi: 100 },
  { cLo: 198, cHi: 485, iLo: 101, iHi: 150 },
  { cLo: 486, cHi: 797, iLo: 151, iHi: 200 },
];

// Breakpoints for CO in µg/m³
const EPA_CO_BREAKPOINTS = [
  { cLo: 0, cHi: 5000, iLo: 0, iHi: 50 },
  { cLo: 5001, cHi: 10800, iLo: 51, iHi: 100 },
  { cLo: 10801, cHi: 14200, iLo: 101, iHi: 150 },
  { cLo: 14201, cHi: 17600, iLo: 151, iHi: 200 },
];

function calculateSubIndex(val, breakpoints) {
  if (val == null || isNaN(val) || val <= 0) return 0;
  for (const b of breakpoints) {
    if (val <= b.cHi) {
      return interpolateAQI(val, b.cLo, b.cHi, b.iLo, b.iHi);
    }
  }
  const last = breakpoints[breakpoints.length - 1];
  return Math.min(999, Math.round(last.iHi + (val - last.cHi)));
}

/**
 * Calculates verified US EPA AQI across all criteria pollutants,
 * returning the maximum sub-index and identifying the dominant pollutant.
 */
export function calculateEPAAQI(pollutants = {}) {
  const subIndices = {
    pm2_5: calculateSubIndex(pollutants.pm2_5, EPA_PM25_BREAKPOINTS),
    pm10: calculateSubIndex(pollutants.pm10, EPA_PM10_BREAKPOINTS),
    ozone: calculateSubIndex(pollutants.ozone, EPA_O3_BREAKPOINTS),
    nitrogen_dioxide: calculateSubIndex(pollutants.nitrogen_dioxide, EPA_NO2_BREAKPOINTS),
    sulphur_dioxide: calculateSubIndex(pollutants.sulphur_dioxide, EPA_SO2_BREAKPOINTS),
    carbon_monoxide: calculateSubIndex(pollutants.carbon_monoxide, EPA_CO_BREAKPOINTS),
  };

  const labels = {
    pm2_5: 'PM2.5 (Fine Particulates)',
    pm10: 'PM10 (Coarse Inhalables)',
    ozone: 'Ozone (O3)',
    nitrogen_dioxide: 'Nitrogen Dioxide (NO2)',
    sulphur_dioxide: 'Sulphur Dioxide (SO2)',
    carbon_monoxide: 'Carbon Monoxide (CO)',
  };

  let maxAqi = 0;
  let dominantKey = 'pm2_5';

  for (const [key, val] of Object.entries(subIndices)) {
    if (val > maxAqi) {
      maxAqi = val;
      dominantKey = key;
    }
  }

  return {
    aqi: maxAqi,
    dominantKey,
    dominantLabel: labels[dominantKey] || 'PM2.5',
    subIndices,
  };
}

// -------------------------------------------------------------
// Indian CPCB National Air Quality Index (NAQI) Engine
// -------------------------------------------------------------
const CPCB_PM25_BREAKPOINTS = [
  { cLo: 0, cHi: 30, iLo: 0, iHi: 50 },
  { cLo: 31, cHi: 60, iLo: 51, iHi: 100 },
  { cLo: 61, cHi: 90, iLo: 101, iHi: 200 },
  { cLo: 91, cHi: 120, iLo: 201, iHi: 300 },
  { cLo: 121, cHi: 250, iLo: 301, iHi: 400 },
  { cLo: 251, cHi: 500, iLo: 401, iHi: 500 },
];

const CPCB_PM10_BREAKPOINTS = [
  { cLo: 0, cHi: 50, iLo: 0, iHi: 50 },
  { cLo: 51, cHi: 100, iLo: 51, iHi: 100 },
  { cLo: 101, cHi: 250, iLo: 101, iHi: 200 },
  { cLo: 251, cHi: 350, iLo: 201, iHi: 300 },
  { cLo: 351, cHi: 430, iLo: 301, iHi: 400 },
  { cLo: 431, cHi: 600, iLo: 401, iHi: 500 },
];

export function calculateIndianNAQI(pollutants = {}) {
  const pm25Sub = calculateSubIndex(pollutants.pm2_5, CPCB_PM25_BREAKPOINTS);
  const pm10Sub = calculateSubIndex(pollutants.pm10, CPCB_PM10_BREAKPOINTS);
  return {
    aqi: Math.max(pm25Sub, pm10Sub),
    pm25Sub,
    pm10Sub,
  };
}

export function getProfileHealthWarning(profile, aqi) {
  switch (profile) {
    case 'Asthmatic':
      if (aqi > 100) {
        return {
          badgeTitle: 'Asthma Vulnerability Alert',
          warningText: 'Bronchial irritation risk is elevated. Keep rescue inhaler (albuterol) accessible. Minimize outdoor exposure.',
          severity: aqi > 180 ? 'critical' : 'high',
        };
      }
      return {
        badgeTitle: 'Asthma Safe Window',
        warningText: 'Current particulate levels within tolerable baseline. Normal inhaler maintenance sufficient.',
        severity: 'low',
      };
    case 'Senior':
      if (aqi > 100) {
        return {
          badgeTitle: 'Senior Cardiovascular Advisory',
          warningText: 'Fine particulate matter increases blood pressure and cardiac load. Stay in temperature and air-filtered rooms.',
          severity: aqi > 150 ? 'critical' : 'moderate',
        };
      }
      return {
        badgeTitle: 'Senior Friendly Air',
        warningText: 'Gentle outdoor walks are suitable at current ambient levels.',
        severity: 'low',
      };
    case 'Pregnant':
      if (aqi > 80) {
        return {
          badgeTitle: 'Maternal Protection Protocol',
          warningText: 'PM2.5 can cross placental boundaries. Use N95 mask if outdoors is necessary. Hydrate thoroughly.',
          severity: aqi > 140 ? 'critical' : 'high',
        };
      }
      return {
        badgeTitle: 'Maternal Safe Baseline',
        warningText: 'Air pollution poses minimal risk to fetal health right now.',
        severity: 'low',
      };
    case 'Athlete':
      if (aqi > 120) {
        return {
          badgeTitle: 'Endurance Exertion Warning',
          warningText: 'High tidal lung volume will ingest up to 8x normal particulate matter. Shift training indoors or defer.',
          severity: aqi > 160 ? 'critical' : 'high',
        };
      }
      return {
        badgeTitle: 'Optimal Training Conditions',
        warningText: 'Air conditions are suitable for high-intensity cardiovascular training.',
        severity: 'low',
      };
    case 'Child':
      if (aqi > 90) {
        return {
          badgeTitle: 'Pediatric Lung Shield',
          warningText: 'Children breathe more air per pound of body weight. Restrict playground sports to clean indoor facilities.',
          severity: aqi > 150 ? 'critical' : 'high',
        };
      }
      return {
        badgeTitle: 'Child Outdoor Play Safe',
        warningText: 'Outdoor activities and playground sports are safe.',
        severity: 'low',
      };
    default:
      if (aqi > 150) {
        return {
          badgeTitle: 'General Population Alert',
          warningText: 'Avoid prolonged outdoor exertion. Sensitive groups should remain indoors with air filtration.',
          severity: 'high',
        };
      }
      return {
        badgeTitle: 'Standard Advisory',
        warningText: 'Standard outdoor activities can be enjoyed without protective equipment.',
        severity: 'low',
      };
  }
}

export function formatDateTime(isoString) {
  try {
    const d = new Date(isoString);
    return d.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  } catch {
    return isoString;
  }
}

export function formatHour(isoString) {
  try {
    const d = new Date(isoString);
    return d.toLocaleTimeString('en-US', {
      hour: 'numeric',
      hour12: true,
    });
  } catch {
    return isoString;
  }
}
