import { useEffect, useState } from "react";
import { User, Settings, Bell, Heart, History, HelpCircle, LogOut, ChevronRight, MapPin, Award, Compass, Save, Check, Clock, Home, Briefcase, GraduationCap } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useNavigate } from "react-router";
import { api, type UserProfile, type UserPlace } from "../services/api";
import { ConfirmDialog } from "../components/ConfirmDialog";
import { Toast } from "../components/Toast";
import { AppLogo } from "../components/AppLogo";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, BarChart, Bar } from "recharts";
import { cn } from "../components/ui/utils";

export function Profile() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeSubTab, setActiveSubTab] = useState<"history" | "places" | "stats">("stats");
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const [isEditingPlaces, setIsEditingPlaces] = useState(false);

  // Form states for saved places
  const [homePlace, setHomePlace] = useState("");
  const [workPlace, setWorkPlace] = useState("");
  const [univPlace, setUnivPlace] = useState("");

  const [toast, setToast] = useState<{
    isOpen: boolean;
    message: string;
    type: "success" | "error" | "info" | "warning";
  }>({
    isOpen: false,
    message: "",
    type: "success",
  });

  useEffect(() => {
    async function loadProfile() {
      try {
        setLoading(true);
        const data = await api.getProfile();
        setProfile(data);
        setHomePlace(data.savedPlaces.home.address);
        setWorkPlace(data.savedPlaces.work.address);
        setUnivPlace(data.savedPlaces.university.address);
      } catch (err) {
        console.error("Error fetching profile:", err);
      } finally {
        setLoading(false);
      }
    }
    loadProfile();
  }, []);

  const handleLogout = () => {
    navigate("/");
    setToast({
      isOpen: true,
      message: "Sesión cerrada correctamente",
      type: "info",
    });
  };

  const handleSavePlaces = async () => {
    if (!profile) return;
    try {
      const updatedProfile: UserProfile = {
        ...profile,
        savedPlaces: {
          home: { ...profile.savedPlaces.home, address: homePlace },
          work: { ...profile.savedPlaces.work, address: workPlace },
          university: { ...profile.savedPlaces.university, address: univPlace },
        }
      };
      await api.updateProfile(updatedProfile);
      setProfile(updatedProfile);
      setIsEditingPlaces(false);
      setToast({
        isOpen: true,
        message: "¡Ubicaciones guardadas correctamente!",
        type: "success",
      });
    } catch (err) {
      console.error(err);
      setToast({
        isOpen: true,
        message: "Error al guardar ubicaciones",
        type: "error",
      });
    }
  };

  const handleHelp = () => {
    const phoneNumber = "573009083555";
    const message = encodeURIComponent("Hola, necesito soporte técnico con BusSamario 🚌");
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${message}`;
    window.open(whatsappUrl, '_blank');
    setToast({
      isOpen: true,
      message: "Abriendo chat de soporte…",
      type: "success",
    });
  };

  // Compute stats metrics
  const totalTrips = profile?.history.length || 0;
  const totalDistance = profile?.history.reduce((sum, item) => sum + item.distanceKm, 0).toFixed(1) || "0.0";
  const favoritesCount = profile?.favorites.length || 0;

  // Prepare chart data from trip logs
  const chartData = profile?.history.map((record) => {
    const d = new Date(record.date);
    return {
      name: d.toLocaleDateString("es-ES", { day: "numeric", month: "short" }),
      distance: record.distanceKm,
      duration: record.durationMinutes,
    };
  }).reverse() || [];

  return (
    <div className="pb-24 max-w-2xl mx-auto space-y-6">
      {/* Header Profile Title */}
      <div className="text-center md:text-left">
        <h1 className="text-2xl md:text-3xl font-extrabold text-[#F0F2FF] font-display">
          Mi Cuenta
        </h1>
        <p className="text-xs text-[#8B8FA8] font-sans mt-1">
          Administra tus datos, ubicaciones y estadísticas de transporte
        </p>
      </div>

      {loading ? (
        // Shimmer Profile Card
        <div className="h-52 w-full rounded-3xl bg-white/5 border border-white/[0.03] animate-pulse" />
      ) : (
        profile && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative rounded-3xl p-6 overflow-hidden border border-white/5 glass-panel"
          >
            {/* Ambient Background Gradient */}
            <div className="absolute -right-24 -top-24 w-52 h-52 rounded-full bg-gradient-to-br from-[#00E5A0]/20 to-[#4F8EF7]/20 blur-[100px]" />

            <div className="relative z-10 flex items-center gap-4">
              {/* Avatar image */}
              <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-primary/40 relative shadow-lg">
                <img
                  src={profile.avatar}
                  alt="Avatar del usuario"
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Identity info */}
              <div className="flex-1 min-w-0">
                <h2 className="text-lg font-bold text-[#F0F2FF] font-display truncate">
                  {profile.name}
                </h2>
                <p className="text-xs text-[#8B8FA8] font-mono truncate">{profile.email}</p>
                <div className="flex items-center gap-1.5 mt-1">
                  <Award className="w-3.5 h-3.5 text-[#00E5A0]" />
                  <span className="text-[10px] text-[#00E5A0] font-bold uppercase tracking-wider font-display">
                    Viajero Samario Pro
                  </span>
                </div>
              </div>
            </div>

            {/* Profile statistics row */}
            <div className="mt-6 pt-5 border-t border-white/[0.03] grid grid-cols-3 gap-2">
              <div className="text-center space-y-1">
                <p className="text-xl font-bold font-mono text-[#F0F2FF] leading-none">
                  {totalTrips}
                </p>
                <p className="text-[10px] uppercase font-bold tracking-wider text-[#8B8FA8] font-display">
                  Viajes
                </p>
              </div>
              <div className="text-center space-y-1 border-x border-white/[0.03]">
                <p className="text-xl font-bold font-mono text-[#00E5A0] leading-none">
                  {totalDistance} km
                </p>
                <p className="text-[10px] uppercase font-bold tracking-wider text-[#8B8FA8] font-display">
                  Distancia Total
                </p>
              </div>
              <div className="text-center space-y-1">
                <p className="text-xl font-bold font-mono text-[#4F8EF7] leading-none">
                  {favoritesCount}
                </p>
                <p className="text-[10px] uppercase font-bold tracking-wider text-[#8B8FA8] font-display">
                  Favoritos
                </p>
              </div>
            </div>
          </motion.div>
        )
      )}

      {/* Subtabs Navigation */}
      <div className="flex p-1 rounded-xl bg-white/5 border border-white/[0.03] select-none text-xs font-bold text-center">
        <button
          onClick={() => setActiveSubTab("stats")}
          className={cn(
            "flex-1 py-2 rounded-lg transition-all focus-ring-premium",
            activeSubTab === "stats" ? "bg-white/10 text-white shadow-sm" : "text-[#8B8FA8] hover:text-[#F0F2FF]"
          )}
        >
          Estadísticas
        </button>
        <button
          onClick={() => setActiveSubTab("places")}
          className={cn(
            "flex-1 py-2 rounded-lg transition-all focus-ring-premium",
            activeSubTab === "places" ? "bg-white/10 text-white shadow-sm" : "text-[#8B8FA8] hover:text-[#F0F2FF]"
          )}
        >
          Direcciones
        </button>
        <button
          onClick={() => setActiveSubTab("history")}
          className={cn(
            "flex-1 py-2 rounded-lg transition-all focus-ring-premium",
            activeSubTab === "history" ? "bg-white/10 text-white shadow-sm" : "text-[#8B8FA8] hover:text-[#F0F2FF]"
          )}
        >
          Historial
        </button>
      </div>

      {/* Dynamic Subtabs Panels */}
      <div className="min-h-[220px]">
        {activeSubTab === "stats" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="rounded-3xl border border-white/5 p-5 glass-panel space-y-4"
          >
            <div className="flex justify-between items-center">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#8B8FA8] font-display">
                Distancia Recorrida (Km por viaje)
              </h3>
              <span className="text-[10px] font-bold text-[#00E5A0] font-mono uppercase bg-[#00E5A0]/10 px-2 py-0.5 rounded-full">
                Distancia
              </span>
            </div>

            {chartData.length > 1 ? (
              <div className="h-44 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData} margin={{ top: 10, right: 5, left: -25, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorDistance" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#00E5A0" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#00E5A0" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="name" stroke="#4A4D60" fontSize={10} tickLine={false} />
                    <YAxis stroke="#4A4D60" fontSize={10} tickLine={false} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#131520",
                        borderColor: "rgba(255, 255, 255, 0.08)",
                        borderRadius: "12px",
                        fontFamily: "var(--font-body)",
                        fontSize: "11px",
                        color: "#F0F2FF"
                      }}
                      labelClassName="font-bold"
                    />
                    <Area
                      type="monotone"
                      dataKey="distance"
                      stroke="#00E5A0"
                      strokeWidth={2.5}
                      fillOpacity={1}
                      fill="url(#colorDistance)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-44 flex items-center justify-center border border-dashed border-white/10 rounded-2xl">
                <p className="text-xs text-[#8B8FA8] font-sans">
                  Realiza más viajes para generar gráficos de rendimiento…
                </p>
              </div>
            )}
          </motion.div>
        )}

        {activeSubTab === "places" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="rounded-3xl border border-white/5 p-5 glass-panel space-y-4"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#8B8FA8] font-display">
                Direcciones Guardadas
              </h3>
              
              {!isEditingPlaces ? (
                <button
                  onClick={() => setIsEditingPlaces(true)}
                  className="text-xs font-semibold text-[#00E5A0] hover:underline px-1 py-0.5 focus-ring-premium rounded"
                >
                  Editar
                </button>
              ) : (
                <button
                  onClick={handleSavePlaces}
                  className="flex items-center gap-1 text-xs font-bold text-[#00E5A0] bg-[#00E5A0]/10 border border-[#00E5A0]/25 px-2.5 py-1 rounded-lg focus-ring-premium"
                >
                  <Save className="w-3.5 h-3.5" />
                  Guardar
                </button>
              )}
            </div>

            <div className="space-y-3">
              {/* Casa */}
              <div className="flex gap-3 items-start border-b border-white/[0.03] pb-3">
                <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center flex-shrink-0">
                  <Home className="w-4 h-4 text-[#8B8FA8]" />
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-xs font-bold text-[#F0F2FF] font-display block">Casa</span>
                  {isEditingPlaces ? (
                    <input
                      type="text"
                      value={homePlace}
                      onChange={(e) => setHomePlace(e.target.value)}
                      className="w-full mt-1 px-3 py-1.5 rounded-lg text-xs bg-white/5 border border-white/10 text-white outline-none focus:border-[#00E5A0] transition-colors font-sans"
                    />
                  ) : (
                    <p className="text-xs text-[#8B8FA8] truncate font-sans mt-0.5">
                      {profile?.savedPlaces.home.address || "No configurado"}
                    </p>
                  )}
                </div>
              </div>

              {/* Trabajo */}
              <div className="flex gap-3 items-start border-b border-white/[0.03] pb-3">
                <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center flex-shrink-0">
                  <Briefcase className="w-4 h-4 text-[#8B8FA8]" />
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-xs font-bold text-[#F0F2FF] font-display block">Trabajo</span>
                  {isEditingPlaces ? (
                    <input
                      type="text"
                      value={workPlace}
                      onChange={(e) => setWorkPlace(e.target.value)}
                      className="w-full mt-1 px-3 py-1.5 rounded-lg text-xs bg-white/5 border border-white/10 text-white outline-none focus:border-[#00E5A0] transition-colors font-sans"
                    />
                  ) : (
                    <p className="text-xs text-[#8B8FA8] truncate font-sans mt-0.5">
                      {profile?.savedPlaces.work.address || "No configurado"}
                    </p>
                  )}
                </div>
              </div>

              {/* Universidad */}
              <div className="flex gap-3 items-start">
                <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center flex-shrink-0">
                  <GraduationCap className="w-4 h-4 text-[#8B8FA8]" />
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-xs font-bold text-[#F0F2FF] font-display block">Universidad</span>
                  {isEditingPlaces ? (
                    <input
                      type="text"
                      value={univPlace}
                      onChange={(e) => setUnivPlace(e.target.value)}
                      className="w-full mt-1 px-3 py-1.5 rounded-lg text-xs bg-white/5 border border-white/10 text-white outline-none focus:border-[#00E5A0] transition-colors font-sans"
                    />
                  ) : (
                    <p className="text-xs text-[#8B8FA8] truncate font-sans mt-0.5">
                      {profile?.savedPlaces.university.address || "No configurado"}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {activeSubTab === "history" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-2.5 max-h-[350px] overflow-y-auto pr-1 scrollbar-hide"
          >
            {profile?.history && profile.history.length > 0 ? (
              profile.history.map((record) => {
                const dateObj = new Date(record.date);
                const formatTime = dateObj.toLocaleTimeString("es-ES", { hour: "numeric", minute: "2-digit" });
                const formatDate = dateObj.toLocaleDateString("es-ES", { day: "numeric", month: "short" });
                
                return (
                  <div
                    key={record.id}
                    className="p-3 rounded-2xl border border-white/5 glass-panel flex items-center gap-3 relative"
                  >
                    {/* Tiny route indicator strip */}
                    <div className="w-1.5 self-stretch rounded-full" style={{ backgroundColor: record.routeColor }} />

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold text-[#FF6B6B] uppercase font-mono tracking-wider">
                          Ruta {record.routeNumber}
                        </span>
                        <span className="text-[9px] text-[#4A4D60] font-mono">
                          {formatDate} a las {formatTime}
                        </span>
                      </div>
                      <p className="text-xs font-bold text-[#F0F2FF] font-display truncate mt-0.5">
                        {record.from} → {record.to}
                      </p>
                      <div className="flex items-center gap-3 mt-1.5 text-[10px] text-[#8B8FA8] font-mono">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-[#8B8FA8]" />
                          {record.durationMinutes} min
                        </span>
                        <span className="flex items-center gap-1 text-[#00E5A0]">
                          <MapPin className="w-3 h-3 text-[#00E5A0]" />
                          {record.distanceKm} km
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="rounded-3xl border border-white/5 glass-panel p-8 text-center">
                <p className="text-xs text-[#8B8FA8]">No se registran viajes en tu historial…</p>
              </div>
            )}
          </motion.div>
        )}
      </div>

      {/* Support & Settings Links list */}
      <div className="space-y-2.5 select-none">
        <button
          onClick={handleHelp}
          className="w-full flex items-center gap-3.5 p-3 rounded-2xl border border-white/5 glass-panel-light text-left group focus-ring-premium"
        >
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center flex-shrink-0 text-purple-400">
            <HelpCircle className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-xs font-bold text-[#F0F2FF] font-display">Ayuda y Soporte</h4>
            <p className="text-[10px] text-[#8B8FA8] mt-0.5">Comunícate con nuestro equipo vía WhatsApp</p>
          </div>
          <ChevronRight className="w-4 h-4 text-[#4A4D60] group-hover:translate-x-0.5 transition-transform" />
        </button>

        <button
          onClick={() => setShowLogoutDialog(true)}
          className="w-full flex items-center gap-3.5 p-3 rounded-2xl border border-red-500/10 bg-red-500/5 text-left group focus-ring-premium"
        >
          <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center flex-shrink-0 text-[#FF6B6B]">
            <LogOut className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-xs font-bold text-[#FF6B6B] font-display">Cerrar Sesión</h4>
            <p className="text-[10px] text-red-500/50 mt-0.5">Salir de tu cuenta viajera local</p>
          </div>
          <ChevronRight className="w-4 h-4 text-red-500/40 group-hover:translate-x-0.5 transition-transform" />
        </button>
      </div>

      {/* App Version footer */}
      <div className="text-center space-y-1 select-none">
        <p className="text-[10px] font-mono text-[#4A4D60]">
          BusSamario Premium v3.0
        </p>
        <p className="text-[9px] text-[#4A4D60] font-sans">
          Hecho con ❤️ para la movilidad urbana sostenible de Santa Marta
        </p>
      </div>

      {/* Confirm dialogues */}
      <ConfirmDialog
        isOpen={showLogoutDialog}
        onClose={() => setShowLogoutDialog(false)}
        onConfirm={handleLogout}
        title="¿Cerrar sesión?"
        message="¿Estás seguro de cerrar sesión? Tu perfil local de viajes se mantendrá guardado."
        confirmText="Cerrar Sesión"
        cancelText="Cancelar"
        variant="destructive"
      />

      {/* Toast popup */}
      <Toast
        isOpen={toast.isOpen}
        onClose={() => setToast({ ...toast, isOpen: false })}
        message={toast.message}
        type={toast.type}
      />
    </div>
  );
}
