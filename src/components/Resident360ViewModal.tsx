import React, { useState } from 'react';
import { 
  Resident, 
  Timeline360Event, 
  ClinicalEvolution, 
  MedicationMAR,
  News2Score,
  AIPrediction
} from '../types';
import { 
  X, 
  Activity, 
  Clock, 
  AlertTriangle, 
  FileText, 
  Brain, 
  ShieldCheck, 
  Heart, 
  User, 
  Calendar, 
  Pill, 
  FlaskConical, 
  Users, 
  TrendingUp, 
  CheckCircle2, 
  Sparkles,
  Phone,
  FileSpreadsheet
} from 'lucide-react';

interface Resident360ViewModalProps {
  resident: Resident | null;
  timelineEvents: Timeline360Event[];
  evolutions: ClinicalEvolution[];
  medications: MedicationMAR[];
  onClose: () => void;
  onOpenSOAP: (residentId: string) => void;
  onTriggerAlert?: (residentId: string, type: string) => void;
}

export const Resident360ViewModal: React.FC<Resident360ViewModalProps> = ({
  resident,
  timelineEvents,
  evolutions,
  medications,
  onClose,
  onOpenSOAP,
  onTriggerAlert
}) => {
  const [activeTab, setActiveTab] = useState<'timeline' | 'news2' | 'ai_predict' | 'pts' | 'meds'>('timeline');

  if (!resident) return null;

  const residentEvents = timelineEvents.filter(e => e.residentId === resident.id);
  const residentEvolutions = evolutions.filter(e => e.residentId === resident.id);
  const residentMeds = medications.filter(m => m.residentId === resident.id);

  const getNews2BadgeColor = (level?: string) => {
    switch (level) {
      case 'Crítico': return 'bg-red-100 text-red-800 border-red-300 dark:bg-red-950/50 dark:text-red-300';
      case 'Alto': return 'bg-orange-100 text-orange-800 border-orange-300 dark:bg-orange-950/50 dark:text-orange-300';
      case 'Moderado': return 'bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950/50 dark:text-amber-300';
      default: return 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950/50 dark:text-emerald-300';
    }
  };

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'Evolução SOAP': return <FileText className="w-4 h-4 text-blue-600 dark:text-blue-400" />;
      case 'Intercorrência': return <AlertTriangle className="w-4 h-4 text-red-600 dark:text-red-400" />;
      case 'Exame Laboratorial': return <FlaskConical className="w-4 h-4 text-purple-600 dark:text-purple-400" />;
      case 'Medicação MAR': return <Pill className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />;
      case 'Visita Familiar': return <Users className="w-4 h-4 text-amber-600 dark:text-amber-400" />;
      default: return <Clock className="w-4 h-4 text-slate-500" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-3 sm:p-6 overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 w-full max-w-5xl rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header do Prontuário 360 */}
        <div className="p-5 bg-gradient-to-r from-slate-900 via-teal-950 to-slate-900 text-white flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-teal-800/40">
          <div className="flex items-center gap-4">
            <img 
              src={resident.photo} 
              alt={resident.name}
              className="w-16 h-16 rounded-full object-cover border-2 border-teal-400/50 shadow-md"
            />
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-white">{resident.name}</h2>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-teal-500/20 text-teal-300 border border-teal-400/30 font-medium">
                  Visão Holística 360°
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-1 flex items-center gap-3">
                <span><strong>Idade:</strong> {resident.age} anos</span>
                <span>•</span>
                <span><strong>Quarto:</strong> {resident.room}</span>
                <span>•</span>
                <span><strong>Dependência:</strong> {resident.dependenceLevel}</span>
              </p>
              <p className="text-xs text-teal-200/80 mt-0.5 font-medium">
                Dx Principal: {resident.primaryDiagnosis}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end md:self-auto">
            <button
              onClick={() => onOpenSOAP(resident.id)}
              className="px-3.5 py-2 text-xs font-semibold rounded-lg bg-teal-500 hover:bg-teal-600 text-slate-950 flex items-center gap-1.5 shadow-sm transition-all"
            >
              <FileText className="w-4 h-4" />
              + Nova Evolução SOAP
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
              title="Fechar Prontuário 360°"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Resumo Rápido de Sinais Vitais & Risco */}
        <div className="px-6 py-3 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
          <div className="p-2.5 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 flex items-center gap-3">
            <div className="p-2 bg-red-100 dark:bg-red-950/50 rounded-md text-red-600 dark:text-red-400">
              <Activity className="w-4 h-4" />
            </div>
            <div>
              <span className="text-slate-500 text-[11px] block">NEWS2 Score</span>
              <span className={`font-semibold px-1.5 py-0.2 rounded text-[11px] border ${getNews2BadgeColor(resident.news2?.riskLevel)}`}>
                {resident.news2?.totalScore ?? 'N/A'} - {resident.news2?.riskLevel ?? resident.riskScore}
              </span>
            </div>
          </div>

          <div className="p-2.5 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 flex items-center gap-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-950/50 rounded-md text-blue-600 dark:text-blue-400">
              <Brain className="w-4 h-4" />
            </div>
            <div>
              <span className="text-slate-500 text-[11px] block">IA Preditiva</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200">
                {resident.aiPredictions?.[0] ? `${resident.aiPredictions[0].riskPercentage}% Risco ${resident.aiPredictions[0].type}` : 'Estável'}
              </span>
            </div>
          </div>

          <div className="p-2.5 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 flex items-center gap-3">
            <div className="p-2 bg-amber-100 dark:bg-amber-950/50 rounded-md text-amber-600 dark:text-amber-400">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <div>
              <span className="text-slate-500 text-[11px] block">Alergias</span>
              <span className="font-semibold text-red-600 dark:text-red-400">
                {resident.allergies.length > 0 ? resident.allergies.join(', ') : 'Sem alergias relatadas'}
              </span>
            </div>
          </div>

          <div className="p-2.5 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 flex items-center gap-3">
            <div className="p-2 bg-teal-100 dark:bg-teal-950/50 rounded-md text-teal-600 dark:text-teal-400">
              <Phone className="w-4 h-4" />
            </div>
            <div>
              <span className="text-slate-500 text-[11px] block">Contato Familiar</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200 truncate block max-w-[130px]" title={resident.emergencyContact.name}>
                {resident.emergencyContact.name}
              </span>
            </div>
          </div>
        </div>

        {/* Navegação de Abas Internas */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 px-6 bg-white dark:bg-slate-900 overflow-x-auto text-xs font-medium">
          <button
            onClick={() => setActiveTab('timeline')}
            className={`py-3 px-4 flex items-center gap-2 border-b-2 font-semibold transition-colors whitespace-nowrap ${
              activeTab === 'timeline' 
                ? 'border-teal-600 text-teal-700 dark:border-teal-400 dark:text-teal-400' 
                : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <Clock className="w-4 h-4" />
            Timeline 360° Unificada
          </button>

          <button
            onClick={() => setActiveTab('news2')}
            className={`py-3 px-4 flex items-center gap-2 border-b-2 font-semibold transition-colors whitespace-nowrap ${
              activeTab === 'news2' 
                ? 'border-teal-600 text-teal-700 dark:border-teal-400 dark:text-teal-400' 
                : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <Activity className="w-4 h-4" />
            Motor de Risco NEWS2
          </button>

          <button
            onClick={() => setActiveTab('ai_predict')}
            className={`py-3 px-4 flex items-center gap-2 border-b-2 font-semibold transition-colors whitespace-nowrap ${
              activeTab === 'ai_predict' 
                ? 'border-teal-600 text-teal-700 dark:border-teal-400 dark:text-teal-400' 
                : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <Sparkles className="w-4 h-4 text-amber-500" />
            IA Preditiva & Explicabilidade
          </button>

          <button
            onClick={() => setActiveTab('pts')}
            className={`py-3 px-4 flex items-center gap-2 border-b-2 font-semibold transition-colors whitespace-nowrap ${
              activeTab === 'pts' 
                ? 'border-teal-600 text-teal-700 dark:border-teal-400 dark:text-teal-400' 
                : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            PTS (Plano Terapêutico)
          </button>

          <button
            onClick={() => setActiveTab('meds')}
            className={`py-3 px-4 flex items-center gap-2 border-b-2 font-semibold transition-colors whitespace-nowrap ${
              activeTab === 'meds' 
                ? 'border-teal-600 text-teal-700 dark:border-teal-400 dark:text-teal-400' 
                : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <Pill className="w-4 h-4" />
            Aprazamento MAR ({residentMeds.length})
          </button>
        </div>

        {/* Conteúdo Principal das Abas */}
        <div className="p-6 overflow-y-auto flex-1 bg-slate-50/50 dark:bg-slate-900/50 text-sm">
          
          {/* ABA 1: TIMELINE 360 UNIFICADA */}
          {activeTab === 'timeline' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-teal-600" />
                  Eventos Multidisciplinares em Ordem Cronológica
                </h3>
                <span className="text-xs text-slate-500">
                  {residentEvents.length} eventos registrados
                </span>
              </div>

              {residentEvents.length === 0 ? (
                <div className="p-8 text-center text-slate-500 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-800">
                  Nenhum evento registrado na timeline recente deste residente.
                </div>
              ) : (
                <div className="relative border-l-2 border-teal-200 dark:border-teal-900/60 ml-4 space-y-6 py-2">
                  {residentEvents.map((event) => (
                    <div key={event.id} className="relative ml-6">
                      <span className="absolute -left-[31px] top-1 p-1.5 rounded-full bg-white dark:bg-slate-900 border-2 border-teal-500 shadow-sm">
                        {getEventIcon(event.type)}
                      </span>
                      <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                            {event.type}
                          </span>
                          <span className="text-xs text-slate-400 font-medium">
                            {event.timestamp}
                          </span>
                        </div>
                        <h4 className="font-bold text-slate-900 dark:text-slate-100 text-sm mt-1">
                          {event.title}
                        </h4>
                        <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                          {event.description}
                        </p>
                        <div className="mt-3 pt-2 border-t border-slate-100 dark:border-slate-700/50 flex items-center justify-between text-[11px] text-slate-500">
                          <span>
                            <strong>Profissional:</strong> {event.authorName} ({event.authorRole})
                          </span>
                          {event.severity && (
                            <span className={`px-2 py-0.5 rounded font-medium ${
                              event.severity === 'Crítico' ? 'bg-red-100 text-red-700' :
                              event.severity === 'Urgente' ? 'bg-amber-100 text-amber-700' :
                              'bg-emerald-100 text-emerald-700'
                            }`}>
                              {event.severity}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ABA 2: MOTOR DE RISCO NEWS2 */}
          {activeTab === 'news2' && (
            <div className="space-y-6">
              <div className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base flex items-center gap-2">
                      <Activity className="w-5 h-5 text-red-500" />
                      Avaliação do National Early Warning Score 2 (NEWS2)
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Diretriz internacional padronizada para identificação precoce de deterioração clínica em ambiente de saúde.
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-2xl font-black text-slate-900 dark:text-slate-100">
                      {resident.news2?.totalScore ?? 0}
                    </span>
                    <span className="text-xs text-slate-400 block">Pontuação Total (0-20)</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                  <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800">
                    <span className="text-slate-500 block">Freq. Respiratória</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">
                      Score: {resident.news2?.respiratoryRateScore ?? 0}
                    </span>
                  </div>
                  <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800">
                    <span className="text-slate-500 block">Saturação O2</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">
                      Score: {resident.news2?.oxygenSatScore ?? 0}
                    </span>
                  </div>
                  <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800">
                    <span className="text-slate-500 block">Pressão Arterial Sistólica</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">
                      Score: {resident.news2?.systolicBPScore ?? 0}
                    </span>
                  </div>
                  <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800">
                    <span className="text-slate-500 block">Frequência Cardíaca</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">
                      Score: {resident.news2?.heartRateScore ?? 0}
                    </span>
                  </div>
                </div>

                <div className="mt-4 p-4 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50 flex items-start gap-3">
                  <ShieldCheck className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                  <div className="text-xs text-amber-900 dark:text-amber-200">
                    <strong>Recomendação Clínica Automática:</strong> {
                      (resident.news2?.totalScore ?? 0) >= 7 ? 'Monitoramento contínuo de sinais vitais de 1 em 1h. Necessário contato médico imediato para reavaliação de conduta.' :
                      (resident.news2?.totalScore ?? 0) >= 5 ? 'Aumento na frequência de aferições para 4/4h e revisão da prescrição de medicação.' :
                      'Aferição rotineira no início de cada plantão.'
                    }
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ABA 3: IA PREDITIVA E EXPLICABILIDADE */}
          {activeTab === 'ai_predict' && (
            <div className="space-y-4">
              <div className="bg-gradient-to-r from-teal-900 to-slate-900 p-5 rounded-xl text-white shadow-md">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="w-5 h-5 text-amber-400" />
                  <h3 className="font-bold text-base">Motor Preditivo NexaMed AI v2.0</h3>
                </div>
                <p className="text-xs text-slate-300">
                  Modelos de inteligência clínica explicável (*Explainable AI*) baseados em inferência em tempo real sobre evolução clínica, MAR e telemetria.
                </p>
              </div>

              {(!resident.aiPredictions || resident.aiPredictions.length === 0) ? (
                <div className="p-6 text-center text-slate-500 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-800">
                  Nenhum alerta preditivo de alto risco detectado. Residente em estado de equilíbrio.
                </div>
              ) : (
                <div className="space-y-4">
                  {resident.aiPredictions.map((pred) => (
                    <div key={pred.id} className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900 dark:text-slate-100 text-sm">
                            Risco Preditivo: {pred.type}
                          </span>
                          <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                            pred.riskPercentage > 70 ? 'bg-red-100 text-red-800 border border-red-300' :
                            pred.riskPercentage > 40 ? 'bg-amber-100 text-amber-800 border border-amber-300' :
                            'bg-emerald-100 text-emerald-800 border border-emerald-300'
                          }`}>
                            {pred.riskPercentage}% Probabilidade
                          </span>
                        </div>
                        <span className="text-xs text-slate-400">
                          Confiança do Modelo: <strong>{pred.confidenceLevel}</strong>
                        </span>
                      </div>

                      <div className="p-3 bg-slate-50 dark:bg-slate-900/60 rounded-lg text-xs space-y-1">
                        <span className="font-semibold text-slate-700 dark:text-slate-300 block">
                          Variáveis-Chave de Explicabilidade (Explainable AI):
                        </span>
                        <ul className="list-disc list-inside text-slate-600 dark:text-slate-400 space-y-0.5 pl-1">
                          {(pred.keyVariables || []).map((v, idx) => (
                            <li key={idx}>{v}</li>
                          ))}
                        </ul>
                      </div>

                      <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                        <strong>Análise do Algoritmo:</strong> {pred.explanation}
                      </p>

                      <div className="p-3 bg-teal-50 dark:bg-teal-950/40 rounded-lg border border-teal-200 dark:border-teal-900/50 text-xs text-teal-900 dark:text-teal-200 font-medium">
                        <strong>Conduta Sugerida (Chancela Humana Obrigatória):</strong> {pred.suggestedAction}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ABA 4: PTS */}
          {activeTab === 'pts' && (
            <div className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700 pb-3">
                <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-teal-600" />
                  Plano Terapêutico Singular (PTS)
                </h3>
                <span className="text-xs text-slate-500">
                  Próxima Revisão: <strong>{resident.singularTherapeuticPlan?.reviewDate || 'A definir'}</strong>
                </span>
              </div>

              <div>
                <span className="text-xs text-slate-500 block mb-1 font-semibold">Foco Terapêutico Principal:</span>
                <p className="text-xs text-slate-800 dark:text-slate-200 bg-slate-50 dark:bg-slate-900 p-3 rounded-lg border border-slate-200 dark:border-slate-800">
                  {resident.singularTherapeuticPlan?.mainFocus || 'Manutenção da autonomia e acompanhamento multidisciplinar contínuo.'}
                </p>
              </div>

              <div>
                <span className="text-xs text-slate-500 block mb-2 font-semibold">Objetivos Pactuados pela Equipe Multidisciplinar:</span>
                <div className="space-y-2">
                  {(resident.singularTherapeuticPlan?.goals || [
                    'Manter estavel quadro clinico e nutricional',
                    'Acompanhamento e aprazamento medicamentoso rigoroso',
                    'Estimulo cognitivo e participacao em grupos de apoio'
                  ]).map((goal: string, idx: number) => (
                    <div key={idx} className="flex items-start gap-2.5 text-xs text-slate-700 dark:text-slate-300">
                      <CheckCircle2 className="w-4 h-4 text-teal-500 shrink-0 mt-0.5" />
                      <span>{goal}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-2">
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-slate-500 font-medium">Progresso de Cumprimento das Metas</span>
                  <span className="font-bold text-teal-600">{resident.singularTherapeuticPlan?.progressPercentage || 75}%</span>
                </div>
                <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                  <div 
                    className="bg-teal-500 h-full rounded-full transition-all duration-500"
                    style={{ width: `${resident.singularTherapeuticPlan?.progressPercentage || 75}%` }}
                  />
                </div>
              </div>
            </div>
          )}

          {/* ABA 5: MEDS MAR */}
          {activeTab === 'meds' && (
            <div className="space-y-3">
              <h3 className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2 text-xs">
                <Pill className="w-4 h-4 text-emerald-600" />
                Quadro de Aprazamento Medicamentoso Ativo (MAR)
              </h3>

              {residentMeds.length === 0 ? (
                <div className="p-6 text-center text-slate-500 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-800">
                  Nenhuma medicação ativada para este residente.
                </div>
              ) : (
                <div className="space-y-3">
                  {residentMeds.map((med) => (
                    <div key={med.id} className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900 dark:text-slate-100 text-sm">
                            {med.medicationName} ({med.dosage})
                          </span>
                          {med.isControlled && (
                            <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 text-[10px] font-bold">
                              Psicotrópico (Portaria 344)
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-500 mt-1">
                          Via: <strong>{med.route}</strong> | Frequência: <strong>{med.frequency}</strong> | Prescritor: <strong>{med.prescribedBy}</strong>
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        {(med.scheduledDoses || []).map((dose) => (
                          <span 
                            key={dose.id}
                            className={`px-2.5 py-1 rounded-md text-xs font-semibold border ${
                              dose.status === 'Ministrado' ? 'bg-emerald-100 text-emerald-800 border-emerald-300' :
                              dose.status === 'Pendente' ? 'bg-amber-100 text-amber-800 border-amber-300' :
                              'bg-red-100 text-red-800 border-red-300'
                            }`}
                          >
                            {dose.time} ({dose.status})
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

        </div>

        {/* Rodapé de Ações do Modal */}
        <div className="p-4 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-slate-500">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span>Prontuário em conformidade com LGPD & CFM nº 1.821/2007</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onOpenSOAP(resident.id)}
              className="px-4 py-2 font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors flex items-center gap-1.5"
            >
              <FileText className="w-4 h-4 text-blue-500" />
              Evoluir SOAP
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-lg transition-colors shadow-sm"
            >
              Concluído / Fechar
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
