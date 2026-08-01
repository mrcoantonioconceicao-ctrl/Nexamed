import React, { useState, useEffect } from 'react';
import { Sparkles } from 'lucide-react';
import { 
  INITIAL_RESIDENTS, 
  INITIAL_EVOLUTIONS, 
  INITIAL_MEDICATIONS, 
  INITIAL_ROSTER, 
  INITIAL_HANDOVERS, 
  INITIAL_ALERTS 
} from './data/mockData';
import { 
  Resident, 
  ClinicalEvolution, 
  MedicationMAR, 
  StaffRoster, 
  HandoverLog, 
  ClinicalAlert, 
  DoseStatus,
  OccurrenceItem
} from './types';
import { getCurrentUser, isAuthEnabled } from './config/auth-mode';

import { NavbarHeader } from './components/NavbarHeader';
import { AppSidebar } from './components/AppSidebar';
import { NexaAssistantWidget } from './components/NexaAssistantWidget';
import { SOAPEditorModal } from './components/SOAPEditorModal';
import { ResidentDetailModal } from './components/ResidentDetailModal';

import { DashboardView } from './views/DashboardView';
import { ResidentesView } from './views/ResidentesView';
import { ProntuariosView } from './views/ProntuariosView';
import { MedicacaoView } from './views/MedicacaoView';
import { EscalasView } from './views/EscalasView';
import { PlantaoView } from './views/PlantaoView';
import { RelatoriosView } from './views/RelatoriosView';
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

  // Modal & Drawer States
  const [isNexaChatOpen, setIsNexaChatOpen] = useState(false);
  const [isCommandBarOpen, setIsCommandBarOpen] = useState(false);
  const [isSOAPModalOpen, setIsSOAPModalOpen] = useState(false);
  const [initialResidentIdForSOAP, setInitialResidentIdForSOAP] = useState<string | undefined>();
  const [selectedResidentForDetail, setSelectedResidentForDetail] = useState<Resident | null>(null);

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

  // Dose Check-off Handler
  const handleUpdateDoseStatus = (medicationId: string, doseId: string, newStatus: DoseStatus) => {
    setMedications(prevMeds =>
      prevMeds.map(med => {
        if (med.id !== medicationId) return med;
        return {
          ...med,
          scheduledDoses: med.scheduledDoses.map(dose => {
            if (dose.id !== doseId) return dose;
            return {
              ...dose,
              status: newStatus,
              administeredBy: newStatus === 'Ministrado' ? 'Dr. Fernando Alencar' : undefined,
              administeredAt: newStatus === 'Ministrado' ? new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : undefined,
            };
          }),
        };
      })
    );
  };

  // Add new SOAP Evolution
  const handleSaveEvolution = (newEvo: ClinicalEvolution) => {
    setEvolutions(prev => [newEvo, ...prev]);
  };

  // Add new Resident
  const handleAddResident = (newResident: Resident) => {
    setResidents(prev => [newResident, ...prev]);
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
        return {
          ...h,
          acknowledgedBy: [...h.acknowledgedBy, staffName],
        };
      })
    );
  };

  // Pending meds count
  const pendingMedsCount = medications.reduce((acc, m) => {
    return acc + m.scheduledDoses.filter(d => d.status === 'Pendente' || d.status === 'Atrasado').length;
  }, 0);

  // Active alerts count
  const activeAlertsCount = alerts.filter(a => !a.read).length;

  // Open resident modal
  const handleOpenResident = (residentId: string) => {
    const found = residents.find(r => r.id === residentId);
    if (found) setSelectedResidentForDetail(found);
  };

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
            />
          )}

          {currentPath === '/medicacao' && (
            <MedicacaoView
              medications={medications}
              onUpdateDoseStatus={handleUpdateDoseStatus}
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
              onAddOccurrence={handleAddOccurrence}
              onAcknowledgeHandover={handleAcknowledgeHandover}
            />
          )}

          {currentPath === '/relatorios' && (
            <RelatoriosView
              residents={residents}
              handovers={handovers}
              evolutions={evolutions}
              medications={medications}
            />
          )}

          {currentPath === '/auth' && (
            <AuthView
              onLoginSuccess={() => setCurrentPath('/dashboard')}
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
    </div>
  );
}
