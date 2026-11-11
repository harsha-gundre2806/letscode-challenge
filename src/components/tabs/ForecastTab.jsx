import React, { useMemo } from 'react';
import { calculateAeroSafeWindow } from '../../services/safeWindowEngine';
import { getAQICategory } from '../../utils/aqiUtils';
import { 
  CalendarDays, 
  Sparkles, 
  ShieldCheck, 
  Activity 
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

export const ForecastTab = ({ airData, onNavigateToTab, darkMode = false }) => {
  // Calculate Aero-Predictive Safe Window
  const safeWindow = useMemo(() => {
    return calculateAeroSafeWindow(airData.forecast);
  }, [airData.forecast]);

  // Aggregate 7-Day Daily Forecast Summaries
  const dailyForecast = useMemo(() => {
    const daysMap = new Map();

    airData.forecast.forEach(point => {
      const d = new Date(point.time);
      const dayKey = d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });

      const entry = daysMap.get(dayKey) || { aqiSum: 0, pm25Sum: 0, count: 0, dateStr: dayKey };
      entry.aqiSum += point.us_aqi;
      entry.pm25Sum += point.pm2_5;
      entry.count += 1;
      daysMap.set(dayKey, entry);
    });

    return Array.from(daysMap.values()).map(e => {
      const avgAqi = Math.round(e.aqiSum / e.count);
      const avgPm25 = Number((e.pm25Sum / e.count).toFixed(1));
      return {
        day: e.dateStr,
        avgAqi,
        avgPm25,
        category: getAQICategory(avgAqi),
      };
    }).slice(0, 7);
  }, [airData.forecast]);

  // Chart data for next 72 hours
  const hourlyChartData = useMemo(() => {
    return airData.forecast.slice(0, 72).map(p => {
      const d = new Date(p.time);
      const formatted = `${d.toLocaleDateString('en-US', { weekday: 'short' })} ${d.toLocaleTimeString('en-US', { hour: 'numeric', hour12: true })}`;
      return {
        time: formatted,
        us_aqi: Math.round(p.us_aqi),
        pm2_5: Math.round(p.pm2_5),
      };
    });
  }, [airData.forecast]);

  return (
    <div className="space-y-6">
      
      {/* Forecast Header with Rule 11 Verification Badge */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <CalendarDays className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            <h1 className="text-xl font-bold text-slate-900 dark:text-white">
              7-Day Atmospheric AQI & Particulate Forecast
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Predictive photochemical & aerosol dispersion modeling for {airData.location.name}
          </p>
        </div>

        {/* Rule 11 Model Verification Badge */}
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-blue-200 dark:border-blue-900 bg-blue-50/50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-300 text-xs font-semibold">
          <ShieldCheck className="w-4 h-4" />
          <span>Copernicus Atmospheric Forecast Model (Rule 11 Labeled)</span>
        </div>
      </div>

      {/* Aero-Predictive "Safe Window" Engine Hero Card (Innovative Feature) */}
      {safeWindow && (
        <div className="bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/40 dark:to-teal-950/30 border border-emerald-300 dark:border-emerald-800 rounded-2xl p-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300 text-xs font-bold uppercase tracking-wider">
                <Sparkles className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>Aero-Predictive "Safe Window" Engine</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-200 dark:bg-emerald-800 text-emerald-900 dark:text-emerald-100">
                  {safeWindow.confidenceScore}% Model Confidence
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white">
                Best 2-Hour Outdoor Window Today: {safeWindow.startTime} – {safeWindow.endTime}
              </h2>
              <p className="text-xs text-slate-700 dark:text-slate-300 max-w-2xl leading-relaxed">
                {safeWindow.activityRecommendation}
              </p>
            </div>

            <div className="flex items-center gap-4 shrink-0 bg-white dark:bg-slate-900 border border-emerald-200 dark:border-emerald-800/80 rounded-xl p-4 text-center">
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-semibold block">Window AQI</span>
                <span className="text-2xl font-black font-mono text-emerald-600 dark:text-emerald-400">
                  {safeWindow.avgAqi}
                </span>
              </div>
              <div className="w-px h-8 bg-slate-200 dark:bg-slate-700" />
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-semibold block">PM2.5</span>
                <span className="text-2xl font-black font-mono text-slate-900 dark:text-white">
                  {safeWindow.avgPm25} µg
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 7-Day Summary Cards Grid */}
      <div>
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
          Daily Forecast Outlook (Next 7 Days)
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
          {dailyForecast.map((d, idx) => (
            <div 
              key={idx}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3 flex flex-col justify-between text-center"
            >
              <div>
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                  {d.day}
                </span>
                <div className="my-2">
                  <span className="text-2xl font-black font-mono text-slate-900 dark:text-white">
                    {d.avgAqi}
                  </span>
                  <span className="text-[10px] text-slate-400 block font-semibold">US AQI</span>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-1">
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border block truncate ${d.category.badgeBg} ${d.category.badgeText} ${d.category.borderColor}`}>
                  {d.category.label}
                </span>
                <span className="text-[10px] text-slate-400 font-mono block">
                  PM2.5: {d.avgPm25} µg
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 72-Hour Forward-Looking Hourly Projection Chart */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              72-Hour Continuous Aerosol Model
            </h2>
          </div>
          <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">
            Hourly Resolution • Copernicus CAMS Model
          </span>
        </div>

        <div className="w-full h-72">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={hourlyChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
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
              <Line 
                type="monotone" 
                dataKey="us_aqi" 
                name="Forecasted US AQI" 
                stroke="#10B981" 
                strokeWidth={2}
                dot={false}
              />
              <Line 
                type="monotone" 
                dataKey="pm2_5" 
                name="Forecasted PM2.5 (µg/m³)" 
                stroke="#F59E0B" 
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

    </div>
  );
};
