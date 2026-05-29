import { useState, useEffect } from "react";
import { MapPin, Navigation, AlertCircle, Loader2, Bus, Clock, MapPinned, Users } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Link } from "react-router";
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { busRoutes } from "../data/routes";
import { routeCoordinates } from "../data/routeCoordinates";
import { generateLiveBuses, type LiveBus } from "../data/liveData";

// Fix Leaflet default marker icon issue
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

interface UserLocation {
  lat: number;
  lng: number;
}

interface NearbyRoute {
  route: typeof busRoutes[0];
  nearestStop: string;
  distance: number;
}

// Component to recenter map when location changes
function MapRecenter({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, 15);
  }, [center, map]);
  return null;
}

// Custom user location icon
const userLocationIcon = new L.DivIcon({
  html: `
    <div style="position: relative;">
      <div style="
        width: 20px;
        height: 20px;
        background: #6366f1;
        border: 3px solid white;
        border-radius: 50%;
        box-shadow: 0 0 10px rgba(99, 102, 241, 0.5);
      "></div>
      <div style="
        position: absolute;
        top: 0;
        left: 0;
        width: 20px;
        height: 20px;
        background: rgba(99, 102, 241, 0.3);
        border-radius: 50%;
        animation: pulse 2s infinite;
      "></div>
    </div>
  `,
  className: "user-location-marker",
  iconSize: [20, 20],
  iconAnchor: [10, 10],
});

