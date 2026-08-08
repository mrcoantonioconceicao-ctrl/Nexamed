import React, { useState, useEffect } from 'react';
import { 
  X, 
  Sparkles, 
  Save, 
  Activity, 
  Stethoscope, 
  Clock, 
  Copy, 
  History, 
  CheckCircle2, 
  ChevronRight, 
  Pill, 
  RotateCcw,
  FileText,
  Zap,
  Info
} from 'lucide-react';
import { Resident, ClinicalRole, ClinicalEvolution } from '../types';

interface SOAPEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  residents: Resident[];
  initialResidentId?: string;
  onSaveEvolution: (evolution: ClinicalEvolution) => void;
  currentUserRole?: string;
  evolutions?: ClinicalEvolution[];
}

export const SOAPEditorModal: React.FC<SOAPEditorModalProps> = ({
  isOpen,
  onClose,
  residents,
  initialResidentId,
  onSaveEvolution,
  currentUserRole,
  evolutions = [],
}) => {
  const [selectedResidentId, setSelectedResidentId] = useState<string>(
    initialResidentId || residents[0]?.id || ''
  );
  const [role, setRole] = useState<ClinicalRole>(
    (currentUserRole as ClinicalRole) || 'Enfermeiro RT'
  );

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

  const [showHistoryPanel, setShowHistoryPanel] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Sync selectedResidentId when initialResidentId prop changes or modal opens
  useEffect(() => {
    if (initialResidentId) {
      setSelectedResidentId(initialResidentId);
    } else if (residents.length > 0 && !selectedResidentId) {
      setSelectedResidentId(residents[0].id);
    }
  }, [initialResidentId, residents, isOpen]);

  // Update vitals fields when active resident changes
  const activeResident = residents.find(r => r.id === selectedResidentId) || residents[0];

  useEffect(() => {
    if (activeResident && activeResident.vitals) {
      setBp(activeResident.vitals.bp || '120/80');
      setHr(activeResident.vitals.hr ? String(activeResident.vitals.hr) : '72');
      setTemp(activeResident.vitals.temp ? String(activeResident.vitals.temp) : '36.5');
      setSpo2(activeResident.vitals.spo2 ? String(activeResident.vitals.spo2) : '98');
    }
  }, [selectedResidentId]);

  if (!isOpen) return null;

  // Filter evolutions for active resident
  const residentEvolutions = evolutions.filter(e => e.residentId === activeResident?.id);
  const latestEvo = residentEvolutions.length > 0 ? residentEvolutions[0] : null;

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Helper to append snippet text neatly
  const appendText = (current: string, newText: string) => {
    if (!current.trim()) return newText;
    if (current.endsWith('.')) return `${current} ${newText}`;
    if (current.endsWith('\n')) return `${current}${newText}`;
    return `${current}. ${newText}`;
  };

  // Clone entire previous evolution
  const handleClonePreviousEvolution = () => {
    if (!latestEvo) {
      showToast('Nenhuma evolução anterior encontrada para este residente.');
      return;
    }
    setSubjective(latestEvo.soap.subjective || '');
    setObjective(latestEvo.soap.objective || '');
    setAssessment(latestEvo.soap.assessment || '');
    setPlan(latestEvo.soap.plan || '');

    if (latestEvo.vitals) {
      if (latestEvo.vitals.bp) setBp(latestEvo.vitals.bp);
      if (latestEvo.vitals.hr) setHr(String(latestEvo.vitals.hr));
      if (latestEvo.vitals.temp) setTemp(String(latestEvo.vitals.temp));
      if (latestEvo.vitals.spo2) setSpo2(String(latestEvo.vitals.spo2));
    }

    showToast(`Evolução de ${latestEvo.date} (${latestEvo.author}) clonada para edição!`);
  };

  // Pre-fill specific SOAP field from previous evolution
  const handleImportPreviousField = (field: 'subjective' | 'objective' | 'assessment' | 'plan') => {
    if (!latestEvo) return;
    const textToImport = latestEvo.soap[field];
    if (!textToImport) return;

    if (field === 'subjective') setSubjective(prev => appendText(prev, textToImport));
    if (field === 'objective') setObjective(prev => appendText(prev, textToImport));
    if (field === 'assessment') setAssessment(prev => appendText(prev, textToImport));
    if (field === 'plan') setPlan(prev => appendText(prev, textToImport));

    const labels = {
      subjective: 'Subjetivo',
      objective: 'Objetivo',
      assessment: 'Avaliação',
      plan: 'Plano'
    };
    showToast(`${labels[field]} anterior importado!`);
  };

  // Generate AI SOAP
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
          previousPlan: latestEvo?.soap.plan || '',
          diagnosis: activeResident?.primaryDiagnosis || '',
        }),
      });

      const data = await res.json();
      if (data.soap) {
        setSubjective(data.soap.subjective || '');
        setObjective(data.soap.objective || '');
        setAssessment(data.soap.assessment || '');
        setPlan(data.soap.plan || '');
        setShowAiBox(false);
        showToast('Rascunho SOAP sintetizado pela IA Nexa!');
      }
    } catch (err) {
      console.error('Error generating SOAP:', err);
      showToast('Falha ao conectar à IA Nexa. Preencha os campos manualmente.');
    } finally {
      setIsGeneratingAi(false);
    }
  };

  // Copy complete SOAP text to clipboard
  const handleCopyFullSoap = () => {
    const fullText = `EVOLUÇÃO CLÍNICA MULTIPROFISSIONAL (${role})
Residente: ${activeResident?.name} (${activeResident?.room})
Data/Hora: ${new Date().toLocaleDateString('pt-BR')} ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}

[S - SUBJETIVO]
${subjective || 'Sem relatos verbais no momento.'}

[O - OBJETIVO]
Sinais Vitais: PA: ${bp} | FC: ${hr}bpm | Temp: ${temp}°C | SpO2: ${spo2}%
${objective || 'Exame físico sem intercorrências agudas.'}

[A - AVALIAÇÃO]
${assessment || 'Quadro clínico/psiquiátrico estável.'}

[P - PLANO]
${plan || 'Manter rotina terapêutica e aprazamento MAR.'}`;

    navigator.clipboard.writeText(fullText);
    showToast('SOAP completo copiado para a área de transferência!');
  };

  // Clear form
  const handleClearForm = () => {
    setSubjective('');
    setObjective('');
    setAssessment('');
    setPlan('');
    showToast('Campos limpos com sucesso.');
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
      author: 'Profissional do Plantão',
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

  // Dynamic Suggestion Chips based on resident diagnosis, role and context
  const getSubjectiveSnippets = () => [
    'Calmo, receptivo, orientado no tempo e espaço',
    'Relata boa qualidade de sono e descanso noturno',
    'Nega dores, náuseas ou desconfortos físicos',
    'Relata ansiedade leve quanto à rotina',
    'Familiar presente, relata boa interação social',
    'Recusa parcial no café da manhã por falta de apetite'
  ];

  const getObjectiveSnippets = () => [
    'Consciente, eupnéico, acianótico, normotenso',
    'Marcha preservada, sem instabilidade aparente',
    'Doses MAR das 08:00h e 20:00h ministradas e checadas sem recusas',
    'Boa aceitação da dieta oral e hidratação oferecida',
    'Pele íntegra, turgor e elasticidade preservados',
    'Participou da oficina terapêutica com bom engajamento'
  ];

  const getAssessmentSnippets = () => [
    'Quadro psiquiátrico/clínico estável, sem sinais de descompensação',
    'Adaptação satisfatória à rotina da residência terapêutica',
    'Adesão adequada ao tratamento farmacológico contínuo',
    'Risco de queda moderado devido ao uso de medicação sedativa',
    'Evolução favorável quanto ao Projeto Terapêutico Singular (PTS)'
  ];

  const getPlanSnippets = () => [
    'Manter prescrição médica e aprazamento MAR 12/12h rigoroso',
    'Incentivar ingesta hídrica e participação em atividades sociais',
    'Monitorar sinais vitais e padrão de sono no próximo turno',
    'Manter protocolo de prevenção de quedas (grades elevadas)',
    'Reavaliar em caso de queixas ou alteração comportamental'
  ];

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="w-full max-w-4xl bg-white border border-zinc-200 rounded-3xl shadow-2xl overflow-hidden my-4 max-h-[94vh] flex flex-col">
        
        {/* Toast Feedback Notification Banner */}
        {toastMessage && (
          <div className="bg-teal-900 text-white px-4 py-2 text-xs font-bold flex items-center justify-between shrink-0 animate-in fade-in duration-200 border-b border-teal-800">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-teal-300" />
              <span>{toastMessage}</span>
            </div>
            <button onClick={() => setToastMessage(null)} className="text-teal-300 hover:text-white">✕</button>
          </div>
        )}

        {/* Modal Header */}
        <div className="p-4 bg-gradient-to-r from-teal-900 via-zinc-900 to-teal-950 text-white flex items-center justify-between shrink-0 border-b border-teal-800">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-teal-800/80 text-teal-200 border border-teal-700 rounded-2xl shadow-inner">
              <Stethoscope className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-black tracking-tight text-white flex items-center gap-2">
                <span>Evolução Clínica Multiprofissional (Método SOAP)</span>
                <span className="text-[10px] bg-teal-800 text-teal-200 font-extrabold px-2 py-0.5 rounded-full border border-teal-700">
                  Assistida por IA
                </span>
              </h2>
              <p className="text-xs text-teal-200 font-medium">
                Prontuário Eletrônico com Sugestões Inteligentes do Histórico Clínico
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopyFullSoap}
              className="p-2 text-teal-200 hover:text-white bg-white/10 hover:bg-white/20 rounded-xl transition-all flex items-center gap-1.5 text-xs font-bold"
              title="Copiar SOAP Completo"
            >
              <Copy className="w-4 h-4" />
              <span className="hidden sm:inline">Copiar SOAP</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 text-zinc-300 hover:text-white bg-white/10 hover:bg-white/20 rounded-xl transition-all"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Main Scrollable Content Area */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-5 overflow-y-auto space-y-4 text-xs flex-1">
          
          {/* Active Resident Context & Quick History Bar */}
          <div className="bg-gradient-to-br from-teal-50/90 via-zinc-50 to-teal-100/40 p-3.5 rounded-2xl border border-teal-200/90 shadow-2xs space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              {/* Resident Selection */}
              <div className="flex-1 space-y-1">
                <label className="block text-[11px] font-extrabold text-teal-950 uppercase tracking-wider">
                  1. Selecione o Residente *
                </label>
                <select
                  value={selectedResidentId}
                  onChange={(e) => setSelectedResidentId(e.target.value)}
                  className="w-full bg-white text-zinc-900 font-bold text-xs px-3 py-2 rounded-xl border border-teal-300 focus:outline-none focus:border-teal-600 shadow-2xs"
                >
                  {residents.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.name} — Quarto: {r.room} ({r.primaryDiagnosis})
                    </option>
                  ))}
                </select>
              </div>

              {/* Clinical Role Selection */}
              <div className="w-full sm:w-64 space-y-1">
                <label className="block text-[11px] font-extrabold text-teal-950 uppercase tracking-wider">
                  Especialidade / Função *
                </label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as ClinicalRole)}
                  className="w-full bg-white text-zinc-900 font-bold text-xs px-3 py-2 rounded-xl border border-teal-300 focus:outline-none focus:border-teal-600 shadow-2xs"
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

            {/* Resident Clinical Summary Card with Clone Button */}
            {activeResident && (
              <div className="p-3 bg-white/90 rounded-xl border border-teal-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <img
                    src={activeResident.photo}
                    alt={activeResident.name}
                    className="w-10 h-10 rounded-full object-cover border-2 border-teal-500 shrink-0"
                  />
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-black text-zinc-900 text-xs">{activeResident.name}</span>
                      <span className="text-[10px] font-bold bg-teal-100 text-teal-800 px-2 py-0.5 rounded-md border border-teal-200">
                        {activeResident.dependenceLevel}
                      </span>
                      <span className="text-[10px] font-bold bg-amber-100 text-amber-900 px-2 py-0.5 rounded-md border border-amber-200">
                        Risco: {activeResident.riskScore || 'Médio'}
                      </span>
                    </div>
                    <p className="text-[11px] text-zinc-600 mt-0.5 font-medium">
                      <strong>Diagnóstico:</strong> {activeResident.primaryDiagnosis} • <strong>Quarto:</strong> {activeResident.room}
                    </p>
                  </div>
                </div>

                {/* Clone History Trigger Button */}
                <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                  {latestEvo ? (
                    <button
                      type="button"
                      onClick={handleClonePreviousEvolution}
                      className="px-3 py-1.5 bg-teal-700 hover:bg-teal-800 text-white font-extrabold text-[11px] rounded-xl shadow-2xs transition-all flex items-center gap-1.5 active:scale-95"
                      title="Clonar o SOAP da última evolução cadastrada"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Clonar Última Evolução ({latestEvo.date})</span>
                    </button>
                  ) : (
                    <span className="text-[10px] text-zinc-500 font-semibold italic bg-zinc-100 px-2.5 py-1 rounded-lg">
                      Primeira evolução deste residente
                    </span>
                  )}

                  <button
                    type="button"
                    onClick={() => setShowHistoryPanel(!showHistoryPanel)}
                    className="px-2.5 py-1.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-800 font-bold text-[11px] rounded-xl border border-zinc-300 transition-colors flex items-center gap-1"
                  >
                    <History className="w-3.5 h-3.5 text-zinc-600" />
                    <span>{showHistoryPanel ? 'Ocultar Histórico' : `Ver Histórico (${residentEvolutions.length})`}</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Previous Evolutions Inspection Panel (Drawer) */}
          {showHistoryPanel && residentEvolutions.length > 0 && (
            <div className="p-3.5 bg-zinc-900 text-white rounded-2xl space-y-3 animate-in fade-in duration-200 border border-zinc-700">
              <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
                <div className="flex items-center gap-2">
                  <History className="w-4 h-4 text-teal-400" />
                  <h3 className="font-extrabold text-xs uppercase text-teal-300">
                    Histórico Clínico Anterior ({residentEvolutions.length} Registros)
                  </h3>
                </div>
                <span className="text-[10px] text-zinc-400">Clique para reaproveitar partes do texto</span>
              </div>

              <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
                {residentEvolutions.slice(0, 5).map((evo) => (
                  <div key={evo.id} className="p-3 bg-zinc-800/90 rounded-xl border border-zinc-700 text-xs space-y-1.5">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-bold text-teal-300">
                        📅 {evo.date} às {evo.time} — {evo.author} ({evo.role})
                      </span>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => {
                            setSubjective(evo.soap.subjective);
                            setObjective(evo.soap.objective);
                            setAssessment(evo.soap.assessment);
                            setPlan(evo.soap.plan);
                            showToast(`Evolução do dia ${evo.date} importada na íntegra!`);
                          }}
                          className="px-2 py-0.5 bg-teal-600 hover:bg-teal-500 text-white font-bold text-[10px] rounded transition-colors"
                        >
                          Usar Tudo
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-zinc-300 bg-zinc-900/60 p-2 rounded-lg">
                      <div>
                        <strong className="text-teal-400 block">S - Subjetivo:</strong>
                        <p className="line-clamp-2">{evo.soap.subjective}</p>
                      </div>
                      <div>
                        <strong className="text-teal-400 block">O - Objetivo:</strong>
                        <p className="line-clamp-2">{evo.soap.objective}</p>
                      </div>
                      <div>
                        <strong className="text-teal-400 block">A - Avaliação:</strong>
                        <p className="line-clamp-2">{evo.soap.assessment}</p>
                      </div>
                      <div>
                        <strong className="text-teal-400 block">P - Plano:</strong>
                        <p className="line-clamp-2">{evo.soap.plan}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Vitals Strip */}
          <div className="p-3 bg-zinc-50 border border-zinc-200 rounded-2xl">
            <div className="flex items-center justify-between pb-2 border-b border-zinc-200/80 mb-2">
              <p className="text-[11px] font-bold text-teal-900 uppercase tracking-wider flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-teal-700" /> Sinais Vitais Aferidos no Atendimento
              </p>

              <button
                type="button"
                onClick={() => {
                  if (activeResident?.vitals) {
                    setBp(activeResident.vitals.bp || '120/80');
                    setHr(activeResident.vitals.hr ? String(activeResident.vitals.hr) : '72');
                    setTemp(activeResident.vitals.temp ? String(activeResident.vitals.temp) : '36.5');
                    setSpo2(activeResident.vitals.spo2 ? String(activeResident.vitals.spo2) : '98');
                    showToast('Sinais vitais restaurados do cadastro do residente!');
                  }
                }}
                className="text-[10px] text-teal-700 hover:text-teal-900 font-bold underline"
              >
                Puxar Vitis do Residente
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div>
                <label className="text-[10px] text-zinc-600 font-semibold block mb-0.5">Pressão Arterial (PA)</label>
                <input
                  type="text"
                  value={bp}
                  onChange={(e) => setBp(e.target.value)}
                  placeholder="120/80"
                  className="w-full bg-white text-zinc-900 font-bold px-2.5 py-1.5 rounded-xl border border-zinc-200 text-xs focus:outline-none focus:border-teal-500 shadow-2xs"
                />
              </div>
              <div>
                <label className="text-[10px] text-zinc-600 font-semibold block mb-0.5">Freq. Cardíaca (bpm)</label>
                <input
                  type="number"
                  value={hr}
                  onChange={(e) => setHr(e.target.value)}
                  placeholder="72"
                  className="w-full bg-white text-zinc-900 font-bold px-2.5 py-1.5 rounded-xl border border-zinc-200 text-xs focus:outline-none focus:border-teal-500 shadow-2xs"
                />
              </div>
              <div>
                <label className="text-[10px] text-zinc-600 font-semibold block mb-0.5">Temperatura (°C)</label>
                <input
                  type="text"
                  value={temp}
                  onChange={(e) => setTemp(e.target.value)}
                  placeholder="36.5"
                  className="w-full bg-white text-zinc-900 font-bold px-2.5 py-1.5 rounded-xl border border-zinc-200 text-xs focus:outline-none focus:border-teal-500 shadow-2xs"
                />
              </div>
              <div>
                <label className="text-[10px] text-zinc-600 font-semibold block mb-0.5">SatO2 (%)</label>
                <input
                  type="number"
                  value={spo2}
                  onChange={(e) => setSpo2(e.target.value)}
                  placeholder="98"
                  className="w-full bg-white text-zinc-900 font-bold px-2.5 py-1.5 rounded-xl border border-zinc-200 text-xs focus:outline-none focus:border-teal-500 shadow-2xs"
                />
              </div>
            </div>
          </div>

          {/* AI SOAP Assistant Strip */}
          <div>
            <button
              type="button"
              onClick={() => setShowAiBox(!showAiBox)}
              className="w-full py-2.5 px-3.5 bg-gradient-to-r from-teal-50 via-emerald-50 to-teal-100 hover:from-teal-100 hover:to-emerald-100 text-teal-900 text-xs font-bold rounded-2xl border border-teal-300 transition-all flex items-center justify-between shadow-2xs"
            >
              <div className="flex items-center gap-2">
                <span className="p-1 bg-teal-600 text-white rounded-lg">
                  <Sparkles className="w-3.5 h-3.5" />
                </span>
                <span className="font-black">Sintetizar Rascunho SOAP com IA Nexa</span>
              </div>
              <span className="text-[10px] text-teal-800 bg-white px-2.5 py-1 rounded-xl border border-teal-300 font-extrabold shadow-2xs">
                {showAiBox ? 'Ocultar Assistente' : 'Abrir Assistente com IA'}
              </span>
            </button>

            {showAiBox && (
              <div className="mt-2.5 p-3.5 bg-teal-50/80 border border-teal-300 rounded-2xl space-y-2.5 animate-in fade-in duration-150">
                <label className="block text-[11px] font-extrabold text-teal-950">
                  Insira anotações brutas ou observações em linguagem natural:
                </label>
                <textarea
                  value={aiObservations}
                  onChange={(e) => setAiObservations(e.target.value)}
                  placeholder="Ex: Residente calmo, dormiu 8h, aceitou 100% da refeição, sem queixas de dor. Participou da caminhada no jardim."
                  rows={2}
                  className="w-full bg-white text-zinc-900 text-xs p-2.5 rounded-xl border border-teal-300 focus:outline-none focus:border-teal-600 shadow-2xs"
                />
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={handleGenerateAiSoap}
                    disabled={isGeneratingAi || !aiObservations.trim()}
                    className="py-2 px-4 bg-teal-700 hover:bg-teal-800 disabled:opacity-50 text-white font-extrabold text-xs rounded-xl transition-colors flex items-center gap-1.5 shadow-2xs"
                  >
                    <Sparkles className="w-3.5 h-3.5 stroke-[2.5]" />
                    <span>{isGeneratingAi ? 'Sintetizando SOAP...' : 'Preencher Campos SOAP'}</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Quick Protocol 12/12h Notification Banner */}
          <div className="flex items-center justify-between bg-amber-50 p-2.5 rounded-2xl border border-amber-200 text-xs">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-700 shrink-0" />
              <span className="font-extrabold text-amber-950">Protocolo MAR 12/12h (08h & 20h):</span>
              <span className="text-amber-900 hidden sm:inline font-medium">Anexar checagem de remédios</span>
            </div>
            <button
              type="button"
              onClick={() => {
                const checkObj = "Doses das 08:00h e 20:00h checadas no MAR sem intercorrências.";
                const checkPlan = "Manter aprazamento medicamentoso de 12 em 12 horas (08:00 e 20:00).";
                setObjective(prev => appendText(prev, checkObj));
                setPlan(prev => appendText(prev, checkPlan));
                showToast('Checagem 12/12h anexada!');
              }}
              className="py-1 px-3 bg-amber-600 hover:bg-amber-700 text-white font-extrabold text-[11px] rounded-xl shadow-2xs transition-colors shrink-0"
            >
              + Inserir Checagem 12/12h
            </button>
          </div>

          {/* QUADRANT 1: S - SUBJETIVO */}
          <div className="space-y-1.5 bg-zinc-50/60 p-3 rounded-2xl border border-zinc-200">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-black text-teal-800 flex items-center gap-1.5 uppercase tracking-wide">
                <span>S — Subjetivo (Queixas e relatos do residente/família) *</span>
              </label>

              {latestEvo?.soap.subjective && (
                <button
                  type="button"
                  onClick={() => handleImportPreviousField('subjective')}
                  className="text-[10px] text-teal-700 hover:text-teal-900 font-bold underline"
                  title="Copiar texto subjetivo da evolução anterior"
                >
                  Importar do Anterior
                </button>
              )}
            </div>

            <textarea
              required
              value={subjective}
              onChange={(e) => setSubjective(e.target.value)}
              placeholder="Relatos verbais, padrão de sono, apetite, queixas físicas/emocionais..."
              rows={2}
              className="w-full bg-white text-zinc-900 text-xs p-2.5 rounded-xl border border-zinc-200 focus:outline-none focus:border-teal-500 shadow-2xs"
            />

            {/* Smart Snippets Chips */}
            <div className="flex flex-wrap gap-1.5 pt-1">
              <span className="text-[10px] font-bold text-zinc-600 flex items-center gap-1 self-center">
                <Zap className="w-3 h-3 text-amber-500" /> Atalhos:
              </span>
              {getSubjectiveSnippets().map((chip, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setSubjective(prev => appendText(prev, chip))}
                  className="px-2 py-0.5 bg-white hover:bg-teal-50 text-zinc-700 hover:text-teal-900 text-[10px] font-semibold rounded-lg border border-zinc-200 hover:border-teal-300 transition-colors"
                >
                  + {chip}
                </button>
              ))}
            </div>
          </div>

          {/* QUADRANT 2: O - OBJETIVO */}
          <div className="space-y-1.5 bg-zinc-50/60 p-3 rounded-2xl border border-zinc-200">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-black text-teal-800 flex items-center gap-1.5 uppercase tracking-wide">
                <span>O — Objetivo (Exame físico, dados, comportamento observado) *</span>
              </label>

              {latestEvo?.soap.objective && (
                <button
                  type="button"
                  onClick={() => handleImportPreviousField('objective')}
                  className="text-[10px] text-teal-700 hover:text-teal-900 font-bold underline"
                >
                  Importar do Anterior
                </button>
              )}
            </div>

            <textarea
              required
              value={objective}
              onChange={(e) => setObjective(e.target.value)}
              placeholder="Exame físico, sinais vitais, marcha, orientação, ausculta, pele, checagem MAR..."
              rows={2}
              className="w-full bg-white text-zinc-900 text-xs p-2.5 rounded-xl border border-zinc-200 focus:outline-none focus:border-teal-500 shadow-2xs"
            />

            {/* Smart Snippets Chips */}
            <div className="flex flex-wrap gap-1.5 pt-1">
              <span className="text-[10px] font-bold text-zinc-600 flex items-center gap-1 self-center">
                <Zap className="w-3 h-3 text-amber-500" /> Atalhos:
              </span>
              {getObjectiveSnippets().map((chip, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setObjective(prev => appendText(prev, chip))}
                  className="px-2 py-0.5 bg-white hover:bg-teal-50 text-zinc-700 hover:text-teal-900 text-[10px] font-semibold rounded-lg border border-zinc-200 hover:border-teal-300 transition-colors"
                >
                  + {chip}
                </button>
              ))}
            </div>
          </div>

          {/* QUADRANT 3: A - AVALIAÇÃO */}
          <div className="space-y-1.5 bg-zinc-50/60 p-3 rounded-2xl border border-zinc-200">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-black text-teal-800 flex items-center gap-1.5 uppercase tracking-wide">
                <span>A — Avaliação (Análise clínica e estabilidade do quadro) *</span>
              </label>

              {latestEvo?.soap.assessment && (
                <button
                  type="button"
                  onClick={() => handleImportPreviousField('assessment')}
                  className="text-[10px] text-teal-700 hover:text-teal-900 font-bold underline"
                >
                  Importar do Anterior
                </button>
              )}
            </div>

            <textarea
              required
              value={assessment}
              onChange={(e) => setAssessment(e.target.value)}
              placeholder="Análise do estado do residente, estabilidade do diagnóstico, resposta às terapias..."
              rows={2}
              className="w-full bg-white text-zinc-900 text-xs p-2.5 rounded-xl border border-zinc-200 focus:outline-none focus:border-teal-500 shadow-2xs"
            />

            {/* Smart Snippets Chips */}
            <div className="flex flex-wrap gap-1.5 pt-1">
              <span className="text-[10px] font-bold text-zinc-600 flex items-center gap-1 self-center">
                <Zap className="w-3 h-3 text-amber-500" /> Atalhos:
              </span>
              {getAssessmentSnippets().map((chip, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setAssessment(prev => appendText(prev, chip))}
                  className="px-2 py-0.5 bg-white hover:bg-teal-50 text-zinc-700 hover:text-teal-900 text-[10px] font-semibold rounded-lg border border-zinc-200 hover:border-teal-300 transition-colors"
                >
                  + {chip}
                </button>
              ))}
            </div>
          </div>

          {/* QUADRANT 4: P - PLANO */}
          <div className="space-y-1.5 bg-zinc-50/60 p-3 rounded-2xl border border-zinc-200">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-black text-teal-800 flex items-center gap-1.5 uppercase tracking-wide">
                <span>P — Plano (Condutas, prescrições e plano terapêutico) *</span>
              </label>

              {latestEvo?.soap.plan && (
                <button
                  type="button"
                  onClick={() => handleImportPreviousField('plan')}
                  className="text-[10px] text-teal-700 hover:text-teal-900 font-bold underline"
                >
                  Importar do Anterior
                </button>
              )}
            </div>

            <textarea
              required
              value={plan}
              onChange={(e) => setPlan(e.target.value)}
              placeholder="Próximas ações, condutas farmacológicas, encaminhamentos, metas do PTS..."
              rows={2}
              className="w-full bg-white text-zinc-900 text-xs p-2.5 rounded-xl border border-zinc-200 focus:outline-none focus:border-teal-500 shadow-2xs"
            />

            {/* Smart Snippets Chips */}
            <div className="flex flex-wrap gap-1.5 pt-1">
              <span className="text-[10px] font-bold text-zinc-600 flex items-center gap-1 self-center">
                <Zap className="w-3 h-3 text-amber-500" /> Atalhos:
              </span>
              {getPlanSnippets().map((chip, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setPlan(prev => appendText(prev, chip))}
                  className="px-2 py-0.5 bg-white hover:bg-teal-50 text-zinc-700 hover:text-teal-900 text-[10px] font-semibold rounded-lg border border-zinc-200 hover:border-teal-300 transition-colors"
                >
                  + {chip}
                </button>
              ))}
            </div>
          </div>

          {/* Buttons Footer */}
          <div className="pt-3 border-t border-zinc-200 flex items-center justify-between shrink-0">
            <button
              type="button"
              onClick={handleClearForm}
              className="py-2 px-3 text-xs font-bold text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
            >
              Limpar Campos
            </button>

            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={onClose}
                className="py-2.5 px-4 text-xs font-bold text-zinc-600 hover:text-zinc-900 bg-zinc-100 hover:bg-zinc-200 rounded-xl transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="py-2.5 px-6 bg-teal-700 hover:bg-teal-800 text-white font-extrabold text-xs rounded-xl shadow-md transition-all flex items-center gap-1.5 active:scale-95"
              >
                <Save className="w-4 h-4 stroke-[2.5]" />
                <span>Salvar Evolução no Prontuário</span>
              </button>
            </div>
          </div>

        </form>
      </div>
    </div>
  );
};
