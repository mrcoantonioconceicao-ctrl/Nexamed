import React, { useState, useEffect } from 'react';
import { 
  CalendarRange, 
  Sparkles, 
  Plus, 
  AlertTriangle, 
  CheckCircle2, 
  User, 
  Clock,
  ShieldCheck,
  ChevronRight,
  Activity,
  FileText,
  Award
} from 'lucide-react';
import { StaffRoster, Resident, FunctionalScaleAssessment } from '../types';
import { giterStore } from '../utils/giterStore';

interface EscalasViewProps {
  roster: StaffRoster[];
  residents?: Resident[];
  onAddRosterItem: (item: StaffRoster) => void;
}

export const EscalasView: React.FC<EscalasViewProps> = ({
  roster,
  residents = [],
  onAddRosterItem,
}) => {
  const [activeTab, setActiveTab] = useState<'PLANTAO' | 'KATZ' | 'LAWTON'>('PLANTAO');
  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Functional Scales State
  const [assessments, setAssessments] = useState<FunctionalScaleAssessment[]>([]);
  const [selectedResidentId, setSelectedResidentId] = useState<string>(residents[0]?.id || '');

  // Katz Assessment Form State
  const [katzBanho, setKatzBanho] = useState<number>(1);
  const [katzVestuario, setKatzVestuario] = useState<number>(1);
  const [katzBanheiro, setKatzBanheiro] = useState<number>(1);
  const [katzTransferencia, setKatzTransferencia] = useState<number>(1);
  const [katzContinencia, setKatzContinencia] = useState<number>(1);
  const [katzAlimentacao, setKatzAlimentacao] = useState<number>(1);

  // Lawton Assessment Form State
  const [lawtonTelefone, setLawtonTelefone] = useState<number>(1);
  const [lawtonCompras, setLawtonCompras] = useState<number>(1);
  const [lawtonRefeicoes, setLawtonRefeicoes] = useState<number>(1);
  const [lawtonDomesticas, setLawtonDomesticas] = useState<number>(1);
  const [lawtonLavarRoupa, setLawtonLavarRoupa] = useState<number>(1);
  const [lawtonTransporte, setLawtonTransporte] = useState<number>(1);
  const [lawtonRemedios, setLawtonRemedios] = useState<number>(1);
  const [lawtonDinheiro, setLawtonDinheiro] = useState<number>(1);

  useEffect(() => {
    setAssessments(giterStore.getAssessments());
  }, []);

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

  const handleSaveKatzAssessment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedResidentId) return;

    const totalKatz = katzBanho + katzVestuario + katzBanheiro + katzTransferencia + katzContinencia + katzAlimentacao;
    let classification = 'Independência Total';
    if (totalKatz <= 2) classification = 'Dependência Importante/Grave';
    else if (totalKatz <= 4) classification = 'Dependência Parcial/Moderada';

    const newAssessment: FunctionalScaleAssessment = {
      id: `katz-${Date.now()}`,
      residentId: selectedResidentId,
      scaleType: 'Katz',
      score: totalKatz,
      classification,
      assessedBy: 'Enf. Responsável Técnico',
      assessmentDate: new Date().toISOString().split('T')[0],
      details: {
        banho: katzBanho,
        vestuario: katzVestuario,
        banheiro: katzBanheiro,
        transferencia: katzTransferencia,
        continencia: katzContinencia,
        alimentacao: katzAlimentacao
      }
    };

    giterStore.saveAssessment(newAssessment);
    setAssessments(giterStore.getAssessments());
    alert(`Avaliação Katz salva com sucesso! Score: ${totalKatz}/6 (${classification})`);
  };

  const handleSaveLawtonAssessment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedResidentId) return;

    const totalLawton = lawtonTelefone + lawtonCompras + lawtonRefeicoes + lawtonDomesticas + lawtonLavarRoupa + lawtonTransporte + lawtonRemedios + lawtonDinheiro;
    let classification = 'Independência Total em AIVD';
    if (totalLawton <= 8) classification = 'Dependência Total';
    else if (totalLawton <= 15) classification = 'Dependência Parcial';

    const newAssessment: FunctionalScaleAssessment = {
      id: `lawton-${Date.now()}`,
      residentId: selectedResidentId,
      scaleType: 'Lawton',
      score: totalLawton,
      classification,
      assessedBy: 'Enf. Responsável Técnico',
      assessmentDate: new Date().toISOString().split('T')[0],
      details: {
        telefone: lawtonTelefone,
        compras: lawtonCompras,
        refeicoes: lawtonRefeicoes,
        domesticas: lawtonDomesticas,
        lavarRoupa: lawtonLavarRoupa,
        transporte: lawtonTransporte,
        remedios: lawtonRemedios,
        dinheiro: lawtonDinheiro
      }
    };

    giterStore.saveAssessment(newAssessment);
    setAssessments(giterStore.getAssessments());
    alert(`Avaliação Lawton salva com sucesso! Score: ${totalLawton}/24 (${classification})`);
  };

  const selectedResident = residents.find(r => r.id === selectedResidentId) || residents[0];
  const residentKatzHistory = assessments.filter(a => a.residentId === selectedResidentId && a.scaleType === 'Katz');
  const residentLawtonHistory = assessments.filter(a => a.residentId === selectedResidentId && a.scaleType === 'Lawton');

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 bg-white border border-zinc-200/90 rounded-2xl shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <CalendarRange className="w-5 h-5 text-purple-600" />
            <h1 className="text-lg font-black text-zinc-900 uppercase tracking-wider">
              Escalas de Plantão & Escalas Funcionais
            </h1>
          </div>
          <p className="text-xs text-zinc-500 font-medium">
            Gestão da escala profissional da equipe e avaliação contínua da capacidade funcional dos residentes (Katz e Lawton)
          </p>
        </div>

        {activeTab === 'PLANTAO' && (
          <button
            onClick={handleRunAiRosterAnalysis}
            disabled={isAnalyzing}
            className="py-2.5 px-4 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white font-extrabold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-2"
          >
            <Sparkles className="w-4 h-4 text-purple-100" />
            <span>{isAnalyzing ? 'Analisando Escala...' : 'IA Nexa Auditoria de Escala'}</span>
          </button>
        )}
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-zinc-200 pb-2">
        <button
          onClick={() => setActiveTab('PLANTAO')}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-all flex items-center gap-2 ${
            activeTab === 'PLANTAO'
              ? 'bg-purple-600 text-white shadow-xs'
              : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
          }`}
        >
          <CalendarRange className="w-4 h-4" />
          <span>Escala Semanal da Equipe</span>
        </button>

        <button
          onClick={() => setActiveTab('KATZ')}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-all flex items-center gap-2 ${
            activeTab === 'KATZ'
              ? 'bg-teal-600 text-white shadow-xs'
              : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
          }`}
        >
          <Activity className="w-4 h-4" />
          <span>Escala Katz (ABVD - Atividades Básicas)</span>
        </button>

        <button
          onClick={() => setActiveTab('LAWTON')}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-all flex items-center gap-2 ${
            activeTab === 'LAWTON'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
          }`}
        >
          <Award className="w-4 h-4" />
          <span>Escala Lawton (AIVD - Atividades Instrumentais)</span>
        </button>
      </div>

      {/* TAB 1: PLANTÃO */}
      {activeTab === 'PLANTAO' && (
        <div className="space-y-6">
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
      )}

      {/* TAB 2: ESCALA KATZ */}
      {activeTab === 'KATZ' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white p-6 border border-zinc-200/90 rounded-2xl shadow-xs space-y-4">
            <h2 className="text-xs font-black text-zinc-800 uppercase tracking-wider flex items-center gap-2">
              <Activity className="w-4 h-4 text-teal-600" />
              Avaliação de Atividades Básicas de Vida Diária (Escala de Katz)
            </h2>

            <form onSubmit={handleSaveKatzAssessment} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-zinc-700 mb-1">Selecionar Residente</label>
                <select
                  value={selectedResidentId}
                  onChange={(e) => setSelectedResidentId(e.target.value)}
                  className="w-full px-3 py-2 border border-zinc-200 rounded-xl font-bold text-zinc-800 focus:ring-2 focus:ring-teal-500"
                >
                  {residents.map(r => (
                    <option key={r.id} value={r.id}>{r.name} — Quarto {r.room}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-3 bg-zinc-50 border border-zinc-200 rounded-xl space-y-1">
                  <label className="block font-black text-zinc-800">1. Banho</label>
                  <select value={katzBanho} onChange={(e) => setKatzBanho(Number(e.target.value))} className="w-full p-2 border border-zinc-200 rounded-lg">
                    <option value={1}>1 - Toma banho sem ajuda ou com pouca ajuda</option>
                    <option value={0}>0 - Necessita de ajuda para lavar mais de uma parte</option>
                  </select>
                </div>

                <div className="p-3 bg-zinc-50 border border-zinc-200 rounded-xl space-y-1">
                  <label className="block font-black text-zinc-800">2. Vestuário</label>
                  <select value={katzVestuario} onChange={(e) => setKatzVestuario(Number(e.target.value))} className="w-full p-2 border border-zinc-200 rounded-lg">
                    <option value={1}>1 - Pega as roupas e veste-se completamente só</option>
                    <option value={0}>0 - Necessita de ajuda para vestir-se</option>
                  </select>
                </div>

                <div className="p-3 bg-zinc-50 border border-zinc-200 rounded-xl space-y-1">
                  <label className="block font-black text-zinc-800">3. Uso do Banheiro</label>
                  <select value={katzBanheiro} onChange={(e) => setKatzBanheiro(Number(e.target.value))} className="w-full p-2 border border-zinc-200 rounded-lg">
                    <option value={1}>1 - Vai ao banheiro, limpa-se e arruma roupas só</option>
                    <option value={0}>0 - Precisa de ajuda para ir ao vaso ou usar comadre</option>
                  </select>
                </div>

                <div className="p-3 bg-zinc-50 border border-zinc-200 rounded-xl space-y-1">
                  <label className="block font-black text-zinc-800">4. Transferência</label>
                  <select value={katzTransferencia} onChange={(e) => setKatzTransferencia(Number(e.target.value))} className="w-full p-2 border border-zinc-200 rounded-lg">
                    <option value={1}>1 - Deita e levanta da cama/cadeira sem ajuda</option>
                    <option value={0}>0 - Necessita de ajuda de terceiros para mover-se</option>
                  </select>
                </div>

                <div className="p-3 bg-zinc-50 border border-zinc-200 rounded-xl space-y-1">
                  <label className="block font-black text-zinc-800">5. Continência</label>
                  <select value={katzContinencia} onChange={(e) => setKatzContinencia(Number(e.target.value))} className="w-full p-2 border border-zinc-200 rounded-lg">
                    <option value={1}>1 - Controle total de esfíncteres vesical e anal</option>
                    <option value={0}>0 - Incontinência parcial/total ou uso de fraldas</option>
                  </select>
                </div>

                <div className="p-3 bg-zinc-50 border border-zinc-200 rounded-xl space-y-1">
                  <label className="block font-black text-zinc-800">6. Alimentação</label>
                  <select value={katzAlimentacao} onChange={(e) => setKatzAlimentacao(Number(e.target.value))} className="w-full p-2 border border-zinc-200 rounded-lg">
                    <option value={1}>1 - Alimenta-se sozinho sem auxílio</option>
                    <option value={0}>0 - Necessita de ajuda para levar alimento à boca</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-teal-600 hover:bg-teal-700 text-white font-extrabold text-xs rounded-xl shadow-xs transition-colors"
              >
                Salvar Avaliação Katz (ABVD)
              </button>
            </form>
          </div>

          <div className="bg-white p-5 border border-zinc-200/90 rounded-2xl shadow-xs space-y-4">
            <h3 className="text-xs font-black text-zinc-800 uppercase tracking-wider">
              Histórico Katz do Residente ({residentKatzHistory.length})
            </h3>

            {residentKatzHistory.length === 0 ? (
              <p className="text-xs text-zinc-400">Nenhum histórico registrado.</p>
            ) : (
              <div className="space-y-3 divide-y divide-zinc-100">
                {residentKatzHistory.map(h => (
                  <div key={h.id} className="pt-2 text-xs space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-extrabold text-teal-800">{h.score}/6 Pontos</span>
                      <span className="text-[10px] text-zinc-500">{h.assessmentDate}</span>
                    </div>
                    <p className="font-bold text-zinc-800">{h.classification}</p>
                    <p className="text-[10px] text-zinc-400">Avaliador: {h.assessedBy}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: ESCALA LAWTON */}
      {activeTab === 'LAWTON' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white p-6 border border-zinc-200/90 rounded-2xl shadow-xs space-y-4">
            <h2 className="text-xs font-black text-zinc-800 uppercase tracking-wider flex items-center gap-2">
              <Award className="w-4 h-4 text-indigo-600" />
              Avaliação de Atividades Instrumentais (Escala de Lawton)
            </h2>

            <form onSubmit={handleSaveLawtonAssessment} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-zinc-700 mb-1">Selecionar Residente</label>
                <select
                  value={selectedResidentId}
                  onChange={(e) => setSelectedResidentId(e.target.value)}
                  className="w-full px-3 py-2 border border-zinc-200 rounded-xl font-bold text-zinc-800 focus:ring-2 focus:ring-indigo-500"
                >
                  {residents.map(r => (
                    <option key={r.id} value={r.id}>{r.name} — Quarto {r.room}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="p-3 bg-zinc-50 border border-zinc-200 rounded-xl space-y-1">
                  <label className="block font-black text-zinc-800">1. Usar Telefone</label>
                  <select value={lawtonTelefone} onChange={(e) => setLawtonTelefone(Number(e.target.value))} className="w-full p-2 border border-zinc-200 rounded-lg">
                    <option value={3}>3 - Opera telefone sem assistência</option>
                    <option value={2}>2 - Discagem parcial com ajuda</option>
                    <option value={1}>1 - Não usa telefone</option>
                  </select>
                </div>

                <div className="p-3 bg-zinc-50 border border-zinc-200 rounded-xl space-y-1">
                  <label className="block font-black text-zinc-800">2. Fazer Compras</label>
                  <select value={lawtonCompras} onChange={(e) => setLawtonCompras(Number(e.target.value))} className="w-full p-2 border border-zinc-200 rounded-lg">
                    <option value={3}>3 - Faz todas compras de forma independente</option>
                    <option value={2}>2 - Compra pequenos itens com supervisão</option>
                    <option value={1}>1 - Incapaz de fazer compras</option>
                  </select>
                </div>

                <div className="p-3 bg-zinc-50 border border-zinc-200 rounded-xl space-y-1">
                  <label className="block font-black text-zinc-800">3. Preparar Refeições</label>
                  <select value={lawtonRefeicoes} onChange={(e) => setLawtonRefeicoes(Number(e.target.value))} className="w-full p-2 border border-zinc-200 rounded-lg">
                    <option value={3}>3 - Planeja e cozinha refeições adequadas</option>
                    <option value={2}>2 - Esquentará refeições servidas</option>
                    <option value={1}>1 - Precisa que as refeições sejam preparadas</option>
                  </select>
                </div>

                <div className="p-3 bg-zinc-50 border border-zinc-200 rounded-xl space-y-1">
                  <label className="block font-black text-zinc-800">4. Tarefas Domésticas</label>
                  <select value={lawtonDomesticas} onChange={(e) => setLawtonDomesticas(Number(e.target.value))} className="w-full p-2 border border-zinc-200 rounded-lg">
                    <option value={3}>3 - Mantém casa sozinha ou com ajuda ocasional</option>
                    <option value={2}>2 - Realiza tarefas leves</option>
                    <option value={1}>1 - Não participa de arrumações</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs rounded-xl shadow-xs transition-colors"
              >
                Salvar Avaliação Lawton (AIVD)
              </button>
            </form>
          </div>

          <div className="bg-white p-5 border border-zinc-200/90 rounded-2xl shadow-xs space-y-4">
            <h3 className="text-xs font-black text-zinc-800 uppercase tracking-wider">
              Histórico Lawton do Residente ({residentLawtonHistory.length})
            </h3>

            {residentLawtonHistory.length === 0 ? (
              <p className="text-xs text-zinc-400">Nenhum histórico registrado.</p>
            ) : (
              <div className="space-y-3 divide-y divide-zinc-100">
                {residentLawtonHistory.map(h => (
                  <div key={h.id} className="pt-2 text-xs space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-extrabold text-indigo-800">{h.score} Pontos</span>
                      <span className="text-[10px] text-zinc-500">{h.assessmentDate}</span>
                    </div>
                    <p className="font-bold text-zinc-800">{h.classification}</p>
                    <p className="text-[10px] text-zinc-400">Avaliador: {h.assessedBy}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
