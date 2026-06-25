"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

type DriverStatus = "pending" | "approved" | "rejected";

interface Driver {
  id: string;
  name: string;
  email: string;
  phone: string;
  status: DriverStatus;
  created_at: string;
  vehicle_make: string;
  vehicle_model: string;
  vehicle_year: number;
  vehicle_color: string;
  license_plate: string;
  documents: Document[];
}

interface Document {
  id: string;
  type: string;
  url: string;
  status: string;
}

const DOC_LABELS: Record<string, string> = {
  license_front: "Licencia (Frente)",
  license_back: "Licencia (Reverso)",
  insurance: "Seguro",
  registration: "Registro",
  vehicle_photo: "Foto del Vehículo",
  selfie: "Selfie",
};

export default function AdminPanel() {
  const router = useRouter();
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [selected, setSelected] = useState<Driver | null>(null);
  const [filter, setFilter] = useState<"all" | DriverStatus>("pending");
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [showRejectModal, setShowRejectModal] = useState(false);

  useEffect(() => {
    checkAdmin();
  }, []);

  async function checkAdmin() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return router.push("/");

    const { data: profile } = await supabase
      .from("users")
      .select("is_admin")
      .eq("id", user.id)
      .single();

    if (!profile?.is_admin) return router.push("/");
    fetchDrivers();
  }

  async function fetchDrivers() {
    setLoading(true);
    const { data, error } = await supabase
      .from("driver_profiles")
      .select(`
        *,
        users!inner(name, email),
        driver_documents(id, type, url, status)
      `)
      .order("created_at", { ascending: false });

    if (!error && data) {
      setDrivers(data.map((d: any) => ({
        id: d.id,
        name: d.users?.name ?? "—",
        email: d.users?.email ?? "—",
        phone: d.phone,
        status: d.status,
        created_at: d.created_at,
        vehicle_make: d.vehicle_make,
        vehicle_model: d.vehicle_model,
        vehicle_year: d.vehicle_year,
        vehicle_color: d.vehicle_color,
        license_plate: d.license_plate,
        documents: d.driver_documents ?? [],
      })));
    }
    setLoading(false);
  }

  async function approveDriver(id: string) {
    setActionLoading(true);
    await supabase
      .from("driver_profiles")
      .update({ status: "approved", rejection_reason: null })
      .eq("id", id);
    await fetchDrivers();
    setSelected(null);
    setActionLoading(false);
  }

  async function rejectDriver(id: string) {
    if (!rejectionReason.trim()) return;
    setActionLoading(true);
    await supabase
      .from("driver_profiles")
      .update({ status: "rejected", rejection_reason: rejectionReason })
      .eq("id", id);
    setShowRejectModal(false);
    setRejectionReason("");
    await fetchDrivers();
    setSelected(null);
    setActionLoading(false);
  }

  const filtered = filter === "all"
    ? drivers
    : drivers.filter(d => d.status === filter);

  const counts = {
    all: drivers.length,
    pending: drivers.filter(d => d.status === "pending").length,
    approved: drivers.filter(d => d.status === "approved").length,
    rejected: drivers.filter(d => d.status === "rejected").length,
  };

  const statusBadge = (status: string) => {
    const map: Record<string, string> = {
      pending: "bg-yellow-50 text-yellow-600",
      approved: "bg-emerald-50 text-emerald-600",
      rejected: "bg-red-50 text-red-600",
      incomplete: "bg-slate-50 text-slate-500",
    };
    const labels: Record<string, string> = {
      pending: "⏳ En revisión",
      approved: "✅ Aprobado",
      rejected: "❌ Rechazado",
      incomplete: "📝 Incompleto",
    };
    return (
      <span className={`text-xs px-2 py-1 rounded-full font-medium ${map[status] ?? "bg-slate-100 text-slate-500"}`}>
        {labels[status] ?? status}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-blue-600 to-emerald-400 flex items-center justify-center text-white font-bold text-sm">V</div>
          <div>
            <p className="font-bold text-slate-800">Vaya Admin</p>
            <p className="text-xs text-slate-400">Panel de control</p>
          </div>
        </div>
        <button
          onClick={() => { supabase.auth.signOut(); router.push("/"); }}
          className="text-sm text-slate-400 hover:text-slate-600"
        >
          Salir →
        </button>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Stats */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          {[
            { label: "Total drivers", value: counts.all, color: "text-slate-800" },
            { label: "En revisión", value: counts.pending, color: "text-yellow-600" },
            { label: "Aprobados", value: counts.approved, color: "text-emerald-600" },
            { label: "Rechazados", value: counts.rejected, color: "text-red-500" },
          ].map(s => (
            <div key={s.label} className="bg-white rounded-2xl border border-slate-100 p-4">
              <p className="text-xs text-slate-400 mb-1">{s.label}</p>
              <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            </div>
          ))}
        </div>

        <div className="flex gap-6">
          {/* Driver list */}
          <div className="flex-1">
            {/* Filter tabs */}
            <div className="flex gap-2 mb-4">
              {(["all", "pending", "approved", "rejected"] as const).map(f => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                    filter === f
                      ? "bg-gradient-to-r from-blue-600 to-emerald-400 text-white"
                      : "bg-white border border-slate-200 text-slate-600"
                  }`}
                >
                  {f === "all" ? "Todos" : f === "pending" ? "En revisión" : f === "approved" ? "Aprobados" : "Rechazados"}
                  <span className="ml-1.5 opacity-70">({counts[f]})</span>
                </button>
              ))}
            </div>

            {loading ? (
              <div className="text-center py-12 text-slate-400">Cargando...</div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-12 text-slate-400">No hay drivers en esta categoría</div>
            ) : (
              <div className="flex flex-col gap-3">
                {filtered.map(driver => (
                  <div
                    key={driver.id}
                    onClick={() => setSelected(driver)}
                    className={`bg-white rounded-2xl border p-4 cursor-pointer transition-all hover:shadow-md ${
                      selected?.id === driver.id ? "border-blue-500" : "border-slate-100"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-600 to-emerald-400 flex items-center justify-center text-white font-bold">
                          {driver.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-800 text-sm">{driver.name}</p>
                          <p className="text-xs text-slate-400">{driver.email}</p>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        {statusBadge(driver.status)}
                        <p className="text-xs text-slate-300">
                          {new Date(driver.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    {driver.vehicle_make && (
                      <p className="text-xs text-slate-400 mt-2">
                        🚗 {driver.vehicle_year} {driver.vehicle_make} {driver.vehicle_model} · {driver.license_plate}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Driver detail */}
          {selected && (
            <div className="w-96 bg-white rounded-2xl border border-slate-100 p-6 h-fit sticky top-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-bold text-slate-800">Detalles del driver</h2>
                <button onClick={() => setSelected(null)} className="text-slate-400">✕</button>
              </div>

              {/* Personal info */}
              <div className="mb-4">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">Info Personal</p>
                <div className="flex flex-col gap-1 text-sm">
                  <p><span className="text-slate-400">Nombre:</span> <span className="font-medium">{selected.name}</span></p>
                  <p><span className="text-slate-400">Email:</span> <span className="font-medium">{selected.email}</span></p>
                  <p><span className="text-slate-400">Teléfono:</span> <span className="font-medium">{selected.phone ?? "—"}</span></p>
                </div>
              </div>

              {/* Vehicle info */}
              <div className="mb-4">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">Vehículo</p>
                <div className="flex flex-col gap-1 text-sm">
                  <p><span className="text-slate-400">Vehículo:</span> <span className="font-medium">{selected.vehicle_year} {selected.vehicle_make} {selected.vehicle_model}</span></p>
                  <p><span className="text-slate-400">Color:</span> <span className="font-medium">{selected.vehicle_color}</span></p>
                  <p><span className="text-slate-400">Placa:</span> <span className="font-medium">{selected.license_plate}</span></p>
                </div>
              </div>

              {/* Documents */}
              <div className="mb-6">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">Documentos</p>
                <div className="flex flex-col gap-2">
                  {selected.documents.length === 0 ? (
                    <p className="text-xs text-slate-400">Sin documentos</p>
                  ) : selected.documents.map(doc => (
                    <a
                      key={doc.id}
                      href={doc.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between p-2 rounded-xl bg-slate-50 hover:bg-blue-50 transition-all"
                    >
                      <span className="text-sm text-slate-700">{DOC_LABELS[doc.type] ?? doc.type}</span>
                      <span className="text-xs text-blue-600 font-medium">Ver →</span>
                    </a>
                  ))}
                </div>
              </div>

              {/* Actions */}
              {selected.status === "pending" && (
                <div className="flex flex-col gap-2">
                  <button
                    onClick={() => approveDriver(selected.id)}
                    disabled={actionLoading}
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-600 to-emerald-400 text-white font-semibold text-sm disabled:opacity-60"
                  >
                    {actionLoading ? "..." : "✅ Aprobar driver"}
                  </button>
                  <button
                    onClick={() => setShowRejectModal(true)}
                    disabled={actionLoading}
                    className="w-full py-3 rounded-xl border border-red-200 text-red-500 font-semibold text-sm"
                  >
                    ❌ Rechazar
                  </button>
                </div>
              )}

              {selected.status === "approved" && (
                <div className="bg-emerald-50 rounded-xl p-3 text-center">
                  <p className="text-emerald-600 font-semibold text-sm">✅ Driver aprobado</p>
                </div>
              )}

              {selected.status === "rejected" && (
                <div className="bg-red-50 rounded-xl p-3">
                  <p className="text-red-600 font-semibold text-sm mb-1">❌ Driver rechazado</p>
                  <button
                    onClick={() => approveDriver(selected.id)}
                    className="text-xs text-blue-600 font-medium"
                  >
                    Aprobar de todas formas →
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Reject modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-6">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm">
            <h3 className="font-bold text-slate-800 mb-2">Razón del rechazo</h3>
            <p className="text-xs text-slate-400 mb-4">El driver recibirá esta información para corregir su solicitud.</p>
            <textarea
              value={rejectionReason}
              onChange={e => setRejectionReason(e.target.value)}
              placeholder="Ej: La foto de la licencia está borrosa. Por favor sube una foto más clara."
              className="w-full border border-slate-200 rounded-xl p-3 text-sm outline-none focus:border-red-400 h-24 resize-none"
            />
            <div className="flex gap-2 mt-4">
              <button
                onClick={() => setShowRejectModal(false)}
                className="flex-1 py-3 rounded-xl border border-slate-200 text-slate-600 text-sm font-medium"
              >
                Cancelar
              </button>
              <button
                onClick={() => rejectDriver(selected!.id)}
                disabled={!rejectionReason.trim() || actionLoading}
                className="flex-1 py-3 rounded-xl bg-red-500 text-white text-sm font-semibold disabled:opacity-40"
              >
                Rechazar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
