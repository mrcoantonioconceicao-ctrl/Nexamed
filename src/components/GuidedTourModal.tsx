import React, { useState } from 'react';
import { 
  Compass, 
  X, 
  ChevronRight, 
  ChevronLeft, 
  CheckCircle2, 
  Activity, 
  Target, 
  FileText, 
  Pill, 
  Users, 
  BarChart3, 
  Sparkles, 
  ArrowRight,
  ShieldCheck,
  Zap
} from 'lucide-react';

interface GuidedTourModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (path: string) => void;
}

interface TourStep {
  id: string;
  stepNumber: number;
  title: string;
  badge: string;
  path: string;
  icon: React.ElementType;
  description: string;
  highlights: string[];
  recommendedAction: string;
}

const TOUR_STEPS: TourStep[] = [
  {
    id: 'dashboard',
    stepNumber: 1,
    title: 'Dashboard Operacional da Residência',
    badge: 'Visão Geral & Indicadores',
    path: '/dashboard',
    icon: Activity,
    description: 'O centro de controle unificado da Residência Terapêutica. Aqui você acompanha em tempo real o clima comportamental, indicadores do turno, central de alertas de emergência e atalhos de ação rápida.',
    highlights: [
      'Indicadores do Turno: Atendimentos, pendências e alertas ativos.',
      'Central de Alertas Sonoros e Push em tempo real.',
      'Acesso direto aos atalhos de evolução, medicação e troca de plantão.'
    ],
    recommendedAction: 'Ir para o Dashboard Operacional',
  },
  {
    id: 'daily-huddle',
    stepNumber: 2,
    title: 'Daily Huddle Clínico & Briefings',
    badge: 'Alinhamento em 5 Minutos',
    path: '/daily-huddle',
    icon: Target,
    description: 'Espaço dedicado ao alinhamento rápido da equipe no início de cada turno. Permite à liderança atribuir focos prioritários de cuidado, checar briefings de emergência e inscrever a equipe em treinamentos.',
    highlights: [
      'Modo Express 5m: Apresentador interativo com cronômetro regressivo para o huddle.',
      'Atribuição de Tópicos de Foco da Liderança por turno (Manhã, Tarde e Noturno).',
      'Briefings automáticos do NEWS2, alergias MAR e agenda de capacitações.'
    ],
    recommendedAction: 'Explorar o Daily Huddle Clínico',
  },
  {
    id: 'prontuarios',
    stepNumber: 3,
    title: 'Prontuário & Evolução Clínico-Comportamental',
    badge: 'Registro Clínico SOAP',
    path: '/prontuarios',
    icon: FileText,
    description: 'Registro ágil de evoluções de enfermagem, psicologia e cuidadores utilizando a estrutura SOAP (Subjetivo, Objetivo, Avaliação, Plano) com auxílio inteligente da Assistente Nexa.',
    highlights: [
      'Sugestões automáticas baseadas nos últimos atendimentos do morador.',
      'Categorização por sinais vitais, alimentação, higiene e intercorrências.',
      'Sincronização imediata com o histórico de vida do residente.'
    ],
    recommendedAction: 'Ver Prontuários e Evoluções',
  },
  {
    id: 'medicacao',
    stepNumber: 4,
    title: 'Aprazamento MAR & Administração de Medicamentos',
    badge: 'Checagem Segura e Alergias',
    path: '/evolucao-medicacao',
    icon: Pill,
    description: 'Módulo de checagem unificada de medicação assistida e psicotrópicos. Garante a administração correta nos horários aprazados e previne erros de dosagem ou reações alérgicas.',
    highlights: [
      'Visão por morador dos horários aprazados (12/12h, 8/8h, etc.).',
      'Validação de alergias alimentares e medicação de alta vigilância.',
      'Impressão de rótulos com código de barras e relatórios MAR.'
    ],
    recommendedAction: 'Acessar Aprazamento MAR',
  },
  {
    id: 'residentes',
    stepNumber: 5,
    title: 'Gestão de Moradores e Plano Terapêutico Singular (PTS)',
    badge: 'Cadastro Persistente & 360°',
    path: '/residentes',
    icon: Users,
    description: 'Cadastro detalhado e dados contínuos de todos os moradores. Armazena o histórico de vida, contatos de emergência, preferências individuais e o Plano Terapêutico Singular (PTS).',
    highlights: [
      'Persistência contínua: Os novos moradores cadastrados permanecem gravados no sistema.',
      'Visão 360° com prontuário integrado, rede de apoio e linha do tempo.',
      'Geração e atualização do Plano Terapêutico Singular (PTS).'
    ],
    recommendedAction: 'Gerenciar Moradores e PTS',
  },
  {
    id: 'relatorios',
    stepNumber: 6,
    title: 'Relatórios Gerenciais, Logs e Conformidade LGPD',
    badge: 'Auditoria & Indicadores SRT',
    path: '/relatorios',
    icon: BarChart3,
    description: 'Painel analítico para a gestão e fiscalização da Residência Terapêutica. Oferece relatórios de ocorrências, logs imutáveis de auditoria e ferramentas de privacidade LGPD.',
    highlights: [
      'Relatórios executivos prontos para impressão e auditoria sanitária.',
      'Logs imutáveis de acessos, edições e visualizações com IP e usuário.',
      'Gestão de privacidade do titular, exportação de dados e conformidade LGPD.'
    ],
    recommendedAction: 'Ver Relatórios e Audit Logs',
  },
];

