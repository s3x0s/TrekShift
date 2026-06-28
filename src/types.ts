export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
}

export interface Operator {
  id: string;
  name: string;
  tourCompany: string;
  trustScore: number; // Scale: 0 - 100
  verified: boolean;
  completedTours: number;
  safetyAuditsCount: number;
}

export interface TripItinerary {
  id: string;
  originalTrekName: string;
  region: string;
  originalDifficulty: "EASY" | "MODERATE" | "CHALLENGING" | "EXTREME";
  weatherDependencyStatus: "LOW" | "MEDIUM" | "HIGH";
  originalDurationHours: number;
  originalMaxAltitudeFeet: number;
  description: string;
}

export interface PivotOption {
  id: string;
  title: string;
  description: string;
  activityType: string;
  duration: string;
  difficulty: string;
  safetyRating: string; // e.g. "98% (Sheltered / Indoor)"
  location: string;
  costImpact: "NO_EXTRA_COST" | "REFUND_DIFFERENCE" | "SLIGHT_UPGRADE_FREE";
  price?: string;
}

export interface PivotHistoryEntry {
  timestamp: string;
  triggerEvent: string; // e.g. "HEAVY_RAINFALL_WARNING_RAIGAD"
  reason: string;
  offeredPivotsCount: number;
  acceptedPivotTitle: string | null;
}

export interface Booking {
  id: string;
  userId: string;
  userName: string;
  operatorId: string;
  operatorName: string;
  originalItineraryId: string;
  originalItineraryName: string;
  bookingDate: string;
  status: "CONFIRMED" | "WEATHER_ALERT" | "PIVOT_PROPOSED" | "PIVOTED" | "CANCELLED";
  currentItineraryDetails: string;
  weatherStatus: "SUNNY" | "LIGHT_RAIN" | "HEAVY_STORM" | "LANDSLIDE_ALERT";
  selectedPivotIndex: number | null;
  pivotOptions: PivotOption[];
  pivotHistory: PivotHistoryEntry[];
}
