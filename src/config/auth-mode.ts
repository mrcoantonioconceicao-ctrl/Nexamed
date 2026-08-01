export interface UserSession {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar: string;
  unit: string;
}

export const DEFAULT_DEMO_USER: UserSession = {
  id: 'usr-1',
  name: 'Dr. Fernando Alencar',
  email: 'fernando.alencar@nexamed.com.br',
  role: 'Médico Psiquiatra / Coordenador Clínico',
  avatar: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=120&auto=format&fit=crop&q=80',
  unit: 'Unidade Jardim Paulista',
};

export function isAuthEnabled(): boolean {
  // Check VITE_AUTH_ENABLED environment variable
  const envVal = import.meta.env.VITE_AUTH_ENABLED;
  if (envVal === 'true') return true;
  if (envVal === 'false') return false;
  return false; // Default to false (demo mode active)
}

export function getCurrentUser(): UserSession | null {
  const stored = localStorage.getItem('nexamed_user');
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      // ignore
    }
  }
  // In demo mode or fallback, return demo user
  if (!isAuthEnabled()) {
    return DEFAULT_DEMO_USER;
  }
  return null;
}

export function setCurrentUser(user: UserSession | null): void {
  if (user) {
    localStorage.setItem('nexamed_user', JSON.stringify(user));
  } else {
    localStorage.removeItem('nexamed_user');
  }
}
