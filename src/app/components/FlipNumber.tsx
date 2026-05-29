import { motion, AnimatePresence } from "motion/react";
import { useEffect, useState } from "react";

interface FlipNumberProps {
  value: number;
  size?: "sm" | "md" | "lg";
  color?: string;
}

export function FlipNumber({ value, size = "md", color = "#00E5A0" }: FlipNumberProps) {
  const [prevValue, setPrevValue] = useState(value);

  useEffect(() => {
    setPrevValue(value);
  }, [value]);

  const sizeClasses = {
    sm: "text-xl",
    md: "text-2xl",
    lg: "text-4xl",
  };

  return (
    <div className="inline-block relative overflow-hidden">
      <AnimatePresence mode="popLayout">
        <motion.span
          key={value}
          initial={{ y: value > prevValue ? 20 : -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: value > prevValue ? -20 : 20, opacity: 0 }}
          transition={{
            type: "spring",
            stiffness: 300,
            damping: 25,
          }}
          className={`${sizeClasses[size]} font-bold inline-block`}
          style={{
            fontFamily: 'var(--font-mono)',
            color: color,
          }}
        >
          {value}
        </motion.span>
      </AnimatePresence>
    </div>
  );
}
