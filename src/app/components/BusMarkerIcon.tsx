interface BusMarkerIconProps {
  color: string;
  rotation?: number;
  state?: "moving" | "stopped" | "near-user" | "out-of-service";
  number?: string;
}

export function BusMarkerIcon({
  color,
  rotation = 0,
  state = "moving",
  number,
}: BusMarkerIconProps) {
  const isOutOfService = state === "out-of-service";
  const busColor = isOutOfService ? "#4A4D60" : color;
  const hasGlow = state === "moving" || state === "near-user";
  const isPulsing = state === "near-user";

  return (
    <div
      className="relative flex items-center justify-center"
      style={{
        width: "40px",
        height: "40px",
        transform: `rotate(${rotation}deg)`,
        transition: "transform 400ms ease-in-out",
      }}
    >
      {/* Glow effect */}
      {hasGlow && (
        <div
          className="absolute inset-0 rounded-lg"
          style={{
            backgroundColor: busColor,
            opacity: 0.3,
            filter: "blur(8px)",
            animation: isPulsing ? "pulse 2s infinite" : "none",
          }}
        />
      )}

      {/* Bus SVG */}
      <svg
        width="40"
        height="40"
        viewBox="0 0 40 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{
          filter: "drop-shadow(0px 3px 6px rgba(0,0,0,0.5))",
        }}
      >
        <defs>
          <linearGradient id="lightBeamGlowReact" x1="0%" y1="50%" x2="100%" y2="50%">
            <stop offset="0%" stopColor="#FFF4B8" stopOpacity={0.8}/>
            <stop offset="100%" stopColor="#FFF4B8" stopOpacity={0}/>
          </linearGradient>
          <linearGradient id="glassGradientReact" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#80D0FF" stopOpacity={0.8}/>
            <stop offset="100%" stopColor="#3A82F6" stopOpacity={0.6}/>
          </linearGradient>
        </defs>

        <g transform="translate(4, 10)">
          {/* Side wheels */}
          <rect x="5" y="-1.5" width="6" height="2" rx="0.5" fill="#131520" />
          <rect x="21" y="-1.5" width="6" height="2" rx="0.5" fill="#131520" />
          <rect x="5" y="19.5" width="6" height="2" rx="0.5" fill="#131520" />
          <rect x="21" y="19.5" width="6" height="2" rx="0.5" fill="#131520" />

          {/* Side mirrors */}
          <path d="M 23 2 L 26 -2 L 28 -2" stroke="#161820" strokeWidth={1.25} strokeLinecap="round" fill="none" />
          <rect x="27" y="-3.5" width="2.5" height="1.5" rx="0.5" fill="#0D0F14" />
          
          <path d="M 23 18 L 26 22 L 28 22" stroke="#161820" strokeWidth={1.25} strokeLinecap="round" fill="none" />
          <rect x="27" y="22" width="2.5" height="1.5" rx="0.5" fill="#0D0F14" />

          {/* Light beam */}
          <path d="M 32 3 L 36 1 L 36 19 L 32 17 Z" fill="url(#lightBeamGlowReact)" opacity={0.3} />

          {/* Main Body */}
          <rect x="0" y="0" width="32" height="20" rx="5" fill={busColor} stroke="#ffffff" strokeWidth={0.5} strokeOpacity={0.2}/>

          {/* Front Windshield */}
          <path d="M 25 2.5 Q 28 2.5 28 10 Q 28 17.5 25 17.5 Z" fill="url(#glassGradientReact)" />
          <path d="M 25.5 3.5 Q 27 3.5 27 10 Q 27 16.5 25.5 16.5 Z" fill="#ffffff" opacity="0.2" />

          {/* Headlights */}
          <circle cx="31" cy="4" r="1" fill="#FFF8D6" />
          <circle cx="31" cy="16" r="1" fill="#FFF8D6" />

          {/* Side Windows Top */}
          <rect x="4" y="2.5" width="5" height="1.5" rx="0.5" fill="#161820" opacity="0.6" />
          <rect x="10" y="2.5" width="5" height="1.5" rx="0.5" fill="#161820" opacity="0.6" />
          <rect x="16" y="2.5" width="5" height="1.5" rx="0.5" fill="#161820" opacity="0.6" />

          {/* Side Windows Bottom */}
          <rect x="4" y="16" width="5" height="1.5" rx="0.5" fill="#161820" opacity="0.6" />
          <rect x="10" y="16" width="5" height="1.5" rx="0.5" fill="#161820" opacity="0.6" />
          <rect x="16" y="16" width="5" height="1.5" rx="0.5" fill="#161820" opacity="0.6" />

          {/* Rear Window */}
          <rect x="1" y="4" width="1.5" height="12" rx="0.5" fill="url(#glassGradientReact)" />

          {/* Roof Details / AC */}
          <rect x="7" y="6" width="13" height="8" rx="2" fill="#0D0F14" opacity="0.2" />
          <line x1="10" y1="8" x2="17" y2="8" stroke="#FFFFFF" strokeOpacity={0.15} strokeWidth={0.75} />
          <line x1="10" y1="10" x2="17" y2="10" stroke="#FFFFFF" strokeOpacity={0.15} strokeWidth={0.75} />
          <line x1="10" y1="12" x2="17" y2="12" stroke="#FFFFFF" strokeOpacity={0.15} strokeWidth={0.75} />

          {/* Route Badge */}
          {number && (
            <>
              <rect x="8" y="7" width="11" height="6" rx="1.5" fill="#FFFFFF" />
              <text
                x="13.5"
                y="11.5"
                textAnchor="middle"
                fontSize="4.5"
                fontWeight="900"
                fill={busColor}
                fontFamily="monospace"
              >
                {number}
              </text>
            </>
          )}
        </g>

        {isOutOfService && (
          <text
            x="20"
            y="8"
            textAnchor="middle"
            fontSize="6"
            fontWeight="bold"
            fill="#8B8FA8"
            fontFamily="sans-serif"
          >
            zzz
          </text>
        )}

        {isPulsing && (
          <circle
            cx="20"
            cy="20"
            r="19"
            fill="none"
            stroke="white"
            strokeWidth="1.5"
            opacity="0.7"
            style={{
              animation: "pulse 2s infinite",
            }}
          />
        )}
      </svg>

      {/* At stop badge */}
      {state === "stopped" && (
        <div
          className="absolute -top-6 left-1/2 transform -translate-x-1/2 whitespace-nowrap px-2 py-0.5 rounded text-[8px] font-bold"
          style={{
            backgroundColor: busColor,
            color: "#F0F2FF",
            animation: "fadeOut 3s forwards",
          }}
        >
          En paradero
        </div>
      )}

      <style jsx>{`
        @keyframes pulse {
          0%, 100% {
            opacity: 0.8;
            transform: scale(1);
          }
          50% {
            opacity: 0.4;
            transform: scale(1.1);
          }
        }

        @keyframes fadeOut {
          0% {
            opacity: 1;
          }
          70% {
            opacity: 1;
          }
          100% {
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
}
