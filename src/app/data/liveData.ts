// Datos simulados de buses en tiempo real
// En producción, estos datos vendrían de un servidor en tiempo real

export interface LiveBus {
  id: string;
  routeId: string;
  routeName: string;
  routeNumber: string;
  routeColor: string;
  currentStop: string;
  nextStop: string;
  coordinates: [number, number];
  speed: number; // km/h
  passengerCount: number;
  capacity: number;
  estimatedArrival: number; // minutes
}

// Simular posiciones de buses en movimiento
export const generateLiveBuses = (): LiveBus[] => {
  return [
    {
      id: "bus-1-001",
      routeId: "1",
      routeName: "Centro - Rodadero",
      routeNumber: "1",
      routeColor: "#3B82F6",
      currentStop: "Parque de Los Novios",
      nextStop: "Av. Santa Rita",
      coordinates: [11.2440, -74.2110],
      speed: 25,
      passengerCount: 18,
      capacity: 40,
      estimatedArrival: 3,
    },
    {
      id: "bus-1-002",
      routeId: "1",
      routeName: "Centro - Rodadero",
      routeNumber: "1",
      routeColor: "#3B82F6",
      currentStop: "Irotama",
      nextStop: "Rodadero",
      coordinates: [11.2150, -74.2180],
      speed: 30,
      passengerCount: 25,
      capacity: 40,
      estimatedArrival: 5,
    },
    {
      id: "bus-2-001",
      routeId: "2",
      routeName: "Mamatoco - Gaira",
      routeNumber: "2",
      routeColor: "#10B981",
      currentStop: "Universidad del Magdalena",
      nextStop: "Centro Histórico",
      coordinates: [11.2195, -74.1890],
      speed: 20,
      passengerCount: 15,
      capacity: 40,
      estimatedArrival: 4,
    },
    {
      id: "bus-3-001",
      routeId: "3",
      routeName: "Terminal - Pozos Colorados",
      routeNumber: "3",
      routeColor: "#F59E0B",
      currentStop: "Terminal de Transportes",
      nextStop: "Av. El Libertador",
      coordinates: [11.2280, -74.1970],
      speed: 15,
      passengerCount: 12,
      capacity: 40,
      estimatedArrival: 2,
    },
    {
      id: "bus-7U-001",
      routeId: "7U",
      routeName: "Universidad - Centro (Vía Bastidas)",
      routeNumber: "7U",
      routeColor: "#06B6D4",
      currentStop: "Universidad del Magdalena - Entrada Principal",
      nextStop: "Universidad del Magdalena - Facultad de Ingeniería",
      coordinates: [11.2195, -74.1900],
      speed: 22,
      passengerCount: 28,
      capacity: 40,
      estimatedArrival: 6,
    },
  ];
};
