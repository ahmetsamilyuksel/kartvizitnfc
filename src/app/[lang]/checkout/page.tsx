"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { getMessages } from "@/lib/i18n";
import CardPreview from "@/components/CardPreview";

interface PaymentMethod {
  id: string;
  name: string;
  type: string;
  instructions: string | null;
}

interface CheckoutData {
  basePriceRub: number;
  currency: string;
  paymentMethods: PaymentMethod[];
}

export default function CheckoutPage() {
  const { lang } = useParams<{ lang: string }>();
  const router = useRouter();
  const t = getMessages(lang);

  const [cardData, setCardData] = useState<Record<string, string> | null>(null);
  const [checkoutData, setCheckoutData] = useState<CheckoutData | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState("");
  const [form, setForm] = useState({
    customerFullName: "",
    customerPhone: "",
    customerEmail: "",
    shippingCountry: "",
    shippingCity: "",
    shippingAddress1: "",
    shippingAddress2: "",
    shippingPostalCode: "",
    notes: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    const stored = sessionStorage.getItem("cardData");
    if (!stored) {
      router.push(`/${lang}/create`);
      return;
    }
    setCardData(JSON.parse(stored));

    fetch("/api/public/checkout-data")
      .then((r) => r.json())
      .then((data) => setCheckoutData(data));
  }, [lang, router]);

  const updateField = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!form.customerFullName.trim()) errs.customerFullName = t.common.required;
    if (!form.customerPhone.trim()) errs.customerPhone = t.common.required;
    if (!form.shippingCountry.trim()) errs.shippingCountry = t.common.required;
    if (!form.shippingCity.trim()) errs.shippingCity = t.common.required;
    if (!form.shippingAddress1.trim()) errs.shippingAddress1 = t.common.required;
    if (!selectedPayment) errs.payment = t.common.required;
    return errs;
  };

  const handleSubmit = async () => {
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          card: cardData,
          ...form,
          paymentMethodId: selectedPayment,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        alert(err.error || "Error");
        return;
      }

      const { orderId, cardId } = await res.json();
      sessionStorage.removeItem("cardData");
      sessionStorage.setItem(
        "orderResult",
        JSON.stringify({ orderId, cardId })
      );
      router.push(`/${lang}/order/success`);
    } catch {
      alert("Network error");
    } finally {
      setLoading(false);
    }
  };

  if (!cardData || !checkoutData) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-white/60">{t.common.loading}</div>
      </div>
    );
  }

  const customerFields = [
    { name: "customerFullName", label: t.checkout.fullName, required: true },
    { name: "customerPhone", label: t.checkout.phone, required: true, type: "tel" },
    { name: "customerEmail", label: t.checkout.email, type: "email" },
  ];

  const shippingFields = [
    { name: "shippingCountry", label: t.checkout.country, required: true },
    { name: "shippingCity", label: t.checkout.city, required: true },
    { name: "shippingAddress1", label: t.checkout.address, required: true },
    { name: "shippingAddress2", label: t.checkout.address2 },
    { name: "shippingPostalCode", label: t.checkout.postalCode },
    { name: "notes", label: t.checkout.notes },
  ];

  return (
    <div className="min-h-screen bg-gray-950">
      <nav className="fixed top-0 w-full z-50 bg-gray-950/80 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href={`/${lang}`} className="text-xl font-bold bg-gradient-to-r from-teal-400 to-blue-500 bg-clip-text text-transparent">
            NFC Card Studio
          </Link>
        </div>
      </nav>

      <div className="pt-24 pb-12 px-4 max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-white">{t.checkout.title}</h1>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            {/* Customer Info */}
            <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/[0.06]">
              <h2 className="text-lg font-semibold mb-4">{t.checkout.customerInfo}</h2>
              <div className="space-y-4">
                {customerFields.map((field) => (
                  <div key={field.name}>
                    <label className="block text-sm text-white/60 mb-1">
                      {field.label}
                      {field.required && <span className="text-red-400 ml-1">*</span>}
                    </label>
                    <input
                      type={field.type || "text"}
                      value={form[field.name as keyof typeof form]}
                      onChange={(e) => updateField(field.name, e.target.value)}
                      className={`w-full px-4 py-3 rounded-xl bg-white/5 border ${
                        errors[field.name] ? "border-red-500/50" : "border-white/10 focus:border-teal-500/50"
                      } text-white outline-none transition`}
                    />
                    {errors[field.name] && (
                      <p className="text-red-400 text-xs mt-1">{errors[field.name]}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Shipping */}
            <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/[0.06]">
              <h2 className="text-lg font-semibold mb-4">{t.checkout.shipping}</h2>
              <div className="space-y-4">
                {shippingFields.map((field) => (
                  <div key={field.name}>
                    <label className="block text-sm text-white/60 mb-1">
                      {field.label}
                      {field.required && <span className="text-red-400 ml-1">*</span>}
                    </label>
                    {field.name === "notes" ? (
                      <textarea
                        value={form[field.name as keyof typeof form]}
                        onChange={(e) => updateField(field.name, e.target.value)}
                        rows={3}
                        className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:border-teal-500/50 text-white outline-none transition resize-none"
                      />
                    ) : (
                      <input
                        type="text"
                        value={form[field.name as keyof typeof form]}
                        onChange={(e) => updateField(field.name, e.target.value)}
                        className={`w-full px-4 py-3 rounded-xl bg-white/5 border ${
                          errors[field.name] ? "border-red-500/50" : "border-white/10 focus:border-teal-500/50"
                        } text-white outline-none transition`}
                      />
                    )}
                    {errors[field.name] && (
                      <p className="text-red-400 text-xs mt-1">{errors[field.name]}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Payment */}
            <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/[0.06]">
              <h2 className="text-lg font-semibold mb-4">{t.checkout.payment}</h2>
              <div className="space-y-3">
                {checkoutData.paymentMethods.map((pm) => (
                  <button
                    key={pm.id}
                    type="button"
                    onClick={() => {
                      setSelectedPayment(pm.id);
                      setErrors((prev) => {
                        const next = { ...prev };
                        delete next.payment;
                        return next;
                      });
                    }}
                    className={`w-full text-left p-4 rounded-xl border transition ${
                      selectedPayment === pm.id
                        ? "border-teal-500/50 bg-teal-500/10"
                        : "border-white/10 bg-white/5 hover:border-white/20"
                    }`}
                  >
                    <div className="font-medium">{pm.name}</div>
                    {pm.instructions && (
                      <div className="text-sm text-white/50 mt-1">{pm.instructions}</div>
                    )}
                  </button>
                ))}
                {errors.payment && (
                  <p className="text-red-400 text-xs">{errors.payment}</p>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:sticky lg:top-24 lg:self-start space-y-6">
            <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/[0.06]">
              <h2 className="text-lg font-semibold mb-4">{t.checkout.card}</h2>
              <div className="scale-75 origin-top-left">
                <CardPreview
                  fullName={cardData.fullName}
                  company={cardData.company}
                  title={cardData.title}
                  phone={cardData.phone}
                  email={cardData.email}
                  website={cardData.website}
                  model={cardData.model}
                  color={cardData.color}
                  photoDataUrl={cardData.photoDataUrl}
                />
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/[0.06]">
              <h2 className="text-lg font-semibold mb-2">{t.checkout.total}</h2>
              <div className="text-3xl font-bold text-teal-400">
                {checkoutData.basePriceRub} {checkoutData.currency}
              </div>
            </div>

            <button
              onClick={handleSubmit}
              disabled={loading}
              className="w-full py-4 rounded-xl bg-gradient-to-r from-teal-500 to-blue-600 text-white font-semibold text-lg shadow-xl shadow-teal-500/20 hover:shadow-teal-500/40 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
            >
              {loading ? t.common.loading : t.checkout.placeOrder}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
