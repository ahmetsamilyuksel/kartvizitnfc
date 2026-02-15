"use client";

import { usePathname, useRouter } from "next/navigation";
import { locales } from "@/lib/i18n";
import { useState } from "react";

const langNames: Record<string, string> = {
  ru: "RU",
  tr: "TR",
  en: "EN",
};

export default function LanguageSwitcher({ currentLang }: { currentLang: string }) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const switchLang = (newLang: string) => {
    const segments = pathname.split("/");
    if (locales.includes(segments[1] as typeof locales[number])) {
      segments[1] = newLang;
    }
    router.push(segments.join("/"));
    setOpen(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white/10 border border-white/10 text-white/70 text-sm hover:bg-white/20 transition"
      >
        {langNames[currentLang] || currentLang.toUpperCase()}
        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-1 bg-gray-800 border border-white/10 rounded-lg shadow-xl overflow-hidden z-50">
          {locales.map((lang) => (
            <button
              key={lang}
              onClick={() => switchLang(lang)}
              className={`block w-full px-4 py-2 text-left text-sm hover:bg-white/10 transition ${
                lang === currentLang ? "text-teal-400" : "text-white/70"
              }`}
            >
              {langNames[lang]}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
