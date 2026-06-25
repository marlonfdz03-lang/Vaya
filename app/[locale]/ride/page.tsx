"use client";

import { useState, useRef } from "react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { useParams } from "next/navigation";
import { VayaLogo } from "@/components/VayaLogo";

type Stage = "request" | "searching" | "found" | "ontheway" | "inprogress" | "arrived" | "rating" | "history";

interface Trip {
  id: string;
  from: string;
  to: string;
  price: string;
  date: string;
  rating: number;
}

function MapPlaceholder() {
  return (
    <div className="w-full rounded-2xl overflow-hidden bg-slate-100 h-48 flex items-center justify-center border border-slate-100 relative">
      <div
        className="absolute inset-0 opacity-20"
        style={{
          background:
            "repeating-linear-gradient(0deg,transparent,transparent 30px,#cbd5e1 30px,#cbd5e1 31px),repeating-linear-gradient(90deg,transparent,transparent 30px,#cbd5e1 30px,#cbd5e1 31px)",
        }}
      />
      <div className="relative z-10 flex flex-col items-center">
        <svg width="40" height="48" viewBox="0 0 32 40" fill="none">
          <defs>
            <linearGradient id="mapPinRide" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#0A58F5" />
              <stop offset="100%" stopColor="#28D67C" />
            </linearGradient>
          </defs>
          <path d="M16 0C7.163 0 0 7.163 0 16c0 11 16 24 16 24S32 27 32 16C32 7.163 24.837 0 16 0z" fill="url(#mapPinRide)" />
          <circle cx="16" cy="16" r="6" fill="white" />
        </svg>
        <span className="text-xs text-slate-400 mt-2 font-medium">Tu ubicación</span>
      </div>
    </div>
  );
}

