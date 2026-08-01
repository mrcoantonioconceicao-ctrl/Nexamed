import React, { useState } from 'react';
import { 
  CalendarRange, 
  Sparkles, 
  Plus, 
  AlertTriangle, 
  CheckCircle2, 
  User, 
  Clock,
  ShieldCheck,
  ChevronRight
} from 'lucide-react';
import { StaffRoster } from '../types';

interface EscalasViewProps {
  roster: StaffRoster[];
  onAddRosterItem: (item: StaffRoster) => void;
}

export const EscalasView: React.FC<EscalasViewProps> = ({
  roster,
  onAddRosterItem,
}) => {
  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const vacantShifts = roster.filter(r => r.status === 'Vago' || !r.assignedStaffName);

  const handleRunAiRosterAnalysis = async () => {
    setIsAnalyzing(true);
    try {
      const res = await fetch('/api/nexa/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: 'Analise a escala semanal da equipe de enfermagem e medicina. Identifique lacunas de plantão, sobreposições e sugira remanejamentos imediatos.',
          contextPage: 'Escalas de Plantão',
        }),
      });

      const data = await res.json();
      setAiAnalysis(data.text || 'Análise de escala concluída.');
    } catch (err) {
      console.error('Error analyzing roster:', err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 bg-white border border-zinc-200/90 rounded-2xl shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <CalendarRange className="w-5 h-5 text-purple-600" />
            <h1 className="text-lg font-black text-zinc-900 uppercase tracking-wider">
              Escala Semanal da Equipe Multiprofissional
            </h1>
          </div>
          <p className="text-xs text-zinc-500 font-medium">
            Planejamento de plantões, detecção automática de lacunas de responsabilidade técnica e sobreposição
          </p>
        </div>

        <button
          onClick={handleRunAiRosterAnalysis}
          disabled={isAnalyzing}
          className="py-2.5 px-4 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white font-extrabold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-2"
        >
          <Sparkles className="w-4 h-4 text-purple-100" />
          <span>{isAnalyzing ? 'Analisando Escala...' : 'IA Nexa Auditoria de Escala'}</span>
        </button>
      </div>

      {/* AI Analysis Box if triggered */}
      {aiAnalysis && (
        <div className="p-4 bg-purple-50/80 border border-purple-200 rounded-2xl space-y-2 animate-in fade-in duration-150">
          <div className="flex items-center justify-between border-b border-purple-200/80 pb-2">
            <span className="text-xs font-bold text-purple-900 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-purple-600" />
              Resultado da Auditoria da IA Nexa
            </span>
            <button
              onClick={() => setAiAnalysis(null)}
              className="text-[11px] text-purple-700 hover:underline font-bold"
            >
              Fechar
            </button>
          </div>
          <p className="text-xs text-purple-950 whitespace-pre-wrap leading-relaxed font-medium">{aiAnalysis}</p>
        </div>
      )}

      {/* Vacant Shifts Alert Banner */}
      {vacantShifts.length > 0 && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
            <div>
              <p className="text-xs font-extrabold text-rose-900 uppercase">
                Atenção: {vacantShifts.length} Plantão(ões) com Lacuna de Cobertura
              </p>
              <p className="text-xs text-rose-700 font-medium">
                É obrigatória a presença de Enfermeiro RT / Técnico em todos os turnos de plantão.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Roster Table */}
      <div className="p-5 bg-white border border-zinc-200/90 rounded-2xl shadow-xs overflow-x-auto">
        <table className="w-full text-left text-xs text-zinc-700 border-collapse">
          <thead>
            <tr className="border-b border-zinc-200 text-zinc-500 uppercase text-[10px] font-black tracking-wider bg-zinc-50/80">
              <th className="p-3 rounded-l-xl">Data / Dia</th>
              <th className="p-3">Turno</th>
              <th className="p-3">Função Exigida</th>
              <th className="p-3">Profissional Escalado</th>
              <th className="p-3 text-right rounded-r-xl">Status do Plantão</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100">
            {roster.map((item) => (
              <tr key={item.id} className="hover:bg-zinc-50/60 transition-colors">
                <td className="p-3 font-bold text-zinc-900">
                  {item.date} <span className="text-zinc-500 font-normal">({item.dayOfWeek})</span>
                </td>
                <td className="p-3 text-teal-700 font-bold">{item.shiftType}</td>
                <td className="p-3 text-zinc-700 font-medium">{item.roleRequired}</td>
                <td className="p-3 font-semibold">
                  {item.assignedStaffName ? (
                    <span className="text-zinc-900 flex items-center gap-1.5 font-bold">
                      <User className="w-3.5 h-3.5 text-teal-600" />
                      {item.assignedStaffName}
                    </span>
                  ) : (
                    <span className="text-rose-600 font-bold italic">Sem profissional escalado</span>
                  )}
                </td>
                <td className="p-3 text-right">
                  <span className={`text-[10px] font-bold px-2.5 py-1 rounded-md border uppercase ${
                    item.status === 'Confirmado' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' :
                    item.status === 'Vago' ? 'bg-rose-50 text-rose-800 border-rose-200' :
                    'bg-amber-50 text-amber-800 border-amber-200'
                  }`}>
                    {item.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
