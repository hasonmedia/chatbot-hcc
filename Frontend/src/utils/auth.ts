/**
 * Utility functions for authentication
 */

/**
 * Check if there are any authentication cookies present
 * Note: Since cookies are HttpOnly, we use localStorage flag as a hint
 * Returns true if user might be authenticated, false otherwise
 */
export const hasAuthCookies = (): boolean => {
  // Since HttpOnly cookies can't be read from JS, use localStorage flag
  return getAuthFlag();
};

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

/**
 * Clear authentication cookies (best effort)
 * Note: HttpOnly cookies can only be cleared by the server
 */
export const clearAuthCookies = (): void => {
  if (typeof document === "undefined") return;

  const authCookieNames = ["access_token", "refresh_token"];

  authCookieNames.forEach((cookieName) => {
    // Set cookie to empty value with past expiry date
    document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
  });
};

/**
 * Set authentication flag in localStorage
 * This helps optimize initial load by avoiding unnecessary API calls
 */
export const setAuthFlag = (isAuthenticated: boolean): void => {
  if (typeof localStorage === "undefined") return;

  if (isAuthenticated) {
    localStorage.setItem("auth_flag", "true");
  } else {
    localStorage.removeItem("auth_flag");
  }
};

/**
 * Check if user might be authenticated based on localStorage flag
 * This is just a hint, actual authentication is verified by server
 */
export const getAuthFlag = (): boolean => {
  if (typeof localStorage === "undefined") return false;

  return localStorage.getItem("auth_flag") === "true";
};
