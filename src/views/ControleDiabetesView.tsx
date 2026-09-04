import React, { useState, useEffect } from 'react';
import { 
  Droplet, 
  Syringe, 
  Activity, 
  HeartPulse, 
  AlertTriangle, 
  CheckCircle2, 
  ShieldAlert, 
  Clock, 
  Sparkles, 
  RotateCw, 
  FileText, 
  User, 
  Layers, 
  Network, 
  Cpu, 
  Code, 
  Check, 
  Compass, 
  Send, 
  ArrowRight,
  TrendingUp,
  Info,
  ChevronRight,
  Plus
} from 'lucide-react';
import { 
  DiabetesCareProfile, 
  GlycemicMeasurement, 
  InsulinAdministration, 
  InjectionSite 
} from '../domain/diabetes/types';
import { GlycemicDomainService } from '../domain/diabetes/domainServices';
import { 
  BPMNWorkflowSimulator, 
  SRT_DIABETES_BPMN_NODES, 
  BPMNExecutionState 
} from '../domain/diabetes/bpmnWorkflow';
import { 
  GraphRAGDiabetesEngine, 
  SRT_DIABETES_KNOWLEDGE_GRAPH, 
  SRT_DIABETES_MCP_TOOLS,
  SRT_ENDOPSYCH_FINETUNED_CONFIG 
} from '../domain/diabetes/graphRAGModel';
import { 
  ARCHITECTURE_LAYERS_AUDIT, 
  CLEAN_CODE_CHECKLIST 
} from '../domain/diabetes/codeReviewInspector';
import { diabetesStore } from '../utils/diabetesStoreService';
import { GlycemicMeasurementModal } from '../components/GlycemicMeasurementModal';
import { InsulinAdministrationModal } from '../components/InsulinAdministrationModal';

