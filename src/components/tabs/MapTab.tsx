import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { LocationInfo, AirQualityResponse } from '../../types/airQuality';
import { CURATED_CITIES, reverseGeocode, fetchAirQualityData } from '../../services/airQualityService';
import { getAQICategory } from '../../utils/aqiUtils';
import { 
  MapPin, 
  Layers, 
  AlertTriangle, 
  ShieldCheck, 
  Check, 
  ExternalLink,
  Flame,
  TreePine,
  RefreshCw
} from 'lucide-react';

interface MapTabProps {
  currentLocation: LocationInfo;
  onSelectLocation: (loc: LocationInfo) => void;
  onNavigateToTab: (tab: any) => void;
}

interface MapCityMarker {
  location: LocationInfo;
  aqi: number;
  pm25: number;
  isHotspot: boolean;
  isCleanPocket: boolean;
}

// Sample global benchmark stations with authentic approximate baselines
const GLOBAL_BENCHMARK_STATIONS: MapCityMarker[] = [
  { location: { name: 'New Delhi', country: 'India', latitude: 28.6139, longitude: 77.2090 }, aqi: 245, pm25: 110, isHotspot: true, isCleanPocket: false },
  { location: { name: 'Lahore', country: 'Pakistan', latitude: 31.5204, longitude: 74.3587 }, aqi: 280, pm25: 145, isHotspot: true, isCleanPocket: false },
  { location: { name: 'Beijing', country: 'China', latitude: 39.9042, longitude: 116.4074 }, aqi: 155, pm25: 65, isHotspot: true, isCleanPocket: false },
  { location: { name: 'Mumbai', country: 'India', latitude: 19.0760, longitude: 72.8777 }, aqi: 142, pm25: 52, isHotspot: false, isCleanPocket: false },
  { location: { name: 'Bengaluru', country: 'India', latitude: 12.9716, longitude: 77.5946 }, aqi: 68, pm25: 22, isHotspot: false, isCleanPocket: true },
  { location: { name: 'London', country: 'United Kingdom', latitude: 51.5074, longitude: -0.1278 }, aqi: 42, pm25: 11, isHotspot: false, isCleanPocket: true },
  { location: { name: 'Paris', country: 'France', latitude: 48.8566, longitude: 2.3522 }, aqi: 48, pm25: 13, isHotspot: false, isCleanPocket: true },
  { location: { name: 'New York', country: 'United States', latitude: 40.7128, longitude: -74.0060 }, aqi: 38, pm25: 9, isHotspot: false, isCleanPocket: true },
  { location: { name: 'Reykjavik', country: 'Iceland', latitude: 64.1466, longitude: -21.9426 }, aqi: 14, pm25: 3, isHotspot: false, isCleanPocket: true },
  { location: { name: 'Tokyo', country: 'Japan', latitude: 35.6762, longitude: 139.6503 }, aqi: 32, pm25: 8, isHotspot: false, isCleanPocket: true },
  { location: { name: 'Sydney', country: 'Australia', latitude: -33.8688, longitude: 151.2093 }, aqi: 25, pm25: 6, isHotspot: false, isCleanPocket: true },
  { location: { name: 'Cairo', country: 'Egypt', latitude: 30.0444, longitude: 31.2357 }, aqi: 175, pm25: 85, isHotspot: true, isCleanPocket: false },
  { location: { name: 'Dubai', country: 'United Arab Emirates', latitude: 25.2048, longitude: 55.2708 }, aqi: 118, pm25: 42, isHotspot: false, isCleanPocket: false },
  { location: { name: 'Singapore', country: 'Singapore', latitude: 1.3521, longitude: 103.8198 }, aqi: 52, pm25: 14, isHotspot: false, isCleanPocket: true },
];

