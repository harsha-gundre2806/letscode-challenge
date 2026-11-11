import React, { useState, useEffect, useCallback } from 'react';
import { CURATED_CITIES, fetchAirQualityData, detectAutoLocation } from './services/airQualityService';
import { Navbar } from './components/Navbar';
import { NavigationTabs } from './components/NavigationTabs';
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

import { RefreshCw, AlertCircle, Wind } from 'lucide-react';

export const App = () => {
  const [currentLocation, setCurrentLocation] = useState(CURATED_CITIES[0]);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [microProfile, setMicroProfile] = useState('General');
  const [airData, setAirData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState(null);

  // Modals & Drawers
  const [isAuditOpen, setIsAuditOpen] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [isEmergencyPlanOpen, setIsEmergencyPlanOpen] = useState(false);

  // Dark Mode with LocalStorage Persistence
  const [darkMode, setDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('breathe_better_theme');
      if (saved) return saved === 'dark';
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });

  // Apply dark mode class to html element and sync localStorage
  useEffect(() => {
    const root = document.documentElement;
    if (darkMode) {
      root.classList.add('dark');
      localStorage.setItem('breathe_better_theme', 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('breathe_better_theme', 'light');
    }
  }, [darkMode]);

  // Load Air Quality Data
  const loadData = useCallback(async (loc, isSilent = false) => {
    if (!isSilent) setIsLoading(true);
    else setIsRefreshing(true);
    setError(null);

    try {
      const data = await fetchAirQualityData(loc);
      setAirData(data);
    } catch (err) {
      console.error('Failed to load air quality data:', err);
      setError(err?.message || 'Unable to connect to Copernicus Atmospheric API. Please verify network access.');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  // Automatic Location Detection on First Load
  useEffect(() => {
    let isMounted = true;
    async function initLocation() {
      setIsLoading(true);
      try {
        const detectedLoc = await detectAutoLocation();
        if (isMounted) {
          setCurrentLocation(detectedLoc);
          await loadData(detectedLoc);
        }
      } catch (e) {
        console.warn('Auto location detection failed, loading default city:', e);
        if (isMounted) {
          await loadData(CURATED_CITIES[0]);
        }
      }
    }

    initLocation();
    return () => { isMounted = false; };
  }, [loadData]);

  // Auto-refresh every 90 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      loadData(currentLocation, true);
    }, 90000);
    return () => clearInterval(interval);
  }, [currentLocation, loadData]);

  const handleSelectLocation = (loc) => {
    setCurrentLocation(loc);
    loadData(loc);
  };

  const handleUseCurrentLocation = async () => {
    setIsLoading(true);
    try {
      const loc = await detectAutoLocation();
      setCurrentLocation(loc);
      await loadData(loc);
    } catch (e) {
      console.warn('Current location detection error:', e);
      setError('Unable to detect current place or location. Please allow browser location access.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0B0F19] text-slate-900 dark:text-slate-100 flex flex-col selection:bg-emerald-500 selection:text-white transition-colors duration-200">
      
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
              className="px-3 py-1 bg-rose-600 text-white font-semibold rounded-lg hover:bg-rose-700 transition-colors cursor-pointer"
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
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
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
                onUseCurrentLocation={handleUseCurrentLocation}
              />
            )}

            {activeTab === 'map' && (
              <MapTab
                currentLocation={currentLocation}
                onSelectLocation={handleSelectLocation}
                onNavigateToTab={setActiveTab}
                darkMode={darkMode}
              />
            )}

            {activeTab === 'history' && (
              <HistoryTab
                airData={airData}
                onNavigateToTab={setActiveTab}
                darkMode={darkMode}
              />
            )}

            {activeTab === 'forecast' && (
              <ForecastTab
                airData={airData}
                onNavigateToTab={setActiveTab}
                darkMode={darkMode}
              />
            )}

            {activeTab === 'compare' && (
              <ComparisonTab
                currentLocation={currentLocation}
                currentAirData={airData}
                onNavigateToTab={setActiveTab}
                darkMode={darkMode}
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
                darkMode={darkMode}
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
              Source Audit & Keys
            </button>
          </div>
        </div>
      </footer>

    </div>
  );
};

export default App;
