import React, { useState, useMemo } from 'react';
import { 
  ClipboardCheck, 
  AlertTriangle, 
  Clock, 
  Pill, 
  FileText, 
  Sparkles, 
  ArrowRight, 
  CheckCircle2, 
  Copy, 
  Check, 
  Users, 
  Activity,
  ChevronDown,
  ChevronUp,
  Share2
} from 'lucide-react';
import { Resident, ClinicalAlert, MedicationMAR, ClinicalEvolution, HandoverLog } from '../types';

interface ShiftSummaryWidgetProps {
  residents: Resident[];
  alerts: ClinicalAlert[];
  medications: MedicationMAR[];
  evolutions: ClinicalEvolution[];
  handovers?: HandoverLog[];
  onOpenResident: (id: string) => void;
  onOpenNewEvolution: (residentId?: string) => void;
  onNavigate: (path: string) => void;
}

export const ShiftSummaryWidget: React.FC<ShiftSummaryWidgetProps> = ({
  residents,
  alerts,
  medications,
  evolutions,
  handovers = [],
  onOpenResident,
  onOpenNewEvolution,
  onNavigate
}) => {
  const [copied, setCopied] = useState(false);
  const [filterTab, setFilterTab] = useState<'todos' | 'criticos' | 'pendencias'>('todos');
  const [isExpanded, setIsExpanded] = useState(true);

  // Data Compilation
  const summaryData = useMemo(() => {
    // Critical residents
    const criticalResidents = residents.filter(
      r => r.riskScore === 'Crítico' || r.news2?.riskLevel === 'Crítico'
    );

    // Unread or active critical/high alerts
    const activeAlerts = alerts.filter(a => !a.read);
    const criticalAlerts = activeAlerts.filter(a => a.severity === 'Crítico' || a.severity === 'Alto');

    // Pending medications today
    const pendingMeds: { residentName: string; medicine: string; time: string; status: string }[] = [];
    let totalDoses = 0;
    let administeredDoses = 0;

    medications.forEach(m => {
      const res = residents.find(r => r.id === m.residentId);
      const resName = res ? res.name : 'Residente';
      m.scheduledDoses.forEach(d => {
        totalDoses++;
        if (d.status === 'Ministrado') {
          administeredDoses++;
        } else if (d.status === 'Aguardando' || d.status === 'Atrasado') {
          pendingMeds.push({
            residentName: resName,
            medicine: m.medicationName,
            time: d.time,
            status: d.status
          });
        }
      });
    });

    // Residents who haven't had an evolution today
    const todayStr = new Date().toISOString().split('T')[0];
    const residentsWithEvolutionToday = new Set(
      evolutions
        .filter(e => e.date === todayStr || e.date === 'Hoje' || e.time?.includes('Hoje'))
        .map(e => e.residentId)
    );

    const residentsPendingEvolution = residents.filter(
      r => !residentsWithEvolutionToday.has(r.id)
    );

    // Recent critical occurrences from handovers
    const shiftOccurrences: { category: string; description: string; residentName?: string }[] = [];
    handovers.forEach(h => {
      h.occurrences.forEach(occ => {
        const res = residents.find(r => r.id === occ.residentId);
        shiftOccurrences.push({
          category: occ.category,
          description: occ.description,
          residentName: res?.name
        });
      });
    });

    return {
      criticalResidents,
      criticalAlerts,
      pendingMeds,
      totalDoses,
      administeredDoses,
      medCompletionRate: totalDoses > 0 ? Math.round((administeredDoses / totalDoses) * 100) : 100,
      residentsPendingEvolution,
      shiftOccurrences,
    };
  }, [residents, alerts, medications, evolutions, handovers]);

  // Plain-text summary generator for shift handover transmission
  const generatedTextBriefing = useMemo(() => {
    const dateNow = new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
    let text = `📋 *RESUMO SÍNTESE DO PLANTÃO - NEXA SAÚDE*\n📅 Data: ${dateNow} | Turno Atual\n\n`;

    text += `🚨 *STATUS CRÍTICO & ALERTAS (${summaryData.criticalResidents.length} residentes)*:\n`;
    if (summaryData.criticalResidents.length === 0) {
      text += `• Nenhum residente em estado crítico no momento.\n`;
    } else {
      summaryData.criticalResidents.forEach(r => {
        text += `• ${r.name} (${r.room}): NEWS2 ${r.news2?.totalScore || 0} pts | Quadros: ${r.primaryDiagnosis}\n`;
      });
    }

    text += `\n💊 *PENDÊNCIAS DE MEDICAÇÃO (${summaryData.pendingMeds.length} doses)*:\n`;
    if (summaryData.pendingMeds.length === 0) {
      text += `• Todas as medicações registradas do turno foram administradas (100%).\n`;
    } else {
      summaryData.pendingMeds.slice(0, 5).forEach(m => {
        text += `• [${m.time}] ${m.residentName} - ${m.medicine} (${m.status})\n`;
      });
      if (summaryData.pendingMeds.length > 5) {
        text += `• ... + ${summaryData.pendingMeds.length - 5} outras doses agendadas.\n`;
      }
    }

    text += `\n📝 *PRONTUÁRIOS / SOAP PENDENTES (${summaryData.residentsPendingEvolution.length})*:\n`;
    if (summaryData.residentsPendingEvolution.length === 0) {
      text += `• Todos os residentes ativos possuem evolução registrada hoje.\n`;
    } else {
      summaryData.residentsPendingEvolution.forEach(r => {
        text += `• ${r.name} (${r.room})\n`;
      });
    }

    text += `\n📊 *DESEMPENHO GERAL DO PLANTÃO*:\n`;
    text += `• Leitos Ocupados: ${residents.length}/10\n`;
    text += `• Cumprimento de Medicação MAR: ${summaryData.medCompletionRate}%\n`;
    text += `• Ocorrências de Turno: ${summaryData.shiftOccurrences.length} registradas\n`;

    text += `\n_Gerado automaticamente pelo Sistema Clínico Nexa Saúde_`;

    return text;
  }, [summaryData, residents]);

  const handleCopySummary = () => {
    navigator.clipboard.writeText(generatedTextBriefing);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="bg-white border border-teal-200/90 rounded-2xl shadow-xs overflow-hidden transition-all">
      {/* Header Banner */}
      <div className="p-4 sm:p-5 bg-gradient-to-r from-teal-900 via-teal-800 to-emerald-900 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-teal-700/60 rounded-xl border border-teal-500/40 shrink-0">
            <ClipboardCheck className="w-5 h-5 text-teal-200" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-extrabold text-teal-200 bg-teal-800/80 px-2 py-0.5 rounded border border-teal-600/50 uppercase tracking-wide">
                Passagem Inteligente
              </span>
              <span className="text-xs text-teal-300 font-medium hidden sm:inline">
                Compilação em Tempo Real
              </span>
            </div>
            <h2 className="text-base sm:text-lg font-black tracking-tight text-white mt-0.5">
              Resumo Automático do Plantão
            </h2>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end border-t sm:border-0 border-teal-800/80 pt-2 sm:pt-0">
          <button
            onClick={handleCopySummary}
            className="px-3 py-1.5 bg-teal-700/80 hover:bg-teal-600 text-teal-100 text-xs font-bold rounded-xl border border-teal-500/50 transition-colors flex items-center gap-1.5 shadow-2xs"
            title="Copiar texto formatado para transmissão de plantão"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-300" />
                <span className="text-emerald-200">Copiado!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copiar Transmissão</span>
              </>
            )}
          </button>

          <button
            onClick={() => onNavigate('/plantao')}
            className="px-3.5 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-teal-950 font-extrabold text-xs rounded-xl transition-colors flex items-center gap-1 shadow-xs"
          >
            <span>Ir para Plantão</span>
            <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
          </button>

          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1.5 text-teal-300 hover:text-white transition-colors"
            title={isExpanded ? "Recolher painel" : "Expandir painel"}
          >
            {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {isExpanded && (
        <div className="p-4 sm:p-5 space-y-5">
          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 bg-rose-50/70 border border-rose-200/80 rounded-xl space-y-0.5">
              <span className="text-[10px] font-bold text-rose-800 uppercase tracking-wider block">
                Residentes Críticos
              </span>
              <div className="flex items-baseline justify-between">
                <span className="text-xl font-black text-rose-900">
                  {summaryData.criticalResidents.length}
                </span>
                <span className="text-[10px] font-bold text-rose-700">
                  {summaryData.criticalResidents.length > 0 ? 'Atenção Total' : 'Estável'}
                </span>
              </div>
            </div>

            <div className="p-3 bg-amber-50/70 border border-amber-200/80 rounded-xl space-y-0.5">
              <span className="text-[10px] font-bold text-amber-800 uppercase tracking-wider block">
                Medicação Pendente
              </span>
              <div className="flex items-baseline justify-between">
                <span className="text-xl font-black text-amber-900">
                  {summaryData.pendingMeds.length} <span className="text-xs text-amber-700 font-semibold">doses</span>
                </span>
                <span className="text-[10px] font-bold text-amber-700">
                  MAR {summaryData.medCompletionRate}%
                </span>
              </div>
            </div>

            <div className="p-3 bg-purple-50/70 border border-purple-200/80 rounded-xl space-y-0.5">
              <span className="text-[10px] font-bold text-purple-800 uppercase tracking-wider block">
                Prontuários Pendentes
              </span>
              <div className="flex items-baseline justify-between">
                <span className="text-xl font-black text-purple-900">
                  {summaryData.residentsPendingEvolution.length}
                </span>
                <span className="text-[10px] font-bold text-purple-700">
                  {summaryData.residentsPendingEvolution.length === 0 ? '100% Ok' : 'Aguardando'}
                </span>
              </div>
            </div>

            <div className="p-3 bg-teal-50/70 border border-teal-200/80 rounded-xl space-y-0.5">
              <span className="text-[10px] font-bold text-teal-800 uppercase tracking-wider block">
                Alertas Ativos
              </span>
              <div className="flex items-baseline justify-between">
                <span className="text-xl font-black text-teal-900">
                  {summaryData.criticalAlerts.length}
                </span>
                <span className="text-[10px] font-bold text-teal-700">
                  {summaryData.criticalAlerts.length === 0 ? 'Zero Críticos' : 'Triados'}
                </span>
              </div>
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="flex items-center gap-1.5 border-b border-zinc-100 pb-2.5 text-xs">
            <span className="text-zinc-500 font-bold text-[11px] mr-1">Filtrar Visão:</span>
            <button
              onClick={() => setFilterTab('todos')}
              className={`px-3 py-1 rounded-lg font-bold transition-colors ${
                filterTab === 'todos'
                  ? 'bg-teal-700 text-white shadow-2xs'
                  : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
              }`}
            >
              Visão Geral
            </button>
            <button
              onClick={() => setFilterTab('criticos')}
              className={`px-3 py-1 rounded-lg font-bold transition-colors flex items-center gap-1 ${
                filterTab === 'criticos'
                  ? 'bg-rose-600 text-white shadow-2xs'
                  : 'bg-rose-50 text-rose-800 hover:bg-rose-100 border border-rose-200/60'
              }`}
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Eventos Críticos ({summaryData.criticalResidents.length + summaryData.criticalAlerts.length})</span>
            </button>
            <button
              onClick={() => setFilterTab('pendencias')}
              className={`px-3 py-1 rounded-lg font-bold transition-colors flex items-center gap-1 ${
                filterTab === 'pendencias'
                  ? 'bg-amber-600 text-white shadow-2xs'
                  : 'bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-200/60'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>Pendências ({summaryData.pendingMeds.length + summaryData.residentsPendingEvolution.length})</span>
            </button>
          </div>

          {/* Tab Content 1: Todos (Combined Overview) */}
          {filterTab === 'todos' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Box 1: Eventos Críticos & Casos de Risco */}
              <div className="p-4 bg-zinc-50/80 border border-zinc-200/80 rounded-xl space-y-3">
                <div className="flex items-center justify-between border-b border-zinc-200/60 pb-2">
                  <div className="flex items-center gap-2 text-rose-900 font-bold text-xs">
                    <AlertTriangle className="w-4 h-4 text-rose-600" />
                    <span>Residentes & Alertas Críticos do Turno</span>
                  </div>
                  <span className="text-[10px] font-extrabold text-rose-700 bg-rose-100 px-2 py-0.5 rounded border border-rose-200">
                    {summaryData.criticalResidents.length} Críticos
                  </span>
                </div>

                {summaryData.criticalResidents.length === 0 && summaryData.criticalAlerts.length === 0 ? (
                  <div className="py-4 text-center text-xs text-zinc-500 space-y-1">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 mx-auto" />
                    <p className="font-semibold text-zinc-700">Sem eventos críticos pendentes no turno.</p>
                    <p className="text-[11px]">Todos os residentes mantêm estabilidade clínica estipulada.</p>
                  </div>
                ) : (
                  <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                    {summaryData.criticalResidents.map(r => (
                      <div
                        key={r.id}
                        onClick={() => onOpenResident(r.id)}
                        className="p-2.5 bg-white border border-rose-200 rounded-lg hover:border-rose-400 cursor-pointer transition-colors flex items-center justify-between gap-2 shadow-2xs"
                      >
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-zinc-900 truncate">{r.name}</p>
                          <p className="text-[11px] text-zinc-500 truncate">{r.room} • {r.primaryDiagnosis}</p>
                        </div>
                        <span className="text-[10px] font-extrabold px-2 py-0.5 rounded bg-rose-100 text-rose-800 border border-rose-200 shrink-0">
                          NEWS2: {r.news2?.totalScore || 0}
                        </span>
                      </div>
                    ))}

                    {summaryData.criticalAlerts.map(a => (
                      <div
                        key={a.id}
                        className="p-2.5 bg-amber-50/80 border border-amber-200 rounded-lg text-xs space-y-0.5"
                      >
                        <div className="flex items-center justify-between font-bold text-amber-900 text-[11px]">
                          <span>🚨 {a.type}</span>
                          <span className="text-[10px] text-amber-700">{a.timestamp}</span>
                        </div>
                        <p className="text-zinc-700 text-[11px]">{a.message}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Box 2: Pendências Operacionais do Turno */}
              <div className="p-4 bg-zinc-50/80 border border-zinc-200/80 rounded-xl space-y-3">
                <div className="flex items-center justify-between border-b border-zinc-200/60 pb-2">
                  <div className="flex items-center gap-2 text-amber-900 font-bold text-xs">
                    <Clock className="w-4 h-4 text-amber-600" />
                    <span>Pendências de Medicação & Prontuários</span>
                  </div>
                  <span className="text-[10px] font-extrabold text-amber-800 bg-amber-100 px-2 py-0.5 rounded border border-amber-200">
                    {summaryData.pendingMeds.length} Meds | {summaryData.residentsPendingEvolution.length} SOAP
                  </span>
                </div>

                <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                  {/* Pending Medications List */}
                  {summaryData.pendingMeds.length > 0 && (
                    <div className="space-y-1.5">
                      <p className="text-[10px] font-bold text-zinc-500 uppercase">Medicações Aguardando/Atrasadas:</p>
                      {summaryData.pendingMeds.slice(0, 4).map((m, idx) => (
                        <div key={idx} className="p-2 bg-white border border-amber-200/90 rounded-lg flex items-center justify-between text-xs">
                          <div>
                            <span className="font-bold text-zinc-900 text-[11px]">{m.residentName}</span>
                            <p className="text-[10px] text-zinc-500">{m.medicine}</p>
                          </div>
                          <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded ${
                            m.status === 'Atrasado' ? 'bg-rose-100 text-rose-800 border border-rose-200' : 'bg-amber-100 text-amber-800 border border-amber-200'
                          }`}>
                            {m.time} ({m.status})
                          </span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Residents Without Evolution Today */}
                  {summaryData.residentsPendingEvolution.length > 0 && (
                    <div className="space-y-1.5 pt-1">
                      <p className="text-[10px] font-bold text-zinc-500 uppercase">Aguardando Prontuário SOAP Hoje:</p>
                      <div className="flex flex-wrap gap-1.5">
                        {summaryData.residentsPendingEvolution.map(r => (
                          <button
                            key={r.id}
                            onClick={() => onOpenNewEvolution(r.id)}
                            className="px-2 py-1 bg-white hover:bg-purple-50 text-purple-900 border border-purple-200 text-[11px] font-semibold rounded-lg transition-colors flex items-center gap-1 shadow-2xs"
                          >
                            <FileText className="w-3 h-3 text-purple-600" />
                            <span>{r.name} ({r.room})</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {summaryData.pendingMeds.length === 0 && summaryData.residentsPendingEvolution.length === 0 && (
                    <div className="py-4 text-center text-xs text-zinc-500 space-y-1">
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 mx-auto" />
                      <p className="font-semibold text-zinc-700">Todas as pendências do turno foram resolvidas!</p>
                      <p className="text-[11px]">Equipe com 100% de registros atualizados.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Tab Content 2: Somente Críticos */}
          {filterTab === 'criticos' && (
            <div className="p-4 bg-rose-50/50 border border-rose-200 rounded-xl space-y-3">
              <h3 className="text-xs font-bold text-rose-900 uppercase tracking-wider flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-600" />
                <span>Detalhamento Completo de Eventos Críticos</span>
              </h3>

              {summaryData.criticalResidents.length === 0 ? (
                <p className="text-xs text-zinc-600 py-3 text-center bg-white rounded-lg border border-rose-200/60">
                  Nenhum residente em situação crítica registrado neste turno.
                </p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {summaryData.criticalResidents.map(r => (
                    <div key={r.id} className="p-3 bg-white border border-rose-200 rounded-xl space-y-2 shadow-2xs">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs text-zinc-900">{r.name} ({r.room})</span>
                        <span className="text-[10px] font-extrabold px-2 py-0.5 rounded bg-rose-100 text-rose-800 border border-rose-300">
                          NEWS2: {r.news2?.totalScore || 0} pts
                        </span>
                      </div>
                      <p className="text-[11px] text-zinc-600">{r.primaryDiagnosis}</p>
                      <div className="text-[10px] text-zinc-500 flex items-center gap-2 pt-1 border-t border-zinc-100">
                        <span>PA: {r.vitals?.bp || '120/80'}</span>
                        <span>•</span>
                        <span>FC: {r.vitals?.hr || 75} bpm</span>
                        <span>•</span>
                        <span>SpO2: {r.vitals?.spo2 || 97}%</span>
                      </div>
                      <button
                        onClick={() => onOpenResident(r.id)}
                        className="w-full py-1 bg-rose-600 hover:bg-rose-700 text-white font-bold text-[11px] rounded-lg transition-colors"
                      >
                        Acessar Prontuário 360°
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Tab Content 3: Somente Pendências */}
          {filterTab === 'pendencias' && (
            <div className="p-4 bg-amber-50/50 border border-amber-200 rounded-xl space-y-3">
              <h3 className="text-xs font-bold text-amber-900 uppercase tracking-wider flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-600" />
                <span>Lista Ordenada de Pendências do Turno</span>
              </h3>

              <div className="space-y-2 text-xs">
                {summaryData.pendingMeds.map((m, idx) => (
                  <div key={idx} className="p-2.5 bg-white border border-amber-200 rounded-lg flex items-center justify-between">
                    <div>
                      <span className="font-bold text-zinc-900">{m.residentName}</span>
                      <p className="text-[11px] text-zinc-600">{m.medicine}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-[11px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded border border-amber-200">
                        {m.time} - {m.status}
                      </span>
                    </div>
                  </div>
                ))}

                {summaryData.pendingMeds.length === 0 && (
                  <p className="text-xs text-zinc-600 py-3 text-center bg-white rounded-lg border border-amber-200/60">
                    Nenhuma medicação pendente no momento.
                  </p>
                )}
              </div>
            </div>
          )}

          {/* AI Shift Briefing Footer Box */}
          <div className="p-3.5 bg-teal-50/70 border border-teal-200/80 rounded-xl flex items-start justify-between gap-3">
            <div className="flex items-start gap-2.5">
              <Sparkles className="w-4 h-4 text-teal-700 shrink-0 mt-0.5" />
              <div className="text-xs text-zinc-700 space-y-0.5">
                <p className="font-bold text-teal-900">Síntese de Inteligência Clínica Nexa</p>
                <p className="text-[11px] leading-relaxed">
                  O plantão atual conta com <strong>{residents.length} residentes monitorados</strong> com taxa de administração de medicamentos em <strong>{summaryData.medCompletionRate}%</strong>.
                  Sugerimos dar prioridade para a conferência do quadro dos {summaryData.criticalResidents.length} residentes em protocolo de observação de risco.
                </p>
              </div>
            </div>

            <button
              onClick={handleCopySummary}
              className="px-3 py-1.5 bg-teal-700 hover:bg-teal-800 text-white font-bold text-[11px] rounded-lg border border-teal-600 shrink-0 transition-colors shadow-2xs flex items-center gap-1"
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Share2 className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copiado!' : 'Transmitir'}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
