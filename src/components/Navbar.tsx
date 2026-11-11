import React, { useState, useEffect, useRef } from 'react';
import { 
  Wind, 
  Search, 
  Navigation, 
  Volume2, 
  Square, 
  ShieldCheck, 
  Moon, 
  Sun, 
  UserCheck, 
  AlertCircle,
  Share2,
  RefreshCw
} from 'lucide-react';
import { LocationInfo, MicroProfile, AirQualityResponse } from '../types/airQuality';
import { searchLocations, reverseGeocode } from '../services/airQualityService';
import { speechService } from '../services/speechService';

interface NavbarProps {
  currentLocation: LocationInfo;
  onSelectLocation: (loc: LocationInfo) => void;
  microProfile: MicroProfile;
  onChangeProfile: (p: MicroProfile) => void;
  airData: AirQualityResponse | null;
  onOpenAudit: () => void;
  onOpenShare: () => void;
  onRefresh: () => void;
  isRefreshing: boolean;
  darkMode: boolean;
  onToggleDarkMode: () => void;
}

const PROFILES: { id: MicroProfile; label: string; desc: string }[] = [
  { id: 'General', label: 'General Public', desc: 'Standard EPA/WHO thresholds' },
  { id: 'Asthmatic', label: 'Asthmatic', desc: 'Heightened bronchial sensitivity (WHO strict)' },
  { id: 'Senior', label: 'Senior (65+)', desc: 'Cardiovascular protection protocols' },
  { id: 'Pregnant', label: 'Pregnant', desc: 'Maternal-fetal particulate guard' },
  { id: 'Athlete', label: 'Outdoor Athlete', desc: 'High lung ventilation adjustments' },
  { id: 'Child', label: 'Child / Pediatric', desc: 'Underdeveloped respiratory shield' },
];

