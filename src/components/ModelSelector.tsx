"use client";

const models = [
  {
    id: "minimal",
    icon: (
      <svg viewBox="0 0 80 50" className="w-full h-full">
        <rect x="5" y="5" width="70" height="40" rx="4" fill="currentColor" opacity="0.2" />
        <line x1="15" y1="20" x2="45" y2="20" stroke="currentColor" strokeWidth="2" />
        <line x1="15" y1="28" x2="35" y2="28" stroke="currentColor" strokeWidth="1.5" opacity="0.5" />
      </svg>
    ),
  },
  {
    id: "wave",
    icon: (
      <svg viewBox="0 0 80 50" className="w-full h-full">
        <rect x="5" y="5" width="70" height="40" rx="4" fill="currentColor" opacity="0.2" />
        <path d="M5 30 Q25 15 40 30 Q55 45 75 30" stroke="currentColor" strokeWidth="2" fill="none" opacity="0.6" />
        <line x1="15" y1="18" x2="45" y2="18" stroke="currentColor" strokeWidth="2" />
      </svg>
    ),
  },
  {
    id: "premium",
    icon: (
      <svg viewBox="0 0 80 50" className="w-full h-full">
        <defs>
          <linearGradient id="premGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="currentColor" stopOpacity="0.3" />
            <stop offset="100%" stopColor="currentColor" stopOpacity="0.1" />
          </linearGradient>
        </defs>
        <rect x="5" y="5" width="70" height="40" rx="4" fill="url(#premGrad)" />
        <circle cx="60" cy="15" r="6" fill="currentColor" opacity="0.3" />
        <line x1="15" y1="20" x2="45" y2="20" stroke="currentColor" strokeWidth="2" />
        <line x1="15" y1="28" x2="35" y2="28" stroke="currentColor" strokeWidth="1.5" opacity="0.5" />
        <line x1="15" y1="34" x2="50" y2="34" stroke="currentColor" strokeWidth="1" opacity="0.3" />
      </svg>
    ),
  },
];

interface ModelSelectorProps {
  selected: string;
  onChange: (model: string) => void;
  labels: Record<string, string>;
}

export default function ModelSelector({ selected, onChange, labels }: ModelSelectorProps) {
  return (
    <div className="grid grid-cols-3 gap-3">
      {models.map((model) => (
        <button
          key={model.id}
          type="button"
          onClick={() => onChange(model.id)}
          className={`relative p-3 rounded-xl border-2 transition-all duration-200 ${
            selected === model.id
              ? "border-teal-500 bg-teal-500/10 shadow-lg shadow-teal-500/20"
              : "border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/10"
          }`}
        >
          <div className="w-full h-12 text-white mb-2">{model.icon}</div>
          <p className="text-xs text-center text-white/80 font-medium">
            {labels[model.id] || model.id}
          </p>
        </button>
      ))}
    </div>
  );
}
