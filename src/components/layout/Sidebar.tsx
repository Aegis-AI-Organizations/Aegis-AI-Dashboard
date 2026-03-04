import React from "react";
import { NavLink } from "react-router-dom";
import { LayoutDashboard, Shield, Users, Settings } from "lucide-react";

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/" },
  { icon: Shield, label: "Vulnerabilities", path: "/vulnerabilities" },
  { icon: Users, label: "Users", path: "/users" },
  { icon: Settings, label: "Settings", path: "/settings" },
];

export const Sidebar: React.FC = () => {
  return (
    <aside className="hidden md:flex flex-col w-64 bg-[#050810] border-r border-gray-800/60 sticky top-0 h-screen overflow-y-auto">
      <div className="flex items-center gap-3 px-6 h-16 border-b border-gray-800/60 flex-shrink-0">
        <img
          src="/logo.svg"
          alt="Aegis AI Logo"
          className="w-8 h-8 object-contain"
          onError={(e) => {
            (e.target as HTMLImageElement).src = "/logo.png";
          }}
        />
        <span className="text-white font-bold text-lg tracking-wider">
          Aegis AI
        </span>
      </div>

      <nav className="flex-1 py-6 flex flex-col gap-1.5">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-6 py-2.5 text-sm font-medium transition-colors border-l-2 ${
                isActive
                  ? "border-cyan-400 bg-cyan-950/20 text-cyan-400"
                  : "border-transparent text-gray-400 hover:text-gray-200 hover:bg-gray-800/30"
              }`
            }
          >
            <item.icon className="w-5 h-5 flex-shrink-0" />
            {item.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
};
