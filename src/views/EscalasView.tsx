import React, { useState, useEffect, useMemo } from 'react';
import { 
  CalendarRange, 
  Sparkles, 
  Plus, 
  AlertTriangle, 
  CheckCircle2, 
  User, 
  Clock,
  ShieldCheck,
  ChevronRight,
  Activity,
  Award,
  Filter,
  Search,
  X,
  Edit3,
  Trash2,
  AlertCircle,
  Users,
  Check,
  UserX,
  RefreshCw,
  Info,
  Sun,
  Moon,
  Zap,
  SlidersHorizontal,
  CalendarDays,
  Coffee
} from 'lucide-react';
import { StaffRoster, Resident, FunctionalScaleAssessment, ShiftType } from '../types';
import { giterStore } from '../utils/giterStore';
import { getRegisteredUsers } from '../config/auth-mode';

interface EscalasViewProps {
  roster: StaffRoster[];
  residents?: Resident[];
  onAddRosterItem: (item: StaffRoster) => void;
}

export interface ScheduleConflict {
  id: string;
  staffName: string;
  date: string;
  dayOfWeek: string;
  conflictType: 'SOBREPOSICAO_HORARIO' | 'DUPLA_JORNADA' | 'INTERJORNADA_INSUFFICIENTE' | 'TURNO_INCOMPATATIVEL';
  severity: 'Crítica' | 'Alta' | 'Média';
  title: string;
  description: string;
  conflictingShifts: StaffRoster[];
}

export interface Caregiver1236Profile {
  id: string;
  name: string;
  period: 'Diurno' | 'Noturno';
  shiftHours: string;
  teamGroup: 'Equipe A' | 'Equipe B';
  role: string;
}

export const DEFAULT_8_CAREGIVERS: Caregiver1236Profile[] = [
  { id: 'cg-1', name: 'Cuidadora Marlene Santos', period: 'Diurno', shiftHours: '07h às 19h (12/36)', teamGroup: 'Equipe A', role: 'Cuidadora Residencial (Equipe A)' },
  { id: 'cg-2', name: 'Cuidador Roberto Mendes', period: 'Diurno', shiftHours: '07h às 19h (12/36)', teamGroup: 'Equipe B', role: 'Cuidador Residencial (Equipe B)' },
  { id: 'cg-3', name: 'Cuidadora Beatriz Ramos', period: 'Diurno', shiftHours: '07h às 19h (12/36)', teamGroup: 'Equipe A', role: 'Cuidadora Residencial (Equipe A)' },
  { id: 'cg-4', name: 'Cuidadora Carla Oliveira', period: 'Diurno', shiftHours: '07h às 19h (12/36)', teamGroup: 'Equipe B', role: 'Cuidador Residencial (Equipe B)' },
  { id: 'cg-5', name: 'Cuidador Marcos Vinicius', period: 'Noturno', shiftHours: '19h às 07h (12/36)', teamGroup: 'Equipe A', role: 'Cuidador Noturno (Equipe A)' },
  { id: 'cg-6', name: 'Cuidador Jefferson Lima', period: 'Noturno', shiftHours: '19h às 07h (12/36)', teamGroup: 'Equipe B', role: 'Cuidador Noturno (Equipe B)' },
  { id: 'cg-7', name: 'Cuidadora Adriana Souza', period: 'Noturno', shiftHours: '19h às 07h (12/36)', teamGroup: 'Equipe A', role: 'Cuidadora Noturno (Equipe A)' },
  { id: 'cg-8', name: 'Cuidadora Fabiana Rocha', period: 'Noturno', shiftHours: '19h às 07h (12/36)', teamGroup: 'Equipe B', role: 'Cuidadora Noturno (Equipe B)' },
];

export function getRealCaregivers(): Caregiver1236Profile[] {
  const users = getRegisteredUsers();
  const caregiversFromUsers = users
    .filter(u => u.roleCategory === 'CUIDADOR' || u.role?.toLowerCase().includes('cuidador'))
    .map((u) => {
      const isNight = u.shift?.toLowerCase().includes('noite') || u.shift?.toLowerCase().includes('noturn');
      const isTeamB = u.team?.toLowerCase().includes('equipe b') || u.team?.toLowerCase().includes('grupo b');

      return {
        id: u.id,
        name: u.name,
        period: isNight ? ('Noturno' as const) : ('Diurno' as const),
        shiftHours: isNight ? '19h às 07h (12/36)' : '07h às 19h (12/36)',
        teamGroup: isTeamB ? ('Equipe B' as const) : ('Equipe A' as const),
        role: u.role,
      };
    });

  if (caregiversFromUsers.length >= 8) {
    return caregiversFromUsers;
  }

  const existingNames = new Set(caregiversFromUsers.map(c => c.name));
  const merged = [...caregiversFromUsers];

  DEFAULT_8_CAREGIVERS.forEach(def => {
    if (!existingNames.has(def.name)) {
      merged.push(def);
      existingNames.add(def.name);
    }
  });

  return merged.slice(0, 8);
}

export const parseDDMMYYYY = (dStr: string): Date => {
  const parts = dStr.split('/');
  if (parts.length < 3) return new Date();
  return new Date(Number(parts[2]), Number(parts[1]) - 1, Number(parts[0]));
};

export const getDiffDays = (dateStr1: string, dateStr2: string): number => {
  const d1 = parseDDMMYYYY(dateStr1);
  const d2 = parseDDMMYYYY(dateStr2);
  const diffMs = Math.abs(d2.getTime() - d1.getTime());
  return Math.round(diffMs / (1000 * 60 * 60 * 24));
};

export interface DayCoverageStatus {
  date: string;
  dayOfWeek: string;
  dayCount: number;
  nightCount: number;
  dayVacantCount: number;
  nightVacantCount: number;
  isDayFullyCovered: boolean;
  isNightFullyCovered: boolean;
  is24hCovered: boolean;
  issues: string[];
}

export const check24hCoverage = (rosterList: StaffRoster[], weekDates: { date: string; dayOfWeek: string }[]) => {
  const dayStatuses: DayCoverageStatus[] = weekDates.map(d => {
    const items = rosterList.filter(r => r.date === d.date);

    const dayItems = items.filter(r => r.shiftType.toLowerCase().includes('diurno') || r.shiftType.toLowerCase().includes('07h'));
    const nightItems = items.filter(r => r.shiftType.toLowerCase().includes('noturno') || r.shiftType.toLowerCase().includes('19h'));

    const dayAssigned = dayItems.filter(r => r.assignedStaffName && r.assignedStaffName !== 'VAGO' && r.status !== 'Vago');
    const nightAssigned = nightItems.filter(r => r.assignedStaffName && r.assignedStaffName !== 'VAGO' && r.status !== 'Vago');

    const dayVacantCount = dayItems.filter(r => !r.assignedStaffName || r.assignedStaffName === 'VAGO' || r.status === 'Vago').length;
    const nightVacantCount = nightItems.filter(r => !r.assignedStaffName || r.assignedStaffName === 'VAGO' || r.status === 'Vago').length;

    const dayCount = dayAssigned.length;
    const nightCount = nightAssigned.length;

    const isDayFullyCovered = dayCount >= 2 && dayVacantCount === 0;
    const isNightFullyCovered = nightCount >= 2 && nightVacantCount === 0;
    const is24hCovered = isDayFullyCovered && isNightFullyCovered;

    const issues: string[] = [];
    if (dayCount < 2) {
      issues.push(`Turno Diurno (07h-19h): apenas ${dayCount} de 2 cuidadores alocados.`);
    }
    if (dayVacantCount > 0) {
      issues.push(`Turno Diurno possui ${dayVacantCount} vaga(s) sem cuidador.`);
    }
    if (nightCount < 2) {
      issues.push(`Turno Noturno (19h-07h): apenas ${nightCount} de 2 cuidadores alocados.`);
    }
    if (nightVacantCount > 0) {
      issues.push(`Turno Noturno possui ${nightVacantCount} vaga(s) sem cuidador.`);
    }

    return {
      date: d.date,
      dayOfWeek: d.dayOfWeek,
      dayCount,
      nightCount,
      dayVacantCount,
      nightVacantCount,
      isDayFullyCovered,
      isNightFullyCovered,
      is24hCovered,
      issues
    };
  });

  const coveredDaysCount = dayStatuses.filter(s => s.is24hCovered).length;
  const totalDays = dayStatuses.length;
  const coveragePercentage = totalDays > 0 ? Math.round((coveredDaysCount / totalDays) * 100) : 100;
  const daysWithGaps = dayStatuses.filter(s => !s.is24hCovered);

  return {
    dayStatuses,
    coveredDaysCount,
    totalDays,
    coveragePercentage,
    daysWithGaps,
    hasCoverageFailure: daysWithGaps.length > 0
  };
};

