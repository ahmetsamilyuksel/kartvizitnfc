"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { getMessages } from "@/lib/i18n";

export default function OrderSuccessPage() {
  const { lang } = useParams<{ lang: string }>();
  const router = useRouter();
  const t = getMessages(lang);

  const [orderResult, setOrderResult] = useState<{
    orderId: string;
    cardId: string;
  } | null>(null);

  useEffect(() => {
    const stored = sessionStorage.getItem("orderResult");
    if (!stored) {
      router.push(`/${lang}`);
      return;
    }
    setOrderResult(JSON.parse(stored));
  }, [lang, router]);

  if (!orderResult) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-white/60">{t.common.loading}</div>
      </div>
    );
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const cardUrl = `${appUrl}/${lang}/a/${orderResult.cardId}`;

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center space-y-8">
        <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-teal-500 to-blue-600 flex items-center justify-center">
          <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>

        <div>
          <h1 className="text-3xl font-bold text-white mb-2">{t.success.title}</h1>
          <p className="text-white/60">{t.success.message}</p>
        </div>

        <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/[0.06] space-y-4">
          <div>
            <div className="text-sm text-white/40 mb-1">{t.success.orderNumber}</div>
            <div className="text-lg font-mono text-white">{orderResult.orderId}</div>
          </div>

          <div className="border-t border-white/10 pt-4">
            <div className="text-sm text-white/40 mb-2">{t.success.nfcLink}</div>
            <div className="text-xs text-teal-400 break-all mb-3">{cardUrl}</div>
            <Link
              href={`/${lang}/a/${orderResult.cardId}`}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-teal-500/20 border border-teal-500/30 text-teal-400 font-medium hover:bg-teal-500/30 transition"
            >
              {t.success.viewCard}
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </Link>
          </div>
        </div>

        <Link
          href={`/${lang}`}
          className="inline-block text-white/50 hover:text-white transition"
        >
          {t.success.backHome}
        </Link>
      </div>
    </div>
  );
}
