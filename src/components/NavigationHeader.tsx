import React, { useState, useEffect } from 'react';
import { 
  Plane, 
  CloudSun, 
  Layers, 
  Search, 
  Volume2, 
  VolumeX, 
  Compass, 
  CalendarDays, 
  MessageSquareShare, 
  Sparkles,
  Wand2,
  MapPin,
  Play,
  Pause,
  X
} from 'lucide-react';
import { Destination, Flight, GlobeViewMode, WeatherOverlayType } from '../types';
import { toggleAudioMute, getAudioMuted, playUiClick } from '../utils/audio';
import { WizardMapLogo } from './WizardMapLogo';

interface NavigationHeaderProps {
  destinations: Destination[];
  flights: Flight[];
  activeTab: 'explore' | 'flights' | 'itinerary' | 'feed';
  setActiveTab: (tab: 'explore' | 'flights' | 'itinerary' | 'feed') => void;
  viewMode: GlobeViewMode;
  setViewMode: (mode: GlobeViewMode) => void;
  weatherOverlay: WeatherOverlayType;
  setWeatherOverlay: (overlay: WeatherOverlayType) => void;
  isAutoRotating: boolean;
  setIsAutoRotating: (autoRotate: boolean) => void;
  onSelectDestination: (dest: Destination) => void;
  onSelectFlight: (flight: Flight) => void;
  openCreatePostModal: () => void;
}

