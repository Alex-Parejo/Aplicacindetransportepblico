import { User, Settings, Bell, Heart, History, HelpCircle, LogOut, ChevronRight } from "lucide-react";
import { motion, useAnimate } from "motion/react";
import { useNavigate } from "react-router";
import { useState } from "react";
import { AppLogo } from "../components/AppLogo";
import { ConfirmDialog } from "../components/ConfirmDialog";
import { Toast } from "../components/Toast";

export function Profile() {
  const navigate = useNavigate();
  const [scope, animate] = useAnimate();
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const [toast, setToast] = useState<{
    isOpen: boolean;
    message: string;
    type: "success" | "error" | "info" | "warning";
  }>({
    isOpen: false,
    message: "",
    type: "success",
  });

  // Stats with count-up animation values
  const [stats] = useState({
    trips: 47,
    favorites: 3,
    rating: 4.9,
  });

  const handleLogout = () => {
    // Clear session and navigate to home
    navigate("/");
    setToast({
      isOpen: true,
      message: "Sesión cerrada exitosamente",
      type: "info",
    });
  };

  const handlePersonalInfo = () => {
    setToast({
      isOpen: true,
      message: "Funcionalidad de perfil próximamente disponible",
      type: "info",
    });
  };

  const handleHistory = () => {
    setToast({
      isOpen: true,
      message: `Has realizado ${stats.trips} viajes. Historial completo próximamente.`,
      type: "info",
    });
  };

  const handleFavorites = () => {
    navigate("/routes");
    setToast({
      isOpen: true,
      message: "Selecciona rutas para añadir a favoritos",
      type: "info",
    });
  };

  const handleNotifications = () => {
    setToast({
      isOpen: true,
      message: "Configuración de notificaciones próximamente disponible",
      type: "info",
    });
  };

  const handleSettings = () => {
    setToast({
      isOpen: true,
      message: "Configuración avanzada próximamente disponible",
      type: "info",
    });
  };

  const handleHelp = () => {
    // Abrir WhatsApp con mensaje predefinido
    const phoneNumber = "573009083555";
    const message = encodeURIComponent("Hola, necesito ayuda con BusSamario 🚌");
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${message}`;

    window.open(whatsappUrl, '_blank');

    setToast({
      isOpen: true,
      message: "Abriendo WhatsApp...",
      type: "success",
    });
  };

  const handleRating = () => {
    setToast({
      isOpen: true,
      message: `¡Excelente! Tienes ${stats.rating}⭐ de calificación como usuario`,
      type: "success",
    });
  };

  const menuItems = [
    {
      icon: User,
      label: "Información personal",
      description: "Edita tu perfil",
      color: "#00E5A0",
      onClick: handlePersonalInfo,
    },
    {
      icon: History,
      label: "Historial de viajes",
      description: "Tus últimas rutas",
      color: "#4F8EF7",
      onClick: handleHistory,
    },
    {
      icon: Heart,
      label: "Rutas favoritas",
      description: `${stats.favorites} rutas guardadas`,
      color: "#FF6B6B",
      onClick: handleFavorites,
    },
    {
      icon: Bell,
      label: "Notificaciones",
      description: "Alertas y recordatorios",
      color: "#EAB308",
      onClick: handleNotifications,
    },
    {
      icon: Settings,
      label: "Configuración",
      description: "Ajustes de la app",
      color: "#8B8FA8",
      onClick: handleSettings,
    },
    {
      icon: HelpCircle,
      label: "Ayuda y soporte",
      description: "Contáctanos vía WhatsApp",
      color: "#A855F7",
      onClick: handleHelp,
    },
  ];

  return (
    <div className="pb-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-center mb-6">
          <AppLogo size={60} showText={false} />
        </div>

        {/* User info card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative rounded-2xl p-6 overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, #00E5A0 0%, #4F8EF7 100%)',
            boxShadow: '0 0 40px rgba(0, 229, 160, 0.2)',
          }}
        >
          {/* Animated background */}
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.6, 0.3],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut",
              type: "keyframes",
            }}
            className="absolute -right-10 -top-10 w-40 h-40 bg-white/20 rounded-full blur-3xl"
          />

          <div className="relative z-10 flex items-center gap-4">
            {/* Avatar */}
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center bg-white/20 backdrop-blur-sm border-2 border-white/40"
            >
              <User className="w-8 h-8 text-white" />
            </div>

            {/* User info */}
            <div className="flex-1">
              <h2
                className="text-xl font-bold text-white mb-1"
                style={{ fontFamily: 'var(--font-display)' }}
              >
                Viajero Samario
              </h2>
              <p className="text-sm text-white/80">
                Miembro desde Mayo 2026
              </p>
            </div>

            {/* Edit button */}
            <button
              onClick={handleSettings}
              className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center hover:bg-white/30 transition-colors"
            >
              <Settings className="w-5 h-5 text-white" />
            </button>
          </div>

          {/* Stats */}
          <div className="mt-6 grid grid-cols-3 gap-4">
            <button
              onClick={handleHistory}
              className="text-center hover:opacity-80 transition-opacity"
            >
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.8 }}
                className="text-2xl font-bold text-white mb-1"
                style={{ fontFamily: 'var(--font-mono)' }}
              >
                {stats.trips}
              </motion.p>
              <p className="text-xs text-white/80">Viajes</p>
            </button>
            <button
              onClick={handleFavorites}
              className="text-center hover:opacity-80 transition-opacity"
            >
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.8 }}
                className="text-2xl font-bold text-white mb-1"
                style={{ fontFamily: 'var(--font-mono)' }}
              >
                {stats.favorites}
              </motion.p>
              <p className="text-xs text-white/80">Favoritas</p>
            </button>
            <button
              onClick={handleRating}
              className="text-center hover:opacity-80 transition-opacity"
            >
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.8 }}
                className="text-2xl font-bold text-white mb-1"
                style={{ fontFamily: 'var(--font-mono)' }}
              >
                ★ {stats.rating}
              </motion.p>
              <p className="text-xs text-white/80">Rating</p>
            </button>
          </div>
        </motion.div>
      </div>

      {/* Menu items */}
      <div className="space-y-3">
        {menuItems.map((item, index) => {
          const Icon = item.icon;

          return (
            <motion.button
              key={item.label}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              whileHover={{ scale: 0.98, x: 5 }}
              whileTap={{ scale: 0.96 }}
              onClick={item.onClick}
              className="w-full rounded-xl p-4 border flex items-center gap-4 group"
              style={{
                backgroundColor: '#161820',
                borderColor: 'rgba(255, 255, 255, 0.06)',
              }}
            >
              {/* Icon */}
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{
                  backgroundColor: `${item.color}15`,
                }}
              >
                <Icon className="w-5 h-5" style={{ color: item.color }} />
              </div>

              {/* Content */}
              <div className="flex-1 text-left min-w-0">
                <h3
                  className="font-bold mb-0.5"
                  style={{
                    fontFamily: 'var(--font-display)',
                    color: '#F0F2FF',
                  }}
                >
                  {item.label}
                </h3>
                <p className="text-xs" style={{ color: '#8B8FA8' }}>
                  {item.description}
                </p>
              </div>

              {/* Arrow */}
              <ChevronRight
                className="w-5 h-5 flex-shrink-0 transition-transform group-hover:translate-x-1"
                style={{ color: '#8B8FA8' }}
              />
            </motion.button>
          );
        })}
      </div>

      {/* Logout button */}
      <motion.button
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        whileTap={{ scale: 0.96 }}
        onClick={() => setShowLogoutDialog(true)}
        className="w-full mt-6 p-4 rounded-xl border flex items-center justify-center gap-3"
        style={{
          backgroundColor: 'rgba(255, 107, 107, 0.1)',
          borderColor: 'rgba(255, 107, 107, 0.3)',
        }}
      >
        <LogOut className="w-5 h-5" style={{ color: '#FF6B6B' }} />
        <span
          className="font-bold"
          style={{
            fontFamily: 'var(--font-display)',
            color: '#FF6B6B',
          }}
        >
          Cerrar sesión
        </span>
      </motion.button>

      {/* Version */}
      <p className="text-center text-xs mt-6" style={{ color: '#4A4D60' }}>
        BusSamario v2.1 · Hecho con ❤️ en Santa Marta
      </p>

      {/* Logout confirmation dialog */}
      <ConfirmDialog
        isOpen={showLogoutDialog}
        onClose={() => setShowLogoutDialog(false)}
        onConfirm={handleLogout}
        title="¿Cerrar sesión?"
        message="Deberás ingresar nuevamente."
        confirmText="Cerrar sesión →"
        cancelText="Cancelar"
        variant="destructive"
      />

      {/* Toast notifications */}
      <Toast
        isOpen={toast.isOpen}
        onClose={() => setToast({ ...toast, isOpen: false })}
        message={toast.message}
        type={toast.type}
      />
    </div>
  );
}
