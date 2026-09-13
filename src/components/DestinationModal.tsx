import React, { useState } from 'react';
import { 
  X, 
  MapPin, 
  Clock, 
  DollarSign, 
  Calendar, 
  Sparkles, 
  Compass, 
  Star, 
  Plus, 
  Wind, 
  Thermometer, 
  Droplets,
  Share2,
  ChevronRight
} from 'lucide-react';
import { Destination, PointOfInterest, Itinerary } from '../types';
import { playUiClick } from '../utils/audio';

interface DestinationModalProps {
  destination: Destination | null;
  onClose: () => void;
  onAddToItinerary: (dest: Destination, poi?: PointOfInterest) => void;
  onShareUpdate: (dest: Destination) => void;
  activeItinerary: Itinerary | null;
}

export const DestinationModal: React.FC<DestinationModalProps> = ({
  destination,
  onClose,
  onAddToItinerary,
  onShareUpdate,
  activeItinerary,
}) => {
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [showAddedNotice, setShowAddedNotice] = useState(false);

  if (!destination) return null;

  const categories = ['All', 'Landmark', 'Culture', 'Nature', 'Adventure'];

  const filteredPois = destination.pointsOfInterest.filter(poi => {
    if (activeCategory === 'All') return true;
    return poi.category.toLowerCase() === activeCategory.toLowerCase();
  });

  const handleAddPoi = (poi?: PointOfInterest) => {
    onAddToItinerary(destination, poi);
    setShowAddedNotice(true);
    setTimeout(() => setShowAddedNotice(false), 2400);
    playUiClick();
  };

  return (
    <div id="destination-modal-backdrop" className="fixed inset-0 z-40 bg-black/60 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4 pointer-events-auto">
      <div 
        id="destination-modal-card"
        className="w-full sm:max-w-3xl max-h-[88vh] bg-slate-950/95 border border-slate-700/80 rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col text-slate-100 overflow-hidden animate-in fade-in slide-in-from-bottom-6 duration-300"
      >
        {/* Modal Header & Hero Image */}
        <div className="relative h-64 sm:h-72 w-full overflow-hidden shrink-0">
          <img
            src={destination.gallery[selectedImageIndex] || destination.coverImage}
            alt={destination.name}
            className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-black/30" />

          {/* Close & Action Buttons */}
          <div className="absolute top-4 right-4 flex items-center gap-2">
            <button
              id="share-dest-update-btn"
              onClick={() => onShareUpdate(destination)}
              className="p-2 rounded-full bg-slate-900/80 backdrop-blur-md text-white hover:bg-slate-800 border border-slate-700 transition"
              title="Share live update from this destination"
            >
              <Share2 className="w-4 h-4" />
            </button>
            <button
              id="close-dest-modal-btn"
              onClick={onClose}
              className="p-2 rounded-full bg-slate-900/80 backdrop-blur-md text-white hover:bg-slate-800 border border-slate-700 transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Destination Title & Tagline */}
          <div className="absolute bottom-4 left-6 right-6">
            <div className="flex items-center gap-2 text-sky-400 text-xs font-mono font-bold tracking-wider uppercase mb-1">
              <MapPin className="w-3.5 h-3.5" />
              <span>{destination.region} • {destination.country}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">{destination.name}</h1>
            <p className="text-xs sm:text-sm text-slate-300 line-clamp-1">{destination.tagline}</p>
          </div>

          {/* Thumbnail Gallery Strip */}
          {destination.gallery.length > 1 && (
            <div className="absolute top-4 left-4 flex gap-1.5">
              {destination.gallery.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImageIndex(idx)}
                  className={`w-9 h-9 rounded-lg overflow-hidden border-2 transition ${
                    selectedImageIndex === idx ? 'border-sky-400 scale-105' : 'border-white/40 opacity-70'
                  }`}
                >
                  <img src={img} alt="thumbnail" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Scrollable Content Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6 flex-1 text-xs">
          
          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <div className="p-3 rounded-2xl bg-slate-900/90 border border-slate-800">
              <div className="flex items-center gap-1.5 text-slate-400 mb-1">
                <Thermometer className="w-3.5 h-3.5 text-amber-400" />
                <span className="font-mono text-[10px]">CURRENT WEATHER</span>
              </div>
              <div className="text-base font-bold text-white">{destination.weather.tempC}°C / {destination.weather.tempF}°F</div>
              <div className="text-[10px] text-slate-400">{destination.weather.condition}</div>
            </div>

            <div className="p-3 rounded-2xl bg-slate-900/90 border border-slate-800">
              <div className="flex items-center gap-1.5 text-slate-400 mb-1">
                <Clock className="w-3.5 h-3.5 text-sky-400" />
                <span className="font-mono text-[10px]">LOCAL TIME</span>
              </div>
              <div className="text-base font-bold text-white">{destination.localTime}</div>
              <div className="text-[10px] text-slate-400">Timezone Offset</div>
            </div>

            <div className="p-3 rounded-2xl bg-slate-900/90 border border-slate-800">
              <div className="flex items-center gap-1.5 text-slate-400 mb-1">
                <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
                <span className="font-mono text-[10px]">AVG DAILY BUDGET</span>
              </div>
              <div className="text-base font-bold text-white">${destination.averageBudgetPerDayUsd} USD</div>
              <div className="text-[10px] text-slate-400">Accommodation & Meals</div>
            </div>

            <div className="p-3 rounded-2xl bg-slate-900/90 border border-slate-800">
              <div className="flex items-center gap-1.5 text-slate-400 mb-1">
                <Calendar className="w-3.5 h-3.5 text-rose-400" />
                <span className="font-mono text-[10px]">BEST SEASON</span>
              </div>
              <div className="text-xs font-bold text-white line-clamp-1">{destination.bestTimeToVisit.split('(')[0]}</div>
              <div className="text-[10px] text-slate-400">Prime Climate</div>
            </div>
          </div>

          {/* Weather Details & 5-Day Forecast Widget */}
          <div className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Wind className="w-4 h-4 text-sky-400" />
                <span className="font-bold text-white text-xs">Microclimate & Atmospheric Telemetry</span>
              </div>
              <div className="flex items-center gap-3 text-[11px] font-mono text-slate-400">
                <span>Humidity: {destination.weather.humidity}%</span>
                <span>Wind: {destination.weather.windSpeedKmh} km/h {destination.weather.windDirection}</span>
                <span>AQI: <strong className="text-emerald-400">{destination.weather.aqi} ({destination.weather.aqiLabel})</strong></span>
              </div>
            </div>

            {/* 5-day strip */}
            <div className="grid grid-cols-5 gap-2 pt-1 border-t border-slate-800">
              {destination.weather.forecast.map((fc, i) => (
                <div key={i} className="text-center p-2 rounded-xl bg-slate-950/60 border border-slate-800/60">
                  <div className="text-[10px] text-slate-400 font-mono">{fc.day}</div>
                  <div className="text-sm font-bold text-sky-300 my-0.5">{fc.tempC}°C</div>
                  <div className="text-[9px] text-slate-400 truncate">{fc.condition}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Description */}
          <div>
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono mb-2">Overview</h2>
            <p className="text-slate-300 leading-relaxed text-xs sm:text-sm">{destination.description}</p>
          </div>

          {/* Points of Interest Section */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Compass className="w-4 h-4 text-rose-400" />
                <h2 className="text-sm font-bold text-white">Points of Interest & Attractions</h2>
              </div>

              {/* Category Filter Chips */}
              <div className="flex gap-1 overflow-x-auto">
                {categories.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition ${
                      activeCategory === cat ? 'bg-sky-500 text-white' : 'bg-slate-900 text-slate-400 hover:text-white'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* POI Cards List */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {filteredPois.map(poi => (
                <div 
                  key={poi.id}
                  className="p-3 rounded-2xl bg-slate-900/80 border border-slate-800 flex gap-3 hover:border-slate-700 transition"
                >
                  <img
                    src={poi.photoUrl}
                    alt={poi.name}
                    className="w-20 h-20 rounded-xl object-cover shrink-0"
                  />
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-white line-clamp-1">{poi.name}</span>
                        <div className="flex items-center gap-0.5 text-amber-400 text-[10px] font-bold">
                          <Star className="w-3 h-3 fill-amber-400" />
                          <span>{poi.rating}</span>
                        </div>
                      </div>
                      <div className="text-[10px] text-slate-400 line-clamp-2 mt-0.5">{poi.description}</div>
                    </div>

                    <div className="flex items-center justify-between mt-2 pt-1 border-t border-slate-800">
                      <span className="text-[10px] text-emerald-400 font-mono font-semibold">{poi.admission}</span>
                      <button
                        onClick={() => handleAddPoi(poi)}
                        className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-sky-500/20 text-sky-400 hover:bg-sky-500/30 font-semibold text-[10px] transition"
                      >
                        <Plus className="w-3 h-3" />
                        <span>Add to Trip</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Culinary & Travel Tips */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
              <h3 className="font-bold text-white flex items-center gap-1.5 mb-2 text-xs">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Culinary Bucket List</span>
              </h3>
              <div className="flex flex-wrap gap-1.5">
                {destination.popularFoods.map((food, i) => (
                  <span key={i} className="px-2.5 py-1 rounded-lg bg-slate-800/80 text-slate-300 text-[11px]">
                    {food}
                  </span>
                ))}
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
              <h3 className="font-bold text-white flex items-center gap-1.5 mb-2 text-xs">
                <Compass className="w-3.5 h-3.5 text-sky-400" />
                <span>Traveler Tips</span>
              </h3>
              <ul className="space-y-1 text-slate-300 text-[11px]">
                {destination.travelTips.map((tip, i) => (
                  <li key={i} className="flex items-start gap-1.5">
                    <ChevronRight className="w-3 h-3 text-sky-400 shrink-0 mt-0.5" />
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

        </div>

        {/* Footer Bar with Collaborative Planning CTA */}
        <div className="p-4 border-t border-slate-800 bg-slate-950 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs">
            {activeItinerary && (
              <span className="text-slate-400">
                Active Itinerary: <strong className="text-white">{activeItinerary.title}</strong>
              </span>
            )}
            {showAddedNotice && (
              <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-semibold text-[10px] animate-pulse">
                ✓ Added to Itinerary!
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              id="add-whole-destination-btn"
              onClick={() => handleAddPoi()}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-sky-500 text-white font-bold hover:bg-sky-400 transition shadow-lg shadow-sky-500/20 active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>Add Destination to Itinerary</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
