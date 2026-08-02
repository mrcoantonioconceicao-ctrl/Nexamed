import React, { useState } from 'react';
import { 
  Pill, 
  Search, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  ShieldAlert, 
  Package, 
  XCircle,
  Filter
} from 'lucide-react';
import { MedicationMAR, DoseStatus } from '../types';

interface MedicacaoViewProps {
  medications: MedicationMAR[];
  onUpdateDoseStatus: (medicationId: string, doseId: string, status: DoseStatus) => void;
}

export const MedicacaoView: React.FC<MedicacaoViewProps> = ({
  medications,
  onUpdateDoseStatus,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'Todos' | 'Pendente' | 'Ministrado' | 'Atrasado'>('Todos');

  const filteredMeds = medications.filter(m => {
    const matchesSearch = 
      m.residentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.medicationName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.room.toLowerCase().includes(searchQuery.toLowerCase());

    if (statusFilter === 'Todos') return matchesSearch;
    const hasDoseWithStatus = m.scheduledDoses.some(d => d.status === statusFilter);
    return matchesSearch && hasDoseWithStatus;
  });

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 bg-white border border-zinc-200/90 rounded-2xl shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Pill className="w-5 h-5 text-amber-600" />
            <h1 className="text-lg font-black text-zinc-900 uppercase tracking-wider">
              Aprazamento Diário de Medicação (MAR)
            </h1>
          </div>
          <p className="text-xs text-zinc-500 font-medium">
            Controle seguro de administração de doses, checagem de psicotrópicos e monitoramento de estoque
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1.5 rounded-xl bg-teal-50 text-teal-800 border border-teal-200 font-extrabold text-xs flex items-center gap-1.5 shadow-2xs">
            <Package className="w-4 h-4 text-teal-600 animate-pulse" />
            <span>⚡ Baixa Automática de Estoque Ativa</span>
          </span>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="p-4 bg-white border border-zinc-200/90 rounded-2xl shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar por residente, medicamento ou leito..."
            className="w-full bg-zinc-50 text-zinc-900 text-xs pl-9 pr-3 py-2 rounded-xl border border-zinc-200 focus:outline-none focus:border-teal-500"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto text-xs no-scrollbar">
          <span className="text-zinc-500 font-semibold mr-1 shrink-0">Filtrar Status:</span>
          {(['Todos', 'Pendente', 'Ministrado', 'Atrasado'] as const).map(st => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-xl font-bold transition-colors shrink-0 ${
                statusFilter === st
                  ? 'bg-teal-50 text-teal-800 border border-teal-200/80 shadow-2xs'
                  : 'bg-zinc-50 text-zinc-600 hover:text-zinc-900 border border-zinc-200'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Medication List Cards */}
      <div className="space-y-4">
        {filteredMeds.map((med) => (
          <div
            key={med.id}
            className="p-5 bg-white border border-zinc-200/90 rounded-2xl shadow-xs space-y-3 hover:border-teal-300 transition-all"
          >
            {/* Top Bar */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-zinc-100 pb-3 gap-2">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-zinc-900">{med.residentName}</span>
                  <span className="text-xs font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded-md border border-teal-200">
                    {med.room}
                  </span>
                  {med.isControlled && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 border border-amber-200">
                      🔒 Psicotrópico (Portaria 344)
                    </span>
                  )}
                </div>
                <p className="text-xs text-zinc-800 font-bold mt-1">
                  {med.medicationName} — <span className="text-teal-700">{med.dosage}</span> ({med.route})
                </p>
                <p className="text-[11px] text-zinc-500 mt-0.5">
                  Frequência: {med.frequency} • Prescrito por: {med.prescribedBy}
                </p>
              </div>

              {/* Stock Warning */}
              <div className="flex items-center gap-2 text-xs">
                <div className={`px-2.5 py-1 rounded-xl font-bold flex items-center gap-1.5 ${
                  med.stockDosesRemaining < 10
                    ? 'bg-rose-50 text-rose-800 border border-rose-200'
                    : 'bg-zinc-50 text-zinc-600 border border-zinc-200'
                }`}>
                  <Package className="w-3.5 h-3.5" />
                  <span>Estoque: {med.stockDosesRemaining} doses</span>
                </div>
              </div>
            </div>

            {/* Allergy Warning if present */}
            {med.allergyWarning && (
              <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2 text-xs text-rose-800 font-medium">
                <ShieldAlert className="w-4 h-4 shrink-0 text-rose-600" />
                <span>{med.allergyWarning}</span>
              </div>
            )}

            {/* Scheduled Doses Bar */}
            <div className="pt-2">
              <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider block mb-2">
                Horários de Checagem no Turno:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {med.scheduledDoses.map((dose) => (
                  <div
                    key={dose.id}
                    className="p-3 bg-zinc-50/80 rounded-xl border border-zinc-200/80 flex items-center justify-between"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-black text-zinc-900">{dose.time}</span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border uppercase ${
                          dose.status === 'Ministrado' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' :
                          dose.status === 'Atrasado' ? 'bg-rose-50 text-rose-800 border-rose-200' :
                          dose.status === 'Recusado' ? 'bg-amber-50 text-amber-800 border-amber-200' :
                          'bg-zinc-100 text-zinc-700 border-zinc-200'
                        }`}>
                          {dose.status}
                        </span>
                      </div>
                      {dose.administeredBy && (
                        <p className="text-[10px] text-zinc-500 mt-0.5">
                          Checado por {dose.administeredBy} às {dose.administeredAt}
                        </p>
                      )}
                      {dose.notes && (
                        <p className="text-[10px] text-amber-700 font-semibold mt-0.5">{dose.notes}</p>
                      )}
                    </div>

                    {/* Action buttons */}
                    <div className="flex items-center gap-1">
                      {dose.status !== 'Ministrado' && (
                        <button
                          onClick={() => onUpdateDoseStatus(med.id, dose.id, 'Ministrado')}
                          className="py-1 px-2.5 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-xl shadow-2xs transition-colors flex items-center gap-1"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5 stroke-[2.5]" />
                          <span>Dar Dose</span>
                        </button>
                      )}
                      {dose.status === 'Pendente' && (
                        <button
                          onClick={() => onUpdateDoseStatus(med.id, dose.id, 'Recusado')}
                          className="py-1 px-2 bg-zinc-100 hover:bg-zinc-200 text-rose-700 font-bold text-xs rounded-xl border border-zinc-200"
                          title="Registrar Recusa do Residente"
                        >
                          Recusa
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
