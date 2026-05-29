import { useState, useEffect, useRef } from "react";
import { Search, X, Clock } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { busRoutes, busStops } from "../data/routes";

interface SearchBarProps {
  onResultSelect?: (type: "route" | "stop" | "sector", id: string) => void;
}

const placeholders = [
  "Buscar ruta...",
  "Buscar paradero...",
  "¿A dónde vas?",
];

const sectors = [
  { id: "centro", name: "Centro Histórico", description: "Zona centro" },
  { id: "rodadero", name: "Rodadero", description: "Zona Turística" },
  { id: "taganga", name: "Taganga", description: "Playa y puerto" },
  { id: "mamatoco", name: "Mamatoco", description: "Sector residencial" },
  { id: "gaira", name: "Gaira", description: "Pueblo cercano" },
];

export function SearchBar({ onResultSelect }: SearchBarProps) {
  const [isFocused, setIsFocused] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const [recentSearches, setRecentSearches] = useState<string[]>([
    "Centro - Rodadero",
    "Terminal de Transportes",
    "Taganga",
  ]);
  const [showResults, setShowResults] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Animated placeholder
  useEffect(() => {
    const interval = setInterval(() => {
      setPlaceholderIndex((prev) => (prev + 1) % placeholders.length);
    }, 2500);

    return () => clearInterval(interval);
  }, []);

  // Show results after typing
  useEffect(() => {
    if (searchTerm.length > 0) {
      const timer = setTimeout(() => setShowResults(true), 200);
      return () => clearTimeout(timer);
    } else {
      setShowResults(false);
    }
  }, [searchTerm]);

  // Filter results
  const filteredRoutes = busRoutes.filter(
    (route) =>
      route.number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      route.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      route.destination.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredStops = busStops.filter((stop) =>
    stop.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredSectors = sectors.filter((sector) =>
    sector.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const hasResults =
    filteredRoutes.length > 0 ||
    filteredStops.length > 0 ||
    filteredSectors.length > 0;

  const handleClear = () => {
    setSearchTerm("");
    inputRef.current?.focus();
  };

  const handleSelectResult = (
    type: "route" | "stop" | "sector",
    id: string,
    label: string
  ) => {
    // Add to recent searches
    setRecentSearches((prev) => {
      const filtered = prev.filter((s) => s !== label);
      return [label, ...filtered].slice(0, 5);
    });

    setSearchTerm("");
    setShowResults(false);
    onResultSelect?.(type, id);
  };

  const handleRemoveRecent = (search: string) => {
    setRecentSearches((prev) => prev.filter((s) => s !== search));
  };

  const handleClearAllRecent = () => {
    setRecentSearches([]);
  };

  return (
    <div className="relative">
      {/* Search input */}
      <div
        className="flex items-center gap-3 px-4 py-3.5 rounded-xl border transition-all"
        style={{
          backgroundColor: isFocused ? "#1E2029" : "#161820",
          borderColor: isFocused ? "#00E5A0" : "rgba(255, 255, 255, 0.09)",
          boxShadow: isFocused
            ? "0 0 0 3px rgba(0, 229, 160, 0.15)"
            : "none",
        }}
      >
        <Search
          className="w-5 h-5 transition-colors"
          style={{ color: isFocused ? "#00E5A0" : "#8B8FA8" }}
        />
        <input
          ref={inputRef}
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setTimeout(() => setIsFocused(false), 200)}
          className="flex-1 bg-transparent border-none outline-none"
          style={{
            fontFamily: "var(--font-body)",
            color: "#F0F2FF",
          }}
        />

        {/* Animated placeholder */}
        {!searchTerm && !isFocused && (
          <AnimatePresence mode="wait">
            <motion.span
              key={placeholderIndex}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              transition={{ duration: 0.3 }}
              className="absolute left-12 pointer-events-none"
              style={{
                color: "#8B8FA8",
                fontFamily: "var(--font-body)",
              }}
            >
              {placeholders[placeholderIndex]}
            </motion.span>
          </AnimatePresence>
        )}

        {/* Clear button */}
        <AnimatePresence>
          {searchTerm && (
            <motion.button
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              onClick={handleClear}
              className="w-6 h-6 rounded-full flex items-center justify-center hover:bg-surface-2 transition-colors"
            >
              <X className="w-4 h-4" style={{ color: "#8B8FA8" }} />
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      {/* Results panel */}
      <AnimatePresence>
        {isFocused && (showResults || searchTerm.length === 0) && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.2 }}
            className="absolute top-full left-0 right-0 mt-2 rounded-xl border overflow-hidden max-h-96 overflow-y-auto"
            style={{
              backgroundColor: "#161820",
              borderColor: "rgba(255, 255, 255, 0.09)",
              boxShadow: "var(--shadow-card)",
              zIndex: 1000,
            }}
          >
            {searchTerm.length === 0 ? (
              // Recent searches
              <div className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <p
                    className="text-sm font-medium"
                    style={{ color: "#8B8FA8" }}
                  >
                    Búsquedas recientes
                  </p>
                  {recentSearches.length > 0 && (
                    <button
                      onClick={handleClearAllRecent}
                      className="text-xs"
                      style={{ color: "#4F8EF7" }}
                    >
                      Limpiar todo
                    </button>
                  )}
                </div>

                {recentSearches.length === 0 ? (
                  <p className="text-sm text-center py-4" style={{ color: "#4A4D60" }}>
                    No hay búsquedas recientes
                  </p>
                ) : (
                  <div className="space-y-2">
                    {recentSearches.map((search, index) => (
                      <motion.div
                        key={search}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="flex items-center gap-3 p-2 rounded-lg hover:bg-surface-2 transition-colors group"
                      >
                        <Clock className="w-4 h-4" style={{ color: "#4A4D60" }} />
                        <span
                          className="flex-1 text-sm"
                          style={{ color: "#F0F2FF" }}
                        >
                          {search}
                        </span>
                        <button
                          onClick={() => handleRemoveRecent(search)}
                          className="opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="w-4 h-4" style={{ color: "#8B8FA8" }} />
                        </button>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            ) : hasResults ? (
              // Search results
              <div className="p-4 space-y-4">
                {/* Routes section */}
                {filteredRoutes.length > 0 && (
                  <div>
                    <p
                      className="text-xs font-bold mb-2 uppercase tracking-wider"
                      style={{ color: "#4A4D60" }}
                    >
                      🚌 RUTAS ({filteredRoutes.length})
                    </p>
                    <div className="space-y-2">
                      {filteredRoutes.map((route) => (
                        <motion.button
                          key={route.id}
                          whileHover={{ scale: 0.98, x: 3 }}
                          onClick={() =>
                            handleSelectResult("route", route.id, route.name)
                          }
                          className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-surface-2 transition-colors text-left"
                        >
                          <div
                            className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                            style={{ backgroundColor: route.color }}
                          >
                            <span
                              className="text-sm font-bold text-white"
                              style={{ fontFamily: "var(--font-mono)" }}
                            >
                              {route.number}
                            </span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p
                              className="font-bold text-sm truncate"
                              style={{ color: "#F0F2FF" }}
                            >
                              {route.name}
                            </p>
                            <p
                              className="text-xs"
                              style={{ color: "#8B8FA8" }}
                            >
                              {route.fare}
                            </p>
                          </div>
                          <span style={{ color: "#00E5A0" }}>→</span>
                        </motion.button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Stops section */}
                {filteredStops.length > 0 && (
                  <div>
                    <p
                      className="text-xs font-bold mb-2 uppercase tracking-wider"
                      style={{ color: "#4A4D60" }}
                    >
                      📍 PARADEROS ({filteredStops.length})
                    </p>
                    <div className="space-y-2">
                      {filteredStops.map((stop) => (
                        <motion.button
                          key={stop.id}
                          whileHover={{ scale: 0.98, x: 3 }}
                          onClick={() =>
                            handleSelectResult("stop", stop.id, stop.name)
                          }
                          className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-surface-2 transition-colors text-left"
                        >
                          <span style={{ fontSize: "20px" }}>📌</span>
                          <div className="flex-1 min-w-0">
                            <p
                              className="font-bold text-sm truncate"
                              style={{ color: "#F0F2FF" }}
                            >
                              {stop.name}
                            </p>
                            <p
                              className="text-xs"
                              style={{ color: "#8B8FA8" }}
                            >
                              · {stop.location}
                            </p>
                          </div>
                          <span style={{ color: "#00E5A0" }}>→</span>
                        </motion.button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Sectors section */}
                {filteredSectors.length > 0 && (
                  <div>
                    <p
                      className="text-xs font-bold mb-2 uppercase tracking-wider"
                      style={{ color: "#4A4D60" }}
                    >
                      🗺️ SECTORES ({filteredSectors.length})
                    </p>
                    <div className="space-y-2">
                      {filteredSectors.map((sector) => (
                        <motion.button
                          key={sector.id}
                          whileHover={{ scale: 0.98, x: 3 }}
                          onClick={() =>
                            handleSelectResult("sector", sector.id, sector.name)
                          }
                          className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-surface-2 transition-colors text-left"
                        >
                          <span style={{ fontSize: "20px" }}>🏙️</span>
                          <div className="flex-1 min-w-0">
                            <p
                              className="font-bold text-sm truncate"
                              style={{ color: "#F0F2FF" }}
                            >
                              {sector.name}
                            </p>
                            <p
                              className="text-xs"
                              style={{ color: "#8B8FA8" }}
                            >
                              · {sector.description}
                            </p>
                          </div>
                          <span style={{ color: "#00E5A0" }}>→</span>
                        </motion.button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              // Empty state
              <div className="p-8 text-center">
                <motion.div
                  animate={{
                    rotate: [0, 10, -10, 0],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                >
                  <Search
                    className="w-12 h-12 mx-auto mb-3 opacity-30"
                    style={{ color: "#8B8FA8" }}
                  />
                </motion.div>
                <p className="text-sm" style={{ color: "#8B8FA8" }}>
                  No encontramos esa ruta.
                  <br />
                  Prueba con otro nombre.
                </p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
