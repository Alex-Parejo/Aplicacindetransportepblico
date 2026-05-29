interface AppLogoProps {
  size?: number;
  showText?: boolean;
}

export function AppLogo({ size = 40, showText = true }: AppLogoProps) {
  return (
    <div className="flex items-center gap-3">
      {/* Logo icon */}
      <div
        className="rounded-2xl flex items-center justify-center relative overflow-hidden"
        style={{
          width: size,
          height: size,
          background: 'linear-gradient(135deg, #00E5A0 0%, #4F8EF7 100%)',
          boxShadow: '0 0 24px rgba(0, 229, 160, 0.3)',
        }}
      >
        {/* Abstract bus shape */}
        <svg
          width={size * 0.6}
          height={size * 0.6}
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M4 16C4 16.5304 4.21071 17.0391 4.58579 17.4142C4.96086 17.7893 5.46957 18 6 18H6.5C6.89782 18 7.27936 18.158 7.56066 18.4393C7.84196 18.7206 8 19.1022 8 19.5C8 19.8978 7.84196 20.2794 7.56066 20.5607C7.27936 20.842 6.89782 21 6.5 21C6.10218 21 5.72064 20.842 5.43934 20.5607C5.15804 20.2794 5 19.8978 5 19.5V19M4 16H3M4 16V6C4 5.46957 4.21071 4.96086 4.58579 4.58579C4.96086 4.21071 5.46957 4 6 4H18C18.5304 4 19.0391 4.21071 19.4142 4.58579C19.7893 4.96086 20 5.46957 20 6V16M20 16C20 16.5304 19.7893 17.0391 19.4142 17.4142C19.0391 17.7893 18.5304 18 18 18H17.5C17.1022 18 16.7206 18.158 16.4393 18.4393C16.158 18.7206 16 19.1022 16 19.5C16 19.8978 16.158 20.2794 16.4393 20.5607C16.7206 20.842 17.1022 21 17.5 21C17.8978 21 18.2794 20.842 18.5607 20.5607C18.842 20.2794 19 19.8978 19 19.5V19M20 16H21M8 12H16M8 8H16"
            stroke="white"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>

        {/* Glow effect */}
        <div
          className="absolute inset-0"
          style={{
            background: 'radial-gradient(circle at center, rgba(255,255,255,0.2) 0%, transparent 70%)',
          }}
        />
      </div>

      {/* App name */}
      {showText && (
        <div>
          <h1
            className="font-bold"
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: size * 0.5,
              background: 'linear-gradient(135deg, #00E5A0 0%, #4F8EF7 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            BusSamario
          </h1>
          <p
            className="text-xs"
            style={{
              color: '#8B8FA8',
              fontFamily: 'var(--font-body)',
              marginTop: -2,
            }}
          >
            Santa Marta
          </p>
        </div>
      )}
    </div>
  );
}
