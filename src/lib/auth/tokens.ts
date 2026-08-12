"use client";

// Session tokens are held in memory and mirrored to localStorage so a page
// reload does not drop the session. Storing the refresh token in localStorage
// is an accepted dev tradeoff; a hardened build would hand tokens off to an
// httpOnly cookie via a small server route. See README (Security).
const ACCESS_KEY = "conductor.access";
const REFRESH_KEY = "conductor.refresh";

let accessToken: string | null = null;
let refreshToken: string | null = null;

function browser(): boolean {
  return typeof window !== "undefined";
}

export function loadTokens(): void {
  if (!browser()) return;
  accessToken = window.localStorage.getItem(ACCESS_KEY);
  refreshToken = window.localStorage.getItem(REFRESH_KEY);
}

export function setTokens(access: string, refresh: string): void {
  accessToken = access;
  refreshToken = refresh;
  if (browser()) {
    window.localStorage.setItem(ACCESS_KEY, access);
    window.localStorage.setItem(REFRESH_KEY, refresh);
  }
}

export function clearTokens(): void {
  accessToken = null;
  refreshToken = null;
  if (browser()) {
    window.localStorage.removeItem(ACCESS_KEY);
    window.localStorage.removeItem(REFRESH_KEY);
  }
}

export function getAccessToken(): string | null {
  return accessToken;
}

export function getRefreshToken(): string | null {
  return refreshToken;
}
