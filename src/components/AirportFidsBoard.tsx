import React, { useState, useEffect, useRef } from 'react';
import { 
  PlaneTakeoff, 
  PlaneLanding, 
  Clock, 
  Search, 
  RefreshCw, 
  Play, 
  Pause, 
  Sparkles, 
  MapPin, 
  ChevronDown, 
  AlertTriangle, 
  CheckCircle2, 
  Radio, 
  Luggage,
  Navigation
} from 'lucide-react';
import { Destination, Flight, FidsFlight, FidsStatus } from '../types';
import { playUiClick, playRadarBeep } from '../utils/audio';

interface AirportFidsBoardProps {
  selectedDestination: Destination | null;
  destinations?: Destination[];
  onSelectDestination?: (dest: Destination) => void;
  onSelectFlight?: (flight: Flight) => void;
  radarFlights?: Flight[];
}

// Indian Airport Directory Mapping
interface AirportInfo {
  code: string;
  name: string;
  city: string;
  terminals: string[];
}

const AIRPORT_REGISTRY: Record<string, AirportInfo> = {
  delhi: {
    code: 'DEL',
    city: 'New Delhi',
    name: 'Indira Gandhi International Airport',
    terminals: ['T1', 'T2', 'T3'],
  },
  mumbai: {
    code: 'BOM',
    city: 'Mumbai',
    name: 'Chhatrapati Shivaji Maharaj Intl Airport',
    terminals: ['T1', 'T2'],
  },
  bengaluru: {
    code: 'BLR',
    city: 'Bengaluru',
    name: 'Kempegowda International Airport',
    terminals: ['T1', 'T2'],
  },
  hyderabad: {
    code: 'HYD',
    city: 'Hyderabad',
    name: 'Rajiv Gandhi International Airport',
    terminals: ['T1'],
  },
  kolkata: {
    code: 'CCU',
    city: 'Kolkata',
    name: 'Netaji Subhash Chandra Bose Intl Airport',
    terminals: ['T1', 'T2'],
  },
  goa: {
    code: 'GOI',
    city: 'Goa',
    name: 'Dabolim & Manohar International Airport',
    terminals: ['T1', 'T2'],
  },
  jaipur: {
    code: 'JAI',
    city: 'Jaipur',
    name: 'Jaipur International Airport',
    terminals: ['T1', 'T2'],
  },
  varanasi: {
    code: 'VNS',
    city: 'Varanasi',
    name: 'Lal Bahadur Shastri International Airport',
    terminals: ['T1'],
  },
  amritsar: {
    code: 'ATQ',
    city: 'Amritsar',
    name: 'Sri Guru Ram Dass Jee International Airport',
    terminals: ['T1'],
  },
  udaipur: {
    code: 'UDR',
    city: 'Udaipur',
    name: 'Maharana Pratap Airport',
    terminals: ['T1'],
  },
  agra: {
    code: 'AGR',
    city: 'Agra',
    name: 'Agra Civil Air Terminal',
    terminals: ['T1'],
  },
};

// Hub cities across India for realistic routes
const CONNECTING_HUBS = [
  { city: 'Mumbai', code: 'BOM' },
  { city: 'New Delhi', code: 'DEL' },
  { city: 'Bengaluru', code: 'BLR' },
  { city: 'Hyderabad', code: 'HYD' },
  { city: 'Kolkata', code: 'CCU' },
  { city: 'Chennai', code: 'MAA' },
  { city: 'Ahmedabad', code: 'AMD' },
  { city: 'Pune', code: 'PNQ' },
  { city: 'Kochi', code: 'COK' },
  { city: 'Goa', code: 'GOI' },
  { city: 'Dubai', code: 'DXB' },
  { city: 'Singapore', code: 'SIN' },
  { city: 'London Heathrow', code: 'LHR' },
];

