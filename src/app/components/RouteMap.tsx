import { useEffect, useRef, useState } from "react";
import { routeCoordinates } from "../data/routeCoordinates";
import { MapPin, Navigation } from "lucide-react";
import L from "leaflet";

interface RouteMapProps {
  routeId: string;
  routeColor: string;
  routeName: string;
}

export function RouteMap({ routeId, routeColor, routeName }: RouteMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const coordinates = routeCoordinates[routeId];

  useEffect(() => {
    if (!mapRef.current || !coordinates || coordinates.length === 0) return;

    // Limpiar mapa existente si hay uno
    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
    }

    // Crear el mapa
    const map = L.map(mapRef.current, {
      zoomControl: true,
      scrollWheelZoom: true,
      dragging: true,
      touchZoom: true,
    });

    mapInstanceRef.current = map;

    // Agregar capa de OpenStreetMap
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 19,
    }).addTo(map);

    // Dibujar la ruta conectando los paraderos
    const drawRoute = () => {
      const latLngs: L.LatLngExpression[] = coordinates.map((stop) => [
        stop.coordinates[0],
        stop.coordinates[1],
      ]);

      const polyline = L.polyline(latLngs, {
        color: routeColor,
        weight: 5,
        opacity: 0.8,
        smoothFactor: 1,
      }).addTo(map);

      map.fitBounds(polyline.getBounds(), {
        padding: [50, 50],
      });
    };

    // Crear icono personalizado para los marcadores
    const createNumberIcon = (number: number, color: string, isFirst: boolean, isLast: boolean) => {
      let markerColor = color;
      if (isFirst) markerColor = "#10B981"; // Verde para origen
      if (isLast) markerColor = "#EF4444"; // Rojo para destino

      return L.divIcon({
        className: "custom-marker",
        html: `
          <div style="
            width: 32px;
            height: 32px;
            background-color: ${markerColor};
            border: 3px solid white;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-weight: bold;
            font-size: 14px;
            box-shadow: 0 2px 5px rgba(0,0,0,0.3);
          ">
            ${number}
          </div>
        `,
        iconSize: [32, 32],
        iconAnchor: [16, 16],
      });
    };

    // Agregar marcadores para cada paradero
    coordinates.forEach((stop, index) => {
      const isFirst = index === 0;
      const isLast = index === coordinates.length - 1;
      
      L.marker([stop.coordinates[0], stop.coordinates[1]], {
        icon: createNumberIcon(index + 1, routeColor, isFirst, isLast),
      })
        .addTo(map)
        .bindPopup(`
          <div style="font-family: Arial, sans-serif;">
            <strong style="color: ${routeColor};">Parada #${index + 1}</strong><br/>
            ${stop.name}
            ${isFirst ? '<br/><span style="color: #10B981; font-weight: bold;">🚏 Origen</span>' : ''}
            ${isLast ? '<br/><span style="color: #EF4444; font-weight: bold;">🏁 Destino</span>' : ''}
          </div>
        `);
    });

    // Dibujar la ruta
    drawRoute();

    // Cleanup al desmontar
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [routeId, coordinates, routeColor]);

  if (!coordinates || coordinates.length === 0) {
    return (
      <div className="h-96 bg-gray-100 rounded-lg flex items-center justify-center">
        <div className="text-center text-gray-500">
          <MapPin className="w-12 h-12 mx-auto mb-2 opacity-50" />
          <p>Mapa no disponible para esta ruta</p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl overflow-hidden shadow-2xl border border-border bg-card">
      {/* Encabezado del mapa */}
      <div className="bg-accent/50 border-b border-border px-5 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-primary/10 rounded-xl p-2">
            <Navigation className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="font-bold text-foreground">Mapa de Ruta Interactivo</h3>
            <p className="text-xs text-muted-foreground">OpenStreetMap</p>
          </div>
        </div>
        <span className="text-sm font-semibold text-primary bg-primary/10 px-3 py-1 rounded-full">
          {coordinates.length} paraderos
        </span>
      </div>

      {/* Mapa Leaflet */}
      <div 
        ref={mapRef} 
        className="w-full h-96 bg-muted"
        style={{ minHeight: "400px" }}
      />

      {/* Leyenda */}
      <div className="bg-accent/30 border-t border-border p-5">
        <div className="flex items-center justify-center gap-6 text-sm mb-4 flex-wrap">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-full bg-green-500 border-2 border-background shadow-lg"></div>
            <span className="text-foreground font-medium">Origen</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-full border-2 border-background shadow-lg" style={{ backgroundColor: routeColor }}></div>
            <span className="text-foreground font-medium">Paradas</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-full bg-red-500 border-2 border-background shadow-lg"></div>
            <span className="text-foreground font-medium">Destino</span>
          </div>
        </div>

        {/* Lista compacta de paraderos */}
        <div className="border-t border-border pt-4 mt-4">
          <h4 className="text-sm font-bold text-foreground mb-3 flex items-center gap-2">
            <MapPin className="w-4 h-4 text-primary" />
            Recorrido completo de la ruta:
          </h4>
          <div className="grid grid-cols-2 gap-2 text-sm max-h-64 overflow-y-auto">
            {coordinates.map((stop, index) => (
              <div key={index} className="flex items-center gap-2 bg-card rounded-lg p-2 border border-border hover:border-primary transition-colors">
                <div 
                  className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0 shadow-md"
                  style={{ 
                    backgroundColor: index === 0 ? "#10B981" : 
                                     index === coordinates.length - 1 ? "#EF4444" : 
                                     routeColor 
                  }}
                >
                  {index + 1}
                </div>
                <span className="text-foreground font-medium text-xs truncate">{stop.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}