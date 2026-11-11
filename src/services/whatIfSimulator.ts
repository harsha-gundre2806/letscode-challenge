import { HourlyDataPoint, WhatIfSimulationResult } from '../types/airQuality';
import { getAQICategory } from '../utils/aqiUtils';

export interface WhatIfParams {
  trafficReduction: number;   // 0 - 60%
  industrialControl: number;  // 0 - 50%
  greenCoverIncrease: number; // 0 - 40%
  windDispersion: number;     // -30% to +30%
}

export function simulatePolicyIntervention(
  forecast: HourlyDataPoint[],
  params: WhatIfParams
): WhatIfSimulationResult {
  // Use up to 48 hours of forecast
  const hours = forecast.slice(0, 48);
  if (hours.length === 0) {
    return {
      baselineCurve: [],
      simulatedCurve: [],
      averageReductionPercent: 0,
      projectedCategory: 'Moderate',
    };
  }

  // Atmospheric contribution weightings:
  // Vehicular transport: ~35% of urban PM2.5
  // Industrial & construction: ~30%
  // Dry deposition / bio-filtration by urban greenery: up to ~15%
  // Wind / atmospheric dispersion factor: modulates clearance speed
  const transportFraction = 0.35;
  const industrialFraction = 0.30;
  const greenDepositionFactor = 0.15;

  const baselineCurve: { time: string; pm25: number }[] = [];
  const simulatedCurve: { time: string; pm25: number }[] = [];
  let totalBaselinePm25 = 0;
  let totalSimulatedPm25 = 0;

  hours.forEach(point => {
    const basePm = point.pm2_5;
    totalBaselinePm25 += basePm;

    // Reductions
    const trafficMitigation = (params.trafficReduction / 100) * transportFraction;
    const industrialMitigation = (params.industrialControl / 100) * industrialFraction;
    const greenMitigation = (params.greenCoverIncrease / 100) * greenDepositionFactor;
    
    // Wind factor (> 0 clears air faster, < 0 traps inversion)
    const windEffect = 1 - (params.windDispersion / 100) * 0.25;

    // Net multiplier (clamped to sensible physics: cannot fall below 15% natural background)
    const combinedReductionRatio = Math.max(0.20, 1 - (trafficMitigation + industrialMitigation + greenMitigation));
    const simulatedPm = Math.max(5, Number((basePm * combinedReductionRatio * windEffect).toFixed(1)));

    totalSimulatedPm25 += simulatedPm;

    const formattedTime = new Date(point.time).toLocaleTimeString('en-US', {
      weekday: 'short',
      hour: 'numeric',
      hour12: true,
    });

    baselineCurve.push({ time: formattedTime, pm25: Math.round(basePm) });
    simulatedCurve.push({ time: formattedTime, pm25: Math.round(simulatedPm) });
  });

  const avgBaseline = totalBaselinePm25 / hours.length;
  const avgSimulated = totalSimulatedPm25 / hours.length;
  const averageReductionPercent = Math.max(0, Math.round(((avgBaseline - avgSimulated) / (avgBaseline || 1)) * 100));

  // Convert simulated average PM2.5 to approx AQI for category determination
  // EPA approx: PM2.5 of 12 = AQI 50, 35.4 = AQI 100, 55.4 = AQI 150, 150.4 = AQI 200
  let approxAqi = avgSimulated * 2.1;
  if (avgSimulated < 12) approxAqi = (avgSimulated / 12) * 50;
  else if (avgSimulated < 35.5) approxAqi = 50 + ((avgSimulated - 12) / 23.5) * 50;

  const category = getAQICategory(approxAqi).category;

  return {
    baselineCurve,
    simulatedCurve,
    averageReductionPercent,
    projectedCategory: category,
  };
}
