// Coordenadas geográficas de los paraderos en Santa Marta
// Formato: [latitud, longitud]

export interface StopCoordinate {
  name: string;
  coordinates: [number, number];
}

export const routeCoordinates: Record<string, StopCoordinate[]> = {
  "1": [ // Centro - Rodadero
    { name: "Terminal de Transportes", coordinates: [11.2280, -74.1915] },
    { name: "Centro Comercial Buenavista", coordinates: [11.2255, -74.1865] },
    { name: "Av. Santa Rita", coordinates: [11.2385, -74.2050] },
    { name: "Parque de Los Novios", coordinates: [11.2440, -74.2110] },
    { name: "Rodadero", coordinates: [11.2030, -74.2260] },
    { name: "Irotama", coordinates: [11.1450, -74.2290] },
  ],
  "2": [ // Mamatoco - Gaira
    { name: "Mamatoco Centro", coordinates: [11.2240, -74.1840] },
    { name: "Universidad del Magdalena", coordinates: [11.2220, -74.1890] },
    { name: "Av. Libertador", coordinates: [11.2380, -74.1970] },
    { name: "Centro Histórico", coordinates: [11.2440, -74.2110] },
    { name: "Gaira Pueblo", coordinates: [11.1920, -74.2240] },
    { name: "Pozos Colorados", coordinates: [11.1700, -74.2260] },
  ],
  "3": [ // Taganga Express
    { name: "Parque de Los Novios", coordinates: [11.2440, -74.2110] },
    { name: "Av. del Río", coordinates: [11.2465, -74.2020] },
    { name: "Bastidas", coordinates: [11.2500, -74.1850] },
    { name: "Entrada Taganga", coordinates: [11.2590, -74.1980] },
    { name: "Taganga Playa", coordinates: [11.2660, -74.1910] },
  ],
  "4": [ // Circular Centro
    { name: "Terminal de Transportes", coordinates: [11.2280, -74.1915] },
    { name: "Quinta de San Pedro", coordinates: [11.2260, -74.1890] },
    { name: "Mercado Público", coordinates: [11.2425, -74.2085] },
    { name: "Camellón", coordinates: [11.2465, -74.2125] },
    { name: "Parque Simón Bolívar", coordinates: [11.2455, -74.2105] },
    { name: "Catedral", coordinates: [11.2448, -74.2115] },
    { name: "Terminal de Transportes", coordinates: [11.2280, -74.1915] },
  ],
  "5": [ // Bonda - Centro
    { name: "Bonda Entrada", coordinates: [11.2180, -74.1250] },
    { name: "Minca Vía", coordinates: [11.2200, -74.1500] },
    { name: "Once de Noviembre", coordinates: [11.2220, -74.1680] },
    { name: "Mamatoco", coordinates: [11.2240, -74.1840] },
    { name: "Universidad", coordinates: [11.2220, -74.1890] },
    { name: "Centro Histórico", coordinates: [11.2440, -74.2110] },
  ],
  "6": [ // Aeropuerto - Centro
    { name: "Aeropuerto Internacional", coordinates: [11.1195, -74.2315] },
    { name: "Vía Ciénaga", coordinates: [11.1350, -74.2290] },
    { name: "Irotama", coordinates: [11.1450, -74.2290] },
    { name: "Pozos Colorados", coordinates: [11.1700, -74.2260] },
    { name: "Rodadero", coordinates: [11.2030, -74.2260] },
    { name: "Centro Comercial Ocean Mall", coordinates: [11.2325, -74.1925] },
    { name: "Parque de Los Novios", coordinates: [11.2440, -74.2110] },
  ],
  "7": [ // Universidad - Rodadero
    { name: "Universidad del Magdalena", coordinates: [11.2220, -74.1890] },
    { name: "Centro Comercial Buenavista", coordinates: [11.2255, -74.1865] },
    { name: "Hospital San José", coordinates: [11.2250, -74.1950] },
    { name: "Av. Santa Rita", coordinates: [11.2385, -74.2050] },
    { name: "Parque de Los Novios", coordinates: [11.2440, -74.2110] },
    { name: "El Rodadero", coordinates: [11.2030, -74.2260] },
    { name: "Irotama", coordinates: [11.1450, -74.2290] },
  ],
  "8": [ // Universidad - Bastidas
    { name: "Universidad del Magdalena", coordinates: [11.2220, -74.1890] },
    { name: "Terminal de Transportes", coordinates: [11.2280, -74.1915] },
    { name: "Centro Histórico", coordinates: [11.2440, -74.2110] },
    { name: "Av. del Río", coordinates: [11.2465, -74.2020] },
    { name: "Bastidas Norte", coordinates: [11.2520, -74.1880] },
    { name: "Bastidas Centro", coordinates: [11.2500, -74.1850] },
  ],
  "9": [ // Los Almendros - Universidad
    { name: "Los Almendros", coordinates: [11.2520, -74.2150] },
    { name: "La Concepción", coordinates: [11.2480, -74.2120] },
    { name: "Mercado Público", coordinates: [11.2425, -74.2085] },
    { name: "Av. Libertador", coordinates: [11.2380, -74.1970] },
    { name: "Terminal de Transportes", coordinates: [11.2280, -74.1915] },
    { name: "Universidad del Magdalena", coordinates: [11.2220, -74.1890] },
  ],
  "10": [ // María Eugenia - Universidad
    { name: "María Eugenia", coordinates: [11.2280, -74.2150] },
    { name: "Villa del Carmen", coordinates: [11.2250, -74.2030] },
    { name: "Hospital San José", coordinates: [11.2250, -74.1950] },
    { name: "Terminal de Transportes", coordinates: [11.2280, -74.1915] },
    { name: "Mamatoco Centro", coordinates: [11.2240, -74.1840] },
    { name: "Universidad del Magdalena", coordinates: [11.2220, -74.1890] },
  ],
  "11": [ // Pozos Colorados - Centro
    { name: "Pozos Colorados", coordinates: [11.1700, -74.2260] },
    { name: "Terminal de Transportes", coordinates: [11.2280, -74.1915] },
    { name: "Av. Libertador", coordinates: [11.2380, -74.1970] },
    { name: "Polideportivo", coordinates: [11.2400, -74.2000] },
    { name: "Mercado Público", coordinates: [11.2425, -74.2085] },
    { name: "Centro Histórico", coordinates: [11.2440, -74.2110] },
  ],
  "12": [ // 20 de Julio - Universidad
    { name: "20 de Julio", coordinates: [11.2450, -74.2020] },
    { name: "Terminal de Transportes", coordinates: [11.2280, -74.1915] },
    { name: "Hospital San José", coordinates: [11.2250, -74.1950] },
    { name: "Mamatoco Centro", coordinates: [11.2240, -74.1840] },
    { name: "Once de Noviembre", coordinates: [11.2220, -74.1680] },
    { name: "Universidad del Magdalena", coordinates: [11.2220, -74.1890] },
  ],
};

// Centro de Santa Marta para inicializar el mapa
export const SANTA_MARTA_CENTER: [number, number] = [11.2408, -74.2100];