import React, { useState, useRef, useEffect } from 'react';
import { 
  X, 
  Play, 
  Pause, 
  CheckCircle2, 
  AlertTriangle, 
  Sparkles, 
  BookOpen, 
  Clock, 
  Award, 
  HelpCircle, 
  ChevronRight, 
  Volume2, 
  VolumeX, 
  RotateCcw, 
  FileText, 
  Check, 
  GraduationCap,
  ListOrdered,
  Lightbulb,
  ShieldCheck,
  Youtube,
  ExternalLink,
  Film,
  RefreshCw
} from 'lucide-react';
import { MicroLearningModule } from '../types';
import { extractYoutubeId, getYoutubeEmbedUrl, getYoutubeWatchUrl } from '../utils/youtubeUtils';

interface MicroLearningPlayerModalProps {
  isOpen: boolean;
  onClose: () => void;
  module: MicroLearningModule | null;
  onCompleteModule: (moduleId: string, score: number) => void;
}

export const MicroLearningPlayerModal: React.FC<MicroLearningPlayerModalProps> = ({
  isOpen,
  onClose,
  module,
  onCompleteModule
}) => {
  // 1. All hooks must be declared unconditionally at the very top level
  const videoRef = useRef<HTMLVideoElement>(null);
  const [playerMode, setPlayerMode] = useState<'youtube' | 'local'>('youtube');
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  
  // Quiz state
  const [userAnswers, setUserAnswers] = useState<Record<string, number>>({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [score, setScore] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<'content' | 'takeaways' | 'quiz'>('content');

  // Reset modal state when module changes or opens
  useEffect(() => {
    if (isOpen && module) {
      setUserAnswers({});
      setIsSubmitted(false);
      setScore(null);
      setActiveTab('content');
      setIsPlaying(false);
      setCurrentTime(0);
    }
  }, [isOpen, module]);

  // Early exit AFTER all hooks have been declared
  if (!isOpen || !module) return null;

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

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const handleSelectAnswer = (questionId: string, optionIndex: number) => {
    if (isSubmitted) return;
    setUserAnswers(prev => ({ ...prev, [questionId]: optionIndex }));
  };

  const handleSubmitQuiz = () => {
    if (!module.quiz || module.quiz.length === 0) {
      onCompleteModule(module.id, 100);
      return;
    }

    let correctCount = 0;
    module.quiz.forEach(q => {
      if (userAnswers[q.id] === q.correctAnswerIndex) {
        correctCount += 1;
      }
    });

    const calculatedScore = Math.round((correctCount / module.quiz.length) * 100);
    setScore(calculatedScore);
    setIsSubmitted(true);
    onCompleteModule(module.id, calculatedScore);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/70 backdrop-blur-xs p-3 sm:p-5 overflow-y-auto">
      <div className="bg-white rounded-2xl border border-zinc-200 shadow-2xl w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Modal Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-zinc-900 via-teal-950 to-zinc-900 text-white flex items-start justify-between border-b border-teal-800/40 shrink-0">
          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-xl bg-teal-500/20 border border-teal-400/30 text-teal-300 shrink-0 mt-0.5">
              {module.type === 'video' ? (
                <GraduationCap className="w-6 h-6 text-teal-300" />
              ) : (
                <BookOpen className="w-6 h-6 text-teal-300" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-teal-500/30 text-teal-200 border border-teal-400/40">
                  {module.category}
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-zinc-800 text-zinc-300 flex items-center gap-1 border border-zinc-700">
                  <Clock className="w-3 h-3 text-teal-400" />
                  {module.durationMinutes} min
                </span>
                {module.suggestedByNexa && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 border border-amber-400/30 flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-amber-300" />
                    Sugerido por Nexa IA
                  </span>
                )}
              </div>
              <h2 className="text-base sm:text-lg font-black text-white leading-snug">
                {module.title}
              </h2>
              <p className="text-xs text-zinc-300 mt-1 line-clamp-1">
                {module.description}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors shrink-0"
            title="Fechar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Nexa AI Context Banner */}
        <div className="px-5 py-2.5 bg-amber-500/10 border-b border-amber-500/20 text-amber-900 flex items-center gap-2.5 text-xs">
          <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
          <div className="flex-1">
            <span className="font-extrabold text-amber-950">Gatilho Clínico Identificado: </span>
            <span className="text-amber-900">{module.clinicalTrigger}</span>
          </div>
        </div>

        {/* Modal Nav Tabs */}
        <div className="flex border-b border-zinc-200 bg-zinc-50 px-5 shrink-0">
          <button
            onClick={() => setActiveTab('content')}
            className={`py-3 px-4 font-bold text-xs border-b-2 flex items-center gap-2 transition-colors ${
              activeTab === 'content'
                ? 'border-teal-600 text-teal-700 bg-white'
                : 'border-transparent text-zinc-500 hover:text-zinc-800'
            }`}
          >
            {module.type === 'video' ? <Play className="w-3.5 h-3.5 text-teal-600" /> : <FileText className="w-3.5 h-3.5 text-teal-600" />}
            <span>{module.type === 'video' ? 'Vídeo da Aula' : 'Guia Operacional (POP)'}</span>
          </button>

          <button
            onClick={() => setActiveTab('takeaways')}
            className={`py-3 px-4 font-bold text-xs border-b-2 flex items-center gap-2 transition-colors ${
              activeTab === 'takeaways'
                ? 'border-teal-600 text-teal-700 bg-white'
                : 'border-transparent text-zinc-500 hover:text-zinc-800'
            }`}
          >
            <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
            <span>Pontos-Chave ({module.keyTakeaways.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('quiz')}
            className={`py-3 px-4 font-bold text-xs border-b-2 flex items-center gap-2 transition-colors ${
              activeTab === 'quiz'
                ? 'border-teal-600 text-teal-700 bg-white'
                : 'border-transparent text-zinc-500 hover:text-zinc-800'
            }`}
          >
            <HelpCircle className="w-3.5 h-3.5 text-purple-600" />
            <span>Teste de Fixação ({module.quiz.length} quest.)</span>
            {isSubmitted && (
              <span className="ml-1 text-[10px] font-black px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                {score}%
              </span>
            )}
          </button>
        </div>

        {/* Tab Content Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5 bg-zinc-50/50">
          
          {/* TAB 1: Content (Video or Guide) */}
          {activeTab === 'content' && (
            <div className="space-y-4">
              {module.type === 'video' ? (
                <div className="rounded-2xl overflow-hidden bg-zinc-950 border border-zinc-800 shadow-lg relative space-y-0">
                  
                  {/* Player Engine Switcher Bar */}
                  <div className="bg-zinc-900/95 px-4 py-2 border-b border-zinc-800 flex items-center justify-between flex-wrap gap-2 text-xs">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[11px] font-bold text-zinc-400">Modo de Exibição:</span>
                      <div className="flex rounded-lg bg-zinc-800 p-0.5 border border-zinc-700">
                        <button
                          type="button"
                          onClick={() => setPlayerMode('youtube')}
                          className={`px-2.5 py-1 rounded-md text-[11px] font-extrabold flex items-center gap-1.5 transition-all ${
                            playerMode === 'youtube'
                              ? 'bg-rose-600 text-white shadow-xs'
                              : 'text-zinc-400 hover:text-white'
                          }`}
                        >
                          <Youtube className="w-3.5 h-3.5" />
                          <span>YouTube Oficial</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setPlayerMode('local')}
                          className={`px-2.5 py-1 rounded-md text-[11px] font-extrabold flex items-center gap-1.5 transition-all ${
                            playerMode === 'local'
                              ? 'bg-teal-600 text-white shadow-xs'
                              : 'text-zinc-400 hover:text-white'
                          }`}
                        >
                          <Film className="w-3.5 h-3.5" />
                          <span>Vídeo HD Local</span>
                        </button>
                      </div>
                    </div>

                    {(module.youtubeUrl || module.youtubeId) && (
                      <a
                        href={getYoutubeWatchUrl(module.youtubeUrl || module.youtubeId)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-teal-400 hover:text-teal-300 font-bold flex items-center gap-1 transition-colors text-[11px] bg-zinc-800/80 hover:bg-zinc-700 px-2.5 py-1 rounded-lg border border-zinc-700"
                      >
                        <span>Abrir no YouTube</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>

                  {/* Video Box */}
                  <div className="aspect-video relative bg-zinc-950 flex items-center justify-center overflow-hidden">
                    {playerMode === 'youtube' && (module.youtubeId || module.youtubeUrl) ? (
                      <iframe
                        src={getYoutubeEmbedUrl(module.youtubeId || module.youtubeUrl)}
                        title={module.title}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                        allowFullScreen
                        referrerPolicy="strict-origin-when-cross-origin"
                        className="w-full h-full border-0"
                      ></iframe>
                    ) : (
                      <div className="w-full h-full relative bg-zinc-950 flex items-center justify-center">
                        <video
                          ref={videoRef}
                          src={module.videoUrl || 'https://assets.mixkit.co/videos/preview/mixkit-doctor-checking-a-patients-medical-chart-41551-large.mp4'}
                          poster={module.thumbnailUrl}
                          onTimeUpdate={handleTimeUpdate}
                          onLoadedMetadata={handleTimeUpdate}
                          controls
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                  </div>

                  {/* YouTube Player Metadata Controls */}
                  <div className="bg-zinc-900 px-4 py-3 border-t border-zinc-800 flex items-center justify-between text-xs text-zinc-300">
                    <div className="flex items-center gap-2">
                      {playerMode === 'youtube' ? (
                        <Youtube className="w-4 h-4 text-rose-500 shrink-0" />
                      ) : (
                        <Film className="w-4 h-4 text-teal-400 shrink-0" />
                      )}
                      <span className="font-bold text-white">
                        {playerMode === 'youtube' ? 'Transmissão Integrada YouTube' : 'Transmissão Direta HD NexaMed'}
                      </span>
                      <span className="hidden sm:inline text-[10px] text-teal-300 bg-teal-950/80 px-2 py-0.5 rounded border border-teal-800">
                        1080p • Áudio Estéreo
                      </span>
                    </div>

                    <span className="text-[11px] text-zinc-400">
                      {module.durationMinutes} min de capacitação
                    </span>
                  </div>
                </div>
              ) : (
                /* POP Guide Mode */
                <div className="bg-white p-5 rounded-2xl border border-zinc-200 shadow-2xs space-y-4 text-zinc-800">
                  <div className="flex items-center gap-2 text-xs font-bold text-teal-800 bg-teal-50 px-3 py-1.5 rounded-xl border border-teal-200">
                    <ShieldCheck className="w-4 h-4 text-teal-600 shrink-0" />
                    <span>Procedimento Operacional Padrão (POP) Institucional NexaMed</span>
                  </div>

                  <div className="prose prose-sm max-w-none text-zinc-700 whitespace-pre-wrap leading-relaxed font-sans">
                    {module.guideContent || module.description}
                  </div>
                </div>
              )}

              {/* AI Rationale Explanation Box */}
              <div className="p-4 rounded-xl bg-teal-50/80 border border-teal-200/80 text-xs text-teal-900 space-y-1.5">
                <div className="flex items-center gap-2 font-bold text-teal-950">
                  <Sparkles className="w-4 h-4 text-teal-600" />
                  <span>Por que este treinamento foi recomendado para você?</span>
                </div>
                <p className="text-zinc-700 leading-relaxed">
                  {module.aiReasoning}
                </p>
              </div>
            </div>
          )}

          {/* TAB 2: Key Takeaways */}
          {activeTab === 'takeaways' && (
            <div className="space-y-4">
              <div className="bg-white p-5 rounded-2xl border border-zinc-200 shadow-2xs space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-zinc-100">
                  <div className="flex items-center gap-2">
                    <Lightbulb className="w-5 h-5 text-amber-500" />
                    <h3 className="font-bold text-sm text-zinc-900">
                      Diretrizes e Regras de Segurança
                    </h3>
                  </div>
                  <span className="text-xs font-bold text-zinc-400">
                    {module.keyTakeaways.length} pontos obrigatórios
                  </span>
                </div>

                <ul className="space-y-3">
                  {module.keyTakeaways.map((takeaway, idx) => (
                    <li key={idx} className="flex items-start gap-3 p-3 rounded-xl bg-zinc-50 border border-zinc-200/80">
                      <div className="p-1 rounded-md bg-teal-100 text-teal-800 shrink-0 mt-0.5 font-black text-xs w-6 h-6 flex items-center justify-center">
                        {idx + 1}
                      </div>
                      <p className="text-xs text-zinc-800 font-medium leading-relaxed">
                        {takeaway}
                      </p>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="p-4 rounded-xl bg-purple-50 border border-purple-200 text-purple-900 text-xs flex items-center gap-3">
                <Award className="w-5 h-5 text-purple-600 shrink-0" />
                <div>
                  <p className="font-bold text-purple-950">Validação Automática em Prontuário</p>
                  <p className="text-purple-800 mt-0.5">
                    Ao concluir a leitura dos pontos-chave e passar no teste de fixação, este micro-learning ficará registrado no seu histórico profissional.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: Quiz */}
          {activeTab === 'quiz' && (
            <div className="space-y-5">
              <div className="bg-white p-5 rounded-2xl border border-zinc-200 shadow-2xs space-y-6">
                <div className="flex items-center justify-between pb-3 border-b border-zinc-100">
                  <div>
                    <h3 className="font-bold text-sm text-zinc-900">
                      Teste de Fixação de Conhecimento
                    </h3>
                    <p className="text-xs text-zinc-500 mt-0.5">
                      Responda às questões para garantir a compreensão do protocolo clínico.
                    </p>
                  </div>

                  {isSubmitted && score !== null && (
                    <div className={`px-3 py-1.5 rounded-xl border flex items-center gap-2 text-xs font-black ${
                      score >= 70
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                        : 'bg-rose-50 text-rose-800 border-rose-200'
                    }`}>
                      <Award className="w-4 h-4" />
                      <span>Nota: {score}%</span>
                    </div>
                  )}
                </div>

                <div className="space-y-6">
                  {module.quiz.map((q, qIndex) => {
                    const selectedOpt = userAnswers[q.id];
                    const isCorrect = isSubmitted && selectedOpt === q.correctAnswerIndex;
                    const isWrong = isSubmitted && selectedOpt !== undefined && selectedOpt !== q.correctAnswerIndex;

                    return (
                      <div key={q.id} className="p-4 rounded-xl bg-zinc-50 border border-zinc-200/80 space-y-3">
                        <div className="flex items-start gap-2">
                          <span className="text-xs font-black text-teal-800 bg-teal-100 px-2 py-0.5 rounded-md">
                            Q{qIndex + 1}
                          </span>
                          <p className="text-xs font-bold text-zinc-900 leading-snug">
                            {q.question}
                          </p>
                        </div>

                        <div className="space-y-2 pl-2">
                          {q.options.map((option, optIndex) => {
                            const isThisSelected = selectedOpt === optIndex;
                            let optionStyle = "bg-white border-zinc-200 hover:border-teal-400 text-zinc-700";

                            if (isSubmitted) {
                              if (optIndex === q.correctAnswerIndex) {
                                optionStyle = "bg-emerald-50 border-emerald-400 text-emerald-950 font-bold";
                              } else if (isThisSelected && optIndex !== q.correctAnswerIndex) {
                                optionStyle = "bg-rose-50 border-rose-400 text-rose-950 line-through";
                              }
                            } else if (isThisSelected) {
                              optionStyle = "bg-teal-50 border-teal-500 text-teal-950 font-bold ring-2 ring-teal-500/20";
                            }

                            return (
                              <button
                                key={optIndex}
                                disabled={isSubmitted}
                                onClick={() => handleSelectAnswer(q.id, optIndex)}
                                className={`w-full text-left p-3 rounded-xl border text-xs transition-all flex items-center justify-between ${optionStyle}`}
                              >
                                <span>{option}</span>
                                {isSubmitted && optIndex === q.correctAnswerIndex && (
                                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 ml-2" />
                                )}
                              </button>
                            );
                          })}
                        </div>

                        {/* Explanation block when submitted */}
                        {isSubmitted && (
                          <div className="mt-2 p-3 rounded-lg bg-teal-50/80 border border-teal-200 text-[11px] text-teal-900 flex items-start gap-2">
                            <Sparkles className="w-3.5 h-3.5 text-teal-600 shrink-0 mt-0.5" />
                            <div>
                              <span className="font-bold">Explicação Clínica: </span>
                              <span>{q.explanation}</span>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Submit Quiz Action */}
                {!isSubmitted ? (
                  <button
                    onClick={handleSubmitQuiz}
                    disabled={Object.keys(userAnswers).length < module.quiz.length}
                    className="w-full py-3 px-4 bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-md transition-colors flex items-center justify-center gap-2"
                  >
                    <Check className="w-4 h-4 stroke-[3]" />
                    <span>Finalizar Teste e Concluir Micro-Learning</span>
                  </button>
                ) : (
                  <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-center space-y-2">
                    <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
                    <p className="font-black text-sm text-emerald-950">
                      Micro-Learning Concluído com Sucesso!
                    </p>
                    <p className="text-xs text-emerald-800">
                      Sua pontuação de {score}% foi registrada e o status de sua pendência clínica foi atualizado no perfil da equipe.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-white border-t border-zinc-200 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2 text-xs text-zinc-500 font-medium">
            <ShieldCheck className="w-4 h-4 text-teal-600" />
            <span>Certificado digital registrado sob LGPD & Anvisa RDC 502</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 font-bold text-xs rounded-xl transition-colors"
            >
              Fechar
            </button>
            {activeTab !== 'quiz' && (
              <button
                onClick={() => setActiveTab('quiz')}
                className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-xl transition-colors flex items-center gap-1.5"
              >
                <span>Ir para o Teste</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
