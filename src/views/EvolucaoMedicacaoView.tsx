import React, { useState, useMemo } from 'react';
import { 
  Pill, 
  Search, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  XCircle, 
  HelpCircle, 
  FileText, 
  User, 
  ShieldAlert, 
  Package, 
  Sparkles, 
  Check, 
  Filter,
  Info,
  Calendar,
  AlertOctagon,
  ChevronRight,
  MessageSquare,
  Activity,
  Printer
} from 'lucide-react';
import { Resident, MedicationMAR, DoseStatus, ClinicalEvolution, ClinicalRole } from '../types';
import { MedicationDashboardPanel } from '../components/MedicationDashboardPanel';
import { MedicationLabelPrinterModal } from '../components/MedicationLabelPrinterModal';

interface EvolucaoMedicacaoViewProps {
  residents: Resident[];
  medications: MedicationMAR[];
  onUpdateDoseStatus: (medicationId: string, doseId: string, newStatus: DoseStatus, notes?: string) => void;
  onSaveEvolution?: (evolution: ClinicalEvolution) => void;
  onOpenNewEvolutionModal?: (residentId?: string) => void;
  onOpenResident360?: (residentId: string) => void;
}

interface JustificationModalState {
  isOpen: boolean;
  medicationId: string;
  doseId: string;
  residentId: string;
  residentName: string;
  room: string;
  medicationName: string;
  dosage: string;
  time: string;
  targetStatus: 'Parcial' | 'Recusado';
}

