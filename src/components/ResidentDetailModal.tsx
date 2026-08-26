import React, { useState, useEffect } from 'react';
import { 
  X, 
  User, 
  ShieldAlert, 
  Pill, 
  FileText, 
  Phone, 
  Calendar, 
  CheckCircle2, 
  Plus, 
  Sparkles,
  Heart,
  Activity,
  AlertTriangle,
  Award,
  Bell,
  Clock,
  MapPin,
  Stethoscope,
  Palette,
  FlaskConical,
  Users2,
  FileCheck,
  Volume2,
  Trash2,
  Edit2,
  Check,
  ChevronRight,
  Filter,
  Download,
  Printer,
  FileDown,
  Share2
} from 'lucide-react';
import { 
  Resident, 
  ClinicalEvolution, 
  MedicationMAR, 
  ResidentReminder, 
  ReminderCategory, 
  ReminderPriority 
} from '../types';
import { 
  playReminderNotificationChime, 
  sendBrowserReminderNotification,
  REMINDER_PRESET_TEMPLATES,
  getCategoryBadgeStyle,
  getPriorityBadgeStyle
} from '../utils/reminderService';
import { 
  exportResidentClinicalSummaryPdf, 
  printResidentClinicalSummary 
} from '../utils/clinicalPdfExport';

interface ResidentDetailModalProps {
  resident: Resident | null;
  isOpen: boolean;
  onClose: () => void;
  evolutions: ClinicalEvolution[];
  medications: MedicationMAR[];
  reminders?: ResidentReminder[];
  initialTab?: 'overview' | 'soap' | 'meds' | 'reminders' | 'contacts';
  onOpenNewEvolution: (residentId: string) => void;
  onUpdateDoseStatus: (medicationId: string, doseId: string, status: 'Ministrado' | 'Recusado' | 'Suspenso') => void;
  onAddReminder?: (reminder: ResidentReminder) => void;
  onToggleReminder?: (reminderId: string) => void;
  onDeleteReminder?: (reminderId: string) => void;
  onUpdateReminder?: (reminder: ResidentReminder) => void;
}

