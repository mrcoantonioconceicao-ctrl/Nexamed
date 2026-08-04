import React, { useState } from 'react';
import { 
  Users, 
  Search, 
  Plus, 
  Filter, 
  ShieldAlert, 
  FileText, 
  Phone, 
  Building2,
  CheckCircle2,
  X,
  Pill,
  Clock,
  Trash2,
  AlertCircle,
  Sparkles
} from 'lucide-react';
import { Resident, DependenceLevel, ResidentStatus, RiskScore, MedicationMAR, MedRoute, DoseStatus } from '../types';
import { splitCSVTokens } from '../utils/textParser';

interface InitialMedItem {
  id: string;
  medicationName: string;
  dosage: string;
  route: MedRoute;
  frequency: string;
  scheduledTimes: string[];
  stockDosesRemaining: number;
  isControlled: boolean;
  prescribedBy: string;
  allergyWarning?: string;
}

interface ResidentesViewProps {
  residents: Resident[];
  onOpenResident: (id: string) => void;
  onOpenNewEvolution: (residentId: string) => void;
  onAddResident: (resident: Resident, medications?: MedicationMAR[]) => void;
}

export const ResidentesView: React.FC<ResidentesViewProps> = ({
  residents,
  onOpenResident,
  onOpenNewEvolution,
  onAddResident,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [dependenceFilter, setDependenceFilter] = useState<string>('Todos');
  const [showAddModal, setShowAddModal] = useState(false);

  // Form state for adding new resident
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [cpf, setCpf] = useState('');
  const [room, setRoom] = useState('Suíte 202 - Leito B');
  const [dependenceLevel, setDependenceLevel] = useState<DependenceLevel>('Grau I');
  const [primaryDiagnosis, setPrimaryDiagnosis] = useState('');
  const [allergiesStr, setAllergiesStr] = useState('');
  const [emergencyName, setEmergencyName] = useState('');
  const [emergencyPhone, setEmergencyPhone] = useState('');

  // Form state for adding medications during resident creation
  const [medsList, setMedsList] = useState<InitialMedItem[]>([]);
  const [showMedForm, setShowMedForm] = useState(false);
  const [medName, setMedName] = useState('');
  const [medDosage, setMedDosage] = useState('');
  const [medRoute, setMedRoute] = useState<MedRoute>('VO');
  const [medFrequency, setMedFrequency] = useState('12/12h');
  const [selectedTimes, setSelectedTimes] = useState<string[]>(['08:00', '20:00']);
  const [medStock, setMedStock] = useState('30');
  const [medControlled, setMedControlled] = useState(false);
  const [medDoctor, setMedDoctor] = useState('Dr. Fernando Alencar');
  const [medWarning, setMedWarning] = useState('');

  const quickMedPresets = [
    { name: 'Quetiapina', dosage: '100mg', route: 'VO' as MedRoute, freq: '24/24h (Noite)', times: ['20:00'], stock: 30, controlled: true, doc: 'Dr. Fernando Alencar' },
    { name: 'Risperidona', dosage: '2mg', route: 'VO' as MedRoute, freq: '12/12h', times: ['08:00', '20:00'], stock: 60, controlled: true, doc: 'Dr. Fernando Alencar' },
    { name: 'Losartana', dosage: '50mg', route: 'VO' as MedRoute, freq: '24/24h (Manhã)', times: ['08:00'], stock: 30, controlled: false, doc: 'Dra. Patricia Lima' },
    { name: 'Clonazepam', dosage: '2mg', route: 'VO' as MedRoute, freq: '24/24h (Noite)', times: ['22:00'], stock: 30, controlled: true, doc: 'Dr. Fernando Alencar' },
    { name: 'Sertralina', dosage: '50mg', route: 'VO' as MedRoute, freq: '24/24h (Manhã)', times: ['08:00'], stock: 30, controlled: true, doc: 'Dr. Fernando Alencar' },
    { name: 'Memantina', dosage: '10mg', route: 'VO' as MedRoute, freq: '12/12h', times: ['08:00', '20:00'], stock: 60, controlled: false, doc: 'Dra. Patricia Lima' },
  ];

  const availableTimeSlots = ['08:00', '12:00', '16:00', '20:00', '22:00'];

  const handleToggleTimeSlot = (time: string) => {
    setSelectedTimes(prev => {
      if (prev.includes(time)) {
        return prev.filter(t => t !== time);
      } else {
        return [...prev, time].sort();
      }
    });
  };

  const handleApplyPreset = (preset: typeof quickMedPresets[0]) => {
    const newItem: InitialMedItem = {
      id: `med-init-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      medicationName: preset.name,
      dosage: preset.dosage,
      route: preset.route,
      frequency: preset.freq,
      scheduledTimes: preset.times,
      stockDosesRemaining: preset.stock,
      isControlled: preset.controlled,
      prescribedBy: preset.doc,
      allergyWarning: ''
    };
    setMedsList(prev => [...prev, newItem]);
  };

  const handleAddMedicationToList = () => {
    if (!medName || !medDosage) {
      alert('Por favor, informe o Nome do medicamento e a Dosagem.');
      return;
    }
    if (selectedTimes.length === 0) {
      alert('Selecione pelo menos um horário de administração.');
      return;
    }

    const newItem: InitialMedItem = {
      id: `med-init-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      medicationName: medName,
      dosage: medDosage,
      route: medRoute,
      frequency: medFrequency,
      scheduledTimes: [...selectedTimes],
      stockDosesRemaining: Number(medStock) || 30,
      isControlled: medControlled,
      prescribedBy: medDoctor || 'Médico Assistente',
      allergyWarning: medWarning
    };

    setMedsList(prev => [...prev, newItem]);

    // Clear med form
    setMedName('');
    setMedDosage('');
    setMedWarning('');
    setShowMedForm(false);
  };

  const handleRemoveMedicationFromList = (id: string) => {
    setMedsList(prev => prev.filter(m => m.id !== id));
  };

  const filteredResidents = residents.filter(r => {
    const matchesSearch = 
      r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.room.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.cpf.includes(searchQuery) ||
      r.primaryDiagnosis.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesDependence = dependenceFilter === 'Todos' || r.dependenceLevel === dependenceFilter;

    return matchesSearch && matchesDependence;
  });

  const handleCreateResident = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !primaryDiagnosis) return;

    const newResidentId = `res-${Date.now()}`;
    const newResident: Resident = {
      id: newResidentId,
      name,
      photo: `https://images.unsplash.com/photo-${1535713875002 + Math.floor(Math.random()*1000)}?w=150&auto=format&fit=crop&q=80`,
      age: Number(age) || 45,
      cpf: cpf || '000.000.000-00',
      room,
      unit: 'Unidade Jardim Paulista',
      dependenceLevel,
      primaryDiagnosis,
      status: 'Ativo',
      admissionsDate: new Date().toLocaleDateString('pt-BR'),
      allergies: splitCSVTokens(allergiesStr),
      emergencyContact: {
        name: emergencyName || 'Familiar Responsável',
        relationship: 'Familiar',
        phone: emergencyPhone || '(11) 99999-0000',
      },
      keyTherapists: [
        { role: 'Psiquiatra', name: 'Dr. Fernando Alencar' },
        { role: 'Enfermeiro RT', name: 'Enf. Bruno Costa' }
      ],
      riskScore: 'Médio',
      medsPendingCount: medsList.length,
      singularTherapeuticPlan: {
        mainFocus: 'Adaptação à rotina da residência e engajamento em terapias comunitárias.',
        goals: ['Adesão aos horários de sono e medicação', 'Participação em oficinas de acolhimento'],
        reviewDate: '30/08/2026',
        progressPercentage: 50,
      }
    };

    // Convert medsList to MedicationMAR objects
    const createdMedsMAR: MedicationMAR[] = medsList.map(item => ({
      id: item.id,
      residentId: newResidentId,
      residentName: name,
      room: room,
      medicationName: item.medicationName,
      dosage: item.dosage,
      route: item.route,
      frequency: item.frequency,
      scheduledDoses: item.scheduledTimes.map((time, idx) => ({
        id: `dose-${item.id}-${idx}`,
        time: time,
        status: 'Pendente' as DoseStatus
      })),
      stockDosesRemaining: item.stockDosesRemaining,
      isControlled: item.isControlled,
      prescribedBy: item.prescribedBy,
      allergyWarning: item.allergyWarning
    }));

    onAddResident(newResident, createdMedsMAR);
    setShowAddModal(false);

    // Reset form states
    setName('');
    setAge('');
    setCpf('');
    setPrimaryDiagnosis('');
    setAllergiesStr('');
    setEmergencyName('');
    setEmergencyPhone('');
    setMedsList([]);
    setShowMedForm(false);
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 bg-white border border-zinc-200/90 rounded-2xl shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Users className="w-5 h-5 text-teal-600" />
            <h1 className="text-lg font-black text-zinc-900 uppercase tracking-wider">
              Cadastro e Prontuário dos Residentes
            </h1>
          </div>
          <p className="text-xs text-zinc-500 font-medium">
            {residents.length} residentes cadastrados na Unidade Jardim Paulista
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="py-2.5 px-4 bg-teal-600 hover:bg-teal-700 text-white font-extrabold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Cadastrar Novo Residente</span>
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="p-4 bg-white border border-zinc-200/90 rounded-2xl shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar por nome, leito, CPF, diagnóstico..."
            className="w-full bg-zinc-50 text-zinc-900 text-xs pl-9 pr-3 py-2 rounded-xl border border-zinc-200 focus:outline-none focus:border-teal-500"
          />
        </div>

        {/* Dependence Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto text-xs no-scrollbar">
          <span className="text-zinc-500 font-semibold mr-1 shrink-0">Dependência:</span>
          {['Todos', 'Grau I', 'Grau II', 'Grau III'].map((lvl) => (
            <button
              key={lvl}
              onClick={() => setDependenceFilter(lvl)}
              className={`px-3 py-1.5 rounded-xl font-bold transition-colors shrink-0 ${
                dependenceFilter === lvl
                  ? 'bg-teal-50 text-teal-800 border border-teal-200/80 shadow-2xs'
                  : 'bg-zinc-50 text-zinc-600 hover:text-zinc-900 border border-zinc-200'
              }`}
            >
              {lvl}
            </button>
          ))}
        </div>
      </div>

      {/* Residents Grid */}
      {filteredResidents.length === 0 ? (
        <div className="p-8 bg-white rounded-2xl text-center border border-zinc-200 text-xs text-zinc-500 shadow-xs">
          Nenhum residente encontrado para os critérios selecionados.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredResidents.map((res) => (
            <div
              key={res.id}
              className="p-4.5 bg-white hover:bg-zinc-50/50 border border-zinc-200/90 rounded-2xl shadow-xs flex flex-col justify-between space-y-4 hover:border-teal-300 transition-all group"
            >
              <div className="space-y-3">
                {/* Card Top */}
                <div className="flex items-start space-x-3">
                  <img
                    src={res.photo}
                    alt={res.name}
                    className="w-14 h-14 rounded-2xl object-cover border-2 border-teal-500/40 shrink-0 shadow-2xs"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-0.5">
                      <h3 className="text-sm font-bold text-zinc-900 truncate group-hover:text-teal-700">
                        {res.name}
                      </h3>
                    </div>
                    <p className="text-xs text-teal-700 font-bold truncate">{res.room}</p>
                    <p className="text-[11px] text-zinc-500 truncate mt-0.5">{res.primaryDiagnosis}</p>
                  </div>
                </div>

                {/* Badges Strip */}
                <div className="flex flex-wrap gap-1.5 text-[10px]">
                  <span className="font-bold px-2 py-0.5 rounded-md bg-purple-50 text-purple-700 border border-purple-200">
                    {res.dependenceLevel}
                  </span>
                  <span className={`font-bold px-2 py-0.5 rounded-md uppercase border ${
                    res.riskScore === 'Crítico' ? 'bg-rose-50 text-rose-800 border-rose-200' :
                    res.riskScore === 'Alto' ? 'bg-amber-50 text-amber-800 border-amber-200' :
                    'bg-emerald-50 text-emerald-800 border-emerald-200'
                  }`}>
                    Risco {res.riskScore}
                  </span>
                  {res.allergies.length > 0 && (
                    <span className="font-bold px-2 py-0.5 rounded-md bg-rose-50 text-rose-800 border border-rose-200">
                      ⚠️ Alergias ({res.allergies.length})
                    </span>
                  )}
                </div>

                {/* Emergency Contact snippet */}
                <div className="p-2.5 bg-zinc-50 rounded-xl border border-zinc-200/80 text-[11px] text-zinc-700 space-y-0.5">
                  <p className="text-[10px] text-zinc-400 font-bold uppercase">Contato da Família:</p>
                  <p className="font-bold text-zinc-800">{res.emergencyContact.name}</p>
                  <p className="text-teal-700 font-semibold">{res.emergencyContact.phone}</p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 border-t border-zinc-100 flex items-center gap-2">
                <button
                  onClick={() => onOpenResident(res.id)}
                  className="flex-1 py-2 bg-zinc-100 hover:bg-zinc-200/80 text-zinc-800 font-bold text-xs rounded-xl border border-zinc-200 transition-colors"
                >
                  Ver Ficha Prontuário
                </button>
                <button
                  onClick={() => onOpenNewEvolution(res.id)}
                  className="py-2 px-3.5 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-xl transition-colors flex items-center gap-1 shadow-2xs"
                  title="Lançar Evolução SOAP"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Evoluir</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Cadastrar Novo Residente */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="w-full max-w-3xl bg-white border border-zinc-200 rounded-3xl shadow-2xl overflow-hidden my-6 max-h-[92vh] flex flex-col">
            {/* Modal Header */}
            <div className="p-4 sm:p-5 bg-gradient-to-r from-teal-900 to-zinc-900 text-white flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2.5">
                <span className="p-2 bg-teal-800 text-teal-200 rounded-2xl">
                  <Users className="w-5 h-5" />
                </span>
                <div>
                  <h2 className="text-base font-black tracking-tight text-white">
                    Cadastrar Novo Residente em Terapia
                  </h2>
                  <p className="text-xs text-teal-200">
                    Preencha os dados de identificação e cadastre a lista de medicamentos de uso contínuo (MAR).
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1.5 text-zinc-300 hover:text-white bg-white/10 hover:bg-white/20 rounded-xl transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form Scrollable Body */}
            <form onSubmit={handleCreateResident} className="p-5 sm:p-6 overflow-y-auto space-y-6 text-xs flex-1">
              {/* SECTION 1: DADOS PESSOAIS E PRONTUÁRIO */}
              <div className="space-y-3 bg-zinc-50/80 p-4 rounded-2xl border border-zinc-200/80">
                <div className="flex items-center gap-2 pb-2 border-b border-zinc-200">
                  <Users className="w-4 h-4 text-teal-700" />
                  <h3 className="font-extrabold text-zinc-900 uppercase text-[11px] tracking-wider">
                    1. Informações Pessoais e Acolhimento
                  </h3>
                </div>

                <div>
                  <label className="block font-bold text-zinc-700 mb-1">Nome Completo do Residente *</label>
                  <input
                    required
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ex: Sr. Antonio Carlos de Souza"
                    className="w-full bg-white text-zinc-900 p-2.5 rounded-xl border border-zinc-200 focus:outline-none focus:border-teal-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-zinc-700 mb-1">Idade</label>
                    <input
                      type="number"
                      value={age}
                      onChange={(e) => setAge(e.target.value)}
                      placeholder="65"
                      className="w-full bg-white text-zinc-900 p-2.5 rounded-xl border border-zinc-200 focus:outline-none focus:border-teal-500"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-zinc-700 mb-1">CPF</label>
                    <input
                      type="text"
                      value={cpf}
                      onChange={(e) => setCpf(e.target.value)}
                      placeholder="123.456.789-00"
                      className="w-full bg-white text-zinc-900 p-2.5 rounded-xl border border-zinc-200 focus:outline-none focus:border-teal-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-zinc-700 mb-1">Quarto / Leito *</label>
                    <input
                      required
                      type="text"
                      value={room}
                      onChange={(e) => setRoom(e.target.value)}
                      placeholder="Suíte 103 - Leito A"
                      className="w-full bg-white text-zinc-900 p-2.5 rounded-xl border border-zinc-200 focus:outline-none focus:border-teal-500"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-zinc-700 mb-1">Grau de Dependência *</label>
                    <select
                      value={dependenceLevel}
                      onChange={(e) => setDependenceLevel(e.target.value as DependenceLevel)}
                      className="w-full bg-white text-zinc-900 p-2.5 rounded-xl border border-zinc-200 focus:outline-none focus:border-teal-500 font-semibold"
                    >
                      <option value="Grau I">Grau I (Independente/Leve)</option>
                      <option value="Grau II">Grau II (Moderado)</option>
                      <option value="Grau III">Grau III (Alta Dependência)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-zinc-700 mb-1">Diagnóstico Principal *</label>
                  <input
                    required
                    type="text"
                    value={primaryDiagnosis}
                    onChange={(e) => setPrimaryDiagnosis(e.target.value)}
                    placeholder="Ex: Transtorno Depressivo Recorrente em Reabilitação / Alzheimer"
                    className="w-full bg-white text-zinc-900 p-2.5 rounded-xl border border-zinc-200 focus:outline-none focus:border-teal-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-zinc-700 mb-1">Alergias Conhecidas (Separadas por vírgula)</label>
                  <input
                    type="text"
                    value={allergiesStr}
                    onChange={(e) => setAllergiesStr(e.target.value)}
                    placeholder="Dipirona, Penicilina, Sulfa"
                    className="w-full bg-white text-zinc-900 p-2.5 rounded-xl border border-zinc-200 focus:outline-none focus:border-teal-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2">
                  <div>
                    <label className="block font-bold text-zinc-700 mb-1">Familiar Responsável</label>
                    <input
                      type="text"
                      value={emergencyName}
                      onChange={(e) => setEmergencyName(e.target.value)}
                      placeholder="Nome do parente/suporte"
                      className="w-full bg-white text-zinc-900 p-2.5 rounded-xl border border-zinc-200 focus:outline-none focus:border-teal-500"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-zinc-700 mb-1">Telefone da Família</label>
                    <input
                      type="text"
                      value={emergencyPhone}
                      onChange={(e) => setEmergencyPhone(e.target.value)}
                      placeholder="(11) 98888-7777"
                      className="w-full bg-white text-zinc-900 p-2.5 rounded-xl border border-zinc-200 focus:outline-none focus:border-teal-500"
                    />
                  </div>
                </div>
              </div>

              {/* SECTION 2: CADASTRO DE MEDICAMENTOS QUE O RESIDENTE TOMA */}
              <div className="space-y-4 bg-teal-50/50 p-4.5 rounded-2xl border border-teal-200/90">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2.5 border-b border-teal-200/80">
                  <div className="flex items-center gap-2">
                    <span className="p-1 bg-teal-200 text-teal-900 rounded-lg">
                      <Pill className="w-4 h-4" />
                    </span>
                    <div>
                      <h3 className="font-extrabold text-teal-950 uppercase text-[11px] tracking-wider flex items-center gap-1.5">
                        2. Cadastrar Medicamentos que o Residente Toma
                      </h3>
                      <p className="text-[11px] text-teal-700">
                        Insira os remédios de uso contínuo para gerar o Kardex Eletrônico (MAR) automaticamente.
                      </p>
                    </div>
                  </div>

                  <span className="text-xs font-black bg-teal-800 text-white px-2.5 py-1 rounded-xl shrink-0 self-start sm:self-center shadow-2xs">
                    {medsList.length} medicamento(s) adicionado(s)
                  </span>
                </div>

                {/* Quick Presets Bar */}
                <div className="space-y-1.5 bg-white/80 p-3 rounded-xl border border-teal-100">
                  <div className="flex items-center gap-1 text-[11px] font-bold text-teal-900">
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                    <span>Adicionar Medicamento Rápido (Atalhos Frequentes):</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {quickMedPresets.map((preset, pIdx) => (
                      <button
                        key={pIdx}
                        type="button"
                        onClick={() => handleApplyPreset(preset)}
                        className="px-2.5 py-1 bg-teal-100 hover:bg-teal-200 text-teal-900 font-bold text-[11px] rounded-lg border border-teal-300 transition-all flex items-center gap-1 hover:scale-[1.02]"
                      >
                        <Plus className="w-3 h-3 text-teal-700" />
                        <span>{preset.name} {preset.dosage}</span>
                        <span className="text-[9px] text-teal-700 font-normal">({preset.freq})</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Added Medications Cards List */}
                {medsList.length > 0 && (
                  <div className="space-y-2">
                    <label className="block text-[11px] font-extrabold text-teal-950 uppercase tracking-wider">
                      Lista de Medicamentos para o Prontuário:
                    </label>
                    <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                      {medsList.map((item) => (
                        <div
                          key={item.id}
                          className="p-3 bg-white rounded-xl border border-teal-200 shadow-2xs flex items-start justify-between gap-3 hover:border-teal-400 transition-all"
                        >
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="font-black text-xs text-zinc-900">💊 {item.medicationName}</span>
                              <span className="font-extrabold text-xs text-teal-900 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                                {item.dosage}
                              </span>
                              <span className="text-[10px] font-bold bg-zinc-100 text-zinc-700 px-1.5 py-0.5 rounded">
                                Via {item.route}
                              </span>
                              {item.isControlled && (
                                <span className="text-[9px] font-extrabold bg-amber-100 text-amber-900 px-1.5 py-0.5 rounded border border-amber-300">
                                  🔒 Controlado
                                </span>
                              )}
                            </div>

                            <div className="flex items-center gap-3 text-[11px] text-zinc-600">
                              <span>Frequência: <strong>{item.frequency}</strong></span>
                              <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3 text-teal-700" />
                                <strong>Horários:</strong> {item.scheduledTimes.join(', ')}
                              </span>
                              <span>Estoque: <strong>{item.stockDosesRemaining} doses</strong></span>
                            </div>

                            {item.allergyWarning && (
                              <p className="text-[10px] text-amber-800 font-semibold bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                                ⚠️ {item.allergyWarning}
                              </p>
                            )}
                          </div>

                          <button
                            type="button"
                            onClick={() => handleRemoveMedicationFromList(item.id)}
                            className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors shrink-0"
                            title="Remover medicamento"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Custom Add Medication Toggle / Form */}
                {!showMedForm ? (
                  <button
                    type="button"
                    onClick={() => setShowMedForm(true)}
                    className="w-full py-2.5 bg-white hover:bg-teal-100/50 text-teal-800 font-extrabold text-xs rounded-xl border border-dashed border-teal-400 flex items-center justify-center gap-1.5 transition-colors shadow-2xs"
                  >
                    <Plus className="w-4 h-4 text-teal-700 stroke-[2.5]" />
                    <span>Cadastrar Outro Medicamento Personalizado</span>
                  </button>
                ) : (
                  <div className="p-4 bg-white rounded-2xl border border-teal-300 shadow-sm space-y-3.5 animate-in fade-in duration-150">
                    <div className="flex items-center justify-between border-b border-zinc-100 pb-2">
                      <h4 className="font-extrabold text-zinc-900 text-xs flex items-center gap-1.5">
                        <Pill className="w-4 h-4 text-teal-600" />
                        Formulário de Nova Prescrição de Medicamento
                      </h4>
                      <button
                        type="button"
                        onClick={() => setShowMedForm(false)}
                        className="text-xs text-zinc-400 hover:text-zinc-700 font-bold"
                      >
                        ✕ Fechar
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block font-bold text-zinc-700 mb-1">Nome do Medicamento *</label>
                        <input
                          type="text"
                          value={medName}
                          onChange={(e) => setMedName(e.target.value)}
                          placeholder="Ex: Quetiapina / Losartana"
                          className="w-full bg-zinc-50 text-zinc-900 p-2 rounded-xl border border-zinc-200 focus:outline-none focus:border-teal-500"
                        />
                      </div>

                      <div>
                        <label className="block font-bold text-zinc-700 mb-1">Dosagem / Apresentação *</label>
                        <input
                          type="text"
                          value={medDosage}
                          onChange={(e) => setMedDosage(e.target.value)}
                          placeholder="Ex: 100mg (1 comprimido)"
                          className="w-full bg-zinc-50 text-zinc-900 p-2 rounded-xl border border-zinc-200 focus:outline-none focus:border-teal-500"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block font-bold text-zinc-700 mb-1">Via de Administração</label>
                        <select
                          value={medRoute}
                          onChange={(e) => setMedRoute(e.target.value as MedRoute)}
                          className="w-full bg-zinc-50 text-zinc-900 p-2 rounded-xl border border-zinc-200 focus:outline-none focus:border-teal-500"
                        >
                          <option value="VO">VO (Via Oral)</option>
                          <option value="IV">IV (Intravenosa)</option>
                          <option value="IM">IM (Intramuscular)</option>
                          <option value="SC">SC (Subcutânea)</option>
                          <option value="Tópico">Tópico / Pomada</option>
                          <option value="Inalatório">Inalatório / Spray</option>
                        </select>
                      </div>

                      <div>
                        <label className="block font-bold text-zinc-700 mb-1">Frequência</label>
                        <input
                          type="text"
                          value={medFrequency}
                          onChange={(e) => setMedFrequency(e.target.value)}
                          placeholder="12/12h, 24/24h, SOS"
                          className="w-full bg-zinc-50 text-zinc-900 p-2 rounded-xl border border-zinc-200 focus:outline-none focus:border-teal-500"
                        />
                      </div>

                      <div>
                        <label className="block font-bold text-zinc-700 mb-1">Estoque Inicial (Doses)</label>
                        <input
                          type="number"
                          value={medStock}
                          onChange={(e) => setMedStock(e.target.value)}
                          placeholder="30"
                          className="w-full bg-zinc-50 text-zinc-900 p-2 rounded-xl border border-zinc-200 focus:outline-none focus:border-teal-500"
                        />
                      </div>
                    </div>

                    {/* Time slots selection */}
                    <div className="space-y-1">
                      <label className="block font-bold text-zinc-700">Horários de Aprazamento (Selecione):</label>
                      <div className="flex flex-wrap gap-1.5">
                        {availableTimeSlots.map(time => {
                          const isSelected = selectedTimes.includes(time);
                          return (
                            <button
                              key={time}
                              type="button"
                              onClick={() => handleToggleTimeSlot(time)}
                              className={`px-3 py-1.5 rounded-xl font-bold text-xs border transition-all ${
                                isSelected
                                  ? 'bg-teal-700 text-white border-teal-800 shadow-2xs'
                                  : 'bg-zinc-100 text-zinc-600 border-zinc-200 hover:bg-zinc-200'
                              }`}
                            >
                              ⏰ {time}h
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Doctor and Controlled toggle */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
                      <div>
                        <label className="block font-bold text-zinc-700 mb-1">Médico Prescritor</label>
                        <input
                          type="text"
                          value={medDoctor}
                          onChange={(e) => setMedDoctor(e.target.value)}
                          placeholder="Dr. Fernando Alencar"
                          className="w-full bg-zinc-50 text-zinc-900 p-2 rounded-xl border border-zinc-200 focus:outline-none focus:border-teal-500"
                        />
                      </div>

                      <div className="pt-4">
                        <label className="flex items-center gap-2 cursor-pointer p-2 bg-amber-50 rounded-xl border border-amber-200">
                          <input
                            type="checkbox"
                            checked={medControlled}
                            onChange={(e) => setMedControlled(e.target.checked)}
                            className="w-4 h-4 text-teal-600 rounded focus:ring-teal-500"
                          />
                          <span className="font-bold text-amber-950 text-xs">
                            🔒 Psicotrópico / Controlado (Portaria 344)
                          </span>
                        </label>
                      </div>
                    </div>

                    <div>
                      <label className="block font-bold text-zinc-700 mb-1">Recomendação / Alerta de Enfermagem</label>
                      <input
                        type="text"
                        value={medWarning}
                        onChange={(e) => setMedWarning(e.target.value)}
                        placeholder="Ex: Administrar após almoço, medir PA antes"
                        className="w-full bg-zinc-50 text-zinc-900 p-2 rounded-xl border border-zinc-200 focus:outline-none focus:border-teal-500"
                      />
                    </div>

                    <div className="pt-2 flex justify-end">
                      <button
                        type="button"
                        onClick={handleAddMedicationToList}
                        className="py-2 px-4 bg-teal-700 hover:bg-teal-800 text-white font-extrabold text-xs rounded-xl shadow-2xs flex items-center gap-1.5"
                      >
                        <Plus className="w-4 h-4 stroke-[2.5]" />
                        <span>Adicionar este Medicamento</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Modal Footer Buttons */}
              <div className="pt-4 flex items-center justify-between border-t border-zinc-200 shrink-0">
                <span className="text-xs text-zinc-500 font-medium">
                  {medsList.length === 0
                    ? 'Nenhum medicamento adicionado (poderá ser adicionado depois).'
                    : `Pronto para cadastrar com ${medsList.length} medicamento(s) no MAR.`}
                </span>

                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="py-2.5 px-4 bg-zinc-100 text-zinc-700 hover:bg-zinc-200 rounded-xl font-bold transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="py-2.5 px-6 bg-teal-700 hover:bg-teal-800 text-white font-extrabold rounded-xl shadow-md transition-all flex items-center gap-1.5"
                  >
                    <CheckCircle2 className="w-4 h-4 stroke-[2.5]" />
                    <span>Confirmar Cadastro do Residente</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