const detectConflicts = (rosterList: StaffRoster[], caregiverProfiles: Caregiver1236Profile[]): ScheduleConflict[] => {
  const conflicts: ScheduleConflict[] = [];
  const assignedItems = rosterList.filter(item => item.assignedStaffName && item.assignedStaffName.trim() !== '');

  const staffGroups: Record<string, StaffRoster[]> = {};
  assignedItems.forEach(item => {
    const name = item.assignedStaffName!.trim();
    if (!staffGroups[name]) staffGroups[name] = [];
    staffGroups[name].push(item);
  });

  Object.entries(staffGroups).forEach(([staffName, items]) => {
    const profile = caregiverProfiles.find(c => c.name === staffName);

    // 1. Check Shift Mismatch (e.g. Day Caregiver scheduled for Night)
    if (profile) {
      items.forEach(item => {
        const isShiftNight = item.shiftType.toLowerCase().includes('noturno');
        const isProfileNight = profile.period === 'Noturno';

        if (isShiftNight !== isProfileNight) {
          conflicts.push({
            id: `conf-mismatch-${staffName}-${item.id}`,
            staffName,
            date: item.date,
            dayOfWeek: item.dayOfWeek,
            conflictType: 'TURNO_INCOMPATATIVEL',
            severity: 'Alta',
            title: `Troca de Turno Incompatível: ${staffName}`,
            description: `${staffName} é cadastrado(a) no período ${profile.period} (12/36), mas foi alocado(a) no turno ${item.shiftType} na data ${item.date}.`,
            conflictingShifts: [item]
          });
        }
      });
    }

    // 2. Check Overlaps and Multiple Shifts on Same Date
    const dateGroups: Record<string, StaffRoster[]> = {};
    items.forEach(item => {
      if (!dateGroups[item.date]) dateGroups[item.date] = [];
      dateGroups[item.date].push(item);
    });

    Object.entries(dateGroups).forEach(([date, dayItems]) => {
      if (dayItems.length > 1) {
        const shiftTypes = dayItems.map(d => d.shiftType);
        const uniqueShiftTypes = new Set(shiftTypes);

        if (uniqueShiftTypes.size < shiftTypes.length) {
          conflicts.push({
            id: `conf-dup-${staffName}-${date}`,
            staffName,
            date,
            dayOfWeek: dayItems[0].dayOfWeek,
            conflictType: 'SOBREPOSICAO_HORARIO',
            severity: 'Crítica',
            title: `Sobreposição de Horário: ${staffName}`,
            description: `${staffName} possui múltiplos plantões marcados para o mesmo turno (${shiftTypes[0]}) na data ${date} (${dayItems[0].dayOfWeek}).`,
            conflictingShifts: dayItems
          });
        } else {
          conflicts.push({
            id: `conf-double-${staffName}-${date}`,
            staffName,
            date,
            dayOfWeek: dayItems[0].dayOfWeek,
            conflictType: 'DUPLA_JORNADA',
            severity: 'Alta',
            title: `Violação 12/36 - Jornada Dupla: ${staffName}`,
            description: `${staffName} foi escalado(a) no Diurno e no Noturno no mesmo dia (${date}). Isso viola a escala 12/36 e impede o descanso regulamentar de 36h.`,
            conflictingShifts: dayItems
          });
        }
      }
    });

    // 3. Check Consecutive Days Violation (12/36 Rest Requirement)
    const sortedItems = [...items].sort((a, b) => {
      const dateA = a.date.split('/').reverse().join('');
      const dateB = b.date.split('/').reverse().join('');
      return dateA.localeCompare(dateB);
    });

    for (let i = 0; i < sortedItems.length - 1; i++) {
      const current = sortedItems[i];
      const next = sortedItems[i + 1];

      // Parse date DD/MM/YYYY
      const parseDate = (dStr: string) => {
        const parts = dStr.split('/');
        return new Date(Number(parts[2]), Number(parts[1]) - 1, Number(parts[0]));
      };

      const date1 = parseDate(current.date);
      const date2 = parseDate(next.date);
      const diffTime = Math.abs(date2.getTime() - date1.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays === 1) {
        conflicts.push({
          id: `conf-consec-${staffName}-${current.date}-${next.date}`,
          staffName,
          date: `${current.date} ➔ ${next.date}`,
          dayOfWeek: `${current.dayOfWeek} / ${next.dayOfWeek}`,
          conflictType: 'INTERJORNADA_INSUFFICIENTE',
          severity: 'Alta',
          title: `Violação 12/36 - Dias Consecutivos Sem 36h de Descanso: ${staffName}`,
          description: `${staffName} trabalhou na data ${current.date} e foi escalado(a) novamente no dia seguinte ${next.date}. A escala 12/36 exige 36 horas ininterruptas de descanso entre os plantões.`,
          conflictingShifts: [current, next]
        });
      }
    }
  });

  return conflicts;
};

