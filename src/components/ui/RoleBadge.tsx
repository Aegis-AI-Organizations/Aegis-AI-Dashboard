import React from "react";
import type { UserRole } from "../../types/auth";
import { getRoleConfig } from "../../utils/roleLabels";
import { Shield, Building } from "lucide-react";

interface RoleBadgeProps {
  role: UserRole | string;
  showIcon?: boolean;
  className?: string;
}

export const RoleBadge: React.FC<RoleBadgeProps> = ({
  role,
  showIcon = true,
  className = "",
}) => {
  const config = getRoleConfig(role);

  if (!config) {
    return (
      <span
        className={`px-2 py-0.5 rounded text-[10px] font-bold bg-gray-500/10 text-gray-400 border border-gray-500/20 ${className}`}
      >
        {role}
      </span>
    );
  }

  const Icon = config.pole === "internal" ? Shield : Building;

  return (
    <div
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border bg-gradient-to-br transition-all duration-300 ${config.colorClass} ${className}`}
    >
      {showIcon && <Icon className="w-3 h-3" />}
      <span>{config.label}</span>
    </div>
  );
};
