import React, { useState, useEffect } from 'react';
import { Sparkles } from 'lucide-react';
import { 
  INITIAL_RESIDENTS, 
  INITIAL_EVOLUTIONS, 
  INITIAL_MEDICATIONS, 
  INITIAL_ROSTER, 
  INITIAL_HANDOVERS, 
  INITIAL_ALERTS,
  INITIAL_TIMELINE_360,
  INITIAL_FINANCIAL_RECORDS,
  INITIAL_INVENTORY,
  INITIAL_LAB_RESULTS,
  INITIAL_OCR_DOCS,
  INITIAL_BPMN_WORKFLOWS,
  INITIAL_QUALITY_METRICS,
  INITIAL_FAMILY_NOTES,
  INITIAL_STAFF_TRAININGS,
  INITIAL_AUDIT_LOGS
} from './data/mockData';
import { 
  Resident, 
  ClinicalEvolution, 
  MedicationMAR, 
  StaffRoster, 
  HandoverLog, 
  ClinicalAlert, 
  DoseStatus,
  OccurrenceItem,
  Timeline360Event,
  FinancialRecord,
  InventoryItem,
  LabResult,
  OCRDocument,
  BPMNWorkflowInstance,
  QualityMetric,
  FamilyNote,
  StaffTraining,
  AuditLogEntry
} from './types';
import { calculateNEWS2Risk } from './utils/news2Calculator';
import { parseBloodPressure, extractFirstKeyword } from './utils/textParser';
import { useCriticalAlertNotifications } from './hooks/useCriticalAlertNotifications';
import { getCurrentUser, isAuthEnabled } from './config/auth-mode';
import { 
  subscribeEvolutions, 
  saveEvolutionToDb, 
  subscribeResidents, 
  saveResidentToDb, 
  subscribeHandovers, 
  saveHandoverToDb, 
  subscribeMedications, 
  saveMedicationToDb 
} from './lib/firebase';

import { NavbarHeader } from './components/NavbarHeader';
import { AppSidebar } from './components/AppSidebar';
import { NexaAssistantWidget } from './components/NexaAssistantWidget';
import { SOAPEditorModal } from './components/SOAPEditorModal';
import { ResidentDetailModal } from './components/ResidentDetailModal';
import { Resident360ViewModal } from './components/Resident360ViewModal';
import { LGPDAndCookieManager } from './components/LGPDAndCookieManager';
import { IoTVitalsTelemetryModal } from './components/IoTVitalsTelemetryModal';
import { CommandPaletteModal } from './components/CommandPaletteModal';
import { TelehealthModal } from './components/TelehealthModal';
import { SmartHandoverModal, PendingAuditItem } from './components/SmartHandoverModal';

import { DashboardView } from './views/DashboardView';
import { ResidentesView } from './views/ResidentesView';
import { ProntuariosView } from './views/ProntuariosView';
import { MedicacaoView } from './views/MedicacaoView';
import { EscalasView } from './views/EscalasView';
import { PlantaoView } from './views/PlantaoView';
import { RelatoriosView } from './views/RelatoriosView';
import { EnterpriseOpsView } from './views/EnterpriseOpsView';
import { EvolucaoMedicacaoView } from './views/EvolucaoMedicacaoView';
import { ResidencialGuiaView } from './views/ResidencialGuiaView';
import { AuthView } from './views/AuthView';

