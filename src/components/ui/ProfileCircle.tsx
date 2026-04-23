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
import { css, cx } from "styled-system/css";
import { flex } from "styled-system/patterns";

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

  const sizeStyles = {
    sm: css({ w: "8", h: "8", fontSize: "xs" }),
    md: css({ w: "10", h: "10", fontSize: "sm" }),
    lg: css({ w: "16", h: "16", fontSize: "xl" }),
    xl: css({ w: "28", h: "28", fontSize: "3xl" }),
  };

  const { type, value } = getAvatarContent(user || undefined);

  return (
    <div
      className={cx(css({ position: "relative", flexShrink: "0" }), className)}
    >
      <div
        className={cx(
          sizeStyles[size],
          flex({
            borderRadius: "2xl",
            bgGradient: "to-br",
            gradientFrom: "cyan.500",
            gradientTo: "indigo.600",
            boxShadow: "xl",
            align: "center",
            justify: "center",
            color: "white",
            fontWeight: "900",
            overflow: "hidden",
            border: "1px solid",
            borderColor: "whiteAlpha.100",
          }),
        )}
      >
        {type === "image" ? (
          <img
            src={value}
            alt={user?.name || "User"}
            className={css({
              w: "full",
              h: "full",
              objectFit: "cover",
              animation: "fadeIn 0.5s ease-out",
            })}
          />
        ) : (
          <span>{value}</span>
        )}
      </div>

      {showStatus && (
        <div
          className={css({
            position: "absolute",
            bottom: "-1",
            right: "-1",
            w: "3",
            h: "3",
            bg: "emerald.500",
            border: "2px solid",
            borderColor: "bg.main",
            borderRadius: "full",
            boxShadow: "0 0 10px rgba(16, 185, 129, 0.5)",
          })}
        />
      )}
    </div>
  );
};
