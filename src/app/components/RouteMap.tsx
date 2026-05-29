import { useEffect, useRef } from "react";
import { routeCoordinates } from "../data/routeCoordinates";
import { streetPaths } from "../data/streetPaths";
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

    // Clean up existing map
    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
    }

    // Create Leaflet map centered on Santa Marta route
    const map = L.map(mapRef.current, {
      zoomControl: false, // Turn off default zoom to reposition it nicely
      scrollWheelZoom: true,
      dragging: true,
      touchZoom: true,
    });

    mapInstanceRef.current = map;

    // Add CartoDB Dark Matter tile layer
    L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
      attribution: '&copy; CartoDB',
      maxZoom: 20,
    }).addTo(map);

    // Add zoom controls to top right
    L.control.zoom({ position: 'topright' }).addTo(map);

    // Draw active polyline route path
    const pathPoints = streetPaths[routeId] || coordinates.map((stop) => stop.coordinates);
    const latLngs: L.LatLngExpression[] = pathPoints.map((coord) => [
      coord[0],
      coord[1],
    ]);

    const polyline = L.polyline(latLngs, {
      color: routeColor,
      weight: 4,
      opacity: 0.9,
      smoothFactor: 1.2,
    }).addTo(map);

    // Fit map bounds to show entire route path
    map.fitBounds(polyline.getBounds(), {
      padding: [30, 30],
    });

    // Observe size updates to recalculate layout and invalidate grey tile bugs
    const resizeObserver = new ResizeObserver(() => {
      map.invalidateSize();
      if (polyline) {
        map.fitBounds(polyline.getBounds(), {
          padding: [30, 30],
          animate: false
        });
      }
    });

    if (mapRef.current) {
      resizeObserver.observe(mapRef.current);
    }

    // Create custom marker icon builder
    const createNumberIcon = (number: number, color: string, isFirst: boolean, isLast: boolean) => {
      let markerColor = color;
      if (isFirst) markerColor = "#00E5A0"; // Green for origin
      if (isLast) markerColor = "#FF6B6B"; // Red for destination

      return L.divIcon({
        className: "route-stop-node",
        html: `
          <div style="
            width: 24px;
            height: 24px;
            background-color: ${markerColor};
            border: 2px solid white;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-weight: 800;
            font-size: 10px;
            box-shadow: 0 4px 10px rgba(0,0,0,0.4);
            font-family: var(--font-mono);
          ">
            ${isFirst ? '🚏' : isLast ? '🏁' : number}
          </div>
        `,
        iconSize: [24, 24],
        iconAnchor: [12, 12],
      });
    };

    // Add stop markers (only for actual stops, skip turns with empty name)
    const actualStops = coordinates.filter(stop => stop.name !== "");
    actualStops.forEach((stop, index) => {
      const isFirst = index === 0;
      const isLast = index === actualStops.length - 1;
      
      L.marker([stop.coordinates[0], stop.coordinates[1]], {
        icon: createNumberIcon(index + 1, routeColor, isFirst, isLast),
      })
        .addTo(map)
        .bindPopup(`
          <div style="font-family: var(--font-body); color: #F0F2FF; padding: 4px;">
            <strong style="color: ${routeColor}; font-family: var(--font-display); font-size: 13px;">Parada #${index + 1}</strong>
            <p style="margin: 4px 0 0 0; font-size: 12px; font-weight: 600;">${stop.name}</p>
            ${isFirst ? '<span style="color: #00E5A0; font-size: 10px; font-weight: bold;">🚏 Punto de Origen</span>' : ''}
            ${isLast ? '<span style="color: #FF6B6B; font-size: 10px; font-weight: bold;">🏁 Destino Final</span>' : ''}
          </div>
        `);
    });

    // Cleanup map on unmount
    return () => {
      resizeObserver.disconnect();
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [routeId, coordinates, routeColor]);

  if (!coordinates || coordinates.length === 0) {
    return (
      <div className="w-full h-full bg-white/5 flex items-center justify-center text-center p-6 border border-white/5 rounded-2xl">
        <div className="space-y-1.5">
          <p className="text-xs font-bold text-[#F0F2FF] font-display">Mapa no disponible</p>
          <p className="text-[10px] text-[#8B8FA8] font-sans">No hay coordenadas cargadas para esta ruta.</p>
        </div>
      </div>
    );
  }

  return (
    <div ref={mapRef} className="w-full h-full bg-[#0D0F14]" />
  );
}