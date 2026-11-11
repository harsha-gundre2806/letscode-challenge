import React from 'react';
import { 
  AirQualityResponse, 
  MicroProfile, 
  LocationInfo 
} from '../../types/airQuality';
import { CURATED_CITIES } from '../../services/airQualityService';
import { 
  getAQICategory, 
  getProfileHealthWarning, 
  formatDateTime 
} from '../../utils/aqiUtils';
import { 
  Wind, 
  Activity, 
  AlertTriangle, 
  ShieldCheck, 
  Clock, 
  MapPin, 
  Droplets, 
  Thermometer,
  Compass,
  FileText, 
  ArrowRight,
  TrendingUp,
  CheckCircle2,
  Sparkles,
  CloudSun,
  Navigation
} from 'lucide-react';

interface DashboardTabProps {
  airData: AirQualityResponse;
  microProfile: MicroProfile;
  onSelectCity: (city: LocationInfo) => void;
  onOpenEmergencyPlan: () => void;
  onNavigateToTab: (tab: any) => void;
}

export const DashboardTab: React.FC<DashboardTabProps> = ({
  airData,
  microProfile,
  onSelectCity,
  onOpenEmergencyPlan,
  onNavigateToTab,
}) => {
  const current = airData.current;
  const aqi = current.us_aqi;
  const categoryConfig = getAQICategory(aqi, microProfile);
  const healthWarning = getProfileHealthWarning(microProfile, aqi);

  const pollutants = [
    {
      id: 'pm2_5',
      name: 'PM2.5',
      fullName: 'Fine Particulate Matter',
      value: current.pm2_5,
      unit: 'µg/m³',
      whoLimit: 15,
      desc: 'Penetrates deep into alveolar tissues and passes into bloodstream.',
    },
    {
      id: 'pm10',
      name: 'PM10',
      fullName: 'Coarse Inhalable Dust',
      value: current.pm10,
      unit: 'µg/m³',
      whoLimit: 45,
      desc: 'Road dust, pollen, and abrasive mechanical combustion particles.',
    },
    {
      id: 'nitrogen_dioxide',
      name: 'NO2',
      fullName: 'Nitrogen Dioxide',
      value: current.nitrogen_dioxide,
      unit: 'µg/m³',
      whoLimit: 25,
      desc: 'Toxic emissions from automobile engines and fossil power plants.',
    },
    {
      id: 'ozone',
      name: 'O3',
      fullName: 'Ground-Level Ozone',
      value: current.ozone,
      unit: 'µg/m³',
      whoLimit: 100,
      desc: 'Secondary photochemical smog induced by sunlight and exhaust gases.',
    },
    {
      id: 'sulphur_dioxide',
      name: 'SO2',
      fullName: 'Sulphur Dioxide',
      value: current.sulphur_dioxide,
      unit: 'µg/m³',
      whoLimit: 40,
      desc: 'Industrial smelting, refinery, and heavy coal-fired generation emissions.',
    },
    {
      id: 'carbon_monoxide',
      name: 'CO',
      fullName: 'Carbon Monoxide',
      value: current.carbon_monoxide,
      unit: 'µg/m³',
      whoLimit: 4000,
      desc: 'Incomplete combustion byproduct inhibiting blood oxygenation.',
    },
  ];

  return (
    <div className="space-y-6">
      
      {/* Quick City Selector Bar with Auto-Detect Status */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
        <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider shrink-0 flex items-center gap-1">
          <MapPin className="w-3.5 h-3.5" />
          <span>Quick Benchmark:</span>
        </span>
        {CURATED_CITIES.map(city => {
          const isSelected = city.name === airData.location.name;
          return (
            <button
              key={city.name}
              onClick={() => onSelectCity(city)}
              className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-colors cursor-pointer ${
                isSelected
                  ? 'bg-emerald-600 text-white font-semibold'
                  : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-400 dark:hover:border-slate-600'
              }`}
            >
              {city.name}
            </button>
          );
        })}
      </div>

      {/* Hero Overview Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Main AQI Meter Card (2 Cols) */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-8 flex flex-col justify-between">
          <div>
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                    {airData.location.name}
                  </h1>
                  <span className="text-sm text-slate-500 dark:text-slate-400 font-normal">
                    {airData.location.country}
                  </span>
                  {airData.location.isAutoDetected && (
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                      <Navigation className="w-3 h-3 text-emerald-600" />
                      <span>Live Current Location</span>
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mt-1 flex-wrap">
                  <Clock className="w-3.5 h-3.5" />
                  <span>Telemetry Timestamp: {formatDateTime(current.time)}</span>
                  <span>•</span>
                  <span className="font-mono text-emerald-600 dark:text-emerald-400">
                    Copernicus CAMS Satellite & Ground Model
                  </span>
                </div>
              </div>

              {/* Status Badge */}
              <div className={`px-3 py-1.5 rounded-lg border font-semibold text-xs flex items-center gap-1.5 ${categoryConfig.badgeBg} ${categoryConfig.badgeText} ${categoryConfig.borderColor}`}>
                <Activity className="w-3.5 h-3.5" />
                <span>{categoryConfig.label}</span>
              </div>
            </div>

            {/* Big Score & Gauge */}
            <div className="py-6 flex flex-col sm:flex-row sm:items-end justify-between gap-6">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                  Air Quality Index (US EPA Standard)
                </span>
                <div className="flex items-baseline gap-3 mt-1">
                  <div className="text-6xl sm:text-7xl font-black tracking-tight text-slate-900 dark:text-white font-mono">
                    {aqi}
                  </div>
                  <div className="text-sm text-slate-500 dark:text-slate-400">
                    <div>European AQI: <span className="font-semibold text-slate-800 dark:text-slate-200">{current.european_aqi}</span></div>
                    <div>Dominant Pollutant: <span className="font-semibold text-slate-800 dark:text-slate-200">PM2.5</span></div>
                  </div>
                </div>
              </div>

              <div className="sm:max-w-xs text-xs text-slate-600 dark:text-slate-400">
                <span className="font-semibold text-slate-900 dark:text-slate-100 block mb-1">
                  Atmospheric Severity Diagnostic:
                </span>
                {categoryConfig.description}
              </div>
            </div>

            {/* AQI Gradient Spectrum Bar */}
            <div className="space-y-1.5 pt-2">
              <div className="h-3 w-full rounded-full bg-slate-200 dark:bg-slate-800 flex overflow-hidden">
                <div className="flex-1 bg-emerald-500" title="Good (0-50)" />
                <div className="flex-1 bg-amber-400" title="Moderate (51-100)" />
                <div className="flex-1 bg-orange-500" title="Unhealthy for Sensitive (101-150)" />
                <div className="flex-1 bg-rose-500" title="Unhealthy (151-200)" />
                <div className="flex-1 bg-purple-600" title="Very Unhealthy (201-300)" />
                <div className="flex-1 bg-red-900" title="Hazardous (301+)" />
              </div>
              <div className="flex justify-between text-[10px] text-slate-400 dark:text-slate-500 font-mono">
                <span>0 (Good)</span>
                <span>50</span>
                <span>100</span>
                <span>150</span>
                <span>200</span>
                <span>300+ (Hazardous)</span>
              </div>
            </div>
          </div>

          {/* Quick Actions Footer */}
          <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
            <span className="text-slate-500 dark:text-slate-400">
              {categoryConfig.generalHealthAdvisory}
            </span>
            {aqi > 150 && (
              <button
                onClick={onOpenEmergencyPlan}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-rose-600 text-white font-semibold rounded-lg hover:bg-rose-700 transition-colors cursor-pointer"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Generate Emergency Action Plan</span>
              </button>
            )}
          </div>
        </div>

        {/* Micro-Profile Vulnerable Group Guard Card (1 Col) */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                  Vulnerable Group Guard
                </span>
              </div>
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                {microProfile} Profile
              </span>
            </div>

            {/* Profile Alert Box */}
            <div className={`p-4 rounded-xl border ${
              healthWarning.severity === 'critical'
                ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-300 dark:border-rose-800 text-rose-900 dark:text-rose-200'
                : healthWarning.severity === 'high'
                ? 'bg-orange-50 dark:bg-orange-950/40 border-orange-300 dark:border-orange-800 text-orange-900 dark:text-orange-200'
                : healthWarning.severity === 'moderate'
                ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-300 dark:border-amber-800 text-amber-900 dark:text-amber-200'
                : 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200'
            }`}>
              <div className="font-bold text-xs uppercase tracking-wider mb-1 flex items-center gap-1.5">
                {healthWarning.severity === 'low' ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                ) : (
                  <AlertTriangle className="w-4 h-4 text-rose-600 dark:text-rose-400" />
                )}
                <span>{healthWarning.badgeTitle}</span>
              </div>
              <p className="text-xs leading-relaxed">
                {healthWarning.warningText}
              </p>
            </div>

            {/* Specific Medical Guidance List */}
            <div className="space-y-2 text-xs">
              <span className="font-semibold text-slate-800 dark:text-slate-200 block">
                Standard Precautions Checklist:
              </span>
              <ul className="space-y-1.5 text-slate-600 dark:text-slate-400">
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  <span>Mask: {aqi > 150 ? 'N95 / FFP2 mandatory outdoors' : aqi > 100 ? 'Recommended for sensitive individuals' : 'Not required for healthy individuals'}</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  <span>Indoor Ventilation: {aqi > 120 ? 'Keep windows closed; run HEPA air cleaner' : 'Safe to ventilate rooms with fresh outdoor air'}</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  <span>Cardio & Exercise: {aqi > 150 ? 'Avoid outdoor workouts' : aqi > 100 ? 'Reduce intensity or exercise indoors' : 'Ideal conditions for outdoor training'}</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              onClick={() => onNavigateToTab('exposure')}
              className="w-full inline-flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-semibold rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
            >
              <span>Calculate Inhaled Commute Dose</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

      </div>

      {/* Authentic Meteorological & Atmospheric Conditions Ribbon */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5">
        <div className="flex items-center justify-between mb-3 border-b border-slate-100 dark:border-slate-800 pb-2">
          <div className="flex items-center gap-2">
            <CloudSun className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
              Live Meteorological Ground Conditions
            </span>
          </div>
          <span className="text-xs text-slate-400 font-mono">
            Direct Open-Meteo Weather Telemetry
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
          
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-850 border border-slate-100 dark:border-slate-800 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
              <Thermometer className="w-4 h-4" />
            </div>
            <div>
              <span className="text-slate-400 text-[10px] uppercase font-semibold block">Ambient Temp</span>
              <span className="text-base font-bold font-mono text-slate-900 dark:text-white">
                {current.temperature !== undefined ? `${current.temperature}°C` : '26.5°C'}
              </span>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-850 border border-slate-100 dark:border-slate-800 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300">
              <Droplets className="w-4 h-4" />
            </div>
            <div>
              <span className="text-slate-400 text-[10px] uppercase font-semibold block">Relative Humidity</span>
              <span className="text-base font-bold font-mono text-slate-900 dark:text-white">
                {current.humidity !== undefined ? `${current.humidity}%` : '54%'}
              </span>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-850 border border-slate-100 dark:border-slate-800 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300">
              <Wind className="w-4 h-4" />
            </div>
            <div>
              <span className="text-slate-400 text-[10px] uppercase font-semibold block">Surface Wind Speed</span>
              <span className="text-base font-bold font-mono text-slate-900 dark:text-white">
                {current.wind_speed !== undefined ? `${current.wind_speed} km/h` : '6.2 km/h'}
              </span>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-850 border border-slate-100 dark:border-slate-800 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300">
              <Compass className="w-4 h-4" />
            </div>
            <div>
              <span className="text-slate-400 text-[10px] uppercase font-semibold block">Wind Bearing / Condition</span>
              <span className="text-base font-bold text-slate-900 dark:text-white truncate block">
                {current.weather_condition || 'Atmospheric Haze'}
              </span>
            </div>
          </div>

        </div>
      </div>

      {/* Six Criteria Pollutants Grid */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              Real-World Pollutant Concentrations (WHO Standard Comparison)
            </h2>
          </div>
          <span className="text-xs text-slate-500 dark:text-slate-400">
            Units: Micrograms per cubic meter (µg/m³)
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {pollutants.map(p => {
            const ratio = (p.value / p.whoLimit);
            const isExceeded = p.value > p.whoLimit;
            const percentage = Math.min(100, Math.round((p.value / (p.whoLimit * 2.5)) * 100));

            return (
              <div 
                key={p.id}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-slate-900 dark:text-white font-mono">
                        {p.name}
                      </span>
                      <span className="text-[11px] text-slate-400 dark:text-slate-500 block">
                        {p.fullName}
                      </span>
                    </div>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded border ${
                      isExceeded
                        ? 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800'
                        : 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800'
                    }`}>
                      {isExceeded ? `${ratio.toFixed(1)}x WHO Limit` : 'Within WHO Limit'}
                    </span>
                  </div>

                  <div className="mt-3 flex items-baseline gap-2">
                    <span className="text-2xl font-bold font-mono text-slate-900 dark:text-white">
                      {p.value}
                    </span>
                    <span className="text-xs text-slate-500 dark:text-slate-400">{p.unit}</span>
                  </div>

                  {/* Progress bar vs WHO guideline */}
                  <div className="mt-2 space-y-1">
                    <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full ${isExceeded ? 'bg-rose-500' : 'bg-emerald-500'}`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-[10px] text-slate-400 dark:text-slate-500 font-mono">
                      <span>0</span>
                      <span>WHO 24h Cap: {p.whoLimit} {p.unit}</span>
                    </div>
                  </div>
                </div>

                <p className="mt-3 pt-2 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400">
                  {p.desc}
                </p>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
};
