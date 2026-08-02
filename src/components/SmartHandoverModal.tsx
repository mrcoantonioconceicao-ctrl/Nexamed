import React, { useState, useEffect } from 'react';
import { 
  ClipboardCheck, 
  Sparkles, 
  AlertCircle, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  User, 
  ShieldCheck, 
  FileText, 
  Pill, 
  Activity, 
  ArrowRight, 
  Lock, 
  Check, 
  AlertTriangle,
  RotateCcw,
  Send,
  Building,
  Layers,
  ChevronRight,
  ExternalLink,
  MessageSquare,
  X
} from 'lucide-react';
import { 
  Resident, 
  ClinicalEvolution, 
  MedicationMAR, 
  ClinicalAlert, 
  HandoverLog, 
  OccurrenceItem, 
  AuditLogEntry,
  Timeline360Event 
} from '../types';
import { getCurrentUser, UserSession } from '../config/auth-mode';

export interface PendingAuditItem {
  id: string;
  residentId: string;
  residentName: string;
  room: string;
  category: 'SOAP Incompleto' | 'MAR Pendente' | 'Sinal Vital Faltante' | 'Intercorrência Aberta' | 'PTS Desatualizado';
  priority: 'Crítica' | 'Alta' | 'Média';
  description: string;
  actionType: 'open_soap' | 'open_mar' | 'open_vitals' | 'open_detail';
  time: string;
  justification?: {
    reason: string;
    notes: string;
    transferredToNextShift: boolean;
    authorizedBy: string;
    timestamp: string;
  };
}

interface SmartHandoverModalProps {
  isOpen: boolean;
  mode: 'ASSUMIR_PLANTAO' | 'ENCERRAR_PLANTAO';
  onClose: () => void;
  residents: Resident[];
  evolutions: ClinicalEvolution[];
  medications: MedicationMAR[];
  alerts: ClinicalAlert[];
  handovers: HandoverLog[];
  onCompleteInboundHandover: (handoverData: { shiftName: string; signaturePin: string }) => void;
  onCompleteOutboundHandover: (handoverLog: HandoverLog, pendingJustifications: PendingAuditItem[]) => void;
  onResolvePendingDirectly: (item: PendingAuditItem) => void;
}

