"use client";

interface CardPreviewProps {
  fullName: string;
  company?: string;
  title?: string;
  phone?: string;
  email?: string;
  website?: string;
  model: string;
  color: string;
  photoDataUrl?: string | null;
}

const colorMap: Record<string, { bg: string; accent: string; glow: string }> = {
  turquoise: {
    bg: "from-teal-900/80 to-teal-950/90",
    accent: "#14b8a6",
    glow: "shadow-teal-500/30",
  },
  navy: {
    bg: "from-blue-900/80 to-blue-950/90",
    accent: "#1e40af",
    glow: "shadow-blue-500/30",
  },
  graphite: {
    bg: "from-gray-700/80 to-gray-900/90",
    accent: "#374151",
    glow: "shadow-gray-500/30",
  },
};

export default function CardPreview({
  fullName,
  company,
  title,
  phone,
  email,
  website,
  model,
  color,
  photoDataUrl,
}: CardPreviewProps) {
  const scheme = colorMap[color] || colorMap.turquoise;

  return (
    <div
      className={`relative w-full max-w-sm aspect-[1.6/1] rounded-2xl bg-gradient-to-br ${scheme.bg} border border-white/10 shadow-2xl ${scheme.glow} overflow-hidden p-6 flex flex-col justify-between`}
    >
      {/* Model decorations */}
      {model === "wave" && (
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none"
          viewBox="0 0 400 250"
          preserveAspectRatio="none"
        >
          <path
            d="M0 180 Q100 130 200 180 Q300 230 400 180 L400 250 L0 250 Z"
            fill={scheme.accent}
            opacity="0.15"
          />
          <path
            d="M0 200 Q100 160 200 200 Q300 240 400 200 L400 250 L0 250 Z"
            fill={scheme.accent}
            opacity="0.1"
          />
        </svg>
      )}
      {model === "premium" && (
        <>
          <div
            className="absolute top-0 right-0 w-32 h-32 rounded-full opacity-10"
            style={{ background: `radial-gradient(circle, ${scheme.accent}, transparent)`, transform: "translate(30%, -30%)" }}
          />
          <div
            className="absolute bottom-0 left-0 w-24 h-24 rounded-full opacity-10"
            style={{ background: `radial-gradient(circle, ${scheme.accent}, transparent)`, transform: "translate(-30%, 30%)" }}
          />
        </>
      )}

      {/* Content */}
      <div className="relative z-10 flex items-start gap-4">
        {photoDataUrl ? (
          <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-white/20 flex-shrink-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={photoDataUrl} alt="" className="w-full h-full object-cover" />
          </div>
        ) : (
          <div
            className="w-14 h-14 rounded-full border-2 border-white/20 flex-shrink-0 flex items-center justify-center text-white/40"
            style={{ background: `${scheme.accent}33` }}
          >
            <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
        )}
        <div className="min-w-0">
          <h3 className="text-white font-bold text-lg leading-tight truncate">
            {fullName || "Your Name"}
          </h3>
          {title && <p className="text-white/60 text-sm truncate">{title}</p>}
          {company && <p className="text-white/50 text-xs truncate">{company}</p>}
        </div>
      </div>

      <div className="relative z-10 flex flex-wrap gap-x-4 gap-y-1 text-xs text-white/50">
        {phone && <span>{phone}</span>}
        {email && <span>{email}</span>}
        {website && <span>{website}</span>}
      </div>

      {/* NFC indicator */}
      <div className="absolute bottom-3 right-4 z-10">
        <svg className="w-6 h-6 text-white/20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.5 15.5a4 4 0 015.6-5.6M6 18a8 8 0 0111.3-11.3M12 12h.01" />
        </svg>
      </div>
    </div>
  );
}
