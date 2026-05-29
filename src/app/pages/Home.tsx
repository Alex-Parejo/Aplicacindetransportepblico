// Home v2.0 - Cache cleared
import { Link } from "react-router";
import { busRoutes } from "../data/routes";
import { Bus, Clock, MapPin, ArrowRight } from "lucide-react";
import { useState } from "react";
import { LiveMapView } from "../components/LiveMapView";
import { BottomSheet } from "../components/BottomSheet";
import { RouteChip } from "../components/RouteChip";
import { motion } from "motion/react";

export function Home() {
  const [selectedRoute, setSelectedRoute] = useState<string | null>(null);
  const [lastViewedRoute, setLastViewedRoute] = useState(busRoutes[0]);

  const handleRouteSelect = (routeId: string) => {
    setSelectedRoute(routeId);
    const route = busRoutes.find((r) => r.id === routeId);
    if (route) {
      setLastViewedRoute(route);
    }
  };

  // Collapsed content - route chips + last viewed
  const collapsedContent = (
    <div className="space-y-5 pb-20">
      <h3 className="text-lg font-bold" style={{ fontFamily: 'var(--font-display)', color: '#F0F2FF' }}>
        Rutas cercanas
      </h3>

      {/* Horizontal scrollable chips */}
      <div className="flex gap-3 overflow-x-auto pb-2 -mx-5 px-5 scrollbar-hide">
        {busRoutes.slice(0, 6).map((route) => (
          <RouteChip
            key={route.id}
            number={route.number}
            name={route.name}
            color={route.color}
            isActive={selectedRoute === route.id}
            onClick={() => handleRouteSelect(route.id)}
          />
        ))}
      </div>

      {/* Last viewed route mini card */}
      <div>
        <p className="text-xs font-medium mb-3" style={{ color: '#8B8FA8' }}>
          Última ruta consultada
        </p>
        <Link to={`/route/${lastViewedRoute.id}`}>
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="p-4 rounded-xl border"
            style={{
              backgroundColor: '#1E2029',
              borderColor: 'rgba(255, 255, 255, 0.09)',
              boxShadow: 'var(--shadow-card)',
            }}
          >
            <div className="flex items-center gap-3">
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: lastViewedRoute.color }}
              >
                <Bus className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-sm" style={{ fontFamily: 'var(--font-display)', color: '#F0F2FF' }}>
                  {lastViewedRoute.name}
                </h4>
                <div className="flex items-center gap-2 mt-1">
                  <Clock className="w-3 h-3" style={{ color: '#8B8FA8' }} />
                  <span className="text-xs" style={{ color: '#8B8FA8' }}>
                    {lastViewedRoute.frequency}
                  </span>
                  <span className="text-xs font-bold" style={{ fontFamily: 'var(--font-mono)', color: '#00E5A0' }}>
                    {lastViewedRoute.fare}
                  </span>
                </div>
              </div>
              <ArrowRight className="w-5 h-5" style={{ color: '#00E5A0' }} />
            </div>
          </motion.div>
        </Link>
      </div>
    </div>
  );

  // Expanded content - full route list
  const expandedContent = (
    <div className="space-y-5">
      <h3 className="text-xl font-bold" style={{ fontFamily: 'var(--font-display)', color: '#F0F2FF' }}>
        Todas las rutas
      </h3>

      <div className="space-y-3">
        {busRoutes.map((route, index) => (
          <motion.div
            key={route.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <Link to={`/route/${route.id}`}>
              <motion.div
                whileHover={{ scale: 1.02, x: 5 }}
                whileTap={{ scale: 0.98 }}
                className="p-4 rounded-xl border overflow-hidden relative group"
                style={{
                  backgroundColor: '#161820',
                  borderColor: selectedRoute === route.id ? '#00E5A0' : 'rgba(255, 255, 255, 0.09)',
                }}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-14 h-14 rounded-xl flex flex-col items-center justify-center"
                    style={{ backgroundColor: route.color }}
                  >
                    <Bus className="w-5 h-5 text-white mb-1" />
                    <span className="text-xs font-bold text-white" style={{ fontFamily: 'var(--font-mono)' }}>
                      {route.number}
                    </span>
                  </div>

                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-sm mb-1 truncate" style={{ fontFamily: 'var(--font-display)', color: '#F0F2FF' }}>
                      {route.name}
                    </h4>
                    <div className="flex items-center gap-1.5 text-xs mb-2" style={{ color: '#8B8FA8' }}>
                      <MapPin className="w-3 h-3" />
                      <span className="truncate">{route.origin}</span>
                      <ArrowRight className="w-3 h-3" />
                      <span className="truncate">{route.destination}</span>
                    </div>
                    <div className="flex items-center gap-3 text-xs">
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" style={{ color: '#4F8EF7' }} />
                        <span style={{ color: '#8B8FA8' }}>{route.frequency}</span>
                      </div>
                      <span className="font-bold" style={{ fontFamily: 'var(--font-mono)', color: '#00E5A0' }}>
                        {route.fare}
                      </span>
                    </div>
                  </div>

                  <ArrowRight className="w-5 h-5" style={{ color: '#00E5A0' }} />
                </div>
              </motion.div>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 flex flex-col">
      {/* Full screen map */}
      <div className="flex-1">
        <LiveMapView
          onRouteSelect={handleRouteSelect}
          selectedRoute={selectedRoute}
        />
      </div>

      {/* Bottom sheet */}
      <BottomSheet
        collapsedContent={collapsedContent}
        expandedContent={expandedContent}
      />
    </div>
  );
}