export const GuidedTourModal: React.FC<GuidedTourModalProps> = ({
  isOpen,
  onClose,
  onNavigate,
}) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  if (!isOpen) return null;

  const currentStep = TOUR_STEPS[currentStepIndex];
  const StepIcon = currentStep.icon;
  const isFirstStep = currentStepIndex === 0;
  const isLastStep = currentStepIndex === TOUR_STEPS.length - 1;

  const handleNext = () => {
    if (isLastStep) {
      localStorage.setItem('nexamed_tour_completed', 'true');
      onClose();
    } else {
      setCurrentStepIndex(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    if (!isFirstStep) {
      setCurrentStepIndex(prev => prev - 1);
    }
  };

  const handleJumpToModule = () => {
    onNavigate(currentStep.path);
  };

  return (
    <div className="fixed inset-0 bg-zinc-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-2xl w-full border border-zinc-200/90 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 flex flex-col max-h-[90vh]">
        
        {/* Top Header */}
        <div className="p-5 bg-gradient-to-r from-teal-900 via-teal-950 to-slate-900 text-white flex items-center justify-between shrink-0 relative overflow-hidden">
          <div className="absolute top-0 right-0 -mr-12 -mt-12 w-48 h-48 bg-teal-500/10 rounded-full blur-2xl pointer-events-none" />
          
          <div className="flex items-center gap-3 relative z-10">
            <div className="w-10 h-10 rounded-2xl bg-teal-500/20 border border-teal-400/30 flex items-center justify-center shrink-0">
              <Compass className="w-5 h-5 text-teal-300 animate-spin-slow" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-extrabold uppercase tracking-wider bg-teal-800/80 text-teal-200 px-2 py-0.5 rounded border border-teal-600/50">
                  Tour Guiado NexaMed
                </span>
                <span className="text-xs text-teal-300 font-bold">
                  Passo {currentStep.stepNumber} de {TOUR_STEPS.length}
                </span>
              </div>
              <h2 className="text-lg font-black text-white tracking-tight">
                Conheça os Módulos da Plataforma
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-teal-300 hover:text-white hover:bg-teal-800/50 rounded-xl transition-colors relative z-10"
            title="Fechar Tour"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-zinc-100 h-1.5 shrink-0">
          <div 
            className="bg-gradient-to-r from-teal-500 to-emerald-500 h-full transition-all duration-300"
            style={{ width: `${((currentStepIndex + 1) / TOUR_STEPS.length) * 100}%` }}
          />
        </div>

        {/* Body Content */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          {/* Step Badge and Title */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 bg-teal-100 text-teal-800 font-extrabold text-[11px] rounded-lg border border-teal-200 uppercase tracking-wide">
                {currentStep.badge}
              </span>
              <span className="text-xs text-zinc-400 font-medium">
                • Atalho: <code className="text-zinc-700 font-bold bg-zinc-100 px-1.5 py-0.5 rounded border border-zinc-200">{currentStep.path}</code>
              </span>
            </div>

            <div className="flex items-center gap-3">
              <div className="p-3 bg-teal-50 text-teal-700 rounded-2xl border border-teal-200 shrink-0">
                <StepIcon className="w-6 h-6 text-teal-600" />
              </div>
              <h3 className="text-xl font-black text-zinc-900 leading-snug">
                {currentStep.title}
              </h3>
            </div>

            <p className="text-xs md:text-sm text-zinc-600 leading-relaxed font-medium pt-1">
              {currentStep.description}
            </p>
          </div>

          {/* Highlights Box */}
          <div className="p-4 bg-zinc-50 rounded-2xl border border-zinc-200/80 space-y-2.5">
            <h4 className="text-xs font-black text-zinc-900 flex items-center gap-1.5 uppercase tracking-wider text-teal-800">
              <Sparkles className="w-3.5 h-3.5 text-teal-600" />
              Principais Recursos Deste Módulo:
            </h4>
            <ul className="space-y-2">
              {currentStep.highlights.map((item, idx) => (
                <li key={idx} className="flex items-start gap-2 text-xs text-zinc-700 font-medium">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Quick Action Button inside Step */}
          <div className="p-3 bg-teal-50/60 rounded-2xl border border-teal-200/80 flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs text-teal-900 font-bold">
              <Zap className="w-4 h-4 text-teal-600" />
              <span>Deseja testar este módulo agora?</span>
            </div>
            <button
              onClick={handleJumpToModule}
              className="px-3.5 py-1.5 bg-teal-600 hover:bg-teal-700 text-white font-extrabold text-xs rounded-xl shadow-2xs transition-colors flex items-center gap-1.5"
            >
              <span>{currentStep.recommendedAction}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Footer Navigation */}
        <div className="p-4 bg-zinc-50 border-t border-zinc-200/80 flex items-center justify-between shrink-0">
          {/* Step Dots */}
          <div className="flex items-center gap-1.5">
            {TOUR_STEPS.map((step, idx) => (
              <button
                key={step.id}
                onClick={() => setCurrentStepIndex(idx)}
                className={`w-2.5 h-2.5 rounded-full transition-all ${
                  idx === currentStepIndex
                    ? 'w-7 bg-teal-600'
                    : 'bg-zinc-300 hover:bg-zinc-400'
                }`}
                title={`Ir para o Passo ${idx + 1}`}
              />
            ))}
          </div>

          {/* Buttons */}
          <div className="flex items-center gap-2">
            {!isFirstStep && (
              <button
                onClick={handlePrev}
                className="px-3.5 py-2 bg-white hover:bg-zinc-100 text-zinc-700 font-bold text-xs rounded-xl border border-zinc-300 transition-colors flex items-center gap-1"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Anterior</span>
              </button>
            )}

            <button
              onClick={handleNext}
              className="px-5 py-2 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white font-extrabold text-xs rounded-xl shadow-xs transition-all flex items-center gap-1.5"
            >
              <span>{isLastStep ? 'Concluir Tour' : 'Próximo Passo'}</span>
              {!isLastStep && <ChevronRight className="w-4 h-4" />}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
