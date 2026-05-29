import { useState } from "react";
import { busStops, busRoutes } from "../data/routes";
import { MapPin, Clock, Bus, Search, Navigation2, Sparkles } from "lucide-react";
import { Input } from "../components/ui/input";
import { Badge } from "../components/ui/badge";
import { motion } from "motion/react";

export function Stops() {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredStops = busStops.filter(
    (stop) =>
      stop.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      stop.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getRouteName = (routeId: string) => {
    const route = busRoutes.find((r) => r.id === routeId);
    return route ? route.name : "";
  };

  const getRouteColor = (routeId: string) => {
    const route = busRoutes.find((r) => r.id === routeId);
    return route ? route.color : "#gray";
  };

  return (
    <div className="space-y-6 pb-6">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative bg-gradient-to-br from-orange-600 via-red-600 to-pink-600 rounded-2xl shadow-2xl p-8 overflow-hidden"
      >
        <motion.div
          animate={{
            scale: [1, 1.3, 1],
            rotate: [0, 90, 0],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "linear",
            type: "keyframes",
          }}
          className="absolute -top-10 -right-10 w-40 h-40 bg-white/20 rounded-full blur-3xl"
        />
        
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-3">
            <motion.div
              animate={{
                y: [0, -5, 0],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
                type: "keyframes",
              }}
              className="bg-white/20 backdrop-blur-sm rounded-2xl p-3"
            >
              <MapPin className="w-7 h-7 text-white" />
            </motion.div>
            <h2 className="text-3xl font-bold text-white">Paraderos</h2>
          </div>
          <p className="text-white/90 text-lg">
            Encuentra los tiempos de llegada estimados para cada paradero
          </p>
        </div>
      </motion.div>

      {/* Location Button */}
      <motion.button
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1 }}
        whileHover={{ scale: 1.02, y: -2 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => alert("Próximamente: Encontrar paraderos cercanos usando GPS")}
        className="relative w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-2xl shadow-xl p-5 flex items-center justify-center gap-3 overflow-hidden"
      >
        <motion.div
          animate={{
            scale: [1, 1.5, 1],
            opacity: [0.5, 0.2, 0.5]
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut",
            type: "keyframes",
          }}
          className="absolute top-0 left-0 w-32 h-32 bg-white/20 rounded-full blur-2xl"
        />
        
        <motion.div
          animate={{
            rotate: [0, 360],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "linear"
          }}
        >
          <Navigation2 className="w-6 h-6" />
        </motion.div>
        <span className="font-bold text-lg relative z-10">Encontrar Paraderos Cercanos</span>
      </motion.button>

      {/* Search */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="relative"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 rounded-xl blur-lg opacity-30" />
        <div className="relative bg-card border border-border rounded-xl shadow-lg">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5 z-10" />
          <Input
            type="text"
            placeholder="Buscar paradero o ubicación..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-12 pr-4 py-6 text-base bg-transparent border-0 text-foreground placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-primary"
          />
        </div>
      </motion.div>

      {/* Stops List */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-foreground">
            Paraderos Disponibles
          </h3>
          <span className="text-sm text-muted-foreground">
            {filteredStops.length} paraderos
          </span>
        </div>

        <div className="space-y-4">
          {filteredStops.map((stop, index) => (
            <motion.div
              key={stop.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 + index * 0.05 }}
              whileHover={{ scale: 1.02, x: 5 }}
              className="bg-card border border-border rounded-2xl shadow-xl overflow-hidden"
            >
              <div className="p-5">
                {/* Stop Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start gap-3 flex-1">
                    <motion.div
                      whileHover={{ rotate: 360 }}
                      transition={{ duration: 0.5 }}
                      className="bg-gradient-to-br from-orange-600 to-red-600 rounded-xl p-2.5 shadow-lg"
                    >
                      <MapPin className="w-5 h-5 text-white" />
                    </motion.div>
                    <div>
                      <h4 className="font-bold text-lg text-foreground mb-1">
                        {stop.name}
                      </h4>
                      <p className="text-sm text-muted-foreground flex items-center gap-1">
                        <Navigation2 className="w-3 h-3" />
                        {stop.location}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Routes */}
                <div className="mb-4">
                  <p className="text-xs text-muted-foreground mb-2 font-semibold">
                    Rutas que pasan:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {stop.routes.map((routeId) => (
                      <Badge
                        key={routeId}
                        className="font-semibold"
                        style={{
                          backgroundColor: getRouteColor(routeId),
                          color: "white",
                        }}
                      >
                        <Bus className="w-3 h-3 mr-1" />
                        {getRouteName(routeId).split(" - ")[0]}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Next Arrivals */}
                <div className="bg-accent/50 rounded-xl p-4 border border-border">
                  <div className="flex items-center gap-2 mb-3">
                    <Clock className="w-4 h-4 text-primary" />
                    <span className="text-sm font-bold text-foreground">
                      Próximas llegadas
                    </span>
                  </div>
                  <div className="space-y-2">
                    {stop.nextArrivals.map((arrival, idx) => (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.4 + index * 0.05 + idx * 0.1 }}
                        className="flex justify-between items-center"
                      >
                        <div className="flex items-center gap-2">
                          <div
                            className="w-2 h-2 rounded-full"
                            style={{ backgroundColor: getRouteColor(arrival.routeId) }}
                          />
                          <span className="text-sm text-foreground font-medium">
                            Ruta {getRouteName(arrival.routeId).split(" - ")[0]}
                          </span>
                        </div>
                        <span className="font-bold text-primary">
                          {arrival.time}
                        </span>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}

          {filteredStops.length === 0 && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-card rounded-2xl shadow-lg p-12 text-center border border-border"
            >
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                  type: "keyframes",
                }}
              >
                <MapPin className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
              </motion.div>
              <p className="text-muted-foreground text-lg">
                No se encontraron paraderos que coincidan con tu búsqueda
              </p>
            </motion.div>
          )}
        </div>
      </div>

      {/* Info Card */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="relative bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl p-5 shadow-lg overflow-hidden"
      >
        <motion.div
          animate={{
            scale: [1, 1.5, 1],
            opacity: [0.5, 0.2, 0.5]
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut",
            type: "keyframes",
          }}
          className="absolute bottom-0 left-0 w-32 h-32 bg-white/20 rounded-full blur-2xl"
        />
        
        <p className="text-sm text-white relative z-10">
          <Sparkles className="inline w-4 h-4 mr-2" />
          <strong>Tip:</strong> Los tiempos de llegada son estimados y pueden variar según el tráfico.
        </p>
      </motion.div>
    </div>
  );
}