const AIRLINES = [
  { name: 'IndiGo', code: 'IGO', prefix: '6E', aircraft: ['Airbus A320neo', 'Airbus A321neo'], color: 'bg-blue-600' },
  { name: 'Air India', code: 'AIC', prefix: 'AI', aircraft: ['Airbus A350-900', 'Boeing 787-9', 'Airbus A320neo'], color: 'bg-red-600' },
  { name: 'Vistara', code: 'VTI', prefix: 'UK', aircraft: ['Boeing 787-9', 'Airbus A321neo'], color: 'bg-purple-700' },
  { name: 'Akasa Air', code: 'AKJ', prefix: 'QP', aircraft: ['Boeing 737 MAX 8'], color: 'bg-orange-500' },
  { name: 'SpiceJet', code: 'SEJ', prefix: 'SG', aircraft: ['Boeing 737-800', 'Q400'], color: 'bg-amber-600' },
  { name: 'Air India Express', code: 'AXB', prefix: 'IX', aircraft: ['Boeing 737 MAX 8'], color: 'bg-rose-500' },
];

// Helper to seed realistic mock flights for a city
function generateMockFidsFlights(airportCode: string, currentCity: string): FidsFlight[] {
  const result: FidsFlight[] = [];
  const otherHubs = CONNECTING_HUBS.filter(h => h.code !== airportCode);

  // 1. Departures (7-8 flights)
  const departureStatuses: FidsStatus[] = [
    'Boarding',
    'Final Call',
    'Gate Closed',
    'Taxiing',
    'On Time',
    'On Time',
    'Delayed',
    'Departed',
  ];

  departureStatuses.forEach((status, idx) => {
    const hub = otherHubs[idx % otherHubs.length];
    const airline = AIRLINES[idx % AIRLINES.length];
    const flightNum = `${airline.prefix} ${100 + (idx * 117 + (airportCode.charCodeAt(0) * 3)) % 880}`;
    const scheduledHour = (13 + Math.floor(idx * 1.2)) % 24;
    const scheduledMin = (idx * 15) % 60;
    const schedStr = `${String(scheduledHour).padStart(2, '0')}:${String(scheduledMin).padStart(2, '0')}`;
    
    let estStr = schedStr;
    let detail = '';
    if (status === 'Delayed') {
      const delayedMin = (scheduledMin + 25) % 60;
      const delayedHour = scheduledHour + Math.floor((scheduledMin + 25) / 60);
      estStr = `${String(delayedHour).padStart(2, '0')}:${String(delayedMin).padStart(2, '0')}`;
      detail = '+25m ATC Delay';
    } else if (status === 'Boarding') {
      detail = 'Gate Open';
    } else if (status === 'Final Call') {
      detail = 'Closing Soon';
    }

    const term = airportCode === 'DEL' ? (idx % 2 === 0 ? 'T3' : 'T2') : airportCode === 'BOM' ? 'T2' : 'T1';
    const gateNum = `${term[1] || '1'}${String((idx * 3 + 4) % 36).padStart(2, '0')}${idx % 2 === 0 ? 'A' : 'B'}`;

    result.push({
      id: `fids-dep-${airportCode}-${idx}`,
      flightNumber: flightNum,
      airline: airline.name,
      airlineCode: airline.code,
      type: 'departure',
      city: hub.city,
      airportCode: hub.code,
      scheduledTime: schedStr,
      estimatedTime: estStr,
      terminal: term,
      gate: gateNum,
      aircraft: airline.aircraft[idx % airline.aircraft.length],
      status: status,
      statusDetail: detail,
    });
  });

  // 2. Arrivals (7-8 flights)
  const arrivalStatuses: FidsStatus[] = [
    'Landed',
    'Approaching',
    'On Final',
    'On Time',
    'En Route',
    'Delayed',
    'Baggage Ready',
    'On Time',
  ];

  arrivalStatuses.forEach((status, idx) => {
    const hub = otherHubs[(idx + 3) % otherHubs.length];
    const airline = AIRLINES[(idx + 2) % AIRLINES.length];
    const flightNum = `${airline.prefix} ${200 + (idx * 133 + (airportCode.charCodeAt(1) * 5)) % 750}`;
    const scheduledHour = (13 + Math.floor((idx + 0.5) * 1.2)) % 24;
    const scheduledMin = ((idx + 2) * 18) % 60;
    const schedStr = `${String(scheduledHour).padStart(2, '0')}:${String(scheduledMin).padStart(2, '0')}`;

    let estStr = schedStr;
    let detail = '';
    if (status === 'Delayed') {
      const delayedMin = (scheduledMin + 35) % 60;
      const delayedHour = scheduledHour + Math.floor((scheduledMin + 35) / 60);
      estStr = `${String(delayedHour).padStart(2, '0')}:${String(delayedMin).padStart(2, '0')}`;
      detail = '+35m Air Traffic';
    } else if (status === 'Landed') {
      detail = 'On Runway';
    } else if (status === 'Baggage Ready') {
      detail = `Belt 0${(idx % 4) + 2}`;
    }

    const term = airportCode === 'DEL' ? (idx % 2 === 0 ? 'T3' : 'T2') : airportCode === 'BOM' ? 'T2' : 'T1';
    const beltNum = `Belt 0${(idx % 6) + 1}`;

    result.push({
      id: `fids-arr-${airportCode}-${idx}`,
      flightNumber: flightNum,
      airline: airline.name,
      airlineCode: airline.code,
      type: 'arrival',
      city: hub.city,
      airportCode: hub.code,
      scheduledTime: schedStr,
      estimatedTime: estStr,
      terminal: term,
      carousel: beltNum,
      aircraft: airline.aircraft[(idx + 1) % airline.aircraft.length],
      status: status,
      statusDetail: detail,
    });
  });

  return result;
}

