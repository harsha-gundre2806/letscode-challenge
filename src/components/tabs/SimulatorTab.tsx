import React, { useState, useMemo } from 'react';
import { AirQualityResponse } from '../../types/airQuality';
import { simulatePolicyIntervention, WhatIfParams } from '../../services/whatIfSimulator';
import { getAQICategory } from '../../utils/aqiUtils';
import { 
  SlidersHorizontal, 
  Sparkles, 
  Activity, 
  TrendingDown, 
  TreePine, 
  Car, 
  Factory, 
  Wind,
  RotateCcw
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  CartesianGrid, 
  Legend 
} from 'recharts';

interface SimulatorTabProps {
  airData: AirQualityResponse;
  onNavigateToTab: (tab: any) => void;
}

export const SimulatorTab: React.FC<SimulatorTabProps> = ({
  airData,
  onNavigateToTab,
}) => {
  const [params, setParams] = useState<WhatIfParams>({
    trafficReduction: 30,
    industrialControl: 20,
    greenCoverIncrease: 15,
    windDispersion: 0,
  });

  const simulationResult = useMemo(() => {
    return simulatePolicyIntervention(airData.forecast, params);
  }, [airData.forecast, params]);

  // Combine baseline and simulated curves for Recharts
  const chartData = useMemo(() => {
    return simulationResult.baselineCurve.map((base, idx) => {
      const sim = simulationResult.simulatedCurve[idx] || { pm25: base.pm25 };
      return {
        time: base.time,
        baseline: base.pm25,
        simulated: sim.pm25,
      };
    });
  }, [simulationResult]);

  // Pre-configured Policy Presets
  const applyPreset = (preset: 'traffic' | 'industrial' | 'green' | 'comprehensive') => {
    switch (preset) {
      case 'traffic':
        setParams({ trafficReduction: 50, industrialControl: 10, greenCoverIncrease: 5, windDispersion: 0 });
        break;
      case 'industrial':
        setParams({ trafficReduction: 15, industrialControl: 45, greenCoverIncrease: 5, windDispersion: 0 });
        break;
      case 'green':
        setParams({ trafficReduction: 10, industrialControl: 10, greenCoverIncrease: 35, windDispersion: 0 });
        break;
      case 'comprehensive':
        setParams({ trafficReduction: 40, industrialControl: 35, greenCoverIncrease: 25, windDispersion: 10 });
        break;
    }
  };

  const resetParams = () => {
    setParams({
      trafficReduction: 0,
      industrialControl: 0,
      greenCoverIncrease: 0,
      windDispersion: 0,
    });
  };

  return (
    <div className="space-y-6">
      
      {/* Simulator Header */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            <h1 className="text-xl font-bold text-slate-900 dark:text-white">
              Interactive "What-If" Policy Intervention Simulator
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Simulate environmental regulation impacts on 48-hour forecasted PM2.5 levels for {airData.location.name}
          </p>
        </div>

        {/* Reset Button */}
        <button
          onClick={resetParams}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset Sliders</span>
        </button>
      </div>

      {/* Preset Action Chips */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar text-xs">
        <span className="font-semibold text-slate-400 uppercase tracking-wider shrink-0">
          Policy Presets:
        </span>
        <button
          onClick={() => applyPreset('traffic')}
          className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-400 text-slate-700 dark:text-slate-300 font-medium whitespace-nowrap cursor-pointer transition-colors"
        >
          Odd-Even Vehicle Curbs (-50% Traffic)
        </button>
        <button
          onClick={() => applyPreset('industrial')}
          className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-400 text-slate-700 dark:text-slate-300 font-medium whitespace-nowrap cursor-pointer transition-colors"
        >
          Industrial Dust Suppression (-45% Industry)
        </button>
        <button
          onClick={() => applyPreset('green')}
          className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-400 text-slate-700 dark:text-slate-300 font-medium whitespace-nowrap cursor-pointer transition-colors"
        >
          Urban Afforestation (+35% Green Canopy)
        </button>
        <button
          onClick={() => applyPreset('comprehensive')}
          className="px-3 py-1.5 rounded-lg border border-emerald-300 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-200 font-semibold whitespace-nowrap cursor-pointer transition-colors"
        >
          Holistic Clean Air Mandate
        </button>
      </div>

      {/* Interactive Controls & Projected Outcomes Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Sliders Console (2 Cols) */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-6">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100 dark:border-slate-800 pb-2">
            Intervention Parameter Sliders
          </h2>

          {/* Slider 1: Traffic Reduction */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <Car className="w-3.5 h-3.5 text-blue-500" />
                <span>Vehicular Emissions Reduction:</span>
              </span>
              <span className="font-mono font-bold text-slate-900 dark:text-white">
                -{params.trafficReduction}%
              </span>
            </div>
            <input
              type="range"
              min={0}
              max={60}
              step={5}
              value={params.trafficReduction}
              onChange={e => setParams({ ...params, trafficReduction: Number(e.target.value) })}
              className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-600"
            />
            <span className="text-[10px] text-slate-400 block">
              Simulates congestion pricing, odd-even license plates, or zero-emission fleet quotas.
            </span>
          </div>

          {/* Slider 2: Industrial & Construction Control */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <Factory className="w-3.5 h-3.5 text-amber-500" />
                <span>Industrial & Construction Dust Mitigation:</span>
              </span>
              <span className="font-mono font-bold text-slate-900 dark:text-white">
                -{params.industrialControl}%
              </span>
            </div>
            <input
              type="range"
              min={0}
              max={50}
              step={5}
              value={params.industrialControl}
              onChange={e => setParams({ ...params, industrialControl: Number(e.target.value) })}
              className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-600"
            />
            <span className="text-[10px] text-slate-400 block">
              Mandatory mist sprayers at construction sites, stack scrubbers, and temporary brick kiln halts.
            </span>
          </div>

          {/* Slider 3: Green Cover Increase */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <TreePine className="w-3.5 h-3.5 text-emerald-500" />
                <span>Urban Forest & Bio-Filtration Canopy:</span>
              </span>
              <span className="font-mono font-bold text-slate-900 dark:text-white">
                +{params.greenCoverIncrease}%
              </span>
            </div>
            <input
              type="range"
              min={0}
              max={40}
              step={5}
              value={params.greenCoverIncrease}
              onChange={e => setParams({ ...params, greenCoverIncrease: Number(e.target.value) })}
              className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-600"
            />
            <span className="text-[10px] text-slate-400 block">
              Vegetative green buffers along arterial avenues enhance natural aerosol dry deposition.
            </span>
          </div>

          {/* Slider 4: Atmospheric Dispersion (Wind) */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <Wind className="w-3.5 h-3.5 text-indigo-500" />
                <span>Atmospheric Wind Dispersion Anomaly:</span>
              </span>
              <span className="font-mono font-bold text-slate-900 dark:text-white">
                {params.windDispersion > 0 ? `+${params.windDispersion}%` : `${params.windDispersion}%`}
              </span>
            </div>
            <input
              type="range"
              min={-30}
              max={30}
              step={5}
              value={params.windDispersion}
              onChange={e => setParams({ ...params, windDispersion: Number(e.target.value) })}
              className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-600"
            />
            <span className="text-[10px] text-slate-400 block">
              Negative values simulate thermal inversion smog traps; positive values simulate high ventilation winds.
            </span>
          </div>

        </div>

        {/* Projected Outcome Card (1 Col) */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block border-b border-slate-100 dark:border-slate-800 pb-2">
              Projected 48h Outcome
            </span>

            {/* Average Reduction Metric */}
            <div className="p-4 rounded-xl border border-emerald-300 dark:border-emerald-800 bg-emerald-50/50 dark:bg-emerald-950/20 text-center">
              <span className="text-[10px] text-emerald-800 dark:text-emerald-400 uppercase font-bold block">
                Projected PM2.5 Reduction
              </span>
              <div className="text-4xl font-black font-mono text-emerald-700 dark:text-emerald-300 my-1">
                -{simulationResult.averageReductionPercent}%
              </div>
              <span className="text-xs text-slate-600 dark:text-slate-300">
                Average across next 48 forecast hours
              </span>
            </div>

            {/* Shift in Severity Category */}
            <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-850 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Current Forecast Tier:</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  {getAQICategory(airData.current.us_aqi).label}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Projected Policy Tier:</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">
                  {simulationResult.projectedCategory}
                </span>
              </div>
            </div>

            <p className="text-xs text-slate-500 leading-relaxed">
              Based on urban aerosol source-apportionment models (35% transport fraction, 30% industrial/construction, 15% green biological uptake).
            </p>
          </div>

          <button
            onClick={() => onNavigateToTab('assistant')}
            className="w-full py-2 px-3 text-xs font-semibold rounded-lg bg-slate-900 text-white dark:bg-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors cursor-pointer text-center"
          >
            Ask BreatheAI About This Scenario
          </button>
        </div>

      </div>

      {/* Comparative 48h Projection Curve (Recharts) */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              48-Hour Continuous Simulation Curve (Baseline vs Simulated PM2.5)
            </h2>
          </div>
          <span className="text-xs font-mono text-slate-400">
            Units: PM2.5 (µg/m³)
          </span>
        </div>

        <div className="w-full h-72">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" opacity={0.6} />
              <XAxis dataKey="time" tick={{ fontSize: 10 }} stroke="#94A3B8" />
              <YAxis tick={{ fontSize: 10 }} stroke="#94A3B8" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#0F172A', 
                  border: '1px solid #1E293B', 
                  borderRadius: '8px', 
                  fontSize: '11px',
                  color: '#F8FAFC' 
                }} 
              />
              <Legend verticalAlign="top" height={36} wrapperStyle={{ fontSize: '11px' }} />
              <Line 
                type="monotone" 
                dataKey="baseline" 
                name="Copernicus CAMS Baseline PM2.5" 
                stroke="#F43F5E" 
                strokeWidth={2}
                dot={false}
              />
              <Line 
                type="monotone" 
                dataKey="simulated" 
                name="Simulated Policy PM2.5" 
                stroke="#10B981" 
                strokeWidth={2.5}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

    </div>
  );
};