export const Navbar: React.FC<NavbarProps> = ({
  currentLocation,
  onSelectLocation,
  microProfile,
  onChangeProfile,
  airData,
  onOpenAudit,
  onOpenShare,
  onRefresh,
  isRefreshing,
  darkMode,
  onToggleDarkMode,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<LocationInfo[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const profileMenuRef = useRef<HTMLDivElement>(null);

  // Subscribe to speech state
  useEffect(() => {
    const unsub = speechService.subscribe(speaking => {
      setIsSpeaking(speaking);
    });
    return unsub;
  }, []);

  // Handle outside clicks
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setShowSearchDropdown(false);
      }
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setShowProfileMenu(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Debounced search
  useEffect(() => {
    if (!searchQuery || searchQuery.trim().length < 2) {
      setSearchResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      const results = await searchLocations(searchQuery);
      setSearchResults(results);
      setIsSearching(false);
      setShowSearchDropdown(true);
    }, 280);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      async pos => {
        const { latitude, longitude } = pos.coords;
        const loc = await reverseGeocode(latitude, longitude);
        onSelectLocation(loc);
      },
      err => {
        console.warn('Geolocation error:', err);
        alert('Could not determine your location. Please check browser permissions.');
      }
    );
  };

  const handleAudioBriefing = () => {
    if (!airData) return;
    if (isSpeaking) {
      speechService.stop();
    } else {
      speechService.playAirBriefing(airData, microProfile);
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-3">
        
        {/* Brand Logo */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-10 h-10 rounded-lg bg-emerald-500/10 dark:bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
            <Wind className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-lg tracking-tight text-slate-900 dark:text-white">
                BreatheBetter
              </span>
              <span className="text-[10px] font-semibold tracking-wider uppercase px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                Live CAMS
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 hidden sm:block">
              Air Quality Intelligence Platform
            </p>
          </div>
        </div>

        {/* Global Location Search & Detect */}
        <div className="relative flex-1 max-w-md" ref={searchContainerRef}>
          <div className="relative flex items-center">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              onFocus={() => {
                if (searchResults.length > 0) setShowSearchDropdown(true);
              }}
              placeholder={`Search any city (currently ${currentLocation.name})...`}
              className="w-full pl-9 pr-10 py-1.5 text-sm bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-emerald-500 dark:focus:border-emerald-500 transition-colors"
            />
            {isSearching ? (
              <RefreshCw className="w-3.5 h-3.5 text-slate-400 animate-spin absolute right-3" />
            ) : (
              <button
                onClick={handleDetectLocation}
                title="Detect My Current Location"
                className="absolute right-2 p-1 text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 rounded transition-colors"
              >
                <Navigation className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Autocomplete Dropdown */}
          {showSearchDropdown && searchResults.length > 0 && (
            <div className="absolute left-0 right-0 top-full mt-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg py-1 z-50 max-h-64 overflow-y-auto">
              {searchResults.map((loc, idx) => (
                <button
                  key={`${loc.name}-${loc.latitude}-${idx}`}
                  onClick={() => {
                    onSelectLocation(loc);
                    setShowSearchDropdown(false);
                    setSearchQuery('');
                  }}
                  className="w-full text-left px-3 py-2 text-sm hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-between transition-colors"
                >
                  <span className="font-medium text-slate-900 dark:text-slate-100">
                    {loc.name}
                    {loc.admin1 && (
                      <span className="text-xs text-slate-500 ml-1.5">
                        ({loc.admin1})
                      </span>
                    )}
                  </span>
                  <span className="text-xs text-slate-400">{loc.country}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right Tools: Micro-Profile, Audio Briefing, Share, Audit, Refresh, Theme */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          
          {/* Micro-Profile Vulnerable Group Switcher */}
          <div className="relative" ref={profileMenuRef}>
            <button
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:border-slate-300 dark:hover:border-slate-600 transition-colors"
              title="Vulnerable Group Profile Guard"
            >
              <UserCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span className="hidden md:inline">Profile:</span>
              <span className="font-semibold">{microProfile}</span>
            </button>

            {showProfileMenu && (
              <div className="absolute right-0 top-full mt-1.5 w-64 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-1.5 z-50">
                <div className="px-2 py-1 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  Vulnerable Group Guard
                </div>
                {PROFILES.map(p => (
                  <button
                    key={p.id}
                    onClick={() => {
                      onChangeProfile(p.id);
                      setShowProfileMenu(false);
                    }}
                    className={`w-full text-left px-2.5 py-2 rounded text-xs transition-colors ${
                      microProfile === p.id 
                        ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 font-medium border border-emerald-200 dark:border-emerald-800' 
                        : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    <div className="font-semibold">{p.label}</div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">{p.desc}</div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Audio Briefing Button (Text-to-Speech) */}
          <button
            onClick={handleAudioBriefing}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-lg border transition-colors ${
              isSpeaking
                ? 'bg-rose-50 text-rose-700 border-rose-300 dark:bg-rose-950/50 dark:text-rose-300 dark:border-rose-800 animate-pulse'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
            }`}
            title={isSpeaking ? 'Stop Audio Briefing' : 'Play 30s Audio Air Quality Briefing'}
          >
            {isSpeaking ? (
              <>
                <Square className="w-3.5 h-3.5 fill-current" />
                <span className="hidden sm:inline">Stop</span>
              </>
            ) : (
              <>
                <Volume2 className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                <span className="hidden sm:inline">Briefing</span>
              </>
            )}
          </button>

          {/* Social Share Card Button */}
          <button
            onClick={onOpenShare}
            className="p-1.5 text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 rounded-lg transition-colors"
            title="Generate Shareable AQI Report Card"
          >
            <Share2 className="w-4 h-4" />
          </button>

          {/* Transparency Source Audit Trigger */}
          <button
            onClick={onOpenAudit}
            className="flex items-center gap-1 px-2 py-1.5 text-xs font-medium rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-600 transition-colors"
            title="Inspect Data Authenticity & CAMS Source Log"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span className="hidden lg:inline">Source Audit</span>
          </button>

          {/* Manual Refresh Button */}
          <button
            onClick={onRefresh}
            disabled={isRefreshing}
            className="p-1.5 text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 rounded-lg transition-colors disabled:opacity-50"
            title="Refresh Live Atmospheric Measurements"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          </button>

          {/* Dark / Light Mode Toggle */}
          <button
            onClick={onToggleDarkMode}
            className="p-1.5 text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 rounded-lg transition-colors"
            title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
          </button>
        </div>

      </div>
    </header>
  );
};
