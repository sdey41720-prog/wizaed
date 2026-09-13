import React from 'react';
import { CloudRain, Wind, Thermometer, Cloud, Eye, EyeOff } from 'lucide-react';
import { WeatherOverlayType } from '../types';
import { playUiClick } from '../utils/audio';

interface WeatherOverlayPanelProps {
  weatherOverlay: WeatherOverlayType;
  setWeatherOverlay: (overlay: WeatherOverlayType) => void;
}

export const WeatherOverlayPanel: React.FC<WeatherOverlayPanelProps> = ({
  weatherOverlay,
  setWeatherOverlay,
}) => {
  if (weatherOverlay === 'none') return null;

  return (
    <aside 
      aria-label="Atmospheric Weather Overlay"
      id="weather-overlay-hud-panel"
      className="fixed bottom-6 left-28 z-20 rounded-2xl bg-slate-950/85 backdrop-blur-xl border border-sky-500/30 p-3.5 shadow-2xl pointer-events-auto text-white text-xs font-mono max-w-xs transition-all duration-300"
    >
      <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-2">
        <div className="flex items-center gap-1.5 text-sky-400 font-bold">
          {weatherOverlay === 'clouds' && <Cloud className="w-4 h-4" />}
          {weatherOverlay === 'precipitation' && <CloudRain className="w-4 h-4 text-emerald-400" />}
          {weatherOverlay === 'wind' && <Wind className="w-4 h-4 text-sky-400" />}
          {weatherOverlay === 'temp' && <Thermometer className="w-4 h-4 text-amber-400" />}
          <span className="uppercase tracking-wide text-[11px]">
            {weatherOverlay === 'clouds' ? 'Troposphere Clouds' :
             weatherOverlay === 'precipitation' ? 'Doppler Radar' :
             weatherOverlay === 'wind' ? 'Jetstream Flow' : 'Thermal Heatmap'}
          </span>
        </div>

        <button
          onClick={() => { setWeatherOverlay('none'); playUiClick(); }}
          className="text-slate-400 hover:text-white p-0.5 rounded"
          title="Turn off weather overlay"
        >
          <EyeOff className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Dynamic Legend based on layer */}
      {weatherOverlay === 'precipitation' && (
        <div className="space-y-1 text-[10px]">
          <div className="flex items-center justify-between text-slate-400">
            <span>Precipitation Rate</span>
            <span>0 - 85 mm/h</span>
          </div>
          <div className="h-2 rounded-full bg-gradient-to-r from-sky-400 via-emerald-400 via-amber-400 to-rose-600 shadow-sm" />
          <div className="flex justify-between text-[9px] text-slate-500 pt-0.5">
            <span>Light</span>
            <span>Moderate</span>
            <span>Severe Storm</span>
          </div>
        </div>
      )}

      {weatherOverlay === 'wind' && (
        <div className="space-y-1 text-[10px]">
          <div className="flex items-center justify-between text-slate-400">
            <span>Jetstream Velocity</span>
            <span>120 - 240 Kts</span>
          </div>
          <div className="h-2 rounded-full bg-gradient-to-r from-sky-600 via-sky-400 to-cyan-200" />
          <div className="flex justify-between text-[9px] text-slate-500 pt-0.5">
            <span>Westerly Flow</span>
            <span>Subtropical Core</span>
          </div>
        </div>
      )}

      {weatherOverlay === 'temp' && (
        <div className="space-y-1 text-[10px]">
          <div className="flex items-center justify-between text-slate-400">
            <span>Surface Temperature</span>
            <span>-30°C to +45°C</span>
          </div>
          <div className="h-2 rounded-full bg-gradient-to-r from-indigo-500 via-sky-400 via-amber-400 to-rose-600" />
          <div className="flex justify-between text-[9px] text-slate-500 pt-0.5">
            <span>Polar Ice</span>
            <span>Temperate</span>
            <span>Equatorial</span>
          </div>
        </div>
      )}

      {weatherOverlay === 'clouds' && (
        <div className="space-y-1 text-[10px]">
          <div className="flex items-center justify-between text-slate-400">
            <span>Cloud Albedo & Density</span>
            <span>10% - 95%</span>
          </div>
          <div className="h-2 rounded-full bg-gradient-to-r from-slate-800 via-slate-400 to-white" />
        </div>
      )}
    </aside>
  );
};
