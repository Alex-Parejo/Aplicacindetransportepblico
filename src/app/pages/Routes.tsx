import { Link, useNavigate } from "react-router";
import { busRoutes } from "../data/routes";
import { Bus, MapPin, ArrowRight, Clock, SlidersHorizontal, Sparkles, Search } from "lucide-react";
import { useState } from "react";
import { motion } from "motion/react";
import { AppLogo } from "../components/AppLogo";
import { SearchBar } from "../components/SearchBar";

export function Routes() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");

  const handleResultSelect = (type: "route" | "stop" | "sector", id: string) => {
    if (type === "route") {
      navigate(`/route/${id}`);
    } else if (type === "stop") {
      // Navigate to home and center on stop
      navigate("/", { state: { stopId: id } });
    } else if (type === "sector") {
      // Navigate to home and center on sector
      navigate("/", { state: { sectorId: id } });
    }
  };

  const filteredRoutes = busRoutes.filter(
    (route) =>
      route.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      route.number.includes(searchTerm) ||
      route.origin.toLowerCase().includes(searchTerm.toLowerCase()) ||
      route.destination.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Get greeting based on time
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Buenos días";
    if (hour < 19) return "Buenas tardes";
    return "Buenas noches";
  };

  // Get gradient for route badge
  const getRouteGradient = (number: string) => {
    const gradients: { [key: string]: string } = {
      "1": "linear-gradient(135deg, #10B981 0%, #3B82F6 100%)",
      "2": "linear-gradient(135deg, #EF4444 0%, #F97316 100%)",
      "3": "linear-gradient(135deg, #3B82F6 0%, #8B5CF6 100%)",
      "4": "linear-gradient(135deg, #EAB308 0%, #10B981 100%)",
      "5": "linear-gradient(135deg, #8B5CF6 0%, #EC4899 100%)",
      "6": "linear-gradient(135deg, #06B6D4 0%, #3B82F6 100%)",
      "7U": "linear-gradient(135deg, #EC4899 0%, #EF4444 100%)",
      "8U": "linear-gradient(135deg, #F97316 0%, #EAB308 100%)",
      "9U": "linear-gradient(135deg, #14B8A6 0%, #10B981 100%)",
      "10U": "linear-gradient(135deg, #A855F7 0%, #EC4899 100%)",
      "11": "linear-gradient(135deg, #EAB308 0%, #F97316 100%)",
      "12U": "linear-gradient(135deg, #DC2626 0%, #EF4444 100%)",
    };
    return gradients[number] || "linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)";
  };

  return (
    <div className="pb-6">
      {/* Header */}
      <div className="mb-6">
        {/* Logo + greeting */}
        <div className="flex items-center justify-between mb-5">
          <div>
            <p className="text-sm mb-1" style={{ color: '#8B8FA8' }}>
              {getGreeting()}, Viajero 👋
            </p>
            <h1
              className="text-3xl font-bold"
              style={{
                fontFamily: 'var(--font-display)',
                color: '#F0F2FF',
              }}
            >
              Rutas Disponibles
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <button className="w-10 h-10 rounded-xl flex items-center justify-center hover:bg-surface-2 transition-colors">
              <Search className="w-5 h-5" style={{ color: '#8B8FA8' }} />
            </button>
            <button className="w-10 h-10 rounded-xl flex items-center justify-center hover:bg-surface-2 transition-colors">
              <SlidersHorizontal className="w-5 h-5" style={{ color: '#8B8FA8' }} />
            </button>
          </div>
        </div>

        {/* Stats strip */}
        <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-2">
          <div
            className="flex items-center gap-2 px-4 py-2.5 rounded-full whitespace-nowrap border"
            style={{
              backgroundColor: '#1E2029',
              borderColor: 'rgba(255, 255, 255, 0.09)',
            }}
          >
            <Bus className="w-4 h-4" style={{ color: '#00E5A0' }} />
            <span className="text-sm font-semibold" style={{ color: '#F0F2FF' }}>
              {busRoutes.length} Rutas
            </span>
          </div>

          <div
            className="flex items-center gap-2 px-4 py-2.5 rounded-full whitespace-nowrap border"
            style={{
              backgroundColor: '#1E2029',
              borderColor: 'rgba(255, 255, 255, 0.09)',
            }}
          >
            <MapPin className="w-4 h-4" style={{ color: '#4F8EF7' }} />
            <span className="text-sm font-semibold" style={{ color: '#F0F2FF' }}>
              65+ Paraderos
            </span>
          </div>

          <div
            className="flex items-center gap-2 px-4 py-2.5 rounded-full whitespace-nowrap border"
            style={{
              backgroundColor: '#1E2029',
              borderColor: 'rgba(255, 255, 255, 0.09)',
            }}
          >
            <Sparkles className="w-4 h-4" style={{ color: '#FF6B6B' }} />
            <span className="text-sm font-semibold" style={{ color: '#F0F2FF' }}>
              24/7 Activo
            </span>
          </div>
        </div>
      </div>

      {/* Search bar */}
      <div className="mb-5">
        <SearchBar onResultSelect={handleResultSelect} />
      </div>

      {/* Routes list */}
      <div className="space-y-3">
        {filteredRoutes.map((route, index) => (
          <motion.div
            key={route.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <Link to={`/route/${route.id}`}>
              <motion.div
                whileHover={{ scale: 0.98 }}
                whileTap={{ scale: 0.96 }}
                className="relative rounded-xl border overflow-hidden group"
                style={{
                  backgroundColor: '#161820',
                  borderColor: 'rgba(255, 255, 255, 0.06)',
                }}
              >
                {/* Hover effect */}
                <div
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
                  style={{
                    boxShadow: '0 0 20px rgba(0, 229, 160, 0.1)',
                    border: '1px solid rgba(0, 229, 160, 0.2)',
                    borderRadius: '0.75rem',
                  }}
                />

                <div className="flex items-center gap-4 p-4 relative">
                  {/* Route number badge */}
                  <div
                    className="w-16 h-16 rounded-xl flex flex-col items-center justify-center flex-shrink-0"
                    style={{
                      background: getRouteGradient(route.number),
                    }}
                  >
                    <Bus className="w-5 h-5 text-white mb-1" />
                    <span
                      className="text-sm font-bold text-white"
                      style={{ fontFamily: 'var(--font-mono)' }}
                    >
                      {route.number}
                    </span>
                  </div>

                  {/* Route info */}
                  <div className="flex-1 min-w-0">
                    <h3
                      className="text-base font-bold mb-2"
                      style={{
                        fontFamily: 'var(--font-display)',
                        color: '#F0F2FF',
                      }}
                    >
                      {route.name}
                    </h3>

                    {/* Origin → Destination */}
                    <div className="flex items-center gap-2 mb-2.5 overflow-x-auto scrollbar-hide">
                      <div
                        className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg whitespace-nowrap"
                        style={{ backgroundColor: '#1E2029' }}
                      >
                        <MapPin className="w-3 h-3" style={{ color: '#8B8FA8' }} />
                        <span className="text-xs font-medium" style={{ color: '#F0F2FF' }}>
                          {route.origin}
                        </span>
                      </div>
                      <ArrowRight className="w-3 h-3 flex-shrink-0" style={{ color: '#00E5A0' }} />
                      <div
                        className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg whitespace-nowrap"
                        style={{ backgroundColor: '#1E2029' }}
                      >
                        <MapPin className="w-3 h-3" style={{ color: '#8B8FA8' }} />
                        <span className="text-xs font-medium" style={{ color: '#F0F2FF' }}>
                          {route.destination}
                        </span>
                      </div>
                    </div>

                    {/* Frequency + Fare */}
                    <div className="flex items-center gap-3">
                      <div
                        className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg"
                        style={{ backgroundColor: 'rgba(79, 142, 247, 0.1)' }}
                      >
                        <Clock className="w-3 h-3" style={{ color: '#4F8EF7' }} />
                        <span className="text-xs font-medium" style={{ color: '#4F8EF7' }}>
                          {route.frequency}
                        </span>
                      </div>
                      <span
                        className="text-sm font-bold"
                        style={{
                          fontFamily: 'var(--font-mono)',
                          color: '#00E5A0',
                        }}
                      >
                        {route.fare}
                      </span>
                    </div>
                  </div>

                  {/* Arrow */}
                  <ArrowRight className="w-6 h-6 flex-shrink-0" style={{ color: '#00E5A0' }} />
                </div>
              </motion.div>
            </Link>
          </motion.div>
        ))}

        {filteredRoutes.length === 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="rounded-xl p-12 text-center border"
            style={{
              backgroundColor: '#161820',
              borderColor: 'rgba(255, 255, 255, 0.09)',
            }}
          >
            <Bus className="w-16 h-16 mx-auto mb-4 opacity-30" style={{ color: '#8B8FA8' }} />
            <p className="text-lg" style={{ color: '#8B8FA8' }}>
              No se encontraron rutas
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
}
