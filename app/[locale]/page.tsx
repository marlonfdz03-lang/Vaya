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
    <div className="min-h-screen flex flex-col">
      {/* Navbar */}
      <nav className="flex items-center justify-between px-6 md:px-12 py-5 bg-white border-b border-slate-100">
        <VayaLogo size={36} />
        <div className="flex items-center gap-4">
          <select
            defaultValue={locale as string}
            onChange={(e) => router.push(`/${e.target.value}`)}
            className="text-sm border border-slate-200 rounded-lg px-3 py-1.5 text-slate-600 bg-white"
          >
            <option value="es">🌐 ES</option>
            <option value="en">🌐 EN</option>
          </select>
          <Link
            href={`/${locale}/sign-in`}
            className="text-sm font-semibold text-slate-700 hover:text-blue-600 transition-colors"
          >
            Iniciar sesión
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="flex flex-col md:flex-row items-center justify-between px-6 md:px-12 py-12 md:py-16 bg-white min-h-[80vh] overflow-hidden gap-10">
        {/* Left column */}
        <div className="flex-1 max-w-lg">
          <span className="inline-block bg-emerald-50 text-emerald-600 text-xs font-semibold px-3 py-1.5 rounded-full mb-6">
            Tu viaje, a tu manera
          </span>
          <h1 className="text-4xl md:text-6xl font-extrabold text-slate-900 leading-tight mb-4">
            Muévete<br />
            <span className="bg-gradient-to-r from-blue-600 to-emerald-500 bg-clip-text text-transparent">
              con Vaya
            </span>
          </h1>
          <p className="text-slate-500 text-lg leading-relaxed mb-8 max-w-md">
            Viajes seguros, confiables y al mejor precio. Pide un ride en segundos o empieza a conducir y gana en tus tiempos.
          </p>
          <div className="flex items-center gap-3 mb-8">
            <Link
              href={`/${locale}/ride`}
              className="flex items-center gap-2 px-6 py-3.5 rounded-xl bg-blue-600 text-white font-semibold text-sm hover:bg-blue-700 transition-all"
            >
              🚗 Pedir ride
            </Link>
            <Link
              href={`/${locale}/drive`}
              className="flex items-center gap-2 px-6 py-3.5 rounded-xl border-2 border-emerald-500 text-emerald-600 font-semibold text-sm hover:bg-emerald-50 transition-all"
            >
              🎯 Conducir
            </Link>
          </div>
          <p className="text-sm text-slate-400">
            ¿Ya tienes cuenta?{" "}
            <Link href={`/${locale}/sign-in`} className="text-blue-600 font-semibold">
              Iniciar sesión
            </Link>
          </p>
        </div>

        {/* Right column — map image, hidden on mobile */}
        <div className="hidden md:flex flex-1 justify-end">
          <img
            src="/map-preview.png"
            alt="Mapa"
            className="w-full max-w-lg rounded-3xl object-cover shadow-xl"
          />
        </div>
      </section>

      {/* Features */}
      <section className="px-6 md:px-12 py-16 bg-slate-50">
        <div className="text-center mb-12">
          <p className="text-emerald-600 text-sm font-semibold mb-2">¿Por qué Vaya?</p>
          <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900">Hecho para ti</h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-5xl mx-auto">
          {[
            { icon: "🛡️", title: "Viajes seguros", desc: "Tu seguridad es nuestra prioridad. Conductores verificados y viajes monitoreados.", color: "bg-blue-50" },
            { icon: "⚡", title: "Rápido y fácil", desc: "Pide tu ride en segundos y llega a tu destino sin complicaciones.", color: "bg-emerald-50" },
            { icon: "💳", title: "Precios justos", desc: "Tarifas transparentes sin cobros ocultos. Sabrás el precio antes de viajar.", color: "bg-blue-50" },
            { icon: "🎧", title: "Soporte 24/7", desc: "Estamos aquí para ayudarte en cualquier momento.", color: "bg-emerald-50" },
          ].map((f) => (
            <div key={f.title} className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm text-center">
              <div className={`w-14 h-14 ${f.color} rounded-2xl flex items-center justify-center text-2xl mx-auto mb-4`}>
                {f.icon}
              </div>
              <h3 className="font-bold text-slate-800 mb-2">{f.title}</h3>
              <p className="text-sm text-slate-400 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* City footer */}
      <section className="relative overflow-hidden bg-white">
        <img
          src="/city-miami.png"
          alt="Miami"
          className="w-full object-cover h-64"
        />
      </section>
    </div>
  );
}
