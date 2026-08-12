import React, { useState, useEffect } from 'react';
import { 
  Users, 
  UserPlus, 
  ShieldCheck, 
  Key, 
  Mail, 
  Building2, 
  Clock, 
  Trash2, 
  Edit3, 
  CheckCircle2, 
  XCircle, 
  Lock, 
  Search, 
  Sparkles,
  Shield,
  HeartPulse,
  UserCheck,
  Eye,
  EyeOff,
  Stethoscope,
  Loader2,
  CalendarDays,
  FileCheck2
} from 'lucide-react';
import { 
  getRegisteredUsers, 
  addRegisteredUser, 
  updateRegisteredUser, 
  deleteRegisteredUser, 
  RegisteredUser, 
  getUserRoleCategory 
} from '../config/auth-mode';
import { 
  subscribeUsers, 
  saveFirestoreUser, 
  deleteFirestoreUser, 
  registerWithEmailFirebase 
} from '../lib/firebase';

interface UsuariosViewProps {
  currentUserRoleCategory?: 'CUIDADOR' | 'ENFERMEIRA' | 'MEDICO' | 'DIRECAO';
}

export const UsuariosView: React.FC<UsuariosViewProps> = ({ currentUserRoleCategory = 'DIRECAO' }) => {
  const [usersList, setUsersList] = useState<RegisteredUser[]>(getRegisteredUsers());

  useEffect(() => {
    const unsub = subscribeUsers((data) => {
      if (data && data.length > 0) {
        setUsersList(data);
      }
    }, getRegisteredUsers());
    return () => unsub();
  }, []);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTab, setSelectedTab] = useState<'ALL' | 'CUIDADOR' | 'ENFERMEIRA' | 'MEDICO' | 'DIRECAO'>('ALL');
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<RegisteredUser | null>(null);

  // Form Fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('123456');
  const [role, setRole] = useState('Cuidador de Saúde Mental');
  const [documentId, setDocumentId] = useState('');
  const [unit, setUnit] = useState('Residencial Salomão - Rua Dr. Pedro Zimmermann, 2391 (CEP 89066-001 - Blumenau/SC)');
  const [shift, setShift] = useState('Diurno (07h às 19h / 12x36)');
  const [team, setTeam] = useState('Equipe de Plantão A');
  const [showPasswordMap, setShowPasswordMap] = useState<Record<string, boolean>>({});
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');

  const refreshUsers = () => {
    setUsersList(getRegisteredUsers());
  };

  const handleOpenAdd = () => {
    setEditingUser(null);
    setName('');
    setEmail('');
    setPassword('123456');
    setRole('Cuidador de Saúde Mental');
    setDocumentId('');
    setUnit('Residencial Salomão - Rua Dr. Pedro Zimmermann, 2391 (CEP 89066-001 - Blumenau/SC)');
    setShift('Diurno (07h às 19h / 12x36)');
    setTeam('Equipe A');
    setFormError('');
    setFormSuccess('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (user: RegisteredUser) => {
    setEditingUser(user);
    setName(user.name);
    setEmail(user.email);
    setPassword(user.password || '123456');
    setRole(user.role);
    setDocumentId(user.documentId || '');
    setUnit(user.unit);
    setShift(user.shift || 'Diurno (07h às 19h / 12x36)');
    setTeam(user.team || 'Equipe A');
    setFormError('');
    setFormSuccess('');
    setIsModalOpen(true);
  };

  const handleSaveUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess('');

    if (!name.trim() || !email.trim() || !password.trim()) {
      setFormError('Por favor, preencha Nome, E-mail e Senha.');
      return;
    }

    if (password.trim().length < 6) {
      setFormError('A senha precisa ter no mínimo 6 caracteres para autenticação no Firebase.');
      return;
    }

    setIsSubmitting(true);
    const calculatedCategory = getUserRoleCategory(role);

    try {
      if (editingUser) {
        const updatedUser: RegisteredUser = {
          ...editingUser,
          name: name.trim(),
          email: email.trim(),
          password: password.trim(),
          role,
          documentId: documentId.trim() || 'Sem Registro',
          unit,
          shift,
          team,
          roleCategory: calculatedCategory
        };

        updateRegisteredUser(updatedUser);
        await saveFirestoreUser(updatedUser);

        setFormSuccess('Dados e permissões do profissional atualizados no Firebase!');
        setTimeout(() => {
          setIsModalOpen(false);
          refreshUsers();
        }, 600);
      } else {
        // Create user profile object
        const newUserObj: RegisteredUser = {
          id: 'usr-' + Date.now(),
          name: name.trim(),
          email: email.trim(),
          password: password.trim(),
          role,
          documentId: documentId.trim() || 'REGISTRO-001',
          unit,
          shift,
          team,
          avatar: calculatedCategory === 'MEDICO'
            ? 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=120&auto=format&fit=crop&q=80'
            : calculatedCategory === 'ENFERMEIRA'
            ? 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=120&auto=format&fit=crop&q=80'
            : 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=120&auto=format&fit=crop&q=80',
          roleCategory: calculatedCategory,
          createdAt: new Date().toISOString().split('T')[0],
          status: 'Ativo'
        };

        // Try to provision in Firebase Auth
        try {
          const fbUser = await registerWithEmailFirebase(email.trim(), password.trim(), name.trim());
          if (fbUser) {
            newUserObj.id = fbUser.uid;
          }
        } catch (authErr: any) {
          console.warn('Firebase Auth user might already exist or auto-register skipped:', authErr?.message);
        }

        // Save to Local + Firestore
        addRegisteredUser(newUserObj);
        await saveFirestoreUser(newUserObj);

        setFormSuccess('Novo profissional cadastrado com sucesso no Firebase Auth & Firestore!');
        setTimeout(() => {
          setIsModalOpen(false);
          refreshUsers();
        }, 600);
      }
    } catch (err: any) {
      console.error('Error saving user in Firestore/Firebase:', err);
      setFormError('Erro ao registrar no Firebase: ' + (err?.message || 'Tente novamente.'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteUser = async (user: RegisteredUser) => {
    if (confirm(`Tem certeza que deseja excluir a conta e remover o acesso de ${user.name}?`)) {
      deleteRegisteredUser(user.id);
      await deleteFirestoreUser(user.id);
      refreshUsers();
    }
  };

  const handleToggleStatus = async (user: RegisteredUser) => {
    const newStatus = user.status === 'Ativo' ? 'Inativo' : 'Ativo';
    const updated = {
      ...user,
      status: newStatus as 'Ativo' | 'Inativo'
    };
    updateRegisteredUser(updated);
    await saveFirestoreUser(updated);
    refreshUsers();
  };

  const toggleShowPassword = (userId: string) => {
    setShowPasswordMap(prev => ({ ...prev, [userId]: !prev[userId] }));
  };

  const filteredUsers = usersList.filter(u => {
    const matchesSearch = u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          u.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (u.shift && u.shift.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = selectedTab === 'ALL' || u.roleCategory === selectedTab;
    return matchesSearch && matchesCategory;
  });

  const isDirecao = currentUserRoleCategory === 'DIRECAO';

  if (!isDirecao) {
    return (
      <div className="p-8 text-center space-y-4 max-w-xl mx-auto my-12 bg-white rounded-3xl border border-zinc-200 shadow-lg">
        <div className="w-16 h-16 bg-amber-50 border border-amber-200 text-amber-600 rounded-2xl flex items-center justify-center mx-auto">
          <Lock className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-black text-zinc-900">Acesso Restrito à Direção SRT</h2>
        <p className="text-xs text-zinc-600 leading-relaxed">
          A gestão administrativa de credenciais, permissões, atribuições de papéis e turnos fixos é de responsabilidade exclusiva da <strong>Direção e Coordenação Técnica</strong> da Residência Terapêutica.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Top Header Banner */}
      <div className="p-6 bg-gradient-to-r from-slate-900 via-slate-800 to-teal-950 text-white rounded-3xl shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-teal-500/20 text-teal-300 border border-teal-400/30 text-[10px] font-extrabold uppercase tracking-wider flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-teal-300" /> Módulo Administrativo (SRT / SUS)
            </span>
          </div>
          <h1 className="text-2xl font-black tracking-tight text-white flex items-center gap-2">
            Gestão de Profissionais & Credenciais Firebase
          </h1>
          <p className="text-xs text-slate-300 font-medium">
            Cadastre cuidadores, enfermeiros e médicos com atribuição de cargo, senha e turno fixo (Diurno / Noturno).
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="px-4 py-2.5 bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600 text-white font-extrabold text-xs rounded-2xl shadow-md transition-all flex items-center gap-2 shrink-0"
        >
          <UserPlus className="w-4 h-4" />
          <span>+ Cadastrar Profissional</span>
        </button>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
        <div className="p-4 bg-white border border-zinc-200 rounded-2xl shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Total de Profissionais</p>
            <p className="text-2xl font-black text-zinc-900">{usersList.length}</p>
          </div>
          <div className="p-3 bg-zinc-100 text-zinc-700 rounded-xl">
            <Users className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 bg-emerald-50/70 border border-emerald-200/80 rounded-2xl shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider">Cuidadores de Saúde</p>
            <p className="text-2xl font-black text-emerald-950">
              {usersList.filter(u => u.roleCategory === 'CUIDADOR').length}
            </p>
          </div>
          <div className="p-3 bg-emerald-100 text-emerald-800 rounded-xl">
            <UserCheck className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 bg-teal-50/70 border border-teal-200/80 rounded-2xl shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold text-teal-800 uppercase tracking-wider">Enfermeiros & Técnica</p>
            <p className="text-2xl font-black text-teal-950">
              {usersList.filter(u => u.roleCategory === 'ENFERMEIRA').length}
            </p>
          </div>
          <div className="p-3 bg-teal-100 text-teal-800 rounded-xl">
            <HeartPulse className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 bg-blue-50/70 border border-blue-200/80 rounded-2xl shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold text-blue-800 uppercase tracking-wider">Corpo Médico</p>
            <p className="text-2xl font-black text-blue-950">
              {usersList.filter(u => u.roleCategory === 'MEDICO').length}
            </p>
          </div>
          <div className="p-3 bg-blue-100 text-blue-800 rounded-xl">
            <Stethoscope className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 bg-white border border-zinc-200/90 rounded-2xl shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          
          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 bg-zinc-100 p-1 rounded-xl w-full sm:w-auto overflow-x-auto text-xs font-bold">
            <button
              onClick={() => setSelectedTab('ALL')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                selectedTab === 'ALL' ? 'bg-white text-zinc-900 shadow-2xs' : 'text-zinc-600 hover:text-zinc-900'
              }`}
            >
              Todos ({usersList.length})
            </button>
            <button
              onClick={() => setSelectedTab('CUIDADOR')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                selectedTab === 'CUIDADOR' ? 'bg-emerald-600 text-white shadow-2xs' : 'text-zinc-600 hover:text-zinc-900'
              }`}
            >
              🟢 Cuidadores
            </button>
            <button
              onClick={() => setSelectedTab('ENFERMEIRA')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                selectedTab === 'ENFERMEIRA' ? 'bg-teal-600 text-white shadow-2xs' : 'text-zinc-600 hover:text-zinc-900'
              }`}
            >
              🔵 Enfermeiros
            </button>
            <button
              onClick={() => setSelectedTab('MEDICO')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                selectedTab === 'MEDICO' ? 'bg-blue-600 text-white shadow-2xs' : 'text-zinc-600 hover:text-zinc-900'
              }`}
            >
              🩺 Médicos
            </button>
            <button
              onClick={() => setSelectedTab('DIRECAO')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                selectedTab === 'DIRECAO' ? 'bg-purple-600 text-white shadow-2xs' : 'text-zinc-600 hover:text-zinc-900'
              }`}
            >
              🟣 Direção
            </button>
          </div>

          {/* Search Input */}
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por nome, e-mail, cargo ou turno..."
              className="w-full bg-zinc-50 pl-9 pr-3 py-2 rounded-xl border border-zinc-200 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white border border-zinc-200/90 rounded-2xl shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-zinc-50 border-b border-zinc-200/80 text-zinc-500 uppercase tracking-wider text-[10px] font-extrabold">
                <th className="p-3.5">Profissional</th>
                <th className="p-3.5">Cargo / Função</th>
                <th className="p-3.5">E-mail (Firebase Login)</th>
                <th className="p-3.5">Senha</th>
                <th className="p-3.5">Turno Fixo & Unidade</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 text-zinc-800 font-medium">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-zinc-500">
                    Nenhum profissional encontrado com os filtros selecionados.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => {
                  const isCuidador = user.roleCategory === 'CUIDADOR';
                  const isEnf = user.roleCategory === 'ENFERMEIRA';
                  const isMed = user.roleCategory === 'MEDICO';
                  const isDir = user.roleCategory === 'DIRECAO';

                  const isNoturno = user.shift?.toLowerCase().includes('noite') || user.shift?.toLowerCase().includes('noturno');

                  return (
                    <tr key={user.id} className="hover:bg-zinc-50/80 transition-colors">
                      {/* Name & Avatar */}
                      <td className="p-3.5">
                        <div className="flex items-center gap-3">
                          <img
                            src={user.avatar}
                            alt={user.name}
                            className="w-9 h-9 rounded-xl object-cover border border-zinc-200 shrink-0"
                          />
                          <div>
                            <p className="font-bold text-zinc-900">{user.name}</p>
                            <span className="text-[10px] text-zinc-500 font-mono">{user.documentId || 'REGISTRO-001'}</span>
                          </div>
                        </div>
                      </td>

                      {/* Role Category Badge */}
                      <td className="p-3.5">
                        <div className="space-y-1">
                          <p className="font-bold text-zinc-900">{user.role}</p>
                          {isCuidador && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-extrabold">
                              🟢 Cuidador de Saúde
                            </span>
                          )}
                          {isEnf && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-teal-50 text-teal-800 border border-teal-200 text-[10px] font-extrabold">
                              🔵 Enfermeiro / RT
                            </span>
                          )}
                          {isMed && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-blue-50 text-blue-800 border border-blue-200 text-[10px] font-extrabold">
                              🩺 Médico Psiquiatra
                            </span>
                          )}
                          {isDir && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-purple-50 text-purple-800 border border-purple-200 text-[10px] font-extrabold">
                              🟣 Direção SRT
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Login Email */}
                      <td className="p-3.5">
                        <div className="flex items-center gap-1.5 font-mono text-zinc-700">
                          <Mail className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                          <span>{user.email}</span>
                        </div>
                      </td>

                      {/* Password */}
                      <td className="p-3.5">
                        <div className="flex items-center gap-2 font-mono">
                          <span className="bg-zinc-100 px-2 py-1 rounded text-[11px]">
                            {showPasswordMap[user.id] ? user.password : '••••••••'}
                          </span>
                          <button
                            onClick={() => toggleShowPassword(user.id)}
                            className="text-zinc-400 hover:text-zinc-700 transition-colors"
                            title="Exibir/ocultar senha"
                          >
                            {showPasswordMap[user.id] ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      </td>

                      {/* Unit / Fixed Shift */}
                      <td className="p-3.5">
                        <div className="space-y-1">
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-extrabold border ${
                            isNoturno 
                              ? 'bg-indigo-50 text-indigo-900 border-indigo-200' 
                              : 'bg-amber-50 text-amber-900 border-amber-200'
                          }`}>
                            <Clock className="w-3 h-3" />
                            {user.shift || 'Diurno (07h às 19h)'}
                          </span>
                          <p className="text-[10px] text-zinc-500 font-medium">{user.unit}</p>
                        </div>
                      </td>

                      {/* Status Toggle */}
                      <td className="p-3.5">
                        <button
                          onClick={() => handleToggleStatus(user)}
                          className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold flex items-center gap-1 border transition-all ${
                            user.status === 'Ativo'
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
                              : 'bg-rose-50 text-rose-800 border-rose-200 hover:bg-rose-100'
                          }`}
                        >
                          {user.status === 'Ativo' ? (
                            <>
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Ativo
                            </>
                          ) : (
                            <>
                              <XCircle className="w-3 h-3 text-rose-600" /> Inativo
                            </>
                          )}
                        </button>
                      </td>

                      {/* Actions */}
                      <td className="p-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleOpenEdit(user)}
                            className="p-1.5 text-zinc-500 hover:text-teal-700 hover:bg-teal-50 rounded-lg transition-colors"
                            title="Editar Profissional e Credenciais"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteUser(user)}
                            className="p-1.5 text-zinc-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors"
                            title="Excluir Usuário"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit User Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white border border-zinc-200 rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden">
            
            <div className="p-5 bg-gradient-to-r from-slate-900 to-teal-950 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-teal-300" />
                <h3 className="font-extrabold text-sm">
                  {editingUser ? 'Editar Profissional & Credenciais' : 'Cadastrar Novo Profissional (Firebase Auth)'}
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white transition-colors"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveUser} className="p-6 space-y-4 text-xs">
              
              {formError && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl font-bold text-xs">
                  ⚠️ {formError}
                </div>
              )}

              {formSuccess && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl font-bold text-xs">
                  ✅ {formSuccess}
                </div>
              )}

              <div>
                <label className="block text-zinc-700 font-bold mb-1">Nome Completo do Profissional *</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ex: Dr. Fernando Vasconcelos"
                  className="w-full bg-zinc-50 p-2.5 rounded-xl border border-zinc-200 font-medium focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-700 font-bold mb-1">E-mail de Acesso (Login) *</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="profissional@nexamed.com.br"
                    className="w-full bg-zinc-50 p-2.5 rounded-xl border border-zinc-200 font-medium focus:ring-2 focus:ring-teal-500 focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-zinc-700 font-bold mb-1">Senha Inicial / Acesso *</label>
                  <input
                    type="text"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Mínimo 6 caracteres"
                    className="w-full bg-zinc-50 p-2.5 rounded-xl border border-zinc-200 font-mono font-bold focus:ring-2 focus:ring-teal-500 focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-700 font-bold mb-1">Cargo / Função *</label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full bg-zinc-50 p-2.5 rounded-xl border border-zinc-200 font-bold text-teal-950 focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  >
                    <option value="Cuidador de Saúde Mental">🟢 Cuidador de Saúde Mental</option>
                    <option value="Enfermeiro Responsável Técnico (RT)">🔵 Enfermeiro Responsável Técnico (RT)</option>
                    <option value="Técnico de Enfermagem">🔵 Técnico de Enfermagem</option>
                    <option value="Médico Psiquiatra">🩺 Médico Psiquiatra</option>
                    <option value="Médico Clínico Geral">🩺 Médico Clínico Geral</option>
                    <option value="Direção / Coordenação Técnica">🟣 Direção / Coordenação Técnica</option>
                    <option value="Psicólogo">🔵 Psicólogo</option>
                    <option value="Terapeuta Ocupacional">🔵 Terapeuta Ocupacional</option>
                  </select>
                </div>

                <div>
                  <label className="block text-zinc-700 font-bold mb-1">COREN / CRM / Documento</label>
                  <input
                    type="text"
                    value={documentId}
                    onChange={(e) => setDocumentId(e.target.value)}
                    placeholder="Ex: CRM-SP 123456 ou COREN-SP"
                    className="w-full bg-zinc-50 p-2.5 rounded-xl border border-zinc-200 font-mono text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-700 font-bold mb-1">Turno Fixo de Trabalho *</label>
                  <select
                    value={shift}
                    onChange={(e) => setShift(e.target.value)}
                    className="w-full bg-zinc-50 p-2.5 rounded-xl border border-zinc-200 font-bold text-teal-950 focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  >
                    <option value="Diurno (07h às 19h / 12x36)">☀️ Diurno (07h às 19h / Escala 12x36)</option>
                    <option value="Noturno (19h às 07h / 12x36)">🌙 Noturno (19h às 07h / Escala 12x36)</option>
                    <option value="Horário Administrativo">🏢 Horário Administrativo (08h às 17h)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-zinc-700 font-bold mb-1">Unidade SRT *</label>
                  <select
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                    className="w-full bg-zinc-50 p-2.5 rounded-xl border border-zinc-200 font-medium focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  >
                    <option value="Residencial Salomão - Rua Dr. Pedro Zimmermann, 2391 (CEP 89066-001 - Blumenau/SC)">
                      Residencial Salomão — Rua Dr. Pedro Zimmermann, 2391, Blumenau/SC (CEP 89066-001)
                    </option>
                  </select>
                </div>
              </div>

              <div className="pt-3 border-t border-zinc-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 font-bold rounded-xl transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-teal-600 hover:bg-teal-700 text-white font-extrabold rounded-xl shadow-md transition-all flex items-center gap-1.5 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>SALVANDO NO FIREBASE...</span>
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="w-4 h-4" />
                      <span>{editingUser ? 'Salvar Alterações' : 'Confirmar e Cadastrar'}</span>
                    </>
                  )}
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
};
