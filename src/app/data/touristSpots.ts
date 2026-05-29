export interface TouristSpot {
  id: string;
  name: string;
  description: string;
  coordinates: [number, number];
  audioText: string;
}

export const touristSpots: TouristSpot[] = [
  {
    id: "catedral",
    name: "Catedral Basílica de Santa Marta",
    description: "La iglesia más antigua de Colombia, construida a partir de 1765.",
    coordinates: [11.2442, -74.2118],
    audioText: "Estás cerca de la Catedral Basílica de Santa Marta, la iglesia más antigua de Colombia y el lugar donde descansaron temporalmente los restos del libertador Simón Bolívar.",
  },
  {
    id: "quinta-san-pedro",
    name: "Quinta de San Pedro Alejandrino",
    description: "Hacienda histórica donde falleció el libertador Simón Bolívar en 1830.",
    coordinates: [11.2265, -74.1885],
    audioText: "Estás pasando por la Quinta de San Pedro Alejandrino, una hacienda histórica fundada en 1608, famosa por ser el lugar de fallecimiento del libertador Simón Bolívar el 17 de diciembre de 1830.",
  },
  {
    id: "parque-novios",
    name: "Parque de Los Novios",
    description: "Plaza histórica central de Santa Marta, rodeada de arquitectura colonial.",
    coordinates: [11.2435, -74.2112],
    audioText: "Estás cerca del Parque de los Novios, corazón de la vida social y cultural del Centro Histórico, rodeado de hermosas casas coloniales y restaurantes locales.",
  },
  {
    id: "camellon",
    name: "Camellón de la Bahía",
    description: "Paseo marítimo frente a la bahía de Santa Marta con vista al Morro.",
    coordinates: [11.2450, -74.2128],
    audioText: "Estás circulando cerca del Camellón de la Bahía, un hermoso paseo peatonal costero renovado con monumentos dedicados a la herencia indígena de la región y vista directa al icónico Morro.",
  },
  {
    id: "deidad-tayrona",
    name: "Monumento a la Deidad Tayrona",
    description: "Estatua representativa de los indígenas Tayrona en El Rodadero.",
    coordinates: [11.2015, -74.2252],
    audioText: "Estás en el sector del Rodadero, cerca del Monumento a la Deidad Tayrona, una escultura en bronce que rinde homenaje a los sabios ancestros de la Sierra Nevada de Santa Marta.",
  },
  {
    id: "mirador-ziruma",
    name: "Mirador del Ziruma",
    description: "Punto panorámico en el cerro del Ziruma que conecta el Centro y el Rodadero.",
    coordinates: [11.2230, -74.2150],
    audioText: "Estás ascendiendo por el Cerro del Ziruma, pasando por su famoso mirador de senderos peatonales, que ofrece una de las vistas panorámicas más espectaculares de la bahía y la ciudad.",
  },
  {
    id: "bahia-taganga",
    name: "Mirador y Bahía de Taganga",
    description: "Tradicional corregimiento pesquero samario rodeado de montañas frente al mar.",
    coordinates: [11.2655, -74.1905],
    audioText: "Estás llegando a Taganga, un pintoresco pueblo de pescadores rodeado de cerros y aguas tranquilas, ideal para contemplar inolvidables atardeceres sobre el Mar Caribe.",
  },
];
