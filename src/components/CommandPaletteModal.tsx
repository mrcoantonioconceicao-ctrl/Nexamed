import React, { useState, useEffect } from 'react';
import { Resident, ClinicalAlert } from '../types';
import { 
  Search, 
  X, 
  User, 
  Activity, 
  FileText, 
  Sparkles, 
  Clock, 
  ShieldAlert, 
  Pill, 
  Building2, 
  ChevronRight,
  Radio,
  Video,
  GraduationCap,
  Apple,
  Droplet
} from 'lucide-react';

interface CommandPaletteModalProps {
  isOpen: boolean;
  onClose: () => void;
  residents: Resident[];
  alerts: ClinicalAlert[];
  onNavigate: (path: string) => void;
  onOpenResident360: (residentId: string) => void;
  onOpenIoTTelemetry: (resident: Resident) => void;
  onOpenNewEvolution: (residentId?: string) => void;
  onOpenTelehealth: (resident: Resident) => void;
}

export const CommandPaletteModal: React.FC<CommandPaletteModalProps> = ({
  isOpen,
  onClose,
  residents,
  alerts,
  onNavigate,
  onOpenResident360,
  onOpenIoTTelemetry,
  onOpenNewEvolution,
  onOpenTelehealth
}) => {
  const [query, setQuery] = useState('');

  // Keyboard shortcut ESC
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const filteredResidents = residents.filter(r => 
    r.name.toLowerCase().includes(query.toLowerCase()) ||
    r.primaryDiagnosis.toLowerCase().includes(query.toLowerCase()) ||
    r.room.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-start justify-center pt-20 px-4">
      <div className="bg-zinc-900 border border-zinc-800 text-white rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Search Bar Input */}
        <div className="p-4 bg-zinc-950 border-b border-zinc-800 flex items-center gap-3">
          <Search className="w-5 h-5 text-teal-400 shrink-0" />
          <input
            type="text"
            autoFocus
            placeholder="Digite para buscar residentes, ações rápidas, telemetria ou comandos..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-transparent text-sm text-white placeholder-zinc-500 focus:outline-none"
          />
          <button 
            onClick={onClose}
            className="px-2 py-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white rounded-lg text-xs font-mono transition-colors"
          >
            ESC
          </button>
        </div>

        {/* Command Body */}
        <div className="p-4 max-h-[420px] overflow-y-auto space-y-4 text-xs">
          
          {/* Quick Actions Shortcuts */}
          {!query && (
            <div className="space-y-2">
              <span className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider block">
                Ações Rápidas & Módulos
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <button
                  onClick={() => {
                    onClose();
                    onOpenNewEvolution();
                  }}
                  className="p-3 bg-zinc-800/80 hover:bg-teal-950/60 hover:border-teal-700/60 border border-zinc-700/60 rounded-xl transition-all flex items-center justify-between text-left group"
                >
                  <div className="flex items-center gap-2.5">
                    <FileText className="w-4 h-4 text-teal-400 group-hover:scale-110 transition-transform" />
                    <div>
                      <strong className="block text-white">Nova Evolução SOAP</strong>
                      <span className="text-[10px] text-zinc-400">Registrar atendimento clínico</span>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-zinc-600 group-hover:text-teal-400" />
                </button>

                <button
                  onClick={() => {
                    onClose();
                    onNavigate('/medicacao');
                  }}
                  className="p-3 bg-zinc-800/80 hover:bg-amber-950/60 hover:border-amber-700/60 border border-zinc-700/60 rounded-xl transition-all flex items-center justify-between text-left group"
                >
                  <div className="flex items-center gap-2.5">
                    <Pill className="w-4 h-4 text-amber-400 group-hover:scale-110 transition-transform" />
                    <div>
                      <strong className="block text-white">Etiquetas de Medicação (MAR)</strong>
                      <span className="text-[10px] text-zinc-400">Imprimir etiquetas por residente</span>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-zinc-600 group-hover:text-amber-400" />
                </button>

                <button
                  onClick={() => {
                    onClose();
                    onNavigate('/usuarios');
                  }}
                  className="p-3 bg-zinc-800/80 hover:bg-purple-950/60 hover:border-purple-700/60 border border-zinc-700/60 rounded-xl transition-all flex items-center justify-between text-left group"
                >
                  <div className="flex items-center gap-2.5">
                    <User className="w-4 h-4 text-purple-400 group-hover:scale-110 transition-transform" />
                    <div>
                      <strong className="block text-white">Gestão de Usuários & Senhas</strong>
                      <span className="text-[10px] text-zinc-400">Liberar acesso por cargo (Direção)</span>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-zinc-600 group-hover:text-purple-400" />
                </button>

                <button
                  onClick={() => {
                    onClose();
                    onNavigate('/triagem-nutricional');
                  }}
                  className="p-3 bg-zinc-800/80 hover:bg-teal-950/60 hover:border-teal-700/60 border border-zinc-700/60 rounded-xl transition-all flex items-center justify-between text-left group"
                >
                  <div className="flex items-center gap-2.5">
                    <Apple className="w-4 h-4 text-teal-400 group-hover:scale-110 transition-transform" />
                    <div>
                      <strong className="block text-white">Triagem Nutricional & Ingestão (Gemini IA)</strong>
                      <span className="text-[10px] text-zinc-400">Avaliar peso, calorias e ajustes dietéticos</span>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-zinc-600 group-hover:text-teal-400" />
                </button>

                <button
                  onClick={() => {
                    onClose();
                    onNavigate('/controle-diabetes');
                  }}
                  className="p-3 bg-zinc-800/80 hover:bg-emerald-950/60 hover:border-emerald-700/60 border border-zinc-700/60 rounded-xl transition-all flex items-center justify-between text-left group"
                >
                  <div className="flex items-center gap-2.5">
                    <Droplet className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform" />
                    <div>
                      <strong className="block text-white">Controle de Diabetes (SRT)</strong>
                      <span className="text-[10px] text-zinc-400">DDD, BPMN 2.0, GraphRAG, MCP & 2 Residentes</span>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-zinc-600 group-hover:text-emerald-400" />
                </button>

                <button
                  onClick={() => {
                    onClose();
                    onNavigate('/micro-learning');
                  }}
                  className="p-3 bg-zinc-800/80 hover:bg-emerald-950/60 hover:border-emerald-700/60 border border-zinc-700/60 rounded-xl transition-all flex items-center justify-between text-left group"
                >
                  <div className="flex items-center gap-2.5">
                    <GraduationCap className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform" />
                    <div>
                      <strong className="block text-white">Micro-learning Equipe (Nexa IA)</strong>
                      <span className="text-[10px] text-zinc-400">Aulas curtas baseadas em pendências</span>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-zinc-600 group-hover:text-emerald-400" />
                </button>
              </div>
            </div>
          )}

          {/* Resident Results */}
          <div className="space-y-2">
            <span className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider block">
              Residentes Encontrados ({filteredResidents.length})
            </span>

            <div className="space-y-1.5">
              {filteredResidents.map((res) => (
                <div 
                  key={res.id} 
                  className="p-3 bg-zinc-800/50 hover:bg-zinc-800 border border-zinc-700/40 rounded-xl flex items-center justify-between transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <img 
                      src={res.photoUrl} 
                      alt={res.name} 
                      className="w-9 h-9 rounded-full object-cover border border-teal-500/30"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <strong className="text-white font-bold">{res.name}</strong>
                        <span className="text-[10px] text-zinc-400 font-mono">Quarto {res.room}</span>
                        <span className={`px-1.5 py-0.2 rounded text-[10px] font-bold ${
                          res.news2?.riskLevel === 'Crítico' ? 'bg-rose-900/60 text-rose-300' :
                          res.news2?.riskLevel === 'Moderado' ? 'bg-amber-900/60 text-amber-300' : 'bg-emerald-900/60 text-emerald-300'
                        }`}>
                          NEWS2: {res.news2?.totalScore ?? '0'}
                        </span>
                      </div>
                      <p className="text-[11px] text-zinc-400 truncate max-w-sm">{res.primaryDiagnosis}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => {
                        onClose();
                        onOpenTelehealth(res);
                      }}
                      className="px-2.5 py-1 bg-purple-600/30 hover:bg-purple-600 text-purple-200 hover:text-white border border-purple-500/40 rounded-lg text-[11px] font-bold transition-all flex items-center gap-1"
                      title="Iniciar Teleconsulta Psiquiátrica"
                    >
                      <Video className="w-3 h-3" />
                      Telemed
                    </button>

                    <button
                      onClick={() => {
                        onClose();
                        onOpenIoTTelemetry(res);
                      }}
                      className="px-2.5 py-1 bg-teal-600/30 hover:bg-teal-600 text-teal-200 hover:text-white border border-teal-500/40 rounded-lg text-[11px] font-bold transition-all flex items-center gap-1"
                      title="Telemetria de Vitais"
                    >
                      <Radio className="w-3 h-3" />
                      IoT
                    </button>

                    <button
                      onClick={() => {
                        onClose();
                        onOpenResident360(res.id);
                      }}
                      className="px-2.5 py-1 bg-zinc-700 hover:bg-zinc-600 text-white rounded-lg text-[11px] font-semibold transition-colors"
                    >
                      Prontuário 360°
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="p-3 bg-zinc-950 border-t border-zinc-800 flex items-center justify-between text-[11px] text-zinc-500">
          <span className="flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-teal-400" />
            NexaMed Enterprise Command Engine v2.5
          </span>
          <span className="font-mono text-zinc-600">Navegue com setas ou mouse</span>
        </div>

      </div>
    </div>
  );
};
