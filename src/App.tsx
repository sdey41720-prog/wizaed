/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { 
  Globe3D 
} from './components/Globe3D';
import { 
  NavigationHeader 
} from './components/NavigationHeader';
import { 
  FlightTrackerOverlay 
} from './components/FlightTrackerOverlay';
import { 
  DestinationModal 
} from './components/DestinationModal';
import { 
  ItineraryPlanner 
} from './components/ItineraryPlanner';
import { 
  SocialFeedDrawer 
} from './components/SocialFeedDrawer';
import { 
  CockpitViewModal 
} from './components/CockpitViewModal';
import { 
  WeatherOverlayPanel 
} from './components/WeatherOverlayPanel';
import { 
  CosmicBackground 
} from './components/CosmicBackground';
import { Sparkles } from 'lucide-react';
import { 
  DESTINATIONS 
} from './data/destinationsData';
import { 
  INITIAL_FLIGHTS 
} from './data/flightsData';
import { 
  INITIAL_ITINERARIES 
} from './data/itinerariesData';
import { 
  INITIAL_SOCIAL_POSTS, 
  INITIAL_STORIES 
} from './data/socialData';
import { 
  Destination, 
  Flight, 
  GlobeViewMode, 
  WeatherOverlayType, 
  Itinerary, 
  SocialPost, 
  PointOfInterest,
  Coordinate 
} from './types';
import { playFlyTransitionSound } from './utils/audio';

