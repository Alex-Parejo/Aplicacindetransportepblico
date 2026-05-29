import { motion } from "motion/react";

export function MapSkeleton() {
  return (
    <div className="absolute inset-0 overflow-hidden" style={{ backgroundColor: '#0D0F14' }}>
      {/* Shimmer overlay */}
      <motion.div
        animate={{
          x: ['-100%', '100%'],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "linear",
        }}
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'linear-gradient(90deg, transparent, rgba(0, 229, 160, 0.08), transparent)',
        }}
      />

      {/* Route line skeleton */}
      <div className="absolute inset-0 flex items-center justify-center p-8">
        <svg width="100%" height="100%" viewBox="0 0 300 400" fill="none">
          {/* Animated route path */}
          <motion.path
            d="M 50 50 Q 100 100 150 150 T 250 250 Q 200 300 150 350"
            stroke="#1E2029"
            strokeWidth="8"
            strokeLinecap="round"
            fill="none"
            animate={{
              strokeDashoffset: [0, 100],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "linear",
            }}
            style={{
              strokeDasharray: "20 10",
            }}
          />

          {/* Stop markers skeleton */}
          {[50, 150, 250, 350].map((y, index) => (
            <motion.g key={index}>
              <motion.circle
                cx={index % 2 === 0 ? 50 : 250}
                cy={y}
                r="12"
                fill="#1E2029"
                animate={{
                  opacity: [0.3, 0.6, 0.3],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  delay: index * 0.2,
                  ease: "easeInOut",
                  type: "keyframes",
                }}
              />
            </motion.g>
          ))}

          {/* Bus icon skeleton */}
          <motion.circle
            cx="150"
            cy="200"
            r="16"
            fill="#1E2029"
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.5, 0.8, 0.5],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: "easeInOut",
              type: "keyframes",
            }}
          />
        </svg>
      </div>

      {/* Pulsing circles */}
      <motion.div
        className="absolute top-1/3 left-1/4 w-32 h-32 rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(0, 229, 160, 0.1), transparent)',
        }}
        animate={{
          scale: [1, 1.5, 1],
          opacity: [0.3, 0.6, 0.3],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut",
          type: "keyframes",
        }}
      />

      <motion.div
        className="absolute bottom-1/3 right-1/4 w-24 h-24 rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(79, 142, 247, 0.1), transparent)',
        }}
        animate={{
          scale: [1.2, 1.7, 1.2],
          opacity: [0.3, 0.6, 0.3],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 1,
          type: "keyframes",
        }}
      />

      {/* Loading text */}
      <div className="absolute bottom-8 left-0 right-0 text-center">
        <motion.p
          className="text-sm font-medium"
          style={{
            color: '#8B8FA8',
            fontFamily: 'var(--font-body)',
          }}
          animate={{
            opacity: [0.5, 1, 0.5],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
            type: "keyframes",
          }}
        >
          Cargando mapa...
        </motion.p>
      </div>
    </div>
  );
}
