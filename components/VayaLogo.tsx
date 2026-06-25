export function VayaLogo({ size = 32 }: { size?: number }) {
  return (
    <div className="flex items-center gap-2">
      <svg width={size} height={size} viewBox="0 0 42 42" fill="none">
        <defs>
          <linearGradient id="vg" x1="0" y1="0" x2="42" y2="42" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#0A58F5" />
            <stop offset="50%" stopColor="#00B4D8" />
            <stop offset="100%" stopColor="#28D67C" />
          </linearGradient>
        </defs>
        <path d="M6 8 L21 34 L36 8 L29 8 L21 22 L13 8 Z" fill="url(#vg)" />
        <circle cx="21" cy="18" r="3" fill="white" />
      </svg>
      <span
        style={{
          fontSize: size * 0.7,
          fontWeight: 700,
          background: "linear-gradient(90deg, #0A58F5, #28D67C)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          backgroundClip: "text",
        }}
      >
        Vaya
      </span>
    </div>
  );
}
