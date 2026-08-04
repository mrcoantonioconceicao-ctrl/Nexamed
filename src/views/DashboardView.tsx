import React, { useState, useMemo } from 'react';
import { 
  Users, 
  ShieldAlert, 
  Pill, 
  FileText, 
  Sparkles, 
  TrendingUp, 
  Activity, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  ArrowRight,
  Heart,
  Plus
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid, 
  Cell, 
  Legend 
} from 'recharts';
import { Resident, ClinicalAlert, MedicationMAR, ClinicalEvolution, HandoverLog } from '../types';
import { ShiftSummaryWidget } from '../components/ShiftSummaryWidget';

interface DashboardViewProps {
  residents: Resident[];
  alerts: ClinicalAlert[];
  medications: MedicationMAR[];
  evolutions: ClinicalEvolution[];
  handovers?: HandoverLog[];
  onOpenResident: (id: string) => void;
  onOpenNewEvolution: (residentId?: string) => void;
  onNavigate: (path: string) => void;
  onMarkAlertsRead: () => void;
  onOpenIoTTelemetry?: (resident: Resident) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  residents,
  alerts,
  medications,
  evolutions,
  handovers = [],
  onOpenResident,
  onOpenNewEvolution,
  onNavigate,
  onMarkAlertsRead,
  onOpenIoTTelemetry
}) => {
  const [alertSeverityFilter, setAlertSeverityFilter] = useState<'Todos' | 'Crítico' | 'Alto' | 'Médio'>('Todos');
  const [chartMode, setChartMode] = useState<'categoria' | 'diario'>('categoria');

  // Calculate occurrence counts by category for last 7 days
  const occurrenceDataByCategory = useMemo(() => {
    const counts: Record<string, number> = {
      'Queda / Incidente': 3,
      'Sinais Vitais / Pressão': 5,
      'Incidente Medicamentoso': 2,
      'Comportamental': 4,
      'Atividade Terapêutica': 1,
    };

    if (handovers && handovers.length > 0) {
      handovers.forEach(h => {
        h.occurrences.forEach(occ => {
          if (occ.category === 'Queda/Incidente') counts['Queda / Incidente'] = (counts['Queda / Incidente'] || 0) + 1;
          else if (occ.category === 'Sinais Vitais') counts['Sinais Vitais / Pressão'] = (counts['Sinais Vitais / Pressão'] || 0) + 1;
          else if (occ.category === 'Medicação') counts['Incidente Medicamentoso'] = (counts['Incidente Medicamentoso'] || 0) + 1;
          else if (occ.category === 'Comportamental') counts['Comportamental'] = (counts['Comportamental'] || 0) + 1;
          else if (occ.category === 'Atividade Terapêutica') counts['Atividade Terapêutica'] = (counts['Atividade Terapêutica'] || 0) + 1;
        });
      });
    }

    const COLORS: Record<string, string> = {
      'Queda / Incidente': '#f43f5e',
      'Sinais Vitais / Pressão': '#f59e0b',
      'Incidente Medicamentoso': '#0284c7',
      'Comportamental': '#8b5cf6',
      'Atividade Terapêutica': '#0d9488',
    };

    return Object.entries(counts).map(([type, count]) => ({
      type,
      count,
      fill: COLORS[type] || '#0d9488',
    }));
  }, [handovers]);

  // Timeline breakdown per day for last 7 days
  const occurrenceDataByDay = useMemo(() => {
    return [
      { date: '26/Jul (Dom)', Queda: 1, Pressao: 1, Medicacao: 0, Comportamental: 1 },
      { date: '27/Jul (Seg)', Queda: 0, Pressao: 2, Medicacao: 1, Comportamental: 0 },
      { date: '28/Jul (Ter)', Queda: 1, Pressao: 0, Medicacao: 0, Comportamental: 2 },
      { date: '29/Jul (Qua)', Queda: 0, Pressao: 1, Medicacao: 1, Comportamental: 1 },
      { date: '30/Jul (Qui)', Queda: 1, Pressao: 1, Medicacao: 0, Comportamental: 0 },
      { date: '31/Jul (Sex)', Queda: 0, Pressao: 1, Medicacao: 1, Comportamental: 1 },
      { date: '01/Ago (Sáb)', Queda: 1, Pressao: 0, Medicacao: 0, Comportamental: 0 },
    ];
  }, []);

  // Calculate KPIs
  const totalResidents = residents.length;
  const occupancyPercentage = Math.round((totalResidents / 10) * 100); // 10 leitos totais
  const activeAlerts = alerts.filter(a => !a.read);
  const criticalAlerts = activeAlerts.filter(a => a.severity === 'Crítico');

  // Calculate medication progress
  let totalDosesToday = 0;
  let administeredDosesToday = 0;
  medications.forEach(m => {
    m.scheduledDoses.forEach(d => {
      totalDosesToday++;
      if (d.status === 'Ministrado') administeredDosesToday++;
    });
  });
  const medProgressPercent = totalDosesToday > 0 ? Math.round((administeredDosesToday / totalDosesToday) * 100) : 100;

  const filteredAlerts = activeAlerts.filter(a => {
    if (alertSeverityFilter === 'Todos') return true;
    return a.severity === alertSeverityFilter;
  });

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200">
      {/* Top Welcome Bar */}
      <div className="p-5 sm:p-6 bg-white border border-zinc-200/90 rounded-2xl shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold text-teal-800 bg-teal-50 px-2.5 py-0.5 rounded-full border border-teal-200">
              Painel Clínico
            </span>
            <span className="text-xs text-zinc-500 font-medium">Unidade Jardim Paulista • 24 Horas</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-zinc-900 tracking-tight">
            Gestão Integrada de Terapias Residenciais
          </h1>
          <p className="text-xs text-zinc-600 mt-1 max-w-2xl leading-relaxed">
            Central de monitoramento em tempo real com triagem de risco e assistência diagnóstica por IA Nexa.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={() => onOpenNewEvolution()}
            className="py-2.5 px-4 bg-teal-600 hover:bg-teal-700 text-white font-extrabold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Nova Evolução SOAP</span>
          </button>
          <button
            onClick={() => onNavigate('/plantao')}
            className="py-2.5 px-4 bg-zinc-100 hover:bg-zinc-200 text-zinc-800 font-bold text-xs rounded-xl border border-zinc-200/80 transition-colors"
          >
            Passagem de Plantão
          </button>
        </div>
      </div>

      {/* KPI Cards Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Occupancy & Residents */}
        <div className="p-4.5 bg-white border border-zinc-200/90 rounded-2xl shadow-xs space-y-2">
          <div className="flex items-center justify-between text-zinc-500">
            <span className="text-xs font-bold uppercase tracking-wider">Ocupação Leitos</span>
            <Users className="w-4 h-4 text-teal-600" />
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-black text-zinc-900">{totalResidents} <span className="text-xs font-semibold text-zinc-400">/ 10</span></span>
            <span className="text-xs font-bold text-teal-700">{occupancyPercentage}% Ocupado</span>
          </div>
          <div className="w-full bg-zinc-100 h-2 rounded-full overflow-hidden border border-zinc-200/50">
            <div className="bg-teal-600 h-full rounded-full" style={{ width: `${occupancyPercentage}%` }}></div>
          </div>
        </div>

        {/* KPI 2: Medication Progress */}
        <div className="p-4.5 bg-white border border-zinc-200/90 rounded-2xl shadow-xs space-y-2">
          <div className="flex items-center justify-between text-zinc-500">
            <span className="text-xs font-bold uppercase tracking-wider">Medicação do Dia (MAR)</span>
            <Pill className="w-4 h-4 text-amber-600" />
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-black text-zinc-900">{administeredDosesToday} <span className="text-xs font-semibold text-zinc-400">/ {totalDosesToday}</span></span>
            <span className="text-xs font-bold text-amber-700">{medProgressPercent}% Ministrado</span>
          </div>
          <div className="w-full bg-zinc-100 h-2 rounded-full overflow-hidden border border-zinc-200/50">
            <div className="bg-amber-500 h-full rounded-full" style={{ width: `${medProgressPercent}%` }}></div>
          </div>
        </div>

        {/* KPI 3: Active Alerts */}
        <div className="p-4.5 bg-white border border-zinc-200/90 rounded-2xl shadow-xs space-y-2">
          <div className="flex items-center justify-between text-zinc-500">
            <span className="text-xs font-bold uppercase tracking-wider">Alertas de Risco</span>
            <ShieldAlert className="w-4 h-4 text-rose-600" />
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-black text-rose-700">{activeAlerts.length}</span>
            <span className="text-xs font-bold text-rose-600">{criticalAlerts.length} Críticos</span>
          </div>
          <p className="text-[10px] text-zinc-500 font-medium truncate">Requerem atenção imediata da equipe</p>
        </div>

        {/* KPI 4: Today Evolutions */}
        <div className="p-4.5 bg-white border border-zinc-200/90 rounded-2xl shadow-xs space-y-2">
          <div className="flex items-center justify-between text-zinc-500">
            <span className="text-xs font-bold uppercase tracking-wider">Prontuários / SOAP</span>
            <FileText className="w-4 h-4 text-purple-600" />
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-black text-zinc-900">{evolutions.length}</span>
            <span className="text-xs font-bold text-purple-700">100% Assinados</span>
          </div>
          <p className="text-[10px] text-zinc-500 font-medium">Equipe multiprofissional ativa</p>
        </div>
      </div>

      {/* Resumo Automático do Plantão (Shift Summary Component) */}
      <ShiftSummaryWidget
        residents={residents}
        alerts={alerts}
        medications={medications}
        evolutions={evolutions}
        handovers={handovers}
        onOpenResident={onOpenResident}
        onOpenNewEvolution={onOpenNewEvolution}
        onNavigate={onNavigate}
      />

      {/* Recharts: Occurrence Frequency Chart Section */}
      <div className="p-5 bg-white border border-zinc-200/90 rounded-2xl shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-zinc-100 pb-3">
          <div>
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-teal-600" />
              <h2 className="text-xs font-bold text-zinc-900 uppercase tracking-wider">
                Frequência de Ocorrências por Tipo (Últimos 7 Dias)
              </h2>
            </div>
            <p className="text-[11px] text-zinc-500 font-medium mt-0.5">
              Análise comparativa de quedas, alterações de pressão, incidentes medicamentosos e eventos comportamentais
            </p>
          </div>

          <div className="flex items-center gap-1 text-xs bg-zinc-100/90 p-1 rounded-xl border border-zinc-200">
            <button
              onClick={() => setChartMode('categoria')}
              className={`px-3 py-1 rounded-lg font-bold transition-all ${
                chartMode === 'categoria'
                  ? 'bg-white text-teal-800 shadow-2xs border border-zinc-200'
                  : 'text-zinc-600 hover:text-zinc-900'
              }`}
            >
              Por Categoria
            </button>
            <button
              onClick={() => setChartMode('diario')}
              className={`px-3 py-1 rounded-lg font-bold transition-all ${
                chartMode === 'diario'
                  ? 'bg-white text-teal-800 shadow-2xs border border-zinc-200'
                  : 'text-zinc-600 hover:text-zinc-900'
              }`}
            >
              Evolução Diária
            </button>
          </div>
        </div>

        {/* Chart Rendering */}
        <div className="h-64 w-full pt-1">
          <ResponsiveContainer width="100%" height="100%">
            {chartMode === 'categoria' ? (
              <BarChart data={occurrenceDataByCategory} margin={{ top: 10, right: 20, left: -10, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis 
                  dataKey="type" 
                  tick={{ fontSize: 11, fill: '#475569', fontWeight: 600 }}
                  interval={0}
                />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} allowDecimals={false} />
                <Tooltip 
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-zinc-900 text-white p-3 rounded-xl shadow-lg border border-zinc-700 text-xs">
                          <p className="font-bold text-teal-300">{data.type}</p>
                          <p className="text-zinc-200 mt-1">Registros no período: <strong className="text-white font-extrabold">{data.count}</strong></p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar dataKey="count" name="Ocorrências" radius={[6, 6, 0, 0]}>
                  {occurrenceDataByCategory.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            ) : (
              <BarChart data={occurrenceDataByDay} margin={{ top: 10, right: 20, left: -10, bottom: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#475569', fontWeight: 600 }} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} allowDecimals={false} />
                <Tooltip 
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-zinc-900 text-white p-3 rounded-xl shadow-lg border border-zinc-700 text-xs space-y-1">
                          <p className="font-bold text-teal-300 border-b border-zinc-800 pb-1">{label}</p>
                          {payload.map((p: any) => (
                            <div key={p.name} className="flex items-center justify-between gap-4 text-[11px]">
                              <span className="flex items-center gap-1.5 text-zinc-300">
                                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color }} />
                                {p.name}:
                              </span>
                              <strong className="text-white">{p.value}</strong>
                            </div>
                          ))}
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Legend wrapperStyle={{ fontSize: 11, paddingTop: 10 }} />
                <Bar dataKey="Pressao" name="Alteração Pressão" stackId="a" fill="#f59e0b" />
                <Bar dataKey="Queda" name="Queda / Incidente" stackId="a" fill="#f43f5e" />
                <Bar dataKey="Medicacao" name="Incidente Medicação" stackId="a" fill="#0284c7" radius={[6, 6, 0, 0]} />
                <Bar dataKey="Comportamental" name="Comportamental" stackId="a" fill="#8b5cf6" />
              </BarChart>
            )}
          </ResponsiveContainer>
        </div>

        {/* Legend pills footer */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-zinc-100 text-[11px] text-zinc-600 font-medium">
          <div className="flex flex-wrap items-center gap-3">
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span> Queda / Incidente
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span> Alteração de Pressão / Vitais
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-sky-600"></span> Incidente Medicamentoso
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-purple-600"></span> Comportamental
            </span>
          </div>
          <span className="text-teal-700 font-bold bg-teal-50 px-2.5 py-0.5 rounded-md border border-teal-200">
            Atualizado via Passagens de Plantão
          </span>
        </div>
      </div>

      {/* Main Grid Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Intelligent Risk Alerts & Residents List */}
        <div className="lg:col-span-2 space-y-6">
          {/* Intelligent Clinical Risk Alerts */}
          <div className="p-5 bg-white border border-zinc-200/90 rounded-2xl shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-zinc-100 pb-3">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-rose-600" />
                <h2 className="text-xs font-bold text-zinc-900 uppercase tracking-wider">
                  Motor de Alertas Clínicos Inteligentes
                </h2>
              </div>

              {/* Filters */}
              <div className="flex items-center gap-1.5 text-xs">
                {(['Todos', 'Crítico', 'Alto', 'Médio'] as const).map(sev => (
                  <button
                    key={sev}
                    onClick={() => setAlertSeverityFilter(sev)}
                    className={`px-2.5 py-1 rounded-lg font-bold transition-colors ${
                      alertSeverityFilter === sev
                        ? 'bg-teal-50 text-teal-800 border border-teal-200'
                        : 'text-zinc-600 hover:text-zinc-900 bg-zinc-100/80 border border-transparent'
                    }`}
                  >
                    {sev}
                  </button>
                ))}
              </div>
            </div>

            {filteredAlerts.length === 0 ? (
              <div className="p-6 bg-zinc-50 rounded-xl text-center text-xs text-zinc-500 border border-zinc-200">
                <CheckCircle2 className="w-6 h-6 text-emerald-600 mx-auto mb-2" />
                <span>Nenhum alerta ativo nesta categoria no momento.</span>
              </div>
            ) : (
              <div className="space-y-2.5">
                {filteredAlerts.map(alert => (
                  <div
                    key={alert.id}
                    className={`p-3.5 rounded-xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 transition-all ${
                      alert.severity === 'Crítico'
                        ? 'bg-rose-50/60 border-rose-200/90'
                        : alert.severity === 'Alto'
                        ? 'bg-amber-50/60 border-amber-200/90'
                        : 'bg-zinc-50/80 border-zinc-200'
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                          alert.severity === 'Crítico' ? 'bg-rose-100 text-rose-800 border border-rose-200' :
                          alert.severity === 'Alto' ? 'bg-amber-100 text-amber-800 border border-amber-200' : 'bg-zinc-200 text-zinc-800 border border-zinc-300'
                        }`}>
                          {alert.severity}
                        </span>
                        <span className="text-[11px] font-bold text-zinc-900">{alert.type}</span>
                        <span className="text-[10px] text-zinc-400">• {alert.timestamp}</span>
                      </div>
                      <p className="text-xs text-zinc-800 font-medium">{alert.message}</p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {alert.residentId && (
                        <button
                          onClick={() => onOpenResident(alert.residentId!)}
                          className="py-1.5 px-3 bg-white hover:bg-zinc-100 text-teal-700 font-bold text-xs rounded-xl border border-zinc-200 shadow-2xs transition-colors"
                        >
                          Ver Ficha
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Active Residents Grid Card */}
          <div className="p-5 bg-white border border-zinc-200/90 rounded-2xl shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-teal-600" />
                <h2 className="text-xs font-bold text-zinc-900 uppercase tracking-wider">
                  Residentes em Acompanhamento Ativo
                </h2>
              </div>
              <button
                onClick={() => onNavigate('/residentes')}
                className="text-xs text-teal-700 hover:underline font-bold flex items-center gap-1"
              >
                Ver todos ({residents.length}) →
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {residents.map(res => (
                <div
                  key={res.id}
                  onClick={() => onOpenResident(res.id)}
                  className="p-3.5 bg-zinc-50/60 hover:bg-teal-50/40 rounded-2xl border border-zinc-200/80 cursor-pointer transition-all hover:border-teal-300 group shadow-2xs"
                >
                  <div className="flex items-center space-x-3">
                    <img src={res.photo} alt={res.name} className="w-12 h-12 rounded-xl object-cover border border-zinc-200 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-0.5">
                        <p className="text-xs font-bold text-zinc-900 truncate group-hover:text-teal-700">{res.name}</p>
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-white text-teal-700 border border-zinc-200 shadow-2xs">
                          {res.room}
                        </span>
                      </div>
                      <p className="text-[11px] text-zinc-500 truncate">{res.primaryDiagnosis}</p>
                      <div className="flex items-center gap-2 mt-1.5 text-[10px]">
                        <span className="text-purple-700 font-semibold">{res.dependenceLevel}</span>
                        <span className="text-zinc-300">•</span>
                        <span className={`font-bold px-1.5 py-0.2 rounded border ${
                          res.news2?.riskLevel === 'Crítico' ? 'bg-rose-100 text-rose-800 border-rose-300' :
                          res.news2?.riskLevel === 'Moderado' ? 'bg-amber-100 text-amber-800 border-amber-300' : 'bg-emerald-100 text-emerald-800 border-emerald-300'
                        }`}>
                          NEWS2: {res.news2?.totalScore ?? '0'} ({res.news2?.riskLevel ?? res.riskScore})
                        </span>
                        {onOpenIoTTelemetry && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onOpenIoTTelemetry(res);
                            }}
                            className="ml-auto px-2 py-0.5 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded text-[10px] shadow-2xs transition-colors flex items-center gap-1"
                            title="Simular Telemetria de Sinais Vitais IoT"
                          >
                            <Activity className="w-3 h-3" />
                            IoT Vitais
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right 1 Col: Nexa AI Executive Summary & Recent Activity */}
        <div className="space-y-6">
          {/* Nexa AI Executive Summary Card */}
          <div className="p-5 bg-gradient-to-br from-teal-50 via-emerald-50/60 to-white border border-teal-200/90 rounded-2xl shadow-xs space-y-3 relative overflow-hidden">
            <div className="flex items-center justify-between border-b border-teal-200/60 pb-2.5">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-teal-600" />
                <h3 className="text-xs font-bold text-zinc-900 uppercase tracking-wider">
                  Resumo Executivo Nexa IA
                </h3>
              </div>
              <span className="text-[10px] font-bold text-teal-800 bg-teal-100 px-2 py-0.5 rounded-md border border-teal-200">
                Hoje
              </span>
            </div>

            <div className="space-y-2 text-xs text-zinc-700 leading-relaxed font-sans">
              <p>
                • <strong>Estabilidade Clínica:</strong> 75% dos residentes apresentam quadro eutímico e sem intercorrências comportamentais severas no turno.
              </p>
              <p>
                • <strong>Ponto de Atenção:</strong> Medicação pendente para a Dra. Tereza (Suíte 201) aguardando reavaliação de espessante.
              </p>
              <p>
                • <strong>Ação Recomendada:</strong> Verificar confirmação de cobertura na escala do turno noturno de amanhã.
              </p>
            </div>

            <button
              onClick={() => onNavigate('/plantao')}
              className="w-full py-2 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-xl transition-colors flex items-center justify-center gap-1.5 shadow-2xs"
            >
              <span>Acessar Passagem de Plantão</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Recent Evolutions Feed */}
          <div className="p-5 bg-white border border-zinc-200/90 rounded-2xl shadow-xs space-y-3">
            <div className="flex items-center justify-between border-b border-zinc-100 pb-2.5">
              <h3 className="text-xs font-bold text-zinc-900 uppercase tracking-wider">
                Últimas Evoluções Registradas
              </h3>
              <button
                onClick={() => onNavigate('/prontuarios')}
                className="text-xs text-teal-700 hover:underline font-bold"
              >
                Ver Prontuário →
              </button>
            </div>

            <div className="space-y-3 divide-y divide-zinc-100">
              {evolutions.slice(0, 3).map((evo) => (
                <div key={evo.id} className="pt-2.5 first:pt-0 space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-zinc-900 truncate">{evo.residentName}</span>
                    <span className="text-[10px] text-zinc-400">{evo.time}</span>
                  </div>
                  <p className="text-[11px] text-teal-700 font-semibold">{evo.author} ({evo.role})</p>
                  <p className="text-xs text-zinc-600 line-clamp-2 leading-snug">{evo.soap.subjective}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
