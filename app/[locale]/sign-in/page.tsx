"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter, useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { VayaLogo } from "@/components/VayaLogo";

export default function SignInPage() {
  const t = useTranslations("auth");
  const router = useRouter();
  const { locale } = useParams();

  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [role, setRole] = useState<"rider" | "driver">("rider");
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handle = (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  function switchMode(next: "signin" | "signup") {
    setMode(next);
    setError("");
  }

  async function submit() {
    setError("");
    setLoading(true);

    const res = await fetch("/api/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mode, role, ...form }),
    });

    const data = await res.json();
    setLoading(false);

    if (data.error === "exists") return setError(t("error_exists"));
    if (data.error === "invalid") return setError(t("error_invalid"));
    if (data.error || !data.user) return setError(data.error ?? "Something went wrong. Try again.");

    if (data.session) {
      localStorage.setItem("vaya_session", JSON.stringify(data.session));
      localStorage.setItem("vaya_user", JSON.stringify(data.user));
    }

    const userRole = data.user?.role ?? role;
    router.push(`/${locale}/${userRole === "driver" ? "drive" : "ride"}`);
  }

  return (
    <main className="min-h-screen max-w-sm mx-auto flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-6 pt-6">
        <button onClick={() => router.back()} className="text-slate-400 text-xl">←</button>
        <select
          defaultValue={locale as string}
          onChange={(e) => router.push(`/${e.target.value}/sign-in`)}
          className="text-sm border border-slate-200 rounded-lg px-3 py-1.5 text-slate-600 bg-white"
        >
          <option value="es">🌐 ES</option>
          <option value="en">🌐 EN</option>
        </select>
      </div>

      {/* Logo + title */}
      <div className="text-center py-6">
        <div className="flex justify-center">
          <VayaLogo size={56} />
        </div>
        <h1 className="text-2xl font-bold text-slate-900 mt-4">
          {mode === "signup" ? "Crea tu cuenta" : "Bienvenido de nuevo"}
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          {mode === "signup" ? "Únete a Vaya y empieza hoy." : "Inicia sesión para continuar."}
        </p>
      </div>

      <div className="px-6 flex flex-col gap-4">
        {/* Toggle */}
        <div className="flex bg-slate-100 rounded-2xl p-1 mb-2">
          {(["signin", "signup"] as const).map((m) => (
            <button
              key={m}
              onClick={() => switchMode(m)}
              className={`flex-1 py-3 rounded-xl text-sm font-semibold transition-all ${
                mode === m ? "" : "text-slate-400"
              }`}
              style={mode === m ? {
                background: "white",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
                WebkitBackgroundClip: "text",
                backgroundImage: "linear-gradient(to right, #0A58F5, #28D67C)",
                boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                borderRadius: "12px",
                color: "transparent",
              } : {}}
            >
              {m === "signin" ? "Iniciar sesión" : "Crear cuenta"}
            </button>
          ))}
        </div>

        {/* Name — signup only */}
        {mode === "signup" && (
          <div className="relative">
            <span className="absolute left-3 top-3.5 text-slate-400">👤</span>
            <input
              name="name"
              type="text"
              placeholder="Ingresa tu nombre completo"
              value={form.name}
              onChange={handle}
              className="w-full border border-slate-200 rounded-xl pl-10 pr-4 py-3 text-sm outline-none focus:border-blue-500 bg-white"
            />
          </div>
        )}

        {/* Email */}
        <div className="relative">
          <span className="absolute left-3 top-3.5 text-slate-400">✉️</span>
          <input
            name="email"
            type="email"
            placeholder="Ingresa tu correo electrónico"
            value={form.email}
            onChange={handle}
            className="w-full border border-slate-200 rounded-xl pl-10 pr-4 py-3 text-sm outline-none focus:border-blue-500 bg-white"
          />
        </div>

        {/* Password */}
        <div className="relative">
          <span className="absolute left-3 top-3.5 text-slate-400">🔒</span>
          <input
            name="password"
            type={showPassword ? "text" : "password"}
            placeholder={mode === "signup" ? "Crea una contraseña" : "Ingresa tu contraseña"}
            value={form.password}
            onChange={handle}
            className="w-full border border-slate-200 rounded-xl pl-10 pr-10 py-3 text-sm outline-none focus:border-blue-500 bg-white"
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            className="absolute right-3 top-3.5 text-slate-400"
            tabIndex={-1}
          >
            {showPassword ? "🙈" : "👁️"}
          </button>
        </div>

        {/* Password hint — signup only */}
        {mode === "signup" && (
          <p className="text-xs text-slate-400 -mt-2">
            Mínimo 8 caracteres, con mayúsculas, minúsculas, números y símbolos.
          </p>
        )}

        {/* Forgot password — signin only */}
        {mode === "signin" && (
          <div className="text-right -mt-2">
            <button className="text-xs text-blue-600">¿Olvidaste tu contraseña?</button>
          </div>
        )}

        {/* Role selector — signup only */}
        {mode === "signup" && (
          <div>
            <p className="text-sm font-semibold text-slate-700 mb-3">¿Cómo quieres usar Vaya?</p>
            <div className="flex flex-col gap-2">
              {[
                { id: "rider", icon: "🚗", label: "Pedir rides", desc: "Viaja de forma segura y cómoda.", color: "bg-blue-50" },
                { id: "driver", icon: "🎯", label: "Manejar y ganar", desc: "Conduce cuando quieras y gana dinero.", color: "bg-emerald-50" },
              ].map((r) => (
                <button
                  key={r.id}
                  onClick={() => setRole(r.id as "rider" | "driver")}
                  className={`flex items-center gap-4 p-4 rounded-2xl border-2 transition-all text-left ${
                    role === r.id ? "border-blue-500 bg-blue-50/30" : "border-slate-200 bg-white"
                  }`}
                >
                  <div className={`w-12 h-12 ${r.color} rounded-2xl flex items-center justify-center text-2xl flex-shrink-0`}>
                    {r.icon}
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-slate-800 text-sm">{r.label}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{r.desc}</p>
                  </div>
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                    role === r.id ? "border-blue-500" : "border-slate-300"
                  }`}>
                    {role === r.id && <div className="w-2.5 h-2.5 rounded-full bg-blue-500" />}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-100 rounded-xl p-3 flex items-start gap-2">
            <span className="text-red-500 mt-0.5">⚠️</span>
            <p className="text-red-600 text-xs">{error}</p>
          </div>
        )}

        {/* Submit */}
        <button
          onClick={submit}
          disabled={loading}
          className="w-full py-4 rounded-2xl bg-gradient-to-r from-blue-600 to-emerald-500 text-white font-bold text-base disabled:opacity-40 shadow-lg shadow-blue-200"
        >
          {loading ? "..." : mode === "signup" ? "Crear cuenta" : "Entrar"}
        </button>

        {/* Divider */}
        <div className="flex items-center gap-3">
          <div className="flex-1 h-px bg-slate-200" />
          <span className="text-xs text-slate-400">o continúa con</span>
          <div className="flex-1 h-px bg-slate-200" />
        </div>

        {/* Social buttons */}
        <div className="grid grid-cols-2 gap-3">
          <button className="flex items-center justify-center gap-2 py-3 rounded-xl border border-slate-200 bg-white text-sm font-medium text-slate-700">
            <img src="https://www.google.com/favicon.ico" className="w-4 h-4" alt="" /> Google
          </button>
          <button className="flex items-center justify-center gap-2 py-3 rounded-xl border border-slate-200 bg-white text-sm font-medium text-slate-700">
            🍎 Apple
          </button>
        </div>

        {/* Footer toggle */}
        <p className="text-center text-sm text-slate-400 pb-8">
          {mode === "signup" ? "¿Ya tienes cuenta? " : "¿No tienes cuenta? "}
          <button
            onClick={() => switchMode(mode === "signup" ? "signin" : "signup")}
            className="text-blue-600 font-semibold"
          >
            {mode === "signup" ? "Iniciar sesión" : "Regístrate"}
          </button>
        </p>

        {/* Spacer so content isn't hidden behind city illustration */}
        <div className="pb-36" />
      </div>

      {/* Fixed bottom city illustration */}
      <div className="fixed bottom-0 left-0 right-0 pointer-events-none">
        <img
          src="/city-miami.png"
          alt=""
          className="w-full object-cover object-top h-32 opacity-90"
        />
      </div>
    </main>
  );
}
