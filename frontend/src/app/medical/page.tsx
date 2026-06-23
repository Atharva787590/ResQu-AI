"use client";

import { useEffect, useState } from "react";
import { fetchHospitals } from "@/lib/api";
import { HeartPulse, PhoneCall, BedDouble, AlertCircle, Droplets } from "lucide-react";

export default function MedicalPage() {
  const [hospitals, setHospitals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadHospitals = async () => {
    try {
      const data = await fetchHospitals();
      setHospitals(data);
    } catch(err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHospitals();
  }, []);

  return (
    <div className="flex-1 p-6 md:p-8 space-y-6 overflow-y-auto">
      {/* Header */}
      <div className="border-b border-slate-800 pb-5">
        <h2 className="text-2xl font-bold tracking-tight text-white md:text-3xl flex items-center gap-3">
          <HeartPulse className="h-7 w-7 text-emerald-500" />
          Emergency Medical Help
        </h2>
        <p className="text-slate-400 text-sm mt-1">Directory of nearby hospitals, blood inventory availability, and ambulance hotlines.</p>
      </div>

      {/* Critical Hotline Banner */}
      <div className="bg-rose-950/20 border border-rose-900/40 rounded-2xl p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shadow-md">
        <div className="flex gap-3">
          <AlertCircle className="h-6 w-6 text-rose-500 shrink-0 mt-0.5" />
          <div>
            <h4 className="font-bold text-white text-sm">National Emergency Distress Hotline</h4>
            <p className="text-xs text-rose-300 mt-0.5 leading-normal">For immediate dispatch of rescue crews, police, or state ambulance assets.</p>
          </div>
        </div>
        <a 
          href="tel:112"
          className="flex items-center gap-2 px-5 py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl text-sm transition-colors border border-rose-500 shadow-lg shadow-rose-950/50"
        >
          <PhoneCall className="h-4 w-4" />
          Call Emergency 112
        </a>
      </div>

      {/* Hospital List Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full flex flex-col items-center justify-center py-16 text-slate-500 gap-2">
            <div className="h-8 w-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-sm font-medium">Querying hospital networks...</span>
          </div>
        ) : (
          hospitals.map((h) => {
            const bedPercentage = (h.available_beds / h.total_beds) * 100;
            const isCritical = h.available_beds < 20;

            const bloodTypes = typeof h.blood_types_available === "string" 
              ? h.blood_types_available.split(",")
              : h.blood_types_available;

            const ambulances = typeof h.ambulance_contacts === "string"
              ? h.ambulance_contacts.split(",")
              : h.ambulance_contacts;

            return (
              <div key={h.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 hover:border-slate-700 transition-colors shadow-md flex flex-col justify-between">
                <div className="space-y-3">
                  {/* Title */}
                  <div>
                    <h3 className="font-bold text-white text-md leading-snug">{h.name}</h3>
                    <p className="text-xs text-slate-500 mt-1 leading-normal">{h.address}</p>
                  </div>

                  {/* Bed Capacity Progress */}
                  <div className="space-y-1.5 p-3.5 bg-slate-950/40 rounded-xl border border-slate-800/40">
                    <div className="flex justify-between items-center text-xs font-semibold text-slate-400">
                      <span className="flex items-center gap-1.5"><BedDouble className="h-4 w-4 text-slate-500" /> Bed Availability</span>
                      <span className={isCritical ? "text-rose-500" : "text-emerald-400"}>
                        {h.available_beds} / {h.total_beds} open
                      </span>
                    </div>
                    <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden">
                      <div 
                        className={`h-full rounded-full ${isCritical ? "bg-rose-500" : "bg-emerald-500"}`} 
                        style={{ width: `${Math.min(100, bedPercentage)}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Blood Inventory */}
                  <div className="space-y-1.5">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                      <Droplets className="h-3.5 w-3.5 text-rose-500" />
                      Blood Bank Inventory
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {bloodTypes.map((blood: string, idx: number) => (
                        <span key={idx} className="bg-slate-950 border border-slate-800 text-rose-400 font-bold text-[10px] px-2 py-0.5 rounded-md">
                          {blood.trim()}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Ambulance Dispatch */}
                  <div className="space-y-1.5">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Ambulance Lines</span>
                    <div className="space-y-1">
                      {ambulances.map((phone: string, idx: number) => (
                        <a 
                          key={idx} 
                          href={`tel:${phone.trim()}`}
                          className="flex items-center justify-between text-xs bg-slate-950/60 hover:bg-slate-950 border border-slate-800/60 p-2 rounded-lg text-slate-300 hover:text-emerald-400 transition-colors font-medium"
                        >
                          <span>Ambulance Unit {idx + 1}</span>
                          <span className="flex items-center gap-1 text-[11px] font-semibold">{phone.trim()} 📞</span>
                        </a>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Primary Contact */}
                <div className="pt-3 border-t border-slate-800/80">
                  <a 
                    href={`tel:${h.contact_number}`}
                    className="w-full py-2 bg-slate-800 hover:bg-slate-750 text-slate-200 hover:text-white font-semibold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors border border-slate-700"
                  >
                    <PhoneCall className="h-3.5 w-3.5" />
                    Call Hospital Reception: {h.contact_number}
                  </a>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
