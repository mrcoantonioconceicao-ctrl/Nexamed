import React, { useState, useMemo, useEffect } from 'react';
import { 
  Activity, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  ShieldAlert, 
  FileText, 
  Sparkles, 
  Plus, 
  History, 
  Droplet, 
  TrendingUp, 
  TrendingDown, 
  Heart, 
  Info, 
  Flame, 
  Share2, 
  UserCheck, 
  ChevronRight, 
  RefreshCw, 
  Search, 
  Send,
  Zap,
  Network,
  Cpu,
  Check,
  PhoneCall,
  Calendar,
  Layers,
  Thermometer,
  ShieldCheck,
  CornerDownRight
} from 'lucide-react';
import { 
  DiabetesResidentProfile, 
  GlycemicRecord, 
  InsulinDoseRecord, 
  FootInspectionRecord, 
  MealTime, 
  InjectionSite,
  InsulinType
} from '../domain/diabetes/types';
import { 
  classifyGlycemicZone, 
  getGlycemicZoneDetails, 
  calculateTimeInRangeMetrics, 
  calculateSlidingScaleDose, 
  getNextInjectionSite, 
  SITES_ORDER 
} from '../domain/diabetes/rules';
import { 
  HYPOGLYCEMIA_RESCUE_PROCESS, 
  INSULIN_ROUTINE_PROCESS, 
  BpmnNode 
} from '../domain/diabetes/bpmn-workflow';
import { 
  queryGraphRagContext, 
  CLINICAL_KNOWLEDGE_GRAPH 
} from '../domain/diabetes/graph-rag';
import { 
  MCP_DIABETES_TOOLS, 
  MCP_DIABETES_RESOURCES, 
  MCP_DIABETES_PROMPTS 
} from '../domain/diabetes/mcp-protocol';
import { 
  getStoredDiabetesProfiles, 
  getStoredGlycemicRecords, 
  addGlycemicRecord, 
  getStoredInsulinRecords, 
  addInsulinRecord, 
  getStoredFootRecords, 
  addFootRecord 
} from '../utils/diabetesStore';
import { ClinicalEvolution, Resident } from '../types';
import { addOrUpdateEvolution } from '../utils/giterStore';

interface DiabetesCareViewProps {
  onNavigateToSoap?: (residentId: string) => void;
  onOpenResidentProfile?: (resident: Resident) => void;
  residents?: Resident[];
}

