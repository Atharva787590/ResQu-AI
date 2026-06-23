"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { 
  fetchIncidents, 
  fetchShelters, 
  fetchHospitals, 
  fetchVolunteers, 
  fetchSosAlerts,
  createIncident
} from "@/lib/api";
import { 
  Activity, 
  ShieldAlert, 
  Users, 
  HeartPulse, 
  AlertTriangle,
  PlusCircle,
  TrendingUp
} from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

// Dynamically import the Map component to prevent SSR window reference errors
const Map = dynamic(() => import("@/components/Map"), { ssr: false });

export default function Dashboard() {
  const [incidents, setIncidents] = useState<any[]>([]);
  const [shelters, setShelters] = useState<any[]>([]);
  const [hospitals, setHospitals] = useState<any[]>([]);
  const [volunteers, setVolunteers] = useState<any[]>([]);
  const [sosAlerts, setSosAlerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Quick report incident state
  const [showReportForm, setShowReportForm] = useState(false);
  const [newInc, setNewInc] = useState({
    title: "",
    description: "",
    type: "flood",
    latitude: 19.0178,
    longitude: 72.8478,
    severity: "medium"
  });

  const loadData = async () => {
    try {
      const [incRes, shRes, hospRes, volRes, sosRes] = await Promise.all([
        fetchIncidents(),
        fetchShelters(),
        fetchHospitals(),
        fetchVolunteers(),
        fetchSosAlerts()
      ]);
      setIncidents(incRes);
      setShelters(shRes);
      setHospitals(hospRes);
      setVolunteers(volRes);
      setSosAlerts(sosRes);
    } catch (e) {
      console.error("Error loading dashboard data:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleReportIncident = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createIncident(newInc);
      setShowReportForm(false);
      setNewInc({
        title: "",
        description: "",
        type: "flood",
        latitude: 19.0178,
        longitude: 72.8478,
        severity: "medium"
      });
      loadData();
    } catch(err) {
      alert("Failed to report incident. Make sure backend is running.");
    }
  };

  if (loading) {
    return (
      <div className="flex-1 bg-slate-50 flex items-center justify-center text-slate-500">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 border-4 border-sky-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm font-semibold tracking-wide text-slate-600">Loading ResQu AI Dashboard...</p>
        </div>
      </div>
    );
  }

  // Calculate stats
  const activeIncidentsCount = incidents.filter(i => i.status === "active").length;
  const shelterBedsAvailable = shelters.reduce((acc, curr) => acc + (curr.capacity - curr.occupancy), 0);
  const hospitalBedsAvailable = hospitals.reduce((acc, curr) => acc + curr.available_beds, 0);
  const pendingSosCount = sosAlerts.filter(s => s.status === "pending").length;

  // Prepare chart data
  const shelterChartData = shelters.map(s => ({
    name: s.name.split(" ")[0], // short name
    Occupied: s.occupancy,
    Capacity: s.capacity
  }));

  // Skill distribution parsing
  const skillCounts: Record<string, number> = {};
  volunteers.forEach(v => {
    const skillsList = v.skills.split(",");
    skillsList.forEach((sk: string) => {
      const trimmed = sk.trim();
      if (trimmed) {
        skillCounts[trimmed] = (skillCounts[trimmed] || 0) + 1;
      }
    });
  });
  const volunteerPieData = Object.entries(skillCounts).map(([name, value]) => ({ name, value })).slice(0, 5);

  const COLORS = ["#0284c7", "#0ea5e9", "#10b981", "#fbbf24", "#8b5cf6"];

  return (
    <div className="flex-1 p-6 md:p-8 space-y-6 overflow-y-auto bg-slate-50/30">
      {/* Upper header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200/80 pb-5">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-800 md:text-3xl">Emergency Operations Command</h2>
          <p className="text-slate-500 text-sm mt-1">Real-time situational awareness and resource tracking.</p>
        </div>
        <button 
          onClick={() => setShowReportForm(true)}
          className="flex items-center gap-2 px-5 py-2.5 bg-sky-600 hover:bg-sky-500 transition-colors text-white font-semibold rounded-xl text-sm shadow-sm border border-sky-600 self-start"
        >
          <PlusCircle className="h-4 w-4" />
          Report Emergency Incident
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Active Emergencies */}
        <div className="bg-white border border-slate-200/80 p-5 rounded-2xl flex items-center justify-between shadow-sm">
          <div>
            <span className="text-slate-400 text-xs font-bold uppercase tracking-wider">Active Emergencies</span>
            <h3 className="text-3xl font-extrabold text-slate-800 mt-1.5">{activeIncidentsCount}</h3>
            <span className="text-xs text-rose-600 font-semibold mt-1 inline-block">● High Alert Level</span>
          </div>
          <div className="bg-rose-50 text-rose-600 p-3.5 rounded-xl border border-rose-100">
            <Activity className="h-5 w-5" />
          </div>
        </div>

        {/* Shelter Space */}
        <div className="bg-white border border-slate-200/80 p-5 rounded-2xl flex items-center justify-between shadow-sm">
          <div>
            <span className="text-slate-400 text-xs font-bold uppercase tracking-wider">Shelter Beds Open</span>
            <h3 className="text-3xl font-extrabold text-sky-600 mt-1.5">{shelterBedsAvailable}</h3>
            <span className="text-xs text-slate-500 mt-1 inline-block">Across {shelters.length} locations</span>
          </div>
          <div className="bg-sky-50 text-sky-600 p-3.5 rounded-xl border border-sky-100">
            <ShieldAlert className="h-5 w-5" />
          </div>
        </div>

        {/* Hospital Beds */}
        <div className="bg-white border border-slate-200/80 p-5 rounded-2xl flex items-center justify-between shadow-sm">
          <div>
            <span className="text-slate-400 text-xs font-bold uppercase tracking-wider">Hospital Beds Open</span>
            <h3 className="text-3xl font-extrabold text-emerald-600 mt-1.5">{hospitalBedsAvailable}</h3>
            <span className="text-xs text-emerald-600 font-semibold mt-1 inline-block">Ambulances Dispatched</span>
          </div>
          <div className="bg-emerald-50 text-emerald-600 p-3.5 rounded-xl border border-emerald-100">
            <HeartPulse className="h-5 w-5" />
          </div>
        </div>

        {/* SOS Alerts */}
        <div className="bg-white border border-slate-200/80 p-5 rounded-2xl flex items-center justify-between shadow-sm">
          <div>
            <span className="text-slate-400 text-xs font-bold uppercase tracking-wider">SOS Distress Logs</span>
            <h3 className="text-3xl font-extrabold text-amber-600 mt-1.5">{pendingSosCount}</h3>
            <span className="text-xs text-amber-600 font-semibold mt-1 inline-block">🚨 Critical Rescue Needed</span>
          </div>
          <div className="bg-amber-50 text-amber-600 p-3.5 rounded-xl border border-amber-100">
            <AlertTriangle className="h-5 w-5" />
          </div>
        </div>
      </div>

      {/* Main Map & Live Log Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Map (2 columns width) */}
        <div className="lg:col-span-2 h-[450px] relative">
          <div className="absolute top-4 left-4 z-[1000] bg-white/95 border border-slate-200 px-3 py-2 rounded-lg text-xs font-semibold text-slate-600 flex items-center gap-4 shadow-sm">
            <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-rose-500"></span> Incident</span>
            <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-cyan-500"></span> Shelter</span>
            <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-emerald-500"></span> Medical</span>
          </div>
          <Map 
            incidents={incidents}
            shelters={shelters}
            hospitals={hospitals}
            center={[19.0300, 72.8500]}
            zoom={12}
          />
        </div>

        {/* Live Logs Panel */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 flex flex-col h-[450px] shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3 mb-4">
            <h3 className="font-bold text-slate-800 text-md flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-rose-500 animate-pulse"></span>
              Live EOC Incident Stream
            </h3>
            <span className="text-xs text-slate-400 font-medium">Real-time</span>
          </div>
          <div className="flex-1 overflow-y-auto space-y-3.5 pr-2">
            {incidents.map((inc) => (
              <div key={`log-${inc.id}`} className="p-3.5 bg-slate-50/60 rounded-xl border border-slate-200/60 hover:border-slate-300 transition-colors">
                <div className="flex justify-between items-start gap-2">
                  <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded ${
                    inc.severity === "critical" ? "bg-rose-100 text-rose-700 border border-rose-200/30" :
                    inc.severity === "high" ? "bg-orange-100 text-orange-700 border border-orange-200/30" :
                    "bg-slate-100 text-slate-600"
                  }`}>
                    {inc.severity}
                  </span>
                  <span className="text-[10px] text-slate-400">
                    {new Date(inc.reported_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <h4 className="text-sm font-bold text-slate-800 mt-2">{inc.title}</h4>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">{inc.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Analytics Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Shelter Bed Space Chart */}
        <div className="bg-white border border-slate-200/80 p-5 rounded-2xl shadow-sm">
          <h3 className="font-bold text-slate-800 text-md mb-4 flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-sky-600" />
            Shelter Capacity & Occupancy Analysis
          </h3>
          <div className="h-[220px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={shelterChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#94a3b8" fontSize={11} />
                <Tooltip contentStyle={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "8px", color: "#0f172a" }} />
                <Bar dataKey="Occupied" fill="#0284c7" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Capacity" fill="#f1f5f9" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Volunteer Skill Demands Chart */}
        <div className="bg-white border border-slate-200/80 p-5 rounded-2xl shadow-sm">
          <h3 className="font-bold text-slate-800 text-md mb-4 flex items-center gap-2">
            <Users className="h-4 w-4 text-emerald-600" />
            Volunteer Skills Distribution (Top 5)
          </h3>
          <div className="h-[220px] flex flex-col sm:flex-row items-center justify-around gap-4">
            <div className="h-full w-full max-w-[180px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={volunteerPieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={70}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {volunteerPieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "8px" }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-2 text-xs flex-1">
              {volunteerPieData.map((item, idx) => (
                <div key={`legend-${idx}`} className="flex items-center gap-2 text-slate-600">
                  <span className="h-2 w-2 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }}></span>
                  <span className="font-semibold">{item.name}:</span>
                  <span className="text-slate-500">{item.value} volunteers</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Modal Dialog for Reporting Incident */}
      {showReportForm && (
        <div className="fixed inset-0 z-[9999] bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-xl">
            <div className="flex justify-between items-center border-b border-slate-200 pb-3">
              <h3 className="text-lg font-bold text-slate-800">Report New Disaster Incident</h3>
              <button 
                onClick={() => setShowReportForm(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-semibold"
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleReportIncident} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Incident Title</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. Waterlogging near Hindmata Junction"
                  value={newInc.title}
                  onChange={(e) => setNewInc({ ...newInc, title: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 focus:outline-none focus:border-sky-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Description</label>
                <textarea 
                  required
                  placeholder="Describe the situation, water depth, blocked streets..."
                  value={newInc.description}
                  onChange={(e) => setNewInc({ ...newInc, description: e.target.value })}
                  className="w-full h-24 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm text-slate-800 focus:outline-none focus:border-sky-500 resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Disaster Type</label>
                  <select 
                    value={newInc.type}
                    onChange={(e) => setNewInc({ ...newInc, type: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-800 focus:outline-none focus:border-sky-500"
                  >
                    <option value="flood">Flood</option>
                    <option value="fire">Fire</option>
                    <option value="earthquake">Earthquake</option>
                    <option value="cyclone">Cyclone</option>
                    <option value="landslide">Landslide</option>
                    <option value="accident">Accident</option>
                    <option value="medical">Medical</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Severity</label>
                  <select 
                    value={newInc.severity}
                    onChange={(e) => setNewInc({ ...newInc, severity: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-800 focus:outline-none focus:border-sky-500"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="critical">Critical</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Latitude</label>
                  <input 
                    type="number" 
                    step="0.000001"
                    required
                    value={newInc.latitude}
                    onChange={(e) => setNewInc({ ...newInc, latitude: parseFloat(e.target.value) })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 focus:outline-none focus:border-sky-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Longitude</label>
                  <input 
                    type="number" 
                    step="0.000001"
                    required
                    value={newInc.longitude}
                    onChange={(e) => setNewInc({ ...newInc, longitude: parseFloat(e.target.value) })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 focus:outline-none focus:border-sky-500"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-3 border-t border-slate-200 justify-end">
                <button 
                  type="button"
                  onClick={() => setShowReportForm(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 font-semibold rounded-xl text-sm"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="px-5 py-2 bg-sky-600 hover:bg-sky-500 text-white font-semibold rounded-xl text-sm border border-sky-600"
                >
                  Submit Report
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
