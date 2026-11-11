import React, { useState, useRef, useEffect } from 'react';
import { AirQualityResponse, MicroProfile } from '../../types/airQuality';
import { getAQICategory, getProfileHealthWarning } from '../../utils/aqiUtils';
import { 
  Bot, 
  Send, 
  Sparkles, 
  Volume2, 
  Square, 
  User, 
  HelpCircle,
  Wind,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';

interface AiAssistantTabProps {
  airData: AirQualityResponse;
  microProfile: MicroProfile;
  onNavigateToTab: (tab: any) => void;
}

interface ChatMessage {
  id: string;
  sender: 'ai' | 'user';
  text: string;
  timestamp: string;
}

export const AiAssistantTab: React.FC<AiAssistantTabProps> = ({
  airData,
  microProfile,
  onNavigateToTab,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [speakingId, setSpeakingId] = useState<string | null>(null);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  const aqi = airData.current.us_aqi;
  const category = getAQICategory(aqi, microProfile);
  const healthWarning = getProfileHealthWarning(microProfile, aqi);

  // Initialize with intelligent context greeting
  useEffect(() => {
    if (messages.length === 0) {
      setMessages([
        {
          id: 'welcome',
          sender: 'ai',
          text: `Hello! I am BreatheAI, your environmental health & atmospheric intelligence assistant. 

I am currently analyzing live atmospheric data for **${airData.location.name}** (AQI: **${aqi}**, ${category.label}) tailored to your active profile of **${microProfile}**. 

How can I help you navigate today's air conditions? You can ask about outdoor exercise safety, masking protocols, symptom management, or atmospheric trends.`,
          timestamp: new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }),
        },
      ]);
    }
  }, [airData.location.name, aqi, microProfile]);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSendMessage = (textToSend?: string) => {
    const text = textToSend || inputMessage;
    if (!text.trim()) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }),
    };

    setMessages(prev => [...prev, userMsg]);
    setInputMessage('');
    setIsTyping(true);

    // Context-aware AI Intelligence Engine
    setTimeout(() => {
      const responseText = generateSmartResponse(text, airData, microProfile);
      const aiMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: responseText,
        timestamp: new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }),
      };
      setMessages(prev => [...prev, aiMsg]);
      setIsTyping(false);
    }, 600);
  };

  const handleSpeak = (msgId: string, text: string) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    if (speakingId === msgId) {
      window.speechSynthesis.cancel();
      setSpeakingId(null);
      return;
    }

    window.speechSynthesis.cancel();
    const cleanText = text.replace(/[*#_]/g, '');
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = 1.0;
    utterance.onend = () => setSpeakingId(null);
    utterance.onerror = () => setSpeakingId(null);

    setSpeakingId(msgId);
    window.speechSynthesis.speak(utterance);
  };

  const quickPrompts = [
    `Can I go jogging right now in ${airData.location.name}?`,
    `What mask should I wear at current PM2.5 levels?`,
    `Is it safe for children to play outdoors today?`,
    `Why is PM2.5 so high today?`,
    `What purifier CADR do I need for my bedroom?`,
  ];

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Bot className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            <h1 className="text-xl font-bold text-slate-900 dark:text-white">
              BreatheAI Environmental Health Assistant
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Context-aware dialogue grounded in live Copernicus CAMS atmospheric measurements
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="font-semibold text-slate-700 dark:text-slate-300">Live Agent Active</span>
        </div>
      </div>

      {/* Main Chat Interface */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl flex flex-col h-[560px] overflow-hidden">
        
        {/* Messages Stream */}
        <div className="flex-1 p-6 overflow-y-auto space-y-4">
          {messages.map(msg => (
            <div
              key={msg.id}
              className={`flex gap-3 max-w-2xl ${msg.sender === 'user' ? 'ml-auto flex-row-reverse' : ''}`}
            >
              <div className={`w-8 h-8 rounded-lg shrink-0 flex items-center justify-center text-xs ${
                msg.sender === 'user'
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                  : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800'
              }`}>
                {msg.sender === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>

              <div className={`p-4 rounded-2xl text-xs space-y-2 border ${
                msg.sender === 'user'
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 border-transparent rounded-tr-xs'
                  : 'bg-slate-50 dark:bg-slate-850 text-slate-800 dark:text-slate-200 border-slate-200 dark:border-slate-800 rounded-tl-xs'
              }`}>
                <div className="whitespace-pre-line leading-relaxed">
                  {msg.text}
                </div>

                <div className="flex items-center justify-between pt-1 text-[10px] opacity-70">
                  <span>{msg.timestamp}</span>
                  {msg.sender === 'ai' && (
                    <button
                      onClick={() => handleSpeak(msg.id, msg.text)}
                      className="inline-flex items-center gap-1 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
                      title="Read aloud"
                    >
                      {speakingId === msg.id ? (
                        <>
                          <Square className="w-3 h-3 fill-current text-rose-500" />
                          <span>Stop</span>
                        </>
                      ) : (
                        <>
                          <Volume2 className="w-3 h-3" />
                          <span>Listen</span>
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="flex gap-3 max-w-2xl">
              <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 flex items-center justify-center shrink-0">
                <Bot className="w-4 h-4" />
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 text-xs text-slate-400 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce" />
                <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce [animation-delay:0.2s]" />
                <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce [animation-delay:0.4s]" />
                <span className="ml-1 text-[11px]">BreatheAI is analyzing atmospheric data...</span>
              </div>
            </div>
          )}

          <div ref={chatBottomRef} />
        </div>

        {/* Quick Suggestion Chips */}
        <div className="px-6 py-2 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900 flex items-center gap-2 overflow-x-auto no-scrollbar">
          <Sparkles className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
          {quickPrompts.map((q, idx) => (
            <button
              key={idx}
              onClick={() => handleSendMessage(q)}
              className="px-2.5 py-1 text-[11px] font-medium rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-emerald-500 dark:hover:border-emerald-500 whitespace-nowrap transition-colors cursor-pointer"
            >
              {q}
            </button>
          ))}
        </div>

        {/* Chat Input Box */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
          <form
            onSubmit={e => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={inputMessage}
              onChange={e => setInputMessage(e.target.value)}
              placeholder={`Ask BreatheAI anything about ${airData.location.name}'s air...`}
              className="flex-1 px-4 py-2.5 text-xs bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-emerald-500 dark:focus:border-emerald-500 transition-colors"
            />
            <button
              type="submit"
              disabled={!inputMessage.trim()}
              className="px-4 py-2.5 bg-slate-900 text-white dark:bg-white dark:text-slate-900 text-xs font-semibold rounded-xl hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors disabled:opacity-40 cursor-pointer flex items-center gap-1.5 shrink-0"
            >
              <Send className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Send</span>
            </button>
          </form>
        </div>

      </div>

    </div>
  );
};

// Intelligent Domain Response Engine
function generateSmartResponse(
  query: string, 
  data: AirQualityResponse, 
  profile: MicroProfile
): string {
  const q = query.toLowerCase();
  const aqi = data.current.us_aqi;
  const pm25 = data.current.pm2_5;
  const location = data.location.name;
  const category = getAQICategory(aqi, profile);

  if (q.includes('jog') || q.includes('run') || q.includes('exercise') || q.includes('walk') || q.includes('workout')) {
    if (aqi > 150) {
      return `Based on live measurements in **${location}** (AQI: **${aqi}**, PM2.5: **${pm25} µg/m³**), outdoor endurance exercise is **strongly discouraged**. 

During cardiovascular exertion, your minute ventilation rate jumps from ~8 L/min to over 35 L/min. Because you breathe through your mouth rather than your nose, natural nasal filtration is bypassed, allowing toxic ultrafine soot to penetrate directly into your terminal bronchioles. 

**Recommendation:** Shift all workouts indoors using a room with an operating HEPA purifier. Check our 7-Day Forecast tab for safe exercise windows.`;
    } else if (aqi > 100) {
      return `Air quality in **${location}** is currently **Moderate to Sensitive** (AQI: **${aqi}**). 

For a healthy individual, a brisk 20-minute walk is acceptable. However, for your active profile of **${profile}**, prolonged high-intensity interval training or marathon runs should be curtailed. Aim for low-exertion mobility work indoors.`;
    } else {
      return `Good news! Current air quality in **${location}** (AQI: **${aqi}**, PM2.5: **${pm25} µg/m³**) is well within safe thresholds. It is an optimal time for outdoor running, cycling, or team sports.`;
    }
  }

  if (q.includes('mask') || q.includes('n95') || q.includes('cloth') || q.includes('wear')) {
    return `At current particulate levels in **${location}** (PM2.5: **${pm25} µg/m³**):

1. **N95 / FFP2 Respirator**: ${pm25 > 35 ? '**Mandatory if stepping outdoors**. Standard cloth masks have pore sizes exceeding 100 microns, whereas PM2.5 particles are under 2.5 microns and pass straight through.' : 'Recommended if you have respiratory sensitivity, otherwise optional.'}
2. **Fit Check**: Ensure the metal nose clip is molded tightly to the bridge of your nose. Any air leakage around the edges reduces mask efficiency by up to 60%.
3. **Exhalation Valves**: Avoid masks with unfiltered exhalation valves if in crowded indoor transit.`;
  }

  if (q.includes('child') || q.includes('kid') || q.includes('school') || q.includes('play')) {
    if (aqi > 100) {
      return `Pediatric caution advised in **${location}**. Children breathe 50% more air per pound of body weight than adults, and their airway branches are narrower. 

At AQI **${aqi}**, outdoor physical education and playground sports should be relocated to filtered indoor gymnasiums. Keep school windows closed during peak morning traffic hours.`;
    }
    return `Current air quality in **${location}** (AQI: **${aqi}**) is safe for children's outdoor playground activities and school sports.`;
  }

  if (q.includes('why') || q.includes('cause') || q.includes('spike') || q.includes('high')) {
    return `In **${location}**, today's PM2.5 concentration of **${pm25} µg/m³** is primarily driven by:

1. **Diurnal Combustion Cycles**: Vehicular rush hour exhaust (NO2: ${data.current.nitrogen_dioxide} µg/m³) and industrial activity.
2. **Atmospheric Planetary Boundary Layer**: When ground temperatures drop at night and morning, a nocturnal thermal inversion traps particulate plumes close to the surface until solar heating restores convective mixing.
3. **Regional Aerosol Transport**: Secondary particulate formation from ambient ammonia, sulfur dioxide (${data.current.sulphur_dioxide} µg/m³), and nitrogen dioxide reacting in sunlight.`;
  }

  if (q.includes('purifier') || q.includes('hepa') || q.includes('room') || q.includes('indoor')) {
    return `For indoor air management in **${location}**:

1. **HEPA Grade**: Look for a certified **True HEPA H13 or H14** filter capable of capturing 99.97% of 0.3-micron aerosols.
2. **CADR Sizing**: Your purifier's CADR rating (m³/hour) should be at least **4 times the cubic volume** of your bedroom. 
3. **Sealing Protocol**: Keep exterior doors and windows shut. Purifiers cannot lower room PM2.5 if windows remain cracked open.
4. **Activated Carbon**: Ensure the unit includes an activated carbon bed to adsorb gaseous NO2 and volatile organic compounds.`;
  }

  return `Regarding your query about **${location}**:
The current Air Quality Index is **${aqi}** (${category.label}) with PM2.5 measured at **${pm25} µg/m³**.

For a **${profile}** profile, clinical recommendations suggest:
${category.generalHealthAdvisory}

You can also explore the **Exposure Life-Log** tab to calculate inhaled commute dosages or the **What-If Simulator** to test policy mitigation scenarios.`;
}