export const SmartHandoverModal: React.FC<SmartHandoverModalProps> = ({
  isOpen,
  mode,
  onClose,
  residents,
  evolutions,
  medications,
  alerts,
  handovers,
  onCompleteInboundHandover,
  onCompleteOutboundHandover,
  onResolvePendingDirectly
}) => {
  if (!isOpen) return null;

  const currentUser: UserSession = getCurrentUser() || {
    id: 'usr-1',
    name: 'Enf. Bruno Costa',
    role: 'Enfermeiro Responsável Técnico (RT)',
    email: 'bruno.costa@nexamed.com.br',
    unit: 'Unidade Jardim Paulista - SRT I',
    shift: 'Manhã',
    team: 'Equipe A - Plantão Diurno',
    avatar: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=120&auto=format&fit=crop&q=80'
  };

  // Inbound Shift Handover State
  const [readCheck, setReadCheck] = useState(false);
  const [understoodCheck, setUnderstoodCheck] = useState(false);
  const [responsibilityCheck, setResponsibilityCheck] = useState(false);
  const [signaturePin, setSignaturePin] = useState('1234');
  const [shiftName, setShiftName] = useState<'Manhã' | 'Tarde' | 'Noite'>('Manhã');

  // Outbound Shift Handover Audit State
  const [pendingItems, setPendingItems] = useState<PendingAuditItem[]>([]);
  const [isAuditing, setIsAuditing] = useState(false);
  const [selectedJustifyItem, setSelectedJustifyItem] = useState<PendingAuditItem | null>(null);
  const [justifyReason, setJustifyReason] = useState('Recusa do Residente');
  const [justifyNotes, setJustifyNotes] = useState('');
  const [aiReviewSummary, setAiReviewSummary] = useState<string | null>(null);
  const [isAiReviewing, setIsAiReviewing] = useState(false);

  // Sync shiftName with currentUser.shift
  useEffect(() => {
    if (currentUser?.shift && ['Manhã', 'Tarde', 'Noite'].includes(currentUser.shift)) {
      setShiftName(currentUser.shift as 'Manhã' | 'Tarde' | 'Noite');
    }
  }, [isOpen, currentUser?.shift]);

  // Run Automatic Audit on Open or Data Change
  useEffect(() => {
    if (mode === 'ENCERRAR_PLANTAO') {
      runAutomaticShiftAudit();
    }
  }, [mode, residents, evolutions, medications, alerts]);

  const runAutomaticShiftAudit = () => {
    setIsAuditing(true);
    const audits: PendingAuditItem[] = [];
    const todayStr = new Date().toLocaleDateString('pt-BR');

    residents.forEach(res => {
      // 1. Check SOAP Evolution
      const hasSoapToday = evolutions.some(e => e.residentId === res.id && e.date === todayStr);
      if (!hasSoapToday) {
        audits.push({
          id: `pnd-soap-${res.id}`,
          residentId: res.id,
          residentName: res.name,
          room: res.room,
          category: 'SOAP Incompleto',
          priority: 'Alta',
          description: `Ausência de Evolução Médica/Enfermagem SOAP registrada para a data de hoje (${todayStr}).`,
          actionType: 'open_soap',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        });
      }

      // 2. Check MAR Medications (Doses scheduled for today that are still 'Pendente')
      const resMeds = medications.filter(m => m.residentId === res.id);
      let pendingDosesCount = 0;
      resMeds.forEach(m => {
        const pending = m.scheduledDoses.filter(d => d.status === 'Pendente');
        pendingDosesCount += pending.length;
      });

      if (pendingDosesCount > 0) {
        audits.push({
          id: `pnd-mar-${res.id}`,
          residentId: res.id,
          residentName: res.name,
          room: res.room,
          category: 'MAR Pendente',
          priority: 'Crítica',
          description: `Existem ${pendingDosesCount} dose(s) do protocolo de 12/12h (horários fixos: 08:00h e 20:00h) aguardando checagem/ministração no Kardex Eletrônico (MAR).`,
          actionType: 'open_mar',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        });
      }

      // 3. Check Vitals (NEWS2 Risk score elevated or missing)
      if (res.news2?.riskLevel === 'Crítico' || res.news2?.riskLevel === 'Alto') {
        audits.push({
          id: `pnd-vitals-${res.id}`,
          residentId: res.id,
          residentName: res.name,
          room: res.room,
          category: 'Sinal Vital Faltante',
          priority: 'Crítica',
          description: `NEWS2 Elevado (${res.news2.totalScore} pts - ${res.news2.riskLevel}). Necessita reavaliação de sinais vitais beira-leito.`,
          actionType: 'open_vitals',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        });
      }
    });

    setPendingItems(audits);
    setIsAuditing(false);
  };

  // AI Quality Review trigger
  const handleTriggerAiReview = () => {
    setIsAiReviewing(true);
    setTimeout(() => {
      setAiReviewSummary(
        `🤖 Análise do Motor Nexa IA para Encerramento de Plantão:\n\n` +
        `• Consistência dos Prontuários: 94% de conformidade com os protocolos do SUS/RAPS.\n` +
        `• Prontidão Geral: ${residents.length - pendingItems.length} de ${residents.length} residentes prontos para troca de turno.\n` +
        `• Recomendações: Atenção especial para checagem de psicotrópicos em atraso e monitorização contínua de saturação no Quarto 102.`
      );
      setIsAiReviewing(false);
    }, 1000);
  };

  // Handle Save Justification
  const handleSaveJustification = () => {
    if (!selectedJustifyItem) return;

    const updated = pendingItems.map(item => {
      if (item.id !== selectedJustifyItem.id) return item;
      return {
        ...item,
        justification: {
          reason: justifyReason,
          notes: justifyNotes || 'Justificado pelo profissional para o próximo plantão.',
          transferredToNextShift: true,
          authorizedBy: currentUser.name,
          timestamp: new Date().toLocaleString('pt-BR')
        }
      };
    });

    setPendingItems(updated);
    setSelectedJustifyItem(null);
    setJustifyNotes('');
  };

  // Inbound Handover Submit
  const handleConfirmInbound = () => {
    if (!readCheck || !understoodCheck || !responsibilityCheck) return;
    onCompleteInboundHandover({ shiftName, signaturePin });
    onClose();
  };

  // Outbound Handover Submit
  const handleConfirmOutbound = () => {
    const unhandled = pendingItems.filter(i => !i.justification);
    if (unhandled.length > 0) return;

    const newHandoverLog: HandoverLog = {
      id: `hnd-${Date.now()}`,
      date: new Date().toLocaleDateString('pt-BR'),
      shift: shiftName === 'Noite' ? 'Noturno' : shiftName,
      authorName: currentUser.name,
      authorRole: (currentUser.role.includes('Enfermeiro') ? 'Enfermeiro RT' : currentUser.role.includes('Psiquiatra') ? 'Psiquiatra' : 'Enfermeiro RT') as any,
      summaryText: `Troca de plantão concluída com auditoria em tempo real. ${pendingItems.length} pendência(s) auditada(s) / transferida(s) com justificativas para o próximo turno.`,
      occurrences: [],
      acknowledgedBy: [currentUser.name]
    };

    onCompleteOutboundHandover(newHandoverLog, pendingItems);
    onClose();
  };

  // Calculate Readiness per resident
  const getResidentReadinessStatus = (resId: string) => {
    const resPendings = pendingItems.filter(p => p.residentId === resId && !p.justification);
    if (resPendings.some(p => p.priority === 'Crítica')) return 'RED';
    if (resPendings.length > 0) return 'YELLOW';
    return 'GREEN';
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl w-full max-w-4xl shadow-2xl overflow-hidden border border-zinc-200/90 flex flex-col max-h-[92vh]">
        
        {/* Header Bar */}
        <div className="p-5 bg-gradient-to-r from-slate-900 via-slate-800 to-teal-950 text-white flex items-center justify-between shrink-0 border-b border-slate-700">
          <div className="flex items-center space-x-3">
            <div className="w-11 h-11 rounded-2xl bg-teal-500/20 border border-teal-400/30 flex items-center justify-center text-teal-300 shadow-inner">
              <ClipboardCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-full bg-teal-500/30 text-teal-200 text-[10px] font-extrabold uppercase tracking-wider border border-teal-400/30">
                  {mode === 'ASSUMIR_PLANTAO' ? 'Entrada no Turno' : 'Saída & Encerramento'}
                </span>
                <span className="text-xs text-slate-400 font-mono">• NexaMed Smart Handover</span>
              </div>
              <h2 className="text-base font-extrabold text-white tracking-tight mt-0.5">
                {mode === 'ASSUMIR_PLANTAO' ? 'Central Inteligente de Entrada de Plantão' : 'Central de Encerramento & Auditoria de Pendências'}
              </h2>
            </div>
          </div>

          <button 
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* User Identity Banner */}
        <div className="px-6 py-3 bg-teal-50/70 border-b border-teal-100 flex flex-wrap items-center justify-between gap-3 text-xs shrink-0">
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="flex items-center gap-1.5 font-bold text-teal-950">
              <User className="w-4 h-4 text-teal-600" />
              <span>{currentUser.name}</span>
            </div>
            <span className="text-teal-300 font-bold">•</span>
            <span className="text-teal-800 font-semibold">{currentUser.role}</span>
            <span className="text-teal-300 font-bold">•</span>
            <span className="text-teal-800 font-medium">{currentUser.unit}</span>
            {currentUser.team && (
              <>
                <span className="text-teal-300 font-bold">•</span>
                <span className="text-teal-900 font-bold bg-teal-100/90 px-2 py-0.5 rounded-md text-[11px] border border-teal-200">
                  {currentUser.team}
                </span>
              </>
            )}
          </div>

          <div className="flex items-center gap-2">
            <span className="font-bold text-zinc-600">Turno Ativo:</span>
            <select
              value={shiftName}
              onChange={(e) => setShiftName(e.target.value as any)}
              className="bg-white border border-teal-200 rounded-lg px-2.5 py-1 font-bold text-teal-900 focus:outline-none focus:ring-2 focus:ring-teal-500 shadow-2xs"
            >
              <option value="Manhã">Manhã (07h às 13h)</option>
              <option value="Tarde">Tarde (13h às 19h)</option>
              <option value="Noite">Noite (19h às 07h / 12x36)</option>
            </select>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-xs flex-1">

          {/* ================= MODE 1: ASSUMIR PLANTÃO ================= */}
          {mode === 'ASSUMIR_PLANTAO' && (
            <div className="space-y-6">
              
              {/* IA Synthesized Executive Summary */}
              <div className="p-5 bg-gradient-to-br from-teal-900 via-teal-950 to-slate-900 rounded-2xl text-white shadow-md border border-teal-700/60 space-y-3">
                <div className="flex items-center justify-between border-b border-teal-700/60 pb-2.5">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-teal-300 animate-pulse" />
                    <h3 className="text-xs font-bold text-teal-100 uppercase tracking-wider">
                      Resumo Executivo do Turno Anterior Sintetizado por IA
                    </h3>
                  </div>
                  <span className="text-[10px] bg-teal-800/80 text-teal-200 px-2 py-0.5 rounded-full border border-teal-600/40 font-mono">
                    Últimas 12 horas
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs text-teal-50">
                  <div className="p-3 bg-white/5 rounded-xl border border-teal-500/20 space-y-1.5">
                    <strong className="text-teal-300 block text-[11px] uppercase tracking-wider">
                      🚨 Ocorrências e Intercorrências Recentes:
                    </strong>
                    <p className="text-xs leading-relaxed font-sans text-teal-100">
                      Sra. Helena Vasconcelos apresentou episódio de agitação psicomotora leve às 21h. Respondendo bem ao acolhimento sem necessidade de contenção.
                    </p>
                  </div>

                  <div className="p-3 bg-white/5 rounded-xl border border-teal-500/20 space-y-1.5">
                    <strong className="text-teal-300 block text-[11px] uppercase tracking-wider">
                      💊 Medicação & Sinais Vitais (NEWS2):
                    </strong>
                    <p className="text-xs leading-relaxed font-sans text-teal-100">
                      NEWS2 de Sr. Benedito passou para 5 (Atenção Alta - febril 38.3°C). Todas as medicações noturnas ministradas no MAR.
                    </p>
                  </div>
                </div>
              </div>

              {/* Status de Prontidão do Plantão per Resident */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-zinc-900 uppercase tracking-wider flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-teal-600" />
                    Status de Prontidão do Plantão por Residente
                  </h3>
                  <div className="flex items-center gap-3 text-[11px] font-semibold">
                    <span className="flex items-center gap-1 text-emerald-700">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> 🟢 Pronto
                    </span>
                    <span className="flex items-center gap-1 text-amber-700">
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span> 🟡 Observação
                    </span>
                    <span className="flex items-center gap-1 text-rose-700">
                      <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span> 🔴 Atenção Crítica
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                  {residents.map((res) => {
                    const status = res.news2?.riskLevel === 'Crítico' || res.news2?.riskLevel === 'Alto' ? 'RED' : 'GREEN';
                    
                    return (
                      <div 
                        key={res.id}
                        className={`p-3 rounded-xl border flex items-center justify-between transition-all ${
                          status === 'RED' 
                            ? 'bg-rose-50/70 border-rose-200' 
                            : 'bg-zinc-50/80 border-zinc-200'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="relative">
                            <img src={res.avatar} alt={res.name} className="w-9 h-9 rounded-xl object-cover border border-zinc-300" />
                            <span className={`absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full border-2 border-white ${
                              status === 'RED' ? 'bg-rose-500 animate-pulse' : 'bg-emerald-500'
                            }`}></span>
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-zinc-900 text-xs">{res.name}</span>
                              <span className="text-[10px] text-zinc-400 font-mono">Q.{res.room}</span>
                            </div>
                            <span className="text-[10px] text-zinc-500 block font-medium">
                              NEWS2: <strong className={status === 'RED' ? 'text-rose-700 font-bold' : 'text-emerald-700'}>
                                {res.news2?.totalScore || 0} pts ({res.news2?.riskLevel || 'Baixo'})
                              </strong>
                            </span>
                          </div>
                        </div>

                        <span className={`px-2 py-1 rounded-lg text-[10px] font-bold uppercase ${
                          status === 'RED'
                            ? 'bg-rose-100 text-rose-800 border border-rose-300'
                            : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                        }`}>
                          {status === 'RED' ? '🔴 Atenção' : '🟢 Em Dia'}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Mandatory Handover Checklist */}
              <div className="p-4 bg-zinc-50 border border-zinc-200 rounded-2xl space-y-3">
                <h3 className="text-xs font-bold text-zinc-900 uppercase tracking-wider flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-teal-600" />
                  Checklist Obrigatorio de Entrada de Plantão
                </h3>

                <div className="space-y-2 text-xs font-medium text-zinc-800">
                  <label className="flex items-center gap-2.5 p-2 bg-white rounded-xl border border-zinc-200 cursor-pointer hover:bg-teal-50/50 transition-colors">
                    <input
                      type="checkbox"
                      checked={readCheck}
                      onChange={(e) => setReadCheck(e.target.checked)}
                      className="w-4 h-4 accent-teal-600 rounded"
                    />
                    <span>Li toda a passagem de plantão, ocorrências e atualizações de conduta.</span>
                  </label>

                  <label className="flex items-center gap-2.5 p-2 bg-white rounded-xl border border-zinc-200 cursor-pointer hover:bg-teal-50/50 transition-colors">
                    <input
                      type="checkbox"
                      checked={understoodCheck}
                      onChange={(e) => setUnderstoodCheck(e.target.checked)}
                      className="w-4 h-4 accent-teal-600 rounded"
                    />
                    <span>Compreendi o estado dos residentes críticos e pendências do turno anterior.</span>
                  </label>

                  <label className="flex items-center gap-2.5 p-2 bg-white rounded-xl border border-zinc-200 cursor-pointer hover:bg-teal-50/50 transition-colors">
                    <input
                      type="checkbox"
                      checked={responsibilityCheck}
                      onChange={(e) => setResponsibilityCheck(e.target.checked)}
                      className="w-4 h-4 accent-teal-600 rounded"
                    />
                    <span>Estou assumindo formalmente a responsabilidade clínica por este plantão.</span>
                  </label>
                </div>

                {/* PIN / Electronic Signature */}
                <div className="pt-2 border-t border-zinc-200 flex items-center justify-between gap-4">
                  <div>
                    <label className="block text-[11px] font-bold text-zinc-700 mb-1">PIN / Assinatura Eletrônica Profissional</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="password"
                        value={signaturePin}
                        onChange={(e) => setSignaturePin(e.target.value)}
                        placeholder="Insira PIN 1234"
                        className="w-32 bg-white p-2 rounded-xl border border-zinc-300 font-mono text-center font-bold focus:outline-none focus:ring-2 focus:ring-teal-500"
                      />
                      <span className="text-[11px] text-zinc-400">PIN Padrão Demo: 1234</span>
                    </div>
                  </div>

                  <button
                    onClick={handleConfirmInbound}
                    disabled={!readCheck || !understoodCheck || !responsibilityCheck}
                    className="px-6 py-3 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 disabled:opacity-40 text-white font-extrabold text-xs rounded-xl shadow-lg transition-all flex items-center gap-2 shrink-0"
                  >
                    <ShieldCheck className="w-5 h-5" />
                    <span>ASSUMIR PLANTÃO AGORA</span>
                  </button>
                </div>
              </div>

            </div>
          )}

          {/* ================= MODE 2: ENCERRAR PLANTÃO & AUDITORIA DE PENDÊNCIAS ================= */}
          {mode === 'ENCERRAR_PLANTAO' && (
            <div className="space-y-6">

              {/* IA Quality Review Section */}
              <div className="p-4 bg-teal-50/80 border border-teal-200 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <h3 className="text-xs font-bold text-teal-950 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-teal-600" />
                    Auditoria Automática & IA de Revisão de Prontuários
                  </h3>
                  <p className="text-[11px] text-teal-800">
                    O sistema escaneou automaticamente todos os registros do seu turno para prevenir lacunas documentais.
                  </p>
                </div>

                <button
                  onClick={handleTriggerAiReview}
                  disabled={isAiReviewing}
                  className="px-3.5 py-2 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-xl transition-all shadow-2xs flex items-center gap-1.5 shrink-0"
                >
                  <Sparkles className="w-4 h-4 text-white" />
                  <span>{isAiReviewing ? 'Analisando...' : 'Executar Análise Nexa IA'}</span>
                </button>
              </div>

              {aiReviewSummary && (
                <div className="p-4 bg-slate-900 text-teal-100 rounded-2xl border border-teal-700 font-sans text-xs whitespace-pre-wrap leading-relaxed shadow-inner">
                  {aiReviewSummary}
                </div>
              )}

              {/* Central de Pendências Table */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xs font-bold text-zinc-900 uppercase tracking-wider flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-amber-600" />
                      Central de Pendências Encontradas na Auditoria ({pendingItems.length})
                    </h3>
                    <p className="text-[11px] text-zinc-500">
                      Resolva diretamente ou insira justificativa para transferência automática para o próximo turno.
                    </p>
                  </div>

                  <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${
                    pendingItems.filter(i => !i.justification).length === 0
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                      : 'bg-amber-100 text-amber-800 border border-amber-300'
                  }`}>
                    {pendingItems.filter(i => !i.justification).length === 0 ? '✅ 100% Liberado para Entrega' : `⚠️ ${pendingItems.filter(i => !i.justification).length} pendência(s) sem justificativa`}
                  </span>
                </div>

                {pendingItems.length === 0 ? (
                  <div className="p-8 text-center bg-emerald-50/50 border border-emerald-200 rounded-2xl space-y-2">
                    <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
                    <h4 className="font-bold text-emerald-900 text-sm">Nenhuma Pendência Detectada!</h4>
                    <p className="text-xs text-emerald-700">Todos os registros SOAP, MAR e Sinais Vitais estão rigorosamente preenchidos.</p>
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {pendingItems.map((item) => (
                      <div 
                        key={item.id}
                        className={`p-3.5 rounded-2xl border transition-all ${
                          item.justification 
                            ? 'bg-zinc-50 border-zinc-200 opacity-80' 
                            : item.priority === 'Crítica' ? 'bg-rose-50/80 border-rose-300' : 'bg-amber-50/80 border-amber-300'
                        }`}
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase ${
                                item.priority === 'Crítica' ? 'bg-rose-200 text-rose-900' : 'bg-amber-200 text-amber-900'
                              }`}>
                                {item.priority}
                              </span>
                              <span className="font-bold text-zinc-900 text-xs">{item.residentName} (Q.{item.room})</span>
                              <span className="text-[10px] text-zinc-400 font-mono">• {item.time}</span>
                            </div>

                            <p className="text-xs text-zinc-800 font-medium">{item.description}</p>

                            {item.justification && (
                              <div className="p-2 bg-teal-50 border border-teal-200 rounded-xl text-[11px] text-teal-900 font-semibold flex items-center gap-2 mt-1">
                                <Check className="w-4 h-4 text-teal-600 shrink-0" />
                                <span>Justificado e Transferido: {item.justification.reason} - "{item.justification.notes}" (por {item.justification.authorizedBy})</span>
                              </div>
                            )}
                          </div>

                          {!item.justification && (
                            <div className="flex items-center gap-2 shrink-0">
                              <button
                                onClick={() => onResolvePendingDirectly(item)}
                                className="px-3 py-2 bg-teal-600 hover:bg-teal-700 text-white font-extrabold text-xs rounded-xl shadow-2xs transition-all flex items-center gap-1.5"
                              >
                                <ArrowRight className="w-3.5 h-3.5" />
                                <span>IR DIRETO PARA A CORREÇÃO</span>
                              </button>

                              <button
                                onClick={() => setSelectedJustifyItem(item)}
                                className="px-3 py-2 bg-zinc-200 hover:bg-zinc-300 text-zinc-800 font-bold text-xs rounded-xl transition-all"
                              >
                                Justificar
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Justification Form Popup */}
              {selectedJustifyItem && (
                <div className="p-4 bg-zinc-900 text-white rounded-2xl border border-zinc-700 space-y-3">
                  <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
                    <span className="font-bold text-xs text-amber-400">
                      Justificar Pendência: {selectedJustifyItem.residentName} ({selectedJustifyItem.category})
                    </span>
                    <button onClick={() => setSelectedJustifyItem(null)} className="text-zinc-400 hover:text-white">
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-zinc-300 mb-1">Motivo Principal</label>
                      <select
                        value={justifyReason}
                        onChange={(e) => setJustifyReason(e.target.value)}
                        className="w-full bg-zinc-800 text-white p-2 rounded-xl border border-zinc-700 text-xs font-semibold focus:outline-none"
                      >
                        <option value="Recusa do Residente">Recusa do Residente / Familiar</option>
                        <option value="Aguardando Retorno Médico/Exame">Aguardando Retorno Médico / Exame</option>
                        <option value="Falta de Insumo Especializado">Falta de Insumo Especializado</option>
                        <option value="Transferido para o Próximo Turno">Transferido para o Próximo Turno por Horário</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-zinc-300 mb-1">Observações da Justificativa</label>
                      <input
                        type="text"
                        value={justifyNotes}
                        onChange={(e) => setJustifyNotes(e.target.value)}
                        placeholder="Ex: Residente dormindo no momento, checagem reagendada..."
                        className="w-full bg-zinc-800 text-white p-2 rounded-xl border border-zinc-700 text-xs focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-1">
                    <button
                      onClick={() => setSelectedJustifyItem(null)}
                      className="px-3 py-1.5 bg-zinc-800 text-zinc-300 hover:bg-zinc-700 font-bold rounded-lg"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={handleSaveJustification}
                      className="px-4 py-1.5 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-lg"
                    >
                      Salvar Justificativa
                    </button>
                  </div>
                </div>
              )}

              {/* Submit Final Handover */}
              <div className="pt-4 border-t border-zinc-200 flex items-center justify-between">
                <p className="text-xs text-zinc-500 font-medium">
                  Após confirmar, o relatório de encerramento será registrado na auditoria e enviado ao próximo turno.
                </p>

                <button
                  onClick={handleConfirmOutbound}
                  disabled={pendingItems.some(i => !i.justification)}
                  className="px-6 py-3 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 disabled:opacity-40 text-white font-extrabold text-xs rounded-xl shadow-lg transition-all flex items-center gap-2 shrink-0"
                >
                  <CheckCircle2 className="w-5 h-5" />
                  <span>ENCERRAR PLANTÃO & ENTREGAR TURNO</span>
                </button>
              </div>

            </div>
          )}

        </div>

      </div>
    </div>
  );
};
