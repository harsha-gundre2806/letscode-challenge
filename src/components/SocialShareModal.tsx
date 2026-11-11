import React, { useState } from 'react';
import { AirQualityResponse, MicroProfile } from '../types/airQuality';
import { getAQICategory } from '../utils/aqiUtils';
import { 
  X, 
  Share2, 
  Copy, 
  Check, 
  Wind, 
  ShieldCheck,
  Download
} from 'lucide-react';

interface SocialShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  airData: AirQualityResponse | null;
  microProfile: MicroProfile;
}

export const SocialShareModal: React.FC<SocialShareModalProps> = ({
  isOpen,
  onClose,
  airData,
  microProfile,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen || !airData) return null;

  const aqi = airData.current.us_aqi;
  const aqiInfo = getAQICategory(aqi, microProfile);

  const shareText = `Air Quality Alert for ${airData.location.name}:
Current AQI: ${aqi} (${aqiInfo.label})
PM2.5: ${airData.current.pm2_5} µg/m³ | PM10: ${airData.current.pm10} µg/m³
Advisory: ${aqiInfo.generalHealthAdvisory}
Monitored via BreatheBetter Air Quality Intelligence Platform (Copernicus CAMS & Open-Meteo). #CleanAir #AirQuality #BreatheBetter`;

  const handleCopyText = () => {
    navigator.clipboard.writeText(shareText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden">
        
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Share2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">
              Share Air Quality Card
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Card Preview */}
        <div className="p-5">
          <div className="border border-slate-300 dark:border-slate-700 rounded-xl p-5 bg-slate-50 dark:bg-slate-800 space-y-4">
            
            {/* Top Bar */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-md bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                  <Wind className="w-4 h-4" />
                </div>
                <span className="text-xs font-bold tracking-tight text-slate-900 dark:text-white">
                  BreatheBetter Report
                </span>
              </div>
              <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                Verified Data
              </span>
            </div>

            {/* City & AQI Stat */}
            <div className="flex items-end justify-between border-b border-slate-200 dark:border-slate-700 pb-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  {airData.location.name}
                </h3>
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  {airData.location.country}
                </span>
              </div>
              <div className="text-right">
                <div className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                  {aqi}
                </div>
                <span className={`inline-block text-[11px] font-semibold px-2 py-0.5 rounded border ${aqiInfo.badgeBg} ${aqiInfo.badgeText} ${aqiInfo.borderColor}`}>
                  {aqiInfo.label}
                </span>
              </div>
            </div>

            {/* Pollutant Chips */}
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="p-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                <span className="text-[10px] text-slate-400 uppercase font-semibold block">PM2.5</span>
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">{airData.current.pm2_5} µg</span>
              </div>
              <div className="p-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                <span className="text-[10px] text-slate-400 uppercase font-semibold block">PM10</span>
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">{airData.current.pm10} µg</span>
              </div>
              <div className="p-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                <span className="text-[10px] text-slate-400 uppercase font-semibold block">NO2</span>
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">{airData.current.nitrogen_dioxide} µg</span>
              </div>
            </div>

            {/* Advisory */}
            <div className="text-xs text-slate-600 dark:text-slate-400 bg-white dark:bg-slate-800 p-2.5 rounded-lg border border-slate-200 dark:border-slate-700">
              <span className="font-semibold text-slate-900 dark:text-slate-200 block mb-0.5">Advisory:</span>
              {aqiInfo.generalHealthAdvisory}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1">
              <span>Source: Copernicus CAMS & NOAA</span>
              <span>letscode-diwali-2026</span>
            </div>

          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-5 py-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 flex items-center justify-between gap-3">
          <button
            onClick={handleCopyText}
            className="w-full inline-flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-semibold rounded-lg bg-slate-900 text-white dark:bg-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors cursor-pointer"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied Summary!' : 'Copy Summary for Social Media'}</span>
          </button>
        </div>

      </div>
    </div>
  );
};
