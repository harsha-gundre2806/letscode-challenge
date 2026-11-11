import { AirQualityResponse, MicroProfile } from '../types/airQuality';
import { getAQICategory } from '../utils/aqiUtils';

export function getEffectiveGeminiApiKey(): string {
  if (typeof window !== 'undefined') {
    const localKey = localStorage.getItem('breathe_gemini_api_key');
    if (localKey && localKey.trim()) return localKey.trim();
  }
  return import.meta.env.VITE_GEMINI_API_KEY || '';
}

export function setCustomGeminiApiKey(key: string) {
  if (typeof window !== 'undefined') {
    if (key.trim()) {
      localStorage.setItem('breathe_gemini_api_key', key.trim());
    } else {
      localStorage.removeItem('breathe_gemini_api_key');
    }
  }
}

export async function askGeminiOrFallback(
  userQuery: string,
  airData: AirQualityResponse,
  profile: MicroProfile
): Promise<string> {
  const apiKey = getEffectiveGeminiApiKey();

  if (apiKey) {
    try {
      const aqi = airData.current.us_aqi;
      const cat = getAQICategory(aqi, profile);

      const systemPrompt = `You are BreatheAI, a world-class environmental health and atmospheric chemistry assistant on the BreatheBetter platform.
You are assisting a user in ${airData.location.name}, ${airData.location.country}.
Live Real-World Atmospheric Measurements:
- US AQI: ${aqi} (${cat.label})
- PM2.5: ${airData.current.pm2_5} µg/m³ (WHO 24h limit is 15 µg/m³)
- PM10: ${airData.current.pm10} µg/m³
- NO2: ${airData.current.nitrogen_dioxide} µg/m³
- O3: ${airData.current.ozone} µg/m³
- Temperature: ${airData.current.temperature ?? '26'}°C, Humidity: ${airData.current.humidity ?? '50'}%
- Active Vulnerable Profile: ${profile}

Provide a direct, compassionate, clinically sound, and scientifically grounded response. 
Use clear bullet points where appropriate. Do NOT use emojis. Strict markdown formatting only.`;

      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [
            {
              role: 'user',
              parts: [
                { text: `${systemPrompt}\n\nUser Question: ${userQuery}` }
              ]
            }
          ]
        })
      });

      if (res.ok) {
        const json = await res.json();
        const candidate = json.candidates?.[0]?.content?.parts?.[0]?.text;
        if (candidate) {
          return candidate;
        }
      }
    } catch (apiErr) {
      console.warn('Gemini API call failed, activating built-in domain intelligence engine:', apiErr);
    }
  }

  // Built-in intelligent domain fallback
  return generateDomainResponse(userQuery, airData, profile);
}

function generateDomainResponse(
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
      return `Based on live verified measurements in **${location}** (AQI: **${aqi}**, PM2.5: **${pm25} µg/m³**), outdoor endurance exercise is **strictly discouraged**. 

During cardiovascular exertion, minute ventilation rate spikes from ~8 L/min to over 35 L/min. Mouth breathing bypasses nasal cilia filtration, depositing toxic fine aerosols directly into your alveolar lung tissue. 

**Recommendation:** Shift workouts indoors in a sealed room equipped with an operating HEPA purifier. Consult the 7-Day Forecast tab for cleaner daylight windows.`;
    } else if (aqi > 100) {
      return `Air quality in **${location}** is currently **Moderate to Sensitive** (AQI: **${aqi}**). 

For healthy individuals, low-intensity walks under 30 minutes are permissible. For your active profile of **${profile}**, vigorous aerobic training outdoors should be avoided. Exercise indoors or reschedule.`;
    } else {
      return `Conditions in **${location}** (AQI: **${aqi}**, PM2.5: **${pm25} µg/m³**) are clean and satisfactory. Excellent period for outdoor jogging, cycling, and sports.`;
    }
  }

  if (q.includes('mask') || q.includes('n95') || q.includes('cloth') || q.includes('wear')) {
    return `Respiratory masking guidance for **${location}** at PM2.5 level of **${pm25} µg/m³**:

1. **N95 / FFP2 / KN95 Respirator**: ${pm25 > 35 ? '**Mandatory if outdoors**. Cloth masks have pore sizes of 100+ microns, failing to obstruct microscopic PM2.5 soot (<2.5 microns).' : 'Recommended for vulnerable demographics; optional for healthy individuals.'}
2. **Seal Integrity**: Check the nasal bridge seal. Any perimeter air gap cuts filtration efficiency by half.
3. **Valveless Models**: Prefer models without exhalation valves when in shared transit.`;
  }

  if (q.includes('child') || q.includes('kid') || q.includes('school') || q.includes('play')) {
    if (aqi > 100) {
      return `Pediatric advisory for **${location}**: Children breathe 50% more air per pound of body mass than adults, and their respiratory system is still forming. 

At current AQI **${aqi}**, school outdoor sports and prolonged recess should be held in filtered indoor facilities.`;
    }
    return `Current air quality in **${location}** (AQI: **${aqi}**) is safe for children's outdoor play.`;
  }

  if (q.includes('why') || q.includes('cause') || q.includes('spike') || q.includes('high')) {
    return `In **${location}**, today's PM2.5 reading of **${pm25} µg/m³** is influenced by:

1. **Vehicular & Industrial Emissions**: Combustion precursors (NO2: ${data.current.nitrogen_dioxide} µg/m³).
2. **Nocturnal Planetary Boundary Layer Inversion**: Cold ground air traps surface emissions until solar thermal convection breaks the ceiling.
3. **Regional Secondary Aerosols**: Atmospheric photochemical synthesis from sulfur and nitrogen emissions.`;
  }

  if (q.includes('purifier') || q.includes('hepa') || q.includes('room') || q.includes('indoor')) {
    return `Indoor air purification rules for **${location}**:

1. **True HEPA H13/H14 Filter**: Filters 99.97% of aerosols down to 0.3 microns. Avoid standalone ionizers that generate harmful ozone.
2. **CADR Sizing**: The Clean Air Delivery Rate should be at least 4x your room's cubic volume in cubic meters per hour.
3. **Room Sealing**: Keep exterior windows and draft points closed to prevent continuous ambient particulate infiltration.`;
  }

  return `Regarding **${location}**:
The current Air Quality Index is **${aqi}** (${category.label}) with PM2.5 measured at **${pm25} µg/m³**.

For your active profile of **${profile}**:
${category.generalHealthAdvisory}

You can also use the **Commute Life-Log** tab to calculate inhaled microgram dosages or the **What-If Simulator** to model emission reduction policies.`;
}
