import { Bus } from "lucide-react";

interface RouteChipProps {
  number: string;
  name: string;
  color: string;
  isActive?: boolean;
  onClick?: () => void;
}

export function RouteChip({ number, name, color, isActive, onClick }: RouteChipProps) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-3 px-4 py-3 rounded-xl border transition-all whitespace-nowrap"
      style={{
        backgroundColor: isActive ? 'rgba(0, 229, 160, 0.1)' : '#161820',
        borderColor: isActive ? '#00E5A0' : 'rgba(255, 255, 255, 0.09)',
        boxShadow: isActive ? '0px 0px 24px rgba(0, 229, 160, 0.18)' : 'none',
      }}
    >
      <div
        className="flex items-center justify-center w-8 h-8 rounded-lg"
        style={{ backgroundColor: color }}
      >
        <Bus className="w-4 h-4 text-white" />
      </div>
      <div className="flex items-center gap-2">
        <span
          className="font-bold text-sm"
          style={{
            fontFamily: 'var(--font-mono)',
            color: isActive ? '#00E5A0' : '#F0F2FF',
          }}
        >
          {number}
        </span>
        <div
          className="w-1.5 h-1.5 rounded-full"
          style={{ backgroundColor: color }}
        />
        <span
          className="text-sm font-medium"
          style={{ color: isActive ? '#F0F2FF' : '#8B8FA8' }}
        >
          {name.split(' - ')[1] || name}
        </span>
      </div>
    </button>
  );
}
