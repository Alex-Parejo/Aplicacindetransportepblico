import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router";
import { Bus, MapPin, ArrowRight, Clock, Heart, SlidersHorizontal, AlertCircle } from "lucide-react";
import { api, type UserProfile } from "../services/api";
import { type BusRoute } from "../data/routes";
import { SearchBar } from "../components/SearchBar";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "../components/ui/utils";

export function Routes() {
  const navigate = useNavigate();
  const [routes, setRoutes] = useState<BusRoute[]>([]);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState<"all" | "favorites">("all");
  const [loading, setLoading] = useState(true);

  // Load routes and profile asynchronously
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
      } catch (err) {
        console.error("Error fetching routes:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const handleResultSelect = (type: "route" | "stop" | "sector", id: string) => {
    if (type === "route") {
      navigate(`/route/${id}`);
    } else {
      navigate("/", { state: { filterType: type, filterId: id } });
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
      console.error("Error toggling favorite route:", err);
    }
  };

  // Get greeting based on time of day
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Buenos días";
    if (hour < 19) return "Buenas tardes";
    return "Buenas noches";
  };

  // Predefined premium gradients matching each route color
  const getRouteGradient = (color: string) => {
    return `linear-gradient(135deg, ${color} 0%, rgba(13, 15, 20, 0.4) 100%)`;
  };

  // Filter routes based on search and selected tab
  const displayedRoutes = routes.filter((route) => {
    const matchesSearch = 
      route.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      route.number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      route.origin.toLowerCase().includes(searchTerm.toLowerCase()) ||
      route.destination.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (activeTab === "favorites") {
      const isFavorite = profile?.favorites.includes(route.id) || false;
      return matchesSearch && isFavorite;
    }
    
    return matchesSearch;
  });

  return (
    <div className="pb-16 max-w-2xl mx-auto space-y-6">
      {/* Header Info */}
      <div className="space-y-4">
        <div>
          <span className="text-xs font-bold text-[#8B8FA8] uppercase tracking-wider font-display block">
            {getGreeting()}, {profile?.name.split(" ")[0] || "Viajero"} 👋
          </span>
          <h1 className="text-2xl md:text-3xl font-extrabold text-[#F0F2FF] font-display text-wrap-balance mt-1">
            Rutas de Autobús
          </h1>
        </div>

        {/* Stats Strip */}
        <div className="flex gap-2.5 overflow-x-auto scrollbar-hide pb-1">
          <div className="flex items-center gap-2 px-3.5 py-2 rounded-full whitespace-nowrap border border-white/5 glass-panel-light text-xs font-semibold">
            <Bus className="w-3.5 h-3.5 text-[#00E5A0]" aria-hidden="true" />
            <span className="text-[#F0F2FF] font-mono">{routes.length} Rutas</span>
          </div>

          <div className="flex items-center gap-2 px-3.5 py-2 rounded-full whitespace-nowrap border border-white/5 glass-panel-light text-xs font-semibold">
            <MapPin className="w-3.5 h-3.5 text-[#4F8EF7]" aria-hidden="true" />
            <span className="text-[#F0F2FF] font-mono">60+ Paradas</span>
          </div>

          <div className="flex items-center gap-2 px-3.5 py-2 rounded-full whitespace-nowrap border border-white/5 glass-panel-light text-xs font-semibold">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00E5A0] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#00E5A0]"></span>
            </span>
            <span className="text-[#F0F2FF]">Operando en vivo</span>
          </div>
        </div>
      </div>

      {/* Autocomplete Search input */}
      <div className="w-full">
        <SearchBar onResultSelect={handleResultSelect} />
      </div>

      {/* Tabs Selector */}
      <div className="flex p-1 rounded-xl bg-white/5 border border-white/[0.03] select-none">
        <button
          onClick={() => setActiveTab("all")}
          className={cn(
            "flex-1 py-2 text-xs font-bold rounded-lg transition-all focus-ring-premium text-center",
            activeTab === "all" ? "bg-white/10 text-white shadow-sm" : "text-[#8B8FA8] hover:text-[#F0F2FF]"
          )}
        >
          Todas las rutas
        </button>
        <button
          onClick={() => setActiveTab("favorites")}
          className={cn(
            "flex-1 py-2 text-xs font-bold rounded-lg transition-all focus-ring-premium text-center flex items-center justify-center gap-1.5",
            activeTab === "favorites" ? "bg-white/10 text-white shadow-sm" : "text-[#8B8FA8] hover:text-[#F0F2FF]"
          )}
        >
          <Heart className={cn("w-3.5 h-3.5", activeTab === "favorites" ? "fill-[#FF6B6B] text-[#FF6B6B]" : "")} />
          Favoritas ({profile?.favorites.length || 0})
        </button>
      </div>

      {/* Routes list layout */}
      <div className="space-y-3">
        {loading ? (
          // Shimmer loading cards
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-[96px] w-full rounded-2xl bg-white/5 border border-white/[0.03] animate-pulse" />
          ))
        ) : (
          <AnimatePresence mode="popLayout">
            {displayedRoutes.length > 0 ? (
              displayedRoutes.map((route, index) => {
                const isFavorite = profile?.favorites.includes(route.id) || false;
                
                return (
                  <motion.div
                    key={route.id}
                    layout
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.25, delay: index * 0.03, ease: [0.23, 1, 0.32, 1] }}
                  >
                    <Link to={`/route/${route.id}`} className="block focus-ring-premium rounded-2xl">
                      <div className="relative rounded-2xl border border-white/5 p-4 flex items-center gap-4 glass-panel group hover:border-[#00E5A0]/20 transition-all duration-300">
                        
                        {/* Glowing highlight background on hover */}
                        <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-transparent to-[#00E5A0]/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

                        {/* Route Number Badge */}
                        <div
                          className="w-14 h-14 rounded-xl flex flex-col items-center justify-center flex-shrink-0 text-white font-bold shadow-lg"
                          style={{
                            background: getRouteGradient(route.color),
                            border: `1px solid ${route.color}25`
                          }}
                        >
                          <Bus className="w-4 h-4 mb-0.5" />
                          <span className="text-xs font-mono tracking-tight leading-none">{route.number}</span>
                        </div>

                        {/* Route details */}
                        <div className="flex-1 min-w-0">
                          <h3 className="text-sm md:text-base font-bold text-[#F0F2FF] truncate font-display group-hover:text-primary transition-colors">
                            {route.name}
                          </h3>

                          {/* Origin to destination line */}
                          <div className="flex items-center gap-1.5 text-xs text-[#8B8FA8] mt-1 font-sans truncate">
                            <MapPin className="w-3.5 h-3.5 flex-shrink-0 text-[#8B8FA8]" />
                            <span>{route.origin}</span>
                            <ArrowRight className="w-3 h-3 text-[#4A4D60] flex-shrink-0" />
                            <span>{route.destination}</span>
                          </div>

                          {/* Stats and pricing */}
                          <div className="flex items-center gap-3 text-xs mt-2 text-[#8B8FA8] font-mono">
                            <div className="flex items-center gap-1.5">
                              <Clock className="w-3.5 h-3.5 text-secondary" />
                              <span>{route.frequency}</span>
                            </div>
                            <span className="font-bold text-[#00E5A0] tabular-nums">{route.fare}</span>
                          </div>
                        </div>

                        {/* Actions buttons */}
                        <div className="flex items-center gap-2 relative z-10">
                          <button
                            onClick={(e) => handleToggleFavorite(e, route.id)}
                            aria-label={isFavorite ? "Quitar de favoritos" : "Guardar en favoritos"}
                            className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 active:scale-95 transition-all focus-ring-premium border border-white/5"
                          >
                            <Heart
                              className={cn(
                                "w-4 h-4 transition-all duration-300",
                                isFavorite ? "fill-[#FF6B6B] text-[#FF6B6B] scale-110" : "text-[#4A4D60]"
                              )}
                            />
                          </button>

                          <div className="p-2.5 rounded-xl bg-white/5 group-hover:bg-primary/10 transition-colors border border-white/5">
                            <ArrowRight className="w-4 h-4 text-[#8B8FA8] group-hover:text-[#00E5A0] transition-colors" />
                          </div>
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                );
              })
            ) : (
              // Empty search / favorites view
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="rounded-2xl p-12 text-center border border-white/5 glass-panel py-16 space-y-4"
              >
                <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mx-auto border border-white/5 text-[#8B8FA8]">
                  <AlertCircle className="w-8 h-8 opacity-40 animate-pulse" />
                </div>
                <div className="space-y-1.5 max-w-sm mx-auto">
                  <p className="text-base font-bold text-[#F0F2FF] font-display">
                    {activeTab === "favorites" ? "No tienes favoritas" : "No hay resultados"}
                  </p>
                  <p className="text-xs text-[#8B8FA8] font-sans">
                    {activeTab === "favorites"
                      ? "Agrégalas pulsando el icono del corazón en la lista de rutas."
                      : "No encontramos rutas que coincidan con tu búsqueda. Prueba con otro término."}
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}
