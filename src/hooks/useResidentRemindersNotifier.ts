import { useEffect, useRef } from 'react';
import { ResidentReminder } from '../types';
import { playReminderNotificationChime, sendBrowserReminderNotification } from '../utils/reminderService';

interface UseResidentRemindersNotifierProps {
  reminders: ResidentReminder[];
  onOpenResident?: (residentId: string) => void;
}

export function useResidentRemindersNotifier({
  reminders,
  onOpenResident
}: UseResidentRemindersNotifierProps) {
  const lastTriggeredMap = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Check periodically for upcoming reminders (every 60s)
    const checkReminders = () => {
      const todayPtBr = new Date().toLocaleDateString('pt-BR');
      const now = new Date();
      const currentHours = now.getHours();
      const currentMinutes = now.getMinutes();
      const currentTotalMinutes = currentHours * 60 + currentMinutes;

      reminders.forEach((rem) => {
        if (rem.completed || !rem.notifyTeam) return;

        const isToday = rem.date === todayPtBr || rem.date === now.toISOString().split('T')[0];
        if (!isToday) return;

        // Parse reminder time (HH:mm)
        const [remHourStr, remMinStr] = (rem.time || '00:00').split(':');
        const remHour = parseInt(remHourStr, 10);
        const remMin = parseInt(remMinStr, 10);
        if (isNaN(remHour) || isNaN(remMin)) return;

        const reminderTotalMinutes = remHour * 60 + remMin;
        const diffMinutes = reminderTotalMinutes - currentTotalMinutes;

        // Trigger notification if due within 30 minutes or currently at time, and hasn't been triggered in this session
        const reminderKey = `${rem.id}-${rem.date}-${rem.time}`;
        if (diffMinutes <= 30 && diffMinutes >= -60 && !lastTriggeredMap.current.has(reminderKey)) {
          lastTriggeredMap.current.add(reminderKey);

          playReminderNotificationChime();
          sendBrowserReminderNotification(rem, () => {
            if (onOpenResident) {
              onOpenResident(rem.residentId);
            }
          });
        }
      });
    };

    checkReminders();
    const interval = setInterval(checkReminders, 60000);

    return () => clearInterval(interval);
  }, [reminders, onOpenResident]);
}
