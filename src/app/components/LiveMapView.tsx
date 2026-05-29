import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import { busRoutes } from "../data/routes";
import { routeCoordinates } from "../data/routeCoordinates";
import { Locate, Search, SlidersHorizontal } from "lucide-react";
import { createBusMarkerHTML } from "../utils/busMarkerHTML";

interface LiveMapViewProps {
  onRouteSelect?: (routeId: string) => void;
  selectedRoute?: string | null;
}

export function LiveMapView({ onRouteSelect, selectedRoute }: LiveMapViewProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const [vehicleMarkers, setVehicleMarkers] = useState<{ [key: string]: L.Marker }>({});

  useEffect(() => {
    if (!mapRef.current) return;

    // Cleanup existing map
    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
    }

    // Create map - centered on Santa Marta
    const map = L.map(mapRef.current, {
      zoomControl: false,
      scrollWheelZoom: true,
      dragging: true,
      touchZoom: true,
    }).setView([11.2408, -74.1990], 13);

    mapInstanceRef.current = map;

    // Add dark tile layer
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>',
      maxZoom: 19,
    }).addTo(map);

    // Add zoom controls to bottom right
    L.control.zoom({ position: 'bottomright' }).addTo(map);

    // Draw routes and vehicles
    const markers: { [key: string]: L.Marker } = {};

    busRoutes.forEach((route) => {
      const coordinates = routeCoordinates[route.id];
      if (!coordinates || coordinates.length === 0) return;

      // Draw route line
      const latLngs: L.LatLngExpression[] = coordinates.map((stop) => [
        stop.coordinates[0],
        stop.coordinates[1],
      ]);

      const isActive = selectedRoute === route.id;

      L.polyline(latLngs, {
        color: isActive ? route.color : '#4A4D60',
        weight: isActive ? 4 : 2,
        opacity: isActive ? 0.8 : 0.3,
        smoothFactor: 1,
      }).addTo(map);

      // Add stop markers
      coordinates.forEach((stop, index) => {
        const stopMarker = L.circleMarker([stop.coordinates[0], stop.coordinates[1]], {
          radius: isActive ? 6 : 4,
          fillColor: isActive ? route.color : '#4A4D60',
          color: '#F0F2FF',
          weight: isActive ? 2 : 1,
          opacity: isActive ? 1 : 0.4,
          fillOpacity: isActive ? 0.8 : 0.3,
        }).addTo(map);

        if (isActive) {
          stopMarker.bindPopup(`
            <div style="font-family: var(--font-body); color: #F0F2FF;">
              <strong style="color: ${route.color};">Parada #${index + 1}</strong><br/>
              ${stop.name}
            </div>
          `);
        }
      });

      // Create animated bus icon with rotation tracking
      let currentRotation = 0;
      let lastPosition = coordinates[0].coordinates;

      const busIcon = L.divIcon({
        className: "custom-bus-marker",
        html: createBusMarkerHTML(
          isActive ? route.color : "#8B8FA8",
          0,
          "moving",
          route.number
        ),
        iconSize: [40, 40],
        iconAnchor: [20, 20],
      });

      // Place bus at first coordinate
      const busMarker = L.marker(
        [coordinates[0].coordinates[0], coordinates[0].coordinates[1]],
        { icon: busIcon }
      ).addTo(map);

      busMarker.bindPopup(`
        <div style="font-family: var(--font-body); color: #F0F2FF;">
          <strong style="color: ${route.color};">Ruta ${route.number}</strong><br/>
          ${route.name}<br/>
          <small style="color: #8B8FA8;">ETA: ${Math.floor(Math.random() * 15) + 1} min</small>
        </div>
      `);

      busMarker.on('click', () => {
        if (onRouteSelect) {
          onRouteSelect(route.id);
        }
      });

      markers[route.id] = busMarker;

      // Animate bus movement along route with smooth interpolation and rotation
      let currentIndex = 0;
      const animateBus = () => {
        const nextIndex = (currentIndex + 1) % coordinates.length;
        const current = coordinates[currentIndex];
        const next = coordinates[nextIndex];

        // Calculate rotation angle
        const deltaY = next.coordinates[0] - current.coordinates[0];
        const deltaX = next.coordinates[1] - current.coordinates[1];
        const rotation = (Math.atan2(deltaY, deltaX) * 180) / Math.PI;

        let progress = 0;
        const steps = 20; // Number of interpolation steps
        const stepDuration = 500 / steps; // Total 500ms animation

        const interpolate = setInterval(() => {
          progress += 1 / steps;
          if (progress >= 1) {
            clearInterval(interpolate);
            currentIndex = nextIndex;
            lastPosition = [next.coordinates[0], next.coordinates[1]];
            // Random delay before next move
            setTimeout(animateBus, 3000 + Math.random() * 2000);
            return;
          }

          // Ease-in-out interpolation
          const ease = progress < 0.5
            ? 2 * progress * progress
            : 1 - Math.pow(-2 * progress + 2, 2) / 2;

          const lat = current.coordinates[0] + (next.coordinates[0] - current.coordinates[0]) * ease;
          const lng = current.coordinates[1] + (next.coordinates[1] - current.coordinates[1]) * ease;

          busMarker.setLatLng([lat, lng]);

          // Update rotation
          if (progress === 1 / steps) { // Update icon with rotation on first step
            const icon = L.divIcon({
              className: "custom-bus-marker",
              html: createBusMarkerHTML(
                isActive ? route.color : "#8B8FA8",
                rotation,
                "moving",
                route.number
              ),
              iconSize: [40, 40],
              iconAnchor: [20, 20],
            });
            busMarker.setIcon(icon);
          }
        }, stepDuration);
      };

      // Start animation
      animateBus();
    });

    setVehicleMarkers(markers);

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [selectedRoute, onRouteSelect]);

  return (
    <div className="relative w-full h-full">
      {/* Map container */}
      <div ref={mapRef} className="w-full h-full" />

      {/* Search bar overlay */}
      <div className="absolute top-4 left-4 right-4 z-[1000]">
        <div
          className="flex items-center gap-3 px-5 py-3 rounded-full backdrop-blur-md border border-border shadow-card"
          style={{
            backgroundColor: 'rgba(22, 24, 32, 0.92)',
          }}
        >
          <Search className="w-5 h-5 text-text-secondary" />
          <input
            type="text"
            placeholder="¿A dónde vas hoy?"
            className="flex-1 bg-transparent border-none outline-none text-text-primary placeholder:text-text-secondary"
            style={{ fontFamily: 'var(--font-body)' }}
          />
          <button className="p-2 rounded-full hover:bg-surface-2 transition-colors">
            <SlidersHorizontal className="w-5 h-5 text-text-secondary" />
          </button>
        </div>
      </div>

      {/* Location FAB */}
      <button
        className="absolute bottom-6 right-6 z-[1000] w-14 h-14 rounded-full bg-primary flex items-center justify-center shadow-glow hover:scale-110 transition-transform"
        onClick={() => {
          if (mapInstanceRef.current) {
            mapInstanceRef.current.setView([11.2408, -74.1990], 13);
          }
        }}
      >
        <Locate className="w-6 h-6 text-background" />
      </button>
    </div>
  );
}
