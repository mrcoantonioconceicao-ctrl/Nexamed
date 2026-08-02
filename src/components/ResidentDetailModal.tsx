import React, { useState } from 'react';
import { 
  X, 
  User, 
  ShieldAlert, 
  Pill, 
  FileText, 
  Phone, 
  Calendar, 
  CheckCircle2, 
  Plus, 
  Sparkles,
  Heart,
  Activity,
  AlertTriangle,
  Award
} from 'lucide-react';
import { Resident, ClinicalEvolution, MedicationMAR } from '../types';

interface ResidentDetailModalProps {
  resident: Resident | null;
  isOpen: boolean;
  onClose: () => void;
  evolutions: ClinicalEvolution[];
  medications: MedicationMAR[];
  onOpenNewEvolution: (residentId: string) => void;
  onUpdateDoseStatus: (medicationId: string, doseId: string, status: 'Ministrado' | 'Recusado' | 'Suspenso') => void;
}

export const ResidentDetailModal: React.FC<ResidentDetailModalProps> = ({
  resident,
  isOpen,
  onClose,
  evolutions,
  medications,
  onOpenNewEvolution,
  onUpdateDoseStatus,
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'soap' | 'meds' | 'contacts'>('overview');

  if (!isOpen || !resident) return null;

  const residentEvolutions = evolutions.filter(e => e.residentId === resident.id);
  const residentMeds = medications.filter(m => m.residentId === resident.id);

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <div className="w-full max-w-4xl bg-white border border-zinc-200 rounded-2xl shadow-2xl overflow-hidden my-4 max-h-[92vh] flex flex-col">
        {/* Header Profile Banner */}
        <div className="p-4 sm:p-5 bg-zinc-50 border-b border-zinc-200 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 text-zinc-400 hover:text-zinc-700 rounded-lg hover:bg-zinc-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-3 sm:space-y-0 sm:space-x-4">
            <img
              src={resident.photo}
              alt={resident.name}
              className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover border-2 border-teal-500/50 shadow-xs shrink-0"
            />
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <h2 className="text-base sm:text-lg font-bold text-zinc-900">{resident.name}</h2>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-zinc-100 text-teal-800 border border-zinc-200">
                  {resident.room}
                </span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md uppercase border ${
                  resident.riskScore === 'Crítico' ? 'bg-rose-50 text-rose-800 border-rose-200' :
                  resident.riskScore === 'Alto' ? 'bg-orange-50 text-orange-800 border-orange-200' :
                  resident.riskScore === 'Médio' ? 'bg-amber-50 text-amber-800 border-amber-200' :
                  'bg-emerald-50 text-emerald-800 border-emerald-200'
                }`}>
                  Risco {resident.riskScore}
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-purple-50 text-purple-800 border border-purple-200">
                  {resident.dependenceLevel}
                </span>
              </div>
              <p className="text-xs text-zinc-600 font-medium mb-1">
                Diagnóstico Principal: <span className="text-teal-700 font-bold">{resident.primaryDiagnosis}</span>
              </p>
              <div className="flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-zinc-500 font-medium">
                <span>Idade: <strong className="text-zinc-800">{resident.age} anos</strong></span>
                <span>Admissão: <strong className="text-zinc-800">{resident.admissionsDate}</strong></span>
                <span>CPF: <strong className="text-zinc-800">{resident.cpf}</strong></span>
              </div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-1 mt-5 border-b border-zinc-200 text-xs font-bold overflow-x-auto no-scrollbar">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-3.5 py-2 border-b-2 transition-colors flex items-center gap-1.5 whitespace-nowrap ${
                activeTab === 'overview'
                  ? 'border-teal-600 text-teal-700 font-black'
                  : 'border-transparent text-zinc-500 hover:text-zinc-800'
              }`}
            >
              <User className="w-3.5 h-3.5" /> Ficha & PTS
            </button>
            <button
              onClick={() => setActiveTab('soap')}
              className={`px-3.5 py-2 border-b-2 transition-colors flex items-center gap-1.5 whitespace-nowrap ${
                activeTab === 'soap'
                  ? 'border-teal-600 text-teal-700 font-black'
                  : 'border-transparent text-zinc-500 hover:text-zinc-800'
              }`}
            >
              <FileText className="w-3.5 h-3.5" /> Prontuário SOAP ({residentEvolutions.length})
            </button>
            <button
              onClick={() => setActiveTab('meds')}
              className={`px-3.5 py-2 border-b-2 transition-colors flex items-center gap-1.5 whitespace-nowrap ${
                activeTab === 'meds'
                  ? 'border-teal-600 text-teal-700 font-black'
                  : 'border-transparent text-zinc-500 hover:text-zinc-800'
              }`}
            >
              <Pill className="w-3.5 h-3.5" /> Aprazamento MAR ({residentMeds.length})
            </button>
            <button
              onClick={() => setActiveTab('contacts')}
              className={`px-3.5 py-2 border-b-2 transition-colors flex items-center gap-1.5 whitespace-nowrap ${
                activeTab === 'contacts'
                  ? 'border-teal-600 text-teal-700 font-black'
                  : 'border-transparent text-zinc-500 hover:text-zinc-800'
              }`}
            >
              <Phone className="w-3.5 h-3.5" /> Família & Equipe
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-5 overflow-y-auto flex-1 space-y-5">
          {activeTab === 'overview' && (
            <div className="space-y-4">
              {/* Allergy Alert Banner */}
              {resident.allergies.length > 0 && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-3">
                  <ShieldAlert className="w-5 h-5 text-rose-600 shrink-0" />
                  <div>
                    <p className="text-xs font-bold text-rose-900 uppercase">ALERTAS DE ALERGIA CADASTRADOS</p>
                    <p className="text-xs text-rose-700 font-medium">{resident.allergies.join(', ')}</p>
                  </div>
                </div>
              )}

              {/* PTS - Plano Terapêutico Singular */}
              <div className="p-4 bg-zinc-50/70 border border-zinc-200 rounded-2xl space-y-3">
                <div className="flex items-center justify-between border-b border-zinc-200/80 pb-2">
                  <div className="flex items-center gap-2">
                    <Award className="w-4 h-4 text-teal-600" />
                    <h3 className="text-xs font-bold text-zinc-900 uppercase tracking-wider">
                      Plano Terapêutico Singular (PTS)
                    </h3>
                  </div>
                  <span className="text-[11px] text-teal-800 font-bold bg-teal-50 px-2 py-0.5 rounded-md border border-teal-200">
                    Progresso: {resident.singularTherapeuticPlan.progressPercentage}%
                  </span>
                </div>

                <p className="text-xs text-zinc-800 leading-relaxed font-medium">
                  <strong>Foco Principal:</strong> {resident.singularTherapeuticPlan.mainFocus}
                </p>

                <div>
                  <span className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider block mb-1.5">
                    Metas Terapêuticas em Andamento:
                  </span>
                  <ul className="space-y-1.5">
                    {resident.singularTherapeuticPlan.goals.map((goal, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-xs text-zinc-800 font-medium">
                        <CheckCircle2 className="w-3.5 h-3.5 text-teal-600 shrink-0 mt-0.5" />
                        <span>{goal}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <p className="text-[10px] text-zinc-400 font-medium pt-1">
                  Revisão do PTS agendada para: {resident.singularTherapeuticPlan.reviewDate}
                </p>
              </div>

              {/* Key Therapists */}
              <div className="p-4 bg-zinc-50/70 border border-zinc-200 rounded-2xl">
                <h3 className="text-xs font-bold text-zinc-900 uppercase tracking-wider mb-2.5">
                  Equipe Multiprofissional Referência
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                  {resident.keyTherapists.map((t, i) => (
                    <div key={i} className="p-2.5 bg-white rounded-xl border border-zinc-200 shadow-2xs">
                      <p className="text-[10px] text-teal-700 font-bold uppercase">{t.role}</p>
                      <p className="text-xs font-bold text-zinc-900">{t.name}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'soap' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-zinc-900 uppercase tracking-wider">
                  Histórico de Evoluções Clínicas
                </h3>
                <button
                  onClick={() => onOpenNewEvolution(resident.id)}
                  className="py-1.5 px-3 bg-teal-600 hover:bg-teal-700 text-white font-extrabold text-xs rounded-xl flex items-center gap-1.5 shadow-2xs"
                >
                  <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                  <span>Nova Evolução SOAP</span>
                </button>
              </div>

              {residentEvolutions.length === 0 ? (
                <p className="p-6 text-xs text-zinc-500 font-medium text-center bg-zinc-50 rounded-xl border border-zinc-200">
                  Nenhuma evolução registrada recentemente para este residente.
                </p>
              ) : (
                <div className="space-y-3">
                  {residentEvolutions.map((evo) => (
                    <div key={evo.id} className="p-4 bg-zinc-50/70 border border-zinc-200 rounded-2xl space-y-2">
                      <div className="flex items-center justify-between border-b border-zinc-200 pb-2">
                        <div>
                          <span className="text-xs font-bold text-teal-800">{evo.author}</span>
                          <span className="text-[11px] text-zinc-500 font-medium ml-2">({evo.role})</span>
                        </div>
                        <span className="text-[10px] text-zinc-400 font-medium">{evo.date} às {evo.time}</span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs pt-1">
                        <div className="p-2.5 bg-white rounded-lg border border-zinc-200/80">
                          <strong className="text-teal-700 block text-[10px] uppercase font-bold">S - Subjetivo</strong>
                          <span className="text-zinc-800 font-medium">{evo.soap.subjective}</span>
                        </div>
                        <div className="p-2.5 bg-white rounded-lg border border-zinc-200/80">
                          <strong className="text-teal-700 block text-[10px] uppercase font-bold">O - Objetivo</strong>
                          <span className="text-zinc-800 font-medium">{evo.soap.objective}</span>
                        </div>
                        <div className="p-2.5 bg-white rounded-lg border border-zinc-200/80">
                          <strong className="text-teal-700 block text-[10px] uppercase font-bold">A - Avaliação</strong>
                          <span className="text-zinc-800 font-medium">{evo.soap.assessment}</span>
                        </div>
                        <div className="p-2.5 bg-white rounded-lg border border-zinc-200/80">
                          <strong className="text-teal-700 block text-[10px] uppercase font-bold">P - Plano</strong>
                          <span className="text-zinc-800 font-medium">{evo.soap.plan}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'meds' && (
            <div className="space-y-3">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-950 font-bold">
                <div className="flex items-center gap-2">
                  <span className="p-1 bg-amber-200/80 rounded-md text-amber-900 text-[10px]">12/12h</span>
                  <span>Aprazamento Padronizado: Todos os residentes tomam medicação às 08:00h e 20:00h.</span>
                </div>
                <span className="text-[10px] text-amber-800 font-medium">Intervalo Fixo: 12 Horas</span>
              </div>

              <h3 className="text-xs font-bold text-zinc-900 uppercase tracking-wider mb-2">
                Grade de Aprazamento de Medicamentos (MAR)
              </h3>
              {residentMeds.length === 0 ? (
                <p className="p-6 text-xs text-zinc-500 font-medium text-center bg-zinc-50 rounded-xl border border-zinc-200">
                  Sem prescrições medicamentosas registradas no momento.
                </p>
              ) : (
                <div className="space-y-3">
                  {residentMeds.map((med) => (
                    <div key={med.id} className="p-4 bg-zinc-50/70 border border-zinc-200 rounded-2xl space-y-2">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="text-xs font-bold text-zinc-900">{med.medicationName} ({med.dosage})</h4>
                          <p className="text-[11px] text-zinc-500 font-medium">Via: {med.route} • Frequência: {med.frequency} • Prescrito por: {med.prescribedBy}</p>
                        </div>
                        {med.isControlled && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 border border-amber-200">
                            Psicotrópico
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2 pt-2 border-t border-zinc-200/80">
                        <span className="text-[10px] font-bold text-zinc-500">Horários de Dose:</span>
                        {med.scheduledDoses.map((dose) => (
                          <div key={dose.id} className="flex items-center gap-1.5">
                            <span className="text-xs font-bold text-zinc-800 bg-white px-2 py-1 rounded-md border border-zinc-200">
                              {dose.time}
                            </span>
                            {dose.status === 'Ministrado' ? (
                              <span className="text-[10px] font-bold px-2 py-1 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200">
                                ✓ Ministrado
                              </span>
                            ) : (
                              <button
                                onClick={() => onUpdateDoseStatus(med.id, dose.id, 'Ministrado')}
                                className="text-[10px] font-bold px-2 py-1 rounded-md bg-teal-600 hover:bg-teal-700 text-white transition-colors shadow-2xs"
                              >
                                Dar Check-off
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'contacts' && (
            <div className="space-y-4">
              <div className="p-4 bg-zinc-50/70 border border-zinc-200 rounded-2xl space-y-2">
                <h3 className="text-xs font-bold text-teal-800 uppercase tracking-wider mb-1">
                  Contato de Emergência / Família Responsável
                </h3>
                <p className="text-sm font-bold text-zinc-900">{resident.emergencyContact.name}</p>
                <p className="text-xs text-zinc-600 font-medium">Vínculo: {resident.emergencyContact.relationship}</p>
                <div className="pt-2 flex items-center gap-2">
                  <a
                    href={`tel:${resident.emergencyContact.phone}`}
                    className="py-1.5 px-3 bg-teal-600 hover:bg-teal-700 text-white font-extrabold text-xs rounded-xl flex items-center gap-1.5 w-fit shadow-2xs"
                  >
                    <Phone className="w-3.5 h-3.5 stroke-[2.5]" />
                    <span>Ligar: {resident.emergencyContact.phone}</span>
                  </a>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
