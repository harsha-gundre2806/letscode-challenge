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
