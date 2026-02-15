"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { getMessages } from "@/lib/i18n";
import ModelSelector from "@/components/ModelSelector";
import ColorSelector from "@/components/ColorSelector";
import PhotoUpload from "@/components/PhotoUpload";
import CardPreview from "@/components/CardPreview";
import LanguageSwitcher from "@/components/LanguageSwitcher";

export default function CreatePage() {
  const { lang } = useParams<{ lang: string }>();
  const router = useRouter();
  const t = getMessages(lang);

  const [model, setModel] = useState("minimal");
  const [color, setColor] = useState("turquoise");
  const [photo, setPhoto] = useState<string | null>(null);
  const [form, setForm] = useState({
    fullName: "",
    company: "",
    title: "",
    phone: "",
    email: "",
    website: "",
    whatsapp: "",
    telegram: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

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
    if (!form.fullName.trim()) errs.fullName = t.common.required;
    if (!form.phone.trim()) errs.phone = t.common.required;
    return errs;
  };

  const handleSubmit = () => {
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    const cardData = {
      ...form,
      model,
      color,
      photoDataUrl: photo,
    };
    sessionStorage.setItem("cardData", JSON.stringify(cardData));
    router.push(`/${lang}/checkout`);
  };

  const fields = [
    { name: "fullName", label: t.create.form.fullName, required: true },
    { name: "company", label: t.create.form.company },
    { name: "title", label: t.create.form.title },
    { name: "phone", label: t.create.form.phone, required: true, type: "tel" },
    { name: "email", label: t.create.form.email, type: "email" },
    { name: "website", label: t.create.form.website, type: "url" },
    { name: "whatsapp", label: t.create.form.whatsapp, type: "tel" },
    { name: "telegram", label: t.create.form.telegram },
  ];

  return (
    <div className="min-h-screen bg-gray-950">
      <nav className="fixed top-0 w-full z-50 bg-gray-950/80 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href={`/${lang}`} className="text-xl font-bold bg-gradient-to-r from-teal-400 to-blue-500 bg-clip-text text-transparent">
            NFC Card Studio
          </Link>
          <LanguageSwitcher currentLang={lang} />
        </div>
      </nav>

      <div className="pt-24 pb-12 px-4 max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-white">{t.create.title}</h1>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Left: Config */}
          <div className="space-y-8">
            {/* Model */}
            <div>
              <h2 className="text-sm font-semibold text-white/60 uppercase tracking-wider mb-3">
                {t.create.model}
              </h2>
              <ModelSelector
                selected={model}
                onChange={setModel}
                labels={t.create.models}
              />
            </div>

            {/* Color */}
            <div>
              <h2 className="text-sm font-semibold text-white/60 uppercase tracking-wider mb-3">
                {t.create.color}
              </h2>
              <ColorSelector
                selected={color}
                onChange={setColor}
                labels={t.create.colors}
              />
            </div>

            {/* Photo */}
            <div>
              <h2 className="text-sm font-semibold text-white/60 uppercase tracking-wider mb-3">
                {t.create.photo}
              </h2>
              <PhotoUpload
                photo={photo}
                onChange={setPhoto}
                uploadLabel={t.create.uploadPhoto}
                changeLabel={t.create.changePhoto}
              />
            </div>

            {/* Form */}
            <div className="space-y-4">
              {fields.map((field) => (
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
                      errors[field.name]
                        ? "border-red-500/50"
                        : "border-white/10 focus:border-teal-500/50"
                    } text-white placeholder-white/20 outline-none transition`}
                  />
                  {errors[field.name] && (
                    <p className="text-red-400 text-xs mt-1">{errors[field.name]}</p>
                  )}
                </div>
              ))}
            </div>

            <button
              onClick={handleSubmit}
              className="w-full py-4 rounded-xl bg-gradient-to-r from-teal-500 to-blue-600 text-white font-semibold text-lg shadow-xl shadow-teal-500/20 hover:shadow-teal-500/40 hover:scale-[1.02] transition-all duration-300"
            >
              {t.create.next}
            </button>
          </div>

          {/* Right: Preview */}
          <div className="lg:sticky lg:top-24 lg:self-start">
            <h2 className="text-sm font-semibold text-white/60 uppercase tracking-wider mb-4">
              {t.create.preview}
            </h2>
            <div className="flex justify-center">
              <CardPreview
                fullName={form.fullName}
                company={form.company}
                title={form.title}
                phone={form.phone}
                email={form.email}
                website={form.website}
                model={model}
                color={color}
                photoDataUrl={photo}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
