import { busRoutes, busStops, type BusRoute, type BusStop } from "../data/routes";
import { routeCoordinates } from "../data/routeCoordinates";
import { generateLiveBuses, type LiveBus } from "../data/liveData";

export interface UserPlace {
  name: string;
  address: string;
  coordinates?: [number, number];
}

export interface TripRecord {
  id: string;
  date: string;
  routeId: string;
  routeName: string;
  routeNumber: string;
  routeColor: string;
  from: string;
  to: string;
  durationMinutes: number;
  distanceKm: number;
}

export interface UserProfile {
  name: string;
  email: string;
  avatar: string;
  savedPlaces: {
    home: UserPlace;
    work: UserPlace;
    university: UserPlace;
  };
  favorites: string[]; // routeIds
  history: TripRecord[];
  theme: "dark" | "light";
  notifications: boolean;
}

const DEFAULT_PROFILE: UserProfile = {
  name: "Alejandro Parejo",
  email: "arparejo@unimagdalena.edu.co",
  avatar: "/avatar.png",
  savedPlaces: {
    home: { name: "Mi Casa", address: "Calle 22 #4-56, El Rodadero" },
    work: { name: "Trabajo", address: "Av. del Libertador #12-30" },
    university: { name: "Universidad", address: "Universidad del Magdalena, Sector Mamatoco" },
  },
  favorites: ["1", "7U"],
  history: [
    {
      id: "trip-1",
      date: "2026-05-28T08:15:00Z",
      routeId: "7U",
      routeName: "Universidad - Rodadero",
      routeNumber: "7U",
      routeColor: "#EC4899",
      from: "Rodadero",
      to: "Universidad del Magdalena",
      durationMinutes: 28,
      distanceKm: 8.4,
    },
    {
      id: "trip-2",
      date: "2026-05-27T17:40:00Z",
      routeId: "1",
      routeName: "Centro - Rodadero",
      routeNumber: "1",
      routeColor: "#3B82F6",
      from: "Centro Histórico",
      to: "Rodadero",
      durationMinutes: 35,
      distanceKm: 11.2,
    },
    {
      id: "trip-3",
      date: "2026-05-26T07:30:00Z",
      routeId: "7U",
      routeName: "Universidad - Rodadero",
      routeNumber: "7U",
      routeColor: "#EC4899",
      from: "Rodadero",
      to: "Universidad del Magdalena",
      durationMinutes: 30,
      distanceKm: 8.4,
    },
  ],
  theme: "dark",
  notifications: true,
};

// Helper for fake latency
const delay = (ms = 800) => new Promise((resolve) => setTimeout(resolve, ms));

const pathCache: Record<string, [number, number][]> = {};

export const api = {
  getStreetRoutePath: async (routeId: string, stopsCoords: [number, number][]): Promise<[number, number][]> => {
    if (pathCache[routeId]) {
      return pathCache[routeId];
    }
    try {
      const coordsQuery = stopsCoords.map(([lat, lon]) => `${lon},${lat}`).join(";");
      const url = `https://router.project-osrm.org/route/v1/driving/${coordsQuery}?overview=full&geometries=geojson`;
      const response = await fetch(url);
      if (!response.ok) throw new Error("OSRM Routing error");
      const data = await response.json();
      if (data.code === "Ok" && data.routes?.[0]?.geometry?.coordinates) {
        const path = data.routes[0].geometry.coordinates.map(([lon, lat]: [number, number]) => [lat, lon]);
        pathCache[routeId] = path;
        return path;
      }
    } catch (err) {
      console.warn(`Failed to fetch OSRM path for route ${routeId}:`, err);
    }
    return stopsCoords;
  },

  // Routes Endpoints
  getRoutes: async (): Promise<BusRoute[]> => {
    await delay(400);
    return [...busRoutes];
  },

  getRouteDetail: async (id: string): Promise<BusRoute | null> => {
    await delay(300);
    const route = busRoutes.find((r) => r.id === id);
    return route ? { ...route } : null;
  },

  getRouteCoordinates: async (id: string) => {
    await delay(200);
    return routeCoordinates[id] || null;
  },

  // Stops Endpoints
  getStops: async (): Promise<BusStop[]> => {
    await delay(300);
    return [...busStops];
  },

  getStopDetail: async (id: string): Promise<BusStop | null> => {
    await delay(200);
    const stop = busStops.find((s) => s.id === id);
    return stop ? { ...stop } : null;
  },

  // Live Tracking Endpoints
  getLiveBuses: async (): Promise<LiveBus[]> => {
    await delay(100);
    return generateLiveBuses();
  },

  // Profile and Settings Endpoints
  getProfile: async (): Promise<UserProfile> => {
    await delay(400);
    const stored = localStorage.getItem("bussamario_profile");
    if (!stored) {
      localStorage.setItem("bussamario_profile", JSON.stringify(DEFAULT_PROFILE));
      return { ...DEFAULT_PROFILE };
    }
    const profile = JSON.parse(stored);
    if (profile.avatar && profile.avatar.includes("unsplash.com")) {
      profile.avatar = "/avatar.png";
      localStorage.setItem("bussamario_profile", JSON.stringify(profile));
    }
    return profile;
  },

  updateProfile: async (profile: UserProfile): Promise<UserProfile> => {
    await delay(500);
    localStorage.setItem("bussamario_profile", JSON.stringify(profile));
    return { ...profile };
  },

  // Favorites Helpers
  toggleFavoriteRoute: async (routeId: string): Promise<string[]> => {
    await delay(200);
    const profile = await api.getProfile();
    const index = profile.favorites.indexOf(routeId);
    if (index > -1) {
      profile.favorites.splice(index, 1);
    } else {
      profile.favorites.push(routeId);
    }
    await api.updateProfile(profile);
    return profile.favorites;
  },

  // Commute History Helper
  addTripRecord: async (trip: Omit<TripRecord, "id" | "date">): Promise<TripRecord> => {
    await delay(300);
    const profile = await api.getProfile();
    const newRecord: TripRecord = {
      ...trip,
      id: `trip-${Date.now()}`,
      date: new Date().toISOString(),
    };
    profile.history = [newRecord, ...profile.history];
    await api.updateProfile(profile);
    return newRecord;
  },
};
