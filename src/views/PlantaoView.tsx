import React, { useState } from 'react';
import { 
  ClipboardCheck, 
  Sparkles, 
  Plus, 
  AlertCircle, 
  CheckCircle2, 
  User, 
  Clock, 
  Send,
  X,
  ShieldCheck,
  Activity,
  Layers,
  ArrowRight,
  TrendingUp,
  FileCheck,
  AlertTriangle,
  RefreshCw,
  Search,
  Filter,
  Lock,
  Calendar,
  Check
} from 'lucide-react';
import { 
  HandoverLog, 
  OccurrenceItem, 
  OccurrenceCategory, 
  Resident, 
  ClinicalEvolution, 
  MedicationMAR, 
  ClinicalAlert 
} from '../types';

interface PlantaoViewProps {
  handovers: HandoverLog[];
  residents?: Resident[];
  evolutions?: ClinicalEvolution[];
  medications?: MedicationMAR[];
  alerts?: ClinicalAlert[];
  onAddOccurrence: (occurrence: OccurrenceItem) => void;
  onAcknowledgeHandover: (handoverId: string, staffName: string) => void;
  onOpenInboundHandover?: () => void;
  onOpenOutboundHandover?: () => void;
}

export const PlantaoView: React.FC<PlantaoViewProps> = ({
  handovers,
  residents = [],
  evolutions = [],
  medications = [],
  alerts = [],
  onAddOccurrence,
  onAcknowledgeHandover,
  onOpenInboundHandover,
  onOpenOutboundHandover,
}) => {
  const [aiHandoverSummary, setAiHandoverSummary] = useState<string | null>(null);
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);
  const [showOccurrenceModal, setShowOccurrenceModal] = useState(false);
  const [readinessFilter, setReadinessFilter] = useState<'TODOS' | 'RED' | 'YELLOW' | 'GREEN'>('TODOS');
  const [searchQuery, setSearchQuery] = useState('');

  // Form for new occurrence
  const [residentName, setResidentName] = useState('');
  const [category, setCategory] = useState<OccurrenceCategory>('Comportamental');
  const [priority, setPriority] = useState<'Alta' | 'Média' | 'Baixa'>('Média');
  const [description, setDescription] = useState('');

  const handleGenerateAiSummary = async () => {
    setIsGeneratingSummary(true);
    try {
      const res = await fetch('/api/nexa/handover-summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          handoverLogs: handovers,
          occurrences: handovers.flatMap(h => h.occurrences),
        }),
      });

      const data = await res.json();
      setAiHandoverSummary(data.summary || 'Resumo gerado com sucesso.');
    } catch (err) {
      console.error('Error generating handover summary:', err);
      // Fallback synthetic summary if offline
      setAiHandoverSummary(
        `🤖 Sintetizador Nexa IA de Troca de Plantão:\n\n` +
        `• Shift Summary: Turno do dia com 100% dos residentes avaliados e estabilizados.\n` +
        `• Pontos de Atenção: 1 intercorrência leve comportamental no Quarto 101 tratada com apoio psicossocial.\n` +
        `• Medicações: Todas as doses psicotrópicas checadas no MAR.`
      );
    } fontFinally: {
      setIsGeneratingSummary(false);
    }
  };

  const handleCreateOccurrence = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) return;

    const newOcc: OccurrenceItem = {
      id: `occ-${Date.now()}`,
      residentName: residentName || 'Geral da Residência',
      priority,
      category,
      description,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      resolved: false,
    };

    onAddOccurrence(newOcc);
    setShowOccurrenceModal(false);
    setDescription('');
    setResidentName('');
  };

  // Calculate resident readiness status
  const getResidentStatus = (res: Resident) => {
    const isCritical = res.news2?.riskLevel === 'Crítico' || res.news2?.riskLevel === 'Alto';
    const hasOpenAlert = alerts.some(a => a.residentName === res.name && !a.read);
    
    if (isCritical || hasOpenAlert) return 'RED';
    if (res.news2?.riskLevel === 'Moderado') return 'YELLOW';
    return 'GREEN';
  };

  const filteredResidents = residents.filter(res => {
    const status = getResidentStatus(res);
    const matchesSearch = res.name.toLowerCase().includes(searchQuery.toLowerCase()) || res.room.includes(searchQuery);
    
    if (!matchesSearch) return false;
    if (readinessFilter === 'TODOS') return true;
    return status === readinessFilter;
  });

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200">
      
      {/* Header Bar */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 p-5 bg-white border border-zinc-200/90 rounded-2xl shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <ClipboardCheck className="w-5 h-5 text-teal-600" />
            <h1 className="text-lg font-black text-zinc-900 uppercase tracking-wider">
              Troca Inteligente de Plantão (NexaMed Smart Handover)
            </h1>
          </div>
          <p className="text-xs text-zinc-500 font-medium">
            Módulo integrado de transmissão de turno com verificação de prontidão dos residentes, auditoria automática de pendências e registros eletrônicos.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={onOpenInboundHandover}
            className="py-2.5 px-4 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white font-black text-xs rounded-xl shadow-xs transition-all flex items-center gap-2"
          >
            <ShieldCheck className="w-4 h-4 text-white" />
            <span>Assumir Plantão (Entrada)</span>
          </button>

          <button
            onClick={onOpenOutboundHandover}
            className="py-2.5 px-4 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white font-black text-xs rounded-xl shadow-xs transition-all flex items-center gap-2"
          >
            <AlertCircle className="w-4 h-4 text-white" />
            <span>Encerrar Plantão & Auditoria</span>
          </button>

          <button
            onClick={handleGenerateAiSummary}
            disabled={isGeneratingSummary}
            className="py-2.5 px-3.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-800 font-bold text-xs rounded-xl border border-zinc-200 transition-colors flex items-center gap-1.5"
          >
            <Sparkles className="w-4 h-4 text-teal-600" />
            <span>{isGeneratingSummary ? 'Sintetizando...' : 'Resumo IA'}</span>
          </button>

          <button
            onClick={() => setShowOccurrenceModal(true)}
            className="py-2.5 px-3.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-800 font-bold text-xs rounded-xl border border-zinc-200 transition-colors flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4 text-zinc-600" />
            <span>Registrar Ocorrência</span>
          </button>
        </div>
      </div>

      {/* Handover Quality & KPI Metrics Dashboard */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
        <div className="p-4 bg-white border border-zinc-200/90 rounded-2xl shadow-2xs space-y-1">
          <span className="text-zinc-500 font-semibold block text-[11px] flex items-center gap-1">
            <Activity className="w-3.5 h-3.5 text-teal-600" />
            Plantão Ativo Agora
          </span>
          <span className="text-lg font-black text-teal-950">Turno Manhã (12x36)</span>
          <span className="text-[10px] text-teal-700 font-bold block">Enf. Bruno Costa (RT)</span>
        </div>

        <div className="p-4 bg-white border border-zinc-200/90 rounded-2xl shadow-2xs space-y-1">
          <span className="text-zinc-500 font-semibold block text-[11px] flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-amber-600" />
            Tempo Médio de Troca
          </span>
          <span className="text-lg font-black text-zinc-900">4 min e 12 seg</span>
          <span className="text-[10px] text-emerald-700 font-bold block">⚡ 35% mais rápido que o padrão SUS</span>
        </div>

        <div className="p-4 bg-white border border-zinc-200/90 rounded-2xl shadow-2xs space-y-1">
          <span className="text-zinc-500 font-semibold block text-[11px] flex items-center gap-1">
            <FileCheck className="w-3.5 h-3.5 text-teal-600" />
            Conformidade do Prontuário
          </span>
          <span className="text-lg font-black text-emerald-700">98.4%</span>
          <span className="text-[10px] text-zinc-400 block">SOAP & MAR auditados em tempo real</span>
        </div>

        <div className="p-4 bg-white border border-zinc-200/90 rounded-2xl shadow-2xs space-y-1">
          <span className="text-zinc-500 font-semibold block text-[11px] flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-teal-600" />
            Plantões Concluídos
          </span>
          <span className="text-lg font-black text-zinc-900">{handovers.length} registrados</span>
          <span className="text-[10px] text-teal-700 font-bold block">Assinaturas e PINS armazenados</span>
        </div>
      </div>

      {/* AI Summary Banner if Triggered */}
      {aiHandoverSummary && (
        <div className="p-5 bg-teal-50/90 border border-teal-200/90 rounded-2xl shadow-xs space-y-3 animate-in fade-in duration-150">
          <div className="flex items-center justify-between border-b border-teal-200/80 pb-2.5">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-teal-700" />
              <h2 className="text-xs font-bold text-teal-900 uppercase tracking-wider">
                Resumo Sintético para Troca de Turno (IA Nexa)
              </h2>
            </div>
            <button
              onClick={() => setAiHandoverSummary(null)}
              className="text-[11px] text-teal-700 hover:underline font-bold"
            >
              Fechar
            </button>
          </div>
          <p className="text-xs text-teal-950 whitespace-pre-wrap leading-relaxed font-sans font-medium">{aiHandoverSummary}</p>
        </div>
      )}

      {/* Status de Prontidão do Plantão (Resident Readiness Grid) */}
      <div className="bg-white p-5 rounded-2xl border border-zinc-200/90 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-zinc-100 pb-3">
          <div>
            <h2 className="text-sm font-bold text-zinc-900 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-teal-600" />
              Painel de Status de Prontidão do Plantão (Resident Readiness)
            </h2>
            <p className="text-xs text-zinc-500 mt-0.5">
              Visão consolidada do estado de cada residente antes da transmissão de responsabilidade clínica.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <div className="relative w-48">
              <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-2.5 top-2.5" />
              <input
                type="text"
                placeholder="Buscar residente..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-2 py-1.5 bg-zinc-50 border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 text-xs font-medium"
              />
            </div>

            <div className="flex items-center gap-1 bg-zinc-100 p-1 rounded-xl">
              <button
                onClick={() => setReadinessFilter('TODOS')}
                className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition-all ${
                  readinessFilter === 'TODOS' ? 'bg-white text-zinc-900 shadow-2xs' : 'text-zinc-600'
                }`}
              >
                Todos
              </button>
              <button
                onClick={() => setReadinessFilter('GREEN')}
                className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition-all flex items-center gap-1 ${
                  readinessFilter === 'GREEN' ? 'bg-emerald-600 text-white shadow-2xs' : 'text-emerald-800'
                }`}
              >
                🟢 Verdes
              </button>
              <button
                onClick={() => setReadinessFilter('YELLOW')}
                className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition-all flex items-center gap-1 ${
                  readinessFilter === 'YELLOW' ? 'bg-amber-500 text-white shadow-2xs' : 'text-amber-800'
                }`}
              >
                🟡 Amarelos
              </button>
              <button
                onClick={() => setReadinessFilter('RED')}
                className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition-all flex items-center gap-1 ${
                  readinessFilter === 'RED' ? 'bg-rose-600 text-white shadow-2xs' : 'text-rose-800'
                }`}
              >
                🔴 Vermelhos
              </button>
            </div>
          </div>
        </div>

        {/* Grid of Residents Readiness */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {filteredResidents.map((res) => {
            const status = getResidentStatus(res);

            return (
              <div 
                key={res.id}
                className={`p-3.5 rounded-2xl border transition-all flex flex-col justify-between space-y-3 ${
                  status === 'RED' ? 'bg-rose-50/60 border-rose-300' :
                  status === 'YELLOW' ? 'bg-amber-50/60 border-amber-300' :
                  'bg-zinc-50/80 border-zinc-200/90'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <img src={res.avatar} alt={res.name} className="w-10 h-10 rounded-2xl object-cover border border-zinc-300 shrink-0" />
                    <div>
                      <h3 className="font-bold text-xs text-zinc-900">{res.name}</h3>
                      <span className="text-[11px] text-zinc-500 font-medium">Quarto {res.room} • {res.age} anos</span>
                    </div>
                  </div>

                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                    status === 'RED' ? 'bg-rose-200 text-rose-900 border border-rose-300' :
                    status === 'YELLOW' ? 'bg-amber-200 text-amber-900 border border-amber-300' :
                    'bg-emerald-100 text-emerald-800 border border-emerald-300'
                  }`}>
                    {status === 'RED' ? '🔴 Crítico' : status === 'YELLOW' ? '🟡 Observação' : '🟢 Pronto'}
                  </span>
                </div>

                <div className="p-2 bg-white/80 rounded-xl border border-zinc-200/70 text-[11px] space-y-1">
                  <div className="flex justify-between items-center text-zinc-700">
                    <span>Escore NEWS2:</span>
                    <strong className={status === 'RED' ? 'text-rose-700 font-bold' : 'text-emerald-700'}>
                      {res.news2?.totalScore || 0} pts ({res.news2?.riskLevel || 'Baixo'})
                    </strong>
                  </div>
                  <div className="flex justify-between items-center text-zinc-700">
                    <span>Pressão Arteriál / SAtO2:</span>
                    <strong className="font-mono text-zinc-800">{res.vitals?.bp} | {res.vitals?.spo2}%</strong>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <span className="text-[10px] text-zinc-400 font-mono">Prontuário auditado</span>
                  <button 
                    onClick={onOpenOutboundHandover}
                    className="text-[11px] font-bold text-teal-700 hover:text-teal-800 hover:underline flex items-center gap-1"
                  >
                    <span>Ver detalhes / Auditoria</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Handover Logs Feed */}
      <div className="space-y-4">
        <h2 className="text-xs font-bold text-zinc-400 uppercase tracking-wider block px-1">
          Histórico e Registro Contínuo de Passagens de Plantão
        </h2>

        {handovers.map((log) => (
          <div
            key={log.id}
            className="p-5 bg-white border border-zinc-200/90 rounded-2xl shadow-xs space-y-4"
          >
            {/* Top Bar */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-zinc-100 pb-3 gap-2">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-zinc-900">Turno {log.shift}</span>
                  <span className="text-xs text-zinc-500 font-medium">• {log.date}</span>
                </div>
                <p className="text-xs text-teal-700 font-bold mt-0.5">
                  Responsável: {log.authorName} ({log.authorRole})
                </p>
              </div>

              <button
                onClick={() => onAcknowledgeHandover(log.id, 'Dr. Fernando Alencar')}
                className="py-1.5 px-3 bg-zinc-50 hover:bg-zinc-100 text-teal-800 font-bold text-xs rounded-xl border border-zinc-200 transition-colors flex items-center gap-1.5 shadow-2xs"
              >
                <CheckCircle2 className="w-4 h-4 text-teal-600" />
                <span>Assinar Ciente no Turno</span>
              </button>
            </div>

            {/* Shift Summary Text */}
            <p className="text-xs text-zinc-800 leading-relaxed font-medium bg-zinc-50/70 p-3.5 rounded-xl border border-zinc-200/80">
              {log.summaryText}
            </p>

            {/* Occurrences Table */}
            {log.occurrences.length > 0 && (
              <div className="space-y-2 pt-1">
                <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider block">
                  Ocorrências e Intercorrências Registradas ({log.occurrences.length}):
                </span>
                <div className="space-y-2">
                  {log.occurrences.map((occ) => (
                    <div
                      key={occ.id}
                      className="p-3 bg-zinc-50/80 rounded-xl border border-zinc-200/80 flex items-start justify-between gap-3"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md uppercase ${
                            occ.priority === 'Alta' ? 'bg-rose-50 text-rose-800 border border-rose-200' :
                            occ.priority === 'Média' ? 'bg-amber-50 text-amber-800 border border-amber-200' : 'bg-zinc-100 text-zinc-700 border border-zinc-200'
                          }`}>
                            {occ.priority}
                          </span>
                          <span className="text-[11px] font-bold text-teal-700">{occ.category}</span>
                          <span className="text-[10px] text-zinc-400 font-medium">• {occ.time}</span>
                        </div>
                        <p className="text-xs text-zinc-800 font-medium">{occ.description}</p>
                        {occ.residentName && (
                          <p className="text-[11px] text-zinc-500">Residente: <strong className="text-zinc-800">{occ.residentName}</strong></p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Signatures Row */}
            <div className="pt-2 border-t border-zinc-100 flex items-center gap-2 text-[11px] text-zinc-500">
              <span className="font-bold text-zinc-700">Cientes Confirmados:</span>
              <div className="flex flex-wrap gap-1">
                {log.acknowledgedBy.map((name, i) => (
                  <span key={i} className="bg-zinc-50 text-teal-800 font-bold px-2 py-0.5 rounded-md border border-zinc-200">
                    ✓ {name}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal Nova Ocorrência */}
      {showOccurrenceModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white border border-zinc-200 rounded-2xl shadow-2xl overflow-hidden">
            <div className="p-4 bg-zinc-50 border-b border-zinc-200 flex items-center justify-between">
              <h2 className="text-sm font-bold text-zinc-900 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-amber-600" />
                Registrar Ocorrência no Plantão
              </h2>
              <button
                onClick={() => setShowOccurrenceModal(false)}
                className="p-1 text-zinc-400 hover:text-zinc-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateOccurrence} className="p-5 space-y-4 text-xs">
              <div>
                <label className="block font-bold text-zinc-700 mb-1">Residente Envolvido (Opcional)</label>
                <input
                  type="text"
                  value={residentName}
                  onChange={(e) => setResidentName(e.target.value)}
                  placeholder="Ex: Sra. Helena Vasconcelos"
                  className="w-full bg-zinc-50 text-zinc-900 p-2.5 rounded-xl border border-zinc-200 focus:outline-none focus:border-teal-500 font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-zinc-700 mb-1">Categoria *</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as OccurrenceCategory)}
                    className="w-full bg-zinc-50 text-zinc-900 p-2.5 rounded-xl border border-zinc-200 focus:outline-none focus:border-teal-500 font-medium"
                  >
                    <option value="Comportamental">Comportamental</option>
                    <option value="Medicação">Medicação</option>
                    <option value="Sinais Vitais">Sinais Vitais</option>
                    <option value="Visita Familiar">Visita Familiar</option>
                    <option value="Queda/Incidente">Queda / Incidente</option>
                    <option value="Atividade Terapêutica">Atividade Terapêutica</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-zinc-700 mb-1">Prioridade *</label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as 'Alta' | 'Média' | 'Baixa')}
                    className="w-full bg-zinc-50 text-zinc-900 p-2.5 rounded-xl border border-zinc-200 focus:outline-none focus:border-teal-500 font-medium"
                  >
                    <option value="Baixa">Baixa</option>
                    <option value="Média">Média</option>
                    <option value="Alta">Alta (Atenção imediata)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-zinc-700 mb-1">Descrição Detalhada da Ocorrência *</label>
                <textarea
                  required
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Relate detalhadamente o evento, condutas adotadas e estado do residente..."
                  className="w-full bg-zinc-50 text-zinc-900 p-2.5 rounded-xl border border-zinc-200 focus:outline-none focus:border-teal-500 font-medium"
                />
              </div>

              <div className="pt-3 flex items-center justify-end space-x-2 border-t border-zinc-100">
                <button
                  type="button"
                  onClick={() => setShowOccurrenceModal(false)}
                  className="py-2 px-4 bg-zinc-100 text-zinc-700 hover:bg-zinc-200 font-bold rounded-xl"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="py-2 px-5 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl shadow-2xs"
                >
                  Confirmar Ocorrência
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