export const EscalasView: React.FC<EscalasViewProps> = ({
  roster,
  residents = [],
  onAddRosterItem,
}) => {
  const [activeTab, setActiveTab] = useState<'PLANTAO' | 'KATZ' | 'LAWTON'>('PLANTAO');
  const [localRoster, setLocalRoster] = useState<StaffRoster[]>(roster);
  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'TODOS' | 'CONFLITOS' | 'VAGOS' | 'CONFIRMADOS'>('TODOS');
  const [shiftFilter, setShiftFilter] = useState<'TODOS' | 'Diurno' | 'Noturno'>('TODOS');

  // Matrix Calendar Filter & Dates State
  const [matrixFilter, setMatrixFilter] = useState<'TODOS' | 'EQUIPE_A' | 'EQUIPE_B' | 'DIURNO' | 'NOTURNO'>('TODOS');

  const weekDates = useMemo(() => {
    const dateMap = new Map<string, { date: string; dayOfWeek: string }>();
    localRoster.forEach(item => {
      if (item.date && !dateMap.has(item.date)) {
        dateMap.set(item.date, { date: item.date, dayOfWeek: item.dayOfWeek });
      }
    });

    const datesArray = Array.from(dateMap.values()).sort((a, b) => {
      const pA = a.date.split('/').reverse().join('');
      const pB = b.date.split('/').reverse().join('');
      return pA.localeCompare(pB);
    });

    if (datesArray.length > 0) return datesArray;

    return [
      { date: '03/08/2026', dayOfWeek: 'Segunda' },
      { date: '04/08/2026', dayOfWeek: 'Terça' },
      { date: '05/08/2026', dayOfWeek: 'Quarta' },
      { date: '06/08/2026', dayOfWeek: 'Quinta' },
      { date: '07/08/2026', dayOfWeek: 'Sexta' },
      { date: '08/08/2026', dayOfWeek: 'Sábado' },
      { date: '09/08/2026', dayOfWeek: 'Domingo' },
    ];
  }, [localRoster]);

  const activeCaregivers = useMemo(() => {
    return getRealCaregivers();
  }, [localRoster]);

  const dayCaregiversList = useMemo(() => activeCaregivers.filter(c => c.period === 'Diurno'), [activeCaregivers]);
  const nightCaregiversList = useMemo(() => activeCaregivers.filter(c => c.period === 'Noturno'), [activeCaregivers]);

  const matrixCaregivers = useMemo(() => {
    return activeCaregivers.filter(cg => {
      if (matrixFilter === 'EQUIPE_A') return cg.teamGroup === 'Equipe A';
      if (matrixFilter === 'EQUIPE_B') return cg.teamGroup === 'Equipe B';
      if (matrixFilter === 'DIURNO') return cg.period === 'Diurno';
      if (matrixFilter === 'NOTURNO') return cg.period === 'Noturno';
      return true;
    });
  }, [matrixFilter, activeCaregivers]);

  // Modal State for Add/Edit Caregiver Shift
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingShiftId, setEditingShiftId] = useState<string | null>(null);
  const [formDate, setFormDate] = useState('04/08/2026');
  const [formDayOfWeek, setFormDayOfWeek] = useState('Terça');
  const [formShiftType, setFormShiftType] = useState<ShiftType>('Diurno (07h-19h)');
  const [formRoleRequired, setFormRoleRequired] = useState('Cuidador Residencial');
  const [formStaffName, setFormStaffName] = useState('');
  const [formStatus, setFormStatus] = useState<'Confirmado' | 'Vago' | 'Sobreposição'>('Confirmado');
  const [formNotes, setFormNotes] = useState('');

  // Reassignment Quick Dropdown
  const [reassigningShiftId, setReassigningShiftId] = useState<string | null>(null);
  const [selectedNewCaregiver, setSelectedNewCaregiver] = useState('');

  // Functional Scales State
  const [assessments, setAssessments] = useState<FunctionalScaleAssessment[]>([]);
  const [selectedResidentId, setSelectedResidentId] = useState<string>(residents[0]?.id || '');

  // Katz Assessment Form State
  const [katzBanho, setKatzBanho] = useState<number>(1);
  const [katzVestuario, setKatzVestuario] = useState<number>(1);
  const [katzBanheiro, setKatzBanheiro] = useState<number>(1);
  const [katzTransferencia, setKatzTransferencia] = useState<number>(1);
  const [katzContinencia, setKatzContinencia] = useState<number>(1);
  const [katzAlimentacao, setKatzAlimentacao] = useState<number>(1);

  // Lawton Assessment Form State
  const [lawtonTelefone, setLawtonTelefone] = useState<number>(1);
  const [lawtonCompras, setLawtonCompras] = useState<number>(1);
  const [lawtonRefeicoes, setLawtonRefeicoes] = useState<number>(1);
  const [lawtonDomesticas, setLawtonDomesticas] = useState<number>(1);
  const [lawtonLavarRoupa, setLawtonLavarRoupa] = useState<number>(1);
  const [lawtonTransporte, setLawtonTransporte] = useState<number>(1);
  const [lawtonRemedios, setLawtonRemedios] = useState<number>(1);
  const [lawtonDinheiro, setLawtonDinheiro] = useState<number>(1);

  useEffect(() => {
    setAssessments(giterStore.getAssessments());
  }, []);

  useEffect(() => {
    setLocalRoster(roster);
  }, [roster]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Automatic Conflict Detection
  const conflicts = useMemo(() => {
    return detectConflicts(localRoster, activeCaregivers);
  }, [localRoster, activeCaregivers]);

  // 24h Coverage Audit for Coordination
  const coverageAudit = useMemo(() => {
    return check24hCoverage(localRoster, weekDates);
  }, [localRoster, weekDates]);

  const vacantShifts = localRoster.filter(r => r.status === 'Vago' || !r.assignedStaffName);

  // Set of caregiver names with conflicts
  const conflictedStaffNames = useMemo(() => {
    return new Set(conflicts.map(c => c.staffName));
  }, [conflicts]);

  // Real-time check if modal form creates a 12/36 conflict
  const formConflictWarning = useMemo(() => {
    if (!formStaffName || formStaffName === 'VAGO') return null;

    const profile = activeCaregivers.find(c => c.name === formStaffName);
    const isNightForm = formShiftType.toLowerCase().includes('noturno');

    // Check 1: Incompatible shift period
    if (profile && profile.period === 'Noturno' && !isNightForm) {
      return `${formStaffName} é cadastrado(a) como CUIDADOR NOTURNO (19h-07h). Incompatível com turno Diurno!`;
    }
    if (profile && profile.period === 'Diurno' && isNightForm) {
      return `${formStaffName} é cadastrado(a) como CUIDADORA DIURNA (07h-19h). Incompatível com turno Noturno!`;
    }

    // Check 2: Same date assignment overlap
    const existingSameDate = localRoster.filter(r => 
      r.id !== editingShiftId &&
      r.assignedStaffName === formStaffName &&
      r.date === formDate
    );
    if (existingSameDate.length > 0) {
      return `${formStaffName} já possui plantão em ${formDate}. A sobreposição de horários / jornada dupla é estritamente proibida!`;
    }

    // Check 3: Consecutive day assignment (violating 36h rest requirement)
    const existingAdjacentDate = localRoster.filter(r => {
      if (r.id === editingShiftId || r.assignedStaffName !== formStaffName) return false;
      return getDiffDays(r.date, formDate) === 1;
    });
    if (existingAdjacentDate.length > 0) {
      const adjDate = existingAdjacentDate[0].date;
      return `${formStaffName} já possui plantão escalado em ${adjDate}. A alocação em dias consecutivos (${adjDate} e ${formDate}) viola o descanso obrigatório de 36h da escala 12/36!`;
    }

    return null;
  }, [localRoster, formStaffName, formDate, formShiftType, editingShiftId, activeCaregivers]);

  const handleRunAiRosterAnalysis = async () => {
    setIsAnalyzing(true);
    try {
      const res = await fetch('/api/nexa/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: 'Audite a escala de 8 cuidadores em escala 12/36 (4 Diurnos das 07h às 19h e 4 Noturnos das 19h às 07h). Verifique folgas de 36h, ausência de jornadas duplas e cobertura completa dos turnos.',
          contextPage: 'Escalas 12/36 de Cuidadores',
        }),
      });

      const data = await res.json();
      setAiAnalysis(data.text || 'Auditoria da escala 12/36 de cuidadores concluída.');
    } catch (err) {
      console.error('Error analyzing roster:', err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Restore perfect 12/36 weekly schedule for the 8 caregivers
  const handleGenerateStandard1236Roster = () => {
    const daysWeek = [
      { date: '03/08/2026', dayOfWeek: 'Segunda', team: 'Equipe A' },
      { date: '04/08/2026', dayOfWeek: 'Terça', team: 'Equipe B' },
      { date: '05/08/2026', dayOfWeek: 'Quarta', team: 'Equipe A' },
      { date: '06/08/2026', dayOfWeek: 'Quinta', team: 'Equipe B' },
      { date: '07/08/2026', dayOfWeek: 'Sexta', team: 'Equipe A' },
      { date: '08/08/2026', dayOfWeek: 'Sábado', team: 'Equipe B' },
      { date: '09/08/2026', dayOfWeek: 'Domingo', team: 'Equipe A' },
    ];

    const newRoster: StaffRoster[] = [];
    let idCounter = 1;

    daysWeek.forEach(d => {
      // Day caregivers for this team (07h - 19h)
      const dayTeam = activeCaregivers.filter(c => c.period === 'Diurno' && c.teamGroup === d.team);
      dayTeam.forEach(cg => {
        newRoster.push({
          id: `rost-gen-${idCounter++}`,
          date: d.date,
          dayOfWeek: d.dayOfWeek,
          shiftType: 'Diurno (07h-19h)',
          roleRequired: `Cuidador Residencial (${d.team})`,
          assignedStaffName: cg.name,
          status: 'Confirmado',
          notes: `Escala 12/36 regular (${d.team} Diurna)`
        });
      });

      // Night caregivers for this team (19h - 07h)
      const nightTeam = activeCaregivers.filter(c => c.period === 'Noturno' && c.teamGroup === d.team);
      nightTeam.forEach(cg => {
        newRoster.push({
          id: `rost-gen-${idCounter++}`,
          date: d.date,
          dayOfWeek: d.dayOfWeek,
          shiftType: 'Noturno (19h-07h)',
          roleRequired: `Cuidador Noturno (${d.team})`,
          assignedStaffName: cg.name,
          status: 'Confirmado',
          notes: `Escala 12/36 regular (${d.team} Noturna)`
        });
      });
    });

    setLocalRoster(newRoster);
    showToast('✨ Escala 12/36 restaurada com sucesso! 4 Cuidadores Diurnos e 4 Noturnos sem conflitos.');
  };

  // Quick Conflict Resolution: Unassign or remove duplicate
  const handleUnassignDuplicate = (shiftId: string, caregiverName: string) => {
    setLocalRoster(prev => prev.map(item => {
      if (item.id === shiftId) {
        return {
          ...item,
          assignedStaffName: undefined,
          status: 'Vago',
          notes: `Desescalado(a) para corrigir inconsistência de ${caregiverName}.`
        };
      }
      return item;
    }));
    showToast(`✅ Duplicidade de ${caregiverName} resolvida. Plantão alterado para VAGO.`);
  };

  // Quick Conflict Resolution: Reassign to another caregiver with strict 12/36 validation
  const handleConfirmReassign = (shiftId: string) => {
    if (!selectedNewCaregiver) return;
    const shiftToUpdate = localRoster.find(s => s.id === shiftId);
    if (!shiftToUpdate) return;

    const profile = activeCaregivers.find(c => c.name === selectedNewCaregiver);
    const isNightShift = shiftToUpdate.shiftType.toLowerCase().includes('noturno');

    if (profile && profile.period === 'Noturno' && !isNightShift) {
      showToast(`🚫 REAGENDAMENTO BLOQUEADO: ${selectedNewCaregiver} é CUIDADOR NOTURNO e não pode assumir turno Diurno.`);
      return;
    }
    if (profile && profile.period === 'Diurno' && isNightShift) {
      showToast(`🚫 REAGENDAMENTO BLOQUEADO: ${selectedNewCaregiver} é CUIDADORA DIURNA e não pode assumir turno Noturno.`);
      return;
    }

    // Check same date overlap
    const sameDateConflict = localRoster.some(r => r.id !== shiftId && r.assignedStaffName === selectedNewCaregiver && r.date === shiftToUpdate.date);
    if (sameDateConflict) {
      showToast(`🚫 REAGENDAMENTO BLOQUEADO: ${selectedNewCaregiver} já possui plantão escalado em ${shiftToUpdate.date}.`);
      return;
    }

    // Check consecutive day violation
    const adjacentDateConflict = localRoster.some(r => {
      if (r.id === shiftId || r.assignedStaffName !== selectedNewCaregiver) return false;
      return getDiffDays(r.date, shiftToUpdate.date) === 1;
    });
    if (adjacentDateConflict) {
      showToast(`🚫 REAGENDAMENTO BLOQUEADO: ${selectedNewCaregiver} trabalhou no dia anterior/posterior. Viola a folga de 36h.`);
      return;
    }

    setLocalRoster(prev => prev.map(item => {
      if (item.id === shiftId) {
        return {
          ...item,
          assignedStaffName: selectedNewCaregiver,
          status: 'Confirmado',
          notes: `Remanejado para ${selectedNewCaregiver} com validação rigorosa 12/36.`
        };
      }
      return item;
    }));
    showToast(`✅ Plantão remanejado com sucesso para ${selectedNewCaregiver}.`);
    setReassigningShiftId(null);
    setSelectedNewCaregiver('');
  };

  // Save Add/Edit Caregiver Shift Form
  const handleSaveShiftModal = (e: React.FormEvent) => {
    e.preventDefault();

    if (formConflictWarning) {
      showToast(`🚫 SALVAMENTO BLOQUEADO: ${formConflictWarning}`);
      return;
    }

    const isVago = !formStaffName || formStaffName === 'VAGO';

    if (editingShiftId) {
      setLocalRoster(prev => prev.map(item => {
        if (item.id === editingShiftId) {
          return {
            ...item,
            date: formDate,
            dayOfWeek: formDayOfWeek,
            shiftType: formShiftType,
            roleRequired: formRoleRequired,
            assignedStaffName: isVago ? undefined : formStaffName,
            status: isVago ? 'Vago' : 'Confirmado',
            notes: formNotes || undefined
          };
        }
        return item;
      }));
      showToast('✅ Plantão do cuidador atualizado com sucesso!');
    } else {
      const newItem: StaffRoster = {
        id: `rost-cuid-${Date.now()}`,
        date: formDate,
        dayOfWeek: formDayOfWeek,
        shiftType: formShiftType,
        roleRequired: formRoleRequired,
        assignedStaffName: isVago ? undefined : formStaffName,
        status: isVago ? 'Vago' : 'Confirmado',
        notes: formNotes || undefined
      };
      setLocalRoster(prev => [newItem, ...prev]);
      onAddRosterItem(newItem);
      showToast('✅ Novo plantão de cuidador adicionado à escala!');
    }

    setIsModalOpen(false);
    setEditingShiftId(null);
  };

  const handleOpenEditModal = (shift: StaffRoster) => {
    setEditingShiftId(shift.id);
    setFormDate(shift.date);
    setFormDayOfWeek(shift.dayOfWeek);
    setFormShiftType(shift.shiftType);
    setFormRoleRequired(shift.roleRequired);
    setFormStaffName(shift.assignedStaffName || 'VAGO');
    setFormStatus(shift.status);
    setFormNotes(shift.notes || '');
    setIsModalOpen(true);
  };

  const handleOpenNewModal = () => {
    setEditingShiftId(null);
    setFormDate('04/08/2026');
    setFormDayOfWeek('Terça');
    setFormShiftType('Diurno (07h-19h)');
    setFormRoleRequired('Cuidador Residencial');
    setFormStaffName('Cuidador Roberto Mendes');
    setFormStatus('Confirmado');
    setFormNotes('');
    setIsModalOpen(true);
  };

  const handleDeleteShift = (shiftId: string) => {
    if (confirm('Tem certeza que deseja remover este plantão da escala dos cuidadores?')) {
      setLocalRoster(prev => prev.filter(r => r.id !== shiftId));
      showToast('🗑️ Plantão removido da escala.');
    }
  };

  // Filtered Caregivers Roster Table Items
  const filteredRoster = useMemo(() => {
    return localRoster.filter(item => {
      // Search
      const searchLower = searchQuery.toLowerCase();
      const matchesSearch = 
        !searchQuery ||
        item.date.toLowerCase().includes(searchLower) ||
        item.dayOfWeek.toLowerCase().includes(searchLower) ||
        (item.assignedStaffName && item.assignedStaffName.toLowerCase().includes(searchLower)) ||
        item.roleRequired.toLowerCase().includes(searchLower);

      // Status
      let matchesStatus = true;
      if (statusFilter === 'CONFLITOS') {
        matchesStatus = item.status === 'Sobreposição' || (item.assignedStaffName ? conflictedStaffNames.has(item.assignedStaffName) : false);
      } else if (statusFilter === 'VAGOS') {
        matchesStatus = item.status === 'Vago' || !item.assignedStaffName;
      } else if (statusFilter === 'CONFIRMADOS') {
        matchesStatus = item.status === 'Confirmado';
      }

      // Shift
      let matchesShift = true;
      if (shiftFilter === 'Diurno') {
        matchesShift = item.shiftType.toLowerCase().includes('diurno') || item.shiftType.toLowerCase().includes('manhã') || item.shiftType.toLowerCase().includes('tarde');
      } else if (shiftFilter === 'Noturno') {
        matchesShift = item.shiftType.toLowerCase().includes('noturno');
      }

      return matchesSearch && matchesStatus && matchesShift;
    });
  }, [localRoster, searchQuery, statusFilter, shiftFilter, conflictedStaffNames]);

  // Katz Assessment Handler
  const handleSaveKatzAssessment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedResidentId) return;

    const totalKatz = katzBanho + katzVestuario + katzBanheiro + katzTransferencia + katzContinencia + katzAlimentacao;
    let classification = 'Independência Total';
    if (totalKatz <= 2) classification = 'Dependência Importante/Grave';
    else if (totalKatz <= 4) classification = 'Dependência Parcial/Moderada';

    const newAssessment: FunctionalScaleAssessment = {
      id: `katz-${Date.now()}`,
      residentId: selectedResidentId,
      scaleType: 'Katz',
      score: totalKatz,
      classification,
      assessedBy: 'Enf. Responsável Técnico',
      assessmentDate: new Date().toISOString().split('T')[0],
      details: {
        banho: katzBanho,
        vestuario: katzVestuario,
        banheiro: katzBanheiro,
        transferencia: katzTransferencia,
        continencia: katzContinencia,
        alimentacao: katzAlimentacao
      }
    };

    giterStore.saveAssessment(newAssessment);
    setAssessments(giterStore.getAssessments());
    showToast(`Avaliação Katz salva! Score: ${totalKatz}/6 (${classification})`);
  };

  // Lawton Assessment Handler
  const handleSaveLawtonAssessment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedResidentId) return;

    const totalLawton = lawtonTelefone + lawtonCompras + lawtonRefeicoes + lawtonDomesticas + lawtonLavarRoupa + lawtonTransporte + lawtonRemedios + lawtonDinheiro;
    let classification = 'Independência Total em AIVD';
    if (totalLawton <= 8) classification = 'Dependência Total';
    else if (totalLawton <= 15) classification = 'Dependência Parcial';

    const newAssessment: FunctionalScaleAssessment = {
      id: `lawton-${Date.now()}`,
      residentId: selectedResidentId,
      scaleType: 'Lawton',
      score: totalLawton,
      classification,
      assessedBy: 'Enf. Responsável Técnico',
      assessmentDate: new Date().toISOString().split('T')[0],
      details: {
        telefone: lawtonTelefone,
        compras: lawtonCompras,
        refeicoes: lawtonRefeicoes,
        domesticas: lawtonDomesticas,
        lavarRoupa: lawtonLavarRoupa,
        transporte: lawtonTransporte,
        remedios: lawtonRemedios,
        dinheiro: lawtonDinheiro
      }
    };

    giterStore.saveAssessment(newAssessment);
    setAssessments(giterStore.getAssessments());
    showToast(`Avaliação Lawton salva! Score: ${totalLawton}/24 (${classification})`);
  };

  const selectedResident = residents.find(r => r.id === selectedResidentId) || residents[0];
  const residentKatzHistory = assessments.filter(a => a.residentId === selectedResidentId && a.scaleType === 'Katz');
  const residentLawtonHistory = assessments.filter(a => a.residentId === selectedResidentId && a.scaleType === 'Lawton');

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200">
      {/* Toast Feedback */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-2xl border border-teal-500 flex items-center gap-2 animate-in slide-in-from-top duration-200 text-xs font-bold">
          <Info className="w-4 h-4 text-teal-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 bg-white border border-zinc-200/90 rounded-2xl shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Users className="w-5 h-5 text-teal-600" />
            <h1 className="text-lg font-black text-zinc-900 uppercase tracking-wider">
              Escala de Cuidadores (12x36) & Avaliação Funcional
            </h1>
          </div>
          <p className="text-xs text-zinc-500 font-medium">
            Estrutura fixa de 8 cuidadores em regime 12/36 (4 Diurnos das 07h às 19h e 4 Noturnos das 19h às 07h), auditoria automatizada e escalas Katz/Lawton.
          </p>
        </div>

        {activeTab === 'PLANTAO' && (
          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
            <button
              onClick={handleGenerateStandard1236Roster}
              className="py-2.5 px-3.5 bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold text-xs rounded-xl shadow-xs transition-all flex items-center gap-1.5"
              title="Aplica a escala 12/36 padronizada para os 8 cuidadores sem qualquer conflito"
            >
              <Zap className="w-4 h-4 text-emerald-200" />
              <span>Gerar Escala 12/36 Perfeita</span>
            </button>

            <button
              onClick={handleOpenNewModal}
              className="py-2.5 px-3.5 bg-teal-600 hover:bg-teal-700 text-white font-extrabold text-xs rounded-xl shadow-xs transition-all flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Novo Plantão</span>
            </button>

            <button
              onClick={handleRunAiRosterAnalysis}
              disabled={isAnalyzing}
              className="py-2.5 px-3.5 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white font-extrabold text-xs rounded-xl shadow-xs transition-all flex items-center gap-1.5"
            >
              <Sparkles className="w-4 h-4 text-purple-100" />
              <span>{isAnalyzing ? 'Analisando...' : 'IA Auditoria 12/36'}</span>
            </button>
          </div>
        )}
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-zinc-200 pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('PLANTAO')}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-all flex items-center gap-2 shrink-0 ${
            activeTab === 'PLANTAO'
              ? 'bg-teal-600 text-white shadow-xs'
              : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Escala dos Cuidadores ({localRoster.length})</span>
          {conflicts.length > 0 && (
            <span className="bg-rose-500 text-white text-[10px] font-black px-1.5 py-0.5 rounded-full animate-pulse">
              {conflicts.length} conflito(s)
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('KATZ')}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-all flex items-center gap-2 shrink-0 ${
            activeTab === 'KATZ'
              ? 'bg-teal-600 text-white shadow-xs'
              : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
          }`}
        >
          <Activity className="w-4 h-4" />
          <span>Escala Katz (ABVD - Atividades Básicas)</span>
        </button>

        <button
          onClick={() => setActiveTab('LAWTON')}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-all flex items-center gap-2 shrink-0 ${
            activeTab === 'LAWTON'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
          }`}
        >
          <Award className="w-4 h-4" />
          <span>Escala Lawton (AIVD - Atividades Instrumentais)</span>
        </button>
      </div>

      {/* TAB 1: PLANTÃO DOS CUIDADORES */}
      {activeTab === 'PLANTAO' && (
        <div className="space-y-6">

          {/* PAINEL DE ALERTAS DA COORDENAÇÃO DE ENFERMAGEM & SRT — AUDITORIA DE COBERTURA 24H */}
          <div className={`p-5 rounded-2xl border transition-all shadow-md ${
            coverageAudit.hasCoverageFailure || conflicts.length > 0
              ? 'bg-gradient-to-br from-amber-950 via-slate-900 to-slate-950 border-amber-500/80 text-white'
              : 'bg-gradient-to-br from-emerald-950 via-slate-900 to-slate-950 border-emerald-500/80 text-white'
          }`}>
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 pb-3 border-b border-white/10">
              <div className="flex items-center gap-3">
                <div className={`p-2.5 rounded-xl ${
                  coverageAudit.hasCoverageFailure || conflicts.length > 0
                    ? 'bg-amber-500 text-slate-950 font-black animate-bounce'
                    : 'bg-emerald-600 text-white'
                }`}>
                  {coverageAudit.hasCoverageFailure || conflicts.length > 0 ? (
                    <AlertTriangle className="w-5 h-5" />
                  ) : (
                    <ShieldCheck className="w-5 h-5" />
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black uppercase text-teal-400 tracking-wider">
                      Coordenação de Enfermagem & SRT — Residencial Salomão
                    </span>
                  </div>
                  <h2 className="text-sm font-black text-white uppercase tracking-wide">
                    {coverageAudit.hasCoverageFailure || conflicts.length > 0
                      ? `Alerta da Coordenação: Escala Incompleta ou Com Inconsistências (${coverageAudit.daysWithGaps.length} data(s) sem cobertura 24h)`
                      : `Escala 100% Coberta: Todos os turnos de 24h garantidos com a equipe real de 8 cuidadores`}
                  </h2>
                  <p className="text-xs text-zinc-300 font-medium">
                    Exigência institucional: 2 Cuidadores Diurnos (07h-19h) e 2 Cuidadores Noturnos (19h-07h) para cobertura contínua de 24h.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 self-end lg:self-center flex-wrap">
                <span className={`px-3 py-1.5 rounded-xl text-xs font-black border ${
                  coverageAudit.hasCoverageFailure
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                    : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                }`}>
                  {coverageAudit.coveragePercentage}% Cobertura 24h ({coverageAudit.coveredDaysCount}/{coverageAudit.totalDays} dias)
                </span>

                {(coverageAudit.hasCoverageFailure || conflicts.length > 0) && (
                  <button
                    type="button"
                    onClick={handleGenerateStandard1236Roster}
                    className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs rounded-xl shadow-xs transition-all flex items-center gap-1.5"
                  >
                    <Zap className="w-4 h-4 text-emerald-200" />
                    <span>Auto-Corrigir e Restaurar Escala 24h</span>
                  </button>
                )}
              </div>
            </div>

            {/* List of 24h Coverage Failures if present */}
            {coverageAudit.hasCoverageFailure && (
              <div className="mt-4 space-y-2">
                <span className="text-[10px] font-extrabold uppercase text-amber-400 tracking-wider block">
                  Alerta da Coordenação — Falhas na Cobertura de Turnos de 24 Horas:
                </span>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                  {coverageAudit.daysWithGaps.map(gap => (
                    <div key={gap.date} className="p-3 bg-slate-900/90 rounded-xl border border-amber-500/40 text-xs space-y-1">
                      <div className="flex items-center justify-between font-extrabold text-white">
                        <span className="text-amber-300">{gap.dayOfWeek} ({gap.date})</span>
                        <span className="px-2 py-0.5 bg-amber-500 text-slate-950 text-[9px] rounded font-black uppercase">
                          Atenção Coordenação
                        </span>
                      </div>
                      <ul className="space-y-0.5 text-[11px] text-zinc-300 font-medium">
                        {gap.issues.map((iss, idx) => (
                          <li key={idx} className="flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" />
                            <span>{iss}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* CALENDÁRIO VISUAL DE TURNOS COLORIDO (MATRIZ 12x36 POR CUIDADOR) */}
          <div className="p-5 bg-white border border-zinc-200/90 rounded-2xl shadow-xs space-y-4">
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 border-b border-zinc-200 pb-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="p-1.5 bg-teal-100 text-teal-700 rounded-lg">
                    <CalendarDays className="w-5 h-5" />
                  </span>
                  <h2 className="text-sm font-black text-zinc-900 uppercase tracking-wider">
                    Calendário Visual de Turnos (Matriz 12x36 Por Cuidador)
                  </h2>
                </div>
                <p className="text-xs text-zinc-500 font-medium">
                  Visão em matriz dos 8 cuidadores na semana: ☀️ Diurno (07h-19h) | 🌙 Noturno (19h-07h) | 💤 Folga Regulamentar (36h). Clique em qualquer célula para editar ou agendar plantão.
                </p>
              </div>

              {/* Matrix Filter Chips */}
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[11px] text-zinc-400 font-bold">Filtrar Cuidadores:</span>
                <button
                  type="button"
                  onClick={() => setMatrixFilter('TODOS')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    matrixFilter === 'TODOS'
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
                  }`}
                >
                  Todos (8)
                </button>

                <button
                  type="button"
                  onClick={() => setMatrixFilter('EQUIPE_A')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    matrixFilter === 'EQUIPE_A'
                      ? 'bg-teal-600 text-white shadow-xs'
                      : 'bg-teal-50 text-teal-800 border border-teal-200 hover:bg-teal-100'
                  }`}
                >
                  Equipe A (4)
                </button>

                <button
                  type="button"
                  onClick={() => setMatrixFilter('EQUIPE_B')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    matrixFilter === 'EQUIPE_B'
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'bg-indigo-50 text-indigo-800 border border-indigo-200 hover:bg-indigo-100'
                  }`}
                >
                  Equipe B (4)
                </button>

                <button
                  type="button"
                  onClick={() => setMatrixFilter('DIURNO')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 ${
                    matrixFilter === 'DIURNO'
                      ? 'bg-amber-500 text-slate-950 font-black shadow-xs'
                      : 'bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100'
                  }`}
                >
                  <Sun className="w-3.5 h-3.5 text-amber-600" />
                  <span>Diurnos (4)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setMatrixFilter('NOTURNO')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 ${
                    matrixFilter === 'NOTURNO'
                      ? 'bg-indigo-900 text-white font-black shadow-xs'
                      : 'bg-slate-100 text-indigo-900 border border-indigo-200 hover:bg-indigo-100'
                  }`}
                >
                  <Moon className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Noturnos (4)</span>
                </button>
              </div>
            </div>

            {/* COLOR LEGEND BAR */}
            <div className="flex flex-wrap items-center gap-3 p-3 bg-zinc-50 border border-zinc-200 rounded-xl text-xs">
              <span className="font-extrabold text-zinc-600 text-[11px] uppercase tracking-wider">Legenda de Cores:</span>
              
              <div className="flex items-center gap-1.5 px-2.5 py-1 bg-amber-400 text-slate-950 font-extrabold rounded-lg shadow-2xs text-[11px]">
                <Sun className="w-3.5 h-3.5 text-slate-900" />
                <span>Diurno (07h às 19h)</span>
              </div>

              <div className="flex items-center gap-1.5 px-2.5 py-1 bg-indigo-900 text-indigo-100 font-extrabold rounded-lg shadow-2xs text-[11px]">
                <Moon className="w-3.5 h-3.5 text-indigo-300" />
                <span>Noturno (19h às 07h)</span>
              </div>

              <div className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-200 text-slate-700 font-bold rounded-lg text-[11px]">
                <Coffee className="w-3.5 h-3.5 text-slate-500" />
                <span>Folga Regulamentar 36h</span>
              </div>

              <div className="flex items-center gap-1.5 px-2.5 py-1 bg-rose-600 text-white font-black rounded-lg animate-pulse text-[11px]">
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>Conflito na Escala</span>
              </div>
            </div>

            {/* MATRIX CALENDAR TABLE */}
            <div className="overflow-x-auto border border-zinc-200 rounded-xl shadow-2xs">
              <table className="w-full text-left border-collapse min-w-[900px]">
                <thead>
                  <tr className="bg-slate-900 text-white text-xs font-black uppercase tracking-wider">
                    <th className="p-3 border-b border-slate-800 w-56 sticky left-0 bg-slate-900 z-10">
                      Cuidador / Período
                    </th>
                    {weekDates.map((d) => (
                      <th key={d.date} className="p-3 border-b border-slate-800 text-center min-w-[110px]">
                        <div className="text-teal-300 text-xs font-black">{d.dayOfWeek}</div>
                        <div className="text-[10px] text-zinc-400 font-medium">{d.date}</div>
                      </th>
                    ))}
                    <th className="p-3 border-b border-slate-800 text-center w-28">
                      Carga Semanal
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-zinc-200 text-xs font-medium">
                  {matrixCaregivers.map((cg) => {
                    const isNightCaregiver = cg.period === 'Noturno';
                    
                    // Count shifts for this caregiver in this week
                    const caregiverShiftsThisWeek = localRoster.filter(r => r.assignedStaffName === cg.name);
                    const totalHoursThisWeek = caregiverShiftsThisWeek.length * 12;

                    return (
                      <tr key={cg.id} className="hover:bg-zinc-50/80 transition-colors">
                        {/* Caregiver Profile Sticky Cell */}
                        <td className="p-3 sticky left-0 bg-white border-r border-zinc-200 z-10 shadow-xs">
                          <div className="flex items-center gap-2">
                            <span className={`p-1.5 rounded-lg font-black text-xs ${
                              isNightCaregiver ? 'bg-indigo-900 text-indigo-200' : 'bg-amber-100 text-amber-800'
                            }`}>
                              {isNightCaregiver ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
                            </span>
                            <div>
                              <div className="font-extrabold text-zinc-900 text-xs leading-snug">
                                {cg.name}
                              </div>
                              <div className="flex items-center gap-1.5 mt-0.5">
                                <span className={`px-1.5 py-0.5 rounded text-[9px] font-black uppercase tracking-wider ${
                                  cg.teamGroup === 'Equipe A' ? 'bg-teal-100 text-teal-800' : 'bg-indigo-100 text-indigo-800'
                                }`}>
                                  {cg.teamGroup}
                                </span>
                                <span className="text-[10px] text-zinc-500 font-bold">
                                  {cg.period}
                                </span>
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Date Columns */}
                        {weekDates.map((d) => {
                          const shifts = localRoster.filter(
                            r => r.assignedStaffName === cg.name && r.date === d.date
                          );
                          const cellConflict = conflicts.find(
                            conf => conf.staffName === cg.name && (conf.date.includes(d.date) || conf.conflictingShifts.some(s => s.date === d.date))
                          );

                          // Case 0: No shifts -> Folga 36h
                          if (shifts.length === 0) {
                            return (
                              <td key={d.date} className="p-2 text-center align-middle border-r border-zinc-100">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setEditingShiftId(null);
                                    setFormDate(d.date);
                                    setFormDayOfWeek(d.dayOfWeek);
                                    setFormShiftType(cg.period === 'Diurno' ? 'Diurno (07h-19h)' : 'Noturno (19h-07h)');
                                    setFormRoleRequired(cg.role);
                                    setFormStaffName(cg.name);
                                    setFormStatus('Confirmado');
                                    setFormNotes('');
                                    setIsModalOpen(true);
                                  }}
                                  className="w-full h-14 p-2 rounded-xl bg-slate-100/80 border border-slate-200/80 hover:bg-slate-200/90 hover:border-slate-300 transition-all flex flex-col items-center justify-center text-center group cursor-pointer"
                                  title={`Folga Regulamentar 36h (${cg.name} em ${d.date}). Clique para agendar plantão.`}
                                >
                                  <div className="flex items-center gap-1 text-slate-500 group-hover:text-slate-800 font-extrabold text-[10px]">
                                    <Coffee className="w-3 h-3 text-slate-400 group-hover:text-slate-600" />
                                    <span>Folga 36h</span>
                                  </div>
                                </button>
                              </td>
                            );
                          }

                          // Case 1: Multiple shifts or Conflict
                          if (shifts.length > 1 || cellConflict) {
                            return (
                              <td key={d.date} className="p-2 text-center align-middle border-r border-zinc-100">
                                <button
                                  type="button"
                                  onClick={() => handleOpenEditModal(shifts[0])}
                                  className="w-full h-14 p-2 rounded-xl bg-rose-600 border border-rose-400 text-white animate-pulse transition-all flex flex-col justify-between text-left shadow-2xs group cursor-pointer"
                                  title={`CONFLITO DE ESCALA: ${cg.name} na data ${d.date}. Clique para corrigir.`}
                                >
                                  <div className="flex items-center justify-between">
                                    <span className="font-black text-[10px] flex items-center gap-1">
                                      <AlertTriangle className="w-3 h-3" />
                                      <span>CONFLITO</span>
                                    </span>
                                    <Edit3 className="w-3 h-3 opacity-80" />
                                  </div>
                                  <div className="text-[9px] font-extrabold uppercase bg-rose-950 px-1 py-0.5 rounded leading-tight">
                                    {cellConflict?.conflictType === 'TURNO_INCOMPATATIVEL' ? 'Turno Incomp.' : 'Jornada Dupla'}
                                  </div>
                                </button>
                              </td>
                            );
                          }

                          // Case 2: Exactly 1 shift (Diurno or Noturno)
                          const shift = shifts[0];
                          const isNightShift = shift.shiftType.toLowerCase().includes('noturno');

                          return (
                            <td key={d.date} className="p-2 text-center align-middle border-r border-zinc-100">
                              <button
                                type="button"
                                onClick={() => handleOpenEditModal(shift)}
                                className={`w-full h-14 p-2 rounded-xl border transition-all text-left flex flex-col justify-between shadow-2xs group cursor-pointer ${
                                  isNightShift
                                    ? 'bg-gradient-to-br from-indigo-900 via-slate-900 to-indigo-950 border-indigo-700 text-indigo-100 hover:border-indigo-400'
                                    : 'bg-gradient-to-br from-amber-400 via-amber-500 to-amber-600 border-amber-300 text-slate-950 hover:brightness-105'
                                }`}
                                title={`${cg.name} — ${shift.shiftType} em ${d.date}. Clique para editar.`}
                              >
                                <div className="flex items-center justify-between">
                                  <span className="font-black text-[10px] flex items-center gap-1">
                                    {isNightShift ? <Moon className="w-3 h-3 text-indigo-300" /> : <Sun className="w-3.5 h-3.5 text-slate-900" />}
                                    <span>{isNightShift ? 'Noturno' : 'Diurno'}</span>
                                  </span>
                                  <Edit3 className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                                </div>
                                <div className="text-[10px] font-extrabold tracking-tight">
                                  {isNightShift ? '19h - 07h (12h)' : '07h - 19h (12h)'}
                                </div>
                              </button>
                            </td>
                          );
                        })}

                        {/* Weekly Workload Cell */}
                        <td className="p-3 text-center align-middle bg-zinc-50/80">
                          <div className="font-black text-xs text-zinc-900">
                            {caregiverShiftsThisWeek.length} plantão(ões)
                          </div>
                          <div className="text-[10px] text-teal-700 font-extrabold mt-0.5">
                            {totalHoursThisWeek}h / semana
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* QUADRO INFORMATIVO DE EQUIPE FIXA (4 DIURNOS / 4 NOTURNOS) */}
          <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl text-white shadow-md space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
              <div>
                <span className="text-[10px] font-black uppercase text-teal-400 tracking-wider block">
                  Estatuto da Equipe de Cuidador Residencial
                </span>
                <h2 className="text-sm font-black text-white uppercase tracking-wide flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-teal-400" />
                  Escola Fixo 12x36: 4 Cuidadores Diurnos & 4 Cuidadores Noturnos
                </h2>
              </div>
              <span className="px-3 py-1 bg-teal-950 border border-teal-500/50 text-teal-300 font-extrabold text-[11px] rounded-xl">
                Total: 8 Cuidadores Registrados
              </span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 text-xs">
              {/* Cuidadores Diurnos */}
              <div className="p-4 bg-slate-950 rounded-xl border border-amber-500/30 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <div className="flex items-center gap-2">
                    <Sun className="w-4 h-4 text-amber-400 shrink-0" />
                    <span className="font-extrabold text-amber-300 text-xs">
                      4 Cuidadores Diurnos (07h às 19h) — 12/36
                    </span>
                  </div>
                  <span className="px-2 py-0.5 bg-amber-500/20 text-amber-300 text-[10px] font-bold rounded-md">
                    2 Por Turno
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div className="p-2.5 bg-slate-900/90 rounded-lg border border-slate-800">
                    <span className="text-[10px] font-extrabold text-amber-400 uppercase tracking-wider block mb-1">
                      Equipe A Diurna (Dias Ímpares)
                    </span>
                    <ul className="space-y-1 font-medium text-zinc-200 text-[11px]">
                      {dayCaregiversList.filter(c => c.teamGroup === 'Equipe A').map(c => (
                        <li key={c.id} className="flex items-center gap-1.5">
                          <Check className="w-3 h-3 text-emerald-400" />
                          <span>{c.name}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="p-2.5 bg-slate-900/90 rounded-lg border border-slate-800">
                    <span className="text-[10px] font-extrabold text-amber-400 uppercase tracking-wider block mb-1">
                      Equipe B Diurna (Dias Pares)
                    </span>
                    <ul className="space-y-1 font-medium text-zinc-200 text-[11px]">
                      {dayCaregiversList.filter(c => c.teamGroup === 'Equipe B').map(c => (
                        <li key={c.id} className="flex items-center gap-1.5">
                          <Check className="w-3 h-3 text-emerald-400" />
                          <span>{c.name}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              {/* Cuidadores Noturnos */}
              <div className="p-4 bg-slate-950 rounded-xl border border-indigo-500/30 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <div className="flex items-center gap-2">
                    <Moon className="w-4 h-4 text-indigo-400 shrink-0" />
                    <span className="font-extrabold text-indigo-300 text-xs">
                      4 Cuidadores Noturnos (19h às 07h) — 12/36
                    </span>
                  </div>
                  <span className="px-2 py-0.5 bg-indigo-500/20 text-indigo-300 text-[10px] font-bold rounded-md">
                    2 Por Turno
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div className="p-2.5 bg-slate-900/90 rounded-lg border border-slate-800">
                    <span className="text-[10px] font-extrabold text-indigo-400 uppercase tracking-wider block mb-1">
                      Equipe A Noturna (Noites Ímpares)
                    </span>
                    <ul className="space-y-1 font-medium text-zinc-200 text-[11px]">
                      {nightCaregiversList.filter(c => c.teamGroup === 'Equipe A').map(c => (
                        <li key={c.id} className="flex items-center gap-1.5">
                          <Check className="w-3 h-3 text-emerald-400" />
                          <span>{c.name}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="p-2.5 bg-slate-900/90 rounded-lg border border-slate-800">
                    <span className="text-[10px] font-extrabold text-indigo-400 uppercase tracking-wider block mb-1">
                      Equipe B Noturna (Noites Pares)
                    </span>
                    <ul className="space-y-1 font-medium text-zinc-200 text-[11px]">
                      {nightCaregiversList.filter(c => c.teamGroup === 'Equipe B').map(c => (
                        <li key={c.id} className="flex items-center gap-1.5">
                          <Check className="w-3 h-3 text-emerald-400" />
                          <span>{c.name}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* PAINEL AUTOMÁTICO DE CONFLITOS DE ESCALA */}
          <div className={`p-5 rounded-2xl border transition-all shadow-md ${
            conflicts.length > 0 
              ? 'bg-gradient-to-br from-rose-950 via-slate-900 to-slate-950 border-rose-500 text-white' 
              : 'bg-emerald-950/90 border-emerald-700 text-white'
          }`}>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-white/10">
              <div className="flex items-center gap-3">
                <div className={`p-2.5 rounded-xl ${conflicts.length > 0 ? 'bg-rose-600 text-white animate-bounce' : 'bg-emerald-600 text-white'}`}>
                  {conflicts.length > 0 ? <AlertTriangle className="w-5 h-5" /> : <CheckCircle2 className="w-5 h-5" />}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-sm font-black tracking-wide uppercase">
                      {conflicts.length > 0 
                        ? `Painel de Auditoria 12/36: ${conflicts.length} Conflito(s) Encontrado(s)`
                        : 'Painel de Auditoria 12/36: Escala Válida Sem Conflitos'}
                    </h2>
                  </div>
                  <p className="text-xs text-zinc-300 font-medium">
                    {conflicts.length > 0 
                      ? 'Inconsistências de horários, descumprimento de 36h de descanso ou troca de turno incompatível.'
                      : 'Todos os 8 cuidadores estão alocados dentro de suas equipes A/B respeitando o intervalo de 36 horas.'}
                  </p>
                </div>
              </div>

              {conflicts.length > 0 && (
                <button
                  onClick={() => setStatusFilter('CONFLITOS')}
                  className="px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white font-extrabold text-xs rounded-xl shadow-xs transition-all flex items-center gap-1.5 self-end sm:self-center"
                >
                  <Filter className="w-3.5 h-3.5" />
                  <span>Ver Conflitos ({conflicts.length})</span>
                </button>
              )}
            </div>

            {/* List of Conflicts */}
            {conflicts.length > 0 ? (
              <div className="mt-4 space-y-3">
                {conflicts.map((conflict) => (
                  <div key={conflict.id} className="p-4 bg-slate-900/90 rounded-xl border border-rose-500/40 text-xs space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-2">
                      <div className="flex items-center gap-2">
                        <span className="p-1.5 bg-rose-950 border border-rose-800 text-rose-300 rounded-lg font-black">
                          <User className="w-4 h-4" />
                        </span>
                        <div>
                          <span className="font-black text-white text-xs">{conflict.title}</span>
                          <div className="text-[11px] text-rose-300 font-semibold flex items-center gap-2">
                            <span>Data: {conflict.date}</span>
                            <span>•</span>
                            <span>{conflict.dayOfWeek}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 bg-rose-600 text-white text-[10px] font-black rounded-md uppercase tracking-wider">
                          {conflict.conflictType === 'SOBREPOSICAO_HORARIO' ? 'Sobreposição Direta' : 
                           conflict.conflictType === 'DUPLA_JORNADA' ? 'Jornada Dupla' : 
                           conflict.conflictType === 'TURNO_INCOMPATATIVEL' ? 'Turno Incompatível' : 'Descanso < 36h'}
                        </span>
                        <span className="px-2 py-0.5 bg-amber-500 text-slate-950 text-[10px] font-black rounded-md uppercase">
                          Risco {conflict.severity}
                        </span>
                      </div>
                    </div>

                    <p className="text-zinc-200 font-medium leading-relaxed bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                      {conflict.description}
                    </p>

                    {/* Conflicting Shifts Items & Quick Actions */}
                    <div className="space-y-2 pt-1">
                      <span className="text-[10px] font-extrabold uppercase text-zinc-400 tracking-wider block">
                        Plantões afetados:
                      </span>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {conflict.conflictingShifts.map((shift) => (
                          <div key={shift.id} className="p-2.5 bg-slate-950 rounded-lg border border-slate-800 flex items-center justify-between gap-2">
                            <div>
                              <div className="font-extrabold text-teal-300 text-xs flex items-center gap-1">
                                <Clock className="w-3 h-3 text-teal-400" />
                                <span>{shift.shiftType}</span>
                              </div>
                              <div className="text-[10px] text-zinc-400 font-medium">
                                {shift.roleRequired} — {shift.assignedStaffName || 'Vago'}
                              </div>
                            </div>

                            <div className="flex items-center gap-1">
                              {/* Quick Action: Unassign */}
                              <button
                                type="button"
                                onClick={() => handleUnassignDuplicate(shift.id, conflict.staffName)}
                                className="px-2 py-1 bg-rose-950 hover:bg-rose-900 border border-rose-800 text-rose-200 text-[10px] font-bold rounded-lg transition-all flex items-center gap-1"
                                title="Desescalar cuidador tornando o plantão vago"
                              >
                                <UserX className="w-3 h-3 text-rose-400" />
                                <span>Desescalar</span>
                              </button>

                              {/* Quick Action: Reassign */}
                              <button
                                type="button"
                                onClick={() => {
                                  setReassigningShiftId(shift.id);
                                  setSelectedNewCaregiver(activeCaregivers.map(c => c.name).find(c => c !== conflict.staffName) || '');
                                }}
                                className="px-2 py-1 bg-teal-900 hover:bg-teal-800 border border-teal-700 text-teal-200 text-[10px] font-bold rounded-lg transition-all flex items-center gap-1"
                                title="Trocar cuidador para outro profissional registrado"
                              >
                                <RefreshCw className="w-3 h-3 text-teal-300" />
                                <span>Remanejar</span>
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Reassign Selector Box */}
                      {reassigningShiftId && conflict.conflictingShifts.some(s => s.id === reassigningShiftId) && (
                        <div className="mt-2 p-3 bg-teal-950 border border-teal-600 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-3 animate-in fade-in duration-150">
                          <div className="flex items-center gap-2 w-full sm:w-auto">
                            <span className="text-xs font-bold text-teal-200 shrink-0">Selecione o novo cuidador:</span>
                            <select
                              value={selectedNewCaregiver}
                              onChange={(e) => setSelectedNewCaregiver(e.target.value)}
                              className="px-3 py-1.5 bg-slate-900 text-white font-bold text-xs rounded-lg border border-teal-500 focus:outline-none w-full sm:w-auto"
                            >
                              {activeCaregivers.map(cg => (
                                <option key={cg.id} value={cg.name}>{cg.name}</option>
                              ))}
                            </select>
                          </div>
                          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                            <button
                              type="button"
                              onClick={() => handleConfirmReassign(reassigningShiftId)}
                              className="px-3 py-1.5 bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs rounded-lg shadow-xs"
                            >
                              Confirmar Troca
                            </button>
                            <button
                              type="button"
                              onClick={() => setReassigningShiftId(null)}
                              className="px-2.5 py-1.5 bg-slate-800 text-zinc-400 hover:text-white text-xs rounded-lg"
                            >
                              Cancelar
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="mt-2 text-xs text-emerald-200 font-medium">
                Nenhuma inconsistência de escala 12/36 identificada nesta semana.
              </p>
            )}
          </div>

          {/* AI Analysis Box if triggered */}
          {aiAnalysis && (
            <div className="p-4 bg-purple-50/80 border border-purple-200 rounded-2xl space-y-2 animate-in fade-in duration-150">
              <div className="flex items-center justify-between border-b border-purple-200/80 pb-2">
                <span className="text-xs font-bold text-purple-900 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-purple-600" />
                  Auditoria IA Nexa — Escala de Cuidadores 12/36
                </span>
                <button
                  onClick={() => setAiAnalysis(null)}
                  className="text-[11px] text-purple-700 hover:underline font-bold"
                >
                  Fechar
                </button>
              </div>
              <p className="text-xs text-purple-950 whitespace-pre-wrap leading-relaxed font-medium">{aiAnalysis}</p>
            </div>
          )}

          {/* Vacant Caregivers Banner */}
          {vacantShifts.length > 0 && (
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
                <div>
                  <p className="text-xs font-extrabold text-amber-900 uppercase">
                    Atenção: {vacantShifts.length} Plantão(ões) de Cuidador Vago(s)
                  </p>
                  <p className="text-xs text-amber-700 font-medium">
                    Cada plantão exige ao menos 2 cuidadores (Diurnos 07h-19h ou Noturnos 19h-07h) para garantir o cuidado dos residentes.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setStatusFilter('VAGOS')}
                className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-extrabold text-xs rounded-xl shadow-xs shrink-0"
              >
                Ver Plantões Vagos
              </button>
            </div>
          )}

          {/* Filter Bar & Controls */}
          <div className="p-4 bg-white border border-zinc-200/90 rounded-2xl shadow-xs space-y-3">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              {/* Search */}
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Buscar por nome do cuidador, dia da semana ou data..."
                  className="w-full pl-9 pr-3 py-2 bg-zinc-50 border border-zinc-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              {/* Filter Chips */}
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[11px] text-zinc-500 font-bold mr-1">Filtros:</span>
                
                <button
                  type="button"
                  onClick={() => setStatusFilter('TODOS')}
                  className={`px-3 py-1.5 rounded-xl font-extrabold text-xs transition-all ${
                    statusFilter === 'TODOS'
                      ? 'bg-zinc-900 text-white shadow-xs'
                      : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
                  }`}
                >
                  Todos ({localRoster.length})
                </button>

                <button
                  type="button"
                  onClick={() => setStatusFilter('CONFLITOS')}
                  className={`px-3 py-1.5 rounded-xl font-extrabold text-xs transition-all flex items-center gap-1 ${
                    statusFilter === 'CONFLITOS'
                      ? 'bg-rose-600 text-white shadow-xs'
                      : 'bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100'
                  }`}
                >
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>Conflitos ({conflicts.length})</span>
                </button>

                <button
                  type="button"
                  onClick={() => setStatusFilter('VAGOS')}
                  className={`px-3 py-1.5 rounded-xl font-extrabold text-xs transition-all ${
                    statusFilter === 'VAGOS'
                      ? 'bg-amber-600 text-white shadow-xs'
                      : 'bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100'
                  }`}
                >
                  Vagos ({vacantShifts.length})
                </button>

                <button
                  type="button"
                  onClick={() => setStatusFilter('CONFIRMADOS')}
                  className={`px-3 py-1.5 rounded-xl font-extrabold text-xs transition-all ${
                    statusFilter === 'CONFIRMADOS'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100'
                  }`}
                >
                  Confirmados
                </button>
              </div>
            </div>

            {/* Shift Selector Filter */}
            <div className="flex items-center gap-2 border-t border-zinc-100 pt-2.5">
              <span className="text-[11px] text-zinc-500 font-bold">Período 12/36:</span>
              <button
                type="button"
                onClick={() => setShiftFilter('TODOS')}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
                  shiftFilter === 'TODOS' ? 'bg-teal-600 text-white' : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
                }`}
              >
                Todos
              </button>
              <button
                type="button"
                onClick={() => setShiftFilter('Diurno')}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all flex items-center gap-1 ${
                  shiftFilter === 'Diurno' ? 'bg-amber-600 text-white' : 'bg-amber-50 text-amber-800 hover:bg-amber-100'
                }`}
              >
                <Sun className="w-3 h-3" />
                <span>Diurno (07h-19h)</span>
              </button>
              <button
                type="button"
                onClick={() => setShiftFilter('Noturno')}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all flex items-center gap-1 ${
                  shiftFilter === 'Noturno' ? 'bg-indigo-600 text-white' : 'bg-indigo-50 text-indigo-800 hover:bg-indigo-100'
                }`}
              >
                <Moon className="w-3 h-3" />
                <span>Noturno (19h-07h)</span>
              </button>
            </div>
          </div>

          {/* Roster Table */}
          <div className="p-5 bg-white border border-zinc-200/90 rounded-2xl shadow-xs overflow-x-auto">
            <table className="w-full text-left text-xs text-zinc-700 border-collapse">
              <thead>
                <tr className="border-b border-zinc-200 text-zinc-500 uppercase text-[10px] font-black tracking-wider bg-zinc-50/80">
                  <th className="p-3 rounded-l-xl">Data / Dia</th>
                  <th className="p-3">Turno 12/36</th>
                  <th className="p-3">Equipe Exigida</th>
                  <th className="p-3">Cuidador Escalado</th>
                  <th className="p-3">Status do Plantão</th>
                  <th className="p-3 text-right rounded-r-xl">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {filteredRoster.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-zinc-400 font-medium italic">
                      Nenhum plantão de cuidador encontrado para os filtros selecionados.
                    </td>
                  </tr>
                ) : (
                  filteredRoster.map((item) => {
                    const hasConflict = item.assignedStaffName && conflictedStaffNames.has(item.assignedStaffName);
                    const isNight = item.shiftType.toLowerCase().includes('noturno');
                    const profile = activeCaregivers.find(c => c.name === item.assignedStaffName);

                    return (
                      <tr 
                        key={item.id} 
                        className={`transition-colors ${
                          hasConflict ? 'bg-rose-50/60 hover:bg-rose-100/60' : 'hover:bg-zinc-50/60'
                        }`}
                      >
                        <td className="p-3 font-bold text-zinc-900">
                          {item.date} <span className="text-zinc-500 font-normal">({item.dayOfWeek})</span>
                        </td>

                        <td className="p-3 font-bold">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] ${
                            isNight 
                              ? 'bg-indigo-50 text-indigo-800 border border-indigo-200' 
                              : 'bg-amber-50 text-amber-800 border border-amber-200'
                          }`}>
                            {isNight ? <Moon className="w-3 h-3 text-indigo-600" /> : <Sun className="w-3 h-3 text-amber-600" />}
                            <span>{item.shiftType}</span>
                          </span>
                        </td>

                        <td className="p-3 text-zinc-700 font-medium">
                          <span className="px-2 py-0.5 bg-zinc-100 border border-zinc-200 rounded-md text-[11px] font-bold text-zinc-800">
                            {item.roleRequired}
                          </span>
                        </td>

                        <td className="p-3 font-semibold">
                          {item.assignedStaffName ? (
                            <div className="flex items-center gap-2">
                              <span className={`p-1 rounded-md ${isNight ? 'bg-indigo-100 text-indigo-800' : 'bg-amber-100 text-amber-800'}`}>
                                <User className="w-3.5 h-3.5" />
                              </span>
                              <div>
                                <div className="flex items-center gap-1.5">
                                  <span className="text-zinc-900 font-bold">{item.assignedStaffName}</span>
                                  {profile && (
                                    <span className="text-[9px] font-black px-1.5 py-0.2 bg-zinc-200 text-zinc-700 rounded-md">
                                      {profile.teamGroup}
                                    </span>
                                  )}
                                </div>
                                {hasConflict && (
                                  <span className="text-[10px] bg-rose-600 text-white font-extrabold px-1.5 py-0.5 rounded-full inline-flex items-center gap-1 mt-0.5">
                                    <AlertTriangle className="w-2.5 h-2.5" /> Inconsistência 12/36
                                  </span>
                                )}
                              </div>
                            </div>
                          ) : (
                            <span className="text-amber-700 font-bold italic flex items-center gap-1">
                              <UserX className="w-3.5 h-3.5" /> Sem cuidador escalado (Vago)
                            </span>
                          )}
                        </td>

                        <td className="p-3">
                          <span className={`text-[10px] font-bold px-2.5 py-1 rounded-md border uppercase ${
                            item.status === 'Confirmado' && !hasConflict ? 'bg-emerald-50 text-emerald-800 border-emerald-200' :
                            item.status === 'Vago' || !item.assignedStaffName ? 'bg-amber-50 text-amber-800 border-amber-200' :
                            'bg-rose-50 text-rose-800 border-rose-300 animate-pulse'
                          }`}>
                            {hasConflict ? 'Inconsistente' : item.status}
                          </span>
                        </td>

                        <td className="p-3 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              type="button"
                              onClick={() => handleOpenEditModal(item)}
                              className="p-1.5 hover:bg-zinc-200 text-zinc-600 rounded-lg transition-all"
                              title="Editar plantão"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteShift(item.id)}
                              className="p-1.5 hover:bg-rose-100 text-rose-600 rounded-lg transition-all"
                              title="Remover da escala"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
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
      )}

      {/* TAB 2: ESCALA KATZ */}
      {activeTab === 'KATZ' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white p-6 border border-zinc-200/90 rounded-2xl shadow-xs space-y-4">
            <h2 className="text-xs font-black text-zinc-800 uppercase tracking-wider flex items-center gap-2">
              <Activity className="w-4 h-4 text-teal-600" />
              Avaliação de Atividades Básicas de Vida Diária (Escala de Katz)
            </h2>

            <form onSubmit={handleSaveKatzAssessment} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-zinc-700 mb-1">Selecionar Residente</label>
                <select
                  value={selectedResidentId}
                  onChange={(e) => setSelectedResidentId(e.target.value)}
                  className="w-full px-3 py-2 border border-zinc-200 rounded-xl font-bold text-zinc-800 focus:ring-2 focus:ring-teal-500"
                >
                  {residents.map(r => (
                    <option key={r.id} value={r.id}>{r.name} — Quarto {r.room}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-3 bg-zinc-50 border border-zinc-200 rounded-xl space-y-1">
                  <label className="block font-black text-zinc-800">1. Banho</label>
                  <select value={katzBanho} onChange={(e) => setKatzBanho(Number(e.target.value))} className="w-full p-2 border border-zinc-200 rounded-lg">
                    <option value={1}>1 - Toma banho sem ajuda ou com pouca ajuda</option>
                    <option value={0}>0 - Necessita de ajuda para lavar mais de uma parte</option>
                  </select>
                </div>

                <div className="p-3 bg-zinc-50 border border-zinc-200 rounded-xl space-y-1">
                  <label className="block font-black text-zinc-800">2. Vestuário</label>
                  <select value={katzVestuario} onChange={(e) => setKatzVestuario(Number(e.target.value))} className="w-full p-2 border border-zinc-200 rounded-lg">
                    <option value={1}>1 - Pega as roupas e veste-se completamente só</option>
                    <option value={0}>0 - Necessita de ajuda para vestir-se</option>
                  </select>
                </div>

                <div className="p-3 bg-zinc-50 border border-zinc-200 rounded-xl space-y-1">
                  <label className="block font-black text-zinc-800">3. Uso do Banheiro</label>
                  <select value={katzBanheiro} onChange={(e) => setKatzBanheiro(Number(e.target.value))} className="w-full p-2 border border-zinc-200 rounded-lg">
                    <option value={1}>1 - Vai ao banheiro, limpa-se e arruma roupas só</option>
                    <option value={0}>0 - Precisa de ajuda para ir ao vaso ou usar comadre</option>
                  </select>
                </div>

                <div className="p-3 bg-zinc-50 border border-zinc-200 rounded-xl space-y-1">
                  <label className="block font-black text-zinc-800">4. Transferência</label>
                  <select value={katzTransferencia} onChange={(e) => setKatzTransferencia(Number(e.target.value))} className="w-full p-2 border border-zinc-200 rounded-lg">
                    <option value={1}>1 - Deita e levanta da cama/cadeira sem ajuda</option>
                    <option value={0}>0 - Necessita de ajuda de terceiros para mover-se</option>
                  </select>
                </div>

                <div className="p-3 bg-zinc-50 border border-zinc-200 rounded-xl space-y-1">
                  <label className="block font-black text-zinc-800">5. Continência</label>
                  <select value={katzContinencia} onChange={(e) => setKatzContinencia(Number(e.target.value))} className="w-full p-2 border border-zinc-200 rounded-lg">
                    <option value={1}>1 - Controle total de esfíncteres vesical e anal</option>
                    <option value={0}>0 - Incontinência parcial/total ou uso de fraldas</option>
                  </select>
                </div>

                <div className="p-3 bg-zinc-50 border border-zinc-200 rounded-xl space-y-1">
                  <label className="block font-black text-zinc-800">6. Alimentação</label>
                  <select value={katzAlimentacao} onChange={(e) => setKatzAlimentacao(Number(e.target.value))} className="w-full p-2 border border-zinc-200 rounded-lg">
                    <option value={1}>1 - Alimenta-se sozinho sem auxílio</option>
                    <option value={0}>0 - Necessita de ajuda para levar alimento à boca</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-teal-600 hover:bg-teal-700 text-white font-extrabold text-xs rounded-xl shadow-xs transition-colors"
              >
                Salvar Avaliação Katz (ABVD)
              </button>
            </form>
          </div>

          <div className="bg-white p-5 border border-zinc-200/90 rounded-2xl shadow-xs space-y-4">
            <h3 className="text-xs font-black text-zinc-800 uppercase tracking-wider">
              Histórico Katz do Residente ({residentKatzHistory.length})
            </h3>

            {residentKatzHistory.length === 0 ? (
              <p className="text-xs text-zinc-400">Nenhum histórico registrado.</p>
            ) : (
              <div className="space-y-3 divide-y divide-zinc-100">
                {residentKatzHistory.map(h => (
                  <div key={h.id} className="pt-2 text-xs space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-extrabold text-teal-800">{h.score}/6 Pontos</span>
                      <span className="text-[10px] text-zinc-500">{h.assessmentDate}</span>
                    </div>
                    <p className="font-bold text-zinc-800">{h.classification}</p>
                    <p className="text-[10px] text-zinc-400">Avaliador: {h.assessedBy}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: ESCALA LAWTON */}
      {activeTab === 'LAWTON' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white p-6 border border-zinc-200/90 rounded-2xl shadow-xs space-y-4">
            <h2 className="text-xs font-black text-zinc-800 uppercase tracking-wider flex items-center gap-2">
              <Award className="w-4 h-4 text-indigo-600" />
              Avaliação de Atividades Instrumentais (Escala de Lawton)
            </h2>

            <form onSubmit={handleSaveLawtonAssessment} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-zinc-700 mb-1">Selecionar Residente</label>
                <select
                  value={selectedResidentId}
                  onChange={(e) => setSelectedResidentId(e.target.value)}
                  className="w-full px-3 py-2 border border-zinc-200 rounded-xl font-bold text-zinc-800 focus:ring-2 focus:ring-indigo-500"
                >
                  {residents.map(r => (
                    <option key={r.id} value={r.id}>{r.name} — Quarto {r.room}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="p-3 bg-zinc-50 border border-zinc-200 rounded-xl space-y-1">
                  <label className="block font-black text-zinc-800">1. Usar Telefone</label>
                  <select value={lawtonTelefone} onChange={(e) => setLawtonTelefone(Number(e.target.value))} className="w-full p-2 border border-zinc-200 rounded-lg">
                    <option value={3}>3 - Opera telefone sem assistência</option>
                    <option value={2}>2 - Discagem parcial com ajuda</option>
                    <option value={1}>1 - Não usa telefone</option>
                  </select>
                </div>

                <div className="p-3 bg-zinc-50 border border-zinc-200 rounded-xl space-y-1">
                  <label className="block font-black text-zinc-800">2. Fazer Compras</label>
                  <select value={lawtonCompras} onChange={(e) => setLawtonCompras(Number(e.target.value))} className="w-full p-2 border border-zinc-200 rounded-lg">
                    <option value={3}>3 - Faz todas compras de forma independente</option>
                    <option value={2}>2 - Compra pequenos itens com supervisão</option>
                    <option value={1}>1 - Incapaz de fazer compras</option>
                  </select>
                </div>

                <div className="p-3 bg-zinc-50 border border-zinc-200 rounded-xl space-y-1">
                  <label className="block font-black text-zinc-800">3. Preparar Refeições</label>
                  <select value={lawtonRefeicoes} onChange={(e) => setLawtonRefeicoes(Number(e.target.value))} className="w-full p-2 border border-zinc-200 rounded-lg">
                    <option value={3}>3 - Planeja e cozinha refeições adequadas</option>
                    <option value={2}>2 - Esquentará refeições servidas</option>
                    <option value={1}>1 - Precisa que as refeições sejam preparadas</option>
                  </select>
                </div>

                <div className="p-3 bg-zinc-50 border border-zinc-200 rounded-xl space-y-1">
                  <label className="block font-black text-zinc-800">4. Tarefas Domésticas</label>
                  <select value={lawtonDomesticas} onChange={(e) => setLawtonDomesticas(Number(e.target.value))} className="w-full p-2 border border-zinc-200 rounded-lg">
                    <option value={3}>3 - Mantém casa sozinha ou com ajuda ocasional</option>
                    <option value={2}>2 - Realiza tarefas leves</option>
                    <option value={1}>1 - Não participa de arrumações</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs rounded-xl shadow-xs transition-colors"
              >
                Salvar Avaliação Lawton (AIVD)
              </button>
            </form>
          </div>

          <div className="bg-white p-5 border border-zinc-200/90 rounded-2xl shadow-xs space-y-4">
            <h3 className="text-xs font-black text-zinc-800 uppercase tracking-wider">
              Histórico Lawton do Residente ({residentLawtonHistory.length})
            </h3>

            {residentLawtonHistory.length === 0 ? (
              <p className="text-xs text-zinc-400">Nenhum histórico registrado.</p>
            ) : (
              <div className="space-y-3 divide-y divide-zinc-100">
                {residentLawtonHistory.map(h => (
                  <div key={h.id} className="pt-2 text-xs space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-extrabold text-indigo-800">{h.score} Pontos</span>
                      <span className="text-[10px] text-zinc-500">{h.assessmentDate}</span>
                    </div>
                    <p className="font-bold text-zinc-800">{h.classification}</p>
                    <p className="text-[10px] text-zinc-400">Avaliador: {h.assessedBy}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODAL: NOVO / EDITAR PLANTÃO DE CUIDADOR */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full border border-zinc-200 shadow-2xl p-6 space-y-4 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-zinc-200 pb-3">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-teal-600" />
                <h3 className="font-black text-sm text-zinc-900 uppercase tracking-wide">
                  {editingShiftId ? 'Editar Plantão de Cuidador 12/36' : 'Novo Plantão de Cuidador 12/36'}
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 hover:bg-zinc-100 rounded-lg text-zinc-500"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Live Warning if form selection creates a conflict */}
            {formConflictWarning && (
              <div className="p-3.5 bg-rose-50 border-2 border-rose-500 rounded-xl text-xs text-rose-950 space-y-1.5 animate-pulse">
                <div className="font-black flex items-center gap-1.5 text-rose-700">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>VIOLAÇÃO RIGOROSA DA ESCALA 12/36 — AÇÃO BLOQUEADA</span>
                </div>
                <p className="font-bold leading-relaxed">{formConflictWarning}</p>
                <p className="text-[11px] text-rose-800 font-medium">
                  A escala 12/36 exige 36h de descanso obrigatório entre plantões e proíbe sobreposição ou troca de período. Escolha outro cuidador elegível.
                </p>
              </div>
            )}

            <form onSubmit={handleSaveShiftModal} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-zinc-700 mb-1">Data do Plantão</label>
                  <input
                    type="text"
                    value={formDate}
                    onChange={(e) => setFormDate(e.target.value)}
                    placeholder="DD/MM/AAAA"
                    required
                    className="w-full p-2.5 bg-zinc-50 border border-zinc-200 rounded-xl font-bold text-zinc-900 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-zinc-700 mb-1">Dia da Semana</label>
                  <select
                    value={formDayOfWeek}
                    onChange={(e) => setFormDayOfWeek(e.target.value)}
                    className="w-full p-2.5 bg-zinc-50 border border-zinc-200 rounded-xl font-bold text-zinc-900 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  >
                    {['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo'].map(d => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-zinc-700 mb-1">Turno de Trabalho 12/36</label>
                <select
                  value={formShiftType}
                  onChange={(e) => setFormShiftType(e.target.value as ShiftType)}
                  className="w-full p-2.5 bg-zinc-50 border border-zinc-200 rounded-xl font-bold text-zinc-900 focus:outline-none focus:ring-2 focus:ring-teal-500"
                >
                  <option value="Diurno (07h-19h)">☀️ Diurno (07h às 19h) — 12x36</option>
                  <option value="Noturno (19h-07h)">🌙 Noturno (19h às 07h) — 12x36</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-zinc-700 mb-1">Função / Equipe Exigida</label>
                <select
                  value={formRoleRequired}
                  onChange={(e) => setFormRoleRequired(e.target.value)}
                  className="w-full p-2.5 bg-zinc-50 border border-zinc-200 rounded-xl font-bold text-zinc-900 focus:outline-none focus:ring-2 focus:ring-teal-500"
                >
                  <option value="Cuidador Residencial (Equipe A)">Cuidador Residencial (Equipe A)</option>
                  <option value="Cuidador Residencial (Equipe B)">Cuidador Residencial (Equipe B)</option>
                  <option value="Cuidador Noturno (Equipe A)">Cuidador Noturno (Equipe A)</option>
                  <option value="Cuidador Noturno (Equipe B)">Cuidador Noturno (Equipe B)</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-zinc-700 mb-1">Cuidador Escalado (8 Cuidadores Fixo)</label>
                <select
                  value={formStaffName}
                  onChange={(e) => setFormStaffName(e.target.value)}
                  className="w-full p-2.5 bg-zinc-50 border border-zinc-200 rounded-xl font-bold text-zinc-900 focus:outline-none focus:ring-2 focus:ring-teal-500"
                >
                  <option value="VAGO">-- DEIXAR VAGO (SEM CUIDADOR) --</option>
                  <optgroup label="Cuidadores Diurnos (07h às 19h)">
                    {dayCaregiversList.map(cg => (
                      <option key={cg.id} value={cg.name}>
                        ☀️ {cg.name} ({cg.teamGroup})
                      </option>
                    ))}
                  </optgroup>
                  <optgroup label="Cuidadores Noturnos (19h às 07h)">
                    {nightCaregiversList.map(cg => (
                      <option key={cg.id} value={cg.name}>
                        🌙 {cg.name} ({cg.teamGroup})
                      </option>
                    ))}
                  </optgroup>
                </select>
              </div>

              <div>
                <label className="block font-bold text-zinc-700 mb-1">Observações do Plantão</label>
                <textarea
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  placeholder="Observações do plantão de 12 horas, passagens ou orientações..."
                  rows={2}
                  className="w-full p-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-zinc-900 focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-zinc-200">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 font-bold rounded-xl"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={!!formConflictWarning}
                  className="px-5 py-2.5 bg-teal-600 hover:bg-teal-700 disabled:bg-zinc-300 disabled:text-zinc-500 disabled:cursor-not-allowed text-white font-extrabold rounded-xl shadow-xs transition-all flex items-center gap-1.5"
                >
                  {editingShiftId ? 'Atualizar Plantão' : 'Salvar Plantão'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
