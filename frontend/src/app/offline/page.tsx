"use client";

import { useState } from "react";
import { WifiOff, Printer, Download, BookOpen, AlertTriangle, ShieldCheck, Heart } from "lucide-react";

export default function OfflinePage() {
  const [activeSection, setActiveSection] = useState<"first-aid" | "earthquake" | "flood" | "fire">("first-aid");

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="flex-1 p-6 md:p-8 space-y-6 overflow-y-auto bg-slate-50/30 print:p-0 print:bg-white print:text-black">
      {/* Header (Hidden in Print) */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-5 print:hidden">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-800 md:text-3xl flex items-center gap-3">
            <WifiOff className="h-7 w-7 text-amber-600 animate-pulse" />
            Offline Emergency Mode
          </h2>
          <p className="text-slate-500 text-sm mt-1">This page stores critical survival guides locally. You can access it without active internet connection.</p>
        </div>
        <button 
          onClick={handlePrint}
          className="flex items-center gap-2 px-5 py-2.5 bg-amber-500 hover:bg-amber-600 transition-colors text-white font-bold rounded-xl text-sm shadow-sm border border-amber-500 self-start"
        >
          <Printer className="h-4 w-4" />
          Print / Save PDF Guide
        </button>
      </div>

      {/* Print-Only Title */}
      <div className="hidden print:block border-b-2 border-black pb-4 mb-6">
        <h1 className="text-3xl font-black uppercase tracking-wide">ResQu AI - Offline Survival Manual</h1>
        <p className="text-sm text-gray-600 mt-1">Critical Disaster Survival & First-Aid Instructions. Keep this paper copy handy.</p>
      </div>

      {/* Tabs Selector (Hidden in Print) */}
      <div className="flex border-b border-slate-200 gap-2 overflow-x-auto pb-1 print:hidden">
        <button
          onClick={() => setActiveSection("first-aid")}
          className={`px-4 py-2.5 rounded-xl font-bold text-xs transition-colors shrink-0 ${
            activeSection === "first-aid" 
              ? "bg-sky-50 text-sky-655 border border-sky-100" 
              : "text-slate-500 hover:text-slate-800"
          }`}
        >
          🩹 First Aid & CPR
        </button>
        <button
          onClick={() => setActiveSection("earthquake")}
          className={`px-4 py-2.5 rounded-xl font-bold text-xs transition-colors shrink-0 ${
            activeSection === "earthquake" 
              ? "bg-sky-50 text-sky-655 border border-sky-100" 
              : "text-slate-500 hover:text-slate-800"
          }`}
        >
          🧱 Earthquake Protocol
        </button>
        <button
          onClick={() => setActiveSection("flood")}
          className={`px-4 py-2.5 rounded-xl font-bold text-xs transition-colors shrink-0 ${
            activeSection === "flood" 
              ? "bg-sky-50 text-sky-655 border border-sky-100" 
              : "text-slate-500 hover:text-slate-800"
          }`}
        >
          🌊 Flood Evacuation
        </button>
        <button
          onClick={() => setActiveSection("fire")}
          className={`px-4 py-2.5 rounded-xl font-bold text-xs transition-colors shrink-0 ${
            activeSection === "fire" 
              ? "bg-sky-50 text-sky-655 border border-sky-100" 
              : "text-slate-500 hover:text-slate-800"
          }`}
        >
          🔥 Fire Safety
        </button>
      </div>

      {/* Survival Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content Area */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl p-6 space-y-6 shadow-sm print:bg-white print:border-none print:shadow-none print:col-span-3">
          {/* Section: First Aid */}
          {(activeSection === "first-aid" || typeof window !== "undefined" && window.matchMedia("print").matches) && (
            <div className="space-y-4 print:block">
              <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2 border-b border-slate-200 pb-2 print:text-black print:border-black">
                <Heart className="h-5 w-5 text-rose-500 shrink-0" />
                Emergency First Aid & CPR Instructions
              </h3>

              <div className="space-y-4 text-sm text-slate-600 print:text-black">
                <div>
                  <h4 className="font-bold text-slate-800 mb-1 print:text-black">1. Cardiopulmonary Resuscitation (CPR)</h4>
                  <p className="leading-relaxed text-xs">
                    Apply to individuals who are unresponsive and not breathing normally.
                  </p>
                  <ol className="list-decimal list-inside ml-2 mt-2 space-y-1 text-xs">
                    <li>Place hands in the center of the chest.</li>
                    <li>Push hard and fast: 2 inches deep, 100-120 compressions per minute (to the beat of Stayin' Alive).</li>
                    <li>If trained, give 2 rescue breaths after every 30 compressions.</li>
                    <li>Continue until medical help arrives or AED is ready.</li>
                  </ol>
                </div>

                <div>
                  <h4 className="font-bold text-slate-850 mb-1 print:text-black">2. Severe Bleeding Control</h4>
                  <ul className="list-disc list-inside ml-2 space-y-1 text-xs">
                    <li>Apply direct pressure to the wound with a clean cloth.</li>
                    <li>Elevate the injured limb above heart level.</li>
                    <li>Do not remove the cloth if it gets soaked; add another on top.</li>
                    <li>If bleeding is life-threatening and on a limb, apply a tourniquet 2-3 inches above the wound.</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-bold text-slate-850 mb-1 print:text-black">3. Choking (Heimlich Maneuver)</h4>
                  <ul className="list-disc list-inside ml-2 space-y-1 text-xs">
                    <li>Stand behind the person, wrap arms around their waist.</li>
                    <li>Make a fist with one hand and place it slightly above the navel.</li>
                    <li>Grasp the fist with your other hand and press into the abdomen with quick, upward thrusts.</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Section: Earthquake */}
          {(activeSection === "earthquake" || typeof window !== "undefined" && window.matchMedia("print").matches) && (
            <div className="space-y-4 print:block print:mt-8">
              <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2 border-b border-slate-200 pb-2 print:text-black print:border-black">
                <BookOpen className="h-5 w-5 text-sky-600 shrink-0" />
                Earthquake Survival Protocol
              </h3>

              <div className="space-y-4 text-sm text-slate-600 print:text-black">
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 print:border-black print:bg-gray-100">
                  <h4 className="font-extrabold text-slate-800 text-xs mb-2 print:text-black">DURING SHAKING: DROP, COVER, AND HOLD ON</h4>
                  <ul className="list-disc list-inside space-y-1.5 text-xs">
                    <li>**DROP** onto your hands and knees.</li>
                    <li>**COVER** your head and neck under a sturdy table or desk.</li>
                    <li>**HOLD ON** to your shelter until shaking stops.</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-bold text-slate-750 mb-1 print:text-black">If Indoors:</h4>
                  <p className="text-xs leading-relaxed">
                    Stay inside. Avoid doorways, windows, and heavy furniture that could fall. Do not use elevators.
                  </p>
                </div>

                <div>
                  <h4 className="font-bold text-slate-750 mb-1 print:text-black">If Outdoors:</h4>
                  <p className="text-xs leading-relaxed">
                    Move to an open area away from buildings, power lines, streetlights, and brick walls. Drop to the ground.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Section: Flood */}
          {(activeSection === "flood" || typeof window !== "undefined" && window.matchMedia("print").matches) && (
            <div className="space-y-4 print:block print:mt-8">
              <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2 border-b border-slate-200 pb-2 print:text-black print:border-black">
                <ShieldCheck className="h-5 w-5 text-sky-600 shrink-0" />
                Flood Evacuation Safety
              </h3>

              <div className="space-y-4 text-sm text-slate-600 print:text-black">
                <div className="bg-rose-50 text-rose-700 p-4 rounded-xl border border-rose-100 print:bg-gray-100 print:text-black print:border-black">
                  <h4 className="font-bold text-xs uppercase flex items-center gap-1.5"><AlertTriangle className="h-4 w-4 text-rose-600" /> Turn Around, Don't Drown!</h4>
                  <p className="text-xs mt-1 leading-normal">
                    Just 6 inches of moving water can knock you down. 12 inches can sweep a vehicle away. Never walk or drive through moving floodwaters.
                  </p>
                </div>

                <div>
                  <h4 className="font-bold text-slate-750 mb-1 print:text-black">Evacuation Checklist:</h4>
                  <ul className="list-disc list-inside space-y-1 text-xs">
                    <li>If advised to evacuate, do so immediately.</li>
                    <li>Turn off utilities at main switches/valves if safe to do so.</li>
                    <li>Move important papers and emergency kits to the highest floor.</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Section: Fire */}
          {(activeSection === "fire" || typeof window !== "undefined" && window.matchMedia("print").matches) && (
            <div className="space-y-4 print:block print:mt-8">
              <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2 border-b border-slate-200 pb-2 print:text-black print:border-black">
                <AlertTriangle className="h-5 w-5 text-rose-600 shrink-0" />
                Fire Evacuation & Escape Strategy
              </h3>

              <div className="space-y-4 text-sm text-slate-600 print:text-black">
                <ul className="list-disc list-inside space-y-2 text-xs">
                  <li>**Crawl Low Under Smoke**: Smoke rises. Keep your face close to the floor where the air is cleaner.</li>
                  <li>**Check Doors First**: Feel doors with the back of your hand before opening. If hot, do not open. Use an alternate escape route.</li>
                  <li>**Stop, Drop, and Roll**: If clothing catches fire, drop to the ground and roll immediately.</li>
                </ul>
              </div>
            </div>
          )}
        </div>

        {/* Local Emergency Contacts Panel (Hidden in Print) */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4 shadow-sm print:hidden">
          <h3 className="font-bold text-slate-800 text-md flex items-center gap-2">
            <PhoneCallIcon className="h-5 w-5 text-sky-655" />
            EOC Hotlines
          </h3>
          <div className="space-y-3">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">BMC Disaster Cell</span>
              <p className="text-sm font-bold text-slate-800 mt-0.5">1916 / 112</p>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Indian Red Cross</span>
              <p className="text-sm font-bold text-slate-800 mt-0.5">+91-11-23716441</p>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Fire Brigade</span>
              <p className="text-sm font-bold text-slate-800 mt-0.5">101</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Simple fallback icon
function PhoneCallIcon({ className }: { className?: string }) {
  return (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.94.725l.548 2.2a1 1 0 01-.321.988l-1.305.98a10.582 10.582 0 004.872 4.872l.98-1.305a1 1 0 01.988-.321l2.2.548a1 1 0 01.725.94V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
    </svg>
  );
}
