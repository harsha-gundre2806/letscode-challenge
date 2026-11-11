import React, { useState, useEffect, useCallback } from 'react';
import { LocationInfo, MicroProfile, AirQualityResponse } from './types/airQuality';
import { CURATED_CITIES, fetchAirQualityData } from './services/airQualityService';
import { Navbar } from './components/Navbar';
import { NavigationTabs, TabId } from './components/NavigationTabs';
import { NextStepGuide } from './components/NextStepGuide';
import { AuditDrawer } from './components/AuditDrawer';
import { EmergencyPlanModal } from './components/EmergencyPlanModal';
import { SocialShareModal } from './components/SocialShareModal';

// Tab Components
import { DashboardTab } from './components/tabs/DashboardTab';
import { MapTab } from './components/tabs/MapTab';
import { HistoryTab } from './components/tabs/HistoryTab';
import { ForecastTab } from './components/tabs/ForecastTab';
import { ComparisonTab } from './components/tabs/ComparisonTab';
import { HealthCenterTab } from './components/tabs/HealthCenterTab';
import { ExposureTrackerTab } from './components/tabs/ExposureTrackerTab';
import { SimulatorTab } from './components/tabs/SimulatorTab';
import { AiAssistantTab } from './components/tabs/AiAssistantTab';
import { LeaderboardTab } from './components/tabs/LeaderboardTab';

import { RefreshCw, AlertCircle, ShieldCheck, Wind } from 'lucide-react';