export const AirportFidsBoard: React.FC<AirportFidsBoardProps> = ({
  selectedDestination,
  destinations = [],
  onSelectDestination,
  onSelectFlight,
  radarFlights = [],
}) => {
  // Determine active airport
  const defaultDestId = selectedDestination?.id?.toLowerCase() || 'delhi';
  const [activeAirportKey, setActiveAirportKey] = useState<string>(
    AIRPORT_REGISTRY[defaultDestId] ? defaultDestId : 'delhi'
  );

  // Sync if selected destination changes externally
  useEffect(() => {
    if (selectedDestination?.id && AIRPORT_REGISTRY[selectedDestination.id.toLowerCase()]) {
      setActiveAirportKey(selectedDestination.id.toLowerCase());
    }
  }, [selectedDestination]);

  const airportInfo = AIRPORT_REGISTRY[activeAirportKey] || AIRPORT_REGISTRY.delhi;

  // Board tab state: 'departures' or 'arrivals'
  const [boardType, setBoardType] = useState<'arrivals' | 'departures'>('arrivals');

  // Search and filter
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'on-time' | 'active' | 'delayed'>('all');

  // FIDS Flight List State
  const [flightsList, setFlightsList] = useState<FidsFlight[]>(() =>
    generateMockFidsFlights(airportInfo.code, airportInfo.city)
  );

  // Simulation controls
  const [isSimulating, setIsSimulating] = useState(true);
  const [lastUpdateSeconds, setLastUpdateSeconds] = useState(0);
  const [recentNotification, setRecentNotification] = useState<string | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Regenerate base flights whenever the active airport changes
  useEffect(() => {
    setFlightsList(generateMockFidsFlights(airportInfo.code, airportInfo.city));
    setRecentNotification(`FIDS synchronized for ${airportInfo.name}`);
    setLastUpdateSeconds(0);
  }, [activeAirportKey, airportInfo.code, airportInfo.city, airportInfo.name]);

  // Track timer for "seconds ago" ticker
  useEffect(() => {
    const timer = setInterval(() => {
      setLastUpdateSeconds(s => s + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Simulated status update engine
  const triggerSimulatedUpdate = () => {
    setFlightsList(prev => {
      if (prev.length === 0) return prev;
      
      // Pick a random candidate flight to update
      const candidateIdx = Math.floor(Math.random() * prev.length);
      const target = prev[candidateIdx];
      let newStatus: FidsStatus = target.status;
      let newDetail = target.statusDetail || '';
      let newEstimated = target.estimatedTime;

      if (target.type === 'departure') {
        if (target.status === 'On Time') {
          newStatus = 'Boarding';
          newDetail = 'Gate Open • Row 15-30';
        } else if (target.status === 'Boarding') {
          newStatus = 'Final Call';
          newDetail = 'Immediate Boarding';
        } else if (target.status === 'Final Call') {
          newStatus = 'Gate Closed';
          newDetail = 'Doors Secured';
        } else if (target.status === 'Gate Closed') {
          newStatus = 'Taxiing';
          newDetail = 'Pushback Runway 28';
        } else if (target.status === 'Taxiing') {
          newStatus = 'Departed';
          newDetail = 'Airborne';
        } else if (target.status === 'Delayed') {
          newStatus = 'Boarding';
          newDetail = 'Gate Open Now';
        } else {
          // Flip back to on time with a slight adjustment
          newStatus = 'On Time';
          newDetail = 'Gate Assigned';
        }
      } else {
        // Arrivals
        if (target.status === 'En Route') {
          newStatus = 'Approaching';
          newDetail = 'FL120 • 20 min';
        } else if (target.status === 'Approaching') {
          newStatus = 'On Final';
          newDetail = 'ILS Runway 29';
        } else if (target.status === 'On Final') {
          newStatus = 'Landed';
          newDetail = 'Taxiing to Stand';
        } else if (target.status === 'Landed') {
          newStatus = 'Baggage Ready';
          newDetail = target.carousel || 'Belt 02';
        } else if (target.status === 'Delayed') {
          newStatus = 'Approaching';
          newDetail = 'ETA Revised';
        } else {
          newStatus = 'En Route';
          newDetail = 'On Schedule';
        }
      }

      const updated = prev.map((f, i) => {
        if (i === candidateIdx) {
          return {
            ...f,
            status: newStatus,
            statusDetail: newDetail,
            estimatedTime: newEstimated,
            recentlyUpdated: true,
          };
        }
        return {
          ...f,
          recentlyUpdated: false, // clear older updates
        };
      });

      setRecentNotification(
        `Update: ${target.flightNumber} (${target.type === 'departure' ? 'to' : 'from'} ${target.airportCode}) is now ${newStatus}`
      );
      setLastUpdateSeconds(0);
      playRadarBeep();

      return updated;
    });
  };

  // Interval hook for autonomous simulation
  useEffect(() => {
    if (!isSimulating) return;

    const interval = setInterval(() => {
      triggerSimulatedUpdate();
    }, 6500);

    return () => clearInterval(interval);
  }, [isSimulating]);

  // Filter flights by board type and user query
  const filteredFlights = flightsList.filter(f => {
    if (f.type !== (boardType === 'arrivals' ? 'arrival' : 'departure')) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchNum = f.flightNumber.toLowerCase().includes(q);
      const matchCity = f.city.toLowerCase().includes(q);
      const matchCode = f.airportCode.toLowerCase().includes(q);
      const matchAirline = f.airline.toLowerCase().includes(q);
      if (!matchNum && !matchCity && !matchCode && !matchAirline) return false;
    }

    if (statusFilter === 'on-time') {
      return f.status === 'On Time' || f.status === 'En Route';
    }
    if (statusFilter === 'active') {
      return f.status === 'Boarding' || f.status === 'Final Call' || f.status === 'Approaching' || f.status === 'On Final';
    }
    if (statusFilter === 'delayed') {
      return f.status === 'Delayed';
    }

    return true;
  });

  // Total counts
  const arrivalsCount = flightsList.filter(f => f.type === 'arrival').length;
  const departuresCount = flightsList.filter(f => f.type === 'departure').length;

  // Status Badge Styling Helper
  const getStatusBadge = (status: FidsStatus, isRecent?: boolean) => {
    switch (status) {
      case 'On Time':
      case 'En Route':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold font-mono tracking-wider bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
            <CheckCircle2 className="w-2.5 h-2.5" />
            ON TIME
          </span>
        );
      case 'Boarding':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold font-mono tracking-wider bg-amber-500/25 text-amber-300 border border-amber-500/40 animate-pulse">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
            BOARDING
          </span>
        );
      case 'Final Call':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold font-mono tracking-wider bg-rose-500/30 text-rose-300 border border-rose-500/50 animate-bounce">
            <AlertTriangle className="w-2.5 h-2.5" />
            FINAL CALL
          </span>
        );
      case 'Gate Closed':
      case 'Departed':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold font-mono tracking-wider bg-slate-800 text-slate-400 border border-slate-700">
            {status.toUpperCase()}
          </span>
        );
      case 'Taxiing':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold font-mono tracking-wider bg-purple-500/20 text-purple-300 border border-purple-500/30">
            TAXIING
          </span>
        );
      case 'Approaching':
      case 'On Final':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold font-mono tracking-wider bg-sky-500/25 text-sky-300 border border-sky-500/40 animate-pulse">
            <Radio className="w-2.5 h-2.5 text-sky-400" />
            {status.toUpperCase()}
          </span>
        );
      case 'Landed':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold font-mono tracking-wider bg-emerald-500/25 text-emerald-300 border border-emerald-500/40">
            <CheckCircle2 className="w-2.5 h-2.5" />
            LANDED
          </span>
        );
      case 'Baggage Ready':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold font-mono tracking-wider bg-teal-500/20 text-teal-300 border border-teal-500/30">
            <Luggage className="w-2.5 h-2.5" />
            BAGGAGE READY
          </span>
        );
      case 'Delayed':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold font-mono tracking-wider bg-rose-500/20 text-rose-400 border border-rose-500/30">
            <AlertTriangle className="w-2.5 h-2.5" />
            DELAYED
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold font-mono bg-slate-800 text-slate-300">
            {status}
          </span>
        );
    }
  };

  return (
    <div id="airport-fids-board" className="flex flex-col h-full text-slate-200">
      
      {/* 1. Airport Header & City Selector */}
      <div className="p-3 border-b border-slate-800/80 bg-slate-900/60">
        <div className="flex items-center justify-between gap-2">
          <div className="relative flex-1">
            <button
              id="airport-city-dropdown-trigger"
              onClick={() => {
                setIsDropdownOpen(!isDropdownOpen);
                playUiClick();
              }}
              className="w-full flex items-center justify-between p-2 rounded-xl bg-slate-950/80 border border-sky-500/30 hover:border-sky-400 text-left transition"
            >
              <div className="flex items-center gap-2 overflow-hidden">
                <div className="w-8 h-8 rounded-lg bg-sky-500/20 border border-sky-500/40 flex items-center justify-center font-mono font-extrabold text-sky-300 text-xs shrink-0">
                  {airportInfo.code}
                </div>
                <div className="truncate">
                  <div className="text-xs font-bold text-white flex items-center gap-1.5 truncate">
                    <span>{airportInfo.city}</span>
                    <span className="text-[10px] text-sky-400 font-mono font-normal">({airportInfo.code})</span>
                  </div>
                  <div className="text-[10px] text-slate-400 truncate">
                    {airportInfo.name}
                  </div>
                </div>
              </div>
              <ChevronDown className={`w-4 h-4 text-sky-400 shrink-0 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* City Dropdown Menu */}
            {isDropdownOpen && (
              <div 
                id="airport-city-dropdown-menu"
                className="absolute left-0 right-0 top-full mt-1.5 z-40 max-h-56 overflow-y-auto rounded-2xl bg-slate-950/95 border border-sky-500/40 shadow-2xl p-1.5 space-y-1 backdrop-blur-2xl font-mono text-xs"
              >
                <div className="px-2 py-1 text-[10px] uppercase tracking-wider text-slate-400 font-bold border-b border-slate-800">
                  Select Indian Destination Airport
                </div>
                {Object.entries(AIRPORT_REGISTRY).map(([key, info]) => {
                  const isCur = key === activeAirportKey;
                  return (
                    <button
                      key={key}
                      onClick={() => {
                        setActiveAirportKey(key);
                        setIsDropdownOpen(false);
                        playUiClick();
                        // Also notify parent if destination object matches
                        const matchingDest = destinations.find(d => d.id.toLowerCase() === key || d.name.toLowerCase().includes(info.city.toLowerCase()));
                        if (matchingDest && onSelectDestination) {
                          onSelectDestination(matchingDest);
                        }
                      }}
                      className={`w-full text-left p-2 rounded-xl transition flex items-center justify-between ${
                        isCur ? 'bg-sky-500/25 text-white font-bold border border-sky-500/40' : 'text-slate-300 hover:bg-slate-900'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sky-400">{info.code}</span>
                        <span>{info.city}</span>
                      </div>
                      <span className="text-[10px] text-slate-400 font-normal">
                        {info.terminals.join(', ')}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Airport Sub-info badges */}
        <div className="flex items-center gap-2 mt-2 text-[10px] font-mono text-slate-400">
          <span className="flex items-center gap-1 text-emerald-400">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>FIDS BOARD LIVE</span>
          </span>
          <span>•</span>
          <span>TERMINALS: {airportInfo.terminals.join(', ')}</span>
          <span>•</span>
          <span className="text-sky-300">IST (UTC+5:30)</span>
        </div>
      </div>

      {/* 2. Arrivals / Departures Switcher Tabs */}
      <div className="p-2 border-b border-slate-800/80 bg-slate-950/40 flex items-center gap-2">
        <button
          id="fids-tab-arrivals"
          onClick={() => { setBoardType('arrivals'); playUiClick(); }}
          className={`flex-1 py-2 px-3 rounded-xl font-mono text-xs font-bold transition flex items-center justify-center gap-2 border ${
            boardType === 'arrivals'
              ? 'bg-sky-500 text-white border-sky-400 shadow-md shadow-sky-500/20'
              : 'bg-slate-900/60 text-slate-400 border-slate-800 hover:bg-slate-800 hover:text-white'
          }`}
        >
          <PlaneLanding className="w-3.5 h-3.5" />
          <span>Arrivals</span>
          <span className={`px-1.5 py-0.2 rounded-md text-[10px] ${boardType === 'arrivals' ? 'bg-white/20 text-white' : 'bg-slate-800 text-slate-400'}`}>
            {arrivalsCount}
          </span>
        </button>

        <button
          id="fids-tab-departures"
          onClick={() => { setBoardType('departures'); playUiClick(); }}
          className={`flex-1 py-2 px-3 rounded-xl font-mono text-xs font-bold transition flex items-center justify-center gap-2 border ${
            boardType === 'departures'
              ? 'bg-sky-500 text-white border-sky-400 shadow-md shadow-sky-500/20'
              : 'bg-slate-900/60 text-slate-400 border-slate-800 hover:bg-slate-800 hover:text-white'
          }`}
        >
          <PlaneTakeoff className="w-3.5 h-3.5" />
          <span>Departures</span>
          <span className={`px-1.5 py-0.2 rounded-md text-[10px] ${boardType === 'departures' ? 'bg-white/20 text-white' : 'bg-slate-800 text-slate-400'}`}>
            {departuresCount}
          </span>
        </button>
      </div>

      {/* 3. Live Simulation Ticker Bar */}
      <div className="px-3 py-1.5 bg-slate-900/40 border-b border-slate-800/60 flex items-center justify-between text-[10px] font-mono">
        <div className="flex items-center gap-1.5 text-slate-400 truncate">
          <span className={`w-2 h-2 rounded-full ${isSimulating ? 'bg-emerald-400 animate-ping' : 'bg-amber-400'}`} />
          <span className="truncate">
            {isSimulating ? `Syncing updates (updated ${lastUpdateSeconds}s ago)` : 'Simulation Paused'}
          </span>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          <button
            id="fids-manual-simulate-btn"
            onClick={() => {
              triggerSimulatedUpdate();
              playUiClick();
            }}
            className="p-1 px-1.5 rounded-md bg-sky-500/20 text-sky-300 hover:bg-sky-500/30 transition flex items-center gap-1 font-bold text-[9px]"
            title="Simulate random status update"
          >
            <Sparkles className="w-2.5 h-2.5" />
            <span>Simulate Update</span>
          </button>

          <button
            id="fids-toggle-simulation-btn"
            onClick={() => {
              setIsSimulating(!isSimulating);
              playUiClick();
            }}
            className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition"
            title={isSimulating ? 'Pause Auto-Simulation' : 'Resume Auto-Simulation'}
          >
            {isSimulating ? <Pause className="w-3 h-3 text-amber-400" /> : <Play className="w-3 h-3 text-emerald-400" />}
          </button>
        </div>
      </div>

      {/* 4. Filter & Search Controls */}
      <div className="p-2 border-b border-slate-800/60 space-y-1.5">
        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder={`Search ${boardType} by flight #, airline, city...`}
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 outline-none focus:border-sky-500/60 font-mono"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white text-xs"
            >
              ×
            </button>
          )}
        </div>

        <div className="flex items-center gap-1 text-[10px] font-mono overflow-x-auto scrollbar-none">
          {[
            { id: 'all', label: 'All' },
            { id: 'on-time', label: 'On Time' },
            { id: 'active', label: boardType === 'arrivals' ? 'Approaching' : 'Boarding' },
            { id: 'delayed', label: 'Delayed' },
          ].map(flt => (
            <button
              key={flt.id}
              onClick={() => { setStatusFilter(flt.id as any); playUiClick(); }}
              className={`px-2 py-0.5 rounded-md whitespace-nowrap transition ${
                statusFilter === flt.id 
                  ? 'bg-slate-700 text-white font-bold' 
                  : 'text-slate-400 hover:bg-slate-800'
              }`}
            >
              {flt.label}
            </button>
          ))}
        </div>
      </div>

      {/* 5. Live Notification Ticker (when flight status changes) */}
      {recentNotification && (
        <div className="px-3 py-1 bg-sky-950/40 border-b border-sky-500/30 text-[10px] font-mono text-sky-300 flex items-center gap-1.5 animate-fadeIn">
          <span className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-pulse shrink-0" />
          <span className="truncate">{recentNotification}</span>
        </div>
      )}

      {/* 6. FIDS Flight List Scroll View */}
      <div className="p-2 space-y-1.5 overflow-y-auto flex-1 font-mono">
        {filteredFlights.length === 0 ? (
          <div className="p-6 text-center text-slate-500 text-xs space-y-2">
            <Clock className="w-6 h-6 mx-auto opacity-40 text-slate-400" />
            <p>No {boardType} matching your filter.</p>
            <button
              onClick={() => { setSearchQuery(''); setStatusFilter('all'); }}
              className="text-sky-400 hover:underline text-[11px]"
            >
              Clear filters
            </button>
          </div>
        ) : (
          filteredFlights.map(flight => {
            // Check if this flight matches any active 3D radar flight
            const matchingRadarFlight = radarFlights.find(
              rf => rf.flightNumber.replace(/\s+/g, '') === flight.flightNumber.replace(/\s+/g, '')
            );

            return (
              <div
                key={flight.id}
                id={`fids-flight-${flight.id}`}
                onClick={() => {
                  if (matchingRadarFlight && onSelectFlight) {
                    onSelectFlight(matchingRadarFlight);
                    playRadarBeep();
                  } else {
                    playUiClick();
                  }
                }}
                className={`w-full text-left p-2.5 rounded-xl transition border relative group cursor-pointer ${
                  flight.recentlyUpdated
                    ? 'bg-sky-950/70 border-sky-400 shadow-lg shadow-sky-500/20 ring-1 ring-sky-400'
                    : 'bg-slate-900/60 border-slate-800/80 hover:bg-slate-900 hover:border-slate-700'
                }`}
              >
                {/* Recently updated flash indicator */}
                {flight.recentlyUpdated && (
                  <div className="absolute -top-1.5 right-2 px-1.5 py-0.2 rounded-full bg-amber-400 text-slate-950 text-[9px] font-bold tracking-widest uppercase animate-pulse shadow-sm">
                    UPDATED
                  </div>
                )}

                {/* Top Row: Time, Flight #, Airline & Status */}
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    {/* Time Display */}
                    <div className="text-left">
                      <span className="text-xs font-bold text-white tracking-wide">
                        {flight.scheduledTime}
                      </span>
                      {flight.estimatedTime !== flight.scheduledTime && (
                        <div className="text-[10px] text-orange-400 font-medium">
                          Est: {flight.estimatedTime}
                        </div>
                      )}
                    </div>

                    {/* Airline & Flight Number */}
                    <div className="flex items-center gap-1.5">
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-sky-400 border border-slate-700">
                        {flight.airlineCode}
                      </span>
                      <span className="text-xs font-extrabold text-white">
                        {flight.flightNumber}
                      </span>
                    </div>
                  </div>

                  {/* Status Badge */}
                  <div>
                    {getStatusBadge(flight.status, flight.recentlyUpdated)}
                  </div>
                </div>

                {/* Bottom Row: Origin/Destination, Terminal/Gate & Aircraft */}
                <div className="flex items-center justify-between text-[11px] text-slate-400 border-t border-slate-800/50 pt-1.5">
                  <div className="flex items-center gap-1.5">
                    <span className="text-slate-500 font-normal">
                      {boardType === 'arrivals' ? 'From:' : 'To:'}
                    </span>
                    <span className="font-bold text-white">{flight.airportCode}</span>
                    <span className="text-slate-400 text-[10px] truncate max-w-[90px]">{flight.city}</span>
                  </div>

                  <div className="flex items-center gap-2 text-[10px]">
                    {boardType === 'departures' ? (
                      <span className="text-slate-300 font-medium">
                        {flight.terminal} • Gate {flight.gate}
                      </span>
                    ) : (
                      <span className="text-slate-300 font-medium">
                        {flight.terminal} • {flight.carousel}
                      </span>
                    )}

                    {matchingRadarFlight && (
                      <span className="flex items-center gap-0.5 text-sky-400 font-bold" title="Available on 3D Radar">
                        <Navigation className="w-2.5 h-2.5" />
                        <span className="text-[9px]">3D</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Extra status detail if present (e.g. delay reason or runway info) */}
                {flight.statusDetail && (
                  <div className="text-[10px] text-sky-400/80 mt-1 flex items-center justify-between font-mono italic">
                    <span>{flight.statusDetail}</span>
                    <span className="text-[9px] text-slate-500 not-italic">{flight.aircraft}</span>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Footer info */}
      <div className="p-2 border-t border-slate-800/80 bg-slate-950/60 text-[9px] font-mono text-slate-500 flex items-center justify-between">
        <span>FIDS Radar • All timings in IST</span>
        <span>{filteredFlights.length} Flights Tracked</span>
      </div>

    </div>
  );
};
