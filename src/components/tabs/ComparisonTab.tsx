import React, { useState, useEffect } from 'react';
import { LocationInfo, AirQualityResponse } from '../../types/airQuality';
import { CURATED_CITIES, fetchAirQualityData } from '../../services/airQualityService';
import { getAQICategory } from '../../utils/aqiUtils';
import { 
  GitCompare, 
  Trophy, 
  Plus, 
  Trash2, 
  Activity, 
  CheckCircle2, 
  BarChart3,
  RefreshCw
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  CartesianGrid, 
  Legend 
} from 'recharts';

interface ComparisonTabProps {
  currentLocation: LocationInfo;
  currentAirData: AirQualityResponse;
  onNavigateToTab: (tab: any) => void;
}

export const ComparisonTab: React.FC<ComparisonTabProps> = ({
  currentLocation,
  currentAirData,
}) => {
  // Cities to compare: default to active city + 2 benchmarks (e.g. New Delhi, Bengaluru, London)
  const [comparedCities, setComparedCities] = useState<LocationInfo[]>([
    currentLocation,
    CURATED_CITIES.find(c => c.name === 'Bengaluru') || CURATED_CITIES[2],
    CURATED_CITIES.find(c => c.name === 'London') || CURATED_CITIES[5],
  ]);

  const [comparisonResults, setComparisonResults] = useState<{ [cityName: string]: AirQualityResponse }>({
    [currentAirData.location.name]: currentAirData,
  });
  const [isLoading, setIsLoading] = useState(false);

  // Load comparison data whenever comparedCities change
  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      setIsLoading(true);
      const newMap: { [cityName: string]: AirQualityResponse } = { ...comparisonResults };

      for (const city of comparedCities) {
        if (!newMap[city.name]) {
          try {
            const data = await fetchAirQualityData(city);
            newMap[city.name] = data;
          } catch (e) {
            console.error(`Error loading comparison for ${city.name}:`, e);
          }
        }
      }

      if (isMounted) {
        setComparisonResults(newMap);
        setIsLoading(false);
      }
    }

    loadData();
    return () => { isMounted = false; };
  }, [comparedCities]);

  const handleAddCity = (city: LocationInfo) => {
    if (comparedCities.some(c => c.name === city.name) || comparedCities.length >= 4) return;
    setComparedCities([...comparedCities, city]);
  };

  const handleRemoveCity = (cityName: string) => {
    if (comparedCities.length <= 1) return;
    setComparedCities(comparedCities.filter(c => c.name !== cityName));
  };

  // Determine Clean Air Winner
  const validDataList = comparedCities
    .map(c => comparisonResults[c.name])
    .filter((d): d is AirQualityResponse => Boolean(d));

  const winnerData = validDataList.length > 0 
    ? [...validDataList].sort((a, b) => a.current.us_aqi - b.current.us_aqi)[0] 
    : null;

  // Format Recharts data
  const barChartData = [
    {
      metric: 'US AQI',
      ...validDataList.reduce((acc, d) => ({ ...acc, [d.location.name]: d.current.us_aqi }), {}),
    },
    {
      metric: 'PM2.5 (µg/m³)',
      ...validDataList.reduce((acc, d) => ({ ...acc, [d.location.name]: Math.round(d.current.pm2_5) }), {}),
    },
    {
      metric: 'PM10 (µg/m³)',
      ...validDataList.reduce((acc, d) => ({ ...acc, [d.location.name]: Math.round(d.current.pm10) }), {}),
    },
    {
      metric: 'NO2 (µg/m³)',
      ...validDataList.reduce((acc, d) => ({ ...acc, [d.location.name]: Math.round(d.current.nitrogen_dioxide) }), {}),
    },
    {
      metric: 'O3 (µg/m³)',
      ...validDataList.reduce((acc, d) => ({ ...acc, [d.location.name]: Math.round(d.current.ozone) }), {}),
    },
  ];

  const cityColors = ['#10B981', '#3B82F6', '#F59E0B', '#8B5CF6'];

  return (
    <div className="space-y-6">
      
      {/* Comparison Header */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <GitCompare className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            <h1 className="text-xl font-bold text-slate-900 dark:text-white">
              Multi-Location Air Quality Comparison
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Side-by-side comparative atmospheric audit across up to 4 global metropolitan centers
          </p>
        </div>

        {/* City Adder Dropdown */}
        <div className="flex items-center gap-2">
          {isLoading && (
            <RefreshCw className="w-4 h-4 text-emerald-600 animate-spin" />
          )}
          <select
            onChange={e => {
              const selected = CURATED_CITIES.find(c => c.name === e.target.value);
              if (selected) handleAddCity(selected);
              e.target.value = '';
            }}
            disabled={comparedCities.length >= 4}
            className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:outline-none disabled:opacity-50"
          >
            <option value="">+ Add City to Compare</option>
            {CURATED_CITIES.filter(c => !comparedCities.some(comp => comp.name === c.name)).map(c => (
              <option key={c.name} value={c.name}>{c.name} ({c.country})</option>
            ))}
          </select>
        </div>
      </div>

      {/* Clean Air Winner Card */}
      {winnerData && (
        <div className="bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-200/80 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-200">
              <Trophy className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-400 block">
                Healthiest Atmospheric Environment
              </span>
              <h2 className="text-lg font-extrabold text-slate-900 dark:text-white">
                Clean Air Winner: {winnerData.location.name} ({winnerData.current.us_aqi} AQI)
              </h2>
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
                Exhibits lowest particulate burden (PM2.5: {winnerData.current.pm2_5} µg/m³) among compared cities.
              </p>
            </div>
          </div>
          <div className="text-right text-xs text-emerald-700 dark:text-emerald-300 font-semibold">
            {getAQICategory(winnerData.current.us_aqi).label} Category
          </div>
        </div>
      )}

      {/* Side-by-Side Metric Cards */}
      <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-${validDataList.length} gap-4`}>
        {validDataList.map((data, idx) => {
          const aqi = data.current.us_aqi;
          const cat = getAQICategory(aqi);
          const isWinner = winnerData?.location.name === data.location.name;

          return (
            <div 
              key={data.location.name}
              className={`bg-white dark:bg-slate-900 border rounded-2xl p-5 flex flex-col justify-between ${
                isWinner 
                  ? 'border-emerald-400 dark:border-emerald-700 ring-1 ring-emerald-400/50' 
                  : 'border-slate-200 dark:border-slate-800'
              }`}
            >
              <div>
                <div className="flex items-start justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                  <div>
                    <h3 className="font-bold text-base text-slate-900 dark:text-white">
                      {data.location.name}
                    </h3>
                    <span className="text-xs text-slate-400">{data.location.country}</span>
                  </div>
                  {comparedCities.length > 1 && (
                    <button
                      onClick={() => handleRemoveCity(data.location.name)}
                      className="p-1 text-slate-400 hover:text-rose-500 rounded transition-colors"
                      title="Remove from comparison"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                <div className="py-4">
                  <span className="text-xs text-slate-400 font-semibold block uppercase">US AQI</span>
                  <div className="flex items-baseline gap-2 mt-0.5">
                    <span className="text-4xl font-black font-mono text-slate-900 dark:text-white">
                      {aqi}
                    </span>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded border ${cat.badgeBg} ${cat.badgeText} ${cat.borderColor}`}>
                      {cat.label}
                    </span>
                  </div>
                </div>

                {/* Pollutant Breakdown Table */}
                <div className="space-y-2 text-xs border-t border-slate-100 dark:border-slate-800 pt-3">
                  <div className="flex justify-between">
                    <span className="text-slate-500">PM2.5:</span>
                    <span className="font-mono font-bold text-slate-800 dark:text-slate-200">{data.current.pm2_5} µg/m³</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">PM10:</span>
                    <span className="font-mono font-bold text-slate-800 dark:text-slate-200">{data.current.pm10} µg/m³</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">NO2:</span>
                    <span className="font-mono font-bold text-slate-800 dark:text-slate-200">{data.current.nitrogen_dioxide} µg/m³</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Ozone (O3):</span>
                    <span className="font-mono font-bold text-slate-800 dark:text-slate-200">{data.current.ozone} µg/m³</span>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-500">
                EU AQI: <span className="font-semibold text-slate-700 dark:text-slate-300">{data.current.european_aqi}</span> • Latency: {data.dataSource.latencyMs}ms
              </div>
            </div>
          );
        })}
      </div>

      {/* Comparative Bar Chart Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6">
        <div className="flex items-center gap-2 mb-4">
          <BarChart3 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
            Cross-City Atmospheric Pollutant Benchmark
          </h2>
        </div>

        <div className="w-full h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={barChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" opacity={0.6} />
              <XAxis dataKey="metric" tick={{ fontSize: 11 }} stroke="#94A3B8" />
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
              {validDataList.map((d, idx) => (
                <Bar 
                  key={d.location.name}
                  dataKey={d.location.name}
                  fill={cityColors[idx % cityColors.length]}
                  radius={[4, 4, 0, 0]}
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

    </div>
  );
};
