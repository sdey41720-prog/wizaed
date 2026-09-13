export interface Coordinate {
  lat: number;
  lng: number;
}

export interface Flight {
  id: string;
  flightNumber: string;
  airline: string;
  airlineCode: string;
  aircraft: string;
  origin: {
    code: string;
    city: string;
    country: string;
    coord: Coordinate;
  };
  destination: {
    code: string;
    city: string;
    country: string;
    coord: Coordinate;
  };
  status: 'In Air' | 'Scheduled' | 'Boarding' | 'Descending';
  altitudeFt: number;
  speedKts: number;
  progress: number; // 0 to 1
  departureTime: string;
  arrivalTime: string;
  estimatedRemainingTime: string;
  distanceKm: number;
  callsign: string;
}

export interface PointOfInterest {
  id: string;
  name: string;
  category: 'Landmark' | 'Nature' | 'Culture' | 'Culinary' | 'Adventure' | 'Nightlife';
  description: string;
  rating: number;
  estimatedVisitTime: string;
  photoUrl: string;
  admission: string;
}

export interface WeatherData {
  tempC: number;
  tempF: number;
  condition: 'Sunny' | 'Partly Cloudy' | 'Cloudy' | 'Rainy' | 'Thunderstorm' | 'Snow' | 'Windy';
  humidity: number;
  windSpeedKmh: number;
  windDirection: string;
  uvIndex: number;
  visibilityKm: number;
  aqi: number;
  aqiLabel: 'Good' | 'Moderate' | 'Unhealthy';
  forecast: {
    day: string;
    tempC: number;
    icon: string;
    condition: string;
  }[];
}

export interface Destination {
  id: string;
  name: string;
  country: string;
  region: 'North India' | 'South India' | 'West India' | 'East India' | 'Himalayas' | 'Central India' | 'Asia' | string;
  coord: Coordinate;
  coverImage: string;
  gallery: string[];
  tagline: string;
  description: string;
  localTime: string;
  bestTimeToVisit: string;
  averageBudgetPerDayUsd: number;
  weather: WeatherData;
  pointsOfInterest: PointOfInterest[];
  popularFoods: string[];
  travelTips: string[];
}

export interface Collaborator {
  id: string;
  name: string;
  avatar: string;
  color: string;
  status: 'online' | 'idle' | 'offline';
  currentAction?: string;
  isCurrentUser?: boolean;
}

export interface ItineraryItem {
  id: string;
  dayIndex: number;
  timeSlot: string;
  title: string;
  location: string;
  category: 'Sightseeing' | 'Food' | 'Transport' | 'Hotel' | 'Activity' | 'Flight' | 'Culture';
  costUsd: number;
  assignedTo?: string; // collaborator id
  votes: number;
  votedBy: string[];
  notes?: string;
  completed?: boolean;
  coord?: Coordinate;
}

export interface Itinerary {
  id: string;
  title: string;
  destinationName: string;
  dateRange: string;
  totalDays: number;
  coverImage: string;
  collaborators: Collaborator[];
  items: ItineraryItem[];
  budgetTotalUsd: number;
  tags: string[];
}

export interface SocialPost {
  id: string;
  author: {
    id: string;
    name: string;
    handle: string;
    avatar: string;
    badge?: string;
  };
  timestamp: string;
  location: {
    name: string;
    coord: Coordinate;
  };
  content: string;
  images: string[];
  flightNumber?: string;
  likes: number;
  hasLiked?: boolean;
  commentsCount: number;
  tags: string[];
}

export interface StoryItem {
  id: string;
  authorName: string;
  authorAvatar: string;
  city: string;
  previewImage: string;
  coord: Coordinate;
  hasUnseen: boolean;
}

export type FidsStatus = 
  | 'On Time' 
  | 'Boarding' 
  | 'Final Call' 
  | 'Gate Closed' 
  | 'Taxiing' 
  | 'Departed' 
  | 'En Route' 
  | 'Approaching' 
  | 'On Final'
  | 'Landed' 
  | 'Delayed' 
  | 'Baggage Ready' 
  | 'Cancelled';

export interface FidsFlight {
  id: string;
  flightNumber: string;
  airline: string;
  airlineCode: string;
  type: 'arrival' | 'departure';
  city: string;
  airportCode: string;
  scheduledTime: string;
  estimatedTime: string;
  terminal: string;
  gate?: string;
  carousel?: string;
  aircraft: string;
  status: FidsStatus;
  statusDetail?: string;
  recentlyUpdated?: boolean;
}

export type GlobeViewMode = 'realistic' | 'night' | 'radar' | 'topographic';

export type WeatherOverlayType = 'none' | 'clouds' | 'precipitation' | 'wind' | 'temp';
