import React, { useState } from 'react';
import { 
  X, 
  Syringe, 
  CheckCircle2, 
  RotateCw, 
  ShieldCheck, 
  AlertCircle 
} from 'lucide-react';
import { 
  DiabetesCareProfile, 
  InjectionSite, 
  InsulinAdministration 
} from '../domain/diabetes/types';
import { GlycemicDomainService } from '../domain/diabetes/domainServices';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  profiles: DiabetesCareProfile[];
  initialResidentId?: string;
  onSaved: (log: InsulinAdministration) => void;
}

export const InsulinAdministrationModal: React.FC<Props> = ({
  isOpen,
  onClose,
  profiles,
  initialResidentId,
  onSaved
}) => {
  const [residentId, setResidentId] = useState<string>(initialResidentId || 'res-3');
  const currentProfile = profiles.find(p => p.residentId === residentId) || profiles[1] || profiles[0];
  
  const rotationAdvice = currentProfile ? GlycemicDomainService.recommendNextInjectionSite(currentProfile.recentInsulinLogs) : null;

  const [insulinType, setInsulinType] = useState<'NPH (Ação Intermediária)' | 'Regular (Ação Rápida)'>('NPH (Ação Intermediária)');
  const [units, setUnits] = useState<number>(14);
  const [site, setSite] = useState<InjectionSite>(rotationAdvice?.recommendedSite || 'Abdômen Inferior Direito');
  const [bloodGlucoseAtTime, setBloodGlucoseAtTime] = useState<number>(130);
  const [rotationVerified, setRotationVerified] = useState<boolean>(true);
  const [administeredBy, setAdministeredBy] = useState<string>('Enf. Bruno Costa');
  const [notes, setNotes] = useState<string>('Pele íntegra, prega subcutânea adequada sem nódulos de lipodistrofia.');

  if (!isOpen) return null;

  const allSites: InjectionSite[] = [
    'Abdômen Superior Direito',
    'Abdômen Superior Esquerdo',
    'Abdômen Inferior Direito',
    'Abdômen Inferior Esquerdo',
    'Coxa Anterior Direita',
    'Coxa Anterior Esquerda',
    'Braço Posterior Direito',
    'Braço Posterior Esquerdo'
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!residentId || units <= 0) return;

    const newLog: InsulinAdministration = {
      id: `ins-${Date.now()}`,
      residentId,
      timestamp: new Date().toISOString(),
      insulinType,
      units,
      site,
      administeredBy,
      rotationVerified,
      bloodGlucoseAtTime,
      notes: notes.trim() || undefined
    };

    onSaved(newLog);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div 
        className="relative w-full max-w-xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[90vh]"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/10 rounded-xl">
              <Syringe className="w-5 h-5 text-blue-200" />
            </div>
            <div>
              <h2 className="text-lg font-bold">Administração de Insulina Subcutânea</h2>
              <p className="text-xs text-blue-100">Rodízio Anatômico & Prevenção de Lipodistrofia</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 text-white/80 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* Resident Selection */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
              Residente em Insulinoterapia
            </label>
            <div className="flex gap-3">
              {profiles.map(p => {
                const isSelected = p.residentId === residentId;
                return (
                  <button
                    type="button"
                    key={p.residentId}
                    onClick={() => {
                      setResidentId(p.residentId);
                      if (p.residentId === 'res-3') {
                        setUnits(14);
                      }
                    }}
                    className={`flex-1 flex items-center gap-3 p-3 rounded-xl border text-left transition-all ${
                      isSelected
                        ? 'border-blue-600 bg-blue-50/70 dark:bg-blue-950/30 text-blue-900 dark:text-blue-200 ring-2 ring-blue-500/20 shadow-sm'
                        : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <img 
                      src={p.photo} 
                      alt={p.residentName} 
                      className="w-10 h-10 rounded-full object-cover border border-slate-300 dark:border-slate-700" 
                    />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold truncate">{p.residentName}</p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">{p.treatmentType}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Insulin Type and Dose */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                Tipo de Insulina
              </label>
              <select
                value={insulinType}
                onChange={e => setInsulinType(e.target.value as any)}
                className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-blue-500 outline-none"
              >
                <option value="NPH (Ação Intermediária)">NPH (Ação Intermediária - Basal)</option>
                <option value="Regular (Ação Rápida)">Regular (Ação Rápida - Bolus/Correção)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                Dose Administrada (UI)
              </label>
              <div className="relative">
                <input
                  type="number"
                  min={1}
                  max={60}
                  required
                  value={units}
                  onChange={e => setUnits(parseInt(e.target.value) || 0)}
                  className="w-full text-xl font-black px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                  UI
                </span>
              </div>
            </div>
          </div>

          {/* Recommended Injection Site Banner */}
          {rotationAdvice && (
            <div className="p-3 bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 rounded-xl flex items-start gap-2.5 text-indigo-900 dark:text-indigo-200">
              <RotateCw className="w-4 h-4 text-indigo-600 dark:text-indigo-400 flex-shrink-0 mt-0.5 animate-spin-slow" />
              <div className="text-xs">
                <p className="font-bold">Recomendação de Rodízio:</p>
                <p className="text-[11px] leading-relaxed mt-0.5">{rotationAdvice.rationale}</p>
              </div>
            </div>
          )}

          {/* Injection Site Picker */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
              Sítio Anatômico de Aplicação
            </label>
            <div className="grid grid-cols-2 gap-2">
              {allSites.map(s => {
                const isSelected = site === s;
                const isRecommended = rotationAdvice?.recommendedSite === s;
                return (
                  <button
                    type="button"
                    key={s}
                    onClick={() => setSite(s)}
                    className={`px-3 py-2 rounded-lg text-xs font-medium border text-left flex items-center justify-between transition-all ${
                      isSelected
                        ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                        : isRecommended
                        ? 'bg-indigo-50/70 border-indigo-300 text-indigo-900 dark:bg-indigo-950/30 dark:text-indigo-300'
                        : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    <span className="truncate">{s}</span>
                    {isRecommended && !isSelected && (
                      <span className="text-[9px] font-bold px-1.5 py-0.5 bg-indigo-200 text-indigo-800 rounded">
                        Sugerido
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Glucose and Safety Check */}
          <div className="grid grid-cols-2 gap-3 items-center">
            <div>
              <label className="block text-xs text-slate-500 mb-1">Glicemia no Horário (mg/dL)</label>
              <input
                type="number"
                value={bloodGlucoseAtTime}
                onChange={e => setBloodGlucoseAtTime(parseInt(e.target.value) || 0)}
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg outline-none"
              />
            </div>
            <div className="pt-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rotationVerified}
                  onChange={e => setRotationVerified(e.target.checked)}
                  className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4"
                />
                <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
                  Tecido sem fibrose ou lipodistrofia
                </span>
              </label>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs text-slate-500 mb-1">Observações da Aplicação</label>
            <input
              type="text"
              value={notes}
              onChange={e => setNotes(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg outline-none"
              placeholder="Ex: Tolerou bem a injeção, sem sangramento..."
            />
          </div>
        </form>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-lg shadow-blue-600/20"
          >
            <CheckCircle2 className="w-4 h-4" />
            Registrar Aplicação no MAR
          </button>
        </div>
      </div>
    </div>
  );
};