export default function App() {
  const [destinations] = useState<Destination[]>(DESTINATIONS);
  const [flights, setFlights] = useState<Flight[]>(INITIAL_FLIGHTS);
  const [selectedDestination, setSelectedDestination] = useState<Destination | null>(null);
  const [selectedFlight, setSelectedFlight] = useState<Flight | null>(null);
  const [cockpitFlight, setCockpitFlight] = useState<Flight | null>(null);

  // Tabs & Views
  const [activeTab, setActiveTab] = useState<'explore' | 'flights' | 'itinerary' | 'feed'>('explore');
  const [viewMode, setViewMode] = useState<GlobeViewMode>('realistic');
  const [weatherOverlay, setWeatherOverlay] = useState<WeatherOverlayType>('none');
  const [isAutoRotating, setIsAutoRotating] = useState(true);

  // Cosmic Background & Astronaut Theme State
  const [showCosmicAstronaut, setShowCosmicAstronaut] = useState(false);
  const [cosmicPosition, setCosmicPosition] = useState<'side' | 'center'>('side');

  // Collaborative Itineraries State
  const [itineraries, setItineraries] = useState<Itinerary[]>(INITIAL_ITINERARIES);
  const [activeItinerary, setActiveItinerary] = useState<Itinerary>(INITIAL_ITINERARIES[0]);

  // Social Feed State
  const [socialPosts, setSocialPosts] = useState<SocialPost[]>(INITIAL_SOCIAL_POSTS);
  const [stories] = useState(INITIAL_STORIES);
  const [isCreatePostModalOpen, setIsCreatePostModalOpen] = useState(false);

  // Real-time Flight simulation tick (updates progress and positions gradually)
  useEffect(() => {
    const timer = setInterval(() => {
      setFlights(prevFlights => 
        prevFlights.map(fl => {
          let nextProgress = fl.progress + 0.002;
          if (nextProgress > 1.0) nextProgress = 0.05;
          return {
            ...fl,
            progress: nextProgress,
            speedKts: Math.max(450, Math.min(560, fl.speedKts + Math.floor(Math.random() * 7 - 3))),
          };
        })
      );
    }, 2000);

    return () => clearInterval(timer);
  }, []);

  // Sync selected flight updates with state
  useEffect(() => {
    if (selectedFlight) {
      const current = flights.find(f => f.id === selectedFlight.id);
      if (current) setSelectedFlight(current);
    }
  }, [flights, selectedFlight]);

  // Add Item to Itinerary Handler
  const handleAddToItinerary = useCallback((dest: Destination, poi?: PointOfInterest) => {
    const newItemTitle = poi ? poi.name : `Explore ${dest.name} Highlights`;
    const newItemCost = poi ? (poi.admission === 'Free' ? 0 : 25) : 35;
    const newItemCategory = poi ? (poi.category as unknown as 'Sightseeing') : 'Sightseeing';

    const newItem = {
      id: `item-${Date.now()}`,
      dayIndex: 1,
      timeSlot: '02:00 PM',
      title: newItemTitle,
      location: dest.name + ', ' + dest.country,
      category: newItemCategory,
      costUsd: newItemCost,
      assignedTo: 'user-1',
      votes: 1,
      votedBy: ['user-1'],
      notes: poi?.description || `Recommended highlights for ${dest.name}`,
      completed: false,
      coord: dest.coord,
    };

    setActiveItinerary(prev => {
      const updated = {
        ...prev,
        items: [...prev.items, newItem],
      };
      // update list
      setItineraries(all => all.map(it => it.id === updated.id ? updated : it));
      return updated;
    });
  }, []);

  // Update Itinerary Handler
  const handleUpdateItinerary = (updated: Itinerary) => {
    setActiveItinerary(updated);
    setItineraries(all => all.map(it => it.id === updated.id ? updated : it));
  };

  // Fly to destination by name
  const handleFlyToDestinationByName = (destName: string) => {
    const match = destinations.find(d => d.name.toLowerCase().includes(destName.toLowerCase()));
    if (match) {
      setSelectedDestination(match);
      playFlyTransitionSound();
    }
  };

  // Fly to arbitrary coordinate
  const handleFlyToCoordinate = (coord: Coordinate) => {
    // Find closest destination or create temporary focal point
    const closest = destinations.find(d => 
      Math.abs(d.coord.lat - coord.lat) < 5 && Math.abs(d.coord.lng - coord.lng) < 5
    );
    if (closest) {
      setSelectedDestination(closest);
    } else {
      setSelectedDestination({
        id: `custom-coord-${Date.now()}`,
        name: 'Exploration Pin',
        country: 'Global',
        region: 'Asia',
        coord,
        coverImage: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=1200&q=80',
        gallery: [],
        tagline: 'Scenic Coordinates on Earth',
        description: `Latitude: ${coord.lat.toFixed(2)}°, Longitude: ${coord.lng.toFixed(2)}°`,
        localTime: 'UTC',
        bestTimeToVisit: 'Year-Round',
        averageBudgetPerDayUsd: 100,
        weather: {
          tempC: 22,
          tempF: 72,
          condition: 'Sunny',
          humidity: 50,
          windSpeedKmh: 15,
          windDirection: 'NE',
          uvIndex: 5,
          visibilityKm: 12,
          aqi: 25,
          aqiLabel: 'Good',
          forecast: [],
        },
        pointsOfInterest: [],
        popularFoods: [],
        travelTips: [],
      });
    }
  };

  // Add new commercial flight to track
  const handleAddNewFlight = (newFlight: Flight) => {
    setFlights(prev => [newFlight, ...prev]);
  };

  // Quick India Region navigation shortcuts
  const handleRegionJump = (region: 'all' | 'north' | 'west' | 'south' | 'east' | 'himalayas') => {
    playFlyTransitionSound();
    if (region === 'north') {
      const d = destinations.find(x => x.id === 'delhi');
      if (d) setSelectedDestination(d);
    } else if (region === 'west') {
      const d = destinations.find(x => x.id === 'mumbai');
      if (d) setSelectedDestination(d);
    } else if (region === 'south') {
      const d = destinations.find(x => x.id === 'bengaluru');
      if (d) setSelectedDestination(d);
    } else if (region === 'east') {
      const d = destinations.find(x => x.id === 'kolkata');
      if (d) setSelectedDestination(d);
    } else if (region === 'himalayas') {
      const d = destinations.find(x => x.id === 'leh');
      if (d) setSelectedDestination(d);
    } else {
      setSelectedDestination(null);
      setSelectedFlight(null);
    }
  };

  return (
    <main id="aeroglobe-app-root" className="relative w-screen h-screen overflow-hidden bg-slate-950 font-sans select-none">
      
      {/* 0. Dynamic Animated Cosmic Background (A Cosmic Scroll Journey Theme) */}
      <CosmicBackground
        showAstronaut={showCosmicAstronaut}
        position={cosmicPosition}
        astronautOpacity={0.92}
      />

      {/* 1. Interactive 3D WebGL Globe Canvas */}
      <Globe3D
        destinations={destinations}
        flights={flights}
        selectedDestination={selectedDestination}
        selectedFlight={selectedFlight}
        activeItinerary={activeTab === 'itinerary' ? activeItinerary : null}
        viewMode={viewMode}
        weatherOverlay={weatherOverlay}
        isAutoRotating={isAutoRotating}
        onSelectDestination={dest => {
          setSelectedDestination(dest);
          setSelectedFlight(null);
        }}
        onSelectFlight={fl => {
          setSelectedFlight(fl);
          setSelectedDestination(null);
        }}
        onClearSelection={() => {
          setSelectedDestination(null);
          setSelectedFlight(null);
        }}
      />

      {/* 2. Sleek Aeronautical Navigation Header */}
      <NavigationHeader
        destinations={destinations}
        flights={flights}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        viewMode={viewMode}
        setViewMode={setViewMode}
        weatherOverlay={weatherOverlay}
        setWeatherOverlay={setWeatherOverlay}
        isAutoRotating={isAutoRotating}
        setIsAutoRotating={setIsAutoRotating}
        onSelectDestination={dest => {
          setSelectedDestination(dest);
          setSelectedFlight(null);
        }}
        onSelectFlight={fl => {
          setSelectedFlight(fl);
          setSelectedDestination(null);
        }}
        openCreatePostModal={() => setIsCreatePostModalOpen(true)}
      />

      {/* 3. Flight Radar View and Active Flight Telemetry HUD */}
      {activeTab === 'flights' && (
        <FlightTrackerOverlay
          flights={flights}
          selectedFlight={selectedFlight}
          selectedDestination={selectedDestination}
          destinations={destinations}
          onSelectDestination={setSelectedDestination}
          onSelectFlight={fl => {
            setSelectedFlight(fl);
            setSelectedDestination(null);
          }}
          onCloseSelectedFlight={() => setSelectedFlight(null)}
          onOpenCockpitView={fl => setCockpitFlight(fl)}
          onAddNewFlight={handleAddNewFlight}
        />
      )}

      {/* When on other tabs, still show the telemetry HUD if a flight is clicked */}
      {activeTab !== 'flights' && selectedFlight && (
        <FlightTrackerOverlay
          flights={flights}
          selectedFlight={selectedFlight}
          selectedDestination={selectedDestination}
          destinations={destinations}
          onSelectDestination={setSelectedDestination}
          onSelectFlight={setSelectedFlight}
          onCloseSelectedFlight={() => setSelectedFlight(null)}
          onOpenCockpitView={fl => setCockpitFlight(fl)}
          onAddNewFlight={handleAddNewFlight}
        />
      )}

      {/* 4. Collaborative Itinerary Planner Tab */}
      {activeTab === 'itinerary' && (
        <ItineraryPlanner
          itineraries={itineraries}
          activeItinerary={activeItinerary}
          setActiveItinerary={setActiveItinerary}
          onUpdateItinerary={handleUpdateItinerary}
          onFlyToDestination={handleFlyToDestinationByName}
          destinations={destinations}
        />
      )}

      {/* 5. Live Traveler Social Feed Tab */}
      {activeTab === 'feed' && (
        <SocialFeedDrawer
          posts={socialPosts}
          stories={stories}
          onFlyToCoordinate={handleFlyToCoordinate}
          onSelectFlight={fl => {
            setSelectedFlight(fl);
            setActiveTab('flights');
          }}
          flights={flights}
          destinations={destinations}
          onAddPost={newPost => setSocialPosts(prev => [newPost, ...prev])}
          isCreateModalOpen={isCreatePostModalOpen}
          setIsCreateModalOpen={setIsCreatePostModalOpen}
        />
      )}

      {/* 6. Destination Exploration Modal */}
      {selectedDestination && activeTab !== 'itinerary' && (
        <DestinationModal
          destination={selectedDestination}
          onClose={() => setSelectedDestination(null)}
          onAddToItinerary={handleAddToItinerary}
          onShareUpdate={() => setIsCreatePostModalOpen(true)}
          activeItinerary={activeItinerary}
        />
      )}

      {/* 7. Cockpit 3D Horizon HUD Modal */}
      {cockpitFlight && (
        <CockpitViewModal
          flight={cockpitFlight}
          onClose={() => setCockpitFlight(null)}
        />
      )}

      {/* 8. Floating Weather Overlay Status HUD */}
      <WeatherOverlayPanel
        weatherOverlay={weatherOverlay}
        setWeatherOverlay={setWeatherOverlay}
      />

      {/* 9. Bottom Continental Quick-Jump Bar (When exploring) */}
      {activeTab === 'explore' && !selectedDestination && (
        <nav 
          aria-label="Continental navigation"
          id="continental-quick-jump-bar"
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1.5 p-1.5 rounded-2xl bg-slate-950/80 backdrop-blur-xl border border-slate-800/80 shadow-2xl text-xs font-mono text-slate-300 pointer-events-auto"
        >
          <span className="px-2 text-[10px] text-slate-500 font-bold uppercase hidden sm:inline">India:</span>
          <button
            onClick={() => handleRegionJump('all')}
            className="px-2.5 py-1.5 rounded-xl bg-orange-500/10 text-orange-300 border border-orange-500/20 hover:bg-orange-500/20 hover:text-orange-200 transition flex items-center gap-1 font-semibold"
            title="All India Overview"
          >
            <span>🇮🇳</span>
            <span>All India</span>
          </button>
          <button
            onClick={() => handleRegionJump('north')}
            className="px-2.5 py-1.5 rounded-xl hover:bg-sky-500/20 hover:text-sky-300 transition"
          >
            North
          </button>
          <button
            onClick={() => handleRegionJump('west')}
            className="px-2.5 py-1.5 rounded-xl hover:bg-sky-500/20 hover:text-sky-300 transition"
          >
            West
          </button>
          <button
            onClick={() => handleRegionJump('south')}
            className="px-2.5 py-1.5 rounded-xl hover:bg-sky-500/20 hover:text-sky-300 transition"
          >
            South
          </button>
          <button
            onClick={() => handleRegionJump('east')}
            className="px-2.5 py-1.5 rounded-xl hover:bg-sky-500/20 hover:text-sky-300 transition"
          >
            East
          </button>
          <button
            onClick={() => handleRegionJump('himalayas')}
            className="px-2.5 py-1.5 rounded-xl hover:bg-sky-500/20 hover:text-sky-300 transition"
          >
            Himalayas
          </button>

          <div className="w-px h-4 bg-slate-800 mx-1 hidden sm:block" />

          {/* Cosmic Voyager Astronaut Controls */}
          <button
            onClick={() => setShowCosmicAstronaut(prev => !prev)}
            className={`px-2.5 py-1.5 rounded-xl flex items-center gap-1.5 transition text-[11px] font-semibold ${
              showCosmicAstronaut 
                ? 'bg-cyan-950/70 text-cyan-300 border border-cyan-500/40 shadow-sm shadow-cyan-500/20 hover:bg-cyan-900/60' 
                : 'bg-slate-900/90 text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
            title="Toggle Floating Zero-G Astronaut Background"
          >
            <Sparkles className={`w-3.5 h-3.5 ${showCosmicAstronaut ? 'text-cyan-400 animate-pulse' : 'text-slate-500'}`} />
            <span className="hidden sm:inline">Astronaut</span>
            <span className={`text-[10px] px-1.5 py-0.5 rounded ${showCosmicAstronaut ? 'bg-cyan-500/20 text-cyan-300' : 'bg-slate-800 text-slate-400'}`}>
              {showCosmicAstronaut ? 'ON' : 'OFF'}
            </span>
          </button>

          {showCosmicAstronaut && (
            <button
              onClick={() => setCosmicPosition(prev => prev === 'side' ? 'center' : 'side')}
              className="px-2 py-1.5 rounded-xl bg-slate-900/80 text-slate-300 hover:text-cyan-300 hover:bg-slate-800 transition text-[10px] hidden md:inline"
              title="Toggle Astronaut Position: Side or Center"
            >
              Pos: {cosmicPosition === 'side' ? 'Side Orbit' : 'Centered'}
            </button>
          )}
        </nav>
      )}

    </main>
  );
}