export const App: React.FC = () => {
  const [currentLocation, setCurrentLocation] = useState<LocationInfo>(CURATED_CITIES[0]); // Default to New Delhi
  const [activeTab, setActiveTab] = useState<TabId>('dashboard');
  const [microProfile, setMicroProfile] = useState<MicroProfile>('General');
  const [airData, setAirData] = useState<AirQualityResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Modals & Drawers
  const [isAuditOpen, setIsAuditOpen] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [isEmergencyPlanOpen, setIsEmergencyPlanOpen] = useState(false);

  // Dark Mode
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // Load Air Quality Data
  const loadData = useCallback(async (loc: LocationInfo, isSilent = false) => {
    if (!isSilent) setIsLoading(true);
    else setIsRefreshing(true);
    setError(null);

    try {
      const data = await fetchAirQualityData(loc);
      setAirData(data);
    } catch (err: any) {
      console.error('Failed to load air quality data:', err);
      setError(err?.message || 'Unable to connect to Copernicus Atmospheric API. Please verify network access.');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadData(currentLocation);
  }, [currentLocation, loadData]);

  // Auto-refresh every 90 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      loadData(currentLocation, true);
    }, 90000);
    return () => clearInterval(interval);
  }, [currentLocation, loadData]);

  const handleSelectLocation = (loc: LocationInfo) => {
    setCurrentLocation(loc);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col selection:bg-emerald-500 selection:text-white">
      
      {/* Top Navigation Bar */}
      <Navbar
        currentLocation={currentLocation}
        onSelectLocation={handleSelectLocation}
        microProfile={microProfile}
        onChangeProfile={setMicroProfile}
        airData={airData}
        onOpenAudit={() => setIsAuditOpen(true)}
        onOpenShare={() => setIsShareOpen(true)}
        onRefresh={() => loadData(currentLocation, true)}
        isRefreshing={isRefreshing}
        darkMode={darkMode}
        onToggleDarkMode={() => setDarkMode(!darkMode)}
      />

      {/* Main Tab Navigation Strip */}
      <NavigationTabs
        activeTab={activeTab}
        onChangeTab={setActiveTab}
      />

      {/* Error State Banner */}
      {error && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-4 w-full">
          <div className="p-4 rounded-xl border border-rose-300 dark:border-rose-800 bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-200 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{error}</span>
            </div>
            <button
              onClick={() => loadData(currentLocation)}
              className="px-3 py-1 bg-rose-600 text-white font-semibold rounded-lg hover:bg-rose-700 transition-colors"
            >
              Retry Connection
            </button>
          </div>
        </div>
      )}

      {/* Main Content View with Short Smooth Page Transitions (200ms) */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 w-full">
        {isLoading && !airData ? (
          <div className="min-h-[450px] flex flex-col items-center justify-center space-y-3">
            <RefreshCw className="w-7 h-7 text-emerald-600 dark:text-emerald-400 animate-spin" />
            <p className="text-xs font-semibold text-slate-500">
              Querying Copernicus Atmosphere Monitoring Service (CAMS)...
            </p>
          </div>
        ) : airData ? (
          <div key={activeTab} className="page-fade-active">
            {activeTab === 'dashboard' && (
              <DashboardTab
                airData={airData}
                microProfile={microProfile}
                onSelectCity={handleSelectLocation}
                onOpenEmergencyPlan={() => setIsEmergencyPlanOpen(true)}
                onNavigateToTab={setActiveTab}
              />
            )}

            {activeTab === 'map' && (
              <MapTab
                currentLocation={currentLocation}
                onSelectLocation={handleSelectLocation}
                onNavigateToTab={setActiveTab}
              />
            )}

            {activeTab === 'history' && (
              <HistoryTab
                airData={airData}
                onNavigateToTab={setActiveTab}
              />
            )}

            {activeTab === 'forecast' && (
              <ForecastTab
                airData={airData}
                onNavigateToTab={setActiveTab}
              />
            )}

            {activeTab === 'compare' && (
              <ComparisonTab
                currentLocation={currentLocation}
                currentAirData={airData}
                onNavigateToTab={setActiveTab}
              />
            )}

            {activeTab === 'health' && (
              <HealthCenterTab
                airData={airData}
                microProfile={microProfile}
                onOpenEmergencyPlan={() => setIsEmergencyPlanOpen(true)}
                onNavigateToTab={setActiveTab}
              />
            )}

            {activeTab === 'exposure' && (
              <ExposureTrackerTab
                airData={airData}
                onNavigateToTab={setActiveTab}
              />
            )}

            {activeTab === 'simulator' && (
              <SimulatorTab
                airData={airData}
                onNavigateToTab={setActiveTab}
              />
            )}

            {activeTab === 'assistant' && (
              <AiAssistantTab
                airData={airData}
                microProfile={microProfile}
                onNavigateToTab={setActiveTab}
              />
            )}

            {activeTab === 'leaderboard' && (
              <LeaderboardTab
                onSelectLocation={handleSelectLocation}
                onNavigateToTab={setActiveTab}
              />
            )}
          </div>
        ) : null}
      </main>

      {/* Intelligent Guided Next Step Banner */}
      <NextStepGuide
        activeTab={activeTab}
        airData={airData}
        microProfile={microProfile}
        onNavigate={setActiveTab}
      />

      {/* Global Modals & Drawers */}
      <AuditDrawer
        isOpen={isAuditOpen}
        onClose={() => setIsAuditOpen(false)}
        airData={airData}
      />

      <EmergencyPlanModal
        isOpen={isEmergencyPlanOpen}
        onClose={() => setIsEmergencyPlanOpen(false)}
        airData={airData}
        microProfile={microProfile}
      />

      <SocialShareModal
        isOpen={isShareOpen}
        onClose={() => setIsShareOpen(false)}
        airData={airData}
        microProfile={microProfile}
      />

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 py-6 text-xs text-slate-500 transition-colors mt-auto no-print">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Wind className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span className="font-semibold text-slate-700 dark:text-slate-300">
              BreatheBetter
            </span>
            <span>• Authentic Atmospheric Environmental Intelligence</span>
          </div>
          <div className="flex items-center gap-4 text-[11px]">
            <span>Copernicus CAMS & Open-Meteo Public API</span>
            <span>•</span>
            <span className="text-emerald-600 dark:text-emerald-400 font-medium">
              Zero Shadows & Emojis Compliant
            </span>
            <span>•</span>
            <button
              onClick={() => setIsAuditOpen(true)}
              className="hover:underline text-slate-700 dark:text-slate-300 cursor-pointer"
            >
              Audit Log
            </button>
          </div>
        </div>
      </footer>

    </div>
  );
};

export default App;
