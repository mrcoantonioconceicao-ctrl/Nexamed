import React, { useState } from 'react';
import { 
  Building2, 
  Lock, 
  User, 
  Sparkles, 
  ShieldCheck, 
  ArrowRight,
  Activity,
  CheckCircle2
} from 'lucide-react';
import { setCurrentUser, UserSession, DEFAULT_DEMO_USER } from '../config/auth-mode';

interface AuthViewProps {
  onLoginSuccess: (user: UserSession) => void;
}

export const AuthView: React.FC<AuthViewProps> = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState('fernando.alencar@nexamed.com.br');
  const [password, setPassword] = useState('••••••••');
  const [role, setRole] = useState('Médico Psiquiatra / Coordenador Clínico');

  const presetProfiles: UserSession[] = [
    {
      id: 'usr-1',
      name: 'Dr. Fernando Alencar',
      email: 'fernando.alencar@nexamed.com.br',
      role: 'Médico Psiquiatra / Coordenador Clínico',
      avatar: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=120&auto=format&fit=crop&q=80',
      unit: 'Unidade Jardim Paulista',
    },
    {
      id: 'usr-2',
      name: 'Enf. Bruno Costa',
      email: 'bruno.costa@nexamed.com.br',
      role: 'Enfermeiro Responsável Técnico (RT)',
      avatar: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=120&auto=format&fit=crop&q=80',
      unit: 'Unidade Jardim Paulista',
    },
    {
      id: 'usr-3',
      name: 'Dra. Juliana Prado',
      email: 'juliana.prado@nexamed.com.br',
      role: 'Terapeuta Ocupacional',
      avatar: 'https://images.unsplash.com/photo-1594824813566-82084c8a514e?w=120&auto=format&fit=crop&q=80',
      unit: 'Unidade Jardim Paulista',
    },
  ];

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const session: UserSession = {
      id: `usr-${Date.now()}`,
      name: email.split('@')[0].replace('.', ' ').toUpperCase(),
      email,
      role,
      avatar: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=120&auto=format&fit=crop&q=80',
      unit: 'Unidade Jardim Paulista',
    };
    setCurrentUser(session);
    onLoginSuccess(session);
  };

  const handleSelectPreset = (p: UserSession) => {
    setCurrentUser(p);
    onLoginSuccess(p);
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-xl bg-white border border-zinc-200/90 rounded-2xl shadow-xl overflow-hidden">
        {/* Top Banner */}
        <div className="p-6 bg-zinc-50 border-b border-zinc-200 text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-teal-600 flex items-center justify-center mx-auto shadow-md shadow-teal-600/20 border border-teal-500">
            <Activity className="w-7 h-7 text-white stroke-[2.5]" />
          </div>
          <div>
            <h1 className="text-xl font-black text-zinc-900 tracking-tight">Nexa<span className="text-teal-600">Med</span> Clinical Portal</h1>
            <p className="text-xs text-zinc-500 font-medium mt-1">Acesso à Plataforma para Residências Terapêuticas</p>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Preset Clinical Staff Switcher */}
          <div>
            <p className="text-[11px] font-bold text-teal-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-teal-600" /> Entrar como Profissional Clínico (Demo Instantâneo)
            </p>
            <div className="space-y-2">
              {presetProfiles.map((p) => (
                <button
                  key={p.id}
                  onClick={() => handleSelectPreset(p)}
                  className="w-full p-3 bg-zinc-50 hover:bg-zinc-100/80 rounded-xl border border-zinc-200 hover:border-teal-400 flex items-center justify-between transition-all group text-left"
                >
                  <div className="flex items-center gap-3">
                    <img src={p.avatar} alt={p.name} className="w-10 h-10 rounded-xl object-cover border border-zinc-200 shrink-0 shadow-2xs" />
                    <div>
                      <p className="text-xs font-bold text-zinc-900 group-hover:text-teal-700">{p.name}</p>
                      <p className="text-[11px] text-zinc-500 font-medium">{p.role}</p>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-teal-800 bg-teal-50 px-2.5 py-1 rounded-lg border border-teal-200 flex items-center gap-1 shadow-2xs">
                    <span>Acessar</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Custom Login Form */}
          <form onSubmit={handleLogin} className="space-y-3 pt-3 border-t border-zinc-100 text-xs">
            <p className="font-extrabold text-zinc-700 uppercase tracking-wider text-[10px]">Ou faça login manual com credenciais:</p>
            <div>
              <label className="block text-zinc-600 font-bold mb-1">E-mail Profissional</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-zinc-50 text-zinc-900 p-2.5 rounded-xl border border-zinc-200 focus:outline-none focus:border-teal-500"
              />
            </div>
            <div>
              <label className="block text-zinc-600 font-bold mb-1">Senha</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-zinc-50 text-zinc-900 p-2.5 rounded-xl border border-zinc-200 focus:outline-none focus:border-teal-500"
              />
            </div>
            <button
              type="submit"
              className="w-full py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center gap-1.5"
            >
              <Lock className="w-4 h-4" />
              <span>Entrar na Plataforma</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
