"use client";

import { useEffect, useState, useCallback } from "react";

interface CardData {
  id: string;
  fullName: string;
  company: string | null;
  title: string | null;
  phone: string | null;
  email: string | null;
  website: string | null;
  whatsapp: string | null;
  telegram: string | null;
  photoDataUrl: string | null;
  model: string;
  color: string;
}

function buildVCard(card: CardData): string {
  const lines: string[] = [
    "BEGIN:VCARD",
    "VERSION:3.0",
    `FN:${card.fullName}`,
  ];

  if (card.company) lines.push(`ORG:${card.company}`);
  if (card.title) lines.push(`TITLE:${card.title}`);
  if (card.phone) lines.push(`TEL;TYPE=CELL:${card.phone}`);
  if (card.email) lines.push(`EMAIL:${card.email}`);
  if (card.website) lines.push(`URL:${card.website}`);

  const notes: string[] = [];
  if (card.whatsapp) notes.push(`WhatsApp: ${card.whatsapp}`);
  if (card.telegram) notes.push(`Telegram: ${card.telegram}`);
  if (notes.length > 0) lines.push(`NOTE:${notes.join("\\n")}`);

  lines.push("END:VCARD");
  return lines.join("\r\n");
}

interface Props {
  card: CardData;
  t: {
    digitalCard: {
      addToContacts: string;
      call: string;
      whatsapp: string;
      email: string;
      website: string;
      telegram: string;
    };
  };
}

const colorAccents: Record<string, string> = {
  turquoise: "#14b8a6",
  navy: "#1e40af",
  graphite: "#6b7280",
};

