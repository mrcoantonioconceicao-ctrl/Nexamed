export interface UserSession {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar: string;
  unit: string;
  shift?: string;
  team?: string;
  documentId?: string;
  roleCategory?: 'CUIDADOR' | 'ENFERMEIRA' | 'DIRECAO';
}

export interface RegisteredUser extends UserSession {
  password: string;
  documentId: string;
  createdAt: string;
  status: 'Ativo' | 'Inativo';
  roleCategory: 'CUIDADOR' | 'ENFERMEIRA' | 'DIRECAO';
}

export function getUserRoleCategory(role: string): 'CUIDADOR' | 'ENFERMEIRA' | 'DIRECAO' {
  if (!role) return 'ENFERMEIRA';
  const r = role.toLowerCase();
  if (r.includes('direç') || r.includes('coordena') || r.includes('gerente') || r.includes('administra')) {
    return 'DIRECAO';
  }
  if (r.includes('cuidador') || r.includes('acompanhante')) {
    return 'CUIDADOR';
  }
  return 'ENFERMEIRA';
}

export function getRolePermissions(roleCategory: 'CUIDADOR' | 'ENFERMEIRA' | 'DIRECAO') {
  return {
    isCuidador: roleCategory === 'CUIDADOR',
    isEnfermeira: roleCategory === 'ENFERMEIRA',
    isDirecao: roleCategory === 'DIRECAO',

    // Permissions
    canManageUsers: roleCategory === 'DIRECAO',
    canEditMedicalPTS: roleCategory === 'ENFERMEIRA' || roleCategory === 'DIRECAO',
    canPrescribeMedication: roleCategory === 'ENFERMEIRA' || roleCategory === 'DIRECAO',
    canSignSOAPAssessment: roleCategory === 'ENFERMEIRA' || roleCategory === 'DIRECAO',
    canEditRoster: roleCategory === 'ENFERMEIRA' || roleCategory === 'DIRECAO',
    canAccessExecutiveReports: roleCategory === 'ENFERMEIRA' || roleCategory === 'DIRECAO',

    // Caregiver-specific allowed actions
    canAdministerShiftMeds: true,
    canRecordShiftNotes: true,
    canViewResidents: true,
    canAccessGuiaResidencial: true,
  };
}

export const INITIAL_REGISTERED_USERS: RegisteredUser[] = [
  {
    id: 'usr-cuidador',
    name: 'Ana Clara Silva',
    email: 'cuidador@nexamed.com.br',
    password: '123456',
    role: 'Cuidador de Saúde Mental',
    roleCategory: 'CUIDADOR',
    documentId: 'CPF 384.920.118-02',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=120&auto=format&fit=crop&q=80',
    unit: 'Unidade Jardim Paulista - SRT I',
    shift: 'Manhã (07h às 13h)',
    team: 'Equipe de Cuidadores A',
    createdAt: '2026-01-10',
    status: 'Ativo'
  },
  {
    id: 'usr-enfermeira',
    name: 'Enf. Maria Oliveira',
    email: 'enfermeira@nexamed.com.br',
    password: '123456',
    role: 'Enfermeiro Responsável Técnico (RT)',
    roleCategory: 'ENFERMEIRA',
    documentId: 'COREN-SP 492.810-ENF',
    avatar: 'https://images.unsplash.com/photo-1594824813566-82084c8a514e?w=120&auto=format&fit=crop&q=80',
    unit: 'Unidade Jardim Paulista - SRT I',
    shift: 'Manhã (07h às 13h)',
    team: 'Equipe de Enfermagem RT',
    createdAt: '2026-01-05',
    status: 'Ativo'
  },
  {
    id: 'usr-direcao',
    name: 'Dra. Patrícia Santos',
    email: 'direcao@nexamed.com.br',
    password: '123456',
    role: 'Direção / Coordenação Técnica',
    roleCategory: 'DIRECAO',
    documentId: 'CRM-SP 182.940',
    avatar: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=120&auto=format&fit=crop&q=80',
    unit: 'Unidade Jardim Paulista - SRT I',
    shift: 'Horário Administrativo',
    team: 'Coordenação Geral SRT',
    createdAt: '2026-01-01',
    status: 'Ativo'
  }
];

