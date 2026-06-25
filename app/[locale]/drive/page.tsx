"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { VayaLogo } from "@/components/VayaLogo";

type Stage = "offline" | "online" | "incoming" | "accepted" | "arrived_pickup" | "inprogress" | "completed" | "history";

interface Trip {
  id: string;
  from: string;
  to: string;
  earned: string;
  date: string;
}

const MOCK_REQUEST = {
  rider: "María G.",
  rating: "4.8",
  pickup: "Brickell City Centre, Miami, FL",
  destination: "Miami International Airport",
  price: "$12.50",
  distance: "4.2 mi",
};

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
            <linearGradient id="mapPinDrive" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#0A58F5" />
              <stop offset="100%" stopColor="#28D67C" />
            </linearGradient>
          </defs>
          <path d="M16 0C7.163 0 0 7.163 0 16c0 11 16 24 16 24S32 27 32 16C32 7.163 24.837 0 16 0z" fill="url(#mapPinDrive)" />
          <circle cx="16" cy="16" r="6" fill="white" />
        </svg>
        <span className="text-xs text-slate-400 mt-2 font-medium">Tu ubicación</span>
      </div>
    </div>
  );
}

export default function DrivePage() {
  const t = useTranslations("drive");
  const { locale } = useParams();
  const router = useRouter();

  useEffect(() => {
    async function checkStatus() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return router.push(`/${locale}/sign-in`);

      const { data: profile } = await supabase
        .from("driver_profiles")
        .select("status")
        .eq("id", user.id)
        .single();

      if (!profile || profile.status === "incomplete") {
        router.push(`/${locale}/drive/onboarding`);
      }
      if (profile?.status === "pending") {
        router.push(`/${locale}/drive/onboarding`);
      }
    }
    checkStatus();
  }, []);

  const [stage, setStage] = useState<Stage>("offline");
  const [earnings, setEarnings] = useState(0);
  const [trips, setTrips] = useState(0);
  const [history, setHistory] = useState<Trip[]>([]);

  function goOnline() {
    setStage("online");
    setTimeout(() => setStage("incoming"), 4000);
  }

  function acceptRide() {
    setStage("accepted");
  }

  function completeRide() {
    const earned = parseFloat(MOCK_REQUEST.price.replace("$", ""));
    setEarnings((e) => parseFloat((e + earned).toFixed(2)));
    setTrips((t) => t + 1);
    setHistory((h) => [
      {
        id: Date.now().toString(),
        from: MOCK_REQUEST.pickup,
        to: MOCK_REQUEST.destination,
        earned: MOCK_REQUEST.price,
        date: new Date().toLocaleDateString(),
      },
      ...h,
    ]);
    setStage("completed");
    setTimeout(() => {
      setStage("online");
      setTimeout(() => setStage("incoming"), 4000);
    }, 2000);
  }

  return (
    <main className="min-h-screen max-w-sm mx-auto flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-6 pt-10 pb-4">
        <Link href={`/${locale}`}>
          <VayaLogo size={28} />
        </Link>
        <div className="flex items-center gap-3">
          <button onClick={() => setStage("history")} className="text-sm text-slate-500 font-medium">
            {t("history")}
          </button>
          <div className={`w-2.5 h-2.5 rounded-full ${stage === "offline" ? "bg-slate-300" : "bg-emerald-500"}`} />
        </div>
      </div>

      {/* Stats bar */}
      {stage !== "offline" && stage !== "history" && (
        <div className="mx-6 mb-4 grid grid-cols-3 gap-2">
          <div className="bg-white rounded-xl p-3 text-center border border-slate-100">
            <p className="text-xs text-slate-400">{t("earnings_today")}</p>
            <p className="text-base font-bold text-emerald-600">${earnings}</p>
          </div>
          <div className="bg-white rounded-xl p-3 text-center border border-slate-100">
            <p className="text-xs text-slate-400">{t("trips_today")}</p>
            <p className="text-base font-bold text-slate-800">{trips}</p>
          </div>
          <div className="bg-white rounded-xl p-3 text-center border border-slate-100">
            <p className="text-xs text-slate-400">{t("rating")}</p>
            <p className="text-base font-bold text-emerald-600">⭐ 4.9</p>
          </div>
        </div>
      )}

      {/* Map */}
      {stage !== "history" && (
        <div className="mx-6 mb-4">
          <MapPlaceholder />
        </div>
      )}

      <div className="px-6 flex flex-col gap-3">

        {/* OFFLINE */}
        {stage === "offline" && (
          <div className="flex flex-col items-center gap-4 py-4">
            <p className="text-slate-500 text-sm">{t("status_offline")}</p>
            <button
              onClick={goOnline}
              className="w-full py-4 rounded-2xl btn-primary text-white font-semibold"
            >
              {t("go_online")}
            </button>
          </div>
        )}

        {/* ONLINE - WAITING */}
        {stage === "online" && (
          <div className="flex flex-col items-center gap-4 py-4">
            <div className="w-14 h-14 rounded-full bg-emerald-100 flex items-center justify-center animate-pulse">
              <span className="text-2xl">🚗</span>
            </div>
            <p className="text-slate-600 text-sm font-medium">{t("wait")}</p>
            <button onClick={() => setStage("offline")} className="text-sm text-slate-400">
              {t("go_offline")}
            </button>
          </div>
        )}

        {/* INCOMING RIDE */}
        {stage === "incoming" && (
          <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 flex flex-col gap-3">
            <p className="font-bold text-blue-700 text-base">{t("new_ride")}</p>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full btn-primary flex items-center justify-center text-white font-bold">
                M
              </div>
              <div>
                <p className="font-semibold text-slate-800 text-sm">{MOCK_REQUEST.rider}</p>
                <p className="text-xs text-slate-500">⭐ {MOCK_REQUEST.rating}</p>
              </div>
              <div className="ml-auto text-right">
                <p className="font-bold text-emerald-600">{MOCK_REQUEST.price}</p>
                <p className="text-xs text-slate-400">{MOCK_REQUEST.distance}</p>
              </div>
            </div>
            <div className="flex flex-col gap-1 text-xs text-slate-500">
              <p>📍 <span className="font-medium text-slate-700">{MOCK_REQUEST.pickup}</span></p>
              <p>🏁 <span className="font-medium text-slate-700">{MOCK_REQUEST.destination}</span></p>
            </div>
            <div className="grid grid-cols-2 gap-2 mt-1">
              <button
                onClick={() => setStage("online")}
                className="py-3 rounded-xl border border-slate-200 text-slate-600 font-semibold text-sm bg-white"
              >
                {t("reject")}
              </button>
              <button
                onClick={acceptRide}
                className="py-3 rounded-xl btn-primary text-white font-semibold text-sm"
              >
                {t("accept")}
              </button>
            </div>
          </div>
        )}

        {/* ACCEPTED - HEADING TO PICKUP */}
        {stage === "accepted" && (
          <div className="flex flex-col gap-3">
            <div className="bg-white rounded-2xl p-4 border border-slate-100">
              <p className="text-xs text-slate-400 mb-1">{t("pickup")}</p>
              <p className="font-semibold text-slate-800 text-sm">{MOCK_REQUEST.pickup}</p>
            </div>
            <button
              onClick={() => setStage("arrived_pickup")}
              className="w-full py-4 rounded-2xl btn-primary text-white font-semibold text-sm"
            >
              {t("arrived_pickup")}
            </button>
          </div>
        )}

        {/* ARRIVED AT PICKUP */}
        {stage === "arrived_pickup" && (
          <div className="flex flex-col gap-3">
            <div className="bg-blue-50 rounded-2xl p-4 text-center">
              <p className="text-2xl mb-1">📍</p>
              <p className="font-semibold text-blue-700 text-sm">{t("arrived_pickup")}</p>
              <p className="text-xs text-slate-500 mt-1">Waiting for {MOCK_REQUEST.rider}</p>
            </div>
            <button
              onClick={() => setStage("inprogress")}
              className="w-full py-4 rounded-2xl btn-primary text-white font-semibold text-sm"
            >
              {t("start_ride")}
            </button>
          </div>
        )}

        {/* IN PROGRESS */}
        {stage === "inprogress" && (
          <div className="flex flex-col gap-3">
            <div className="bg-white rounded-2xl p-4 border border-slate-100">
              <p className="text-xs text-slate-400 mb-1">{t("destination")}</p>
              <p className="font-semibold text-slate-800 text-sm">{MOCK_REQUEST.destination}</p>
            </div>
            <button
              onClick={completeRide}
              className="w-full py-4 rounded-2xl btn-primary text-white font-semibold text-sm"
            >
              {t("complete")}
            </button>
          </div>
        )}

        {/* COMPLETED */}
        {stage === "completed" && (
          <div className="flex flex-col items-center gap-3 py-4">
            <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center">
              <span className="text-3xl">✅</span>
            </div>
            <p className="font-bold text-emerald-600 text-2xl">+{MOCK_REQUEST.price}</p>
            <p className="text-slate-400 text-sm">Ride completed!</p>
          </div>
        )}

        {/* HISTORY */}
        {stage === "history" && (
          <div className="flex flex-col gap-4 pt-2">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-800">{t("history")}</h2>
              <button onClick={() => setStage("offline")} className="text-sm text-blue-600 font-medium">
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
                    <p className="text-sm font-bold text-emerald-600 ml-2">{trip.earned}</p>
                  </div>
                  <p className="text-xs text-slate-400">{trip.from}</p>
                  <p className="text-xs text-slate-400 mt-1">{trip.date}</p>
                </div>
              ))
            )}
          </div>
        )}

      </div>
    </main>
  );
}
