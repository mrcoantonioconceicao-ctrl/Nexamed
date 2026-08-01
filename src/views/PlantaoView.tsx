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
  X
} from 'lucide-react';
import { HandoverLog, OccurrenceItem, OccurrenceCategory } from '../types';

interface PlantaoViewProps {
  handovers: HandoverLog[];
  onAddOccurrence: (occurrence: OccurrenceItem) => void;
  onAcknowledgeHandover: (handoverId: string, staffName: string) => void;
}

export const PlantaoView: React.FC<PlantaoViewProps> = ({
  handovers,
  onAddOccurrence,
  onAcknowledgeHandover,
}) => {
  const [aiHandoverSummary, setAiHandoverSummary] = useState<string | null>(null);
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);
  const [showOccurrenceModal, setShowOccurrenceModal] = useState(false);

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
    } finally {
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

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 bg-white border border-zinc-200/90 rounded-2xl shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <ClipboardCheck className="w-5 h-5 text-teal-600" />
            <h1 className="text-lg font-black text-zinc-900 uppercase tracking-wider">
              Passagem de Plantão e Registro Entre Turnos
            </h1>
          </div>
          <p className="text-xs text-zinc-500 font-medium">
            Log contínuo de ocorrências, assiduidade da equipe e transferência de responsabilidade clínica
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleGenerateAiSummary}
            disabled={isGeneratingSummary}
            className="py-2.5 px-4 bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white font-extrabold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-2"
          >
            <Sparkles className="w-4 h-4 text-white stroke-[2.5]" />
            <span>{isGeneratingSummary ? 'Sintetizando Plantão...' : 'Gerar Resumo por IA Nexa'}</span>
          </button>
          <button
            onClick={() => setShowOccurrenceModal(true)}
            className="py-2.5 px-4 bg-zinc-100 hover:bg-zinc-200 text-zinc-800 font-bold text-xs rounded-xl border border-zinc-200 transition-colors flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4 text-zinc-600" />
            <span>Registrar Ocorrência</span>
          </button>
        </div>
      </div>

      {/* AI Summary Card if generated */}
      {aiHandoverSummary && (
        <div className="p-5 bg-teal-50/80 border border-teal-200/90 rounded-2xl shadow-xs space-y-3 animate-in fade-in duration-150">
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

      {/* Handover Logs Feed */}
      <div className="space-y-4">
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
                  className="w-full bg-zinc-50 text-zinc-900 p-2.5 rounded-xl border border-zinc-200 focus:outline-none focus:border-teal-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-zinc-700 mb-1">Categoria *</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as OccurrenceCategory)}
                    className="w-full bg-zinc-50 text-zinc-900 p-2.5 rounded-xl border border-zinc-200 focus:outline-none focus:border-teal-500"
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
                    className="w-full bg-zinc-50 text-zinc-900 p-2.5 rounded-xl border border-zinc-200 focus:outline-none focus:border-teal-500"
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
                  className="w-full bg-zinc-50 text-zinc-900 p-2.5 rounded-xl border border-zinc-200 focus:outline-none focus:border-teal-500"
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
