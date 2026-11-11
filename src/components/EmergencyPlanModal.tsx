import React from 'react';
import { AirQualityResponse, MicroProfile } from '../types/airQuality';
import { getAQICategory } from '../utils/aqiUtils';
import { 
  X, 
  Printer, 
  AlertTriangle, 
  ShieldAlert, 
  PhoneCall, 
  CheckCircle2, 
  Wind,
  FileText
} from 'lucide-react';

interface EmergencyPlanModalProps {
  isOpen: boolean;
  onClose: () => void;
  airData: AirQualityResponse | null;
  microProfile: MicroProfile;
}

export const EmergencyPlanModal: React.FC<EmergencyPlanModalProps> = ({
  isOpen,
  onClose,
  airData,
  microProfile,
}) => {
  if (!isOpen || !airData) return null;

  const aqi = airData.current.us_aqi;
  const aqiInfo = getAQICategory(aqi, microProfile);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="w-full max-w-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-h-[92vh] flex flex-col overflow-hidden">
        
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between no-print">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 border border-rose-300 dark:border-rose-800">
              <ShieldAlert className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                Personalized Emergency Health Action Plan
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Active Profile: <span className="font-semibold">{microProfile}</span> | Location: {airData.location.name}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / Save PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Printable Document Body */}
        <div className="p-6 space-y-6 overflow-y-auto print:p-0">
          
          {/* Official Document Banner */}
          <div className="border border-slate-300 dark:border-slate-700 rounded-xl p-4 bg-slate-50 dark:bg-slate-800">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 dark:border-slate-700 pb-3">
              <div>
                <div className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                  BreatheBetter Environmental Health Protocol
                </div>
                <h1 className="text-lg font-bold text-slate-900 dark:text-white">
                  Severe Air Pollution Action Plan (Protocol Level: {aqiInfo.category})
                </h1>
              </div>
              <div className="text-right text-xs font-mono text-slate-500">
                Date: {new Date().toLocaleDateString('en-US', { dateStyle: 'medium' })}
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 text-xs">
              <div>
                <span className="text-slate-500 dark:text-slate-400 block">Monitored AQI</span>
                <span className="font-bold text-base text-slate-900 dark:text-white">{aqi} ({aqiInfo.label})</span>
              </div>
              <div>
                <span className="text-slate-500 dark:text-slate-400 block">PM2.5 Concentration</span>
                <span className="font-bold text-base text-slate-900 dark:text-white">{airData.current.pm2_5} µg/m³</span>
              </div>
              <div>
                <span className="text-slate-500 dark:text-slate-400 block">Target Patient Profile</span>
                <span className="font-bold text-base text-emerald-600 dark:text-emerald-400">{microProfile}</span>
              </div>
              <div>
                <span className="text-slate-500 dark:text-slate-400 block">Recommended Status</span>
                <span className="font-bold text-base text-rose-600 dark:text-rose-400">Shelter Indoors</span>
              </div>
            </div>
          </div>

          {/* Critical Immediate Actions */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>Phase 1: Immediate Containment Actions</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3 border border-slate-200 dark:border-slate-800 rounded-lg">
                <span className="font-semibold block text-slate-900 dark:text-white">1. Seal Indoor Environment</span>
                <p className="text-slate-600 dark:text-slate-400 mt-1">
                  Keep all windows and exterior vents strictly closed. Use damp towels or weather-stripping at window gaps.
                </p>
              </div>

              <div className="p-3 border border-slate-200 dark:border-slate-800 rounded-lg">
                <span className="font-semibold block text-slate-900 dark:text-white">2. Maximum HEPA Filtration</span>
                <p className="text-slate-600 dark:text-slate-400 mt-1">
                  Set True-HEPA air purifiers to medium or high speed. Turn car air conditioner to internal recirculation mode only.
                </p>
              </div>

              <div className="p-3 border border-slate-200 dark:border-slate-800 rounded-lg">
                <span className="font-semibold block text-slate-900 dark:text-white">3. Mandate N95 / FFP2 Protection</span>
                <p className="text-slate-600 dark:text-slate-400 mt-1">
                  Cloth and basic surgical masks fail to filter microscopic PM2.5. If exiting indoors, fit-tested N95 respirators are required.
                </p>
              </div>

              <div className="p-3 border border-slate-200 dark:border-slate-800 rounded-lg">
                <span className="font-semibold block text-slate-900 dark:text-white">4. Cancel Outdoor Aerobics</span>
                <p className="text-slate-600 dark:text-slate-400 mt-1">
                  Vigorous breathing bypasses nasal cilia and deposits toxic ultrafine combustion matter deep in alveolar tissue.
                </p>
              </div>
            </div>
          </div>

          {/* Profile-Specific Guidance */}
          <div className="p-4 rounded-xl border border-amber-300 dark:border-amber-800 bg-amber-50/50 dark:bg-amber-950/30 text-xs">
            <span className="font-bold text-amber-900 dark:text-amber-200 block mb-1">
              Custom Directive for {microProfile} Individuals:
            </span>
            <p className="text-amber-800 dark:text-amber-300">
              {microProfile === 'Asthmatic' && 'Keep quick-relief inhalers (e.g. Salbutamol / Albuterol) on your person at all times. Check peak flow rate twice daily. Pre-medicate if brief outdoor transit is unavoidable.'}
              {microProfile === 'Senior' && 'Monitor resting blood pressure and heart rate. High particulate spikes trigger systemic vascular inflammation and strain cardiac output. Stay rested and hydrated.'}
              {microProfile === 'Pregnant' && 'Ultrafine particulates can cross the placental barrier and elevate pre-term risk. Strictly avoid areas with vehicle exhaust and diesel fumes.'}
              {microProfile === 'Athlete' && 'Reschedule all track, cycling, or football training indoors. Sustained tidal volumes above 40 L/min during smog spikes cause acute airway inflammation.'}
              {microProfile === 'Child' && 'Keep school sports indoors. Ensure classrooms maintain clean air filtration with doors closed.'}
              {microProfile === 'General' && 'Drink ample water to maintain mucus membrane hydration. Use saline nasal rinses after outdoor exposure.'}
            </p>
          </div>

          {/* Symptom Red-Flags & Emergency Helplines */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-3 rounded-lg border border-rose-200 dark:border-rose-900 bg-rose-50/30 dark:bg-rose-950/20 text-xs">
              <span className="font-bold text-rose-800 dark:text-rose-300 block mb-1.5 flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>Immediate Medical Warning Signs</span>
              </span>
              <ul className="space-y-1 text-slate-700 dark:text-slate-300 list-disc pl-4">
                <li>Sudden wheezing or inability to speak full sentences</li>
                <li>Persistent tightness or pressure across the chest</li>
                <li>Dizziness, lightheadedness, or blue lips/fingertips</li>
                <li>Cough unresponsive to prescribed bronchodilators</li>
              </ul>
            </div>

            <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 text-xs">
              <span className="font-bold text-slate-900 dark:text-white block mb-1.5 flex items-center gap-1">
                <PhoneCall className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>Emergency Contact Pointers</span>
              </span>
              <div className="space-y-1.5 text-slate-600 dark:text-slate-300">
                <div className="flex justify-between">
                  <span>National Emergency Line:</span>
                  <span className="font-mono font-bold text-slate-900 dark:text-white">112 / 911</span>
                </div>
                <div className="flex justify-between">
                  <span>National Health Information:</span>
                  <span className="font-mono font-bold text-slate-900 dark:text-white">1075</span>
                </div>
                <div className="flex justify-between">
                  <span>Ambulance Direct:</span>
                  <span className="font-mono font-bold text-slate-900 dark:text-white">102 / 108</span>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 flex items-center justify-between no-print">
          <span className="text-xs text-slate-500">
            Click 'Print / Save PDF' to generate an official hardcopy or digital file.
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-900 text-white dark:bg-white dark:text-slate-900 text-xs font-semibold rounded-lg hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors"
          >
            Close Plan
          </button>
        </div>

      </div>
    </div>
  );
};
