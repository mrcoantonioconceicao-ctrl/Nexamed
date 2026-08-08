import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Users, 
  Plus, 
  Calendar, 
  User, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Sparkles, 
  ClipboardList, 
  Search, 
  ShieldCheck,
  ChevronRight,
  Filter,
  Activity,
  HeartPulse,
  Brain,
  Stethoscope
} from 'lucide-react';
import { Resident, PASRecord, AppointmentRecord } from '../types';
import { giterStore } from '../utils/giterStore';

interface PASAtendimentosViewProps {
  residents: Resident[];
  onNavigate?: (path: string) => void;
}

export const PASAtendimentosView: React.FC<PASAtendimentosViewProps> = ({
  residents,
  onNavigate
}) => {
  const [activeTab, setActiveTab] = useState<'PAS' | 'ATENDIMENTOS'>('PAS');
  const [pasRecords, setPasRecords] = useState<PASRecord[]>([]);
  const [appointments, setAppointments] = useState<AppointmentRecord[]>([]);
  const [selectedResidentId, setSelectedResidentId] = useState<string>(residents[0]?.id || '');
  const [searchQuery, setSearchQuery] = useState('');

  // Form states for New PAS
  const [isNewPASModalOpen, setIsNewPASModalOpen] = useState(false);
  const [pasType, setPasType] = useState<'Inicial' | 'Periódico' | 'Revisão Extraordinária'>('Inicial');
  const [pasGoals, setPasGoals] = useState('');
  const [pasInterventions, setPasInterventions] = useState('');
  const [pasCareLevel, setPasCareLevel] = useState<'Grau I' | 'Grau II' | 'Grau III'>('Grau I');
  const [pasNextReviewDays, setPasNextReviewDays] = useState(180);

  // Form states for New Appointment
  const [isNewAppointmentModalOpen, setIsNewAppointmentModalOpen] = useState(false);
  const [specialty, setSpecialty] = useState<string>('Psiquiatria');
  const [professionalName, setProfessionalName] = useState('');
  const [conduct, setConduct] = useState('');
  const [referrals, setReferrals] = useState('');
  const [summary, setSummary] = useState('');

  // Load from store on mount
  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    setPasRecords(giterStore.getPASRecords());
    setAppointments(giterStore.getAppointments());
  };

  const selectedResident = residents.find(r => r.id === selectedResidentId) || residents[0];

  const handleCreatePAS = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedResident) return;

    const today = new Date();
    const nextReview = new Date();
    nextReview.setDate(today.getDate() + pasNextReviewDays);

    const newPas: PASRecord = {
      id: `pas-${Date.now()}`,
      residentId: selectedResident.id,
      residentName: selectedResident.name,
      type: pasType,
      creationDate: today.toISOString().split('T')[0],
      nextReviewDate: nextReview.toISOString().split('T')[0],
      authorName: 'Enf. Responsável Técnico',
      authorRole: 'Enfermeiro RT',
      careLevel: pasCareLevel,
      goals: pasGoals.split('\n').filter(Boolean),
      interventions: pasInterventions.split('\n').filter(Boolean),
      status: 'Ativo',
      version: pasRecords.filter(p => p.residentId === selectedResident.id).length + 1
    };

    giterStore.savePASRecord(newPas);
    loadData();
    setIsNewPASModalOpen(false);
    setPasGoals('');
    setPasInterventions('');
  };

  const handleCreateAppointment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedResident) return;

    const todayStr = new Date().toLocaleDateString('pt-BR');
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const newAppt: AppointmentRecord = {
      id: `appt-${Date.now()}`,
      residentId: selectedResident.id,
      residentName: selectedResident.name,
      specialty: specialty as any,
      professionalName: professionalName || 'Dr. Profissional Multidisciplinar',
      date: todayStr,
      time: timeStr,
      conduct: conduct,
      referrals: referrals ? referrals.split('\n') : [],
      summary: summary,
      status: 'Realizado'
    };

    giterStore.saveAppointment(newAppt);
    loadData();
    setIsNewAppointmentModalOpen(false);
    setConduct('');
    setReferrals('');
    setSummary('');
  };

  const filteredResidents = residents.filter(r => 
    r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.room.includes(searchQuery)
  );

  const residentPasRecords = pasRecords.filter(p => p.residentId === selectedResidentId);
  const residentAppointments = appointments.filter(a => a.residentId === selectedResidentId);

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 bg-white border border-zinc-200/90 rounded-2xl shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <ClipboardList className="w-5 h-5 text-teal-600" />
            <h1 className="text-lg font-black text-zinc-900 uppercase tracking-wider">
              PAS (Plano Assistencial) & Atendimentos Multidisciplinares
            </h1>
          </div>
          <p className="text-xs text-zinc-500 font-medium">
            Gestão assistencial contínua, metas terapêuticas individuais e prontuário multiprofissional (GITER Parity)
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsNewPASModalOpen(true)}
            className="py-2.5 px-4 bg-teal-600 hover:bg-teal-700 text-white font-extrabold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>Novo PAS (Plano Assistencial)</span>
          </button>
          <button
            onClick={() => setIsNewAppointmentModalOpen(true)}
            className="py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-2"
          >
            <Stethoscope className="w-4 h-4" />
            <span>Registrar Atendimento</span>
          </button>
        </div>
      </div>

      {/* Tabs Bar */}
      <div className="flex items-center gap-2 border-b border-zinc-200 pb-2">
        <button
          onClick={() => setActiveTab('PAS')}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-all flex items-center gap-2 ${
            activeTab === 'PAS'
              ? 'bg-teal-600 text-white shadow-xs'
              : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Planos de Avaliação Assistencial (PAS)</span>
          <span className="ml-1 px-2 py-0.5 text-[10px] bg-white/20 rounded-full font-black">
            {pasRecords.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('ATENDIMENTOS')}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-all flex items-center gap-2 ${
            activeTab === 'ATENDIMENTOS'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
          }`}
        >
          <Brain className="w-4 h-4" />
          <span>Atendimentos Multidisciplinares</span>
          <span className="ml-1 px-2 py-0.5 text-[10px] bg-white/20 rounded-full font-black">
            {appointments.length}
          </span>
        </button>
      </div>

      {/* Main Grid: Resident Selector + Tab Content */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Resident Sidebar Selection */}
        <div className="lg:col-span-1 space-y-3 bg-white p-4 border border-zinc-200/90 rounded-2xl shadow-xs">
          <div className="flex items-center justify-between pb-2 border-b border-zinc-100">
            <span className="text-xs font-black text-zinc-800 uppercase tracking-wider">
              Residentes ({residents.length})
            </span>
            <Search className="w-4 h-4 text-zinc-400" />
          </div>

          <input
            type="text"
            placeholder="Buscar por nome ou quarto..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-3 py-2 text-xs border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500"
          />

          <div className="space-y-1.5 max-h-[500px] overflow-y-auto pr-1">
            {filteredResidents.map(res => {
              const isSelected = res.id === selectedResidentId;
              const pasCount = pasRecords.filter(p => p.residentId === res.id).length;
              const apptCount = appointments.filter(a => a.residentId === res.id).length;

              return (
                <button
                  key={res.id}
                  onClick={() => setSelectedResidentId(res.id)}
                  className={`w-full text-left p-3 rounded-xl border transition-all flex items-center justify-between ${
                    isSelected
                      ? 'bg-teal-50 border-teal-300 text-teal-900 font-bold shadow-2xs'
                      : 'border-zinc-200/80 hover:bg-zinc-50 text-zinc-700'
                  }`}
                >
                  <div>
                    <p className="text-xs font-black text-zinc-900">{res.name}</p>
                    <p className="text-[11px] text-zinc-500 font-medium">Quarto {res.room} • {res.age} anos</p>
                  </div>
                  <div className="flex flex-col items-end gap-1 text-[10px]">
                    <span className="bg-teal-100 text-teal-800 font-extrabold px-1.5 py-0.5 rounded">
                      {pasCount} PAS
                    </span>
                    <span className="bg-indigo-100 text-indigo-800 font-extrabold px-1.5 py-0.5 rounded">
                      {apptCount} Atend.
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected Resident Content Details */}
        <div className="lg:col-span-3 space-y-6">
          {selectedResident && (
            <div className="bg-white p-5 border border-zinc-200/90 rounded-2xl shadow-xs flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-teal-100 border border-teal-200 flex items-center justify-center font-black text-teal-800 text-lg">
                  {selectedResident.name.charAt(0)}
                </div>
                <div>
                  <h2 className="text-base font-black text-zinc-900">{selectedResident.name}</h2>
                  <p className="text-xs text-zinc-500 font-medium">
                    Quarto {selectedResident.room} • CNS: {selectedResident.cns || 'Não informado'} • Grau de Dependência: {selectedResident.careLevel || 'Grau I'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-bold px-3 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl">
                  🟢 Prontuário Ativo GITER
                </span>
              </div>
            </div>
          )}

          {/* TAB 1: PAS RECORDS */}
          {activeTab === 'PAS' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-black text-zinc-800 uppercase tracking-wider flex items-center gap-2">
                  <FileText className="w-4 h-4 text-teal-600" />
                  Planos de Avaliação Assistencial Cadastrados ({residentPasRecords.length})
                </h3>
              </div>

              {residentPasRecords.length === 0 ? (
                <div className="p-8 text-center bg-white border border-dashed border-zinc-200 rounded-2xl space-y-3">
                  <AlertCircle className="w-8 h-8 text-zinc-400 mx-auto" />
                  <p className="text-xs font-bold text-zinc-600">Nenhum PAS registrado para este residente.</p>
                  <p className="text-xs text-zinc-400">Clique em "Novo PAS" no topo para estruturar o plano assistencial inicial.</p>
                  <button
                    onClick={() => setIsNewPASModalOpen(true)}
                    className="py-2 px-4 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-xl transition-colors"
                  >
                    Criar PAS Inicial Agora
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {residentPasRecords.map(pas => (
                    <div key={pas.id} className="p-5 bg-white border border-zinc-200/90 rounded-2xl shadow-xs space-y-4">
                      <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
                        <div className="flex items-center gap-2">
                          <span className="px-2.5 py-1 text-[10px] font-black uppercase rounded-lg bg-teal-100 text-teal-800 border border-teal-200">
                            {pas.type} v{pas.version}
                          </span>
                          <span className="text-xs font-bold text-zinc-700">
                            Nível de Cuidado: <span className="text-teal-700 font-extrabold">{pas.careLevel}</span>
                          </span>
                        </div>
                        <div className="text-right text-[11px] text-zinc-500 font-semibold">
                          Criado em {pas.creationDate} • Próxima Revisão: <span className="text-amber-700 font-bold">{pas.nextReviewDate}</span>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                        <div className="p-3 bg-zinc-50 rounded-xl border border-zinc-200/80 space-y-2">
                          <span className="font-extrabold text-zinc-900 uppercase tracking-wider text-[10px]">
                            🎯 Metas Assistenciais Estabelecidas
                          </span>
                          <ul className="list-disc list-inside space-y-1 text-zinc-700 font-medium">
                            {(pas.goals || pas.mainGoals || []).map((g, i) => (
                              <li key={i}>{g}</li>
                            ))}
                          </ul>
                        </div>

                        <div className="p-3 bg-teal-50/50 rounded-xl border border-teal-100 space-y-2">
                          <span className="font-extrabold text-teal-900 uppercase tracking-wider text-[10px]">
                            🛠️ Intervenções de Enfermagem & Cuidados
                          </span>
                          <ul className="list-disc list-inside space-y-1 text-teal-900 font-medium">
                            {(pas.interventions || []).map((intv, i) => (
                              <li key={i}>{intv}</li>
                            ))}
                          </ul>
                        </div>
                      </div>

                      <div className="text-[11px] text-zinc-400 font-medium pt-2 border-t border-zinc-100 flex items-center justify-between">
                        <span>Elaborado por: {pas.authorName} ({pas.authorRole})</span>
                        <span className="text-emerald-700 font-bold">Status: {pas.status}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: MULTIDISCIPLINARY APPOINTMENTS */}
          {activeTab === 'ATENDIMENTOS' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-black text-zinc-800 uppercase tracking-wider flex items-center gap-2">
                  <Brain className="w-4 h-4 text-indigo-600" />
                  Atendimentos e Consultas Realizadas ({residentAppointments.length})
                </h3>
              </div>

              {residentAppointments.length === 0 ? (
                <div className="p-8 text-center bg-white border border-dashed border-zinc-200 rounded-2xl space-y-3">
                  <AlertCircle className="w-8 h-8 text-zinc-400 mx-auto" />
                  <p className="text-xs font-bold text-zinc-600">Nenhum atendimento multidisciplinar registrado para este residente.</p>
                  <p className="text-xs text-zinc-400">Registre dados de consultas médicas, de psicologia, serviço social, terapia ocupacional, etc.</p>
                  <button
                    onClick={() => setIsNewAppointmentModalOpen(true)}
                    className="py-2 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl transition-colors"
                  >
                    Registrar Primeiro Atendimento
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {residentAppointments.map(appt => (
                    <div key={appt.id} className="p-5 bg-white border border-zinc-200/90 rounded-2xl shadow-xs space-y-3">
                      <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
                        <div className="flex items-center gap-2">
                          <span className="px-2.5 py-1 text-[10px] font-black uppercase rounded-lg bg-indigo-100 text-indigo-800 border border-indigo-200">
                            {appt.specialty}
                          </span>
                          <span className="text-xs font-bold text-zinc-800">{appt.professionalName}</span>
                        </div>
                        <div className="text-[11px] text-zinc-500 font-semibold">
                          {appt.date} às {appt.time}
                        </div>
                      </div>

                      <div className="space-y-2 text-xs">
                        <p className="text-zinc-700 font-medium leading-relaxed bg-zinc-50 p-3 rounded-xl border border-zinc-200/80">
                          <strong className="text-zinc-900 block mb-1">Resumo Clínico / Evolutivo:</strong>
                          {appt.summary}
                        </p>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div className="p-3 bg-indigo-50/50 rounded-xl border border-indigo-100">
                            <strong className="text-indigo-950 block text-[10px] uppercase font-black mb-1">
                              Conduta Adotada:
                            </strong>
                            <p className="text-indigo-900 font-medium">{appt.conduct}</p>
                          </div>

                          {appt.referrals && (Array.isArray(appt.referrals) ? appt.referrals.length > 0 : Boolean(appt.referrals)) && (
                            <div className="p-3 bg-amber-50/50 rounded-xl border border-amber-100">
                              <strong className="text-amber-950 block text-[10px] uppercase font-black mb-1">
                                Encaminhamentos / Orientações:
                              </strong>
                              <ul className="list-disc list-inside text-amber-900 font-medium">
                                {(Array.isArray(appt.referrals) ? appt.referrals : [String(appt.referrals)]).map((ref, idx) => (
                                  <li key={idx}>{ref}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* MODAL: NEW PAS */}
      {isNewPASModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-xl border border-zinc-200 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-zinc-200 pb-3">
              <h3 className="text-sm font-black text-zinc-900 uppercase tracking-wider flex items-center gap-2">
                <FileText className="w-5 h-5 text-teal-600" />
                Novo Plano Assistencial (PAS GITER)
              </h3>
              <button onClick={() => setIsNewPASModalOpen(false)} className="text-zinc-400 hover:text-zinc-600 font-bold">✕</button>
            </div>

            <form onSubmit={handleCreatePAS} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-zinc-700 mb-1">Residente</label>
                <input
                  type="text"
                  disabled
                  value={selectedResident?.name || ''}
                  className="w-full px-3 py-2 bg-zinc-100 border border-zinc-200 rounded-xl font-bold text-zinc-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-zinc-700 mb-1">Tipo de PAS</label>
                  <select
                    value={pasType}
                    onChange={(e: any) => setPasType(e.target.value)}
                    className="w-full px-3 py-2 border border-zinc-200 rounded-xl font-medium focus:ring-2 focus:ring-teal-500"
                  >
                    <option value="Inicial">PAS Inicial</option>
                    <option value="Periódico">PAS Periódico</option>
                    <option value="Revisão Extraordinária">Revisão Extraordinária</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-zinc-700 mb-1">Grau de Dependência</label>
                  <select
                    value={pasCareLevel}
                    onChange={(e: any) => setPasCareLevel(e.target.value)}
                    className="w-full px-3 py-2 border border-zinc-200 rounded-xl font-medium focus:ring-2 focus:ring-teal-500"
                  >
                    <option value="Grau I">Grau I (Independente)</option>
                    <option value="Grau II">Grau II (Semidependente)</option>
                    <option value="Grau III">Grau III (Dependência Total)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-zinc-700 mb-1">Metas Terapêuticas e Assistenciais (uma por linha)</label>
                <textarea
                  required
                  rows={3}
                  placeholder="Ex: Manter autonomia em ABVDs&#10;Estimular sociabilização nos workshops artesanais&#10;Controle rigoroso da glicemia de jejum"
                  value={pasGoals}
                  onChange={(e) => setPasGoals(e.target.value)}
                  className="w-full px-3 py-2 border border-zinc-200 rounded-xl font-medium focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div>
                <label className="block font-bold text-zinc-700 mb-1">Intervenções de Enfermagem e Cuidados (uma por linha)</label>
                <textarea
                  required
                  rows={3}
                  placeholder="Ex: Checagem do MAR 12/12h rigorosa&#10;Aferição de sinais vitais e NEWS2 diariamente&#10;Auxílio parcial no banho se solicitado"
                  value={pasInterventions}
                  onChange={(e) => setPasInterventions(e.target.value)}
                  className="w-full px-3 py-2 border border-zinc-200 rounded-xl font-medium focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div>
                <label className="block font-bold text-zinc-700 mb-1">Próxima Revisão Assistencial</label>
                <select
                  value={pasNextReviewDays}
                  onChange={(e) => setPasNextReviewDays(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-zinc-200 rounded-xl font-medium"
                >
                  <option value={30}>Em 30 dias (Mensal)</option>
                  <option value={90}>Em 90 dias (Trimestral)</option>
                  <option value={180}>Em 180 dias (Semestral - Padrão)</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-zinc-200">
                <button
                  type="button"
                  onClick={() => setIsNewPASModalOpen(false)}
                  className="px-4 py-2 border border-zinc-300 text-zinc-700 font-bold rounded-xl hover:bg-zinc-100"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl shadow-xs"
                >
                  Salvar Plano Assistencial
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: NEW APPOINTMENT */}
      {isNewAppointmentModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-xl border border-zinc-200 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-zinc-200 pb-3">
              <h3 className="text-sm font-black text-zinc-900 uppercase tracking-wider flex items-center gap-2">
                <Stethoscope className="w-5 h-5 text-indigo-600" />
                Registrar Atendimento Multidisciplinar
              </h3>
              <button onClick={() => setIsNewAppointmentModalOpen(false)} className="text-zinc-400 hover:text-zinc-600 font-bold">✕</button>
            </div>

            <form onSubmit={handleCreateAppointment} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-zinc-700 mb-1">Residente</label>
                <input
                  type="text"
                  disabled
                  value={selectedResident?.name || ''}
                  className="w-full px-3 py-2 bg-zinc-100 border border-zinc-200 rounded-xl font-bold text-zinc-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-zinc-700 mb-1">Especialidade / Área</label>
                  <select
                    value={specialty}
                    onChange={(e) => setSpecialty(e.target.value)}
                    className="w-full px-3 py-2 border border-zinc-200 rounded-xl font-medium focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="Psiquiatria">Psiquiatria</option>
                    <option value="Clínica Geral">Clínica Geral</option>
                    <option value="Enfermagem">Enfermagem RT</option>
                    <option value="Psicologia">Psicologia</option>
                    <option value="Terapia Ocupacional">Terapia Ocupacional</option>
                    <option value="Serviço Social">Serviço Social</option>
                    <option value="Fisioterapia">Fisioterapia</option>
                    <option value="Nutrição">Nutrição</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-zinc-700 mb-1">Nome do Profissional</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Dr. Fernando Alencar"
                    value={professionalName}
                    onChange={(e) => setProfessionalName(e.target.value)}
                    className="w-full px-3 py-2 border border-zinc-200 rounded-xl font-medium focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-zinc-700 mb-1">Resumo Evolutivo do Atendimento</label>
                <textarea
                  required
                  rows={3}
                  placeholder="Relato detalhado da consulta, queixas do paciente, estado mental/físico..."
                  value={summary}
                  onChange={(e) => setSummary(e.target.value)}
                  className="w-full px-3 py-2 border border-zinc-200 rounded-xl font-medium focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block font-bold text-zinc-700 mb-1">Conduta e Diretrizes Adotadas</label>
                <textarea
                  required
                  rows={2}
                  placeholder="Ex: Ajustada dosagem de Haloperidol para noite, mantido acompanhamento na TO..."
                  value={conduct}
                  onChange={(e) => setConduct(e.target.value)}
                  className="w-full px-3 py-2 border border-zinc-200 rounded-xl font-medium focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block font-bold text-zinc-700 mb-1">Encaminhamentos / Recomendações (uma por linha)</label>
                <textarea
                  rows={2}
                  placeholder="Ex: Solicitação de hemograma completo&#10;Agendamento com cardiologista"
                  value={referrals}
                  onChange={(e) => setReferrals(e.target.value)}
                  className="w-full px-3 py-2 border border-zinc-200 rounded-xl font-medium focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-zinc-200">
                <button
                  type="button"
                  onClick={() => setIsNewAppointmentModalOpen(false)}
                  className="px-4 py-2 border border-zinc-300 text-zinc-700 font-bold rounded-xl hover:bg-zinc-100"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-xs"
                >
                  Salvar Atendimento
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
