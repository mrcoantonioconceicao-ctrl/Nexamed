import React, { useState } from 'react';
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
  EyeOff
} from 'lucide-react';
import { 
  getRegisteredUsers, 
  addRegisteredUser, 
  updateRegisteredUser, 
  deleteRegisteredUser, 
  RegisteredUser, 
  getUserRoleCategory 
} from '../config/auth-mode';

interface UsuariosViewProps {
  currentUserRoleCategory?: 'CUIDADOR' | 'ENFERMEIRA' | 'DIRECAO';
}

export const UsuariosView: React.FC<UsuariosViewProps> = ({ currentUserRoleCategory = 'DIRECAO' }) => {
  const [usersList, setUsersList] = useState<RegisteredUser[]>(getRegisteredUsers());
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTab, setSelectedTab] = useState<'ALL' | 'CUIDADOR' | 'ENFERMEIRA' | 'DIRECAO'>('ALL');
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<RegisteredUser | null>(null);

  // Form Fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('123456');
  const [role, setRole] = useState('Cuidador de Saúde Mental');
  const [documentId, setDocumentId] = useState('');
  const [unit, setUnit] = useState('Unidade Jardim Paulista - SRT I');
  const [shift, setShift] = useState('Manhã (07h às 13h)');
  const [team, setTeam] = useState('Equipe A');
  const [showPasswordMap, setShowPasswordMap] = useState<Record<string, boolean>>({});
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
    setUnit('Unidade Jardim Paulista - SRT I');
    setShift('Manhã (07h às 13h)');
    setTeam('Equipe de Cuidadores A');
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
    setShift(user.shift || 'Manhã (07h às 13h)');
    setTeam(user.team || 'Equipe A');
    setFormError('');
    setFormSuccess('');
    setIsModalOpen(true);
  };

  const handleSaveUser = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess('');

    if (!name.trim() || !email.trim() || !password.trim()) {
      setFormError('Por favor, preencha Nome, E-mail e Senha.');
      return;
    }

    if (editingUser) {
      updateRegisteredUser({
        ...editingUser,
        name: name.trim(),
        email: email.trim(),
        password: password.trim(),
        role,
        documentId: documentId.trim() || 'Sem Registro',
        unit,
        shift,
        team,
        roleCategory: getUserRoleCategory(role)
      });
      setFormSuccess('Usuário atualizado com sucesso!');
      setTimeout(() => {
        setIsModalOpen(false);
        refreshUsers();
      }, 600);
    } else {
      const result = addRegisteredUser({
        name: name.trim(),
        email: email.trim(),
        password: password.trim(),
        role,
        documentId: documentId.trim() || 'Sem Registro',
        unit,
        shift,
        team,
        avatar: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=120&auto=format&fit=crop&q=80',
        roleCategory: getUserRoleCategory(role)
      });

      if (!result.success) {
        setFormError(result.message);
      } else {
        setFormSuccess('Novo profissional cadastrado com sucesso!');
        setTimeout(() => {
          setIsModalOpen(false);
          refreshUsers();
        }, 600);
      }
    }
  };

  const handleDeleteUser = (user: RegisteredUser) => {
    if (confirm(`Tem certeza que deseja excluir a conta de ${user.name}?`)) {
      deleteRegisteredUser(user.id);
      refreshUsers();
    }
  };

  const handleToggleStatus = (user: RegisteredUser) => {
    const newStatus = user.status === 'Ativo' ? 'Inativo' : 'Ativo';
    updateRegisteredUser({
      ...user,
      status: newStatus
    });
    refreshUsers();
  };

  const toggleShowPassword = (userId: string) => {
    setShowPasswordMap(prev => ({ ...prev, [userId]: !prev[userId] }));
  };

  const filteredUsers = usersList.filter(u => {
    const matchesSearch = u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          u.role.toLowerCase().includes(searchTerm.toLowerCase());
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
          A gestão de usuários, senhas e liberações de acessos é de responsabilidade exclusiva da <strong>Direção e Coordenação Técnica</strong> da Residência Terapêutica.
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
              <ShieldCheck className="w-3.5 h-3.5 text-teal-300" /> Painel de Controle da Direção (SRT)
            </span>
          </div>
          <h1 className="text-2xl font-black tracking-tight text-white flex items-center gap-2">
            Gestão de Acessos, Cuidadores e Equipe
          </h1>
          <p className="text-xs text-slate-300 font-medium">
            Cadastre novos cuidadores, enfermeiros e gestores com credenciais reais de e-mail e senha.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="px-4 py-2.5 bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600 text-white font-extrabold text-xs rounded-2xl shadow-md transition-all flex items-center gap-2 shrink-0"
        >
          <UserPlus className="w-4 h-4" />
          <span>+ Cadastrar Novo Profissional</span>
        </button>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
        <div className="p-4 bg-white border border-zinc-200 rounded-2xl shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Total de Contas</p>
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

        <div className="p-4 bg-purple-50/70 border border-purple-200/80 rounded-2xl shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold text-purple-800 uppercase tracking-wider">Direção & Gerência</p>
            <p className="text-2xl font-black text-purple-950">
              {usersList.filter(u => u.roleCategory === 'DIRECAO').length}
            </p>
          </div>
          <div className="p-3 bg-purple-100 text-purple-800 rounded-xl">
            <Shield className="w-5 h-5" />
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
              🔵 Enfermeiras / RT
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
              placeholder="Buscar por nome, e-mail ou cargo..."
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
                <th className="p-3.5">Cargo / Perfil</th>
                <th className="p-3.5">E-mail de Login</th>
                <th className="p-3.5">Senha</th>
                <th className="p-3.5">Unidade / Turno</th>
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
                  const isDir = user.roleCategory === 'DIRECAO';

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
                            <span className="text-[10px] text-zinc-500 font-mono">{user.documentId}</span>
                          </div>
                        </div>
                      </td>

                      {/* Role Category Badge */}
                      <td className="p-3.5">
                        <div className="space-y-1">
                          <p className="font-bold text-zinc-900">{user.role}</p>
                          {isCuidador && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-extrabold">
                              🟢 Cuidador
                            </span>
                          )}
                          {isEnf && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-teal-50 text-teal-800 border border-teal-200 text-[10px] font-extrabold">
                              🔵 Enfermeira / RT
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
                          <Mail className="w-3.5 h-3.5 text-teal-600" />
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

                      {/* Unit / Shift */}
                      <td className="p-3.5">
                        <p className="text-[11px] font-semibold text-zinc-800">{user.unit}</p>
                        <p className="text-[10px] text-zinc-500">{user.shift}</p>
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
                            title="Editar Dados e Senha"
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
                  {editingUser ? 'Editar Profissional & Acesso' : 'Cadastrar Novo Profissional (SRT)'}
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
                <label className="block text-zinc-700 font-bold mb-1">Nome Completo *</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ex: Ana Clara Silva"
                  className="w-full bg-zinc-50 p-2.5 rounded-xl border border-zinc-200 font-medium focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-700 font-bold mb-1">E-mail de Login *</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="cuidador@nexamed.com.br"
                    className="w-full bg-zinc-50 p-2.5 rounded-xl border border-zinc-200 font-medium focus:ring-2 focus:ring-teal-500 focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-zinc-700 font-bold mb-1">Senha de Acesso *</label>
                  <input
                    type="text"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Digite a senha"
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
                    <option value="Direção / Coordenação Técnica">🟣 Direção / Coordenação Técnica</option>
                    <option value="Médico Psiquiatra">🔵 Médico Psiquiatra</option>
                    <option value="Psicólogo">🔵 Psicólogo</option>
                    <option value="Terapeuta Ocupacional">🔵 Terapeuta Ocupacional</option>
                  </select>
                </div>

                <div>
                  <label className="block text-zinc-700 font-bold mb-1">COREN / CPF / Registro</label>
                  <input
                    type="text"
                    value={documentId}
                    onChange={(e) => setDocumentId(e.target.value)}
                    placeholder="Ex: CPF 123.456.789-00 ou COREN-SP"
                    className="w-full bg-zinc-50 p-2.5 rounded-xl border border-zinc-200 font-mono text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-700 font-bold mb-1">Unidade SRT</label>
                  <select
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                    className="w-full bg-zinc-50 p-2.5 rounded-xl border border-zinc-200 font-medium focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  >
                    <option value="Unidade Jardim Paulista - SRT I">Unidade Jardim Paulista - SRT I</option>
                    <option value="Unidade Vila Mariana - SRT II">Unidade Vila Mariana - SRT II</option>
                    <option value="CAPS III Central">CAPS III Central</option>
                  </select>
                </div>

                <div>
                  <label className="block text-zinc-700 font-bold mb-1">Turno Habitual</label>
                  <select
                    value={shift}
                    onChange={(e) => setShift(e.target.value)}
                    className="w-full bg-zinc-50 p-2.5 rounded-xl border border-zinc-200 font-medium focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  >
                    <option value="Manhã (07h às 13h)">Manhã (07h às 13h)</option>
                    <option value="Tarde (13h às 19h)">Tarde (13h às 19h)</option>
                    <option value="Noite (19h às 07h / 12x36)">Noite (19h às 07h / 12x36)</option>
                    <option value="Horário Administrativo">Horário Administrativo</option>
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
                  className="px-5 py-2 bg-teal-600 hover:bg-teal-700 text-white font-extrabold rounded-xl shadow-md transition-all flex items-center gap-1.5"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>{editingUser ? 'Salvar Alterações' : 'Confirmar Cadastro'}</span>
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
};
