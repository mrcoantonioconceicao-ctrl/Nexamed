import { useState, useEffect, useCallback, useRef } from 'react';
import { Resident, ClinicalEvolution, MedicationMAR } from '../types';
import { 
  registerServiceWorker, 
  syncClinicalDataToServiceWorker, 
  getCachedClinicalData,
  OfflineCacheStats,
  CachedClinicalData
} from '../utils/offlineSync';

interface UseOfflineSyncProps {
  residents: Resident[];
  evolutions: ClinicalEvolution[];
  medications: MedicationMAR[];
  onRestoreOfflineData?: (data: CachedClinicalData) => void;
}

export function useOfflineSync({
  residents,
  evolutions,
  medications,
  onRestoreOfflineData
}: UseOfflineSyncProps) {
  const [isOnline, setIsOnline] = useState<boolean>(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );
  const [lastSyncedAt, setLastSyncedAt] = useState<string | null>(null);
  const [isServiceWorkerActive, setIsServiceWorkerActive] = useState<boolean>(false);
  const [showOfflineToast, setShowOfflineToast] = useState<boolean>(false);
  const [showOnlineToast, setShowOnlineToast] = useState<boolean>(false);
  const syncTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Inicialização e registro do Service Worker
  useEffect(() => {
    let mounted = true;

    registerServiceWorker().then((reg) => {
      if (mounted && reg) {
        setIsServiceWorkerActive(true);
      }
    });

    const handleOnline = () => {
      setIsOnline(true);
      setShowOnlineToast(true);
      setShowOfflineToast(false);
      setTimeout(() => setShowOnlineToast(false), 4000);
      // Re-sincroniza ao retornar a conexão
      syncClinicalDataToServiceWorker(residents, evolutions, medications);
    };

    const handleOffline = async () => {
      setIsOnline(false);
      setShowOfflineToast(true);
      setShowOnlineToast(false);

      // Se por algum motivo os arrays estiverem vazios no estado da memória, restaura do cache local
      if (residents.length === 0 && evolutions.length === 0 && medications.length === 0 && onRestoreOfflineData) {
        const cached = await getCachedClinicalData();
        if (cached) {
          onRestoreOfflineData(cached);
        }
      }
    };

    const handleSwMessage = (event: MessageEvent) => {
      if (event.data && event.data.type === 'CLINICAL_DATA_CACHED_CONFIRM') {
        setLastSyncedAt(event.data.lastSyncedAt);
      }
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    if (typeof navigator !== 'undefined' && 'serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('message', handleSwMessage);
    }

    return () => {
      mounted = false;
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      if (typeof navigator !== 'undefined' && 'serviceWorker' in navigator) {
        navigator.serviceWorker.removeEventListener('message', handleSwMessage);
      }
    };
  }, []);

  // Sincronização automática contínua de Prontuários e Medicamentos para o Service Worker
  useEffect(() => {
    if (syncTimeoutRef.current) {
      clearTimeout(syncTimeoutRef.current);
    }

    syncTimeoutRef.current = setTimeout(() => {
      syncClinicalDataToServiceWorker(residents, evolutions, medications).then((success) => {
        if (success) {
          setLastSyncedAt(new Date().toISOString());
        }
      });
    }, 600);

    return () => {
      if (syncTimeoutRef.current) {
        clearTimeout(syncTimeoutRef.current);
      }
    };
  }, [residents, evolutions, medications]);

  const forceSync = useCallback(async () => {
    const success = await syncClinicalDataToServiceWorker(residents, evolutions, medications);
    const now = new Date().toISOString();
    setLastSyncedAt(now);
    return success;
  }, [residents, evolutions, medications]);

  return {
    isOnline,
    isServiceWorkerActive,
    lastSyncedAt,
    showOfflineToast,
    showOnlineToast,
    dismissOfflineToast: () => setShowOfflineToast(false),
    dismissOnlineToast: () => setShowOnlineToast(false),
    forceSync,
    counts: {
      residents: residents?.length || 0,
      evolutions: evolutions?.length || 0,
      medications: medications?.length || 0
    },
    cachedCounts: {
      residents: residents?.length || 0,
      evolutions: evolutions?.length || 0,
      medications: medications?.length || 0
    }
  };
}
