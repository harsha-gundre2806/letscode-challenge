import React, { useState, useMemo } from 'react';
import { detectAnomalies } from '../../services/airQualityService';
import { 
  History, 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  Activity, 
  Sparkles
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  CartesianGrid, 
  Legend 
} from 'recharts';

export const HistoryTab = ({ airData, onNavigateToTab, darkMode = false }) => {
  const [selectedMetric, setSelectedMetric] = useState('both');
  const [historyRangeDays, setHistoryRangeDays] = useState(7);

  // Filter history based on range
  const historySlice = useMemo(() => {
    const totalPoints = historyRangeDays * 24;
    return airData.history.slice(-totalPoints);
  }, [airData.history, historyRangeDays]);

  // Compute Anomalies
  const anomalies = useMemo(() => {
    return detectAnomalies(airData.history);
  }, [airData.history]);

  // Calculate Week-over-Week Percentage Change
  const { currentAvgPm25, prevAvgPm25, percentChange, isWorsened } = useMemo(() => {
    if (airData.history.length < 48) {
      return { currentAvgPm25: 0, prevAvgPm25: 0, percentChange: 0, isWorsened: false };
    }
    const recent48 = airData.history.slice(-48);
    const last24 = recent48.slice(-24);
    const prev24 = recent48.slice(0, 24);

    const currAvg = last24.reduce((s, p) => s + p.pm2_5, 0) / 24;
    const prevAvg = prev24.reduce((s, p) => s + p.pm2_5, 0) / 24;

    const diff = currAvg - prevAvg;
    const pct = prevAvg === 0 ? 0 : Math.round((diff / prevAvg) * 100);

    return {
      currentAvgPm25: Number(currAvg.toFixed(1)),
      prevAvgPm25: Number(prevAvg.toFixed(1)),
      percentChange: Math.abs(pct),
      isWorsened: pct > 0,
    };
  }, [airData.history]);

  // Format data for Recharts
  const chartData = useMemo(() => {
    return historySlice.map(point => {
      const d = new Date(point.time);
      const formattedTime = `${d.toLocaleDateString('en-US', { weekday: 'short', month: 'numeric', day: 'numeric' })} ${d.toLocaleTimeString('en-US', { hour: 'numeric', hour12: true })}`;
      return {
        time: formattedTime,
        pm2_5: Math.round(point.pm2_5),
        pm10: Math.round(point.pm10),
        us_aqi: Math.round(point.us_aqi),
      };
    });
  }, [historySlice]);

  return (
    <div className="space-y-6">
      
      {/* Historical Trend Header Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <History className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            <h1 className="text-xl font-bold text-slate-900 dark:text-white">
              Historical Pollution Tracker & Chronological Trends
            </h1>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">
            Analyzing 7-day verified retrospective atmospheric records for {airData.location.name}
          </p>
        </div>

        {/* Day Range Filter */}
        <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg border border-slate-200 dark:border-slate-700">
          <button
            onClick={() => setHistoryRangeDays(3)}
            className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
              historyRangeDays === 3
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Past 3 Days
          </button>
          <button
            onClick={() => setHistoryRangeDays(7)}
            className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
              historyRangeDays === 7
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Past 7 Days
          </button>
        </div>
      </div>

      {/* Week-over-Week Trend Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        
        {/* Trend Direction */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4">
          <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider block">
            24h Atmospheric Trajectory
          </span>
          <div className="mt-2 flex items-center gap-2">
            {isWorsened ? (
              <div className="p-1.5 rounded-lg bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300">
                <TrendingUp className="w-5 h-5" />
              </div>
            ) : (
              <div className="p-1.5 rounded-lg bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                <TrendingDown className="w-5 h-5" />
              </div>
            )}
            <div>
              <div className="text-2xl font-bold font-mono text-slate-900 dark:text-white">
                {percentChange}% {isWorsened ? 'Increase' : 'Improvement'}
              </div>
              <span className="text-[11px] text-slate-600 dark:text-slate-300">
                {isWorsened ? 'Particulate density has surged' : 'Cleaner air compared to previous 24h'}
              </span>
            </div>
          </div>
        </div>

        {/* Current 24h Average PM2.5 */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4">
          <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider block">
            Recent 24h Mean PM2.5
          </span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-slate-900 dark:text-white">
              {currentAvgPm25}
            </span>
            <span className="text-xs text-slate-600 dark:text-slate-400 font-semibold">µg/m³</span>
          </div>
          <span className="text-[11px] text-slate-600 dark:text-slate-300 mt-1 block">
            WHO Safe Cap: 15 µg/m³ ({Math.round((currentAvgPm25 / 15) * 100)}% of limit)
          </span>
        </div>

        {/* Prior 24h Average PM2.5 */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4">
          <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider block">
            Prior 24h Baseline PM2.5
          </span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-slate-900 dark:text-white">
              {prevAvgPm25}
            </span>
            <span className="text-xs text-slate-600 dark:text-slate-400 font-semibold">µg/m³</span>
          </div>
          <span className="text-[11px] text-slate-600 dark:text-slate-300 mt-1 block">
            Verified rolling diurnal reference level
          </span>
        </div>

      </div>

      {/* Main Historical Chart Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              Chronological Time-Series Chart
            </h2>
          </div>

          {/* Metric Selector */}
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg border border-slate-200 dark:border-slate-700">
            <button
              onClick={() => setSelectedMetric('both')}
              className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
                selectedMetric === 'both'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              PM2.5 vs PM10
            </button>
            <button
              onClick={() => setSelectedMetric('pm25')}
              className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
                selectedMetric === 'pm25'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              PM2.5 Only
            </button>
            <button
              onClick={() => setSelectedMetric('aqi')}
              className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
                selectedMetric === 'aqi'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              US AQI
            </button>
          </div>
        </div>

        {/* Recharts Container */}
        <div className="w-full h-80">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorPm25" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10B981" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorPm10" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorAqi" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="#F59E0B" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? '#334155' : '#E2E8F0'} opacity={0.6} />
              <XAxis dataKey="time" tick={{ fontSize: 10, fill: darkMode ? '#94A3B8' : '#475569' }} stroke={darkMode ? '#475569' : '#CBD5E1'} />
              <YAxis tick={{ fontSize: 10, fill: darkMode ? '#94A3B8' : '#475569' }} stroke={darkMode ? '#475569' : '#CBD5E1'} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: darkMode ? '#0F172A' : '#FFFFFF', 
                  border: darkMode ? '1px solid #334155' : '1px solid #CBD5E1', 
                  borderRadius: '8px', 
                  fontSize: '11px',
                  color: darkMode ? '#F8FAFC' : '#0F172A' 
                }}
                itemStyle={{ color: darkMode ? '#F8FAFC' : '#0F172A' }}
              />
              <Legend verticalAlign="top" height={36} wrapperStyle={{ fontSize: '11px', color: darkMode ? '#CBD5E1' : '#334155' }} />

              {(selectedMetric === 'both' || selectedMetric === 'pm25') && (
                <Area 
                  type="monotone" 
                  dataKey="pm2_5" 
                  name="PM2.5 (µg/m³)" 
                  stroke="#10B981" 
                  strokeWidth={2}
                  fillOpacity={1} 
                  fill="url(#colorPm25)" 
                />
              )}

              {(selectedMetric === 'both' || selectedMetric === 'pm10') && (
                <Area 
                  type="monotone" 
                  dataKey="pm10" 
                  name="PM10 (µg/m³)" 
                  stroke="#3B82F6" 
                  strokeWidth={2}
                  fillOpacity={1} 
                  fill="url(#colorPm10)" 
                />
              )}

              {selectedMetric === 'aqi' && (
                <Area 
                  type="monotone" 
                  dataKey="us_aqi" 
                  name="US AQI Score" 
                  stroke="#F59E0B" 
                  strokeWidth={2}
                  fillOpacity={1} 
                  fill="url(#colorAqi)" 
                />
              )}
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Automated Atmospheric Anomaly Spike Detection */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6">
        <div className="flex items-center gap-2 mb-4">
          <AlertTriangle className="w-4 h-4 text-amber-500" />
          <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
            Automated Anomaly Detection & Pollution Spike Log
          </h2>
        </div>

        {anomalies.length === 0 ? (
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800 text-xs text-slate-600 dark:text-slate-300 text-center border border-slate-200 dark:border-slate-700">
            No extreme statistical pollution spikes detected in the recent recording cycle. Atmospheric conditions remained stable.
          </div>
        ) : (
          <div className="space-y-3">
            {anomalies.map((a, idx) => (
              <div 
                key={idx}
                className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-semibold text-slate-800 dark:text-slate-200">
                      {new Date(a.time).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true })}
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                      a.severity === 'Critical'
                        ? 'bg-rose-100 text-rose-800 border-rose-300 dark:bg-rose-950 dark:text-rose-300'
                        : 'bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950 dark:text-amber-300'
                    }`}>
                      +{a.percentageSpike}% Spike ({a.severity})
                    </span>
                  </div>
                  <p className="text-slate-700 dark:text-slate-300">
                    <span className="font-semibold text-slate-900 dark:text-white">{a.pollutant} surged to {a.value} µg/m³</span> (Rolling baseline: {a.baseline} µg/m³).
                  </p>
                  <p className="text-[11px] text-slate-600 dark:text-slate-400 italic">
                    Diagnostic cause: {a.potentialCause}
                  </p>
                </div>

                <button
                  onClick={() => onNavigateToTab('simulator')}
                  className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 hover:underline shrink-0 cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Simulate Mitigation</span>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};