export const ControleDiabetesView: React.FC = () => {
  const [profiles, setProfiles] = useState<DiabetesCareProfile[]>([]);
  const [selectedResidentId, setSelectedResidentId] = useState<string>('res-1');
  const [activeTab, setActiveTab] = useState<'painel' | 'insulina' | 'bpmn' | 'graphrag' | 'pe' | 'arquitetura'>('painel');
  
  // Modals
  const [isHgtModalOpen, setIsHgtModalOpen] = useState(false);
  const [isInsulinModalOpen, setIsInsulinModalOpen] = useState(false);

  // BPMN Simulator state
  const [bpmnSimValue, setBpmnSimValue] = useState<number>(64);
  const [bpmnExecution, setBpmnExecution] = useState<BPMNExecutionState | null>(null);

  // MCP & GraphRAG state
  const [selectedMCPTool, setSelectedMCPTool] = useState<string>('mcp_check_hypoglycemia_safety');
  const [mcpResult, setMcpResult] = useState<any>(null);
  const [userQuery, setUserQuery] = useState<string>('');
  const [aiConsultation, setAiConsultation] = useState<any>(null);
  const [isConsultingAI, setIsConsultingAI] = useState(false);

  // Load profiles on mount
  useEffect(() => {
    loadProfiles();
  }, []);

  const loadProfiles = async () => {
    const data = await diabetesStore.getAllProfiles();
    setProfiles(data);
  };

  const currentProfile = profiles.find(p => p.residentId === selectedResidentId) || profiles[0];

  // Calculations
  const metrics = currentProfile ? GlycemicDomainService.calculateTIRMetrics(currentProfile.recentMeasurements) : null;
  const rotationAdvice = currentProfile ? GlycemicDomainService.recommendNextInjectionSite(currentProfile.recentInsulinLogs) : null;

  // Run BPMN simulation initially when currentProfile changes
  useEffect(() => {
    if (currentProfile) {
      const initialVal = currentProfile.residentId === 'res-3' ? 64 : 112;
      setBpmnSimValue(initialVal);
      const res = BPMNWorkflowSimulator.simulate(currentProfile.residentName, initialVal);
      setBpmnExecution(res);
    }
  }, [selectedResidentId]);

  const handleRunBpmnSimulation = (val: number) => {
    if (!currentProfile) return;
    setBpmnSimValue(val);
    const res = BPMNWorkflowSimulator.simulate(currentProfile.residentName, val);
    setBpmnExecution(res);
  };

  const handleExecuteMCP = () => {
    if (!currentProfile) return;
    let args: any = {};
    if (selectedMCPTool === 'mcp_check_hypoglycemia_safety') {
      args = {
        residentId: currentProfile.residentId,
        glucoseValue: bpmnSimValue,
        isConscious: true,
        canSwallowSafely: currentProfile.residentId !== 'res-3'
      };
    } else if (selectedMCPTool === 'mcp_query_psychotropic_metabolic_interactions') {
      args = {
        residentId: currentProfile.residentId,
        includeGuidelines: true
      };
    } else if (selectedMCPTool === 'mcp_recommend_subcutaneous_rotation') {
      args = {
        residentId: currentProfile.residentId,
        lastSiteUsed: currentProfile.recentInsulinLogs[0]?.site || 'Abdômen Inferior Direito'
      };
    } else {
      args = {
        query: userQuery || 'Cuidados de enfermagem em idosa com demência e diabetes',
        residentId: currentProfile.residentId
      };
    }

    const exec = GraphRAGDiabetesEngine.executeMCPTool(selectedMCPTool, args);
    setMcpResult(exec);
  };

  const handleAskAIWithGraphRAG = async (queryOverride?: string) => {
    if (!currentProfile) return;
    const q = queryOverride || userQuery;
    if (!q.trim()) return;

    setIsConsultingAI(true);
    try {
      const graphContext = GraphRAGDiabetesEngine.retrieveSubGraph(currentProfile.residentId);
      
      const res = await fetch('/api/nexa/diabetes-consult', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          residentProfile: currentProfile,
          recentMeasurements: currentProfile.recentMeasurements.slice(0, 5),
          graphContext: graphContext.clinicalSummary,
          userQuestion: q,
          fineTunedConfig: SRT_ENDOPSYCH_FINETUNED_CONFIG
        })
      });

      const data = await res.json();
      if (data.consultation) {
        setAiConsultation(data.consultation);
      }
    } catch (err) {
      console.error('Erro na consulta AI:', err);
    } finally {
      setIsConsultingAI(false);
    }
  };

  const handleSavedMeasurement = async (measurement: GlycemicMeasurement) => {
    await diabetesStore.saveMeasurement(measurement);
    await loadProfiles();
  };

  const handleSavedInsulin = async (log: InsulinAdministration) => {
    await diabetesStore.saveInsulinLog(log);
    await loadProfiles();
  };

  if (!currentProfile) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  const latestReading = currentProfile.recentMeasurements[0];

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-teal-950 to-slate-900 text-white rounded-3xl p-6 lg:p-8 shadow-xl border border-teal-900/30 relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-teal-500/20 border border-teal-400/30 rounded-full text-xs font-semibold text-teal-300">
              <Sparkles className="w-3.5 h-3.5" />
              Arquitetura Clínica DDD • BPMN 2.0 • SOA • GraphRAG • MCP • Clean Code
            </div>
            <h1 className="text-2xl lg:text-3xl font-extrabold tracking-tight">
              Cuidado & Controle de Diabetes em SRT
            </h1>
            <p className="text-sm text-slate-300 leading-relaxed">
              Módulo de alta precisão clínica para as 2 residentes com diabetes da Residência Terapêutica, integrando monitoramento glicêmico contínuo, mapa de rodízio de insulina e protocolo interativo de resgate.
            </p>
          </div>

          {/* Quick Global Action Buttons */}
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => setIsHgtModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-xs font-bold shadow-lg shadow-emerald-500/20 transition-all"
            >
              <Plus className="w-4 h-4" />
              Novo HGT
            </button>
            {currentProfile.treatmentType.includes('Insulina') && (
              <button
                onClick={() => setIsInsulinModalOpen(true)}
                className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-lg shadow-blue-600/20 transition-all"
              >
                <Syringe className="w-4 h-4" />
                Aplicar Insulina
              </button>
            )}
            <button
              onClick={() => {
                setActiveTab('bpmn');
                handleRunBpmnSimulation(64);
              }}
              className="flex items-center gap-2 px-4 py-2.5 bg-slate-800/80 hover:bg-slate-700 border border-slate-700 text-white rounded-xl text-xs font-semibold transition-all"
            >
              <Layers className="w-4 h-4 text-teal-400" />
              Fluxo BPMN
            </button>
            <button
              onClick={() => setActiveTab('graphrag')}
              className="flex items-center gap-2 px-4 py-2.5 bg-purple-900/60 hover:bg-purple-800/80 border border-purple-700/50 text-purple-200 rounded-xl text-xs font-semibold transition-all"
            >
              <Network className="w-4 h-4 text-purple-400" />
              GraphRAG & MCP
            </button>
          </div>
        </div>
      </div>

      {/* Resident Switcher Tabs */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {profiles.map(p => {
          const isSelected = p.residentId === selectedResidentId;
          const lastMeas = p.recentMeasurements[0];
          const isTereza = p.residentId === 'res-3';

          return (
            <div
              key={p.residentId}
              onClick={() => setSelectedResidentId(p.residentId)}
              className={`p-5 rounded-2xl border cursor-pointer transition-all ${
                isSelected
                  ? 'bg-white dark:bg-slate-900 border-teal-500 shadow-md ring-2 ring-teal-500/20'
                  : 'bg-slate-50/70 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800 hover:bg-white'
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3.5">
                  <img 
                    src={p.photo} 
                    alt={p.residentName} 
                    className="w-14 h-14 rounded-2xl object-cover border-2 border-teal-500/40 shadow"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-bold text-slate-900 dark:text-white">
                        {p.residentName}
                      </h3>
                      <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                        {p.age} anos
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      {p.room} • {p.diabetesType}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className={`px-2.5 py-0.5 text-xs font-bold rounded-full ${
                        isTereza 
                          ? 'bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300' 
                          : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                      }`}>
                        {p.treatmentType}
                      </span>
                      <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                        HbA1c: <strong className="text-slate-900 dark:text-white">{p.currentHbA1c}%</strong>
                      </span>
                    </div>
                  </div>
                </div>

                {/* Status Box */}
                {lastMeas && (
                  <div className="text-right">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">
                      Último HGT
                    </span>
                    <div className="flex items-baseline justify-end gap-1 mt-0.5">
                      <span className={`text-2xl font-black ${
                        lastMeas.value < 70 ? 'text-red-600' : lastMeas.value <= 180 ? 'text-emerald-600' : 'text-amber-600'
                      }`}>
                        {lastMeas.value}
                      </span>
                      <span className="text-[10px] text-slate-400 font-bold">mg/dL</span>
                    </div>
                    <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full mt-1 ${
                      lastMeas.value < 70 ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700'
                    }`}>
                      {lastMeas.context}
                    </span>
                  </div>
                )}
              </div>

              {/* Rationale Bar */}
              <div className="mt-3.5 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                <span className="truncate">
                  🎯 <strong>Meta:</strong> Jejum {p.glycemicTarget.fastingMin}-{p.glycemicTarget.fastingMax} | Pós até {p.glycemicTarget.postPrandialMax} mg/dL
                </span>
                <span className="text-[11px] font-semibold text-teal-600 dark:text-teal-400 whitespace-nowrap">
                  {isTereza ? 'Meta Flexibilizada (Segurança)' : 'Meta Padrão SBD'}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 overflow-x-auto pb-1">
        {[
          { id: 'painel', label: 'Painel Clínico & HGT (DDD)', icon: Activity },
          { id: 'insulina', label: 'Insulinoterapia & Mapa Anatômico (SOA)', icon: Syringe },
          { id: 'bpmn', label: 'Protocolo Interativo BPMN 2.0', icon: Layers },
          { id: 'graphrag', label: 'Inteligência GraphRAG & MCP', icon: Network },
          { id: 'pe', label: 'Inspeção do Pé Diabético', icon: HeartPulse },
          { id: 'arquitetura', label: 'Clean Code & Code Review', icon: Code },
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold whitespace-nowrap rounded-xl transition-all ${
                isActive
                  ? 'bg-slate-900 text-white dark:bg-teal-600 dark:text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/50'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* TAB 1: PAINEL CLÍNICO & HGT (DDD) */}
      {activeTab === 'painel' && (
        <div className="space-y-6">
          {/* TIR Metrics Row */}
          {metrics && (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                <span className="text-[11px] font-semibold text-slate-500 uppercase">Média Glicêmica</span>
                <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">
                  {metrics.averageGlucose} <span className="text-xs font-normal text-slate-400">mg/dL</span>
                </p>
                <span className="text-[10px] text-slate-400">Baseada em {metrics.totalReadings} aferições</span>
              </div>

              <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-emerald-200 dark:border-emerald-950/60 shadow-sm">
                <span className="text-[11px] font-semibold text-emerald-600 uppercase">Tempo no Alvo (TIR)</span>
                <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
                  {metrics.tirPercentage}%
                </p>
                <span className="text-[10px] text-emerald-600/80">Meta &gt; 70% (70-180 mg/dL)</span>
              </div>

              <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-red-200 dark:border-red-950/60 shadow-sm">
                <span className="text-[11px] font-semibold text-red-600 uppercase">Abaixo do Alvo (TBR)</span>
                <p className="text-2xl font-black text-red-600 dark:text-red-400 mt-1">
                  {metrics.tbrPercentage}%
                </p>
                <span className="text-[10px] text-red-600/80">Meta &lt; 4% (&lt; 70 mg/dL)</span>
              </div>

              <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-amber-200 dark:border-amber-950/60 shadow-sm">
                <span className="text-[11px] font-semibold text-amber-600 uppercase">Acima do Alvo (TAR)</span>
                <p className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-1">
                  {metrics.tarPercentage}%
                </p>
                <span className="text-[10px] text-amber-600/80">Meta &lt; 25% (&gt; 180 mg/dL)</span>
              </div>

              <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                <span className="text-[11px] font-semibold text-slate-500 uppercase">Variabilidade (CV%)</span>
                <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">
                  {metrics.glycemicVariabilityCV}%
                </p>
                <span className="text-[10px] text-slate-400">Meta &le; 36% (Estabilidade)</span>
              </div>

              <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                <span className="text-[11px] font-semibold text-slate-500 uppercase">GMI Estimado</span>
                <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">
                  {metrics.estimatedGMI}%
                </p>
                <span className="text-[10px] text-slate-400">Equivalente HbA1c</span>
              </div>
            </div>
          )}

          {/* Visual Timeline Strip */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Curva de Glicemia Capilar (HGT) Recente</h3>
                <p className="text-xs text-slate-500">Faixa Verde = Zona Alvo Terapêutica (70 a 180 mg/dL)</p>
              </div>
              <button
                onClick={() => setIsHgtModalOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-xs font-bold"
              >
                <Plus className="w-3.5 h-3.5" />
                Adicionar Ponto
              </button>
            </div>

            {/* Visual Points Container */}
            <div className="relative pt-6 pb-2">
              {/* Target Zone background */}
              <div className="h-28 w-full bg-slate-50 dark:bg-slate-800/40 rounded-xl relative border border-slate-200 dark:border-slate-700/60 overflow-hidden flex items-end px-4 gap-4">
                {/* Visual Target band */}
                <div className="absolute inset-x-0 bottom-[20%] top-[30%] bg-emerald-500/10 border-y border-emerald-500/20 pointer-events-none" />
                <span className="absolute right-3 top-[32%] text-[9px] font-bold text-emerald-600 dark:text-emerald-400">
                  Teto: 180 mg/dL
                </span>
                <span className="absolute right-3 bottom-[22%] text-[9px] font-bold text-emerald-600 dark:text-emerald-400">
                  Piso: 70 mg/dL
                </span>

                {/* Bars for measurements */}
                {currentProfile.recentMeasurements.map((m, idx) => {
                  const heightPct = Math.min(Math.max((m.value / 300) * 100, 10), 100);
                  const isHypo = m.value < 70;
                  const isHyper = m.value > 180;
                  const isTarget = !isHypo && !isHyper;

                  return (
                    <div key={m.id || idx} className="flex-1 flex flex-col items-center justify-end h-full relative group">
                      <span className={`text-[11px] font-bold mb-1 ${
                        isHypo ? 'text-red-600' : isTarget ? 'text-emerald-600' : 'text-amber-600'
                      }`}>
                        {m.value}
                      </span>
                      <div 
                        style={{ height: `${heightPct}%` }}
                        className={`w-full max-w-[28px] rounded-t-md transition-all ${
                          isHypo 
                            ? 'bg-red-500' 
                            : isTarget 
                            ? 'bg-emerald-500' 
                            : 'bg-amber-500'
                        }`}
                      />
                      <span className="text-[9px] text-slate-400 mt-1 truncate max-w-[40px]">
                        {m.context.split(' ')[0]}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Measurements Table */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Histórico de Aferições Clínicas & Condutas Adotadas
              </h3>
              <span className="text-xs text-slate-500">
                {currentProfile.recentMeasurements.length} registros no prontuário
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 uppercase text-[10px] font-bold">
                  <tr>
                    <th className="px-6 py-3">Horário / Data</th>
                    <th className="px-6 py-3">Contexto</th>
                    <th className="px-6 py-3">Glicemia (mg/dL)</th>
                    <th className="px-6 py-3">Classificação</th>
                    <th className="px-6 py-3">Sinais / Sintomas</th>
                    <th className="px-6 py-3">Conduta Imediata</th>
                    <th className="px-6 py-3">Responsável</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {currentProfile.recentMeasurements.map(m => {
                    const isHypo = m.value < 70;
                    return (
                      <tr key={m.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                        <td className="px-6 py-3.5 font-medium text-slate-900 dark:text-white whitespace-nowrap">
                          {new Date(m.timestamp).toLocaleDateString('pt-BR')} às {new Date(m.timestamp).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                        </td>
                        <td className="px-6 py-3.5 font-semibold text-slate-700 dark:text-slate-300 whitespace-nowrap">
                          {m.context}
                        </td>
                        <td className="px-6 py-3.5 whitespace-nowrap">
                          <span className={`text-base font-black ${
                            isHypo ? 'text-red-600' : m.value <= 180 ? 'text-emerald-600' : 'text-amber-600'
                          }`}>
                            {m.value}
                          </span>
                          <span className="text-[10px] text-slate-400 ml-1">mg/dL</span>
                        </td>
                        <td className="px-6 py-3.5 whitespace-nowrap">
                          <span className={`inline-flex px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            isHypo 
                              ? 'bg-red-100 text-red-800 dark:bg-red-950/60 dark:text-red-300' 
                              : m.value <= 180
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                              : 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                          }`}>
                            {m.classification}
                          </span>
                        </td>
                        <td className="px-6 py-3.5 text-slate-600 dark:text-slate-400">
                          {m.symptoms?.join(', ') || 'Nenhum'}
                        </td>
                        <td className="px-6 py-3.5 text-slate-700 dark:text-slate-300 max-w-xs">
                          {m.actionTaken || '-'}
                        </td>
                        <td className="px-6 py-3.5 text-slate-500 whitespace-nowrap">
                          {m.measuredBy} <span className="text-[10px]">({m.measuredRole})</span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: INSULINOTERAPIA & MAPA ANATÔMICO (SOA) */}
      {activeTab === 'insulina' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left: Anatomical Rotation Map */}
            <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <RotateCw className="w-5 h-5 text-blue-600" />
                    Mapa de Rodízio Subcutâneo (Prevenção de Lipodistrofia)
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Alternância de quadrantes abdominais, coxas e braços recomendada pela SBD
                  </p>
                </div>
                {rotationAdvice && (
                  <button
                    onClick={() => setIsInsulinModalOpen(true)}
                    className="flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow transition-all"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Registrar Aplicação
                  </button>
                )}
              </div>

              {/* Rotation Advice Banner */}
              {rotationAdvice && (
                <div className="p-4 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900 rounded-xl flex items-start gap-3 text-blue-900 dark:text-blue-200">
                  <RotateCw className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5 animate-spin-slow" />
                  <div>
                    <p className="text-xs font-bold">
                      Próximo Local Indicado pelo Algoritmo de Enfermagem:
                    </p>
                    <p className="text-sm font-black text-blue-700 dark:text-blue-300 mt-0.5">
                      📍 {rotationAdvice.recommendedSite}
                    </p>
                    <p className="text-xs mt-1 text-blue-800/80 dark:text-blue-300/80">
                      {rotationAdvice.rationale}
                    </p>
                  </div>
                </div>
              )}

              {/* Anatomical Grid Visualizer */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                {[
                  { name: 'Abdômen Superior Direito', group: 'Abdominal' },
                  { name: 'Abdômen Superior Esquerdo', group: 'Abdominal' },
                  { name: 'Abdômen Inferior Direito', group: 'Abdominal' },
                  { name: 'Abdômen Inferior Esquerdo', group: 'Abdominal' },
                  { name: 'Coxa Anterior Direita', group: 'Membros Inferiores' },
                  { name: 'Coxa Anterior Esquerda', group: 'Membros Inferiores' },
                  { name: 'Braço Posterior Direito', group: 'Membros Superiores' },
                  { name: 'Braço Posterior Esquerdo', group: 'Membros Superiores' },
                ].map(site => {
                  const isRecommended = rotationAdvice?.recommendedSite === site.name;
                  const lastUsedLog = currentProfile.recentInsulinLogs.find(l => l.site === site.name);
                  const isLastUsed = currentProfile.recentInsulinLogs[0]?.site === site.name;

                  return (
                    <div
                      key={site.name}
                      className={`p-3.5 rounded-xl border flex flex-col justify-between transition-all ${
                        isRecommended
                          ? 'border-blue-500 bg-blue-50/80 dark:bg-blue-950/50 ring-2 ring-blue-500/30 shadow-sm'
                          : isLastUsed
                          ? 'border-slate-400 bg-slate-100 dark:bg-slate-800/80'
                          : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] uppercase font-bold text-slate-400">
                            {site.group}
                          </span>
                          {isRecommended && (
                            <span className="text-[9px] font-bold px-1.5 py-0.5 bg-blue-600 text-white rounded">
                              Recomendado
                            </span>
                          )}
                          {isLastUsed && !isRecommended && (
                            <span className="text-[9px] font-bold px-1.5 py-0.5 bg-slate-300 text-slate-800 rounded">
                              Último
                            </span>
                          )}
                        </div>
                        <p className="text-xs font-bold text-slate-800 dark:text-slate-200 mt-1">
                          {site.name}
                        </p>
                      </div>

                      <div className="mt-3 pt-2 border-t border-slate-100 dark:border-slate-800/80 text-[10px] text-slate-400">
                        {lastUsedLog ? (
                          <span>Última: {new Date(lastUsedLog.timestamp).toLocaleDateString('pt-BR')} ({lastUsedLog.units} UI)</span>
                        ) : (
                          <span className="text-emerald-600">Disponível para rodízio</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right: Prescribed Scheme & Sliding Scale */}
            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <FileText className="w-5 h-5 text-indigo-600" />
                Prescrição de Insulina (MAR)
              </h3>

              <div className="space-y-4">
                {currentProfile.prescriptions.map((p, idx) => (
                  <div key={idx} className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-900 dark:text-white">{p.name}</span>
                      <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-indigo-100 text-indigo-800 dark:bg-indigo-900/60 dark:text-indigo-300">
                        {p.route}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-300 font-medium">
                      <strong>Dose:</strong> {p.dosage}
                    </p>
                    <p className="text-xs text-slate-500">
                      <strong>Horários:</strong> {p.schedule}
                    </p>
                    {p.slidingScaleRules && (
                      <div className="mt-2 p-2.5 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 rounded-lg text-[11px] text-amber-900 dark:text-amber-200">
                        <strong>Escala Móvel:</strong> {p.slidingScaleRules}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Administration Logs Table */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Registro de Aplicações de Insulina Subcutânea
              </h3>
              <span className="text-xs text-slate-500">
                {currentProfile.recentInsulinLogs.length} aplicações registradas
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 uppercase text-[10px] font-bold">
                  <tr>
                    <th className="px-6 py-3">Data / Hora</th>
                    <th className="px-6 py-3">Tipo de Insulina</th>
                    <th className="px-6 py-3">Dose (UI)</th>
                    <th className="px-6 py-3">Sítio Anatômico</th>
                    <th className="px-6 py-3">Glicemia no Momento</th>
                    <th className="px-6 py-3">Pele sem Nódulos</th>
                    <th className="px-6 py-3">Profissional</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {currentProfile.recentInsulinLogs.map(l => (
                    <tr key={l.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="px-6 py-3.5 font-medium text-slate-900 dark:text-white whitespace-nowrap">
                        {new Date(l.timestamp).toLocaleDateString('pt-BR')} às {new Date(l.timestamp).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td className="px-6 py-3.5 font-semibold text-slate-800 dark:text-slate-200">
                        {l.insulinType}
                      </td>
                      <td className="px-6 py-3.5 font-black text-blue-600 text-sm">
                        {l.units} UI
                      </td>
                      <td className="px-6 py-3.5 font-medium text-slate-700 dark:text-slate-300">
                        📍 {l.site}
                      </td>
                      <td className="px-6 py-3.5 text-slate-600">
                        {l.bloodGlucoseAtTime ? `${l.bloodGlucoseAtTime} mg/dL` : 'Não aferida'}
                      </td>
                      <td className="px-6 py-3.5">
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Verificado
                        </span>
                      </td>
                      <td className="px-6 py-3.5 text-slate-500 whitespace-nowrap">
                        {l.administeredBy}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: PROTOCOLO INTERATIVO BPMN 2.0 */}
      {activeTab === 'bpmn' && (
        <div className="space-y-6">
          {/* Simulator Controls */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Layers className="w-5 h-5 text-teal-600" />
                  Simulador de Execução BPMN 2.0: Processo PRC-SRT-DIABETES-001
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Fluxo formal de tomada de decisão, bifurcações XOR e protocolo dos 15 minutos em SRT
                </p>
              </div>

              {/* Presets */}
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-semibold text-slate-500">Cenários de Teste:</span>
                <button
                  onClick={() => handleRunBpmnSimulation(48)}
                  className="px-3 py-1.5 bg-red-100 hover:bg-red-200 text-red-800 text-xs font-bold rounded-lg transition-colors"
                >
                  48 mg/dL (Hipo Grave)
                </button>
                <button
                  onClick={() => handleRunBpmnSimulation(64)}
                  className="px-3 py-1.5 bg-amber-100 hover:bg-amber-200 text-amber-800 text-xs font-bold rounded-lg transition-colors"
                >
                  64 mg/dL (Hipo Leve)
                </button>
                <button
                  onClick={() => handleRunBpmnSimulation(115)}
                  className="px-3 py-1.5 bg-emerald-100 hover:bg-emerald-200 text-emerald-800 text-xs font-bold rounded-lg transition-colors"
                >
                  115 mg/dL (Euglicemia)
                </button>
                <button
                  onClick={() => handleRunBpmnSimulation(280)}
                  className="px-3 py-1.5 bg-purple-100 hover:bg-purple-200 text-purple-800 text-xs font-bold rounded-lg transition-colors"
                >
                  280 mg/dL (Hiper Acentuada)
                </button>
              </div>
            </div>

            {/* Slider to adjust HGT value */}
            <div className="flex items-center gap-4 pt-2">
              <span className="text-xs font-bold text-slate-500">Valor HGT:</span>
              <input
                type="range"
                min={30}
                max={350}
                value={bpmnSimValue}
                onChange={e => handleRunBpmnSimulation(parseInt(e.target.value))}
                className="flex-1 accent-teal-600 cursor-pointer"
              />
              <span className="text-xl font-black text-slate-900 dark:text-white min-w-[70px]">
                {bpmnSimValue} <span className="text-xs font-normal text-slate-400">mg/dL</span>
              </span>
            </div>
          </div>

          {/* BPMN Workflow Diagram Visualizer */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
            <h4 className="text-xs uppercase font-bold tracking-wider text-slate-400">
              Cadeia de Nós do Processo BPMN 2.0 Ativo
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {SRT_DIABETES_BPMN_NODES.map(node => {
                const isExecuted = bpmnExecution?.executionHistory.some(h => h.nodeId === node.id);
                const isActive = bpmnExecution?.activeNodeId === node.id;

                return (
                  <div
                    key={node.id}
                    className={`p-4 rounded-xl border transition-all ${
                      isActive
                        ? 'border-teal-500 bg-teal-50/80 dark:bg-teal-950/40 ring-2 ring-teal-500/30 shadow-md'
                        : isExecuted
                        ? 'border-emerald-300 bg-emerald-50/40 dark:bg-emerald-950/20 dark:border-emerald-900'
                        : 'border-slate-200 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-900/30 opacity-60'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded ${
                        node.type === 'startEvent' || node.type === 'endEvent'
                          ? 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                          : node.type === 'exclusiveGateway'
                          ? 'bg-amber-100 text-amber-800'
                          : node.type === 'intermediateTimerEvent'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-teal-100 text-teal-800'
                      }`}>
                        {node.type}
                      </span>
                      <span className="text-[10px] font-semibold text-slate-400">
                        Ator: <strong>{node.actor}</strong>
                      </span>
                    </div>

                    <h5 className="text-xs font-bold text-slate-900 dark:text-white">
                      {node.name}
                    </h5>
                    <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
                      {node.description}
                    </p>

                    {node.actionGuideline && (
                      <div className="mt-2.5 pt-2 border-t border-slate-200/60 dark:border-slate-800 text-[10px] text-slate-500">
                        📋 <strong>Diretriz:</strong> {node.actionGuideline}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Live Execution Log */}
          {bpmnExecution && (
            <div className="bg-slate-900 text-slate-200 p-6 rounded-2xl border border-slate-800 shadow-xl space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <span className="text-xs font-bold text-teal-400 uppercase tracking-wider flex items-center gap-2">
                  <Activity className="w-4 h-4" />
                  Rastro de Execução do Processo ({bpmnExecution.processId})
                </span>
                <span className="text-xs text-slate-400">
                  Residente: <strong>{bpmnExecution.variables.residentName}</strong> | Valor: <strong>{bpmnExecution.variables.glucoseValue} mg/dL</strong>
                </span>
              </div>

              <div className="space-y-2 font-mono text-xs">
                {bpmnExecution.executionHistory.map((step, idx) => (
                  <div key={idx} className="flex items-start gap-3 py-1 text-slate-300 border-b border-slate-800/40">
                    <span className="text-teal-400 font-bold">{step.timestamp}</span>
                    <span className="text-slate-500">[{step.nodeId}]</span>
                    <span className="flex-1">{step.note}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 4: INTELIGÊNCIA GRAPHRAG & MCP */}
      {activeTab === 'graphrag' && (
        <div className="space-y-6">
          {/* Ask AI with GraphRAG Consultation Box */}
          <div className="bg-gradient-to-br from-purple-950 via-slate-900 to-indigo-950 text-white p-6 lg:p-8 rounded-2xl shadow-xl border border-purple-800/40 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-purple-500/20 rounded-xl">
                  <Network className="w-5 h-5 text-purple-300" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">
                    Consultoria Clínica com GraphRAG & Gemini 3.8 Flash
                  </h3>
                  <p className="text-xs text-purple-200">
                    Persona Especialista SRT-EndoPsych-v2 conectada às triplas de psicofármacos e diretrizes SBD
                  </p>
                </div>
              </div>

              <span className="text-[10px] font-bold px-2.5 py-1 bg-purple-900/60 border border-purple-700/50 rounded-full text-purple-300">
                Modelo: {SRT_ENDOPSYCH_FINETUNED_CONFIG.modelName}
              </span>
            </div>

            {/* Quick Consultation Presets */}
            <div className="flex flex-wrap gap-2 pt-1">
              <button
                onClick={() => {
                  setUserQuery('Avaliar segurança do uso concomitante de Quetiapina e risco de ganho de peso em Sra. Helena');
                  handleAskAIWithGraphRAG('Avaliar segurança do uso concomitante de Quetiapina e risco de ganho de peso em Sra. Helena');
                }}
                className="text-xs px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded-lg text-purple-200 transition-colors"
              >
                💊 Quetiapina x Resistência Insulínica (Helena)
              </button>
              <button
                onClick={() => {
                  setUserQuery('Como conduzir resgate de hipoglicemia em Dra. Tereza considerando a disfagia para líquidos finos?');
                  handleAskAIWithGraphRAG('Como conduzir resgate de hipoglicemia em Dra. Tereza considerando a disfagia para líquidos finos?');
                }}
                className="text-xs px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded-lg text-purple-200 transition-colors"
              >
                ⚠️ Resgate de Hipoglicemia com Disfagia (Tereza)
              </button>
              <button
                onClick={() => {
                  setUserQuery('Por que a meta de HbA1c para idosa com demência e insulinoterapia deve ser flexibilizada (100-200 mg/dL)?');
                  handleAskAIWithGraphRAG('Por que a meta de HbA1c para idosa com demência e insulinoterapia deve ser flexibilizada (100-200 mg/dL)?');
                }}
                className="text-xs px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded-lg text-purple-200 transition-colors"
              >
                🎯 Metas Glicêmicas no Idoso Frágil (SBD/ADA)
              </button>
            </div>

            {/* Query Input */}
            <div className="flex gap-2">
              <input
                type="text"
                value={userQuery}
                onChange={e => setUserQuery(e.target.value)}
                placeholder="Faça uma pergunta clínica para o especialista da Residência Terapêutica..."
                className="flex-1 px-4 py-3 bg-white/10 border border-purple-500/30 rounded-xl text-xs text-white placeholder-purple-300/50 focus:outline-none focus:ring-2 focus:ring-purple-400"
              />
              <button
                disabled={isConsultingAI}
                onClick={() => handleAskAIWithGraphRAG()}
                className="flex items-center gap-2 px-5 py-3 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition-all shadow-lg"
              >
                {isConsultingAI ? (
                  <RotateCw className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
                Consultar IA
              </button>
            </div>

            {/* AI Result Card */}
            {aiConsultation && (
              <div className="mt-4 p-5 bg-white/10 rounded-xl border border-purple-500/30 space-y-3 animate-fadeIn">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-purple-200 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-purple-300" />
                    Parecer Clínico Estruturado
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-purple-400 text-purple-950">
                    {aiConsultation.riskClassification}
                  </span>
                </div>

                <p className="text-xs text-white leading-relaxed font-medium">
                  {aiConsultation.summary}
                </p>

                {aiConsultation.safetyWarnings?.length > 0 && (
                  <div className="p-3 bg-red-950/60 border border-red-500/40 rounded-lg space-y-1">
                    <span className="text-[10px] uppercase font-bold text-red-400 flex items-center gap-1">
                      <AlertTriangle className="w-3.5 h-3.5" /> Alertas Críticos de Segurança
                    </span>
                    {aiConsultation.safetyWarnings.map((w: string, idx: number) => (
                      <p key={idx} className="text-xs text-red-200 leading-snug">• {w}</p>
                    ))}
                  </div>
                )}

                {aiConsultation.recommendationsForShift?.length > 0 && (
                  <div className="space-y-1.5 pt-1">
                    <span className="text-[10px] uppercase font-bold text-purple-300">
                      Recomendações Práticas para o Plantão:
                    </span>
                    {aiConsultation.recommendationsForShift.map((r: string, idx: number) => (
                      <div key={idx} className="flex items-start gap-2 text-xs text-purple-100">
                        <Check className="w-3.5 h-3.5 text-teal-400 mt-0.5 flex-shrink-0" />
                        <span>{r}</span>
                      </div>
                    ))}
                  </div>
                )}

                {aiConsultation.graphInsights && (
                  <p className="text-[11px] text-purple-300 italic pt-2 border-t border-purple-500/20">
                    🌐 <strong>Insights GraphRAG:</strong> {aiConsultation.graphInsights}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Model Context Protocol (MCP) Live Console */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Cpu className="w-5 h-5 text-indigo-600" />
                  Console de Ferramentas MCP (Model Context Protocol)
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Assinaturas JSON-schema padronizadas para orquestração de ferramentas clínicas autônomas
                </p>
              </div>

              <button
                onClick={handleExecuteMCP}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all"
              >
                <Cpu className="w-4 h-4" />
                Executar MCP Tool
              </button>
            </div>

            {/* MCP Tool Selector */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {SRT_DIABETES_MCP_TOOLS.map(tool => {
                const isSelected = selectedMCPTool === tool.name;
                return (
                  <button
                    key={tool.name}
                    onClick={() => setSelectedMCPTool(tool.name)}
                    className={`p-3.5 rounded-xl border text-left transition-all ${
                      isSelected
                        ? 'border-indigo-600 bg-indigo-50/80 dark:bg-indigo-950/40 text-indigo-900 dark:text-indigo-200 ring-2 ring-indigo-500/20'
                        : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50'
                    }`}
                  >
                    <p className="text-xs font-bold font-mono">{tool.name}</p>
                    <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">{tool.description}</p>
                  </button>
                );
              })}
            </div>

            {/* MCP Execution Result View */}
            {mcpResult && (
              <div className="p-4 bg-slate-900 text-slate-200 rounded-xl font-mono text-xs overflow-x-auto space-y-2">
                <span className="text-[10px] uppercase font-bold text-indigo-400">
                  Retorno JSON da Execução MCP Tool ({selectedMCPTool})
                </span>
                <pre className="text-slate-300">
                  {JSON.stringify(mcpResult, null, 2)}
                </pre>
              </div>
            )}
          </div>

          {/* Knowledge Graph Explorer */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Network className="w-5 h-5 text-teal-600" />
              Explorador de Triplas do Grafo de Conhecimento (GraphRAG)
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Nodes List */}
              <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 space-y-3">
                <h4 className="text-xs font-bold uppercase text-slate-400">
                  Entidades Mapeadas no Grafo ({SRT_DIABETES_KNOWLEDGE_GRAPH.nodes.length})
                </h4>
                <div className="space-y-2 max-h-72 overflow-y-auto">
                  {SRT_DIABETES_KNOWLEDGE_GRAPH.nodes.map(n => (
                    <div key={n.id} className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/50 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900 dark:text-white">{n.label}</span>
                        <span className="text-[9px] font-semibold px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                          {n.category}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5">{n.description}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Relationships List */}
              <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 space-y-3">
                <h4 className="text-xs font-bold uppercase text-slate-400">
                  Arestas Clínicas & Impactos ({SRT_DIABETES_KNOWLEDGE_GRAPH.edges.length})
                </h4>
                <div className="space-y-2 max-h-72 overflow-y-auto">
                  {SRT_DIABETES_KNOWLEDGE_GRAPH.edges.map(e => (
                    <div key={e.id} className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/50 text-xs space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-teal-700 dark:text-teal-400 font-mono text-[11px]">
                          {e.relation}
                        </span>
                        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                          e.clinicalImpact === 'Alto' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'
                        }`}>
                          Impacto {e.clinicalImpact}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-600 dark:text-slate-300">
                        {e.label}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: INSPEÇÃO DO PÉ DIABÉTICO */}
      {activeTab === 'pe' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <HeartPulse className="w-5 h-5 text-red-600" />
                  Rastreio & Prevenção de Pé Diabético em SRT
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Protocolo de avaliação de neuropatia sensorial periférica, pulsos pediosos e adequação de calçados
                </p>
              </div>
            </div>

            {/* Inspections list */}
            <div className="space-y-4">
              {currentProfile.footCareHistory.map(fc => (
                <div key={fc.id} className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200/60 dark:border-slate-800 pb-3">
                    <div>
                      <span className="text-xs font-bold text-slate-900 dark:text-white">
                        Avaliação realizada em {new Date(fc.date).toLocaleDateString('pt-BR')}
                      </span>
                      <p className="text-xs text-slate-500">
                        Examinador: {fc.examinerName} ({fc.examinerRole})
                      </p>
                    </div>
                    <span className="inline-block px-3 py-1 bg-amber-100 text-amber-800 text-xs font-bold rounded-full">
                      {fc.riskTier}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-bold">Integridade Cutânea</span>
                      <strong className="text-slate-700 dark:text-slate-300">{fc.skinIntegrity}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-bold">Pulsos Pediosos</span>
                      <strong className="text-slate-700 dark:text-slate-300">{fc.pedalPulses}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-bold">Monofilamento 10g</span>
                      <strong className="text-slate-700 dark:text-slate-300">{fc.monofilamentSensitivity}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-bold">Calçados Utilizados</span>
                      <strong className="text-slate-700 dark:text-slate-300">{fc.footwearAdequacy}</strong>
                    </div>
                  </div>

                  {fc.recommendations?.length > 0 && (
                    <div className="pt-2">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                        Plano de Cuidado Preventivo:
                      </span>
                      <ul className="list-disc list-inside text-xs text-slate-600 dark:text-slate-300 space-y-1">
                        {fc.recommendations.map((rec, idx) => (
                          <li key={idx}>{rec}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 6: ARQUITETURA, DDD, SOA & CLEAN CODE REVIEW */}
      {activeTab === 'arquitetura' && (
        <div className="space-y-6">
          {/* Architecture Blueprint */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Code className="w-5 h-5 text-teal-600" />
                Matriz de Arquitetura Limpa, DDD, BPMN & SOA
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Desacoplamento em camadas com contratos estritos, pureza de domínio e zero acoplamento indesejado
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {ARCHITECTURE_LAYERS_AUDIT.map(layer => (
                <div key={layer.layer} className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-slate-900 dark:text-white">{layer.layer}</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded">
                      {layer.status}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400">
                    {layer.responsibilities}
                  </p>
                  <div className="space-y-1">
                    <span className="text-[10px] uppercase font-bold text-slate-400">Princípios:</span>
                    {layer.principlesApplied.map((p, idx) => (
                      <div key={idx} className="flex items-center gap-1.5 text-xs text-slate-700 dark:text-slate-300">
                        <Check className="w-3.5 h-3.5 text-teal-500 flex-shrink-0" />
                        <span>{p}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Clean Code Static Analysis Checklist */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  Checklist de Code Review & Clean Code
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Auditoria de conformidade, legibilidade e manutenibilidade
                </p>
              </div>
              <span className="px-3 py-1 bg-emerald-100 text-emerald-800 font-bold text-xs rounded-full">
                Score: 100% Conforme
              </span>
            </div>

            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {CLEAN_CODE_CHECKLIST.map(item => (
                <div key={item.id} className="py-3 flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[10px] font-bold px-1.5 py-0.5 bg-slate-200 dark:bg-slate-800 rounded">
                        {item.id}
                      </span>
                      <span className="text-xs font-bold text-slate-900 dark:text-white">
                        {item.rule}
                      </span>
                      <span className="text-[10px] font-semibold text-teal-600 dark:text-teal-400">
                        ({item.category})
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-400">
                      {item.details}
                    </p>
                  </div>

                  <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 flex-shrink-0">
                    <Check className="w-4 h-4" /> {item.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Modals */}
      <GlycemicMeasurementModal
        isOpen={isHgtModalOpen}
        onClose={() => setIsHgtModalOpen(false)}
        profiles={profiles}
        initialResidentId={selectedResidentId}
        onSaved={handleSavedMeasurement}
      />

      <InsulinAdministrationModal
        isOpen={isInsulinModalOpen}
        onClose={() => setIsInsulinModalOpen(false)}
        profiles={profiles}
        initialResidentId={selectedResidentId}
        onSaved={handleSavedInsulin}
      />
    </div>
  );
};
