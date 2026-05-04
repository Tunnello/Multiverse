"use client";

type Props = {
  minYear: number;
  maxYear: number;
  value: number;
  onChange: (year: number) => void;
};

export function YearSlider({ minYear, maxYear, value, onChange }: Props) {
  return (
    <div className="flex items-center gap-3 px-4">
      <span className="text-xs text-zinc-400">{minYear}</span>
      <input
        type="range"
        min={minYear}
        max={maxYear}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="flex-1 h-1.5 bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
      />
      <span className="text-xs text-zinc-400">{maxYear}</span>
      <span className="text-sm font-mono text-blue-400 w-10 text-right">{value}</span>
    </div>
  );
}
