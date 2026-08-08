import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Sparkles, 
  Clock, 
  Target, 
  CheckCircle2, 
  AlertTriangle, 
  GraduationCap, 
  Plus, 
  Search, 
  Printer, 
  Share2, 
  Play, 
  ChevronRight, 
  ChevronLeft, 
  Calendar, 
  Check, 
  X, 
  MapPin, 
  UserCheck, 
  ShieldAlert, 
  Edit3, 
  MessageSquare,
  Award,
  ArrowRight,
  Maximize2,
  FileText,
  Volume2
} from 'lucide-react';
import { 
  DailyHuddleTopic, 
  StaffTrainingEvent, 
  ClinicalBriefingItem, 
  ShiftHuddlePlan, 
  Resident,
  ClinicalRole 
} from '../types';
import { 
  INITIAL_HUDDLE_TOPICS, 
  INITIAL_CLINICAL_BRIEFINGS, 
  INITIAL_STAFF_TRAININGS, 
  INITIAL_SHIFT_HUDDLES 
} from '../data/huddleData';
import { getCurrentUser } from '../config/auth-mode';

interface DailyHuddleViewProps {
  residents?: Resident[];
  onNavigate?: (path: string) => void;
}

export const DailyHuddleView: React.FC<DailyHuddleViewProps> = ({
  residents = [],
  onNavigate,
}) => {
  const currentUser = getCurrentUser();
  
  // Active shift selection
  const [selectedShift, setSelectedShift] = useState<'Manhã' | 'Tarde' | 'Noturno'>('Manhã');
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);

  // State with LocalStorage persistence
  const [focusTopics, setFocusTopics] = useState<DailyHuddleTopic[]>(() => {
    const saved = localStorage.getItem('nexa_huddle_topics');
    return saved ? JSON.parse(saved) : INITIAL_HUDDLE_TOPICS;
  });

  const [briefings, setBriefings] = useState<ClinicalBriefingItem[]>(() => {
    const saved = localStorage.getItem('nexa_huddle_briefings');
    return saved ? JSON.parse(saved) : INITIAL_CLINICAL_BRIEFINGS;
  });

  const [trainings, setTrainings] = useState<StaffTrainingEvent[]>(() => {
    const saved = localStorage.getItem('nexa_huddle_trainings');
    return saved ? JSON.parse(saved) : INITIAL_STAFF_TRAININGS;
  });

  const [shiftHuddles, setShiftHuddles] = useState<ShiftHuddlePlan[]>(() => {
    const saved = localStorage.getItem('nexa_shift_huddles');
    return saved ? JSON.parse(saved) : INITIAL_SHIFT_HUDDLES;
  });

  // Current active huddle plan for selected shift
  const currentHuddle = shiftHuddles.find(
    h => h.shift === selectedShift && h.date === selectedDate
  ) || {
    id: `huddle-${selectedDate}-${selectedShift}`,
    date: selectedDate,
    shift: selectedShift,
    teamLeadName: currentUser?.name || 'Enf. Ana Paula RT',
    teamLeadRole: currentUser?.role || 'Enfermeira RT',
    shiftFocusGoal: selectedShift === 'Manhã' 
      ? 'Acompanhamento rigoroso da higienização matinal e prevenção de quedas no Bloco B.'
      : selectedShift === 'Tarde'
      ? 'Engajamento dos moradores nas oficinas terapêuticas e manejo descalonado de ansiedade.'
      : 'Rondas noturnas a cada 2h e fiscalização de medicamentos de alto risco no repouso.',
    briefingItems: briefings,
    focusTopics: focusTopics.filter(t => t.shift === selectedShift),
    trainingsToday: trainings.filter(t => t.date === 'Hoje' || t.date === selectedDate),
    attendanceList: [
      { staffName: currentUser?.name || 'Enf. Ana Paula RT', role: currentUser?.role || 'Enfermeira RT', present: true },
      { staffName: 'Téc. Roberto Alves', role: 'Técnico de Enfermagem', present: true },
      { staffName: 'Cuidador Lucas Silva', role: 'Cuidador Residencial', present: true },
      { staffName: 'Psic. Juliana Costa', role: 'Psicóloga', present: true },
    ],
    huddleStatus: 'Planejado' as const,
  };

  // Save changes to localStorage
  useEffect(() => {
    localStorage.setItem('nexa_huddle_topics', JSON.stringify(focusTopics));
  }, [focusTopics]);

  useEffect(() => {
    localStorage.setItem('nexa_huddle_briefings', JSON.stringify(briefings));
  }, [briefings]);

  useEffect(() => {
    localStorage.setItem('nexa_huddle_trainings', JSON.stringify(trainings));
  }, [trainings]);

  useEffect(() => {
    localStorage.setItem('nexa_shift_huddles', JSON.stringify(shiftHuddles));
  }, [shiftHuddles]);

  // Modal states
  const [isNewTopicModalOpen, setIsNewTopicModalOpen] = useState(false);
  const [isNewTrainingModalOpen, setIsNewTrainingModalOpen] = useState(false);
  const [isExpressHuddleOpen, setIsExpressHuddleOpen] = useState(false);
  const [isEditGoalModalOpen, setIsEditGoalModalOpen] = useState(false);
  const [copiedNotification, setCopiedNotification] = useState(false);

  // Search and filters
  const [briefingFilter, setBriefingFilter] = useState<'Todas' | 'Crítica' | 'Atenção' | 'Informativa'>('Todas');
  const [searchTopicQuery, setSearchTopicQuery] = useState('');

  // Form states
  const [newTopicForm, setNewTopicForm] = useState({
    title: '',
    shift: selectedShift,
    category: 'Segurança do Paciente' as DailyHuddleTopic['category'],
    priority: 'Alta' as DailyHuddleTopic['priority'],
    description: '',
    assignedLead: currentUser?.name || 'Enf. Ana Paula RT',
    residentHighlightsText: '',
  });

  const [newTrainingForm, setNewTrainingForm] = useState({
    title: '',
    instructor: '',
    category: 'Suporte Básico de Vida (BLS)' as StaffTrainingEvent['category'],
    date: 'Hoje',
    time: '14:00 - 15:00',
    location: 'Auditório Central',
    targetRolesStr: 'Técnico de Enfermagem, Cuidador Residencial, Enfermeiro RT',
    maxSeats: 12,
  });

  const [editedGoal, setEditedGoal] = useState(currentHuddle.shiftFocusGoal);

  // Express Huddle slideshow controls
  const [expressSlideIndex, setExpressSlideIndex] = useState(0);
  const [timerSeconds, setTimerSeconds] = useState(300); // 5 minutes
  const [isTimerRunning, setIsTimerRunning] = useState(false);

  useEffect(() => {
    let interval: any = null;
    if (isExpressHuddleOpen && isTimerRunning && timerSeconds > 0) {
      interval = setInterval(() => {
        setTimerSeconds(prev => prev - 1);
      }, 1000);
    } else if (timerSeconds === 0) {
      setIsTimerRunning(false);
    }
    return () => clearInterval(interval);
  }, [isExpressHuddleOpen, isTimerRunning, timerSeconds]);

  // Handlers
  const handleToggleTopicComplete = (topicId: string) => {
    setFocusTopics(prev => prev.map(t => {
      if (t.id === topicId) {
        return { ...t, completed: !t.completed };
      }
      return t;
    }));
  };

  const handleAcknowledgeBriefing = (briefingId: string) => {
    const userName = currentUser?.name || 'Profissional da Equipe';
    setBriefings(prev => prev.map(b => {
      if (b.id === briefingId) {
        const exists = b.acknowledgedBy.includes(userName);
        const updated = exists 
          ? b.acknowledgedBy.filter(n => n !== userName)
          : [...b.acknowledgedBy, userName];
        return { ...b, acknowledgedBy: updated };
      }
      return b;
    }));
  };

  const handleToggleTrainingRegistration = (trainingId: string) => {
    const userName = currentUser?.name || 'Profissional da Equipe';
    setTrainings(prev => prev.map(tr => {
      if (tr.id === trainingId) {
        const isRegistered = tr.registeredParticipants.includes(userName);
        if (isRegistered) {
          return {
            ...tr,
            registeredParticipants: tr.registeredParticipants.filter(p => p !== userName),
          };
        } else {
          if (tr.registeredParticipants.length >= tr.maxSeats) {
            alert('Atenção: Limite de vagas atingido para esta capacitação.');
            return tr;
          }
          return {
            ...tr,
            registeredParticipants: [...tr.registeredParticipants, userName],
          };
        }
      }
      return tr;
    }));
  };

  const handleCreateTopic = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTopicForm.title.trim()) return;

    const highlights = newTopicForm.residentHighlightsText
      ? newTopicForm.residentHighlightsText.split(',').map(s => s.trim()).filter(Boolean)
      : [];

    const created: DailyHuddleTopic = {
      id: `topic-${Date.now()}`,
      shift: newTopicForm.shift,
      title: newTopicForm.title,
      category: newTopicForm.category,
      priority: newTopicForm.priority,
      description: newTopicForm.description,
      assignedLead: newTopicForm.assignedLead,
      completed: false,
      residentHighlights: highlights,
    };

    setFocusTopics(prev => [created, ...prev]);
    setIsNewTopicModalOpen(false);
    setNewTopicForm({
      title: '',
      shift: selectedShift,
      category: 'Segurança do Paciente',
      priority: 'Alta',
      description: '',
      assignedLead: currentUser?.name || 'Enf. Ana Paula RT',
      residentHighlightsText: '',
    });
  };

  const handleCreateTraining = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTrainingForm.title.trim()) return;

    const roles = newTrainingForm.targetRolesStr
      .split(',')
      .map(s => s.trim())
      .filter(Boolean);

    const created: StaffTrainingEvent = {
      id: `train-${Date.now()}`,
      title: newTrainingForm.title,
      instructor: newTrainingForm.instructor || 'Coordenador Técnico',
      category: newTrainingForm.category,
      date: newTrainingForm.date,
      time: newTrainingForm.time,
      location: newTrainingForm.location,
      targetRoles: roles,
      registeredParticipants: [currentUser?.name || 'Enf. Ana Paula RT'],
      maxSeats: newTrainingForm.maxSeats,
      status: 'Agendado',
    };

    setTrainings(prev => [created, ...prev]);
    setIsNewTrainingModalOpen(false);
  };

  const handleSaveEditedGoal = () => {
    setShiftHuddles(prev => {
      const existingIdx = prev.findIndex(h => h.shift === selectedShift && h.date === selectedDate);
      if (existingIdx >= 0) {
        const updated = [...prev];
        updated[existingIdx] = { ...updated[existingIdx], shiftFocusGoal: editedGoal };
        return updated;
      } else {
        return [...prev, { ...currentHuddle, shiftFocusGoal: editedGoal }];
      }
    });
    setIsEditGoalModalOpen(false);
  };

  const handleCompleteShiftHuddle = () => {
    setShiftHuddles(prev => {
      const existingIdx = prev.findIndex(h => h.shift === selectedShift && h.date === selectedDate);
      const updatedHuddle: ShiftHuddlePlan = {
        ...currentHuddle,
        huddleStatus: 'Concluído',
        completedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      if (existingIdx >= 0) {
        const updatedList = [...prev];
        updatedList[existingIdx] = updatedHuddle;
        return updatedList;
      } else {
        return [...prev, updatedHuddle];
      }
    });
    setIsExpressHuddleOpen(false);
  };

  const handleCopySummaryToClipboard = () => {
    const filteredTopics = focusTopics.filter(t => t.shift === selectedShift);
    const filteredBriefings = briefings.filter(b => briefingFilter === 'Todas' ? true : b.urgency === briefingFilter);

    let summary = `📌 *DAILY HUDDLE CLINICO - TURNO ${selectedShift.toUpperCase()}*\n`;
    summary += `🗓️ Data: ${new Date(selectedDate).toLocaleDateString('pt-BR')}\n`;
    summary += `👤 Líder do Turno: ${currentHuddle.teamLeadName} (${currentHuddle.teamLeadRole})\n\n`;
    summary += `🎯 *OBJETIVO E FOCO PRINCIPAL:*\n${currentHuddle.shiftFocusGoal}\n\n`;
    summary += `⚡ *TÓPICOS DE FOCO E SEGURANÇA (${filteredTopics.length}):*\n`;
    filteredTopics.forEach((t, i) => {
      summary += `${i + 1}. [${t.priority}] ${t.title} (${t.category}) - Resp: ${t.assignedLead}\n`;
      if (t.residentHighlights && t.residentHighlights.length > 0) {
        summary += `   👤 Moradores: ${t.residentHighlights.join(', ')}\n`;
      }
    });
    summary += `\n🚨 *BRIEFINGS CLÍNICOS E ALERTAS (${filteredBriefings.length}):*\n`;
    filteredBriefings.forEach((b, i) => {
      summary += `• [${b.urgency}] ${b.title} (${b.residentName || 'Geral'}): ${b.actionRequired}\n`;
    });
    summary += `\n🎓 *TREINAMENTOS HOJE:*\n`;
    trainings.filter(tr => tr.date === 'Hoje').forEach(tr => {
      summary += `• ${tr.title} às ${tr.time} (${tr.location})\n`;
    });
    summary += `\n_Mensagem gerada automaticamente pelo NexaMed Engine v2.5_`;

    navigator.clipboard.writeText(summary);
    setCopiedNotification(true);
    setTimeout(() => setCopiedNotification(false), 3000);
  };

  const handlePrintHuddleSheet = () => {
    window.print();
  };

  // Filtered topics for current shift
  const shiftFocusTopics = focusTopics.filter(t => {
    const matchesShift = t.shift === selectedShift;
    const matchesSearch = searchQueryMatches(t, searchTopicQuery);
    return matchesShift && matchesSearch;
  });

  function searchQueryMatches(topic: DailyHuddleTopic, q: string) {
    if (!q.trim()) return true;
    const term = q.toLowerCase();
    return (
      topic.title.toLowerCase().includes(term) ||
      topic.category.toLowerCase().includes(term) ||
      topic.description.toLowerCase().includes(term) ||
      (topic.residentHighlights && topic.residentHighlights.some(r => r.toLowerCase().includes(term)))
    );
  }

  const filteredBriefings = briefings.filter(b => {
    if (briefingFilter === 'Todas') return true;
    return b.urgency === briefingFilter;
  });

  const formatTimer = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto pb-24">
      {/* Top Banner Header */}
      <div className="bg-white rounded-3xl p-5 md:p-6 border border-zinc-200/90 shadow-2xs relative overflow-hidden">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-teal-500/5 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider bg-teal-100 text-teal-800 border border-teal-200 flex items-center gap-1.5">
                <Users className="w-3 h-3 text-teal-700" />
                Alinhamento Operacional
              </span>
              <span className="px-2.5 py-1 rounded-md text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200 flex items-center gap-1">
                <Clock className="w-3 h-3 text-amber-600" />
                Duração: 5 min
              </span>
              {currentHuddle.huddleStatus === 'Concluído' ? (
                <span className="px-2.5 py-1 rounded-md text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                  Concluído às {currentHuddle.completedAt || '07:15'}
                </span>
              ) : (
                <span className="px-2.5 py-1 rounded-md text-[10px] font-bold bg-blue-50 text-blue-800 border border-blue-200 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-blue-600 animate-spin" />
                  Pronto para Início
                </span>
              )}
            </div>

            <h1 className="text-2xl md:text-3xl font-black text-zinc-900 tracking-tight">
              Daily Huddle Clínico & Alinhamento
            </h1>
            <p className="text-xs md:text-sm text-zinc-600 mt-1 max-w-2xl leading-relaxed font-medium">
              Agrupamento de briefing de intercorrências, atribuição de tópicos de foco prioritários por turno e cronograma de treinamentos para lideranças e cuidadores.
            </p>
          </div>

          {/* Action CTAs */}
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              onClick={() => {
                setIsExpressHuddleOpen(true);
                setExpressSlideIndex(0);
                setTimerSeconds(300);
                setIsTimerRunning(true);
              }}
              className="px-4 py-2.5 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white font-bold text-xs rounded-xl shadow-md shadow-teal-600/20 transition-all flex items-center gap-2 group"
            >
              <Play className="w-4 h-4 fill-white transition-transform group-hover:scale-110" />
              <span>Iniciar Huddle (Modo Express 5m)</span>
            </button>

            <button
              onClick={handleCopySummaryToClipboard}
              className="px-3.5 py-2.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-800 font-bold text-xs rounded-xl border border-zinc-300/80 transition-colors flex items-center gap-1.5"
              title="Copiar resumo formatado para o WhatsApp ou chat da equipe"
            >
              <Share2 className="w-3.5 h-3.5 text-zinc-600" />
              <span>{copiedNotification ? 'Copiado!' : 'Copiar Resumo'}</span>
            </button>

            <button
              onClick={handlePrintHuddleSheet}
              className="p-2.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 rounded-xl border border-zinc-300/80 transition-colors"
              title="Imprimir Folha do Huddle do Turno"
            >
              <Printer className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Shift and Date Selector Bar */}
        <div className="mt-6 pt-4 border-t border-zinc-100 flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Shift Selector Tabs */}
          <div className="flex items-center gap-1.5 bg-zinc-100/90 p-1 rounded-2xl border border-zinc-200/80 w-full sm:w-auto">
            {(['Manhã', 'Tarde', 'Noturno'] as const).map(shift => {
              const isActive = selectedShift === shift;
              const count = focusTopics.filter(t => t.shift === shift).length;
              return (
                <button
                  key={shift}
                  onClick={() => setSelectedShift(shift)}
                  className={`flex-1 sm:flex-none px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 ${
                    isActive
                      ? 'bg-white text-teal-900 shadow-2xs border border-zinc-200/80'
                      : 'text-zinc-600 hover:text-zinc-900'
                  }`}
                >
                  <span>Turno {shift}</span>
                  <span className={`px-1.5 py-0.5 rounded-md text-[10px] font-bold ${
                    isActive ? 'bg-teal-100 text-teal-800' : 'bg-zinc-200 text-zinc-700'
                  }`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Date Selector & Team Lead Badge */}
          <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
            <div className="flex items-center gap-2 bg-zinc-50 px-3 py-1.5 rounded-xl border border-zinc-200 text-xs font-semibold text-zinc-700">
              <Calendar className="w-3.5 h-3.5 text-teal-600" />
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="bg-transparent border-none text-zinc-800 font-bold text-xs focus:outline-none cursor-pointer"
              />
            </div>

            <div className="flex items-center gap-2 px-3 py-1.5 bg-teal-50/80 text-teal-900 rounded-xl border border-teal-200 text-xs font-bold">
              <UserCheck className="w-3.5 h-3.5 text-teal-600" />
              <span>Líder: {currentHuddle.teamLeadName}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Shift Goal & Attendance Card */}
      <div className="bg-gradient-to-r from-teal-900 via-teal-950 to-slate-900 rounded-3xl p-5 md:p-6 text-white shadow-md relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2 flex-1">
            <div className="flex items-center gap-2 text-teal-300 text-xs font-bold uppercase tracking-wider">
              <Target className="w-4 h-4 text-teal-400" />
              <span>Meta e Foco Prioritário do Turno ({selectedShift})</span>
            </div>
            <p className="text-base md:text-lg font-bold text-teal-50 leading-relaxed italic">
              "{currentHuddle.shiftFocusGoal}"
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => {
                setEditedGoal(currentHuddle.shiftFocusGoal);
                setIsEditGoalModalOpen(true);
              }}
              className="px-3.5 py-2 bg-teal-800/80 hover:bg-teal-700 text-teal-100 font-bold text-xs rounded-xl border border-teal-600/50 transition-colors flex items-center gap-1.5 shadow-xs"
            >
              <Edit3 className="w-3.5 h-3.5 text-teal-300" />
              <span>Editar Meta</span>
            </button>
          </div>
        </div>

        {/* Team Attendance List */}
        <div className="mt-4 pt-4 border-t border-teal-800/60 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-teal-200 font-semibold">
            <span>Equipe Presente no Huddle ({currentHuddle.attendanceList.length}):</span>
          </div>
          <div className="flex flex-wrap items-center gap-1.5">
            {currentHuddle.attendanceList.map((member, idx) => (
              <span 
                key={idx}
                className="px-2.5 py-1 bg-teal-900/90 text-teal-100 rounded-lg border border-teal-700/60 text-[11px] font-bold flex items-center gap-1"
              >
                <Check className="w-3 h-3 text-emerald-400" />
                {member.staffName} ({member.role})
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content Split: Focus Topics vs Clinical Briefings */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Shift Focus Topics (7 Cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-teal-100 text-teal-800 rounded-xl">
                <Target className="w-4 h-4 text-teal-700" />
              </div>
              <div>
                <h2 className="text-base font-black text-zinc-900">
                  Tópicos de Foco da Liderança
                </h2>
                <p className="text-xs text-zinc-500 font-medium">
                  Atribuição de prioridades e cuidados direcionados para o turno da {selectedShift}.
                </p>
              </div>
            </div>

            <button
              onClick={() => {
                setNewTopicForm(prev => ({ ...prev, shift: selectedShift }));
                setIsNewTopicModalOpen(true);
              }}
              className="px-3 py-2 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5 stroke-[3]" />
              <span>Atribuir Foco</span>
            </button>
          </div>

          {/* Search topics */}
          <div className="relative">
            <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Buscar tópico por título, categoria ou residente..."
              value={searchTopicQuery}
              onChange={(e) => setSearchTopicQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 bg-white rounded-2xl border border-zinc-200 text-xs font-medium text-zinc-800 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
            />
          </div>

          {/* Topics List */}
          {shiftFocusTopics.length === 0 ? (
            <div className="bg-white rounded-3xl p-8 text-center border border-zinc-200/80 space-y-3">
              <Target className="w-10 h-10 text-zinc-300 mx-auto stroke-[1.5]" />
              <p className="text-xs text-zinc-500 font-medium">
                Nenhum tópico de foco registrado para o turno da {selectedShift}.
              </p>
              <button
                onClick={() => {
                  setNewTopicForm(prev => ({ ...prev, shift: selectedShift }));
                  setIsNewTopicModalOpen(true);
                }}
                className="px-3.5 py-2 bg-teal-50 hover:bg-teal-100 text-teal-800 font-bold text-xs rounded-xl border border-teal-200 transition-colors inline-flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5 text-teal-700" />
                <span>Adicionar Primeiro Tópico</span>
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {shiftFocusTopics.map((topic) => {
                const isHigh = topic.priority === 'Alta';
                return (
                  <div
                    key={topic.id}
                    className={`bg-white rounded-2xl p-4 border transition-all ${
                      topic.completed
                        ? 'border-zinc-200 bg-zinc-50/60 opacity-80'
                        : isHigh
                        ? 'border-rose-200/80 shadow-xs'
                        : 'border-zinc-200/80 hover:border-teal-200 shadow-2xs'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3">
                        <button
                          onClick={() => handleToggleTopicComplete(topic.id)}
                          className={`mt-0.5 p-1 rounded-lg border transition-colors ${
                            topic.completed
                              ? 'bg-emerald-500 text-white border-emerald-600'
                              : 'bg-zinc-50 text-zinc-300 hover:text-teal-600 border-zinc-300'
                          }`}
                          title={topic.completed ? 'Marcar como pendente' : 'Marcar como abordado'}
                        >
                          <Check className="w-4 h-4 stroke-[3]" />
                        </button>

                        <div className="space-y-1">
                          <div className="flex flex-wrap items-center gap-1.5">
                            <span className={`px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase ${
                              isHigh
                                ? 'bg-rose-100 text-rose-800 border border-rose-200'
                                : topic.priority === 'Média'
                                ? 'bg-amber-100 text-amber-800 border border-amber-200'
                                : 'bg-blue-100 text-blue-800 border border-blue-200'
                            }`}>
                              {topic.priority}
                            </span>

                            <span className="px-2 py-0.5 bg-zinc-100 text-zinc-700 rounded-md text-[10px] font-bold border border-zinc-200">
                              {topic.category}
                            </span>

                            <span className="text-[11px] text-zinc-400 font-medium">
                              • Resp: <strong className="text-zinc-700">{topic.assignedLead}</strong>
                            </span>
                          </div>

                          <h3 className={`text-xs md:text-sm font-black ${topic.completed ? 'line-through text-zinc-400' : 'text-zinc-900'}`}>
                            {topic.title}
                          </h3>

                          <p className="text-xs text-zinc-600 leading-relaxed font-medium">
                            {topic.description}
                          </p>

                          {/* Resident Highlights */}
                          {topic.residentHighlights && topic.residentHighlights.length > 0 && (
                            <div className="pt-2 flex flex-wrap items-center gap-1.5">
                              <span className="text-[10px] font-bold text-zinc-400 uppercase">Moradores Foco:</span>
                              {topic.residentHighlights.map((resName, rIdx) => (
                                <span
                                  key={rIdx}
                                  className="px-2 py-0.5 bg-teal-50 text-teal-800 border border-teal-200/80 rounded-md text-[11px] font-bold flex items-center gap-1"
                                >
                                  👤 {resName}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Column: Clinical Briefings (5 Cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-rose-100 text-rose-800 rounded-xl">
                <ShieldAlert className="w-4 h-4 text-rose-700" />
              </div>
              <div>
                <h2 className="text-base font-black text-zinc-900">
                  Briefings Clínicos de Prontidão
                </h2>
                <p className="text-xs text-zinc-500 font-medium">
                  Alertas integrados e orientações do NEWS2 / MAR.
                </p>
              </div>
            </div>
          </div>

          {/* Urgency Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
            {(['Todas', 'Crítica', 'Atenção', 'Informativa'] as const).map(urg => {
              const isActive = briefingFilter === urg;
              return (
                <button
                  key={urg}
                  onClick={() => setBriefingFilter(urg)}
                  className={`px-3 py-1.5 rounded-xl text-[11px] font-bold transition-all shrink-0 ${
                    isActive
                      ? 'bg-zinc-900 text-white shadow-2xs'
                      : 'bg-white text-zinc-600 hover:bg-zinc-100 border border-zinc-200'
                  }`}
                >
                  {urg}
                </button>
              );
            })}
          </div>

          {/* Briefings List */}
          <div className="space-y-3">
            {filteredBriefings.map((briefing) => {
              const isCrit = briefing.urgency === 'Crítica';
              const isUserAck = briefing.acknowledgedBy.includes(currentUser?.name || '');

              return (
                <div
                  key={briefing.id}
                  className={`bg-white rounded-2xl p-4 border transition-all ${
                    isCrit
                      ? 'border-rose-200 bg-rose-50/20'
                      : briefing.urgency === 'Atenção'
                      ? 'border-amber-200 bg-amber-50/20'
                      : 'border-zinc-200/80'
                  }`}
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase ${
                        isCrit
                          ? 'bg-rose-100 text-rose-800 border border-rose-200'
                          : briefing.urgency === 'Atenção'
                          ? 'bg-amber-100 text-amber-800 border border-amber-200'
                          : 'bg-blue-100 text-blue-800 border border-blue-200'
                      }`}>
                        {briefing.urgency} • {briefing.sourceModule}
                      </span>

                      {briefing.residentName && (
                        <span className="text-[11px] font-extrabold text-teal-800 bg-teal-50 px-2 py-0.5 rounded-md border border-teal-200">
                          {briefing.residentName}
                        </span>
                      )}
                    </div>

                    <h4 className="text-xs font-black text-zinc-900">
                      {briefing.title}
                    </h4>

                    <p className="text-xs text-zinc-600 leading-relaxed font-medium">
                      {briefing.content}
                    </p>

                    <div className="p-2.5 bg-zinc-50 rounded-xl border border-zinc-200/80 text-xs font-medium text-zinc-800">
                      <strong className="text-zinc-900 block text-[10px] uppercase font-black mb-0.5 text-teal-800">
                        Conduta Requerida no Huddle:
                      </strong>
                      {briefing.actionRequired}
                    </div>

                    {/* Acknowledged Staff List */}
                    <div className="pt-1 flex items-center justify-between text-[11px]">
                      <div className="text-zinc-400 font-medium">
                        Cientes ({briefing.acknowledgedBy.length}):{' '}
                        <span className="text-zinc-700 font-bold">
                          {briefing.acknowledgedBy.join(', ') || 'Nenhum'}
                        </span>
                      </div>

                      <button
                        onClick={() => handleAcknowledgeBriefing(briefing.id)}
                        className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border transition-colors ${
                          isUserAck
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                            : 'bg-zinc-100 hover:bg-zinc-200 text-zinc-700 border-zinc-300'
                        }`}
                      >
                        {isUserAck ? '✓ Ciente Registrado' : '+ Confirmar Ciente'}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Staff Training & Capacity Agenda Section */}
      <div className="bg-white rounded-3xl p-5 md:p-6 border border-zinc-200/90 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-indigo-100 text-indigo-800 rounded-xl">
              <GraduationCap className="w-5 h-5 text-indigo-700" />
            </div>
            <div>
              <h2 className="text-base font-black text-zinc-900">
                Agenda de Capacitações e Treinamentos da Equipe
              </h2>
              <p className="text-xs text-zinc-500 font-medium">
                Cursos obrigatórios, recertificações de BLS, biossegurança e manejo psiquiátrico.
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsNewTrainingModalOpen(true)}
            className="px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1.5 self-start sm:self-auto"
          >
            <Plus className="w-3.5 h-3.5 stroke-[3]" />
            <span>Agendar Treinamento</span>
          </button>
        </div>

        {/* Training Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {trainings.map((train) => {
            const isUserRegistered = train.registeredParticipants.includes(currentUser?.name || '');
            const seatsLeft = train.maxSeats - train.registeredParticipants.length;

            return (
              <div
                key={train.id}
                className="p-4 bg-zinc-50/80 rounded-2xl border border-zinc-200/80 flex flex-col justify-between space-y-3 hover:border-indigo-200 transition-all"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 bg-indigo-100 text-indigo-800 font-extrabold text-[10px] rounded-md border border-indigo-200">
                      {train.category}
                    </span>

                    <span className="text-[10px] font-bold text-zinc-500 bg-white px-2 py-0.5 rounded-md border border-zinc-200">
                      📅 {train.date} • {train.time}
                    </span>
                  </div>

                  <h3 className="text-xs font-black text-zinc-900 leading-snug">
                    {train.title}
                  </h3>

                  <div className="text-[11px] text-zinc-600 space-y-1">
                    <p className="flex items-center gap-1">
                      <UserCheck className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                      <span>Instrutor: <strong>{train.instructor}</strong></span>
                    </p>
                    <p className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                      <span>{train.location}</span>
                    </p>
                  </div>

                  {/* Target Roles */}
                  <div className="flex flex-wrap gap-1 pt-1">
                    {train.targetRoles.map((role, rIdx) => (
                      <span key={rIdx} className="px-1.5 py-0.5 bg-white text-zinc-600 text-[9px] font-bold rounded border border-zinc-200">
                        {role}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Capacity Progress & Button */}
                <div className="pt-2 border-t border-zinc-200/80 space-y-2">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-zinc-500 font-medium">Vagas Ocupadas:</span>
                    <span className="font-extrabold text-indigo-900">
                      {train.registeredParticipants.length} / {train.maxSeats}
                    </span>
                  </div>

                  <div className="w-full bg-zinc-200 h-1.5 rounded-full overflow-hidden">
                    <div
                      className="bg-indigo-600 h-full transition-all"
                      style={{ width: `${(train.registeredParticipants.length / train.maxSeats) * 100}%` }}
                    />
                  </div>

                  <button
                    onClick={() => handleToggleTrainingRegistration(train.id)}
                    className={`w-full py-2 px-3 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5 ${
                      isUserRegistered
                        ? 'bg-emerald-100 hover:bg-emerald-200 text-emerald-900 border border-emerald-300'
                        : seatsLeft === 0
                        ? 'bg-zinc-200 text-zinc-500 cursor-not-allowed'
                        : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs'
                    }`}
                  >
                    {isUserRegistered ? (
                      <>
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                        <span>Inscrição Confirmada</span>
                      </>
                    ) : seatsLeft === 0 ? (
                      <span>Esgotado</span>
                    ) : (
                      <>
                        <Plus className="w-3.5 h-3.5 stroke-[3]" />
                        <span>Garantir Vaga</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Modal: New Focus Topic */}
      {isNewTopicModalOpen && (
        <div className="fixed inset-0 bg-zinc-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-5 border border-zinc-200 shadow-2xl animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
              <div className="flex items-center gap-2">
                <Target className="w-5 h-5 text-teal-600" />
                <h3 className="text-base font-black text-zinc-900">
                  Novo Tópico de Foco do Turno
                </h3>
              </div>
              <button
                onClick={() => setIsNewTopicModalOpen(false)}
                className="p-1 text-zinc-400 hover:text-zinc-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateTopic} className="space-y-4 text-xs font-medium">
              <div>
                <label className="block text-zinc-700 font-bold mb-1">Turno Destino:</label>
                <select
                  value={newTopicForm.shift}
                  onChange={(e) => setNewTopicForm({ ...newTopicForm, shift: e.target.value as any })}
                  className="w-full p-2.5 bg-zinc-50 border border-zinc-300 rounded-xl font-bold text-zinc-800"
                >
                  <option value="Manhã">Manhã (07h-13h)</option>
                  <option value="Tarde">Tarde (13h-19h)</option>
                  <option value="Noturno">Noturno (19h-07h)</option>
                </select>
              </div>

              <div>
                <label className="block text-zinc-700 font-bold mb-1">Título do Foco Terapêutico/Operacional:</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Monitoramento de ingestão hídrica em idosos Grau III"
                  value={newTopicForm.title}
                  onChange={(e) => setNewTopicForm({ ...newTopicForm, title: e.target.value })}
                  className="w-full p-2.5 bg-zinc-50 border border-zinc-300 rounded-xl text-zinc-900 font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-700 font-bold mb-1">Categoria:</label>
                  <select
                    value={newTopicForm.category}
                    onChange={(e) => setNewTopicForm({ ...newTopicForm, category: e.target.value as any })}
                    className="w-full p-2.5 bg-zinc-50 border border-zinc-300 rounded-xl font-semibold"
                  >
                    <option value="Segurança do Paciente">Segurança do Paciente</option>
                    <option value="Farmacovigilância">Farmacovigilância</option>
                    <option value="Manejamento de Crise">Manejamento de Crise</option>
                    <option value="Comunicação e Handover">Comunicação e Handover</option>
                    <option value="Normas SRT / LGPD">Normas SRT / LGPD</option>
                    <option value="Cuidado Humanizado">Cuidado Humanizado</option>
                  </select>
                </div>

                <div>
                  <label className="block text-zinc-700 font-bold mb-1">Prioridade:</label>
                  <select
                    value={newTopicForm.priority}
                    onChange={(e) => setNewTopicForm({ ...newTopicForm, priority: e.target.value as any })}
                    className="w-full p-2.5 bg-zinc-50 border border-zinc-300 rounded-xl font-semibold"
                  >
                    <option value="Alta">Alta</option>
                    <option value="Média">Média</option>
                    <option value="Normal">Normal</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-zinc-700 font-bold mb-1">Orientação / Descrição da Conduta:</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Detalhes sobre a conduta exigida da equipe durante o turno..."
                  value={newTopicForm.description}
                  onChange={(e) => setNewTopicForm({ ...newTopicForm, description: e.target.value })}
                  className="w-full p-2.5 bg-zinc-50 border border-zinc-300 rounded-xl text-zinc-900"
                />
              </div>

              <div>
                <label className="block text-zinc-700 font-bold mb-1">Líder Responsável:</label>
                <input
                  type="text"
                  required
                  value={newTopicForm.assignedLead}
                  onChange={(e) => setNewTopicForm({ ...newTopicForm, assignedLead: e.target.value })}
                  className="w-full p-2.5 bg-zinc-50 border border-zinc-300 rounded-xl text-zinc-900 font-bold"
                />
              </div>

              <div>
                <label className="block text-zinc-700 font-bold mb-1">Moradores Foco (Separados por vírgula):</label>
                <input
                  type="text"
                  placeholder="Ex: Sr. Carlos Alberto, Dona Maria Oliveira"
                  value={newTopicForm.residentHighlightsText}
                  onChange={(e) => setNewTopicForm({ ...newTopicForm, residentHighlightsText: e.target.value })}
                  className="w-full p-2.5 bg-zinc-50 border border-zinc-300 rounded-xl text-zinc-900"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsNewTopicModalOpen(false)}
                  className="px-4 py-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 font-bold rounded-xl"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl shadow-xs"
                >
                  Salvar Tópico
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: New Staff Training */}
      {isNewTrainingModalOpen && (
        <div className="fixed inset-0 bg-zinc-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-5 border border-zinc-200 shadow-2xl animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
              <div className="flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-indigo-600" />
                <h3 className="text-base font-black text-zinc-900">
                  Agendar Novo Treinamento para Equipe
                </h3>
              </div>
              <button
                onClick={() => setIsNewTrainingModalOpen(false)}
                className="p-1 text-zinc-400 hover:text-zinc-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateTraining} className="space-y-4 text-xs font-medium">
              <div>
                <label className="block text-zinc-700 font-bold mb-1">Título do Curso/Treinamento:</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Treinamento de Prevenção de Quedas e Transferência"
                  value={newTrainingForm.title}
                  onChange={(e) => setNewTrainingForm({ ...newTrainingForm, title: e.target.value })}
                  className="w-full p-2.5 bg-zinc-50 border border-zinc-300 rounded-xl text-zinc-900 font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-700 font-bold mb-1">Instrutor:</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Enf. Ana Paula RT"
                    value={newTrainingForm.instructor}
                    onChange={(e) => setNewTrainingForm({ ...newTrainingForm, instructor: e.target.value })}
                    className="w-full p-2.5 bg-zinc-50 border border-zinc-300 rounded-xl font-bold text-zinc-900"
                  />
                </div>

                <div>
                  <label className="block text-zinc-700 font-bold mb-1">Categoria:</label>
                  <select
                    value={newTrainingForm.category}
                    onChange={(e) => setNewTrainingForm({ ...newTrainingForm, category: e.target.value as any })}
                    className="w-full p-2.5 bg-zinc-50 border border-zinc-300 rounded-xl font-semibold"
                  >
                    <option value="Suporte Básico de Vida (BLS)">BLS / Suporte Básico de Vida</option>
                    <option value="Prev. Incêndio / Evacuação">Prev. Incêndio e Evacuação</option>
                    <option value="Biossegurança NR32">Biossegurança NR32</option>
                    <option value="Humanização e Psicopatologia">Humanização e Psicopatologia</option>
                    <option value="Boas Práticas MAR">Boas Práticas MAR</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-zinc-700 font-bold mb-1">Data:</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Hoje, Amanhã, 15/08"
                    value={newTrainingForm.date}
                    onChange={(e) => setNewTrainingForm({ ...newTrainingForm, date: e.target.value })}
                    className="w-full p-2.5 bg-zinc-50 border border-zinc-300 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block text-zinc-700 font-bold mb-1">Horário:</label>
                  <input
                    type="text"
                    required
                    placeholder="14:00 - 15:00"
                    value={newTrainingForm.time}
                    onChange={(e) => setNewTrainingForm({ ...newTrainingForm, time: e.target.value })}
                    className="w-full p-2.5 bg-zinc-50 border border-zinc-300 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block text-zinc-700 font-bold mb-1">Vagas:</label>
                  <input
                    type="number"
                    min={1}
                    max={50}
                    value={newTrainingForm.maxSeats}
                    onChange={(e) => setNewTrainingForm({ ...newTrainingForm, maxSeats: Number(e.target.value) })}
                    className="w-full p-2.5 bg-zinc-50 border border-zinc-300 rounded-xl font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-zinc-700 font-bold mb-1">Local / Sala:</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Auditório Central / Sala Multiuso"
                  value={newTrainingForm.location}
                  onChange={(e) => setNewTrainingForm({ ...newTrainingForm, location: e.target.value })}
                  className="w-full p-2.5 bg-zinc-50 border border-zinc-300 rounded-xl"
                />
              </div>

              <div>
                <label className="block text-zinc-700 font-bold mb-1">Cargos Destino (Separados por vírgula):</label>
                <input
                  type="text"
                  value={newTrainingForm.targetRolesStr}
                  onChange={(e) => setNewTrainingForm({ ...newTrainingForm, targetRolesStr: e.target.value })}
                  className="w-full p-2.5 bg-zinc-50 border border-zinc-300 rounded-xl"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsNewTrainingModalOpen(false)}
                  className="px-4 py-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 font-bold rounded-xl"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-xs"
                >
                  Salvar Capacitação
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Edit Shift Goal */}
      {isEditGoalModalOpen && (
        <div className="fixed inset-0 bg-zinc-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 border border-zinc-200 shadow-2xl animate-in fade-in">
            <div className="flex items-center justify-between border-b border-zinc-100 pb-2">
              <h3 className="text-base font-black text-zinc-900">
                Editar Meta Principal do Turno ({selectedShift})
              </h3>
              <button onClick={() => setIsEditGoalModalOpen(false)} className="text-zinc-400 hover:text-zinc-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-700 mb-1">
                Objetivo e Orientação do Líder de Enfermagem:
              </label>
              <textarea
                rows={4}
                value={editedGoal}
                onChange={(e) => setEditedGoal(e.target.value)}
                className="w-full p-3 bg-zinc-50 border border-zinc-300 rounded-xl text-xs font-medium text-zinc-900 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setIsEditGoalModalOpen(false)}
                className="px-4 py-2 bg-zinc-100 text-zinc-700 text-xs font-bold rounded-xl"
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveEditedGoal}
                className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-xl shadow-xs"
              >
                Salvar Meta
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Full-Screen Modal: 5-Minute Express Huddle Presentation Overlay */}
      {isExpressHuddleOpen && (
        <div className="fixed inset-0 bg-zinc-950 text-white z-50 flex flex-col justify-between p-6 md:p-10 select-none animate-in fade-in">
          {/* Overlay Top Bar */}
          <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-teal-500/20 text-teal-400 rounded-xl border border-teal-500/30">
                <Users className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[10px] uppercase font-black tracking-widest text-teal-400 block">
                  APRESENTAÇÃO HUDDLE EXPRESS (5 MIN) • TURNO {selectedShift.toUpperCase()}
                </span>
                <h2 className="text-xl font-black text-white">
                  Líder: {currentHuddle.teamLeadName}
                </h2>
              </div>
            </div>

            {/* Countdown Timer */}
            <div className="flex items-center gap-4">
              <div className={`px-4 py-2 rounded-2xl border font-mono font-black text-xl flex items-center gap-2 ${
                timerSeconds < 60
                  ? 'bg-rose-950 text-rose-400 border-rose-800 animate-pulse'
                  : 'bg-zinc-900 text-teal-300 border-zinc-800'
              }`}>
                <Clock className="w-5 h-5 text-teal-400" />
                <span>{formatTimer(timerSeconds)}</span>
              </div>

              <button
                onClick={() => setIsTimerRunning(!isTimerRunning)}
                className="p-2.5 bg-zinc-900 hover:bg-zinc-800 text-white rounded-xl border border-zinc-800 font-bold text-xs"
              >
                {isTimerRunning ? 'Pausar' : 'Continuar'}
              </button>

              <button
                onClick={() => setIsExpressHuddleOpen(false)}
                className="p-2.5 bg-zinc-900 hover:bg-rose-950 text-zinc-400 hover:text-rose-400 rounded-xl border border-zinc-800"
                title="Fechar Huddle"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>

          {/* Slide Presentation Canvas */}
          <div className="my-auto max-w-4xl mx-auto w-full py-8 space-y-6">
            {expressSlideIndex === 0 && (
              <div className="space-y-6 text-center animate-in fade-in slide-in-from-right-4">
                <span className="px-3 py-1 bg-teal-500/20 text-teal-300 rounded-full text-xs font-bold border border-teal-500/30">
                  SLIDE 1 DE 4 • OBJETIVO PRINCIPAL DO TURNO
                </span>
                <h1 className="text-3xl md:text-5xl font-black text-white leading-tight">
                  "{currentHuddle.shiftFocusGoal}"
                </h1>
                <p className="text-sm text-zinc-400 font-medium">
                  Atalhos de confirmação de equipe e metas estabelecidas pela Enfermagem RT.
                </p>
              </div>
            )}

            {expressSlideIndex === 1 && (
              <div className="space-y-4 animate-in fade-in slide-in-from-right-4">
                <div className="text-center">
                  <span className="px-3 py-1 bg-teal-500/20 text-teal-300 rounded-full text-xs font-bold border border-teal-500/30">
                    SLIDE 2 DE 4 • TÓPICOS DE FOCO DA EQUIPE ({shiftFocusTopics.length})
                  </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                  {shiftFocusTopics.map((t) => (
                    <div key={t.id} className="p-4 bg-zinc-900/90 rounded-2xl border border-zinc-800 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="px-2 py-0.5 bg-teal-500/20 text-teal-300 text-[10px] font-bold rounded">
                          {t.category}
                        </span>
                        <span className="text-[10px] text-zinc-400">Resp: {t.assignedLead}</span>
                      </div>
                      <h3 className="text-sm font-black text-white">{t.title}</h3>
                      <p className="text-xs text-zinc-300">{t.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {expressSlideIndex === 2 && (
              <div className="space-y-4 animate-in fade-in slide-in-from-right-4">
                <div className="text-center">
                  <span className="px-3 py-1 bg-rose-500/20 text-rose-300 rounded-full text-xs font-bold border border-rose-500/30">
                    SLIDE 3 DE 4 • BRIEFINGS E ALERTAS CLÍNICOS
                  </span>
                </div>
                <div className="space-y-3 pt-2">
                  {briefings.slice(0, 3).map((b) => (
                    <div key={b.id} className="p-4 bg-zinc-900/90 rounded-2xl border border-zinc-800 space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <strong className="text-rose-400 uppercase font-black">{b.urgency} • {b.sourceModule}</strong>
                        {b.residentName && <span className="text-teal-300 font-bold">{b.residentName}</span>}
                      </div>
                      <h4 className="text-sm font-black text-white">{b.title}</h4>
                      <p className="text-xs text-zinc-300">{b.actionRequired}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {expressSlideIndex === 3 && (
              <div className="space-y-6 text-center animate-in fade-in slide-in-from-right-4">
                <span className="px-3 py-1 bg-emerald-500/20 text-emerald-300 rounded-full text-xs font-bold border border-emerald-500/30">
                  SLIDE 4 DE 4 • ENCERRAMENTO E REGISTRO DE ASSINATURA
                </span>
                <div className="p-6 bg-zinc-900 rounded-3xl border border-zinc-800 max-w-md mx-auto space-y-3">
                  <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto" />
                  <h3 className="text-lg font-black text-white">Concluir Daily Huddle</h3>
                  <p className="text-xs text-zinc-400">
                    Ao finalizar, este alinhamento será registrado com timestamp no histórico de trocas e prontidão.
                  </p>
                  <button
                    onClick={handleCompleteShiftHuddle}
                    className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-lg transition-colors"
                  >
                    Confirmar Encerramento do Huddle
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Slide Navigation Footer */}
          <div className="flex items-center justify-between border-t border-zinc-800 pt-4">
            <button
              onClick={() => setExpressSlideIndex(prev => Math.max(0, prev - 1))}
              disabled={expressSlideIndex === 0}
              className="px-4 py-2 bg-zinc-900 hover:bg-zinc-800 disabled:opacity-40 text-white font-bold text-xs rounded-xl border border-zinc-800 flex items-center gap-1.5"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Anterior</span>
            </button>

            <div className="flex items-center gap-1">
              {[0, 1, 2, 3].map((idx) => (
                <span
                  key={idx}
                  className={`w-3 h-3 rounded-full transition-all ${
                    expressSlideIndex === idx ? 'bg-teal-400 w-6' : 'bg-zinc-800'
                  }`}
                />
              ))}
            </div>

            <button
              onClick={() => setExpressSlideIndex(prev => Math.min(3, prev + 1))}
              disabled={expressSlideIndex === 3}
              className="px-4 py-2 bg-teal-600 hover:bg-teal-500 disabled:opacity-40 text-white font-bold text-xs rounded-xl flex items-center gap-1.5"
            >
              <span>Próximo</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
