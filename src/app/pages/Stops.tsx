import { useEffect, useState } from "react";
import { api } from "../services/api";
import { type BusStop, type BusRoute } from "../data/routes";
import { MapPin, Clock, Bus, Search, Navigation, Info, AlertTriangle } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "../components/ui/utils";

export function Stops() {
  const [stops, setStops] = useState<BusStop[]>([]);
  const [routes, setRoutes] = useState<BusRoute[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const [stopsData, routesData] = await Promise.all([
          api.getStops(),
          api.getRoutes()
        ]);
        setStops(stopsData);
        setRoutes(routesData);
      } catch (err) {
        console.error("Error loading stops data:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const getRouteName = (routeId: string) => {
    const route = routes.find((r) => r.id === routeId);
    return route ? route.name : "";
  };

  const getRouteColor = (routeId: string) => {
    const route = routes.find((r) => r.id === routeId);
    return route ? route.color : "#8B8FA8";
  };

  const getRouteNumber = (routeId: string) => {
    const route = routes.find((r) => r.id === routeId);
    return route ? route.number : "";
  };

  const filteredStops = stops.filter(
    (stop) =>
      stop.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      stop.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="pb-24 max-w-2xl mx-auto space-y-6 select-none">
      {/* Header Banner */}
      <motion.div 
        initial={{ opacity: 0, y: -15 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden border border-white/5 p-6 rounded-3xl glass-panel"
      >
        <div className="absolute -right-24 -top-24 w-48 h-48 rounded-full bg-gradient-to-br from-[#FF6B6B]/25 to-[#F59E0B]/25 blur-[90px]" />
        
        <div className="relative z-10 space-y-2">
          <div className="flex items-center gap-2 text-[#FF6B6B]">
            <MapPin className="w-5 h-5" />
            <h1 className="text-xl md:text-2xl font-extrabold text-[#F0F2FF] font-display leading-none">
              Paraderos de Buses
            </h1>
          </div>
          <p className="text-xs text-[#8B8FA8] font-sans max-w-md">
            Consulta los tiempos de llegada estimados para las busetas que se aproximan a cada parada en tiempo real.
          </p>
        </div>
      </motion.div>

      {/* Search Input */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="relative"
      >
        <div className="flex items-center gap-3 px-4 py-3 rounded-2xl glass-panel border border-white/5 focus-within:border-[#FF6B6B]/30 transition-all duration-300">
          <Search className="w-5 h-5 text-[#4A4D60]" aria-hidden="true" />
          <input
            type="text"
            placeholder="Buscar paradero o ubicación…"
            value={searchTerm}
            aria-label="Buscar paraderos por nombre o ubicación"
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-transparent border-none outline-none text-[#F0F2FF] font-sans text-sm focus:ring-0 placeholder-[#4A4D60]"
          />
        </div>
      </motion.div>

      {/* Title bar */}
      <div className="flex items-center justify-between px-1">
        <h2 className="text-sm font-bold uppercase tracking-wider text-[#8B8FA8] font-display">
          Paraderos en Santa Marta
        </h2>
        <span className="text-[10px] text-[#4A4D60] font-mono font-bold">
          {filteredStops.length} paradas encontradas
        </span>
      </div>

      {/* Stops list */}
      <div className="space-y-4">
        {loading ? (
          // Shimmer loading
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-32 w-full rounded-2xl bg-white/5 border border-white/[0.03] animate-pulse" />
          ))
        ) : (
          <AnimatePresence mode="popLayout">
            {filteredStops.length > 0 ? (
              filteredStops.map((stop, index) => (
                <motion.div
                  key={stop.id}
                  layout
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.25, delay: Math.min(index * 0.04, 0.4), ease: [0.23, 1, 0.32, 1] }}
                  className="rounded-2xl border border-white/5 p-4 glass-panel space-y-4"
                >
                  {/* Stop header details */}
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#FF6B6B]/10 border border-[#FF6B6B]/20 flex items-center justify-center flex-shrink-0 text-[#FF6B6B] shadow-md">
                      <MapPin className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-sm text-[#F0F2FF] font-display truncate">
                        {stop.name}
                      </h3>
                      <p className="text-[10px] text-[#8B8FA8] flex items-center gap-1 mt-0.5 font-sans">
                        <Navigation className="w-3 h-3 text-[#4A4D60]" />
                        {stop.location}
                      </p>
                    </div>
                  </div>

                  {/* Connected routes list */}
                  <div className="space-y-1.5">
                    <span className="text-[9px] font-bold uppercase tracking-wider text-[#4A4D60] font-display block">
                      Rutas que pasan por aquí
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {stop.routes.map((routeId) => (
                        <div
                          key={routeId}
                          className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold text-white shadow-sm border border-white/5"
                          style={{ 
                            backgroundColor: getRouteColor(routeId),
                          }}
                        >
                          <Bus className="w-3 h-3 text-white/90" />
                          <span>Ruta {getRouteNumber(routeId)}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Arrivals tracking card */}
                  <div className="bg-white/[0.02] border border-white/5 rounded-xl p-3.5 space-y-3">
                    <div className="flex items-center gap-2 text-xs font-bold text-[#8B8FA8] font-display">
                      <Clock className="w-4 h-4 text-primary" />
                      <span>Próximas Busetas</span>
                    </div>

                    <div className="space-y-2 divide-y divide-white/[0.03]">
                      {stop.nextArrivals.map((arrival, idx) => (
                        <div
                          key={idx}
                          className={cn(
                            "flex justify-between items-center text-xs font-sans",
                            idx > 0 ? "pt-2" : ""
                          )}
                        >
                          <div className="flex items-center gap-2">
                            <span 
                              className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                              style={{ backgroundColor: getRouteColor(arrival.routeId) }}
                            />
                            <span className="text-[#F0F2FF] font-medium font-display truncate max-w-[150px]">
                              Ruta {getRouteNumber(arrival.routeId)} · {getRouteName(arrival.routeId).split(" - ")[1] || "Destino"}
                            </span>
                          </div>
                          
                          <span className="font-extrabold text-[#00E5A0] font-mono tabular-nums bg-[#00E5A0]/10 border border-[#00E5A0]/20 px-2 py-0.5 rounded-md">
                            {arrival.estimatedTime} min
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              ))
            ) : (
              // Empty search view
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="rounded-2xl p-12 text-center border border-white/5 glass-panel py-16 space-y-4"
              >
                <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mx-auto border border-white/5 text-[#8B8FA8]">
                  <AlertTriangle className="w-8 h-8 opacity-40 animate-pulse" />
                </div>
                <div className="space-y-1.5 max-w-sm mx-auto">
                  <p className="text-base font-bold text-[#F0F2FF] font-display">
                    Sin Resultados
                  </p>
                  <p className="text-xs text-[#8B8FA8] font-sans">
                    No encontramos paraderos que coincidan con tu búsqueda. Intenta con otro nombre de sector o calle.
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </div>

      {/* Info Tip Footer */}
      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="relative overflow-hidden border border-white/5 p-4 rounded-2xl glass-panel flex gap-3 items-center select-none"
      >
        <div className="w-8 h-8 rounded-lg bg-secondary/15 flex items-center justify-center flex-shrink-0 text-secondary">
          <Info className="w-4.5 h-4.5" />
        </div>
        <p className="text-[10px] text-[#8B8FA8] font-sans leading-relaxed">
          <strong>Tip de Viaje:</strong> Los tiempos de llegada se calculan de manera autónoma con el GPS en vivo de las busetas. Pueden fluctuar ligeramente de acuerdo con el tráfico de la ciudad.
        </p>
      </motion.div>
    </div>
  );
}
