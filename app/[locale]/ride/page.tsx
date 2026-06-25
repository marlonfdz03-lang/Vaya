"use client";

import { useState, useRef } from "react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { useParams } from "next/navigation";
import { GoogleMap, useJsApiLoader, Marker, Autocomplete, DirectionsRenderer } from "@react-google-maps/api";
import { VayaLogo } from "@/components/VayaLogo";

const libraries: ("places")[] = ["places"];

type Stage = "request" | "searching" | "found" | "ontheway" | "inprogress" | "arrived" | "rating" | "history";

interface Trip {
  id: string;
  from: string;
  to: string;
  price: string;
  date: string;
  rating: number;
}

export default function RidePage() {
  const t = useTranslations("ride");
  const { locale } = useParams();

  const { isLoaded } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY ?? "",
    libraries,
  });

  const [stage, setStage] = useState<Stage>("request");
  const [destination, setDestination] = useState("");
  const [directions, setDirections] = useState<google.maps.DirectionsResult | null>(null);
  const [rating, setRating] = useState(0);
  const [history, setHistory] = useState<Trip[]>([]);

  const destRef = useRef<google.maps.places.Autocomplete | null>(null);

  const CENTER = { lat: 25.7617, lng: -80.1918 };

  const userMarkerIcon = isLoaded ? {
    url: "data:image/svg+xml;charset=UTF-8," + encodeURIComponent(`
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="12" cy="12" r="8" fill="#0A58F5" opacity="0.2"/>
        <circle cx="12" cy="12" r="5" fill="#0A58F5"/>
        <circle cx="12" cy="12" r="2" fill="white"/>
      </svg>
    `),
    scaledSize: new google.maps.Size(40, 40),
  } : undefined;

  function confirmRide() {
    if (destination) {
      const service = new google.maps.DirectionsService();
      service.route(
        { origin: CENTER, destination, travelMode: google.maps.TravelMode.DRIVING },
        (result, status) => { if (status === "OK" && result) setDirections(result); }
      );
    }
    setStage("searching");
    setTimeout(() => setStage("found"), 3000);
    setTimeout(() => setStage("ontheway"), 6000);
    setTimeout(() => setStage("inprogress"), 12000);
    setTimeout(() => setStage("arrived"), 20000);
  }

  function submitRating() {
    setHistory((h) => [{
      id: Date.now().toString(),
      from: "Mi ubicación actual",
      to: destination,
      price: "$8.50",
      date: new Date().toLocaleDateString(),
      rating,
    }, ...h]);
    setStage("request");
    setDestination("");
    setDirections(null);
    setRating(0);
  }

  if (stage === "found" || stage === "ontheway") {
    return (
      <main className="h-screen flex flex-col bg-white max-w-sm mx-auto overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-12 pb-4 bg-white absolute top-0 left-0 right-0 z-10">
          <VayaLogo size={28} />
          <button
            onClick={() => setStage("request")}
            className="px-4 py-2 bg-slate-100 rounded-xl text-sm font-medium text-slate-600"
          >
            Cancelar
          </button>
        </div>

        {/* Map with route */}
        <div style={{ height: "45%" }}>
          {isLoaded && (
            <GoogleMap
              mapContainerStyle={{ width: "100%", height: "100%" }}
              center={{ lat: 25.7617, lng: -80.1918 }}
              zoom={13}
              options={{ disableDefaultUI: true }}
            >
              {directions && (
                <DirectionsRenderer
                  directions={directions}
                  options={{ polylineOptions: { strokeColor: "#0A58F5", strokeWeight: 4 } }}
                />
              )}
            </GoogleMap>
          )}
        </div>

        {/* Bottom sheet */}
        <div className="flex-1 bg-white rounded-t-3xl -mt-4 px-5 pt-3 pb-6 overflow-y-auto">
          <div className="w-10 h-1 bg-slate-200 rounded-full mx-auto mb-4" />

          <h2 className="text-xl font-bold text-slate-900">¡Conductor encontrado!</h2>
          <p className="text-sm text-slate-400 mb-4">Llega en 2 min</p>

          {/* Driver card */}
          <div className="flex items-center gap-3 mb-4">
            <div className="w-16 h-16 rounded-full overflow-hidden bg-slate-200 flex-shrink-0">
              <div className="w-full h-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-2xl font-bold">
                C
              </div>
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <p className="font-bold text-slate-800 text-base">Carlos R.</p>
                <span className="text-yellow-400 text-sm">⭐</span>
                <span className="text-sm font-semibold text-slate-700">4.9</span>
              </div>
              <p className="text-sm text-slate-400">Toyota Prius · Blanco</p>
              <span className="inline-block mt-1 bg-slate-100 text-slate-600 text-xs font-semibold px-2 py-0.5 rounded-lg">
                ABC123
              </span>
            </div>
            <div className="flex flex-col gap-2">
              <button className="w-10 h-10 rounded-full border border-slate-200 flex items-center justify-center">
                📞
              </button>
              <button className="w-10 h-10 rounded-full border border-slate-200 flex items-center justify-center">
                💬
              </button>
            </div>
          </div>

          {/* Divider */}
          <div className="h-px bg-slate-100 mb-4" />

          {/* Stats row */}
          <div className="grid grid-cols-4 gap-2 mb-5">
            {[
              { icon: "🕐", value: "2 min", label: "Llegada" },
              { icon: "📍", value: "0.7 mi", label: "Distancia" },
              { icon: "💵", value: "$12.50", label: "Estimado" },
              { icon: "👤", value: "4.9", label: "Calificación" },
            ].map((s) => (
              <div key={s.label} className="text-center">
                <span className="text-lg block mb-1">{s.icon}</span>
                <p className="text-sm font-bold text-slate-800">{s.value}</p>
                <p className="text-xs text-slate-400">{s.label}</p>
              </div>
            ))}
          </div>

          {/* Action buttons */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            <button className="py-3.5 rounded-2xl border-2 border-slate-200 text-blue-600 font-semibold text-sm">
              Mensaje
            </button>
            <button
              onClick={() => setStage("inprogress")}
              className="py-3.5 rounded-2xl bg-emerald-500 text-white font-semibold text-sm shadow-lg shadow-emerald-200"
            >
              Aceptar viaje
            </button>
          </div>

          {/* Security note */}
          <button className="flex items-center gap-3 w-full bg-emerald-50 rounded-2xl p-3">
            <span className="text-xl">🛡️</span>
            <div className="flex-1 text-left">
              <p className="text-xs font-semibold text-slate-800">Tu seguridad es nuestra prioridad</p>
              <p className="text-xs text-slate-400">Comparte los detalles de tu viaje con tus seres queridos.</p>
            </div>
            <span className="text-slate-300">›</span>
          </button>
        </div>
      </main>
    );
  }

  if (stage === "searching") {
    return (
      <main className="h-screen flex flex-col bg-white max-w-sm mx-auto overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-12 pb-4 bg-white">
          <VayaLogo size={28} />
          <button
            onClick={() => setStage("request")}
            className="px-4 py-2 bg-slate-100 rounded-xl text-sm font-medium text-slate-600"
          >
            Cancelar
          </button>
        </div>

        {/* Dark map with radar animation */}
        <div className="flex-1 relative bg-slate-900 flex items-center justify-center overflow-hidden">
          {/* Dark map background */}
          <div className="absolute inset-0 opacity-30">
            {isLoaded && (
              <GoogleMap
                mapContainerStyle={{ width: "100%", height: "100%" }}
                center={CENTER}
                zoom={14}
                options={{
                  disableDefaultUI: true,
                  styles: [
                    { elementType: "geometry", stylers: [{ color: "#0a1628" }] },
                    { elementType: "labels", stylers: [{ visibility: "off" }] },
                    { featureType: "road", elementType: "geometry", stylers: [{ color: "#1a3a6b" }] },
                    { featureType: "water", elementType: "geometry", stylers: [{ color: "#0d2137" }] },
                  ],
                }}
              />
            )}
          </div>

          {/* Title overlay */}
          <div className="absolute top-6 left-0 right-0 text-center z-10">
            <h2 className="text-white text-2xl font-bold">Buscando conductor...</h2>
            <p className="text-blue-300 text-sm mt-1">Esto puede tomar unos segundos</p>
          </div>

          {/* Radar rings */}
          <div className="relative z-10 flex items-center justify-center">
            {[120, 90, 60].map((size, i) => (
              <div
                key={i}
                className="absolute rounded-full border border-blue-500/30 animate-ping"
                style={{ width: size * 2, height: size * 2, animationDelay: `${i * 0.4}s`, animationDuration: "2s" }}
              />
            ))}
            <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-2xl z-10">
              <VayaLogo size={32} />
            </div>
          </div>

          {/* Cars around */}
          {[
            { top: "20%", left: "15%", rotate: "-30deg" },
            { top: "20%", right: "10%", rotate: "30deg" },
            { bottom: "25%", left: "10%", rotate: "20deg" },
            { bottom: "20%", right: "15%", rotate: "-20deg" },
          ].map((pos, i) => (
            <div key={i} className="absolute z-10" style={pos as React.CSSProperties}>
              <div className="w-12 h-12 bg-blue-900/60 rounded-full flex items-center justify-center border border-blue-500/40">
                <span className="text-xl" style={{ transform: `rotate(${pos.rotate})` }}>🚗</span>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom sheet */}
        <div className="bg-white rounded-t-3xl px-5 pt-3 pb-8 shadow-2xl">
          <div className="w-10 h-1 bg-slate-200 rounded-full mx-auto mb-5" />

          <div className="flex items-start gap-4 mb-6">
            <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0">
              🔍
            </div>
            <div>
              <p className="font-bold text-slate-800 text-base">Buscando el mejor conductor para ti</p>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Evaluamos distancia, tiempo y disponibilidad para ofrecerte el mejor servicio.
              </p>
            </div>
          </div>

          {/* Progress steps */}
          <div className="mb-5">
            <div className="flex items-center gap-0 mb-2">
              {["Buscando", "Encontrando", "Confirmando", "Listo"].map((label, i) => (
                <div key={label} className="flex items-center flex-1 last:flex-none">
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                    i === 0 ? "border-blue-600 bg-blue-600" : "border-slate-300 bg-white"
                  }`}>
                    {i === 0 && <div className="w-2 h-2 rounded-full bg-white" />}
                  </div>
                  {i < 3 && <div className={`flex-1 h-0.5 ${i === 0 ? "bg-blue-600" : "bg-slate-200"}`} />}
                </div>
              ))}
            </div>
            <div className="flex justify-between">
              {["Buscando", "Encontrando", "Confirmando", "Listo"].map((label, i) => (
                <p key={label} className={`text-xs ${i === 0 ? "text-blue-600 font-semibold" : "text-slate-400"}`}>
                  {label}
                </p>
              ))}
            </div>
          </div>

          {/* Security note */}
          <div className="flex items-center gap-3 bg-emerald-50 rounded-2xl p-3">
            <span className="text-2xl">🛡️</span>
            <div>
              <p className="text-sm font-semibold text-slate-800">Tu seguridad es nuestra prioridad</p>
              <p className="text-xs text-slate-400">Solo los conductores verificados pueden aceptar tu viaje.</p>
            </div>
          </div>
        </div>
      </main>
    );
  }

  // Non-request stages share a simpler layout
  if (stage === "history") {
    return (
      <main className="min-h-screen max-w-sm mx-auto flex flex-col">
        <div className="flex items-center justify-between px-6 pt-10 pb-4">
          <Link href={`/${locale}`}><VayaLogo size={28} /></Link>
          <button onClick={() => setStage("request")} className="text-sm text-blue-600 font-medium">← Volver</button>
        </div>
        <div className="px-6 flex flex-col gap-4">
          <h2 className="text-xl font-bold text-slate-800">{t("history")}</h2>
          {history.length === 0 ? (
            <p className="text-slate-400 text-sm text-center py-10">{t("no_history")}</p>
          ) : history.map((trip) => (
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
          ))}
        </div>
      </main>
    );
  }

  return (
    <main className="h-screen bg-white relative overflow-hidden max-w-sm mx-auto">
      {/* Header overlay */}
      <div className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between px-5 pt-12 pb-4">
        <Link href={`/${locale}`}>
          <VayaLogo size={28} />
        </Link>
        <button
          onClick={() => setStage("history")}
          className="w-10 h-10 bg-white rounded-xl shadow flex items-center justify-center"
        >
          <span className="text-slate-600 text-lg">☰</span>
        </button>
      </div>

      {/* Fullscreen map — 60% height */}
      {isLoaded ? (
        <GoogleMap
          mapContainerStyle={{ width: "100%", height: "60%" }}
          center={CENTER}
          zoom={14}
          options={{
            disableDefaultUI: true,
            styles: [{ featureType: "poi", stylers: [{ visibility: "off" }] }],
          }}
        >
          <Marker position={CENTER} icon={userMarkerIcon} />
          {directions && <DirectionsRenderer directions={directions} />}
        </GoogleMap>
      ) : (
        <div className="w-full bg-slate-100" style={{ height: "60%" }} />
      )}

      {/* Bottom sheet */}
      <div
        className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl shadow-2xl z-20 px-5 pt-3 pb-8"
        style={{ minHeight: "45%" }}
      >
        {/* Handle */}
        <div className="w-10 h-1 bg-slate-200 rounded-full mx-auto mb-5" />

        {/* REQUEST stage */}
        {stage === "request" && (
          <>
            <h2 className="text-2xl font-bold text-slate-900 mb-1">¿A dónde vas?</h2>
            <p className="text-sm text-slate-400 mb-5">Pide un ride en segundos</p>

            {/* Origin / Destination card */}
            <div className="bg-white border border-slate-200 rounded-2xl mb-4 overflow-hidden">
              {/* Origin */}
              <div className="flex items-center gap-3 px-4 py-3.5">
                <div className="w-3 h-3 rounded-full bg-emerald-500 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-xs text-slate-400">Origen</p>
                  <p className="text-sm font-semibold text-slate-800">Mi ubicación actual</p>
                </div>
                <button className="w-8 h-8 flex items-center justify-center text-slate-400">🎯</button>
              </div>

              {/* Dashed divider */}
              <div className="flex items-center gap-3 px-4">
                <div className="w-3 flex justify-center">
                  <div className="w-px h-6 border-l-2 border-dashed border-slate-300" />
                </div>
                <div className="flex-1 h-px bg-slate-100" />
              </div>

              {/* Destination with Autocomplete */}
              {isLoaded ? (
                <Autocomplete
                  onLoad={(a) => (destRef.current = a)}
                  onPlaceChanged={() => {
                    const place = destRef.current?.getPlace();
                    if (place?.formatted_address) setDestination(place.formatted_address);
                  }}
                >
                  <div className="flex items-center gap-3 px-4 py-3.5">
                    <div className="w-3 h-3 rounded-full bg-blue-600 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="text-xs text-slate-400">Destino</p>
                      <input
                        type="text"
                        placeholder="¿A dónde vas?"
                        className="text-sm font-semibold text-slate-800 outline-none w-full placeholder:text-slate-400 placeholder:font-normal"
                      />
                    </div>
                  </div>
                </Autocomplete>
              ) : (
                <div className="flex items-center gap-3 px-4 py-3.5">
                  <div className="w-3 h-3 rounded-full bg-blue-600 flex-shrink-0" />
                  <input
                    type="text"
                    placeholder="¿A dónde vas?"
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                    className="text-sm font-semibold text-slate-800 outline-none w-full placeholder:text-slate-400 placeholder:font-normal"
                  />
                </div>
              )}
            </div>

            {/* Suggestions */}
            <div className="bg-slate-50 rounded-2xl mb-4 overflow-hidden">
              <p className="text-xs text-slate-400 px-4 pt-3 pb-2">Sugerencias</p>
              {[
                { icon: "🏠", label: "Casa", address: "Agrega tu casa" },
                { icon: "💼", label: "Trabajo", address: "Agrega tu trabajo" },
              ].map((s) => (
                <button key={s.label}
                  className="flex items-center gap-3 px-4 py-3 w-full hover:bg-slate-100 transition-all border-t border-slate-100 first:border-0"
                >
                  <div className="w-9 h-9 bg-white rounded-xl flex items-center justify-center text-lg shadow-sm">
                    {s.icon}
                  </div>
                  <span className="text-sm font-semibold text-slate-800 flex-1 text-left">{s.label}</span>
                  <span className="text-slate-300">›</span>
                </button>
              ))}
            </div>

            {/* Recent rides */}
            <button className="flex items-center justify-between w-full px-1 mb-5">
              <div className="flex items-center gap-2 text-sm text-slate-500">
                <span>🕐</span>
                <span>Viajes recientes</span>
              </div>
              <span className="text-slate-400">∨</span>
            </button>

            {/* Confirm */}
            <button
              onClick={confirmRide}
              disabled={!destination}
              className="w-full py-4 rounded-2xl bg-emerald-500 text-white font-bold text-base disabled:opacity-40 shadow-lg shadow-emerald-200"
            >
              Confirmar destino
            </button>
          </>
        )}

        {/* IN PROGRESS */}
        {stage === "inprogress" && (
          <div className="bg-emerald-50 rounded-2xl p-4 text-center">
            <p className="text-2xl mb-1">🚗</p>
            <p className="font-semibold text-emerald-700">{t("in_progress")}</p>
            <p className="text-xs text-slate-500 mt-1">{destination}</p>
          </div>
        )}

        {/* ARRIVED */}
        {stage === "arrived" && (
          <div className="flex flex-col gap-4">
            <div className="bg-blue-50 rounded-2xl p-4 text-center">
              <p className="text-3xl mb-2">🎉</p>
              <p className="font-semibold text-blue-700 text-lg">{t("arrived")}</p>
            </div>
            <button
              onClick={() => setStage("rating")}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-blue-600 to-emerald-500 text-white font-bold"
            >
              {t("rate_trip")}
            </button>
          </div>
        )}

        {/* RATING */}
        {stage === "rating" && (
          <div className="flex flex-col gap-6 items-center py-4">
            <p className="text-xl font-bold text-slate-800">{t("rate_trip")}</p>
            <div className="flex gap-3">
              {[1, 2, 3, 4, 5].map((s) => (
                <button key={s} onClick={() => setRating(s)} className={`text-4xl ${s <= rating ? "text-emerald-400" : "text-slate-300"}`}>
                  {s <= rating ? "⭐" : "☆"}
                </button>
              ))}
            </div>
            <button
              onClick={submitRating}
              disabled={rating === 0}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-blue-600 to-emerald-500 text-white font-bold disabled:opacity-40"
            >
              {t("submit_rating")}
            </button>
          </div>
        )}
      </div>
    </main>
  );
}
