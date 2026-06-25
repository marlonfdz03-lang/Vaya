"use client";

import { useState, useEffect } from "react";

export function InstallPrompt() {
  const [prompt, setPrompt] = useState<any>(null);
  const [show, setShow] = useState(false);

  useEffect(() => {
    window.addEventListener("beforeinstallprompt", (e) => {
      e.preventDefault();
      setPrompt(e);
      setShow(true);
    });
  }, []);

  if (!show) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 bg-white rounded-2xl shadow-xl p-4 flex items-center gap-3 z-50 border border-slate-100">
      <div className="w-10 h-10 rounded-xl btn-primary flex items-center justify-center text-white font-bold text-lg">
        V
      </div>
      <div className="flex-1">
        <p className="font-semibold text-sm text-slate-800">Instalar Vaya</p>
        <p className="text-xs text-slate-400">Agregar a pantalla de inicio</p>
      </div>
      <button
        onClick={() => { prompt?.prompt(); setShow(false); }}
        className="px-4 py-2 rounded-xl btn-primary text-white text-sm font-semibold"
      >
        Instalar
      </button>
      <button onClick={() => setShow(false)} className="text-slate-400 text-lg">✕</button>
    </div>
  );
}
