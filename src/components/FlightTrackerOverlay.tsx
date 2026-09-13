import React, { useState } from 'react';
import { 
  Plane, 
  Gauge, 
  ArrowUpRight, 
  Clock, 
  Compass, 
  X, 
  Plus, 
  Filter, 
  Radio,
  PlaneLanding,
  PlaneTakeoff,
  Building2
} from 'lucide-react';
import { Destination, Flight } from '../types';
import { playUiClick, playRadarBeep } from '../utils/audio';
import { AirportFidsBoard } from './AirportFidsBoard';

interface FlightTrackerOverlayProps {
  flights: Flight[];
  selectedFlight: Flight | null;
  onSelectFlight: (flight: Flight) => void;
  onCloseSelectedFlight: () => void;
  onOpenCockpitView: (flight: Flight) => void;
  onAddNewFlight: (newFlight: Flight) => void;
  selectedDestination?: Destination | null;
  destinations?: Destination[];
  onSelectDestination?: (dest: Destination) => void;
}

export const FlightTrackerOverlay: React.FC<FlightTrackerOverlayProps> = ({
  flights,
  selectedFlight,
  onSelectFlight,
  onCloseSelectedFlight,
  onOpenCockpitView,
  onAddNewFlight,
  selectedDestination = null,
  destinations = [],
  onSelectDestination,
}) => {
  const [sidebarTab, setSidebarTab] = useState<'radar' | 'board'>('radar');
  const [filterAirline, setFilterAirline] = useState<string>('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newFlightNumber, setNewFlightNumber] = useState('');
  const [newAirline, setNewAirline] = useState('');
  const [newOriginCity, setNewOriginCity] = useState('');
  const [newOriginCode, setNewOriginCode] = useState('');
  const [newDestCity, setNewDestCity] = useState('');
  const [newDestCode, setNewDestCode] = useState('');

  const filteredFlights = flights.filter(f => {
    if (filterAirline === 'all') return true;
    return f.airlineCode.toLowerCase() === filterAirline.toLowerCase();
  });

  const handleCreateCustomFlight = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFlightNumber || !newOriginCode || !newDestCode) return;

    const customFlight: Flight = {
      id: `fl-custom-${Date.now()}`,
      flightNumber: newFlightNumber.toUpperCase(),
      airline: newAirline || 'Global Air',
      airlineCode: newFlightNumber.slice(0, 2).toUpperCase() || 'GLO',
      aircraft: 'Boeing 787-9 Dreamliner',
      callsign: `${newFlightNumber.replace(/\s+/g, '')}`,
      origin: {
        code: newOriginCode.toUpperCase(),
        city: newOriginCity || 'Origin City',
        country: 'International',
        coord: { lat: 40.7128, lng: -74.0060 }, // default coords
      },
      destination: {
        code: newDestCode.toUpperCase(),
        city: newDestCity || 'Destination City',
        country: 'International',
        coord: { lat: 35.6762, lng: 139.6503 },
      },
      status: 'In Air',
      altitudeFt: 36000,
      speedKts: 510,
      progress: 0.35,
      departureTime: '12:00 UTC',
      arrivalTime: '21:30 UTC',
      estimatedRemainingTime: '6h 15m',
      distanceKm: 8500,
    };

    onAddNewFlight(customFlight);
    onSelectFlight(customFlight);
    setIsAddModalOpen(false);
    setNewFlightNumber('');
    playRadarBeep();
  };

  return (
    <div id="flight-tracker-overlay-root" className="pointer-events-none">
      
      {/* Selected Flight Live Telemetry HUD (Bottom Center/Right) */}
      {selectedFlight && (
        <aside
          aria-label="Active Flight Telemetry"
          id="flight-active-telemetry-hud"
          className="fixed bottom-6 right-6 z-30 w-96 max-w-[calc(100vw-3rem)] rounded-3xl bg-slate-950/90 backdrop-blur-2xl border border-sky-500/40 p-5 shadow-2xl pointer-events-auto text-white transition-all duration-300"
        >
          {/* Header & Close */}
          <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-sky-500/20 border border-sky-500/40 flex items-center justify-center text-sky-400">
                <Plane className="w-5 h-5 rotate-45" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-bold font-mono tracking-wide">{selectedFlight.flightNumber}</h2>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wider bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    {selectedFlight.status.toUpperCase()}
                  </span>
                </div>
                <div className="text-xs text-slate-400">{selectedFlight.airline} • {selectedFlight.aircraft}</div>
              </div>
            </div>
            <button
              id="close-flight-hud-btn"
              onClick={() => { onCloseSelectedFlight(); playUiClick(); }}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
              aria-label="Close flight details"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Route Progression */}
          <div className="mb-4">
            <div className="flex items-center justify-between text-sm mb-1.5 font-mono">
              <div>
                <span className="text-lg font-extrabold text-sky-400">{selectedFlight.origin.code}</span>
                <div className="text-[11px] text-slate-400">{selectedFlight.origin.city}</div>
                <div className="text-[10px] text-slate-500">{selectedFlight.departureTime}</div>
              </div>

              <div className="flex-1 mx-4 flex flex-col items-center">
                <div className="text-[10px] text-slate-400 font-mono flex items-center gap-1 mb-1">
                  <Clock className="w-3 h-3 text-sky-400" />
                  <span>{selectedFlight.estimatedRemainingTime} rem</span>
                </div>
                {/* 3D Progress Track */}
                <div className="w-full h-1.5 bg-slate-800 rounded-full relative overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-sky-500 via-indigo-400 to-rose-400 rounded-full transition-all duration-500"
                    style={{ width: `${Math.round(selectedFlight.progress * 100)}%` }}
                  />
                </div>
                <div className="text-[10px] text-slate-500 mt-1 font-mono">{Math.round(selectedFlight.progress * 100)}% route complete</div>
              </div>

              <div className="text-right">
                <span className="text-lg font-extrabold text-sky-400">{selectedFlight.destination.code}</span>
                <div className="text-[11px] text-slate-400">{selectedFlight.destination.city}</div>
                <div className="text-[10px] text-slate-500">{selectedFlight.arrivalTime}</div>
              </div>
            </div>
          </div>

          {/* Telemetry Metrics Grid */}
          <div className="grid grid-cols-3 gap-2 p-2.5 rounded-2xl bg-slate-900/80 border border-slate-800/80 mb-4 font-mono text-center">
            <div>
              <div className="text-[10px] text-slate-500 flex items-center justify-center gap-1">
                <Gauge className="w-3 h-3 text-sky-400" />
                <span>ALTITUDE</span>
              </div>
              <div className="text-xs font-bold text-white mt-0.5">{selectedFlight.altitudeFt.toLocaleString()} FT</div>
            </div>
            <div>
              <div className="text-[10px] text-slate-500 flex items-center justify-center gap-1">
                <Compass className="w-3 h-3 text-amber-400" />
                <span>GROUND SPD</span>
              </div>
              <div className="text-xs font-bold text-white mt-0.5">{selectedFlight.speedKts} KTS</div>
            </div>
            <div>
              <div className="text-[10px] text-slate-500 flex items-center justify-center gap-1">
                <ArrowUpRight className="w-3 h-3 text-emerald-400" />
                <span>DISTANCE</span>
              </div>
              <div className="text-xs font-bold text-white mt-0.5">{selectedFlight.distanceKm.toLocaleString()} KM</div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            <button
              id="open-cockpit-view-btn"
              onClick={() => { onOpenCockpitView(selectedFlight); playUiClick(); }}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-gradient-to-r from-sky-600 to-indigo-600 text-white text-xs font-semibold hover:brightness-110 shadow-lg shadow-sky-600/30 transition active:scale-95"
            >
              <Radio className="w-4 h-4 text-sky-200" />
              <span>Cockpit HUD View</span>
            </button>
          </div>
        </aside>
      )}

      {/* Flight Radar & Airport Board Drawer (Left side floating widget) */}
      <aside
        aria-label="Flight Radar Navigation & Airport Board"
        id="flight-radar-sidebar"
        className={`fixed top-24 left-6 z-20 ${
          sidebarTab === 'board' ? 'w-[340px] sm:w-[390px] md:w-[430px]' : 'w-80 sm:w-88'
        } max-h-[calc(100vh-140px)] flex flex-col rounded-3xl bg-slate-950/90 backdrop-blur-2xl border border-slate-800/90 shadow-2xl pointer-events-auto text-slate-200 overflow-hidden transition-all duration-300`}
      >
        {/* Top Master Tab Switcher */}
        <div className="p-2 border-b border-slate-800/80 bg-slate-900/60 flex items-center gap-1.5">
          <button
            id="flight-sidebar-tab-radar"
            onClick={() => { setSidebarTab('radar'); playUiClick(); }}
            className={`flex-1 py-2 px-2.5 rounded-2xl font-mono text-xs font-bold transition flex items-center justify-center gap-1.5 border ${
              sidebarTab === 'radar'
                ? 'bg-sky-500/25 text-white border-sky-400/60 shadow-md shadow-sky-500/20'
                : 'text-slate-400 border-transparent hover:bg-slate-800 hover:text-slate-200'
            }`}
          >
            <Radio className={`w-3.5 h-3.5 ${sidebarTab === 'radar' ? 'text-sky-400 animate-pulse' : 'text-slate-500'}`} />
            <span>In-Air Radar</span>
            <span className="px-1.5 py-0.2 rounded-md text-[10px] bg-slate-800 text-sky-300 font-mono">
              {filteredFlights.length}
            </span>
          </button>

          <button
            id="flight-sidebar-tab-board"
            onClick={() => { setSidebarTab('board'); playUiClick(); }}
            className={`flex-1 py-2 px-2.5 rounded-2xl font-mono text-xs font-bold transition flex items-center justify-center gap-1.5 border ${
              sidebarTab === 'board'
                ? 'bg-sky-500/25 text-white border-sky-400/60 shadow-md shadow-sky-500/20'
                : 'text-slate-400 border-transparent hover:bg-slate-800 hover:text-slate-200'
            }`}
          >
            <Building2 className={`w-3.5 h-3.5 ${sidebarTab === 'board' ? 'text-amber-400' : 'text-slate-500'}`} />
            <span>Airport Board</span>
            <span className="px-1.5 py-0.2 rounded-md text-[9px] font-bold uppercase bg-amber-500/20 text-amber-300 border border-amber-500/30">
              Live
            </span>
          </button>
        </div>

        {sidebarTab === 'board' ? (
          /* Airport Arrivals/Departures Board */
          <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
            <AirportFidsBoard
              selectedDestination={selectedDestination}
              destinations={destinations}
              onSelectDestination={onSelectDestination}
              onSelectFlight={onSelectFlight}
              radarFlights={flights}
            />
          </div>
        ) : (
          /* In-Air Radar List */
          <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
            <div className="p-3 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Radio className="w-4 h-4 text-sky-400 animate-pulse" />
                <span className="font-bold text-xs tracking-wider uppercase font-mono text-white">Active Flight Radar</span>
                <span className="px-1.5 py-0.5 rounded-md text-[10px] bg-sky-500/20 text-sky-300 font-mono">
                  {filteredFlights.length}
                </span>
              </div>

              <button
                id="open-add-flight-btn"
                onClick={() => { setIsAddModalOpen(true); playUiClick(); }}
                className="p-1 rounded-lg bg-sky-500/20 text-sky-400 hover:bg-sky-500/30 transition text-xs flex items-center gap-1 px-2 font-medium"
                title="Track custom flight"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Track</span>
              </button>
            </div>

            {/* Filter bar */}
            <div className="px-3.5 py-2 border-b border-slate-800/60 flex items-center gap-1.5 overflow-x-auto text-[11px] font-mono scrollbar-none">
              <Filter className="w-3 h-3 text-slate-500 shrink-0" />
              {['all', 'AIC', 'IGO', 'VTI', 'SEJ', 'AKJ'].map(code => (
                <button
                  key={code}
                  onClick={() => { setFilterAirline(code); playUiClick(); }}
                  className={`px-2 py-1 rounded-lg transition uppercase whitespace-nowrap ${
                    filterAirline.toLowerCase() === code.toLowerCase() ? 'bg-sky-500 text-white font-bold' : 'text-slate-400 hover:bg-slate-800'
                  }`}
                >
                  {code === 'AIC' ? 'Air India' : code === 'IGO' ? 'IndiGo' : code === 'VTI' ? 'Vistara' : code === 'SEJ' ? 'SpiceJet' : code === 'AKJ' ? 'Akasa Air' : 'All'}
                </button>
              ))}
            </div>

            {/* Flights Scroll List */}
            <div className="p-2 space-y-1.5 overflow-y-auto flex-1">
              {filteredFlights.map(flight => {
                const isSelected = selectedFlight?.id === flight.id;
                return (
                  <button
                    key={flight.id}
                    onClick={() => { onSelectFlight(flight); playRadarBeep(); }}
                    className={`w-full text-left p-2.5 rounded-2xl transition flex items-center justify-between border ${
                      isSelected 
                        ? 'bg-sky-500/20 border-sky-400/50 shadow-lg shadow-sky-500/15'
                        : 'bg-slate-900/50 border-slate-800/70 hover:bg-slate-900 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-[11px] font-mono ${
                        isSelected ? 'bg-sky-500 text-white' : 'bg-slate-800 text-sky-400'
                      }`}>
                        {flight.airlineCode}
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-xs text-white">{flight.flightNumber}</span>
                          <span className="text-[10px] text-slate-400 font-mono">{flight.origin.code} ➔ {flight.destination.code}</span>
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono">
                          FL{Math.round(flight.altitudeFt / 100)} • {flight.speedKts} kts
                        </div>
                      </div>
                    </div>

                    <div className="text-right font-mono">
                      <div className="text-[11px] font-bold text-sky-400">{Math.round(flight.progress * 100)}%</div>
                      <div className="text-[9px] text-slate-500">{flight.estimatedRemainingTime}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </aside>

      {/* Add Custom Flight Tracking Modal */}
      {isAddModalOpen && (
        <div id="add-flight-modal-backdrop" className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 pointer-events-auto">
          <div id="add-flight-modal-card" className="w-full max-w-md rounded-3xl bg-slate-950 border border-sky-500/40 p-6 shadow-2xl text-white">
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Plane className="w-5 h-5 text-sky-400" />
                <h3 className="text-base font-bold">Track Commercial Flight</h3>
              </div>
              <button 
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateCustomFlight} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-400 font-mono mb-1">Flight Number</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. SQ 22, UA 875, DL 401"
                  value={newFlightNumber}
                  onChange={e => setNewFlightNumber(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white outline-none focus:border-sky-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-mono mb-1">Airline Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Singapore Airlines"
                    value={newAirline}
                    onChange={e => setNewAirline(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white outline-none focus:border-sky-400"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-mono mb-1">Origin Code (IATA)</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. SIN, LAX, LHR"
                    value={newOriginCode}
                    onChange={e => setNewOriginCode(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white outline-none focus:border-sky-400 uppercase"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-mono mb-1">Origin City</label>
                  <input
                    type="text"
                    placeholder="e.g. Singapore"
                    value={newOriginCity}
                    onChange={e => setNewOriginCity(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white outline-none focus:border-sky-400"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-mono mb-1">Destination Code (IATA)</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. EWR, JFK, HND"
                    value={newDestCode}
                    onChange={e => setNewDestCode(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white outline-none focus:border-sky-400 uppercase"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 font-mono mb-1">Destination City</label>
                <input
                  type="text"
                  placeholder="e.g. New York Newark"
                  value={newDestCity}
                  onChange={e => setNewDestCity(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white outline-none focus:border-sky-400"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-sky-500 text-white font-bold tracking-wide hover:bg-sky-400 transition shadow-lg shadow-sky-500/25 mt-2"
              >
                Track on 3D Globe Radar
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
