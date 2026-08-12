import React, { useState, useMemo, useRef, useEffect } from 'react';
import { 
  GraduationCap, 
  Sparkles, 
  PlayCircle, 
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  BookOpen, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Award, 
  UserCheck, 
  Search, 
  Filter, 
  Plus, 
  RotateCcw, 
  ShieldAlert, 
  ArrowRight, 
  Lightbulb, 
  Bot, 
  Send,
  Zap,
  TrendingUp,
  Brain,
  HelpCircle,
  FileText,
  ListVideo,
  Check,
  Share2,
  Bookmark,
  ShieldCheck,
  ChevronRight,
  Youtube,
  ExternalLink
} from 'lucide-react';
import { 
  MicroLearningModule, 
  StaffMicroLearningProfile, 
  Resident, 
  ClinicalEvolution, 
  MedicationMAR, 
  ClinicalAlert 
} from '../types';
import { INITIAL_MICRO_LEARNING_MODULES, INITIAL_STAFF_MICRO_PROFILES } from '../data/mockData';
import { MicroLearningPlayerModal } from '../components/MicroLearningPlayerModal';

interface MicroLearningViewProps {
  residents?: Resident[];
  evolutions?: ClinicalEvolution[];
  medications?: MedicationMAR[];
  alerts?: ClinicalAlert[];
}

interface VideoChapter {
  time: string;
  seconds: number;
  title: string;
  description: string;
}

