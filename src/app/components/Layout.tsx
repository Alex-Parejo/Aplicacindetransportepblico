import { Outlet, Link, useLocation } from "react-router";
import { Map, Navigation, Bus, User } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { AppLogo } from "./AppLogo";
import { useTrip } from "../context/TripContext";

// Main layout component for BusSamario app
export function Layout() {
  const location = useLocation();
  const { activeRouteId } = useTrip();
  const hasActiveTrip = activeRouteId !== null;
  const isHomePage = location.pathname === "/" && !location.pathname.includes("route");
  const isMyTripPage = location.pathname === "/my-trip";

  const isActive = (path: string) => {
    if (path === "/") {
      return location.pathname === "/";
    }
    return location.pathname.startsWith(path);
  };

  const navItems = [
    { path: "/", icon: Map, label: "Mapa", exact: true },
    { path: "/routes", icon: Bus, label: "Rutas", exact: false },
    { path: "/my-trip", icon: Navigation, label: "Mi Viaje", exact: false, hasBadge: hasActiveTrip },
    { path: "/profile", icon: User, label: "Perfil", exact: false },
  ];

  // For home page and my trip page - full screen layout without header/nav
  if (isHomePage || isMyTripPage) {
    return (
      <div className="min-h-screen bg-background">
        <Outlet />

        {/* Bottom navigation - floating for full screen pages */}
        <motion.nav
          initial={{ y: 100 }}
          animate={{ y: 0 }}
          transition={{ type: "spring", stiffness: 100 }}
          className="fixed bottom-0 left-0 right-0 z-[999] overflow-hidden"
          style={{
            backgroundColor: 'rgba(13, 15, 20, 0.95)',
            backdropFilter: 'blur(20px)',
            borderTop: '1px solid rgba(255, 255, 255, 0.06)',
            height: '80px',
            paddingBottom: 'max(env(safe-area-inset-bottom), 0px)',
          }}
        >
          <div className="grid grid-cols-4 h-full">
            {navItems.map((item, index) => {
              const Icon = item.icon;
              const active = item.exact
                ? location.pathname === item.path && !location.pathname.includes("route")
                : isActive(item.path);

              return (
                <motion.div
                  key={item.path}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="relative"
                >
                  <Link
                    to={item.path}
                    className="h-full flex flex-col items-center justify-center gap-1 transition-all duration-300"
                  >
                    {/* Icon with badge */}
                    <div className="relative">
                      <motion.div
                        animate={
                          active
                            ? {
                                y: [0, -4, 0],
                              }
                            : {}
                        }
                        transition={{
                          duration: 0.4,
                          ease: "easeOut",
                          type: "keyframes",
                        }}
                      >
                        <Icon
                          className="w-6 h-6"
                          style={{
                            color: active ? '#00E5A0' : '#4A4D60',
                            filter: active ? 'drop-shadow(0 0 8px rgba(0, 229, 160, 0.4))' : 'none',
                          }}
                        />
                      </motion.div>

                      {/* Badge for active trip */}
                      {item.hasBadge && (
                        <AnimatePresence>
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{
                              scale: [1, 1.15, 1],
                            }}
                            transition={{
                              duration: 2,
                              repeat: Infinity,
                              ease: "easeInOut",
                            }}
                            className="absolute -top-1 -right-1 w-3 h-3 rounded-full"
                            style={{
                              backgroundColor: '#FF6B6B',
                              border: '2px solid rgba(13, 15, 20, 0.95)',
                            }}
                          />
                        </AnimatePresence>
                      )}
                    </div>

                    {/* Label */}
                    <span
                      className="text-[10px] font-medium"
                      style={{
                        fontFamily: 'var(--font-body)',
                        color: active ? '#00E5A0' : '#4A4D60',
                        fontWeight: active ? 600 : 500,
                      }}
                    >
                      {item.label}
                    </span>

                    {/* Active indicator dot */}
                    {active && (
                      <motion.div
                        layoutId="activeIndicator"
                        className="absolute bottom-0 w-1 h-1 rounded-full"
                        style={{
                          backgroundColor: '#00E5A0',
                          boxShadow: '0 0 8px rgba(0, 229, 160, 0.6)',
                        }}
                        transition={{ type: "spring", stiffness: 380, damping: 30 }}
                      />
                    )}
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </motion.nav>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Animated background gradients */}
      <div className="fixed inset-0 pointer-events-none">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.15, 0.25, 0.15],
            rotate: [0, 90, 0],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear",
            type: "keyframes",
          }}
          className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-to-br from-indigo-600 to-transparent rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.15, 0.25, 0.15],
            rotate: [90, 0, 90],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "linear",
            type: "keyframes",
          }}
          className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-gradient-to-tl from-purple-600 to-transparent rounded-full blur-3xl"
        />
      </div>

      {/* Header */}
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ type: "spring", stiffness: 100 }}
        className="relative bg-card/80 backdrop-blur-xl border-b border-border shadow-2xl sticky top-0 z-50"
      >
        <div className="max-w-7xl mx-auto px-6 py-5">
          <div className="flex items-center justify-between">
            <Link to="/" className="group">
              <motion.div
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.3 }}
              >
                <AppLogo size={44} showText={true} />
              </motion.div>
            </Link>

            {/* Live indicator */}
            <motion.div
              animate={{
                scale: [1, 1.05, 1],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="flex items-center gap-2 bg-green-500/20 border border-green-500/30 rounded-full px-3 py-1.5"
            >
              <motion.div
                animate={{
                  opacity: [1, 0.3, 1],
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  ease: "easeInOut",
                  type: "keyframes",
                }}
                className="w-2 h-2 bg-green-400 rounded-full"
              />
              <span className="text-xs font-semibold text-green-400">En Línea</span>
            </motion.div>
          </div>
        </div>
      </motion.header>

      {/* Main Content */}
      <main className="relative max-w-7xl mx-auto px-4 py-6 pb-24">
        <Outlet />
      </main>

      {/* Bottom Navigation */}
      <motion.nav
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        transition={{ type: "spring", stiffness: 100 }}
        className="fixed bottom-0 left-0 right-0 z-50 overflow-hidden"
        style={{
          backgroundColor: 'rgba(13, 15, 20, 0.95)',
          backdropFilter: 'blur(20px)',
          borderTop: '1px solid rgba(255, 255, 255, 0.06)',
          height: '80px',
          paddingBottom: 'max(env(safe-area-inset-bottom), 0px)',
        }}
      >
        <div className="max-w-7xl mx-auto h-full">
          <div className="grid grid-cols-4 h-full">
            {navItems.map((item, index) => {
              const Icon = item.icon;
              const active = item.exact
                ? location.pathname === item.path && !location.pathname.includes("route")
                : isActive(item.path);

              return (
                <motion.div
                  key={item.path}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="relative"
                >
                  <Link
                    to={item.path}
                    className="h-full flex flex-col items-center justify-center gap-1 transition-all duration-300"
                  >
                    {/* Icon with badge */}
                    <div className="relative">
                      <motion.div
                        animate={
                          active
                            ? {
                                y: [0, -4, 0],
                              }
                            : {}
                        }
                        transition={{
                          duration: 0.4,
                          ease: "easeOut",
                          type: "keyframes",
                        }}
                      >
                        <Icon
                          className="w-6 h-6"
                          style={{
                            color: active ? '#00E5A0' : '#4A4D60',
                            filter: active ? 'drop-shadow(0 0 8px rgba(0, 229, 160, 0.4))' : 'none',
                          }}
                        />
                      </motion.div>

                      {/* Badge for active trip */}
                      {item.hasBadge && (
                        <AnimatePresence>
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{
                              scale: [1, 1.15, 1],
                            }}
                            transition={{
                              duration: 2,
                              repeat: Infinity,
                              ease: "easeInOut",
                            }}
                            className="absolute -top-1 -right-1 w-3 h-3 rounded-full"
                            style={{
                              backgroundColor: '#FF6B6B',
                              border: '2px solid rgba(13, 15, 20, 0.95)',
                            }}
                          />
                        </AnimatePresence>
                      )}
                    </div>

                    {/* Label */}
                    <span
                      className="text-[10px] font-medium"
                      style={{
                        fontFamily: 'var(--font-body)',
                        color: active ? '#00E5A0' : '#4A4D60',
                        fontWeight: active ? 600 : 500,
                      }}
                    >
                      {item.label}
                    </span>

                    {/* Active indicator dot */}
                    {active && (
                      <motion.div
                        layoutId="activeIndicatorStandard"
                        className="absolute bottom-0 w-1 h-1 rounded-full"
                        style={{
                          backgroundColor: '#00E5A0',
                          boxShadow: '0 0 8px rgba(0, 229, 160, 0.6)',
                        }}
                        transition={{ type: "spring", stiffness: 380, damping: 30 }}
                      />
                    )}
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </div>
      </motion.nav>
    </div>
  );
}