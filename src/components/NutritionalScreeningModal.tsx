import React, { useState, useEffect, useMemo } from 'react';
import { 
  X, 
  Sparkles, 
  UtensilsCrossed, 
  Scale, 
  Flame, 
  Droplets, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  Printer, 
  FileText, 
  ChevronRight, 
  User, 
  HeartPulse, 
  TrendingDown, 
  TrendingUp, 
  HelpCircle,
  Apple,
  RefreshCw,
  Save,
  Check
} from 'lucide-react';
import { Resident, ClinicalEvolution, NutritionalScreening, DietConsistencyType } from '../types';
import { getCurrentUser } from '../config/auth-mode';
import { giterStore } from '../utils/giterStore';

interface NutritionalScreeningModalProps {
  isOpen: boolean;
  onClose: () => void;
  residents: Resident[];
  initialResidentId?: string;
  initialScreening?: NutritionalScreening | null;
  evolutions?: ClinicalEvolution[];
  onSaveSuccess?: (screening: NutritionalScreening) => void;
  onOpenSOAPWithDraft?: (residentId: string, soapDraft: { subjective: string; objective: string; assessment: string; plan: string }) => void;
}

export const NutritionalScreeningModal: React.FC<NutritionalScreeningModalProps> = ({
  isOpen,
  onClose,
  residents,
  initialResidentId,
  initialScreening,
  evolutions = [],
  onSaveSuccess,
  onOpenSOAPWithDraft
}) => {
  const currentUser = getCurrentUser();

  // Resident Selection
  const [selectedResidentId, setSelectedResidentId] = useState<string>(
    initialScreening?.residentId || initialResidentId || (residents.length > 0 ? residents[0].id : '')
  );

  const selectedResident = useMemo(() => {
    return residents.find(r => r.id === selectedResidentId) || residents[0] || null;
  }, [residents, selectedResidentId]);

  // Antropometria State
  const [weight, setWeight] = useState<number>(initialScreening?.weight || 62.0);
  const [height, setHeight] = useState<number>(initialScreening?.height || 165);
  const [previousWeight, setPreviousWeight] = useState<number>(initialScreening?.previousWeight || 64.0);
  const [weightChangePeriodDays, setWeightChangePeriodDays] = useState<number>(initialScreening?.weightChangePeriodDays || 30);

  // Ingestão Calórica State
  const [estimatedDailyKcalTarget, setEstimatedDailyKcalTarget] = useState<number>(
    initialScreening?.caloricIntake?.estimatedDailyKcalTarget || 1850
  );
  const [hydrationMl, setHydrationMl] = useState<number>(
    initialScreening?.caloricIntake?.hydrationMl || 1500
  );
  const [hydrationTargetMl, setHydrationTargetMl] = useState<number>(
    initialScreening?.caloricIntake?.hydrationTargetMl || 2000
  );

  // 5 Daily Meals Acceptance (%)
  const [breakfastAcceptance, setBreakfastAcceptance] = useState<number>(
    initialScreening?.caloricIntake?.meals?.breakfast?.acceptance ?? 100
  );
  const [breakfastNotes, setBreakfastNotes] = useState<string>(
    initialScreening?.caloricIntake?.meals?.breakfast?.notes || ''
  );

  const [lunchAcceptance, setLunchAcceptance] = useState<number>(
    initialScreening?.caloricIntake?.meals?.lunch?.acceptance ?? 75
  );
  const [lunchNotes, setLunchNotes] = useState<string>(
    initialScreening?.caloricIntake?.meals?.lunch?.notes || ''
  );

  const [snackAcceptance, setSnackAcceptance] = useState<number>(
    initialScreening?.caloricIntake?.meals?.afternoonSnack?.acceptance ?? 100
  );
  const [snackNotes, setSnackNotes] = useState<string>(
    initialScreening?.caloricIntake?.meals?.afternoonSnack?.notes || ''
  );

  const [dinnerAcceptance, setDinnerAcceptance] = useState<number>(
    initialScreening?.caloricIntake?.meals?.dinner?.acceptance ?? 75
  );
  const [dinnerNotes, setDinnerNotes] = useState<string>(
    initialScreening?.caloricIntake?.meals?.dinner?.notes || ''
  );

  const [supperAcceptance, setSupperAcceptance] = useState<number>(
    initialScreening?.caloricIntake?.meals?.supper?.acceptance ?? 75
  );
  const [supperNotes, setSupperNotes] = useState<string>(
    initialScreening?.caloricIntake?.meals?.supper?.notes || ''
  );

  // Clinical Context State
  const [dietConsistency, setDietConsistency] = useState<DietConsistencyType>(
    initialScreening?.clinicalContext?.dietConsistency || 'Geral / Livre'
  );
  const [appetite, setAppetite] = useState<'Normal / Preservado' | 'Bom' | 'Reduzido / Inapetência' | 'Anorexia Severa' | 'Hiperfagia / Compulsão'>(
    initialScreening?.clinicalContext?.appetite || 'Bom'
  );
  const [swallowingIssues, setSwallowingIssues] = useState<boolean>(
    initialScreening?.clinicalContext?.swallowingIssues || false
  );
  const [chewingIssues, setChewingIssues] = useState<boolean>(
    initialScreening?.clinicalContext?.chewingIssues || false
  );
  const [bowelHabit, setBowelHabit] = useState<'Regular (1x/dia)' | 'Constipação (>2 dias sem evacuar)' | 'Diarreia / Fezes líquidas'>(
    initialScreening?.clinicalContext?.bowelHabit || 'Regular (1x/dia)'
  );
  const [selectedRestrictions, setSelectedRestrictions] = useState<string[]>(
    initialScreening?.clinicalContext?.dietaryRestrictions || []
  );

  // AI Assessment State
  const [aiAssessment, setAiAssessment] = useState<NutritionalScreening['aiAssessment'] | undefined>(
    initialScreening?.aiAssessment
  );
  const [isGeneratingAi, setIsGeneratingAi] = useState<boolean>(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [isSaved, setIsSaved] = useState<boolean>(false);

  // Populate when resident changes or initialScreening changes
  useEffect(() => {
    if (initialScreening) {
      setSelectedResidentId(initialScreening.residentId);
      setWeight(initialScreening.weight);
      setHeight(initialScreening.height);
      setPreviousWeight(initialScreening.previousWeight || initialScreening.weight);
      setEstimatedDailyKcalTarget(initialScreening.caloricIntake?.estimatedDailyKcalTarget || 1850);
      setHydrationMl(initialScreening.caloricIntake?.hydrationMl || 1500);
      setHydrationTargetMl(initialScreening.caloricIntake?.hydrationTargetMl || 2000);
      setBreakfastAcceptance(initialScreening.caloricIntake?.meals?.breakfast?.acceptance ?? 100);
      setBreakfastNotes(initialScreening.caloricIntake?.meals?.breakfast?.notes || '');
      setLunchAcceptance(initialScreening.caloricIntake?.meals?.lunch?.acceptance ?? 75);
      setLunchNotes(initialScreening.caloricIntake?.meals?.lunch?.notes || '');
      setSnackAcceptance(initialScreening.caloricIntake?.meals?.afternoonSnack?.acceptance ?? 100);
      setSnackNotes(initialScreening.caloricIntake?.meals?.afternoonSnack?.notes || '');
      setDinnerAcceptance(initialScreening.caloricIntake?.meals?.dinner?.acceptance ?? 75);
      setDinnerNotes(initialScreening.caloricIntake?.meals?.dinner?.notes || '');
      setSupperAcceptance(initialScreening.caloricIntake?.meals?.supper?.acceptance ?? 75);
      setSupperNotes(initialScreening.caloricIntake?.meals?.supper?.notes || '');
      setDietConsistency(initialScreening.clinicalContext?.dietConsistency || 'Geral / Livre');
      setAppetite(initialScreening.clinicalContext?.appetite || 'Bom');
      setSwallowingIssues(initialScreening.clinicalContext?.swallowingIssues || false);
      setChewingIssues(initialScreening.clinicalContext?.chewingIssues || false);
      setBowelHabit(initialScreening.clinicalContext?.bowelHabit || 'Regular (1x/dia)');
      setSelectedRestrictions(initialScreening.clinicalContext?.dietaryRestrictions || []);
      setAiAssessment(initialScreening.aiAssessment);
    } else if (initialResidentId) {
      setSelectedResidentId(initialResidentId);
      const res = residents.find(r => r.id === initialResidentId);
      if (res) {
        // Adjust reasonable defaults for resident age/gender
        const isElderly = (res.age || 0) >= 60;
        const defaultWt = res.gender === 'Feminino' ? 58 : 68;
        setWeight(defaultWt);
        setPreviousWeight(defaultWt + (isElderly ? 1.5 : 0));
        setHeight(res.gender === 'Feminino' ? 158 : 172);
        setEstimatedDailyKcalTarget(Math.round(defaultWt * (isElderly ? 28 : 30)));
        setHydrationTargetMl(Math.round(defaultWt * 32));
      }
    }
  }, [initialScreening, initialResidentId, residents]);

  // Derived Calculations
  const bmi = useMemo(() => {
    if (!height || height <= 0 || !weight || weight <= 0) return 0;
    const heightInMeters = height / 100;
    return parseFloat((weight / (heightInMeters * heightInMeters)).toFixed(1));
  }, [weight, height]);

  const bmiClassification = useMemo(() => {
    if (bmi <= 0) return 'Calculando...';
    const isElderly = (selectedResident?.age || 0) >= 60;

    if (isElderly) {
      // Critérios OPAS / Lipschitz para Idosos
      if (bmi < 22) return 'Baixo Peso (Idoso - OPAS < 22)';
      if (bmi <= 27) return 'Eutrofia / Peso Adequado (22 - 27)';
      return 'Sobrepeso / Obesidade (Idoso > 27)';
    } else {
      // Critérios OMS Adultos
      if (bmi < 18.5) return 'Baixo Peso (OMS < 18.5)';
      if (bmi <= 24.9) return 'Eutrofia / Normal (18.5 - 24.9)';
      if (bmi <= 29.9) return 'Sobrepeso (25 - 29.9)';
      return 'Obesidade (≥ 30.0)';
    }
  }, [bmi, selectedResident]);

  const weightChangeKg = useMemo(() => {
    if (!previousWeight || previousWeight <= 0) return 0;
    return parseFloat((weight - previousWeight).toFixed(1));
  }, [weight, previousWeight]);

  const weightChangePercent = useMemo(() => {
    if (!previousWeight || previousWeight <= 0) return 0;
    return parseFloat((((weight - previousWeight) / previousWeight) * 100).toFixed(1));
  }, [weight, previousWeight]);

  // Meal Kcal Breakdown
  const mealKcalTargets = useMemo(() => {
    // Standard clinical meal distribution in SRT:
    // Café (20%), Almoço (35%), Lanche (15%), Jantar (25%), Ceia (5%)
    return {
      breakfast: Math.round(estimatedDailyKcalTarget * 0.20),
      lunch: Math.round(estimatedDailyKcalTarget * 0.35),
      snack: Math.round(estimatedDailyKcalTarget * 0.15),
      dinner: Math.round(estimatedDailyKcalTarget * 0.25),
      supper: Math.round(estimatedDailyKcalTarget * 0.05),
    };
  }, [estimatedDailyKcalTarget]);

  const mealConsumedKcal = useMemo(() => {
    return {
      breakfast: Math.round(mealKcalTargets.breakfast * (breakfastAcceptance / 100)),
      lunch: Math.round(mealKcalTargets.lunch * (lunchAcceptance / 100)),
      snack: Math.round(mealKcalTargets.snack * (snackAcceptance / 100)),
      dinner: Math.round(mealKcalTargets.dinner * (dinnerAcceptance / 100)),
      supper: Math.round(mealKcalTargets.supper * (supperAcceptance / 100)),
    };
  }, [mealKcalTargets, breakfastAcceptance, lunchAcceptance, snackAcceptance, dinnerAcceptance, supperAcceptance]);

  const totalConsumedKcal = useMemo(() => {
    return (
      mealConsumedKcal.breakfast +
      mealConsumedKcal.lunch +
      mealConsumedKcal.snack +
      mealConsumedKcal.dinner +
      mealConsumedKcal.supper
    );
  }, [mealConsumedKcal]);

  const globalAcceptancePercentage = useMemo(() => {
    if (estimatedDailyKcalTarget <= 0) return 0;
    return Math.round((totalConsumedKcal / estimatedDailyKcalTarget) * 100);
  }, [totalConsumedKcal, estimatedDailyKcalTarget]);

  // Recent Resident Evolutions for Context
  const residentEvolutions = useMemo(() => {
    if (!selectedResident) return [];
    return evolutions
      .filter(e => e.residentId === selectedResident.id)
      .slice(0, 3)
      .map(e => `[${e.date} ${e.time}] ${e.role}: ${e.soap?.objective || e.freeTextContent || ''} | Avaliação: ${e.soap?.assessment || ''}`);
  }, [selectedResident, evolutions]);

  // Call Gemini API Server Endpoint
  const handleGenerateAiAssessment = async () => {
    if (!selectedResident) return;
    setIsGeneratingAi(true);
    setAiError(null);

    const payload = {
      resident: {
        id: selectedResident.id,
        name: selectedResident.name,
        age: selectedResident.age,
        gender: selectedResident.gender,
        room: selectedResident.room,
        primaryDiagnosis: selectedResident.primaryDiagnosis || selectedResident.primaryDiagnostic,
        secondaryDiagnoses: selectedResident.secondaryDiagnoses,
        allergies: selectedResident.allergies,
        medications: 'Protocolo SRT 12/12h (08h e 20h)'
      },
      weight,
      height,
      bmi,
      bmiClassification,
      previousWeight,
      weightChangeKg,
      weightChangePercent,
      caloricIntake: {
        estimatedDailyKcalTarget,
        estimatedKcalConsumed: totalConsumedKcal,
        acceptancePercentage: globalAcceptancePercentage,
        hydrationMl,
        hydrationTargetMl,
        meals: {
          breakfast: { label: 'Café da Manhã', time: '08:00', targetKcal: mealKcalTargets.breakfast, acceptance: breakfastAcceptance, consumedKcal: mealConsumedKcal.breakfast, notes: breakfastNotes },
          lunch: { label: 'Almoço', time: '12:00', targetKcal: mealKcalTargets.lunch, acceptance: lunchAcceptance, consumedKcal: mealConsumedKcal.lunch, notes: lunchNotes },
          afternoonSnack: { label: 'Lanche da Tarde', time: '15:30', targetKcal: mealKcalTargets.snack, acceptance: snackAcceptance, consumedKcal: mealConsumedKcal.snack, notes: snackNotes },
          dinner: { label: 'Jantar', time: '19:00', targetKcal: mealKcalTargets.dinner, acceptance: dinnerAcceptance, consumedKcal: mealConsumedKcal.dinner, notes: dinnerNotes },
          supper: { label: 'Ceia', time: '21:30', targetKcal: mealKcalTargets.supper, acceptance: supperAcceptance, consumedKcal: mealConsumedKcal.supper, notes: supperNotes },
        }
      },
      clinicalContext: {
        dietConsistency,
        appetite,
        swallowingIssues,
        chewingIssues,
        bowelHabit,
        dietaryRestrictions: selectedRestrictions,
        physicalActivityLevel: 'Ativo em Oficinas'
      },
      recentEvolutions: residentEvolutions
    };

    try {
      const resp = await fetch('/api/nexa/nutrition-assessment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!resp.ok) {
        throw new Error(`Servidor retornou status ${resp.status}`);
      }

      const data = await resp.json();
      if (data.assessment) {
        setAiAssessment(data.assessment);
      } else {
        throw new Error('Formato inválido de resposta da IA');
      }
    } catch (err) {
      console.warn('Falha na chamada Gemini AI, gerando cálculo algorítmico local:', err);
      // Fallback local calculation
      const isElderly = (selectedResident.age || 0) >= 60;
      let risk = 'Eutrofia / Sem Risco';
      if (weightChangePercent <= -5 || globalAcceptancePercentage < 60 || (isElderly ? bmi < 22 : bmi < 18.5)) {
        risk = 'Alto Risco / Desnutrição';
      } else if (weightChangePercent <= -2.5 || globalAcceptancePercentage < 75) {
        risk = 'Risco Nutricional Moderado';
      } else if (bmi >= 27) {
        risk = 'Risco Metabólico / Obesidade';
      }

      setAiAssessment({
        nutritionalRisk: risk as any,
        vetKcal: Math.round(weight * 28),
        proteinGramsPerKg: risk.includes('Desnutrição') ? 1.4 : 1.2,
        dietAdjustments: [
          swallowingIssues ? 'Transição para consistência Pastosa Homogênea e líquidos espessados.' : 'Fracionamento em 5 refeições de menor volume.',
          globalAcceptancePercentage < 75 ? 'Enriquecimento calórico natural com azeite de oliva e leite em pó em preparações.' : 'Manter padrão de calorias e proteínas.',
          'Manter hidratação regular com copos pequenos de água ao longo do dia.'
        ],
        hydrationPlan: `Garantir aporte mínimo de ${Math.round(weight * 32)} ml de água por dia no SRT.`,
        textureRecommendation: swallowingIssues ? 'Pastosa' : 'Geral',
        supplementation: globalAcceptancePercentage < 70 ? 'Indicação de suplemento oral hiperproteico.' : 'Não indicado no momento.',
        guidanceForCaregivers: [
          'Acompanhar velocidade das refeições e postura ereta a 90°.',
          'Registrar recusas alimentares na rotina diária.'
        ],
        monitoringPlan: 'Pesagem quinzenal e reavaliação da triagem em 30 dias.',
        clinicalRationale: `Avaliação do residente ${selectedResident.name} (${selectedResident.age} anos) com IMC ${bmi} kg/m² e aceitação média de ${globalAcceptancePercentage}%.`,
        generatedAt: new Date().toISOString()
      });
    } finally {
      setIsGeneratingAi(false);
    }
  };

  // Save Screening
  const handleSaveScreening = () => {
    if (!selectedResident) return;

    const screening: NutritionalScreening = {
      id: initialScreening?.id || `nutri-${Date.now()}`,
      residentId: selectedResident.id,
      residentName: selectedResident.name,
      room: selectedResident.room,
      date: new Date().toISOString().split('T')[0],
      evaluatorName: currentUser?.name || 'Profissional de Saúde',
      evaluatorRole: currentUser?.role || 'Nutricionista',
      weight,
      height,
      bmi,
      bmiClassification,
      previousWeight,
      weightChangeKg,
      weightChangePercent,
      weightChangePeriodDays,
      caloricIntake: {
        estimatedDailyKcalTarget,
        estimatedKcalConsumed: totalConsumedKcal,
        acceptancePercentage: globalAcceptancePercentage,
        hydrationMl,
        hydrationTargetMl,
        meals: {
          breakfast: { label: 'Café da Manhã', time: '08:00', targetKcal: mealKcalTargets.breakfast, acceptance: breakfastAcceptance, consumedKcal: mealConsumedKcal.breakfast, notes: breakfastNotes },
          lunch: { label: 'Almoço', time: '12:00', targetKcal: mealKcalTargets.lunch, acceptance: lunchAcceptance, consumedKcal: mealConsumedKcal.lunch, notes: lunchNotes },
          afternoonSnack: { label: 'Lanche da Tarde', time: '15:30', targetKcal: mealKcalTargets.snack, acceptance: snackAcceptance, consumedKcal: mealConsumedKcal.snack, notes: snackNotes },
          dinner: { label: 'Jantar', time: '19:00', targetKcal: mealKcalTargets.dinner, acceptance: dinnerAcceptance, consumedKcal: mealConsumedKcal.dinner, notes: dinnerNotes },
          supper: { label: 'Ceia', time: '21:30', targetKcal: mealKcalTargets.supper, acceptance: supperAcceptance, consumedKcal: mealConsumedKcal.supper, notes: supperNotes },
        }
      },
      clinicalContext: {
        dietConsistency,
        appetite,
        swallowingIssues,
        chewingIssues,
        bowelHabit,
        dietaryRestrictions: selectedRestrictions,
        physicalActivityLevel: 'Ativo em Oficinas'
      },
      aiAssessment
    };

    giterStore.saveNutritionalScreening(screening);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2500);
    if (onSaveSuccess) onSaveSuccess(screening);
  };

  // Export / Print Nutritional Prescription
  const handlePrintPrescription = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const content = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Parecer Nutricional SRT - ${selectedResident?.name}</title>
        <style>
          body { font-family: 'Helvetica Neue', Arial, sans-serif; padding: 24px; color: #1e293b; line-height: 1.5; }
          .header { border-bottom: 2px solid #0f766e; padding-bottom: 12px; margin-bottom: 20px; }
          .title { font-size: 20px; font-weight: bold; color: #0f766e; }
          .meta { font-size: 13px; color: #64748b; margin-top: 4px; }
          .section { margin-bottom: 18px; border: 1px solid #e2e8f0; border-radius: 8px; padding: 14px; }
          .section-title { font-size: 14px; font-weight: bold; color: #0f766e; margin-bottom: 8px; text-transform: uppercase; letter-spacing: 0.5px; }
          .grid { display: flex; gap: 16px; margin-bottom: 10px; }
          .grid-col { flex: 1; background: #f8fafc; padding: 10px; border-radius: 6px; }
          .label { font-size: 11px; color: #64748b; font-weight: bold; text-transform: uppercase; }
          .val { font-size: 15px; font-weight: bold; color: #0f172a; }
          ul { margin: 6px 0; padding-left: 20px; font-size: 13px; }
          li { margin-bottom: 4px; }
          .badge { display: inline-block; padding: 3px 8px; border-radius: 9999px; font-size: 12px; font-weight: bold; }
          .badge-danger { background: #ffe4e6; color: #9f1239; }
          .badge-success { background: #dcfce7; color: #166534; }
          .badge-warning { background: #fef3c7; color: #92400e; }
          .footer { margin-top: 30px; border-top: 1px solid #cbd5e1; padding-top: 12px; font-size: 12px; color: #64748b; text-align: center; }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="title">NexaMed SRT — Parecer de Triagem Nutricional & Conduta Dietética</div>
          <div class="meta">Serviço de Residência Terapêutica | Morador: <strong>${selectedResident?.name}</strong> (${selectedResident?.room}) | Data: ${new Date().toLocaleDateString('pt-BR')}</div>
        </div>

        <div class="section">
          <div class="section-title">1. Dados Antropométricos & Ingestão Calórica</div>
          <div class="grid">
            <div class="grid-col">
              <div class="label">Peso Atual</div>
              <div class="val">${weight} kg (IMC: ${bmi} kg/m²)</div>
              <div style="font-size:12px; color:#475569;">${bmiClassification}</div>
            </div>
            <div class="grid-col">
              <div class="label">Variação Ponderal</div>
              <div class="val">${weightChangeKg > 0 ? '+' : ''}${weightChangeKg} kg (${weightChangePercent}%)</div>
              <div style="font-size:12px; color:#475569;">Últimos ${weightChangePeriodDays} dias</div>
            </div>
            <div class="grid-col">
              <div class="label">Ingestão Calórica / Aceitação</div>
              <div class="val">${totalConsumedKcal} / ${estimatedDailyKcalTarget} kcal (${globalAcceptancePercentage}%)</div>
              <div style="font-size:12px; color:#475569;">Hidratação: ${hydrationMl} ml / ${hydrationTargetMl} ml</div>
            </div>
          </div>
        </div>

        <div class="section">
          <div class="section-title">2. Diagnóstico & Risco Nutricional (Gemini IA)</div>
          <p><strong>Classificação:</strong> <span class="badge ${aiAssessment?.nutritionalRisk?.includes('Desnutrição') ? 'badge-danger' : aiAssessment?.nutritionalRisk?.includes('Moderado') ? 'badge-warning' : 'badge-success'}">${aiAssessment?.nutritionalRisk || 'Em avaliação'}</span></p>
          <p><strong>Necessidade Estimada (VET):</strong> ${aiAssessment?.vetKcal || estimatedDailyKcalTarget} kcal/dia | <strong>Meta Proteica:</strong> ${aiAssessment?.proteinGramsPerKg || 1.2} g/kg/dia</p>
          <p><strong>Consistência Recomendada:</strong> ${aiAssessment?.textureRecommendation || dietConsistency}</p>
          <p><strong>Suplementação:</strong> ${aiAssessment?.supplementation || 'Sem indicação no momento'}</p>
        </div>

        <div class="section">
          <div class="section-title">3. Ajustes de Dieta para a Cozinha / Copa do SRT</div>
          <ul>
            ${(aiAssessment?.dietAdjustments || ['Manter cardápio padrão balanceado']).map(adj => `<li>${adj}</li>`).join('')}
          </ul>
        </div>

        <div class="section">
          <div class="section-title">4. Orientações para a Equipe de Cuidadores</div>
          <ul>
            ${(aiAssessment?.guidanceForCaregivers || ['Estimular mastigação tranquila e hidratação nos intervalos']).map(g => `<li>${g}</li>`).join('')}
          </ul>
          <p style="margin-top: 10px;"><strong>Plano de Hidratação:</strong> ${aiAssessment?.hydrationPlan || 'Ofertar água regularmente ao longo do dia.'}</p>
          <p><strong>Monitoramento:</strong> ${aiAssessment?.monitoringPlan || 'Pesagem quinzenal.'}</p>
        </div>

        <div class="footer">
          Documento emitido por ${currentUser?.name || 'Equipe Multidisciplinar'} (${currentUser?.role || 'Nutrição'}) via Plataforma NexaMed SRT em ${new Date().toLocaleString('pt-BR')}.
        </div>
        <script>window.print();</script>
      </body>
      </html>
    `;

    printWindow.document.write(content);
    printWindow.document.close();
  };

  // Convert AI Assessment to SOAP Note draft
  const handleTransferToSoap = () => {
    if (!selectedResident || !onOpenSOAPWithDraft) return;

    const soapDraft = {
      subjective: `Residente refere apetite classificado como "${appetite}". Aceitação global das refeições avaliada em ${globalAcceptancePercentage}% do cardápio padrão oferecido. Queixas gastrointestinais: ${bowelHabit}. Disfagia/Engasgos: ${swallowingIssues ? 'Presente com líquidos ralos' : 'Ausente'}.`,
      objective: `Avaliação Antropométrica: Peso atual: ${weight} kg | Altura: ${height} cm | IMC: ${bmi} kg/m² (${bmiClassification}). Variação ponderal recente: ${weightChangeKg > 0 ? '+' : ''}${weightChangeKg} kg (${weightChangePercent}% em ${weightChangePeriodDays} dias). Ingestão calórica real estimada em ${totalConsumedKcal} kcal/dia frente à meta de ${estimatedDailyKcalTarget} kcal. Ingesta hídrica aferida: ${hydrationMl} ml/dia. Consistência atual da dieta: ${dietConsistency}.`,
      assessment: `Triagem Nutricional Clínica (Nexa IA): Classificação de "${aiAssessment?.nutritionalRisk || 'Risco Avaliado'}". VET calculado em ${aiAssessment?.vetKcal || estimatedDailyKcalTarget} kcal/dia e meta proteica de ${aiAssessment?.proteinGramsPerKg || 1.2} g/kg/dia. ${aiAssessment?.clinicalRationale || ''}`,
      plan: `1. Conduta dietética: ${(aiAssessment?.dietAdjustments || []).join('; ')}.\n2. Consistência e Textura: ${aiAssessment?.textureRecommendation || dietConsistency}.\n3. Suplementação: ${aiAssessment?.supplementation || 'Não necessária'}.\n4. Plano de Hidratação: ${aiAssessment?.hydrationPlan || 'Garantir oferta hídrica fracionada'}.\n5. Monitoramento: ${aiAssessment?.monitoringPlan || 'Pesagem periódica'}.`
    };

    onOpenSOAPWithDraft(selectedResident.id, soapDraft);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 w-full max-w-4xl rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col max-h-[92vh] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Modal Top Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-gradient-to-r from-teal-50/80 via-white to-emerald-50/60 dark:from-slate-900 dark:via-slate-900 dark:to-teal-950/30">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-600 text-white flex items-center justify-center shadow-md shadow-teal-600/20">
              <Apple className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-black text-slate-900 dark:text-white tracking-tight">
                  Triagem Nutricional & Ingestão Calórica
                </h2>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-300 border border-teal-200 dark:border-teal-800">
                  <Sparkles className="w-3 h-3 text-teal-600 dark:text-teal-400" />
                  Gemini IA
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Avaliação antropométrica, aceitação das refeições do SRT e conduta dietética personalizada
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">

          {/* Section: Residente Selecionado */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <img 
                src={selectedResident?.photo || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=120&auto=format&fit=crop&q=80'} 
                alt={selectedResident?.name || 'Residente'} 
                className="w-12 h-12 rounded-xl object-cover border-2 border-teal-500 shadow-sm"
              />
              <div>
                <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1">
                  Morador em Avaliação:
                </label>
                <select
                  value={selectedResidentId}
                  onChange={(e) => setSelectedResidentId(e.target.value)}
                  className="text-sm font-black text-slate-900 dark:text-white bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg px-2.5 py-1.5 focus:ring-2 focus:ring-teal-500 focus:outline-none"
                >
                  {residents.map(r => (
                    <option key={r.id} value={r.id}>
                      {r.name} — {r.room} ({r.age} anos)
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 text-xs">
              <div className="px-3 py-1 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
                <span className="text-slate-500 dark:text-slate-400">Diagnóstico: </span>
                <span className="font-bold text-slate-800 dark:text-slate-200">
                  {selectedResident?.primaryDiagnosis || selectedResident?.primaryDiagnostic || 'Acompanhamento SRT'}
                </span>
              </div>
              {selectedResident?.allergies && selectedResident.allergies.length > 0 && (
                <div className="px-3 py-1 rounded-lg bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
                  <span className="font-bold">Alergias: </span>
                  {selectedResident.allergies.join(', ')}
                </div>
              )}
            </div>
          </div>

          {/* Grid: 1. Antropometria & 2. Ingestão Calórica */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            {/* Card 1: Antropometria & Variação Ponderal */}
            <div className="p-5 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700 pb-2">
                <div className="flex items-center gap-2">
                  <Scale className="w-5 h-5 text-teal-600 dark:text-teal-400" />
                  <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                    Antropometria & Ponderal
                  </h3>
                </div>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-black ${
                  bmiClassification.includes('Baixo') || bmiClassification.includes('Obesidade')
                    ? 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-300'
                    : 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-300'
                }`}>
                  IMC: {bmi} kg/m²
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 block mb-1">
                    Peso Atual (kg)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="30"
                    max="200"
                    value={weight}
                    onChange={(e) => setWeight(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 text-sm font-bold bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 block mb-1">
                    Altura (cm)
                  </label>
                  <input
                    type="number"
                    step="1"
                    min="100"
                    max="220"
                    value={height}
                    onChange={(e) => setHeight(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 text-sm font-bold bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Status do IMC */}
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 text-xs flex items-center justify-between">
                <span className="text-slate-500 dark:text-slate-400">Classificação:</span>
                <span className="font-bold text-slate-800 dark:text-slate-200 text-right">
                  {bmiClassification}
                </span>
              </div>

              {/* Variação Ponderal */}
              <div className="pt-2 border-t border-slate-100 dark:border-slate-700 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500 dark:text-slate-400">Peso Anterior (últimos {weightChangePeriodDays} dias):</span>
                  <div className="flex items-center gap-1.5">
                    <input
                      type="number"
                      step="0.1"
                      value={previousWeight}
                      onChange={(e) => setPreviousWeight(parseFloat(e.target.value) || 0)}
                      className="w-20 px-2 py-1 text-xs font-bold text-right bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg"
                    />
                    <span className="text-slate-500">kg</span>
                  </div>
                </div>

                <div className={`p-2.5 rounded-xl border flex items-center justify-between text-xs ${
                  weightChangePercent <= -5
                    ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-300 border-rose-200 dark:border-rose-800'
                    : weightChangePercent < 0
                    ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-800'
                    : 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                }`}>
                  <div className="flex items-center gap-1.5 font-bold">
                    {weightChangePercent < 0 ? (
                      <TrendingDown className="w-4 h-4 text-rose-600 dark:text-rose-400" />
                    ) : (
                      <TrendingUp className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    )}
                    <span>Variação: {weightChangeKg > 0 ? '+' : ''}{weightChangeKg} kg ({weightChangePercent}%)</span>
                  </div>
                  {weightChangePercent <= -5 && (
                    <span className="font-black uppercase tracking-wider text-[10px] px-1.5 py-0.5 rounded bg-rose-600 text-white">
                      Alerta Perda &gt;5%
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Card 2: Ingestão Calórica & Hidratação */}
            <div className="p-5 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700 pb-2">
                <div className="flex items-center gap-2">
                  <Flame className="w-5 h-5 text-amber-500" />
                  <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                    Ingestão Calórica Estimada
                  </h3>
                </div>
                <div className="text-right">
                  <span className="text-xs font-black text-slate-900 dark:text-white">
                    {totalConsumedKcal} / {estimatedDailyKcalTarget} kcal
                  </span>
                  <span className={`ml-2 px-2 py-0.5 rounded-full text-xs font-bold ${
                    globalAcceptancePercentage < 70
                      ? 'bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300'
                      : globalAcceptancePercentage < 85
                      ? 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300'
                      : 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300'
                  }`}>
                    {globalAcceptancePercentage}%
                  </span>
                </div>
              </div>

              {/* Barra de Progresso de Aceitação Calórica */}
              <div>
                <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-1">
                  <span>Aceitação Geral da Dieta:</span>
                  <span className="font-bold">{globalAcceptancePercentage}% consumido</span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-700 h-2.5 rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full transition-all duration-300 ${
                      globalAcceptancePercentage < 70 
                        ? 'bg-rose-500' 
                        : globalAcceptancePercentage < 85 
                        ? 'bg-amber-500' 
                        : 'bg-emerald-500'
                    }`}
                    style={{ width: `${Math.min(globalAcceptancePercentage, 100)}%` }}
                  />
                </div>
                {globalAcceptancePercentage < 75 && (
                  <p className="text-[11px] font-semibold text-rose-600 dark:text-rose-400 mt-1 flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    Aceitação abaixo de 75%: risco de déficit energético e proteico
                  </p>
                )}
              </div>

              {/* Ingesta Hídrica */}
              <div className="p-3.5 rounded-xl bg-teal-50/70 dark:bg-teal-950/30 border border-teal-100 dark:border-teal-900/50 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-teal-800 dark:text-teal-200">
                    <Droplets className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                    <span>Hidratação Diária Ofertada</span>
                  </div>
                  <span className="text-xs font-bold text-teal-700 dark:text-teal-300">
                    {hydrationMl} / {hydrationTargetMl} ml
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-[11px] text-teal-600 dark:text-teal-400 block">Ingestão Real (ml):</span>
                    <input
                      type="number"
                      step="50"
                      value={hydrationMl}
                      onChange={(e) => setHydrationMl(parseInt(e.target.value) || 0)}
                      className="w-full px-2.5 py-1 text-xs font-bold bg-white dark:bg-slate-900 border border-teal-200 dark:border-teal-800 rounded-lg text-teal-900 dark:text-teal-100"
                    />
                  </div>
                  <div>
                    <span className="text-[11px] text-teal-600 dark:text-teal-400 block">Meta Hídrica (ml):</span>
                    <input
                      type="number"
                      step="50"
                      value={hydrationTargetMl}
                      onChange={(e) => setHydrationTargetMl(parseInt(e.target.value) || 0)}
                      className="w-full px-2.5 py-1 text-xs font-bold bg-white dark:bg-slate-900 border border-teal-200 dark:border-teal-800 rounded-lg text-teal-900 dark:text-teal-100"
                    />
                  </div>
                </div>
              </div>

              {/* Meta Calórica Total */}
              <div className="flex items-center justify-between text-xs pt-1">
                <span className="text-slate-500 dark:text-slate-400">Meta Calórica Teórica (VET):</span>
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    step="50"
                    value={estimatedDailyKcalTarget}
                    onChange={(e) => setEstimatedDailyKcalTarget(parseInt(e.target.value) || 0)}
                    className="w-24 px-2 py-1 text-xs font-bold text-right bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg"
                  />
                  <span className="text-slate-500">kcal/dia</span>
                </div>
              </div>
            </div>
          </div>

          {/* Section: Aceitação Detalhada por Refeição do SRT */}
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <UtensilsCrossed className="w-5 h-5 text-teal-600 dark:text-teal-400" />
                <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                  Aceitação Alimentar nas 5 Refeições Padronizadas do SRT
                </h3>
              </div>
              <span className="text-xs text-slate-500 dark:text-slate-400">
                Selecione a porcentagem do prato consumida pelo morador
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 pt-2">
              {/* Refeição 1: Café */}
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-black text-slate-800 dark:text-slate-200">Café da Manhã</span>
                    <span className="text-[10px] text-slate-400">08:00h</span>
                  </div>
                  <span className="text-[11px] text-slate-500 block mb-2">
                    Meta: {mealKcalTargets.breakfast} kcal
                  </span>
                </div>
                <div>
                  <div className="flex gap-1 mb-2">
                    {[0, 25, 50, 75, 100].map(pct => (
                      <button
                        key={pct}
                        type="button"
                        onClick={() => setBreakfastAcceptance(pct)}
                        className={`flex-1 py-1 rounded text-[10px] font-bold transition-all ${
                          breakfastAcceptance === pct
                            ? 'bg-teal-600 text-white shadow-sm'
                            : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                        }`}
                      >
                        {pct}%
                      </button>
                    ))}
                  </div>
                  <input
                    type="text"
                    placeholder="Obs café..."
                    value={breakfastNotes}
                    onChange={(e) => setBreakfastNotes(e.target.value)}
                    className="w-full text-[11px] px-2 py-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded"
                  />
                </div>
              </div>

              {/* Refeição 2: Almoço */}
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-black text-slate-800 dark:text-slate-200">Almoço</span>
                    <span className="text-[10px] text-slate-400">12:00h</span>
                  </div>
                  <span className="text-[11px] text-slate-500 block mb-2">
                    Meta: {mealKcalTargets.lunch} kcal
                  </span>
                </div>
                <div>
                  <div className="flex gap-1 mb-2">
                    {[0, 25, 50, 75, 100].map(pct => (
                      <button
                        key={pct}
                        type="button"
                        onClick={() => setLunchAcceptance(pct)}
                        className={`flex-1 py-1 rounded text-[10px] font-bold transition-all ${
                          lunchAcceptance === pct
                            ? 'bg-teal-600 text-white shadow-sm'
                            : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                        }`}
                      >
                        {pct}%
                      </button>
                    ))}
                  </div>
                  <input
                    type="text"
                    placeholder="Obs almoço..."
                    value={lunchNotes}
                    onChange={(e) => setLunchNotes(e.target.value)}
                    className="w-full text-[11px] px-2 py-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded"
                  />
                </div>
              </div>

              {/* Refeição 3: Lanche da Tarde */}
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-black text-slate-800 dark:text-slate-200">Lanche Tarde</span>
                    <span className="text-[10px] text-slate-400">15:30h</span>
                  </div>
                  <span className="text-[11px] text-slate-500 block mb-2">
                    Meta: {mealKcalTargets.snack} kcal
                  </span>
                </div>
                <div>
                  <div className="flex gap-1 mb-2">
                    {[0, 25, 50, 75, 100].map(pct => (
                      <button
                        key={pct}
                        type="button"
                        onClick={() => setSnackAcceptance(pct)}
                        className={`flex-1 py-1 rounded text-[10px] font-bold transition-all ${
                          snackAcceptance === pct
                            ? 'bg-teal-600 text-white shadow-sm'
                            : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                        }`}
                      >
                        {pct}%
                      </button>
                    ))}
                  </div>
                  <input
                    type="text"
                    placeholder="Obs lanche..."
                    value={snackNotes}
                    onChange={(e) => setSnackNotes(e.target.value)}
                    className="w-full text-[11px] px-2 py-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded"
                  />
                </div>
              </div>

              {/* Refeição 4: Jantar */}
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-black text-slate-800 dark:text-slate-200">Jantar</span>
                    <span className="text-[10px] text-slate-400">19:00h</span>
                  </div>
                  <span className="text-[11px] text-slate-500 block mb-2">
                    Meta: {mealKcalTargets.dinner} kcal
                  </span>
                </div>
                <div>
                  <div className="flex gap-1 mb-2">
                    {[0, 25, 50, 75, 100].map(pct => (
                      <button
                        key={pct}
                        type="button"
                        onClick={() => setDinnerAcceptance(pct)}
                        className={`flex-1 py-1 rounded text-[10px] font-bold transition-all ${
                          dinnerAcceptance === pct
                            ? 'bg-teal-600 text-white shadow-sm'
                            : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                        }`}
                      >
                        {pct}%
                      </button>
                    ))}
                  </div>
                  <input
                    type="text"
                    placeholder="Obs jantar..."
                    value={dinnerNotes}
                    onChange={(e) => setDinnerNotes(e.target.value)}
                    className="w-full text-[11px] px-2 py-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded"
                  />
                </div>
              </div>

              {/* Refeição 5: Ceia */}
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-black text-slate-800 dark:text-slate-200">Ceia</span>
                    <span className="text-[10px] text-slate-400">21:30h</span>
                  </div>
                  <span className="text-[11px] text-slate-500 block mb-2">
                    Meta: {mealKcalTargets.supper} kcal
                  </span>
                </div>
                <div>
                  <div className="flex gap-1 mb-2">
                    {[0, 25, 50, 75, 100].map(pct => (
                      <button
                        key={pct}
                        type="button"
                        onClick={() => setSupperAcceptance(pct)}
                        className={`flex-1 py-1 rounded text-[10px] font-bold transition-all ${
                          supperAcceptance === pct
                            ? 'bg-teal-600 text-white shadow-sm'
                            : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                        }`}
                      >
                        {pct}%
                      </button>
                    ))}
                  </div>
                  <input
                    type="text"
                    placeholder="Obs ceia..."
                    value={supperNotes}
                    onChange={(e) => setSupperNotes(e.target.value)}
                    className="w-full text-[11px] px-2 py-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Section: Perfil Clínico & Consistência */}
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 shadow-sm space-y-4">
            <h3 className="font-bold text-slate-900 dark:text-white text-sm border-b border-slate-100 dark:border-slate-700 pb-2">
              Contexto Clínico, Consistência & Fatores de Risco
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 block mb-1">
                  Consistência da Dieta
                </label>
                <select
                  value={dietConsistency}
                  onChange={(e) => setDietConsistency(e.target.value as DietConsistencyType)}
                  className="w-full px-3 py-2 text-xs font-bold bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-none"
                >
                  <option value="Geral / Livre">Geral / Livre</option>
                  <option value="Branda">Branda (Cozidos/Moídos)</option>
                  <option value="Pastosa">Pastosa (Purês/Homogênea)</option>
                  <option value="Líquida Completa">Líquida Completa</option>
                  <option value="Enteral / SNE">Enteral / SNE</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 block mb-1">
                  Padrão de Apetite
                </label>
                <select
                  value={appetite}
                  onChange={(e) => setAppetite(e.target.value as any)}
                  className="w-full px-3 py-2 text-xs font-bold bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-none"
                >
                  <option value="Bom">Bom</option>
                  <option value="Normal / Preservado">Normal / Preservado</option>
                  <option value="Reduzido / Inapetência">Reduzido / Inapetência</option>
                  <option value="Anorexia Severa">Anorexia Severa</option>
                  <option value="Hiperfagia / Compulsão">Hiperfagia / Compulsão</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 block mb-1">
                  Hábito Intestinal
                </label>
                <select
                  value={bowelHabit}
                  onChange={(e) => setBowelHabit(e.target.value as any)}
                  className="w-full px-3 py-2 text-xs font-bold bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-none"
                >
                  <option value="Regular (1x/dia)">Regular (1x/dia)</option>
                  <option value="Constipação (>2 dias sem evacuar)">Constipação (&gt;2 dias)</option>
                  <option value="Diarreia / Fezes líquidas">Diarreia / Fezes líquidas</option>
                </select>
              </div>
            </div>

            {/* Checkboxes de Risco Clínico */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700 dark:text-slate-300">
                <input
                  type="checkbox"
                  checked={swallowingIssues}
                  onChange={(e) => setSwallowingIssues(e.target.checked)}
                  className="w-4 h-4 rounded text-teal-600 focus:ring-teal-500 border-slate-300 dark:border-slate-700"
                />
                <span className={swallowingIssues ? 'text-rose-600 dark:text-rose-400 font-bold' : ''}>
                  Disfagia / Tosse ou Engasgos com Líquidos
                </span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700 dark:text-slate-300">
                <input
                  type="checkbox"
                  checked={chewingIssues}
                  onChange={(e) => setChewingIssues(e.target.checked)}
                  className="w-4 h-4 rounded text-teal-600 focus:ring-teal-500 border-slate-300 dark:border-slate-700"
                />
                <span>Dificuldade Mastigatória / Dentição Incompleta</span>
              </label>
            </div>
          </div>

          {/* Prominent Gemini AI Button Trigger */}
          <div className="flex flex-col items-center justify-center p-6 rounded-2xl bg-gradient-to-br from-teal-500/10 via-emerald-500/5 to-teal-500/10 dark:from-teal-950/40 dark:via-slate-900 dark:to-emerald-950/30 border border-teal-200 dark:border-teal-800/80 shadow-md text-center">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-teal-600 to-emerald-500 text-white flex items-center justify-center shadow-lg shadow-teal-500/30 mb-3 animate-pulse">
              <Sparkles className="w-6 h-6 stroke-[2.5]" />
            </div>
            <h4 className="text-base font-black text-slate-900 dark:text-white tracking-tight mb-1">
              Avaliação Nutricional com Inteligência Clínica Gemini
            </h4>
            <p className="text-xs text-slate-600 dark:text-slate-300 max-w-xl mb-4">
              Analisa o IMC, histórico de perda ponderal, aceitação calórica das refeições, comorbidades e evoluções recentes para sugerir ajustes na dieta e orientações para a copa do SRT.
            </p>

            <button
              type="button"
              onClick={handleGenerateAiAssessment}
              disabled={isGeneratingAi}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 active:scale-95 text-white font-black text-sm shadow-lg shadow-teal-600/30 flex items-center gap-2.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isGeneratingAi ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Analisando Perfil Clínico com Gemini IA...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Gerar Parecer e Ajustes de Dieta com Gemini</span>
                </>
              )}
            </button>
          </div>

          {/* Section: Resultado do Parecer Gemini AI */}
          {aiAssessment && (
            <div className="p-6 rounded-2xl bg-white dark:bg-slate-800/90 border border-teal-300 dark:border-teal-700/80 shadow-lg space-y-5 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-700 pb-3">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-teal-100 dark:bg-teal-900/50 text-teal-700 dark:text-teal-300">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-black text-slate-900 dark:text-white text-base">
                      Parecer Clínico & Prescrição Dietética (Nexa IA)
                    </h4>
                    <span className="text-[11px] text-slate-400">
                      Gerado em {new Date(aiAssessment.generatedAt).toLocaleString('pt-BR')}
                    </span>
                  </div>
                </div>

                <span className={`self-start sm:self-auto px-3 py-1 rounded-full text-xs font-black ${
                  aiAssessment.nutritionalRisk.includes('Desnutrição')
                    ? 'bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300 border border-rose-300'
                    : aiAssessment.nutritionalRisk.includes('Moderado')
                    ? 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-300'
                    : 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-300'
                }`}>
                  {aiAssessment.nutritionalRisk}
                </span>
              </div>

              {/* Rationale Clínico */}
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/70 border border-slate-100 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                <strong>Justificativa Clínica Integrada:</strong> {aiAssessment.clinicalRationale}
              </div>

              {/* Grid: Metas Nutricionais */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-teal-50 dark:bg-teal-950/30 border border-teal-100 dark:border-teal-900/40">
                  <span className="text-teal-600 dark:text-teal-400 font-bold block mb-0.5">Necessidade Energética (VET)</span>
                  <span className="text-lg font-black text-teal-900 dark:text-teal-100">{aiAssessment.vetKcal} kcal/dia</span>
                </div>
                <div className="p-3 rounded-xl bg-teal-50 dark:bg-teal-950/30 border border-teal-100 dark:border-teal-900/40">
                  <span className="text-teal-600 dark:text-teal-400 font-bold block mb-0.5">Meta Proteica</span>
                  <span className="text-lg font-black text-teal-900 dark:text-teal-100">{aiAssessment.proteinGramsPerKg} g/kg/dia</span>
                </div>
                <div className="p-3 rounded-xl bg-teal-50 dark:bg-teal-950/30 border border-teal-100 dark:border-teal-900/40">
                  <span className="text-teal-600 dark:text-teal-400 font-bold block mb-0.5">Consistência Indicada</span>
                  <span className="text-sm font-black text-teal-900 dark:text-teal-100">{aiAssessment.textureRecommendation}</span>
                </div>
              </div>

              {/* Ajustes Sugeridos na Dieta */}
              <div className="space-y-2">
                <h5 className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <UtensilsCrossed className="w-4 h-4 text-teal-600" />
                  Ajustes Recomendados no Cardápio & Rotina
                </h5>
                <ul className="space-y-1.5">
                  {aiAssessment.dietAdjustments.map((adj, i) => (
                    <li key={i} className="flex items-start gap-2 text-xs text-slate-700 dark:text-slate-300">
                      <CheckCircle2 className="w-4 h-4 text-teal-600 dark:text-teal-400 shrink-0 mt-0.5" />
                      <span>{adj}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Suplementação e Hidratação */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="p-3.5 rounded-xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-100 dark:border-amber-900/50">
                  <span className="font-bold text-amber-900 dark:text-amber-200 block mb-1">
                    Indicação de Suplementação:
                  </span>
                  <p className="text-amber-800 dark:text-amber-300">{aiAssessment.supplementation}</p>
                </div>
                <div className="p-3.5 rounded-xl bg-teal-50/70 dark:bg-teal-950/30 border border-teal-100 dark:border-teal-900/50">
                  <span className="font-bold text-teal-900 dark:text-teal-200 block mb-1">
                    Plano de Hidratação:
                  </span>
                  <p className="text-teal-800 dark:text-teal-300">{aiAssessment.hydrationPlan}</p>
                </div>
              </div>

              {/* Orientações para os Cuidadores */}
              <div className="space-y-2 pt-1 border-t border-slate-100 dark:border-slate-700">
                <h5 className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  Instruções para Cuidadores & Copa da Residência
                </h5>
                <ul className="space-y-1">
                  {aiAssessment.guidanceForCaregivers.map((g, i) => (
                    <li key={i} className="text-xs text-slate-600 dark:text-slate-400 flex items-start gap-1.5">
                      <span className="text-teal-600 font-bold">•</span>
                      <span>{g}</span>
                    </li>
                  ))}
                </ul>
                <p className="text-xs text-slate-500 dark:text-slate-400 pt-1">
                  <strong>Monitoramento:</strong> {aiAssessment.monitoringPlan}
                </p>
              </div>
            </div>
          )}

        </div>

        {/* Modal Bottom Actions Footer */}
        <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrintPrescription}
              className="px-3.5 py-2 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center gap-1.5 transition-colors"
            >
              <Printer className="w-4 h-4 text-slate-500" />
              <span>Imprimir Ficha Nutricional</span>
            </button>

            {onOpenSOAPWithDraft && (
              <button
                type="button"
                onClick={handleTransferToSoap}
                className="px-3.5 py-2 rounded-xl text-xs font-bold text-teal-700 dark:text-teal-300 bg-teal-50 dark:bg-teal-950/60 border border-teal-200 dark:border-teal-800 hover:bg-teal-100 dark:hover:bg-teal-900/60 flex items-center gap-1.5 transition-colors"
              >
                <FileText className="w-4 h-4 text-teal-600" />
                <span>Gerar SOAP com Parecer</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
            >
              Fechar
            </button>

            <button
              type="button"
              onClick={handleSaveScreening}
              className="px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-black shadow-md shadow-teal-600/20 flex items-center gap-2 transition-all"
            >
              {isSaved ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>Triagem Salva!</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Salvar Triagem no Prontuário</span>
                </>
              )}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
