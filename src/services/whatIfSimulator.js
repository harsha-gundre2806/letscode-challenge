import { getAQICategory } from '../utils/aqiUtils';

export function simulatePolicyIntervention(forecast, params) {
  const hours = (forecast || []).slice(0, 48);
  if (hours.length === 0) {
    return {
      baselineCurve: [],
      simulatedCurve: [],
      hourlyProjection: [],
      averageReductionPercent: 0,
      projectedCategory: 'Moderate',
    };
  }

  const transportFraction = 0.35;
  const industrialFraction = 0.30;
  const greenDepositionFactor = 0.15;

  const baselineCurve = [];
  const simulatedCurve = [];
  const hourlyProjection = [];
  let totalBaselinePm25 = 0;
  let totalSimulatedPm25 = 0;

  hours.forEach(point => {
    const basePm = point.pm2_5;
    totalBaselinePm25 += basePm;

    const trafficMitigation = (params.trafficReduction / 100) * transportFraction;
    const industrialMitigation = (params.industrialControl / 100) * industrialFraction;
    const greenMitigation = (params.greenCoverIncrease / 100) * greenDepositionFactor;
    
    const windEffect = 1 - (params.windDispersion / 100) * 0.25;

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
    hourlyProjection.push({
      time: point.time,
      baselinePm25: basePm,
      simulatedPm25: simulatedPm,
    });
  });

  const avgBaseline = totalBaselinePm25 / hours.length;
  const avgSimulated = totalSimulatedPm25 / hours.length;
  const averageReductionPercent = Math.max(0, Math.round(((avgBaseline - avgSimulated) / (avgBaseline || 1)) * 100));

  let approxAqi = avgSimulated * 2.1;
  if (avgSimulated < 12) approxAqi = (avgSimulated / 12) * 50;
  else if (avgSimulated < 35.5) approxAqi = 50 + ((avgSimulated - 12) / 23.5) * 50;

  const category = getAQICategory(approxAqi).category;

  return {
    baselineCurve,
    simulatedCurve,
    hourlyProjection,
    averageReductionPercent,
    projectedCategory: category,
  };
}
