import { useState, useEffect, useRef } from "react";
import { Search, X, Clock, Navigation, Bus, MapPin } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { busRoutes, busStops } from "../data/routes";
import { cn } from "./ui/utils";

interface SearchBarProps {
  onResultSelect?: (type: "route" | "stop" | "sector", id: string) => void;
  className?: string;
}

const placeholders = [
  "Buscar ruta…",
  "Buscar paradero…",
  "¿A dónde vas?…",
];

const sectors = [
  { id: "centro", name: "Centro Histórico", description: "Zona centro" },
  { id: "rodadero", name: "Rodadero", description: "Zona Turística" },
  { id: "taganga", name: "Taganga", description: "Playa y puerto" },
  { id: "mamatoco", name: "Mamatoco", description: "Sector residencial" },
  { id: "gaira", name: "Gaira", description: "Pueblo cercano" },
];

export function SearchBar({ onResultSelect, className }: SearchBarProps) {
  const [isFocused, setIsFocused] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const [recentSearches, setRecentSearches] = useState<string[]>(() => {
    const saved = localStorage.getItem("bussamario_recent_searches");
    return saved ? JSON.parse(saved) : ["Centro - Rodadero", "Terminal de Transportes", "Taganga"];
  });
  const [showResults, setShowResults] = useState(false);
  const [activeItemIndex, setActiveItemIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Rotate placeholders
  useEffect(() => {
    const interval = setInterval(() => {
      setPlaceholderIndex((prev) => (prev + 1) % placeholders.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  // Save recent searches
  useEffect(() => {
    localStorage.setItem("bussamario_recent_searches", JSON.stringify(recentSearches));
  }, [recentSearches]);

  // Show results panel when searchTerm changes
  useEffect(() => {
    if (searchTerm.length > 0) {
      setShowResults(true);
    } else {
      setShowResults(false);
    }
    setActiveItemIndex(-1); // Reset keyboard nav index
  }, [searchTerm]);

  // Close results panel on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsFocused(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Filtering results
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

  const allFilteredResults = [
    ...filteredRoutes.map(r => ({ ...r, type: "route" as const, label: r.name })),
    ...filteredStops.map(s => ({ ...s, type: "stop" as const, label: s.name })),
    ...filteredSectors.map(sec => ({ ...sec, type: "sector" as const, label: sec.name }))
  ];

  const handleClear = () => {
    setSearchTerm("");
    inputRef.current?.focus();
  };

  const handleSelectResult = (
    type: "route" | "stop" | "sector",
    id: string,
    label: string
  ) => {
    setRecentSearches((prev) => {
      const filtered = prev.filter((s) => s !== label);
      return [label, ...filtered].slice(0, 5);
    });

    setSearchTerm("");
    setShowResults(false);
    setIsFocused(false);
    inputRef.current?.blur();
    onResultSelect?.(type, id);
  };

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isFocused) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveItemIndex((prev) => 
        prev < allFilteredResults.length - 1 ? prev + 1 : prev
      );
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveItemIndex((prev) => (prev > 0 ? prev - 1 : 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (activeItemIndex >= 0 && activeItemIndex < allFilteredResults.length) {
        const selected = allFilteredResults[activeItemIndex];
        handleSelectResult(selected.type, selected.id, selected.label);
      }
    } else if (e.key === "Escape") {
      setIsFocused(false);
      inputRef.current?.blur();
    }
  };

  const handleRemoveRecent = (e: React.MouseEvent, search: string) => {
    e.stopPropagation();
    setRecentSearches((prev) => prev.filter((s) => s !== search));
  };

  const handleClearAllRecent = () => {
    setRecentSearches([]);
  };

  return (
    <div ref={containerRef} className={cn("relative w-full z-[1000]", className)}>
      {/* Search Input Container */}
      <div
        className={cn(
          "flex items-center gap-3 px-4 py-3 rounded-2xl glass-panel border transition-all duration-300",
          isFocused ? "border-[#00E5A0]/40 glow-primary" : "border-white/5"
        )}
      >
        <Search
          className={cn("w-5 h-5 transition-colors duration-300", isFocused ? "text-[#00E5A0]" : "text-[#4A4D60]")}
          aria-hidden="true"
        />
        <div className="flex-1 relative flex items-center h-6">
          <input
            ref={inputRef}
            type="text"
            role="combobox"
            aria-autocomplete="list"
            aria-expanded={isFocused}
            aria-haspopup="listbox"
            aria-label="Buscar rutas, paradas o sectores de autobús"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onKeyDown={handleKeyDown}
            className="w-full bg-transparent border-none outline-none text-[#F0F2FF] font-sans text-sm focus:ring-0 placeholder-transparent"
          />

          {/* Animated custom placeholder */}
          {!searchTerm && (
            <span
              className="absolute left-0 pointer-events-none text-sm text-[#4A4D60] font-sans flex items-center gap-1.5 transition-all duration-300"
            >
              <AnimatePresence mode="wait">
                <motion.span
                  key={placeholderIndex}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  transition={{ duration: 0.2 }}
                >
                  {placeholders[placeholderIndex]}
                </motion.span>
              </AnimatePresence>
            </span>
          )}
        </div>

        {/* Clear input button */}
        <AnimatePresence>
          {searchTerm && (
            <motion.button
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              onClick={handleClear}
              aria-label="Borrar texto de búsqueda"
              className="w-6 h-6 rounded-full flex items-center justify-center bg-white/5 hover:bg-white/10 transition-colors focus-ring-premium"
            >
              <X className="w-3.5 h-3.5 text-[#8B8FA8]" />
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      {/* Results Panel */}
      <AnimatePresence>
        {isFocused && (showResults || searchTerm.length === 0) && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
            className="absolute top-full left-0 right-0 mt-2 max-h-[380px] overflow-y-auto rounded-2xl glass-panel border border-white/10 shadow-2xl p-4 space-y-4 scrollbar-hide"
          >
            {searchTerm.length === 0 ? (
              // Búsquedas recientes
              <div role="region" aria-label="Búsquedas recientes">
                <div className="flex items-center justify-between mb-3 px-1">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#4A4D60] font-display">
                    Búsquedas Recientes
                  </span>
                  {recentSearches.length > 0 && (
                    <button
                      onClick={handleClearAllRecent}
                      className="text-xs font-semibold text-[#4F8EF7] hover:text-[#4F8EF7]/80 hover:underline focus-ring-premium rounded px-1.5 py-0.5"
                    >
                      Borrar todo
                    </button>
                  )}
                </div>

                {recentSearches.length === 0 ? (
                  <p className="text-xs text-[#4A4D60] text-center py-6 font-sans">
                    No tienes búsquedas recientes…
                  </p>
                ) : (
                  <div className="space-y-1">
                    {recentSearches.map((search) => (
                      <div
                        key={search}
                        onClick={() => {
                          // Find corresponding item if it is a stop, route or sector
                          const route = busRoutes.find(r => r.name === search);
                          const stop = busStops.find(s => s.name === search);
                          const sector = sectors.find(s => s.name === search);
                          if (route) handleSelectResult("route", route.id, route.name);
                          else if (stop) handleSelectResult("stop", stop.id, stop.name);
                          else if (sector) handleSelectResult("sector", sector.id, sector.name);
                          else handleSelectResult("route", "1", search); // fallback
                        }}
                        className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-white/5 cursor-pointer transition-colors group focus-ring-premium"
                      >
                        <Clock className="w-4 h-4 text-[#4A4D60]" aria-hidden="true" />
                        <span className="flex-1 text-sm text-[#8B8FA8] group-hover:text-[#F0F2FF] font-sans">
                          {search}
                        </span>
                        <button
                          onClick={(e) => handleRemoveRecent(e, search)}
                          aria-label={`Eliminar búsqueda ${search}`}
                          className="opacity-0 group-hover:opacity-100 p-1 hover:bg-white/10 rounded-lg transition-all focus-ring-premium"
                        >
                          <X className="w-3.5 h-3.5 text-[#4A4D60]" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : allFilteredResults.length > 0 ? (
              // Resultados filtrados
              <div role="listbox" aria-label="Resultados de búsqueda" className="space-y-4">
                {/* Agrupación de rutas */}
                {filteredRoutes.length > 0 && (
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-[#4A4D60] font-display mb-2 px-1">
                      Rutas de autobús
                    </h3>
                    <div className="space-y-1">
                      {filteredRoutes.map((route) => {
                        const index = allFilteredResults.findIndex(r => r.id === route.id && r.type === "route");
                        const isKeyboardActive = activeItemIndex === index;
                        return (
                          <div
                            key={route.id}
                            role="option"
                            aria-selected={isKeyboardActive}
                            onClick={() => handleSelectResult("route", route.id, route.name)}
                            className={cn(
                              "flex items-center gap-3 p-2 rounded-xl transition-all cursor-pointer text-left border border-transparent",
                              isKeyboardActive ? "bg-white/10 border-white/5" : "hover:bg-white/5"
                            )}
                          >
                            <div
                              className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 font-mono font-bold text-xs shadow-lg text-white"
                              style={{ backgroundColor: route.color }}
                            >
                              {route.number}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-bold text-sm text-[#F0F2FF] truncate font-display">
                                {route.name}
                              </p>
                              <p className="text-xs text-[#8B8FA8] font-mono">
                                Tarifa: {route.fare} · {route.frequency}
                              </p>
                            </div>
                            <Bus className="w-4 h-4 text-[#4A4D60]" aria-hidden="true" />
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Agrupación de paraderos */}
                {filteredStops.length > 0 && (
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-[#4A4D60] font-display mb-2 px-1">
                      Paraderos
                    </h3>
                    <div className="space-y-1">
                      {filteredStops.map((stop) => {
                        const index = allFilteredResults.findIndex(s => s.id === stop.id && s.type === "stop");
                        const isKeyboardActive = activeItemIndex === index;
                        return (
                          <div
                            key={stop.id}
                            role="option"
                            aria-selected={isKeyboardActive}
                            onClick={() => handleSelectResult("stop", stop.id, stop.name)}
                            className={cn(
                              "flex items-center gap-3 p-2 rounded-xl transition-all cursor-pointer text-left border border-transparent",
                              isKeyboardActive ? "bg-white/10 border-white/5" : "hover:bg-white/5"
                            )}
                          >
                            <div className="w-9 h-9 rounded-lg bg-secondary/15 flex items-center justify-center flex-shrink-0">
                              <MapPin className="w-4 h-4 text-[#4F8EF7]" aria-hidden="true" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-bold text-sm text-[#F0F2FF] truncate font-display">
                                {stop.name}
                              </p>
                              <p className="text-xs text-[#8B8FA8] truncate font-sans">
                                {stop.location}
                              </p>
                            </div>
                            <Navigation className="w-4 h-4 text-[#4A4D60]" aria-hidden="true" />
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Agrupación de sectores */}
                {filteredSectors.length > 0 && (
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-[#4A4D60] font-display mb-2 px-1">
                      Sectores
                    </h3>
                    <div className="space-y-1">
                      {filteredSectors.map((sector) => {
                        const index = allFilteredResults.findIndex(sec => sec.id === sector.id && sec.type === "sector");
                        const isKeyboardActive = activeItemIndex === index;
                        return (
                          <div
                            key={sector.id}
                            role="option"
                            aria-selected={isKeyboardActive}
                            onClick={() => handleSelectResult("sector", sector.id, sector.name)}
                            className={cn(
                              "flex items-center gap-3 p-2 rounded-xl transition-all cursor-pointer text-left border border-transparent",
                              isKeyboardActive ? "bg-white/10 border-white/5" : "hover:bg-white/5"
                            )}
                          >
                            <div className="w-9 h-9 rounded-lg bg-[#00E5A0]/10 flex items-center justify-center flex-shrink-0">
                              <Compass className="w-4 h-4 text-[#00E5A0]" aria-hidden="true" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-bold text-sm text-[#F0F2FF] truncate font-display">
                                {sector.name}
                              </p>
                              <p className="text-xs text-[#8B8FA8] truncate font-sans">
                                {sector.description}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              // Búsqueda sin resultados
              <div className="p-8 text-center space-y-2">
                <Search className="w-8 h-8 text-[#4A4D60] mx-auto opacity-40 animate-pulse" aria-hidden="true" />
                <p className="text-sm font-bold text-[#F0F2FF] font-display">No hay resultados</p>
                <p className="text-xs text-[#8B8FA8] font-sans">
                  Prueba buscando otra ruta (ej. “Centro”) o paradero.
                </p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