export default function App() {
  // Navigation State
  const [currentPath, setCurrentPath] = useState<string>('/dashboard');

  // Core Data States
  const [residents, setResidents] = useState<Resident[]>(INITIAL_RESIDENTS);
  const [evolutions, setEvolutions] = useState<ClinicalEvolution[]>(INITIAL_EVOLUTIONS);
  const [medications, setMedications] = useState<MedicationMAR[]>(INITIAL_MEDICATIONS);
  const [roster, setRoster] = useState<StaffRoster[]>(INITIAL_ROSTER);
  const [handovers, setHandovers] = useState<HandoverLog[]>(INITIAL_HANDOVERS);
  const [alerts, setAlerts] = useState<ClinicalAlert[]>(INITIAL_ALERTS);

  // Firestore Real-time Persistence Effect
  useEffect(() => {
    const unsubEvo = subscribeEvolutions(setEvolutions, INITIAL_EVOLUTIONS);
    const unsubRes = subscribeResidents(setResidents, INITIAL_RESIDENTS);
    const unsubHan = subscribeHandovers(setHandovers, INITIAL_HANDOVERS);
    const unsubMed = subscribeMedications(setMedications, INITIAL_MEDICATIONS);

    return () => {
      unsubEvo();
      unsubRes();
      unsubHan();
      unsubMed();
    };
  }, []);
  const [timelineEvents, setTimelineEvents] = useState<Timeline360Event[]>(INITIAL_TIMELINE_360);
  const [financialRecords, setFinancialRecords] = useState<FinancialRecord[]>(INITIAL_FINANCIAL_RECORDS);
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>(INITIAL_INVENTORY);
  const [labResults, setLabResults] = useState<LabResult[]>(INITIAL_LAB_RESULTS);
  const [ocrDocuments, setOcrDocuments] = useState<OCRDocument[]>(INITIAL_OCR_DOCS);
  const [bpmnWorkflows, setBpmnWorkflows] = useState<BPMNWorkflowInstance[]>(INITIAL_BPMN_WORKFLOWS);
  const [qualityMetrics, setQualityMetrics] = useState<QualityMetric[]>(INITIAL_QUALITY_METRICS);
  const [familyNotes, setFamilyNotes] = useState<FamilyNote[]>(INITIAL_FAMILY_NOTES);
  const [staffTrainings, setStaffTrainings] = useState<StaffTraining[]>(INITIAL_STAFF_TRAININGS);
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>(INITIAL_AUDIT_LOGS);

  // Modal & Drawer States
  const [isNexaChatOpen, setIsNexaChatOpen] = useState(false);
  const [isCommandBarOpen, setIsCommandBarOpen] = useState(false);
  const [isSOAPModalOpen, setIsSOAPModalOpen] = useState(false);
  const [isLGPDModalOpen, setIsLGPDModalOpen] = useState(false);
  const [initialResidentIdForSOAP, setInitialResidentIdForSOAP] = useState<string | undefined>();
  const [selectedResidentForDetail, setSelectedResidentForDetail] = useState<Resident | null>(null);
  const [selectedResidentFor360, setSelectedResidentFor360] = useState<Resident | null>(null);
  const [selectedResidentForIoT, setSelectedResidentForIoT] = useState<Resident | null>(null);
  const [selectedResidentForTelehealth, setSelectedResidentForTelehealth] = useState<Resident | null>(null);

  // Smart Handover State
  const [isSmartHandoverOpen, setIsSmartHandoverOpen] = useState(false);
  const [smartHandoverMode, setSmartHandoverMode] = useState<'ASSUMIR_PLANTAO' | 'ENCERRAR_PLANTAO'>('ASSUMIR_PLANTAO');

  const handleOpenInboundHandover = () => {
    setSmartHandoverMode('ASSUMIR_PLANTAO');
    setIsSmartHandoverOpen(true);
  };

  const handleOpenOutboundHandover = () => {
    setSmartHandoverMode('ENCERRAR_PLANTAO');
    setIsSmartHandoverOpen(true);
  };

  const handleResolvePendingDirectly = (item: PendingAuditItem) => {
    setIsSmartHandoverOpen(false);
    if (item.actionType === 'open_soap') {
      setInitialResidentIdForSOAP(item.residentId);
      setIsSOAPModalOpen(true);
    } else if (item.actionType === 'open_mar') {
      setCurrentPath('/medicacao');
    } else if (item.actionType === 'open_vitals') {
      const res = residents.find(r => r.id === item.residentId);
      if (res) setSelectedResidentForIoT(res);
    } else if (item.actionType === 'open_detail') {
      const res = residents.find(r => r.id === item.residentId);
      if (res) setSelectedResidentForDetail(res);
    }
  };

  // Handle IoT Vitals update & NEWS2 automatic risk calculation
  const handleUpdateVitals = (residentId: string, updatedVitals: any) => {
    // Extract numerical vitals safely without raw regex/splits
    const parsedBP = parseBloodPressure(updatedVitals.bp);
    const systolicBP = typeof updatedVitals.systolicBP === 'number' 
      ? updatedVitals.systolicBP 
      : parsedBP.systolic;

    const diastolicBP = typeof updatedVitals.diastolicBP === 'number'
      ? updatedVitals.diastolicBP
      : parsedBP.diastolic;

    const heartRate = Number(updatedVitals.heartRate || updatedVitals.hr || 75);
    const temp = Number(updatedVitals.temp || 36.5);
    const spO2 = Number(updatedVitals.spO2 || updatedVitals.spo2 || 98);
    const respRate = Number(updatedVitals.respRate || 16);
    const consciousness = updatedVitals.consciousness || 'Alerta';
    const supplementalO2 = Boolean(updatedVitals.supplementalO2);

    // Calculate NEWS2 using dedicated utility
    const news2Calc = calculateNEWS2Risk({
      systolicBP,
      diastolicBP,
      heartRate,
      temp,
      spO2,
      respRate,
      consciousness,
      supplementalO2
    });

    setResidents(prev => prev.map(res => {
      if (res.id !== residentId) return res;
      return {
        ...res,
        vitals: {
          bp: `${systolicBP}/${diastolicBP}`,
          hr: heartRate,
          temp: temp,
          spo2: spO2,
          respRate: respRate,
          lastAfericao: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        },
        riskScore: news2Calc.riskLevel === 'Crítico' ? 'Alto' : news2Calc.riskLevel === 'Alto' ? 'Alto' : news2Calc.riskLevel === 'Moderado' ? 'Médio' : 'Baixo',
        news2: {
          totalScore: news2Calc.totalScore,
          riskLevel: news2Calc.riskLevel,
          actionRequired: news2Calc.recommendedAction,
          lastCalculated: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      };
    }));

    // Generate clinical alert if NEWS2 is high or critical
    if (news2Calc.riskLevel === 'Alto' || news2Calc.riskLevel === 'Crítico') {
      const resName = residents.find(r => r.id === residentId)?.name || 'Residente';
      const newAlert: ClinicalAlert = {
        id: `alt-news2-${Date.now()}`,
        residentId,
        residentName: resName,
        type: 'Sinal Vital Alterado',
        severity: news2Calc.riskLevel === 'Crítico' ? 'Crítico' : 'Alto',
        message: `Escore NEWS2 Elevado (${news2Calc.totalScore} pontos - ${news2Calc.riskLevel}): ${news2Calc.recommendedAction}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        read: false
      };
      setAlerts(prev => [newAlert, ...prev]);
    }

    // Append to Audit Logs
    const newAuditLog: AuditLogEntry = {
      id: `audit-${Date.now()}`,
      userId: 'usr-current',
      userName: 'Enf. Mariana Castro',
      userRole: 'Enfermeiro RT',
      action: 'Edição',
      resource: `Telemetria IoT Beira-Leito (NEWS2 = ${news2Calc.totalScore} - ${news2Calc.riskLevel})`,
      ipAddress: '192.168.1.104',
      timestamp: new Date().toLocaleString('pt-BR'),
      reason: 'Atualização Automática de Risco NEWS2 em Tempo Real'
    };
    setAuditLogs(prev => [newAuditLog, ...prev]);
  };

  // Check auth requirement on mount or path change
  useEffect(() => {
    const user = getCurrentUser();
    if (isAuthEnabled() && !user && currentPath !== '/auth') {
      setCurrentPath('/auth');
    }
  }, [currentPath]);

  // Command bar event listener
  useEffect(() => {
    const handleToggleCommandBar = () => setIsCommandBarOpen(prev => !prev);
    window.addEventListener('toggle-command-bar', handleToggleCommandBar);
    return () => window.removeEventListener('toggle-command-bar', handleToggleCommandBar);
  }, []);

  // Dose Check-off Handler with Automatic Stock Consumption (Baixa Automática de Medicação)
  const handleUpdateDoseStatus = (medicationId: string, doseId: string, newStatus: DoseStatus, notes?: string) => {
    let targetMedName = '';
    let targetResidentId = '';
    let targetResidentName = '';
    let isStockDeducted = false;

    setMedications(prevMeds =>
      prevMeds.map(med => {
        if (med.id !== medicationId) return med;
        
        targetMedName = med.medicationName;
        targetResidentId = med.residentId;
        targetResidentName = med.residentName;

        const currentDose = med.scheduledDoses.find(d => d.id === doseId);
        const wasMinistrado = currentDose?.status === 'Ministrado';
        const isNowMinistrado = newStatus === 'Ministrado';

        let newStock = med.stockDosesRemaining;
        if (!wasMinistrado && isNowMinistrado) {
          newStock = Math.max(0, med.stockDosesRemaining - 1);
          isStockDeducted = true;
        } else if (wasMinistrado && !isNowMinistrado) {
          newStock = med.stockDosesRemaining + 1;
        }

        const isCheckedStatus = newStatus === 'Ministrado' || newStatus === 'Parcial' || newStatus === 'Recusado';

        const updatedMed = {
          ...med,
          stockDosesRemaining: newStock,
          scheduledDoses: med.scheduledDoses.map(dose => {
            if (dose.id !== doseId) return dose;
            return {
              ...dose,
              status: newStatus,
              notes: notes !== undefined ? notes : dose.notes,
              administeredBy: isCheckedStatus ? 'Enf. Mariana Castro' : undefined,
              administeredAt: isCheckedStatus ? new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : undefined,
            };
          }),
        };
        saveMedicationToDb(updatedMed);
        return updatedMed;
      })
    );

    // If Parcial or Recusado, log timeline event & audit log
    if (newStatus === 'Parcial' || newStatus === 'Recusado') {
      const statusTitle = newStatus === 'Recusado' ? '🚨 Recusa de Medicação Registrada' : '⚠️ Dose Parcial de Medicação';
      const newTimelineEvt: Timeline360Event = {
        id: `tl-med-${Date.now()}`,
        residentId: targetResidentId,
        type: 'Medicação MAR',
        title: statusTitle,
        description: `Dose de ${targetMedName} (${newStatus}). ${notes ? 'Justificativa: ' + notes : ''}`,
        authorName: 'Enf. Mariana Castro',
        authorRole: 'Enfermeira RT',
        timestamp: `${new Date().toLocaleDateString('pt-BR')} ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
        severity: newStatus === 'Recusado' ? 'Atenção' : 'Normal'
      };
      setTimelineEvents(prev => [newTimelineEvt, ...prev]);
    }

    // Automatic Stock Deduction from Pharmacy Inventory (Baixa no Estoque da Farmácia)
    if (isStockDeducted && targetMedName) {
      setInventoryItems(prevItems => {
        const keyword = extractFirstKeyword(targetMedName); // e.g. "quetiapina", "risperidona"
        let matched = false;
        
        return prevItems.map(item => {
          if (!matched && item.name.toLowerCase().includes(keyword)) {
            matched = true;
            return {
              ...item,
              stockCurrent: Math.max(0, item.stockCurrent - 1)
            };
          }
          return item;
        });
      });

      // Audit Log for automatic stock consumption
      const newAuditLog: AuditLogEntry = {
        id: `audit-stock-${Date.now()}`,
        userId: 'usr-enf-1',
        userName: 'Enf. Mariana Castro',
        userRole: 'Enfermeiro RT',
        action: 'Edição',
        resource: `Baixa Automática Estoque: ${targetMedName} (Residente: ${targetResidentName})`,
        ipAddress: '192.168.1.104',
        timestamp: new Date().toLocaleString('pt-BR'),
        reason: 'Consumo de Dose Registrado no Kardex Eletrônico (MAR)'
      };
      setAuditLogs(prev => [newAuditLog, ...prev]);

      // Timeline 360 Event
      const newTimelineEvt: Timeline360Event = {
        id: `tl-med-${Date.now()}`,
        residentId: targetResidentId,
        type: 'Medicação MAR',
        title: `Medicação Ministrada com Baixa Automática`,
        description: `Dose de ${targetMedName} administrada por Enf. Mariana Castro. Baixa automática realizada no estoque da Farmácia Central.`,
        authorName: 'Enf. Mariana Castro',
        authorRole: 'Enfermeira RT',
        timestamp: `${new Date().toLocaleDateString('pt-BR')} ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
        severity: 'Normal'
      };
      setTimelineEvents(prev => [newTimelineEvt, ...prev]);
    }
  };

  // Add new SOAP Evolution
  const handleSaveEvolution = (newEvo: ClinicalEvolution) => {
    setEvolutions(prev => [newEvo, ...prev]);
    saveEvolutionToDb(newEvo);
  };

  // Add new Resident
  const handleAddResident = (newResident: Resident) => {
    setResidents(prev => [newResident, ...prev]);
    saveResidentToDb(newResident);
  };

  // Add Occurrence
  const handleAddOccurrence = (occ: OccurrenceItem) => {
    setHandovers(prev => {
      if (prev.length === 0) return prev;
      const latest = prev[0];
      const updatedLatest: HandoverLog = {
        ...latest,
        occurrences: [occ, ...latest.occurrences],
      };
      saveHandoverToDb(updatedLatest);
      return [updatedLatest, ...prev.slice(1)];
    });
  };

  // Mark alerts read
  const handleMarkAlertsRead = () => {
    setAlerts(prev => prev.map(a => ({ ...a, read: true })));
  };

  // Acknowledge handover signature
  const handleAcknowledgeHandover = (handoverId: string, staffName: string) => {
    setHandovers(prev =>
      prev.map(h => {
        if (h.id !== handoverId) return h;
        if (h.acknowledgedBy.includes(staffName)) return h;
        const updated = {
          ...h,
          acknowledgedBy: [...h.acknowledgedBy, staffName],
        };
        saveHandoverToDb(updated);
        return updated;
      })
    );
  };

  // Pending meds count
  const pendingMedsCount = medications.reduce((acc, m) => {
    return acc + m.scheduledDoses.filter(d => d.status === 'Pendente' || d.status === 'Atrasado').length;
  }, 0);

  // Active alerts count
  const activeAlertsCount = alerts.filter(a => !a.read).length;

  // Open resident modal (360 or standard detail)
  const handleOpenResident = (residentId: string) => {
    const found = residents.find(r => r.id === residentId);
    if (found) setSelectedResidentFor360(found);
  };

  // Real-time Service Worker & Browser Notifications for Critical Residents
  const {
    permission: notificationPermission,
    requestPermission: requestNotificationPermission,
    sendTestAlert: sendTestNotificationAlert,
    criticalResidentsCount
  } = useCriticalAlertNotifications(residents, (res) => setSelectedResidentFor360(res));

  // Open new evolution modal with optional resident preset
  const handleOpenNewEvolution = (residentId?: string) => {
    setInitialResidentIdForSOAP(residentId);
    setIsSOAPModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-zinc-100/80 text-zinc-900 flex flex-col font-sans selection:bg-teal-600 selection:text-white">
      {/* Top Navigation Bar */}
      <NavbarHeader
        alerts={alerts}
        onOpenCommandBar={() => setIsCommandBarOpen(true)}
        onOpenAssistant={() => setIsNexaChatOpen(true)}
        onNavigate={setCurrentPath}
        activePath={currentPath}
        onMarkAlertsRead={handleMarkAlertsRead}
        onOpenInboundHandover={handleOpenInboundHandover}
        onOpenOutboundHandover={handleOpenOutboundHandover}
        notificationPermission={notificationPermission}
        onRequestNotificationPermission={requestNotificationPermission}
        onSendTestNotificationAlert={sendTestNotificationAlert}
        criticalResidentsCount={criticalResidentsCount}
      />

      {/* Main Body Shell */}
      <div className="flex-1 flex max-w-7xl w-full mx-auto px-2 sm:px-4 md:px-6 py-4 gap-6">
        {/* App Sidebar Navigation */}
        {currentPath !== '/auth' && (
          <AppSidebar
            currentPath={currentPath}
            onNavigate={setCurrentPath}
            pendingMedsCount={pendingMedsCount}
            activeAlertsCount={activeAlertsCount}
            openNexaChat={() => setIsNexaChatOpen(true)}
            onOpenLGPD={() => setIsLGPDModalOpen(true)}
          />
        )}

        {/* Dynamic Route Content Area */}
        <main className="flex-1 min-w-0">
          {currentPath === '/dashboard' && (
            <DashboardView
              residents={residents}
              alerts={alerts}
              medications={medications}
              evolutions={evolutions}
              handovers={handovers}
              onOpenResident={handleOpenResident}
              onOpenNewEvolution={handleOpenNewEvolution}
              onNavigate={setCurrentPath}
              onMarkAlertsRead={handleMarkAlertsRead}
              onOpenIoTTelemetry={(res) => setSelectedResidentForIoT(res)}
            />
          )}

          {currentPath.startsWith('/residentes') && (
            <ResidentesView
              residents={residents}
              onOpenResident={handleOpenResident}
              onOpenNewEvolution={handleOpenNewEvolution}
              onAddResident={handleAddResident}
            />
          )}

          {currentPath === '/prontuarios' && (
            <ProntuariosView
              evolutions={evolutions}
              onOpenNewEvolution={() => handleOpenNewEvolution()}
              onNavigate={setCurrentPath}
            />
          )}

          {currentPath === '/evolucao-medicacao' && (
            <EvolucaoMedicacaoView
              residents={residents}
              medications={medications}
              onUpdateDoseStatus={handleUpdateDoseStatus}
              onSaveEvolution={handleSaveEvolution}
              onOpenNewEvolutionModal={(resId) => handleOpenNewEvolution(resId)}
              onOpenResident360={(resId) => {
                const res = residents.find(r => r.id === resId);
                if (res) setSelectedResidentFor360(res);
              }}
            />
          )}

          {currentPath === '/medicacao' && (
            <MedicacaoView
              medications={medications}
              onUpdateDoseStatus={handleUpdateDoseStatus}
              onNavigate={setCurrentPath}
            />
          )}

          {currentPath === '/escalas' && (
            <EscalasView
              roster={roster}
              onAddRosterItem={(item) => setRoster(prev => [item, ...prev])}
            />
          )}

          {currentPath === '/plantao' && (
            <PlantaoView
              handovers={handovers}
              residents={residents}
              evolutions={evolutions}
              medications={medications}
              alerts={alerts}
              onAddOccurrence={handleAddOccurrence}
              onAcknowledgeHandover={handleAcknowledgeHandover}
              onOpenInboundHandover={handleOpenInboundHandover}
              onOpenOutboundHandover={handleOpenOutboundHandover}
            />
          )}

          {currentPath === '/relatorios' && (
            <RelatoriosView
              residents={residents}
              handovers={handovers}
              evolutions={evolutions}
              medications={medications}
              qualityMetrics={qualityMetrics}
            />
          )}

          {currentPath === '/guia-residencial' && (
            <ResidencialGuiaView />
          )}

          {currentPath === '/operacoes' && (
            <EnterpriseOpsView
              residents={residents}
              financialRecords={financialRecords}
              inventoryItems={inventoryItems}
              labResults={labResults}
              ocrDocuments={ocrDocuments}
              bpmnWorkflows={bpmnWorkflows}
              qualityMetrics={qualityMetrics}
              familyNotes={familyNotes}
              staffTrainings={staffTrainings}
              auditLogs={auditLogs}
              onAddFamilyNoteResponse={(noteId, response) => {
                setFamilyNotes(prev => prev.map(n => n.id === noteId ? { ...n, staffResponse: response } : n));
              }}
              onVerifyOCRDocument={(docId) => {
                setOcrDocuments(prev => prev.map(d => d.id === docId ? { ...d, verifiedByStaff: true } : d));
              }}
            />
          )}

          {currentPath === '/auth' && (
            <AuthView
              onLoginSuccess={() => {
                setCurrentPath('/dashboard');
                handleOpenInboundHandover();
              }}
            />
          )}
        </main>
      </div>

      {/* Floating Nexa Assistant Quick Trigger Button */}
      {currentPath !== '/auth' && !isNexaChatOpen && (
        <button
          onClick={() => setIsNexaChatOpen(true)}
          className="fixed bottom-5 right-5 z-40 p-3.5 bg-gradient-to-tr from-teal-600 via-teal-500 to-emerald-500 text-white rounded-2xl shadow-xl shadow-teal-600/30 border border-teal-300/40 hover:scale-105 active:scale-95 transition-all flex items-center gap-2.5 group"
          title="Falar com Assistente Nexa IA"
        >
          <div className="relative">
            <Sparkles className="w-5 h-5 text-white stroke-[2.5] animate-pulse" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 rounded-full border border-white animate-ping"></span>
          </div>
          <span className="text-xs font-black tracking-wide pr-0.5">Assistente Nexa</span>
        </button>
      )}

      {/* Nexa AI Assistant Widget & Command Bar Overlay */}
      <NexaAssistantWidget
        isOpen={isNexaChatOpen}
        onClose={() => setIsNexaChatOpen(false)}
        isCommandBarOpen={isCommandBarOpen}
        onCloseCommandBar={() => setIsCommandBarOpen(false)}
        onNavigate={setCurrentPath}
        onOpenResident={handleOpenResident}
        onOpenNewEvolution={handleOpenNewEvolution}
        onMarkAlertsRead={handleMarkAlertsRead}
        residents={residents}
        alerts={alerts}
        evolutions={evolutions}
        contextPage={currentPath}
      />

      {/* SOAP Editor Modal */}
      <SOAPEditorModal
        isOpen={isSOAPModalOpen}
        onClose={() => setIsSOAPModalOpen(false)}
        residents={residents}
        initialResidentId={initialResidentIdForSOAP}
        onSaveEvolution={handleSaveEvolution}
      />

      {/* Resident Detail Slide-Over Modal */}
      <ResidentDetailModal
        resident={selectedResidentForDetail}
        isOpen={selectedResidentForDetail !== null}
        onClose={() => setSelectedResidentForDetail(null)}
        evolutions={evolutions}
        medications={medications}
        onOpenNewEvolution={(resId) => {
          setSelectedResidentForDetail(null);
          handleOpenNewEvolution(resId);
        }}
        onUpdateDoseStatus={handleUpdateDoseStatus}
      />

      {/* Resident 360 Enterprise Modal */}
      <Resident360ViewModal
        resident={selectedResidentFor360}
        timelineEvents={timelineEvents}
        evolutions={evolutions}
        medications={medications}
        onClose={() => setSelectedResidentFor360(null)}
        onOpenSOAP={(resId) => {
          setSelectedResidentFor360(null);
          handleOpenNewEvolution(resId);
        }}
      />

      {/* LGPD & Cookie Privacy Management */}
      <LGPDAndCookieManager
        isOpenModal={isLGPDModalOpen}
        onCloseModal={() => setIsLGPDModalOpen(false)}
      />

      {/* IoT Telemetry Vitals Modal */}
      <IoTVitalsTelemetryModal
        isOpen={selectedResidentForIoT !== null}
        onClose={() => setSelectedResidentForIoT(null)}
        resident={selectedResidentForIoT}
        onUpdateVitals={handleUpdateVitals}
      />

      {/* Global Command Palette (⌘K) Modal */}
      <CommandPaletteModal
        isOpen={isCommandBarOpen}
        onClose={() => setIsCommandBarOpen(false)}
        residents={residents}
        alerts={alerts}
        onNavigate={setCurrentPath}
        onOpenResident360={(resId) => {
          const res = residents.find(r => r.id === resId);
          if (res) setSelectedResidentFor360(res);
        }}
        onOpenIoTTelemetry={(res) => setSelectedResidentForIoT(res)}
        onOpenNewEvolution={handleOpenNewEvolution}
        onOpenTelehealth={(res) => setSelectedResidentForTelehealth(res)}
      />

      {/* Telehealth Consultation Modal */}
      <TelehealthModal
        isOpen={selectedResidentForTelehealth !== null}
        onClose={() => setSelectedResidentForTelehealth(null)}
        resident={selectedResidentForTelehealth}
        onSaveSOAPNote={(residentId, soapData) => {
          const newEvo: ClinicalEvolution = {
            id: `evo-telemed-${Date.now()}`,
            residentId,
            residentName: selectedResidentForTelehealth?.name || 'Residente',
            room: selectedResidentForTelehealth?.room || '101',
            author: 'Dr. Fernando Alencar',
            role: 'Psiquiatra',
            date: new Date().toLocaleDateString('pt-BR'),
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            soap: soapData,
            tags: ['Telemedicina', 'Psiquiatria'],
            status: 'Finalizado',
            vitals: {
              bp: selectedResidentForTelehealth?.vitals?.bp || '120/80',
              hr: selectedResidentForTelehealth?.vitals?.hr || 75,
              temp: selectedResidentForTelehealth?.vitals?.temp || 36.5,
              spo2: selectedResidentForTelehealth?.vitals?.spo2 || 98,
              respRate: selectedResidentForTelehealth?.vitals?.respRate || 16
            }
          };
          handleSaveEvolution(newEvo);
        }}
      />

      {/* Smart Handover Modal (Troca Inteligente de Plantão) */}
      <SmartHandoverModal
        isOpen={isSmartHandoverOpen}
        mode={smartHandoverMode}
        onClose={() => setIsSmartHandoverOpen(false)}
        residents={residents}
        evolutions={evolutions}
        medications={medications}
        alerts={alerts}
        handovers={handovers}
        onCompleteInboundHandover={({ shiftName, signaturePin }) => {
          setIsSmartHandoverOpen(false);
          // Add audit entry or notification
        }}
        onCompleteOutboundHandover={(newHandoverLog) => {
          setHandovers(prev => [newHandoverLog, ...prev]);
          saveHandoverToDb(newHandoverLog);
          setIsSmartHandoverOpen(false);
        }}
        onResolvePendingDirectly={handleResolvePendingDirectly}
      />
    </div>
  );
}
