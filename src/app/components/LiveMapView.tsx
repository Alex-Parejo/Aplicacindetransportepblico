import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import { busRoutes } from "../data/routes";
import { routeCoordinates } from "../data/routeCoordinates";
import { Locate, Star } from "lucide-react";
import { createBusMarkerHTML } from "../utils/busMarkerHTML";
import { SearchBar } from "./SearchBar";
import { streetPaths } from "../data/streetPaths";
import { incidentStore, INCIDENT_UPDATE_EVENT, type Incident } from "../services/incidentStore";
import { touristSpots } from "../data/touristSpots";
import { cn } from "./ui/utils";

const speakText = (text: string) => {
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "es-ES";
    utterance.rate = 0.95;
    window.speechSynthesis.speak(utterance);
  }
};

interface LiveMapViewProps {
  onRouteSelect?: (routeId: string) => void;
  selectedRoute?: string | null;
}

export function LiveMapView({ onRouteSelect, selectedRoute }: LiveMapViewProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const polylinesRef = useRef<{ [key: string]: L.Polyline }>({});
  const stopMarkersRef = useRef<L.CircleMarker[]>([]);
  const vehicleMarkersRef = useRef<{ [key: string]: L.Marker }>({});
  const animationIntervalsRef = useRef<{ [key: string]: number }>({});
  const resizeObserverRef = useRef<ResizeObserver | null>(null);

  const [isTouristMode, setIsTouristMode] = useState(false);


  useEffect(() => {
    if (!mapRef.current) return;

    // Create map - centered on Santa Marta if not already created
    if (!mapInstanceRef.current) {
      const map = L.map(mapRef.current, {
        zoomControl: false,
        scrollWheelZoom: true,
        dragging: true,
        touchZoom: true,
      }).setView([11.2408, -74.1990], 13);

      // Add dark tile layer (using CartoDB Dark Matter for a premium dark look)
      L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
        subdomains: 'abcd',
        maxZoom: 20,
      }).addTo(map);

      // Add zoom controls to bottom right
      L.control.zoom({ position: 'bottomright' }).addTo(map);

      mapInstanceRef.current = map;

      // Observe map container resize to prevent grey tiles rendering
      const resizeObserver = new ResizeObserver(() => {
        map.invalidateSize();
      });
      resizeObserver.observe(mapRef.current);
      resizeObserverRef.current = resizeObserver;
    }

    const map = mapInstanceRef.current;

    // Clear existing polylines
    Object.values(polylinesRef.current).forEach(line => line.remove());
    polylinesRef.current = {};

    // Clear existing stop markers
    stopMarkersRef.current.forEach(marker => marker.remove());
    stopMarkersRef.current = [];

    // Clear existing animation loops
    Object.values(animationIntervalsRef.current).forEach(intervalId => clearInterval(intervalId));
    animationIntervalsRef.current = {};

    // Clear existing vehicle markers if they are not in the new state, otherwise we reuse them
    const newVehicleMarkers: { [key: string]: L.Marker } = {};

    // Draw routes, stops and vehicles
    busRoutes.forEach((route) => {
      const coordinates = routeCoordinates[route.id];
      if (!coordinates || coordinates.length === 0) return;

      const pathPoints = streetPaths[route.id] || coordinates.map((s) => s.coordinates);
      if (pathPoints.length === 0) return;

      const isActive = selectedRoute === route.id;

      // Draw route line along the streets using pathPoints
      const polyline = L.polyline(pathPoints, {
        color: isActive ? route.color : 'rgba(255, 255, 255, 0.15)',
        weight: isActive ? 4 : 2,
        opacity: isActive ? 0.9 : 0.4,
        smoothFactor: 1.2,
      }).addTo(map);

      polylinesRef.current[route.id] = polyline;

      // Add stop markers (only for actual stops, skip turns with empty name)
      const actualStops = coordinates.filter((s) => s.name !== "");
      actualStops.forEach((stop, index) => {
        const isRouteTerminal = index === 0 || index === actualStops.length - 1;
        const stopMarker = L.circleMarker([stop.coordinates[0], stop.coordinates[1]], {
          radius: isActive ? (isRouteTerminal ? 7 : 5) : 3,
          fillColor: isActive ? (index === 0 ? '#00E5A0' : index === actualStops.length - 1 ? '#FF6B6B' : route.color) : 'rgba(139, 143, 168, 0.4)',
          color: '#F0F2FF',
          weight: isActive ? 2 : 1,
          opacity: isActive ? 1 : 0.3,
          fillOpacity: isActive ? 1 : 0.3,
        }).addTo(map);

        if (isActive) {
          stopMarker.bindPopup(`
            <div style="font-family: var(--font-body); color: #F0F2FF; padding: 4px;">
              <strong style="color: ${route.color}; font-family: var(--font-display); font-size: 13px;">
                Parada #${index + 1}
              </strong>
              <p style="margin: 4px 0 0 0; font-size: 12px; font-weight: 600;">${stop.name}</p>
            </div>
          `);
        }

        stopMarkersRef.current.push(stopMarker);
      });

      // Create vehicle marker
      const busIcon = L.divIcon({
        className: "custom-bus-marker-wrapper",
        html: createBusMarkerHTML(
          isActive ? route.color : "rgba(139, 143, 168, 0.8)",
          0,
          "moving",
          route.number
        ),
        iconSize: [42, 42],
        iconAnchor: [21, 21],
      });

      // Create or reuse vehicle marker
      let busMarker = vehicleMarkersRef.current[route.id];
      if (busMarker) {
        busMarker.addTo(map);
        busMarker.setIcon(busIcon);
      } else {
        busMarker = L.marker(
          [coordinates[0].coordinates[0], coordinates[0].coordinates[1]],
          { icon: busIcon }
        ).addTo(map);

        busMarker.on('click', () => {
          if (onRouteSelect) {
            onRouteSelect(route.id);
          }
        });
      }

      busMarker.bindPopup(`
        <div style="font-family: var(--font-body); color: #F0F2FF; min-width: 160px; padding: 4px;">
          <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 6px;">
            <div style="background-color: ${route.color}; color: white; border-radius: 6px; padding: 2px 6px; font-family: var(--font-mono); font-size: 11px; font-weight: bold;">
              ${route.number}
            </div>
            <span style="font-family: var(--font-display); font-size: 13px; font-weight: 700;">${route.name}</span>
          </div>
          <div style="font-size: 11px; color: #8B8FA8; display: grid; gap: 2px;">
            <div>Tarifa: <strong style="color: #00E5A0; font-family: var(--font-mono);">${route.fare}</strong></div>
            <div>Frecuencia: <strong>${route.frequency}</strong></div>
            <div>Próxima parada: <strong>${coordinates[1]?.name || 'N/D'}</strong></div>
          </div>
        </div>
      `);

      newVehicleMarkers[route.id] = busMarker;

      // Animate bus pathing along the street pathPoints
      let currentIndex = 0;
      const animateBus = () => {
        const nextIndex = (currentIndex + 1) % pathPoints.length;
        const current = pathPoints[currentIndex];
        const next = pathPoints[nextIndex];

        // Rotation tracking
        const deltaY = next[0] - current[0];
        const deltaX = next[1] - current[1];
        const rotation = (Math.atan2(deltaX, deltaY) * 180) / Math.PI; // Correct angle calculation for divicon transform

        let progress = 0;
        const steps = 15; // Fewer steps since path segments are much smaller
        const stepDuration = 400 / steps; // Faster transition between street path nodes

        const interpolate = setInterval(() => {
          progress += 1 / steps;
          if (progress >= 1) {
            clearInterval(interpolate);
            currentIndex = nextIndex;
            // Delay before animating to the next segment
            const timeoutId = window.setTimeout(animateBus, 500 + Math.random() * 500); // segment transitions are shorter
            animationIntervalsRef.current[`timeout-${route.id}`] = timeoutId;
            return;
          }

          // Cubic ease-out
          const ease = 1 - Math.pow(1 - progress, 3);

          const lat = current[0] + (next[0] - current[0]) * ease;
          const lng = current[1] + (next[1] - current[1]) * ease;

          busMarker.setLatLng([lat, lng]);

          if (progress === 1 / steps) {
            const icon = L.divIcon({
              className: "custom-bus-marker-wrapper",
              html: createBusMarkerHTML(
                isActive ? route.color : "rgba(139, 143, 168, 0.8)",
                rotation - 90, // adjust rotation based on marker SVG heading
                "moving",
                route.number
              ),
              iconSize: [42, 42],
              iconAnchor: [21, 21],
            });
            busMarker.setIcon(icon);
          }
        }, stepDuration);

        animationIntervalsRef.current[`interval-${route.id}`] = interpolate as unknown as number;
      };

      animateBus();
    });

    vehicleMarkersRef.current = newVehicleMarkers;

    // Zoom and pan to active route
    if (selectedRoute && mapInstanceRef.current) {
      const activeLine = polylinesRef.current[selectedRoute];
      if (activeLine) {
        mapInstanceRef.current.fitBounds(activeLine.getBounds(), {
          padding: [50, 50],
          maxZoom: 15,
          animate: true,
          duration: 1,
        });
      }
    }
  }, [selectedRoute, onRouteSelect]);

  // Render traffic incidents
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    const map = mapInstanceRef.current;
    const incidentMarkers: L.Marker[] = [];

    const drawIncidents = () => {
      incidentMarkers.forEach((m) => m.remove());
      incidentMarkers.length = 0;

      const activeIncidents = incidentStore.getIncidents();
      activeIncidents.forEach((inc) => {
        const icons: Record<Incident["type"], { color: string; text: string }> = {
          traffic: { color: "#F59E0B", text: "⚠️" },
          full: { color: "#8B5CF6", text: "👥" },
          delay: { color: "#EF4444", text: "⏱" },
          police: { color: "#3B82F6", text: "👮" },
        };
        const cfg = icons[inc.type] || { color: "#EF4444", text: "⚠️" };

        const incIcon = L.divIcon({
          html: `
            <div style="position: relative;">
              <div style="
                width: 28px;
                height: 28px;
                background: ${cfg.color};
                border: 2px solid #F0F2FF;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 14px;
                box-shadow: 0 4px 10px rgba(0,0,0,0.4);
                animation: pulse 2.5s infinite;
              ">${cfg.text}</div>
            </div>
          `,
          className: "incident-marker-wrapper",
          iconSize: [28, 28],
          iconAnchor: [14, 14],
        });

        const marker = L.marker([inc.coordinates[0], inc.coordinates[1]], { icon: incIcon })
          .addTo(map)
          .bindPopup(`
            <div style="font-family: var(--font-body); font-size: 11px; padding: 4px; color: #F0F2FF;">
              <strong style="color: ${cfg.color}; text-transform: uppercase;">Reporte de Novedad</strong>
              <p style="margin: 4px 0 0 0; font-weight: 600;">${inc.description}</p>
              ${inc.routeName ? `<p style="margin: 2px 0 0 0; font-size: 10px; color: #8B8FA8;">Ruta: ${inc.routeName}</p>` : ''}
              <button 
                id="live-like-btn-${inc.id}"
                style="
                  margin-top: 6px;
                  background: rgba(255,255,255,0.08);
                  border: 1px solid rgba(255,255,255,0.1);
                  color: #00E5A0;
                  padding: 2px 8px;
                  border-radius: 6px;
                  cursor: pointer;
                  font-size: 10px;
                  font-weight: bold;
                ">
                👍 Es útil (${inc.likes})
              </button>
            </div>
          `);

        marker.on('popupopen', () => {
          const btn = document.getElementById(`live-like-btn-${inc.id}`);
          if (btn) {
            btn.onclick = (e) => {
              e.preventDefault();
              incidentStore.likeIncident(inc.id);
              marker.closePopup();
              setTimeout(() => marker.openPopup(), 100);
            };
          }
        });

        incidentMarkers.push(marker);
      });
    };

    drawIncidents();
    window.addEventListener(INCIDENT_UPDATE_EVENT, drawIncidents);

    return () => {
      window.removeEventListener(INCIDENT_UPDATE_EVENT, drawIncidents);
      incidentMarkers.forEach((m) => m.remove());
    };
  }, []);

  // Draw tourist spots
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    const map = mapInstanceRef.current;
    const markers: L.Marker[] = [];

    if (isTouristMode) {
      touristSpots.forEach((spot) => {
        const spotIcon = L.divIcon({
          html: `
            <div style="position: relative;">
              <div style="
                width: 30px;
                height: 30px;
                background: #D97706;
                border: 2px solid #FDF6E2;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 14px;
                box-shadow: 0 4px 12px rgba(217,119,6,0.3);
                animation: pulse 2.5s infinite;
              ">🏛️</div>
            </div>
          `,
          className: "tourist-spot-wrapper",
          iconSize: [30, 30],
          iconAnchor: [15, 15],
        });

        const marker = L.marker([spot.coordinates[0], spot.coordinates[1]], { icon: spotIcon })
          .addTo(map)
          .bindPopup(`
            <div style="font-family: var(--font-body); font-size: 11px; padding: 4px; color: #FDF6E2; max-width: 200px;">
              <strong style="color: #FBBF24; font-family: var(--font-display); font-size: 12px;">${spot.name}</strong>
              <p style="margin: 4px 0 0 0; line-height: 1.4;">${spot.description}</p>
              <button 
                id="speak-btn-${spot.id}"
                style="
                  margin-top: 8px;
                  background: rgba(251,191,36,0.1);
                  border: 1px solid rgba(251,191,36,0.25);
                  color: #FBBF24;
                  padding: 4px 10px;
                  border-radius: 8px;
                  cursor: pointer;
                  font-size: 10px;
                  font-weight: bold;
                  width: 100%;
                  text-align: center;
                ">
                🔊 Escuchar Guía
              </button>
            </div>
          `);

        marker.on('popupopen', () => {
          const btn = document.getElementById(`speak-btn-${spot.id}`);
          if (btn) {
            btn.onclick = (e) => {
              e.preventDefault();
              speakText(spot.audioText);
            };
          }
        });

        markers.push(marker);
      });
    }

    return () => {
      markers.forEach(m => m.remove());
      if (!isTouristMode && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, [isTouristMode]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      Object.values(animationIntervalsRef.current).forEach(id => {
        clearInterval(id);
        clearTimeout(id);
      });
      if (resizeObserverRef.current) {
        resizeObserverRef.current.disconnect();
      }
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  return (
    <div className="relative w-full h-full">
      {/* Map Element */}
      <div ref={mapRef} className="w-full h-full z-0" />

      {/* Floating Glassmorphic Search Bar */}
      <div className="absolute top-4 left-0 right-0 z-[1000] flex justify-center px-4 pointer-events-none">
        <div className="w-full max-w-[450px] pointer-events-auto">
          <SearchBar 
            onResultSelect={(type, id) => {
              if (type === "route" && onRouteSelect) {
                onRouteSelect(id);
              }
            }} 
          />
        </div>
      </div>

      {/* Recenter / User Location FAB */}
      <button
        aria-label="Centrar mapa en Santa Marta"
        onClick={() => {
          if (mapInstanceRef.current) {
            mapInstanceRef.current.setView([11.2408, -74.1990], 13);
          }
        }}
        className="absolute bottom-24 right-4 z-[997] w-12 h-12 rounded-xl glass-panel text-primary flex items-center justify-center shadow-glow active:scale-95 transition-transform hover:border-primary/30 pointer-events-auto focus-ring-premium"
      >
        <Locate className="w-5 h-5" aria-hidden="true" />
      </button>

      {/* Tourist Mode Toggle FAB */}
      <button
        aria-label="Alternar Modo Turístico"
        onClick={() => setIsTouristMode(!isTouristMode)}
        className={cn(
          "absolute bottom-40 right-4 z-[997] w-12 h-12 rounded-xl glass-panel flex items-center justify-center shadow-glow active:scale-95 transition-transform pointer-events-auto focus-ring-premium",
          isTouristMode ? "text-amber-400 border border-amber-500/35" : "text-[#8B8FA8]"
        )}
      >
        <Star className={cn("w-5 h-5", isTouristMode ? "fill-amber-400" : "")} aria-hidden="true" />
      </button>
    </div>
  );
}