export default function RidePage() {
  const t = useTranslations("ride");
  const { locale } = useParams();

  const [stage, setStage] = useState<Stage>("request");
  const [pickup, setPickup] = useState("");
  const [destination, setDestination] = useState("");
  const [rating, setRating] = useState(0);
  const [history, setHistory] = useState<Trip[]>([]);

  const pickupInputRef = useRef<HTMLInputElement>(null);
  const destInputRef = useRef<HTMLInputElement>(null);

  function confirmRide() {
    setStage("searching");
    setTimeout(() => setStage("found"), 3000);
    setTimeout(() => setStage("ontheway"), 6000);
    setTimeout(() => setStage("inprogress"), 12000);
    setTimeout(() => setStage("arrived"), 20000);
  }

  function submitRating() {
    const newTrip: Trip = {
      id: Date.now().toString(),
      from: pickup,
      to: destination,
      price: "$8.50",
      date: new Date().toLocaleDateString(),
      rating,
    };
    setHistory((h) => [newTrip, ...h]);
    setStage("request");
    setPickup("");
    setDestination("");
    setRating(0);
  }

  return (
    <main className="min-h-screen max-w-sm mx-auto flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-6 pt-10 pb-4">
        <Link href={`/${locale}`}>
          <VayaLogo size={28} />
        </Link>
        <button onClick={() => setStage("history")} className="text-sm text-slate-500 font-medium">
          {t("history")}
        </button>
      </div>

      {/* Map */}
      {stage !== "history" && (
        <div className="mx-6 mb-4">
          <MapPlaceholder />
        </div>
      )}

      {/* STAGE: REQUEST */}
      {stage === "request" && (
        <div className="px-6 flex flex-col gap-3">
          <h1 className="text-2xl font-bold text-slate-800">{t("title")}</h1>

          <input
            ref={pickupInputRef}
            type="text"
            placeholder={t("pickup")}
            value={pickup}
            onChange={(e) => setPickup(e.target.value)}
            className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-blue-500 bg-white"
          />

          <input
            ref={destInputRef}
            type="text"
            placeholder={t("destination")}
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
            className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-blue-500 bg-white"
          />

          <div className="flex items-center justify-between bg-white rounded-xl px-4 py-3 border border-slate-100">
            <span className="text-sm text-slate-500">{t("price")}</span>
            <span className="text-sm font-bold text-slate-800">$8.50</span>
          </div>

          <button
            onClick={confirmRide}
            disabled={!pickup || !destination}
            className="w-full py-4 rounded-2xl btn-primary text-white font-semibold text-sm disabled:opacity-40"
          >
            {t("confirm")}
          </button>
        </div>
      )}

      {/* STAGE: SEARCHING */}
      {stage === "searching" && (
        <div className="px-6 flex flex-col items-center gap-4 py-8">
          <div className="w-16 h-16 rounded-full btn-primary flex items-center justify-center animate-pulse">
            <span className="text-2xl">🔍</span>
          </div>
          <p className="text-lg font-semibold text-slate-800">{t("searching")}</p>
          <button onClick={() => setStage("request")} className="text-sm text-slate-400">
            {t("cancel")}
          </button>
        </div>
      )}

      {/* STAGE: FOUND / ON THE WAY */}
      {(stage === "found" || stage === "ontheway") && (
        <div className="px-6 flex flex-col gap-4">
          <div className="bg-white rounded-2xl p-4 flex items-center gap-4 border border-slate-100">
            <div className="w-12 h-12 rounded-full btn-primary flex items-center justify-center text-white font-bold text-lg">
              C
            </div>
            <div className="flex-1">
              <p className="font-semibold text-slate-800">{t("driver_name")}</p>
              <p className="text-xs text-slate-500">⭐ {t("driver_rating")} · {t("driver_plate")}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-slate-500">{t("minutes_away")}</p>
              <p className="text-lg font-bold text-blue-600">3 min</p>
            </div>
          </div>
          <p className="text-center text-sm font-medium text-slate-600">
            {stage === "found" ? t("driver_found") : t("on_the_way")}
          </p>
          <button onClick={() => setStage("request")} className="text-sm text-slate-400 text-center">
            {t("cancel")}
          </button>
        </div>
      )}

      {/* STAGE: IN PROGRESS */}
      {stage === "inprogress" && (
        <div className="px-6 flex flex-col gap-4">
          <div className="bg-emerald-50 rounded-2xl p-4 text-center">
            <p className="text-2xl mb-1">🚗</p>
            <p className="font-semibold text-emerald-700">{t("in_progress")}</p>
            <p className="text-xs text-slate-500 mt-1">{destination}</p>
          </div>
        </div>
      )}

      {/* STAGE: ARRIVED */}
      {stage === "arrived" && (
        <div className="px-6 flex flex-col gap-4">
          <div className="bg-blue-50 rounded-2xl p-4 text-center">
            <p className="text-3xl mb-2">🎉</p>
            <p className="font-semibold text-blue-700 text-lg">{t("arrived")}</p>
          </div>
          <button
            onClick={() => setStage("rating")}
            className="w-full py-4 rounded-2xl btn-primary text-white font-semibold text-sm"
          >
            {t("rate_trip")}
          </button>
        </div>
      )}

      {/* STAGE: RATING */}
      {stage === "rating" && (
        <div className="px-6 flex flex-col gap-6 items-center py-6">
          <p className="text-xl font-bold text-slate-800">{t("rate_trip")}</p>
          <div className="flex gap-3">
            {[1, 2, 3, 4, 5].map((s) => (
              <button
                key={s}
                onClick={() => setRating(s)}
                className={`text-4xl ${s <= rating ? "text-emerald-400" : "text-slate-300"}`}
              >
                {s <= rating ? "⭐" : "☆"}
              </button>
            ))}
          </div>
          <button
            onClick={submitRating}
            disabled={rating === 0}
            className="w-full py-4 rounded-2xl btn-primary text-white font-semibold text-sm disabled:opacity-40"
          >
            {t("submit_rating")}
          </button>
        </div>
      )}

      {/* STAGE: HISTORY */}
      {stage === "history" && (
        <div className="px-6 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-800">{t("history")}</h2>
            <button onClick={() => setStage("request")} className="text-sm text-blue-600 font-medium">
              ← Back
            </button>
          </div>
          {history.length === 0 ? (
            <p className="text-slate-400 text-sm text-center py-10">{t("no_history")}</p>
          ) : (
            history.map((trip) => (
              <div key={trip.id} className="bg-white rounded-2xl p-4 flex flex-col gap-1 border border-slate-100">
                <div className="flex justify-between">
                  <p className="text-sm font-semibold text-slate-800 truncate flex-1">{trip.to}</p>
                  <p className="text-sm font-bold text-blue-600 ml-2">{trip.price}</p>
                </div>
                <p className="text-xs text-slate-400">{trip.from}</p>
                <div className="flex justify-between items-center mt-1">
                  <p className="text-xs text-slate-400">{trip.date}</p>
                  <p className="text-xs">{"⭐".repeat(trip.rating)}</p>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </main>
  );
}
