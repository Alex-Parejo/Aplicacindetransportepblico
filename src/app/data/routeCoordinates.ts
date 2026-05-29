// Coordenadas geográficas de los paraderos en Santa Marta
// Formato: [latitud, longitud]

export interface StopCoordinate {
  name: string;
  coordinates: [number, number];
}

export const routeCoordinates: Record<string, StopCoordinate[]> = {
  "1": [ // Centro - Rodadero
    { name: "Terminal de Transportes", coordinates: [11.2280, -74.1970] },
    { name: "Parque de Los Novios", coordinates: [11.2440, -74.2110] },
    { name: "Av. Santa Rita", coordinates: [11.2385, -74.2050] },
    { name: "Centro Comercial Buenavista", coordinates: [11.2320, -74.1980] },
    { name: "Irotama", coordinates: [11.2150, -74.2180] },
    { name: "Rodadero", coordinates: [11.2050, -74.2280] },
  ],
  "2": [ // Mamatoco - Gaira
    { name: "Mamatoco Centro", coordinates: [11.2150, -74.1850] },
    { name: "Universidad del Magdalena", coordinates: [11.2195, -74.1890] },
    { name: "Centro Histórico", coordinates: [11.2440, -74.2110] },
    { name: "Av. Libertador", coordinates: [11.2380, -74.2000] },
    { name: "Pozos Colorados", coordinates: [11.2500, -74.1950] },
    { name: "Gaira Pueblo", coordinates: [11.2620, -74.1820] },
  ],
  "3": [ // Taganga Express
    { name: "Parque de Los Novios", coordinates: [11.2440, -74.2110] },
    { name: "Av. del Río", coordinates: [11.2465, -74.2020] },
    { name: "Bastidas", coordinates: [11.2550, -74.1950] },
    { name: "Entrada Taganga", coordinates: [11.2630, -74.1880] },
    { name: "Taganga Playa", coordinates: [11.2685, -74.1850] },
  ],
  "4": [ // Circular Centro
    { name: "Terminal de Transportes", coordinates: [11.2280, -74.1970] },
    { name: "Mercado Público", coordinates: [11.2420, -74.2080] },
    { name: "Catedral", coordinates: [11.2448, -74.2115] },
    { name: "Parque Simón Bolívar", coordinates: [11.2455, -74.2095] },
    { name: "Camellón", coordinates: [11.2465, -74.2125] },
    { name: "Quinta de San Pedro", coordinates: [11.2350, -74.2050] },
    { name: "Terminal de Transportes", coordinates: [11.2280, -74.1970] },
  ],
  "5": [ // Bonda - Centro
    { name: "Bonda Entrada", coordinates: [11.1950, -74.1350] },
    { name: "Minca Vía", coordinates: [11.2050, -74.1550] },
    { name: "Quebrada del Doctor", coordinates: [11.2120, -74.1720] },
    { name: "Mamatoco", coordinates: [11.2150, -74.1850] },
    { name: "Universidad", coordinates: [11.2195, -74.1890] },
    { name: "Centro Histórico", coordinates: [11.2440, -74.2110] },
  ],
  "6": [ // Aeropuerto - Centro
    { name: "Aeropuerto Internacional", coordinates: [11.1195, -74.2315] },
    { name: "Vía Ciénaga", coordinates: [11.1480, -74.2250] },
    { name: "Parque del Amor", coordinates: [11.1780, -74.2200] },
    { name: "Centro Comercial Ocean Mall", coordinates: [11.1950, -74.2220] },
    { name: "Rodadero", coordinates: [11.2050, -74.2280] },
    { name: "Irotama", coordinates: [11.2150, -74.2180] },
    { name: "Parque de Los Novios", coordinates: [11.2440, -74.2110] },
  ],
  "7": [ // Universidad - Rodadero
    { name: "Universidad del Magdalena", coordinates: [11.2195, -74.1890] },
    { name: "Hospital San José", coordinates: [11.2250, -74.1950] },
    { name: "Parque de Los Novios", coordinates: [11.2440, -74.2110] },
    { name: "Av. Santa Rita", coordinates: [11.2385, -74.2050] },
    { name: "Centro Comercial Buenavista", coordinates: [11.2320, -74.1980] },
    { name: "Irotama", coordinates: [11.2150, -74.2180] },
    { name: "El Rodadero", coordinates: [11.2050, -74.2280] },
  ],
  "8": [ // Universidad - Bastidas
    { name: "Universidad del Magdalena", coordinates: [11.2195, -74.1890] },
    { name: "Terminal de Transportes", coordinates: [11.2280, -74.1970] },
    { name: "Centro Histórico", coordinates: [11.2440, -74.2110] },
    { name: "Av. del Río", coordinates: [11.2465, -74.2020] },
    { name: "Bastidas Norte", coordinates: [11.2530, -74.1970] },
    { name: "Bastidas Centro", coordinates: [11.2550, -74.1950] },
  ],
  "9": [ // Los Almendros - Universidad
    { name: "Los Almendros", coordinates: [11.2520, -74.2150] },
    { name: "La Concepción", coordinates: [11.2480, -74.2120] },
    { name: "Once de Noviembre", coordinates: [11.2420, -74.2050] },
    { name: "Mercado Público", coordinates: [11.2420, -74.2080] },
    { name: "Terminal de Transportes", coordinates: [11.2280, -74.1970] },
    { name: "Universidad del Magdalena", coordinates: [11.2195, -74.1890] },
  ],
  "10": [ // María Eugenia - Universidad
    { name: "María Eugenia", coordinates: [11.2080, -74.1750] },
    { name: "Villa del Carmen", coordinates: [11.2100, -74.1780] },
    { name: "Don Jaca", coordinates: [11.2120, -74.1820] },
    { name: "Mamatoco Centro", coordinates: [11.2150, -74.1850] },
    { name: "Hospital San José", coordinates: [11.2250, -74.1950] },
    { name: "Universidad del Magdalena", coordinates: [11.2195, -74.1890] },
  ],
  "11": [ // Pozos Colorados - Centro
    { name: "Pozos Colorados", coordinates: [11.2500, -74.1950] },
    { name: "Polideportivo", coordinates: [11.2450, -74.1980] },
    { name: "Av. Libertador", coordinates: [11.2380, -74.2000] },
    { name: "Terminal de Transportes", coordinates: [11.2280, -74.1970] },
    { name: "Mercado Público", coordinates: [11.2420, -74.2080] },
    { name: "Centro Histórico", coordinates: [11.2440, -74.2110] },
  ],
  "12": [ // 20 de Julio - Universidad
    { name: "20 de Julio", coordinates: [11.2380, -74.2180] },
    { name: "Once de Noviembre", coordinates: [11.2420, -74.2050] },
    { name: "Terminal de Transportes", coordinates: [11.2280, -74.1970] },
    { name: "Hospital San José", coordinates: [11.2250, -74.1950] },
    { name: "Mamatoco Centro", coordinates: [11.2150, -74.1850] },
    { name: "Universidad del Magdalena", coordinates: [11.2195, -74.1890] },
  ],
};

// Centro de Santa Marta para inicializar el mapa
export const SANTA_MARTA_CENTER: [number, number] = [11.2408, -74.2100];