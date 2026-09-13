import React from 'react';
import { Plane, Compass, X } from 'lucide-react';
import { Flight } from '../types';

interface CockpitViewModalProps {
  flight: Flight | null;
  onClose: () => void;
}

export const CockpitViewModal: React.FC<CockpitViewModalProps> = ({
  flight,
  onClose,
}) => {
  if (!flight) return null;

  const machSpeed = (flight.speedKts / 661.47).toFixed(2);

  return (
    <div 
      id="cockpit-view-modal-backdrop" 
      className="fixed inset-0 z-50 bg-black/85 backdrop-blur-xl flex items-center justify-center p-4 pointer-events-auto"
    >
      <div 
        id="cockpit-hud-container" 
        className="relative w-full max-w-3xl aspect-[16/10] bg-slate-950 rounded-3xl border-2 border-sky-500/60 shadow-[0_0_50px_rgba(14,165,233,0.3)] overflow-hidden flex flex-col p-6 text-sky-400 font-mono select-none"
      >
        {/* Background Simulated Horizon */}
        <div className="absolute inset-0 -z-10 flex flex-col opacity-30">
          <div className="flex-1 bg-sky-900/40" />
          <div className="h-0.5 bg-emerald-400 shadow-[0_0_10px_#34d399]" />
          <div className="flex-1 bg-amber-950/40" />
        </div>

        {/* Top Autopilot Annunciator Strip */}
        <div className="flex items-center justify-between border-b border-sky-500/30 pb-3 mb-4 text-xs">
          <div className="flex items-center gap-4">
            <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 font-bold">
              AP1 ENGAGED
            </span>
            <span className="px-2 py-0.5 rounded bg-sky-500/20 text-sky-300 border border-sky-500/40">
              LNAV / VNAV
            </span>
            <span className="text-white font-bold">
              {flight.airline.toUpperCase()} • {flight.aircraft.toUpperCase()}
            </span>
          </div>

          <button 
            id="close-cockpit-hud-btn"
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Center Primary Flight Display HUD Elements */}
        <div className="flex-1 relative flex items-center justify-between px-6">
          
          {/* Left: Airspeed Tape (KTS) */}
          <div className="w-20 bg-slate-950/80 border border-sky-500/40 rounded-xl p-2.5 flex flex-col items-center justify-center shadow-lg">
            <span className="text-[10px] text-slate-400 font-bold">IAS KTS</span>
            <div className="text-2xl font-extrabold text-white my-1">{flight.speedKts}</div>
            <div className="text-[11px] text-emerald-400">M {machSpeed}</div>
            <div className="w-full h-24 mt-2 border-l-2 border-sky-400/50 flex flex-col justify-between py-1 text-[9px] text-slate-500 pl-1">
              <div>+{flight.speedKts + 20}</div>
              <div className="text-white font-bold">-- {flight.speedKts} --</div>
              <div>-{flight.speedKts - 20}</div>
            </div>
          </div>

          {/* Center Artificial Horizon & Pitch Ladder */}
          <div className="relative flex flex-col items-center justify-center">
            {/* Center Aircraft Symbol */}
            <div className="relative flex items-center justify-center w-36 h-36">
              <div className="absolute w-28 h-0.5 bg-emerald-400" />
              <div className="absolute w-0.5 h-12 bg-emerald-400" />
              <Plane className="w-8 h-8 text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.8)]" />
            </div>

            {/* Flight Identifier & Waypoint */}
            <div className="mt-4 text-center">
              <div className="text-lg font-extrabold text-white tracking-widest">{flight.flightNumber}</div>
              <div className="text-xs text-sky-300">{flight.origin.code} ➔ {flight.destination.code}</div>
              <div className="text-[10px] text-slate-400 mt-0.5">{flight.distanceKm.toLocaleString()} KM ROUTE</div>
            </div>
          </div>

          {/* Right: Altitude Tape (FT) */}
          <div className="w-24 bg-slate-950/80 border border-sky-500/40 rounded-xl p-2.5 flex flex-col items-center justify-center shadow-lg">
            <span className="text-[10px] text-slate-400 font-bold">ALT FT</span>
            <div className="text-xl font-extrabold text-white my-1">{flight.altitudeFt.toLocaleString()}</div>
            <div className="text-[11px] text-emerald-400">VS +0 FPM</div>
            <div className="w-full h-24 mt-2 border-r-2 border-sky-400/50 flex flex-col justify-between py-1 text-[9px] text-slate-500 pr-1 text-right">
              <div>{flight.altitudeFt + 400}</div>
              <div className="text-white font-bold">-- FL{Math.round(flight.altitudeFt / 100)} --</div>
              <div>{flight.altitudeFt - 400}</div>
            </div>
          </div>

        </div>

        {/* Bottom Heading & Transponder Strip */}
        <div className="border-t border-sky-500/30 pt-3 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <Compass className="w-4 h-4 text-emerald-400" />
            <span className="text-white font-bold">HDG: 074° MAG</span>
            <span className="text-slate-500">|</span>
            <span className="text-slate-400">XPDR: {flight.callsign}</span>
          </div>

          <div className="text-slate-400 font-mono text-[11px]">
            PROGRESS: <strong className="text-sky-300">{Math.round(flight.progress * 100)}%</strong> • REMAINING: <strong className="text-amber-300">{flight.estimatedRemainingTime}</strong>
          </div>
        </div>

      </div>
    </div>
  );
};
