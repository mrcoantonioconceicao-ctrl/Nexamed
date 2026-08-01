import React, { useState } from 'react';
import { 
  FileText, 
  Search, 
  Plus, 
  Stethoscope, 
  Activity, 
  Filter, 
  Calendar, 
  Sparkles,
  UserCheck
} from 'lucide-react';
import { ClinicalEvolution, ClinicalRole } from '../types';

interface ProntuariosViewProps {
  evolutions: ClinicalEvolution[];
  onOpenNewEvolution: () => void;
}

export const ProntuariosView: React.FC<ProntuariosViewProps> = ({
  evolutions,
  onOpenNewEvolution,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('Todas');

  const filteredEvolutions = evolutions.filter((evo) => {
    const matchesSearch =
      evo.residentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      evo.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
      evo.soap.subjective.toLowerCase().includes(searchQuery.toLowerCase()) ||
      evo.soap.assessment.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesRole = roleFilter === 'Todas' || evo.role === roleFilter;

    return matchesSearch && matchesRole;
  });

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 bg-white border border-zinc-200/90 rounded-2xl shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <FileText className="w-5 h-5 text-teal-600" />
            <h1 className="text-lg font-black text-zinc-900 uppercase tracking-wider">
              Prontuário Multiprofissional Eletrônico
            </h1>
          </div>
          <p className="text-xs text-zinc-500 font-medium">
            Registro cronológico de evoluções clínicas padronizadas pelo método SOAP
          </p>
        </div>

        <button
          onClick={onOpenNewEvolution}
          className="py-2.5 px-4 bg-teal-600 hover:bg-teal-700 text-white font-extrabold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Lançar Nova Evolução SOAP</span>
        </button>
      </div>

      {/* Search & Role Filters */}
      <div className="p-4 bg-white border border-zinc-200/90 rounded-2xl shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar por residente, autor ou conduta..."
            className="w-full bg-zinc-50 text-zinc-900 text-xs pl-9 pr-3 py-2 rounded-xl border border-zinc-200 focus:outline-none focus:border-teal-500"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto text-xs no-scrollbar">
          <span className="text-zinc-500 font-semibold mr-1 shrink-0">Especialidade:</span>
          {['Todas', 'Psiquiatra', 'Enfermeiro RT', 'Técnico de Enfermagem', 'Psicólogo', 'Terapeuta Ocupacional'].map((r) => (
            <button
              key={r}
              onClick={() => setRoleFilter(r)}
              className={`px-3 py-1.5 rounded-xl font-bold transition-colors shrink-0 ${
                roleFilter === r
                  ? 'bg-teal-50 text-teal-800 border border-teal-200/80 shadow-2xs'
                  : 'bg-zinc-50 text-zinc-600 hover:text-zinc-900 border border-zinc-200'
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* Evolutions Feed */}
      {filteredEvolutions.length === 0 ? (
        <div className="p-8 bg-white rounded-2xl text-center border border-zinc-200 text-xs text-zinc-500 shadow-xs">
          Nenhuma evolução clínica registrada com os filtros informados.
        </div>
      ) : (
        <div className="space-y-4">
          {filteredEvolutions.map((evo) => (
            <div
              key={evo.id}
              className="p-5 bg-white border border-zinc-200/90 rounded-2xl shadow-xs space-y-3 hover:border-teal-300 transition-all"
            >
              {/* Card Header */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-zinc-100 pb-3 gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-zinc-900">{evo.residentName}</span>
                    <span className="text-xs font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded-md border border-teal-200">
                      {evo.room}
                    </span>
                  </div>
                  <p className="text-xs text-zinc-500 mt-0.5">
                    Profissional: <strong className="text-zinc-800">{evo.author}</strong> ({evo.role})
                  </p>
                </div>

                <div className="flex items-center gap-2 text-xs text-zinc-500">
                  <span className="text-[11px] bg-zinc-50 px-2.5 py-1 rounded-lg border border-zinc-200 font-medium">
                    {evo.date} às {evo.time}
                  </span>
                  <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                    ✓ Assinado
                  </span>
                </div>
              </div>

              {/* Vitals Ribbon if present */}
              {evo.vitals && (evo.vitals.bp || evo.vitals.hr || evo.vitals.temp) && (
                <div className="flex items-center gap-4 p-2.5 bg-zinc-50 rounded-xl border border-zinc-200 text-[11px] text-zinc-700">
                  <Activity className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                  {evo.vitals.bp && <span>PA: <strong className="text-zinc-900">{evo.vitals.bp}</strong></span>}
                  {evo.vitals.hr && <span>FC: <strong className="text-zinc-900">{evo.vitals.hr} bpm</strong></span>}
                  {evo.vitals.temp && <span>Temp: <strong className="text-zinc-900">{evo.vitals.temp} °C</strong></span>}
                  {evo.vitals.spo2 && <span>SatO2: <strong className="text-zinc-900">{evo.vitals.spo2}%</strong></span>}
                </div>
              )}

              {/* SOAP Quadrants */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs pt-1">
                <div className="p-3 bg-zinc-50/70 rounded-xl border border-zinc-200/80">
                  <span className="text-[10px] font-bold text-teal-700 uppercase tracking-wider block mb-1">
                    S - Subjetivo (Relato / Queixas)
                  </span>
                  <p className="text-zinc-800 leading-relaxed">{evo.soap.subjective}</p>
                </div>

                <div className="p-3 bg-zinc-50/70 rounded-xl border border-zinc-200/80">
                  <span className="text-[10px] font-bold text-teal-700 uppercase tracking-wider block mb-1">
                    O - Objetivo (Observação / Exame)
                  </span>
                  <p className="text-zinc-800 leading-relaxed">{evo.soap.objective}</p>
                </div>

                <div className="p-3 bg-zinc-50/70 rounded-xl border border-zinc-200/80">
                  <span className="text-[10px] font-bold text-teal-700 uppercase tracking-wider block mb-1">
                    A - Avaliação (Análise Clínica)
                  </span>
                  <p className="text-zinc-800 leading-relaxed">{evo.soap.assessment}</p>
                </div>

                <div className="p-3 bg-zinc-50/70 rounded-xl border border-zinc-200/80">
                  <span className="text-[10px] font-bold text-teal-700 uppercase tracking-wider block mb-1">
                    P - Plano (Conduta & Encaminhamentos)
                  </span>
                  <p className="text-zinc-800 leading-relaxed">{evo.soap.plan}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
