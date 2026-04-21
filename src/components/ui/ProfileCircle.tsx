import React from "react";
import { getAvatarContent } from "../../utils/user";
import { useAuthStore } from "../../store/AuthStore";

interface ProfileCircleProps {
  user?: { name: string; avatar_url?: string };
  avatarUrl?: string;
  name?: string;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
  showStatus?: boolean;
}

/**
 * Premium reactive Profile Circle component.
 * Explicitly listens to useAuthStore to ensure initials and avatar update instantly.
 */
export const ProfileCircle: React.FC<ProfileCircleProps> = ({
  user: propUser,
  avatarUrl,
  name: propName,
  size = "md",
  className = "",
  showStatus = false,
}) => {
  const authUser = useAuthStore((s) => s.user);
  const user =
    propUser ||
    (avatarUrl || propName
      ? { name: propName || "", avatar_url: avatarUrl }
      : authUser);

  const sizeClasses = {
    sm: "w-8 h-8 text-xs",
    md: "w-10 h-10 text-sm",
    lg: "w-16 h-16 text-xl",
    xl: "w-28 h-28 text-3xl",
  };

  const { type, value } = getAvatarContent(user || undefined);

  return (
    <div className={`relative shrink-0 ${className}`}>
      <div
        className={`${sizeClasses[size]} rounded-2xl bg-gradient-to-br from-cyan-500 to-indigo-600 shadow-xl flex items-center justify-center text-white font-black overflow-hidden border border-white/10`}
      >
        {type === "image" ? (
          <img
            src={value}
            alt={user?.name || "User"}
            className="w-full h-full object-cover animate-in fade-in duration-500"
          />
        ) : (
          <span>{value}</span>
        )}
      </div>

      {showStatus && (
        <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-emerald-500 border-2 border-[#0B0D13] rounded-full shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
      )}
    </div>
  );
};
