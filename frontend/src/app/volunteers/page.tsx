"use client";

import { useEffect, useState } from "react";
import { fetchVolunteers, createVolunteer } from "@/lib/api";
import { Users, UserPlus, Shield, CheckCircle, Award } from "lucide-react";

export default function VolunteersPage() {
  const [volunteers, setVolunteers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [registered, setRegistered] = useState(false);

  const [form, setForm] = useState({
    name: "",
    skills: "",
    location: "",
    contact_number: "",
  });

  const loadVolunteers = async () => {
    try {
      const data = await fetchVolunteers();
      setVolunteers(data);
    } catch(err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadVolunteers();
  }, []);

  const handleRegisterVolunteer = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await createVolunteer(form);
      setRegistered(true);
      setForm({
        name: "",
        skills: "",
        location: "",
        contact_number: "",
      });
      loadVolunteers();
    } catch(err) {
      alert("Failed to register volunteer.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 p-6 md:p-8 space-y-6 overflow-y-auto">
      {/* Header */}
      <div className="border-b border-slate-800 pb-5">
        <h2 className="text-2xl font-bold tracking-tight text-white md:text-3xl flex items-center gap-3">
          <Users className="h-7 w-7 text-cyan-400" />
          Volunteer Coordination System
        </h2>
        <p className="text-slate-400 text-sm mt-1">Register as a responder, list crisis response skills, and coordinate deployment matching active EOC tasks.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Registration Column */}
        <div className="space-y-6">
          {registered ? (
            <div className="bg-emerald-950/20 border border-emerald-900/40 rounded-2xl p-6 text-center space-y-4 shadow-xl">
              <div className="inline-flex h-14 w-14 rounded-2xl bg-emerald-900/40 text-emerald-500 items-center justify-center border border-emerald-800/40">
                <Award className="h-8 w-8" />
              </div>
              <div className="space-y-1">
                <h3 className="font-extrabold text-white text-md">Registration Successful</h3>
                <p className="text-xs text-slate-400 leading-relaxed px-4">Thank you for joining. ResQu AI EOC has registered your profile. You are marked as AVAILABLE for matching tasks.</p>
              </div>
              <button
                onClick={() => setRegistered(false)}
                className="w-full py-2 bg-slate-800 hover:bg-slate-750 text-slate-200 font-semibold rounded-xl text-xs transition-colors border border-slate-700"
              >
                Register Another Volunteer
              </button>
            </div>
          ) : (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-md">
              <h3 className="font-bold text-white text-md flex items-center gap-2">
                <UserPlus className="h-5 w-5 text-rose-500" />
                Register as Volunteer
              </h3>
              
              <form onSubmit={handleRegisterVolunteer} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Full Name</label>
                  <input 
                    type="text" 
                    required
                    placeholder="Enter your name"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Skills (Comma-separated)</label>
                  <input 
                    type="text" 
                    required
                    placeholder="e.g. First Aid, CPR, Search & Rescue"
                    value={form.skills}
                    onChange={(e) => setForm({ ...form, skills: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Current Neighborhood/Location</label>
                  <input 
                    type="text" 
                    required
                    placeholder="e.g. Mission District, SF"
                    value={form.location}
                    onChange={(e) => setForm({ ...form, location: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Contact Number</label>
                  <input 
                    type="tel" 
                    required
                    placeholder="e.g. 415-555-0155"
                    value={form.contact_number}
                    onChange={(e) => setForm({ ...form, contact_number: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white font-semibold rounded-xl text-sm transition-all shadow-lg border border-cyan-500"
                >
                  Submit Registration
                </button>
              </form>
            </div>
          )}
        </div>

        {/* Responders Table List Column */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-md">
            <h3 className="font-bold text-white text-md mb-4 flex items-center gap-2">
              <Shield className="h-5 w-5 text-cyan-400" />
              Active Responder Deployment Registry
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-500 uppercase tracking-wider font-bold">
                    <th className="pb-3 pr-4 font-bold">Volunteer</th>
                    <th className="pb-3 pr-4 font-bold">Skills</th>
                    <th className="pb-3 pr-4 font-bold">Location</th>
                    <th className="pb-3 pr-4 font-bold">Task Assignment</th>
                    <th className="pb-3 font-bold">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/40 text-slate-300">
                  {loading ? (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-slate-500">
                        Loading registry database...
                      </td>
                    </tr>
                  ) : volunteers.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-slate-500">
                        No registered volunteers found.
                      </td>
                    </tr>
                  ) : (
                    volunteers.map((v) => {
                      const skillsList = v.skills.split(",");
                      const isDeployed = v.status === "deployed";
                      return (
                        <tr key={v.id} className="hover:bg-slate-950/40 transition-colors">
                          <td className="py-3.5 pr-4 font-semibold text-white">{v.name}</td>
                          <td className="py-3.5 pr-4">
                            <div className="flex flex-wrap gap-1 max-w-[200px]">
                              {skillsList.map((sk: string, idx: number) => (
                                <span key={idx} className="bg-slate-950 text-slate-400 px-1.5 py-0.5 rounded text-[9px] border border-slate-850/60">
                                  {sk.trim()}
                                </span>
                              ))}
                            </div>
                          </td>
                          <td className="py-3.5 pr-4 text-slate-400">{v.location}</td>
                          <td className="py-3.5 pr-4 text-slate-350">{v.assigned_task}</td>
                          <td className="py-3.5">
                            <span className={`inline-flex items-center gap-1 font-bold text-[9px] uppercase px-2 py-0.5 rounded-full ${
                              isDeployed 
                                ? "bg-amber-950/60 text-amber-400 border border-amber-900/30" 
                                : "bg-emerald-950/60 text-emerald-400 border border-emerald-900/30"
                            }`}>
                              <span className={`h-1 w-1 rounded-full ${isDeployed ? "bg-amber-500" : "bg-emerald-500"}`}></span>
                              {v.status}
                            </span>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
