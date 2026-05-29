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
        {/* Bus body - top-down view */}
        <g transform="translate(6, 12)">
          {/* Main body */}
          <rect
            x="0"
            y="0"
            width="28"
            height="16"
            rx="5"
            fill={busColor}
          />

          {/* Front windshield (lighter color) */}
          <rect
            x="9"
            y="1"
            width="10"
            height="5"
            rx="2"
            fill="white"
            opacity="0.6"
          />

          {/* Side windows */}
          <rect
            x="2"
            y="7"
            width="4"
            height="2"
            rx="0.5"
            fill="white"
            opacity="0.4"
          />
          <rect
            x="22"
            y="7"
            width="4"
            height="2"
            rx="0.5"
            fill="white"
            opacity="0.4"
          />

          {/* Wheels */}
          <circle cx="3" cy="2" r="1.5" fill="#0D0F14" />
          <circle cx="25" cy="2" r="1.5" fill="#0D0F14" />
          <circle cx="3" cy="14" r="1.5" fill="#0D0F14" />
          <circle cx="25" cy="14" r="1.5" fill="#0D0F14" />

          {/* Route number badge (centered) */}
          {number && (
            <>
              <rect
                x="10"
                y="8"
                width="8"
                height="6"
                rx="2"
                fill="white"
                opacity="0.9"
              />
              <text
                x="14"
                y="13"
                textAnchor="middle"
                fontSize="5"
                fontWeight="bold"
                fill={busColor}
                fontFamily="var(--font-mono)"
              >
                {number}
              </text>
            </>
          )}
        </g>

        {/* "zzz" for out of service */}
        {isOutOfService && (
          <text
            x="20"
            y="8"
            textAnchor="middle"
            fontSize="6"
            fill="#8B8FA8"
            fontFamily="sans-serif"
          >
            zzz
          </text>
        )}

        {/* Near user pulse border */}
        {isPulsing && (
          <circle
            cx="20"
            cy="20"
            r="18"
            fill="none"
            stroke="white"
            strokeWidth="2"
            opacity="0.8"
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
