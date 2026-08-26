import { useState, useEffect, useCallback, useRef } from 'react';
import { 
  Resident, 
  ClinicalEvolution, 
  MedicationMAR, 
  HandoverLog, 
  AuditLogEntry, 
  FunctionalScaleAssessment, 
  AppointmentRecord, 
  PASRecord,
  BackupSnapshot 
} from '../types';
import { subscribeBackups, deleteBackupFromDb } from '../lib/firebase';
import { 
  executeAndSaveBackupSnapshot, 
  downloadJsonFile, 
  openPdfPrintWindow,
  buildReadableBackupPayload,
  generateReadablePdfHtml 
} from '../utils/backupExportService';

interface UseDailyBackupSchedulerProps {
  residents: Resident[];
  evolutions: ClinicalEvolution[];
  medications: MedicationMAR[];
  handovers: HandoverLog[];
  auditLogs?: AuditLogEntry[];
  functionalScales?: FunctionalScaleAssessment[];
  appointments?: AppointmentRecord[];
  pasRecords?: PASRecord[];
  currentUser?: { name: string; role: string };
}

export function useDailyBackupScheduler({
  residents,
  evolutions,
  medications,
  handovers,
  auditLogs = [],
  functionalScales = [],
  appointments = [],
  pasRecords = [],
  currentUser
}: UseDailyBackupSchedulerProps) {
  const [backups, setBackups] = useState<BackupSnapshot[]>([]);
  const [isBackingUp, setIsBackingUp] = useState<boolean>(false);
  const [lastBackupDate, setLastBackupDate] = useState<string>(() => {
    return localStorage.getItem('nexamed_last_backup_date') || '';
  });
  const [lastBackupTime, setLastBackupTime] = useState<string>(() => {
    return localStorage.getItem('nexamed_last_backup_time') || '';
  });
  const [nextRunCountdown, setNextRunCountdown] = useState<string>('');
  const isExecutingRef = useRef(false);

  // Subscribe to real-time backups from Firestore
  useEffect(() => {
    const unsub = subscribeBackups((dbBackups) => {
      if (dbBackups && dbBackups.length > 0) {
        setBackups(dbBackups);
        setLastBackupDate(dbBackups[0].date);
        setLastBackupTime(dbBackups[0].time);
      } else {
        // Fallback to local storage
        try {
          const cached = localStorage.getItem('nexamed_backup_history');
          if (cached) setBackups(JSON.parse(cached));
        } catch {
          // ignore
        }
      }
    });

    return () => unsub();
  }, []);

  // Update countdown to 00:00 midnight every second
  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date();
      const nextMidnight = new Date();
      nextMidnight.setHours(24, 0, 0, 0);
      const diffMs = nextMidnight.getTime() - now.getTime();
      const hours = Math.floor(diffMs / (1000 * 60 * 60));
      const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diffMs % (1000 * 60)) / 1000);
      setNextRunCountdown(`${hours}h ${minutes}m ${seconds}s`);
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, []);

  // Trigger manual or automatic backup
  const runBackup = useCallback(async (
    triggerType: 'AUTOMATIC_DAILY_MIDNIGHT' | 'MANUAL_ON_DEMAND' = 'MANUAL_ON_DEMAND'
  ) => {
    if (isExecutingRef.current) return;
    isExecutingRef.current = true;
    setIsBackingUp(true);

    try {
      const executedBy = currentUser ? `${currentUser.name} (${currentUser.role})` : undefined;
      const snapshot = await executeAndSaveBackupSnapshot({
        residents,
        evolutions,
        medications,
        handovers,
        auditLogs,
        functionalScales,
        appointments,
        pasRecords,
        triggerType,
        executedBy
      });

      setBackups(prev => [snapshot, ...prev.filter(b => b.id !== snapshot.id)]);
      setLastBackupDate(snapshot.date);
      setLastBackupTime(snapshot.time);
      return snapshot;
    } catch (err) {
      console.error('Error running backup snapshot:', err);
      throw err;
    } finally {
      setIsBackingUp(false);
      isExecutingRef.current = false;
    }
  }, [residents, evolutions, medications, handovers, auditLogs, functionalScales, appointments, pasRecords, currentUser]);

  // Check 00:00 midnight schedule every 30 seconds
  useEffect(() => {
    const checkMidnightSchedule = () => {
      const now = new Date();
      const todayStr = now.toISOString().split('T')[0];
      const storedLastDate = localStorage.getItem('nexamed_last_backup_date');

      // If we have resident data and today has not yet executed a daily backup
      if (residents.length > 0 && storedLastDate !== todayStr && !isExecutingRef.current) {
        console.log(`[Backup Engine] ⏰ Executando backup diário de redundância para o piloto (${todayStr} às 00:00)...`);
        runBackup('AUTOMATIC_DAILY_MIDNIGHT').catch(err => {
          console.warn('Auto backup notification:', err);
        });
      }
    };

    // Check on startup
    const timer = setTimeout(checkMidnightSchedule, 2000);
    const interval = setInterval(checkMidnightSchedule, 30000);

    return () => {
      clearTimeout(timer);
      clearInterval(interval);
    };
  }, [residents.length, runBackup]);

  // Download JSON handler
  const handleDownloadJson = useCallback((backup: BackupSnapshot) => {
    if (backup.payloadJson) {
      downloadJsonFile(backup.fileName, backup.payloadJson);
    } else {
      // Re-generate on demand if payload was truncated in memory
      const payload = buildReadableBackupPayload({
        residents,
        evolutions,
        medications,
        handovers,
        auditLogs,
        functionalScales,
        appointments,
        pasRecords,
        customDate: backup.date,
        customTime: backup.time,
        triggerType: backup.type
      });
      downloadJsonFile(backup.fileName, JSON.stringify(payload, null, 2));
    }
  }, [residents, evolutions, medications, handovers, auditLogs, functionalScales, appointments, pasRecords]);

  // Print/Download PDF handler
  const handlePrintOrDownloadPdf = useCallback((backup: BackupSnapshot) => {
    if (backup.pdfHtmlExport) {
      openPdfPrintWindow(backup.pdfHtmlExport);
    } else {
      const payload = buildReadableBackupPayload({
        residents,
        evolutions,
        medications,
        handovers,
        auditLogs,
        functionalScales,
        appointments,
        pasRecords,
        customDate: backup.date,
        customTime: backup.time,
        triggerType: backup.type
      });
      const html = generateReadablePdfHtml(payload);
      openPdfPrintWindow(html);
    }
  }, [residents, evolutions, medications, handovers, auditLogs, functionalScales, appointments, pasRecords]);

  // Delete backup
  const handleDeleteBackup = useCallback(async (backupId: string) => {
    try {
      await deleteBackupFromDb(backupId);
      setBackups(prev => prev.filter(b => b.id !== backupId));
      const localCached = localStorage.getItem('nexamed_backup_history');
      if (localCached) {
        const parsed: BackupSnapshot[] = JSON.parse(localCached);
        localStorage.setItem('nexamed_backup_history', JSON.stringify(parsed.filter(b => b.id !== backupId)));
      }
    } catch (e) {
      console.error('Error deleting backup:', e);
    }
  }, []);

  return {
    backups,
    isBackingUp,
    lastBackupDate,
    lastBackupTime,
    nextRunCountdown,
    runBackup,
    handleDownloadJson,
    handlePrintOrDownloadPdf,
    handleDeleteBackup
  };
}
