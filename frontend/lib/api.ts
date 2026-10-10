const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/api';

type ApiOptions = RequestInit & { auth?: boolean };

let isRefreshing = false;
let refreshPromise: Promise<string> | null = null;

async function refreshAccessToken(): Promise<string> {
  const refreshToken = typeof window !== 'undefined' ? localStorage.getItem('refreshToken') : null;
  if (!refreshToken) throw new Error('No refresh token');

  const res = await fetch(`${API_URL}/auth/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken }),
  });

  if (!res.ok) {
    logout();
    throw new Error('Session expired');
  }
  const json = await res.json();
  saveAuth(json.data);
  return json.data.accessToken;
}

export async function api<T>(path: string, options: ApiOptions = {}): Promise<T> {
  const { auth, ...fetchOptions } = options;
  const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;

  let response = await fetch(`${API_URL}${path}`, {
    ...fetchOptions,
    headers: {
      'Content-Type': 'application/json',
      ...(auth && token ? { Authorization: `Bearer ${token}` } : {}),
      ...(fetchOptions.headers ?? {}),
    },
    next: { revalidate: 60 }
  });

  // 🔥 Auto-refresh on 401
  if (response.status === 401 && auth && typeof window !== 'undefined') {
    if (!isRefreshing) {
      isRefreshing = true;
      refreshPromise = refreshAccessToken().finally(() => {
        isRefreshing = false;
        refreshPromise = null;
      });
    }
    try {
      const newToken = await refreshPromise!;
      response = await fetch(`${API_URL}${path}`, {
        ...fetchOptions,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${newToken}`,
          ...(fetchOptions.headers ?? {}),
        },
      });
    } catch {
      
    }
  }

  const json = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(json.message ?? 'Request failed');
  return json.data as T;
}

export function saveAuth(data: { accessToken: string; refreshToken: string }) {
  localStorage.setItem('accessToken', data.accessToken);
  localStorage.setItem('refreshToken', data.refreshToken);
}

export function logout() {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
}