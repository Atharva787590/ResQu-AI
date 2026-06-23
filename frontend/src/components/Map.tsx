"use client";

import { useEffect, useState } from "react";
import L from "leaflet";
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMapEvents } from "react-leaflet";

// Custom icons using pulsing HTML/CSS
const createPulsingIcon = (colorClass: string) => {
  if (typeof window === "undefined") return null;
  return L.divIcon({
    html: `
      <div class="relative flex items-center justify-center h-6 w-6">
        <span class="animate-ping absolute inline-flex h-full w-full rounded-full ${colorClass} opacity-75"></span>
        <span class="relative inline-flex rounded-full h-4.5 w-4.5 ${colorClass} border-2 border-slate-900 shadow-md"></span>
      </div>
    `,
    className: "custom-div-icon",
    iconSize: [24, 24],
    iconAnchor: [12, 12],
  });
};

interface MapProps {
  incidents?: any[];
  shelters?: any[];
  hospitals?: any[];
  routes?: any[];
  center?: [number, number];
  zoom?: number;
  onMapClick?: (lat: number, lng: number) => void;
  selectedCoord?: [number, number] | null;
}

// Sub-component to capture map click events
function MapClickEvents({ onClick }: { onClick?: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      if (onClick) {
        onClick(e.latlng.lat, e.latlng.lng);
      }
    },
  });
  return null;
}

