/**
 * Generates initials from a name or email.
 * Prioritizes the name, falls back to the email prefix.
 */
export const getInitials = (name?: string, email?: string): string => {
  if (name && name.trim()) {
    const parts = name.trim().split(/\s+/).filter(Boolean);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name.trim().substring(0, 2).toUpperCase();
  }

  if (email) {
    const prefix = email.split("@")[0];
    return prefix.substring(0, 2).toUpperCase();
  }

  return "AD";
};
