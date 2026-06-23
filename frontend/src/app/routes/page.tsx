"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { calculateRoute, fetchIncidents } from "@/lib/api";
import { Navigation, MapPin, AlertCircle, CheckCircle, Info } from "lucide-react";

const Map = dynamic(() => import("@/components/Map"), { ssr: false });

export default function RoutesPage() {
  const [incidents, setIncidents] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeSelect, setActiveSelect] = useState<"start" | "end">("start");

  const [coords, setCoords] = useState({
    start_lat: 19.0178,
    start_lng: 72.8478, // Dadar West
    end_lat: 19.0540,
    end_lng: 72.8400, // Bandra Relief Shelter
  });

  const [routeResult, setRouteResult] = useState<any>(null);

  useEffect(() => {
    const loadIncidents = async () => {
      try {
        const data = await fetchIncidents();
        setIncidents(data);
      } catch(err) {
        console.error(err);
      }
    };
    loadIncidents();
  }, []);

  const handleMapClick = (lat: number, lng: number) => {
    if (activeSelect === "start") {
      setCoords(prev => ({ ...prev, start_lat: lat, start_lng: lng }));
      setActiveSelect("end"); // auto-switch to selecting destination
    } else {
      setCoords(prev => ({ ...prev, end_lat: lat, end_lng: lng }));
      setActiveSelect("start");
    }
  };

  const handleCalculateRoute = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await calculateRoute(coords);
      setRouteResult(res);
    } catch(err) {
      alert("Failed to calculate evacuation route.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col md:flex-row h-screen">
      {/* Route Planner Sidebar */}
      <div className="w-full md:w-96 bg-slate-900 border-r border-slate-800 flex flex-col h-full shrink-0">
        <div className="p-5 border-b border-slate-850 space-y-4 bg-slate-900/50">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Navigation className="h-5 w-5 text-rose-500" />
            Evacuation Route Planner
          </h2>
          <p className="text-xs text-slate-400 leading-normal">
            Identify safe roads. Click on the map to set starting coordinates and destination assembly points.
          </p>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {/* Coordinates Inputs */}
          <form onSubmit={handleCalculateRoute} className="space-y-4">
            {/* Start Location Input */}
            <div className={`p-3.5 rounded-xl border transition-all ${
              activeSelect === "start" ? "bg-slate-950 border-rose-500" : "bg-slate-950/40 border-slate-800"
            }`}>
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-amber-400"></span> Start Location
                </span>
                <button
                  type="button"
                  onClick={() => setActiveSelect("start")}
                  className={`text-[10px] font-bold px-2 py-0.5 rounded transition-colors ${
                    activeSelect === "start" ? "bg-rose-600 text-white" : "bg-slate-800 text-slate-400 hover:bg-slate-750"
                  }`}
                >
                  Click Map to Set
                </button>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-[10px] text-slate-500 block mb-0.5">Latitude</span>
                  <input
                    type="number"
                    step="0.000001"
                    required
                    value={coords.start_lat}
                    onChange={(e) => setCoords({ ...coords, start_lat: parseFloat(e.target.value) })}
                    className="w-full bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 text-slate-200"
                  />
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block mb-0.5">Longitude</span>
                  <input
                    type="number"
                    step="0.000001"
                    required
                    value={coords.start_lng}
                    onChange={(e) => setCoords({ ...coords, start_lng: parseFloat(e.target.value) })}
                    className="w-full bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 text-slate-200"
                  />
                </div>
              </div>
            </div>

            {/* Destination Input */}
            <div className={`p-3.5 rounded-xl border transition-all ${
              activeSelect === "end" ? "bg-slate-950 border-rose-500" : "bg-slate-950/40 border-slate-800"
            }`}>
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-cyan-500"></span> Destination Shelter
                </span>
                <button
                  type="button"
                  onClick={() => setActiveSelect("end")}
                  className={`text-[10px] font-bold px-2 py-0.5 rounded transition-colors ${
                    activeSelect === "end" ? "bg-rose-600 text-white" : "bg-slate-800 text-slate-400 hover:bg-slate-750"
                  }`}
                >
                  Click Map to Set
                </button>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-[10px] text-slate-500 block mb-0.5">Latitude</span>
                  <input
                    type="number"
                    step="0.000001"
                    required
                    value={coords.end_lat}
                    onChange={(e) => setCoords({ ...coords, end_lat: parseFloat(e.target.value) })}
                    className="w-full bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 text-slate-200"
                  />
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block mb-0.5">Longitude</span>
                  <input
                    type="number"
                    step="0.000001"
                    required
                    value={coords.end_lng}
                    onChange={(e) => setCoords({ ...coords, end_lng: parseFloat(e.target.value) })}
                    className="w-full bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 text-slate-200"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-rose-600 hover:bg-rose-500 disabled:bg-slate-800 disabled:text-slate-500 text-white font-semibold rounded-xl text-sm transition-all shadow-lg border border-rose-500 disabled:border-slate-800"
            >
              {loading ? "Calculating Safest Path..." : "Calculate Safest Route"}
            </button>
          </form>

          {/* Route Result Display */}
          {routeResult && (
            <div className="space-y-4 pt-3 border-t border-slate-800">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Route Safety Report</h3>
              
              <div className={`p-4 rounded-xl border flex gap-3 ${
                routeResult.status === "safe" 
                  ? "bg-emerald-950/20 border-emerald-900/40 text-emerald-300"
                  : "bg-amber-950/20 border-amber-900/40 text-amber-300"
              }`}>
                {routeResult.status === "safe" ? (
                  <CheckCircle className="h-5 w-5 shrink-0 mt-0.5 text-emerald-500" />
                ) : (
                  <AlertCircle className="h-5 w-5 shrink-0 mt-0.5 text-amber-500" />
                )}
                <div>
                  <h4 className="font-bold text-sm text-white">Route: {routeResult.status.toUpperCase()}</h4>
                  <p className="text-xs text-slate-300 mt-1 leading-relaxed">{routeResult.note}</p>
                </div>
              </div>

              {/* Steps/Directions */}
              <div className="bg-slate-950/40 border border-slate-800 rounded-xl p-4 space-y-3">
                <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                  <Info className="h-3.5 w-3.5 text-slate-400" />
                  Navigation Instructions
                </h4>
                <div className="space-y-2 text-xs text-slate-400">
                  <div className="flex gap-2">
                    <span className="text-slate-500">1.</span>
                    <span>Depart from origin. Move along designated safe corridors.</span>
                  </div>
                  {routeResult.status === "re-routed" && (
                    <div className="flex gap-2 text-amber-400 font-medium">
                      <span>⚠️</span>
                      <span>Bypassed flash flood risk area. Retain high visibility.</span>
                    </div>
                  )}
                  <div className="flex gap-2">
                    <span className="text-slate-500">{routeResult.status === "re-routed" ? "3." : "2."}</span>
                    <span>Arrive at assembly point shelter. Register occupancy.</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Map display */}
      <div className="flex-1 h-[400px] md:h-full relative">
        <Map 
          incidents={incidents}
          routes={routeResult ? [routeResult] : []}
          center={routeResult ? routeResult.start : [19.0300, 72.8500]}
          zoom={13}
          onMapClick={handleMapClick}
          selectedCoord={activeSelect === "start" ? [coords.start_lat, coords.start_lng] : [coords.end_lat, coords.end_lng]}
        />
      </div>
    </div>
  );
}
