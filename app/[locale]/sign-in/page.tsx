"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
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
    <main className="min-h-screen flex flex-col justify-center max-w-sm mx-auto px-6 py-10">
      {/* Logo */}
      <div className="flex justify-center mb-8">
        <Link href={`/${locale}`}>
          <VayaLogo size={36} />
        </Link>
      </div>

      {/* Tab toggle */}
      <div className="flex bg-slate-100 rounded-xl p-1 mb-6">
        <button
          onClick={() => switchMode("signin")}
          className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${
            mode === "signin" ? "bg-blue-600 text-white" : "text-slate-500"
          }`}
        >
          {t("sign_in")}
        </button>
        <button
          onClick={() => switchMode("signup")}
          className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${
            mode === "signup" ? "bg-blue-600 text-white" : "text-slate-500"
          }`}
        >
          {t("sign_up")}
        </button>
      </div>

      <div className="flex flex-col gap-4">
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

        {/* Forgot password — signin only */}
        {mode === "signin" && (
          <div className="text-right -mt-2">
            <button className="text-xs text-blue-600">¿Olvidaste tu contraseña?</button>
          </div>
        )}

        {/* Role cards — signup only */}
        {mode === "signup" && (
          <div>
            <p className="text-sm font-medium text-slate-600 mb-2">¿Cómo vas a usar Vaya?</p>
            <div className="grid grid-cols-2 gap-3">
              {[
                { id: "rider", icon: "📍", label: "Pedir rides", desc: "Viaja de forma rápida y segura" },
                { id: "driver", icon: "🚗", label: "Manejar y ganar", desc: "Conduce y gana dinero" },
              ].map((r) => (
                <button
                  key={r.id}
                  onClick={() => setRole(r.id as "rider" | "driver")}
                  className={`p-4 rounded-2xl border-2 text-left transition-all ${
                    role === r.id
                      ? "border-blue-600 bg-blue-50"
                      : "border-slate-200 bg-white"
                  }`}
                >
                  <span className="text-2xl block mb-2">{r.icon}</span>
                  <p className="font-semibold text-sm text-slate-800">{r.label}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{r.desc}</p>
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
          className="w-full py-4 rounded-2xl btn-primary text-white font-semibold text-sm disabled:opacity-60"
        >
          {loading ? "..." : mode === "signin" ? t("btn_signin") : t("btn_signup")}
        </button>

        {/* Divider */}
        <div className="flex items-center gap-3">
          <div className="flex-1 h-px bg-slate-200" />
          <span className="text-xs text-slate-400">o continúa con</span>
          <div className="flex-1 h-px bg-slate-200" />
        </div>

        {/* Social buttons */}
        <button className="w-full py-3 rounded-xl border border-slate-200 bg-white flex items-center justify-center gap-2 text-sm font-medium text-slate-700">
          <img src="https://www.google.com/favicon.ico" className="w-4 h-4" alt="" /> Continuar con Google
        </button>
        <button className="w-full py-3 rounded-xl border border-slate-200 bg-white flex items-center justify-center gap-2 text-sm font-medium text-slate-700">
          🍎 Continuar con Apple
        </button>
      </div>
    </main>
  );
}
