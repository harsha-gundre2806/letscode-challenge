import React from 'react';
import { TabId } from './NavigationTabs';
import { AirQualityResponse, MicroProfile } from '../types/airQuality';
import { ArrowRight, Compass, Sparkles, AlertTriangle, ShieldCheck, HeartPulse, Footprints } from 'lucide-react';

interface NextStepGuideProps {
  activeTab: TabId;
  airData: AirQualityResponse | null;
  microProfile: MicroProfile;
  onNavigate: (tab: TabId) => void;
}

export const NextStepGuide: React.FC<NextStepGuideProps> = ({
  activeTab,
  airData,
  microProfile,
  onNavigate,
}) => {
  if (!airData) return null;

  const aqi = airData.current.us_aqi;
  const isHighPollution = aqi > 150;

  // Compute smart next step based on current tab and AQI severity
  let targetTab: TabId = 'forecast';
  let title = 'Check Safe Exercise Windows';
  let description = 'Plan your outdoor activities around the cleanest forecasted daylight hours.';
  let buttonLabel = 'Explore 7-Day Forecast';
  let Icon = Compass;

  switch (activeTab) {
    case 'dashboard':
      if (isHighPollution) {
        targetTab = 'health';
        title = `High Pollution Alert (${aqi} AQI)`;
        description = `Air quality is severely compromised for ${microProfile} profile. Generate your Emergency Health Action Plan immediately.`;
        buttonLabel = 'Generate Emergency Plan';
        Icon = AlertTriangle;
      } else {
        targetTab = 'exposure';
        title = 'Calculate Commute Exposure';
        description = 'Estimate the microgram dosage of PM2.5 you will inhale on your upcoming walk, bike, or drive.';
        buttonLabel = 'Open Commute Life-Log';
        Icon = Footprints;
      }
      break;

    case 'map':
      targetTab = 'compare';
      title = 'Compare Regional Hotspots';
      description = `Benchmark ${airData.location.name} directly against other major metropolitan hubs and find the cleanest city.`;
      buttonLabel = 'Compare Cities';
      Icon = Compass;
      break;

    case 'history':
      targetTab = 'simulator';
      title = 'Test Policy Interventions';
      description = 'Simulate how traffic curbs and industrial dust suppression would lower these historical spikes.';
      buttonLabel = 'Launch What-If Simulator';
      Icon = Sparkles;
      break;

    case 'forecast':
      targetTab = 'exposure';
      title = 'Optimize Your Travel Window';
      description = 'Now that you see the 7-day trend, calculate your personal PM2.5 inhalation dosage for safer commuting.';
      buttonLabel = 'Calculate Commute Dosage';
      Icon = Footprints;
      break;

    case 'compare':
      targetTab = 'leaderboard';
      title = 'Inspect Global Rankings';
      description = 'Check real-time air quality rankings across 50+ major capital cities and pollution hot zones.';
      buttonLabel = 'View Leaderboard';
      Icon = Compass;
      break;

    case 'health':
      targetTab = 'assistant';
      title = 'Consult BreatheAI Assistant';
      description = 'Have personalized questions regarding masks, symptoms, or indoor air purifiers? Ask our AI assistant.';
      buttonLabel = 'Ask BreatheAI Assistant';
      Icon = HeartPulse;
      break;

    case 'exposure':
      targetTab = 'simulator';
      title = 'Simulate Clean Air Policies';
      description = 'Explore how structural urban interventions could cut your daily inhaled particulate burden by up to 50%.';
      buttonLabel = 'Simulate Policy Changes';
      Icon = Sparkles;
      break;

    case 'simulator':
      targetTab = 'assistant';
      title = 'Discuss Findings with AI';
      description = 'Ask the AI to explain the atmospheric chemistry and health implications of your simulated scenario.';
      buttonLabel = 'Discuss with BreatheAI';
      Icon = Sparkles;
      break;

    case 'assistant':
      targetTab = 'dashboard';
      title = 'Return to Live Monitoring';
      description = 'Review the real-time sensor metrics and atmospheric diagnostics for your active location.';
      buttonLabel = 'View Live Dashboard';
      Icon = ShieldCheck;
      break;

    case 'leaderboard':
      targetTab = 'map';
      title = 'Explore Global Spatial Map';
      description = 'View geographical distributions of pollution plumes and interactive regional sensors.';
      buttonLabel = 'Open Interactive Map';
      Icon = Compass;
      break;
  }

  return (
    <aside aria-label="Next Step Guide" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 my-6">
      <div className={`p-4 rounded-xl border transition-colors ${
        isHighPollution && activeTab === 'dashboard'
          ? 'bg-rose-50/60 dark:bg-rose-950/30 border-rose-200 dark:border-rose-900 text-rose-900 dark:text-rose-200'
          : 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800 text-slate-800 dark:text-slate-200'
      }`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className={`p-2 rounded-lg shrink-0 ${
              isHighPollution && activeTab === 'dashboard'
                ? 'bg-rose-200/60 dark:bg-rose-900/60 text-rose-700 dark:text-rose-300'
                : 'bg-emerald-200/50 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300'
            }`}>
              <Icon className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-400">
                  Recommended Next Step
                </span>
                <span className="text-xs text-slate-400">•</span>
                <h2 className="text-sm font-semibold text-slate-900 dark:text-white">
                  {title}
                </h2>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                {description}
              </p>
            </div>
          </div>

          <button
            onClick={() => onNavigate(targetTab)}
            className="inline-flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg bg-slate-900 text-white dark:bg-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors shrink-0 cursor-pointer"
          >
            <span>{buttonLabel}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </aside>
  );
};