export default function Map({
  incidents = [],
  shelters = [],
  hospitals = [],
  routes = [],
  center = [19.0300, 72.8500],
  zoom = 13,
  onMapClick,
  selectedCoord,
}: MapProps) {
  const [mounted, setMounted] = useState(false);
  const [mapStyle, setMapStyle] = useState<"streets" | "satellite">("streets");

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="w-full h-full bg-slate-50 flex items-center justify-center text-slate-505">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 border-4 border-sky-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm font-medium">Initializing Map System...</p>
        </div>
      </div>
    );
  }

  // Generate Leaflet icons safely on client-side
  const incidentIcon = createPulsingIcon("bg-rose-500") as L.DivIcon;
  const shelterIcon = createPulsingIcon("bg-cyan-500") as L.DivIcon;
  const hospitalIcon = createPulsingIcon("bg-emerald-500") as L.DivIcon;
  const selectedIcon = createPulsingIcon("bg-amber-400") as L.DivIcon;

  return (
    <div className="relative w-full h-full">
      <MapContainer
        center={center}
        zoom={zoom}
        style={{ height: "100%", width: "100%", background: "#f8fafc" }}
        className="rounded-2xl overflow-hidden shadow-sm border border-slate-200/80"
      >
        {mapStyle === "streets" ? (
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
        ) : (
          <TileLayer
            attribution='Tiles &copy; Esri &mdash; Source: Esri'
            url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
          />
        )}
        
        {onMapClick && <MapClickEvents onClick={onMapClick} />}

        {/* Selected Coordinates Pin */}
        {selectedCoord && (
          <Marker position={selectedCoord} icon={selectedIcon}>
            <Popup>
              <div className="text-xs text-slate-900 font-semibold p-1">
                Selected Evacuation Coordinate<br />
                Lat: {selectedCoord[0].toFixed(4)}, Lng: {selectedCoord[1].toFixed(4)}
              </div>
            </Popup>
          </Marker>
        )}

        {/* Active Incidents (Red Markers) */}
        {incidents.map((inc) => (
          <Marker key={`inc-${inc.id}`} position={[inc.latitude, inc.longitude]} icon={incidentIcon}>
            <Popup>
              <div className="text-xs text-slate-900 p-2 font-sans">
                <div className="flex items-center gap-1.5 mb-1 font-bold text-rose-600 uppercase tracking-wide">
                  <span>🚨</span> {inc.type.toUpperCase()} - {inc.severity.toUpperCase()}
                </div>
                <h4 className="font-bold text-sm text-slate-950 mb-1">{inc.title}</h4>
                <p className="text-slate-700 leading-relaxed mb-1">{inc.description}</p>
                <div className="text-slate-500 text-[10px]">Reported: {new Date(inc.reported_at).toLocaleString()}</div>
              </div>
            </Popup>
          </Marker>
        ))}

        {/* Active Shelters (Blue Markers) */}
        {shelters.map((sh) => (
          <Marker key={`sh-${sh.id}`} position={[sh.latitude, sh.longitude]} icon={shelterIcon}>
            <Popup>
              <div className="text-xs text-slate-900 p-2 font-sans">
                <div className="flex items-center gap-1.5 mb-1 font-bold text-cyan-600 uppercase tracking-wide">
                  <span>🏠</span> {sh.type.toUpperCase()}
                </div>
                <h4 className="font-bold text-sm text-slate-950 mb-1">{sh.name}</h4>
                <p className="text-slate-700 leading-relaxed mb-1">{sh.address}</p>
                <div className="font-semibold text-slate-950 mb-1">Occupancy: {sh.occupancy} / {sh.capacity}</div>
                <div className="flex flex-wrap gap-1 mt-1 text-[10px]">
                  {sh.pet_friendly && <span className="bg-cyan-100 text-cyan-800 px-1 rounded">🐾 Pet Friendly</span>}
                  {sh.medical_support && <span className="bg-emerald-100 text-emerald-800 px-1 rounded">🏥 Medical</span>}
                </div>
              </div>
            </Popup>
          </Marker>
        ))}

        {/* Active Hospitals (Green Markers) */}
        {hospitals.map((hosp) => (
          <Marker key={`hosp-${hosp.id}`} position={[hosp.latitude, hosp.longitude]} icon={hospitalIcon}>
            <Popup>
              <div className="text-xs text-slate-900 p-2 font-sans">
                <div className="flex items-center gap-1.5 mb-1 font-bold text-emerald-600 uppercase tracking-wide">
                  <span>🏥</span> EMERGENCY MEDICAL
                </div>
                <h4 className="font-bold text-sm text-slate-950 mb-1">{hosp.name}</h4>
                <p className="text-slate-700 leading-relaxed mb-1">{hosp.address}</p>
                <div className="font-semibold text-slate-950">Available Beds: <span className="text-emerald-600">{hosp.available_beds}</span> / {hosp.total_beds}</div>
                <div className="text-[10px] text-slate-500 mt-1">Phone: {hosp.contact_number}</div>
              </div>
            </Popup>
          </Marker>
        ))}

        {/* Evacuation Routes (Polylines) */}
        {routes.map((rt, idx) => {
          let coords = [];
          try {
            coords = typeof rt.path_coordinates === 'string' ? JSON.parse(rt.path_coordinates) : rt.path_coordinates;
          } catch(e) {
            coords = rt.path || [];
          }
          
          const isBlocked = rt.state === "blocked";
          return (
            <Polyline
              key={`route-${idx}`}
              positions={coords}
              pathOptions={{
                color: isBlocked ? "rgb(239, 68, 68)" : "rgb(59, 130, 246)",
                weight: 5,
                dashArray: isBlocked ? "5, 10" : undefined,
                opacity: 0.85
              }}
            >
              <Popup>
                <div className="text-xs text-slate-900 p-2 font-sans">
                  <h4 className="font-bold text-slate-950">{rt.name}</h4>
                  <div className="font-semibold mt-1">
                    Status: <span className={isBlocked ? "text-rose-600" : "text-blue-600"}>{rt.state.toUpperCase()}</span>
                  </div>
                </div>
              </Popup>
            </Polyline>
          );
        })}
      </MapContainer>

      {/* Floating Map Style Switcher */}
      <div className="absolute bottom-4 right-4 z-[9999] bg-white/95 backdrop-blur-xs border border-slate-200 rounded-xl p-1 shadow-md flex gap-1">
        <button
          type="button"
          onClick={() => setMapStyle("streets")}
          className={`px-3 py-1.5 rounded-lg text-[10px] font-extrabold tracking-wide uppercase transition-all ${
            mapStyle === "streets"
              ? "bg-sky-600 text-white shadow-sm"
              : "text-slate-500 hover:bg-slate-100 hover:text-slate-800"
          }`}
        >
          🗺️ Streets
        </button>
        <button
          type="button"
          onClick={() => setMapStyle("satellite")}
          className={`px-3 py-1.5 rounded-lg text-[10px] font-extrabold tracking-wide uppercase transition-all ${
            mapStyle === "satellite"
              ? "bg-sky-600 text-white shadow-sm"
              : "text-slate-500 hover:bg-slate-100 hover:text-slate-800"
          }`}
        >
          🛰️ Satellite
        </button>
      </div>
    </div>
  );
}
