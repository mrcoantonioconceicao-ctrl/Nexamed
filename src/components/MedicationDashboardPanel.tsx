import React, { useState, useMemo } from 'react';
import { 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  Pill, 
  User, 
  ChevronDown, 
  ChevronUp, 
  Search, 
  AlertCircle,
  Sparkles,
  Check,
  Send,
  SlidersHorizontal,
  Calendar,
  Layers,
  FileText
} from 'lucide-react';
import { Resident, MedicationMAR, DoseStatus, ScheduledDose } from '../types';

interface MedicationDashboardPanelProps {
  residents: Resident[];
  medications: MedicationMAR[];
  onUpdateDoseStatus: (medicationId: string, doseId: string, newStatus: DoseStatus, notes?: string) => void;
  onOpenNewEvolutionModal?: (residentId?: string) => void;
}

interface PendingItem {
  resident: Resident;
  medication: MedicationMAR;
  dose: ScheduledDose;
}

export const MedicationDashboardPanel: React.FC<MedicationDashboardPanelProps> = ({
  residents,
  medications,
  onUpdateDoseStatus,
  onOpenNewEvolutionModal
}) => {
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string>('Todos');
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  // State for inline explanation input: medId-doseId -> { status: 'Parcial' | 'Recusado', preset: string, text: string }
  const [explanationState, setExplanationState] = useState<{
    [key: string]: {
      targetStatus: 'Parcial' | 'Recusado';
      preset: string;
      customText: string;
    }
  }>({});

  const refusalPresets = [
    'Recusa verbal do residente',
    'Residente agito/desorientado',
    'Cuspiu o medicamento',
    'Dificuldade de deglutição (Disfagia)',
    'Dormindo/Sem resposta',
    'Relatou náusea/estômago embrulhado'
  ];

  const partialPresets = [
    'Ingeriu 50% da dose e cuspiu restante',
    'Aceitou apenas parte da solução',
    'Apresentou ânsia de vômito durante ingestão'
  ];

  // Gather all pending/scheduled doses across all medications
  const allDosesList = useMemo(() => {
    const list: PendingItem[] = [];

    medications.forEach(med => {
      const resident = residents.find(r => r.id === med.residentId);
      if (!resident) return;

      med.scheduledDoses.forEach(dose => {
        list.push({
          resident,
          medication: med,
          dose
        });
      });
    });

    return list;
  }, [medications, residents]);

  // Extract unique time slots (e.g., '08:00', '12:00', '16:00', '20:00')
  const timeSlots = useMemo(() => {
    const slotsSet = new Set<string>();
    allDosesList.forEach(item => slotsSet.add(item.dose.time));
    return Array.from(slotsSet).sort();
  }, [allDosesList]);

  // Filter pending items
  const pendingDosesList = useMemo(() => {
    return allDosesList.filter(item => {
      const isPending = item.dose.status === 'Pendente' || item.dose.status === 'Atrasado';
      if (!isPending) return false;

      if (selectedTimeSlot !== 'Todos' && item.dose.time !== selectedTimeSlot) {
        return false;
      }

      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesResident = item.resident.name.toLowerCase().includes(query) || item.resident.room.toLowerCase().includes(query);
        const matchesMed = item.medication.medicationName.toLowerCase().includes(query);
        if (!matchesResident && !matchesMed) return false;
      }

      return true;
    });
  }, [allDosesList, selectedTimeSlot, searchQuery]);

  // Group pending items by time slot
  const groupedByTimeSlot = useMemo(() => {
    const groups: { [key: string]: PendingItem[] } = {};

    pendingDosesList.forEach(item => {
      const time = item.dose.time;
      if (!groups[time]) groups[time] = [];
      groups[time].push(item);
    });

    return groups;
  }, [pendingDosesList]);

  // Stats
  const totalPending = pendingDosesList.length;
  const criticalResidentsPending = useMemo(() => {
    const critSet = new Set<string>();
    pendingDosesList.forEach(item => {
      if (item.resident.riskScore === 'Crítico' || item.resident.news2?.riskLevel === 'Crítico') {
        critSet.add(item.resident.id);
      }
    });
    return critSet.size;
  }, [pendingDosesList]);

  // Toggle explanation form
  const handleOpenExplanation = (itemKey: string, status: 'Parcial' | 'Recusado') => {
    setExplanationState(prev => {
      const current = prev[itemKey];
      if (current && current.targetStatus === status) {
        // Toggle close
        const copy = { ...prev };
        delete copy[itemKey];
        return copy;
      }
      return {
        ...prev,
        [itemKey]: {
          targetStatus: status,
          preset: '',
          customText: ''
        }
      };
    });
  };

  // Submit Explanation
  const handleSubmitExplanation = (itemKey: string, medId: string, doseId: string) => {
    const exp = explanationState[itemKey];
    if (!exp) return;

    const finalNote = [exp.preset, exp.customText].filter(Boolean).join('. ');
    if (!finalNote) {
      alert('Por favor, escolha uma justificativa ou digite uma explicação antes de confirmar.');
      return;
    }

    onUpdateDoseStatus(medId, doseId, exp.targetStatus, finalNote);

    // Clear state for this item
    setExplanationState(prev => {
      const copy = { ...prev };
      delete copy[itemKey];
      return copy;
    });
  };

  return (
    <div className="bg-white border border-teal-200/90 rounded-3xl p-6 shadow-sm space-y-6">
      {/* Top Banner & Control Heading */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-zinc-100 pb-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-teal-100 text-teal-800 rounded-xl font-bold">
              <Pill className="w-5 h-5 text-teal-700" />
            </span>
            <h2 className="text-lg font-black text-zinc-900 tracking-tight">
              Painel de Checagem por Horário de Medicação
            </h2>
            <span className="text-[10px] font-extrabold bg-amber-100 text-amber-900 px-2 py-0.5 rounded-full border border-amber-300">
              {totalPending} Pendentes
            </span>
          </div>
          <p className="text-xs text-zinc-500">
            Visão unificada por horários de aprazamento. Registre 'Tomou (100%)', 'Parcial' ou 'Recusou' diretamente com justificativa clínica.
          </p>
        </div>

        {/* Stats Pill Badges */}
        <div className="flex items-center gap-2 text-xs font-bold shrink-0">
          <div className="px-3 py-1.5 bg-blue-50 border border-blue-200 text-blue-900 rounded-xl flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-blue-600" />
            <span>Total Pendentes: <strong>{totalPending}</strong></span>
          </div>

          {criticalResidentsPending > 0 && (
            <div className="px-3 py-1.5 bg-rose-50 border border-rose-200 text-rose-900 rounded-xl flex items-center gap-1.5 animate-pulse">
              <AlertCircle className="w-4 h-4 text-rose-600" />
              <span>Residentes Críticos: <strong>{criticalResidentsPending}</strong></span>
            </div>
          )}
        </div>
      </div>

      {/* Filter and Time Slot Category Tabs */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Time Slot Selectors */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 text-xs font-bold">
            <span className="text-zinc-400 font-bold mr-1 shrink-0 flex items-center gap-1">
              <Layers className="w-3.5 h-3.5" /> Horário:
            </span>
            <button
              onClick={() => setSelectedTimeSlot('Todos')}
              className={`px-3.5 py-1.5 rounded-xl transition-all shrink-0 ${
                selectedTimeSlot === 'Todos'
                  ? 'bg-teal-700 text-white shadow-2xs'
                  : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
              }`}
            >
              Todos os Horários
            </button>
            {timeSlots.map(time => {
              const countInSlot = allDosesList.filter(
                i => (i.dose.status === 'Pendente' || i.dose.status === 'Atrasado') && i.dose.time === time
              ).length;

              return (
                <button
                  key={time}
                  onClick={() => setSelectedTimeSlot(time)}
                  className={`px-3 py-1.5 rounded-xl transition-all shrink-0 flex items-center gap-1.5 ${
                    selectedTimeSlot === time
                      ? 'bg-teal-700 text-white shadow-2xs'
                      : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200 border border-zinc-200/60'
                  }`}
                >
                  <span>⏰ {time}h</span>
                  {countInSlot > 0 && (
                    <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${
                      selectedTimeSlot === time ? 'bg-white text-teal-900' : 'bg-teal-100 text-teal-800'
                    }`}>
                      {countInSlot}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Search box */}
          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar residente ou remédio..."
              className="w-full bg-zinc-50 text-zinc-900 text-xs pl-8 pr-3 py-1.5 rounded-xl border border-zinc-200 focus:outline-none focus:border-teal-500"
            />
          </div>
        </div>
      </div>

      {/* Main Categorized Content */}
      <div className="space-y-6">
        {Object.keys(groupedByTimeSlot).length === 0 ? (
          <div className="p-10 text-center bg-zinc-50 border border-dashed border-zinc-300 rounded-2xl space-y-2">
            <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto" />
            <p className="text-sm font-bold text-zinc-800">
              Todas as medicações deste filtro já foram checadas!
            </p>
            <p className="text-xs text-zinc-500">
              Nenhuma dose pendente encontrada para o horário e filtro selecionados.
            </p>
          </div>
        ) : (
          Object.keys(groupedByTimeSlot).sort().map(timeSlot => {
            const itemsInGroup = groupedByTimeSlot[timeSlot];

            return (
              <div key={timeSlot} className="border border-zinc-200/90 rounded-2xl overflow-hidden shadow-2xs">
                {/* Time Group Header */}
                <div className="p-3.5 bg-gradient-to-r from-teal-900 to-zinc-900 text-white flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="p-1.5 bg-teal-800 rounded-lg text-teal-200 font-extrabold text-xs">
                      ⏰ Horário Fixado
                    </span>
                    <h3 className="text-sm font-black text-white">{timeSlot} Horas</h3>
                    <span className="text-[10px] font-bold bg-teal-700/80 text-teal-100 px-2 py-0.5 rounded border border-teal-500/40">
                      {itemsInGroup.length} doses a ministrar
                    </span>
                  </div>

                  <span className="text-[11px] font-semibold text-teal-200 hidden sm:inline">
                    Aprazamento MAR 12/12h
                  </span>
                </div>

                {/* Doses List inside this Time Slot */}
                <div className="divide-y divide-zinc-100 bg-white">
                  {itemsInGroup.map(item => {
                    const itemKey = `${item.medication.id}-${item.dose.id}`;
                    const expData = explanationState[itemKey];

                    return (
                      <div key={itemKey} className="p-4 hover:bg-zinc-50/80 transition-colors space-y-3">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                          {/* Left: Resident & Medication Info */}
                          <div className="flex items-start gap-3">
                            <div className="w-9 h-9 rounded-full bg-teal-100 text-teal-900 font-extrabold text-xs flex items-center justify-center shrink-0 border border-teal-200">
                              {item.resident.name.substring(0, 2).toUpperCase()}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-black text-zinc-900">{item.resident.name}</span>
                                <span className="text-[10px] font-extrabold text-teal-800 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                                  {item.resident.room}
                                </span>
                                {item.resident.riskScore === 'Crítico' && (
                                  <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded bg-rose-100 text-rose-800 border border-rose-300">
                                    🚨 Crítico
                                  </span>
                                )}
                              </div>

                              <div className="flex items-center gap-2 mt-1">
                                <span className="text-xs font-extrabold text-teal-900">
                                  💊 {item.medication.medicationName}
                                </span>
                                <span className="text-xs font-bold text-zinc-600 bg-zinc-100 px-2 py-0.5 rounded border border-zinc-200">
                                  {item.medication.dosage}
                                </span>
                                <span className="text-[10px] font-semibold text-zinc-500">
                                  Via: {item.medication.route}
                                </span>
                                {item.medication.isControlled && (
                                  <span className="text-[9px] font-bold bg-amber-100 text-amber-900 px-1.5 py-0.5 rounded">
                                    🔒 Psicotrópico
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Right: Integrated Direct Buttons ('Tomou', 'Parcial', 'Recusou') */}
                          <div className="flex items-center gap-2 shrink-0 self-start md:self-center">
                            {/* BUTTON 1: TOMOU (100%) */}
                            <button
                              onClick={() => onUpdateDoseStatus(item.medication.id, item.dose.id, 'Ministrado')}
                              className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-xl shadow-2xs transition-all flex items-center gap-1.5"
                              title="Confirmar administração completa de 100% da dose"
                            >
                              <CheckCircle2 className="w-4 h-4 stroke-[2.5]" />
                              <span>Tomou</span>
                            </button>

                            {/* BUTTON 2: PARCIAL */}
                            <button
                              onClick={() => handleOpenExplanation(itemKey, 'Parcial')}
                              className={`px-3.5 py-1.5 font-bold text-xs rounded-xl border transition-all flex items-center gap-1.5 shadow-2xs ${
                                expData?.targetStatus === 'Parcial'
                                  ? 'bg-amber-600 text-white border-amber-700 ring-2 ring-amber-300'
                                  : 'bg-amber-100 hover:bg-amber-200 text-amber-900 border-amber-300'
                              }`}
                              title="Registrar administração parcial com justificativa"
                            >
                              <AlertTriangle className="w-3.5 h-3.5" />
                              <span>Parcial</span>
                            </button>

                            {/* BUTTON 3: RECUSOU */}
                            <button
                              onClick={() => handleOpenExplanation(itemKey, 'Recusado')}
                              className={`px-3.5 py-1.5 font-bold text-xs rounded-xl border transition-all flex items-center gap-1.5 shadow-2xs ${
                                expData?.targetStatus === 'Recusado'
                                  ? 'bg-rose-600 text-white border-rose-700 ring-2 ring-rose-300'
                                  : 'bg-rose-100 hover:bg-rose-200 text-rose-900 border-rose-300'
                              }`}
                              title="Registrar recusa da dose pelo residente com justificativa"
                            >
                              <XCircle className="w-3.5 h-3.5" />
                              <span>Recusou</span>
                            </button>
                          </div>
                        </div>

                        {/* Inline Explanation Box if Parcial or Recusado is toggled */}
                        {expData && (
                          <div className={`p-4 rounded-2xl border space-y-3 animate-in fade-in duration-150 ${
                            expData.targetStatus === 'Recusado'
                              ? 'bg-rose-50/90 border-rose-200 text-rose-950'
                              : 'bg-amber-50/90 border-amber-200 text-amber-950'
                          }`}>
                            <div className="flex items-center justify-between border-b pb-2 border-zinc-200/60">
                              <span className="text-xs font-black uppercase tracking-wider flex items-center gap-1.5">
                                {expData.targetStatus === 'Recusado' ? (
                                  <>🚨 Registrar Justificativa para Recusa de Medicação</>
                                ) : (
                                  <>⚠️ Registrar Justificativa para Dose Parcial</>
                                )}
                              </span>
                              <button
                                onClick={() => handleOpenExplanation(itemKey, expData.targetStatus)}
                                className="text-xs text-zinc-500 hover:text-zinc-800 font-bold"
                              >
                                ✕ Fechar
                              </button>
                            </div>

                            {/* Presets Grid */}
                            <div className="space-y-1.5">
                              <label className="text-[11px] font-bold block uppercase tracking-wider text-zinc-700">
                                Escolha uma razão predefinida:
                              </label>
                              <div className="flex flex-wrap gap-1.5">
                                {(expData.targetStatus === 'Recusado' ? refusalPresets : partialPresets).map((preset, pIdx) => (
                                  <button
                                    key={pIdx}
                                    type="button"
                                    onClick={() => setExplanationState(prev => ({
                                      ...prev,
                                      [itemKey]: { ...prev[itemKey], preset }
                                    }))}
                                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all ${
                                      expData.preset === preset
                                        ? expData.targetStatus === 'Recusado'
                                          ? 'bg-rose-600 text-white border-rose-700 shadow-2xs'
                                          : 'bg-amber-600 text-white border-amber-700 shadow-2xs'
                                        : 'bg-white text-zinc-700 border-zinc-200 hover:bg-zinc-100'
                                    }`}
                                  >
                                    {preset}
                                  </button>
                                ))}
                              </div>
                            </div>

                            {/* Custom Explanation Input */}
                            <div className="space-y-1">
                              <label className="text-[11px] font-bold block uppercase tracking-wider text-zinc-700">
                                Observação Adicional da Enfermagem:
                              </label>
                              <div className="flex items-center gap-2">
                                <input
                                  type="text"
                                  value={expData.customText}
                                  onChange={(e) => {
                                    const val = e.target.value;
                                    setExplanationState(prev => ({
                                      ...prev,
                                      [itemKey]: { ...prev[itemKey], customText: val }
                                    }));
                                  }}
                                  placeholder="Digite detalhes adicionais da conduta..."
                                  className="w-full bg-white text-zinc-900 text-xs p-2.5 rounded-xl border border-zinc-300 focus:outline-none focus:border-teal-600"
                                />

                                <button
                                  onClick={() => handleSubmitExplanation(itemKey, item.medication.id, item.dose.id)}
                                  className={`px-4 py-2.5 text-white font-black text-xs rounded-xl shrink-0 shadow-2xs flex items-center gap-1.5 transition-colors ${
                                    expData.targetStatus === 'Recusado'
                                      ? 'bg-rose-700 hover:bg-rose-800'
                                      : 'bg-amber-700 hover:bg-amber-800'
                                  }`}
                                >
                                  <Send className="w-3.5 h-3.5" />
                                  <span>Confirmar</span>
                                </button>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
