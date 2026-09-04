import React, { useState } from 'react';
import { 
  X, 
  Droplet, 
  AlertTriangle, 
  CheckCircle2, 
  HeartPulse, 
  Activity, 
  Clock, 
  User, 
  ShieldAlert, 
  Sparkles 
} from 'lucide-react';
import { 
  GlycemicContext, 
  GlycemicMeasurement, 
  DiabetesCareProfile 
} from '../domain/diabetes/types';
import { GlycemicDomainService } from '../domain/diabetes/domainServices';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  profiles: DiabetesCareProfile[];
  initialResidentId?: string;
  onSaved: (measurement: GlycemicMeasurement) => void;
}

export const GlycemicMeasurementModal: React.FC<Props> = ({
  isOpen,
  onClose,
  profiles,
  initialResidentId,
  onSaved
}) => {
  const [residentId, setResidentId] = useState<string>(initialResidentId || profiles[0]?.residentId || 'res-1');
  const [value, setValue] = useState<number>(110);
  const [context, setContext] = useState<GlycemicContext>('Jejum');
  const [measuredBy, setMeasuredBy] = useState<string>('Enf. Bruno Costa');
  const [measuredRole, setMeasuredRole] = useState<string>('Enfermeiro RT');
  const [notes, setNotes] = useState<string>('');
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>(['Assintomática']);
  const [actionTaken, setActionTaken] = useState<string>('Parâmetro normal. Dieta liberada.');

  if (!isOpen) return null;

  const currentProfile = profiles.find(p => p.residentId === residentId) || profiles[0];
  const classification = GlycemicDomainService.classifyGlycemia(value);
  const immediateEvaluation = currentProfile ? GlycemicDomainService.determineImmediateAction(value, currentProfile) : null;

  const commonSymptoms = [
    'Assintomática',
    'Sudorese Fria',
    'Tremores de Extremidades',
    'Palidez Cutânea',
    'Sonolência / Letargia',
    'Confusão Mental Súbita',
    'Fome Intensa',
    'Cefaleia / Tontura',
    'Agitação Incomum'
  ];

  const handleSymptomToggle = (symptom: string) => {
    if (symptom === 'Assintomática') {
      setSelectedSymptoms(['Assintomática']);
      return;
    }
    const filtered = selectedSymptoms.filter(s => s !== 'Assintomática');
    if (filtered.includes(symptom)) {
      const next = filtered.filter(s => s !== symptom);
      setSelectedSymptoms(next.length > 0 ? next : ['Assintomática']);
    } else {
      setSelectedSymptoms([...filtered, symptom]);
    }
  };

  const handleValueChange = (newVal: number) => {
    setValue(newVal);
    if (currentProfile) {
      const evalAction = GlycemicDomainService.determineImmediateAction(newVal, currentProfile);
      setActionTaken(evalAction.actionText);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!residentId || !value) return;

    const newMeasurement: GlycemicMeasurement = {
      id: `meas-${Date.now()}`,
      residentId,
      residentName: currentProfile?.name || 'Residente',
      timestamp: new Date().toISOString(),
      value,
      context,
      classification,
      measuredBy,
      measuredRole,
      symptoms: selectedSymptoms,
      actionTaken,
      rescueCarbsGiven: value < 70,
      notes: notes.trim() || undefined
    };

    onSaved(newMeasurement);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div 
        className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[90vh]"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-gradient-to-r from-emerald-600 to-teal-700 text-white">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/10 rounded-xl">
              <Droplet className="w-5 h-5 text-emerald-200 animate-pulse" />
            </div>
            <div>
              <h2 className="text-lg font-bold">Registrar Glicemia Capilar (HGT)</h2>
              <p className="text-xs text-emerald-100">Avaliação Imediata & Protocolo de Segurança SBD / SRT</p>
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
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Resident Picker */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
              Selecione a Residente
            </label>
            <div className="grid grid-cols-2 gap-3">
              {profiles.map(p => {
                const isSelected = p.residentId === residentId;
                return (
                  <button
                    type="button"
                    key={p.residentId}
                    onClick={() => {
                      setResidentId(p.residentId);
                      const evalAction = GlycemicDomainService.determineImmediateAction(value, p);
                      setActionTaken(evalAction.actionText);
                    }}
                    className={`flex items-center gap-3 p-3 rounded-xl border text-left transition-all ${
                      isSelected
                        ? 'border-emerald-600 bg-emerald-50/70 dark:bg-emerald-950/30 text-emerald-900 dark:text-emerald-200 ring-2 ring-emerald-500/20 shadow-sm'
                        : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 text-slate-700 dark:text-slate-300 hover:bg-slate-100'
                    }`}
                  >
                    <img 
                      src={p.photo} 
                      alt={p.residentName} 
                      className="w-11 h-11 rounded-full object-cover border border-slate-300 dark:border-slate-700" 
                    />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-bold truncate">{p.residentName}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{p.treatmentType}</p>
                      <span className="inline-block mt-0.5 px-2 py-0.5 text-[10px] font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300 rounded">
                        HbA1c: {p.currentHbA1c}%
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Value and Context Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                Valor Aferido (mg/dL)
              </label>
              <div className="relative">
                <input
                  type="number"
                  min={20}
                  max={600}
                  required
                  value={value}
                  onChange={e => handleValueChange(parseInt(e.target.value) || 0)}
                  className="w-full text-3xl font-black px-4 py-3 bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all pr-16"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                  mg/dL
                </span>
              </div>

              {/* Classification Tag */}
              <div className="mt-2 flex items-center gap-2">
                <span className="text-xs text-slate-500">Classificação:</span>
                <span className={`inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full ${
                  value < 54 
                    ? 'bg-red-100 text-red-700 dark:bg-red-950/60 dark:text-red-300 ring-1 ring-red-400' 
                    : value < 70
                    ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 ring-1 ring-amber-400'
                    : value <= 180
                    ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 ring-1 ring-emerald-400'
                    : value <= 250
                    ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300'
                    : 'bg-purple-100 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 ring-1 ring-purple-400'
                }`}>
                  {classification}
                </span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                Momento da Aferição
              </label>
              <select
                value={context}
                onChange={e => setContext(e.target.value as GlycemicContext)}
                className="w-full px-3 py-3 bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium focus:ring-2 focus:ring-emerald-500 outline-none"
              >
                <option value="Jejum">Jejum Matinal</option>
                <option value="Pré-Almoço">Pré-Almoço</option>
                <option value="Pós-Prandial (2h)">Pós-Prandial (2h após refeição)</option>
                <option value="Pré-Jantar">Pré-Jantar</option>
                <option value="Ceia / Dormir">Ceia / Antes de Dormir</option>
                <option value="Madrugada">Madrugada (03:00)</option>
                <option value="Sintomático (Suspeita de Hipo/Hiper)">Sintomático (Suspeita de Hipo/Hiper)</option>
              </select>

              {/* Target info reminder */}
              {currentProfile && (
                <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                  🎯 Meta de {currentProfile.residentName.split(' ')[0]}: Jejum {currentProfile.glycemicTarget.fastingMin}-{currentProfile.glycemicTarget.fastingMax} mg/dL | Pós-prandial até {currentProfile.glycemicTarget.postPrandialMax} mg/dL
                </p>
              )}
            </div>
          </div>

          {/* Immediate Action Alert Banner */}
          {immediateEvaluation && (
            <div className={`p-4 rounded-xl border flex items-start gap-3 ${
              immediateEvaluation.level === 'emergency'
                ? 'bg-red-50 border-red-200 text-red-900 dark:bg-red-950/40 dark:border-red-800 dark:text-red-200'
                : immediateEvaluation.level === 'warning'
                ? 'bg-amber-50 border-amber-200 text-amber-900 dark:bg-amber-950/40 dark:border-amber-800 dark:text-amber-200'
                : 'bg-emerald-50 border-emerald-200 text-emerald-900 dark:bg-emerald-950/40 dark:border-emerald-800 dark:text-emerald-200'
            }`}>
              {immediateEvaluation.level === 'emergency' ? (
                <ShieldAlert className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5 animate-bounce" />
              ) : immediateEvaluation.level === 'warning' ? (
                <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              ) : (
                <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
              )}
              <div className="flex-1">
                <p className="text-sm font-bold">{immediateEvaluation.title}</p>
                <p className="text-xs mt-1 leading-relaxed">{immediateEvaluation.actionText}</p>
              </div>
            </div>
          )}

          {/* Symptoms Checklist */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
              Sinais e Sintomas Observados
            </label>
            <div className="flex flex-wrap gap-2">
              {commonSymptoms.map(s => {
                const isSelected = selectedSymptoms.includes(s);
                return (
                  <button
                    type="button"
                    key={s}
                    onClick={() => handleSymptomToggle(s)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                      isSelected
                        ? 'bg-slate-900 text-white dark:bg-emerald-600 dark:text-white border-transparent'
                        : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    {s}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Action Taken */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
              Conduta Adotada pela Enfermagem / Cuidador
            </label>
            <textarea
              rows={2}
              value={actionTaken}
              onChange={e => setActionTaken(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 outline-none"
              placeholder="Ex: Administrado 15g de carboidrato rápido, aferição após 15 min..."
            />
          </div>

          {/* Professional Signature */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            <div>
              <label className="block text-xs text-slate-500 mb-1">Profissional Responsável</label>
              <input
                type="text"
                value={measuredBy}
                onChange={e => setMeasuredBy(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg outline-none"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-500 mb-1">Função / Categoria</label>
              <input
                type="text"
                value={measuredRole}
                onChange={e => setMeasuredRole(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg outline-none"
              />
            </div>
          </div>
        </form>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg transition-colors"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-lg shadow-emerald-600/20 transition-all"
          >
            <CheckCircle2 className="w-4 h-4" />
            Salvar Registro de HGT
          </button>
        </div>
      </div>
    </div>
  );
};
