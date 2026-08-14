import { Resident, ClinicalEvolution, MedicationMAR } from '../types';

export interface CachedClinicalData {
  residents: Resident[];
  evolutions: ClinicalEvolution[];
  medications: MedicationMAR[];
  lastSyncedAt: string;
  version: string;
}

export interface OfflineCacheStats {
  isServiceWorkerReady: boolean;
  isOnline: boolean;
  lastSyncedAt: string | null;
  cachedResidentsCount: number;
  cachedEvolutionsCount: number;
  cachedMedicationsCount: number;
}

const LOCAL_STORAGE_BACKUP_KEY = 'nexamed_offline_clinical_cache_v2';

/**
 * Registra o Service Worker e garante que esteja ativo
 */
export async function registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    return null;
  }

  try {
    const registration = await navigator.serviceWorker.register('/sw.js', {
      scope: '/'
    });

    if (registration.installing) {
      console.log('[SW] Service Worker instalando...');
    } else if (registration.waiting) {
      console.log('[SW] Service Worker em espera...');
    } else if (registration.active) {
      console.log('[SW] Service Worker ativo para cache offline de prontuários');
    }

    return registration;
  } catch (err) {
    console.warn('[SW] Falha ao registrar Service Worker:', err);
    return null;
  }
}

/**
 * Envia o snapshot de dados clínicos (prontuários e medicamentos) para o Service Worker armazenar no CacheStorage
 */
export async function syncClinicalDataToServiceWorker(
  residents: Resident[],
  evolutions: ClinicalEvolution[],
  medications: MedicationMAR[]
): Promise<boolean> {
  const timestamp = new Date().toISOString();

  // 1. Sempre grava no backup local redundante
  try {
    const payload: CachedClinicalData = {
      residents,
      evolutions,
      medications,
      lastSyncedAt: timestamp,
      version: 'v2'
    };
    localStorage.setItem(LOCAL_STORAGE_BACKUP_KEY, JSON.stringify(payload));
  } catch (e) {
    console.warn('Erro ao salvar cópia local redundante:', e);
  }

  // 2. Envia para o Service Worker armazenar no CacheStorage
  if (typeof window !== 'undefined' && 'serviceWorker' in navigator && navigator.serviceWorker.controller) {
    try {
      navigator.serviceWorker.controller.postMessage({
        type: 'CACHE_CLINICAL_DATA',
        payload: {
          residents,
          evolutions,
          medications,
          lastSyncedAt: timestamp
        }
      });
      return true;
    } catch (err) {
      console.warn('[SW] Falha no postMessage para SW:', err);
    }
  }

  return false;
}

/**
 * Recupera os dados clínicos armazenados em cache quando a conexão cair
 */
export async function getCachedClinicalData(): Promise<CachedClinicalData | null> {
  // 1. Tenta recuperar via Service Worker Cache API
  if (typeof window !== 'undefined' && 'caches' in window) {
    try {
      const cache = await caches.open('nexamed-clinical-data-v2');
      const res = await cache.match('/api/offline/clinical-data');
      if (res) {
        const data = await res.json();
        if (data && (data.residents || data.evolutions || data.medications)) {
          return data as CachedClinicalData;
        }
      }
    } catch (e) {
      console.warn('[SW Cache] Erro ao ler CacheStorage:', e);
    }
  }

  // 2. Fallback redundante para LocalStorage
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_BACKUP_KEY);
    if (raw) {
      return JSON.parse(raw) as CachedClinicalData;
    }
  } catch (e) {
    console.warn('Erro ao ler fallback local:', e);
  }

  return null;
}

/**
 * Consulta estatísticas do cache offline atual
 */
export async function getOfflineCacheStats(): Promise<OfflineCacheStats> {
  const isOnline = typeof navigator !== 'undefined' ? navigator.onLine : true;
  const isServiceWorkerReady = typeof navigator !== 'undefined' && 'serviceWorker' in navigator && !!navigator.serviceWorker.controller;

  const data = await getCachedClinicalData();

  return {
    isServiceWorkerReady,
    isOnline,
    lastSyncedAt: data?.lastSyncedAt || null,
    cachedResidentsCount: data?.residents?.length || 0,
    cachedEvolutionsCount: data?.evolutions?.length || 0,
    cachedMedicationsCount: data?.medications?.length || 0,
  };
}
