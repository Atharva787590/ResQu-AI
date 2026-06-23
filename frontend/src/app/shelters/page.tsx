"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { fetchShelters, createShelter } from "@/lib/api";
import { ShieldAlert, MapPin, Check, Plus, X } from "lucide-react";

// Dynamically import the Map component to prevent SSR window reference errors
const Map = dynamic(() => import("@/components/Map"), { ssr: false });

export default function SheltersPage() {
  const [shelters, setShelters] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    type: "",
    pet_friendly: false,
    medical_support: false,
  });

  const [mapCenter, setMapCenter] = useState<[number, number]>([19.0300, 72.8500]);
  const [mapZoom, setMapZoom] = useState(13);

  // New shelter state
  const [showAddForm, setShowAddForm] = useState(false);
  const [newShelter, setNewShelter] = useState({
    name: "",
    type: "relief camp",
    latitude: 19.0300,
    longitude: 72.8500,
    address: "",
    capacity: 200,
    medical_support: false,
    pet_friendly: false,
    contact_number: "",
  });

  const loadShelters = async () => {
    setLoading(true);
    try {
      // Map frontend checkbox state to API: if false, we don't pass the filter at all to show both.
      const queryFilters: any = {};
      if (filters.type) queryFilters.type = filters.type;
      if (filters.pet_friendly) queryFilters.pet_friendly = true;
      if (filters.medical_support) queryFilters.medical_support = true;

      const data = await fetchShelters(queryFilters);
      setShelters(data);
    } catch(err) {
      console.error("Failed to load shelters:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadShelters();
  }, [filters]);

  const handleSelectShelter = (s: any) => {
    setMapCenter([s.latitude, s.longitude]);
    setMapZoom(15);
  };

  const handleAddShelter = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createShelter(newShelter);
      setShowAddForm(false);
      setNewShelter({
        name: "",
        type: "relief camp",
        latitude: 19.0300,
        longitude: 72.8500,
        address: "",
        capacity: 200,
        medical_support: false,
        pet_friendly: false,
        contact_number: "",
      });
      loadShelters();
    } catch (e) {
      alert("Failed to register shelter.");
    }
  };

  return (
    <div className="flex-1 flex flex-col md:flex-row h-screen">
      {/* Shelters Sidebar List & Filters */}
      <div className="w-full md:w-96 bg-slate-900 border-r border-slate-800 flex flex-col h-full shrink-0">
        <div className="p-5 border-b border-slate-800 space-y-4 bg-slate-900/50">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <ShieldAlert className="h-5 w-5 text-cyan-400" />
              Shelter Finder
            </h2>
            <button 
              onClick={() => setShowAddForm(true)}
              className="p-1.5 bg-cyan-950 text-cyan-400 border border-cyan-800 rounded-lg hover:bg-cyan-900 transition-colors"
              title="Add Shelter"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>

          {/* Filters */}
          <div className="space-y-3">
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Resource Type</label>
              <select
                value={filters.type}
                onChange={(e) => setFilters({ ...filters, type: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
              >
                <option value="">All Resource Centers</option>
                <option value="relief camp">Relief Camps</option>
                <option value="food center">Food Centers</option>
                <option value="assembly point">Safe Assembly Points</option>
                <option value="shelter">Standard Shelters</option>
              </select>
            </div>

            <div className="flex items-center gap-5 pt-1">
              <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={filters.pet_friendly}
                  onChange={(e) => setFilters({ ...filters, pet_friendly: e.target.checked })}
                  className="rounded bg-slate-950 border-slate-800 text-cyan-500 focus:ring-0 focus:ring-offset-0 h-4 w-4"
                />
                🐾 Pet Friendly
              </label>
              <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={filters.medical_support}
                  onChange={(e) => setFilters({ ...filters, medical_support: e.target.checked })}
                  className="rounded bg-slate-950 border-slate-800 text-cyan-500 focus:ring-0 focus:ring-offset-0 h-4 w-4"
                />
                🏥 Medical Support
              </label>
            </div>
          </div>
        </div>

        {/* Shelters List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12 text-slate-500 gap-2">
              <div className="h-6 w-6 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
              <span className="text-xs">Updating shelters...</span>
            </div>
          ) : shelters.length === 0 ? (
            <div className="text-center py-12 text-slate-500 text-xs">
              No matching resource centers found.
            </div>
          ) : (
            shelters.map((s) => {
              const bedsLeft = s.capacity - s.occupancy;
              const isFull = bedsLeft <= 0;
              return (
                <div
                  key={s.id}
                  onClick={() => handleSelectShelter(s)}
                  className="p-4 bg-slate-950/60 border border-slate-800 hover:border-cyan-800/60 transition-all rounded-xl cursor-pointer hover:shadow-md flex flex-col gap-2 group"
                >
                  <div className="flex justify-between items-start gap-2">
                    <h3 className="font-bold text-slate-200 text-sm group-hover:text-white transition-colors">{s.name}</h3>
                    <span className="text-[9px] font-bold uppercase tracking-wider text-cyan-400 bg-cyan-950/40 border border-cyan-900/30 px-2 py-0.5 rounded-full">
                      {s.type}
                    </span>
                  </div>
                  <div className="flex items-start gap-1 text-slate-400 text-xs leading-normal">
                    <MapPin className="h-3.5 w-3.5 shrink-0 mt-0.5 text-slate-500" />
                    <span>{s.address}</span>
                  </div>
                  
                  {/* Progress Occupancy */}
                  <div className="mt-1 space-y-1">
                    <div className="flex justify-between text-[10px] font-semibold text-slate-400">
                      <span>Occupancy: {s.occupancy} / {s.capacity}</span>
                      <span className={isFull ? "text-rose-500" : bedsLeft < 50 ? "text-amber-500" : "text-emerald-500"}>
                        {isFull ? "Full" : `${bedsLeft} open`}
                      </span>
                    </div>
                    <div className="w-full bg-slate-900 rounded-full h-1.5 overflow-hidden">
                      <div 
                        className={`h-full rounded-full ${isFull ? "bg-rose-500" : "bg-cyan-500"}`} 
                        style={{ width: `${Math.min(100, (s.occupancy / s.capacity) * 100)}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Attributes Icons */}
                  <div className="flex gap-2 text-[9px] pt-1">
                    {s.pet_friendly && <span className="bg-slate-900 text-slate-300 px-1.5 py-0.5 rounded border border-slate-800/40">🐾 Pets Ok</span>}
                    {s.medical_support && <span className="bg-slate-900 text-slate-300 px-1.5 py-0.5 rounded border border-slate-800/40">🏥 Medical Staff</span>}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Map display */}
      <div className="flex-1 h-[400px] md:h-full relative">
        <Map 
          shelters={shelters}
          center={mapCenter}
          zoom={mapZoom}
        />
      </div>

      {/* Add Shelter Modal */}
      {showAddForm && (
        <div className="fixed inset-0 z-[9999] bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="text-lg font-bold text-white">Register Emergency Shelter</h3>
              <button 
                onClick={() => setShowAddForm(false)}
                className="text-slate-400 hover:text-slate-200 text-sm font-semibold"
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleAddShelter} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Shelter Name</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. Richmond Community Center"
                  value={newShelter.name}
                  onChange={(e) => setNewShelter({ ...newShelter, name: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Address</label>
                <input 
                  type="text" 
                  required
                  placeholder="Street address, city"
                  value={newShelter.address}
                  onChange={(e) => setNewShelter({ ...newShelter, address: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Type</label>
                  <select 
                    value={newShelter.type}
                    onChange={(e) => setNewShelter({ ...newShelter, type: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-cyan-500"
                  >
                    <option value="relief camp">Relief Camp</option>
                    <option value="food center">Food Center</option>
                    <option value="assembly point">Safe Assembly Point</option>
                    <option value="shelter">Standard Shelter</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Total Capacity</label>
                  <input 
                    type="number" 
                    required
                    value={newShelter.capacity}
                    onChange={(e) => setNewShelter({ ...newShelter, capacity: parseInt(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Latitude</label>
                  <input 
                    type="number" 
                    step="0.000001"
                    required
                    value={newShelter.latitude}
                    onChange={(e) => setNewShelter({ ...newShelter, latitude: parseFloat(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Longitude</label>
                  <input 
                    type="number" 
                    step="0.000001"
                    required
                    value={newShelter.longitude}
                    onChange={(e) => setNewShelter({ ...newShelter, longitude: parseFloat(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Contact Phone</label>
                <input 
                  type="text" 
                  required
                  placeholder="415-555-xxxx"
                  value={newShelter.contact_number}
                  onChange={(e) => setNewShelter({ ...newShelter, contact_number: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="flex gap-6 items-center pt-2">
                <label className="flex items-center gap-2 text-sm text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newShelter.pet_friendly}
                    onChange={(e) => setNewShelter({ ...newShelter, pet_friendly: e.target.checked })}
                    className="rounded bg-slate-950 border-slate-800 text-cyan-500 focus:ring-0 focus:ring-offset-0 h-4 w-4"
                  />
                  🐾 Pet Friendly
                </label>
                <label className="flex items-center gap-2 text-sm text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newShelter.medical_support}
                    onChange={(e) => setNewShelter({ ...newShelter, medical_support: e.target.checked })}
                    className="rounded bg-slate-950 border-slate-800 text-cyan-500 focus:ring-0 focus:ring-offset-0 h-4 w-4"
                  />
                  🏥 Medical Support
                </label>
              </div>

              <div className="flex gap-3 pt-3 border-t border-slate-800 justify-end">
                <button 
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-xl text-sm"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="px-5 py-2 bg-cyan-600 hover:bg-cyan-500 text-white font-semibold rounded-xl text-sm"
                >
                  Create Shelter
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
