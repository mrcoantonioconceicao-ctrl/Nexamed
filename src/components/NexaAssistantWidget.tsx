import React, { useState, useEffect, useRef } from 'react';
import { 
  Sparkles, 
  X, 
  Send, 
  Search, 
  ArrowRight, 
  Check, 
  ShieldAlert, 
  Pill, 
  CalendarRange, 
  Users, 
  FileText, 
  ClipboardCheck,
  Bot
} from 'lucide-react';
import { NexaMessage, NexaAction, Resident, ClinicalAlert, ClinicalEvolution } from '../types';

interface NexaAssistantWidgetProps {
  isOpen: boolean;
  onClose: () => void;
  isCommandBarOpen: boolean;
  onCloseCommandBar: () => void;
  onNavigate: (path: string) => void;
  onOpenResident: (residentId: string) => void;
  onOpenNewEvolution: (residentId?: string) => void;
  onMarkAlertsRead: () => void;
  residents: Resident[];
  alerts: ClinicalAlert[];
  evolutions: ClinicalEvolution[];
  contextPage: string;
}

export const NexaAssistantWidget: React.FC<NexaAssistantWidgetProps> = ({
  isOpen,
  onClose,
  isCommandBarOpen,
  onCloseCommandBar,
  onNavigate,
  onOpenResident,
  onOpenNewEvolution,
  onMarkAlertsRead,
  residents,
  alerts,
  evolutions,
  contextPage,
}) => {
  const [messages, setMessages] = useState<NexaMessage[]>([
    {
      id: 'msg-init',
      sender: 'nexa',
      text: 'Olá! Sou a Nexa, sua assistente clínica inteligente na plataforma NexaMed. 👋\n\nPosso tirar **todas as suas dúvidas** sobre o sistema, explicar onde fica qualquer comando ou tela, e também **gerar todo tipo de trabalho** (redigir evoluções SOAP, resumir plantões, auditar medicações e relatórios de intercorrências)!\n\nComo posso te ajudar agora?',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      actions: [
        {
          type: 'navigate',
          payload: { path: '/dashboard' },
          label: '❓ Onde achar todos os comandos?',
        },
        {
          type: 'create_evolution',
          payload: {},
          label: '✍️ Gerar Evolução SOAP com IA',
        },
        {
          type: 'navigate',
          payload: { path: '/relatorios' },
          label: '📊 Ver Relatórios & Intercorrências',
        }
      ]
    }
  ]);

  const [inputQuery, setInputQuery] = useState('');
  const [commandQuery, setCommandQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom of chat
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  // Handle Command Bar shortcut ⌘K / Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (isCommandBarOpen) {
          onCloseCommandBar();
        } else {
          // Open command bar
          onClose(); // close side drawer if open
          window.dispatchEvent(new CustomEvent('toggle-command-bar'));
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isCommandBarOpen, onClose, onCloseCommandBar]);

  const handleSendMessage = async (textToSend: string) => {
    if (!textToSend.trim()) return;

    const userMsg: NexaMessage = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages(prev => [...prev, userMsg]);
    setInputQuery('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/nexa/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: textToSend,
          contextPage,
          residentsData: residents.map(r => ({ id: r.id, name: r.name, room: r.room, risk: r.riskScore, diagnosis: r.primaryDiagnosis })),
          alertsData: alerts.filter(a => !a.read),
          recentEvolutions: evolutions.slice(0, 3),
        }),
      });

      const data = await res.json();

      const nexaMsg: NexaMessage = {
        id: `nexa-${Date.now()}`,
        sender: 'nexa',
        text: data.text || 'Processado com sucesso.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        actions: data.actions || [],
      };

      setMessages(prev => [...prev, nexaMsg]);
    } catch (err) {
      console.error('Error querying Nexa:', err);
      setMessages(prev => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          sender: 'nexa',
          text: 'Ocorreu uma falha temporária de comunicação com a assistente Nexa. Por favor, tente novamente.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const executeAction = (action: NexaAction) => {
    if (action.type === 'navigate' && action.payload?.path) {
      onNavigate(action.payload.path);
      onClose();
      onCloseCommandBar();
    } else if (action.type === 'open_resident' && action.payload?.residentId) {
      onOpenResident(action.payload.residentId);
      onClose();
      onCloseCommandBar();
    } else if (action.type === 'create_evolution') {
      onOpenNewEvolution(action.payload?.residentId);
      onClose();
      onCloseCommandBar();
    } else if (action.type === 'mark_alerts_read') {
      onMarkAlertsRead();
    } else if (action.type === 'open_escala') {
      onNavigate('/escalas');
      onClose();
      onCloseCommandBar();
    }
  };

  // Command bar search filtering
  const filteredResidents = residents.filter(r => 
    r.name.toLowerCase().includes(commandQuery.toLowerCase()) ||
    r.room.toLowerCase().includes(commandQuery.toLowerCase()) ||
    r.primaryDiagnosis.toLowerCase().includes(commandQuery.toLowerCase())
  );

  return (
    <>
      {/* Slide-over Chat Panel */}
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden bg-black/50 backdrop-blur-sm flex justify-end">
          <div className="w-full max-w-lg bg-zinc-900 border-l border-zinc-800 h-full flex flex-col shadow-2xl animate-in slide-in-from-right duration-200">
            {/* Drawer Header */}
            <div className="p-4 bg-zinc-950 border-b border-zinc-800 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-9 h-9 rounded-xl bg-teal-500/20 border border-teal-500/40 flex items-center justify-center text-teal-400">
                  <Bot className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                    Assistente Clínico Nexa
                    <span className="text-[10px] font-semibold text-teal-400 bg-teal-950 px-1.5 py-0.5 rounded border border-teal-800">IA Activa</span>
                  </h3>
                  <p className="text-[11px] text-zinc-400">Contexto atual: {contextPage}</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Prompts Bar */}
            <div className="p-2.5 bg-zinc-950/60 border-b border-zinc-800/80 flex items-center gap-1.5 overflow-x-auto text-[11px] no-scrollbar">
              <button
                onClick={() => handleSendMessage('Onde acho todos os comandos e funções da plataforma?')}
                className="px-2.5 py-1 bg-zinc-800 hover:bg-zinc-700 text-teal-300 rounded-full border border-zinc-700 whitespace-nowrap transition-colors"
              >
                ❓ Onde achar comandos?
              </button>
              <button
                onClick={() => handleSendMessage('Como crio uma evolução clínica no formato SOAP com auxílio de IA?')}
                className="px-2.5 py-1 bg-zinc-800 hover:bg-zinc-700 text-emerald-300 rounded-full border border-zinc-700 whitespace-nowrap transition-colors"
              >
                ✍️ Criar Evolução SOAP
              </button>
              <button
                onClick={() => handleSendMessage('Onde vejo os remédios e dou baixa na medicação de hoje?')}
                className="px-2.5 py-1 bg-zinc-800 hover:bg-zinc-700 text-sky-300 rounded-full border border-zinc-700 whitespace-nowrap transition-colors"
              >
                💊 Checar Medicações (MAR)
              </button>
              <button
                onClick={() => handleSendMessage('Como faço e assino a passagem de plantão?')}
                className="px-2.5 py-1 bg-zinc-800 hover:bg-zinc-700 text-purple-300 rounded-full border border-zinc-700 whitespace-nowrap transition-colors"
              >
                📋 Passagem de Plantão
              </button>
              <button
                onClick={() => handleSendMessage('Como cadastrar um novo residente no sistema?')}
                className="px-2.5 py-1 bg-zinc-800 hover:bg-zinc-700 text-amber-300 rounded-full border border-zinc-700 whitespace-nowrap transition-colors"
              >
                👥 Cadastrar Residente
              </button>
            </div>

            {/* Chat History */}
            <div className="flex-1 p-4 overflow-y-auto space-y-4">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
                >
                  <div
                    className={`max-w-[88%] p-3.5 rounded-2xl text-xs leading-relaxed ${
                      msg.sender === 'user'
                        ? 'bg-teal-600 text-zinc-950 font-medium rounded-br-none shadow-md'
                        : 'bg-zinc-800/90 text-zinc-100 border border-zinc-700/80 rounded-bl-none shadow-md'
                    }`}
                  >
                    <div className="whitespace-pre-wrap font-sans">{msg.text}</div>

                    {/* Action buttons if provided */}
                    {msg.actions && msg.actions.length > 0 && (
                      <div className="mt-3 pt-2.5 border-t border-zinc-700/60 space-y-1.5">
                        <span className="text-[10px] font-bold text-teal-400 uppercase tracking-wider block mb-1">
                          Ações Recomendadas:
                        </span>
                        {msg.actions.map((act, i) => (
                          <button
                            key={i}
                            onClick={() => executeAction(act)}
                            className="w-full text-left px-2.5 py-1.5 bg-zinc-900 hover:bg-zinc-950 text-teal-300 text-[11px] font-semibold rounded-lg border border-teal-800/60 flex items-center justify-between transition-colors group"
                          >
                            <span>{act.label}</span>
                            <ArrowRight className="w-3.5 h-3.5 text-teal-400 group-hover:translate-x-1 transition-transform" />
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  <span className="text-[10px] text-zinc-500 mt-1 px-1">{msg.timestamp}</span>
                </div>
              ))}

              {isLoading && (
                <div className="flex items-center gap-2 p-3 bg-zinc-800/60 rounded-xl text-xs text-teal-300 w-fit animate-pulse border border-zinc-700">
                  <Sparkles className="w-4 h-4 text-teal-400 animate-spin" />
                  <span>IA Nexa analisando registros clínicos...</span>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Bar */}
            <div className="p-3 bg-zinc-950 border-t border-zinc-800">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendMessage(inputQuery);
                }}
                className="flex items-center gap-2"
              >
                <input
                  type="text"
                  value={inputQuery}
                  onChange={(e) => setInputQuery(e.target.value)}
                  placeholder="Pergunte à Nexa ou peça uma ação..."
                  className="flex-1 bg-zinc-900 text-zinc-100 text-xs px-3.5 py-2.5 rounded-xl border border-zinc-700 focus:outline-none focus:border-teal-500"
                />
                <button
                  type="submit"
                  disabled={isLoading || !inputQuery.trim()}
                  className="p-2.5 bg-teal-600 hover:bg-teal-500 disabled:opacity-50 text-zinc-950 font-bold rounded-xl transition-colors"
                >
                  <Send className="w-4 h-4 stroke-[2.5]" />
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Global Command Bar Modal (⌘K) */}
      {isCommandBarOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-start justify-center pt-16 px-4 animate-in fade-in duration-150">
          <div className="w-full max-w-2xl bg-zinc-900 border border-zinc-700 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh]">
            {/* Search Input Bar */}
            <div className="p-3.5 bg-zinc-950 border-b border-zinc-800 flex items-center gap-3">
              <Search className="w-5 h-5 text-teal-400 shrink-0" />
              <input
                type="text"
                autoFocus
                value={commandQuery}
                onChange={(e) => setCommandQuery(e.target.value)}
                placeholder="Busca rápida por residente, medicação, tela ou comando para a Nexa..."
                className="w-full bg-transparent text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none"
              />
              <button
                onClick={onCloseCommandBar}
                className="p-1 text-zinc-500 hover:text-zinc-200 rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3 overflow-y-auto divide-y divide-zinc-800 space-y-3">
              {/* Module Navigation Shortcuts */}
              <div>
                <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider px-2 mb-1.5">
                  Navegação Rápida de Módulos
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                  {[
                    { path: '/dashboard', label: 'Dashboard Clínico', icon: FileText },
                    { path: '/residentes', label: 'Residentes & Fichas', icon: Users },
                    { path: '/prontuarios', label: 'Prontuário (SOAP)', icon: FileText },
                    { path: '/medicacao', label: 'Aprazamento (MAR)', icon: Pill },
                    { path: '/escalas', label: 'Escalas da Equipe', icon: CalendarRange },
                    { path: '/plantao', label: 'Passagem de Plantão', icon: ClipboardCheck },
                  ].map((m) => {
                    const Icon = m.icon;
                    return (
                      <button
                        key={m.path}
                        onClick={() => {
                          onNavigate(m.path);
                          onCloseCommandBar();
                        }}
                        className="px-2.5 py-2 bg-zinc-800/80 hover:bg-zinc-800 text-zinc-200 hover:text-teal-300 text-xs font-semibold rounded-lg border border-zinc-700/60 flex items-center gap-2 text-left transition-colors"
                      >
                        <Icon className="w-4 h-4 text-teal-400 shrink-0" />
                        <span className="truncate">{m.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Residents Search Results */}
              <div>
                <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider px-2 mb-1.5 pt-2">
                  Residentes ({filteredResidents.length})
                </p>
                <div className="space-y-1">
                  {filteredResidents.slice(0, 4).map((r) => (
                    <button
                      key={r.id}
                      onClick={() => {
                        onOpenResident(r.id);
                        onCloseCommandBar();
                      }}
                      className="w-full px-3 py-2 bg-zinc-800/40 hover:bg-zinc-800 rounded-lg border border-zinc-800 hover:border-zinc-700 flex items-center justify-between text-left transition-colors group"
                    >
                      <div className="flex items-center gap-3">
                        <img src={r.photo} alt={r.name} className="w-7 h-7 rounded-full object-cover border border-zinc-700" />
                        <div>
                          <p className="text-xs font-bold text-zinc-100 group-hover:text-teal-300">{r.name}</p>
                          <p className="text-[11px] text-zinc-400">{r.room} • {r.primaryDiagnosis}</p>
                        </div>
                      </div>
                      <span className="text-[10px] font-semibold text-teal-400 bg-teal-950 px-2 py-0.5 rounded border border-teal-800">
                        Abrir Ficha
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* AI Quick Actions */}
              <div className="pt-2">
                <p className="text-[10px] font-bold text-teal-400 uppercase tracking-wider px-2 mb-1.5 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-teal-400" /> Atentar IA Nexa com Comando
                </p>
                <div className="space-y-1">
                  <button
                    onClick={() => {
                      onCloseCommandBar();
                      handleSendMessage('Gerar resumo do plantão das últimas 24h para a passagem de turno');
                    }}
                    className="w-full px-3 py-2 bg-teal-950/40 hover:bg-teal-950/80 text-teal-200 text-xs font-semibold rounded-lg border border-teal-800/50 flex items-center justify-between text-left transition-colors"
                  >
                    <span>📊 Gerar Resumo do Plantão com IA Nexa</span>
                    <ArrowRight className="w-3.5 h-3.5 text-teal-400" />
                  </button>
                  <button
                    onClick={() => {
                      onCloseCommandBar();
                      onOpenNewEvolution();
                    }}
                    className="w-full px-3 py-2 bg-zinc-800/60 hover:bg-zinc-800 text-zinc-200 text-xs font-semibold rounded-lg border border-zinc-700/60 flex items-center justify-between text-left transition-colors"
                  >
                    <span>✍️ Criar Nova Evolução Clínica SOAP</span>
                    <ArrowRight className="w-3.5 h-3.5 text-teal-400" />
                  </button>
                </div>
              </div>
            </div>

            <div className="p-2.5 bg-zinc-950 border-t border-zinc-800 flex items-center justify-between text-[11px] text-zinc-500">
              <span>Pressione <kbd className="px-1.5 py-0.5 bg-zinc-900 border border-zinc-700 rounded font-mono text-zinc-300">ESC</kbd> para fechar</span>
              <span className="text-teal-400 font-semibold">NexaMed Clinical Command</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