export function Live() {
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [nearbyRoutes, setNearbyRoutes] = useState<NearbyRoute[]>([]);
  const [locationEnabled, setLocationEnabled] = useState(false);
  const [liveBuses, setLiveBuses] = useState<LiveBus[]>([]);

  // Calculate distance between two coordinates (Haversine formula)
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  // Find nearby routes based on user location
  const findNearbyRoutes = (location: UserLocation) => {
    const nearby: NearbyRoute[] = [];

    busRoutes.forEach((route) => {
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

      // Only include routes within 2km
      if (nearestDistance < 2) {
        nearby.push({
          route,
          nearestStop: nearestStopName,
          distance: nearestDistance,
        });
      }
    });

    // Sort by distance
    nearby.sort((a, b) => a.distance - b.distance);
    setNearbyRoutes(nearby);
  };

  // Get user's current location
  const getUserLocation = () => {
    setLoading(true);
    setError(null);

    if (!navigator.geolocation) {
      setError("Tu navegador no soporta geolocalización");
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
        findNearbyRoutes(location);
        setLoading(false);
      },
      (err) => {
        setError("No se pudo obtener tu ubicación. Por favor, permite el acceso.");
        setLoading(false);
        console.error(err);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  };

  // Watch user location for real-time updates
  useEffect(() => {
    if (!locationEnabled) return;

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        const location = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        setUserLocation(location);
        findNearbyRoutes(location);
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
  }, [locationEnabled]);

  // Update live buses data
  useEffect(() => {
    // Initialize immediately
    setLiveBuses(generateLiveBuses());
    
    // Update every 5 seconds
    const intervalId = setInterval(() => {
      setLiveBuses(generateLiveBuses());
    }, 5000);

    return () => clearInterval(intervalId);
  }, []);

  return (
    <div className="pb-20 min-h-screen">
      {/* Header */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="sticky top-0 z-10 bg-card/95 backdrop-blur-xl border-b border-border shadow-lg"
      >
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <motion.div
              animate={{
                rotate: locationEnabled ? [0, 360] : 0,
              }}
              transition={{
                duration: 2,
                repeat: locationEnabled ? Infinity : 0,
                ease: "linear",
              }}
              className="p-3 bg-primary/10 rounded-2xl"
            >
              <Navigation className="w-6 h-6 text-primary" />
            </motion.div>
            <div>
              <h1 className="text-xl font-bold">GPS En Vivo</h1>
              <p className="text-sm text-muted-foreground">
                {locationEnabled ? "Ubicación activa" : "Encuentra rutas cerca de ti"}
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        {/* Location Button */}
        {!locationEnabled && (
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-center space-y-4"
          >
            <motion.div
              animate={{
                scale: [1, 1.05, 1],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
              }}
              className="inline-flex p-6 bg-primary/10 rounded-full"
            >
              <MapPinned className="w-16 h-16 text-primary" />
            </motion.div>

            <div className="space-y-2">
              <h2 className="text-2xl font-bold">Activa tu ubicación</h2>
              <p className="text-muted-foreground max-w-md mx-auto">
                Te mostraremos las rutas de buses más cercanas a tu posición actual
              </p>
            </div>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={getUserLocation}
              disabled={loading}
              className="px-8 py-4 bg-primary text-primary-foreground rounded-2xl font-semibold shadow-lg hover:shadow-xl transition-shadow disabled:opacity-50 inline-flex items-center gap-3"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Obteniendo ubicación...
                </>
              ) : (
                <>
                  <Navigation className="w-5 h-5" />
                  Activar GPS
                </>
              )}
            </motion.button>
          </motion.div>
        )}

        {/* Error Message */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="bg-destructive/10 border border-destructive/20 rounded-2xl p-4 flex items-start gap-3"
            >
              <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-destructive">Error de ubicación</p>
                <p className="text-sm text-destructive/80">{error}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Map */}
        {userLocation && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="rounded-3xl overflow-hidden shadow-2xl border border-border"
          >
            <div className="h-[400px] relative">
              <MapContainer
                center={[userLocation.lat, userLocation.lng]}
                zoom={15}
                style={{ height: "100%", width: "100%" }}
                zoomControl={true}
              >
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                />
                <MapRecenter center={[userLocation.lat, userLocation.lng]} />

                {/* User location marker */}
                <Marker
                  position={[userLocation.lat, userLocation.lng]}
                  icon={userLocationIcon}
                >
                  <Popup>
                    <div className="text-center">
                      <p className="font-bold">Tu ubicación</p>
                      <p className="text-xs text-gray-600">
                        {userLocation.lat.toFixed(4)}, {userLocation.lng.toFixed(4)}
                      </p>
                    </div>
                  </Popup>
                </Marker>

                {/* Coverage radius */}
                <Circle
                  center={[userLocation.lat, userLocation.lng]}
                  radius={2000}
                  pathOptions={{
                    fillColor: "#6366f1",
                    fillOpacity: 0.1,
                    color: "#6366f1",
                    weight: 2,
                    opacity: 0.5,
                  }}
                />

                {/* Nearby stops markers */}
                {nearbyRoutes.map((nearby) => {
                  const routeStops = routeCoordinates[nearby.route.id];
                  if (!routeStops) return null;

                  return routeStops.map((stop, idx) => (
                    <Marker key={`${nearby.route.id}-${idx}`} position={stop.coordinates}>
                      <Popup>
                        <div className="text-center">
                          <p className="font-bold">{stop.name}</p>
                          <p className="text-xs" style={{ color: nearby.route.color }}>
                            Ruta {nearby.route.number}: {nearby.route.name}
                          </p>
                        </div>
                      </Popup>
                    </Marker>
                  ));
                })}

                {/* Live buses markers */}
                {liveBuses.map((bus) => {
                  const busIcon = new L.DivIcon({
                    html: `
                      <div style="
                        width: 32px;
                        height: 32px;
                        background: ${bus.routeColor};
                        border: 3px solid white;
                        border-radius: 50%;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        font-weight: bold;
                        font-size: 12px;
                        color: white;
                        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
                      ">${bus.routeNumber}</div>
                    `,
                    className: "bus-marker",
                    iconSize: [32, 32],
                    iconAnchor: [16, 16],
                  });

                  return (
                    <Marker key={bus.id} position={bus.coordinates} icon={busIcon}>
                      <Popup>
                        <div className="min-w-[200px]">
                          <p className="font-bold text-center mb-2" style={{ color: bus.routeColor }}>
                            🚌 Bus {bus.routeNumber}
                          </p>
                          <p className="text-sm font-semibold">{bus.routeName}</p>
                          <div className="mt-2 pt-2 border-t border-gray-200 space-y-1 text-xs">
                            <p><strong>Parada actual:</strong> {bus.currentStop}</p>
                            <p><strong>Próxima parada:</strong> {bus.nextStop}</p>
                            <p><strong>Velocidad:</strong> {bus.speed} km/h</p>
                            <p><strong>Ocupación:</strong> {bus.passengerCount}/{bus.capacity} pasajeros</p>
                            <p className="text-green-600 font-semibold">⏱ Llega en {bus.estimatedArrival} min</p>
                          </div>
                        </div>
                      </Popup>
                    </Marker>
                  );
                })}
              </MapContainer>

              {/* Refresh button overlay */}
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={getUserLocation}
                className="absolute top-4 right-4 z-[1000] p-3 bg-card shadow-lg rounded-full border border-border"
              >
                <Navigation className="w-5 h-5 text-primary" />
              </motion.button>
            </div>
          </motion.div>
        )}

        {/* Nearby Routes */}
        {userLocation && nearbyRoutes.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <div className="flex items-center gap-2">
              <Bus className="w-5 h-5 text-primary" />
              <h2 className="text-lg font-bold">
                Rutas Cercanas ({nearbyRoutes.length})
              </h2>
            </div>

            <div className="grid gap-3">
              {nearbyRoutes.map((nearby, index) => (
                <motion.div
                  key={nearby.route.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ scale: 1.02 }}
                >
                  <Link to={`/route/${nearby.route.id}`}>
                    <div className="bg-card border border-border rounded-2xl p-4 hover:shadow-lg transition-shadow">
                      <div className="flex items-start gap-4">
                        {/* Route Number */}
                        <motion.div
                          whileHover={{ rotate: [0, -10, 10, -10, 0] }}
                          transition={{ duration: 0.5 }}
                          className="flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg shadow-lg"
                          style={{
                            backgroundColor: nearby.route.color,
                            color: "white",
                          }}
                        >
                          {nearby.route.number}
                        </motion.div>

                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold truncate">{nearby.route.name}</h3>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                            <MapPin className="w-4 h-4" />
                            <span className="truncate">{nearby.nearestStop}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm mt-2">
                            <div className="px-2 py-1 bg-primary/10 text-primary rounded-lg font-semibold">
                              {nearby.distance < 0.1
                                ? "< 100m"
                                : `${nearby.distance.toFixed(1)} km`}
                            </div>
                            <div className="flex items-center gap-1 text-muted-foreground">
                              <Clock className="w-3 h-3" />
                              <span className="text-xs">{nearby.route.frequency}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* No routes found */}
        {userLocation && nearbyRoutes.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12 space-y-3"
          >
            <div className="inline-flex p-6 bg-muted/50 rounded-full">
              <Bus className="w-12 h-12 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-bold">No hay rutas cercanas</h3>
            <p className="text-muted-foreground max-w-md mx-auto">
              No encontramos rutas de buses dentro de 2 km de tu ubicación. Intenta en otra zona de la ciudad.
            </p>
          </motion.div>
        )}
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% {
            transform: scale(1);
            opacity: 0.3;
          }
          50% {
            transform: scale(2);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
}