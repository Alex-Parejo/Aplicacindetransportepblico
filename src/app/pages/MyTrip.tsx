import { useEffect, useRef, useState, useMemo } from "react";
import { useNavigate } from "react-router";
import L from "leaflet";
import { Bell, Share2, Star, X, MapPin, Navigation, Info, ShieldAlert, AlertTriangle, Users, Hourglass, Eye } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { busRoutes } from "../data/routes";
import { routeCoordinates } from "../data/routeCoordinates";
import { streetPaths } from "../data/streetPaths";
import { incidentStore, INCIDENT_UPDATE_EVENT, type Incident } from "../services/incidentStore";
import { FlipNumber } from "../components/FlipNumber";
import { StopNotificationBanner } from "../components/StopNotificationBanner";
import { AlertConfigSheet, AlertConfig } from "../components/AlertConfigSheet";
import { ConfirmDialog } from "../components/ConfirmDialog";
import { Toast } from "../components/Toast";
import { createBusMarkerHTML } from "../utils/busMarkerHTML";
import { useTrip } from "../context/TripContext";
import { api, type UserProfile } from "../services/api";
import { cn } from "../components/ui/utils";
import { touristSpots } from "../data/touristSpots";

// Haversine distance formula in km
function getDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Linear interpolation for coordinate smoothing
function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

// Calculate bearing angle between two points for arrow rotation
function bearing(from: [number, number], to: [number, number]): number {
  const dLng = (to[1] - from[1]) * Math.PI / 180;
  const lat1 = from[0] * Math.PI / 180;
  const lat2 = to[0] * Math.PI / 180;
  const y = Math.sin(dLng) * Math.cos(lat2);
  const x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLng);
  return (Math.atan2(y, x) * 180 / Math.PI + 360) % 360;
}

