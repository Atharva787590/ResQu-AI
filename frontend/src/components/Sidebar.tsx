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
    <aside className="w-64 bg-slate-50 border-r border-slate-200/80 flex flex-col justify-between h-screen shrink-0 sticky top-0">
      <div className="flex flex-col overflow-y-auto pt-5 pb-4">
        {/* Brand Header */}
        <div className="flex items-center gap-3 px-6 mb-8">
          <div className="bg-sky-600 p-2 rounded-xl text-white shadow-sm">
            <Activity className="h-5 w-5" />
          </div>
          <div>
            <h1 className="font-bold text-slate-800 tracking-tight text-lg">ResQu AI</h1>
            <span className="text-[10px] font-bold text-sky-600 uppercase tracking-wider">Emergency Operations</span>
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
                className={`group flex items-center px-4 py-2.5 text-sm font-medium rounded-xl transition-all duration-150 ${
                  isActive
                    ? "bg-white text-slate-900 border border-slate-200/80 shadow-sm border-l-4 border-l-sky-600 pl-3 font-semibold"
                    : "text-slate-500 hover:bg-slate-200/40 hover:text-slate-800"
                }`}
              >
                <Icon
                  className={`mr-3 h-5 w-5 transition-colors duration-150 ${
                    isActive ? "text-sky-600" : "text-slate-400 group-hover:text-slate-600"
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
      <div className="border-t border-slate-200/80 p-4 bg-white/60">
        <div className="flex items-center gap-3 bg-slate-100/50 p-3 rounded-xl border border-slate-200/60">
          <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></div>
          <div className="text-xs">
            <p className="font-semibold text-slate-700">System Status: Active</p>
            <p className="text-slate-400">EOC Command Center</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
