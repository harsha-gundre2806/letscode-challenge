import { CommuteExposureResult, HourlyDataPoint } from '../types/airQuality';

export interface CommuteInput {
  mode: 'walking' | 'cycling' | 'driving' | 'transit';
  durationMinutes: number;
  currentPm25: number;
  forecast?: HourlyDataPoint[];
}

export function calculatePersonalExposure(input: CommuteInput): CommuteExposureResult {
  const { mode, durationMinutes, currentPm25, forecast } = input;

  // Minute ventilation rates (L/min converted to m³/min)
  let ventilationRateLpm = 16;
  let filtrationFactor = 1.0; // 1.0 = direct open air

  switch (mode) {
    case 'walking':
      ventilationRateLpm = 16;
      filtrationFactor = 1.0;
      break;
    case 'cycling':
      ventilationRateLpm = 36; // Vigorous cardiovascular exertion
      filtrationFactor = 1.0;
      break;
    case 'driving':
      ventilationRateLpm = 7.5;
      filtrationFactor = 0.35; // Closed car AC cabin filter
      break;
    case 'transit':
      ventilationRateLpm = 10;
      filtrationFactor = 0.55; // Rail/bus filtration and sheltered waiting
      break;
  }

  const ventilationRateM3PerMin = ventilationRateLpm / 1000;
  
  // Total micrograms PM2.5 absorbed
  const inhaledDoseMicrograms = Number(
    (currentPm25 * ventilationRateM3PerMin * durationMinutes * filtrationFactor).toFixed(1)
  );

  // WHO guideline daily benchmark: 225 µg (15 µg/m³ * 15 m³/day normal respiration)
  const dailyBenchmarkMicrograms = 225;
  const dailyThresholdPercent = Math.min(999, Math.round((inhaledDoseMicrograms / dailyBenchmarkMicrograms) * 100));

  let riskRating: 'Low' | 'Moderate' | 'Elevated' | 'Severe' = 'Low';
  if (dailyThresholdPercent > 70) riskRating = 'Severe';
  else if (dailyThresholdPercent > 40) riskRating = 'Elevated';
  else if (dailyThresholdPercent > 15) riskRating = 'Moderate';

  // Find better window from forecast if available
  let betterWindowRecommendation: string | undefined;
  if (forecast && forecast.length >= 6) {
    const nextHours = forecast.slice(0, 12);
    const sortedByPm25 = [...nextHours].sort((a, b) => a.pm2_5 - b.pm2_5);
    const bestHour = sortedByPm25[0];

    if (bestHour && bestHour.pm2_5 < currentPm25 * 0.75) {
      const reduction = Math.round(((currentPm25 - bestHour.pm2_5) / currentPm25) * 100);
      const timeStr = new Date(bestHour.time).toLocaleTimeString('en-US', { hour: 'numeric', hour12: true });
      betterWindowRecommendation = `Shift commute to ${timeStr} to reduce your inhaled particulate burden by ~${reduction}%.`;
    }
  }

  return {
    mode,
    durationMinutes,
    hourlyPm25: currentPm25,
    ventilationRateLpm,
    filtrationEfficiency: Math.round((1 - filtrationFactor) * 100),
    inhaledDoseMicrograms,
    dailyThresholdPercent,
    riskRating,
    betterWindowRecommendation,
  };
}
