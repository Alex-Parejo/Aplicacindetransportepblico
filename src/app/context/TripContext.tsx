import { createContext, useContext, useState, ReactNode } from "react";

interface TripContextType {
  activeRouteId: string | null;
  setActiveTrip: (routeId: string) => void;
  clearTrip: () => void;
}

const TripContext = createContext<TripContextType | undefined>(undefined);

export function TripProvider({ children }: { children: ReactNode }) {
  const [activeRouteId, setActiveRouteId] = useState<string | null>(null);

  const setActiveTrip = (routeId: string) => {
    setActiveRouteId(routeId);
  };

  const clearTrip = () => {
    setActiveRouteId(null);
  };

  return (
    <TripContext.Provider value={{ activeRouteId, setActiveTrip, clearTrip }}>
      {children}
    </TripContext.Provider>
  );
}

export function useTrip() {
  const context = useContext(TripContext);
  if (!context) {
    throw new Error("useTrip must be used within a TripProvider");
  }
  return context;
}
