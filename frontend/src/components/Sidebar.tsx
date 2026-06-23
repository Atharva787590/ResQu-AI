"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  MessageSquare, 
  ShieldAlert, 
  Navigation, 
  HeartPulse, 
  AlertTriangle, 
  UserRoundSearch, 
  Users, 
  WifiOff,
  Activity
} from "lucide-react";

const navigation = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "AI Emergency Chat", href: "/chat", icon: MessageSquare },
  { name: "Shelter Finder", href: "/shelters", icon: ShieldAlert },
  { name: "Safe Route Navigator", href: "/routes", icon: Navigation },
  { name: "Medical Help", href: "/medical", icon: HeartPulse },
  { name: "SOS Emergency System", href: "/sos", icon: AlertTriangle },
  { name: "Missing Persons", href: "/missing", icon: UserRoundSearch },
  { name: "Volunteer Coordination", href: "/volunteers", icon: Users },
  { name: "Offline Instructions", href: "/offline", icon: WifiOff },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col justify-between h-screen shrink-0 sticky top-0">
      <div className="flex flex-col overflow-y-auto pt-5 pb-4">
        {/* Brand Header */}
        <div className="flex items-center gap-3 px-6 mb-8">
          <div className="bg-rose-600 p-2 rounded-lg text-white shadow-lg shadow-rose-900/50 animate-pulse">
            <Activity className="h-6 w-6" />
          </div>
          <div>
            <h1 className="font-bold text-white tracking-wide text-lg">ResQu AI</h1>
            <span className="text-xs font-semibold text-rose-500 uppercase tracking-widest">EOC Operations</span>
          </div>
        </div>

        {/* Navigation List */}
        <nav className="mt-2 flex-1 px-4 space-y-1">
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`group flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${
                  isActive
                    ? "bg-slate-800 text-rose-400 shadow-md border-l-4 border-rose-500 pl-3"
                    : "text-slate-400 hover:bg-slate-800/50 hover:text-slate-200"
                }`}
              >
                <Icon
                  className={`mr-3 h-5 w-5 transition-colors duration-200 ${
                    isActive ? "text-rose-500" : "text-slate-400 group-hover:text-slate-200"
                  }`}
                  aria-hidden="true"
                />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Footer Info */}
      <div className="border-t border-slate-800 p-4">
        <div className="flex items-center gap-3 bg-slate-950/40 p-3 rounded-xl border border-slate-800/40">
          <div className="h-2 w-2 rounded-full bg-emerald-500 animate-ping"></div>
          <div className="text-xs">
            <p className="font-semibold text-slate-300">System Status: Active</p>
            <p className="text-slate-500">Demoland Operations Hub</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
