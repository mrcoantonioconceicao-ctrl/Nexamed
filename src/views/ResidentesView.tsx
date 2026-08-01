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
  X
} from 'lucide-react';
import { Resident, DependenceLevel, ResidentStatus, RiskScore } from '../types';

interface ResidentesViewProps {
  residents: Resident[];
  onOpenResident: (id: string) => void;
  onOpenNewEvolution: (residentId: string) => void;
  onAddResident: (resident: Resident) => void;
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

    const newResident: Resident = {
      id: `res-${Date.now()}`,
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
      allergies: allergiesStr ? allergiesStr.split(',').map(s => s.trim()) : [],
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
      singularTherapeuticPlan: {
        mainFocus: 'Adaptação à rotina da residência e engajamento em terapias comunitárias.',
        goals: ['Adesão aos horários de sono e alimentação', 'Participação em oficinas de acolhimento'],
        reviewDate: '30/08/2026',
        progressPercentage: 50,
      }
    };

    onAddResident(newResident);
    setShowAddModal(false);
    // Reset form
    setName('');
    setAge('');
    setCpf('');
    setPrimaryDiagnosis('');
    setAllergiesStr('');
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
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="w-full max-w-xl bg-white border border-zinc-200 rounded-2xl shadow-2xl overflow-hidden my-6">
            <div className="p-4 bg-zinc-50 border-b border-zinc-200 flex items-center justify-between">
              <h2 className="text-sm font-bold text-zinc-900 flex items-center gap-2">
                <Users className="w-4 h-4 text-teal-600" />
                Cadastrar Novo Residente em Terapia
              </h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1 text-zinc-400 hover:text-zinc-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateResident} className="p-5 space-y-4 text-xs">
              <div>
                <label className="block font-bold text-zinc-700 mb-1">Nome Completo do Residente *</label>
                <input
                  required
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ex: Sr. Antonio Carlos de Souza"
                  className="w-full bg-zinc-50 text-zinc-900 p-2.5 rounded-xl border border-zinc-200 focus:outline-none focus:border-teal-500"
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
                    className="w-full bg-zinc-50 text-zinc-900 p-2.5 rounded-xl border border-zinc-200 focus:outline-none focus:border-teal-500"
                  />
                </div>
                <div>
                  <label className="block font-bold text-zinc-700 mb-1">CPF</label>
                  <input
                    type="text"
                    value={cpf}
                    onChange={(e) => setCpf(e.target.value)}
                    placeholder="123.456.789-00"
                    className="w-full bg-zinc-50 text-zinc-900 p-2.5 rounded-xl border border-zinc-200 focus:outline-none focus:border-teal-500"
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
                    className="w-full bg-zinc-50 text-zinc-900 p-2.5 rounded-xl border border-zinc-200 focus:outline-none focus:border-teal-500"
                  />
                </div>
                <div>
                  <label className="block font-bold text-zinc-700 mb-1">Grau de Dependência *</label>
                  <select
                    value={dependenceLevel}
                    onChange={(e) => setDependenceLevel(e.target.value as DependenceLevel)}
                    className="w-full bg-zinc-50 text-zinc-900 p-2.5 rounded-xl border border-zinc-200 focus:outline-none focus:border-teal-500"
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
                  placeholder="Ex: Transtorno Depressivo Recorrente em Reabilitação"
                  className="w-full bg-zinc-50 text-zinc-900 p-2.5 rounded-xl border border-zinc-200 focus:outline-none focus:border-teal-500"
                />
              </div>

              <div>
                <label className="block font-bold text-zinc-700 mb-1">Alergias Conhecidas (Separadas por vírgula)</label>
                <input
                  type="text"
                  value={allergiesStr}
                  onChange={(e) => setAllergiesStr(e.target.value)}
                  placeholder="Dipirona, Penicilina, Sulfa"
                  className="w-full bg-zinc-50 text-zinc-900 p-2.5 rounded-xl border border-zinc-200 focus:outline-none focus:border-teal-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2 border-t border-zinc-100">
                <div>
                  <label className="block font-bold text-zinc-700 mb-1">Nome Familiar Responsável</label>
                  <input
                    type="text"
                    value={emergencyName}
                    onChange={(e) => setEmergencyName(e.target.value)}
                    placeholder="Nome do parente"
                    className="w-full bg-zinc-50 text-zinc-900 p-2.5 rounded-xl border border-zinc-200 focus:outline-none focus:border-teal-500"
                  />
                </div>
                <div>
                  <label className="block font-bold text-zinc-700 mb-1">Telefone Família</label>
                  <input
                    type="text"
                    value={emergencyPhone}
                    onChange={(e) => setEmergencyPhone(e.target.value)}
                    placeholder="(11) 98888-7777"
                    className="w-full bg-zinc-50 text-zinc-900 p-2.5 rounded-xl border border-zinc-200 focus:outline-none focus:border-teal-500"
                  />
                </div>
              </div>

              <div className="pt-3 flex items-center justify-end space-x-2 border-t border-zinc-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="py-2 px-4 bg-zinc-100 text-zinc-700 hover:bg-zinc-200 rounded-xl font-bold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="py-2 px-5 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl shadow-2xs"
                >
                  Confirmar Cadastro
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
