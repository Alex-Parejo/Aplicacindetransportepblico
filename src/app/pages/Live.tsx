import { useState, useEffect, useRef } from "react";
import { MapPin, Navigation, AlertCircle, Loader2, Bus, Clock, MapPinned, Compass } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Link } from "react-router";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { api, type UserProfile } from "../services/api";
import { type BusRoute } from "../data/routes";
import { routeCoordinates } from "../data/routeCoordinates";
import { type LiveBus } from "../data/liveData";
import { cn } from "../components/ui/utils";

// User current position marker icon
const userLocationIcon = L.divIcon({
  html: `
    <div style="position: relative;">
      <div style="
        width: 18px;
        height: 18px;
        background: #4F8EF7;
        border: 3px solid #F0F2FF;
        border-radius: 50%;
        box-shadow: 0 0 16px rgba(79, 142, 247, 0.6);
      "></div>
      <div style="
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        width: 36px;
        height: 36px;
        background: rgba(79, 142, 247, 0.2);
        border-radius: 50%;
        animation: pulse 2.5s infinite;
      "></div>
    </div>
  `,
  className: "user-location-marker",
  iconSize: [18, 18],
  iconAnchor: [9, 9],
});

interface NearbyRoute {
  route: BusRoute;
  nearestStop: string;
  distance: number;
}

