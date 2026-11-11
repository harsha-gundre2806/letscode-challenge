import React, { useState, useMemo } from 'react';
import { AirQualityResponse } from '../../types/airQuality';
import { calculatePersonalExposure } from '../../services/exposureCalculator';
import { 
  Footprints, 
  Bike, 
  Car, 
  Bus, 
  Clock, 
  AlertTriangle, 
  ShieldCheck, 
  CheckCircle2, 
  ArrowRight,
  Sparkles,
  TrendingDown
} from 'lucide-react';

interface ExposureTrackerTabProps {
  airData: AirQualityResponse;
  onNavigateToTab: (tab: any) => void;
}

export const ExposureTrackerTab: React.FC<ExposureTrackerTabProps> = ({
  airData,
  onNavigateToTab,
}) => {
  const [commuteMode, setCommuteMode] = useState<'walking' | 'cycling' | 'driving' | 'transit'>('cycling');
  const [durationMinutes, setDurationMinutes] = useState<number>(30);
  const [tripsCount, setTripsCount] = useState<number>(2); // Round trip

  const singleTripResult = useMemo(() => {
    return calculatePersonalExposure({
      mode: commuteMode,
      durationMinutes,
      currentPm25: airData.current.pm2_5,
      forecast: airData.forecast,
    });
  }, [commuteMode, durationMinutes, airData.current.pm2_5, airData.forecast]);

  const totalDailyDose = Number((singleTripResult.inhaledDoseMicrograms * tripsCount).toFixed(1));
  const totalDailyThresholdPercent = Math.min(999, Math.round((totalDailyDose / 225) * 100));

  const modes: { id: 'walking' | 'cycling' | 'driving' | 'transit'; label: string; icon: React.FC<{ className?: string }>; desc: string }[] = [
    { id: 'cycling', label: 'Bicycle / E-Bike', icon: Bike, desc: 'High tidal volume (36 L/min). Highest particulate intake.' },
    { id: 'walking', label: 'Walking / Jogging', icon: Footprints, desc: 'Moderate respiration (16 L/min). Direct open air.' },
    { id: 'driving', label: 'Personal Car (AC)', icon: Car, desc: 'Low exertion (7.5 L/min). Cabin filter cuts ~65% PM2.5.' },
    { id: 'transit', label: 'Metro / Public Bus', icon: Bus, desc: 'Station exposure + bus filtration factor ~45%.' },
  ];

  return (
    <div className="space-y-6">
      
      {/* Tracker Header */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Footprints className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            <h1 className="text-xl font-bold text-slate-900 dark:text-white">
              Hyper-Local Commute Exposure Life-Log
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Calculating estimated inhaled PM2.5 absorption dosage (µg) based on real-time atmospheric measurements for {airData.location.name}
          </p>
        </div>

        <div className="text-xs font-mono text-slate-500 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700">
          Current Ambient PM2.5: <span className="font-bold text-emerald-600 dark:text-emerald-400">{airData.current.pm2_5} µg/m³</span>
        </div>
      </div>

      {/* Main Calculator Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Input Configuration (2 Cols) */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-6">
          
          {/* Commute Mode Selector */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 block mb-3">
              1. Select Commute Mode:
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {modes.map(m => {
                const Icon = m.icon;
                const isSelected = commuteMode === m.id;
                return (
                  <button
                    key={m.id}
                    onClick={() => setCommuteMode(m.id)}
                    className={`text-left p-3.5 rounded-xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'border-emerald-500 bg-emerald-50/60 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-100 ring-1 ring-emerald-500'
                        : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-850 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-2 font-semibold text-xs">
                      <Icon className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                      <span>{m.label}</span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-snug">
                      {m.desc}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Commute Duration Slider */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                2. Commute Duration (One-Way):
              </label>
              <span className="font-mono text-sm font-bold text-slate-900 dark:text-white">
                {durationMinutes} minutes
              </span>
            </div>
            <input
              type="range"
              min={5}
              max={120}
              step={5}
              value={durationMinutes}
              onChange={e => setDurationMinutes(Number(e.target.value))}
              className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-600"
            />
            <div className="flex justify-between text-[10px] text-slate-400 font-mono mt-1">
              <span>5 mins</span>
              <span>30 mins</span>
              <span>60 mins</span>
              <span>120 mins</span>
            </div>
          </div>

          {/* Daily Frequency */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 block mb-2">
              3. Trips Per Day:
            </label>
            <div className="flex items-center gap-3">
              {[1, 2, 4].map(num => (
                <button
                  key={num}
                  onClick={() => setTripsCount(num)}
                  className={`px-4 py-1.5 text-xs font-semibold rounded-lg border transition-colors cursor-pointer ${
                    tripsCount === num
                      ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 border-transparent'
                      : 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  {num === 1 ? 'One-Way (1)' : num === 2 ? 'Round-Trip (2)' : 'Multiple Commutes (4)'}
                </button>
              ))}
            </div>
          </div>

        </div>

        {/* Right Output Dossier (1 Col) */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 flex flex-col justify-between space-y-6">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-3 border-b border-slate-100 dark:border-slate-800 pb-2">
              Calculated Inhalation Dosage
            </span>

            {/* Inhaled PM2.5 Micrograms */}
            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-850 space-y-2">
              <span className="text-[11px] text-slate-500 font-semibold uppercase block">
                Estimated Inhaled PM2.5 Dose:
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-extrabold font-mono text-slate-900 dark:text-white">
                  {singleTripResult.inhaledDoseMicrograms}
                </span>
                <span className="text-xs text-slate-500 font-bold">µg per trip</span>
              </div>
              <div className="text-[11px] text-slate-500 border-t border-slate-200 dark:border-slate-700 pt-2 flex justify-between">
                <span>Daily Total ({tripsCount} trips):</span>
                <span className="font-mono font-bold text-slate-800 dark:text-slate-200">{totalDailyDose} µg</span>
              </div>
            </div>

            {/* Threshold & Risk Gauge */}
            <div className="mt-4 space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-slate-500">WHO Daily Particulate Benchmark:</span>
                <span className={`font-mono font-bold ${
                  totalDailyThresholdPercent > 70 ? 'text-rose-600' : totalDailyThresholdPercent > 40 ? 'text-amber-600' : 'text-emerald-600'
                }`}>
                  {totalDailyThresholdPercent}% Consumed
                </span>
              </div>
              <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div 
                  className={`h-full rounded-full ${
                    totalDailyThresholdPercent > 70 ? 'bg-rose-500' : totalDailyThresholdPercent > 40 ? 'bg-amber-500' : 'bg-emerald-500'
                  }`}
                  style={{ width: `${Math.min(100, totalDailyThresholdPercent)}%` }}
                />
              </div>
              <span className="text-[10px] text-slate-400 block">
                Benchmark: 225 µg (based on 15 µg/m³ WHO ceiling over 15 m³ daily air intake).
              </span>
            </div>

            {/* Biological Rationale */}
            <div className="mt-4 text-xs text-slate-600 dark:text-slate-400 space-y-1">
              <div className="flex justify-between">
                <span>Minute Ventilation:</span>
                <span className="font-mono font-semibold text-slate-800 dark:text-slate-200">{singleTripResult.ventilationRateLpm} L/min</span>
              </div>
              <div className="flex justify-between">
                <span>Mode Filtration Factor:</span>
                <span className="font-mono font-semibold text-slate-800 dark:text-slate-200">{singleTripResult.filtrationEfficiency}% filtered</span>
              </div>
            </div>
          </div>

          {/* Safer Departure Window Recommendation */}
          {singleTripResult.betterWindowRecommendation ? (
            <div className="p-3.5 rounded-xl border border-emerald-300 dark:border-emerald-800 bg-emerald-50/60 dark:bg-emerald-950/30 text-xs">
              <div className="font-bold text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5 mb-1">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Smart Departure Optimization</span>
              </div>
              <p className="text-emerald-700 dark:text-emerald-400">
                {singleTripResult.betterWindowRecommendation}
              </p>
            </div>
          ) : (
            <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-850 text-xs text-slate-500">
              Current ambient conditions are uniform across upcoming travel hours.
            </div>
          )}

        </div>

      </div>

    </div>
  );
};
