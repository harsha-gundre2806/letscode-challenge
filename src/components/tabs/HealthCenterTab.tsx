import React from 'react';
import { AirQualityResponse, MicroProfile } from '../../types/airQuality';
import { AQI_LEVELS, getAQICategory } from '../../utils/aqiUtils';
import { 
  HeartPulse, 
  ShieldAlert, 
  Activity, 
  FileText, 
  Wind, 
  AlertTriangle, 
  CheckCircle2, 
  HelpCircle,
  Eye,
  ShieldCheck,
  Stethoscope
} from 'lucide-react';

interface HealthCenterTabProps {
  airData: AirQualityResponse;
  microProfile: MicroProfile;
  onOpenEmergencyPlan: () => void;
  onNavigateToTab: (tab: any) => void;
}

export const HealthCenterTab: React.FC<HealthCenterTabProps> = ({
  airData,
  microProfile,
  onOpenEmergencyPlan,
  onNavigateToTab,
}) => {
  const aqi = airData.current.us_aqi;
  const currentCategory = getAQICategory(aqi, microProfile);

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <HeartPulse className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            <h1 className="text-xl font-bold text-slate-900 dark:text-white">
              Health, Physiology & Safety Intelligence Center
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Clinical guidelines, pulmonary impact mechanics, and emergency preparedness protocols
          </p>
        </div>

        {/* Generate Emergency Plan Button */}
        <button
          onClick={onOpenEmergencyPlan}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-rose-600 text-white text-xs font-semibold rounded-lg hover:bg-rose-700 transition-colors shrink-0 cursor-pointer"
        >
          <FileText className="w-4 h-4" />
          <span>Generate Emergency Health Plan (PDF)</span>
        </button>
      </div>

      {/* Activity Matrix vs Current AQI */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4 border-b border-slate-100 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              Real-Time Outdoor Activity Suitability Matrix (Current AQI: {aqi})
            </h2>
          </div>
          <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
            For {microProfile} Profile
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
          
          {/* Outdoor Running / Jogging */}
          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-850">
            <span className="font-bold text-slate-900 dark:text-white block mb-1">
              Outdoor Running & Sports
            </span>
            <div className="my-2">
              <span className={`inline-block font-semibold px-2 py-0.5 rounded text-[11px] border ${
                aqi > 150 
                  ? 'bg-rose-50 text-rose-700 border-rose-300 dark:bg-rose-950 dark:text-rose-300' 
                  : aqi > 100 
                  ? 'bg-amber-50 text-amber-700 border-amber-300 dark:bg-amber-950 dark:text-amber-300' 
                  : 'bg-emerald-50 text-emerald-700 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-300'
              }`}>
                {aqi > 150 ? 'Strictly Prohibited' : aqi > 100 ? 'Limit to Low Exertion' : 'Safe to Exercise'}
              </span>
            </div>
            <p className="text-slate-500 mt-2">
              High tidal breathing draws unfiltered particulate matter straight into bronchial airways.
            </p>
          </div>

          {/* Cycling & Commuting */}
          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-850">
            <span className="font-bold text-slate-900 dark:text-white block mb-1">
              Cycling & Road Transit
            </span>
            <div className="my-2">
              <span className={`inline-block font-semibold px-2 py-0.5 rounded text-[11px] border ${
                aqi > 150 
                  ? 'bg-rose-50 text-rose-700 border-rose-300 dark:bg-rose-950 dark:text-rose-300' 
                  : aqi > 100 
                  ? 'bg-amber-50 text-amber-700 border-amber-300 dark:bg-amber-950 dark:text-amber-300' 
                  : 'bg-emerald-50 text-emerald-700 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-300'
              }`}>
                {aqi > 150 ? 'Wear N95 Mask' : aqi > 100 ? 'Use Shielded Routes' : 'Safe & Recommended'}
              </span>
            </div>
            <p className="text-slate-500 mt-2">
              Cyclists inhale ~2.5x more air per minute than pedestrians. Prefer shielded paths.
            </p>
          </div>

          {/* Children Playground Play */}
          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-850">
            <span className="font-bold text-slate-900 dark:text-white block mb-1">
              Children & Playground Play
            </span>
            <div className="my-2">
              <span className={`inline-block font-semibold px-2 py-0.5 rounded text-[11px] border ${
                aqi > 120 
                  ? 'bg-rose-50 text-rose-700 border-rose-300 dark:bg-rose-950 dark:text-rose-300' 
                  : aqi > 80 
                  ? 'bg-amber-50 text-amber-700 border-amber-300 dark:bg-amber-950 dark:text-amber-300' 
                  : 'bg-emerald-50 text-emerald-700 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-300'
              }`}>
                {aqi > 120 ? 'Indoor Play Only' : aqi > 80 ? 'Limit After-School Sports' : 'Safe for Play'}
              </span>
            </div>
            <p className="text-slate-500 mt-2">
              Pediatric lungs are still developing; particulate exposure causes chronic respiratory deficits.
            </p>
          </div>

          {/* Window Airing & Ventilation */}
          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-850">
            <span className="font-bold text-slate-900 dark:text-white block mb-1">
              Home Airing & Ventilation
            </span>
            <div className="my-2">
              <span className={`inline-block font-semibold px-2 py-0.5 rounded text-[11px] border ${
                aqi > 120 
                  ? 'bg-rose-50 text-rose-700 border-rose-300 dark:bg-rose-950 dark:text-rose-300' 
                  : aqi > 90 
                  ? 'bg-amber-50 text-amber-700 border-amber-300 dark:bg-amber-950 dark:text-amber-300' 
                  : 'bg-emerald-50 text-emerald-700 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-300'
              }`}>
                {aqi > 120 ? 'Keep Windows Closed' : aqi > 90 ? 'Ventilate Mid-Day Only' : 'Safe to Air Out Rooms'}
              </span>
            </div>
            <p className="text-slate-500 mt-2">
              Opening windows during smog spikes rapidly saturates indoor air with fine soot.
            </p>
          </div>

        </div>
      </div>

      {/* Biological Impact Explainer: PM2.5 vs PM10 */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6">
        <div className="flex items-center gap-2 mb-4 border-b border-slate-100 dark:border-slate-800 pb-3">
          <Stethoscope className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
            Deep-Dive: How PM2.5 & PM10 Invade the Human Body
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs leading-relaxed">
          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-850 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-sm text-slate-900 dark:text-white">PM10 (Inhalable Coarse Particles)</span>
              <span className="font-mono text-slate-400">&lt; 10 Microns</span>
            </div>
            <p className="text-slate-600 dark:text-slate-400">
              Coarse dust, pollen, and mechanical debris. These particles are largely captured in the upper respiratory tract, nasal passages, and trachea. 
            </p>
            <p className="text-slate-600 dark:text-slate-400">
              <strong className="text-slate-800 dark:text-slate-200">Symptoms:</strong> Nasal congestion, throat irritation, dry cough, and conjunctivitis (burning eyes). Less likely to penetrate systemic circulation directly.
            </p>
          </div>

          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-850 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-sm text-slate-900 dark:text-white">PM2.5 (Fine Combustion Particles)</span>
              <span className="font-mono text-slate-400">&lt; 2.5 Microns (1/30th hair width)</span>
            </div>
            <p className="text-slate-600 dark:text-slate-400">
              Ultrafine combustion exhaust and chemical condensates. Small enough to bypass all natural cilia filters and settle directly into the alveoli (deep lung air sacs).
            </p>
            <p className="text-slate-600 dark:text-slate-400">
              <strong className="text-slate-800 dark:text-slate-200">Systemic Impact:</strong> Diffuses directly across the alveolar-capillary membrane into the bloodstream, triggering vascular oxidative stress, arterial plaque instability, blood clotting, and elevated stroke risks.
            </p>
          </div>
        </div>
      </div>

      {/* Equipment Guide: Masks & Air Purifiers */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Mask Selector */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 text-xs space-y-3">
          <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <h3 className="font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              Respiratory Mask Effectiveness Guide
            </h3>
          </div>
          <div className="space-y-2">
            <div className="p-2.5 rounded-lg border border-emerald-300 dark:border-emerald-800 bg-emerald-50/50 dark:bg-emerald-950/20">
              <div className="flex justify-between font-bold text-slate-900 dark:text-white">
                <span>N95 / FFP2 / KN95 Respirators</span>
                <span className="text-emerald-600 font-mono">95%+ PM2.5 Filtration</span>
              </div>
              <p className="text-slate-600 dark:text-slate-400 mt-1">
                Electrostatic meltblown fabric creates a tight physical facial seal. The gold standard for ambient pollution protection.
              </p>
            </div>

            <div className="p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-850">
              <div className="flex justify-between font-bold text-slate-900 dark:text-white">
                <span>Surgical 3-Ply Masks</span>
                <span className="text-amber-600 font-mono">~30-40% PM2.5 Filtration</span>
              </div>
              <p className="text-slate-600 dark:text-slate-400 mt-1">
                Loose facial fit allows fine aerosols to bypass the perimeter. Only blocks large dust droplets.
              </p>
            </div>

            <div className="p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-850">
              <div className="flex justify-between font-bold text-slate-900 dark:text-white">
                <span>Cloth & Bandana Masks</span>
                <span className="text-rose-600 font-mono">&lt; 15% PM2.5 Filtration</span>
              </div>
              <p className="text-slate-600 dark:text-slate-400 mt-1">
                Weave pore size (100–200 microns) is far too large to obstruct microscopic PM2.5 soot.
              </p>
            </div>
          </div>
        </div>

        {/* Air Purifier Guide */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 text-xs space-y-3">
          <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-2">
            <Wind className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <h3 className="font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              Indoor Air Purifier Protocols
            </h3>
          </div>
          <div className="space-y-2.5 text-slate-600 dark:text-slate-400">
            <div className="p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-850">
              <span className="font-bold text-slate-900 dark:text-white block">True HEPA (H13 or H14 Grade)</span>
              <p className="mt-1">
                Captures 99.97% of particulates down to 0.3 microns. Avoid purifiers that rely solely on ionizers (which can produce harmful ozone).
              </p>
            </div>

            <div className="p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-850">
              <span className="font-bold text-slate-900 dark:text-white block">CADR (Clean Air Delivery Rate)</span>
              <p className="mt-1">
                Ensure your purifier's CADR rating can exchange the entire room air volume at least 4 to 5 times per hour during severe smog days.
              </p>
            </div>

            <div className="p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-850">
              <span className="font-bold text-slate-900 dark:text-white block">Activated Carbon Stage</span>
              <p className="mt-1">
                Adsorbs hazardous gaseous VOCs, formaldehyde, and nitrogen dioxide (NO2) that physical HEPA fibers cannot capture.
              </p>
            </div>
          </div>
        </div>

      </div>

      {/* Comprehensive Official AQI Categories Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6">
        <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-4">
          Complete EPA & WHO AQI Category Reference Scale
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 uppercase">
                <th className="py-2.5 px-3">AQI Range</th>
                <th className="py-2.5 px-3">Severity Category</th>
                <th className="py-2.5 px-3">General Population Guidance</th>
                <th className="py-2.5 px-3">Sensitive Groups Guidance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {AQI_LEVELS.map(level => (
                <tr key={level.category} className="hover:bg-slate-50 dark:hover:bg-slate-850 transition-colors">
                  <td className="py-3 px-3 font-mono font-bold text-slate-900 dark:text-white">
                    {level.min} – {level.max === 999 ? '500+' : level.max}
                  </td>
                  <td className="py-3 px-3">
                    <span className={`inline-block font-semibold px-2 py-0.5 rounded border ${level.badgeBg} ${level.badgeText} ${level.borderColor}`}>
                      {level.label}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-slate-600 dark:text-slate-300">
                    {level.generalHealthAdvisory}
                  </td>
                  <td className="py-3 px-3 text-slate-500">
                    {level.description}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
