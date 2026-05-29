import { useState, useEffect } from "react";
import { Outlet, Link, useLocation } from "react-router";
import { Map, Navigation, Bus, User, Compass } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { AppLogo } from "./AppLogo";
import { useTrip } from "../context/TripContext";
import { cn } from "./ui/utils";

export function Layout() {
  const location = useLocation();
  const { activeRouteId } = useTrip();
  const hasActiveTrip = activeRouteId !== null;
  const isHomePage = location.pathname === "/" && !location.pathname.includes("route");
  
  const isActive = (path: string) => {
    if (path === "/") {
      return location.pathname === "/";
    }
    return location.pathname.startsWith(path);
  };

  const navItems = [
    { path: "/", icon: Map, label: "Mapa", exact: true },
    { path: "/routes", icon: Bus, label: "Rutas", exact: false },
    { path: "/live", icon: Compass, label: "GPS En Vivo", exact: false },
    { path: "/my-trip", icon: Navigation, label: "Mi Viaje", exact: false, hasBadge: hasActiveTrip },
    { path: "/profile", icon: User, label: "Perfil", exact: false },
  ];

  // Simulator Time state
  const [simTime, setSimTime] = useState("");
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      let hours = now.getHours();
      const minutes = now.getMinutes().toString().padStart(2, "0");
      const ampm = hours >= 12 ? "PM" : "AM";
      hours = hours % 12;
      hours = hours ? hours : 12;
      setSimTime(`${hours}:${minutes} ${ampm}`);
    };
    updateTime();
    const interval = setInterval(updateTime, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-[#07090E] text-[#F0F2FF] flex items-center justify-center font-sans overflow-hidden relative w-screen">
      {/* Background gradients and floating shapes for desktop view */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden hidden sm:block">
        <div className="absolute top-[10%] left-[15%] w-[400px] h-[400px] rounded-full bg-[#00E5A0]/10 blur-[150px] animate-pulse" />
        <div className="absolute bottom-[10%] right-[15%] w-[450px] h-[450px] rounded-full bg-[#4F8EF7]/10 blur-[150px] animate-pulse" />
        
        {/* Decorative Grid Pattern */}
        <div className="absolute inset-0 opacity-10 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />
      </div>

      {/* Desktop Branding Sidebar / Intro Info */}
      <div className="hidden lg:flex flex-col max-w-sm mr-16 z-10 text-left select-none">
        <AppLogo size={54} showText={true} />
        <h1 className="text-2xl font-bold mt-4 text-white font-display">BusSamario App</h1>
        <p className="text-sm text-[#8B8FA8] mt-2 leading-relaxed">
          Sistema de información de transporte público para Santa Marta. Explora rutas de busetas en tiempo real, comparte incidentes y accede a guías turísticas integradas.
        </p>
        
        <div className="mt-8 flex flex-col gap-3">
          <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-white/5 border border-white/5 backdrop-blur-sm">
            <span className="text-xl">📱</span>
            <div>
              <p className="text-xs font-bold text-white font-display">Diseño Mobile-First</p>
              <p className="text-[10px] text-[#8B8FA8]">Vista en simulador móvil optimizada.</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-white/5 border border-white/5 backdrop-blur-sm">
            <span className="text-xl">🎙️</span>
            <div>
              <p className="text-xs font-bold text-white font-display font-display">Audioguías en Viaje</p>
              <p className="text-[10px] text-[#8B8FA8]">Activa el modo turístico y escucha historias.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main phone frame container */}
      <div className="w-full h-full min-h-screen sm:min-h-0 sm:w-[410px] sm:h-[840px] sm:rounded-[44px] sm:border-[10px] sm:border-[#1C1E26] bg-[#0D0F14] shadow-2xl relative z-10 flex flex-col overflow-hidden sm:transform sm:translate-z-0">
        
        {/* Dynamic Island / Notch (Only on desktop simulator view) */}
        <div className="hidden sm:flex absolute top-2 left-1/2 -translate-x-1/2 w-28 h-6 bg-[#1C1E26] rounded-full z-[1000] items-center justify-center">
          <div className="w-2 h-2 rounded-full bg-[#090A0F] border border-white/5 mr-2" />
          <div className="w-1.5 h-1.5 rounded-full bg-[#1A1A1A] ml-auto mr-4" />
        </div>

        {/* Simulated Phone Status Bar (Only on desktop simulator view) */}
        <div className="hidden sm:flex w-full h-10 px-6 items-center justify-between text-white/80 text-[10px] font-bold font-mono z-[999] select-none bg-[#0D0F14]/40 backdrop-blur-md border-b border-white/5 pt-1.5 flex-shrink-0">
          <span>{simTime}</span>
          <div className="flex items-center gap-1.5">
            {/* Network status */}
            <div className="flex items-end gap-0.5 h-2.5">
              <div className="w-0.75 h-1 bg-white" />
              <div className="w-0.75 h-1.5 bg-white" />
              <div className="w-0.75 h-2 bg-white" />
              <div className="w-0.75 h-2.5 bg-white" />
            </div>
            <span className="text-[9px]">LTE</span>
            <div className="flex items-center gap-0.5">
              <span className="text-[9px]">88%</span>
              <div className="w-5.5 h-3 rounded-xs border border-white/50 p-0.5 flex items-center relative">
                <div className="h-full w-[80%] bg-[#00E5A0] rounded-2xs" />
                <div className="w-0.5 h-1 bg-white/50 absolute -right-0.75 top-1 rounded-r-xs" />
              </div>
            </div>
          </div>
        </div>

        {/* Inner App Container - scrollable */}
        <div className="flex-1 flex flex-col relative overflow-hidden h-full">
          {/* Header - Only for non-map/non-fullscreen pages */}
          {!isHomePage && (
            <header className="sticky top-0 z-50 w-full glass-panel border-b border-white/5 py-3 px-4 flex-shrink-0">
              <div className="flex items-center justify-between">
                <Link to="/" className="focus-ring-premium rounded-xl" aria-label="Volver al inicio">
                  <AppLogo size={28} showText={true} />
                </Link>
                
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#00E5A0]/10 border border-[#00E5A0]/20">
                  <span className="relative flex h-1.5 w-1.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00E5A0] opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-[#00E5A0]"></span>
                  </span>
                  <span className="text-[9px] tracking-wider font-bold text-[#00E5A0] uppercase font-mono">En Línea</span>
                </div>
              </div>
            </header>
          )}

          {/* Main Content Area */}
          <main className={cn(
            "flex-1 relative z-10 w-full flex flex-col min-h-0",
            isHomePage 
              ? "h-full overflow-hidden" 
              : "overflow-y-auto px-4 pt-4 pb-24"
          )}>
            <Outlet />
          </main>

          {/* Floating Glassmorphic Bottom Navigation Bar */}
          <div className="absolute bottom-4 left-0 right-0 z-[999] flex justify-center px-4 pointer-events-none">
            <nav 
              role="navigation" 
              aria-label="Navegación principal" 
              className="w-full max-w-[360px] h-14 rounded-2xl glass-panel flex items-center justify-around px-2 pointer-events-auto shadow-2xl relative"
            >
              {navItems.map((item) => {
                const Icon = item.icon;
                const active = item.exact
                  ? location.pathname === item.path && !location.pathname.includes("route")
                  : isActive(item.path);

                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className="flex flex-col items-center justify-center w-12 h-10 rounded-xl transition-all duration-300 relative focus-ring-premium group"
                    aria-label={item.label}
                    aria-current={active ? "page" : undefined}
                  >
                    {/* Active Highlight Capsule Background */}
                    {active && (
                      <motion.div
                        layoutId="navActiveBg"
                        className="absolute inset-0 rounded-xl bg-[#00E5A0]/10 border border-[#00E5A0]/20 -z-10"
                        transition={{ type: "spring", stiffness: 350, damping: 25 }}
                      />
                    )}

                    <div className="relative">
                      <Icon 
                        className={cn(
                          "w-4 h-4 transition-transform duration-300",
                          active ? 'scale-110 text-[#00E5A0]' : 'text-[#4A4D60] group-hover:text-[#8B8FA8] group-hover:scale-105'
                        )}
                        aria-hidden="true"
                      />
                      
                      {/* Trip Alert Badge */}
                      {item.hasBadge && (
                        <span className="absolute -top-1 -right-1 flex h-1.5 w-1.5">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#FF6B6B] opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-[#FF6B6B]"></span>
                        </span>
                      )}
                    </div>

                    <span 
                      className={cn(
                        "text-[8px] font-bold mt-0.5 tracking-wide font-display transition-colors",
                        active ? 'text-[#00E5A0]' : 'text-[#4A4D60] group-hover:text-[#8B8FA8]'
                      )}
                    >
                      {item.label}
                    </span>
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Simulated Home Indicator Bar (Only on desktop simulator view) */}
          <div className="hidden sm:block w-32 h-1 bg-white/20 rounded-full absolute bottom-1.5 left-1/2 -translate-x-1/2 z-[1000] pointer-events-none" />
        </div>
      </div>
    </div>
  );
}