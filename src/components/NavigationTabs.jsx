import React from 'react';
import { 
  LayoutDashboard, 
  Map, 
  History, 
  CalendarDays, 
  GitCompare, 
  HeartPulse, 
  Footprints, 
  SlidersHorizontal, 
  Bot, 
  Trophy 
} from 'lucide-react';

const TABS = [
  { id: 'dashboard', label: 'Live Dashboard', icon: LayoutDashboard },
  { id: 'map', label: 'Pollution Map', icon: Map },
  { id: 'history', label: 'Historical Trends', icon: History },
  { id: 'forecast', label: '7-Day Forecast', icon: CalendarDays },
  { id: 'compare', label: 'Compare Cities', icon: GitCompare },
  { id: 'health', label: 'Health & Safety', icon: HeartPulse },
  { id: 'exposure', label: 'Commute Life-Log', icon: Footprints },
  { id: 'simulator', label: 'What-If Simulator', icon: SlidersHorizontal },
  { id: 'assistant', label: 'BreatheAI Chat', icon: Bot },
  { id: 'leaderboard', label: 'Leaderboard', icon: Trophy },
];

export const NavigationTabs = ({ activeTab, onChangeTab }) => {
  return (
    <nav className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-16 z-30 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-1 overflow-x-auto py-2 no-scrollbar">
          {TABS.map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onChangeTab(tab.id)}
                className={`flex items-center gap-2 px-3.5 py-2 text-xs font-medium rounded-lg whitespace-nowrap transition-all duration-200 cursor-pointer ${
                  isActive
                    ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 font-semibold border border-transparent'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 border border-transparent'
                }`}
              >
                <Icon className="w-3.5 h-3.5 shrink-0" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
};
