"use client";

import { useEffect, useState } from "react";
import { fetchMissingPersons, createMissingPerson } from "@/lib/api";
import { UserRoundSearch, Plus, MapPin, Calendar, ClipboardList } from "lucide-react";

export default function MissingPersonsPage() {
  const [persons, setPersons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  const [form, setForm] = useState({
    name: "",
    age: "",
    last_seen_location: "",
    description: "",
    contact_info: "",
  });

  const loadMissingPersons = async () => {
    try {
      const data = await fetchMissingPersons();
      setPersons(data);
    } catch(err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMissingPersons();
  }, []);

  const handleReportMissing = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createMissingPerson({
        name: form.name,
        age: parseInt(form.age) || 0,
        last_seen_location: form.last_seen_location,
        description: form.description,
        contact_info: form.contact_info
      });
      setShowForm(false);
      setForm({
        name: "",
        age: "",
        last_seen_location: "",
        description: "",
        contact_info: "",
      });
      loadMissingPersons();
    } catch(err) {
      alert("Failed to submit missing person report.");
    }
  };

  return (
    <div className="flex-1 p-6 md:p-8 space-y-6 overflow-y-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-white md:text-3xl flex items-center gap-3">
            <UserRoundSearch className="h-7 w-7 text-cyan-400" />
            Missing Persons Board
          </h2>
          <p className="text-slate-400 text-sm mt-1">Register and track missing person reports, aid reunification efforts, and search active profiles.</p>
        </div>
        <button 
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-5 py-2.5 bg-cyan-600 hover:bg-cyan-500 transition-colors text-white font-semibold rounded-xl text-sm shadow-lg shadow-cyan-900/40 border border-cyan-500 self-start"
        >
          <Plus className="h-4 w-4" />
          Report Missing Person
        </button>
      </div>

      {/* Board List Card Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full flex flex-col items-center justify-center py-16 text-slate-500 gap-2">
            <div className="h-8 w-8 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-sm font-medium">Fetching missing records...</span>
          </div>
        ) : (
          persons.map((p) => {
            const isMissing = p.status === "missing";
            return (
              <div key={p.id} className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-md flex flex-col justify-between">
                {/* Visual Header / Avatar Representation */}
                <div className="bg-slate-950 p-6 flex items-center gap-4 border-b border-slate-800/40">
                  <div className="h-16 w-16 rounded-2xl bg-slate-800 border border-slate-750 flex items-center justify-center text-slate-500 font-extrabold text-2xl tracking-wide shrink-0 uppercase select-none">
                    {p.name.substring(0, 2)}
                  </div>
                  <div className="space-y-1 overflow-hidden">
                    <h3 className="font-bold text-white text-md truncate leading-snug">{p.name}</h3>
                    <p className="text-xs text-slate-400">Age: {p.age || "Unknown"}</p>
                    <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full inline-block mt-1 ${
                      isMissing 
                        ? "bg-rose-950/60 text-rose-400 border border-rose-900/30" 
                        : "bg-emerald-950/60 text-emerald-400 border border-emerald-900/30"
                    }`}>
                      {p.status.toUpperCase()}
                    </span>
                  </div>
                </div>

                {/* Details */}
                <div className="p-5 flex-1 space-y-3.5 text-xs text-slate-300">
                  <div className="flex items-start gap-2 leading-relaxed">
                    <MapPin className="h-4 w-4 text-slate-500 shrink-0 mt-0.5" />
                    <div>
                      <span className="text-[10px] text-slate-500 block font-semibold uppercase tracking-wider">Last Seen Location</span>
                      <p className="text-slate-200 font-medium mt-0.5">{p.last_seen_location}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2 leading-relaxed">
                    <Calendar className="h-4 w-4 text-slate-500 shrink-0 mt-0.5" />
                    <div>
                      <span className="text-[10px] text-slate-500 block font-semibold uppercase tracking-wider">Last Seen Date</span>
                      <p className="text-slate-400 font-medium mt-0.5">{p.last_seen_date}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2 leading-relaxed">
                    <ClipboardList className="h-4 w-4 text-slate-500 shrink-0 mt-0.5" />
                    <div>
                      <span className="text-[10px] text-slate-500 block font-semibold uppercase tracking-wider">Description</span>
                      <p className="text-slate-400 leading-relaxed mt-0.5">{p.description}</p>
                    </div>
                  </div>
                </div>

                {/* Contact Footer */}
                <div className="bg-slate-950/40 p-4 border-t border-slate-800/80 text-xs flex flex-col gap-1 text-slate-400">
                  <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">Reporter Contact</span>
                  <span className="font-semibold text-slate-200">{p.contact_info}</span>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Report Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-[9999] bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="text-lg font-bold text-white">File Missing Person Report</h3>
              <button 
                onClick={() => setShowForm(false)}
                className="text-slate-400 hover:text-slate-200 text-sm font-semibold"
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleReportMissing} className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="col-span-2">
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Full Name</label>
                  <input 
                    type="text" 
                    required
                    placeholder="Missing person name"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Age</label>
                  <input 
                    type="number" 
                    required
                    placeholder="Age"
                    value={form.age}
                    onChange={(e) => setForm({ ...form, age: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Last Seen Location</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. Civic Center Plaza near Fountain"
                  value={form.last_seen_location}
                  onChange={(e) => setForm({ ...form, last_seen_location: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Physical Description & Attire</label>
                <textarea 
                  required
                  placeholder="Physical features, height, hair color, clothing details..."
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full h-24 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-cyan-500 resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Your Contact Information (Reporter)</label>
                <input 
                  type="text" 
                  required
                  placeholder="Your Name, relationship and phone number"
                  value={form.contact_info}
                  onChange={(e) => setForm({ ...form, contact_info: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="flex gap-3 pt-3 border-t border-slate-800 justify-end">
                <button 
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-xl text-sm"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="px-5 py-2 bg-cyan-600 hover:bg-cyan-500 text-white font-semibold rounded-xl text-sm"
                >
                  File Report
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