export const NavigationHeader: React.FC<NavigationHeaderProps> = ({
  destinations,
  flights,
  activeTab,
  setActiveTab,
  viewMode,
  setViewMode,
  weatherOverlay,
  setWeatherOverlay,
  isAutoRotating,
  setIsAutoRotating,
  onSelectDestination,
  onSelectFlight,
  openCreatePostModal,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isLayerMenuOpen, setIsLayerMenuOpen] = useState(false);
  const [isWeatherMenuOpen, setIsWeatherMenuOpen] = useState(false);
  const [isMuted, setIsMuted] = useState(getAudioMuted());
  const [utcTime, setUtcTime] = useState('');

  // Live UTC Clock
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setUtcTime(now.toUTCString().slice(17, 25) + ' UTC');
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleAudioToggle = () => {
    const nextState = toggleAudioMute();
    setIsMuted(nextState);
    if (!nextState) playUiClick();
  };

  // Search matching
  const matchingDestinations = destinations.filter(d => 
    d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    d.country.toLowerCase().includes(searchQuery.toLowerCase()) ||
    d.pointsOfInterest.some(poi => poi.name.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const matchingFlights = flights.filter(f =>
    f.flightNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
    f.airline.toLowerCase().includes(searchQuery.toLowerCase()) ||
    f.origin.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
    f.destination.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
    f.origin.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
    f.destination.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <header id="navigation-header" className="absolute top-0 left-0 right-0 z-20 p-3 sm:p-4 pointer-events-none">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
        
        {/* Brand & Telemetry Badge */}
        <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-start pointer-events-auto">
          <div 
            id="brand-logo"
            className="flex items-center gap-3 px-3.5 py-1.5 rounded-2xl bg-slate-900/85 backdrop-blur-xl border border-sky-500/30 shadow-2xl hover:border-sky-400/60 hover:shadow-sky-500/10 transition cursor-pointer group"
            onClick={() => {
              setActiveTab('explore');
              playUiClick();
            }}
          >
            <WizardMapLogo size="md" showSubtitle={true} />
            <div className="hidden xl:flex flex-col pl-2 border-l border-slate-700/60 text-[10px] font-mono text-slate-400">
              <div className="flex items-center gap-1.5 text-emerald-400">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="font-bold tracking-wider">INDIA RADAR</span>
              </div>
              <span className="text-slate-400 text-[9px]">{utcTime}</span>
            </div>
          </div>

          {/* Quick Search Trigger (Mobile / Compact) */}
          <div className="relative pointer-events-auto">
            <div className="flex items-center gap-1 bg-slate-900/80 backdrop-blur-xl border border-slate-700/70 rounded-xl px-3 py-2 text-xs text-slate-300 shadow-xl">
              <Search className="w-3.5 h-3.5 text-sky-400" />
              <input
                id="search-input"
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setIsSearchOpen(true);
                }}
                onFocus={() => setIsSearchOpen(true)}
                placeholder="Search Indian city, flight (e.g. 6E 204, New Delhi)..."
                className="bg-transparent border-none outline-none text-xs text-white placeholder-slate-500 w-36 sm:w-56"
              />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery('')}
                  className="text-slate-400 hover:text-white"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Search Autocomplete Dropdown */}
            {isSearchOpen && searchQuery.trim().length > 0 && (
              <div 
                id="search-autocomplete-dropdown"
                className="absolute left-0 mt-2 w-72 sm:w-80 max-h-80 overflow-y-auto rounded-2xl bg-slate-900/95 backdrop-blur-2xl border border-slate-700/80 shadow-2xl p-2 z-50 text-xs text-slate-200"
              >
                <div className="px-2 py-1 text-[10px] font-mono text-slate-400 uppercase tracking-wider font-semibold">
                  Destinations ({matchingDestinations.length})
                </div>
                {matchingDestinations.slice(0, 4).map(dest => (
                  <button
                    key={dest.id}
                    onClick={() => {
                      onSelectDestination(dest);
                      setIsSearchOpen(false);
                      setSearchQuery('');
                      playUiClick();
                    }}
                    className="w-full flex items-center justify-between p-2 rounded-xl hover:bg-sky-500/15 transition text-left"
                  >
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-rose-400 shrink-0" />
                      <div>
                        <div className="font-semibold text-white">{dest.name}</div>
                        <div className="text-[10px] text-slate-400">{dest.country} • {dest.weather.tempC}°C {dest.weather.condition}</div>
                      </div>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">Fly to</span>
                  </button>
                ))}

                <div className="px-2 py-1 mt-2 text-[10px] font-mono text-slate-400 uppercase tracking-wider font-semibold">
                  Live Flights ({matchingFlights.length})
                </div>
                {matchingFlights.slice(0, 4).map(fl => (
                  <button
                    key={fl.id}
                    onClick={() => {
                      onSelectFlight(fl);
                      setIsSearchOpen(false);
                      setSearchQuery('');
                      playUiClick();
                    }}
                    className="w-full flex items-center justify-between p-2 rounded-xl hover:bg-sky-500/15 transition text-left"
                  >
                    <div className="flex items-center gap-2">
                      <Plane className="w-4 h-4 text-sky-400 shrink-0" />
                      <div>
                        <div className="font-semibold text-white">{fl.flightNumber} ({fl.airlineCode})</div>
                        <div className="text-[10px] text-slate-400">{fl.origin.code} ➔ {fl.destination.code} • {fl.aircraft}</div>
                      </div>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-sky-950 text-sky-300 font-mono">Track</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Primary View Navigation Tabs */}
        <nav 
          id="main-navigation-tabs"
          className="flex items-center gap-1.5 p-1.5 rounded-2xl bg-slate-900/85 backdrop-blur-xl border border-slate-700/60 shadow-2xl pointer-events-auto text-xs"
        >
          <button
            id="nav-tab-explore"
            onClick={() => { setActiveTab('explore'); playUiClick(); }}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl font-medium transition ${
              activeTab === 'explore'
                ? 'bg-sky-500 text-white shadow-lg shadow-sky-500/25'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Compass className="w-4 h-4" />
            <span>Explore 3D</span>
          </button>

          <button
            id="nav-tab-flights"
            onClick={() => { setActiveTab('flights'); playUiClick(); }}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl font-medium transition ${
              activeTab === 'flights'
                ? 'bg-sky-500 text-white shadow-lg shadow-sky-500/25'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Plane className="w-4 h-4" />
            <span>Flight Radar</span>
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          </button>

          <button
            id="nav-tab-itinerary"
            onClick={() => { setActiveTab('itinerary'); playUiClick(); }}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl font-medium transition ${
              activeTab === 'itinerary'
                ? 'bg-sky-500 text-white shadow-lg shadow-sky-500/25'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <CalendarDays className="w-4 h-4" />
            <span>Trip Planner</span>
            <span className="px-1 py-0.2 text-[9px] font-bold bg-amber-400/20 text-amber-300 rounded">
              Collab
            </span>
          </button>

          <button
            id="nav-tab-feed"
            onClick={() => { setActiveTab('feed'); playUiClick(); }}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl font-medium transition ${
              activeTab === 'feed'
                ? 'bg-sky-500 text-white shadow-lg shadow-sky-500/25'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <MessageSquareShare className="w-4 h-4" />
            <span>Travel Feed</span>
          </button>
        </nav>

        {/* 3D Map Controls & Tools */}
        <div className="flex items-center gap-2 pointer-events-auto">
          {/* Globe View Mode Switcher */}
          <div className="relative">
            <button
              id="globe-layer-toggle-btn"
              onClick={() => {
                setIsLayerMenuOpen(!isLayerMenuOpen);
                setIsWeatherMenuOpen(false);
                playUiClick();
              }}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900/80 backdrop-blur-xl border border-slate-700/60 text-xs font-medium text-slate-200 hover:text-white hover:border-slate-500 shadow-xl transition"
              title="Change 3D Map Theme"
            >
              <Layers className="w-4 h-4 text-sky-400" />
              <span className="hidden sm:inline capitalize">{viewMode}</span>
            </button>

            {isLayerMenuOpen && (
              <div 
                id="layer-menu-dropdown"
                className="absolute right-0 mt-2 w-48 rounded-2xl bg-slate-900/95 backdrop-blur-2xl border border-slate-700/80 shadow-2xl p-2 z-50 text-xs"
              >
                <div className="px-2 py-1 text-[10px] font-mono text-slate-400 uppercase font-semibold">3D Globe Style</div>
                {(['realistic', 'night', 'radar', 'topographic'] as GlobeViewMode[]).map(mode => (
                  <button
                    key={mode}
                    onClick={() => {
                      setViewMode(mode);
                      setIsLayerMenuOpen(false);
                      playUiClick();
                    }}
                    className={`w-full text-left px-2.5 py-2 rounded-xl transition capitalize flex items-center justify-between ${
                      viewMode === mode ? 'bg-sky-500/20 text-sky-300 font-semibold' : 'text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <span>{mode === 'realistic' ? '🌍 Realistic Satellite' : mode === 'night' ? '✨ City Night Lights' : mode === 'radar' ? '📡 Cyber Aeronautical' : '🗺️ Topographic Heat'}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Dynamic Weather Overlays Switcher */}
          <div className="relative">
            <button
              id="weather-overlay-toggle-btn"
              onClick={() => {
                setIsWeatherMenuOpen(!isWeatherMenuOpen);
                setIsLayerMenuOpen(false);
                playUiClick();
              }}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl backdrop-blur-xl border text-xs font-medium shadow-xl transition ${
                weatherOverlay !== 'none'
                  ? 'bg-sky-600/30 border-sky-400/50 text-sky-300'
                  : 'bg-slate-900/80 border-slate-700/60 text-slate-200 hover:text-white'
              }`}
              title="Live Weather Overlays"
            >
              <CloudSun className="w-4 h-4 text-amber-400" />
              <span className="hidden sm:inline">Weather</span>
              {weatherOverlay !== 'none' && (
                <span className="w-1.5 h-1.5 rounded-full bg-sky-400" />
              )}
            </button>

            {isWeatherMenuOpen && (
              <div 
                id="weather-menu-dropdown"
                className="absolute right-0 mt-2 w-52 rounded-2xl bg-slate-900/95 backdrop-blur-2xl border border-slate-700/80 shadow-2xl p-2 z-50 text-xs"
              >
                <div className="px-2 py-1 text-[10px] font-mono text-slate-400 uppercase font-semibold">Live Weather Layers</div>
                {[
                  { id: 'none', label: 'None (Clear View)' },
                  { id: 'clouds', label: '☁️ Cloud Density Band' },
                  { id: 'precipitation', label: '🌧️ Doppler Precipitation Radar' },
                  { id: 'wind', label: '💨 Jetstream Wind Vectors' },
                  { id: 'temp', label: '🌡️ Global Thermal Gradient' },
                ].map(item => (
                  <button
                    key={item.id}
                    onClick={() => {
                      setWeatherOverlay(item.id as WeatherOverlayType);
                      setIsWeatherMenuOpen(false);
                      playUiClick();
                    }}
                    className={`w-full text-left px-2.5 py-2 rounded-xl transition flex items-center justify-between ${
                      weatherOverlay === item.id ? 'bg-sky-500/20 text-sky-300 font-semibold' : 'text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <span>{item.label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Auto Rotation Toggle */}
          <button
            id="toggle-autorotate-btn"
            onClick={() => {
              setIsAutoRotating(!isAutoRotating);
              playUiClick();
            }}
            className={`p-2 rounded-xl backdrop-blur-xl border text-xs shadow-xl transition ${
              isAutoRotating ? 'bg-sky-500/20 border-sky-500/40 text-sky-300' : 'bg-slate-900/80 border-slate-700/60 text-slate-400 hover:text-white'
            }`}
            title={isAutoRotating ? 'Pause Orbit Rotation' : 'Resume Auto Orbit'}
          >
            {isAutoRotating ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          </button>

          {/* Audio Synthesizer Toggle */}
          <button
            id="toggle-audio-btn"
            onClick={handleAudioToggle}
            className={`p-2 rounded-xl backdrop-blur-xl border text-xs shadow-xl transition ${
              !isMuted ? 'bg-indigo-500/20 border-indigo-500/40 text-indigo-300' : 'bg-slate-900/80 border-slate-700/60 text-slate-400 hover:text-white'
            }`}
            title={isMuted ? 'Unmute Aviation Radar Audio FX' : 'Mute Audio FX'}
          >
            {!isMuted ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          {/* Post Travel Update Action */}
          <button
            id="header-post-update-btn"
            onClick={() => {
              openCreatePostModal();
              playUiClick();
            }}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-gradient-to-r from-rose-500 to-amber-500 text-white text-xs font-semibold shadow-lg shadow-rose-500/25 hover:brightness-110 transition active:scale-95"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Share Update</span>
          </button>
        </div>

      </div>
    </header>
  );
};
