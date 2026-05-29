// MyTrip v2.1 - Dynamic route selection
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router";
import L from "leaflet";
import { Bell, Share2, Star, X, MapPin, Navigation } from "lucide-react";
import { motion } from "motion/react";
import { busRoutes } from "../data/routes";
import { routeCoordinates } from "../data/routeCoordinates";
import { FlipNumber } from "../components/FlipNumber";
import { StopNotificationBanner } from "../components/StopNotificationBanner";
import { AlertConfigSheet, AlertConfig } from "../components/AlertConfigSheet";
import { ConfirmDialog } from "../components/ConfirmDialog";
import { Toast } from "../components/Toast";
import { createBusMarkerHTML } from "../utils/busMarkerHTML";
import { useTrip } from "../context/TripContext";

// Linear interpolation
function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

// Calculate bearing angle between two points
function bearing(from: [number, number], to: [number, number]): number {
  const dLng = (to[1] - from[1]) * Math.PI / 180;
  const lat1 = from[0] * Math.PI / 180;
  const lat2 = to[0] * Math.PI / 180;
  const y = Math.sin(dLng) * Math.cos(lat2);
  const x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLng);
  return (Math.atan2(y, x) * 180 / Math.PI + 360) % 360;
}

export function MyTrip() {
  const navigate = useNavigate();
  const { activeRouteId, clearTrip } = useTrip();
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const routeLineRef = useRef<L.Polyline | null>(null);
  const busMarkerRef = useRef<L.Marker | null>(null);
  const stopMarkersRef = useRef<L.CircleMarker[]>([]);
  const nextStopLabelRef = useRef<L.Marker[]>([]);
  const animationFrameRef = useRef<number | null>(null);
  const busStateRef = useRef({
    currentStopIndex: 0,
    progress: 0,
    speed: 0.0003, // Velocidad de interpolación (más bajo = más lento)
  });

  const [notifyEnabled, setNotifyEnabled] = useState(false);
  const [showNotification, setShowNotification] = useState(false);
  const [currentBusStopIndex, setCurrentBusStopIndex] = useState(0);
  const [etaToNextStop, setEtaToNextStop] = useState(1); // Tiempo a la próxima parada
  const [etaToDestination, setEtaToDestination] = useState(0); // Tiempo al destino final
  const [progress, setProgress] = useState(0);

  // Modal states
  const [showAlertSheet, setShowAlertSheet] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [hasAlertActive, setHasAlertActive] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);

  // Toast states
  const [toast, setToast] = useState<{
    isOpen: boolean;
    message: string;
    type: "success" | "error" | "info" | "warning";
  }>({
    isOpen: false,
    message: "",
    type: "success",
  });

  // Redirect to home if no active trip
  useEffect(() => {
    if (!activeRouteId) {
      navigate("/");
    }
  }, [activeRouteId, navigate]);

  // Get active route from context
  const activeRoute = busRoutes.find((r) => r.id === activeRouteId) || busRoutes[0];
  const coordinates = routeCoordinates[activeRoute.id];

  // Action handlers
  const handleAlertSave = (config: AlertConfig) => {
    setHasAlertActive(true);
    setToast({
      isOpen: true,
      message: `✓ Recibirás una alerta antes de llegar a ${
        coordinates?.[coordinates.length - 1]?.name || "Rodadero"
      }`,
      type: "success",
    });
  };

  const handleShare = async () => {
    const shareData = {
      title: "Mi viaje en BusSamario",
      text: `Estoy tomando la Ruta ${activeRoute.number} · ${activeRoute.origin} → ${
        activeRoute.destination
      } 🚌\nLlego aproximadamente en ${etaToDestination} min.\nSigue mi ruta: [deep-link]`,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        // User cancelled or error
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(shareData.text);
      setToast({
        isOpen: true,
        message: "Enlace copiado al portapapeles",
        type: "success",
      });
    }
  };

  const handleToggleFavorite = () => {
    setIsFavorite(!isFavorite);
    setToast({
      isOpen: true,
      message: isFavorite
        ? "Ruta eliminada de favoritas"
        : `Ruta ${activeRoute.number} añadida a tus favoritas`,
      type: "success",
    });
  };

  const handleCancelTrip = () => {
    setShowCancelDialog(false);

    // Cancelar animación
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }

    // Limpiar marcadores del mapa
    if (mapInstanceRef.current) {
      stopMarkersRef.current.forEach(m => {
        if (mapInstanceRef.current && mapInstanceRef.current.hasLayer(m)) {
          mapInstanceRef.current.removeLayer(m);
        }
      });
      nextStopLabelRef.current.forEach(m => {
        if (mapInstanceRef.current && mapInstanceRef.current.hasLayer(m)) {
          mapInstanceRef.current.removeLayer(m);
        }
      });
      stopMarkersRef.current = [];
      nextStopLabelRef.current = [];

      if (routeLineRef.current && mapInstanceRef.current.hasLayer(routeLineRef.current)) {
        mapInstanceRef.current.removeLayer(routeLineRef.current);
        routeLineRef.current = null;
      }
      if (busMarkerRef.current && mapInstanceRef.current.hasLayer(busMarkerRef.current)) {
        mapInstanceRef.current.removeLayer(busMarkerRef.current);
        busMarkerRef.current = null;
      }
    }

    // Limpiar estado del viaje
    clearTrip();

    // Navegar al Home
    navigate("/");
  };

  useEffect(() => {
    if (!mapRef.current || !coordinates) return;

    // Cleanup existing map
    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
    }

    // Create map centered on Santa Marta
    const map = L.map(mapRef.current, {
      zoomControl: false,
      scrollWheelZoom: true,
      dragging: true,
      touchZoom: true,
    }).setView([11.2408, -74.1990], 14);

    mapInstanceRef.current = map;

    // Add dark tile layer
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; OSM',
      maxZoom: 19,
    }).addTo(map);

    // Draw active route with animated dash
    const latLngs: L.LatLngExpression[] = coordinates.map((stop) => [
      stop.coordinates[0],
      stop.coordinates[1],
    ]);

    const routeLine = L.polyline(latLngs, {
      color: '#00E5A0',
      weight: 5,
      opacity: 0.8,
      smoothFactor: 1,
      dashArray: '10, 5',
    }).addTo(map);

    routeLineRef.current = routeLine;

    // Animate the dash array
    let dashOffset = 0;
    const animateDash = setInterval(() => {
      dashOffset += 1;
      const pathElement = (routeLine as any)._path;
      if (pathElement) {
        pathElement.style.strokeDashoffset = dashOffset;
      }
    }, 50);

    // Add stop markers (will be updated dynamically)
    const updateStopMarkers = (busIndex: number) => {
      // Verificar que el mapa existe
      if (!mapInstanceRef.current) return;

      // Clear existing markers
      stopMarkersRef.current.forEach(m => {
        if (mapInstanceRef.current && mapInstanceRef.current.hasLayer(m)) {
          mapInstanceRef.current.removeLayer(m);
        }
      });
      nextStopLabelRef.current.forEach(m => {
        if (mapInstanceRef.current && mapInstanceRef.current.hasLayer(m)) {
          mapInstanceRef.current.removeLayer(m);
        }
      });
      stopMarkersRef.current = [];
      nextStopLabelRef.current = [];

      // Add updated markers
      coordinates.forEach((stop, index) => {
        if (!mapInstanceRef.current) return;

        const nextStopIndex = busIndex + 1;
        const isNext = index === nextStopIndex;
        const isPassed = index <= busIndex;

        const marker = L.circleMarker([stop.coordinates[0], stop.coordinates[1]], {
          radius: isNext ? 8 : 5,
          fillColor: isPassed ? '#4A4D60' : isNext ? '#00E5A0' : '#8B8FA8',
          color: '#F0F2FF',
          weight: isNext ? 3 : 1,
          opacity: 1,
          fillOpacity: isPassed ? 0.3 : isNext ? 1 : 0.6,
        }).addTo(mapInstanceRef.current);

        stopMarkersRef.current.push(marker);

        if (isNext && mapInstanceRef.current) {
          const labelMarker = L.marker([stop.coordinates[0], stop.coordinates[1]], {
            icon: L.divIcon({
              className: "next-stop-marker",
              html: `
                <div style="
                  background: #00E5A0;
                  color: #0D0F14;
                  padding: 4px 8px;
                  border-radius: 6px;
                  font-weight: bold;
                  font-size: 11px;
                  box-shadow: 0 2px 8px rgba(0, 229, 160, 0.4);
                  white-space: nowrap;
                  font-family: var(--font-body);
                ">
                  Próxima parada
                </div>
              `,
              iconAnchor: [0, -10],
            }),
          }).addTo(mapInstanceRef.current);
          nextStopLabelRef.current.push(labelMarker);
        }
      });
    };

    // Initial markers
    updateStopMarkers(currentBusStopIndex);

    // User position (blue pulsing dot)
    const userIcon = L.divIcon({
      className: "user-position",
      html: `
        <div style="position: relative;">
          <div style="
            width: 20px;
            height: 20px;
            background: #4F8EF7;
            border: 3px solid #F0F2FF;
            border-radius: 50%;
            box-shadow: 0 0 20px rgba(79, 142, 247, 0.6);
          "></div>
          <div style="
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            width: 40px;
            height: 40px;
            background: rgba(79, 142, 247, 0.3);
            border-radius: 50%;
            animation: pulse 2s infinite;
          "></div>
        </div>
      `,
      iconSize: [20, 20],
      iconAnchor: [10, 10],
    });

    L.marker([11.2400, -74.1985], { icon: userIcon }).addTo(map);

    // Animated bus icon with rotation
    const busIcon = L.divIcon({
      className: "bus-marker-active",
      html: createBusMarkerHTML(activeRoute.color, 0, "moving", activeRoute.number),
      iconSize: [40, 40],
      iconAnchor: [20, 20],
    });

    // Start bus at first stop
    const initialPos = coordinates[0];
    const busMarker = L.marker([initialPos.coordinates[0], initialPos.coordinates[1]], { icon: busIcon }).addTo(map);
    busMarkerRef.current = busMarker;

    // Reset bus state
    busStateRef.current = {
      currentStopIndex: 0,
      progress: 0,
      speed: 0.0003, // Velocidad lenta y fluida (~50 segundos por parada)
    };

    // Smooth bus animation with requestAnimationFrame
    const animateBus = () => {
      const state = busStateRef.current;
      const currentStop = coordinates[state.currentStopIndex];
      const nextStopIndex = (state.currentStopIndex + 1) % coordinates.length;
      const nextStop = coordinates[nextStopIndex];

      if (!currentStop || !nextStop) {
        animationFrameRef.current = requestAnimationFrame(animateBus);
        return;
      }

      // Advance progress
      state.progress += state.speed;

      if (state.progress >= 1.0) {
        // Reached next stop
        state.currentStopIndex = nextStopIndex;
        state.progress = 0;
        setCurrentBusStopIndex(nextStopIndex);
        updateStopMarkers(nextStopIndex);

        // Calculate ETAs
        const totalStops = coordinates.length;
        const stopsToDestination = totalStops - nextStopIndex - 1;
        const secondsPerStop = 50; // 50 segundos por parada

        // ETA a próxima parada (siempre ~1 min)
        setEtaToNextStop(1);

        // ETA al destino final
        const totalSecondsToDestination = stopsToDestination * secondsPerStop;
        const minutesToDestination = Math.max(1, Math.round(totalSecondsToDestination / 60));
        setEtaToDestination(minutesToDestination);

        // Calculate progress percentage
        const progressPercent = (nextStopIndex / (totalStops - 1)) * 100;
        setProgress(Math.min(100, progressPercent));
      } else {
        // Interpolate position between current and next stop
        const currentLat = lerp(
          currentStop.coordinates[0],
          nextStop.coordinates[0],
          state.progress
        );
        const currentLng = lerp(
          currentStop.coordinates[1],
          nextStop.coordinates[1],
          state.progress
        );

        // Update bus position
        busMarker.setLatLng([currentLat, currentLng]);

        // Calculate and update rotation
        const angle = bearing(
          [currentStop.coordinates[0], currentStop.coordinates[1]],
          [nextStop.coordinates[0], nextStop.coordinates[1]]
        );

        const rotatedIcon = L.divIcon({
          className: "bus-marker-active",
          html: createBusMarkerHTML(
            activeRoute.color,
            angle,
            "moving",
            activeRoute.number
          ),
          iconSize: [40, 40],
          iconAnchor: [20, 20],
        });

        busMarker.setIcon(rotatedIcon);
      }

      animationFrameRef.current = requestAnimationFrame(animateBus);
    };

    // Start animation
    animationFrameRef.current = requestAnimationFrame(animateBus);

    // Initial ETA calculations
    const totalStops = coordinates.length;
    const secondsPerStop = 50;
    setEtaToNextStop(1);
    const totalSeconds = (totalStops - 1) * secondsPerStop;
    const totalMinutes = Math.max(1, Math.round(totalSeconds / 60));
    setEtaToDestination(totalMinutes);

    // Add zoom control
    L.control.zoom({ position: 'topright' }).addTo(map);

    return () => {
      // Cancelar animación
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }

      // Limpiar intervalo
      clearInterval(animateDash);

      // Limpiar marcadores antes de destruir el mapa
      if (mapInstanceRef.current) {
        stopMarkersRef.current.forEach(m => {
          if (mapInstanceRef.current && mapInstanceRef.current.hasLayer(m)) {
            mapInstanceRef.current.removeLayer(m);
          }
        });
        nextStopLabelRef.current.forEach(m => {
          if (mapInstanceRef.current && mapInstanceRef.current.hasLayer(m)) {
            mapInstanceRef.current.removeLayer(m);
          }
        });

        stopMarkersRef.current = [];
        nextStopLabelRef.current = [];

        // Destruir el mapa
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }

      // Limpiar refs de marcadores
      routeLineRef.current = null;
      busMarkerRef.current = null;
    };
  }, [activeRoute, coordinates]);

  return (
    <div className="fixed inset-0 flex flex-col">
      {/* Notification banner */}
      {showNotification && (
        <StopNotificationBanner
          stopName={coordinates?.[currentBusStopIndex + 1]?.name || "Próxima parada"}
          eta={etaToNextStop}
          onDismiss={() => setShowNotification(false)}
        />
      )}

      {/* Map section (60%) */}
      <div className="h-[60vh]">
        <div ref={mapRef} className="w-full h-full" />
      </div>

      {/* Info panel (40%) */}
      <div
        className="flex-1 rounded-t-3xl overflow-y-auto pb-20"
        style={{
          backgroundColor: '#161820',
          boxShadow: '0px -4px 20px rgba(0, 0, 0, 0.35)',
        }}
      >
        {/* Handle bar */}
        <div className="flex justify-center pt-3 pb-4">
          <div
            className="h-1 rounded-full"
            style={{
              width: '32px',
              backgroundColor: '#4A4D60',
            }}
          />
        </div>

        <div className="px-5 pb-6">
          {/* Active route badge */}
          <div className="mb-5">
            <span
              className="inline-block px-4 py-1.5 rounded-full text-xs font-bold"
              style={{
                backgroundColor: activeRoute.color,
                color: '#F0F2FF',
                fontFamily: 'var(--font-mono)',
              }}
            >
              EN VIAJE · RUTA {activeRoute.number}
            </span>
          </div>

          {/* Next stop card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-5 rounded-xl border mb-4"
            style={{
              backgroundColor: '#1E2029',
              borderColor: 'rgba(0, 229, 160, 0.3)',
              boxShadow: '0 0 24px rgba(0, 229, 160, 0.1)',
            }}
          >
            <div className="flex items-start gap-3 mb-4">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: 'rgba(0, 229, 160, 0.15)' }}
              >
                <Navigation className="w-5 h-5" style={{ color: '#00E5A0' }} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium mb-1" style={{ color: '#8B8FA8' }}>
                  Próxima parada
                </p>
                <h3
                  className="text-lg font-bold mb-2"
                  style={{
                    fontFamily: 'var(--font-display)',
                    color: '#F0F2FF',
                  }}
                >
                  {coordinates?.[currentBusStopIndex + 1]?.name || coordinates?.[0]?.name || "Próxima parada"}
                </h3>
                <div className="flex items-center gap-2">
                  <div className="flex items-center">
                    <span className="text-2xl" style={{ color: '#00E5A0' }}>~</span>
                    <FlipNumber value={etaToNextStop} size="lg" color="#00E5A0" />
                    <span
                      className="text-2xl font-bold ml-1"
                      style={{
                        fontFamily: 'var(--font-mono)',
                        color: '#00E5A0',
                      }}
                    >
                      min
                    </span>
                  </div>
                  <span className="text-xs" style={{ color: '#8B8FA8' }}>
                    · {(etaToNextStop * 0.4).toFixed(1)} km
                  </span>
                </div>
              </div>
            </div>

            {/* Progress bar */}
            <div
              className="h-2 rounded-full overflow-hidden"
              style={{ backgroundColor: '#252733' }}
            >
              <motion.div
                className="h-full rounded-full"
                style={{
                  background: 'linear-gradient(90deg, #00E5A0 0%, #4F8EF7 100%)',
                  width: `${progress}%`,
                }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
          </motion.div>

          {/* Destination card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="p-4 rounded-xl border mb-5"
            style={{
              backgroundColor: '#1E2029',
              borderColor: 'rgba(255, 255, 255, 0.09)',
            }}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4" style={{ color: '#FF6B6B' }} />
                <p className="text-sm font-medium" style={{ color: '#8B8FA8' }}>
                  Tu parada de bajada
                </p>
              </div>
              <div className="flex items-center">
                <FlipNumber value={etaToDestination} size="sm" color="#FF6B6B" />
                <span
                  className="text-xs font-bold ml-1"
                  style={{
                    fontFamily: 'var(--font-mono)',
                    color: '#FF6B6B',
                  }}
                >
                  min
                </span>
              </div>
            </div>

            <p
              className="text-base font-bold mb-3"
              style={{
                fontFamily: 'var(--font-display)',
                color: '#F0F2FF',
              }}
            >
              {coordinates?.[coordinates.length - 1]?.name || "Rodadero"}
            </p>

            {/* Notify toggle */}
            <button
              onClick={() => setNotifyEnabled(!notifyEnabled)}
              className="w-full flex items-center justify-between px-4 py-2.5 rounded-lg transition-all"
              style={{
                backgroundColor: notifyEnabled ? 'rgba(0, 229, 160, 0.15)' : '#252733',
                border: notifyEnabled ? '1px solid #00E5A0' : '1px solid rgba(255, 255, 255, 0.06)',
              }}
            >
              <div className="flex items-center gap-2">
                <Bell
                  className="w-4 h-4"
                  style={{ color: notifyEnabled ? '#00E5A0' : '#8B8FA8' }}
                />
                <span
                  className="text-sm font-medium"
                  style={{ color: notifyEnabled ? '#00E5A0' : '#F0F2FF' }}
                >
                  Notificarme antes de llegar
                </span>
              </div>
              <div
                className="w-12 h-6 rounded-full transition-all relative"
                style={{
                  backgroundColor: notifyEnabled ? '#00E5A0' : '#4A4D60',
                }}
              >
                <div
                  className="w-5 h-5 rounded-full bg-white absolute top-0.5 transition-all"
                  style={{
                    left: notifyEnabled ? 'calc(100% - 22px)' : '2px',
                  }}
                />
              </div>
            </button>
          </motion.div>

          {/* Quick actions */}
          <div className="grid grid-cols-4 gap-3">
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowAlertSheet(true)}
              className="flex flex-col items-center gap-2 p-3 rounded-xl relative"
              style={{ backgroundColor: '#252733' }}
            >
              <Bell className="w-5 h-5" style={{ color: '#00E5A0' }} />
              {hasAlertActive && (
                <motion.div
                  animate={{
                    scale: [1, 1.2, 1],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                  className="absolute top-2 right-2 w-2 h-2 rounded-full"
                  style={{ backgroundColor: "#00E5A0" }}
                />
              )}
              <span className="text-[10px] font-medium" style={{ color: '#8B8FA8' }}>
                Alerta
              </span>
            </motion.button>

            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.25 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleShare}
              className="flex flex-col items-center gap-2 p-3 rounded-xl"
              style={{ backgroundColor: '#252733' }}
            >
              <Share2 className="w-5 h-5" style={{ color: '#4F8EF7' }} />
              <span className="text-[10px] font-medium" style={{ color: '#8B8FA8' }}>
                Compartir
              </span>
            </motion.button>

            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleToggleFavorite}
              className="flex flex-col items-center gap-2 p-3 rounded-xl"
              style={{ backgroundColor: '#252733' }}
            >
              <motion.div
                animate={
                  isFavorite
                    ? {
                        scale: [0, 1.3, 1],
                      }
                    : {}
                }
                transition={{
                  duration: 0.3,
                  type: "keyframes",
                }}
              >
                <Star
                  className="w-5 h-5"
                  style={{
                    color: '#EAB308',
                    fill: isFavorite ? '#EAB308' : 'none',
                  }}
                />
              </motion.div>
              <span className="text-[10px] font-medium" style={{ color: '#8B8FA8' }}>
                Favorito
              </span>
            </motion.button>

            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.35 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowCancelDialog(true)}
              className="flex flex-col items-center gap-2 p-3 rounded-xl"
              style={{ backgroundColor: '#252733' }}
            >
              <X className="w-5 h-5" style={{ color: '#FF6B6B' }} />
              <span className="text-[10px] font-medium" style={{ color: '#8B8FA8' }}>
                Cancelar
              </span>
            </motion.button>
          </div>
        </div>
      </div>

      {/* Alert config sheet */}
      <AlertConfigSheet
        isOpen={showAlertSheet}
        onClose={() => setShowAlertSheet(false)}
        onSave={handleAlertSave}
      />

      {/* Cancel trip dialog */}
      <ConfirmDialog
        isOpen={showCancelDialog}
        onClose={() => setShowCancelDialog(false)}
        onConfirm={handleCancelTrip}
        title="¿Terminar el viaje?"
        message="Se cerrará el seguimiento de tu ruta actual."
        confirmText="Terminar"
        cancelText="Seguir en ruta"
        variant="destructive"
      />

      {/* Toast notifications */}
      <Toast
        isOpen={toast.isOpen}
        onClose={() => setToast({ ...toast, isOpen: false })}
        message={toast.message}
        type={toast.type}
      />
    </div>
  );
}
