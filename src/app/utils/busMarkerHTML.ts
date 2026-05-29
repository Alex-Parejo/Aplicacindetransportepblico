export function createBusMarkerHTML(
  color: string,
  rotation: number = 0,
  state: "moving" | "stopped" | "near-user" | "out-of-service" = "moving",
  number?: string
): string {
  const isOutOfService = state === "out-of-service";
  const busColor = isOutOfService ? "#4A4D60" : color;
  const hasGlow = state === "moving" || state === "near-user";
  const isPulsing = state === "near-user";

  return `
    <div style="
      position: relative;
      width: 40px;
      height: 40px;
      display: flex;
      align-items: center;
      justify-content: center;
      transform: rotate(${rotation}deg);
      transition: transform 400ms ease-in-out;
    ">
      ${
        hasGlow
          ? `
        <div style="
          position: absolute;
          inset: 0;
          background-color: ${busColor};
          opacity: 0.3;
          filter: blur(8px);
          border-radius: 8px;
          ${isPulsing ? "animation: pulse 2s infinite;" : ""}
        "></div>
      `
          : ""
      }

      <svg
        width="40"
        height="40"
        viewBox="0 0 40 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style="filter: drop-shadow(0px 3px 6px rgba(0,0,0,0.5));"
      >
        <g transform="translate(6, 12)">
          <rect x="0" y="0" width="28" height="16" rx="5" fill="${busColor}"/>
          <rect x="9" y="1" width="10" height="5" rx="2" fill="white" opacity="0.6"/>
          <rect x="2" y="7" width="4" height="2" rx="0.5" fill="white" opacity="0.4"/>
          <rect x="22" y="7" width="4" height="2" rx="0.5" fill="white" opacity="0.4"/>
          <circle cx="3" cy="2" r="1.5" fill="#0D0F14"/>
          <circle cx="25" cy="2" r="1.5" fill="#0D0F14"/>
          <circle cx="3" cy="14" r="1.5" fill="#0D0F14"/>
          <circle cx="25" cy="14" r="1.5" fill="#0D0F14"/>
          ${
            number
              ? `
            <rect x="10" y="8" width="8" height="6" rx="2" fill="white" opacity="0.9"/>
            <text x="14" y="13" text-anchor="middle" font-size="5" font-weight="bold" fill="${busColor}" font-family="monospace">${number}</text>
          `
              : ""
          }
        </g>
        ${
          isOutOfService
            ? `
          <text x="20" y="8" text-anchor="middle" font-size="6" fill="#8B8FA8">zzz</text>
        `
            : ""
        }
        ${
          isPulsing
            ? `
          <circle cx="20" cy="20" r="18" fill="none" stroke="white" stroke-width="2" opacity="0.8" style="animation: pulse 2s infinite;"/>
        `
            : ""
        }
      </svg>

      ${
        state === "stopped"
          ? `
        <div style="
          position: absolute;
          top: -24px;
          left: 50%;
          transform: translateX(-50%);
          white-space: nowrap;
          padding: 2px 8px;
          border-radius: 4px;
          font-size: 8px;
          font-weight: bold;
          background-color: ${busColor};
          color: #F0F2FF;
          animation: fadeOut 3s forwards;
        ">En paradero</div>
      `
          : ""
      }

      <style>
        @keyframes pulse {
          0%, 100% { opacity: 0.8; transform: scale(1); }
          50% { opacity: 0.4; transform: scale(1.1); }
        }
        @keyframes fadeOut {
          0% { opacity: 1; }
          70% { opacity: 1; }
          100% { opacity: 0; }
        }
      </style>
    </div>
  `;
}
