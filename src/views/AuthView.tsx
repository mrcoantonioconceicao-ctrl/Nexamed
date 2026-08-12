import React, { useState } from 'react';
import { 
  Building2, 
  Lock, 
  ShieldCheck, 
  Activity,
  Clock,
  UserPlus,
  Key,
  Mail,
  CheckCircle2,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { 
  setCurrentUser, 
  UserSession, 
  addRegisteredUser, 
  getUserRoleCategory 
} from '../config/auth-mode';
import { 
  loginWithEmailFirebase, 
  registerWithEmailFirebase, 
  loginWithGoogleFirebase, 
  syncUserProfile 
} from '../lib/firebase';

interface AuthViewProps {
  onLoginSuccess: (user: UserSession) => void;
}

export const AuthView: React.FC<AuthViewProps> = ({ onLoginSuccess }) => {
  const [activeTab, setActiveTab] = useState<'LOGIN' | 'REGISTER'>('LOGIN');

  // Context Selection
  const [selectedShift, setSelectedShift] = useState('Diurno (07h às 19h / Escala 12x36)');
  const [selectedUnit, setSelectedUnit] = useState('Residencial Salomão - Rua Dr. Pedro Zimmermann, 2391 (CEP 89066-001 - Blumenau/SC)');

  // Loading state
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Login Form
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  // Register Form
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regRole, setRegRole] = useState('Cuidador de Saúde Mental');
  const [regDocumentId, setRegDocumentId] = useState('');
  const [regError, setRegError] = useState('');
  const [regSuccess, setRegSuccess] = useState('');

  const mapAuthError = (err: any): string => {
    const code = err?.code || '';
    if (code === 'auth/invalid-credential' || code === 'auth/user-not-found' || code === 'auth/wrong-password') {
      return 'E-mail ou senha incorretos. Verifique suas credenciais.';
    }
    if (code === 'auth/email-already-in-use') {
      return 'Este e-mail já está cadastrado no Firebase Auth.';
    }
    if (code === 'auth/weak-password') {
      return 'A senha deve ter no mínimo 6 caracteres.';
    }
    if (code === 'auth/invalid-email') {
      return 'Formato de e-mail inválido.';
    }
    if (code === 'auth/popup-closed-by-user') {
      return 'A janela de autenticação do Google foi fechada.';
    }
    return err?.message || 'Erro ao comunicar com o servidor de autenticação Firebase.';
  };

  const handleGoogleLogin = async () => {
    setLoginError('');
    setIsSubmitting(true);
    try {
      const fbUser = await loginWithGoogleFirebase();
      if (!fbUser) throw new Error('Não foi possível obter dados do Google Auth.');

      const roleCategory = getUserRoleCategory('Enfermeiro Responsável Técnico (RT)');
      const syncedUser = await syncUserProfile(fbUser, {
        unit: selectedUnit,
        shift: selectedShift,
        role: 'Enfermeiro Responsável Técnico (RT)',
        roleCategory: roleCategory
      });

      const session: UserSession = {
        ...syncedUser,
        unit: selectedUnit,
        shift: selectedShift,
        roleCategory: syncedUser.roleCategory || roleCategory
      };

      setCurrentUser(session);
      onLoginSuccess(session);
    } catch (err: any) {
      console.error('Google login error:', err);
      setLoginError(mapAuthError(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFirebaseLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');

    if (!loginEmail.trim() || !loginPassword.trim()) {
      setLoginError('Informe o e-mail e a senha cadastrados.');
      return;
    }

    setIsSubmitting(true);
    try {
      const fbUser = await loginWithEmailFirebase(loginEmail.trim(), loginPassword.trim());
      if (!fbUser) throw new Error('Falha na autenticação.');

      const syncedUser = await syncUserProfile(fbUser, {
        unit: selectedUnit,
        shift: selectedShift
      });

      const session: UserSession = {
        ...syncedUser,
        unit: selectedUnit,
        shift: selectedShift,
        roleCategory: syncedUser.roleCategory || getUserRoleCategory(syncedUser.role)
      };

      setCurrentUser(session);
      onLoginSuccess(session);
    } catch (err: any) {
      console.error('Firebase login error:', err);
      setLoginError(mapAuthError(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFirebaseRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegError('');
    setRegSuccess('');

    if (!regName.trim() || !regEmail.trim() || !regPassword.trim()) {
      setRegError('Preencha Nome, E-mail e Senha para continuar.');
      return;
    }

    if (regPassword.trim().length < 6) {
      setRegError('A senha precisa ter no mínimo 6 caracteres.');
      return;
    }

    setIsSubmitting(true);
    try {
      const fbUser = await registerWithEmailFirebase(regEmail.trim(), regPassword.trim(), regName.trim());
      if (!fbUser) throw new Error('Erro ao criar conta no Firebase Auth.');

      const roleCat = getUserRoleCategory(regRole);
      const syncedUser = await syncUserProfile(fbUser, {
        name: regName.trim(),
        role: regRole,
        roleCategory: roleCat,
        documentId: regDocumentId.trim() || 'REGISTRO-001',
        unit: selectedUnit,
        shift: selectedShift
      });

      // Save user to local memory registered list too
      addRegisteredUser({
        name: regName.trim(),
        email: regEmail.trim(),
        password: regPassword.trim(),
        role: regRole,
        documentId: regDocumentId.trim() || 'REGISTRO-001',
        unit: selectedUnit,
        shift: selectedShift,
        avatar: fbUser.photoURL || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=120&auto=format&fit=crop&q=80',
        roleCategory: roleCat
      });

      setRegSuccess('Profissional cadastrado com sucesso no Firebase Auth! Acessando...');
      
      setTimeout(() => {
        const session: UserSession = {
          ...syncedUser,
          unit: selectedUnit,
          shift: selectedShift,
          roleCategory: roleCat
        };
        setCurrentUser(session);
        onLoginSuccess(session);
      }, 600);
    } catch (err: any) {
      console.error('Firebase register error:', err);
      setRegError(mapAuthError(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-xl bg-white border border-zinc-200 rounded-3xl shadow-xl overflow-hidden">
        
        {/* Top Header Banner */}
        <div className="p-6 bg-gradient-to-r from-slate-900 via-slate-800 to-teal-950 text-white text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-teal-500/20 border border-teal-400/30 flex items-center justify-center mx-auto shadow-md text-teal-300">
            <Activity className="w-7 h-7 stroke-[2.5]" />
          </div>
          <div>
            <span className="px-3 py-1 rounded-full bg-teal-500/20 text-teal-300 border border-teal-400/30 text-[10px] font-extrabold uppercase tracking-wider">
              Autenticação Segura Firebase
            </span>
            <h1 className="text-xl font-black tracking-tight mt-1">
              Plataforma Clínica NexaMed SRT
            </h1>
            <p className="text-xs text-slate-300 font-medium mt-0.5">
              Validação de identidade técnica para Residência Terapêutica (SUS / RAPS).
            </p>
          </div>
        </div>

        <div className="p-6 space-y-5 text-xs">

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
                  className="w-full bg-white p-2.5 rounded-xl border border-teal-200 font-bold text-teal-950 focus:outline-none focus:ring-2 focus:ring-teal-500 shadow-2xs text-xs"
                >
                  <option value="Residencial Salomão - Rua Dr. Pedro Zimmermann, 2391 (CEP 89066-001 - Blumenau/SC)">
                    Residencial Salomão — Rua Dr. Pedro Zimmermann, 2391, Blumenau/SC (CEP 89066-001)
                  </option>
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
                  className="w-full bg-white p-2.5 rounded-xl border border-teal-200 font-bold text-teal-950 focus:outline-none focus:ring-2 focus:ring-teal-500 shadow-2xs text-xs"
                >
                  <option value="Diurno (07h às 19h / Escala 12x36)">Diurno (07h às 19h / Escala 12x36)</option>
                  <option value="Noturno (19h às 07h / Escala 12x36)">Noturno (19h às 07h / Escala 12x36)</option>
                  <option value="Horário Administrativo (08h às 17h)">Horário Administrativo (08h às 17h)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Quick Google Sign In */}
          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={isSubmitting}
            className="w-full py-3 px-4 bg-white hover:bg-zinc-50 border border-zinc-300 text-zinc-800 font-bold text-xs rounded-2xl shadow-xs transition-all flex items-center justify-center gap-3 disabled:opacity-50"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
            </svg>
            <span>ENTRAR COM CONTA GOOGLE (OAUTH)</span>
          </button>

          <div className="relative flex items-center justify-center my-2">
            <div className="border-t border-zinc-200 w-full"></div>
            <span className="bg-white px-3 text-[10px] font-bold text-zinc-400 uppercase tracking-wider absolute">
              OU COM CONTA FIREBASE
            </span>
          </div>

          {/* Form Switcher Tabs */}
          <div>
            <div className="flex items-center gap-2 bg-zinc-100 p-1 rounded-xl mb-4 font-bold text-xs">
              <button
                type="button"
                onClick={() => setActiveTab('LOGIN')}
                className={`flex-1 py-2 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                  activeTab === 'LOGIN' ? 'bg-white text-zinc-900 shadow-2xs' : 'text-zinc-500 hover:text-zinc-800'
                }`}
              >
                <Key className="w-3.5 h-3.5 text-teal-600" />
                <span>Acessar Conta</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('REGISTER')}
                className={`flex-1 py-2 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                  activeTab === 'REGISTER' ? 'bg-white text-zinc-900 shadow-2xs' : 'text-zinc-500 hover:text-zinc-800'
                }`}
              >
                <UserPlus className="w-3.5 h-3.5 text-teal-600" />
                <span>Novo Cadastro</span>
              </button>
            </div>

            {/* Login Tab Form */}
            {activeTab === 'LOGIN' && (
              <form onSubmit={handleFirebaseLogin} className="space-y-3">
                {loginError && (
                  <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl font-bold flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                    <span>{loginError}</span>
                  </div>
                )}

                <div>
                  <label className="block text-zinc-700 font-bold mb-1">E-mail Cadastrado</label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      placeholder="seu.email@exemplo.com"
                      className="w-full bg-zinc-50 pl-9 pr-3 py-2.5 rounded-xl border border-zinc-200 font-medium focus:outline-none focus:ring-2 focus:ring-teal-500 text-xs"
                      required
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
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white font-extrabold text-xs rounded-2xl shadow-md transition-all flex items-center justify-center gap-2 mt-2 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>VALIDANDO NO FIREBASE AUTH...</span>
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="w-4 h-4" />
                      <span>ENTRAR NA PLATAFORMA</span>
                    </>
                  )}
                </button>
              </form>
            )}

            {/* Self-Registration Tab Form */}
            {activeTab === 'REGISTER' && (
              <form onSubmit={handleFirebaseRegister} className="space-y-3">
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
                    placeholder="Ex: Dra. Juliana Santos"
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
                      placeholder="seu.email@exemplo.com"
                      className="w-full bg-zinc-50 p-2.5 rounded-xl border border-zinc-200 font-medium focus:outline-none focus:ring-2 focus:ring-teal-500 text-xs"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-zinc-700 font-bold mb-1">Senha (Mín. 6 caracteres) *</label>
                    <input
                      type="password"
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      placeholder="Crie uma senha segura"
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
                    <label className="block text-zinc-700 font-bold mb-1">Documento (COREN / CPF)</label>
                    <input
                      type="text"
                      value={regDocumentId}
                      onChange={(e) => setRegDocumentId(e.target.value)}
                      placeholder="Ex: COREN-SP 123456"
                      className="w-full bg-zinc-50 p-2.5 rounded-xl border border-zinc-200 font-mono text-xs focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white font-extrabold text-xs rounded-2xl shadow-md transition-all flex items-center justify-center gap-2 mt-2 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>CRIANDO CONTA NO FIREBASE AUTH...</span>
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-4 h-4" />
                      <span>CADASTRAR E ACESSAR</span>
                    </>
                  )}
                </button>
              </form>
            )}

          </div>

        </div>
      </div>
    </div>
  );
};
