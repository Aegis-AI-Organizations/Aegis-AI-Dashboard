/**
 * Password complexity validation rules:
 * - Minimum 8 characters
 * - At least one uppercase letter
 * - At least one digit
 * - At least one special character
 */
export const PASSWORD_REGEX =
  /^(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*(),.?":{}|<>]).{8,}$/;

export const validatePassword = (password: string): boolean => {
  return PASSWORD_REGEX.test(password);
};

export const getPasswordError = (password: string): string | null => {
  if (password.length < 8)
    return "Le mot de passe doit faire au moins 8 caractères.";
  if (!/[A-Z]/.test(password))
    return "Le mot de passe doit contenir au moins une majuscule.";
  if (!/[0-9]/.test(password))
    return "Le mot de passe doit contenir au moins un chiffre.";
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password))
    return "Le mot de passe doit contenir au moins un caractère spécial.";
  return null;
};