export const MapTab: React.FC<MapTabProps> = ({
  currentLocation,
  onSelectLocation,
  onNavigateToTab,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);

  const [activePollutantLayer, setActivePollutantLayer] = useState<'aqi' | 'pm25'>('aqi');
  const [selectedStation, setSelectedStation] = useState<MapCityMarker | null>(null);
  const [isFetchingCoord, setIsFetchingCoord] = useState(false);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [currentLocation.latitude, currentLocation.longitude],
        zoom: 4,
        zoomControl: true,
        attributionControl: true,
      });

      // Clean flat modern map tiles (CartoDB Positron / OSM clean)
      L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://carto.com/">CARTO</a> &copy; OpenStreetMap',
        maxZoom: 18,
      }).addTo(map);

      const markersGroup = L.layerGroup().addTo(map);
      markersLayerRef.current = markersGroup;
      mapInstanceRef.current = map;

      // Click anywhere to fetch coordinate air quality
      map.on('click', async (e: L.LeafletMouseEvent) => {
        const { lat, lng } = e.latlng;
        setIsFetchingCoord(true);

        try {
          const loc = await reverseGeocode(lat, lng);
          const data = await fetchAirQualityData(loc);
          const customMarker: MapCityMarker = {
            location: loc,
            aqi: data.current.us_aqi,
            pm25: data.current.pm2_5,
            isHotspot: data.current.us_aqi > 150,
            isCleanPocket: data.current.us_aqi <= 50,
          };
          setSelectedStation(customMarker);
        } catch (err) {
          console.error('Error fetching clicked coordinate AQI:', err);
        } finally {
          setIsFetchingCoord(false);
        }
      });
    }

    return () => {
      // Cleanup on unmount
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update Markers when station or layer changes
  useEffect(() => {
    if (!mapInstanceRef.current || !markersLayerRef.current) return;

    markersLayerRef.current.clearLayers();

    GLOBAL_BENCHMARK_STATIONS.forEach(station => {
      const cat = getAQICategory(station.aqi);
      const isSelected = selectedStation?.location.name === station.location.name;

      // Custom Clean Flat HTML Pin
      const html = `
        <div style="
          display: flex;
          align-items: center;
          justify-content: center;
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background-color: ${cat.accentColor};
          color: white;
          font-weight: 700;
          font-size: 11px;
          font-family: monospace;
          border: 2px solid white;
          cursor: pointer;
        ">
          ${activePollutantLayer === 'aqi' ? station.aqi : Math.round(station.pm25)}
        </div>
      `;

      const customIcon = L.divIcon({
        className: 'custom-aqi-pin',
        html,
        iconSize: [32, 32],
        iconAnchor: [16, 16],
      });

      const marker = L.marker([station.location.latitude, station.location.longitude], {
        icon: customIcon,
      });

      marker.on('click', () => {
        setSelectedStation(station);
      });

      markersLayerRef.current?.addLayer(marker);
    });
  }, [activePollutantLayer, selectedStation]);

  const handleSelectAsActive = (station: MapCityMarker) => {
    onSelectLocation(station.location);
    onNavigateToTab('dashboard');
  };

  return (
    <div className="space-y-4">
      
      {/* Top Map Control Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <span className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
            Interactive Pollution Layer:
          </span>
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg border border-slate-200 dark:border-slate-700">
            <button
              onClick={() => setActivePollutantLayer('aqi')}
              className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors ${
                activePollutantLayer === 'aqi'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              US AQI
            </button>
            <button
              onClick={() => setActivePollutantLayer('pm25')}
              className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors ${
                activePollutantLayer === 'pm25'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              PM2.5 (µg/m³)
            </button>
          </div>
        </div>

        <div className="flex items-center gap-3 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <span className="text-slate-600 dark:text-slate-400">Clean Pocket (&lt;50)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
            <span className="text-slate-600 dark:text-slate-400">Moderate</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
            <span className="text-slate-600 dark:text-slate-400">Hotspot (&gt;150)</span>
          </div>
        </div>
      </div>

      {/* Main Map Container & Inspector Overlay */}
      <div className="relative w-full h-[580px] bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden">
        
        {/* Leaflet Map Div */}
        <div ref={mapContainerRef} className="w-full h-full" />

        {/* Click Instruction Badge */}
        <div className="absolute top-4 left-4 z-20 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xs border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-600 dark:text-slate-300 pointer-events-none">
          Click any coordinate on Earth to query authentic atmospheric data
        </div>

        {/* Loading Indicator */}
        {isFetchingCoord && (
          <div className="absolute top-4 right-4 z-20 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-2">
            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            <span>Fetching Coordinate AQI...</span>
          </div>
        )}

        {/* Station Inspector Floating Drawer */}
        {selectedStation && (
          <div className="absolute bottom-4 right-4 z-20 w-80 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4">
            <div className="flex items-start justify-between border-b border-slate-100 dark:border-slate-800 pb-2.5">
              <div>
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                  {selectedStation.location.name}
                </h3>
                <span className="text-xs text-slate-400">
                  {selectedStation.location.country}
                </span>
              </div>
              <div className="text-right">
                <span className="text-2xl font-black font-mono text-slate-900 dark:text-white">
                  {selectedStation.aqi}
                </span>
                <span className="text-[10px] text-slate-400 uppercase block font-semibold">
                  US AQI
                </span>
              </div>
            </div>

            <div className="py-2.5 space-y-1.5 text-xs">
              <div className="flex justify-between text-slate-600 dark:text-slate-400">
                <span>PM2.5 Concentration:</span>
                <span className="font-mono font-bold text-slate-900 dark:text-white">{selectedStation.pm25} µg/m³</span>
              </div>
              <div className="flex justify-between text-slate-600 dark:text-slate-400">
                <span>Category:</span>
                <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                  {getAQICategory(selectedStation.aqi).label}
                </span>
              </div>
              <div className="flex justify-between text-slate-600 dark:text-slate-400">
                <span>Zone Classification:</span>
                <span>
                  {selectedStation.isHotspot ? (
                    <span className="inline-flex items-center gap-1 text-rose-600 font-semibold">
                      <Flame className="w-3 h-3" /> Critical Hotspot
                    </span>
                  ) : selectedStation.isCleanPocket ? (
                    <span className="inline-flex items-center gap-1 text-emerald-600 font-semibold">
                      <TreePine className="w-3 h-3" /> Clean Air Haven
                    </span>
                  ) : (
                    'Urban Baseline'
                  )}
                </span>
              </div>
            </div>

            <button
              onClick={() => handleSelectAsActive(selectedStation)}
              className="w-full mt-2 py-2 px-3 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white transition-colors cursor-pointer flex items-center justify-center gap-1.5"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Set as Active City & View Analysis</span>
            </button>
          </div>
        )}

      </div>

    </div>
  );
};
