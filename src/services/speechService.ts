import { AirQualityResponse, MicroProfile } from '../types/airQuality';
import { getAQICategory, getProfileHealthWarning } from '../utils/aqiUtils';

class SpeechService {
  private synth: SpeechSynthesis | null = null;
  private currentUtterance: SpeechSynthesisUtterance | null = null;
  private isSpeaking = false;
  private listeners: ((speaking: boolean) => void)[] = [];

  constructor() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.synth = window.speechSynthesis;
    }
  }

  public subscribe(listener: (speaking: boolean) => void): () => void {
    this.listeners.push(listener);
    listener(this.isSpeaking);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notify() {
    this.listeners.forEach(l => l(this.isSpeaking));
  }

  public playAirBriefing(data: AirQualityResponse, profile: MicroProfile) {
    if (!this.synth) {
      alert('Speech synthesis is not supported on this browser.');
      return;
    }

    this.stop();

    const aqi = data.current.us_aqi;
    const cat = getAQICategory(aqi, profile);
    const health = getProfileHealthWarning(profile, aqi);

    const script = `Good day. Here is your Breathe Better atmospheric intelligence briefing for ${data.location.name}. 
The current Air Quality Index is ${aqi}, categorized as ${cat.label}. 
Fine particulate matter, PM2.5, is currently measured at ${data.current.pm2_5} micrograms per cubic meter. 
For your active profile of ${profile}, ${health.warningText}
${cat.generalHealthAdvisory}
Stay safe, monitor your exposure, and breathe better.`;

    const utterance = new SpeechSynthesisUtterance(script);
    utterance.rate = 1.02;
    utterance.pitch = 1.0;

    // Pick best English voice if available
    const voices = this.synth.getVoices();
    const englishVoice = voices.find(v => v.lang.startsWith('en') && (v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('Samantha')));
    if (englishVoice) {
      utterance.voice = englishVoice;
    }

    utterance.onstart = () => {
      this.isSpeaking = true;
      this.notify();
    };

    utterance.onend = () => {
      this.isSpeaking = false;
      this.notify();
    };

    utterance.onerror = () => {
      this.isSpeaking = false;
      this.notify();
    };

    this.currentUtterance = utterance;
    this.synth.speak(utterance);
  }

  public stop() {
    if (this.synth) {
      this.synth.cancel();
      this.isSpeaking = false;
      this.notify();
    }
  }

  public getSpeakingState(): boolean {
    return this.isSpeaking;
  }
}

export const speechService = new SpeechService();