export const MicroLearningView: React.FC<MicroLearningViewProps> = ({
  residents = [],
  evolutions = [],
  medications = [],
  alerts = []
}) => {
  // 1. All hooks must be declared at the top
  const [staffProfiles, setStaffProfiles] = useState<StaffMicroLearningProfile[]>(INITIAL_STAFF_MICRO_PROFILES);
  const [selectedStaffId, setSelectedStaffId] = useState<string>('usr-1');
  const [modules, setModules] = useState<MicroLearningModule[]>(INITIAL_MICRO_LEARNING_MODULES);
  
  // Embedded Featured Video Player State
  const videoRef = useRef<HTMLVideoElement>(null);
  const [featuredModule, setFeaturedModule] = useState<MicroLearningModule>(INITIAL_MICRO_LEARNING_MODULES[0]);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);
  const [playerTab, setPlayerTab] = useState<'summary' | 'chapters' | 'pop'>('summary');
  const [isGeneratingSummary, setIsGeneratingSummary] = useState<boolean>(false);
  const [customAiSummary, setCustomAiSummary] = useState<string | null>(null);

  // Filters & Search
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  // Modal State for Full Assessment
  const [activeModalModule, setActiveModalModule] = useState<MicroLearningModule | null>(null);
  const [isPlayerOpen, setIsPlayerOpen] = useState<boolean>(false);
  
  // AI Assistant Custom Guide Query
  const [aiQuery, setAiQuery] = useState<string>('');
  const [aiResponseGuide, setAiResponseGuide] = useState<MicroLearningModule | null>(null);
  const [isGeneratingAi, setIsGeneratingAi] = useState<boolean>(false);

  // YouTube Import State
  const [youtubeUrlInput, setYoutubeUrlInput] = useState<string>('');
  const [isImportingYoutube, setIsImportingYoutube] = useState<boolean>(false);

  // Derived selected profile
  const selectedProfile = useMemo(() => {
    return staffProfiles.find(p => p.staffId === selectedStaffId) || staffProfiles[0];
  }, [staffProfiles, selectedStaffId]);

  // Filtered modules
  const filteredModules = useMemo(() => {
    return modules.filter(m => {
      const matchesStaff = selectedStaffId === 'all' || m.staffName === selectedProfile?.staffName || !m.staffName;
      const matchesCategory = selectedCategory === 'all' || 
        (selectedCategory === 'video' && m.type === 'video') ||
        (selectedCategory === 'guide' && m.type === 'guide') ||
        (selectedCategory === 'pending' && m.status === 'Pendente') ||
        (selectedCategory === 'completed' && m.status === 'Concluído');
      const matchesSearch = m.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.category.toLowerCase().includes(searchQuery.toLowerCase());

      return matchesStaff && matchesCategory && matchesSearch;
    });
  }, [modules, selectedStaffId, selectedProfile, selectedCategory, searchQuery]);

  // Generate chapters for current video module
  const currentChapters: VideoChapter[] = useMemo(() => {
    if (featuredModule.id === 'ml-101') {
      return [
        { time: '0:00', seconds: 0, title: 'Introdução e Regra dos 5 Certos', description: 'Conceitos de prevenção de erros no MAR e conferência de pulseira do morador.' },
        { time: '0:45', seconds: 45, title: 'Dupla Checagem na Dosagem de Insulina', description: 'Técnica de aspiração e conferência dos frascos de NPH e Glargina.' },
        { time: '1:50', seconds: 110, title: 'Registro em Tempo Real no App NexaMed', description: 'Procedimento para salvar o horário e lançar justificativa em caso de atraso.' },
      ];
    } else if (featuredModule.id === 'ml-103') {
      return [
        { time: '0:00', seconds: 0, title: 'Acolhimento Empático e Abordagem Inicial', description: 'Validação emocional sem confronto da realidade alterada do residente.' },
        { time: '1:20', seconds: 80, title: 'Ajuste de Iluminação e Estímulos do Quarto', description: 'Como preparar o ambiente noturno reduzindo o cortisol e ansiedade.' },
        { time: '3:10', seconds: 190, title: 'Desescalada Verbal e Registro da Conduta', description: 'Passo a passo da notificação em relatório de intercorrência.' },
      ];
    } else if (featuredModule.id === 'ml-104') {
      return [
        { time: '0:00', seconds: 0, title: 'Inspeção de Pele na Região Sacra', description: 'Identificação de eritema de Grau I e teste de vitropressão.' },
        { time: '1:10', seconds: 70, title: 'Técnica de Mudança de Decúbito 2h/2h', description: 'Posicionamento correto de coxins e travesseiros em proeminências ósseas.' },
        { time: '2:40', seconds: 160, title: 'Aplicação de Hidratante Dérnico / AGE', description: 'Cuidado preventivo contra cisalhamento e atrito com o colchão.' },
      ];
    } else {
      return [
        { time: '0:00', seconds: 0, title: 'Introdução ao Protocolo Clínico', description: 'Contexto e alinhamento do treinamento com as normas da Anvisa.' },
        { time: '1:00', seconds: 60, title: 'Execução Prática do Procedimento', description: 'Passo a passo guiado para aplicação no dia a dia do residencial.' },
        { time: '2:15', seconds: 135, title: 'Validação e Notificação no Sistema', description: 'Como registrar os achados e fechar o ciclo de cuidado.' },
      ];
    }
  }, [featuredModule]);

  // Video Controls Handlers
  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play();
      setIsPlaying(true);
    }
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    videoRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const handleSpeedChange = (speed: number) => {
    setPlaybackSpeed(speed);
    if (videoRef.current) {
      videoRef.current.playbackRate = speed;
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
      setDuration(videoRef.current.duration || 0);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    setCurrentTime(time);
    if (videoRef.current) {
      videoRef.current.currentTime = time;
    }
  };

  const handleJumpToTime = (seconds: number) => {
    setCurrentTime(seconds);
    if (videoRef.current) {
      videoRef.current.currentTime = seconds;
      videoRef.current.play();
      setIsPlaying(true);
    }
  };

  const handleFullscreen = () => {
    if (videoRef.current) {
      if (videoRef.current.requestFullscreen) {
        videoRef.current.requestFullscreen();
      }
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  // Generate AI Summary for current featured module
  const handleGenerateFreshAiSummary = () => {
    setIsGeneratingSummary(true);
    setTimeout(() => {
      setCustomAiSummary(`Síntese clínica gerada via Nexa IA em ${new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}:
O vídeo enfatiza a diminuição de eventos adversos na medicação de idosos através de 3 eixos primários:
1. Validação imediata dos dados do morador antes da administração.
2. Registro em tempo real no app NexaMed para rastreabilidade de horários.
3. Notificação do Enfermeiro RT em caso de oscilações no escore NEWS2 ou recusa de medicação.`);
      setIsGeneratingSummary(false);
    }, 900);
  };

  // Select module for embedded player
  const handleSelectFeaturedModule = (mod: MicroLearningModule) => {
    setFeaturedModule(mod);
    setIsPlaying(false);
    setCurrentTime(0);
    setCustomAiSummary(null);
  };

  // Handle module completion
  const handleCompleteModule = (moduleId: string, score: number) => {
    setModules(prev => prev.map(m => {
      if (m.id === moduleId) {
        return {
          ...m,
          status: 'Concluído',
          scorePercentage: score,
          completedAt: new Date().toLocaleString('pt-BR')
        };
      }
      return m;
    }));

    if (featuredModule.id === moduleId) {
      setFeaturedModule(prev => ({
        ...prev,
        status: 'Concluído',
        scorePercentage: score,
        completedAt: new Date().toLocaleString('pt-BR')
      }));
    }

    // Update staff profile stats
    setStaffProfiles(prev => prev.map(p => {
      if (p.staffName === selectedProfile.staffName) {
        const completed = p.completedTrainingsCount + 1;
        const pendingGaps = Math.max(0, p.pendingClinicalGapsCount - 1);
        const newScore = Math.min(100, Math.round((completed / p.totalAssignedCount) * 100));

        return {
          ...p,
          completedTrainingsCount: completed,
          pendingClinicalGapsCount: pendingGaps,
          readinessScore: newScore
        };
      }
      return p;
    }));
  };

  // Generate AI-tailored Micro-learning using current pending tasks
  const handleGenerateAiModuleForStaff = () => {
    setIsGeneratingAi(true);

    setTimeout(() => {
      const newAiModule: MicroLearningModule = {
        id: `ml-ai-${Date.now()}`,
        title: `Especialização Nexa IA: Manejamento de Aprazamentos Críticos e Prevenção de Quedas`,
        description: `Treinamento dinâmico de 3 minutos adaptado às pendências clínicas recentes registradas para o perfil de ${selectedProfile.staffName}.`,
        durationMinutes: 3,
        type: 'video',
        category: 'Aferição NEWS2 & Vitais',
        staffName: selectedProfile.staffName,
        targetRole: selectedProfile.role,
        clinicalTrigger: `Identificado risco potencial nos atendimentos de ${selectedProfile.shift} - Pendência na revisão dos sinais vitais e escore NEWS2.`,
        aiReasoning: `Nexa IA analisou as evoluções dos últimos plantões de ${selectedProfile.staffName} e identificou oportunidade de melhoria no registro imediato do pulso e saturação de oxigênio após medicação vasodilatadora.`,
        videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-nurse-measuring-patient-blood-pressure-41552-large.mp4',
        thumbnailUrl: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=600&q=80',
        keyTakeaways: [
          'Aferir a PA e FC exatamente 30 minutos após administração de medicação anti-hipertensiva.',
          'Registrar valores diretamente no app NexaMed antes de concluir a passagem de plantão.',
          'Notificar imediatamente o enfermeiro RT caso o escore NEWS2 atinja 3 ou mais.'
        ],
        quiz: [
          {
            id: `q-gen-1`,
            question: 'Em quanto tempo após a administração de anti-hipertensivos deve ser aferida a nova PA?',
            options: [
              'Em até 30 minutos.',
              'Somente no dia seguinte.',
              'Não há necessidade de reagendamento.'
            ],
            correctAnswerIndex: 0,
            explanation: 'O re-monitoramento aos 30 minutos identifica episódios de hipotensão ortostática precipitada pela medicação.'
          }
        ],
        status: 'Pendente',
        suggestedByNexa: true
      };

      setModules(prev => [newAiModule, ...prev]);
      setFeaturedModule(newAiModule);
      
      // Update profile
      setStaffProfiles(prev => prev.map(p => {
        if (p.staffId === selectedProfile.staffId) {
          return {
            ...p,
            totalAssignedCount: p.totalAssignedCount + 1,
            pendingClinicalGapsCount: p.pendingClinicalGapsCount + 1,
            assignedModules: [newAiModule, ...p.assignedModules]
          };
        }
        return p;
      }));

      setIsGeneratingAi(false);
    }, 1200);
  };

  // Quick procedural query
  const handleAskProceduralGuide = (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiQuery.trim()) return;

    setIsGeneratingAi(true);

    setTimeout(() => {
      const generatedGuide: MicroLearningModule = {
        id: `ml-custom-${Date.now()}`,
        title: `Guia Rápido Nexa IA: ${aiQuery}`,
        description: `Procedimento operacional de emergência sintetizado pela Inteligência Artificial NexaMed.`,
        durationMinutes: 2,
        type: 'guide',
        category: 'Biossegurança & Higiene',
        clinicalTrigger: `Dúvida pontual da equipe: "${aiQuery}"`,
        aiReasoning: `Síntese imediata baseada nas diretrizes do Ministério da Saúde, ANVISA e manuais de Enfermagem Gerontológica.`,
        guideContent: `### Diretriz Operacional NexaMed
1. **Ação Imediata**: Manter a calma, garantir a segurança do leito e avaliar o nível de consciência (Escala de Glasgow/AVDI).
2. **Avaliação de Vitais**: Verificar Pressão Arterial, Frequência Cardíaca e Glicemia Capilar imediatamente.
3. **Registro SOAP**: Lançar as observações na Guia SOAP e notificar o enfermeiro de plantão.`,
        keyTakeaways: [
          'Priorizar a segurança física e estabilidade hemodinâmica do morador.',
          'Registrar em prontuário eletrônico no prazo máximo de 15 minutos.',
          'Não prescrever ou administrar medicação sem respaldo do médico plantonista.'
        ],
        quiz: [
          {
            id: `q-ask-1`,
            question: 'Qual a prioridade número 1 no atendimento imediato ao residente?',
            options: [
              'Garantir a segurança física e estabilidade hemodinâmica do residente.',
              'Preencher a folha de pagamento.',
              'Aguardar o final do plantão para agir.'
            ],
            correctAnswerIndex: 0,
            explanation: 'A estabilização do residente e segurança do ambiente vem sempre em primeiro lugar.'
          }
        ],
        status: 'Pendente',
        suggestedByNexa: true
      };

      setAiResponseGuide(generatedGuide);
      setIsGeneratingAi(false);
    }, 1000);
  };

  // Import video directly from YouTube
  const handleImportYoutubeVideo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!youtubeUrlInput.trim()) return;

    setIsImportingYoutube(true);

    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = youtubeUrlInput.match(regExp);
    const ytId = (match && match[2].length === 11) ? match[2] : 'E91mK4w4fCg';

    setTimeout(() => {
      const newYtModule: MicroLearningModule = {
        id: `ml-yt-${Date.now()}`,
        title: `Guia Clínico Integrado do YouTube (${ytId})`,
        description: `Vídeo sobre boas práticas de enfermagem e saúde gerontológica importado do YouTube com síntese automática de tópicos.`,
        durationMinutes: 5,
        type: 'video',
        category: 'Treinamento YouTube',
        staffName: selectedProfile.staffName,
        targetRole: selectedProfile.role,
        clinicalTrigger: `Link do YouTube incorporado para atualização operacional rápida da equipe.`,
        aiReasoning: `Nexa IA analisou o vídeo do YouTube e sintetizou os pontos primários de conformidade com as normas da Anvisa e COFEN.`,
        youtubeId: ytId,
        youtubeUrl: youtubeUrlInput.includes('youtube.com') || youtubeUrlInput.includes('youtu.be') ? youtubeUrlInput : `https://www.youtube.com/watch?v=${ytId}`,
        thumbnailUrl: `https://img.youtube.com/vi/${ytId}/hqdefault.jpg`,
        keyTakeaways: [
          'Conferir a identificação do residente e conferir os 5 certos da administração de medicamentos.',
          'Manter o registro no prontuário eletrônico NexaMed em até 15 minutos pós-atendimento.',
          'Notificar imediatamente o enfermeiro RT em caso de alterações no escore NEWS2.'
        ],
        quiz: [
          {
            id: `q-yt-1`,
            question: 'Qual a principal finalidade da integração de vídeos do YouTube no micro-learning NexaMed?',
            options: [
              'Capacitação continuada em tempo real com avaliação prática e conformidade Anvisa.',
              'Apenas entretenimento da equipe.',
              'Cancelar a necessidade de registros médicos.'
            ],
            correctAnswerIndex: 0,
            explanation: 'O micro-learning integrado ao YouTube eleva a prontidão da equipe através de vídeos dinâmicos de alta qualidade.'
          }
        ],
        status: 'Pendente',
        suggestedByNexa: true
      };

      setModules(prev => [newYtModule, ...prev]);
      setFeaturedModule(newYtModule);
      setYoutubeUrlInput('');
      setIsImportingYoutube(false);
    }, 900);
  };

  return (
    <div className="space-y-6 pb-12">
      
      {/* Header Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-zinc-900 via-teal-950 to-zinc-900 text-white relative overflow-hidden shadow-xl border border-teal-800/50">
        <div className="absolute top-0 right-0 translate-x-1/4 -translate-y-1/4 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-3 py-1 rounded-full bg-teal-500/20 text-teal-300 border border-teal-400/30 text-xs font-black uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
                Educação Continuada com Inteligência Artificial
              </span>
              <span className="px-3 py-1 rounded-full bg-red-500/20 text-red-300 border border-red-400/30 text-xs font-bold flex items-center gap-1">
                <Youtube className="w-3.5 h-3.5 text-red-400" />
                Integração Nativa YouTube
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Micro-Learning & Prontidão da Equipe
            </h1>
            <p className="text-sm text-zinc-300 leading-relaxed">
              Assista a guias rápidos em vídeo e do <strong className="text-red-300">YouTube integrados</strong> com <strong className="text-teal-200">resumos gerados por IA em tempo real</strong>, marcadores de tempo interativos e testes de fixação diretamente na plataforma NexaMed.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 shrink-0">
            <button
              onClick={handleGenerateAiModuleForStaff}
              disabled={isGeneratingAi}
              className="px-5 py-3 bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600 text-white font-extrabold text-xs rounded-2xl shadow-lg shadow-teal-500/25 transition-all flex items-center justify-center gap-2"
            >
              <Brain className={`w-4 h-4 text-white ${isGeneratingAi ? 'animate-spin' : ''}`} />
              <span>{isGeneratingAi ? 'Analisando Pendências...' : '🔮 Mapear com Nexa IA'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* YOUTUBE INTEGRATION & QUICK IMPORT BAR */}
      <div className="bg-gradient-to-r from-zinc-950 via-zinc-900 to-red-950/80 p-4 sm:p-5 rounded-3xl border border-red-500/30 shadow-lg text-white space-y-3">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-red-600/20 border border-red-500/40 text-red-400">
              <Youtube className="w-5 h-5 text-red-500 animate-pulse" />
            </div>
            <div>
              <h3 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-2 flex-wrap">
                <span>Integrar Vídeos do YouTube no Micro-Learning NexaMed</span>
                <span className="px-2 py-0.5 rounded-md bg-red-500/20 text-red-300 border border-red-500/30 text-[10px] font-bold">
                  Anvisa & COFEN Compliant
                </span>
              </h3>
              <p className="text-xs text-zinc-300">
                Cole a URL de qualquer vídeo educacional do YouTube para gerar um micro-treinamento com resumo automático por IA e questionário de fixação.
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleImportYoutubeVideo} className="flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <Youtube className="w-4 h-4 text-red-400 absolute left-3 top-3" />
            <input
              type="text"
              value={youtubeUrlInput}
              onChange={(e) => setYoutubeUrlInput(e.target.value)}
              placeholder="Ex: https://www.youtube.com/watch?v=E91mK4w4fCg ou cole o código do vídeo..."
              className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-zinc-900/90 border border-zinc-700 text-xs text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>
          <button
            type="submit"
            disabled={isImportingYoutube || !youtubeUrlInput.trim()}
            className="px-5 py-2.5 bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white font-extrabold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2 shrink-0"
          >
            <Sparkles className={`w-4 h-4 text-amber-300 ${isImportingYoutube ? 'animate-spin' : ''}`} />
            <span>{isImportingYoutube ? 'Sintetizando com IA...' : 'Importar e Criar Módulo'}</span>
          </button>
        </form>

        {/* Quick YouTube Clinical Topic Badges */}
        <div className="flex items-center gap-2 overflow-x-auto pt-1 text-[11px] text-zinc-400 font-medium">
          <span className="font-bold text-zinc-300 shrink-0">Temas em Destaque:</span>
          {[
            { label: 'Administração MAR', id: 'E91mK4w4fCg' },
            { label: 'Manejamento de Demência', id: 'P3-b8yZ9A3o' },
            { label: 'Lesão por Pressão', id: 'L84XyJ8gB9g' },
            { label: 'Prevenção de Quedas', id: 'v5cT4zC2Gso' },
            { label: 'Aferição NEWS2', id: '_S8e8M-pA10' }
          ].map((topic, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setYoutubeUrlInput(`https://www.youtube.com/watch?v=${topic.id}`)}
              className="px-2.5 py-1 rounded-lg bg-zinc-800/80 hover:bg-zinc-700 text-zinc-200 border border-zinc-700/80 shrink-0 transition-colors flex items-center gap-1"
            >
              <Youtube className="w-3 h-3 text-red-400" />
              <span>{topic.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* EMBEDDED VIDEO PLAYER SHOWCASE & AI SUMMARY SECTION */}
      <div className="bg-white rounded-3xl border border-zinc-200 shadow-xl overflow-hidden space-y-0">
        
        {/* Showcase Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-zinc-900 via-teal-950 to-zinc-900 text-white flex items-center justify-between border-b border-teal-800/40">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-teal-500/20 border border-teal-400/30 text-teal-300 shrink-0">
              <PlayCircle className="w-5 h-5 text-teal-300" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-teal-500/30 text-teal-200 border border-teal-400/40">
                  {featuredModule.category}
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-zinc-800 text-zinc-300 flex items-center gap-1 border border-zinc-700">
                  <Clock className="w-3 h-3 text-teal-400" />
                  {featuredModule.durationMinutes} min
                </span>
                {featuredModule.suggestedByNexa && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 border border-amber-400/30 flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-amber-300" />
                    Sugerido por Nexa IA
                  </span>
                )}
              </div>
              <h2 className="text-sm sm:text-base font-black text-white leading-snug mt-1">
                {featuredModule.title}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {featuredModule.status === 'Concluído' ? (
              <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-xs font-bold flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Concluído ({featuredModule.scorePercentage}%)</span>
              </span>
            ) : (
              <button
                onClick={() => {
                  setActiveModalModule(featuredModule);
                  setIsPlayerOpen(true);
                }}
                className="px-3.5 py-1.5 bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
              >
                <Award className="w-3.5 h-3.5" />
                <span>Modo Teste Completo</span>
              </button>
            )}
          </div>
        </div>

        {/* Embedded Player + AI Summary Split Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-zinc-200 bg-zinc-950">
          
          {/* LEFT 7 COLS: Video Player */}
          <div className="lg:col-span-7 flex flex-col justify-between bg-zinc-950">
            
            {/* Embedded YouTube Player Box */}
            <div className="relative aspect-video bg-zinc-950 overflow-hidden group flex items-center justify-center">
              {featuredModule.type === 'video' ? (
                <iframe
                  src={
                    featuredModule.youtubeId
                      ? `https://www.youtube-nocookie.com/embed/${featuredModule.youtubeId}?autoplay=0&rel=0&modestbranding=1`
                      : featuredModule.youtubeUrl
                      ? `https://www.youtube-nocookie.com/embed/${
                          featuredModule.youtubeUrl.match(/^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/)?.[2] || 'l6pXq6G7Gk8'
                        }?autoplay=0&rel=0&modestbranding=1`
                      : `https://www.youtube-nocookie.com/embed/l6pXq6G7Gk8?autoplay=0&rel=0&modestbranding=1`
                  }
                  title={featuredModule.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                  className="w-full h-full border-0"
                ></iframe>
              ) : (
                <div className="p-8 text-center text-zinc-400 space-y-3">
                  <BookOpen className="w-12 h-12 text-teal-400 mx-auto animate-pulse" />
                  <p className="text-sm font-bold text-white">Guia Operacional Padrão (POP)</p>
                  <p className="text-xs text-zinc-400 max-w-sm mx-auto">
                    Este módulo está no formato de Guia Prático em texto com resumo em tópicos gerado por IA.
                  </p>
                </div>
              )}

              {/* Top Video Overlay Badge */}
              <div className="absolute top-3 left-3 bg-zinc-900/90 backdrop-blur-md px-2.5 py-1 rounded-lg text-[10px] font-bold text-zinc-300 border border-zinc-700/60 flex items-center gap-1.5 pointer-events-none shadow-md">
                <Youtube className="w-3.5 h-3.5 text-rose-500" />
                <span>Player Integrado YouTube NexaMed</span>
              </div>
            </div>

            {/* Video Controls / Info Bar */}
            <div className="p-3 sm:p-4 bg-zinc-900 border-t border-zinc-800 flex items-center justify-between text-xs text-zinc-300">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <span className="font-bold text-white">Transmissão Educacional em Alta Definição</span>
                <span className="hidden md:inline-block text-[10px] text-zinc-400 bg-zinc-800 px-2 py-0.5 rounded border border-zinc-700">
                  Legendas & Transcrição PT-BR
                </span>
              </div>

              {(featuredModule.youtubeUrl || featuredModule.youtubeId) && (
                <a
                  href={featuredModule.youtubeUrl || `https://www.youtube.com/watch?v=${featuredModule.youtubeId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-teal-400 hover:text-teal-300 font-bold flex items-center gap-1.5 transition-colors bg-zinc-800 hover:bg-zinc-700 px-3 py-1.5 rounded-lg border border-zinc-700 shrink-0"
                >
                  <span>Assistir no YouTube</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}
            </div>

          </div>

          {/* RIGHT 5 COLS: AI-Generated Summary & Interactive Chapters */}
          <div className="lg:col-span-5 bg-white flex flex-col justify-between">
            
            <div>
              {/* Summary Header Tabs */}
              <div className="flex border-b border-zinc-200 bg-zinc-50/80 p-2 gap-1">
                <button
                  onClick={() => setPlayerTab('summary')}
                  className={`flex-1 py-2 px-3 rounded-xl font-extrabold text-xs flex items-center justify-center gap-1.5 transition-all ${
                    playerTab === 'summary'
                      ? 'bg-white text-teal-700 shadow-2xs border border-zinc-200/80'
                      : 'text-zinc-500 hover:text-zinc-800'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  <span>Resumo IA</span>
                </button>

                <button
                  onClick={() => setPlayerTab('chapters')}
                  className={`flex-1 py-2 px-3 rounded-xl font-extrabold text-xs flex items-center justify-center gap-1.5 transition-all ${
                    playerTab === 'chapters'
                      ? 'bg-white text-teal-700 shadow-2xs border border-zinc-200/80'
                      : 'text-zinc-500 hover:text-zinc-800'
                  }`}
                >
                  <ListVideo className="w-3.5 h-3.5 text-teal-600" />
                  <span>Capítulos</span>
                </button>

                <button
                  onClick={() => setPlayerTab('pop')}
                  className={`flex-1 py-2 px-3 rounded-xl font-extrabold text-xs flex items-center justify-center gap-1.5 transition-all ${
                    playerTab === 'pop'
                      ? 'bg-white text-teal-700 shadow-2xs border border-zinc-200/80'
                      : 'text-zinc-500 hover:text-zinc-800'
                  }`}
                >
                  <FileText className="w-3.5 h-3.5 text-purple-600" />
                  <span>Guia POP</span>
                </button>
              </div>

              {/* Tab Content Area */}
              <div className="p-4 sm:p-5 space-y-4 max-h-[380px] overflow-y-auto">
                
                {/* TAB 1: AI Summary */}
                {playerTab === 'summary' && (
                  <div className="space-y-4 animate-in fade-in duration-200">
                    
                    {/* Trigger Banner */}
                    <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs space-y-1">
                      <div className="flex items-center gap-1.5 font-bold text-amber-950">
                        <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                        <span>Gatilho Clínico que Motivou este Vídeo:</span>
                      </div>
                      <p className="text-amber-900 leading-snug">
                        {featuredModule.clinicalTrigger}
                      </p>
                    </div>

                    {/* AI Key Takeaways */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-black text-zinc-900 uppercase tracking-wider flex items-center gap-1.5">
                          <Lightbulb className="w-4 h-4 text-amber-500" />
                          Pontos-Chave Sintetizados pela IA
                        </h4>
                        <span className="text-[10px] font-bold text-zinc-400">
                          {featuredModule.keyTakeaways.length} Regras de Ouro
                        </span>
                      </div>

                      <ul className="space-y-2">
                        {featuredModule.keyTakeaways.map((item, idx) => (
                          <li key={idx} className="p-2.5 rounded-xl bg-zinc-50 border border-zinc-200/80 flex items-start gap-2 text-xs text-zinc-800">
                            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                            <span className="leading-relaxed">{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Fresh Custom Summary if generated */}
                    {customAiSummary && (
                      <div className="p-3 rounded-xl bg-teal-50 border border-teal-200 text-xs text-teal-950 space-y-1.5 animate-in fade-in duration-300">
                        <div className="flex items-center gap-1.5 font-bold text-teal-900">
                          <Sparkles className="w-4 h-4 text-teal-600" />
                          <span>Resumo IA Atualizado em Tempo Real</span>
                        </div>
                        <p className="text-zinc-700 whitespace-pre-wrap leading-relaxed">
                          {customAiSummary}
                        </p>
                      </div>
                    )}

                    {/* Button to Generate/Refresh AI Summary */}
                    <button
                      onClick={handleGenerateFreshAiSummary}
                      disabled={isGeneratingSummary}
                      className="w-full py-2 px-3 bg-zinc-100 hover:bg-zinc-200 disabled:opacity-50 text-zinc-800 font-extrabold text-xs rounded-xl transition-colors flex items-center justify-center gap-2 border border-zinc-200"
                    >
                      <Sparkles className={`w-3.5 h-3.5 text-amber-500 ${isGeneratingSummary ? 'animate-spin' : ''}`} />
                      <span>{isGeneratingSummary ? 'Processando Vídeo...' : 'Recarregar Resumo de IA'}</span>
                    </button>

                  </div>
                )}

                {/* TAB 2: Interactive Video Chapters (Timestamps) */}
                {playerTab === 'chapters' && (
                  <div className="space-y-3 animate-in fade-in duration-200">
                    <div className="flex items-center justify-between pb-2 border-b border-zinc-100">
                      <h4 className="text-xs font-black text-zinc-900 uppercase tracking-wider flex items-center gap-1.5">
                        <ListVideo className="w-4 h-4 text-teal-600" />
                        Marcadores de Tempo da Aula
                      </h4>
                      <span className="text-[10px] font-bold text-zinc-400">
                        Clique para saltar no vídeo
                      </span>
                    </div>

                    <div className="space-y-2">
                      {currentChapters.map((chapter, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleJumpToTime(chapter.seconds)}
                          className="w-full p-3 rounded-xl bg-zinc-50 hover:bg-teal-50/80 hover:border-teal-300 border border-zinc-200/80 text-left transition-all flex items-start gap-3 group"
                        >
                          <span className="px-2 py-1 rounded-md bg-teal-600 text-white text-[10px] font-mono font-bold shrink-0 mt-0.5 group-hover:scale-105 transition-transform">
                            {chapter.time}
                          </span>
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-zinc-900 group-hover:text-teal-950 truncate">
                              {chapter.title}
                            </p>
                            <p className="text-[11px] text-zinc-500 mt-0.5 line-clamp-2">
                              {chapter.description}
                            </p>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* TAB 3: POP Guide */}
                {playerTab === 'pop' && (
                  <div className="space-y-3 animate-in fade-in duration-200">
                    <div className="p-3 rounded-xl bg-purple-50 border border-purple-200 text-purple-950 text-xs space-y-1">
                      <div className="flex items-center gap-1.5 font-bold">
                        <ShieldCheck className="w-4 h-4 text-purple-600 shrink-0" />
                        <span>Procedimento Operacional Padrão (POP NexaMed)</span>
                      </div>
                      <p className="text-purple-900 text-[11px]">
                        Conformidade com a RDC 502/2021 da Anvisa e Manual de Enfermagem Gerontológica.
                      </p>
                    </div>

                    <div className="text-xs text-zinc-700 leading-relaxed space-y-2 font-sans bg-zinc-50 p-3.5 rounded-xl border border-zinc-200">
                      {featuredModule.guideContent || (
                        <div className="space-y-2">
                          <p><strong>1. Identificação do Residente:</strong> Confirmar nome completo e pulseira com código de barras.</p>
                          <p><strong>2. Dupla Checagem:</strong> Validar dose, via e horário no aplicativo antes da aplicação.</p>
                          <p><strong>3. Monitoramento de Efeitos:</strong> Aferir sinais vitais 30 min após e registrar na evolução SOAP.</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

              </div>
            </div>

            {/* Bottom Action Footer for Selected Video */}
            <div className="p-4 bg-zinc-50 border-t border-zinc-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-[11px] text-zinc-500 font-bold">
                  Status:
                </span>
                {featuredModule.status === 'Concluído' ? (
                  <span className="text-xs font-extrabold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md border border-emerald-200">
                    Concluído ({featuredModule.scorePercentage}%)
                  </span>
                ) : (
                  <span className="text-xs font-extrabold text-rose-700 bg-rose-100 px-2 py-0.5 rounded-md border border-rose-200">
                    Pendente de Validação
                  </span>
                )}
              </div>

              <button
                onClick={() => {
                  setActiveModalModule(featuredModule);
                  setIsPlayerOpen(true);
                }}
                className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-xl shadow-2xs transition-colors flex items-center gap-1.5"
              >
                <span>Fazer Teste de Fixação</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

          </div>

        </div>

      </div>

      {/* Staff Selector Carousel / Tabs */}
      <div className="bg-white p-5 rounded-2xl border border-zinc-200/80 shadow-2xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-teal-600" />
            <h2 className="font-extrabold text-sm text-zinc-900">
              Perfil do Funcionário & Trilhas Personalizadas
            </h2>
          </div>
          <span className="text-xs font-bold text-zinc-400">
            {staffProfiles.length} Profissionais Mapeados
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {staffProfiles.map((staff) => {
            const isSelected = selectedStaffId === staff.staffId;

            return (
              <button
                key={staff.staffId}
                onClick={() => setSelectedStaffId(staff.staffId)}
                className={`p-3.5 rounded-2xl border text-left transition-all flex flex-col justify-between relative overflow-hidden group ${
                  isSelected
                    ? 'bg-teal-50/90 border-teal-500 ring-2 ring-teal-500/20 shadow-xs'
                    : 'bg-zinc-50/80 border-zinc-200 hover:border-zinc-300 hover:bg-zinc-100/60'
                }`}
              >
                <div className="flex items-start gap-3 mb-3">
                  <img
                    src={staff.avatarUrl || 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=200&q=80'}
                    alt={staff.staffName}
                    className="w-10 h-10 rounded-xl object-cover border border-zinc-200 shrink-0"
                  />
                  <div className="min-w-0">
                    <p className={`text-xs font-black truncate ${isSelected ? 'text-teal-950' : 'text-zinc-900'}`}>
                      {staff.staffName}
                    </p>
                    <p className="text-[11px] text-zinc-500 font-medium truncate">
                      {staff.role} • {staff.shift}
                    </p>
                  </div>
                </div>

                <div className="space-y-1.5 pt-2 border-t border-zinc-200/60">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-zinc-500 font-semibold">Prontidão Técnica:</span>
                    <span className={`font-black ${staff.readinessScore >= 90 ? 'text-emerald-700' : 'text-amber-700'}`}>
                      {staff.readinessScore}%
                    </span>
                  </div>

                  {/* Readiness Progress bar */}
                  <div className="w-full bg-zinc-200 h-1.5 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        staff.readinessScore >= 90 ? 'bg-emerald-500' : 'bg-amber-500'
                      }`}
                      style={{ width: `${staff.readinessScore}%` }}
                    ></div>
                  </div>

                  <div className="flex items-center justify-between text-[10px] pt-1">
                    <span className="text-zinc-500">
                      {staff.completedTrainingsCount}/{staff.totalAssignedCount} concluídos
                    </span>
                    {staff.pendingClinicalGapsCount > 0 ? (
                      <span className="px-1.5 py-0.5 rounded-md bg-rose-100 text-rose-800 font-bold border border-rose-200">
                        {staff.pendingClinicalGapsCount} pendência(s)
                      </span>
                    ) : (
                      <span className="px-1.5 py-0.5 rounded-md bg-emerald-100 text-emerald-800 font-bold border border-emerald-200">
                        100% em dia
                      </span>
                    )}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Staff AI Diagnostic Card */}
      <div className="p-5 rounded-2xl bg-amber-50/80 border border-amber-200/80 shadow-2xs space-y-3">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-amber-100 text-amber-900 border border-amber-200">
              <Sparkles className="w-4 h-4 text-amber-700" />
            </div>
            <div>
              <h3 className="text-xs font-black text-amber-950 uppercase tracking-wider">
                Diagnóstico de Capacitação Nexa IA • {selectedProfile.staffName}
              </h3>
              <p className="text-xs text-amber-900">
                Análise contínua das intercorrências, prontuários SOAP e aprazamentos MAR do funcionário.
              </p>
            </div>
          </div>

          <button
            onClick={handleGenerateAiModuleForStaff}
            disabled={isGeneratingAi}
            className="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-extrabold text-xs rounded-xl shadow-2xs transition-colors flex items-center gap-1.5"
          >
            <Zap className="w-3.5 h-3.5 fill-white" />
            <span>Gerar Treinamento sob Demanda</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
          <div className="p-3.5 rounded-xl bg-white border border-amber-200/80 space-y-1">
            <span className="text-[11px] font-extrabold text-amber-900 uppercase tracking-wider block">
              Gatilhos Clínicos Mapeados
            </span>
            <ul className="space-y-1">
              {selectedProfile.recentGapsFound.map((gap, idx) => (
                <li key={idx} className="text-xs text-zinc-700 flex items-start gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                  <span>{gap}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="p-3.5 rounded-xl bg-white border border-amber-200/80 space-y-1">
            <span className="text-[11px] font-extrabold text-teal-900 uppercase tracking-wider block">
              Recomendação de Prontidão da IA
            </span>
            <p className="text-xs text-zinc-700 leading-relaxed">
              O assistente Nexa IA sugere concluir o micro-learning de 3 minutos em <strong>Checagem Tripla do Kardex MAR</strong> e revisar o <strong>POP de Protocolo SOAP</strong> antes da próxima passagem de plantão.
            </p>
          </div>
        </div>
      </div>

      {/* Filters and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-zinc-200/80 shadow-2xs">
        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          {[
            { id: 'all', label: 'Todos os Módulos' },
            { id: 'video', label: 'Vídeos Curtos' },
            { id: 'guide', label: 'Guias POP' },
            { id: 'pending', label: 'Pendentes' },
            { id: 'completed', label: 'Concluídos' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setSelectedCategory(tab.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-colors ${
                selectedCategory === tab.id
                  ? 'bg-teal-600 text-white shadow-2xs'
                  : 'bg-zinc-100 hover:bg-zinc-200 text-zinc-600'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar por tema ou módulo..."
            className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-zinc-200 bg-zinc-50 text-xs text-zinc-800 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
        </div>
      </div>

      {/* Modules Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredModules.map((module) => {
          const isCompleted = module.status === 'Concluído';
          const isFeatured = featuredModule.id === module.id;

          return (
            <div
              key={module.id}
              className={`bg-white rounded-2xl border transition-all overflow-hidden flex flex-col justify-between group ${
                isFeatured
                  ? 'border-teal-500 ring-2 ring-teal-500/20 shadow-md'
                  : 'border-zinc-200/80 shadow-2xs hover:shadow-md'
              }`}
            >
              <div>
                {/* Thumbnail / Header area */}
                <div className="relative h-40 bg-zinc-900 overflow-hidden">
                  <img
                    src={module.thumbnailUrl || 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=600&q=80'}
                    alt={module.title}
                    className="w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/40 to-transparent"></div>

                  <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
                    <span className="px-2.5 py-1 rounded-lg bg-zinc-900/80 backdrop-blur-xs text-white text-[10px] font-black uppercase tracking-wider border border-white/10">
                      {module.category}
                    </span>

                    <span className="px-2.5 py-1 rounded-lg bg-teal-600/90 backdrop-blur-xs text-white text-[10px] font-bold flex items-center gap-1 shadow-xs">
                      <Clock className="w-3 h-3" />
                      {module.durationMinutes} min
                    </span>
                  </div>

                  <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between gap-1 flex-wrap">
                    {(module.youtubeId || module.youtubeUrl) ? (
                      <span className="px-2 py-0.5 rounded-md bg-red-600/90 text-white text-[10px] font-black flex items-center gap-1 shadow-2xs">
                        <Youtube className="w-3 h-3 text-white" />
                        YouTube
                      </span>
                    ) : module.suggestedByNexa && (
                      <span className="px-2 py-0.5 rounded-md bg-amber-500/90 text-amber-950 text-[10px] font-extrabold flex items-center gap-1 shadow-2xs">
                        <Sparkles className="w-3 h-3 text-amber-950" />
                        Sugerido Nexa IA
                      </span>
                    )}

                    {isCompleted ? (
                      <span className="px-2 py-0.5 rounded-md bg-emerald-500 text-white text-[10px] font-bold flex items-center gap-1 shadow-2xs">
                        <CheckCircle2 className="w-3 h-3" />
                        Concluído ({module.scorePercentage}%)
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-md bg-rose-500 text-white text-[10px] font-bold flex items-center gap-1 shadow-2xs">
                        <AlertCircle className="w-3 h-3" />
                        Treinamento Pendente
                      </span>
                    )}
                  </div>
                </div>

                {/* Content info */}
                <div className="p-4 space-y-3">
                  <div>
                    <h3 className="font-extrabold text-sm text-zinc-900 group-hover:text-teal-700 transition-colors leading-snug">
                      {module.title}
                    </h3>
                    <p className="text-xs text-zinc-600 mt-1 line-clamp-2 leading-relaxed">
                      {module.description}
                    </p>
                  </div>

                  <div className="p-2.5 rounded-xl bg-zinc-50 border border-zinc-200/70 text-[11px] text-zinc-700 space-y-1">
                    <div className="flex items-center gap-1.5 font-bold text-amber-900">
                      <AlertCircle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                      <span>Gatilho de Pendência:</span>
                    </div>
                    <p className="text-zinc-600 line-clamp-1 italic">
                      "{module.clinicalTrigger}"
                    </p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="p-4 pt-0 flex items-center gap-2">
                <button
                  onClick={() => handleSelectFeaturedModule(module)}
                  className={`flex-1 py-2.5 px-3 font-extrabold text-xs rounded-xl shadow-2xs transition-all flex items-center justify-center gap-1.5 ${
                    isFeatured
                      ? 'bg-teal-700 text-white'
                      : 'bg-zinc-900 hover:bg-zinc-800 text-white'
                  }`}
                >
                  <Play className="w-3.5 h-3.5 fill-white" />
                  <span>{isFeatured ? 'Em Exibição no Player' : 'Carregar no Player'}</span>
                </button>

                <button
                  onClick={() => {
                    setActiveModalModule(module);
                    setIsPlayerOpen(true);
                  }}
                  className="px-3 py-2.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 font-extrabold text-xs rounded-xl transition-colors shrink-0"
                  title="Abrir em Tela Cheia"
                >
                  <Award className="w-4 h-4 text-purple-600" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Procedural AI Search Bar ("Pergunte ao Nexa IA sobre um Procedimento") */}
      <div className="bg-white p-6 rounded-2xl border border-zinc-200/80 shadow-2xs space-y-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-teal-100 text-teal-800 border border-teal-200">
            <Bot className="w-5 h-5 text-teal-600" />
          </div>
          <div>
            <h3 className="font-extrabold text-sm text-zinc-900">
              Consulta de Procedimento Clínico Express (Nexa IA)
            </h3>
            <p className="text-xs text-zinc-500">
              Digite qualquer dúvida de conduta técnica (ex: higienização de traqueostomia, surto de diarreia ou curativo sacral) para gerar um micro-guia imediato.
            </p>
          </div>
        </div>

        <form onSubmit={handleAskProceduralGuide} className="flex gap-2">
          <input
            type="text"
            value={aiQuery}
            onChange={(e) => setAiQuery(e.target.value)}
            placeholder="Ex: Qual o protocolo para febre súbita de 38.8ºC no morador idoso?"
            className="flex-1 px-4 py-2.5 rounded-xl border border-zinc-200 bg-zinc-50 text-xs text-zinc-800 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
          <button
            type="submit"
            disabled={isGeneratingAi || !aiQuery.trim()}
            className="px-5 py-2.5 bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-2 shrink-0"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Gerar Guia Nexa</span>
          </button>
        </form>

        {aiResponseGuide && (
          <div className="p-4 rounded-2xl bg-teal-50/80 border border-teal-200 space-y-3 animate-in fade-in duration-200">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-teal-950 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-teal-600" />
                {aiResponseGuide.title}
              </span>
              <button
                onClick={() => {
                  setActiveModalModule(aiResponseGuide);
                  setIsPlayerOpen(true);
                }}
                className="px-3 py-1 bg-teal-600 hover:bg-teal-700 text-white font-bold text-[11px] rounded-lg transition-colors flex items-center gap-1"
              >
                <span>Abrir em Modo Aula</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            <div className="text-xs text-zinc-700 whitespace-pre-wrap font-sans leading-relaxed bg-white p-3.5 rounded-xl border border-teal-200/60">
              {aiResponseGuide.guideContent}
            </div>
          </div>
        )}
      </div>

      {/* Micro-learning Player Modal */}
      <MicroLearningPlayerModal
        isOpen={isPlayerOpen}
        onClose={() => setIsPlayerOpen(false)}
        module={activeModalModule}
        onCompleteModule={handleCompleteModule}
      />

    </div>
  );
};
