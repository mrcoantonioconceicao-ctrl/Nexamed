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
  Moon,
  ShieldCheck,
  PlusCircle,
  AlertCircle
} from 'lucide-react';
import { 
  Resident, 
  ClinicalRole, 
  ClinicalEvolution, 
  EvolutionType, 
  TurnoType 
} from '../types';
import { addOrUpdateEvolution } from '../utils/giterStore';

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

  const [evolutionType, setEvolutionType] = useState<EvolutionType>('Diária');
  const [turno, setTurno] = useState<TurnoType>('Manhã');
  const [auditReason, setAuditReason] = useState<string>('Registro de evolução assistencial rotineira');

  const [subjective, setSubjective] = useState('');
  const [objective, setObjective] = useState('');
  const [assessment, setAssessment] = useState('');
  const [plan, setPlan] = useState('');

  const [bp, setBp] = useState('120/80');
  const [hr, setHr] = useState<string>('72');
  const [temp, setTemp] = useState<string>('36.5');
  const [spo2, setSpo2] = useState<string>('98');

  // Evolução Noturna / Qualidade do Sono (0-10)
  const [sleepQualityScore, setSleepQualityScore] = useState<number>(8);
  const [sleepHours, setSleepHours] = useState<number>(7);
  const [sleepInterruptions, setSleepInterruptions] = useState<number>(1);
  const [nightBehavior, setNightBehavior] = useState<string>('Dormiu tranquilo na maior parte da noite.');
  const [nightInterventionsNeeded, setNightInterventionsNeeded] = useState<boolean>(false);

  const [aiObservations, setAiObservations] = useState('');
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);
  const [showAiBox, setShowAiBox] = useState(false);

  const [showHistoryPanel, setShowHistoryPanel] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Auto assign default Turno based on current hour
  useEffect(() => {
    const currentHour = new Date().getHours();
    if (currentHour >= 7 && currentHour < 13) setTurno('Manhã');
    else if (currentHour >= 13 && currentHour < 19) setTurno('Tarde');
    else setTurno('Noite');
  }, [isOpen]);

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
    setTimeout(() => setToastMessage(null), 3500);
  };

  const appendText = (current: string, newText: string) => {
    if (!current.trim()) return newText;
    if (current.endsWith('.')) return `${current} ${newText}`;
    if (current.endsWith('\n')) return `${current}${newText}`;
    return `${current}. ${newText}`;
  };

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

  const handleImportPreviousField = (field: 'subjective' | 'objective' | 'assessment' | 'plan') => {
    if (!latestEvo) return;
    const textToImport = latestEvo.soap[field];
    if (!textToImport) return;

    if (field === 'subjective') setSubjective(prev => appendText(prev, textToImport));
    if (field === 'objective') setObjective(prev => appendText(prev, textToImport));
    if (field === 'assessment') setAssessment(prev => appendText(prev, textToImport));
    if (field === 'plan') setPlan(prev => appendText(prev, textToImport));

    showToast(`Campo importado da evolução anterior!`);
  };

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

  const createEvolutionObject = (): ClinicalEvolution => {
    const isNight = evolutionType === 'Noturna' || turno === 'Noite';

    return {
      id: `evo-${Date.now()}`,
      residentId: activeResident.id,
      residentName: activeResident.name,
      room: activeResident.room,
      date: new Date().toLocaleDateString('pt-BR'),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      author: 'Profissional do Plantão (NexaMed)',
      role,
      evolutionType,
      turno,
      soap: {
        subjective: subjective || (isNight ? `Acompanhamento noturno. Qualidade do Sono: ${sleepQualityScore}/10. ${nightBehavior}` : 'Sem queixas no momento.'),
        objective: objective || `Sinais vitais: PA: ${bp}, FC: ${hr}bpm, Temp: ${temp}°C, SpO2: ${spo2}%.`,
        assessment: assessment || 'Quadro clínico/psiquiátrico estável.',
        plan: plan || 'Manter rotina assistencial e aprazamento MAR 12/12h.',
      },
      tags: [role, evolutionType, turno, 'GITER Parity'],
      status: 'Finalizado',
      vitals: {
        bp,
        hr: Number(hr) || undefined,
        temp: Number(temp) || undefined,
        spo2: Number(spo2) || undefined,
      },
      nightEvolution: isNight ? {
        sleepQualityScore,
        sleepHours,
        sleepInterruptions,
        nightBehavior,
        interventionsNeeded: nightInterventionsNeeded
      } : undefined,
      sourceSystem: 'NEXAMED'
    };
  };

  const handleSaveAndClose = (e: React.FormEvent) => {
    e.preventDefault();
    const evo = createEvolutionObject();
    addOrUpdateEvolution(evo, auditReason);
    onSaveEvolution(evo);
    onClose();
  };

  const handleSaveAndCreateAnother = (e: React.FormEvent) => {
    e.preventDefault();
    const evo = createEvolutionObject();
    addOrUpdateEvolution(evo, auditReason);
    onSaveEvolution(evo);

    // Find index of current resident and move to next resident if available
    const currentIndex = residents.findIndex(r => r.id === activeResident.id);
    const nextResident = residents[(currentIndex + 1) % residents.length];

    if (nextResident && nextResident.id !== activeResident.id) {
      setSelectedResidentId(nextResident.id);
      showToast(`✓ Evolução salva! Avançado para ${nextResident.name}`);
    } else {
      showToast(`✓ Evolução salva com sucesso no prontuário!`);
    }

    // Reset form fields
    setSubjective('');
    setObjective('');
    setAssessment('');
    setPlan('');
  };

  const getSubjectiveSnippets = () => [
    'Calmo, receptivo, orientado no tempo e espaço',
    'Relata boa qualidade de sono e descanso noturno',
    'Nega dores, náuseas ou desconfortos físicos',
    'Relata ansiedade leve quanto à rotina',
    'Familiar presente, relata boa interação social'
  ];

  const getObjectiveSnippets = () => [
    'Consciente, eupnéico, acianótico, normotenso',
    'Marcha preservada, sem instabilidade aparente',
    'Doses MAR das 08:00h e 20:00h ministradas e checadas sem recusas',
    'Boa aceitação da dieta oral e hidratação oferecida',
    'Pele íntegra, turgor e elasticidade preservados'
  ];

  const getAssessmentSnippets = () => [
    'Quadro psiquiátrico/clínico estável, sem sinais de descompensação',
    'Adaptação satisfatória à rotina da residência terapêutica',
    'Adesão adequada ao tratamento farmacológico contínuo',
    'Risco de queda moderado devido ao uso de medicação sedativa'
  ];

  const getPlanSnippets = () => [
    'Manter prescrição médica e aprazamento MAR 12/12h rigoroso',
    'Incentivar ingesta hídrica e participação em atividades sociais',
    'Monitorar sinais vitais e padrão de sono no próximo turno',
    'Manter protocolo de prevenção de quedas (grades elevadas)'
  ];

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="w-full max-w-4xl bg-white border border-zinc-200 rounded-3xl shadow-2xl overflow-hidden my-4 max-h-[94vh] flex flex-col">
        
        {/* Toast Feedback Banner */}
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
                <span>Evolução Assistencial GITER / NexaMed</span>
                <span className="text-[10px] bg-teal-800 text-teal-200 font-extrabold px-2 py-0.5 rounded-full border border-teal-700">
                  SOAP + Auditoria
                </span>
              </h2>
              <p className="text-xs text-teal-200 font-medium">
                Prontuário Multiprofissional Eletrônico com Registro de Turno e Trilha de Auditoria
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="p-2 text-zinc-300 hover:text-white bg-white/10 hover:bg-white/20 rounded-xl transition-all"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Main Scrollable Area */}
        <form className="p-4 sm:p-5 overflow-y-auto space-y-4 text-xs flex-1">
          
          {/* Top Selection Bar: Resident, Specialty, Evolution Type, Turno */}
          <div className="bg-gradient-to-br from-teal-50/90 via-zinc-50 to-teal-100/40 p-4 rounded-2xl border border-teal-200/90 shadow-2xs space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {/* Resident Selection */}
              <div className="space-y-1">
                <label className="block text-[11px] font-extrabold text-teal-950 uppercase tracking-wider">
                  1. Residente *
                </label>
                <select
                  value={selectedResidentId}
                  onChange={(e) => setSelectedResidentId(e.target.value)}
                  className="w-full bg-white text-zinc-900 font-bold text-xs px-3 py-2 rounded-xl border border-teal-300 focus:outline-none focus:border-teal-600 shadow-2xs"
                >
                  {residents.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.name} — {r.room}
                    </option>
                  ))}
                </select>
              </div>

              {/* Specialty Selection */}
              <div className="space-y-1">
                <label className="block text-[11px] font-extrabold text-teal-950 uppercase tracking-wider">
                  2. Especialidade *
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
                  <option value="Cuidador">Cuidador</option>
                  <option value="Assistente Social">Assistente Social</option>
                  <option value="Fisioterapeuta">Fisioterapeuta</option>
                  <option value="Nutricionista">Nutricionista</option>
                </select>
              </div>

              {/* Evolution Type */}
              <div className="space-y-1">
                <label className="block text-[11px] font-extrabold text-teal-950 uppercase tracking-wider">
                  3. Tipo de Evolução *
                </label>
                <select
                  value={evolutionType}
                  onChange={(e) => setEvolutionType(e.target.value as EvolutionType)}
                  className="w-full bg-white text-zinc-900 font-bold text-xs px-3 py-2 rounded-xl border border-teal-300 focus:outline-none focus:border-teal-600 shadow-2xs"
                >
                  <option value="Diária">Diária Rotineira</option>
                  <option value="Enfermagem">Enfermagem</option>
                  <option value="Médica">Médica</option>
                  <option value="Psicológica">Psicológica</option>
                  <option value="Multiprofissional">Multiprofissional</option>
                  <option value="Cuidador">Cuidador</option>
                  <option value="Plantão">Troca de Plantão</option>
                  <option value="Intercorrência">Intercorrência Aguda</option>
                  <option value="Noturna">Noturna (Qualidade do Sono)</option>
                </select>
              </div>

              {/* Turno */}
              <div className="space-y-1">
                <label className="block text-[11px] font-extrabold text-teal-950 uppercase tracking-wider">
                  4. Turno do Plantão *
                </label>
                <select
                  value={turno}
                  onChange={(e) => setTurno(e.target.value as TurnoType)}
                  className="w-full bg-white text-zinc-900 font-bold text-xs px-3 py-2 rounded-xl border border-teal-300 focus:outline-none focus:border-teal-600 shadow-2xs"
                >
                  <option value="Manhã">Manhã (07h - 13h)</option>
                  <option value="Tarde">Tarde (13h - 19h)</option>
                  <option value="Noite">Noturno (19h - 07h)</option>
                  <option value="Outros">Outros Horários</option>
                </select>
              </div>
            </div>

            {/* Resident Card Context Summary */}
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
                      <strong>Diag:</strong> {activeResident.primaryDiagnosis} • <strong>Quarto:</strong> {activeResident.room}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                  {latestEvo && (
                    <button
                      type="button"
                      onClick={handleClonePreviousEvolution}
                      className="px-3 py-1.5 bg-teal-700 hover:bg-teal-800 text-white font-extrabold text-[11px] rounded-xl shadow-2xs transition-all flex items-center gap-1.5"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Clonar Última ({latestEvo.date})</span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => setShowHistoryPanel(!showHistoryPanel)}
                    className="px-2.5 py-1.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-800 font-bold text-[11px] rounded-xl border border-zinc-300 transition-colors flex items-center gap-1"
                  >
                    <History className="w-3.5 h-3.5 text-zinc-600" />
                    <span>{showHistoryPanel ? 'Ocultar Histórico' : `Histórico (${residentEvolutions.length})`}</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* EVOLUÇÃO NOTURNA & QUALIDADE DO SONO (0 a 10) */}
          {(evolutionType === 'Noturna' || turno === 'Noite') && (
            <div className="p-4 bg-indigo-950 text-white rounded-2xl space-y-3 border border-indigo-800 shadow-md animate-in fade-in duration-200">
              <div className="flex items-center justify-between pb-2 border-b border-indigo-800">
                <div className="flex items-center gap-2">
                  <Moon className="w-5 h-5 text-indigo-300" />
                  <h3 className="font-extrabold text-xs uppercase tracking-wide text-indigo-200">
                    Evolução Noturna — Avaliação de Qualidade do Sono & Comportamento
                  </h3>
                </div>
                <span className="text-[10px] text-indigo-300 font-semibold bg-indigo-900 px-2.5 py-0.5 rounded-full border border-indigo-700">
                  Escala GITER 0-10
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Score 0 to 10 Picker */}
                <div className="sm:col-span-2 space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-indigo-200">Qualidade do Sono (0 a 10):</span>
                    <span className="font-black text-amber-300 text-sm bg-indigo-900 px-3 py-0.5 rounded-lg border border-indigo-700">
                      {sleepQualityScore} / 10 — {
                        sleepQualityScore >= 8 ? 'Excelente / Repousante' :
                        sleepQualityScore >= 5 ? 'Satisfatório / Moderado' :
                        'Ruim / Insônia ou Agitação'
                      }
                    </span>
                  </div>

                  <div className="grid grid-cols-11 gap-1">
                    {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((score) => (
                      <button
                        key={score}
                        type="button"
                        onClick={() => setSleepQualityScore(score)}
                        className={`py-1.5 rounded-lg text-xs font-black transition-all ${
                          sleepQualityScore === score
                            ? 'bg-amber-400 text-indigo-950 scale-105 shadow-md'
                            : 'bg-indigo-900/80 hover:bg-indigo-800 text-indigo-200 border border-indigo-700'
                        }`}
                      >
                        {score}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Sleep hours & interruptions */}
                <div className="space-y-2">
                  <div>
                    <label className="text-[11px] font-bold text-indigo-200 block mb-1">Horas de Sono:</label>
                    <input
                      type="number"
                      min={0}
                      max={12}
                      value={sleepHours}
                      onChange={(e) => setSleepHours(Number(e.target.value))}
                      className="w-full bg-indigo-900/90 text-white font-bold text-xs p-2 rounded-xl border border-indigo-700"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-indigo-200 block mb-1">Interrupções / Despertares:</label>
                    <input
                      type="number"
                      min={0}
                      value={sleepInterruptions}
                      onChange={(e) => setSleepInterruptions(Number(e.target.value))}
                      className="w-full bg-indigo-900/90 text-white font-bold text-xs p-2 rounded-xl border border-indigo-700"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-indigo-200 block mb-1">Observações do Comportamento Noturno:</label>
                <textarea
                  value={nightBehavior}
                  onChange={(e) => setNightBehavior(e.target.value)}
                  rows={2}
                  className="w-full bg-indigo-900/90 text-white text-xs p-2.5 rounded-xl border border-indigo-700 focus:outline-none"
                  placeholder="Ex: Dormiu calmo, sem episódios de deambulação ou pânico."
                />
              </div>
            </div>
          )}

          {/* Vitals Strip */}
          <div className="p-3 bg-zinc-50 border border-zinc-200 rounded-2xl">
            <div className="flex items-center justify-between pb-2 border-b border-zinc-200/80 mb-2">
              <p className="text-[11px] font-bold text-teal-900 uppercase tracking-wider flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-teal-700" /> Sinais Vitais Aferidos
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div>
                <label className="text-[10px] text-zinc-600 font-semibold block mb-0.5">Pressão Arterial (PA)</label>
                <input
                  type="text"
                  value={bp}
                  onChange={(e) => setBp(e.target.value)}
                  className="w-full bg-white text-zinc-900 font-bold px-2.5 py-1.5 rounded-xl border border-zinc-200 text-xs focus:outline-none"
                />
              </div>
              <div>
                <label className="text-[10px] text-zinc-600 font-semibold block mb-0.5">Freq. Cardíaca (bpm)</label>
                <input
                  type="number"
                  value={hr}
                  onChange={(e) => setHr(e.target.value)}
                  className="w-full bg-white text-zinc-900 font-bold px-2.5 py-1.5 rounded-xl border border-zinc-200 text-xs focus:outline-none"
                />
              </div>
              <div>
                <label className="text-[10px] text-zinc-600 font-semibold block mb-0.5">Temperatura (°C)</label>
                <input
                  type="text"
                  value={temp}
                  onChange={(e) => setTemp(e.target.value)}
                  className="w-full bg-white text-zinc-900 font-bold px-2.5 py-1.5 rounded-xl border border-zinc-200 text-xs focus:outline-none"
                />
              </div>
              <div>
                <label className="text-[10px] text-zinc-600 font-semibold block mb-0.5">SatO2 (%)</label>
                <input
                  type="number"
                  value={spo2}
                  onChange={(e) => setSpo2(e.target.value)}
                  className="w-full bg-white text-zinc-900 font-bold px-2.5 py-1.5 rounded-xl border border-zinc-200 text-xs focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* QUADRANT 1: S - SUBJETIVO */}
          <div className="space-y-1.5 bg-zinc-50/60 p-3 rounded-2xl border border-zinc-200">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-black text-teal-800 flex items-center gap-1.5 uppercase tracking-wide">
                <span>S — Subjetivo (Queixas e relatos do residente/família)</span>
              </label>
            </div>

            <textarea
              value={subjective}
              onChange={(e) => setSubjective(e.target.value)}
              placeholder="Relatos verbais, humor, queixas, relatos familiares..."
              rows={2}
              className="w-full bg-white text-zinc-900 text-xs p-2.5 rounded-xl border border-zinc-200 focus:outline-none focus:border-teal-500 shadow-2xs"
            />
          </div>

          {/* QUADRANT 2: O - OBJETIVO */}
          <div className="space-y-1.5 bg-zinc-50/60 p-3 rounded-2xl border border-zinc-200">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-black text-teal-800 flex items-center gap-1.5 uppercase tracking-wide">
                <span>O — Objetivo (Exame físico, dados mensuráveis, comportamento)</span>
              </label>
            </div>

            <textarea
              value={objective}
              onChange={(e) => setObjective(e.target.value)}
              placeholder="Exame físico, marcha, higiene, aceitação de dieta, checagem MAR..."
              rows={2}
              className="w-full bg-white text-zinc-900 text-xs p-2.5 rounded-xl border border-zinc-200 focus:outline-none focus:border-teal-500 shadow-2xs"
            />
          </div>

          {/* QUADRANT 3: A - AVALIAÇÃO */}
          <div className="space-y-1.5 bg-zinc-50/60 p-3 rounded-2xl border border-zinc-200">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-black text-teal-800 flex items-center gap-1.5 uppercase tracking-wide">
                <span>A — Avaliação (Análise clínica e estabilidade do quadro)</span>
              </label>
            </div>

            <textarea
              value={assessment}
              onChange={(e) => setAssessment(e.target.value)}
              placeholder="Análise do quadro clínico/psiquiátrico, progresso do PTS..."
              rows={2}
              className="w-full bg-white text-zinc-900 text-xs p-2.5 rounded-xl border border-zinc-200 focus:outline-none focus:border-teal-500 shadow-2xs"
            />
          </div>

          {/* QUADRANT 4: P - PLANO */}
          <div className="space-y-1.5 bg-zinc-50/60 p-3 rounded-2xl border border-zinc-200">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-black text-teal-800 flex items-center gap-1.5 uppercase tracking-wide">
                <span>P — Plano (Condutas, prescrições e orientações)</span>
              </label>
            </div>

            <textarea
              value={plan}
              onChange={(e) => setPlan(e.target.value)}
              placeholder="Próximas ações, condutas, encaminhamentos, aprazamento MAR..."
              rows={2}
              className="w-full bg-white text-zinc-900 text-xs p-2.5 rounded-xl border border-zinc-200 focus:outline-none focus:border-teal-500 shadow-2xs"
            />
          </div>

          {/* Audit Trail Justification */}
          <div className="p-3 bg-zinc-100 rounded-2xl border border-zinc-200 space-y-1">
            <label className="text-[11px] font-bold text-zinc-700 block">
              Justificativa / Motivo da Operação (Trilha de Auditoria LGPD):
            </label>
            <input
              type="text"
              value={auditReason}
              onChange={(e) => setAuditReason(e.target.value)}
              className="w-full bg-white text-zinc-900 text-xs px-3 py-1.5 rounded-xl border border-zinc-300"
            />
          </div>

          {/* Form Action Buttons */}
          <div className="pt-3 border-t border-zinc-200 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="w-full sm:w-auto py-2.5 px-4 text-xs font-bold text-zinc-600 hover:text-zinc-900 bg-zinc-100 hover:bg-zinc-200 rounded-xl transition-colors"
            >
              Cancelar
            </button>

            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              <button
                type="button"
                onClick={handleSaveAndCreateAnother}
                className="py-2.5 px-4 bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold text-xs rounded-xl shadow-md transition-all flex items-center gap-1.5 active:scale-95"
              >
                <PlusCircle className="w-4 h-4 stroke-[2.5]" />
                <span>Salvar e Criar Outra</span>
              </button>

              <button
                type="button"
                onClick={handleSaveAndClose}
                className="py-2.5 px-6 bg-teal-700 hover:bg-teal-800 text-white font-extrabold text-xs rounded-xl shadow-md transition-all flex items-center gap-1.5 active:scale-95"
              >
                <Save className="w-4 h-4 stroke-[2.5]" />
                <span>Salvar e Fechar</span>
              </button>
            </div>
          </div>

        </form>
      </div>
    </div>
  );
};
