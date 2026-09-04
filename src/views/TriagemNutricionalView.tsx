import React, { useState, useMemo } from 'react';
import { 
  Apple, 
  Sparkles, 
  Plus, 
  Search, 
  Filter, 
  Scale, 
  Flame, 
  Droplets, 
  AlertTriangle, 
  CheckCircle2, 
  TrendingDown, 
  TrendingUp, 
  Printer, 
  FileText, 
  ChevronRight,
  Info,
  Calendar,
  User,
  HeartPulse,
  UtensilsCrossed
} from 'lucide-react';
import { Resident, ClinicalEvolution, NutritionalScreening } from '../types';
import { giterStore } from '../utils/giterStore';
import { NutritionalScreeningModal } from '../components/NutritionalScreeningModal';

interface TriagemNutricionalViewProps {
  residents: Resident[];
  evolutions: ClinicalEvolution[];
  onOpenSOAPWithDraft?: (residentId: string, soapDraft: { subjective: string; objective: string; assessment: string; plan: string }) => void;
}

export const TriagemNutricionalView: React.FC<TriagemNutricionalViewProps> = ({
  residents,
  evolutions,
  onOpenSOAPWithDraft
}) => {
  // Screenings from store
  const [screenings, setScreenings] = useState<NutritionalScreening[]>(() => {
    return giterStore.getNutritionalScreenings();
  });

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [selectedScreening, setSelectedScreening] = useState<NutritionalScreening | null>(null);
  const [modalResidentId, setModalResidentId] = useState<string | undefined>(undefined);

  // Search and Filter State
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [riskFilter, setRiskFilter] = useState<string>('all');
  const [consistencyFilter, setConsistencyFilter] = useState<string>('all');

  // Reload screenings
  const refreshScreenings = () => {
    setScreenings(giterStore.getNutritionalScreenings());
  };

  // KPIs
  const totalScreened = screenings.length;

  const highRiskCount = useMemo(() => {
    return screenings.filter(s => s.aiAssessment?.nutritionalRisk?.includes('Alto Risco') || s.aiAssessment?.nutritionalRisk?.includes('Desnutrição')).length;
  }, [screenings]);

  const dysphagiaCount = useMemo(() => {
    return screenings.filter(s => s.clinicalContext?.swallowingIssues || s.clinicalContext?.dietConsistency === 'Pastosa').length;
  }, [screenings]);

  const avgCaloricAcceptance = useMemo(() => {
    if (screenings.length === 0) return 0;
    const sum = screenings.reduce((acc, s) => acc + (s.caloricIntake?.acceptancePercentage || 0), 0);
    return Math.round(sum / screenings.length);
  }, [screenings]);

  // Filtered screenings
  const filteredScreenings = useMemo(() => {
    return screenings.filter(s => {
      const matchesSearch = 
        s.residentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.room.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesRisk = 
        riskFilter === 'all' || 
        (s.aiAssessment?.nutritionalRisk && s.aiAssessment.nutritionalRisk.includes(riskFilter));

      const matchesConsistency = 
        consistencyFilter === 'all' || 
        s.clinicalContext.dietConsistency === consistencyFilter;

      return matchesSearch && matchesRisk && matchesConsistency;
    });
  }, [screenings, searchTerm, riskFilter, consistencyFilter]);

  // Handle open modal for new screening
  const handleOpenNewScreening = (residentId?: string) => {
    setSelectedScreening(null);
    setModalResidentId(residentId || (residents.length > 0 ? residents[0].id : undefined));
    setIsModalOpen(true);
  };

  // Handle open modal to edit or view
  const handleOpenScreeningDetails = (screening: NutritionalScreening) => {
    setSelectedScreening(screening);
    setModalResidentId(screening.residentId);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Top Banner & Title */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-teal-900 via-teal-800 to-emerald-900 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-96 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-teal-400/20 via-transparent to-transparent pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-3 py-1 rounded-full text-xs font-black bg-teal-500/30 text-teal-200 border border-teal-400/30 flex items-center gap-1.5 backdrop-blur-sm">
                <Sparkles className="w-3.5 h-3.5 text-teal-300" />
                Inteligência Nutricional Nexa & Gemini
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-white/10 text-teal-100">
                Diretrizes ESPEN & SBAN para SRT
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
              Triagem Nutricional & Ingestão Calórica
            </h1>
            <p className="text-teal-100/80 text-xs sm:text-sm mt-1 max-w-2xl leading-relaxed">
              Avaliação de peso, índice de massa corporal, acompanhamento de aceitação das 5 refeições diárias e prescrição dietética ajustada por IA para a Residência Terapêutica.
            </p>
          </div>

          <div className="flex items-center gap-2.5 self-start md:self-auto">
            <button
              onClick={() => handleOpenNewScreening()}
              className="px-5 py-3 rounded-xl bg-white text-teal-900 hover:bg-teal-50 active:scale-95 font-black text-xs sm:text-sm shadow-lg shadow-teal-950/40 flex items-center gap-2 transition-all"
            >
              <Plus className="w-4 h-4 text-teal-700" />
              <span>Nova Triagem Nutricional</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Card 1: Total Avaliados */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
              Moradores Triados
            </span>
            <span className="text-2xl font-black text-slate-900 dark:text-white mt-1 block">
              {totalScreened} <span className="text-xs font-semibold text-slate-400">/ {residents.length}</span>
            </span>
            <span className="text-[11px] text-teal-600 dark:text-teal-400 font-bold mt-0.5 block">
              Acompanhamento Ponderal Ativo
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-teal-50 dark:bg-teal-950/50 text-teal-600 dark:text-teal-400 flex items-center justify-center">
            <Scale className="w-6 h-6" />
          </div>
        </div>

        {/* Card 2: Alto Risco / Desnutrição */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
              Alto Risco Nutricional
            </span>
            <span className="text-2xl font-black text-rose-600 dark:text-rose-400 mt-1 block">
              {highRiskCount}
            </span>
            <span className="text-[11px] text-rose-600 dark:text-rose-400 font-bold mt-0.5 block">
              Requer suplementação / ajuste
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 flex items-center justify-center">
            <AlertTriangle className="w-6 h-6" />
          </div>
        </div>

        {/* Card 3: Aceitação Calórica Média */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
              Aceitação Calórica Média
            </span>
            <span className="text-2xl font-black text-slate-900 dark:text-white mt-1 block">
              {avgCaloricAcceptance}%
            </span>
            <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold mt-0.5 block">
              5 Refeições Monitoradas
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 flex items-center justify-center">
            <Flame className="w-6 h-6" />
          </div>
        </div>

        {/* Card 4: Disfagia & Dieta Pastosa */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
              Disfagia & Dieta Pastosa
            </span>
            <span className="text-2xl font-black text-slate-900 dark:text-white mt-1 block">
              {dysphagiaCount}
            </span>
            <span className="text-[11px] text-teal-600 dark:text-teal-400 font-bold mt-0.5 block">
              Alerta broncoaspiração / líquidos
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-teal-50 dark:bg-teal-950/50 text-teal-600 dark:text-teal-400 flex items-center justify-center">
            <UtensilsCrossed className="w-6 h-6" />
          </div>
        </div>

      </div>

      {/* Notice Banner: Importância no SRT */}
      <div className="p-4 rounded-xl bg-teal-50/80 dark:bg-teal-950/30 border border-teal-200/80 dark:border-teal-900/50 flex items-start gap-3 text-xs text-teal-900 dark:text-teal-200">
        <Info className="w-5 h-5 text-teal-600 dark:text-teal-400 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-bold">
            Protocolo de Vigilância Nutricional em Saúde Mental (SRT):
          </p>
          <p className="text-teal-800/90 dark:text-teal-300 leading-relaxed">
            Usuários com histórico de institucionalização prolongada e uso crônico de antipsicóticos apresentam elevado risco de constipação severa, síndrome metabólica e engasgos por lentificação do reflexo de deglutição. A triagem nutricional periódica com integração Gemini permite intervir preventivamente no cardápio da residência.
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por morador ou quarto..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs font-semibold bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-none"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Risk Filter */}
          <select
            value={riskFilter}
            onChange={(e) => setRiskFilter(e.target.value)}
            className="px-3 py-2 text-xs font-bold bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-none"
          >
            <option value="all">Todos os Riscos</option>
            <option value="Alto Risco">Alto Risco / Desnutrição</option>
            <option value="Moderado">Risco Moderado</option>
            <option value="Eutrofia">Eutrofia / Sem Risco</option>
            <option value="Obesidade">Risco Metabólico</option>
          </select>

          {/* Consistency Filter */}
          <select
            value={consistencyFilter}
            onChange={(e) => setConsistencyFilter(e.target.value)}
            className="px-3 py-2 text-xs font-bold bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-none"
          >
            <option value="all">Todas as Consistências</option>
            <option value="Geral / Livre">Geral / Livre</option>
            <option value="Branda">Branda</option>
            <option value="Pastosa">Pastosa</option>
            <option value="Líquida Completa">Líquida Completa</option>
          </select>
        </div>
      </div>

      {/* Screenings Cards List */}
      <div className="space-y-4">
        {filteredScreenings.map((screening) => {
          const resident = residents.find(r => r.id === screening.residentId);
          const isHighRisk = screening.aiAssessment?.nutritionalRisk?.includes('Alto Risco') || screening.aiAssessment?.nutritionalRisk?.includes('Desnutrição');
          const isModerateRisk = screening.aiAssessment?.nutritionalRisk?.includes('Moderado');
          const hasWeightDrop = (screening.weightChangePercent || 0) <= -5;

          return (
            <div 
              key={screening.id}
              className="p-5 rounded-2xl bg-white dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700/80 shadow-sm hover:shadow-md transition-all space-y-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-700/60 pb-3">
                <div className="flex items-center gap-3">
                  <img 
                    src={resident?.photo || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=120&auto=format&fit=crop&q=80'} 
                    alt={screening.residentName}
                    className="w-12 h-12 rounded-xl object-cover border-2 border-teal-500 shadow-sm shrink-0"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-black text-slate-900 dark:text-white">
                        {screening.residentName}
                      </h3>
                      <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold">
                        ({screening.room})
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      <span>Avaliado por: <strong>{screening.evaluatorName}</strong> ({screening.evaluatorRole})</span>
                      <span>•</span>
                      <span>Data: {new Date(screening.date).toLocaleDateString('pt-BR')}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-start sm:self-auto">
                  <span className={`px-3 py-1 rounded-full text-xs font-black ${
                    isHighRisk
                      ? 'bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300 border border-rose-300'
                      : isModerateRisk
                      ? 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-300'
                      : 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-300'
                  }`}>
                    {screening.aiAssessment?.nutritionalRisk || 'Risco Avaliado'}
                  </span>

                  <button
                    onClick={() => handleOpenScreeningDetails(screening)}
                    className="px-3 py-1.5 rounded-xl text-xs font-bold text-teal-700 dark:text-teal-300 bg-teal-50 dark:bg-teal-950/60 border border-teal-200 dark:border-teal-800 hover:bg-teal-100 transition-colors"
                  >
                    Ver Detalhes / Editar
                  </button>
                </div>
              </div>

              {/* Grid de Métricas Principais da Triagem */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                
                {/* Antropometria */}
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/70 border border-slate-100 dark:border-slate-800">
                  <span className="text-slate-400 font-semibold block mb-0.5">Peso & IMC</span>
                  <div className="flex items-baseline gap-1">
                    <span className="text-base font-black text-slate-900 dark:text-white">{screening.weight} kg</span>
                    <span className="text-xs font-bold text-teal-600">IMC {screening.bmi}</span>
                  </div>
                  <span className="text-[11px] text-slate-500 truncate block mt-0.5">
                    {screening.bmiClassification}
                  </span>
                </div>

                {/* Variação Ponderal */}
                <div className={`p-3 rounded-xl border ${
                  hasWeightDrop 
                    ? 'bg-rose-50/70 dark:bg-rose-950/30 border-rose-200 dark:border-rose-900/40 text-rose-900 dark:text-rose-200'
                    : 'bg-slate-50 dark:bg-slate-900/70 border-slate-100 dark:border-slate-800'
                }`}>
                  <span className="text-slate-400 font-semibold block mb-0.5">Variação Ponderal</span>
                  <div className="flex items-center gap-1 font-black text-sm">
                    {(screening.weightChangePercent || 0) < 0 ? (
                      <TrendingDown className="w-4 h-4 text-rose-600" />
                    ) : (
                      <TrendingUp className="w-4 h-4 text-emerald-600" />
                    )}
                    <span>{screening.weightChangeKg && screening.weightChangeKg > 0 ? '+' : ''}{screening.weightChangeKg} kg ({screening.weightChangePercent}%)</span>
                  </div>
                  <span className="text-[10px] text-slate-500 block mt-0.5">
                    {hasWeightDrop ? 'Alerta perda > 5%' : 'Peso estável'}
                  </span>
                </div>

                {/* Aceitação Calórica */}
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/70 border border-slate-100 dark:border-slate-800">
                  <span className="text-slate-400 font-semibold block mb-0.5">Aceitação Calórica</span>
                  <div className="flex items-baseline justify-between">
                    <span className="text-base font-black text-slate-900 dark:text-white">
                      {screening.caloricIntake.estimatedKcalConsumed} kcal
                    </span>
                    <span className="font-bold text-teal-600">{screening.caloricIntake.acceptancePercentage}%</span>
                  </div>
                  <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden mt-1.5">
                    <div 
                      className={`h-full rounded-full ${
                        screening.caloricIntake.acceptancePercentage < 70 ? 'bg-rose-500' : 'bg-teal-500'
                      }`}
                      style={{ width: `${Math.min(screening.caloricIntake.acceptancePercentage, 100)}%` }}
                    />
                  </div>
                </div>

                {/* Consistência & Disfagia */}
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/70 border border-slate-100 dark:border-slate-800">
                  <span className="text-slate-400 font-semibold block mb-0.5">Consistência & Alertas</span>
                  <span className="text-sm font-bold text-slate-900 dark:text-white block truncate">
                    {screening.clinicalContext.dietConsistency}
                  </span>
                  <div className="flex items-center gap-1.5 mt-1">
                    {screening.clinicalContext.swallowingIssues && (
                      <span className="px-1.5 py-0.5 rounded bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 font-bold text-[10px]">
                        Disfagia
                      </span>
                    )}
                    {screening.clinicalContext.bowelHabit?.includes('Constipação') && (
                      <span className="px-1.5 py-0.5 rounded bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 font-bold text-[10px]">
                        Constipação
                      </span>
                    )}
                  </div>
                </div>

              </div>

              {/* Gemini AI Adjustments Preview */}
              {screening.aiAssessment && (
                <div className="p-3.5 rounded-xl bg-teal-50/60 dark:bg-teal-950/20 border border-teal-200/60 dark:border-teal-900/40 text-xs text-slate-700 dark:text-slate-300 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 font-bold text-teal-800 dark:text-teal-200">
                      <Sparkles className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                      <span>Conduta Dietética Sugerida por Gemini IA:</span>
                    </div>
                    <span className="text-[11px] text-teal-700 dark:text-teal-300 font-semibold">
                      VET: {screening.aiAssessment.vetKcal} kcal/dia | Proteína: {screening.aiAssessment.proteinGramsPerKg} g/kg
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-1.5">
                    {screening.aiAssessment.dietAdjustments.slice(0, 3).map((adj, idx) => (
                      <span key={idx} className="px-2 py-0.5 rounded-lg bg-white dark:bg-slate-900 border border-teal-200/80 dark:border-teal-800 text-[11px] text-slate-800 dark:text-slate-200">
                        {adj}
                      </span>
                    ))}
                  </div>

                  <p className="text-[11px] text-slate-500 dark:text-slate-400 italic">
                    {screening.aiAssessment.clinicalRationale}
                  </p>
                </div>
              )}

            </div>
          );
        })}

        {filteredScreenings.length === 0 && (
          <div className="p-12 text-center rounded-2xl bg-white dark:bg-slate-800/60 border border-dashed border-slate-300 dark:border-slate-700 space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-teal-50 dark:bg-teal-950 text-teal-600 dark:text-teal-400 flex items-center justify-center mx-auto">
              <Apple className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-slate-900 dark:text-white text-sm">
              Nenhuma triagem encontrada com os filtros atuais
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
              Tente alterar os termos de busca ou inicie uma nova avaliação nutricional para os moradores.
            </p>
            <button
              onClick={() => handleOpenNewScreening()}
              className="px-4 py-2 rounded-xl bg-teal-600 text-white font-bold text-xs shadow-sm hover:bg-teal-700"
            >
              + Iniciar Triagem Nutricional
            </button>
          </div>
        )}
      </div>

      {/* Embedded Modal Component */}
      {isModalOpen && (
        <NutritionalScreeningModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          residents={residents}
          initialResidentId={modalResidentId}
          initialScreening={selectedScreening}
          evolutions={evolutions}
          onSaveSuccess={() => {
            refreshScreenings();
          }}
          onOpenSOAPWithDraft={onOpenSOAPWithDraft}
        />
      )}

    </div>
  );
};