export const DiabetesCareView: React.FC<DiabetesCareViewProps> = ({
  onNavigateToSoap,
  residents = []
}) => {
  // Profiles and current selection
  const [profiles] = useState<DiabetesResidentProfile[]>(() => getStoredDiabetesProfiles());
  const [selectedResidentId, setSelectedResidentId] = useState<string>('res-1');

  // Active Profile
  const activeProfile = useMemo(() => {
    return profiles.find(p => p.residentId === selectedResidentId) || profiles[0];
  }, [profiles, selectedResidentId]);

  // Data states
  const [glycemicRecords, setGlycemicRecords] = useState<GlycemicRecord[]>(() => getStoredGlycemicRecords());
  const [insulinRecords, setInsulinRecords] = useState<InsulinDoseRecord[]>(() => getStoredInsulinRecords());
  const [footRecords, setFootRecords] = useState<FootInspectionRecord[]>(() => getStoredFootRecords());

  // Active Tab
  const [activeTab, setActiveTab] = useState<
    'monitoring' | 'bpmn_rescue' | 'insulin_rotation' | 'foot_care' | 'graph_rag' | 'nexa_ai' | 'architecture'
  >('monitoring');

  // Filter records for active resident
  const residentGlycemia = useMemo(() => {
    return glycemicRecords.filter(r => r.residentId === selectedResidentId);
  }, [glycemicRecords, selectedResidentId]);

  const residentInsulin = useMemo(() => {
    return insulinRecords.filter(r => r.residentId === selectedResidentId);
  }, [insulinRecords, selectedResidentId]);

  const residentFoot = useMemo(() => {
    return footRecords.filter(r => r.residentId === selectedResidentId);
  }, [footRecords, selectedResidentId]);

  // Calculated Metrics
  const tirMetrics = useMemo(() => {
    return calculateTimeInRangeMetrics(residentGlycemia);
  }, [residentGlycemia]);

  const latestReading = useMemo(() => {
    return residentGlycemia[0] || null;
  }, [residentGlycemia]);

  // New Glycemia Form State
  const [showAddHgtModal, setShowAddHgtModal] = useState(false);
  const [newHgtValue, setNewHgtValue] = useState<number>(120);
  const [newHgtMealTime, setNewHgtMealTime] = useState<MealTime>('Pré-Almoço');
  const [newHgtNotes, setNewHgtNotes] = useState<string>('');
  const [newHgtSymptoms, setNewHgtSymptoms] = useState<string[]>([]);
  const [isSubmittingHgt, setIsSubmittingHgt] = useState(false);

  // BPMN Rescue Protocol State ("Regra dos 15")
  const [activeRescueStep, setActiveRescueStep] = useState<number>(1);
  const [isRescueActive, setIsRescueActive] = useState<boolean>(false);
  const [rescueTimerSeconds, setRescueTimerSeconds] = useState<number>(15 * 60);
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(false);
  const [rescueInitialBg, setRescueInitialBg] = useState<number>(62);
  const [rescueCarbGiven, setRescueCarbGiven] = useState<string>('150ml de Suco de Laranja Adoçado (15g carboidrato)');
  const [rescueRecheckBg, setRescueRecheckBg] = useState<number>(95);

  // Sliding Scale Calculator State
  const [calcInputBg, setCalcInputBg] = useState<number>(210);
  const [lastSelectedSite, setLastSelectedSite] = useState<InjectionSite>('Abdomen Inferior Direito');
  const recommendedSite = useMemo(() => {
    const lastDose = residentInsulin[0]?.injectionSite;
    return getNextInjectionSite(lastDose || lastSelectedSite);
  }, [residentInsulin, lastSelectedSite]);

  // AI Consultation & Fine-Tuned Guidance
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiConsultationResult, setAiConsultationResult] = useState<any>(null);
  const [soapCreatedSuccess, setSoapCreatedSuccess] = useState(false);

  // GraphRAG Context for Active Resident
  const graphContext = useMemo(() => {
    return queryGraphRagContext(selectedResidentId);
  }, [selectedResidentId]);

  // Timer Effect for Regra dos 15
  useEffect(() => {
    let interval: any = null;
    if (isTimerRunning && rescueTimerSeconds > 0) {
      interval = setInterval(() => {
        setRescueTimerSeconds(prev => prev - 1);
      }, 1000);
    } else if (rescueTimerSeconds === 0 && isTimerRunning) {
      setIsTimerRunning(false);
      setActiveRescueStep(3); // Time to recheck!
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, rescueTimerSeconds]);

  const formatTimer = (totalSec: number) => {
    const min = Math.floor(totalSec / 60);
    const sec = totalSec % 60;
    return `${min.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
  };

  // Handler: Add new glycemic reading
  const handleSaveHgt = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newHgtValue || newHgtValue <= 0) return;

    setIsSubmittingHgt(true);
    const newRecord = addGlycemicRecord({
      residentId: activeProfile.residentId,
      residentName: activeProfile.name,
      timestamp: new Date().toLocaleDateString('pt-BR') + ' ' + new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      value: Number(newHgtValue),
      mealTime: newHgtMealTime,
      symptoms: newHgtSymptoms.length > 0 ? newHgtSymptoms : undefined,
      measuredBy: 'Téc. Carlos Lima',
      measuredByRole: 'Técnico de Enfermagem',
      notes: newHgtNotes || undefined,
      triggeredRescueProtocol: newHgtValue < 70
    });

    setGlycemicRecords(getStoredGlycemicRecords());
    setIsSubmittingHgt(false);
    setShowAddHgtModal(false);

    // If reading is low, prompt user to open the BPMN rescue tab
    if (newHgtValue < 70) {
      setRescueInitialBg(newHgtValue);
      setIsRescueActive(true);
      setActiveRescueStep(1);
      setActiveTab('bpmn_rescue');
    }
  };

  // Handler: Request Nexa AI Gemini Clinical Consultation (Fine-Tuned)
  const handleRunAiConsultation = async () => {
    setIsAiLoading(true);
    setAiConsultationResult(null);
    setSoapCreatedSuccess(false);

    try {
      const response = await fetch('/api/nexa/diabetes-consult', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          residentProfile: {
            residentId: activeProfile.residentId,
            residentName: activeProfile.name,
            age: activeProfile.age,
            room: activeProfile.room,
            diabetesType: activeProfile.diabetesType,
            treatmentType: activeProfile.insulinRegimen.basalInsulin,
            currentHbA1c: activeProfile.currentHbA1c,
            lastHbA1cDate: '15/07/2026',
            glycemicTarget: {
              fastingMin: activeProfile.targetRange.fastingMin,
              fastingMax: activeProfile.targetRange.fastingMax,
              postPrandialMax: activeProfile.targetRange.postPrandialMax,
              rationale: selectedResidentId === 'res-3' 
                ? 'Meta geriátrica flexibilizada para prevenir hipoglicemias graves (Demência de Alzheimer).' 
                : 'Meta individualizada com foco em mitigar ganho de peso por Quetiapina.'
            },
            prescriptions: activeProfile.oralMedications,
            psychotropicMetabolicInteractions: activeProfile.psychotropicInteractions
          },
          recentMeasurements: residentGlycemia.slice(0, 8),
          graphContext: graphContext.clinicalInsights,
          userQuestion: `Avalie o risco de hipoglicemia e a estabilidade glicêmica das últimas 48h para ${activeProfile.name}, considerando suas interações com psicofármacos no SRT.`,
          fineTunedConfig: {
            temperature: 0.15,
            topP: 0.85
          }
        })
      });

      const data = await response.json();
      if (data.consultation) {
        setAiConsultationResult(data.consultation);
      }
    } catch (err) {
      console.error('Falha ao consultar IA de Diabetes:', err);
    } finally {
      setIsAiLoading(false);
    }
  };

  // Handler: Export AI recommendations directly to clinical evolution (SOAP)
  const handleExportToSoap = () => {
    if (!aiConsultationResult) return;

    const now = new Date();
    const dateStr = now.toLocaleDateString('pt-BR');
    const timeStr = now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

    const newEvolution: ClinicalEvolution = {
      id: `evo-dm-${Date.now()}`,
      residentId: activeProfile.residentId,
      residentName: activeProfile.name,
      room: activeProfile.room,
      date: dateStr,
      time: timeStr,
      evolutionType: 'Enfermagem',
      turno: 'Manhã',
      author: 'Enf. Mariana Castro (RT)',
      role: 'Enfermeiro Responsável Técnico (RT)',
      status: 'Finalizado',
      tags: ['Diabetes Mellitus', 'HGT', 'Insulina', 'GraphRAG', 'Nexa IA'],
      vitals: {
        glucose: latestReading?.value || 124,
        temp: 36.4,
        hr: 74,
        bp: '120/80'
      },
      soap: {
        subjective: `Residente ${activeProfile.name} em acompanhamento glicêmico na Residência Terapêutica. Nega queixas álgicas no momento.`,
        objective: `HGT recente em ${latestReading?.value || 124} mg/dL (${latestReading?.mealTime || 'Jejum'}). Tempo no Alvo (TIR) avaliado em ${tirMetrics.inTargetPct}%. Ausência de lesões ativas em membros inferiores. Administrada insulina conforme prescrição MAR.`,
        assessment: `${aiConsultationResult.summary || 'Estabilidade glicêmica em monitoramento.'} Risco clínico categorizado como: ${aiConsultationResult.riskClassification || 'Estável'}.`,
        plan: `1. ${aiConsultationResult.recommendationsForShift?.[0] || 'Manter rotina de aferição de HGT.'}\n2. ${aiConsultationResult.recommendationsForShift?.[1] || 'Vigiar sinais de hipoglicemia e manter hidratação.'}\n3. Protocolo de rodízio de sítios anatômicos ativo para prevenção de lipodistrofia.`
      },
      auditTrail: [
        {
          id: `audit-${Date.now()}`,
          timestamp: `${dateStr} ${timeStr}`,
          authorName: 'Enf. Mariana Castro (RT)',
          authorRole: 'Enfermeiro RT',
          action: 'Criado via Módulo Especializado de Diabetes'
        }
      ]
    };

    addOrUpdateEvolution(newEvolution, 'Evolução clínica gerada via Módulo de Diabetes');
    setSoapCreatedSuccess(true);
    setTimeout(() => setSoapCreatedSuccess(false), 5000);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-3">
              <span className="p-2.5 bg-rose-100 dark:bg-rose-950 text-rose-600 dark:text-rose-400 rounded-xl">
                <Droplet className="w-6 h-6" />
              </span>
              <div>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  Gestão Especializada de Diabetes Mellitus
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 font-semibold border border-rose-200 dark:border-rose-900">
                    DDD • BPMN • GraphRAG • MCP
                  </span>
                </h1>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                  Protocolo clínico individualizado para as moradoras com diabetes na Residência Terapêutica (SRT).
                </p>
              </div>
            </div>
          </div>

          {/* Quick Resident Selector Cards */}
          <div className="flex items-center gap-3">
            {profiles.map(profile => {
              const isSelected = profile.residentId === selectedResidentId;
              const hasCriticalRisk = profile.residentId === 'res-3'; // Dona Tereza tem demência e risco de hipo assintomática

              return (
                <button
                  key={profile.residentId}
                  onClick={() => setSelectedResidentId(profile.residentId)}
                  className={`flex items-center gap-3 p-2.5 px-4 rounded-xl border text-left transition-all ${
                    isSelected 
                      ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-300 dark:border-rose-800 shadow-sm ring-2 ring-rose-500/20' 
                      : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <img 
                    src={profile.photo} 
                    alt={profile.name} 
                    className="w-10 h-10 rounded-full object-cover border border-slate-300 dark:border-slate-700" 
                  />
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                        {profile.name.split(' ')[0]} {profile.name.split(' ')[1]}
                      </span>
                      {hasCriticalRisk && (
                        <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" title="Atenção: Idosa frágil / Risco de Hipo Silenciosa" />
                      )}
                    </div>
                    <span className="text-xs text-slate-500 dark:text-slate-400">
                      {profile.room} • {profile.age} anos
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Resident Summary Banner */}
        <div className="mt-6 pt-5 border-t border-slate-100 dark:border-slate-800 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-100 dark:border-slate-800">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400 block">Diagnóstico & Esquema</span>
            <span className="text-sm font-semibold text-slate-900 dark:text-slate-100 line-clamp-1 mt-0.5">
              {activeProfile.diabetesType.split('(')[0]}
            </span>
            <span className="text-xs text-rose-600 dark:text-rose-400 block mt-0.5 font-medium">
              {activeProfile.insulinRegimen.basalInsulin.split('(')[0]}
            </span>
          </div>

          <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-100 dark:border-slate-800">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400 block">Último HGT Aferido</span>
            <div className="flex items-baseline gap-2 mt-0.5">
              <span className="text-xl font-bold text-slate-900 dark:text-slate-100">
                {latestReading ? `${latestReading.value} mg/dL` : '--'}
              </span>
              {latestReading && (
                <span className={`text-xs px-2 py-0.5 rounded-md font-semibold ${getGlycemicZoneDetails(latestReading.zone).badgeColor}`}>
                  {latestReading.zone === 'IN_TARGET' ? 'No Alvo' : latestReading.zone === 'LOW' ? 'Hipo' : 'Alto'}
                </span>
              )}
            </div>
            <span className="text-xs text-slate-500 dark:text-slate-400 block mt-0.5">
              {latestReading?.timestamp || 'Sem registros'} ({latestReading?.mealTime || '--'})
            </span>
          </div>

          <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-100 dark:border-slate-800">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400 block">Tempo no Alvo (TIR)</span>
            <div className="flex items-baseline gap-2 mt-0.5">
              <span className="text-xl font-bold text-emerald-600 dark:text-emerald-400">
                {tirMetrics.inTargetPct}%
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400">
                (Meta SBD: &gt; 70%)
              </span>
            </div>
            <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full mt-1.5 overflow-hidden flex">
              <div style={{ width: `${tirMetrics.lowPct}%` }} className="bg-amber-500 h-full" title="Hipoglicemia" />
              <div style={{ width: `${tirMetrics.inTargetPct}%` }} className="bg-emerald-500 h-full" title="No Alvo" />
              <div style={{ width: `${tirMetrics.highPct + tirMetrics.veryHighPct}%` }} className="bg-rose-500 h-full" title="Hiperglicemia" />
            </div>
          </div>

          <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-100 dark:border-slate-800">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400 block">Alvo de HbA1c (SBD 2024)</span>
            <div className="flex items-baseline gap-2 mt-0.5">
              <span className="text-xl font-bold text-slate-900 dark:text-slate-100">
                {activeProfile.currentHbA1c ? `${activeProfile.currentHbA1c}%` : '--'}
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400">
                Meta: &lt; {activeProfile.targetRange.hba1cTarget}%
              </span>
            </div>
            <span className="text-xs text-emerald-600 dark:text-emerald-400 block mt-0.5 font-medium">
              Controle seguro no SRT
            </span>
          </div>

          <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-100 dark:border-slate-800 flex flex-col justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400 block">Próximo Sítio de Aplicação</span>
            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-800 dark:text-slate-200 mt-1">
              <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
              {recommendedSite}
            </div>
            <span className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
              Rodízio anti-lipodistrofia
            </span>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 border-b border-slate-200 dark:border-slate-800">
        <button
          onClick={() => setActiveTab('monitoring')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all whitespace-nowrap ${
            activeTab === 'monitoring'
              ? 'bg-rose-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Activity className="w-4 h-4" />
          Mapa Glicêmico (HGT)
        </button>

        <button
          onClick={() => setActiveTab('bpmn_rescue')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all whitespace-nowrap ${
            activeTab === 'bpmn_rescue'
              ? 'bg-rose-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <ShieldAlert className="w-4 h-4" />
          Protocolo BPMN &amp; Regra dos 15
          {isRescueActive && (
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
          )}
        </button>

        <button
          onClick={() => setActiveTab('insulin_rotation')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all whitespace-nowrap ${
            activeTab === 'insulin_rotation'
              ? 'bg-rose-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Droplet className="w-4 h-4" />
          Insulina &amp; Rodízio Anatômico
        </button>

        <button
          onClick={() => setActiveTab('foot_care')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all whitespace-nowrap ${
            activeTab === 'foot_care'
              ? 'bg-rose-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Heart className="w-4 h-4" />
          Exame dos Pés Diabéticos
        </button>

        <button
          onClick={() => setActiveTab('graph_rag')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all whitespace-nowrap ${
            activeTab === 'graph_rag'
              ? 'bg-rose-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Network className="w-4 h-4" />
          GraphRAG &amp; Psicofármacos
        </button>

        <button
          onClick={() => setActiveTab('nexa_ai')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all whitespace-nowrap ${
            activeTab === 'nexa_ai'
              ? 'bg-rose-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          IA Nexa (Fine-Tuned)
        </button>

        <button
          onClick={() => setActiveTab('architecture')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all whitespace-nowrap ${
            activeTab === 'architecture'
              ? 'bg-rose-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Cpu className="w-4 h-4" />
          Arquitetura &amp; MCP
        </button>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: MONITORAMENTO GLICÊMICO (HGT)                                       */}
      {/* ========================================================================= */}
      {activeTab === 'monitoring' && (
        <div className="space-y-6">
          {/* Action Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                Histórico e Aferições de Glicemia Capilar (HGT)
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Registros com aprazamento clínico, momentos alimentares e validação de faixas SBD 2024.
              </p>
            </div>
            <button
              onClick={() => setShowAddHgtModal(true)}
              className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-sm font-semibold rounded-xl shadow-sm transition-all"
            >
              <Plus className="w-4 h-4" />
              Registrar Nova Glicemia
            </button>
          </div>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="p-4 bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/40 rounded-xl">
              <span className="text-xs text-emerald-700 dark:text-emerald-400 font-medium">No Alvo (70 - 180 mg/dL)</span>
              <p className="text-2xl font-bold text-emerald-800 dark:text-emerald-300 mt-1">{tirMetrics.inTargetPct}%</p>
              <span className="text-[11px] text-emerald-600 dark:text-emerald-400">Segurança metabólica comprovada</span>
            </div>

            <div className="p-4 bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 rounded-xl">
              <span className="text-xs text-amber-700 dark:text-amber-400 font-medium">Hipoglicemias (&lt; 70 mg/dL)</span>
              <p className="text-2xl font-bold text-amber-800 dark:text-amber-300 mt-1">{tirMetrics.lowPct + tirMetrics.veryLowPct}%</p>
              <span className="text-[11px] text-amber-600 dark:text-amber-400">Alvo SBD: Menos de 4%</span>
            </div>

            <div className="p-4 bg-rose-50/50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/40 rounded-xl">
              <span className="text-xs text-rose-700 dark:text-rose-400 font-medium">Hiperglicemias (&gt; 180 mg/dL)</span>
              <p className="text-2xl font-bold text-rose-800 dark:text-rose-300 mt-1">{tirMetrics.highPct + tirMetrics.veryHighPct}%</p>
              <span className="text-[11px] text-rose-600 dark:text-rose-400">Necessidade de correção com água/insulina</span>
            </div>

            <div className="p-4 bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 rounded-xl">
              <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Variabilidade Glicêmica</span>
              <p className="text-2xl font-bold text-slate-800 dark:text-slate-200 mt-1">{tirMetrics.glycemicVariability}%</p>
              <span className="text-[11px] text-slate-500 dark:text-slate-400">Meta: &lt; 36% (estabilidade)</span>
            </div>
          </div>

          {/* Readings Table */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400">
                    <th className="py-3 px-4 font-semibold">Data &amp; Horário</th>
                    <th className="py-3 px-4 font-semibold">Momento / Refeição</th>
                    <th className="py-3 px-4 font-semibold">Valor (mg/dL)</th>
                    <th className="py-3 px-4 font-semibold">Classificação SBD</th>
                    <th className="py-3 px-4 font-semibold">Sintomas / Conduta</th>
                    <th className="py-3 px-4 font-semibold">Responsável</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-sm">
                  {residentGlycemia.map(record => {
                    const zoneDetails = getGlycemicZoneDetails(record.zone);

                    return (
                      <tr key={record.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                        <td className="py-3 px-4 font-medium text-slate-900 dark:text-slate-100">
                          {record.timestamp}
                        </td>
                        <td className="py-3 px-4 text-slate-600 dark:text-slate-300">
                          <span className="px-2 py-0.5 rounded-md text-xs bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                            {record.mealTime}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-bold text-base text-slate-900 dark:text-slate-100">
                          {record.value} <span className="text-xs font-normal text-slate-400">mg/dL</span>
                        </td>
                        <td className="py-3 px-4">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${zoneDetails.badgeColor}`}>
                            {record.zone === 'VERY_LOW' && <AlertTriangle className="w-3.5 h-3.5 animate-bounce" />}
                            {zoneDetails.label.split('(')[0]}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-xs text-slate-600 dark:text-slate-300">
                          {record.triggeredRescueProtocol && (
                            <span className="inline-block mr-1.5 px-1.5 py-0.5 bg-rose-100 text-rose-800 rounded font-semibold">
                              Regra dos 15 Acionada
                            </span>
                          )}
                          {record.correctionInsulinGiven && (
                            <span className="inline-block mr-1.5 px-1.5 py-0.5 bg-amber-100 text-amber-800 rounded font-semibold">
                              +{record.correctionInsulinGiven} UI Regular
                            </span>
                          )}
                          {record.notes || (record.symptoms ? record.symptoms.join(', ') : 'Sem intercorrências')}
                        </td>
                        <td className="py-3 px-4 text-xs text-slate-500 dark:text-slate-400">
                          {record.measuredBy} ({record.measuredByRole})
                        </td>
                      </tr>
                    );
                  })}
                  {residentGlycemia.length === 0 && (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-slate-500 dark:text-slate-400 text-sm">
                        Nenhuma aferição registrada para esta moradora. Clique em "Registrar Nova Glicemia".
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: PROTOCOLO BPMN & REGRA DOS 15                                      */}
      {/* ========================================================================= */}
      {activeTab === 'bpmn_rescue' && (
        <div className="space-y-6">
          {/* Header */}
          <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/60 rounded-2xl p-5">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <span className="p-2.5 bg-amber-500 text-white rounded-xl shadow-sm">
                  <ShieldAlert className="w-6 h-6" />
                </span>
                <div>
                  <h3 className="text-lg font-bold text-amber-950 dark:text-amber-200">
                    BPMN 2.0: Protocolo de Resgate de Hipoglicemia ("Regra dos 15")
                  </h3>
                  <p className="text-xs text-amber-800 dark:text-amber-300 mt-0.5">
                    Processo clínico validado pela Sociedade Brasileira de Diabetes para reversão rápida e segura em residências terapêuticas.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {!isRescueActive ? (
                  <button
                    onClick={() => {
                      setIsRescueActive(true);
                      setActiveRescueStep(1);
                      setRescueTimerSeconds(15 * 60);
                      setIsTimerRunning(false);
                    }}
                    className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-sm font-semibold rounded-xl shadow-sm transition-all flex items-center gap-2"
                  >
                    <Flame className="w-4 h-4" />
                    Iniciar Resgate para {activeProfile.name.split(' ')[0]}
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      setIsRescueActive(false);
                      setIsTimerRunning(false);
                    }}
                    className="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-semibold rounded-lg transition-all"
                  >
                    Encerrar Protocolo Ativo
                  </button>
                )}
              </div>
            </div>

            {/* Active Rescue Wizard (If Triggered) */}
            {isRescueActive && (
              <div className="mt-6 pt-5 border-t border-amber-200 dark:border-amber-900/60">
                <div className="bg-white dark:bg-slate-900 border border-amber-300 dark:border-amber-800 rounded-xl p-5 shadow-sm">
                  <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3 mb-4">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 text-xs font-bold">
                        EM EXECUÇÃO
                      </span>
                      <span className="text-sm font-bold text-slate-900 dark:text-slate-100">
                        Resgate Ativo: Glicemia Inicial {rescueInitialBg} mg/dL
                      </span>
                    </div>

                    {/* Timer Badge */}
                    <div className="flex items-center gap-2 px-3 py-1 bg-amber-100 dark:bg-amber-950 text-amber-900 dark:text-amber-200 rounded-lg font-mono text-sm font-bold">
                      <Clock className="w-4 h-4 animate-spin" />
                      Cronômetro dos 15 min: {formatTimer(rescueTimerSeconds)}
                    </div>
                  </div>

                  {/* Step Progress */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-6">
                    <div className={`p-3 rounded-xl border text-xs ${activeRescueStep === 1 ? 'bg-amber-50 dark:bg-amber-950/60 border-amber-400 font-bold text-amber-900 dark:text-amber-200' : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700 text-slate-500'}`}>
                      1. Administrar 15g Carboidrato
                    </div>
                    <div className={`p-3 rounded-xl border text-xs ${activeRescueStep === 2 ? 'bg-amber-50 dark:bg-amber-950/60 border-amber-400 font-bold text-amber-900 dark:text-amber-200' : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700 text-slate-500'}`}>
                      2. Aguardar 15 Minutos (Timer)
                    </div>
                    <div className={`p-3 rounded-xl border text-xs ${activeRescueStep === 3 ? 'bg-amber-50 dark:bg-amber-950/60 border-amber-400 font-bold text-amber-900 dark:text-amber-200' : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700 text-slate-500'}`}>
                      3. Nova Aferição HGT
                    </div>
                    <div className={`p-3 rounded-xl border text-xs ${activeRescueStep === 4 ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-400 font-bold text-emerald-900 dark:text-emerald-200' : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700 text-slate-500'}`}>
                      4. Desfecho &amp; Estabilização
                    </div>
                  </div>

                  {/* Step Content */}
                  {activeRescueStep === 1 && (
                    <div className="space-y-4">
                      <div className="p-4 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/60 rounded-xl text-xs text-rose-900 dark:text-rose-200">
                        <strong>Alerta Clínico para SRT:</strong> A moradora está consciente? Se houver torpor ou convulsão, <strong>NÃO</strong> forneça líquidos via oral (risco de broncoaspiração)! Acione o SAMU 192 imediatamente.
                      </div>

                      <div className="space-y-2">
                        <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                          Selecione o carboidrato simples administrado (15g):
                        </label>
                        <select
                          value={rescueCarbGiven}
                          onChange={(e) => setRescueCarbGiven(e.target.value)}
                          className="w-full text-sm p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                        >
                          <option value="150ml de Suco de Laranja Adoçado (15g carboidrato)">150ml de Suco de Laranja / Uva adoçado (15g de carboidrato simples)</option>
                          <option value="1 colher de sopa de açúcar diluída em 100ml de água">1 colher de sopa rasa de açúcar refinado em 100ml de água</option>
                          <option value="3 balas mastigáveis de glicose">3 balas mastigáveis ou 3 sachês de mel</option>
                          <option value="Gel de Glicose Oral na Mucosa (para residente disfágica/Dra. Tereza)">Gel de Glicose Oral na Mucosa (residente com disfagia / sem deglutição de líquidos)</option>
                        </select>
                      </div>

                      <div className="flex justify-end gap-3 pt-3">
                        <button
                          onClick={() => {
                            setActiveRescueStep(2);
                            setIsTimerRunning(true);
                          }}
                          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl flex items-center gap-1.5"
                        >
                          <Check className="w-4 h-4" />
                          Confirmar Ingestão &amp; Iniciar Cronômetro de 15 Minutos
                        </button>
                      </div>
                    </div>
                  )}

                  {activeRescueStep === 2 && (
                    <div className="space-y-4 text-center py-4">
                      <p className="text-sm text-slate-700 dark:text-slate-300">
                        Carboidrato ofertado: <span className="font-semibold text-amber-700 dark:text-amber-300">{rescueCarbGiven}</span>.
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
                        Mantenha a moradora sentada em repouso. Evite chocolates ou lanches pesados agora, pois a gordura retarda a absorção da glicose.
                      </p>
                      <div className="text-4xl font-mono font-bold text-amber-600 dark:text-amber-400 py-2">
                        {formatTimer(rescueTimerSeconds)}
                      </div>
                      <div className="flex justify-center gap-2">
                        <button
                          onClick={() => setIsTimerRunning(!isTimerRunning)}
                          className="px-3 py-1.5 text-xs bg-slate-200 dark:bg-slate-700 rounded-lg"
                        >
                          {isTimerRunning ? 'Pausar Cronômetro' : 'Continuar'}
                        </button>
                        <button
                          onClick={() => {
                            setIsTimerRunning(false);
                            setActiveRescueStep(3);
                          }}
                          className="px-4 py-1.5 text-xs bg-amber-600 text-white rounded-lg font-semibold"
                        >
                          Avançar para Reavaliação Agora
                        </button>
                      </div>
                    </div>
                  )}

                  {activeRescueStep === 3 && (
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                          Valor da nova aferição de HGT após os 15 minutos (mg/dL):
                        </label>
                        <input
                          type="number"
                          value={rescueRecheckBg}
                          onChange={(e) => setRescueRecheckBg(Number(e.target.value))}
                          className="w-full text-lg font-bold p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                        />
                      </div>

                      <div className="flex justify-end gap-3 pt-3">
                        <button
                          onClick={() => {
                            // Save recheck record to store
                            addGlycemicRecord({
                              residentId: activeProfile.residentId,
                              residentName: activeProfile.name,
                              timestamp: 'Hoje, ' + new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
                              value: rescueRecheckBg,
                              mealTime: 'Intercorrência',
                              measuredBy: 'Téc. Carlos Lima',
                              measuredByRole: 'Técnico de Enfermagem',
                              notes: `Reavaliação pós-resgate da Regra dos 15. Inicial: ${rescueInitialBg} mg/dL -> Recheck: ${rescueRecheckBg} mg/dL.`
                            });
                            setGlycemicRecords(getStoredGlycemicRecords());
                            setActiveRescueStep(4);
                          }}
                          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl flex items-center gap-1.5"
                        >
                          <Check className="w-4 h-4" />
                          Registrar Reavaliação &amp; Concluir
                        </button>
                      </div>
                    </div>
                  )}

                  {activeRescueStep === 4 && (
                    <div className="space-y-4">
                      {rescueRecheckBg >= 70 ? (
                        <div className="p-4 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-300 dark:border-emerald-800 rounded-xl">
                          <h4 className="text-sm font-bold text-emerald-900 dark:text-emerald-200 flex items-center gap-1.5">
                            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                            Glicemia Normalizada com Sucesso ({rescueRecheckBg} mg/dL)!
                          </h4>
                          <p className="text-xs text-emerald-800 dark:text-emerald-300 mt-1">
                            A moradora saiu da faixa de risco. Conforme o protocolo SBD, forneça um lanche com carboidrato complexo (pão integral, biscoito ou fruta) se a próxima refeição regular demorar mais de 30 minutos.
                          </p>
                        </div>
                      ) : (
                        <div className="p-4 bg-rose-50 dark:bg-rose-950/30 border border-rose-300 dark:border-rose-800 rounded-xl">
                          <h4 className="text-sm font-bold text-rose-900 dark:text-rose-200 flex items-center gap-1.5">
                            <AlertTriangle className="w-5 h-5 text-rose-600" />
                            Glicemia Permanece Baixa ({rescueRecheckBg} mg/dL)
                          </h4>
                          <p className="text-xs text-rose-800 dark:text-rose-300 mt-1">
                            Repita o 2º ciclo de 15g de carboidrato. Comunique o Enfermeiro RT imediatamente. Se houver piora neurológica, acione o SAMU 192.
                          </p>
                        </div>
                      )}

                      <div className="flex justify-end gap-2 pt-2">
                        <button
                          onClick={() => {
                            setIsRescueActive(false);
                            setActiveRescueStep(1);
                          }}
                          className="px-4 py-2 bg-slate-800 text-white rounded-xl text-xs font-semibold"
                        >
                          Concluir e Fechar Assistente
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Interactive BPMN Workflow Map Visualizer */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <Layers className="w-5 h-5 text-rose-600" />
                  Diagrama Interativo do Processo BPMN
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Rastreabilidade e governança de processo para enfermagem e cuidadores no SRT.
                </p>
              </div>
              <span className="text-xs text-slate-400 font-mono">
                BPMN 2.0 XML / Execution Engine
              </span>
            </div>

            {/* Workflow Pipeline */}
            <div className="relative border-l-2 border-slate-200 dark:border-slate-800 ml-4 pl-6 space-y-6">
              {HYPOGLYCEMIA_RESCUE_PROCESS.nodes.map((node: BpmnNode, idx: number) => {
                const isCurrentActive = isRescueActive && (
                  (activeRescueStep === 1 && node.id === 'node-administer-15g') ||
                  (activeRescueStep === 2 && node.id === 'node-timer-15m') ||
                  (activeRescueStep === 3 && node.id === 'node-recheck-bg') ||
                  (activeRescueStep === 4 && node.id === 'node-soap-record')
                );

                return (
                  <div key={node.id} className="relative group">
                    {/* Node Dot Icon */}
                    <div className={`absolute -left-[35px] top-1 w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                      isCurrentActive 
                        ? 'bg-amber-500 border-amber-300 ring-4 ring-amber-500/20 text-white' 
                        : node.type === 'start_event' 
                          ? 'bg-emerald-500 border-white text-white' 
                          : node.type === 'error_event'
                            ? 'bg-rose-500 border-white text-white'
                            : 'bg-white dark:bg-slate-900 border-slate-400 text-slate-500'
                    }`}>
                      <span className="text-[9px] font-bold">{idx + 1}</span>
                    </div>

                    {/* Node Card */}
                    <div className={`p-3.5 rounded-xl border transition-all ${
                      isCurrentActive 
                        ? 'bg-amber-50/70 dark:bg-amber-950/40 border-amber-300 dark:border-amber-800 shadow-sm' 
                        : 'bg-slate-50/60 dark:bg-slate-800/30 border-slate-200 dark:border-slate-800 hover:border-slate-300'
                    }`}>
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-sm font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                          {node.name}
                          <span className="text-[10px] px-2 py-0.5 rounded uppercase font-mono tracking-wider bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                            {node.type.replace('_', ' ')}
                          </span>
                        </span>
                        <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                          {node.assignedRole}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                        {node.description}
                      </p>
                      {node.options && (
                        <div className="mt-2.5 pt-2 border-t border-slate-200 dark:border-slate-700/60 flex flex-wrap gap-2">
                          {node.options.map(opt => (
                            <span key={opt.targetNodeId} className="text-[11px] px-2 py-1 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300">
                              🔀 <strong>{opt.label}:</strong> {opt.condition}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: INSULINA & RODÍZIO ANATÔMICO                                        */}
      {/* ========================================================================= */}
      {activeTab === 'insulin_rotation' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Anatomical Site Rotation Visualizer (Left Column - 7 cols) */}
          <div className="lg:col-span-7 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <Droplet className="w-5 h-5 text-rose-600" />
                  Mapa de Rodízio de Aplicação de Insulina
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Prevenção de lipodistrofia e garantia da farmacocinética de absorção da insulina.
                </p>
              </div>
              <span className="px-2.5 py-1 bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-900 rounded-lg text-xs font-semibold">
                Sítio Recomendado: {recommendedSite}
              </span>
            </div>

            {/* Visual Body Grid */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              {SITES_ORDER.map((site) => {
                const isRecommended = site === recommendedSite;
                const isLastUsed = residentInsulin[0]?.injectionSite === site;

                return (
                  <div
                    key={site}
                    onClick={() => setLastSelectedSite(site)}
                    className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                      isRecommended 
                        ? 'bg-blue-50 dark:bg-blue-950/40 border-blue-400 dark:border-blue-700 shadow-sm ring-2 ring-blue-500/20' 
                        : isLastUsed 
                          ? 'bg-slate-100 dark:bg-slate-800 border-slate-400 text-slate-400' 
                          : 'bg-slate-50/80 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                        {site}
                      </span>
                      {isRecommended && (
                        <span className="px-1.5 py-0.5 bg-blue-600 text-white rounded text-[10px] font-bold">
                          PRÓXIMO
                        </span>
                      )}
                      {isLastUsed && (
                        <span className="px-1.5 py-0.5 bg-slate-300 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded text-[10px]">
                          ÚLTIMO
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400 block mt-1">
                      Distância mín. 2cm da cicatriz umbilical / última picada
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Registered Doses List */}
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
              <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider mb-3">
                Últimas Aplicações Registradas no MAR
              </h4>
              <div className="space-y-2">
                {residentInsulin.map(dose => (
                  <div key={dose.id} className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 text-xs flex items-center justify-between">
                    <div>
                      <span className="font-semibold text-slate-900 dark:text-slate-100">{dose.insulinName} ({dose.actualUnitsGiven} UI)</span>
                      <span className="text-slate-500 dark:text-slate-400 block mt-0.5">
                        Sítio: <strong>{dose.injectionSite}</strong> • {dose.timestamp}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="px-2 py-0.5 bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 rounded font-semibold text-[11px]">
                        {dose.status}
                      </span>
                      <span className="text-slate-400 block text-[10px] mt-0.5">
                        Por: {dose.administeredBy}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sliding Scale Calculator & Prescriptions (Right Column - 5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            {/* Sliding Scale Interactive Tool */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
              <div className="flex items-center gap-2">
                <span className="p-2 bg-rose-100 dark:bg-rose-950 text-rose-600 rounded-lg">
                  <Zap className="w-5 h-5" />
                </span>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                    Calculadora de Escala Móvel Médica
                  </h3>
                  <p className="text-xs text-slate-500">
                    Cálculo de dose corretiva de Insulina Regular.
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                  Glicemia Capilar Aferida (mg/dL):
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={calcInputBg}
                    onChange={(e) => setCalcInputBg(Number(e.target.value))}
                    className="flex-1 text-lg font-bold p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                  />
                  <span className="text-xs text-slate-400 font-medium">mg/dL</span>
                </div>
              </div>

              {/* Calculation Result */}
              {(() => {
                const correction = calculateSlidingScaleDose(calcInputBg, activeProfile.insulinRegimen.slidingScaleRules);

                return (
                  <div className={`p-4 rounded-xl border ${correction.units > 0 ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-300 text-amber-900 dark:text-amber-200' : 'bg-slate-50 dark:bg-slate-800 border-slate-200 text-slate-700 dark:text-slate-300'}`}>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold uppercase tracking-wider">Dose de Correção:</span>
                      <span className="text-xl font-bold">
                        {correction.units} UI de Insulina Regular
                      </span>
                    </div>
                    <p className="text-xs mt-2 text-slate-600 dark:text-slate-400">
                      {correction.recommendation}
                    </p>

                    {correction.units > 0 && (
                      <button
                        onClick={() => {
                          addInsulinRecord({
                            residentId: activeProfile.residentId,
                            residentName: activeProfile.name,
                            timestamp: 'Hoje, ' + new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
                            insulinName: 'Insulina Regular 100 UI/ml',
                            insulinType: 'Regular (Ação Rápida)',
                            prescribedUnits: correction.units,
                            actualUnitsGiven: correction.units,
                            injectionSite: recommendedSite,
                            administeredBy: 'Téc. Carlos Lima',
                            administeredByRole: 'Técnico de Enfermagem',
                            checkedBy: 'Enf. Mariana Castro',
                            status: 'Aplicado',
                            reason: `Correção de HGT ${calcInputBg} mg/dL pela escala móvel.`
                          });
                          setInsulinRecords(getStoredInsulinRecords());
                        }}
                        className="w-full mt-3 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-semibold transition-all"
                      >
                        Registrar Aplicação de {correction.units} UI no MAR
                      </button>
                    )}
                  </div>
                );
              })()}
            </div>

            {/* Prescribed Regimen Specs */}
            <div className="bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 space-y-3">
              <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
                Prescrição Médica Ativa
              </h4>
              <div className="space-y-2 text-xs">
                <div className="p-2.5 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
                  <span className="font-semibold text-rose-600 block">Insulina Basal:</span>
                  <span className="text-slate-700 dark:text-slate-300">{activeProfile.insulinRegimen.basalDose}</span>
                </div>
                <div className="p-2.5 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
                  <span className="font-semibold text-slate-900 dark:text-slate-100 block">Antidiabéticos Orais &amp; Psicofármacos:</span>
                  <ul className="list-disc pl-4 text-slate-600 dark:text-slate-400 mt-1 space-y-0.5">
                    {activeProfile.oralMedications.map((m, idx) => (
                      <li key={idx}>{m}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: EXAME DOS PÉS DIABÉTICOS                                           */}
      {/* ========================================================================= */}
      {activeTab === 'foot_care' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-5 mb-5">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <Heart className="w-5 h-5 text-rose-600" />
                  Rastreio &amp; Exame Físico dos Pés Diabéticos (IWGDF / SBD)
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Prevenção de úlceras, calosidades e neuropatia periférica nas moradoras da residência terapêutica.
                </p>
              </div>
              <button
                onClick={() => {
                  addFootRecord({
                    residentId: activeProfile.residentId,
                    residentName: activeProfile.name,
                    date: 'Hoje, ' + new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
                    inspectedBy: 'Enf. Mariana Castro (RT)',
                    skinIntegrity: 'Íntegra',
                    pulsesPresent: true,
                    sensitivityMonofilament: 'Preservada',
                    appropriateFootwear: true,
                    edemaLevel: 'Ausente',
                    riskCategory: 'Grau 0 (Sem neuropatia)',
                    actionPlan: 'Pele hidratada com creme neutro. Estimulado calçado fechado e meias claras sem costura.'
                  });
                  setFootRecords(getStoredFootRecords());
                }}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-semibold transition-all flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Registrar Nova Inspeção Podológica
              </button>
            </div>

            {/* Checklist of Foot Records */}
            <div className="space-y-4">
              {residentFoot.map(item => (
                <div key={item.id} className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-800 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <span className="font-bold text-sm text-slate-900 dark:text-slate-100">
                        {item.date} • Inspecionado por {item.inspectedBy}
                      </span>
                      <span className="text-xs text-slate-500 dark:text-slate-400 block mt-0.5">
                        Estratificação de Risco: <strong>{item.riskCategory}</strong>
                      </span>
                    </div>
                    <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                      {item.skinIntegrity}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs pt-2 border-t border-slate-200/60 dark:border-slate-700/60">
                    <div>
                      <span className="text-slate-400 block">Pulsos Pediosos:</span>
                      <span className="font-semibold text-slate-800 dark:text-slate-200">{item.pulsesPresent ? 'Presentes / Palpáveis' : 'Ausentes (Alerta Vascular)'}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Monofilamento Semmes-Weinstein:</span>
                      <span className="font-semibold text-slate-800 dark:text-slate-200">{item.sensitivityMonofilament}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Calçados na Residência:</span>
                      <span className="font-semibold text-slate-800 dark:text-slate-200">{item.appropriateFootwear ? 'Adequados / Protegidos' : 'Inadequados'}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Edema de Membros:</span>
                      <span className="font-semibold text-slate-800 dark:text-slate-200">{item.edemaLevel}</span>
                    </div>
                  </div>

                  <div className="p-3 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-300">
                    <strong>Conduta &amp; Plano de Cuidado:</strong> {item.actionPlan}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 5: GRAPHRAG & INTERAÇÕES PSICOFÁRMACOS                                 */}
      {/* ========================================================================= */}
      {activeTab === 'graph_rag' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-6">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Network className="w-5 h-5 text-indigo-600" />
                GraphRAG: Grafo de Conhecimento Clínico &amp; Interações Farmacológicas
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Mapeamento das interações entre a psicofarmacoterapia do SRT (Quetiapina, Lítio, Memantina) e o metabolismo glicídico.
              </p>
            </div>

            {/* Knowledge Nodes Cloud */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {graphContext.nodes.map(node => (
                <div key={node.id} className="p-3.5 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900 dark:text-slate-100">{node.label}</span>
                    <span className="text-[10px] px-1.5 py-0.5 bg-indigo-100 dark:bg-indigo-950 text-indigo-800 dark:text-indigo-300 rounded font-mono">
                      {node.type}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400">{node.description}</p>
                </div>
              ))}
            </div>

            {/* Retrieved Graph Insights */}
            <div className="p-4 bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-900 rounded-xl space-y-2">
              <h4 className="text-xs font-bold text-indigo-950 dark:text-indigo-200 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-indigo-600" />
                Insights Extraídos por GraphRAG para {activeProfile.name}
              </h4>
              <ul className="list-disc pl-5 text-xs text-indigo-900 dark:text-indigo-300 space-y-1">
                {graphContext.clinicalInsights.map((insight, idx) => (
                  <li key={idx}>{insight}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 6: IA NEXA GEMINI (FINE-TUNED CARE PROTOCOL)                           */}
      {/* ========================================================================= */}
      {activeTab === 'nexa_ai' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-rose-600" />
                  Inteligência Clínica Nexa • Parecer Especializado em Diabetes no SRT
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Modelo Gemini calibrado com diretrizes SBD 2024 e segurança no uso de psicofármacos.
                </p>
              </div>

              <button
                onClick={handleRunAiConsultation}
                disabled={isAiLoading}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white rounded-xl text-xs font-semibold transition-all flex items-center gap-2"
              >
                {isAiLoading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Processando com Gemini...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    Executar Análise Clínica
                  </>
                )}
              </button>
            </div>

            {/* AI Results */}
            {aiConsultationResult ? (
              <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                {/* Summary Card */}
                <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Parecer Geral</span>
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300">
                      {aiConsultationResult.riskClassification || 'Estável'}
                    </span>
                  </div>
                  <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                    {aiConsultationResult.summary}
                  </p>
                </div>

                {/* Practical Recommendations */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2">
                    <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      Recomendações Práticas para o Plantão
                    </h4>
                    <ul className="list-disc pl-4 text-xs text-slate-600 dark:text-slate-400 space-y-1">
                      {aiConsultationResult.recommendationsForShift?.map((rec: string, idx: number) => (
                        <li key={idx}>{rec}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="p-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2">
                    <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider flex items-center gap-1.5">
                      <ShieldAlert className="w-4 h-4 text-amber-600" />
                      Alertas de Segurança &amp; Nutrição
                    </h4>
                    <ul className="list-disc pl-4 text-xs text-slate-600 dark:text-slate-400 space-y-1">
                      {aiConsultationResult.safetyWarnings?.map((warn: string, idx: number) => (
                        <li key={idx}>{warn}</li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Export to SOAP Button */}
                <div className="flex items-center justify-between pt-2">
                  {soapCreatedSuccess ? (
                    <span className="text-xs font-semibold text-emerald-600 flex items-center gap-1.5">
                      <Check className="w-4 h-4" />
                      Evolução SOAP exportada com sucesso para o prontuário eletrônico!
                    </span>
                  ) : <div />}

                  <button
                    onClick={handleExportToSoap}
                    className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold transition-all flex items-center gap-2"
                  >
                    <FileText className="w-4 h-4" />
                    Exportar Evolução SOAP para o Prontuário
                  </button>
                </div>
              </div>
            ) : (
              <div className="py-10 text-center text-slate-400 text-sm">
                Clique no botão "Executar Análise Clínica" para gerar parecer contextualizado via IA Gemini.
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 7: ARQUITETURA & MCP INSPECTOR                                         */}
      {/* ========================================================================= */}
      {activeTab === 'architecture' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-6">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Cpu className="w-5 h-5 text-purple-600" />
                Governança Arquitetural: DDD, BPMN, SOA, Code Review &amp; MCP
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Detalhamento dos padrões de engenharia de software implementados neste módulo clínico.
              </p>
            </div>

            {/* Architecture Pillars Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-700 space-y-1">
                <span className="text-xs font-bold text-purple-600">Domain-Driven Design (DDD)</span>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  Bounded Context <code className="text-[11px] bg-slate-200 dark:bg-slate-700 px-1 rounded">DiabetesCare</code>, com Entidades, Value Objects e regras puras isoladas de infraestrutura.
                </p>
              </div>

              <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-700 space-y-1">
                <span className="text-xs font-bold text-amber-600">BPMN 2.0 Engine</span>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  Workflows executáveis para resgate de hipoglicemia e rotina de insulina, com rastreabilidade de tarefas e timers.
                </p>
              </div>

              <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-700 space-y-1">
                <span className="text-xs font-bold text-indigo-600">GraphRAG</span>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  Recuperação em grafo semântico conectando psicofármacos, fisiopatologia metabólica e diretrizes SBD 2024.
                </p>
              </div>

              <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-700 space-y-1">
                <span className="text-xs font-bold text-emerald-600">Model Context Protocol (MCP)</span>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  Endpoint padronizado (<code className="text-[11px] bg-slate-200 dark:bg-slate-700 px-1 rounded">/api/mcp/diabetes</code>) expondo ferramentas, recursos e prompts clínicos.
                </p>
              </div>
            </div>

            {/* MCP Registered Tools Table */}
            <div className="space-y-3 pt-3 border-t border-slate-100 dark:border-slate-800">
              <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
                Ferramentas MCP Registradas (Tools Specification)
              </h4>
              <div className="space-y-2">
                {MCP_DIABETES_TOOLS.map(tool => (
                  <div key={tool.name} className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-700 text-xs">
                    <span className="font-mono font-bold text-purple-700 dark:text-purple-400">{tool.name}</span>
                    <p className="text-slate-600 dark:text-slate-400 mt-0.5">{tool.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: REGISTRAR NOVA GLICEMIA (HGT)                                      */}
      {/* ========================================================================= */}
      {showAddHgtModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 max-w-md w-full shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Droplet className="w-5 h-5 text-rose-600" />
                Registrar Aferição HGT
              </h3>
              <button
                onClick={() => setShowAddHgtModal(false)}
                className="text-slate-400 hover:text-slate-600 text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveHgt} className="space-y-4 text-xs">
              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Residente:
                </label>
                <div className="p-2.5 bg-slate-100 dark:bg-slate-800 rounded-xl font-bold text-slate-900 dark:text-slate-100">
                  {activeProfile.name} ({activeProfile.room})
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Valor da Glicemia Capilar (mg/dL):
                </label>
                <input
                  type="number"
                  required
                  min={20}
                  max={600}
                  value={newHgtValue}
                  onChange={(e) => setNewHgtValue(Number(e.target.value))}
                  className="w-full text-xl font-bold p-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Momento / Refeição:
                </label>
                <select
                  value={newHgtMealTime}
                  onChange={(e) => setNewHgtMealTime(e.target.value as MealTime)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                >
                  <option value="Jejum">Jejum Matinal</option>
                  <option value="Pré-Almoço">Pré-Almoço</option>
                  <option value="Pós-Prandial (2h)">Pós-Prandial (2h após almoço/jantar)</option>
                  <option value="Pré-Jantar">Pré-Jantar</option>
                  <option value="Antes de Dormir">Antes de Dormir (Ceia)</option>
                  <option value="Madrugada (03:00)">Madrugada (03:00)</option>
                  <option value="Intercorrência">Intercorrência / Suspeita de Sintomas</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Observações Clínicas Adicionais:
                </label>
                <textarea
                  rows={2}
                  value={newHgtNotes}
                  onChange={(e) => setNewHgtNotes(e.target.value)}
                  placeholder="Ex: Residente bem disposta, sem queixas álgicas..."
                  className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddHgtModal(false)}
                  className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingHgt}
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-semibold rounded-xl"
                >
                  Salvar Aferição
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
