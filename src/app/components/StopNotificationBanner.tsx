import { motion, AnimatePresence } from "motion/react";
import { Bell, X } from "lucide-react";
import { useState } from "react";

interface StopNotificationBannerProps {
  stopName: string;
  eta: number;
  onDismiss?: () => void;
}

export function StopNotificationBanner({ stopName, eta, onDismiss }: StopNotificationBannerProps) {
  const [isVisible, setIsVisible] = useState(true);

  const handleDismiss = () => {
    setIsVisible(false);
    setTimeout(() => {
      onDismiss?.();
    }, 300);
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -100, opacity: 0 }}
          transition={{
            type: "spring",
            stiffness: 200,
            damping: 20,
          }}
          className="fixed top-0 left-0 right-0 z-[1001] p-4"
          style={{ paddingTop: 'max(env(safe-area-inset-top), 16px)' }}
        >
          <motion.div
            animate={{
              scale: [1, 1.02, 1],
            }}
            transition={{
              duration: 0.3,
              repeat: 2,
            }}
            className="rounded-2xl p-4 shadow-2xl relative overflow-hidden"
            style={{
              background: 'linear-gradient(135deg, #00E5A0 0%, #4F8EF7 100%)',
              boxShadow: '0 8px 32px rgba(0, 229, 160, 0.3)',
            }}
          >
            {/* Animated background */}
            <motion.div
              animate={{
                opacity: [0.3, 0.6, 0.3],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
                type: "keyframes",
              }}
              className="absolute inset-0 bg-white/10"
            />

            <div className="relative z-10 flex items-center gap-4">
              {/* Icon */}
              <motion.div
                animate={{
                  rotate: [0, 15, -15, 0],
                }}
                transition={{
                  duration: 0.5,
                  repeat: 3,
                }}
                className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center"
              >
                <Bell className="w-6 h-6 text-white" />
              </motion.div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-white/90 mb-0.5">
                  Próxima parada en {eta} min
                </p>
                <h3
                  className="text-base font-bold text-white truncate"
                  style={{ fontFamily: 'var(--font-display)' }}
                >
                  {stopName}
                </h3>
              </div>

              {/* Dismiss button */}
              <button
                onClick={handleDismiss}
                className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center hover:bg-white/30 transition-colors"
              >
                <X className="w-4 h-4 text-white" />
              </button>
            </div>

            {/* Progress bar */}
            <motion.div
              initial={{ width: "100%" }}
              animate={{ width: "0%" }}
              transition={{ duration: 5, ease: "linear" }}
              className="absolute bottom-0 left-0 h-1 bg-white/40"
            />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