export const ResidentDetailModal: React.FC<ResidentDetailModalProps> = ({
  resident,
  isOpen,
  onClose,
  evolutions,
  medications,
  reminders = [],
  initialTab = 'overview',
  onOpenNewEvolution,
  onUpdateDoseStatus,
  onAddReminder,
  onToggleReminder,
  onDeleteReminder,
  onUpdateReminder,
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'soap' | 'meds' | 'reminders' | 'contacts'>(initialTab);

  // Reminders Filter and Form state
  const [reminderFilter, setReminderFilter] = useState<'all' | 'pending' | 'today' | 'consultas' | 'atividades' | 'completed'>('all');
  const [showAddReminderForm, setShowAddReminderForm] = useState(false);
  const [editingReminderId, setEditingReminderId] = useState<string | null>(null);

  // Form Fields
  const [remTitle, setRemTitle] = useState('');
  const [remCategory, setRemCategory] = useState<ReminderCategory>('Consulta Médica');
  const [remDate, setRemDate] = useState(() => new Date().toLocaleDateString('pt-BR'));
  const [remTime, setRemTime] = useState('14:00');
  const [remLocation, setRemLocation] = useState('CAPS II Blumenau');
  const [remProfessional, setRemProfessional] = useState('Dr. Fernando Alencar (Psiquiatra)');
  const [remResponsibleStaff, setRemResponsibleStaff] = useState('Enf. Mariana Castro (RT)');
  const [remPriority, setRemPriority] = useState<ReminderPriority>('Alta');
  const [remNotifyTeam, setRemNotifyTeam] = useState(true);
  const [remNotes, setRemNotes] = useState('');

  // Toast feedback for notification trigger
  const [notificationToast, setNotificationToast] = useState<string | null>(null);

  // PDF Export Modal State
  const [showExportModal, setShowExportModal] = useState(false);
  const [exportEvolutionId, setExportEvolutionId] = useState<string | null>(null);
  const [includeMedsInExport, setIncludeMedsInExport] = useState(true);
  const [includeRemindersInExport, setIncludeRemindersInExport] = useState(true);
  const [exportInstitution, setExportInstitution] = useState('SERVIÇO DE RESIDÊNCIA TERAPÊUTICA (SRT) - SUS');
  const [exportSignerName, setExportSignerName] = useState('Equipe Multiprofissional / RT');
  const [exportSignerRole, setExportSignerRole] = useState('Enfermagem & Coordenação Técnica');

  useEffect(() => {
    if (isOpen) {
      setActiveTab(initialTab);
    }
  }, [isOpen, initialTab]);

  if (!isOpen || !resident) return null;

  const residentEvolutions = evolutions.filter(e => e.residentId === resident.id);
  const residentMeds = medications.filter(m => m.residentId === resident.id);
  const residentReminders = (resident.customReminders && resident.customReminders.length > 0)
    ? resident.customReminders
    : reminders.filter(r => r.residentId === resident.id);

  const todayPtBr = new Date().toLocaleDateString('pt-BR');

  const handleExportPdf = (singleEvoId?: string) => {
    try {
      exportResidentClinicalSummaryPdf(resident, residentEvolutions, residentMeds, residentReminders, {
        singleEvolutionId: singleEvoId || (exportEvolutionId || undefined),
        includeMedications: includeMedsInExport,
        includeReminders: includeRemindersInExport,
        institutionName: exportInstitution,
        professionalName: exportSignerName,
        professionalRole: exportSignerRole
      });
      setNotificationToast(`Prontuário e evolução de ${resident.name} exportados em PDF com sucesso!`);
      setTimeout(() => setNotificationToast(null), 4000);
      setShowExportModal(false);
    } catch (err) {
      console.error('Erro ao gerar PDF:', err);
      alert('Houve uma falha ao gerar o PDF. Tente novamente.');
    }
  };

  const handlePrintDocument = (singleEvoId?: string) => {
    try {
      printResidentClinicalSummary(resident, residentEvolutions, residentMeds, residentReminders, {
        singleEvolutionId: singleEvoId || (exportEvolutionId || undefined),
        includeMedications: includeMedsInExport,
        includeReminders: includeRemindersInExport,
        institutionName: exportInstitution,
        professionalName: exportSignerName,
        professionalRole: exportSignerRole
      });
      setShowExportModal(false);
    } catch (err) {
      console.error('Erro ao abrir impressão:', err);
      alert('Houve uma falha ao preparar a impressão.');
    }
  };

  // Filtered reminders for list view
  const filteredReminders = residentReminders.filter(r => {
    if (reminderFilter === 'pending') return !r.completed;
    if (reminderFilter === 'completed') return r.completed;
    if (reminderFilter === 'today') return r.date === todayPtBr;
    if (reminderFilter === 'consultas') return r.category === 'Consulta Médica';
    if (reminderFilter === 'atividades') return r.category === 'Atividade Agendada';
    return true;
  });

  const pendingCount = residentReminders.filter(r => !r.completed).length;
  const todayCount = residentReminders.filter(r => r.date === todayPtBr && !r.completed).length;
  const completedCount = residentReminders.filter(r => r.completed).length;

  const handleApplyPresetTemplate = (tpl: typeof REMINDER_PRESET_TEMPLATES[0]) => {
    setRemTitle(tpl.title);
    setRemCategory(tpl.category);
    setRemTime(tpl.defaultTime);
    setRemLocation(tpl.defaultLocation);
    setRemProfessional(tpl.defaultProfessional);
    setRemResponsibleStaff(tpl.defaultStaff);
    setRemPriority(tpl.priority);
    setRemNotes(tpl.notes);
  };

  const handleResetReminderForm = () => {
    setRemTitle('');
    setRemCategory('Consulta Médica');
    setRemDate(new Date().toLocaleDateString('pt-BR'));
    setRemTime('14:00');
    setRemLocation('CAPS II Blumenau');
    setRemProfessional('Dr. Fernando Alencar (Psiquiatra)');
    setRemResponsibleStaff('Enf. Mariana Castro (RT)');
    setRemPriority('Alta');
    setRemNotifyTeam(true);
    setRemNotes('');
    setEditingReminderId(null);
    setShowAddReminderForm(false);
  };

  const handleStartEditReminder = (rem: ResidentReminder) => {
    setEditingReminderId(rem.id);
    setRemTitle(rem.title);
    setRemCategory(rem.category);
    setRemDate(rem.date);
    setRemTime(rem.time);
    setRemLocation(rem.location || '');
    setRemProfessional(rem.professionalOrOrganizer || '');
    setRemResponsibleStaff(rem.responsibleStaff || '');
    setRemPriority(rem.priority);
    setRemNotifyTeam(rem.notifyTeam);
    setRemNotes(rem.notes || '');
    setShowAddReminderForm(true);
  };

  const handleSaveReminder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!remTitle.trim()) {
      alert('Por favor, informe o título do lembrete ou atividade.');
      return;
    }

    if (editingReminderId) {
      const updated: ResidentReminder = {
        id: editingReminderId,
        residentId: resident.id,
        residentName: resident.name,
        residentRoom: resident.room,
        title: remTitle.trim(),
        category: remCategory,
        date: remDate,
        time: remTime,
        location: remLocation,
        professionalOrOrganizer: remProfessional,
        responsibleStaff: remResponsibleStaff,
        priority: remPriority,
        notifyTeam: remNotifyTeam,
        notes: remNotes.trim(),
        completed: false,
        createdAt: new Date().toLocaleDateString('pt-BR') + ' ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        createdBy: 'Equipe Multidisciplinar'
      };

      if (onUpdateReminder) {
        onUpdateReminder(updated);
      }
    } else {
      const newRem: ResidentReminder = {
        id: `rem-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        residentId: resident.id,
        residentName: resident.name,
        residentRoom: resident.room,
        title: remTitle.trim(),
        category: remCategory,
        date: remDate,
        time: remTime,
        location: remLocation,
        professionalOrOrganizer: remProfessional,
        responsibleStaff: remResponsibleStaff,
        priority: remPriority,
        notifyTeam: remNotifyTeam,
        notificationSent: false,
        notes: remNotes.trim(),
        completed: false,
        createdAt: new Date().toLocaleDateString('pt-BR') + ' ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        createdBy: 'Equipe Multidisciplinar'
      };

      if (onAddReminder) {
        onAddReminder(newRem);
      }

      // If notifyTeam is enabled, emit chime confirmation
      if (remNotifyTeam) {
        playReminderNotificationChime();
        setNotificationToast(`Lembrete criado com alerta para a equipe: "${newRem.title}"`);
        setTimeout(() => setNotificationToast(null), 4000);
      }
    }

    handleResetReminderForm();
  };

  const handleTriggerTestAlert = (rem: ResidentReminder) => {
    playReminderNotificationChime();
    sendBrowserReminderNotification(rem);
    setNotificationToast(`Alerta sonoro e notificação disparados para a equipe: ${rem.title}`);
    setTimeout(() => setNotificationToast(null), 4500);
  };

  const getCategoryIcon = (category: ReminderCategory) => {
    switch (category) {
      case 'Consulta Médica':
        return <Stethoscope className="w-4 h-4 text-sky-600 shrink-0" />;
      case 'Atividade Agendada':
        return <Palette className="w-4 h-4 text-teal-600 shrink-0" />;
      case 'Exame Laboratorial':
        return <FlaskConical className="w-4 h-4 text-purple-600 shrink-0" />;
      case 'Visita Familiar':
        return <Users2 className="w-4 h-4 text-emerald-600 shrink-0" />;
      case 'Renovação Receita':
        return <FileCheck className="w-4 h-4 text-amber-600 shrink-0" />;
      default:
        return <Calendar className="w-4 h-4 text-zinc-600 shrink-0" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <div className="w-full max-w-4xl bg-white border border-zinc-200 rounded-2xl shadow-2xl overflow-hidden my-4 max-h-[92vh] flex flex-col">
        {/* Toast Notification Alert */}
        {notificationToast && (
          <div className="bg-teal-700 text-white px-4 py-2.5 text-xs font-semibold flex items-center justify-between shadow-md animate-in slide-in-from-top-2">
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4 animate-bounce text-amber-300" />
              <span>{notificationToast}</span>
            </div>
            <button onClick={() => setNotificationToast(null)} className="text-white/80 hover:text-white">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Header Profile Banner */}
        <div className="p-4 sm:p-5 bg-zinc-50 border-b border-zinc-200 relative">
          <div className="absolute top-4 right-4 flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => {
                setExportEvolutionId(null);
                setShowExportModal(true);
              }}
              title="Exportar Resumo Clínico para PDF ou Imprimir"
              className="py-1.5 px-3 bg-white hover:bg-teal-50 text-teal-800 border border-teal-300 hover:border-teal-400 font-extrabold text-xs rounded-xl flex items-center gap-1.5 shadow-2xs transition-all"
            >
              <FileDown className="w-3.5 h-3.5 text-teal-600" />
              <span className="hidden sm:inline">Exportar PDF / Imprimir</span>
              <span className="sm:hidden">PDF</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 text-zinc-400 hover:text-zinc-700 rounded-lg hover:bg-zinc-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-3 sm:space-y-0 sm:space-x-4">
            <img
              src={resident.photo}
              alt={resident.name}
              className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover border-2 border-teal-500/50 shadow-xs shrink-0"
            />
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <h2 className="text-base sm:text-lg font-bold text-zinc-900">{resident.name}</h2>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-zinc-100 text-teal-800 border border-zinc-200">
                  {resident.room}
                </span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md uppercase border ${
                  resident.riskScore === 'Crítico' ? 'bg-rose-50 text-rose-800 border-rose-200' :
                  resident.riskScore === 'Alto' ? 'bg-orange-50 text-orange-800 border-orange-200' :
                  resident.riskScore === 'Médio' ? 'bg-amber-50 text-amber-800 border-amber-200' :
                  'bg-emerald-50 text-emerald-800 border-emerald-200'
                }`}>
                  Risco {resident.riskScore}
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-purple-50 text-purple-800 border border-purple-200">
                  {resident.dependenceLevel}
                </span>
                {pendingCount > 0 && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-sky-50 text-sky-800 border border-sky-200 flex items-center gap-1">
                    <Bell className="w-2.5 h-2.5 text-sky-600" />
                    {pendingCount} {pendingCount === 1 ? 'Lembrete Pendente' : 'Lembretes Pendentes'}
                  </span>
                )}
              </div>
              <p className="text-xs text-zinc-600 font-medium mb-1">
                Diagnóstico Principal: <span className="text-teal-700 font-bold">{resident.primaryDiagnosis}</span>
              </p>
              <div className="flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-zinc-500 font-medium">
                <span>Idade: <strong className="text-zinc-800">{resident.age} anos</strong></span>
                <span>Admissão: <strong className="text-zinc-800">{resident.admissionsDate}</strong></span>
                <span>CPF: <strong className="text-zinc-800">{resident.cpf}</strong></span>
              </div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-1 mt-5 border-b border-zinc-200 text-xs font-bold overflow-x-auto no-scrollbar">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-3.5 py-2 border-b-2 transition-colors flex items-center gap-1.5 whitespace-nowrap ${
                activeTab === 'overview'
                  ? 'border-teal-600 text-teal-700 font-black'
                  : 'border-transparent text-zinc-500 hover:text-zinc-800'
              }`}
            >
              <User className="w-3.5 h-3.5" /> Ficha & PTS
            </button>
            <button
              onClick={() => setActiveTab('reminders')}
              className={`px-3.5 py-2 border-b-2 transition-colors flex items-center gap-1.5 whitespace-nowrap ${
                activeTab === 'reminders'
                  ? 'border-teal-600 text-teal-700 font-black bg-teal-50/50 rounded-t-lg'
                  : 'border-transparent text-zinc-500 hover:text-zinc-800'
              }`}
            >
              <Bell className="w-3.5 h-3.5 text-teal-600" /> 
              <span>Lembretes & Atividades</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                pendingCount > 0 ? 'bg-teal-600 text-white' : 'bg-zinc-200 text-zinc-700'
              }`}>
                {residentReminders.length}
              </span>
            </button>
            <button
              onClick={() => setActiveTab('soap')}
              className={`px-3.5 py-2 border-b-2 transition-colors flex items-center gap-1.5 whitespace-nowrap ${
                activeTab === 'soap'
                  ? 'border-teal-600 text-teal-700 font-black'
                  : 'border-transparent text-zinc-500 hover:text-zinc-800'
              }`}
            >
              <FileText className="w-3.5 h-3.5" /> Prontuário SOAP ({residentEvolutions.length})
            </button>
            <button
              onClick={() => setActiveTab('meds')}
              className={`px-3.5 py-2 border-b-2 transition-colors flex items-center gap-1.5 whitespace-nowrap ${
                activeTab === 'meds'
                  ? 'border-teal-600 text-teal-700 font-black'
                  : 'border-transparent text-zinc-500 hover:text-zinc-800'
              }`}
            >
              <Pill className="w-3.5 h-3.5" /> Aprazamento MAR ({residentMeds.length})
            </button>
            <button
              onClick={() => setActiveTab('contacts')}
              className={`px-3.5 py-2 border-b-2 transition-colors flex items-center gap-1.5 whitespace-nowrap ${
                activeTab === 'contacts'
                  ? 'border-teal-600 text-teal-700 font-black'
                  : 'border-transparent text-zinc-500 hover:text-zinc-800'
              }`}
            >
              <Phone className="w-3.5 h-3.5" /> Família & Equipe
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-5 overflow-y-auto flex-1 space-y-5">
          {/* TAB 1: OVERVIEW & PTS */}
          {activeTab === 'overview' && (
            <div className="space-y-4">
              {/* Allergy Alert Banner */}
              {resident.allergies && resident.allergies.length > 0 && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-3">
                  <ShieldAlert className="w-5 h-5 text-rose-600 shrink-0" />
                  <div>
                    <p className="text-xs font-bold text-rose-900 uppercase">ALERTAS DE ALERGIA CADASTRADOS</p>
                    <p className="text-xs text-rose-700 font-medium">{resident.allergies.join(', ')}</p>
                  </div>
                </div>
              )}

              {/* Upcoming Reminders Quick Snapshot in Overview */}
              {pendingCount > 0 && (
                <div className="p-3.5 bg-gradient-to-r from-sky-50 to-teal-50 border border-sky-200 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-2xs">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-sky-600 text-white rounded-xl shadow-xs shrink-0">
                      <Bell className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-sky-950 flex items-center gap-1.5">
                        <span>Lembretes e Atividades Agendadas</span>
                        <span className="text-[10px] bg-sky-200 text-sky-900 px-1.5 py-0.2 rounded font-extrabold">
                          {pendingCount} pendente(s)
                        </span>
                      </h4>
                      <p className="text-xs text-sky-800 font-medium mt-0.5">
                        Próximo compromisso: <strong>{residentReminders.find(r => !r.completed)?.title || 'Ver agenda'}</strong> ({residentReminders.find(r => !r.completed)?.date} às {residentReminders.find(r => !r.completed)?.time})
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setActiveTab('reminders')}
                    className="px-3 py-1.5 bg-sky-700 hover:bg-sky-800 text-white text-xs font-bold rounded-xl transition-colors shrink-0 shadow-2xs flex items-center gap-1"
                  >
                    <span>Ver Agenda Completa</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              {/* PTS - Plano Terapêutico Singular */}
              {resident.singularTherapeuticPlan && (
                <div className="p-4 bg-zinc-50/70 border border-zinc-200 rounded-2xl space-y-3">
                  <div className="flex items-center justify-between border-b border-zinc-200/80 pb-2">
                    <div className="flex items-center gap-2">
                      <Award className="w-4 h-4 text-teal-600" />
                      <h3 className="text-xs font-bold text-zinc-900 uppercase tracking-wider">
                        Plano Terapêutico Singular (PTS)
                      </h3>
                    </div>
                    <span className="text-[11px] text-teal-800 font-bold bg-teal-50 px-2 py-0.5 rounded-md border border-teal-200">
                      Progresso: {resident.singularTherapeuticPlan.progressPercentage || 75}%
                    </span>
                  </div>

                  <p className="text-xs text-zinc-800 leading-relaxed font-medium">
                    <strong>Foco Principal:</strong> {resident.singularTherapeuticPlan.mainFocus}
                  </p>

                  {resident.singularTherapeuticPlan.goals && (
                    <div>
                      <span className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider block mb-1.5">
                        Metas Terapêuticas em Andamento:
                      </span>
                      <ul className="space-y-1.5">
                        {resident.singularTherapeuticPlan.goals.map((goal: string, idx: number) => (
                          <li key={idx} className="flex items-start gap-2 text-xs text-zinc-800 font-medium">
                            <CheckCircle2 className="w-3.5 h-3.5 text-teal-600 shrink-0 mt-0.5" />
                            <span>{goal}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  <p className="text-[10px] text-zinc-400 font-medium pt-1">
                    Revisão do PTS agendada para: {resident.singularTherapeuticPlan.reviewDate || '30 dias'}
                  </p>
                </div>
              )}

              {/* Key Therapists */}
              {resident.keyTherapists && resident.keyTherapists.length > 0 && (
                <div className="p-4 bg-zinc-50/70 border border-zinc-200 rounded-2xl">
                  <h3 className="text-xs font-bold text-zinc-900 uppercase tracking-wider mb-2.5">
                    Equipe Multiprofissional Referência
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                    {resident.keyTherapists.map((t, i) => (
                      <div key={i} className="p-2.5 bg-white rounded-xl border border-zinc-200 shadow-2xs">
                        <p className="text-[10px] text-teal-700 font-bold uppercase">
                          {typeof t === 'string' ? 'Profissional' : t.role}
                        </p>
                        <p className="text-xs font-bold text-zinc-900">
                          {typeof t === 'string' ? t : t.name}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: LEMBRETES & ATIVIDADES AGENDADAS */}
          {activeTab === 'reminders' && (
            <div className="space-y-4">
              {/* Summary Metrics Bar */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                <div className="p-3 bg-zinc-50 border border-zinc-200 rounded-xl flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-bold text-zinc-500 uppercase">Total Cadastrado</span>
                    <p className="text-lg font-black text-zinc-900">{residentReminders.length}</p>
                  </div>
                  <Calendar className="w-5 h-5 text-zinc-400" />
                </div>
                <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-xl flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-bold text-amber-800 uppercase">Pendentes</span>
                    <p className="text-lg font-black text-amber-900">{pendingCount}</p>
                  </div>
                  <Clock className="w-5 h-5 text-amber-500" />
                </div>
                <div className="p-3 bg-sky-50/70 border border-sky-200 rounded-xl flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-bold text-sky-800 uppercase">Compromissos Hoje</span>
                    <p className="text-lg font-black text-sky-900">{todayCount}</p>
                  </div>
                  <Bell className="w-5 h-5 text-sky-500" />
                </div>
                <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-xl flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-bold text-emerald-800 uppercase">Concluídos</span>
                    <p className="text-lg font-black text-emerald-900">{completedCount}</p>
                  </div>
                  <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                </div>
              </div>

              {/* Action and Filter Header */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 pt-1">
                {/* Filter Pills */}
                <div className="flex items-center gap-1 overflow-x-auto no-scrollbar py-0.5">
                  <button
                    onClick={() => setReminderFilter('all')}
                    className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-colors whitespace-nowrap ${
                      reminderFilter === 'all'
                        ? 'bg-zinc-900 text-white'
                        : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
                    }`}
                  >
                    Todos ({residentReminders.length})
                  </button>
                  <button
                    onClick={() => setReminderFilter('pending')}
                    className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-colors whitespace-nowrap ${
                      reminderFilter === 'pending'
                        ? 'bg-amber-600 text-white'
                        : 'bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100'
                    }`}
                  >
                    Pendentes ({pendingCount})
                  </button>
                  <button
                    onClick={() => setReminderFilter('today')}
                    className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-colors whitespace-nowrap ${
                      reminderFilter === 'today'
                        ? 'bg-sky-600 text-white'
                        : 'bg-sky-50 text-sky-800 border border-sky-200 hover:bg-sky-100'
                    }`}
                  >
                    Hoje ({todayCount})
                  </button>
                  <button
                    onClick={() => setReminderFilter('consultas')}
                    className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-colors whitespace-nowrap ${
                      reminderFilter === 'consultas'
                        ? 'bg-blue-600 text-white'
                        : 'bg-blue-50 text-blue-800 border border-blue-200 hover:bg-blue-100'
                    }`}
                  >
                    Consultas
                  </button>
                  <button
                    onClick={() => setReminderFilter('atividades')}
                    className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-colors whitespace-nowrap ${
                      reminderFilter === 'atividades'
                        ? 'bg-teal-600 text-white'
                        : 'bg-teal-50 text-teal-800 border border-teal-200 hover:bg-teal-100'
                    }`}
                  >
                    Atividades
                  </button>
                  <button
                    onClick={() => setReminderFilter('completed')}
                    className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-colors whitespace-nowrap ${
                      reminderFilter === 'completed'
                        ? 'bg-emerald-600 text-white'
                        : 'bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100'
                    }`}
                  >
                    Concluídos ({completedCount})
                  </button>
                </div>

                {/* New Reminder Button */}
                <button
                  onClick={() => {
                    if (showAddReminderForm) {
                      handleResetReminderForm();
                    } else {
                      setShowAddReminderForm(true);
                    }
                  }}
                  className="py-1.5 px-3.5 bg-teal-600 hover:bg-teal-700 text-white font-extrabold text-xs rounded-xl flex items-center justify-center gap-1.5 shadow-2xs transition-all shrink-0"
                >
                  {showAddReminderForm ? (
                    <>
                      <X className="w-3.5 h-3.5" />
                      <span>Fechar Formulário</span>
                    </>
                  ) : (
                    <>
                      <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                      <span>Novo Lembrete / Atividade</span>
                    </>
                  )}
                </button>
              </div>

              {/* Form to Add / Edit Reminder */}
              {showAddReminderForm && (
                <div className="p-4 sm:p-5 bg-teal-50/40 border-2 border-teal-500/40 rounded-2xl shadow-xs space-y-4 animate-in fade-in duration-200">
                  <div className="flex items-center justify-between border-b border-teal-200/80 pb-2.5">
                    <div className="flex items-center gap-2">
                      <Bell className="w-4 h-4 text-teal-700" />
                      <h4 className="text-xs font-black text-teal-950 uppercase tracking-wide">
                        {editingReminderId ? 'Editar Lembrete Agendado' : 'Agendar Novo Lembrete / Atividade para ' + resident.name}
                      </h4>
                    </div>
                    <span className="text-[11px] text-teal-800 font-semibold bg-teal-100/70 px-2 py-0.5 rounded-md">
                      Notificação Automática para Equipe
                    </span>
                  </div>

                  {/* Preset Quick Fill Chips */}
                  <div>
                    <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block mb-1.5">
                      Sugestões Rápidas de Agendamento SRT:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {REMINDER_PRESET_TEMPLATES.map((tpl, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => handleApplyPresetTemplate(tpl)}
                          className="px-2.5 py-1 bg-white hover:bg-teal-50 border border-zinc-200 hover:border-teal-300 text-zinc-700 hover:text-teal-900 rounded-lg text-[11px] font-medium transition-all shadow-2xs flex items-center gap-1"
                        >
                          <Sparkles className="w-3 h-3 text-teal-600" />
                          <span>{tpl.title}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <form onSubmit={handleSaveReminder} className="space-y-3.5">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {/* Title */}
                      <div className="sm:col-span-2">
                        <label className="text-[11px] font-bold text-zinc-700 block mb-1">
                          Título do Lembrete / Compromisso *
                        </label>
                        <input
                          type="text"
                          required
                          value={remTitle}
                          onChange={(e) => setRemTitle(e.target.value)}
                          placeholder="Ex: Consulta Psiquiátrica CAPS II, Oficina de Arte, Coleta de Sangue..."
                          className="w-full h-9 px-3 text-xs bg-white border border-zinc-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 font-medium"
                        />
                      </div>

                      {/* Category */}
                      <div>
                        <label className="text-[11px] font-bold text-zinc-700 block mb-1">
                          Categoria *
                        </label>
                        <select
                          value={remCategory}
                          onChange={(e) => setRemCategory(e.target.value as ReminderCategory)}
                          className="w-full h-9 px-2.5 text-xs bg-white border border-zinc-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 font-medium"
                        >
                          <option value="Consulta Médica">🩺 Consulta Médica</option>
                          <option value="Atividade Agendada">🎨 Atividade Agendada</option>
                          <option value="Exame Laboratorial">🧪 Exame Laboratorial</option>
                          <option value="Visita Familiar">👨‍👩‍👧 Visita Familiar</option>
                          <option value="Renovação Receita">💊 Renovação Receita</option>
                          <option value="Cuidado Específico">🩹 Cuidado Específico</option>
                          <option value="Outro">📌 Outro</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                      {/* Date */}
                      <div>
                        <label className="text-[11px] font-bold text-zinc-700 block mb-1">
                          Data (DD/MM/AAAA) *
                        </label>
                        <input
                          type="text"
                          required
                          value={remDate}
                          onChange={(e) => setRemDate(e.target.value)}
                          placeholder="Ex: 26/08/2026"
                          className="w-full h-9 px-3 text-xs bg-white border border-zinc-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 font-medium"
                        />
                      </div>

                      {/* Time */}
                      <div>
                        <label className="text-[11px] font-bold text-zinc-700 block mb-1">
                          Horário *
                        </label>
                        <input
                          type="time"
                          required
                          value={remTime}
                          onChange={(e) => setRemTime(e.target.value)}
                          className="w-full h-9 px-3 text-xs bg-white border border-zinc-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 font-medium"
                        />
                      </div>

                      {/* Priority */}
                      <div>
                        <label className="text-[11px] font-bold text-zinc-700 block mb-1">
                          Prioridade *
                        </label>
                        <select
                          value={remPriority}
                          onChange={(e) => setRemPriority(e.target.value as ReminderPriority)}
                          className="w-full h-9 px-2.5 text-xs bg-white border border-zinc-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 font-medium"
                        >
                          <option value="Crítica">🚨 Crítica (Urgência)</option>
                          <option value="Alta">⚠️ Alta</option>
                          <option value="Média">⚡ Média</option>
                          <option value="Normal">🟢 Normal</option>
                        </select>
                      </div>

                      {/* Team Notification Switch */}
                      <div className="flex flex-col justify-center">
                        <label className="text-[11px] font-bold text-zinc-700 block mb-1">
                          Notificação da Equipe
                        </label>
                        <label className="flex items-center gap-2 text-xs font-semibold text-teal-900 bg-white p-2 border border-zinc-300 rounded-xl cursor-pointer">
                          <input
                            type="checkbox"
                            checked={remNotifyTeam}
                            onChange={(e) => setRemNotifyTeam(e.target.checked)}
                            className="rounded text-teal-600 focus:ring-teal-500 w-4 h-4"
                          />
                          <span className="text-[11px] flex items-center gap-1">
                            <Volume2 className="w-3 h-3 text-teal-600" /> Alerta Sonoro/Push
                          </span>
                        </label>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {/* Location */}
                      <div>
                        <label className="text-[11px] font-bold text-zinc-700 block mb-1">
                          Local / Sala / Unidade
                        </label>
                        <input
                          type="text"
                          value={remLocation}
                          onChange={(e) => setRemLocation(e.target.value)}
                          placeholder="Ex: CAPS II Blumenau, Sala Multiuso..."
                          className="w-full h-9 px-3 text-xs bg-white border border-zinc-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 font-medium"
                        />
                      </div>

                      {/* Professional / Specialist */}
                      <div>
                        <label className="text-[11px] font-bold text-zinc-700 block mb-1">
                          Especialista / Organizador
                        </label>
                        <input
                          type="text"
                          value={remProfessional}
                          onChange={(e) => setRemProfessional(e.target.value)}
                          placeholder="Ex: Dr. Fernando (Psiquiatra), Dra. Juliana (TO)..."
                          className="w-full h-9 px-3 text-xs bg-white border border-zinc-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 font-medium"
                        />
                      </div>

                      {/* Staff in charge */}
                      <div>
                        <label className="text-[11px] font-bold text-zinc-700 block mb-1">
                          Responsável da Casa / Equipe
                        </label>
                        <input
                          type="text"
                          value={remResponsibleStaff}
                          onChange={(e) => setRemResponsibleStaff(e.target.value)}
                          placeholder="Ex: Enf. Mariana Castro, Cuidador João..."
                          className="w-full h-9 px-3 text-xs bg-white border border-zinc-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 font-medium"
                        />
                      </div>
                    </div>

                    {/* Notes */}
                    <div>
                      <label className="text-[11px] font-bold text-zinc-700 block mb-1">
                        Observações Clínicas & Instruções de Preparo
                      </label>
                      <textarea
                        rows={2}
                        value={remNotes}
                        onChange={(e) => setRemNotes(e.target.value)}
                        placeholder="Ex: Jejum prévio, levar cópia de exames, suporte para locomoção, orientação da família..."
                        className="w-full p-2.5 text-xs bg-white border border-zinc-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 font-medium resize-none"
                      />
                    </div>

                    {/* Form Actions */}
                    <div className="flex items-center justify-end gap-2 pt-2 border-t border-teal-200">
                      <button
                        type="button"
                        onClick={handleResetReminderForm}
                        className="px-3 py-1.5 text-xs font-semibold text-zinc-600 hover:text-zinc-900 rounded-xl hover:bg-zinc-100 transition-colors"
                      >
                        Cancelar
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-1.5 bg-teal-600 hover:bg-teal-700 text-white text-xs font-extrabold rounded-xl shadow-xs transition-all flex items-center gap-1.5"
                      >
                        <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                        <span>{editingReminderId ? 'Salvar Alterações' : 'Confirmar Agendamento'}</span>
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* Reminders List */}
              {filteredReminders.length === 0 ? (
                <div className="p-8 text-center bg-zinc-50 rounded-2xl border border-zinc-200 space-y-2.5">
                  <div className="w-10 h-10 mx-auto rounded-full bg-zinc-100 text-zinc-400 flex items-center justify-center">
                    <Calendar className="w-5 h-5" />
                  </div>
                  <h4 className="text-xs font-bold text-zinc-800">
                    Nenhum lembrete ou atividade encontrada com o filtro selecionado.
                  </h4>
                  <p className="text-[11px] text-zinc-500 font-medium max-w-sm mx-auto">
                    Clique em <strong>"+ Novo Lembrete / Atividade"</strong> acima para registrar consultas psiquiátricas, oficinas ou cuidados programados.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredReminders.map((rem) => {
                    const catBadge = getCategoryBadgeStyle(rem.category);
                    const priBadge = getPriorityBadgeStyle(rem.priority);
                    const isToday = rem.date === todayPtBr;

                    return (
                      <div
                        key={rem.id}
                        className={`p-4 rounded-2xl border transition-all space-y-2.5 shadow-2xs ${
                          rem.completed
                            ? 'bg-zinc-50/60 border-zinc-200 opacity-75'
                            : isToday
                            ? 'bg-white border-teal-300 ring-1 ring-teal-400/30'
                            : 'bg-white border-zinc-200 hover:border-zinc-300'
                        }`}
                      >
                        {/* Top Bar with Category, Priority, Date & Time */}
                        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-zinc-100 pb-2">
                          <div className="flex flex-wrap items-center gap-1.5">
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border flex items-center gap-1 ${catBadge.bg} ${catBadge.text} ${catBadge.border}`}>
                              {getCategoryIcon(rem.category)}
                              <span>{rem.category}</span>
                            </span>

                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${priBadge.bg} ${priBadge.text} ${priBadge.border}`}>
                              Prioridade {rem.priority}
                            </span>

                            {isToday && !rem.completed && (
                              <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-md bg-amber-500 text-white animate-pulse">
                                HOJE
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-2 text-xs font-bold text-zinc-700">
                            <div className="flex items-center gap-1 bg-zinc-100 px-2 py-0.5 rounded-md border border-zinc-200 text-zinc-800">
                              <Calendar className="w-3 h-3 text-teal-600" />
                              <span>{rem.date}</span>
                            </div>
                            <div className="flex items-center gap-1 bg-teal-50 px-2 py-0.5 rounded-md border border-teal-200 text-teal-800">
                              <Clock className="w-3 h-3 text-teal-600" />
                              <span>{rem.time}</span>
                            </div>
                          </div>
                        </div>

                        {/* Title and Notes */}
                        <div>
                          <div className="flex items-start justify-between gap-2">
                            <h4 className={`text-sm font-bold ${rem.completed ? 'line-through text-zinc-500' : 'text-zinc-900'}`}>
                              {rem.title}
                            </h4>

                            {rem.completed ? (
                              <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md shrink-0 flex items-center gap-1">
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                Concluído
                              </span>
                            ) : (
                              <span className="text-[11px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-md shrink-0 flex items-center gap-1">
                                <Clock className="w-3.5 h-3.5 text-amber-600" />
                                Pendente
                              </span>
                            )}
                          </div>

                          {rem.notes && (
                            <p className="text-xs text-zinc-600 font-medium mt-1 leading-relaxed bg-zinc-50 p-2 rounded-lg border border-zinc-200/70">
                              📝 <strong>Instruções:</strong> {rem.notes}
                            </p>
                          )}
                        </div>

                        {/* Details grid: Location, Specialist, Responsible Staff */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px] pt-1 text-zinc-600 font-medium">
                          {rem.location && (
                            <div className="flex items-center gap-1.5 truncate">
                              <MapPin className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                              <span className="truncate">Local: <strong className="text-zinc-800">{rem.location}</strong></span>
                            </div>
                          )}
                          {rem.professionalOrOrganizer && (
                            <div className="flex items-center gap-1.5 truncate">
                              <Stethoscope className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                              <span className="truncate">Especialista: <strong className="text-zinc-800">{rem.professionalOrOrganizer}</strong></span>
                            </div>
                          )}
                          {rem.responsibleStaff && (
                            <div className="flex items-center gap-1.5 truncate">
                              <User className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                              <span className="truncate">Responsável: <strong className="text-zinc-800">{rem.responsibleStaff}</strong></span>
                            </div>
                          )}
                        </div>

                        {/* Bottom Action Buttons Bar */}
                        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-zinc-100">
                          <div className="text-[10px] text-zinc-400 font-medium">
                            Agendado em {rem.createdAt} {rem.createdBy ? `por ${rem.createdBy}` : ''}
                          </div>

                          <div className="flex items-center gap-1.5">
                            {/* Trigger Audio Notification Test Button */}
                            <button
                              type="button"
                              onClick={() => handleTriggerTestAlert(rem)}
                              title="Testar notificação sonora e push para a equipe"
                              className="p-1.5 text-teal-700 hover:text-teal-900 bg-teal-50 hover:bg-teal-100 rounded-lg transition-colors text-[11px] font-bold flex items-center gap-1 border border-teal-200"
                            >
                              <Volume2 className="w-3.5 h-3.5" />
                              <span className="hidden sm:inline">Alertar Equipe</span>
                            </button>

                            {/* Edit Button */}
                            <button
                              type="button"
                              onClick={() => handleStartEditReminder(rem)}
                              className="p-1.5 text-zinc-600 hover:text-zinc-900 bg-zinc-100 hover:bg-zinc-200 rounded-lg transition-colors text-[11px] font-semibold flex items-center gap-1"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                              <span className="hidden sm:inline">Editar</span>
                            </button>

                            {/* Delete Button */}
                            {onDeleteReminder && (
                              <button
                                type="button"
                                onClick={() => {
                                  if (confirm(`Deseja excluir o lembrete "${rem.title}"?`)) {
                                    onDeleteReminder(rem.id);
                                  }
                                }}
                                className="p-1.5 text-rose-600 hover:text-rose-800 bg-rose-50 hover:bg-rose-100 rounded-lg transition-colors"
                                title="Excluir Lembrete"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}

                            {/* Complete / Reopen Toggle Button */}
                            {onToggleReminder && (
                              <button
                                type="button"
                                onClick={() => onToggleReminder(rem.id)}
                                className={`px-2.5 py-1 text-xs font-extrabold rounded-lg transition-all flex items-center gap-1 shadow-2xs ${
                                  rem.completed
                                    ? 'bg-zinc-200 text-zinc-700 hover:bg-zinc-300'
                                    : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                                }`}
                              >
                                {rem.completed ? (
                                  <>
                                    <Clock className="w-3.5 h-3.5" />
                                    <span>Reabrir</span>
                                  </>
                                ) : (
                                  <>
                                    <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                                    <span>Concluir</span>
                                  </>
                                )}
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: SOAP EVOLUTIONS */}
          {activeTab === 'soap' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
                <div>
                  <h3 className="text-xs font-bold text-zinc-900 uppercase tracking-wider">
                    Histórico de Evoluções Clínicas ({residentEvolutions.length})
                  </h3>
                  <p className="text-[11px] text-zinc-500 font-medium">
                    Registro sequencial padronizado pelo método SOAP para auditoria e prontuário.
                  </p>
                </div>
                
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setExportEvolutionId(null);
                      setShowExportModal(true);
                    }}
                    className="py-1.5 px-3 bg-white hover:bg-teal-50 text-teal-800 border border-teal-300 hover:border-teal-400 font-extrabold text-xs rounded-xl flex items-center gap-1.5 shadow-2xs transition-all"
                  >
                    <Download className="w-3.5 h-3.5 text-teal-600" />
                    <span>Exportar Resumo SOAP (PDF)</span>
                  </button>

                  <button
                    onClick={() => onOpenNewEvolution(resident.id)}
                    className="py-1.5 px-3 bg-teal-600 hover:bg-teal-700 text-white font-extrabold text-xs rounded-xl flex items-center gap-1.5 shadow-2xs transition-all"
                  >
                    <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                    <span>Nova Evolução SOAP</span>
                  </button>
                </div>
              </div>

              {residentEvolutions.length === 0 ? (
                <div className="p-8 text-center bg-zinc-50 rounded-2xl border border-zinc-200 space-y-2">
                  <FileText className="w-8 h-8 text-zinc-300 mx-auto" />
                  <p className="text-xs font-bold text-zinc-700">
                    Nenhuma evolução registrada recentemente para este residente.
                  </p>
                  <p className="text-[11px] text-zinc-500 font-medium">
                    Clique em "Nova Evolução SOAP" para registrar o primeiro relato multiprofissional.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {residentEvolutions.map((evo, idx) => (
                    <div key={evo.id} className="p-4 bg-zinc-50/70 border border-zinc-200 rounded-2xl space-y-2.5 shadow-2xs hover:border-teal-300 transition-colors">
                      <div className="flex flex-wrap items-center justify-between border-b border-zinc-200 pb-2 gap-2">
                        <div className="flex items-center gap-2">
                          <span className="w-5 h-5 rounded-full bg-teal-100 text-teal-800 text-[10px] font-black flex items-center justify-center">
                            #{residentEvolutions.length - idx}
                          </span>
                          <div>
                            <span className="text-xs font-bold text-teal-900">{evo.author}</span>
                            <span className="text-[11px] text-zinc-500 font-medium ml-1.5">({evo.role})</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="text-[11px] font-semibold text-zinc-600 bg-white px-2 py-0.5 rounded-md border border-zinc-200">
                            {evo.date} às {evo.time}
                          </span>

                          <button
                            type="button"
                            onClick={() => handleExportPdf(evo.id)}
                            title="Exportar esta evolução individual em PDF"
                            className="p-1 text-teal-700 hover:text-teal-900 bg-teal-50 hover:bg-teal-100 border border-teal-200 rounded-lg text-[10px] font-bold flex items-center gap-1 transition-colors"
                          >
                            <Download className="w-3 h-3" />
                            <span className="hidden sm:inline">PDF Desta</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handlePrintDocument(evo.id)}
                            title="Imprimir esta evolução individual"
                            className="p-1 text-zinc-700 hover:text-zinc-900 bg-zinc-100 hover:bg-zinc-200 border border-zinc-300 rounded-lg text-[10px] font-bold flex items-center gap-1 transition-colors"
                          >
                            <Printer className="w-3 h-3" />
                            <span className="hidden sm:inline">Imprimir</span>
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs pt-1">
                        <div className="p-2.5 bg-white rounded-xl border border-zinc-200/80 shadow-2xs">
                          <strong className="text-teal-700 block text-[10px] uppercase font-black tracking-wider">S - Subjetivo</strong>
                          <span className="text-zinc-800 font-medium leading-relaxed">{evo.soap.subjective}</span>
                        </div>
                        <div className="p-2.5 bg-white rounded-xl border border-zinc-200/80 shadow-2xs">
                          <strong className="text-teal-700 block text-[10px] uppercase font-black tracking-wider">O - Objetivo</strong>
                          <span className="text-zinc-800 font-medium leading-relaxed">{evo.soap.objective}</span>
                        </div>
                        <div className="p-2.5 bg-white rounded-xl border border-zinc-200/80 shadow-2xs">
                          <strong className="text-teal-700 block text-[10px] uppercase font-black tracking-wider">A - Avaliação</strong>
                          <span className="text-zinc-800 font-medium leading-relaxed">{evo.soap.assessment}</span>
                        </div>
                        <div className="p-2.5 bg-white rounded-xl border border-zinc-200/80 shadow-2xs">
                          <strong className="text-teal-700 block text-[10px] uppercase font-black tracking-wider">P - Plano</strong>
                          <span className="text-zinc-800 font-medium leading-relaxed">{evo.soap.plan}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 4: MAR MEDICATIONS */}
          {activeTab === 'meds' && (
            <div className="space-y-3">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-950 font-bold">
                <div className="flex items-center gap-2">
                  <span className="p-1 bg-amber-200/80 rounded-md text-amber-900 text-[10px]">12/12h</span>
                  <span>Aprazamento Padronizado: Todos os residentes tomam medicação às 08:00h e 20:00h.</span>
                </div>
                <span className="text-[10px] text-amber-800 font-medium">Intervalo Fixo: 12 Horas</span>
              </div>

              <h3 className="text-xs font-bold text-zinc-900 uppercase tracking-wider mb-2">
                Grade de Aprazamento de Medicamentos (MAR)
              </h3>
              {residentMeds.length === 0 ? (
                <p className="p-6 text-xs text-zinc-500 font-medium text-center bg-zinc-50 rounded-xl border border-zinc-200">
                  Sem prescrições medicamentosas registradas no momento.
                </p>
              ) : (
                <div className="space-y-3">
                  {residentMeds.map((med) => (
                    <div key={med.id} className="p-4 bg-zinc-50/70 border border-zinc-200 rounded-2xl space-y-2">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="text-xs font-bold text-zinc-900">{med.medicationName} ({med.dosage})</h4>
                          <p className="text-[11px] text-zinc-500 font-medium">Via: {med.route} • Frequência: {med.frequency} • Prescrito por: {med.prescribedBy}</p>
                        </div>
                        {med.isControlled && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 border border-amber-200">
                            Psicotrópico
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2 pt-2 border-t border-zinc-200/80">
                        <span className="text-[10px] font-bold text-zinc-500">Horários de Dose:</span>
                        {med.scheduledDoses.map((dose) => (
                          <div key={dose.id} className="flex items-center gap-1.5">
                            <span className="text-xs font-bold text-zinc-800 bg-white px-2 py-1 rounded-md border border-zinc-200">
                              {dose.time}
                            </span>
                            {dose.status === 'Ministrado' ? (
                              <span className="text-[10px] font-bold px-2 py-1 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200">
                                ✓ Ministrado
                              </span>
                            ) : (
                              <button
                                onClick={() => onUpdateDoseStatus(med.id, dose.id, 'Ministrado')}
                                className="text-[10px] font-bold px-2 py-1 rounded-md bg-teal-600 hover:bg-teal-700 text-white transition-colors shadow-2xs"
                              >
                                Dar Check-off
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 5: CONTACTS */}
          {activeTab === 'contacts' && (
            <div className="space-y-4">
              <div className="p-4 bg-zinc-50/70 border border-zinc-200 rounded-2xl space-y-2">
                <h3 className="text-xs font-bold text-teal-800 uppercase tracking-wider mb-1">
                  Contato de Emergência / Família Responsável
                </h3>
                {resident.emergencyContact ? (
                  <>
                    <p className="text-sm font-bold text-zinc-900">{resident.emergencyContact.name}</p>
                    <p className="text-xs text-zinc-600 font-medium">Vínculo: {resident.emergencyContact.relationship}</p>
                    <div className="pt-2 flex items-center gap-2">
                      <a
                        href={`tel:${resident.emergencyContact.phone}`}
                        className="py-1.5 px-3 bg-teal-600 hover:bg-teal-700 text-white font-extrabold text-xs rounded-xl flex items-center gap-1.5 w-fit shadow-2xs"
                      >
                        <Phone className="w-3.5 h-3.5 stroke-[2.5]" />
                        <span>Ligar: {resident.emergencyContact.phone}</span>
                      </a>
                    </div>
                  </>
                ) : (
                  <p className="text-xs text-zinc-500">Nenhum contato de emergência cadastrado.</p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Modal de Configuração e Exportação de PDF */}
        {showExportModal && (
          <div className="fixed inset-0 z-60 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
            <div className="bg-white rounded-2xl border border-zinc-200 shadow-2xl max-w-lg w-full overflow-hidden animate-in zoom-in-95 duration-150">
              {/* Header */}
              <div className="p-4 bg-teal-900 text-white flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-teal-800 rounded-lg text-teal-200">
                    <FileDown className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold">Exportar Resumo Clínico em PDF</h3>
                    <p className="text-[11px] text-teal-200 font-medium">
                      Prontuário de {resident.name} ({resident.room})
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowExportModal(false)}
                  className="p-1 text-teal-300 hover:text-white rounded-lg hover:bg-teal-800 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Form Body */}
              <div className="p-5 space-y-4 text-xs">
                {/* Evolution Selection */}
                <div>
                  <label className="font-bold text-zinc-800 block mb-1.5">
                    Escopo das Evoluções Clínicas (SOAP)
                  </label>
                  <div className="space-y-1.5">
                    <label className="flex items-center gap-2 p-2 bg-zinc-50 border border-zinc-200 rounded-xl cursor-pointer hover:bg-teal-50/50">
                      <input
                        type="radio"
                        name="exportScope"
                        checked={exportEvolutionId === null}
                        onChange={() => setExportEvolutionId(null)}
                        className="text-teal-600 focus:ring-teal-500"
                      />
                      <span className="font-bold text-zinc-800">
                        Histórico Completo ({residentEvolutions.length} evoluções registradas)
                      </span>
                    </label>

                    {residentEvolutions.length > 0 && (
                      <label className="flex items-center gap-2 p-2 bg-zinc-50 border border-zinc-200 rounded-xl cursor-pointer hover:bg-teal-50/50">
                        <input
                          type="radio"
                          name="exportScope"
                          checked={exportEvolutionId === residentEvolutions[0]?.id}
                          onChange={() => setExportEvolutionId(residentEvolutions[0]?.id || null)}
                          className="text-teal-600 focus:ring-teal-500"
                        />
                        <span className="font-semibold text-zinc-700">
                          Apenas a Última Evolução ({residentEvolutions[0]?.date} às {residentEvolutions[0]?.time} por {residentEvolutions[0]?.author})
                        </span>
                      </label>
                    )}

                    {residentEvolutions.length > 1 && (
                      <div className="pt-1">
                        <label className="text-[11px] font-bold text-zinc-600 block mb-1">
                          Ou escolha uma evolução específica:
                        </label>
                        <select
                          value={exportEvolutionId || ''}
                          onChange={(e) => setExportEvolutionId(e.target.value || null)}
                          className="w-full h-8 px-2.5 bg-white border border-zinc-300 rounded-lg text-xs font-medium focus:ring-2 focus:ring-teal-500 focus:outline-none"
                        >
                          <option value="">-- Todas as evoluções (padrão) --</option>
                          {residentEvolutions.map((e, idx) => (
                            <option key={e.id} value={e.id}>
                              #{residentEvolutions.length - idx} • {e.date} às {e.time} — {e.author} ({e.role})
                            </option>
                          ))}
                        </select>
                      </div>
                    )}
                  </div>
                </div>

                {/* Additional Sections */}
                <div>
                  <label className="font-bold text-zinc-800 block mb-1.5">
                    Seções Clínicas Complementares
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <label className="flex items-center gap-2 p-2 bg-zinc-50 border border-zinc-200 rounded-xl cursor-pointer hover:bg-teal-50/50 font-medium text-zinc-700">
                      <input
                        type="checkbox"
                        checked={includeMedsInExport}
                        onChange={(e) => setIncludeMedsInExport(e.target.checked)}
                        className="rounded text-teal-600 focus:ring-teal-500"
                      />
                      <span>Grade Medicamentosa ({residentMeds.length})</span>
                    </label>

                    <label className="flex items-center gap-2 p-2 bg-zinc-50 border border-zinc-200 rounded-xl cursor-pointer hover:bg-teal-50/50 font-medium text-zinc-700">
                      <input
                        type="checkbox"
                        checked={includeRemindersInExport}
                        onChange={(e) => setIncludeRemindersInExport(e.target.checked)}
                        className="rounded text-teal-600 focus:ring-teal-500"
                      />
                      <span>Agenda & Consultas ({residentReminders.length})</span>
                    </label>
                  </div>
                </div>

                {/* Custom Institution & Signer */}
                <div className="space-y-2 pt-1 border-t border-zinc-200">
                  <div>
                    <label className="text-[11px] font-bold text-zinc-700 block mb-1">
                      Nome da Instituição / Unidade de Saúde
                    </label>
                    <input
                      type="text"
                      value={exportInstitution}
                      onChange={(e) => setExportInstitution(e.target.value)}
                      placeholder="Ex: SERVIÇO DE RESIDÊNCIA TERAPÊUTICA (SRT) - SUS"
                      className="w-full h-8 px-2.5 bg-white border border-zinc-300 rounded-lg text-xs font-medium focus:ring-2 focus:ring-teal-500 focus:outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div>
                      <label className="text-[11px] font-bold text-zinc-700 block mb-1">
                        Profissional Emissor / RT
                      </label>
                      <input
                        type="text"
                        value={exportSignerName}
                        onChange={(e) => setExportSignerName(e.target.value)}
                        placeholder="Ex: Enf. Mariana Castro (RT)"
                        className="w-full h-8 px-2.5 bg-white border border-zinc-300 rounded-lg text-xs font-medium focus:ring-2 focus:ring-teal-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-bold text-zinc-700 block mb-1">
                        Cargo / Conselho
                      </label>
                      <input
                        type="text"
                        value={exportSignerRole}
                        onChange={(e) => setExportSignerRole(e.target.value)}
                        placeholder="Ex: COREN/SC 123.456"
                        className="w-full h-8 px-2.5 bg-white border border-zinc-300 rounded-lg text-xs font-medium focus:ring-2 focus:ring-teal-500 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer Actions */}
              <div className="p-4 bg-zinc-50 border-t border-zinc-200 flex flex-wrap items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => setShowExportModal(false)}
                  className="px-3.5 py-2 text-xs font-semibold text-zinc-600 hover:text-zinc-900 rounded-xl hover:bg-zinc-200/60 transition-colors"
                >
                  Cancelar
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handlePrintDocument()}
                    className="px-3.5 py-2 bg-white hover:bg-zinc-100 text-zinc-800 border border-zinc-300 font-extrabold text-xs rounded-xl shadow-2xs transition-all flex items-center gap-1.5"
                  >
                    <Printer className="w-3.5 h-3.5 text-zinc-600" />
                    <span>Visualizar & Imprimir</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleExportPdf()}
                    className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white font-extrabold text-xs rounded-xl shadow-xs transition-all flex items-center gap-1.5"
                  >
                    <Download className="w-3.5 h-3.5 stroke-[2.5]" />
                    <span>Baixar Arquivo PDF</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
