export interface BusRoute {
  id: string;
  name: string;
  number: string;
  color: string;
  origin: string;
  destination: string;
  frequency: string;
  stops: string[];
  schedule: {
    weekday: string;
    weekend: string;
  };
  fare: string;
}

export interface BusStop {
  id: string;
  name: string;
  location: string;
  routes: string[];
  nextArrivals: {
    routeId: string;
    routeName: string;
    estimatedTime: number;
  }[];
}

export const busRoutes: BusRoute[] = [
  {
    id: "1",
    name: "Centro - Rodadero",
    number: "1",
    color: "#3B82F6",
    origin: "Centro Histórico",
    destination: "Rodadero",
    frequency: "Cada 10-15 min",
    fare: "$3.000",
    schedule: {
      weekday: "5:00 AM - 10:00 PM",
      weekend: "6:00 AM - 9:00 PM",
    },
    stops: [
      "Terminal de Transportes",
      "Centro Comercial Buenavista",
      "Av. Santa Rita",
      "Parque de Los Novios",
      "Rodadero",
      "Irotama"
    ],
  },
  {
    id: "2",
    name: "Mamatoco - Gaira",
    number: "2",
    color: "#10B981",
    origin: "Mamatoco",
    destination: "Gaira",
    frequency: "Cada 20 min",
    fare: "$3.000",
    schedule: {
      weekday: "5:30 AM - 9:00 PM",
      weekend: "6:00 AM - 8:00 PM",
    },
    stops: [
      "Mamatoco Centro",
      "Universidad del Magdalena",
      "Av. Libertador",
      "Centro Histórico",
      "Gaira Pueblo",
      "Pozos Colorados"
    ],
  },
  {
    id: "3",
    name: "Taganga Express",
    number: "3",
    color: "#F59E0B",
    origin: "Centro",
    destination: "Taganga",
    frequency: "Cada 15-20 min",
    fare: "$3.000",
    schedule: {
      weekday: "5:00 AM - 11:00 PM",
      weekend: "5:00 AM - 11:00 PM",
    },
    stops: [
      "Parque de Los Novios",
      "Av. del Río",
      "Bastidas",
      "Entrada Taganga",
      "Taganga Playa"
    ],
  },
  {
    id: "4",
    name: "Circular Centro",
    number: "4",
    color: "#EF4444",
    origin: "Terminal",
    destination: "Terminal (Circular)",
    frequency: "Cada 12 min",
    fare: "$3.000",
    schedule: {
      weekday: "5:30 AM - 10:00 PM",
      weekend: "6:30 AM - 9:00 PM",
    },
    stops: [
      "Terminal de Transportes",
      "Quinta de San Pedro",
      "Mercado Público",
      "Camellón",
      "Parque Simón Bolívar",
      "Catedral",
      "Terminal de Transportes"
    ],
  },
  {
    id: "5",
    name: "Bonda - Centro",
    number: "5",
    color: "#8B5CF6",
    origin: "Bonda",
    destination: "Centro",
    frequency: "Cada 25 min",
    fare: "$3.000",
    schedule: {
      weekday: "5:00 AM - 8:00 PM",
      weekend: "6:00 AM - 7:00 PM",
    },
    stops: [
      "Bonda Entrada",
      "Minca Vía",
      "Once de Noviembre",
      "Mamatoco",
      "Universidad",
      "Centro Histórico"
    ],
  },
  {
    id: "6",
    name: "Aeropuerto - Centro",
    number: "6",
    color: "#06B6D4",
    origin: "Aeropuerto Simón Bolívar",
    destination: "Centro",
    frequency: "Cada 30 min",
    fare: "$3.000",
    schedule: {
      weekday: "4:30 AM - 11:30 PM",
      weekend: "5:00 AM - 11:30 PM",
    },
    stops: [
      "Aeropuerto Internacional",
      "Vía Ciénaga",
      "Irotama",
      "Pozos Colorados",
      "Rodadero",
      "Centro Comercial Ocean Mall",
      "Parque de Los Novios"
    ],
  },
  {
    id: "7",
    name: "Universidad - Rodadero",
    number: "7U",
    color: "#EC4899",
    origin: "Universidad del Magdalena",
    destination: "Rodadero",
    frequency: "Cada 8-10 min",
    fare: "$3.000",
    schedule: {
      weekday: "5:00 AM - 11:00 PM",
      weekend: "6:00 AM - 10:00 PM",
    },
    stops: [
      "Universidad del Magdalena",
      "Centro Comercial Buenavista",
      "Hospital San José",
      "Av. Santa Rita",
      "Parque de Los Novios",
      "El Rodadero",
      "Irotama"
    ],
  },
  {
    id: "8",
    name: "Universidad - Bastidas",
    number: "8U",
    color: "#F97316",
    origin: "Universidad del Magdalena",
    destination: "Bastidas",
    frequency: "Cada 15 min",
    fare: "$3.000",
    schedule: {
      weekday: "5:30 AM - 9:30 PM",
      weekend: "6:00 AM - 9:00 PM",
    },
    stops: [
      "Universidad del Magdalena",
      "Terminal de Transportes",
      "Centro Histórico",
      "Av. del Río",
      "Bastidas Norte",
      "Bastidas Centro"
    ],
  },
  {
    id: "9",
    name: "Los Almendros - Universidad",
    number: "9U",
    color: "#14B8A6",
    origin: "Los Almendros",
    destination: "Universidad del Magdalena",
    frequency: "Cada 12 min",
    fare: "$3.000",
    schedule: {
      weekday: "5:00 AM - 10:00 PM",
      weekend: "6:00 AM - 9:00 PM",
    },
    stops: [
      "Los Almendros",
      "La Concepción",
      "Mercado Público",
      "Av. Libertador",
      "Terminal de Transportes",
      "Universidad del Magdalena"
    ],
  },
  {
    id: "10",
    name: "María Eugenia - Universidad",
    number: "10U",
    color: "#A855F7",
    origin: "María Eugenia",
    destination: "Universidad del Magdalena",
    frequency: "Cada 10 min",
    fare: "$3.000",
    schedule: {
      weekday: "5:00 AM - 10:00 PM",
      weekend: "6:00 AM - 9:00 PM",
    },
    stops: [
      "María Eugenia",
      "Villa del Carmen",
      "Hospital San José",
      "Terminal de Transportes",
      "Mamatoco Centro",
      "Universidad del Magdalena"
    ],
  },
  {
    id: "11",
    name: "Pozos Colorados - Centro",
    number: "11",
    color: "#EAB308",
    origin: "Pozos Colorados",
    destination: "Centro Histórico",
    frequency: "Cada 18 min",
    fare: "$3.000",
    schedule: {
      weekday: "5:30 AM - 9:30 PM",
      weekend: "6:00 AM - 8:30 PM",
    },
    stops: [
      "Pozos Colorados",
      "Terminal de Transportes",
      "Av. Libertador",
      "Polideportivo",
      "Mercado Público",
      "Centro Histórico"
    ],
  },
  {
    id: "12",
    name: "20 de Julio - Universidad",
    number: "12U",
    color: "#DC2626",
    origin: "20 de Julio",
    destination: "Universidad del Magdalena",
    frequency: "Cada 15 min",
    fare: "$3.000",
    schedule: {
      weekday: "5:00 AM - 10:00 PM",
      weekend: "6:00 AM - 9:00 PM",
    },
    stops: [
      "20 de Julio",
      "Terminal de Transportes",
      "Hospital San José",
      "Mamatoco Centro",
      "Once de Noviembre",
      "Universidad del Magdalena"
    ],
  },
];

