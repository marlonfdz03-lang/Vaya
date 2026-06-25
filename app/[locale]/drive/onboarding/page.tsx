"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { VayaLogo } from "@/components/VayaLogo";

type Step = "personal" | "vehicle" | "documents" | "selfie" | "review";

const STEPS: Step[] = ["personal", "vehicle", "documents", "selfie", "review"];

const STEP_LABELS = {
  personal: "Información Personal",
  vehicle: "Tu Vehículo",
  documents: "Documentos",
  selfie: "Selfie",
  review: "En Revisión",
};

const DOCS = [
  { key: "license_front", label: "Licencia (Frente)", icon: "🪪" },
  { key: "license_back", label: "Licencia (Reverso)", icon: "🪪" },
  { key: "insurance", label: "Seguro del Vehículo", icon: "🛡️" },
  { key: "registration", label: "Registro del Vehículo", icon: "📋" },
  { key: "vehicle_photo", label: "Foto del Vehículo", icon: "🚗" },
];

export default function DriverOnboarding() {
  const { locale } = useParams();
  const router = useRouter();
  const [step, setStep] = useState<Step>("personal");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Personal info
  const [personal, setPersonal] = useState({
    full_name: "", date_of_birth: "", address: "",
    phone: "", bank_account: "",
  });

  // Vehicle info
  const [vehicle, setVehicle] = useState({
    vehicle_make: "", vehicle_model: "", vehicle_year: "",
    vehicle_color: "", license_plate: "", vin: "",
  });

  // Documents
  const [docs, setDocs] = useState<Record<string, File | null>>({
    license_front: null, license_back: null,
    insurance: null, registration: null, vehicle_photo: null,
  });
  const [selfie, setSelfie] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState<Record<string, boolean>>({});

  const currentStepIndex = STEPS.indexOf(step);

  async function uploadFile(file: File, type: string, userId: string) {
    const ext = file.name.split(".").pop();
    const path = `${userId}/${type}.${ext}`;
    const { error } = await supabase.storage
      .from("driver-docs")
      .upload(path, file, { upsert: true });
    if (error) throw error;
    const { data } = supabase.storage.from("driver-docs").getPublicUrl(path);
    return data.publicUrl;
  }

  async function savePersonal() {
    setLoading(true);
    setError("");
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return router.push(`/${locale}/sign-in`);

    const { error } = await supabase.from("driver_profiles").upsert({
      id: user.id,
      ...personal,
      status: "incomplete",
    });
    setLoading(false);
    if (error) return setError(error.message);
    setStep("vehicle");
  }

  async function saveVehicle() {
    setLoading(true);
    setError("");
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase.from("driver_profiles").upsert({
      id: user.id,
      ...vehicle,
      vehicle_year: parseInt(vehicle.vehicle_year),
    });
    setLoading(false);
    if (error) return setError(error.message);
    setStep("documents");
  }

  async function saveDocs() {
    setLoading(true);
    setError("");
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    try {
      for (const [type, file] of Object.entries(docs)) {
        if (!file) { setError(`Falta: ${type}`); setLoading(false); return; }
        setUploadProgress(p => ({ ...p, [type]: false }));
        const url = await uploadFile(file, type, user.id);
        await supabase.from("driver_documents").upsert({
          driver_id: user.id, type, url, status: "pending"
        }, { onConflict: "driver_id,type" });
        setUploadProgress(p => ({ ...p, [type]: true }));
      }
      setStep("selfie");
    } catch (e: any) {
      setError(e.message);
    }
    setLoading(false);
  }

  async function saveSelfie() {
    if (!selfie) return setError("Por favor toma una selfie");
    setLoading(true);
    setError("");
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    try {
      const url = await uploadFile(selfie, "selfie", user.id);
      await supabase.from("driver_documents").upsert({
        driver_id: user.id, type: "selfie", url, status: "pending"
      }, { onConflict: "driver_id,type" });

      // Mark as pending review
      await supabase.from("driver_profiles")
        .update({ status: "pending" })
        .eq("id", user.id);

      setStep("review");
    } catch (e: any) {
      setError(e.message);
    }
    setLoading(false);
  }

  return (
    <main className="min-h-screen bg-slate-50 max-w-sm mx-auto px-6 pb-10">
      {/* Header */}
      <div className="pt-10 pb-6 text-center">
        <VayaLogo size={36} />
        <p className="text-sm text-slate-400 mt-2">Registro de conductor</p>
      </div>

      {/* Progress bar */}
      <div className="flex items-center gap-1 mb-8">
        {STEPS.filter(s => s !== "review").map((s, i) => (
          <div key={s} className="flex-1 flex flex-col items-center gap-1">
            <div className={`w-full h-1.5 rounded-full transition-all ${
              STEPS.indexOf(step) > i ? "bg-gradient-to-r from-blue-600 to-emerald-400" :
              step === s ? "bg-blue-600" : "bg-slate-200"
            }`}/>
          </div>
        ))}
      </div>

      {/* Step title */}
      <h1 className="text-xl font-bold text-slate-800 mb-6">
        {STEP_LABELS[step]}
      </h1>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-100 rounded-xl p-3 mb-4 flex gap-2">
          <span>⚠️</span>
          <p className="text-red-600 text-xs">{error}</p>
        </div>
      )}

      {/* STEP: PERSONAL */}
      {step === "personal" && (
        <div className="flex flex-col gap-3">
          {[
            { key: "full_name", label: "Nombre completo", type: "text", placeholder: "Juan Pérez" },
            { key: "date_of_birth", label: "Fecha de nacimiento", type: "date", placeholder: "" },
            { key: "address", label: "Dirección residencial", type: "text", placeholder: "123 Main St, Miami FL" },
            { key: "phone", label: "Teléfono", type: "tel", placeholder: "+1 305 000 0000" },
            { key: "bank_account", label: "Número de cuenta bancaria", type: "text", placeholder: "Para recibir pagos" },
          ].map((f) => (
            <div key={f.key}>
              <label className="text-xs font-medium text-slate-500 mb-1 block">{f.label}</label>
              <input
                type={f.type}
                placeholder={f.placeholder}
                value={personal[f.key as keyof typeof personal]}
                onChange={e => setPersonal(p => ({ ...p, [f.key]: e.target.value }))}
                className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-blue-500 bg-white"
              />
            </div>
          ))}
          <button
            onClick={savePersonal}
            disabled={loading}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-blue-600 to-emerald-400 text-white font-semibold mt-2 disabled:opacity-60"
          >
            {loading ? "Guardando..." : "Continuar →"}
          </button>
        </div>
      )}

      {/* STEP: VEHICLE */}
      {step === "vehicle" && (
        <div className="flex flex-col gap-3">
          {[
            { key: "vehicle_make", label: "Marca", placeholder: "Toyota" },
            { key: "vehicle_model", label: "Modelo", placeholder: "Camry" },
            { key: "vehicle_year", label: "Año", placeholder: "2020" },
            { key: "vehicle_color", label: "Color", placeholder: "Blanco" },
            { key: "license_plate", label: "Placa", placeholder: "ABC-1234" },
            { key: "vin", label: "VIN (opcional)", placeholder: "1HGBH41JXMN109186" },
          ].map((f) => (
            <div key={f.key}>
              <label className="text-xs font-medium text-slate-500 mb-1 block">{f.label}</label>
              <input
                type="text"
                placeholder={f.placeholder}
                value={vehicle[f.key as keyof typeof vehicle]}
                onChange={e => setVehicle(v => ({ ...v, [f.key]: e.target.value }))}
                className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-blue-500 bg-white"
              />
            </div>
          ))}
          <div className="flex gap-2 mt-2">
            <button onClick={() => setStep("personal")}
              className="flex-1 py-4 rounded-2xl border border-slate-200 text-slate-600 font-semibold text-sm">
              ← Atrás
            </button>
            <button onClick={saveVehicle} disabled={loading}
              className="flex-1 py-4 rounded-2xl bg-gradient-to-r from-blue-600 to-emerald-400 text-white font-semibold text-sm disabled:opacity-60">
              {loading ? "..." : "Continuar →"}
            </button>
          </div>
        </div>
      )}

      {/* STEP: DOCUMENTS */}
      {step === "documents" && (
        <div className="flex flex-col gap-3">
          <p className="text-xs text-slate-400 mb-2">Sube fotos claras de cada documento. JPG o PNG.</p>
          {DOCS.map((doc) => (
            <div key={doc.key} className="bg-white rounded-2xl border border-slate-100 p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-xl">{doc.icon}</span>
                  <p className="text-sm font-medium text-slate-700">{doc.label}</p>
                </div>
                {uploadProgress[doc.key] && <span className="text-emerald-500 text-xs">✅ Subido</span>}
                {docs[doc.key] && !uploadProgress[doc.key] && (
                  <span className="text-blue-500 text-xs">📎 {docs[doc.key]!.name.slice(0, 12)}...</span>
                )}
              </div>
              <label className="flex items-center justify-center w-full h-24 border-2 border-dashed border-slate-200 rounded-xl cursor-pointer hover:border-blue-400 transition-all">
                <input
                  type="file" accept="image/*" className="hidden"
                  onChange={e => {
                    const file = e.target.files?.[0] ?? null;
                    setDocs(d => ({ ...d, [doc.key]: file }));
                  }}
                />
                <div className="text-center">
                  <p className="text-2xl mb-1">📷</p>
                  <p className="text-xs text-slate-400">Toca para subir</p>
                </div>
              </label>
            </div>
          ))}
          <div className="flex gap-2 mt-2">
            <button onClick={() => setStep("vehicle")}
              className="flex-1 py-4 rounded-2xl border border-slate-200 text-slate-600 font-semibold text-sm">
              ← Atrás
            </button>
            <button onClick={saveDocs} disabled={loading}
              className="flex-1 py-4 rounded-2xl bg-gradient-to-r from-blue-600 to-emerald-400 text-white font-semibold text-sm disabled:opacity-60">
              {loading ? "Subiendo..." : "Continuar →"}
            </button>
          </div>
        </div>
      )}

      {/* STEP: SELFIE */}
      {step === "selfie" && (
        <div className="flex flex-col gap-4">
          <div className="bg-blue-50 rounded-2xl p-4 text-sm text-blue-700">
            <p className="font-semibold mb-1">📸 Tómate una selfie</p>
            <p className="text-xs">Asegúrate de estar en un lugar bien iluminado. Tu cara debe verse claramente.</p>
          </div>
          <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-slate-200 rounded-2xl cursor-pointer hover:border-blue-400 transition-all bg-white">
            <input type="file" accept="image/*" capture="user" className="hidden"
              onChange={e => setSelfie(e.target.files?.[0] ?? null)}
            />
            {selfie ? (
              <div className="text-center">
                <p className="text-4xl mb-2">✅</p>
                <p className="text-sm text-slate-600">{selfie.name}</p>
              </div>
            ) : (
              <div className="text-center">
                <p className="text-5xl mb-2">🤳</p>
                <p className="text-sm text-slate-400">Toca para tomar selfie</p>
              </div>
            )}
          </label>
          <div className="flex gap-2">
            <button onClick={() => setStep("documents")}
              className="flex-1 py-4 rounded-2xl border border-slate-200 text-slate-600 font-semibold text-sm">
              ← Atrás
            </button>
            <button onClick={saveSelfie} disabled={loading || !selfie}
              className="flex-1 py-4 rounded-2xl bg-gradient-to-r from-blue-600 to-emerald-400 text-white font-semibold text-sm disabled:opacity-40">
              {loading ? "Enviando..." : "Enviar →"}
            </button>
          </div>
        </div>
      )}

      {/* STEP: REVIEW */}
      {step === "review" && (
        <div className="flex flex-col items-center gap-6 py-8 text-center">
          <div className="w-20 h-20 rounded-full bg-blue-50 flex items-center justify-center">
            <span className="text-4xl">⏳</span>
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-800 mb-2">¡Solicitud enviada!</h2>
            <p className="text-sm text-slate-500 leading-relaxed">
              Nuestro equipo está revisando tus documentos. Te notificaremos por email cuando seas aprobado.
            </p>
            <p className="text-xs text-slate-400 mt-3">⏱ Tiempo estimado: 24-48 horas</p>
          </div>
          <div className="w-full bg-white rounded-2xl border border-slate-100 p-4 text-left flex flex-col gap-3">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Estado de documentos</p>
            {[...DOCS, { key: "selfie", label: "Selfie", icon: "🤳" }].map(doc => (
              <div key={doc.key} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span>{doc.icon}</span>
                  <span className="text-sm text-slate-700">{doc.label}</span>
                </div>
                <span className="text-xs bg-yellow-50 text-yellow-600 px-2 py-0.5 rounded-full">En revisión</span>
              </div>
            ))}
          </div>
          <button
            onClick={() => router.push(`/${locale}`)}
            className="text-sm text-slate-400"
          >
            Volver al inicio
          </button>
        </div>
      )}
    </main>
  );
}