export default function DigitalCardClient({ card, t }: Props) {
  const [qrSvg, setQrSvg] = useState<string>("");
  const accent = colorAccents[card.color] || colorAccents.turquoise;

  useEffect(() => {
    import("qrcode").then((QRCode) => {
      const vcardUrl = `${window.location.origin}/api/vcard/${card.id}`;
      QRCode.toString(vcardUrl, { type: "svg", margin: 1, color: { dark: "#ffffff", light: "#00000000" } })
        .then((svg: string) => setQrSvg(svg));
    });
  }, [card.id]);

  const handleAddContact = useCallback(() => {
    const vcardContent = buildVCard(card);

    // Try data URI first - works best on iOS to open native contact sheet
    // On Android, blob approach with download attribute triggers contact import
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);

    if (isIOS) {
      // iOS Safari: data URI with text/vcard opens the native "Add to Contacts" sheet
      window.location.href =
        "data:text/vcard;charset=utf-8," + encodeURIComponent(vcardContent);
    } else {
      // Android & others: create a blob and trigger via hidden anchor
      // Using text/x-vcard for broader Android compatibility
      const blob = new Blob([vcardContent], {
        type: "text/x-vcard;charset=utf-8",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${card.fullName.replace(/[^a-zA-Z0-9\u0400-\u04FF\u00C0-\u024F]/g, "_")}.vcf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(url), 3000);
    }
  }, [card]);

  const contacts = [
    card.phone && {
      label: t.digitalCard.call,
      href: `tel:${card.phone}`,
      value: card.phone,
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
        </svg>
      ),
    },
    card.whatsapp && {
      label: t.digitalCard.whatsapp,
      href: `https://wa.me/${card.whatsapp.replace(/[^0-9]/g, "")}`,
      value: card.whatsapp,
      icon: (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
          <path d="M12 2C6.477 2 2 6.477 2 12c0 1.89.525 3.66 1.438 5.168L2 22l4.832-1.438A9.955 9.955 0 0012 22c5.523 0 10-4.477 10-10S17.523 2 12 2zm0 18a7.963 7.963 0 01-4.106-1.138l-.294-.176-2.862.85.85-2.862-.176-.294A7.963 7.963 0 014 12c0-4.411 3.589-8 8-8s8 3.589 8 8-3.589 8-8 8z" />
        </svg>
      ),
    },
    card.email && {
      label: t.digitalCard.email,
      href: `mailto:${card.email}`,
      value: card.email,
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      ),
    },
    card.website && {
      label: t.digitalCard.website,
      href: card.website.startsWith("http") ? card.website : `https://${card.website}`,
      value: card.website,
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
        </svg>
      ),
    },
    card.telegram && {
      label: t.digitalCard.telegram,
      href: `https://t.me/${card.telegram.replace("@", "")}`,
      value: `@${card.telegram.replace("@", "")}`,
      icon: (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
          <path d="M11.944 0A12 12 0 000 12a12 12 0 0012 12 12 12 0 0012-12A12 12 0 0012 0a12 12 0 00-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 01.171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.479.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
        </svg>
      ),
    },
  ].filter(Boolean) as Array<{ label: string; href: string; value: string; icon: React.ReactNode }>;

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        {/* Header Card */}
        <div
          className="relative rounded-t-3xl p-8 pb-16 text-center overflow-hidden"
          style={{
            background: `linear-gradient(135deg, ${accent}33, ${accent}11)`,
          }}
        >
          <div
            className="absolute inset-0 opacity-20"
            style={{
              background: `radial-gradient(circle at 30% 20%, ${accent}, transparent 60%), radial-gradient(circle at 70% 80%, ${accent}, transparent 60%)`,
            }}
          />

          <div className="relative z-10">
            {card.photoDataUrl ? (
              <div
                className="w-[150px] h-[150px] rounded-full mx-auto mb-4 overflow-hidden border-4"
                style={{ borderColor: `${accent}66` }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={card.photoDataUrl} alt={card.fullName} className="w-full h-full object-cover" />
              </div>
            ) : (
              <div
                className="w-[150px] h-[150px] rounded-full mx-auto mb-4 flex items-center justify-center text-5xl font-bold border-4"
                style={{
                  borderColor: `${accent}66`,
                  background: `${accent}22`,
                  color: accent,
                }}
              >
                {card.fullName.charAt(0).toUpperCase()}
              </div>
            )}

            <h1 className="text-2xl font-bold text-white mb-1">{card.fullName}</h1>
            {card.title && (
              <p className="text-white/70 text-lg">{card.title}</p>
            )}
            {card.company && (
              <p className="text-white/50">{card.company}</p>
            )}
          </div>
        </div>

        {/* Contact Buttons */}
        <div className="bg-gray-900 rounded-b-3xl border-t-0 overflow-hidden">
          <div className="p-6 space-y-3">
            {contacts.map((contact, i) => (
              <a
                key={i}
                href={contact.href}
                target={contact.href.startsWith("http") ? "_blank" : undefined}
                rel={contact.href.startsWith("http") ? "noopener noreferrer" : undefined}
                className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/[0.06] hover:bg-white/10 hover:border-white/10 transition-all duration-200 group"
              >
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: `${accent}22`, color: accent }}
                >
                  {contact.icon}
                </div>
                <div className="min-w-0">
                  <div className="text-sm text-white/50">{contact.label}</div>
                  <div className="text-white truncate">{contact.value}</div>
                </div>
                <svg className="w-5 h-5 text-white/20 ml-auto group-hover:text-white/40 transition" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </a>
            ))}

            {/* Add to Contacts CTA */}
            <button
              onClick={handleAddContact}
              className="w-full flex items-center justify-center gap-3 p-4 rounded-2xl font-semibold text-white transition-all duration-200 hover:scale-[1.02] shadow-lg cursor-pointer"
              style={{
                background: `linear-gradient(135deg, ${accent}, ${accent}cc)`,
                boxShadow: `0 8px 32px ${accent}44`,
              }}
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              </svg>
              {t.digitalCard.addToContacts}
            </button>
          </div>

          {/* QR Code */}
          {qrSvg && (
            <div className="p-6 pt-2">
              <div className="flex justify-center">
                <div
                  className="w-32 h-32 opacity-60"
                  dangerouslySetInnerHTML={{ __html: qrSvg }}
                />
              </div>
            </div>
          )}

          <div className="py-4 text-center text-white/20 text-xs border-t border-white/5">
            NFC Card Studio
          </div>
        </div>
      </div>
    </div>
  );
}
