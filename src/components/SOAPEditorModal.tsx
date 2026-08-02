import React, { useState } from 'react';
import { X, Sparkles, Save, Heart, Activity, Thermometer, Stethoscope, Clock } from 'lucide-react';
import { Resident, ClinicalRole, ClinicalEvolution } from '../types';

interface SOAPEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  residents: Resident[];
  initialResidentId?: string;
  onSaveEvolution: (evolution: ClinicalEvolution) => void;
  currentUserRole?: string;
}

export const SOAPEditorModal: React.FC<SOAPEditorModalProps> = ({
  isOpen,
  onClose,
  residents,
  initialResidentId,
  onSaveEvolution,
}) => {
  const [selectedResidentId, setSelectedResidentId] = useState<string>(
    initialResidentId || residents[0]?.id || ''
  );
  const [role, setRole] = useState<ClinicalRole>('Enfermeiro RT');
  const [subjective, setSubjective] = useState('');
  const [objective, setObjective] = useState('');
  const [assessment, setAssessment] = useState('');
  const [plan, setPlan] = useState('');
  const [bp, setBp] = useState('120/80');
  const [hr, setHr] = useState<string>('72');
  const [temp, setTemp] = useState<string>('36.5');
  const [spo2, setSpo2] = useState<string>('98');

  const [aiObservations, setAiObservations] = useState('');
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);
  const [showAiBox, setShowAiBox] = useState(false);

  if (!isOpen) return null;

  const activeResident = residents.find(r => r.id === selectedResidentId) || residents[0];

  const handleGenerateAiSoap = async () => {
    if (!aiObservations.trim()) return;
    setIsGeneratingAi(true);

    try {
      const res = await fetch('/api/nexa/soap', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          residentName: activeResident?.name,
          bulletPoints: aiObservations,
          role,
        }),
      });

      const data = await res.json();
      if (data.soap) {
        setSubjective(data.soap.subjective || '');
        setObjective(data.soap.objective || '');
        setAssessment(data.soap.assessment || '');
        setPlan(data.soap.plan || '');
        setShowAiBox(false);
      }
    } catch (err) {
      console.error('Error generating SOAP:', err);
    } finally {
      setIsGeneratingAi(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const newEvolution: ClinicalEvolution = {
      id: `evo-${Date.now()}`,
      residentId: activeResident.id,
      residentName: activeResident.name,
      room: activeResident.room,
      date: new Date().toLocaleDateString('pt-BR'),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      author: 'Dr. Fernando Alencar',
      role,
      soap: {
        subjective,
        objective,
        assessment,
        plan,
      },
      tags: [role, 'SOAP', 'Evolução Diária'],
      status: 'Finalizado',
      vitals: {
        bp,
        hr: Number(hr) || undefined,
        temp: Number(temp) || undefined,
        spo2: Number(spo2) || undefined,
      },
    };

    onSaveEvolution(newEvolution);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="w-full max-w-3xl bg-white border border-zinc-200 rounded-2xl shadow-2xl overflow-hidden my-6">
        {/* Modal Header */}
        <div className="p-4 bg-zinc-50 border-b border-zinc-200 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-teal-50 text-teal-700 border border-teal-200 rounded-xl">
              <Stethoscope className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-zinc-900">Nova Evolução Clínica (Método SOAP)</h2>
              <p className="text-[11px] text-zinc-500 font-medium">Prontuário Eletrônico de Atendimento Multiprofissional</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-zinc-400 hover:text-zinc-700 rounded-lg hover:bg-zinc-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-5">
          {/* Top Selection Fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-zinc-700 mb-1">Residente *</label>
              <select
                value={selectedResidentId}
                onChange={(e) => setSelectedResidentId(e.target.value)}
                className="w-full bg-zinc-50 text-zinc-900 text-xs px-3 py-2 rounded-xl border border-zinc-200 focus:outline-none focus:border-teal-500"
              >
                {residents.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name} ({r.room})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-700 mb-1">Especialidade / Papel *</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as ClinicalRole)}
                className="w-full bg-zinc-50 text-zinc-900 text-xs px-3 py-2 rounded-xl border border-zinc-200 focus:outline-none focus:border-teal-500"
              >
                <option value="Enfermeiro RT">Enfermeiro RT</option>
                <option value="Psiquiatra">Psiquiatra</option>
                <option value="Psicólogo">Psicólogo</option>
                <option value="Terapeuta Ocupacional">Terapeuta Ocupacional</option>
                <option value="Técnico de Enfermagem">Técnico de Enfermagem</option>
                <option value="Assistente Social">Assistente Social</option>
              </select>
            </div>
          </div>

          {/* Vitals Input Strip */}
          <div className="p-3 bg-zinc-50/80 border border-zinc-200 rounded-xl">
            <p className="text-[11px] font-bold text-teal-800 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-teal-600" /> Sinais Vitais do Atendimento (Opcional)
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div>
                <label className="text-[10px] text-zinc-500 font-semibold block mb-0.5">Pressão Arterial</label>
                <input
                  type="text"
                  value={bp}
                  onChange={(e) => setBp(e.target.value)}
                  placeholder="120/80"
                  className="w-full bg-white text-zinc-900 px-2.5 py-1.5 rounded-lg border border-zinc-200 text-xs focus:outline-none focus:border-teal-500"
                />
              </div>
              <div>
                <label className="text-[10px] text-zinc-500 font-semibold block mb-0.5">Freq. Cardíaca (bpm)</label>
                <input
                  type="number"
                  value={hr}
                  onChange={(e) => setHr(e.target.value)}
                  placeholder="72"
                  className="w-full bg-white text-zinc-900 px-2.5 py-1.5 rounded-lg border border-zinc-200 text-xs focus:outline-none focus:border-teal-500"
                />
              </div>
              <div>
                <label className="text-[10px] text-zinc-500 font-semibold block mb-0.5">Temperatura (°C)</label>
                <input
                  type="text"
                  value={temp}
                  onChange={(e) => setTemp(e.target.value)}
                  placeholder="36.5"
                  className="w-full bg-white text-zinc-900 px-2.5 py-1.5 rounded-lg border border-zinc-200 text-xs focus:outline-none focus:border-teal-500"
                />
              </div>
              <div>
                <label className="text-[10px] text-zinc-500 font-semibold block mb-0.5">SatO2 (%)</label>
                <input
                  type="number"
                  value={spo2}
                  onChange={(e) => setSpo2(e.target.value)}
                  placeholder="98"
                  className="w-full bg-white text-zinc-900 px-2.5 py-1.5 rounded-lg border border-zinc-200 text-xs focus:outline-none focus:border-teal-500"
                />
              </div>
            </div>
          </div>

          {/* AI SOAP Generation Assistant Button & Box */}
          <div>
            <button
              type="button"
              onClick={() => setShowAiBox(!showAiBox)}
              className="w-full py-2 px-3 bg-teal-50 hover:bg-teal-100/80 text-teal-800 text-xs font-bold rounded-xl border border-teal-200 transition-all flex items-center justify-between shadow-2xs"
            >
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-teal-600" />
                <span>Gerar Rascunho SOAP com IA Nexa</span>
              </div>
              <span className="text-[10px] text-teal-700 bg-white px-2 py-0.5 rounded border border-teal-200 font-bold">
                {showAiBox ? 'Ocultar' : 'Ativar IA'}
              </span>
            </button>

            {showAiBox && (
              <div className="mt-2.5 p-3.5 bg-teal-50/70 border border-teal-200 rounded-xl space-y-2.5 animate-in fade-in duration-150">
                <label className="block text-[11px] font-bold text-teal-900">
                  Insira pontos brutos observados no atendimento:
                </label>
                <textarea
                  value={aiObservations}
                  onChange={(e) => setAiObservations(e.target.value)}
                  placeholder="Ex: Residente calmo, dormiu 8h, nega dor. Aceitou refeição. Participou da caminhada no jardim. Mantida medicação."
                  rows={2}
                  className="w-full bg-white text-zinc-900 text-xs p-2.5 rounded-lg border border-teal-200 focus:outline-none focus:border-teal-500"
                />
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={handleGenerateAiSoap}
                    disabled={isGeneratingAi || !aiObservations.trim()}
                    className="py-1.5 px-3 bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white font-bold text-xs rounded-lg transition-colors flex items-center gap-1.5 shadow-2xs"
                  >
                    <Sparkles className="w-3.5 h-3.5 stroke-[2.5]" />
                    <span>{isGeneratingAi ? 'Sintetizando SOAP...' : 'Preencher Campos SOAP'}</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* SOAP Four Quadrants */}
          <div className="space-y-3">
            <div className="flex items-center justify-between bg-amber-50/80 p-2.5 rounded-xl border border-amber-200 text-xs">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-700 shrink-0" />
                <span className="font-bold text-amber-950">Protocolo 12/12h (08h & 20h):</span>
                <span className="text-amber-800 hidden sm:inline">Anexar verificação de medicação à evolução</span>
              </div>
              <button
                type="button"
                onClick={() => {
                  const checkObj = "• Aprazamento 12/12h: Doses das 08:00h e 20:00h checadas no MAR sem intercorrências.";
                  const checkPlan = "• Manter protocolo rigoroso de medicação de 12 em 12 horas (08:00 e 20:00).";
                  setObjective(prev => prev ? `${prev}\n${checkObj}` : checkObj);
                  setPlan(prev => prev ? `${prev}\n${checkPlan}` : checkPlan);
                }}
                className="py-1 px-3 bg-amber-600 hover:bg-amber-700 text-white font-extrabold text-[11px] rounded-lg shadow-2xs transition-colors shrink-0"
              >
                + Inserir Checagem 12/12h
              </button>
            </div>

            <div>
              <label className="block text-xs font-bold text-teal-700 mb-1">
                S - Subjetivo (Queixas, falas do residente/família) *
              </label>
              <textarea
                required
                value={subjective}
                onChange={(e) => setSubjective(e.target.value)}
                placeholder="Relatos verbais, padrão de sono, queixas, estado de ânimo..."
                rows={2}
                className="w-full bg-zinc-50 text-zinc-900 text-xs p-2.5 rounded-xl border border-zinc-200 focus:outline-none focus:border-teal-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-teal-700 mb-1">
                O - Objetivo (Exame físico, comportamento observado, dados) *
              </label>
              <textarea
                required
                value={objective}
                onChange={(e) => setObjective(e.target.value)}
                placeholder="Sinais vitais, marcha, orientação no tempo e espaço, lesões..."
                rows={2}
                className="w-full bg-zinc-50 text-zinc-900 text-xs p-2.5 rounded-xl border border-zinc-200 focus:outline-none focus:border-teal-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-teal-700 mb-1">
                A - Avaliação (Análise clínica e evolução diagnóstica) *
              </label>
              <textarea
                required
                value={assessment}
                onChange={(e) => setAssessment(e.target.value)}
                placeholder="Impressão diagnóstica, estabilidade do quadro, resposta terapêutica..."
                rows={2}
                className="w-full bg-zinc-50 text-zinc-900 text-xs p-2.5 rounded-xl border border-zinc-200 focus:outline-none focus:border-teal-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-teal-700 mb-1">
                P - Plano (Conduta, encaminhamentos, prescrições) *
              </label>
              <textarea
                required
                value={plan}
                onChange={(e) => setPlan(e.target.value)}
                placeholder="Próximas ações, condutas farmacológicas, exames, encaminhamentos..."
                rows={2}
                className="w-full bg-zinc-50 text-zinc-900 text-xs p-2.5 rounded-xl border border-zinc-200 focus:outline-none focus:border-teal-500"
              />
            </div>
          </div>

          {/* Buttons Footer */}
          <div className="pt-3 border-t border-zinc-100 flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="py-2 px-4 text-xs font-bold text-zinc-600 hover:text-zinc-900 bg-zinc-100 rounded-xl transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="py-2 px-5 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-xl transition-colors flex items-center gap-1.5 shadow-2xs"
            >
              <Save className="w-4 h-4 stroke-[2.5]" />
              <span>Salvar no Prontuário</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
