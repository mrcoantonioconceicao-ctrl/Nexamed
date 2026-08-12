import React, { useState } from 'react';
import { 
  Building2, 
  Search, 
  Bell, 
  Sparkles, 
  ShieldAlert, 
  User, 
  LogOut, 
  Check, 
  ChevronDown,
  Activity,
  Layers,
  Compass,
  Rocket
} from 'lucide-react';
import { getCurrentUser, isAuthEnabled, setCurrentUser } from '../config/auth-mode';
import { logoutFirebase } from '../lib/firebase';
import { ClinicalAlert } from '../types';

interface NavbarHeaderProps {
  alerts: ClinicalAlert[];
  onOpenCommandBar: () => void;
  onOpenAssistant?: () => void;
  onNavigate: (path: string) => void;
  activePath: string;
  onMarkAlertsRead: () => void;
  onOpenOutboundHandover?: () => void;
  onOpenInboundHandover?: () => void;
  notificationPermission?: NotificationPermission;
  onRequestNotificationPermission?: () => void;
  onSendTestNotificationAlert?: () => void;
  criticalResidentsCount?: number;
  onOpenTour?: () => void;
  onOpenDeploy?: () => void;
}

export const NavbarHeader: React.FC<NavbarHeaderProps> = ({
  alerts,
  onOpenCommandBar,
  onOpenAssistant,
  onNavigate,
  onMarkAlertsRead,
  onOpenOutboundHandover,
  onOpenInboundHandover,
  notificationPermission,
  onRequestNotificationPermission,
  onSendTestNotificationAlert,
  criticalResidentsCount = 0,
  onOpenTour,
  onOpenDeploy,
}) => {
  const currentUser = getCurrentUser();
  const demoMode = !isAuthEnabled();
  const unreadAlerts = alerts.filter(a => !a.read);
  const [showAlertsDropdown, setShowAlertsDropdown] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);

  const handleLogout = async () => {
    try {
      await logoutFirebase();
    } catch (e) {
      console.warn('Logout error:', e);
    }
    setCurrentUser(null);
    onNavigate('/auth');
  };

  return (
    <header className="sticky top-0 z-30 h-16 bg-white/90 backdrop-blur-md border-b border-zinc-200 text-zinc-900 flex items-center justify-between px-4 sm:px-6 shadow-xs">
      {/* Brand & Unit Info */}
      <div className="flex items-center space-x-3 sm:space-x-4">
        <div className="flex items-center space-x-2.5 cursor-pointer" onClick={() => onNavigate('/dashboard')}>
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-teal-600 via-teal-500 to-emerald-500 flex items-center justify-center shadow-sm shadow-teal-600/20 border border-teal-400/30">
            <Activity className="w-5 h-5 text-white stroke-[2.5]" />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center space-x-1.5">
              <span className="font-bold text-lg tracking-tight text-zinc-900 font-sans">Nexa<span className="text-teal-600">Med</span></span>
              <span className="text-[10px] font-bold tracking-wider text-teal-700 bg-teal-50 px-1.5 py-0.5 rounded border border-teal-200 uppercase">Pro</span>
            </div>
            <span className="text-[11px] text-zinc-500 flex items-center gap-1 font-medium">
              <Building2 className="w-3 h-3 text-teal-600" />
              Residencial Salomão - Blumenau
            </span>
          </div>
        </div>

        {/* Demo Mode Badge */}
        {demoMode && (
          <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-xs font-semibold">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
            <span>Modo Demo (Acesso Livre)</span>
          </div>
        )}
      </div>

      {/* Global Quick Search / Command Bar Trigger */}
      <div className="flex-1 max-w-md mx-4 hidden md:block">
        <button
          onClick={onOpenCommandBar}
          className="w-full h-10 px-3.5 bg-zinc-100 hover:bg-zinc-200/70 text-zinc-500 hover:text-zinc-900 rounded-xl border border-zinc-200/80 transition-all flex items-center justify-between text-xs group"
        >
          <div className="flex items-center gap-2">
            <Search className="w-4 h-4 text-teal-600 group-hover:scale-110 transition-transform" />
            <span>Buscar residente, medicação ou comando...</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="px-1.5 py-0.5 text-[10px] bg-white text-zinc-600 border border-zinc-200 rounded font-mono shadow-2xs">⌘K</span>
            <span className="px-1.5 py-0.5 text-[10px] bg-teal-50 text-teal-700 border border-teal-200/80 rounded font-bold flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-teal-600" /> IA
            </span>
          </div>
        </button>
      </div>

      {/* Right Controls */}
      <div className="flex items-center space-x-2.5 sm:space-x-3">
        {/* Guided Tour Trigger Button */}
        {onOpenTour && (
          <button
            onClick={onOpenTour}
            className="hidden sm:flex items-center gap-1.5 py-2 px-3 bg-zinc-100 hover:bg-zinc-200 text-zinc-800 font-bold text-xs rounded-xl border border-zinc-200 transition-all shadow-2xs"
            title="Iniciar Tour Guiado pelos Módulos"
          >
            <Compass className="w-3.5 h-3.5 text-teal-600" />
            <span>Tour Guiado</span>
          </button>
        )}

        {/* Auto Deploy Trigger Button */}
        {onOpenDeploy && (
          <button
            onClick={onOpenDeploy}
            className="hidden xl:flex items-center gap-1.5 py-2 px-3 bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs rounded-xl border border-slate-800 transition-all shadow-2xs"
            title="Preparar e Gerenciar Deploy Automático CI/CD"
          >
            <Rocket className="w-3.5 h-3.5 text-emerald-400" />
            <span>Deploy CI/CD</span>
          </button>
        )}

        {/* Smart Handover Quick Trigger Button */}
        {onOpenOutboundHandover && (
          <button
            onClick={onOpenOutboundHandover}
            className="hidden lg:flex items-center gap-1.5 py-2 px-3 bg-teal-50 hover:bg-teal-100 text-teal-800 font-extrabold text-xs rounded-xl border border-teal-200 transition-all shadow-2xs"
            title="Troca Inteligente de Plantão & Auditoria de Pendências"
          >
            <Activity className="w-3.5 h-3.5 text-teal-600 animate-pulse" />
            <span>Troca de Plantão</span>
          </button>
        )}

        {/* Assistente Nexa AI Chatbot Button */}
        <button
          onClick={onOpenAssistant}
          className="py-2 px-3 bg-gradient-to-r from-teal-600 via-teal-500 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white font-extrabold text-xs rounded-xl shadow-xs transition-all flex items-center gap-1.5 border border-teal-400/40"
          title="Abrir Chatbot Assistente Nexa"
        >
          <Sparkles className="w-3.5 h-3.5 text-white animate-pulse" />
          <span className="hidden sm:inline">Assistente Nexa</span>
          <span className="sm:hidden">Nexa</span>
        </button>

        {/* Mobile Search Button */}
        <button
          onClick={onOpenCommandBar}
          className="p-2 md:hidden text-zinc-700 hover:text-zinc-900 bg-zinc-100 rounded-xl border border-zinc-200"
          title="Buscar (⌘K)"
        >
          <Search className="w-4 h-4 text-teal-600" />
        </button>

        {/* Alerts Bell Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowAlertsDropdown(!showAlertsDropdown)}
            className="relative p-2 text-zinc-700 hover:text-zinc-900 bg-zinc-100/80 hover:bg-zinc-200/80 rounded-xl border border-zinc-200 transition-colors"
            title="Alertas Clínicos"
          >
            <Bell className="w-4 h-4" />
            {unreadAlerts.length > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-rose-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white animate-bounce shadow-xs">
                {unreadAlerts.length}
              </span>
            )}
          </button>

          {showAlertsDropdown && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white border border-zinc-200 rounded-2xl shadow-xl z-50 overflow-hidden">
              <div className="p-3 bg-zinc-50 border-b border-zinc-200 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-rose-600" />
                  <span className="text-xs font-bold text-zinc-900">Alertas Clínicos Ativos ({unreadAlerts.length})</span>
                </div>
                {unreadAlerts.length > 0 && (
                  <button
                    onClick={() => {
                      onMarkAlertsRead();
                      setShowAlertsDropdown(false);
                    }}
                    className="text-[11px] text-teal-700 hover:text-teal-800 hover:underline flex items-center gap-1 font-semibold"
                  >
                    <Check className="w-3 h-3" /> Limpar lidos
                  </button>
                )}
              </div>

              {/* Background Push Notifications Status & Controls for Nursing Staff */}
              <div className="p-2.5 bg-rose-50/60 border-b border-rose-200/80 flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-rose-900">
                    <span className="w-2 h-2 rounded-full bg-rose-600 animate-ping"></span>
                    <span>Push Notificações (Estado Crítico)</span>
                  </div>
                  {notificationPermission === 'granted' ? (
                    <span className="text-[10px] font-extrabold text-emerald-800 bg-emerald-100 border border-emerald-300 px-1.5 py-0.5 rounded">
                      Ativo (Background SW)
                    </span>
                  ) : (
                    <span className="text-[10px] font-extrabold text-amber-800 bg-amber-100 border border-amber-300 px-1.5 py-0.5 rounded">
                      Pendente
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-zinc-600">
                  Alertas em tempo real do navegador com aviso sonoro e vibração quando o status de algum residente for alterado para 'Crítico'.
                </p>
                <div className="flex items-center gap-2 pt-1">
                  {notificationPermission !== 'granted' && onRequestNotificationPermission && (
                    <button
                      onClick={onRequestNotificationPermission}
                      className="px-2.5 py-1 bg-rose-600 hover:bg-rose-700 text-white text-[11px] font-bold rounded-lg transition-colors shadow-2xs"
                    >
                      🔔 Ativar Notificações do Navegador
                    </button>
                  )}
                  {onSendTestNotificationAlert && (
                    <button
                      onClick={onSendTestNotificationAlert}
                      className="px-2 py-1 bg-white hover:bg-zinc-100 text-zinc-700 border border-zinc-300 text-[10px] font-semibold rounded-lg transition-colors"
                    >
                      🧪 Testar Alerta Sonoro
                    </button>
                  )}
                </div>
              </div>

              <div className="max-h-80 overflow-y-auto divide-y divide-zinc-100">
                {alerts.length === 0 ? (
                  <p className="p-4 text-xs text-zinc-500 text-center">Nenhum alerta pendente.</p>
                ) : (
                  alerts.slice(0, 5).map((alert) => (
                    <div
                      key={alert.id}
                      className={`p-3 hover:bg-zinc-50 transition-colors ${!alert.read ? 'bg-rose-50/50 border-l-3 border-rose-500' : 'opacity-70'}`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded uppercase ${
                          alert.severity === 'Crítico' ? 'bg-rose-100 text-rose-800 border border-rose-200' :
                          alert.severity === 'Alto' ? 'bg-amber-100 text-amber-800 border border-amber-200' :
                          'bg-zinc-100 text-zinc-700 border border-zinc-200'
                        }`}>
                          {alert.severity}
                        </span>
                        <span className="text-[10px] text-zinc-400">{alert.timestamp}</span>
                      </div>
                      <p className="text-xs font-semibold text-zinc-800 mb-0.5">{alert.message}</p>
                      {alert.residentName && (
                        <p className="text-[11px] text-teal-700 font-semibold">Residente: {alert.residentName}</p>
                      )}
                    </div>
                  ))
                )}
              </div>
              <div className="p-2 bg-zinc-50 border-t border-zinc-200 text-center">
                <button
                  onClick={() => {
                    onNavigate('/dashboard');
                    setShowAlertsDropdown(false);
                  }}
                  className="text-xs text-teal-700 font-bold hover:underline"
                >
                  Ver Central de Alertas no Dashboard →
                </button>
              </div>
            </div>
          )}
        </div>

        {/* User Profile Menu */}
        <div className="relative">
          <button
            onClick={() => setShowUserDropdown(!showUserDropdown)}
            className="flex items-center gap-2 p-1.5 rounded-xl bg-zinc-100/80 hover:bg-zinc-200/80 border border-zinc-200 transition-colors"
          >
            <img
              src={currentUser?.avatar || 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=120&auto=format&fit=crop&q=80'}
              alt={currentUser?.name || 'Usuário'}
              className="w-7 h-7 rounded-full object-cover border border-teal-500"
            />
            <div className="hidden sm:flex flex-col text-left pr-1">
              <span className="text-xs font-bold text-zinc-800 leading-tight truncate max-w-[120px]">
                {currentUser?.name || 'Profissional'}
              </span>
              <span className="text-[10px] text-teal-700 font-semibold truncate max-w-[120px]">
                {currentUser?.role || 'Acesso Clínico'}
              </span>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-zinc-500 hidden sm:block" />
          </button>

          {showUserDropdown && (
            <div className="absolute right-0 mt-2 w-56 bg-white border border-zinc-200 rounded-2xl shadow-xl z-50 p-2 divide-y divide-zinc-100">
              <div className="p-2.5 mb-1 bg-zinc-50 rounded-xl border border-zinc-100 space-y-1">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-bold text-zinc-900">{currentUser?.name}</p>
                  {currentUser?.roleCategory === 'CUIDADOR' && <span className="text-[9px] font-extrabold bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded">🟢 Cuidador</span>}
                  {currentUser?.roleCategory === 'ENFERMEIRA' && <span className="text-[9px] font-extrabold bg-teal-100 text-teal-800 px-1.5 py-0.5 rounded">🔵 Enfermeira</span>}
                  {currentUser?.roleCategory === 'DIRECAO' && <span className="text-[9px] font-extrabold bg-purple-100 text-purple-800 px-1.5 py-0.5 rounded">🟣 Direção</span>}
                </div>
                <p className="text-[11px] text-zinc-500">{currentUser?.email}</p>
                <p className="text-[10px] text-teal-700 font-bold">{currentUser?.role}</p>
              </div>
              <div className="py-1 space-y-0.5">
                {currentUser?.roleCategory === 'DIRECAO' && (
                  <button
                    onClick={() => {
                      onNavigate('/usuarios');
                      setShowUserDropdown(false);
                    }}
                    className="w-full text-left px-2.5 py-1.5 text-xs text-purple-900 bg-purple-50 hover:bg-purple-100 rounded-lg flex items-center gap-2 font-extrabold border border-purple-200/80"
                  >
                    <User className="w-3.5 h-3.5 text-purple-700" />
                    <span>Gestão de Usuários & Senhas</span>
                  </button>
                )}
                {onOpenOutboundHandover && (
                  <button
                    onClick={() => {
                      onOpenOutboundHandover();
                      setShowUserDropdown(false);
                    }}
                    className="w-full text-left px-2.5 py-1.5 text-xs text-teal-800 hover:bg-teal-50 rounded-lg flex items-center gap-2 font-bold"
                  >
                    <Activity className="w-3.5 h-3.5 text-teal-600" />
                    <span>Troca de Plantão / Auditoria</span>
                  </button>
                )}
                <button
                  onClick={() => {
                    onNavigate('/auth');
                    setShowUserDropdown(false);
                  }}
                  className="w-full text-left px-2.5 py-1.5 text-xs text-zinc-700 hover:bg-zinc-100 rounded-lg flex items-center gap-2 font-medium"
                >
                  <User className="w-3.5 h-3.5 text-teal-600" />
                  <span>Alternar Usuário / Login</span>
                </button>
              </div>
              <div className="pt-1">
                <button
                  onClick={() => {
                    setShowUserDropdown(false);
                    if (onOpenOutboundHandover) {
                      onOpenOutboundHandover();
                    } else {
                      handleLogout();
                    }
                  }}
                  className="w-full text-left px-2.5 py-1.5 text-xs text-rose-600 hover:bg-rose-50 rounded-lg flex items-center gap-2 font-bold"
                >
                  <LogOut className="w-3.5 h-3.5 text-rose-600" />
                  <span>Encerrar Plantão e Sair</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
