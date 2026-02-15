"use client";

const colors = [
  { id: "turquoise", hex: "#14b8a6", ring: "ring-teal-500" },
  { id: "navy", hex: "#1e40af", ring: "ring-blue-700" },
  { id: "graphite", hex: "#374151", ring: "ring-gray-600" },
];

interface ColorSelectorProps {
  selected: string;
  onChange: (color: string) => void;
  labels: Record<string, string>;
}

export default function ColorSelector({ selected, onChange, labels }: ColorSelectorProps) {
  return (
    <div className="flex gap-3">
      {colors.map((color) => (
        <button
          key={color.id}
          type="button"
          onClick={() => onChange(color.id)}
          className={`group flex flex-col items-center gap-2`}
        >
          <div
            className={`w-10 h-10 rounded-full border-2 transition-all duration-200 ${
              selected === color.id
                ? `ring-2 ${color.ring} ring-offset-2 ring-offset-gray-900 border-white/40 scale-110`
                : "border-white/20 hover:border-white/40"
            }`}
            style={{ backgroundColor: color.hex }}
          />
          <span className="text-xs text-white/60 group-hover:text-white/80">
            {labels[color.id] || color.id}
          </span>
        </button>
      ))}
    </div>
  );
}
