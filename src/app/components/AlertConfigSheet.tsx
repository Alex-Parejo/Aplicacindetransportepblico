import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X } from "lucide-react";

interface AlertConfigSheetProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (config: AlertConfig) => void;
}

export interface AlertConfig {
  type: "1-stop" | "2-stops" | "5-min" | "vibrate-only";
  label: string;
}

const alertOptions: AlertConfig[] = [
  { type: "1-stop", label: "Notificarme 1 parada antes" },
  { type: "2-stops", label: "Notificarme 2 paradas antes" },
  { type: "5-min", label: "Notificarme 5 min antes" },
  { type: "vibrate-only", label: "Solo vibración (sin sonido)" },
];

export function AlertConfigSheet({
  isOpen,
  onClose,
  onSave,
}: AlertConfigSheetProps) {
  const [selectedOption, setSelectedOption] = useState<AlertConfig>(
    alertOptions[1]
  ); // Default: 2 stops before

  const handleSave = () => {
    onSave(selectedOption);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-[1100]"
            style={{
              backgroundColor: "rgba(0, 0, 0, 0.7)",
              backdropFilter: "blur(4px)",
            }}
          />

          {/* Sheet */}
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{
              type: "spring",
              stiffness: 300,
              damping: 30,
            }}
            className="fixed bottom-0 left-0 right-0 z-[1101] rounded-t-3xl overflow-hidden"
            style={{
              backgroundColor: "#161820",
              height: "45vh",
              boxShadow: "0px -4px 20px rgba(0, 0, 0, 0.35)",
            }}
          >
            {/* Handle bar */}
            <div className="flex justify-center pt-3 pb-2">
              <div
                className="h-1 rounded-full"
                style={{
                  width: "32px",
                  backgroundColor: "#4A4D60",
                }}
              />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: "rgba(255, 255, 255, 0.06)" }}>
              <h2
                className="text-xl font-bold"
                style={{
                  fontFamily: "var(--font-display)",
                  color: "#F0F2FF",
                }}
              >
                Configurar alerta de llegada
              </h2>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-surface-2 transition-colors"
              >
                <X className="w-5 h-5" style={{ color: "#8B8FA8" }} />
              </button>
            </div>

            {/* Options */}
            <div className="p-5 space-y-3">
              {alertOptions.map((option) => (
                <motion.button
                  key={option.type}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => setSelectedOption(option)}
                  className="w-full flex items-center gap-3 p-4 rounded-xl transition-all"
                  style={{
                    backgroundColor:
                      selectedOption.type === option.type
                        ? "rgba(0, 229, 160, 0.1)"
                        : "#1E2029",
                    border:
                      selectedOption.type === option.type
                        ? "2px solid #00E5A0"
                        : "2px solid rgba(255, 255, 255, 0.06)",
                  }}
                >
                  {/* Radio indicator */}
                  <div
                    className="w-5 h-5 rounded-full border-2 flex items-center justify-center"
                    style={{
                      borderColor:
                        selectedOption.type === option.type
                          ? "#00E5A0"
                          : "#4A4D60",
                    }}
                  >
                    {selectedOption.type === option.type && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="w-2.5 h-2.5 rounded-full"
                        style={{ backgroundColor: "#00E5A0" }}
                      />
                    )}
                  </div>

                  {/* Label */}
                  <span
                    className="flex-1 text-left font-medium"
                    style={{
                      color:
                        selectedOption.type === option.type
                          ? "#F0F2FF"
                          : "#8B8FA8",
                    }}
                  >
                    {option.label}
                  </span>
                </motion.button>
              ))}
            </div>

            {/* Actions */}
            <div className="absolute bottom-0 left-0 right-0 p-5 border-t" style={{ borderColor: "rgba(255, 255, 255, 0.06)" }}>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={onClose}
                  className="px-6 py-3 rounded-xl font-bold transition-colors"
                  style={{
                    backgroundColor: "transparent",
                    border: "1px solid rgba(255, 255, 255, 0.2)",
                    color: "#8B8FA8",
                  }}
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSave}
                  className="px-6 py-3 rounded-xl font-bold transition-colors"
                  style={{
                    background: "linear-gradient(135deg, #00E5A0 0%, #4F8EF7 100%)",
                    color: "#0D0F14",
                  }}
                >
                  Guardar alerta →
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
