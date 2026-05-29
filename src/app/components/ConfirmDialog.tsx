import { motion, AnimatePresence } from "motion/react";

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: "default" | "destructive";
}

export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Confirmar",
  cancelText = "Cancelar",
  variant = "default",
}: ConfirmDialogProps) {
  const handleConfirm = () => {
    onConfirm();
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
            className="absolute inset-0 z-[1200]"
            style={{
              backgroundColor: "rgba(0, 0, 0, 0.7)",
              backdropFilter: "blur(8px)",
            }}
          />

          {/* Dialog */}
          <div className="absolute inset-0 z-[1201] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{
                type: "spring",
                stiffness: 300,
                damping: 25,
              }}
              className="w-full max-w-sm rounded-2xl overflow-hidden"
              style={{
                backgroundColor: "#161820",
                border: "1px solid rgba(255, 255, 255, 0.09)",
                boxShadow: "var(--shadow-card)",
              }}
            >
              {/* Content */}
              <div className="p-6">
                <h3
                  className="text-xl font-bold mb-3"
                  style={{
                    fontFamily: "var(--font-display)",
                    color: "#F0F2FF",
                  }}
                >
                  {title}
                </h3>
                <p
                  className="text-sm leading-relaxed"
                  style={{ color: "#8B8FA8" }}
                >
                  {message}
                </p>
              </div>

              {/* Actions */}
              <div className="p-4 border-t grid grid-cols-2 gap-3" style={{ borderColor: "rgba(255, 255, 255, 0.06)" }}>
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={onClose}
                  className="px-6 py-3 rounded-xl font-bold transition-colors"
                  style={{
                    backgroundColor: "transparent",
                    border: "1px solid rgba(255, 255, 255, 0.2)",
                    color: "#8B8FA8",
                  }}
                >
                  {cancelText}
                </motion.button>
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={handleConfirm}
                  className="px-6 py-3 rounded-xl font-bold transition-colors"
                  style={{
                    backgroundColor:
                      variant === "destructive"
                        ? "rgba(255, 107, 107, 0.15)"
                        : "#00E5A0",
                    color: variant === "destructive" ? "#FF6B6B" : "#0D0F14",
                    border:
                      variant === "destructive"
                        ? "1px solid rgba(255, 107, 107, 0.3)"
                        : "none",
                  }}
                >
                  {confirmText}
                </motion.button>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
