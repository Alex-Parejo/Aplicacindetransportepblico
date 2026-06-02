import { useParams, Link, useNavigate } from "react-router";
import { useEffect, useState } from "react";
import { ArrowLeft, Bus, Clock, MapPin, DollarSign, Navigation, Calendar, Activity, AlertCircle } from "lucide-react";
import { api } from "../services/api";
import { type BusRoute } from "../data/routes";
import { RouteMap } from "../components/RouteMap";
import { motion, AnimatePresence } from "motion/react";
import { useTrip } from "../context/TripContext";
import { cn } from "../components/ui/utils";

export function RouteDetail() {
  const { routeId } = useParams();
  const navigate = useNavigate();
  const { setActiveTrip } = useTrip();
  
  const [route, setRoute] = useState<BusRoute | null>(null);
  const [scheduleToggle, setScheduleToggle] = useState<"weekday" | "weekend">("weekday");
  const [loading, setLoading] = useState(true);
  const [selectedStopIndex, setSelectedStopIndex] = useState<number | null>(null);

  useEffect(() => {
    async function loadRoute() {
      if (!routeId) return;
      try {
        setLoading(true);
        const data = await api.getRouteDetail(routeId);
        setRoute(data);
      } catch (err) {
        console.error("Error loading route details:", err);
      } finally {
        setLoading(false);
      }
    }
    loadRoute();
  }, [routeId]);

  const handleStartTrip = () => {
    if (route) {
      setActiveTrip(route.id);
      navigate("/my-trip");
    }
  };

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto space-y-6 pb-24">
        {/* Shimmer Header */}
        <div className="h-44 w-full rounded-3xl bg-white/5 border border-white/[0.03] animate-pulse" />
        {/* Shimmer Stats */}
        <div className="grid grid-cols-3 gap-3">
          <div className="h-20 rounded-2xl bg-white/5 animate-pulse" />
          <div className="h-20 rounded-2xl bg-white/5 animate-pulse" />
          <div className="h-20 rounded-2xl bg-white/5 animate-pulse" />
        </div>
        {/* Shimmer Map */}
        <div className="h-48 rounded-3xl bg-white/5 animate-pulse" />
      </div>
    );
  }

  if (!route) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md mx-auto text-center py-16 px-8 rounded-3xl border border-white/5 glass-panel space-y-6"
      >
        <div className="w-16 h-16 bg-destructive/10 border border-destructive/20 rounded-full flex items-center justify-center mx-auto text-destructive">
          <AlertCircle className="w-8 h-8 animate-bounce" />
        </div>
        <div className="space-y-2">
          <h2 className="text-xl font-bold text-[#F0F2FF] font-display">
            Ruta No Encontrada
          </h2>
          <p className="text-xs text-[#8B8FA8] font-sans">
            La ruta de autobús que buscas no existe o ha sido descontinuada.
          </p>
        </div>
        <Link to="/routes" className="block focus-ring-premium rounded-xl">
          <button className="w-full py-3 bg-white/5 hover:bg-white/10 text-white rounded-xl font-bold transition-all">
            Volver a las rutas
          </button>
        </Link>
      </motion.div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto pb-36 space-y-6 select-none relative">
      {/* Route Detail Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative rounded-3xl overflow-hidden border border-white/5 p-6 glass-panel"
      >
        {/* Color Glow Overlay */}
        <div 
          className="absolute -right-24 -top-24 w-48 h-48 rounded-full blur-[80px] opacity-25"
          style={{ backgroundColor: route.color }}
        />

        {/* Back Link */}
        <button onClick={() => navigate(-1)} className="inline-flex items-center gap-2 text-xs font-bold text-[#8B8FA8] hover:text-[#F0F2FF] transition-colors focus-ring-premium rounded-lg px-2 py-1 bg-white/5 border border-white/5 mb-5">
          <ArrowLeft className="w-4 h-4" />
          Atrás
        </button>

        {/* Main Badge + Info */}
        <div className="space-y-3">
          <span
            className="inline-block px-3 py-1 rounded-lg text-[10px] font-bold text-white font-mono shadow-md border"
            style={{
              backgroundColor: route.color,
              borderColor: `${route.color}33`,
            }}
          >
            RUTA {route.number}
          </span>
          
          <h1 className="text-xl md:text-2xl font-extrabold text-[#F0F2FF] font-display leading-snug">
            {route.name}
          </h1>

          <div className="flex items-center gap-2 text-xs text-[#8B8FA8] font-sans">
            <MapPin className="w-4 h-4 text-primary" />
            <span className="truncate">{route.origin}</span>
            <span className="text-[#4A4D60]">•</span>
            <span className="truncate">{route.destination}</span>
          </div>
        </div>
      </motion.div>

      {/* Stats Cards Row */}
      <div className="grid grid-cols-3 gap-3">
        {/* Frequency */}
        <motion.div
          whileHover={{ translateY: -2 }}
          className="p-3.5 rounded-2xl border border-white/5 glass-panel text-center space-y-1.5"
        >
          <div className="flex items-center justify-center gap-1.5 text-[#8B8FA8]">
            <Clock className="w-3.5 h-3.5 text-primary" />
            <span className="text-[10px] font-bold uppercase tracking-wider font-display">Intervalo</span>
          </div>
          <p className="text-sm font-extrabold text-[#F0F2FF] font-mono leading-none">
            {route.frequency.replace("Cada ", "")}
          </p>
        </motion.div>

        {/* Fare */}
        <motion.div
          whileHover={{ translateY: -2 }}
          className="p-3.5 rounded-2xl border border-white/5 glass-panel text-center space-y-1.5"
        >
          <div className="flex items-center justify-center gap-1.5 text-[#8B8FA8]">
            <DollarSign className="w-3.5 h-3.5 text-secondary" />
            <span className="text-[10px] font-bold uppercase tracking-wider font-display">Tarifa</span>
          </div>
          <p className="text-sm font-extrabold text-[#00E5A0] font-mono leading-none">
            {route.fare}
          </p>
        </motion.div>

        {/* Stops */}
        <motion.div
          whileHover={{ translateY: -2 }}
          className="p-3.5 rounded-2xl border border-white/5 glass-panel text-center space-y-1.5"
        >
          <div className="flex items-center justify-center gap-1.5 text-[#8B8FA8]">
            <Activity className="w-3.5 h-3.5 text-[#FF6B6B]" />
            <span className="text-[10px] font-bold uppercase tracking-wider font-display">Paradas</span>
          </div>
          <p className="text-sm font-extrabold text-[#F0F2FF] font-mono leading-none">
            {route.stops.length}
          </p>
        </motion.div>
      </div>

      {/* Map Section */}
      <div className="rounded-3xl overflow-hidden border border-white/5 shadow-2xl h-[220px] relative">
        <RouteMap
          routeId={route.id}
          routeColor={route.color}
          routeName={route.name}
        />
      </div>

      {/* Grid of details: Schedule & Stop Timeline */}
      <div className="grid md:grid-cols-2 gap-6">
        
        {/* Schedule box */}
        <div className="space-y-4 rounded-3xl border border-white/5 p-5 glass-panel h-fit">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-secondary" />
            <h2 className="text-sm font-bold uppercase tracking-wider text-[#8B8FA8] font-display">
              Horarios de Servicio
            </h2>
          </div>

          {/* Segmented active control toggle */}
          <div className="flex p-1 rounded-xl bg-white/5 border border-white/[0.03]">
            <button
              onClick={() => setScheduleToggle("weekday")}
              className="flex-1 py-1.5 text-xs font-bold rounded-lg transition-all relative focus-ring-premium text-center"
            >
              {scheduleToggle === "weekday" && (
                <motion.div
                  layoutId="scheduleActiveBg"
                  className="absolute inset-0 rounded-lg bg-white/10 border border-white/5 -z-10"
                  transition={{ type: "spring", stiffness: 350, damping: 25 }}
                />
              )}
              <span className={scheduleToggle === "weekday" ? "text-white" : "text-[#8B8FA8]"}>Lun - Vie</span>
            </button>
            <button
              onClick={() => setScheduleToggle("weekend")}
              className="flex-1 py-1.5 text-xs font-bold rounded-lg transition-all relative focus-ring-premium text-center"
            >
              {scheduleToggle === "weekend" && (
                <motion.div
                  layoutId="scheduleActiveBg"
                  className="absolute inset-0 rounded-lg bg-white/10 border border-white/5 -z-10"
                  transition={{ type: "spring", stiffness: 350, damping: 25 }}
                />
              )}
              <span className={scheduleToggle === "weekend" ? "text-white" : "text-[#8B8FA8]"}>Sáb - Dom</span>
            </button>
          </div>

          {/* Schedule Clock Times */}
          <div className="space-y-3 pt-1">
            <div className="flex items-center justify-between border-b border-white/[0.03] pb-2">
              <span className="text-xs text-[#8B8FA8] font-sans">Primer servicio</span>
              <span className="text-sm font-extrabold text-[#00E5A0] font-mono">
                {scheduleToggle === "weekday"
                  ? route.schedule.weekday.split(" - ")[0]
                  : route.schedule.weekend.split(" - ")[0]}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-[#8B8FA8] font-sans">Último servicio</span>
              <span className="text-sm font-extrabold text-[#FF6B6B] font-mono">
                {scheduleToggle === "weekday"
                  ? route.schedule.weekday.split(" - ")[1]
                  : route.schedule.weekend.split(" - ")[1]}
              </span>
            </div>
          </div>
        </div>

        {/* Stops timeline box */}
        <div className="space-y-4 rounded-3xl border border-white/5 p-5 glass-panel">
          <h2 className="text-sm font-bold uppercase tracking-wider text-[#8B8FA8] font-display">
            Paradas del Recorrido
          </h2>

          <div className="relative pl-2 pt-2">
            {/* Vertical timeline connector */}
            <div
              className="absolute left-6 top-4 bottom-4 w-0.5"
              style={{ backgroundColor: `${route.color}33` }}
            />

            <div className="space-y-4 max-h-[300px] overflow-y-auto pr-1 scrollbar-hide">
              {route.stops.map((stop, index) => {
                const isFirst = index === 0;
                const isLast = index === route.stops.length - 1;
                const isSelected = selectedStopIndex === index;

                return (
                  <motion.div
                    key={index}
                    onClick={() => setSelectedStopIndex(isSelected ? null : index)}
                    className="flex items-start gap-3 cursor-pointer group"
                    whileHover={{ x: 2 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  >
                    {/* Circle Node */}
                    <div className="relative z-10 flex-shrink-0 mt-0.5">
                      <div
                        className={cn(
                          "w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs border-2 transition-all duration-300 shadow-md",
                          isSelected ? "scale-110" : "group-hover:scale-105"
                        )}
                        style={{
                          backgroundColor: isFirst ? '#00E5A0' : isLast ? '#FF6B6B' : route.color,
                          borderColor: isSelected ? '#F0F2FF' : '#131520',
                          color: '#FFFFFF'
                        }}
                      >
                        {isFirst ? '🚏' : isLast ? '🏁' : index + 1}
                      </div>
                    </div>

                    {/* Node contents */}
                    <div className="flex-1 pt-1.5 min-w-0">
                      <h4 className={cn(
                        "text-xs font-bold truncate transition-colors",
                        isSelected ? "text-[#00E5A0]" : "text-[#F0F2FF] group-hover:text-primary"
                      )}>
                        {stop}
                      </h4>
                      <p className="text-[10px] text-[#8B8FA8] mt-0.5 font-sans">
                        {isFirst && "Punto de partida"}
                        {isLast && "Destino final"}
                        {!isFirst && !isLast && `≈ ${index * 3} min en autobús`}
                      </p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Floating CTA wrapper */}
      <div className="absolute bottom-20 left-0 right-0 z-50 flex justify-center px-4 pointer-events-none">
        <div className="w-full max-w-[450px] pointer-events-auto">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleStartTrip}
            className="w-full py-3.5 rounded-2xl font-bold text-sm shadow-2xl flex items-center justify-center gap-2 bg-[#00E5A0] text-[#0D0F14] hover:bg-[#00E5A0]/90 transition-colors focus-ring-premium"
          >
            <Navigation className="w-4 h-4 fill-[#0D0F14]" />
            Empezar Viaje
          </motion.button>
        </div>
      </div>
    </div>
  );
}