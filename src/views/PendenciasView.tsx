import React, { useState, useEffect } from 'react';
import { 
  AlertCircle, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Filter, 
  ArrowRight, 
  ShieldCheck, 
  User, 
  Pill, 
  FileText, 
  Activity, 
  AlertTriangle,
  RotateCcw,
  Sparkles,
  ExternalLink,
  Layers
} from 'lucide-react';
import { Resident, ClinicalEvolution, MedicationMAR, ClinicalAlert, PendingClinicalTask } from '../types';
import { giterStore } from '../utils/giterStore';

interface PendenciasViewProps {
  residents: Resident[];
  evolutions: ClinicalEvolution[];
  medications: MedicationMAR[];
  alerts: ClinicalAlert[];
  onNavigate: (path: string) => void;
  onOpenSOAPForResident: (residentId: string) => void;
}

export const PendenciasView: React.FC<PendenciasViewProps> = ({
  residents,
  evolutions,
  medications,
  alerts,
  onNavigate,
  onOpenSOAPForResident
}) => {
  const [tasks, setTasks] = useState<PendingClinicalTask[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('TODOS');
  const [selectedPriority, setSelectedPriority] = useState<string>('TODAS');

  useEffect(() => {
    generateAndSyncTasks();
  }, [residents, evolutions, medications, alerts]);

  const generateAndSyncTasks = () => {
    const todayStr = new Date().toLocaleDateString('pt-BR');
    const computedTasks: PendingClinicalTask[] = [];

    residents.forEach(res => {
      // 1. Check SOAP Evolution today
      const hasSoap = evolutions.some(e => e.residentId === res.id && e.date === todayStr);
      if (!hasSoap) {
        computedTasks.push({
          id: `pnd-soap-${res.id}`,
          residentId: res.id,
          residentName: res.name,
          room: res.room,
          category: 'SOAP Incompleto',
          priority: 'Alta',
          description: `Ausência de evolução clínica registrada na data de hoje (${todayStr}).`,
          actionType: 'open_soap',
          status: 'Aberto'
        });
      }

      // 2. Check MAR Medications
      const resMeds = medications.filter(m => m.residentId === res.id);
      let pendingDoses = 0;
      resMeds.forEach(m => {
        pendingDoses += (m.scheduledDoses || []).filter(d => d.status === 'Pendente').length;
      });

      if (pendingDoses > 0) {
        computedTasks.push({
          id: `pnd-mar-${res.id}`,
          residentId: res.id,
          residentName: res.name,
          room: res.room,
          category: 'MAR Pendente',
          priority: 'Crítica',
          description: `${pendingDoses} dose(s) de medicação aguardando checagem/ministração no Kardex Eletrônico.`,
          actionType: 'open_mar',
          status: 'Aberto'
        });
      }

      // 3. Check Vitals (NEWS2 Risk score elevated)
      if (res.news2?.riskLevel === 'Crítico' || res.news2?.riskLevel === 'Alto') {
        computedTasks.push({
          id: `pnd-vitals-${res.id}`,
          residentId: res.id,
          residentName: res.name,
          room: res.room,
          category: 'Sinal Vital Faltante',
          priority: 'Crítica',
          description: `Escore NEWS2 Elevado (${res.news2.totalScore} pts - ${res.news2.riskLevel}). Reavaliação imediata de sinais vitais requerida.`,
          actionType: 'open_vitals',
          status: 'Aberto'
        });
      }
    });

    setTasks(computedTasks);
  };

  const handleFixPendingItem = (task: PendingClinicalTask) => {
    if (task.actionType === 'open_soap') {
      onOpenSOAPForResident(task.residentId);
    } else if (task.actionType === 'open_mar') {
      onNavigate('/medicacao');
    } else if (task.actionType === 'open_vitals') {
      onNavigate('/dashboard');
    }
  };

  const filteredTasks = tasks.filter(t => {
    const matchesCat = selectedCategory === 'TODOS' || t.category === selectedCategory;
    const matchesPrio = selectedPriority === 'TODAS' || t.priority === selectedPriority;
    return matchesCat && matchesPrio;
  });

  const getReadinessStatus = (residentId: string) => {
    const resTasks = tasks.filter(t => t.residentId === residentId);
    if (resTasks.some(t => t.priority === 'Crítica')) {
      return { status: 'PENDÊNCIA CRÍTICA', badge: 'bg-rose-100 text-rose-800 border-rose-300', icon: XCircle, count: resTasks.length };
    }
    if (resTasks.length > 0) {
      return { status: 'ATENÇÃO', badge: 'bg-amber-100 text-amber-800 border-amber-300', icon: AlertTriangle, count: resTasks.length };
    }
    return { status: 'PRONTO', badge: 'bg-emerald-100 text-emerald-800 border-emerald-300', icon: CheckCircle2, count: 0 };
  };

  const criticalCount = tasks.filter(t => t.priority === 'Crítica').length;
  const highCount = tasks.filter(t => t.priority === 'Alta').length;

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 bg-white border border-zinc-200/90 rounded-2xl shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <AlertCircle className="w-5 h-5 text-rose-600" />
            <h1 className="text-lg font-black text-zinc-900 uppercase tracking-wider">
              Central de Pendências Clínicas & Status de Prontidão
            </h1>
          </div>
          <p className="text-xs text-zinc-500 font-medium">
            Mapeamento em tempo real de lacunas nos prontuários, atrasos em medicação e conformidade assistencial
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="px-3 py-1.5 bg-rose-50 border border-rose-200 rounded-xl text-xs font-bold text-rose-800">
            🔴 {criticalCount} Críticas
          </div>
          <div className="px-3 py-1.5 bg-amber-50 border border-amber-200 rounded-xl text-xs font-bold text-amber-800">
            🟡 {highCount} Altas
          </div>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {residents.map(res => {
          const readiness = getReadinessStatus(res.id);
          const Icon = readiness.icon;

          return (
            <div key={res.id} className="p-4 bg-white border border-zinc-200/90 rounded-2xl shadow-xs flex items-center justify-between gap-3">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-black text-xs text-zinc-900">{res.name}</span>
                  <span className="text-[10px] text-zinc-500 font-medium">Quarto {res.room}</span>
                </div>
                <p className="text-[11px] text-zinc-500 font-medium">
                  {readiness.count > 0 ? `${readiness.count} pendência(s) mapeada(s)` : 'Sem pendências assistenciais'}
                </p>
              </div>

              <div className={`px-2.5 py-1 rounded-xl border text-[10px] font-black uppercase flex items-center gap-1 shrink-0 ${readiness.badge}`}>
                <Icon className="w-3.5 h-3.5" />
                <span>{readiness.status}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Filter and Table Section */}
      <div className="p-5 bg-white border border-zinc-200/90 rounded-2xl shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-zinc-100">
          <h2 className="text-xs font-black text-zinc-800 uppercase tracking-wider flex items-center gap-2">
            <Layers className="w-4 h-4 text-teal-600" />
            Lista Detalhada de Pendências Mapeadas ({filteredTasks.length})
          </h2>

          <div className="flex items-center gap-2 text-xs">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-1.5 border border-zinc-200 rounded-xl font-semibold text-zinc-700 focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              <option value="TODOS">Todas Categorias</option>
              <option value="SOAP Incompleto">SOAP Incompleto</option>
              <option value="MAR Pendente">MAR Pendente</option>
              <option value="Sinal Vital Faltante">Sinal Vital Faltante</option>
            </select>

            <select
              value={selectedPriority}
              onChange={(e) => setSelectedPriority(e.target.value)}
              className="px-3 py-1.5 border border-zinc-200 rounded-xl font-semibold text-zinc-700 focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              <option value="TODAS">Todas Prioridades</option>
              <option value="Crítica">Crítica</option>
              <option value="Alta">Alta</option>
            </select>
          </div>
        </div>

        {filteredTasks.length === 0 ? (
          <div className="p-8 text-center border border-dashed border-zinc-200 rounded-2xl space-y-2">
            <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto" />
            <p className="text-xs font-bold text-zinc-700">Tudo em Conformidade!</p>
            <p className="text-xs text-zinc-400">Nenhuma pendência encontrada para o filtro selecionado.</p>
          </div>
        ) : (
          <div className="divide-y divide-zinc-100 space-y-3">
            {filteredTasks.map(task => (
              <div key={task.id} className="pt-3 first:pt-0 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-3 hover:bg-zinc-50/80 rounded-xl transition-colors border border-zinc-100">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-xs text-zinc-900">{task.residentName}</span>
                    <span className="text-[10px] font-bold text-zinc-500">Quarto {task.room}</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                      task.priority === 'Crítica' ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'
                    }`}>
                      {task.priority}
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-zinc-100 text-zinc-700">
                      {task.category}
                    </span>
                  </div>
                  <p className="text-xs text-zinc-600 font-medium">{task.description}</p>
                </div>

                <button
                  onClick={() => handleFixPendingItem(task)}
                  className="py-2 px-3.5 bg-teal-600 hover:bg-teal-700 text-white font-extrabold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1.5 shrink-0"
                >
                  <span>IR PARA CORREÇÃO</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
