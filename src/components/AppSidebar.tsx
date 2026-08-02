import React from 'react';
import { 
  LayoutDashboard, 
  Users, 
  FileText, 
  Pill, 
  CalendarRange, 
  ClipboardCheck, 
  BarChart3,
  Sparkles, 
  ChevronRight,
  Lock,
  HeartPulse,
  ShieldCheck,
  Building2
} from 'lucide-react';

interface AppSidebarProps {
  currentPath: string;
  onNavigate: (path: string) => void;
  pendingMedsCount: number;
  activeAlertsCount: number;
  openNexaChat: () => void;
  onOpenLGPD?: () => void;
}

export const AppSidebar: React.FC<AppSidebarProps> = ({
  currentPath,
  onNavigate,
  pendingMedsCount,
  activeAlertsCount,
  openNexaChat,
  onOpenLGPD,
}) => {
  const navItems = [
    {
      path: '/dashboard',
      label: 'Dashboard Clínico',
      icon: LayoutDashboard,
      badge: activeAlertsCount > 0 ? `${activeAlertsCount} alertas` : undefined,
      badgeColor: 'bg-rose-50 text-rose-700 border-rose-200',
    },
    {
      path: '/residentes',
      label: 'Residentes & Fichas',
      icon: Users,
    },
    {
      path: '/prontuarios',
      label: 'Prontuário (SOAP)',
      icon: FileText,
    },
    {
      path: '/medicacao',
      label: 'Medicação (MAR)',
      icon: Pill,
      badge: pendingMedsCount > 0 ? `${pendingMedsCount} pend.` : undefined,
      badgeColor: 'bg-amber-50 text-amber-800 border-amber-200',
    },
    {
      path: '/escalas',
      label: 'Escalas de Plantão',
      icon: CalendarRange,
    },
    {
      path: '/plantao',
      label: 'Passagem de Plantão',
      icon: ClipboardCheck,
    },
    {
      path: '/relatorios',
      label: 'Relatórios & Intercorrências',
      icon: BarChart3,
    },
    {
      path: '/operacoes',
      label: 'Operações Enterprise',
      icon: Building2,
      badge: 'v2.5',
      badgeColor: 'bg-teal-50 text-teal-800 border-teal-200',
    },
  ];

  return (
    <aside className="w-64 bg-white border-r border-zinc-200/80 text-zinc-700 flex flex-col justify-between h-[calc(100vh-4rem)] sticky top-16 select-none shrink-0 hidden md:flex rounded-r-2xl shadow-2xs my-2">
      {/* Navigation List */}
      <div className="p-3 space-y-6 overflow-y-auto">
        <div>
          <p className="px-3 text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-2">
            Módulos Principais
          </p>
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentPath === item.path || (item.path !== '/dashboard' && currentPath.startsWith(item.path));

              return (
                <button
                  key={item.path}
                  onClick={() => onNavigate(item.path)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all group ${
                    isActive
                      ? 'bg-teal-50 text-teal-800 border border-teal-200/80 shadow-2xs font-bold'
                      : 'hover:bg-zinc-100/80 text-zinc-600 hover:text-zinc-900 border border-transparent'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <Icon className={`w-4 h-4 transition-colors ${isActive ? 'text-teal-600' : 'text-zinc-400 group-hover:text-teal-600'}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge ? (
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md border ${item.badgeColor}`}>
                      {item.badge}
                    </span>
                  ) : (
                    <ChevronRight className={`w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity ${isActive ? 'opacity-100 text-teal-600' : 'text-zinc-400'}`} />
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Nexa AI Assistant Quick Card */}
        <div className="p-3.5 rounded-2xl bg-gradient-to-br from-teal-50 via-emerald-50/50 to-teal-50 border border-teal-200/80 relative overflow-hidden group shadow-xs">
          <div className="absolute top-0 right-0 p-2 opacity-15 group-hover:opacity-25 transition-opacity">
            <Sparkles className="w-12 h-12 text-teal-600" />
          </div>
          <div className="flex items-center space-x-2 mb-1.5">
            <div className="p-1.5 rounded-lg bg-teal-100 text-teal-800 border border-teal-200">
              <HeartPulse className="w-4 h-4 text-teal-600" />
            </div>
            <span className="text-xs font-bold text-zinc-900">Assistente Nexa IA</span>
          </div>
          <p className="text-[11px] text-zinc-600 mb-3 leading-relaxed">
            Resumos de prontuário, análise de riscos e geração automática de notas SOAP.
          </p>
          <button
            onClick={openNexaChat}
            className="w-full py-2 px-3 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-xl transition-colors flex items-center justify-center gap-1.5 shadow-xs"
          >
            <Sparkles className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>Abrir Nexa IA (⌘K)</span>
          </button>
        </div>
      </div>

      {/* Footer System Status & LGPD */}
      <div className="p-3 border-t border-zinc-200/80 bg-zinc-50/80 rounded-br-2xl space-y-1">
        <div className="flex items-center justify-between text-[11px] text-zinc-500 px-2 py-0.5">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="font-semibold text-zinc-700">NexaMed Engine v2.5</span>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={onOpenLGPD}
              className="hover:text-teal-700 text-zinc-500 transition-colors p-1 flex items-center gap-1 font-semibold text-[10px]"
              title="LGPD & Política de Privacidade e Cookies"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-teal-600" />
              <span>LGPD</span>
            </button>
            <button
              onClick={() => onNavigate('/auth')}
              className="hover:text-teal-600 transition-colors p-1"
              title="Segurança e Acesso"
            >
              <Lock className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
};
