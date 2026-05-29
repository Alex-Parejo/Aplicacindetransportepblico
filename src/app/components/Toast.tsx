import { motion, AnimatePresence } from "motion/react";
import { CheckCircle, X, Info, AlertTriangle } from "lucide-react";
import { useEffect } from "react";

export interface ToastProps {
  isOpen: boolean;
  onClose: () => void;
  message: string;
  type?: "success" | "error" | "info" | "warning";
  duration?: number;
}

export function Toast({
  isOpen,
  onClose,
  message,
  type = "success",
  duration = 3000,
}: ToastProps) {
  useEffect(() => {
    if (isOpen && duration > 0) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [isOpen, duration, onClose]);

  const config = {
    success: {
      icon: CheckCircle,
      bg: "#00E5A0",
      color: "#0D0F14",
    },
    error: {
      icon: AlertTriangle,
      bg: "#FF6B6B",
      color: "#F0F2FF",
    },
    info: {
      icon: Info,
      bg: "#4F8EF7",
      color: "#F0F2FF",
    },
    warning: {
      icon: AlertTriangle,
      bg: "#EAB308",
      color: "#0D0F14",
    },
  };

  const Icon = config[type].icon;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -100, opacity: 0 }}
          transition={{
            type: "spring",
            stiffness: 200,
            damping: 20,
          }}
          className="fixed top-4 left-4 right-4 z-[1300] mx-auto max-w-md"
          style={{ paddingTop: "max(env(safe-area-inset-top), 0px)" }}
        >
          <div
            className="rounded-xl p-4 flex items-center gap-3 relative overflow-hidden"
            style={{
              backgroundColor: config[type].bg,
              color: config[type].color,
              boxShadow: "0 8px 32px rgba(0, 0, 0, 0.3)",
            }}
          >
            {/* Icon */}
            <Icon className="w-5 h-5 flex-shrink-0" />

            {/* Message */}
            <p
              className="flex-1 font-medium text-sm"
              style={{ fontFamily: "var(--font-body)" }}
            >
              {message}
            </p>

            {/* Close button */}
            <button
              onClick={onClose}
              className="w-6 h-6 rounded-full flex items-center justify-center hover:opacity-80 transition-opacity"
              style={{
                backgroundColor:
                  type === "success" || type === "warning"
                    ? "rgba(0, 0, 0, 0.1)"
                    : "rgba(255, 255, 255, 0.1)",
              }}
            >
              <X className="w-4 h-4" />
            </button>

            {/* Progress bar */}
            {duration > 0 && (
              <motion.div
                initial={{ width: "100%" }}
                animate={{ width: "0%" }}
                transition={{ duration: duration / 1000, ease: "linear" }}
                className="absolute bottom-0 left-0 h-1"
                style={{
                  backgroundColor:
                    type === "success" || type === "warning"
                      ? "rgba(0, 0, 0, 0.2)"
                      : "rgba(255, 255, 255, 0.3)",
                }}
              />
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