export const EvolucaoMedicacaoView: React.FC<EvolucaoMedicacaoViewProps> = ({
  residents,
  medications,
  onUpdateDoseStatus,
  onSaveEvolution,
  onOpenNewEvolutionModal,
  onOpenResident360,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'dashboard' | 'residentes'>('dashboard');
  const [shiftFilter, setShiftFilter] = useState<'08:00' | '20:00' | 'Todos'>('08:00');
  const [searchQuery, setSearchQuery] = useState('');
  const [residentFilter, setResidentFilter] = useState<'Todos' | 'Pendentes' | 'ComRecusaParcial' | 'Criticos'>('Todos');
  
  // Label printer state
  const [isPrinterOpen, setIsPrinterOpen] = useState(false);
  const [printerResidentId, setPrinterResidentId] = useState<string | undefined>();

  const openPrinterForResident = (resId?: string) => {
    setPrinterResidentId(resId);
    setIsPrinterOpen(true);
  };
  
  // Modal state for Partial / Refusal Justification
  const [modalState, setModalState] = useState<JustificationModalState | null>(null);
  const [selectedReasonPreset, setSelectedReasonPreset] = useState<string>('');
  const [customExplanation, setCustomExplanation] = useState<string>('');
  const [autoGenerateSOAP, setAutoGenerateSOAP] = useState<boolean>(true);

  // Preset reasons for quick selection
  const refusalPresets = [
    'Residente recusou verbalmente a medicação',
    'Residente agitado / desorientado no momento da abordagem',
    'Cuspiu o comprimido logo após a tentativa de ingestão',
    'Relatou náusea / desconforto gástrico importante',
    'Dormindo profundamente / Sem resposta ao estímulo',
    'Dificuldade severa de deglutição (Disfagia aguda)',
    'Alega já ter tomado ou se recusa a aceitar medicação psicotrópica'
  ];

  const partialPresets = [
    'Ingeriu metade da dose e cuspiu o restante',
    'Aceitou apenas parte da solução/xarope prescrito',
    'Apresentou ânsia de vômito durante a administração',
    'Pausa orientada por desconforto e recusa de prosseguir'
  ];

  // Group medications by resident
  const residentMedsList = useMemo(() => {
    return residents.map(resident => {
      const resMeds = medications.filter(m => m.residentId === resident.id);
      
      // Calculate pending, partial, refused, administered
      let pendingCount = 0;
      let administeredCount = 0;
      let partialCount = 0;
      let refusedCount = 0;

      resMeds.forEach(m => {
        m.scheduledDoses.forEach(d => {
          if (shiftFilter !== 'Todos' && d.time !== shiftFilter) return;
          if (d.status === 'Pendente' || d.status === 'Atrasado') pendingCount++;
          else if (d.status === 'Ministrado') administeredCount++;
          else if (d.status === 'Parcial') partialCount++;
          else if (d.status === 'Recusado') refusedCount++;
        });
      });

      return {
        resident,
        medications: resMeds,
        pendingCount,
        administeredCount,
        partialCount,
        refusedCount,
        totalDoses: pendingCount + administeredCount + partialCount + refusedCount
      };
    });
  }, [residents, medications, shiftFilter]);

  // Overall Shift Metrics
  const metrics = useMemo(() => {
    let totalDoses = 0;
    let totalMinistrado = 0;
    let totalParcial = 0;
    let totalRecusado = 0;
    let totalPendente = 0;

    medications.forEach(m => {
      m.scheduledDoses.forEach(d => {
        if (shiftFilter !== 'Todos' && d.time !== shiftFilter) return;
        totalDoses++;
        if (d.status === 'Ministrado') totalMinistrado++;
        else if (d.status === 'Parcial') totalParcial++;
        else if (d.status === 'Recusado') totalRecusado++;
        else totalPendente++;
      });
    });

    return {
      totalDoses,
      totalMinistrado,
      totalParcial,
      totalRecusado,
      totalPendente,
      adherenceRate: totalDoses > 0 ? Math.round((totalMinistrado / totalDoses) * 100) : 100
    };
  }, [medications, shiftFilter]);

  // Filtered residents list
  const filteredResidentMeds = useMemo(() => {
    return residentMedsList.filter(item => {
      const matchesSearch = 
        item.resident.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.resident.room.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.medications.some(m => m.medicationName.toLowerCase().includes(searchQuery.toLowerCase()));

      if (!matchesSearch) return false;

      if (residentFilter === 'Pendentes') return item.pendingCount > 0;
      if (residentFilter === 'ComRecusaParcial') return item.partialCount > 0 || item.refusedCount > 0;
      if (residentFilter === 'Criticos') return item.resident.riskScore === 'Crítico' || item.resident.news2?.riskLevel === 'Crítico';

      return true;
    });
  }, [residentMedsList, searchQuery, residentFilter]);

  // Open Justification Modal
  const handleOpenJustificationModal = (
    med: MedicationMAR, 
    doseId: string, 
    doseTime: string, 
    targetStatus: 'Parcial' | 'Recusado'
  ) => {
    setModalState({
      isOpen: true,
      medicationId: med.id,
      doseId,
      residentId: med.residentId,
      residentName: med.residentName,
      room: med.room,
      medicationName: med.medicationName,
      dosage: med.dosage,
      time: doseTime,
      targetStatus
    });
    setSelectedReasonPreset('');
    setCustomExplanation('');
    setAutoGenerateSOAP(true);
  };

  // Submit Justification
  const handleSubmitJustification = () => {
    if (!modalState) return;

    const finalNotes = [selectedReasonPreset, customExplanation].filter(Boolean).join('. ');

    if (!finalNotes) {
      alert('Por favor, selecione ou digite uma justificativa para registrar o evento de medicação.');
      return;
    }

    // 1. Update Medication Dose Status
    onUpdateDoseStatus(
      modalState.medicationId,
      modalState.doseId,
      modalState.targetStatus,
      finalNotes
    );

    // 2. Generate Automatic SOAP Evolution if checked
    if (autoGenerateSOAP && onSaveEvolution) {
      const isRefusal = modalState.targetStatus === 'Recusado';
      const statusTitle = isRefusal ? 'RECUSA DE MEDICAÇÃO' : 'ADMINISTRAÇÃO PARCIAL DE MEDICAÇÃO';
      
      const newEvolution: ClinicalEvolution = {
        id: `evo-med-${Date.now()}`,
        residentId: modalState.residentId,
        residentName: modalState.residentName,
        room: modalState.room,
        date: new Date().toLocaleDateString('pt-BR'),
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        author: 'Enf. Mariana Castro',
        role: 'Enfermeiro RT' as ClinicalRole,
        status: 'Finalizado',
        tags: ['Medicação 12/12h', modalState.targetStatus, 'Administração MAR'],
        soap: {
          subjective: isRefusal
            ? `Residente apresentou recusa no momento da oferta do medicamento ${modalState.medicationName} (${modalState.dosage}) previsto para as ${modalState.time}h. Motivo relatado: ${finalNotes}`
            : `Residente aceitou parcialmente a dose do medicamento ${modalState.medicationName} (${modalState.dosage}) às ${modalState.time}h. Motivo: ${finalNotes}`,
          objective: `Aferição de administração MAR (Protocolo 12/12h). Status da dose registrado como '${modalState.targetStatus}'. Justificativa registrada em prontuário.`,
          assessment: isRefusal
            ? `Recusa medicamentosa registrada. Riscos de descontinuidade do tratamento e alteração de sintomas monitorados pela enfermagem.`
            : `Administração parcial efetuada. Residente mantido sob vigilância para reavaliação de aceitação nas próximas horários.`,
          plan: `Manter observação direta do residente no turno. Orientar equipe do próximo plantão sobre o ocorrido. Comunicar RT caso permaneça com recusa.`
        }
      };

      onSaveEvolution(newEvolution);
    }

    setModalState(null);
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200">
      {/* Header Banner */}
      <div className="p-5 bg-gradient-to-r from-teal-900 via-teal-800 to-emerald-900 text-white rounded-2xl shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-2 bg-teal-700/60 rounded-xl border border-teal-500/40">
              <Pill className="w-5 h-5 text-teal-200" />
            </span>
            <span className="text-[10px] font-extrabold text-teal-200 bg-teal-800/80 px-2 py-0.5 rounded border border-teal-600/50 uppercase tracking-wide">
              Módulo de Checagem 12/12h
            </span>
          </div>
          <h1 className="text-xl font-black tracking-tight text-white">
            Evolução e Checagem de Medicação dos Residentes
          </h1>
          <p className="text-xs text-teal-200 mt-0.5">
            Registro estruturado de administração, doses parciais e recusas com justificativa clínica e evolução SOAP automática.
          </p>
        </div>

        {/* Shift Filter Buttons */}
        <div className="flex items-center gap-2 bg-teal-950/60 p-1.5 rounded-xl border border-teal-700/60">
          <span className="text-[11px] font-bold text-teal-300 px-2 hidden sm:inline">Turno:</span>
          <button
            onClick={() => setShiftFilter('08:00')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              shiftFilter === '08:00'
                ? 'bg-amber-500 text-teal-950 shadow-xs'
                : 'text-teal-200 hover:text-white hover:bg-teal-800/50'
            }`}
          >
            <span>☀️ Manhã (08:00h)</span>
          </button>
          <button
            onClick={() => setShiftFilter('20:00')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              shiftFilter === '20:00'
                ? 'bg-purple-500 text-white shadow-xs'
                : 'text-teal-200 hover:text-white hover:bg-teal-800/50'
            }`}
          >
            <span>🌙 Noite (20:00h)</span>
          </button>
          <button
            onClick={() => setShiftFilter('Todos')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              shiftFilter === 'Todos'
                ? 'bg-white text-teal-950 shadow-xs'
                : 'text-teal-200 hover:text-white hover:bg-teal-800/50'
            }`}
          >
            <span>Todos</span>
          </button>

          <button
            onClick={() => openPrinterForResident()}
            className="px-3 py-1.5 rounded-lg text-xs font-black bg-emerald-500 hover:bg-emerald-400 text-teal-950 transition-all flex items-center gap-1.5 shadow-2xs shrink-0 ml-1"
            title="Abrir Central de Impressão de Etiquetas de Medicação"
          >
            <Printer className="w-3.5 h-3.5 text-teal-950" />
            <span className="hidden md:inline">🖨️ Imprimir Etiquetas</span>
          </button>
        </div>
      </div>

      {/* Metrics Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="p-3.5 bg-white border border-zinc-200/90 rounded-2xl shadow-2xs space-y-1">
          <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">
            Doses do Turno
          </span>
          <div className="flex items-baseline justify-between">
            <span className="text-xl font-black text-zinc-900">{metrics.totalDoses}</span>
            <span className="text-[10px] font-bold text-zinc-500">12/12h</span>
          </div>
        </div>

        <div className="p-3.5 bg-emerald-50/70 border border-emerald-200/90 rounded-2xl shadow-2xs space-y-1">
          <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider block">
            Tomou Completo
          </span>
          <div className="flex items-baseline justify-between">
            <span className="text-xl font-black text-emerald-900">{metrics.totalMinistrado}</span>
            <span className="text-[10px] font-extrabold text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded">
              {metrics.adherenceRate}%
            </span>
          </div>
        </div>

        <div className="p-3.5 bg-amber-50/70 border border-amber-200/90 rounded-2xl shadow-2xs space-y-1">
          <span className="text-[10px] font-bold text-amber-800 uppercase tracking-wider block">
            Tomou Parcial
          </span>
          <div className="flex items-baseline justify-between">
            <span className="text-xl font-black text-amber-900">{metrics.totalParcial}</span>
            <span className="text-[10px] font-bold text-amber-700">Com Justificativa</span>
          </div>
        </div>

        <div className="p-3.5 bg-rose-50/70 border border-rose-200/90 rounded-2xl shadow-2xs space-y-1">
          <span className="text-[10px] font-bold text-rose-800 uppercase tracking-wider block">
            Recusou Dose
          </span>
          <div className="flex items-baseline justify-between">
            <span className="text-xl font-black text-rose-900">{metrics.totalRecusado}</span>
            <span className="text-[10px] font-bold text-rose-700">Com Justificativa</span>
          </div>
        </div>

        <div className="p-3.5 bg-blue-50/70 border border-blue-200/90 rounded-2xl shadow-2xs space-y-1 col-span-2 sm:col-span-1">
          <span className="text-[10px] font-bold text-blue-800 uppercase tracking-wider block">
            Doses Pendentes
          </span>
          <div className="flex items-baseline justify-between">
            <span className="text-xl font-black text-blue-900">{metrics.totalPendente}</span>
            <span className="text-[10px] font-bold text-blue-700">Aguardando</span>
          </div>
        </div>
      </div>

      {/* Sub-Tab Navigation Bar */}
      <div className="flex items-center gap-2 border-b border-zinc-200 pb-2 text-xs font-bold">
        <button
          onClick={() => setActiveSubTab('dashboard')}
          className={`px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 shrink-0 ${
            activeSubTab === 'dashboard'
              ? 'bg-teal-800 text-white shadow-xs'
              : 'bg-white text-zinc-600 hover:bg-zinc-100 border border-zinc-200'
          }`}
        >
          <Activity className="w-4 h-4" />
          <span>Painel Dashboard por Horários de Medicação</span>
          <span className="text-[10px] font-extrabold bg-amber-400 text-teal-950 px-2 py-0.5 rounded-full ml-1">
            Administração Directa
          </span>
        </button>

        <button
          onClick={() => setActiveSubTab('residentes')}
          className={`px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 shrink-0 ${
            activeSubTab === 'residentes'
              ? 'bg-teal-800 text-white shadow-xs'
              : 'bg-white text-zinc-600 hover:bg-zinc-100 border border-zinc-200'
          }`}
        >
          <User className="w-4 h-4" />
          <span>Visão Individual por Residente (Cartão MAR)</span>
        </button>
      </div>

      {activeSubTab === 'dashboard' ? (
        <MedicationDashboardPanel
          residents={residents}
          medications={medications}
          onUpdateDoseStatus={onUpdateDoseStatus}
          onOpenNewEvolutionModal={onOpenNewEvolutionModal}
        />
      ) : (
        <>
          {/* Filter and Search Bar */}
          <div className="p-4 bg-white border border-zinc-200/90 rounded-2xl shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar por nome do residente, leito ou remédio..."
            className="w-full bg-zinc-50 text-zinc-900 text-xs pl-9 pr-3 py-2 rounded-xl border border-zinc-200 focus:outline-none focus:border-teal-500"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto text-xs no-scrollbar">
          <span className="text-zinc-500 font-bold mr-1 shrink-0">Filtrar Residentes:</span>
          <button
            onClick={() => setResidentFilter('Todos')}
            className={`px-3 py-1.5 rounded-xl font-bold transition-colors shrink-0 ${
              residentFilter === 'Todos'
                ? 'bg-teal-700 text-white shadow-2xs'
                : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
            }`}
          >
            Todos ({residents.length})
          </button>
          <button
            onClick={() => setResidentFilter('Pendentes')}
            className={`px-3 py-1.5 rounded-xl font-bold transition-colors shrink-0 ${
              residentFilter === 'Pendentes'
                ? 'bg-blue-600 text-white shadow-2xs'
                : 'bg-blue-50 text-blue-800 hover:bg-blue-100 border border-blue-200/80'
            }`}
          >
            Apenas Pendentes
          </button>
          <button
            onClick={() => setResidentFilter('ComRecusaParcial')}
            className={`px-3 py-1.5 rounded-xl font-bold transition-colors shrink-0 ${
              residentFilter === 'ComRecusaParcial'
                ? 'bg-rose-600 text-white shadow-2xs'
                : 'bg-rose-50 text-rose-800 hover:bg-rose-100 border border-rose-200/80'
            }`}
          >
            Com Recusa / Parcial
          </button>
          <button
            onClick={() => setResidentFilter('Criticos')}
            className={`px-3 py-1.5 rounded-xl font-bold transition-colors shrink-0 ${
              residentFilter === 'Criticos'
                ? 'bg-amber-600 text-white shadow-2xs'
                : 'bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-200/80'
            }`}
          >
            Residentes Críticos
          </button>
        </div>
      </div>

      {/* Residents List */}
      <div className="space-y-6">
        {filteredResidentMeds.length === 0 ? (
          <div className="p-12 text-center bg-white border border-zinc-200/90 rounded-2xl space-y-2">
            <Pill className="w-8 h-8 text-zinc-300 mx-auto" />
            <p className="text-sm font-bold text-zinc-700">Nenhum residente encontrado para os filtros selecionados.</p>
            <p className="text-xs text-zinc-500">Tente alterar a busca ou o filtro de horário acima.</p>
          </div>
        ) : (
          filteredResidentMeds.map(({ resident, medications: resMeds, pendingCount, administeredCount, partialCount, refusedCount }) => (
            <div
              key={resident.id}
              className="p-5 bg-white border border-zinc-200/90 rounded-2xl shadow-xs space-y-4 hover:border-teal-300 transition-all"
            >
              {/* Resident Card Top Header */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-zinc-100 pb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-teal-100 text-teal-800 font-extrabold flex items-center justify-center text-sm border border-teal-200 shrink-0">
                    {resident.name.substring(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-base font-black text-zinc-900">{resident.name}</h2>
                      <span className="text-xs font-extrabold text-teal-800 bg-teal-50 px-2 py-0.5 rounded-md border border-teal-200">
                        {resident.room}
                      </span>
                      {resident.riskScore === 'Crítico' && (
                        <span className="text-[10px] font-extrabold px-2 py-0.5 rounded bg-rose-100 text-rose-800 border border-rose-300 animate-pulse">
                          🚨 NEWS2: CRÍTICO
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-zinc-500 mt-0.5">
                      {resident.primaryDiagnosis} • Idade: {resident.age} anos
                    </p>
                  </div>
                </div>

                {/* Quick Action & Progress Badge */}
                <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
                  <div className="flex items-center gap-1.5 text-xs font-bold">
                    <span className="px-2 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-lg">
                      {administeredCount} Tomou
                    </span>
                    {partialCount > 0 && (
                      <span className="px-2 py-1 bg-amber-50 text-amber-800 border border-amber-200 rounded-lg">
                        {partialCount} Parcial
                      </span>
                    )}
                    {refusedCount > 0 && (
                      <span className="px-2 py-1 bg-rose-50 text-rose-800 border border-rose-200 rounded-lg">
                        {refusedCount} Recusou
                      </span>
                    )}
                    {pendingCount > 0 && (
                      <span className="px-2 py-1 bg-blue-50 text-blue-800 border border-blue-200 rounded-lg">
                        {pendingCount} Pendente
                      </span>
                    )}
                  </div>

                  <button
                    onClick={() => openPrinterForResident(resident.id)}
                    className="px-2.5 py-1.5 bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200 text-xs font-bold rounded-xl transition-colors flex items-center gap-1 shrink-0"
                    title="Imprimir etiquetas de medicação deste residente"
                  >
                    <Printer className="w-3.5 h-3.5 text-teal-600" />
                    <span className="hidden sm:inline">Etiquetas</span>
                  </button>

                  {onOpenNewEvolutionModal && (
                    <button
                      onClick={() => onOpenNewEvolutionModal(resident.id)}
                      className="px-3 py-1.5 bg-purple-50 hover:bg-purple-100 text-purple-900 border border-purple-200 text-xs font-bold rounded-xl transition-colors flex items-center gap-1 shrink-0"
                      title="Registrar Nota SOAP no Prontuário"
                    >
                      <FileText className="w-3.5 h-3.5 text-purple-600" />
                      <span className="hidden sm:inline">Evolução SOAP</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Medications List for this Resident */}
              <div className="space-y-3">
                {resMeds.length === 0 ? (
                  <p className="text-xs text-zinc-500 italic p-3 bg-zinc-50 rounded-xl">
                    Nenhuma medicação cadastrada para este residente no horário selecionado.
                  </p>
                ) : (
                  resMeds.map((med) => {
                    // Filter doses for selected shift
                    const targetDoses = med.scheduledDoses.filter(d => 
                      shiftFilter === 'Todos' ? true : d.time === shiftFilter
                    );

                    if (targetDoses.length === 0) return null;

                    return (
                      <div
                        key={med.id}
                        className="p-4 bg-zinc-50/70 border border-zinc-200/80 rounded-xl space-y-3"
                      >
                        {/* Med Info Header */}
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-zinc-200/60 pb-2">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-extrabold text-zinc-900">{med.medicationName}</span>
                              <span className="text-xs font-bold text-teal-700 bg-teal-100/80 px-2 py-0.5 rounded">
                                {med.dosage}
                              </span>
                              <span className="text-[10px] text-zinc-600 bg-zinc-200 px-1.5 py-0.5 rounded font-semibold">
                                {med.route}
                              </span>
                              {med.isControlled && (
                                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-100 text-amber-900 border border-amber-300">
                                  🔒 Psicotrópico
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] text-zinc-500 mt-0.5">
                              Frequência: {med.frequency} • Prescrito por: {med.prescribedBy}
                            </p>
                          </div>

                          <div className="flex items-center gap-2 text-[11px]">
                            <span className={`px-2 py-0.5 rounded font-bold ${
                              med.stockDosesRemaining < 10 ? 'bg-rose-100 text-rose-800' : 'bg-zinc-200 text-zinc-700'
                            }`}>
                              Estoque: {med.stockDosesRemaining} doses
                            </span>
                          </div>
                        </div>

                        {/* Doses Row */}
                        <div className="space-y-2">
                          {targetDoses.map((dose) => (
                            <div
                              key={dose.id}
                              className={`p-3 rounded-xl border flex flex-col md:flex-row md:items-center justify-between gap-3 transition-all ${
                                dose.status === 'Ministrado' ? 'bg-emerald-50/80 border-emerald-200' :
                                dose.status === 'Parcial' ? 'bg-amber-50/80 border-amber-300' :
                                dose.status === 'Recusado' ? 'bg-rose-50/80 border-rose-300' :
                                'bg-white border-zinc-200 shadow-2xs'
                              }`}
                            >
                              {/* Dose status & details */}
                              <div className="space-y-1 min-w-0">
                                <div className="flex items-center gap-2">
                                  <span className="text-sm font-black text-zinc-900 bg-zinc-100 px-2.5 py-0.5 rounded-lg border border-zinc-300">
                                    ⏰ {dose.time}h
                                  </span>

                                  {/* Status badge */}
                                  <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-md uppercase tracking-wider border ${
                                    dose.status === 'Ministrado' ? 'bg-emerald-600 text-white border-emerald-700' :
                                    dose.status === 'Parcial' ? 'bg-amber-600 text-white border-amber-700' :
                                    dose.status === 'Recusado' ? 'bg-rose-600 text-white border-rose-700' :
                                    'bg-blue-100 text-blue-900 border-blue-300'
                                  }`}>
                                    {dose.status === 'Ministrado' ? '✅ Tomou Completo' :
                                     dose.status === 'Parcial' ? '⚠️ Tomou Parcial' :
                                     dose.status === 'Recusado' ? '🚨 Recusou Dose' :
                                     '⏳ Aguardando'}
                                  </span>

                                  {dose.administeredBy && (
                                    <span className="text-[10px] text-zinc-500">
                                      Checado por {dose.administeredBy} às {dose.administeredAt}
                                    </span>
                                  )}
                                </div>

                                {/* Justification Note Display */}
                                {dose.notes && (
                                  <div className="p-2 bg-white/90 border border-zinc-200 rounded-lg text-xs space-y-0.5">
                                    <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 block">
                                      Justificativa Registrada:
                                    </span>
                                    <p className="text-zinc-800 font-medium">{dose.notes}</p>
                                  </div>
                                )}
                              </div>

                              {/* Administration Buttons (Tomou, Parcial, Recusou) */}
                              <div className="flex items-center gap-1.5 shrink-0 self-end md:self-center">
                                {/* Button 1: Tomou (100%) */}
                                <button
                                  onClick={() => onUpdateDoseStatus(med.id, dose.id, 'Ministrado')}
                                  className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-all flex items-center gap-1 shadow-2xs ${
                                    dose.status === 'Ministrado'
                                      ? 'bg-emerald-700 text-white border border-emerald-800 ring-2 ring-emerald-300'
                                      : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                                  }`}
                                >
                                  <CheckCircle2 className="w-3.5 h-3.5 stroke-[2.5]" />
                                  <span>Tomou (100%)</span>
                                </button>

                                {/* Button 2: Tomou Parcial */}
                                <button
                                  onClick={() => handleOpenJustificationModal(med, dose.id, dose.time, 'Parcial')}
                                  className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-all flex items-center gap-1 border shadow-2xs ${
                                    dose.status === 'Parcial'
                                      ? 'bg-amber-600 text-white border-amber-700 ring-2 ring-amber-300'
                                      : 'bg-amber-100 hover:bg-amber-200 text-amber-900 border-amber-300'
                                  }`}
                                >
                                  <AlertTriangle className="w-3.5 h-3.5" />
                                  <span>Tomou Parcial</span>
                                </button>

                                {/* Button 3: Recusou */}
                                <button
                                  onClick={() => handleOpenJustificationModal(med, dose.id, dose.time, 'Recusado')}
                                  className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-all flex items-center gap-1 border shadow-2xs ${
                                    dose.status === 'Recusado'
                                      ? 'bg-rose-600 text-white border-rose-700 ring-2 ring-rose-300'
                                      : 'bg-rose-100 hover:bg-rose-200 text-rose-900 border-rose-300'
                                  }`}
                                >
                                  <XCircle className="w-3.5 h-3.5" />
                                  <span>Recusou</span>
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </>
  )}

      {/* Justification Modal */}
      {modalState && modalState.isOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl overflow-hidden border border-zinc-200">
            {/* Modal Header */}
            <div className={`p-5 text-white flex items-center justify-between ${
              modalState.targetStatus === 'Recusado' ? 'bg-rose-700' : 'bg-amber-600'
            }`}>
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-white/20 rounded-xl">
                  {modalState.targetStatus === 'Recusado' ? (
                    <XCircle className="w-5 h-5 text-white" />
                  ) : (
                    <AlertTriangle className="w-5 h-5 text-white" />
                  )}
                </div>
                <div>
                  <h3 className="text-base font-black uppercase tracking-wider">
                    {modalState.targetStatus === 'Recusado' ? 'Justificativa de Recusa da Dose' : 'Justificativa de Dose Parcial'}
                  </h3>
                  <p className="text-xs text-white/90 font-medium">
                    {modalState.residentName} ({modalState.room}) • {modalState.time}h
                  </p>
                </div>
              </div>

              <button
                onClick={() => setModalState(null)}
                className="p-1 rounded-lg hover:bg-white/20 transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              <div className="p-3 bg-zinc-50 border border-zinc-200 rounded-xl space-y-1 text-xs">
                <p className="font-bold text-zinc-900">
                  Medicamento: <span className="text-teal-700">{modalState.medicationName}</span> ({modalState.dosage})
                </p>
                <p className="text-zinc-500">
                  Registrando evento para as <strong>{modalState.time}h</strong> pelo enfermeiro de plantão.
                </p>
              </div>

              {/* Presets */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-zinc-700 uppercase tracking-wider block">
                  Selecione o Motivo Principal (Predefinição Rápida):
                </label>
                <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                  {(modalState.targetStatus === 'Recusado' ? refusalPresets : partialPresets).map((preset, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setSelectedReasonPreset(preset)}
                      className={`w-full text-left p-2.5 rounded-xl border text-xs font-semibold transition-all flex items-center justify-between ${
                        selectedReasonPreset === preset
                          ? modalState.targetStatus === 'Recusado'
                            ? 'bg-rose-50 border-rose-400 text-rose-900 ring-2 ring-rose-200'
                            : 'bg-amber-50 border-amber-400 text-amber-900 ring-2 ring-amber-200'
                          : 'bg-zinc-50 border-zinc-200 text-zinc-700 hover:bg-zinc-100'
                      }`}
                    >
                      <span>{preset}</span>
                      {selectedReasonPreset === preset && (
                        <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom Explanation */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-zinc-700 uppercase tracking-wider block">
                  Observação Adicional / Detalhamento da Enfermagem:
                </label>
                <textarea
                  value={customExplanation}
                  onChange={(e) => setCustomExplanation(e.target.value)}
                  placeholder="Especifique condutas tomadas, reações do residente ou encaminhamentos efetuados..."
                  rows={3}
                  className="w-full p-3 text-xs bg-zinc-50 border border-zinc-200 rounded-xl focus:outline-none focus:border-teal-500 text-zinc-900"
                />
              </div>

              {/* Checkbox for Automatic SOAP Creation */}
              <div className="p-3 bg-purple-50 border border-purple-200 rounded-xl flex items-start gap-2.5">
                <input
                  type="checkbox"
                  id="chkSOAP"
                  checked={autoGenerateSOAP}
                  onChange={(e) => setAutoGenerateSOAP(e.target.checked)}
                  className="mt-0.5 rounded border-purple-300 text-purple-600 focus:ring-purple-500"
                />
                <label htmlFor="chkSOAP" className="text-xs text-purple-900 cursor-pointer">
                  <span className="font-bold block">Gerar Evolução SOAP Automática no Prontuário</span>
                  Inserir esta justificativa diretamente como nota clínica na ficha do residente.
                </label>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-zinc-50 border-t border-zinc-200 flex items-center justify-end gap-2">
              <button
                onClick={() => setModalState(null)}
                className="px-4 py-2 bg-white border border-zinc-300 text-zinc-700 font-bold text-xs rounded-xl hover:bg-zinc-100 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleSubmitJustification}
                className={`px-5 py-2 font-black text-xs text-white rounded-xl shadow-xs transition-colors ${
                  modalState.targetStatus === 'Recusado' ? 'bg-rose-600 hover:bg-rose-700' : 'bg-amber-600 hover:bg-amber-700'
                }`}
              >
                Confirmar e Registrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Medication Label Printer Modal */}
      <MedicationLabelPrinterModal
        isOpen={isPrinterOpen}
        onClose={() => setIsPrinterOpen(false)}
        medications={medications}
        residents={residents}
        initialResidentId={printerResidentId}
      />
    </div>
  );
};
