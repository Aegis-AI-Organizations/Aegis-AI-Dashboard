import React from "react";
import type { UserRole } from "../../types/auth";
import { getRoleConfig } from "../../utils/roleLabels";
import { Shield, Building } from "lucide-react";

interface RoleBadgeProps {
  role: UserRole | string;
  showIcon?: boolean;
  className?: string;
}

import { css, cx } from "styled-system/css";
import { flex } from "styled-system/patterns";

export const RoleBadge: React.FC<RoleBadgeProps> = ({
  role,
  showIcon = true,
  className = "",
}) => {
  const config = getRoleConfig(role);

  if (!config) {
    return (
      <span
        className={cx(
          css({
            px: "2",
            py: "0.5",
            borderRadius: "md",
            fontSize: "10px",
            fontWeight: "bold",
            bg: "gray.500/10",
            color: "gray.400",
            border: "1px solid",
            borderColor: "gray.500/20",
          }),
          className,
        )}
      >
        {role}
      </span>
    );
  }

  const Icon = config.pole === "internal" ? Shield : Building;

  // We map the legacy colorClass logic to Panda CSS
  const getDynamicStyles = () => {
    const isInternal = config.pole === "internal";
    return css({
      bg: isInternal ? "blue.500/10" : "emerald.500/10",
      color: isInternal ? "blue.400" : "emerald.400",
      borderColor: isInternal ? "blue.500/20" : "emerald.500/20",
      gradientFrom: isInternal ? "blue.500/5" : "emerald.500/5",
      gradientTo: "transparent",
    });
  };

  return (
    <div
      className={cx(
        flex({
          align: "center",
          gap: "1.5",
          px: "2.5",
          py: "1",
          borderRadius: "full",
          fontSize: "10px",
          fontWeight: "900",
          textTransform: "uppercase",
          letterSpacing: "wider",
          border: "1px solid",
          bgGradient: "to-br",
          transition: "all",
          transitionDuration: "300ms",
        }),
        getDynamicStyles(),
        className,
      )}
    >
      {showIcon && <Icon className={css({ w: "3", h: "3" })} />}
      <span>{config.label}</span>
    </div>
  );
};
