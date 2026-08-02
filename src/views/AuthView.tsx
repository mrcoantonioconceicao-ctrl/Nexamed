import React, { useState } from 'react';
import { 
  Building2, 
  Lock, 
  User, 
  Sparkles, 
  ShieldCheck, 
  ArrowRight,
  Activity,
  CheckCircle2,
  Users,
  Clock,
  Layers
} from 'lucide-react';
import { setCurrentUser, UserSession } from '../config/auth-mode';
import { parseEmailDisplayName } from '../utils/textParser';

interface AuthViewProps {
  onLoginSuccess: (user: UserSession) => void;
}

export const AuthView: React.FC<AuthViewProps> = ({ onLoginSuccess }) => {
  // Preset selection or custom fields
  const [selectedRole, setSelectedRole] = useState('Enfermeiro Responsável Técnico (RT)');
  const [selectedShift, setSelectedShift] = useState('Manhã');
  const [selectedUnit, setSelectedUnit] = useState('Unidade Jardim Paulista - SRT I');
  const [selectedTeam, setSelectedTeam] = useState('Equipe A - Plantão Diurno');

  const [email, setEmail] = useState('bruno.costa@nexamed.com.br');
  const [password, setPassword] = useState('••••••••');
  const [userName, setUserName] = useState('Enf. Bruno Costa');

  const presetProfiles: UserSession[] = [
    {
      id: 'usr-1',
      name: 'Dr. Fernando Alencar',
      email: 'fernando.alencar@nexamed.com.br',
      role: 'Médico Psiquiatra / Coordenador Clínico',
      avatar: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=120&auto=format&fit=crop&q=80',
      unit: 'Unidade Jardim Paulista - SRT I',
      shift: 'Manhã',
      team: 'Equipe Multidisciplinar A'
    },
    {
      id: 'usr-2',
      name: 'Enf. Bruno Costa',
      email: 'bruno.costa@nexamed.com.br',
      role: 'Enfermeiro Responsável Técnico (RT)',
      avatar: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=120&auto=format&fit=crop&q=80',
      unit: 'Unidade Jardim Paulista - SRT I',
      shift: 'Manhã',
      team: 'Equipe A - Plantão Diurno'
    },
    {
      id: 'usr-3',
      name: 'Dra. Juliana Prado',
      email: 'juliana.prado@nexamed.com.br',
      role: 'Terapeuta Ocupacional',
      avatar: 'https://images.unsplash.com/photo-1594824813566-82084c8a514e?w=120&auto=format&fit=crop&q=80',
      unit: 'Unidade Vila Mariana - SRT II',
      shift: 'Tarde',
      team: 'Equipe B - Reabilitação Psicossocial'
    },
  ];

  const handleCustomLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const session: UserSession = {
      id: `usr-${Date.now()}`,
      name: userName ? userName.trim() : parseEmailDisplayName(email),
      email: email.trim(),
      role: selectedRole,
      avatar: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=120&auto=format&fit=crop&q=80',
      unit: selectedUnit,
      shift: selectedShift,
      team: selectedTeam,
    };
    setCurrentUser(session);
    onLoginSuccess(session);
  };

  const handleSelectPreset = (p: UserSession) => {
    const sessionWithContext: UserSession = {
      ...p,
      shift: selectedShift,
      unit: selectedUnit,
      team: selectedTeam,
    };
    setCurrentUser(sessionWithContext);
    onLoginSuccess(sessionWithContext);
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-2xl bg-white border border-zinc-200/90 rounded-3xl shadow-xl overflow-hidden">
        
        {/* Top Header Banner */}
        <div className="p-6 bg-gradient-to-r from-slate-900 via-slate-800 to-teal-950 text-white text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-teal-500/20 border border-teal-400/30 flex items-center justify-center mx-auto shadow-md text-teal-300">
            <Activity className="w-7 h-7 stroke-[2.5]" />
          </div>
          <div>
            <span className="px-3 py-1 rounded-full bg-teal-500/20 text-teal-300 border border-teal-400/30 text-[10px] font-extrabold uppercase tracking-wider">
              NexaMed Smart Handover Protocol
            </span>
            <h1 className="text-xl font-black tracking-tight mt-1">Autenticação Profissional & Atribuição de Turno</h1>
            <p className="text-xs text-slate-300 font-medium mt-0.5">
              Identifique seu cargo, turno, unidade e equipe para carregar a Central Inteligente de Troca de Plantão.
            </p>
          </div>
        </div>

        <div className="p-6 space-y-6 text-xs">

          {/* Context Selector Bar: Turno, Unidade, Equipe */}
          <div className="p-4 bg-teal-50/70 border border-teal-200 rounded-2xl space-y-3">
            <div className="flex items-center gap-1.5 font-bold text-teal-950 text-xs">
              <Building2 className="w-4 h-4 text-teal-600" />
              <span>Contexto Operacional do Plantão (SUS / RAPS)</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-zinc-700 mb-1 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-teal-600" />
                  Turno
                </label>
                <select
                  value={selectedShift}
                  onChange={(e) => setSelectedShift(e.target.value)}
                  className="w-full bg-white p-2 rounded-xl border border-teal-200 font-bold text-teal-950 focus:outline-none focus:ring-2 focus:ring-teal-500 shadow-2xs"
                >
                  <option value="Manhã">Manhã (07h às 13h)</option>
                  <option value="Tarde">Tarde (13h às 19h)</option>
                  <option value="Noite">Noite (19h às 07h / 12x36)</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-zinc-700 mb-1 flex items-center gap-1">
                  <Building2 className="w-3.5 h-3.5 text-teal-600" />
                  Unidade
                </label>
                <select
                  value={selectedUnit}
                  onChange={(e) => setSelectedUnit(e.target.value)}
                  className="w-full bg-white p-2 rounded-xl border border-teal-200 font-bold text-teal-950 focus:outline-none focus:ring-2 focus:ring-teal-500 shadow-2xs"
                >
                  <option value="Unidade Jardim Paulista - SRT I">Unidade Jardim Paulista - SRT I</option>
                  <option value="Unidade Vila Mariana - SRT II">Unidade Vila Mariana - SRT II</option>
                  <option value="CAPS III Central">CAPS III Central</option>
                  <option value="Residência Terapêutica Pinheiros">Residência Terapêutica Pinheiros</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-zinc-700 mb-1 flex items-center gap-1">
                  <Users className="w-3.5 h-3.5 text-teal-600" />
                  Equipe
                </label>
                <select
                  value={selectedTeam}
                  onChange={(e) => setSelectedTeam(e.target.value)}
                  className="w-full bg-white p-2 rounded-xl border border-teal-200 font-bold text-teal-950 focus:outline-none focus:ring-2 focus:ring-teal-500 shadow-2xs"
                >
                  <option value="Equipe A - Plantão Diurno">Equipe A - Plantão Diurno</option>
                  <option value="Equipe B - Plantão Noturno">Equipe B - Plantão Noturno</option>
                  <option value="Equipe Multidisciplinar RAPS">Equipe Multidisciplinar RAPS</option>
                </select>
              </div>
            </div>
          </div>

          {/* Preset Clinical Staff Switcher */}
          <div>
            <p className="text-[11px] font-bold text-teal-800 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-teal-600" /> Entrar com Perfil Pré-Configurado (Demo Instantâneo)
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {presetProfiles.map((p) => (
                <button
                  key={p.id}
                  onClick={() => handleSelectPreset(p)}
                  className="p-3 bg-zinc-50 hover:bg-teal-50/80 rounded-2xl border border-zinc-200 hover:border-teal-400 flex flex-col justify-between transition-all group text-left space-y-2 shadow-2xs"
                >
                  <div className="flex items-center gap-2.5">
                    <img src={p.avatar} alt={p.name} className="w-9 h-9 rounded-xl object-cover border border-zinc-200 shrink-0" />
                    <div>
                      <p className="text-xs font-bold text-zinc-900 group-hover:text-teal-900 line-clamp-1">{p.name}</p>
                      <p className="text-[10px] text-teal-700 font-semibold">{p.role}</p>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-zinc-200/60 flex items-center justify-between text-[10px] text-zinc-500">
                    <span className="font-mono">Entrar e Assumir</span>
                    <ArrowRight className="w-3.5 h-3.5 text-teal-600 group-hover:translate-x-1 transition-transform" />
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Custom Login Form */}
          <form onSubmit={handleCustomLogin} className="space-y-3 pt-3 border-t border-zinc-100">
            <p className="font-extrabold text-zinc-700 uppercase tracking-wider text-[10px]">
              Ou informe credenciais personalizadas:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-zinc-600 font-bold mb-1">Nome Completo do Profissional</label>
                <input
                  type="text"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  placeholder="Ex: Enf. Bruno Costa"
                  className="w-full bg-zinc-50 text-zinc-900 p-2.5 rounded-xl border border-zinc-200 focus:outline-none focus:border-teal-500 font-medium"
                />
              </div>

              <div>
                <label className="block text-zinc-600 font-bold mb-1">Cargo / Função</label>
                <select
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value)}
                  className="w-full bg-zinc-50 text-zinc-900 p-2.5 rounded-xl border border-zinc-200 focus:outline-none focus:border-teal-500 font-bold"
                >
                  <option value="Enfermeiro Responsável Técnico (RT)">Enfermeiro Responsável Técnico (RT)</option>
                  <option value="Médico Psiquiatra / Coordenador">Médico Psiquiatra / Coordenador</option>
                  <option value="Técnico de Enfermagem">Técnico de Enfermagem</option>
                  <option value="Terapeuta Ocupacional">Terapeuta Ocupacional</option>
                  <option value="Psicólogo Clínico">Psicólogo Clínico</option>
                  <option value="Cuidador de Saúde Mental">Cuidador de Saúde Mental</option>
                </select>
              </div>

              <div>
                <label className="block text-zinc-600 font-bold mb-1">E-mail Profissional</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-zinc-50 text-zinc-900 p-2.5 rounded-xl border border-zinc-200 focus:outline-none focus:border-teal-500 font-medium"
                />
              </div>

              <div>
                <label className="block text-zinc-600 font-bold mb-1">Senha</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-zinc-50 text-zinc-900 p-2.5 rounded-xl border border-zinc-200 focus:outline-none focus:border-teal-500 font-medium"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white font-extrabold text-xs rounded-2xl shadow-md transition-all flex items-center justify-center gap-2 mt-2"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>ENTRAR E ABRIR TROCA INTELIGENTE DE PLANTÃO</span>
            </button>
          </form>

        </div>
      </div>
    </div>
  );
};

