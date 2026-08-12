import React, { useState, useEffect } from 'react';
import { Resident } from '../types';
import { 
  Video, 
  VideoOff, 
  Mic, 
  MicOff, 
  PhoneOff, 
  Sparkles, 
  FileText, 
  ShieldCheck, 
  X, 
  CheckCircle2, 
  Pill, 
  Download, 
  AlertCircle,
  Activity,
  UserCheck
} from 'lucide-react';

interface TelehealthModalProps {
  isOpen: boolean;
  onClose: () => void;
  resident: Resident | null;
  onSaveSOAPNote?: (residentId: string, soapData: any) => void;
}

export const TelehealthModal: React.FC<TelehealthModalProps> = ({
  isOpen,
  onClose,
  resident,
  onSaveSOAPNote
}) => {
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isMicOn, setIsMicOn] = useState(true);
  const [isRecording, setIsRecording] = useState(true);
  const [liveTranscription, setLiveTranscription] = useState<string[]>([
    'Dr. Fernando (Psiquiatra): Olá, como o Sr. Mário tem se sentido hoje em relação às oscilações de humor?',
    'Acompanhante / Enfermagem: Ele dormiu bem durante a noite, porém relatou leve agitação no início da manhã antes da medicação.',
    'Dr. Fernando: Entendido. Mantemos a quetiapina prescrita e observamos por mais 48 horas.'
  ]);
  const [aiSOAPSummary, setAiSOAPSummary] = useState({
    subjective: 'Residente calmo durante a videochamada, acompanhado pela equipe de enfermagem. Nega ideação suicida recente.',
    objective: 'NEWS2 Estável (1 ponto). Orientado em tempo e espaço. Fala articulada, sem tremores acentuados.',
    assessment: 'Transtorno do Humor Estável. Boa tolerância ao esquema farmacológico atual.',
    plan: 'Manter dose de Quetiapina 100mg à noite. Reavaliar presencialmente em 14 dias.'
  });
  const [isSaved, setIsSaved] = useState(false);

  // Simulate incoming transcription lines
  useEffect(() => {
    if (!isOpen || !resident || !isRecording) return;
    const timer = setTimeout(() => {
      setLiveTranscription(prev => [
        ...prev,
        `Assistente IA Transcrição: [Análise de Humor Automática]: Nível de estresse vocal baixo (0.12). Sinais vitais dentro da normalidade.`
      ]);
    }, 4000);
    return () => clearTimeout(timer);
  }, [isOpen, resident, isRecording]);

  if (!isOpen || !resident) return null;

  const handleFinishConsultation = () => {
    if (onSaveSOAPNote && resident) {
      onSaveSOAPNote(resident.id, aiSOAPSummary);
    }
    setIsSaved(true);
    setTimeout(() => {
      setIsSaved(false);
      onClose();
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-5">
      <div className="bg-zinc-950 border border-zinc-800 text-white rounded-3xl w-full max-w-5xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="p-4 bg-zinc-900 border-b border-zinc-800 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-purple-400">
              <Video className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-white">Teleconsulta Psiquiátrica & Transcrição IA</h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  Resolução CFM 2.314/2022 Compliant
                </span>
              </div>
              <p className="text-xs text-zinc-400">
                Atendimento remoto criptografado ponto-a-ponto com sintese evolutiva SOAP em tempo real.
              </p>
            </div>
          </div>

          <button 
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-0 text-xs">
          
          {/* Left Column: Simulated Video Screen & Controls */}
          <div className="lg:col-span-7 bg-zinc-900/90 p-4 border-r border-zinc-800 flex flex-col justify-between space-y-4">
            
            {/* Main Video Box */}
            <div className="relative bg-zinc-950 border border-zinc-800 rounded-2xl h-72 sm:h-80 overflow-hidden flex items-center justify-center shadow-inner group">
              {isVideoOn ? (
                <div className="absolute inset-0 bg-gradient-to-br from-zinc-900 via-zinc-950 to-purple-950/40 flex flex-col items-center justify-center">
                  <img 
                    src={resident.photoUrl} 
                    alt={resident.name} 
                    className="w-24 h-24 rounded-full object-cover border-2 border-teal-500 shadow-xl mb-3"
                  />
                  <span className="text-sm font-bold text-white">{resident.name}</span>
                  <span className="text-xs text-zinc-400">Quarto {resident.room} • Transmissão em HD Seguro</span>

                  {/* Doctor Picture-in-Picture */}
                  <div className="absolute bottom-3 right-3 w-28 h-20 rounded-xl border border-teal-500/50 bg-zinc-900 shadow-lg overflow-hidden flex flex-col items-center justify-center">
                    <UserCheck className="w-5 h-5 text-teal-400 mb-1" />
                    <span className="text-[10px] font-bold text-white">Dr. Fernando</span>
                    <span className="text-[9px] text-zinc-400">CRM 148290-SP</span>
                  </div>
                </div>
              ) : (
                <div className="text-center text-zinc-500 space-y-2">
                  <VideoOff className="w-10 h-10 mx-auto text-zinc-600" />
                  <p>Câmera desativada</p>
                </div>
              )}

              {/* Status Bar Top Overlay */}
              <div className="absolute top-3 left-3 flex items-center gap-2">
                <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 text-[10px] font-bold">
                  <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                  REC • Gravando & Auditando
                </span>
                <span className="px-2 py-1 rounded bg-zinc-900/80 text-zinc-300 border border-zinc-700 text-[10px] font-mono">
                  04:18 min
                </span>
              </div>
            </div>

            {/* Video Controls Toolbar */}
            <div className="flex items-center justify-center gap-3 bg-zinc-950 p-3 rounded-2xl border border-zinc-800">
              <button
                onClick={() => setIsMicOn(!isMicOn)}
                className={`p-3 rounded-xl border transition-all ${
                  isMicOn ? 'bg-zinc-800 text-white border-zinc-700 hover:bg-zinc-700' : 'bg-rose-900/40 text-rose-300 border-rose-800'
                }`}
                title={isMicOn ? 'Mutar Microfone' : 'Ativar Microfone'}
              >
                {isMicOn ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
              </button>

              <button
                onClick={() => setIsVideoOn(!isVideoOn)}
                className={`p-3 rounded-xl border transition-all ${
                  isVideoOn ? 'bg-zinc-800 text-white border-zinc-700 hover:bg-zinc-700' : 'bg-rose-900/40 text-rose-300 border-rose-800'
                }`}
                title={isVideoOn ? 'Desativar Vídeo' : 'Ativar Vídeo'}
              >
                {isVideoOn ? <Video className="w-4 h-4" /> : <VideoOff className="w-4 h-4" />}
              </button>

              <button
                onClick={handleFinishConsultation}
                className="px-5 py-3 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl transition-all shadow-md flex items-center gap-2"
              >
                <PhoneOff className="w-4 h-4" />
                Encerrar & Salvar Prontuário
              </button>
            </div>

            {/* Live Audio Transcript Feed */}
            <div className="bg-zinc-950 border border-zinc-800 p-3 rounded-xl space-y-2">
              <span className="text-[10px] font-bold text-teal-400 uppercase tracking-wider flex items-center gap-1">
                <Activity className="w-3.5 h-3.5" /> Transcrição Contínua de Voz (NLP)
              </span>
              <div className="max-h-24 overflow-y-auto space-y-1 text-[11px] font-mono text-zinc-300">
                {liveTranscription.map((line, idx) => (
                  <p key={idx} className="bg-zinc-900/60 p-1.5 rounded border border-zinc-800/80">{line}</p>
                ))}
              </div>
            </div>

          </div>

          {/* Right Column: AI Auto-Generated SOAP Note & Actions */}
          <div className="lg:col-span-5 p-4 bg-zinc-950 space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
                <span className="font-bold text-xs text-white flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-teal-400" />
                  Evolução SOAP Gerada por IA
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-teal-500/20 text-teal-300 border border-teal-500/30">
                  Rascunho Automático
                </span>
              </div>

              <div className="space-y-2 text-[11px]">
                <div className="p-2.5 bg-zinc-900 rounded-xl border border-zinc-800">
                  <strong className="text-teal-400 block mb-0.5">Subjetivo (S):</strong>
                  <textarea
                    value={aiSOAPSummary.subjective}
                    onChange={(e) => setAiSOAPSummary({ ...aiSOAPSummary, subjective: e.target.value })}
                    className="w-full bg-transparent text-zinc-300 focus:outline-none resize-none h-12"
                  />
                </div>

                <div className="p-2.5 bg-zinc-900 rounded-xl border border-zinc-800">
                  <strong className="text-teal-400 block mb-0.5">Objetivo (O):</strong>
                  <textarea
                    value={aiSOAPSummary.objective}
                    onChange={(e) => setAiSOAPSummary({ ...aiSOAPSummary, objective: e.target.value })}
                    className="w-full bg-transparent text-zinc-300 focus:outline-none resize-none h-12"
                  />
                </div>

                <div className="p-2.5 bg-zinc-900 rounded-xl border border-zinc-800">
                  <strong className="text-teal-400 block mb-0.5">Avaliação (A):</strong>
                  <textarea
                    value={aiSOAPSummary.assessment}
                    onChange={(e) => setAiSOAPSummary({ ...aiSOAPSummary, assessment: e.target.value })}
                    className="w-full bg-transparent text-zinc-300 focus:outline-none resize-none h-12"
                  />
                </div>

                <div className="p-2.5 bg-zinc-900 rounded-xl border border-zinc-800">
                  <strong className="text-teal-400 block mb-0.5">Plano (P):</strong>
                  <textarea
                    value={aiSOAPSummary.plan}
                    onChange={(e) => setAiSOAPSummary({ ...aiSOAPSummary, plan: e.target.value })}
                    className="w-full bg-transparent text-zinc-300 focus:outline-none resize-none h-12"
                  />
                </div>
              </div>
            </div>

            {/* Action Bar */}
            <div className="pt-3 border-t border-zinc-800 space-y-2">
              {isSaved && (
                <div className="p-2 bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 rounded-xl text-center font-bold flex items-center justify-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  Atendimento Finalizado e Registrado no Prontuário 360°!
                </div>
              )}

              <button
                onClick={handleFinishConsultation}
                className="w-full py-2.5 bg-teal-600 hover:bg-teal-500 text-white font-bold rounded-xl transition-all shadow-md flex items-center justify-center gap-2 text-xs"
              >
                <FileText className="w-4 h-4" />
                Validar & Salvar no Prontuário Eletrônico (PEP)
              </button>
            </div>

          </div>

        </div>

        {/* Footer */}
        <div className="p-3 bg-zinc-950 border-t border-zinc-800 flex items-center justify-between text-[11px] text-zinc-500">
          <span className="flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-teal-400" />
            Atendimento protegido por Criptografia AES-256 e LGPD Art. 11
          </span>
          <span>Sessão ID: TH-{Date.now().toString().slice(-6)}</span>
        </div>

      </div>
    </div>
  );
};