export function getRegisteredUsers(): RegisteredUser[] {
  const stored = localStorage.getItem('nexamed_registered_users');
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      // fallback
    }
  }
  localStorage.setItem('nexamed_registered_users', JSON.stringify(INITIAL_REGISTERED_USERS));
  return INITIAL_REGISTERED_USERS;
}

export function saveRegisteredUsers(users: RegisteredUser[]): void {
  localStorage.setItem('nexamed_registered_users', JSON.stringify(users));
}

export function addRegisteredUser(newUser: Omit<RegisteredUser, 'id' | 'createdAt' | 'status'>): { success: boolean; user?: RegisteredUser; message: string } {
  const users = getRegisteredUsers();
  const exists = users.some(u => u.email.toLowerCase() === newUser.email.toLowerCase());
  if (exists) {
    return { success: false, message: 'Já existe um usuário cadastrado com este e-mail.' };
  }

  const user: RegisteredUser = {
    ...newUser,
    id: `usr-${Date.now()}`,
    createdAt: new Date().toISOString().split('T')[0],
    status: 'Ativo',
    roleCategory: getUserRoleCategory(newUser.role),
  };

  users.push(user);
  saveRegisteredUsers(users);
  return { success: true, user, message: 'Usuário cadastrado com sucesso!' };
}

export function updateRegisteredUser(updatedUser: RegisteredUser): void {
  const users = getRegisteredUsers();
  const index = users.findIndex(u => u.id === updatedUser.id);
  if (index !== -1) {
    users[index] = {
      ...updatedUser,
      roleCategory: getUserRoleCategory(updatedUser.role)
    };
    saveRegisteredUsers(users);
  }
}

export function deleteRegisteredUser(userId: string): void {
  const users = getRegisteredUsers();
  const filtered = users.filter(u => u.id !== userId);
  saveRegisteredUsers(filtered);
}

export function authenticateUser(email: string, password: string): { success: boolean; user?: RegisteredUser; message: string } {
  const users = getRegisteredUsers();
  const cleanEmail = email.trim().toLowerCase();
  const cleanPassword = password.trim();

  const user = users.find(u => u.email.toLowerCase() === cleanEmail);
  if (!user) {
    return { success: false, message: 'E-mail não encontrado no sistema.' };
  }

  if (user.status === 'Inativo') {
    return { success: false, message: 'Esta conta de usuário está inativa. Fale com a Direção.' };
  }

  if (user.password !== cleanPassword) {
    return { success: false, message: 'Senha incorreta. Tente novamente.' };
  }

  return { success: true, user, message: 'Autenticado com sucesso!' };
}

export const DEFAULT_DEMO_USER: UserSession = {
  id: 'usr-enfermeira',
  name: 'Enf. Maria Oliveira',
  email: 'enfermeira@nexamed.com.br',
  role: 'Enfermeiro Responsável Técnico (RT)',
  roleCategory: 'ENFERMEIRA',
  documentId: 'COREN-SP 492.810-ENF',
  avatar: 'https://images.unsplash.com/photo-1594824813566-82084c8a514e?w=120&auto=format&fit=crop&q=80',
  unit: 'Unidade Jardim Paulista - SRT I',
  shift: 'Manhã (07h às 13h)',
  team: 'Equipe de Enfermagem RT'
};

export function isAuthEnabled(): boolean {
  return true; // Active real authentication and role-based access
}

export function getCurrentUser(): UserSession | null {
  const stored = localStorage.getItem('nexamed_user');
  if (stored) {
    try {
      const parsed: UserSession = JSON.parse(stored);
      return {
        ...parsed,
        roleCategory: parsed.roleCategory || getUserRoleCategory(parsed.role)
      };
    } catch {
      // ignore
    }
  }
  // Default to Cuidador or Enfermeira initial session
  return INITIAL_REGISTERED_USERS[1];
}

export function setCurrentUser(user: UserSession | null): void {
  if (user) {
    const sessionToSave = {
      ...user,
      roleCategory: user.roleCategory || getUserRoleCategory(user.role)
    };
    localStorage.setItem('nexamed_user', JSON.stringify(sessionToSave));
  } else {
    localStorage.removeItem('nexamed_user');
  }
}

