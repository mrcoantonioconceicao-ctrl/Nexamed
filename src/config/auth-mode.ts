import { saveFirestoreUser, deleteFirestoreUser } from '../lib/firebase';

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
  roleCategory?: 'CUIDADOR' | 'ENFERMEIRA' | 'MEDICO' | 'DIRECAO';
}

export interface RegisteredUser extends UserSession {
  passwordHash: string;
  documentId: string;
  createdAt: string;
  status: 'Ativo' | 'Inativo';
  roleCategory: 'CUIDADOR' | 'ENFERMEIRA' | 'MEDICO' | 'DIRECAO';
}

export function getUserRoleCategory(role: string): 'CUIDADOR' | 'ENFERMEIRA' | 'MEDICO' | 'DIRECAO' {
  if (!role) return 'ENFERMEIRA';
  const r = role.toLowerCase();
  if (r.includes('direç') || r.includes('coordena') || r.includes('gerente') || r.includes('administra') || r.includes('diretor')) {
    return 'DIRECAO';
  }
  if (r.includes('médico') || r.includes('medico') || r.includes('psiquiatra') || r.includes('doutor')) {
    return 'MEDICO';
  }
  if (r.includes('cuidador') || r.includes('acompanhante')) {
    return 'CUIDADOR';
  }
  return 'ENFERMEIRA';
}

export function getRolePermissions(roleCategory: 'CUIDADOR' | 'ENFERMEIRA' | 'MEDICO' | 'DIRECAO') {
  return {
    isCuidador: roleCategory === 'CUIDADOR',
    isEnfermeira: roleCategory === 'ENFERMEIRA',
    isMedico: roleCategory === 'MEDICO',
    isDirecao: roleCategory === 'DIRECAO',

    // Permissions
    canManageUsers: roleCategory === 'DIRECAO',
    canEditMedicalPTS: roleCategory === 'ENFERMEIRA' || roleCategory === 'MEDICO' || roleCategory === 'DIRECAO',
    canPrescribeMedication: roleCategory === 'ENFERMEIRA' || roleCategory === 'MEDICO' || roleCategory === 'DIRECAO',
    canSignSOAPAssessment: roleCategory === 'ENFERMEIRA' || roleCategory === 'MEDICO' || roleCategory === 'DIRECAO',
    canEditRoster: roleCategory === 'ENFERMEIRA' || roleCategory === 'DIRECAO',
    canAccessExecutiveReports: roleCategory === 'ENFERMEIRA' || roleCategory === 'MEDICO' || roleCategory === 'DIRECAO',

    // Caregiver-specific allowed actions
    canAdministerShiftMeds: true,
    canRecordShiftNotes: true,
    canViewResidents: true,
    canAccessGuiaResidencial: true,
  };
}

// Empty array - users are fetched dynamically from Firebase Auth & Firestore
export const INITIAL_REGISTERED_USERS: RegisteredUser[] = [];

export function getRegisteredUsers(): RegisteredUser[] {
  const stored = localStorage.getItem('nexamed_registered_users');
  if (stored) {
    try {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    } catch {
      // fallback
    }
  }
  return [];
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
  
  // Async save to Firestore
  saveFirestoreUser(user);

  return { success: true, user, message: 'Usuário cadastrado com sucesso!' };
}

export function updateRegisteredUser(updatedUser: RegisteredUser): void {
  const users = getRegisteredUsers();
  const index = users.findIndex(u => u.id === updatedUser.id);
  if (index !== -1) {
    const userToSave = {
      ...updatedUser,
      roleCategory: getUserRoleCategory(updatedUser.role)
    };
    users[index] = userToSave;
    saveRegisteredUsers(users);
    
    // Async update to Firestore
    saveFirestoreUser(userToSave);
  }
}

export function deleteRegisteredUser(userId: string): void {
  const users = getRegisteredUsers();
  const filtered = users.filter(u => u.id !== userId);
  saveRegisteredUsers(filtered);
  
  // Async delete from Firestore
  deleteFirestoreUser(userId);
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

  if (user.password && user.password !== cleanPassword) {
    return { success: false, message: 'Senha incorreta. Tente novamente.' };
  }

  return { success: true, user, message: 'Autenticado com sucesso!' };
}

export const DEFAULT_USER: UserSession = {
  id: 'usr-admin-srt',
  name: 'Equipe Multiprofissional SRT',
  email: 'equipe@srt.saude.gov.br',
  role: 'Coordenação & Direção Técnica',
  avatar: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150&auto=format&fit=crop&q=80',
  unit: 'Residência Terapêutica Central',
  roleCategory: 'DIRECAO'
};

export function isAuthEnabled(): boolean {
  return false; // Login desativado por enquanto a pedido do usuário
}

export function getCurrentUser(): UserSession | null {
  const stored = localStorage.getItem('nexamed_user');
  if (stored) {
    try {
      const parsed: UserSession = JSON.parse(stored);
      if (parsed && parsed.id && parsed.email) {
        return {
          ...parsed,
          roleCategory: parsed.roleCategory || getUserRoleCategory(parsed.role)
        };
      }
    } catch {
      // ignore
    }
  }
  if (!isAuthEnabled()) {
    return DEFAULT_USER;
  }
  return null;
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


