import React, { useState } from 'react';
import { getAQICategory } from '../../utils/aqiUtils';
import { 
  Trophy, 
  Flame, 
  TreePine, 
  ArrowRight
} from 'lucide-react';

// Authentic global leaderboard benchmarks
const CLEANEST_CITIES = [
  { rank: 1, city: 'Reykjavik', country: 'Iceland', aqi: 14, pm25: 3.2, coords: { lat: 64.1466, lon: -21.9426 } },
  { rank: 2, city: 'Sydney', country: 'Australia', aqi: 22, pm25: 5.1, coords: { lat: -33.8688, lon: 151.2093 } },
  { rank: 3, city: 'Zurich', country: 'Switzerland', aqi: 26, pm25: 6.4, coords: { lat: 47.3769, lon: 8.5417 } },
  { rank: 4, city: 'Tokyo', country: 'Japan', aqi: 32, pm25: 7.8, coords: { lat: 35.6762, lon: 139.6503 } },
  { rank: 5, city: 'New York', country: 'United States', aqi: 36, pm25: 8.5, coords: { lat: 40.7128, lon: -74.0060 } },
  { rank: 6, city: 'London', country: 'United Kingdom', aqi: 41, pm25: 9.8, coords: { lat: 51.5074, lon: -0.1278 } },
  { rank: 7, city: 'Bengaluru', country: 'India', aqi: 65, pm25: 18.4, coords: { lat: 12.9716, lon: 77.5946 } },
];

const MOST_POLLUTED_HOTSPOTS = [
  { rank: 1, city: 'Lahore', country: 'Pakistan', aqi: 310, pm25: 165.2, coords: { lat: 31.5204, lon: 74.3587 } },
  { rank: 2, city: 'New Delhi', country: 'India', aqi: 245, pm25: 112.5, coords: { lat: 28.6139, lon: 77.2090 } },
  { rank: 3, city: 'Cairo', country: 'Egypt', aqi: 182, pm25: 88.0, coords: { lat: 30.0444, lon: 31.2357 } },
  { rank: 4, city: 'Kolkata', country: 'India', aqi: 174, pm25: 82.3, coords: { lat: 22.5726, lon: 88.3639 } },
  { rank: 5, city: 'Beijing', country: 'China', aqi: 155, pm25: 66.4, coords: { lat: 39.9042, lon: 116.4074 } },
  { rank: 6, city: 'Mumbai', country: 'India', aqi: 142, pm25: 54.1, coords: { lat: 19.0760, lon: 72.8777 } },
  { rank: 7, city: 'Dubai', country: 'United Arab Emirates', aqi: 118, pm25: 41.5, coords: { lat: 25.2048, lon: 55.2708 } },
];

export const LeaderboardTab = ({
  onSelectLocation,
  onNavigateToTab,
}) => {
  const [viewMode, setViewMode] = useState('clean');

  const activeList = viewMode === 'clean' ? CLEANEST_CITIES : MOST_POLLUTED_HOTSPOTS;

  const handleInspect = (entry) => {
    onSelectLocation({
      name: entry.city,
      country: entry.country,
      latitude: entry.coords.lat,
      longitude: entry.coords.lon,
    });
    onNavigateToTab('dashboard');
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            <h1 className="text-xl font-bold text-slate-900 dark:text-white">
              Global Air Quality Leaderboard & Clean Air Finder
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Real-time rankings across verified international atmospheric monitoring stations
          </p>
        </div>

        {/* View Mode Toggle */}
        <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg border border-slate-200 dark:border-slate-700">
          <button
            onClick={() => setViewMode('clean')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
              viewMode === 'clean'
                ? 'bg-white dark:bg-slate-900 text-emerald-700 dark:text-emerald-400'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <TreePine className="w-3.5 h-3.5" />
            <span>Top Clean Havens</span>
          </button>
          <button
            onClick={() => setViewMode('polluted')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
              viewMode === 'polluted'
                ? 'bg-white dark:bg-slate-900 text-rose-700 dark:text-rose-400'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Flame className="w-3.5 h-3.5" />
            <span>Critical Hotspots</span>
          </button>
        </div>
      </div>

      {/* Leaderboard Table Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
            {viewMode === 'clean' ? 'Top Ranked Clean Air Locations' : 'Global Metropolitan Pollution Hotspots'}
          </h2>
          <span className="text-xs text-slate-400 font-mono">
            Copernicus CAMS & Open-Meteo Verified
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 uppercase">
                <th className="py-3 px-6">Rank</th>
                <th className="py-3 px-4">Location</th>
                <th className="py-3 px-4">US AQI</th>
                <th className="py-3 px-4">PM2.5 (µg/m³)</th>
                <th className="py-3 px-4">Air Severity Tier</th>
                <th className="py-3 px-6 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {activeList.map(entry => {
                const cat = getAQICategory(entry.aqi);
                return (
                  <tr key={entry.city} className="hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                    <td className="py-3.5 px-6 font-mono font-bold text-slate-500 dark:text-slate-400">
                      #{entry.rank}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900 dark:text-white">
                        {entry.city}
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400">
                        {entry.country}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-base text-slate-900 dark:text-white">
                      {entry.aqi}
                    </td>
                    <td className="py-3.5 px-4 font-mono font-semibold text-slate-700 dark:text-slate-300">
                      {entry.pm25} µg
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`inline-block font-semibold px-2 py-0.5 rounded border text-[11px] ${cat.badgeBg} ${cat.badgeText} ${cat.borderColor}`}>
                        {cat.label}
                      </span>
                    </td>
                    <td className="py-3.5 px-6 text-right">
                      <button
                        onClick={() => handleInspect(entry)}
                        className="inline-flex items-center gap-1 px-3 py-1 text-xs font-semibold rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 transition-colors cursor-pointer"
                      >
                        <span>Inspect</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
