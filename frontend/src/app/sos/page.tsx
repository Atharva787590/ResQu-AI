"use client";

import { useEffect, useState } from "react";
import { fetchSosAlerts, createSosAlert } from "@/lib/api";
import { AlertTriangle, MapPin, Phone, User, Activity, CheckCircle } from "lucide-react";

export default function SosPage() {
  const [sosList, setSosList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [broadcasted, setBroadcasted] = useState(false);
  const [broadcastData, setBroadcastData] = useState<any>(null);

  const [form, setForm] = useState({
    sender_name: "",
    sender_phone: "",
    latitude: 19.0300,
    longitude: 72.8500,
    situation: "Trapped in flood waters, need rescue.",
  });

  const loadSosAlerts = async () => {
    try {
      const data = await fetchSosAlerts();
      setSosList(data);
    } catch(err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSosAlerts();
  }, []);

  const handleFetchMockGPS = () => {
    // Generate slight random variations around Mumbai coordinates
    const randomLat = 19.0300 + (Math.random() - 0.5) * 0.04;
    const randomLng = 72.8500 + (Math.random() - 0.5) * 0.04;
    setForm(prev => ({
      ...prev,
      latitude: parseFloat(randomLat.toFixed(6)),
      longitude: parseFloat(randomLng.toFixed(6))
    }));
  };

  const handleBroadcastSos = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await createSosAlert(form);
      setBroadcastData(res);
      setBroadcasted(true);
      setForm({
        sender_name: "",
        sender_phone: "",
        latitude: 19.0300,
        longitude: 72.8500,
        situation: "Trapped in flood waters, need rescue.",
      });
      loadSosAlerts();
    } catch (err) {
      alert("Failed to broadcast SOS alert.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 p-6 md:p-8 space-y-6 overflow-y-auto bg-slate-50/30">
      {/* Header */}
      <div className="border-b border-slate-200 pb-5">
        <h2 className="text-2xl font-bold tracking-tight text-slate-800 md:text-3xl flex items-center gap-3">
          <AlertTriangle className="h-7 w-7 text-rose-600 animate-bounce" />
          SOS Emergency System
        </h2>
        <p className="text-slate-500 text-sm mt-1">Broadcast critical distress alerts to nearby rescue teams and EOC command.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* SOS Broadcasting Form */}
        <div className="lg:col-span-2 space-y-6">
          {broadcasted && broadcastData ? (
            <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-6 space-y-4 shadow-sm">
              <div className="flex gap-4">
                <CheckCircle className="h-10 w-10 text-emerald-600 shrink-0" />
                <div className="space-y-1">
                  <h3 className="font-extrabold text-slate-850 text-lg">Distress Signal Broadcast Successful</h3>
                  <p className="text-sm text-slate-600">ResQu AI EOC has received your coordinates and logged distress ticket #{broadcastData.id}.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-white p-4 rounded-xl border border-slate-200 text-xs">
                <div>
                  <span className="text-slate-400 block mb-0.5">Sender Name</span>
                  <span className="font-semibold text-slate-700">{broadcastData.sender_name}</span>
                </div>
                <div>
                  <span className="text-slate-400 block mb-0.5">Phone Contact</span>
                  <span className="font-semibold text-slate-700">{broadcastData.sender_phone}</span>
                </div>
                <div>
                  <span className="text-slate-400 block mb-0.5">GPS Location</span>
                  <span className="font-semibold text-slate-700">Lat: {broadcastData.latitude}, Lng: {broadcastData.longitude}</span>
                </div>
                <div>
                  <span className="text-slate-400 block mb-0.5">Situation Summary</span>
                  <span className="font-semibold text-slate-700">{broadcastData.situation}</span>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setBroadcasted(false)}
                  className="px-5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-650 font-semibold rounded-xl text-xs transition-colors border border-slate-200"
                >
                  Broadcast Another Alert
                </button>
                <div className="flex items-center gap-2 text-xs font-semibold text-emerald-600 animate-pulse">
                  <Activity className="h-4 w-4" /> Live Tracking Active
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4 shadow-sm">
              <h3 className="font-bold text-slate-850 text-md">Initiate Distress Broadcast</h3>
              
              <form onSubmit={handleBroadcastSos} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-450 uppercase mb-1">Your Name</label>
                    <div className="relative">
                      <User className="absolute left-3.5 top-3 h-4.5 w-4.5 text-slate-400" />
                      <input 
                        type="text" 
                        required
                        placeholder="Distress Sender Name"
                        value={form.sender_name}
                        onChange={(e) => setForm({ ...form, sender_name: e.target.value })}
                        className="w-full bg-white border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-800 focus:outline-none focus:border-sky-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-450 uppercase mb-1">Emergency Phone</label>
                    <div className="relative">
                      <Phone className="absolute left-3.5 top-3 h-4.5 w-4.5 text-slate-400" />
                      <input 
                        type="tel" 
                        required
                        placeholder="Mobile contact number"
                        value={form.sender_phone}
                        onChange={(e) => setForm({ ...form, sender_phone: e.target.value })}
                        className="w-full bg-white border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-800 focus:outline-none focus:border-sky-500"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="block text-xs font-bold text-slate-450 uppercase">GPS Coordinates</label>
                    <button
                      type="button"
                      onClick={handleFetchMockGPS}
                      className="text-[10px] font-bold text-sky-655 hover:text-sky-700"
                    >
                      🛰️ Acquire GPS Location
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <input 
                      type="number" 
                      step="0.000001"
                      required
                      value={form.latitude}
                      onChange={(e) => setForm({ ...form, latitude: parseFloat(e.target.value) })}
                      className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 focus:outline-none focus:border-sky-500"
                    />
                    <input 
                      type="number" 
                      step="0.000001"
                      required
                      value={form.longitude}
                      onChange={(e) => setForm({ ...form, longitude: parseFloat(e.target.value) })}
                      className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 focus:outline-none focus:border-sky-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-450 uppercase mb-1">Describe Situation</label>
                  <textarea 
                    required
                    placeholder="Provide details of trapped persons, injuries, rising water levels, or blockages..."
                    value={form.situation}
                    onChange={(e) => setForm({ ...form, situation: e.target.value })}
                    className="w-full h-24 bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 focus:outline-none focus:border-sky-500 resize-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl text-sm transition-all shadow-sm border border-rose-500 flex items-center justify-center gap-2"
                >
                  <AlertTriangle className="h-4.5 w-4.5 animate-pulse" />
                  Broadcast Critical SOS Distress Signal
                </button>
              </form>
            </div>
          )}
        </div>

        {/* SOS Activity Board */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 flex flex-col h-[500px] shadow-sm">
          <div className="border-b border-slate-200 pb-3 mb-4">
            <h3 className="font-bold text-slate-800 text-md flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-rose-600 animate-ping"></span>
              Distress Broadcast Log
            </h3>
            <p className="text-[10px] text-slate-450 mt-0.5">Active signals received in EOC</p>
          </div>
          <div className="flex-1 overflow-y-auto space-y-3.5 pr-2">
            {loading ? (
              <div className="flex justify-center items-center py-12">
                <div className="h-6 w-6 border-2 border-rose-500 border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : sosList.length === 0 ? (
              <div className="text-center py-12 text-slate-500 text-xs font-medium">
                No active SOS signals reported.
              </div>
            ) : (
              sosList.map((sos) => (
                <div key={sos.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 hover:border-slate-350 transition-colors space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-slate-700">{sos.sender_name}</span>
                    <span className="text-[10px] text-slate-400 font-medium">
                      {new Date(sos.reported_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 leading-normal">{sos.situation}</p>
                  <div className="flex items-center gap-3 text-[10px] font-semibold text-slate-500">
                    <span className="flex items-center gap-1"><MapPin className="h-3 w-3 text-rose-600" /> Lat {sos.latitude.toFixed(3)}, Lng {sos.longitude.toFixed(3)}</span>
                    <span className="flex items-center gap-1"><Phone className="h-3 w-3 text-slate-400" /> {sos.sender_phone}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