export const busStops: BusStop[] = [
  {
    id: "1",
    name: "Parque de Los Novios",
    location: "Centro Histórico",
    routes: ["1", "3", "4", "6", "7"],
    nextArrivals: [
      { routeId: "1", routeName: "Centro - Rodadero", estimatedTime: 3 },
      { routeId: "3", routeName: "Taganga Express", estimatedTime: 8 },
      { routeId: "7", routeName: "Universidad - Rodadero", estimatedTime: 5 },
    ],
  },
  {
    id: "2",
    name: "Terminal de Transportes",
    location: "Av. del Libertador",
    routes: ["1", "4", "8", "9", "11", "12"],
    nextArrivals: [
      { routeId: "1", routeName: "Centro - Rodadero", estimatedTime: 5 },
      { routeId: "4", routeName: "Circular Centro", estimatedTime: 2 },
      { routeId: "9", routeName: "Los Almendros - Universidad", estimatedTime: 7 },
    ],
  },
  {
    id: "3",
    name: "Universidad del Magdalena",
    location: "Sector Mamatoco",
    routes: ["2", "5", "7", "8", "9", "10", "12"],
    nextArrivals: [
      { routeId: "7", routeName: "Universidad - Rodadero", estimatedTime: 3 },
      { routeId: "8", routeName: "Universidad - Bastidas", estimatedTime: 5 },
      { routeId: "10", routeName: "María Eugenia - Universidad", estimatedTime: 8 },
    ],
  },
  {
    id: "4",
    name: "Rodadero",
    location: "Zona Turística",
    routes: ["1", "6", "7"],
    nextArrivals: [
      { routeId: "1", routeName: "Centro - Rodadero", estimatedTime: 10 },
      { routeId: "6", routeName: "Aeropuerto - Centro", estimatedTime: 18 },
      { routeId: "7", routeName: "Universidad - Rodadero", estimatedTime: 12 },
    ],
  },
  {
    id: "5",
    name: "Centro Comercial Buenavista",
    location: "Av. del Río",
    routes: ["1", "7"],
    nextArrivals: [
      { routeId: "1", routeName: "Centro - Rodadero", estimatedTime: 6 },
      { routeId: "7", routeName: "Universidad - Rodadero", estimatedTime: 9 },
    ],
  },
  {
    id: "6",
    name: "Taganga Playa",
    location: "Taganga",
    routes: ["3"],
    nextArrivals: [
      { routeId: "3", routeName: "Taganga Express", estimatedTime: 4 },
    ],
  },
  {
    id: "7",
    name: "Aeropuerto Internacional",
    location: "Vía Ciénaga",
    routes: ["6"],
    nextArrivals: [
      { routeId: "6", routeName: "Aeropuerto - Centro", estimatedTime: 20 },
    ],
  },
  {
    id: "8",
    name: "Gaira Pueblo",
    location: "Gaira",
    routes: ["2"],
    nextArrivals: [
      { routeId: "2", routeName: "Mamatoco - Gaira", estimatedTime: 13 },
    ],
  },
  {
    id: "9",
    name: "Mamatoco Centro",
    location: "Mamatoco",
    routes: ["2", "10", "12"],
    nextArrivals: [
      { routeId: "2", routeName: "Mamatoco - Gaira", estimatedTime: 5 },
      { routeId: "10", routeName: "María Eugenia - Universidad", estimatedTime: 10 },
      { routeId: "12", routeName: "20 de Julio - Universidad", estimatedTime: 8 },
    ],
  },
  {
    id: "10",
    name: "Hospital San José",
    location: "Sector Universidad",
    routes: ["7", "10", "12"],
    nextArrivals: [
      { routeId: "7", routeName: "Universidad - Rodadero", estimatedTime: 4 },
      { routeId: "10", routeName: "María Eugenia - Universidad", estimatedTime: 6 },
      { routeId: "12", routeName: "20 de Julio - Universidad", estimatedTime: 7 },
    ],
  },
  {
    id: "11",
    name: "Bastidas Centro",
    location: "Bastidas",
    routes: ["3", "8"],
    nextArrivals: [
      { routeId: "3", routeName: "Taganga Express", estimatedTime: 12 },
      { routeId: "8", routeName: "Universidad - Bastidas", estimatedTime: 8 },
    ],
  },
  {
    id: "12",
    name: "Los Almendros",
    location: "Los Almendros",
    routes: ["9"],
    nextArrivals: [
      { routeId: "9", routeName: "Los Almendros - Universidad", estimatedTime: 5 },
    ],
  },
  {
    id: "13",
    name: "María Eugenia",
    location: "María Eugenia",
    routes: ["10"],
    nextArrivals: [
      { routeId: "10", routeName: "María Eugenia - Universidad", estimatedTime: 3 },
    ],
  },
  {
    id: "14",
    name: "20 de Julio",
    location: "20 de Julio",
    routes: ["12"],
    nextArrivals: [
      { routeId: "12", routeName: "20 de Julio - Universidad", estimatedTime: 6 },
    ],
  },
];