import { useParams, Link, useNavigate } from "react-router";
import { busRoutes } from "../data/routes";
import {
  ArrowLeft,
  Bus,
  Clock,
  MapPin,
  DollarSign,
  Navigation,
} from "lucide-react";
import { useState } from "react";
import { RouteMap } from "../components/RouteMap";
import { motion } from "motion/react";
import { useTrip } from "../context/TripContext";

export function RouteDetail() {
  const { routeId } = useParams();
  const navigate = useNavigate();
  const { setActiveTrip } = useTrip();
  const route = busRoutes.find((r) => r.id === routeId);
  const [scheduleToggle, setScheduleToggle] = useState<"weekday" | "weekend">("weekday");

  const handleStartTrip = () => {
    if (route) {
      setActiveTrip(route.id);
      navigate("/my-trip");
    }
  };

  if (!route) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center py-12 bg-card rounded-xl border border-border p-12"
      >
        <Bus className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-foreground mb-2">
          Ruta no encontrada
        </h2>
        <Link to="/">
          <button className="mt-4 px-5 py-2 bg-primary text-primary-foreground rounded-lg font-bold">
            Volver al inicio
          </button>
        </Link>
      </motion.div>
    );
  }

  return (
    <div className="min-h-screen pb-8">
      {/* Header with gradient */}
      <div
        className="relative px-5 pt-6 pb-8"
        style={{
          background: 'linear-gradient(180deg, #1E2029 0%, #161820 100%)',
        }}
      >
        {/* Back button */}
        <Link to="/">
          <button className="mb-5 flex items-center gap-2 text-text-primary hover:text-primary transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
        </Link>

        {/* Route badge */}
        <div className="mb-3">
          <span
            className="inline-block px-4 py-1.5 rounded-full text-xs font-bold"
            style={{
              backgroundColor: route.color,
              color: '#F0F2FF',
              fontFamily: 'var(--font-mono)',
            }}
          >
            RUTA {route.number}
          </span>
        </div>

        {/* Route title */}
        <h1
          className="text-2xl font-bold mb-2"
          style={{
            fontFamily: 'var(--font-display)',
            color: '#F0F2FF',
          }}
        >
          {route.origin} → {route.destination}
        </h1>

        {/* Subtitle with pins */}
        <div className="flex items-center gap-2 text-sm" style={{ color: '#8B8FA8' }}>
          <MapPin className="w-4 h-4" />
          <span>{route.origin}</span>
          <span>•</span>
          <span>{route.destination}</span>
        </div>
      </div>

      {/* Stats bar */}
      <div className="px-5 -mt-4 mb-6">
        <div className="grid grid-cols-3 gap-3">
          {/* Frequency stat */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="p-4 rounded-xl border"
            style={{
              backgroundColor: '#1E2029',
              borderColor: 'rgba(255, 255, 255, 0.09)',
            }}
          >
            <div className="flex items-center gap-1.5 mb-2">
              <Clock className="w-4 h-4" style={{ color: '#00E5A0' }} />
              <span className="text-xs font-medium" style={{ color: '#8B8FA8' }}>
                Frecuencia
              </span>
            </div>
            <p
              className="text-lg font-bold"
              style={{
                fontFamily: 'var(--font-mono)',
                color: '#F0F2FF',
              }}
            >
              {route.frequency.replace('Cada ', '')}
            </p>
          </motion.div>

          {/* Fare stat */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="p-4 rounded-xl border"
            style={{
              backgroundColor: '#1E2029',
              borderColor: 'rgba(255, 255, 255, 0.09)',
            }}
          >
            <div className="flex items-center gap-1.5 mb-2">
              <DollarSign className="w-4 h-4" style={{ color: '#4F8EF7' }} />
              <span className="text-xs font-medium" style={{ color: '#8B8FA8' }}>
                Tarifa
              </span>
            </div>
            <p
              className="text-lg font-bold"
              style={{
                fontFamily: 'var(--font-mono)',
                color: '#F0F2FF',
              }}
            >
              {route.fare}
            </p>
          </motion.div>

          {/* Stops stat */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="p-4 rounded-xl border"
            style={{
              backgroundColor: '#1E2029',
              borderColor: 'rgba(255, 255, 255, 0.09)',
            }}
          >
            <div className="flex items-center gap-1.5 mb-2">
              <MapPin className="w-4 h-4" style={{ color: '#FF6B6B' }} />
              <span className="text-xs font-medium" style={{ color: '#8B8FA8' }}>
                Paradas
              </span>
            </div>
            <p
              className="text-lg font-bold"
              style={{
                fontFamily: 'var(--font-mono)',
                color: '#F0F2FF',
              }}
            >
              {route.stops.length}
            </p>
          </motion.div>
        </div>
      </div>

      {/* Map section */}
      <div className="px-5 mb-6">
        <div className="rounded-xl overflow-hidden">
          <RouteMap
            routeId={route.id}
            routeColor={route.color}
            routeName={route.name}
          />
        </div>
      </div>

      {/* Schedule section */}
      <div className="px-5 mb-6">
        <h2
          className="text-lg font-bold mb-4"
          style={{
            fontFamily: 'var(--font-display)',
            color: '#F0F2FF',
          }}
        >
          Horarios
        </h2>

        {/* Segmented control */}
        <div
          className="inline-flex p-1 rounded-xl mb-4"
          style={{ backgroundColor: '#1E2029' }}
        >
          <button
            onClick={() => setScheduleToggle("weekday")}
            className="px-5 py-2 rounded-lg text-sm font-medium transition-all"
            style={{
              backgroundColor: scheduleToggle === "weekday" ? '#00E5A0' : 'transparent',
              color: scheduleToggle === "weekday" ? '#0D0F14' : '#8B8FA8',
            }}
          >
            Lun-Vie
          </button>
          <button
            onClick={() => setScheduleToggle("weekend")}
            className="px-5 py-2 rounded-lg text-sm font-medium transition-all"
            style={{
              backgroundColor: scheduleToggle === "weekend" ? '#00E5A0' : 'transparent',
              color: scheduleToggle === "weekend" ? '#0D0F14' : '#8B8FA8',
            }}
          >
            Sáb-Dom
          </button>
        </div>

        {/* Timeline */}
        <div className="flex items-center gap-3">
          <div className="flex flex-col items-center">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: '#00E5A0' }}
            />
            <div
              className="w-0.5 h-12"
              style={{
                background: 'linear-gradient(180deg, #00E5A0 0%, #4A4D60 100%)',
              }}
            />
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: '#FF6B6B' }}
            />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium mb-1" style={{ color: '#F0F2FF' }}>
              Inicio
            </p>
            <p
              className="text-xl font-bold mb-4"
              style={{
                fontFamily: 'var(--font-mono)',
                color: '#00E5A0',
              }}
            >
              {scheduleToggle === "weekday"
                ? route.schedule.weekday.split(" - ")[0]
                : route.schedule.weekend.split(" - ")[0]}
            </p>
            <p className="text-sm font-medium mb-1" style={{ color: '#F0F2FF' }}>
              Fin de servicio
            </p>
            <p
              className="text-xl font-bold"
              style={{
                fontFamily: 'var(--font-mono)',
                color: '#FF6B6B',
              }}
            >
              {scheduleToggle === "weekday"
                ? route.schedule.weekday.split(" - ")[1]
                : route.schedule.weekend.split(" - ")[1]}
            </p>
          </div>
        </div>
      </div>

      {/* Stops timeline */}
      <div className="px-5">
        <h2
          className="text-lg font-bold mb-4"
          style={{
            fontFamily: 'var(--font-display)',
            color: '#F0F2FF',
          }}
        >
          Recorrido de paradas
        </h2>

        <div className="relative">
          {/* Vertical line */}
          <div
            className="absolute left-4 top-0 bottom-0 w-0.5"
            style={{ backgroundColor: route.color, opacity: 0.3 }}
          />

          {/* Stops */}
          <div className="space-y-4">
            {route.stops.map((stop, index) => {
              const isFirst = index === 0;
              const isLast = index === route.stops.length - 1;

              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="relative flex items-start gap-4"
                >
                  {/* Stop marker */}
                  <div className="relative z-10 flex-shrink-0">
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm border-2"
                      style={{
                        backgroundColor: isFirst ? '#10B981' : isLast ? '#EF4444' : route.color,
                        borderColor: '#161820',
                      }}
                    >
                      {isFirst || isLast ? (
                        isFirst ? '🚏' : '🏁'
                      ) : (
                        index + 1
                      )}
                    </div>
                  </div>

                  {/* Stop info */}
                  <div className="flex-1 pt-1">
                    <p
                      className="font-semibold mb-1"
                      style={{
                        color: '#F0F2FF',
                        fontFamily: 'var(--font-body)',
                      }}
                    >
                      {stop}
                    </p>
                    <p className="text-xs" style={{ color: '#8B8FA8' }}>
                      {isFirst && "Punto de origen"}
                      {isLast && "Punto de destino"}
                      {!isFirst && !isLast && `≈ ${index * 2} min desde origen`}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Fixed bottom CTA */}
      <div className="fixed bottom-20 left-0 right-0 px-5 pb-4 z-50">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleStartTrip}
          className="w-full py-4 rounded-xl font-bold text-base shadow-2xl flex items-center justify-center gap-2"
          style={{
            backgroundColor: '#00E5A0',
            color: '#0D0F14',
          }}
        >
          <Navigation className="w-5 h-5" />
          Iniciar viaje
        </motion.button>
      </div>
    </div>
  );
}