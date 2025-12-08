/**
 * Utility functions for authentication
 */

/**
 * Check if a specific cookie exists
 */
export const hasCookie = (cookieName: string): boolean => {
  if (typeof document === "undefined") return false;

  return document.cookie
    .split(";")
    .some((cookie) => cookie.trim().startsWith(`${cookieName}=`));
};

/**
 * Get cookie value by name
 */
export const getCookie = (cookieName: string): string | null => {
  if (typeof document === "undefined") return null;

  const match = document.cookie.match(
    new RegExp("(^| )" + cookieName + "=([^;]+)")
  );
  return match ? match[2] : null;
};
