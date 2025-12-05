import { getCookie, getAuthFlag } from "@/utils/auth";

/**
 * Check if user is potentially authenticated
 * This is a quick client-side check before making API calls
 */
export const isPotentiallyAuthenticated = (): boolean => {
  return getAuthFlag();
};

/**
 * Get access token from cookie
 */
export const getAccessToken = (): string | null => {
  return getCookie("access_token");
};

/**
 * Get refresh token from cookie
 */
export const getRefreshToken = (): string | null => {
  return getCookie("refresh_token");
};

/**
 * Check if access token exists (basic check, doesn't verify expiry)
 */
export const hasValidTokens = (): boolean => {
  const accessToken = getAccessToken();
  const refreshToken = getRefreshToken();

  // At least one token should exist for potential authentication
  return !!(accessToken || refreshToken);
};
