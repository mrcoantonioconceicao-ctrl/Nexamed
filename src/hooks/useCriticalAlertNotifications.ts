import { useEffect, useState, useRef, useCallback } from 'react';
import { Resident } from '../types';

export interface UseCriticalAlertNotificationsReturn {
  permission: NotificationPermission;
  isSupported: boolean;
  requestPermission: () => Promise<NotificationPermission>;
  sendTestAlert: () => void;
  criticalResidentsCount: number;
}

// Emite um sinal sonoro de emergência médica usando Web Audio API
function playEmergencyAudioBeep() {
  try {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    
    // Pulso duplo de frequência de alerta (880Hz / 1200Hz)
    const now = ctx.currentTime;
    
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sawtooth';
    osc1.frequency.setValueAtTime(880, now);
    osc1.frequency.setValueAtTime(1200, now + 0.15);
    osc1.frequency.setValueAtTime(880, now + 0.3);
    
    gain1.gain.setValueAtTime(0.3, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.6);
    
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    
    osc1.start(now);
    osc1.stop(now + 0.6);
  } catch (err) {
    console.warn('Erro ao reproduzir áudio de emergência:', err);
  }
}

export function useCriticalAlertNotifications(
  residents: Resident[],
  onSelectResident?: (resident: Resident) => void
): UseCriticalAlertNotificationsReturn {
  const [permission, setPermission] = useState<NotificationPermission>(
    typeof window !== 'undefined' && 'Notification' in window ? Notification.permission : 'denied'
  );
  const [swRegistration, setSwRegistration] = useState<ServiceWorkerRegistration | null>(null);
  const isSupported = typeof window !== 'undefined' && 'Notification' in window && 'serviceWorker' in navigator;

  // Guarda histórico de residentes já notificados no estado 'Crítico'
  const lastNotifiedMapRef = useRef<Map<string, { score?: number; lastAfericao?: string; timestamp: number }>>(new Map());

  // Registrar o Service Worker ao montar
  useEffect(() => {
    if (!isSupported) return;

    // Listener de mensagens do Service Worker (ex: clique na notificação)
    const handleSwMessage = (event: MessageEvent) => {
      if (event.data && event.data.type === 'NAVIGATE_TO_RESIDENT') {
        const resId = event.data.residentId;
        if (resId && onSelectResident) {
          const found = residents.find(r => r.id === resId);
          if (found) onSelectResident(found);
        }
      }
    };

    navigator.serviceWorker.addEventListener('message', handleSwMessage);

    navigator.serviceWorker.register('/sw.js')
      .then((reg) => {
        setSwRegistration(reg);
        console.log('[SW] Service Worker de Alertas Críticos registrado com sucesso:', reg.scope);
      })
      .catch((err) => {
        console.warn('[SW] Não foi possível registrar Service Worker, usaremos a Notification API direta:', err);
      });

    return () => {
      navigator.serviceWorker.removeEventListener('message', handleSwMessage);
    };
  }, [isSupported, residents, onSelectResident]);

  // Função para solicitar permissão do navegador
  const requestPermission = useCallback(async () => {
    if (!isSupported) return 'denied';
    try {
      const res = await Notification.requestPermission();
      setPermission(res);
      return res;
    } catch (e) {
      console.error('Erro ao pedir permissão de notificação:', e);
      return 'denied';
    }
  }, [isSupported]);

  // Função disparadora de notificação
  const triggerNotification = useCallback((title: string, body: string, residentId?: string) => {
    playEmergencyAudioBeep();

    const notificationOptions: NotificationOptions = {
      body,
      icon: '/favicon.ico',
      tag: `critical-${residentId || 'alert'}-${Date.now()}`,
      requireInteraction: true,
      data: { residentId },
      silent: false
    };

    // Tenta disparar via Service Worker (melhor compatibilidade em background)
    if (swRegistration && swRegistration.active) {
      swRegistration.active.postMessage({
        type: 'SHOW_CRITICAL_ALERT',
        title,
        options: notificationOptions
      });
    } else if (swRegistration && 'showNotification' in swRegistration) {
      swRegistration.showNotification(title, notificationOptions);
    } else if (Notification.permission === 'granted') {
      const n = new Notification(title, notificationOptions);
      n.onclick = () => {
        window.focus();
        if (residentId && onSelectResident) {
          const res = residents.find(r => r.id === residentId);
          if (res) onSelectResident(res);
        }
      };
    }
  }, [swRegistration, residents, onSelectResident]);

  // Monitora a lista de residentes buscando alterações para estado 'Crítico'
  const criticalResidents = residents.filter(
    r => r.riskScore === 'Crítico' || r.news2?.riskLevel === 'Crítico'
  );

  useEffect(() => {
    if (permission !== 'granted') return;

    criticalResidents.forEach((resident) => {
      const currentScore = resident.news2?.totalScore || 0;
      const lastAfericao = resident.vitals?.lastAfericao || '';
      const lastNotified = lastNotifiedMapRef.current.get(resident.id);

      // Dispara se é um novo residente crítico OU se o score/vitals mudaram
      const isNew = !lastNotified;
      const hasUpdatedVitals = lastNotified && (lastNotified.score !== currentScore || lastNotified.lastAfericao !== lastAfericao);

      if (isNew || hasUpdatedVitals) {
        lastNotifiedMapRef.current.set(resident.id, {
          score: currentScore,
          lastAfericao,
          timestamp: Date.now()
        });

        const isBackground = typeof document !== 'undefined' && document.hidden;
        const bgPrefix = isBackground ? '📱 [BACKGROUND] ' : '🚨 ';

        const bp = resident.vitals?.bp || 'N/A';
        const hr = resident.vitals?.hr || 0;
        const spo2 = resident.vitals?.spo2 || 0;
        const title = `${bgPrefix}ALERTA CRÍTICO: ${resident.name} (${resident.room})`;
        const body = `NEWS2: ${currentScore} pts | PA: ${bp}, FC: ${hr}bpm, SpO2: ${spo2}%. Atendimento de enfermagem imediato requerido.`;

        triggerNotification(title, body, resident.id);
      }
    });

    // Limpa do mapa residentes que saíram do estado 'Crítico'
    const currentCriticalIds = new Set(criticalResidents.map(r => r.id));
    for (const id of lastNotifiedMapRef.current.keys()) {
      if (!currentCriticalIds.has(id)) {
        lastNotifiedMapRef.current.delete(id);
      }
    }
  }, [criticalResidents, permission, triggerNotification]);

  // Alerta de teste manual para validação da equipe de enfermagem
  const sendTestAlert = useCallback(() => {
    if (permission !== 'granted') {
      requestPermission().then((p) => {
        if (p === 'granted') {
          triggerNotification(
            '🚨 [TESTE DE ALERTA] Sistema de Enfermagem Nexa',
            'Sua conexão com o sistema de notificações push para residentes em estado Crítico está ativa e funcionando perfeitamente em background.'
          );
        }
      });
    } else {
      triggerNotification(
        '🚨 [TESTE DE ALERTA] Sistema de Enfermagem Nexa',
        'Sua conexão com o sistema de notificações push para residentes em estado Crítico está ativa e funcionando perfeitamente em background.'
      );
    }
  }, [permission, requestPermission, triggerNotification]);

  return {
    permission,
    isSupported,
    requestPermission,
    sendTestAlert,
    criticalResidentsCount: criticalResidents.length
  };
}