export function Live() {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const userMarkerRef = useRef<L.Marker | null>(null);
  const userCircleRef = useRef<L.Circle | null>(null);
  const stopsMarkersRef = useRef<L.Marker[]>([]);
  const busMarkersRef = useRef<L.Marker[]>([]);
  const resizeObserverRef = useRef<ResizeObserver | null>(null);

  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [nearbyRoutes, setNearbyRoutes] = useState<NearbyRoute[]>([]);
  const [locationEnabled, setLocationEnabled] = useState(false);
  const [liveBuses, setLiveBuses] = useState<LiveBus[]>([]);
  const [routes, setRoutes] = useState<BusRoute[]>([]);

  // Load routes
  useEffect(() => {
    async function loadRoutes() {
      try {
        const data = await api.getRoutes();
        setRoutes(data);
      } catch (err) {
        console.error("Error loading routes:", err);
      }
    }
    loadRoutes();
  }, []);

  // Distance calculation helper (Haversine)
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371; 
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  // Find routes near user GPS coordinates
  const findNearbyRoutes = (location: { lat: number; lng: number }, routesList: BusRoute[]) => {
    const nearby: NearbyRoute[] = [];

    routesList.forEach((route) => {
      const routeStops = routeCoordinates[route.id];
      if (!routeStops) return;

      let nearestDistance = Infinity;
      let nearestStopName = "";

      routeStops.forEach((stop) => {
        const distance = calculateDistance(
          location.lat,
          location.lng,
          stop.coordinates[0],
          stop.coordinates[1]
        );

        if (distance < nearestDistance) {
          nearestDistance = distance;
          nearestStopName = stop.name;
        }
      });

      // Filter within 2.5 kilometers
      if (nearestDistance < 2.5) {
        nearby.push({
          route,
          nearestStop: nearestStopName,
          distance: nearestDistance,
        });
      }
    });

    nearby.sort((a, b) => a.distance - b.distance);
    setNearbyRoutes(nearby);
  };

  // Geolocation trigger
  const getUserLocation = () => {
    setLoading(true);
    setError(null);

    if (!navigator.geolocation) {
      setError("Tu navegador no soporta geolocalización.");
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const location = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        setUserLocation(location);
        setLocationEnabled(true);
        if (routes.length > 0) {
          findNearbyRoutes(location, routes);
        }
        setLoading(false);
      },
      (err) => {
        setError("Acceso denegado al GPS. Por favor, habilita los permisos de ubicación.");
        setLoading(false);
        console.error(err);
      },
      {
        enableHighAccuracy: true,
        timeout: 8000,
        maximumAge: 0,
      }
    );
  };

  // Watch location
  useEffect(() => {
    if (!locationEnabled || !userLocation || routes.length === 0) return;

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        const location = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        setUserLocation(location);
        findNearbyRoutes(location, routes);
      },
      (err) => {
        console.error("Error watching location:", err);
      },
      {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0,
      }
    );

    return () => {
      navigator.geolocation.clearWatch(watchId);
    };
  }, [locationEnabled, routes]);

  // Load and update live buses
  useEffect(() => {
    async function loadLiveBuses() {
      try {
        const data = await api.getLiveBuses();
        setLiveBuses(data);
      } catch (err) {
        console.error("Error loading live buses:", err);
      }
    }
    
    loadLiveBuses();
    const interval = setInterval(loadLiveBuses, 6000);
    return () => clearInterval(interval);
  }, []);

  // Map initialization
  useEffect(() => {
    if (!mapRef.current || !userLocation) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapRef.current, {
        zoomControl: false,
        scrollWheelZoom: true,
        dragging: true,
        touchZoom: true,
      }).setView([userLocation.lat, userLocation.lng], 15);

      L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
        attribution: '&copy; CartoDB',
        maxZoom: 20,
      }).addTo(map);

      // Add zoom controls to top right
      L.control.zoom({ position: 'topright' }).addTo(map);

      mapInstanceRef.current = map;

      const resizeObserver = new ResizeObserver(() => {
        map.invalidateSize();
      });
      resizeObserver.observe(mapRef.current);
      resizeObserverRef.current = resizeObserver;
    }
  }, [userLocation]);

  // Update user location marker & circle
  useEffect(() => {
    if (!mapInstanceRef.current || !userLocation) return;
    const map = mapInstanceRef.current;

    // Recenter
    map.setView([userLocation.lat, userLocation.lng]);

    // User location icon
    const userLocIcon = L.divIcon({
      html: `
        <div style="position: relative;">
          <div style="
            width: 18px;
            height: 18px;
            background: #4F8EF7;
            border: 3px solid #F0F2FF;
            border-radius: 50%;
            box-shadow: 0 0 16px rgba(79, 142, 247, 0.6);
          "></div>
          <div style="
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            width: 36px;
            height: 36px;
            background: rgba(79, 142, 247, 0.2);
            border-radius: 50%;
            animation: pulse 2.5s infinite;
          "></div>
        </div>
      `,
      className: "user-location-marker",
      iconSize: [18, 18],
      iconAnchor: [9, 9],
    });

    if (userMarkerRef.current) {
      userMarkerRef.current.setLatLng([userLocation.lat, userLocation.lng]);
    } else {
      userMarkerRef.current = L.marker([userLocation.lat, userLocation.lng], { icon: userLocIcon })
        .addTo(map)
        .bindPopup(`
          <div style="text-align: center; font-family: var(--font-body); font-size: 11px;">
            <strong>Tu posición actual</strong>
          </div>
        `);
    }

    if (userCircleRef.current) {
      userCircleRef.current.setLatLng([userLocation.lat, userLocation.lng]);
    } else {
      userCircleRef.current = L.circle([userLocation.lat, userLocation.lng], {
        radius: 1000,
        fillColor: "#4F8EF7",
        fillOpacity: 0.05,
        color: "#4F8EF7",
        weight: 1.5,
        opacity: 0.4,
      }).addTo(map);
    }
  }, [userLocation]);

  // Draw nearby stops
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    const map = mapInstanceRef.current;

    // Clear old stops markers
    stopsMarkersRef.current.forEach((m) => m.remove());
    stopsMarkersRef.current = [];

    nearbyRoutes.forEach((nearby) => {
      const routeStops = routeCoordinates[nearby.route.id];
      if (!routeStops) return;

      routeStops.forEach((stop) => {
        const marker = L.marker([stop.coordinates[0], stop.coordinates[1]])
          .addTo(map)
          .bindPopup(`
            <div style="font-family: var(--font-body); font-size: 11px; padding: 4px;">
              <strong>${stop.name}</strong>
              <p style="color: ${nearby.route.color}; font-weight: bold; margin: 4px 0 0 0;">
                Ruta ${nearby.route.number}: ${nearby.route.name}
              </p>
            </div>
          `);
        stopsMarkersRef.current.push(marker);
      });
    });
  }, [nearbyRoutes]);

  // Update live buses on the map
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    const map = mapInstanceRef.current;

    // Clear old bus markers
    busMarkersRef.current.forEach((m) => m.remove());
    busMarkersRef.current = [];

    liveBuses.forEach((bus) => {
      const busIcon = L.divIcon({
        html: `
          <div style="
            width: 32px;
            height: 32px;
            background: ${bus.routeColor};
            border: 2px solid white;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: bold;
            font-size: 11px;
            color: white;
            box-shadow: 0 4px 12px rgba(0,0,0,0.5);
            font-family: var(--font-mono);
          ">${bus.routeNumber}</div>
        `,
        className: "bus-marker-live",
        iconSize: [32, 32],
        iconAnchor: [16, 16],
      });

      const marker = L.marker([bus.coordinates[0], bus.coordinates[1]], { icon: busIcon })
        .addTo(map)
        .bindPopup(`
          <div style="font-family: var(--font-body); font-size: 11px; min-width: 160px; color: #F0F2FF; padding: 4px;">
            <p style="font-weight: bold; color: ${bus.routeColor}; font-size: 12px; margin: 0 0 4px 0;">
              🚌 Buseta Ruta ${bus.routeNumber}
            </p>
            <div style="display: grid; gap: 2px; color: #8B8FA8;">
              <div>Velocidad: <strong style="color: #F0F2FF">${bus.speed} km/h</strong></div>
              <div>Ocupación: <strong style="color: #F0F2FF">${bus.passengerCount}/${bus.capacity} pax</strong></div>
              <div style="color: #00E5A0; font-weight: bold; margin-top: 4px;">⏱ Llego en ${bus.estimatedArrival} min</div>
            </div>
          </div>
        `);
      busMarkersRef.current.push(marker);
    });
  }, [liveBuses]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
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
    <div className="pb-24 max-w-2xl mx-auto space-y-6 select-none">
      {/* Title Header */}
      <motion.div
        initial={{ opacity: 0, y: -15 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden border border-white/5 p-6 rounded-3xl glass-panel"
      >
        <div className="absolute -right-24 -top-24 w-48 h-48 rounded-full bg-gradient-to-br from-[#4F8EF7]/20 to-[#00E5A0]/20 blur-[100px]" />
        
        <div className="relative z-10 space-y-2">
          <div className="flex items-center gap-2 text-primary">
            <Compass className="w-5 h-5" />
            <h1 className="text-xl md:text-2xl font-extrabold text-[#F0F2FF] font-display leading-none">
              GPS En Vivo
            </h1>
          </div>
          <p className="text-xs text-[#8B8FA8] font-sans">
            Rastrea las busetas en movimiento en tiempo real y encuentra las paradas y rutas más cercanas a tu ubicación.
          </p>
        </div>
      </motion.div>

      {/* Geolocation permissions prompt */}
      {!locationEnabled && (
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="rounded-3xl border border-white/5 p-8 text-center glass-panel space-y-6"
        >
          <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mx-auto border border-white/5 text-[#4F8EF7]">
            <MapPinned className="w-8 h-8 opacity-45 animate-pulse" />
          </div>
          <div className="space-y-2 max-w-sm mx-auto">
            <h2 className="text-base font-bold text-[#F0F2FF] font-display">Localizar en el mapa</h2>
            <p className="text-xs text-[#8B8FA8] font-sans">
              Para mostrarte las busetas y paraderos más cercanos a ti, necesitamos acceso a la ubicación de tu dispositivo.
            </p>
          </div>
          <button
            onClick={getUserLocation}
            disabled={loading}
            className="w-full max-w-[240px] py-3 bg-[#4F8EF7] text-white rounded-xl font-bold transition-all shadow-glow flex items-center justify-center gap-2 focus-ring-premium mx-auto"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Localizando…</span>
              </>
            ) : (
              <>
                <Navigation className="w-4 h-4 fill-white" />
                <span>Activar GPS</span>
              </>
            )}
          </button>
        </motion.div>
      )}

      {/* Error notification alert */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-destructive/10 border border-destructive/20 rounded-2xl p-4 flex items-start gap-3 text-xs"
          >
            <AlertCircle className="w-4.5 h-4.5 text-destructive flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-destructive">Error de Localización</p>
              <p className="text-destructive/80 mt-1 font-sans">{error}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Live Map Area */}
      {userLocation && (
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="rounded-3xl overflow-hidden border border-white/5 shadow-2xl h-[360px] relative z-0"
        >
          <div ref={mapRef} className="w-full h-full" />

          {/* Floating zoom/recenter overlay button */}
          <button
            onClick={getUserLocation}
            aria-label="Re-centrar en mi posición"
            className="absolute top-4 right-4 z-[997] p-2.5 bg-card border border-white/5 rounded-xl shadow-lg hover:bg-white/10 active:scale-95 transition-all text-primary focus-ring-premium"
          >
            <Navigation className="w-5 h-5 fill-primary/10" />
          </button>
        </motion.div>
      )}

      {/* Near Routes Panel list */}
      {userLocation && nearbyRoutes.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-3.5"
        >
          <div className="flex items-center gap-2 px-1">
            <Bus className="w-4 h-4 text-primary" />
            <h2 className="text-sm font-bold uppercase tracking-wider text-[#8B8FA8] font-display">
              Rutas En Tu Cobertura (1km)
            </h2>
          </div>

          <div className="grid gap-3">
            {nearbyRoutes.map((nearby, idx) => (
              <motion.div
                key={nearby.route.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
              >
                <Link to={`/route/${nearby.route.id}`} className="block focus-ring-premium rounded-2xl">
                  <div className="p-4 rounded-2xl border border-white/5 glass-panel flex items-center gap-4 hover:border-white/10 transition-colors">
                    {/* Badge */}
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center font-bold text-white shadow-md text-sm font-mono flex-shrink-0"
                      style={{ backgroundColor: nearby.route.color }}
                    >
                      {nearby.route.number}
                    </div>

                    {/* Details */}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-bold text-[#F0F2FF] truncate font-display">
                        {nearby.route.name}
                      </h3>
                      <div className="flex items-center gap-1.5 text-xs text-[#8B8FA8] mt-1 font-sans truncate">
                        <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
                        <span className="truncate">Parada más cercana: {nearby.nearestStop}</span>
                      </div>
                      
                      <div className="flex items-center gap-3 mt-2 text-[10px] font-mono">
                        <span className="text-primary font-bold">
                          Distancia: {nearby.distance < 0.1 ? "< 100m" : `${nearby.distance.toFixed(2)} km`}
                        </span>
                        <span className="text-[#8B8FA8]">⏱ Frecuencia: {nearby.route.frequency}</span>
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* No routes near */}
      {userLocation && nearbyRoutes.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12 rounded-3xl border border-white/5 glass-panel space-y-3"
        >
          <div className="w-12 h-12 rounded-full bg-white/5 border border-white/5 flex items-center justify-center mx-auto text-[#8B8FA8]">
            <Bus className="w-6 h-6 opacity-40 animate-pulse" />
          </div>
          <h3 className="text-sm font-bold text-[#F0F2FF] font-display">No hay rutas en tu radio</h3>
          <p className="text-xs text-[#8B8FA8] font-sans max-w-xs mx-auto">
            No se detectaron paraderos de buses dentro de 2 km a la redonda de tu posición GPS.
          </p>
        </motion.div>
      )}
    </div>
  );
}