// Find the index in path coordinates closest to target coordinates
function findClosestPointIndex(path: [number, number][], target: [number, number]): number {
  let minDistance = Infinity;
  let closestIndex = 0;
  for (let i = 0; i < path.length; i++) {
    const latDiff = path[i][0] - target[0];
    const lngDiff = path[i][1] - target[1];
    const dist = latDiff * latDiff + lngDiff * lngDiff;
    if (dist < minDistance) {
      minDistance = dist;
      closestIndex = i;
    }
  }
  return closestIndex;
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
    currentPointIndex: 0,
    progress: 0,
    speed: 0.15, // Speed factor along the detailed street path points
  });

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [notifyEnabled, setNotifyEnabled] = useState(false);
  const [showNotification, setShowNotification] = useState(false);
  const [currentBusStopIndex, setCurrentBusStopIndex] = useState(0);
  const [etaToNextStop, setEtaToNextStop] = useState(1); 
  const [etaToDestination, setEtaToDestination] = useState(0); 
  const [progress, setProgress] = useState(0);

  const [showReportSheet, setShowReportSheet] = useState(false);

  // Tourist mode
  const [isTouristMode, setIsTouristMode] = useState(false);
  const [mapReady, setMapReady] = useState(false);
  const isTouristModeRef = useRef(false);
  const touristMarkersRef = useRef<L.Marker[]>([]);
  const spokenSpotsRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    isTouristModeRef.current = isTouristMode;
  }, [isTouristMode]);

  // Modals
  const [showAlertSheet, setShowAlertSheet] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [hasAlertActive, setHasAlertActive] = useState(false);

  // Toast
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
  return;
}
  }, [activeRouteId, navigate]);

  // Load profile
  useEffect(() => {
    async function loadProfile() {
      try {
        const data = await api.getProfile();
        setProfile(data);
      } catch (err) {
        console.error("Error loading profile:", err);
      }
    }
    loadProfile();
  }, []);

  const activeRoute = useMemo(() => {
    return busRoutes.find((r) => r.id === activeRouteId) || busRoutes[0];
  }, [activeRouteId]);

  const allPoints = useMemo(() => {
    return routeCoordinates[activeRoute.id] || [];
  }, [activeRoute.id]);

  const coordinates = useMemo(() => {
    return allPoints.filter(s => s.name !== "");
  }, [allPoints]);

  const streetPath = useMemo(() => {
    return streetPaths[activeRoute.id] || coordinates.map((s) => s.coordinates);
  }, [activeRoute.id, coordinates]);

  const isFavorite = useMemo(() => {
    return profile?.favorites.includes(activeRoute.id) || false;
  }, [profile?.favorites, activeRoute.id]);

  // Custom alert action
  const handleAlertSave = (config: AlertConfig) => {
    setHasAlertActive(true);
    setToast({
      isOpen: true,
      message: `🔔 Alerta programada para: ${
        coordinates?.[coordinates.length - 1]?.name || "Parada final"
      }`,
      type: "success",
    });
  };

  const handleCreateReport = (type: Incident["type"]) => {
    setShowReportSheet(false);
    
    // Get the current location of the animated bus
    let lat = coordinates[0].coordinates[0];
    let lng = coordinates[0].coordinates[1];
    
    if (busMarkerRef.current) {
      const pos = busMarkerRef.current.getLatLng();
      lat = pos.lat;
      lng = pos.lng;
    }
    
    incidentStore.addIncident(type, [lat, lng], activeRoute.id, activeRoute.name);
    
    setToast({
      isOpen: true,
      message: "🎉 ¡Gracias! Tu reporte ha sido compartido en tiempo real con otros usuarios.",
      type: "success",
    });
  };

  // Location share
  const handleShare = async () => {
    const shareData = {
      title: "Mi viaje en BusSamario 🚌",
      text: `Voy en la Ruta ${activeRoute.number} (${activeRoute.name}). Llego aproximadamente en ${etaToDestination} min a ${
        coordinates?.[coordinates.length - 1]?.name || "mi destino"
      }.`,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        // Ignored
      }
    } else {
      navigator.clipboard.writeText(shareData.text);
      setToast({
        isOpen: true,
        message: "¡Enlace de viaje copiado al portapapeles!",
        type: "success",
      });
    }
  };

  const handleToggleFavorite = async () => {
    try {
      const updatedFavorites = await api.toggleFavoriteRoute(activeRoute.id);
      if (profile) {
        setProfile({ ...profile, favorites: updatedFavorites });
      }
      setToast({
        isOpen: true,
        message: isFavorite
          ? "Ruta eliminada de favoritas"
          : `Ruta ${activeRoute.number} añadida a tus favoritas`,
        type: "success",
      });
    } catch (err) {
      console.error(err);
    }
  };

  const handleCancelTrip = async () => {
    setShowCancelDialog(false);

    // Cancel animations
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }

    // Save trip to history log before canceling
    if (coordinates) {
      try {
        await api.addTripRecord({
          routeId: activeRoute.id,
          routeName: activeRoute.name,
          routeNumber: activeRoute.number,
          routeColor: activeRoute.color,
          from: activeRoute.origin,
          to: coordinates[currentBusStopIndex]?.name || activeRoute.destination,
          durationMinutes: Math.max(5, currentBusStopIndex * 3),
          distanceKm: Number((currentBusStopIndex * 1.4).toFixed(1)),
        });
      } catch (err) {
        console.error("Error saving trip to history:", err);
      }
    }

    // Clear active map resources
    if (mapInstanceRef.current) {
      stopMarkersRef.current.forEach(m => m.remove());
      nextStopLabelRef.current.forEach(m => m.remove());
      if (routeLineRef.current) routeLineRef.current.remove();
      if (busMarkerRef.current) busMarkerRef.current.remove();
    }

    clearTrip();
    navigate("/profile"); // Redirect directly to profile to see the new stats!
  };

  useEffect(() => {
    if (!mapRef.current || !coordinates) return;

    // Map initialization with dark vector tiles
    const map = L.map(mapRef.current, {
      zoomControl: false,
      scrollWheelZoom: true,
      dragging: true,
      touchZoom: true,
    }).setView([coordinates[0].coordinates[0], coordinates[0].coordinates[1]], 14);

    mapInstanceRef.current = map;

    // Observe map container resize to prevent grey tiles rendering
    const resizeObserver = new ResizeObserver(() => {
      map.invalidateSize();
    });
    if (mapRef.current) {
      resizeObserver.observe(mapRef.current);
    }

    L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
      attribution: '&copy; CartoDB',
      maxZoom: 20,
    }).addTo(map);

    const latLngs: L.LatLngExpression[] = streetPath.map((coord) => [
      coord[0],
      coord[1],
    ]);

    // Draw active route polyline
    const routeLine = L.polyline(latLngs, {
      color: '#00E5A0',
      weight: 5,
      opacity: 0.8,
      smoothFactor: 1,
      dashArray: '12, 6',
    }).addTo(map);

    routeLineRef.current = routeLine;

    // Moving dash offset animation loop
    let dashOffset = 0;
    const animateDash = setInterval(() => {
      dashOffset += 1;
      const pathElement = (routeLine as any)._path;
      if (pathElement) {
        pathElement.style.strokeDashoffset = dashOffset;
      }
    }, 45);

    // Dynamic stops updating
    const updateStopMarkers = (busIndex: number) => {
      if (!mapInstanceRef.current) return;

      stopMarkersRef.current.forEach(m => m.remove());
      nextStopLabelRef.current.forEach(m => m.remove());
      stopMarkersRef.current = [];
      nextStopLabelRef.current = [];

      coordinates.forEach((stop, index) => {
        if (!mapInstanceRef.current) return;

        const nextStopIndex = busIndex + 1;
        const isNext = index === nextStopIndex;
        const isPassed = index <= busIndex;

        const marker = L.circleMarker([stop.coordinates[0], stop.coordinates[1]], {
          radius: isNext ? 8 : 4,
          fillColor: isPassed ? 'rgba(74, 77, 96, 0.4)' : isNext ? '#00E5A0' : '#8B8FA8',
          color: '#F0F2FF',
          weight: isNext ? 2 : 1,
          opacity: 1,
          fillOpacity: isPassed ? 0.3 : isNext ? 1 : 0.6,
        }).addTo(mapInstanceRef.current);

        stopMarkersRef.current.push(marker);

        if (isNext && mapInstanceRef.current) {
          const labelMarker = L.marker([stop.coordinates[0], stop.coordinates[1]], {
            icon: L.divIcon({
              className: "next-stop-floating-label",
              html: `
                <div style="
                  background: rgba(19, 21, 32, 0.9);
                  backdrop-filter: blur(8px);
                  color: #00E5A0;
                  border: 1px solid rgba(0, 229, 160, 0.3);
                  padding: 4px 8px;
                  border-radius: 8px;
                  font-weight: 800;
                  font-size: 10px;
                  box-shadow: 0 4px 12px rgba(0,0,0,0.5);
                  white-space: nowrap;
                  font-family: var(--font-display);
                  text-transform: uppercase;
                  letter-spacing: 0.5px;
                ">
                  Próxima parada
                </div>
              `,
              iconAnchor: [-10, 25],
            }),
          }).addTo(mapInstanceRef.current);
          nextStopLabelRef.current.push(labelMarker);
        }
      });
    };

    updateStopMarkers(currentBusStopIndex);

    // Render traffic incidents
    const incidentMarkers: L.Marker[] = [];

    const drawIncidents = () => {
      incidentMarkers.forEach((m) => m.remove());
      incidentMarkers.length = 0;

      const activeIncidents = incidentStore.getIncidents();
      activeIncidents.forEach((inc) => {
        if (!mapInstanceRef.current) return;

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
          .addTo(mapInstanceRef.current)
          .bindPopup(`
            <div style="font-family: var(--font-body); font-size: 11px; padding: 4px; color: #F0F2FF;">
              <strong style="color: ${cfg.color}; text-transform: uppercase;">Reporte de Novedad</strong>
              <p style="margin: 4px 0 0 0; font-weight: 600;">${inc.description}</p>
              ${inc.routeName ? `<p style="margin: 2px 0 0 0; font-size: 10px; color: #8B8FA8;">Ruta: ${inc.routeName}</p>` : ''}
              <button 
                id="trip-like-btn-${inc.id}"
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
          const btn = document.getElementById(`trip-like-btn-${inc.id}`);
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

    // Map stop locations to path indexes using closest distance
    const stopIndexesInPath = coordinates.map((stop) =>
      findClosestPointIndex(streetPath, stop.coordinates)
    );

    // User position marker
    const userIcon = L.divIcon({
      className: "user-pulse-marker",
      html: `
        <div style="position: relative;">
          <div style="
            width: 16px;
            height: 16px;
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
            width: 32px;
            height: 32px;
            background: rgba(79, 142, 247, 0.25);
            border-radius: 50%;
            animation: pulse 2.5s infinite;
          "></div>
        </div>
      `,
      iconSize: [16, 16],
      iconAnchor: [8, 8],
    });

    L.marker([coordinates[Math.floor(coordinates.length / 2)].coordinates[0] - 0.002, coordinates[Math.floor(coordinates.length / 2)].coordinates[1] + 0.001], { icon: userIcon }).addTo(map);

    // Bus position marker
    const busIcon = L.divIcon({
      className: "bus-tracking-icon",
      html: createBusMarkerHTML(activeRoute.color, 0, "moving", activeRoute.number),
      iconSize: [42, 42],
      iconAnchor: [21, 21],
    });

    const initialPos = streetPath[0] || coordinates[0].coordinates;
    const busMarker = L.marker([initialPos[0], initialPos[1]], { icon: busIcon }).addTo(map);
    busMarkerRef.current = busMarker;

    // Reset state
    busStateRef.current = {
      currentPointIndex: 0,
      progress: 0,
      speed: 0.15, // Speed factor along the detailed street path points
    };

    // Animation Loop
    const animateBus = () => {
      const state = busStateRef.current;
      const currentPoint = streetPath[state.currentPointIndex];
      const nextPointIndex = (state.currentPointIndex + 1) % streetPath.length;
      const nextPoint = streetPath[nextPointIndex];

      if (!currentPoint || !nextPoint) {
        animationFrameRef.current = requestAnimationFrame(animateBus);
        return;
      }

      state.progress += state.speed;

      if (state.progress >= 1.0) {
        state.currentPointIndex = nextPointIndex;
        state.progress = 0;

        // Smooth progress update based on current node in street path
        const currentPathProgress = (nextPointIndex / (streetPath.length - 1)) * 100;
        setProgress(Math.min(100, currentPathProgress));

        // Check if we reached/passed any stop in stopIndexesInPath
        const stopIndex = stopIndexesInPath.indexOf(nextPointIndex);
        if (stopIndex !== -1) {
          setCurrentBusStopIndex(stopIndex);
          updateStopMarkers(stopIndex);

          // Notify if approaching destination (1 stop away)
          const totalStops = coordinates.length;
          const stopsToDestination = totalStops - stopIndex - 1;
          
          if (stopsToDestination === 1 && notifyEnabled) {
            setShowNotification(true);
          }

          // ETAs updates
          setEtaToNextStop(1);
          setEtaToDestination(Math.max(1, stopsToDestination * 2));
        }
      } else {
        const currentLat = lerp(currentPoint[0], nextPoint[0], state.progress);
        const currentLng = lerp(currentPoint[1], nextPoint[1], state.progress);

        busMarker.setLatLng([currentLat, currentLng]);

        const angle = bearing(
          [currentPoint[0], currentPoint[1]],
          [nextPoint[0], nextPoint[1]]
        );

        const rotatedIcon = L.divIcon({
          className: "bus-tracking-icon",
          html: createBusMarkerHTML(activeRoute.color, angle - 90, "moving", activeRoute.number),
          iconSize: [42, 42],
          iconAnchor: [21, 21],
        });

        busMarker.setIcon(rotatedIcon);

        // Check tourist spots proximity
        if (isTouristModeRef.current) {
          touristSpots.forEach((spot) => {
            if (!spokenSpotsRef.current.has(spot.id)) {
              const dist = getDistance(currentLat, currentLng, spot.coordinates[0], spot.coordinates[1]);
              if (dist < 0.12) { // 120m threshold
                spokenSpotsRef.current.add(spot.id);
                if ('speechSynthesis' in window) {
                  window.speechSynthesis.cancel();
                  const utterance = new SpeechSynthesisUtterance(spot.audioText);
                  utterance.lang = "es-ES";
                  utterance.rate = 0.95;
                  window.speechSynthesis.speak(utterance);
                }
                setToast({
                  isOpen: true,
                  message: `🏛️ Pasando por: ${spot.name}. ¡Escucha la audioguía!`,
                  type: "info",
                });
              }
            }
          });
        }
      }

      animationFrameRef.current = requestAnimationFrame(animateBus);
    };

    animationFrameRef.current = requestAnimationFrame(animateBus);

    // Initial timings
    const totalStops = coordinates.length;
    setEtaToNextStop(1);
    setEtaToDestination(Math.max(1, (totalStops - 1) * 2));

    L.control.zoom({ position: 'topright' }).addTo(map);
    setMapReady(true);

    return () => {
      setMapReady(false);
      resizeObserver.disconnect();
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      clearInterval(animateDash);
      window.removeEventListener(INCIDENT_UPDATE_EVENT, drawIncidents);
      incidentMarkers.forEach((m) => m.remove());
      if (mapInstanceRef.current) {
        stopMarkersRef.current.forEach(m => m.remove());
        nextStopLabelRef.current.forEach(m => m.remove());
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [activeRoute, coordinates, streetPath]);

  // Draw tourist spots on map when isTouristMode and mapReady are true
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !mapReady) return;

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
                id="speak-btn-trip-${spot.id}"
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
          const btn = document.getElementById(`speak-btn-trip-${spot.id}`);
          if (btn) {
            btn.onclick = (e) => {
              e.preventDefault();
              if ('speechSynthesis' in window) {
                window.speechSynthesis.cancel();
                const utterance = new SpeechSynthesisUtterance(spot.audioText);
                utterance.lang = "es-ES";
                utterance.rate = 0.95;
                window.speechSynthesis.speak(utterance);
              }
            };
          }
        });

        markers.push(marker);
      });
    }

    return () => {
      markers.forEach((m) => m.remove());
      if (!isTouristMode && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, [isTouristMode, mapReady]);

    if (!activeRouteId) {
    return (
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 p-8">
        <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
          <Navigation className="w-8 h-8 text-[#8B8FA8]" />
        </div>
        <div className="text-center space-y-1">
          <h2 className="text-base font-bold text-[#F0F2FF] font-display">Sin viaje activo</h2>
          <p className="text-xs text-[#8B8FA8] font-sans">Selecciona una ruta para comenzar tu viaje.</p>
        </div>
        <Toast
          isOpen={toast.isOpen}
          onClose={() => setToast({ ...toast, isOpen: false })}
          message={toast.message}
          type={toast.type}
        />
      </div>
    );
  }
  return (
    <div className="absolute inset-0 flex flex-col overflow-hidden">
      {/* Real-time Alert Notification Banner */}
      <AnimatePresence>
        {showNotification && (
          <StopNotificationBanner
            stopName={coordinates?.[currentBusStopIndex + 1]?.name || "Destino final"}
            eta={etaToNextStop}
            onDismiss={() => setShowNotification(false)}
          />
        )}
      </AnimatePresence>

      {/* Map Segment */}
      <div className="h-[52%] relative z-0">
        <div ref={mapRef} className="w-full h-full" />
        
        {/* Tourist Mode Toggle FAB inside MyTrip map */}
        <button
          aria-label="Alternar Modo Turístico"
          onClick={() => setIsTouristMode(prev => !prev)}
          className={cn(
            "absolute bottom-8 right-4 z-[400] w-12 h-12 rounded-xl glass-panel flex items-center justify-center shadow-glow active:scale-95 transition-transform pointer-events-auto focus-ring-premium",
            isTouristMode ? "text-amber-400 border border-amber-500/35" : "text-[#8B8FA8]"
          )}
        >
          <Star className={cn("w-5 h-5", isTouristMode ? "fill-amber-400" : "")} aria-hidden="true" />
        </button>
      </div>

      {/* Glassmorphic Info Panel (Floating design) */}
      <div className="flex-1 rounded-t-[28px] glass-panel border-t border-white/5 p-5 pb-24 shadow-2xl flex flex-col space-y-4 overflow-y-auto scrollbar-hide relative z-10 -mt-6">
        {/* Decorative grab bar */}
        <div className="w-10 h-1 bg-white/10 rounded-full mx-auto mb-2" />

        {/* Route Header Badge */}
        <div className="flex justify-between items-center select-none">
          <span
            className="px-3 py-1 rounded-lg text-[10px] font-bold text-white font-mono border"
            style={{
              backgroundColor: activeRoute.color,
              borderColor: `${activeRoute.color}25`
            }}
          >
            EN VIAJE · RUTA {activeRoute.number}
          </span>
          <span className="text-[10px] uppercase font-bold tracking-wider text-[#8B8FA8] font-display flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#00E5A0] animate-pulse" />
            Actualizando GPS
          </span>
        </div>

        {/* Primary Next Stop Card */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 rounded-2xl border border-[#00E5A0]/25 bg-[#00E5A0]/2 shadow-[0_0_24px_rgba(0,229,160,0.05)] space-y-3.5"
        >
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#00E5A0]/10 flex items-center justify-center flex-shrink-0 border border-[#00E5A0]/20">
              <Navigation className="w-5 h-5 text-[#00E5A0] fill-[#00E5A0]/10" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] font-bold uppercase tracking-wider text-[#8B8FA8] font-display">
                Próxima parada
              </p>
              <h3 className="text-base font-bold text-[#F0F2FF] truncate font-display mt-0.5">
                {currentBusStopIndex < (coordinates?.length || 0) - 1
                  ? coordinates?.[currentBusStopIndex + 1]?.name
                  : "Destino Alcanzado"}
              </h3>
              <div className="flex items-center gap-2 mt-1.5">
                <div className="flex items-baseline text-[#00E5A0]">
                  <span className="text-xs mr-0.5">~</span>
                  <FlipNumber value={etaToNextStop} size="lg" color="#00E5A0" />
                  <span className="text-xs font-bold font-mono ml-0.5">min</span>
                </div>
                <span className="text-[10px] text-[#4A4D60] font-mono">
                  · {((coordinates?.length ? Math.max(0, coordinates.length - currentBusStopIndex - 1) : 1) * 0.4).toFixed(1)} km restantes
                </span>
              </div>
            </div>
          </div>

          {/* Progress bar line */}
          <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
            <motion.div
              className="h-full rounded-full"
              style={{
                background: 'linear-gradient(90deg, #00E5A0 0%, #4F8EF7 100%)',
              }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.6 }}
            />
          </div>
        </motion.div>

        {/* Destination Card with Toggle Notify */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="p-4 rounded-2xl border border-white/5 glass-panel-light space-y-3"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-[#FF6B6B]" />
              <span className="text-xs font-bold text-[#8B8FA8] font-display">Parada de bajada</span>
            </div>
            <div className="flex items-baseline text-[#FF6B6B]">
              <span className="text-xs mr-0.5">~</span>
              <FlipNumber value={etaToDestination} size="sm" color="#FF6B6B" />
              <span className="text-xs font-bold font-mono ml-0.5">min</span>
            </div>
          </div>

          <p className="text-sm font-bold text-[#F0F2FF] font-display truncate">
            {coordinates?.[coordinates.length - 1]?.name || "Parada de destino"}
          </p>

          {/* Premium Bell Toggle */}
          <button
            onClick={() => setNotifyEnabled(!notifyEnabled)}
            aria-label="Toggle notificaciones de proximidad"
            className={cn(
              "w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl border transition-all duration-300 font-sans",
              notifyEnabled 
                ? "bg-[#00E5A0]/10 border-[#00E5A0]/25 text-[#00E5A0] shadow-[0_0_15px_rgba(0,229,160,0.05)]" 
                : "bg-white/5 border-white/5 text-[#F0F2FF]"
            )}
          >
            <div className="flex items-center gap-2.5">
              <Bell className={cn("w-4 h-4", notifyEnabled ? "text-[#00E5A0] fill-[#00E5A0]/10" : "text-[#8B8FA8]")} />
              <span className="text-xs font-bold">Alarmar antes de llegar</span>
            </div>
            <div className={cn(
              "w-9 h-5 rounded-full transition-all relative flex items-center px-0.5",
              notifyEnabled ? "bg-[#00E5A0]" : "bg-white/10"
            )}>
              <motion.div
                layout
                className="w-4 h-4 rounded-full bg-[#0D0F14] shadow"
                animate={{ x: notifyEnabled ? 16 : 0 }}
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
              />
            </div>
          </button>
        </motion.div>

        {/* Quick Actions Panel */}
        <div className="grid grid-cols-5 gap-2">
          {/* Custom alert settings */}
          <button
            onClick={() => setShowAlertSheet(true)}
            className="flex flex-col items-center justify-center p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 focus-ring-premium text-center space-y-1 relative"
          >
            <Bell className="w-4 h-4 text-[#00E5A0]" />
            {hasAlertActive && (
              <span className="absolute top-2 right-2 flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00E5A0] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#00E5A0]"></span>
              </span>
            )}
            <span className="text-[8px] font-bold text-[#8B8FA8]">Alerta</span>
          </button>

          {/* Share */}
          <button
            onClick={handleShare}
            className="flex flex-col items-center justify-center p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 focus-ring-premium text-center space-y-1"
          >
            <Share2 className="w-4 h-4 text-[#4F8EF7]" />
            <span className="text-[8px] font-bold text-[#8B8FA8]">Compartir</span>
          </button>

          {/* Favorite */}
          <button
            onClick={handleToggleFavorite}
            className="flex flex-col items-center justify-center p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 focus-ring-premium text-center space-y-1"
          >
            <Star className={cn("w-4 h-4 text-[#EAB308] transition-transform duration-300", isFavorite ? "fill-[#EAB308] scale-110" : "")} />
            <span className="text-[8px] font-bold text-[#8B8FA8]">Favorito</span>
          </button>

          {/* Report traffic/incident */}
          <button
            onClick={() => setShowReportSheet(true)}
            className="flex flex-col items-center justify-center p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 focus-ring-premium text-center space-y-1"
          >
            <ShieldAlert className="w-4 h-4 text-[#FF6B6B]" />
            <span className="text-[8px] font-bold text-[#8B8FA8]">Reportar</span>
          </button>

          {/* Cancel/Log end */}
          <button
            onClick={() => setShowCancelDialog(true)}
            className="flex flex-col items-center justify-center p-2 rounded-xl bg-[#FF6B6B]/5 hover:bg-[#FF6B6B]/15 border border-[#FF6B6B]/10 focus-ring-premium text-center space-y-1"
          >
            <X className="w-4 h-4 text-[#FF6B6B]" />
            <span className="text-[8px] font-bold text-[#FF6B6B]">Terminar</span>
          </button>
        </div>
      </div>

      {/* Alerts popup configurator */}
      <AlertConfigSheet
        isOpen={showAlertSheet}
        onClose={() => setShowAlertSheet(false)}
        onSave={handleAlertSave}
      />

      {/* Confirmation of commute cancellation */}
      <ConfirmDialog
        isOpen={showCancelDialog}
        onClose={() => setShowCancelDialog(false)}
        onConfirm={handleCancelTrip}
        title="¿Terminar el viaje?"
        message="Se detendrá la navegación del autobús y guardaremos este trayecto en tu historial de Perfil."
        confirmText="Terminar Viaje"
        cancelText="Seguir en ruta"
        variant="destructive"
      />

      {/* Feedbacks Toast */}
      <Toast
        isOpen={toast.isOpen}
        onClose={() => setToast({ ...toast, isOpen: false })}
        message={toast.message}
        type={toast.type}
      />

      {/* Report incident bottom sheet */}
      <AnimatePresence>
        {showReportSheet && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowReportSheet(false)}
              className="absolute inset-0 bg-black z-[1001]"
            />
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="absolute bottom-0 left-0 right-0 z-[1002] bg-[#131520] border-t border-white/5 rounded-t-[28px] p-6 pb-12 shadow-2xl space-y-4"
            >
              <div className="w-10 h-1 bg-white/15 rounded-full mx-auto mb-2" />
              
              <div className="space-y-1 text-center">
                <h3 className="text-sm font-bold text-[#F0F2FF] font-display">Reportar Novedad en Ruta</h3>
                <p className="text-xs text-[#8B8FA8] font-sans">
                  Ayuda a otros pasajeros reportando las condiciones actuales de la vía o del bus.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  onClick={() => handleCreateReport("traffic")}
                  className="flex flex-col items-center p-4 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 active:scale-[0.98] transition-all text-center space-y-2 group"
                >
                  <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center border border-amber-500/20 text-amber-500 group-hover:scale-110 transition-transform">
                    <AlertTriangle className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-bold text-[#F0F2FF]">Tráfico Pesado</span>
                </button>

                <button
                  onClick={() => handleCreateReport("full")}
                  className="flex flex-col items-center p-4 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 active:scale-[0.98] transition-all text-center space-y-2 group"
                >
                  <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center border border-purple-500/20 text-purple-500 group-hover:scale-110 transition-transform">
                    <Users className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-bold text-[#F0F2FF]">Bus Lleno</span>
                </button>

                <button
                  onClick={() => handleCreateReport("delay")}
                  className="flex flex-col items-center p-4 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 active:scale-[0.98] transition-all text-center space-y-2 group"
                >
                  <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center border border-red-500/20 text-red-500 group-hover:scale-110 transition-transform">
                    <Hourglass className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-bold text-[#F0F2FF]">Retraso</span>
                </button>

                <button
                  onClick={() => handleCreateReport("police")}
                  className="flex flex-col items-center p-4 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 active:scale-[0.98] transition-all text-center space-y-2 group"
                >
                  <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center border border-blue-500/20 text-blue-500 group-hover:scale-110 transition-transform">
                    <Eye className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-bold text-[#F0F2FF]">Retén Vial</span>
                </button>
              </div>

              <button
                onClick={() => setShowReportSheet(false)}
                className="w-full py-3 rounded-xl border border-white/5 hover:bg-white/5 text-xs text-[#8B8FA8] font-bold transition-colors"
              >
                Cancelar
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
