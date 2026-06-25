"use client";

import { useTranslations } from "next-intl";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { VayaLogo } from "@/components/VayaLogo";

export default function Home() {
  const t = useTranslations("home");
  const { locale } = useParams();
  const router = useRouter();

  return (
    <main className="relative min-h-screen max-w-sm mx-auto px-6">
      <div className="absolute top-6 right-6">
        <select
          defaultValue={locale as string}
          onChange={(e) => router.push(`/${e.target.value}`)}
          className="text-sm border border-slate-200 rounded-lg px-3 py-1.5 text-slate-600 bg-white"
        >
          <option value="es">🌐 ES</option>
          <option value="en">🌐 EN</option>
        </select>
      </div>

      <div className="pt-12 text-center">
        <div className="flex justify-center mb-6">
          <VayaLogo size={40} />
        </div>

        <h1 className="text-3xl font-bold mb-3 text-slate-900">
          {t("tagline")}{" "}
          <span className="text-gradient">
            {t("tagline_highlight")}
          </span>
        </h1>
        <p className="text-slate-500 text-sm mb-6">{t("subtitle")}</p>

        <div className="flex flex-col gap-3 mb-6">
          <Link
            href={`/${locale}/ride`}
            className="py-4 rounded-2xl btn-primary text-white font-semibold"
          >
            📍 {t("btn_rider")}
          </Link>
          <Link
            href={`/${locale}/drive`}
            className="py-4 rounded-2xl border-2 border-blue-600 text-blue-600 font-semibold"
          >
            🚗 {t("btn_driver")}
          </Link>
        </div>

        <div className="w-full rounded-2xl overflow-hidden border border-slate-100 shadow-sm mb-6" style={{ height: 220 }}>
          <img
            src="/map-preview.png"
            alt="Map preview"
            className="w-full h-full object-cover"
          />
        </div>

        <div className="grid grid-cols-2 gap-3 w-full mb-8">
          {[
            { icon: "⚡", title: t("feature_fast"), desc: t("feature_fast_desc"), bg: "bg-blue-50" },
            { icon: "🛡️", title: t("feature_safe"), desc: t("feature_safe_desc"), bg: "bg-emerald-50" },
            { icon: "💰", title: t("feature_price"), desc: t("feature_price_desc"), bg: "bg-blue-50" },
            { icon: "⭐", title: t("feature_reviews"), desc: t("feature_reviews_desc"), bg: "bg-emerald-50" },
          ].map((f) => (
            <div key={f.title} className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm text-left">
              <div className={`w-10 h-10 rounded-xl ${f.bg} flex items-center justify-center text-xl mb-3`}>
                {f.icon}
              </div>
              <p className="font-semibold text-sm text-slate-800">{f.title}</p>
              <p className="text-xs text-slate-400 mt-0.5">{f.desc}</p>
            </div>
          ))}
        </div>

        <p className="text-sm text-slate-500 pb-10">
          {t("login")}{" "}
          <Link href={`/${locale}/sign-in`} className="text-blue-600 font-semibold">
            {t("login_link")}
          </Link>
        </p>
      </div>
    </main>
  );
}
