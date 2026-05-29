import { useState, useEffect } from "react";
import { Link } from "react-router";
import { Bus, Clock, MapPin, ArrowRight, Star, Heart } from "lucide-react";
import { api, type UserProfile } from "../services/api";
import { type BusRoute } from "../data/routes";
import { LiveMapView } from "../components/LiveMapView";
import { BottomSheet } from "../components/BottomSheet";
import { RouteChip } from "../components/RouteChip";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "../components/ui/utils";

export function Home() {
  const [routes, setRoutes] = useState<BusRoute[]>([]);
  const [selectedRoute, setSelectedRoute] = useState<string | null>(null);
  const [lastViewedRoute, setLastViewedRoute] = useState<BusRoute | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const [routesData, profileData] = await Promise.all([
          api.getRoutes(),
          api.getProfile()
        ]);
        setRoutes(routesData);
        setProfile(profileData);
        
        // Restore last viewed route or default to route "1"
        const lastId = localStorage.getItem("bussamario_last_viewed_id");
        const lastRoute = routesData.find(r => r.id === (lastId || "1"));
        setLastViewedRoute(lastRoute || routesData[0] || null);
      } catch (err) {
        console.error("Error loading home data:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const handleRouteSelect = (routeId: string) => {
    setSelectedRoute(routeId === selectedRoute ? null : routeId);
    
    const route = routes.find((r) => r.id === routeId);
    if (route) {
      setLastViewedRoute(route);
      localStorage.setItem("bussamario_last_viewed_id", routeId);
    }
  };

  const handleToggleFavorite = async (e: React.MouseEvent, routeId: string) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      const updatedFavorites = await api.toggleFavoriteRoute(routeId);
      if (profile) {
        setProfile({ ...profile, favorites: updatedFavorites });
      }
    } catch (err) {
      console.error("Error toggling favorite:", err);
    }
  };

  // Collapsed bottom sheet content
  const collapsedContent = (
    <div className="space-y-4 pb-20 select-none">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-bold uppercase tracking-wider text-[#4A4D60] font-display">
          Rutas Cercanas
        </h2>
        <span className="text-[10px] bg-[#00E5A0]/10 border border-[#00E5A0]/20 text-[#00E5A0] px-2 py-0.5 rounded-full font-bold">
          GPS Activo
        </span>
      </div>

      {/* Horizontal scrollable chips */}
      <div className="flex gap-2.5 overflow-x-auto pb-1.5 -mx-6 px-6 scrollbar-hide">
        {loading ? (
          // Shimmer chips
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-9 w-28 rounded-xl bg-white/5 animate-pulse flex-shrink-0" />
          ))
        ) : (
          routes.slice(0, 7).map((route) => (
            <RouteChip
              key={route.id}
              number={route.number}
              name={route.name}
              color={route.color}
              isActive={selectedRoute === route.id}
              onClick={() => handleRouteSelect(route.id)}
            />
          ))
        )}
      </div>

      {/* Last viewed route mini card */}
      {lastViewedRoute && (
        <div className="space-y-2">
          <p className="text-[10px] font-bold uppercase tracking-wider text-[#4A4D60] font-display">
            Última ruta consultada
          </p>
          <Link to={`/route/${lastViewedRoute.id}`} className="block focus-ring-premium rounded-2xl">
            <motion.div
              whileHover={{ scale: 1.01, translateY: -2 }}
              whileTap={{ scale: 0.99 }}
              className="p-3.5 rounded-2xl border border-white/5 glass-panel flex items-center gap-3"
            >
              <div
                className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg text-white font-mono font-bold"
                style={{ backgroundColor: lastViewedRoute.color }}
              >
                {lastViewedRoute.number}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-bold text-sm text-[#F0F2FF] truncate font-display">
                  {lastViewedRoute.name}
                </h4>
                <div className="flex items-center gap-2 mt-0.5 text-xs text-[#8B8FA8] font-sans">
                  <Clock className="w-3.5 h-3.5 text-primary" />
                  <span>{lastViewedRoute.frequency}</span>
                  <span className="text-[#00E5A0] font-bold font-mono">{lastViewedRoute.fare}</span>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-[#00E5A0]" />
            </motion.div>
          </Link>
        </div>
      )}
    </div>
  );

  // Expanded bottom sheet content
  const expandedContent = (
    <div className="space-y-5 select-none">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-bold text-[#F0F2FF] font-display">
          Todas las Rutas
        </h2>
        <span className="text-xs text-[#8B8FA8] font-mono">
          {routes.length} rutas disponibles
        </span>
      </div>

      <div className="grid gap-3 pb-24">
        {loading ? (
          // Shimmer route cards
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-20 w-full rounded-2xl bg-white/5 animate-pulse border border-white/[0.03]" />
          ))
        ) : (
          routes.map((route, index) => {
            const isFavorite = profile?.favorites.includes(route.id);
            const isSelected = selectedRoute === route.id;
            
            return (
              <motion.div
                key={route.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: Math.min(index * 0.04, 0.4), ease: "easeOut" }}
              >
                <Link to={`/route/${route.id}`} className="block focus-ring-premium rounded-2xl">
                  <div
                    className={cn(
                      "p-3.5 rounded-2xl border transition-all duration-300 glass-panel flex items-center gap-3.5 hover:border-white/10 relative group",
                      isSelected && "border-[#00E5A0]/40 shadow-[0_0_20px_rgba(0,229,160,0.1)]"
                    )}
                  >
                    {/* Color badge tag */}
                    <div
                      className="w-12 h-12 rounded-xl flex flex-col items-center justify-center flex-shrink-0 text-white font-bold shadow-md"
                      style={{ backgroundColor: route.color }}
                    >
                      <Bus className="w-4 h-4 mb-0.5" />
                      <span className="text-[10px] font-mono leading-none">{route.number}</span>
                    </div>

                    {/* Route Details */}
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-sm text-[#F0F2FF] truncate font-display group-hover:text-primary transition-colors">
                        {route.name}
                      </h4>
                      
                      <div className="flex items-center gap-1 text-[11px] text-[#8B8FA8] mt-1 font-sans truncate">
                        <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
                        <span>{route.origin}</span>
                        <ArrowRight className="w-3 h-3 mx-0.5 flex-shrink-0" />
                        <span>{route.destination}</span>
                      </div>

                      <div className="flex items-center gap-3 text-xs mt-2 text-[#8B8FA8] font-mono">
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-secondary" />
                          <span>{route.frequency}</span>
                        </div>
                        <span className="font-bold text-[#00E5A0]">{route.fare}</span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={(e) => handleToggleFavorite(e, route.id)}
                        aria-label={isFavorite ? "Quitar de favoritos" : "Guardar en favoritos"}
                        className="p-2 rounded-xl bg-white/5 hover:bg-white/10 active:scale-95 transition-all focus-ring-premium"
                      >
                        <Heart
                          className={cn(
                            "w-4 h-4 transition-all duration-300",
                            isFavorite ? "fill-[#FF6B6B] text-[#FF6B6B] scale-110" : "text-[#4A4D60]"
                          )}
                        />
                      </button>
                      
                      <div className="p-2 rounded-xl bg-white/5 group-hover:bg-primary/10 transition-colors">
                        <ArrowRight className="w-4 h-4 text-[#8B8FA8] group-hover:text-primary transition-colors" />
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            );
          })
        )}
      </div>
    </div>
  );

  return (
    <div className="absolute inset-0 flex flex-col overflow-hidden">
      {/* Offline Status Bar */}
      <AnimatePresence>
        {!isOnline && (
          <motion.div
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -30 }}
            className="absolute top-20 left-4 right-4 z-[999] p-3 rounded-2xl bg-amber-500/15 border border-amber-500/25 backdrop-blur-md text-[#F59E0B] flex items-center justify-between shadow-[0_8px_32px_rgba(0,0,0,0.4)]"
          >
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-500 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
              </span>
              <span className="text-xs font-bold font-display">Modo Offline Activo</span>
            </div>
            <span className="text-[9px] bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-lg font-mono font-bold">
              DATOS LOCALES
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Full screen map */}
      <div className="flex-1 relative z-0">
        <LiveMapView
          onRouteSelect={handleRouteSelect}
          selectedRoute={selectedRoute}
        />
      </div>

      {/* Draggable bottom sheet details */}
      <BottomSheet
        collapsedContent={collapsedContent}
        expandedContent={expandedContent}
      />
    </div>
  );
}