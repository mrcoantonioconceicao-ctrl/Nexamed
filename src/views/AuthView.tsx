import React, { useState } from 'react';
import { 
  Building2, 
  Lock, 
  User, 
  ShieldCheck, 
  ArrowRight,
  Activity,
  Users,
  Clock,
  UserPlus,
  Key,
  Mail,
  HeartPulse,
  Shield,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { 
  setCurrentUser, 
  UserSession, 
  authenticateUser, 
  addRegisteredUser, 
  INITIAL_REGISTERED_USERS, 
  getUserRoleCategory 
} from '../config/auth-mode';

interface AuthViewProps {
  onLoginSuccess: (user: UserSession) => void;
}

export const AuthView: React.FC<AuthViewProps> = ({ onLoginSuccess }) => {
  const [activeTab, setActiveTab] = useState<'LOGIN' | 'REGISTER'>('LOGIN');

  // Context Selection
  const [selectedShift, setSelectedShift] = useState('Manhã (07h às 13h)');
  const [selectedUnit, setSelectedUnit] = useState('Unidade Jardim Paulista - SRT I');

  // Login Form
  const [loginEmail, setLoginEmail] = useState('enfermeira@nexamed.com.br');
  const [loginPassword, setLoginPassword] = useState('123456');
  const [loginError, setLoginError] = useState('');

  // Register Form
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('123456');
  const [regRole, setRegRole] = useState('Cuidador de Saúde Mental');
  const [regDocumentId, setRegDocumentId] = useState('');
  const [regError, setRegError] = useState('');
  const [regSuccess, setRegSuccess] = useState('');

  // Fast Quick Access Profiles
  const quickProfiles = INITIAL_REGISTERED_USERS;

  const handleQuickLogin = (user: typeof INITIAL_REGISTERED_USERS[0]) => {
    const session: UserSession = {
      ...user,
      shift: selectedShift,
      unit: selectedUnit,
      roleCategory: getUserRoleCategory(user.role)
    };
    setCurrentUser(session);
    onLoginSuccess(session);
  };

  const handleRealLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');

    if (!loginEmail.trim() || !loginPassword.trim()) {
      setLoginError('Informe o e-mail e a senha de acesso.');
      return;
    }

    const authResult = authenticateUser(loginEmail, loginPassword);
    if (!authResult.success || !authResult.user) {
      setLoginError(authResult.message || 'Credenciais inválidas.');
      return;
    }

    const session: UserSession = {
      ...authResult.user,
      shift: selectedShift,
      unit: selectedUnit,
      roleCategory: getUserRoleCategory(authResult.user.role)
    };
    setCurrentUser(session);
    onLoginSuccess(session);
  };

  const handleSelfRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setRegError('');
    setRegSuccess('');

    if (!regName.trim() || !regEmail.trim() || !regPassword.trim()) {
      setRegError('Preencha Nome, E-mail e Senha.');
      return;
    }

    const res = addRegisteredUser({
      name: regName.trim(),
      email: regEmail.trim(),
      password: regPassword.trim(),
      role: regRole,
      documentId: regDocumentId.trim() || 'Sem Registro',
      unit: selectedUnit,
      shift: selectedShift,
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=120&auto=format&fit=crop&q=80',
      roleCategory: getUserRoleCategory(regRole)
    });

    if (!res.success) {
      setRegError(res.message);
    } else if (res.user) {
      setRegSuccess('Cadastro realizado com sucesso! Conectando...');
      setTimeout(() => {
        const session: UserSession = {
          ...res.user!,
          shift: selectedShift,
          unit: selectedUnit,
          roleCategory: getUserRoleCategory(res.user!.role)
        };
        setCurrentUser(session);
        onLoginSuccess(session);
      }, 700);
    }
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
              NexaMed SRT — Autenticação de Acesso
            </span>
            <h1 className="text-xl font-black tracking-tight mt-1">
              Login por Cargo: Cuidador, Enfermagem & Direção
            </h1>
            <p className="text-xs text-slate-300 font-medium mt-0.5">
              Identificação técnica e perfil de permissão para Residência Terapêutica (SUS / RAPS).
            </p>
          </div>
        </div>

        <div className="p-6 space-y-6 text-xs">

          {/* Context Selector Bar */}
          <div className="p-4 bg-teal-50/70 border border-teal-200 rounded-2xl space-y-3">
            <div className="flex items-center gap-1.5 font-bold text-teal-950 text-xs">
              <Building2 className="w-4 h-4 text-teal-600" />
              <span>Unidade SRT & Turno do Plantão</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-zinc-700 mb-1 flex items-center gap-1">
                  <Building2 className="w-3.5 h-3.5 text-teal-600" />
                  Unidade Residencial
                </label>
                <select
                  value={selectedUnit}
                  onChange={(e) => setSelectedUnit(e.target.value)}
                  className="w-full bg-white p-2 rounded-xl border border-teal-200 font-bold text-teal-950 focus:outline-none focus:ring-2 focus:ring-teal-500 shadow-2xs text-xs"
                >
                  <option value="Unidade Jardim Paulista - SRT I">Unidade Jardim Paulista - SRT I</option>
                  <option value="Unidade Vila Mariana - SRT II">Unidade Vila Mariana - SRT II</option>
                  <option value="CAPS III Central">CAPS III Central</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-zinc-700 mb-1 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-teal-600" />
                  Turno
                </label>
                <select
                  value={selectedShift}
                  onChange={(e) => setSelectedShift(e.target.value)}
                  className="w-full bg-white p-2 rounded-xl border border-teal-200 font-bold text-teal-950 focus:outline-none focus:ring-2 focus:ring-teal-500 shadow-2xs text-xs"
                >
                  <option value="Manhã (07h às 13h)">Manhã (07h às 13h)</option>
                  <option value="Tarde (13h às 19h)">Tarde (13h às 19h)</option>
                  <option value="Noite (19h às 07h / 12x36)">Noite (19h às 07h / 12x36)</option>
                  <option value="Horário Administrativo">Horário Administrativo</option>
                </select>
              </div>
            </div>
          </div>

          {/* Quick Preset Login Buttons */}
          <div>
            <p className="text-[11px] font-bold text-teal-800 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-teal-600" /> Acesso Rápido com Login Real
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {quickProfiles.map((p) => {
                const isCuidador = p.roleCategory === 'CUIDADOR';
                const isEnf = p.roleCategory === 'ENFERMEIRA';
                const isDir = p.roleCategory === 'DIRECAO';

                return (
                  <button
                    key={p.id}
                    onClick={() => handleQuickLogin(p)}
                    className="p-3 bg-zinc-50 hover:bg-teal-50/90 rounded-2xl border border-zinc-200 hover:border-teal-400 flex flex-col justify-between transition-all group text-left space-y-2 shadow-2xs"
                  >
                    <div className="flex items-center gap-2.5">
                      <img src={p.avatar} alt={p.name} className="w-9 h-9 rounded-xl object-cover border border-zinc-200 shrink-0" />
                      <div>
                        <p className="text-xs font-bold text-zinc-900 group-hover:text-teal-900 line-clamp-1">{p.name}</p>
                        <p className="text-[10px] text-zinc-500 line-clamp-1">{p.role}</p>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-zinc-200/60 flex items-center justify-between text-[10px]">
                      {isCuidador && <span className="font-bold text-emerald-800 bg-emerald-100 px-1.5 py-0.5 rounded">🟢 Cuidador</span>}
                      {isEnf && <span className="font-bold text-teal-800 bg-teal-100 px-1.5 py-0.5 rounded">🔵 Enfermeira</span>}
                      {isDir && <span className="font-bold text-purple-800 bg-purple-100 px-1.5 py-0.5 rounded">🟣 Direção</span>}

                      <div className="flex items-center text-teal-600 font-bold group-hover:translate-x-1 transition-transform">
                        <span>Entrar</span>
                        <ArrowRight className="w-3.5 h-3.5 ml-1" />
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
            <p className="text-[10px] text-zinc-400 mt-1.5 font-mono text-center">
              Senha padrão dos acessos rápidos: <strong className="text-zinc-600">123456</strong>
            </p>
          </div>

          {/* Form Switcher Tabs */}
          <div className="pt-3 border-t border-zinc-100">
            <div className="flex items-center gap-2 bg-zinc-100 p-1 rounded-xl mb-4 font-bold text-xs">
              <button
                type="button"
                onClick={() => setActiveTab('LOGIN')}
                className={`flex-1 py-2 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                  activeTab === 'LOGIN' ? 'bg-white text-zinc-900 shadow-2xs' : 'text-zinc-500 hover:text-zinc-800'
                }`}
              >
                <Key className="w-3.5 h-3.5 text-teal-600" />
                <span>Entrar com E-mail e Senha</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('REGISTER')}
                className={`flex-1 py-2 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                  activeTab === 'REGISTER' ? 'bg-white text-zinc-900 shadow-2xs' : 'text-zinc-500 hover:text-zinc-800'
                }`}
              >
                <UserPlus className="w-3.5 h-3.5 text-teal-600" />
                <span>Cadastrar Novo Profissional</span>
              </button>
            </div>

            {/* Login Tab Form */}
            {activeTab === 'LOGIN' && (
              <form onSubmit={handleRealLogin} className="space-y-3">
                {loginError && (
                  <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl font-bold flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                    <span>{loginError}</span>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-zinc-700 font-bold mb-1">E-mail Cadastrado</label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="email"
                        value={loginEmail}
                        onChange={(e) => setLoginEmail(e.target.value)}
                        placeholder="cuidador@nexamed.com.br"
                        className="w-full bg-zinc-50 pl-9 pr-3 py-2.5 rounded-xl border border-zinc-200 font-medium focus:outline-none focus:ring-2 focus:ring-teal-500 text-xs"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-zinc-700 font-bold mb-1">Senha de Acesso</label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="password"
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full bg-zinc-50 pl-9 pr-3 py-2.5 rounded-xl border border-zinc-200 font-medium focus:outline-none focus:ring-2 focus:ring-teal-500 text-xs"
                      />
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white font-extrabold text-xs rounded-2xl shadow-md transition-all flex items-center justify-center gap-2 mt-2"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>ENTRAR NA PLATAFORMA SRT</span>
                </button>
              </form>
            )}

            {/* Self-Registration Tab Form */}
            {activeTab === 'REGISTER' && (
              <form onSubmit={handleSelfRegister} className="space-y-3">
                {regError && (
                  <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl font-bold flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                    <span>{regError}</span>
                  </div>
                )}

                {regSuccess && (
                  <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl font-bold flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>{regSuccess}</span>
                  </div>
                )}

                <div>
                  <label className="block text-zinc-700 font-bold mb-1">Nome Completo do Profissional *</label>
                  <input
                    type="text"
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    placeholder="Ex: João Souza"
                    className="w-full bg-zinc-50 p-2.5 rounded-xl border border-zinc-200 font-medium focus:outline-none focus:ring-2 focus:ring-teal-500 text-xs"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-zinc-700 font-bold mb-1">E-mail *</label>
                    <input
                      type="email"
                      value={regEmail}
                      onChange={(e) => setRegEmail(e.target.value)}
                      placeholder="seu.email@nexamed.com.br"
                      className="w-full bg-zinc-50 p-2.5 rounded-xl border border-zinc-200 font-medium focus:outline-none focus:ring-2 focus:ring-teal-500 text-xs"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-zinc-700 font-bold mb-1">Senha *</label>
                    <input
                      type="password"
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      placeholder="Crie sua senha"
                      className="w-full bg-zinc-50 p-2.5 rounded-xl border border-zinc-200 font-medium focus:outline-none focus:ring-2 focus:ring-teal-500 text-xs"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-zinc-700 font-bold mb-1">Cargo / Função *</label>
                    <select
                      value={regRole}
                      onChange={(e) => setRegRole(e.target.value)}
                      className="w-full bg-zinc-50 p-2.5 rounded-xl border border-zinc-200 font-bold text-teal-950 focus:outline-none focus:ring-2 focus:ring-teal-500 text-xs"
                    >
                      <option value="Cuidador de Saúde Mental">🟢 Cuidador de Saúde Mental</option>
                      <option value="Enfermeiro Responsável Técnico (RT)">🔵 Enfermeiro Responsável Técnico (RT)</option>
                      <option value="Técnico de Enfermagem">🔵 Técnico de Enfermagem</option>
                      <option value="Direção / Coordenação Técnica">🟣 Direção / Coordenação Técnica</option>
                      <option value="Terapeuta Ocupacional">🔵 Terapeuta Ocupacional</option>
                      <option value="Psicólogo">🔵 Psicólogo</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-zinc-700 font-bold mb-1">Documento (COREN / CPF / Registro)</label>
                    <input
                      type="text"
                      value={regDocumentId}
                      onChange={(e) => setRegDocumentId(e.target.value)}
                      placeholder="Ex: CPF ou COREN"
                      className="w-full bg-zinc-50 p-2.5 rounded-xl border border-zinc-200 font-mono text-xs focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white font-extrabold text-xs rounded-2xl shadow-md transition-all flex items-center justify-center gap-2 mt-2"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>CONCLUIR CADASTRO E ENTRAR</span>
                </button>
              </form>
            )}

          </div>

        </div>
      </div>
    </div>
  );
};


