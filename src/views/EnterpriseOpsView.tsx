import React, { useState } from 'react';
import { 
  FinancialRecord, 
  InventoryItem, 
  LabResult, 
  OCRDocument, 
  BPMNWorkflowInstance, 
  QualityMetric, 
  FamilyNote,
  Resident,
  StaffTraining,
  AuditLogEntry
} from '../types';
import { 
  FileSearch, 
  Package, 
  DollarSign, 
  HeartHandshake, 
  GitMerge, 
  Sparkles, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  Upload, 
  Building2, 
  FileText, 
  FlaskConical, 
  TrendingUp, 
  Send, 
  UserCheck, 
  ShieldCheck, 
  Check, 
  X,
  Plus,
  GraduationCap,
  Lock,
  Radio,
  Layers,
  Calendar,
  ShoppingCart,
  Search,
  Filter,
  RefreshCw,
  AlertCircle,
  Tag
} from 'lucide-react';
import { AuditLogViewerModal } from '../components/AuditLogViewerModal';
import { AddInventoryModal } from '../components/AddInventoryModal';

interface EnterpriseOpsViewProps {
  residents: Resident[];
  financialRecords: FinancialRecord[];
  inventoryItems: InventoryItem[];
  labResults: LabResult[];
  ocrDocuments: OCRDocument[];
  bpmnWorkflows: BPMNWorkflowInstance[];
  qualityMetrics: QualityMetric[];
  familyNotes: FamilyNote[];
  staffTrainings?: StaffTraining[];
  auditLogs?: AuditLogEntry[];
  onAddFamilyNoteResponse?: (noteId: string, response: string) => void;
  onVerifyOCRDocument?: (docId: string) => void;
}

export const EnterpriseOpsView: React.FC<EnterpriseOpsViewProps> = ({
  residents,
  financialRecords,
  inventoryItems: initialInventoryItems,
  labResults,
  ocrDocuments,
  bpmnWorkflows,
  qualityMetrics,
  familyNotes,
  staffTrainings = [],
  auditLogs = [],
  onAddFamilyNoteResponse,
  onVerifyOCRDocument
}) => {
  const [activeTab, setActiveTab] = useState<'ocr_lab' | 'inventory' | 'financial' | 'family' | 'bpmn_quality' | 'trainings'>('ocr_lab');
  const [familyResponseInput, setFamilyResponseInput] = useState<{ [key: string]: string }>({});
  const [isSimulatingOCR, setIsSimulatingOCR] = useState(false);
  const [localOCRDocs, setLocalOCRDocs] = useState<OCRDocument[]>(ocrDocuments);
  const [isAuditModalOpen, setIsAuditModalOpen] = useState(false);

  // Local state for Smart Inventory Management
  const [inventoryList, setInventoryList] = useState<InventoryItem[]>(initialInventoryItems);
  const [isAddInventoryOpen, setIsAddInventoryOpen] = useState(false);
  const [inventorySearch, setInventorySearch] = useState('');
  const [inventoryCategoryFilter, setInventoryCategoryFilter] = useState<string>('Todos');
  const [orderNotice, setOrderNotice] = useState<string | null>(null);

  const handleAddInventoryItem = (newItem: InventoryItem) => {
    setInventoryList(prev => [newItem, ...prev]);
  };

  const handleReorderAI = (item: InventoryItem) => {
    // Restock / Trigger Purchase Order
    setInventoryList(prev => prev.map(inv => {
      if (inv.id !== item.id) return inv;
      const restockedQty = inv.stockCurrent + inv.suggestedPurchaseQty;
      return {
        ...inv,
        stockCurrent: restockedQty,
        estimatedConsumptionDays: Math.floor(restockedQty / 3) + 15
      };
    }));
    setOrderNotice(`✅ Pedido de reposição do item "${item.name}" (${item.suggestedPurchaseQty} un) gerado e estoque atualizado com sucesso!`);
    setTimeout(() => setOrderNotice(null), 5000);
  };

  // Handle OCR Document Upload Simulation
  const handleSimulateOCR = () => {
    setIsSimulatingOCR(true);
    setTimeout(() => {
      const newDoc: OCRDocument = {
        id: `ocr-${Date.now()}`,
        residentId: 'res-1',
        type: 'Receita Médica',
        fileName: 'receita_psiquiatrica_helena_julho.pdf',
        extractedText: 'Prescrição Médica Dr. Fernando Alencar. Paciente: Helena Vasconcelos. Uso Contínuo: Lítio 300mg (1cp de 12/12h), Quetiapina 25mg (1cp à noite), Risperidona 1mg (1cp de manhã).',
        structuredData: {
          medicationsFound: ['Carbonato de Lítio 300mg', 'Quetiapina 25mg', 'Risperidona 1mg'],
          diagnosesFound: ['F31.1 - Transtorno Afetivo Bipolar'],
          doctorCrm: 'CRM/SP 142.890',
          dateFound: '02/08/2026'
        },
        processedAt: new Date().toLocaleString('pt-BR'),
        verifiedByStaff: false
      };
      setLocalOCRDocs([newDoc, ...localOCRDocs]);
      setIsSimulatingOCR(false);
    }, 1500);
  };

  const handleVerifyOCR = (docId: string) => {
    setLocalOCRDocs(prev => prev.map(d => d.id === docId ? { ...d, verifiedByStaff: true } : d));
    if (onVerifyOCRDocument) onVerifyOCRDocument(docId);
  };

  const handleSendFamilyReply = (noteId: string) => {
    const replyText = familyResponseInput[noteId];
    if (!replyText) return;
    if (onAddFamilyNoteResponse) onAddFamilyNoteResponse(noteId, replyText);
    setFamilyResponseInput(prev => ({ ...prev, [noteId]: '' }));
  };

  return (
    <div className="space-y-6">
      
      {/* Header do Módulo Operacional Enterprise */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-teal-950 to-slate-900 text-white shadow-xl border border-teal-800/40 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Building2 className="w-6 h-6 text-teal-400" />
            <h1 className="text-xl font-bold tracking-tight">Gestão Operacional Enterprise & Suporte Clínico</h1>
          </div>
          <p className="text-xs text-slate-300 mt-1 max-w-2xl">
            Integração ponta a ponta: OCR de documentos médicos, Inteligência de Estoque, Faturamento SUS/Privado, Workflows BPMN 2.0 e Portal da Família.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsAuditModalOpen(true)}
            className="px-3 py-1.5 rounded-xl bg-teal-500/20 hover:bg-teal-500/30 text-teal-300 border border-teal-400/30 flex items-center gap-1.5 transition-colors text-xs font-semibold"
          >
            <Lock className="w-4 h-4 text-teal-400" />
            Trilha de Auditoria LGPD
          </button>

          <span className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-teal-500/20 text-teal-300 border border-teal-400/30 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-teal-400" />
            ISO 9001 / ONA 3
          </span>
        </div>
      </div>

      {/* Navegação por Abas Principais */}
      <div className="flex border-b border-zinc-200 bg-white rounded-xl p-1.5 shadow-2xs gap-1 overflow-x-auto text-xs font-semibold">
        <button
          onClick={() => setActiveTab('ocr_lab')}
          className={`flex-1 min-w-[170px] py-2.5 px-4 rounded-lg flex items-center justify-center gap-2 transition-all ${
            activeTab === 'ocr_lab'
              ? 'bg-teal-600 text-white shadow-xs'
              : 'text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900'
          }`}
        >
          <FileSearch className="w-4 h-4" />
          OCR Médico & Exames
        </button>

        <button
          onClick={() => setActiveTab('inventory')}
          className={`flex-1 min-w-[170px] py-2.5 px-4 rounded-lg flex items-center justify-center gap-2 transition-all ${
            activeTab === 'inventory'
              ? 'bg-teal-600 text-white shadow-xs'
              : 'text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900'
          }`}
        >
          <Package className="w-4 h-4" />
          Estoque & Suprimentos IA
        </button>

        <button
          onClick={() => setActiveTab('financial')}
          className={`flex-1 min-w-[170px] py-2.5 px-4 rounded-lg flex items-center justify-center gap-2 transition-all ${
            activeTab === 'financial'
              ? 'bg-teal-600 text-white shadow-xs'
              : 'text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900'
          }`}
        >
          <DollarSign className="w-4 h-4" />
          Financeiro & SUS/Convênio
        </button>

        <button
          onClick={() => setActiveTab('family')}
          className={`flex-1 min-w-[170px] py-2.5 px-4 rounded-lg flex items-center justify-center gap-2 transition-all ${
            activeTab === 'family'
              ? 'bg-teal-600 text-white shadow-xs'
              : 'text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900'
          }`}
        >
          <HeartHandshake className="w-4 h-4" />
          Portal da Família
        </button>

        <button
          onClick={() => setActiveTab('bpmn_quality')}
          className={`flex-1 min-w-[170px] py-2.5 px-4 rounded-lg flex items-center justify-center gap-2 transition-all ${
            activeTab === 'bpmn_quality'
              ? 'bg-teal-600 text-white shadow-xs'
              : 'text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900'
          }`}
        >
          <GitMerge className="w-4 h-4" />
          BPMN 2.0 & Qualidade
        </button>

        <button
          onClick={() => setActiveTab('trainings')}
          className={`flex-1 min-w-[170px] py-2.5 px-4 rounded-lg flex items-center justify-center gap-2 transition-all ${
            activeTab === 'trainings'
              ? 'bg-teal-600 text-white shadow-xs'
              : 'text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900'
          }`}
        >
          <GraduationCap className="w-4 h-4" />
          Treinamentos & NR32
        </button>
      </div>

      {/* ABA 1: OCR MEDICO E EXAMES LABORATORIAIS */}
      {activeTab === 'ocr_lab' && (
        <div className="space-y-6">
          
          {/* Seção OCR com IA */}
          <div className="bg-white p-5 rounded-2xl border border-zinc-200/80 shadow-2xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-100 pb-3">
              <div>
                <h2 className="text-sm font-bold text-zinc-900 flex items-center gap-2">
                  <FileSearch className="w-4 h-4 text-teal-600" />
                  Scanner OCR com Inteligência Artificial para Documentos Médicos
                </h2>
                <p className="text-xs text-zinc-500 mt-0.5">
                  Extração automática de receitas, laudos e atestados em formato estruturado (JSON) com auditoria humana obrigatória.
                </p>
              </div>

              <button
                onClick={handleSimulateOCR}
                disabled={isSimulatingOCR}
                className="px-3.5 py-2 bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs rounded-xl transition-all shadow-2xs flex items-center gap-1.5 shrink-0 disabled:opacity-50"
              >
                <Upload className="w-4 h-4" />
                {isSimulatingOCR ? 'Processando OCR IA...' : '+ Digitalizar Nova Receita'}
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {localOCRDocs.map((doc) => {
                const residentName = residents.find(r => r.id === doc.residentId)?.name || 'Residente Geral';

                return (
                  <div key={doc.id} className="bg-zinc-50 p-4 rounded-xl border border-zinc-200/80 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-zinc-900 bg-white px-2.5 py-1 rounded-md border border-zinc-200 shadow-2xs">
                        {doc.type}
                      </span>
                      <span className="text-[11px] text-zinc-400 font-medium">
                        {doc.processedAt}
                      </span>
                    </div>

                    <div>
                      <h3 className="text-xs font-bold text-teal-800">{residentName}</h3>
                      <p className="text-xs text-zinc-600 font-mono bg-white p-2.5 rounded-lg border border-zinc-200 mt-1 leading-relaxed">
                        "{doc.extractedText}"
                      </p>
                    </div>

                    <div className="p-3 bg-teal-50/60 rounded-lg border border-teal-200/60 text-xs space-y-1">
                      <span className="font-bold text-teal-900 block flex items-center gap-1">
                        <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                        Campos Estruturados Extraídos (JSON):
                      </span>
                      {doc.structuredData.medicationsFound && (
                        <p className="text-zinc-700">
                          <strong>Medicamentos:</strong> {doc.structuredData.medicationsFound.join(', ')}
                        </p>
                      )}
                      {doc.structuredData.doctorCrm && (
                        <p className="text-zinc-700">
                          <strong>CRM Prescritor:</strong> {doc.structuredData.doctorCrm}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center justify-between pt-1 text-xs">
                      {doc.verifiedByStaff ? (
                        <span className="text-emerald-700 font-semibold flex items-center gap-1">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          Validado pela Enfermagem RT
                        </span>
                      ) : (
                        <button
                          onClick={() => handleVerifyOCR(doc.id)}
                          className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white font-semibold rounded-lg shadow-2xs flex items-center gap-1 transition-colors"
                        >
                          <UserCheck className="w-3.5 h-3.5" />
                          Validar & Integrar ao Prontuário
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Seção Exames Laboratoriais */}
          <div className="bg-white p-5 rounded-2xl border border-zinc-200/80 shadow-2xs space-y-4">
            <div className="border-b border-zinc-100 pb-3">
              <h2 className="text-sm font-bold text-zinc-900 flex items-center gap-2">
                <FlaskConical className="w-4 h-4 text-purple-600" />
                Central de Resultados Laboratoriais & Exames Paraclínicos
              </h2>
              <p className="text-xs text-zinc-500 mt-0.5">
                Notificação proativa e destaque de parâmetros em desvio da faixa de referência.
              </p>
            </div>

            <div className="space-y-4">
              {labResults.map((lab) => {
                const residentName = residents.find(r => r.id === lab.residentId)?.name || 'Residente N/A';

                return (
                  <div key={lab.id} className="p-4 rounded-xl border border-zinc-200/80 bg-zinc-50/50 space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-zinc-200/60 pb-2">
                      <div>
                        <h3 className="text-xs font-bold text-zinc-900">{lab.examName}</h3>
                        <p className="text-[11px] text-zinc-500">
                          Residente: <strong>{residentName}</strong> | Laboratório: <strong>{lab.laboratoryName}</strong> | Data: {lab.date}
                        </p>
                      </div>
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold self-start sm:self-auto ${
                        lab.status === 'Alterado' ? 'bg-amber-100 text-amber-800 border border-amber-300' : 'bg-emerald-100 text-emerald-800'
                      }`}>
                        {lab.status}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                      {lab.results.map((res, idx) => (
                        <div key={idx} className={`p-2.5 rounded-lg border ${
                          res.isAbnormal ? 'bg-rose-50 border-rose-200 text-rose-900' : 'bg-white border-zinc-200 text-zinc-800'
                        }`}>
                          <span className="text-[11px] text-zinc-500 block truncate" title={res.parameter}>{res.parameter}</span>
                          <span className="font-bold text-sm block mt-0.5">{res.value}</span>
                          <span className="text-[10px] text-zinc-400 block">Ref: {res.referenceRange}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      )}

      {/* ABA 2: ESTOQUE E SUPRIMENTOS INTELIGENTES (FASE 2) */}
      {activeTab === 'inventory' && (
        <div className="space-y-6">

          {/* Toast Notice when Order Generated */}
          {orderNotice && (
            <div className="p-4 rounded-xl bg-emerald-50 text-emerald-900 border border-emerald-300 shadow-md flex items-center justify-between text-xs font-bold animate-in fade-in slide-in-from-top-2">
              <span className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                {orderNotice}
              </span>
              <button onClick={() => setOrderNotice(null)} className="p-1 text-emerald-700 hover:bg-emerald-100 rounded-lg">
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Header Bar */}
          <div className="bg-white p-5 rounded-2xl border border-zinc-200/80 shadow-2xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-100 pb-3">
              <div>
                <h2 className="text-sm font-bold text-zinc-900 flex items-center gap-2">
                  <Package className="w-5 h-5 text-teal-600" />
                  Módulo de Gestão de Estoque Inteligente & Lotes (Fase 2)
                </h2>
                <p className="text-xs text-zinc-500 mt-0.5">
                  Controle rigoroso de lotes, datas de validade (Regra FEFO), rastreabilidade ANVISA e emissão de alertas automáticos.
                </p>
              </div>

              <button 
                onClick={() => setIsAddInventoryOpen(true)}
                className="px-3.5 py-2 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-xl transition-all shadow-2xs flex items-center gap-1.5 shrink-0"
              >
                <Plus className="w-4 h-4" />
                + Cadastrar Insumo / Lote
              </button>
            </div>

            {/* KPI Cards summary */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
              <div className="p-3.5 rounded-xl bg-zinc-50 border border-zinc-200 space-y-1">
                <span className="text-zinc-500 font-semibold block text-[11px]">Total Insumos Cadastrados</span>
                <span className="text-lg font-bold text-zinc-900">{inventoryList.length} itens</span>
                <span className="text-[10px] text-zinc-400 block">Em 6 categorias ativas</span>
              </div>

              {(() => {
                const lowCount = inventoryList.filter(i => i.stockCurrent <= i.stockMinimum).length;
                return (
                  <div className={`p-3.5 rounded-xl border space-y-1 ${
                    lowCount > 0 ? 'bg-rose-50 border-rose-200 text-rose-900' : 'bg-zinc-50 border-zinc-200'
                  }`}>
                    <span className="font-semibold block text-[11px] flex items-center gap-1">
                      <AlertTriangle className={`w-3.5 h-3.5 ${lowCount > 0 ? 'text-rose-600 animate-bounce' : 'text-zinc-400'}`} />
                      Alertas Estoque Mínimo
                    </span>
                    <span className="text-lg font-bold">
                      {lowCount} {lowCount === 1 ? 'item' : 'itens'}
                    </span>
                    <span className="text-[10px] block opacity-80">
                      {lowCount > 0 ? '⚠️ Reposição urgente recomendada' : '✅ Estoques em nível seguro'}
                    </span>
                  </div>
                );
              })()}

              <div className="p-3.5 rounded-xl bg-teal-50/70 border border-teal-200 space-y-1">
                <span className="text-teal-900 font-semibold block text-[11px] flex items-center gap-1">
                  <Layers className="w-3.5 h-3.5 text-teal-600" />
                  Rastreabilidade de Lotes
                </span>
                <span className="text-lg font-bold text-teal-950">{inventoryList.length} lotes ANVISA</span>
                <span className="text-[10px] text-teal-700 block">Regra FEFO Ativa no Kardex</span>
              </div>

              <div className="p-3.5 rounded-xl bg-amber-50/70 border border-amber-200 space-y-1">
                <span className="text-amber-900 font-semibold block text-[11px] flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-amber-600" />
                  Validades Próximas (&lt;90 dias)
                </span>
                <span className="text-lg font-bold text-amber-950">
                  {inventoryList.filter(i => i.expirationDate.includes('2026')).length} itens
                </span>
                <span className="text-[10px] text-amber-700 block">Prioritários para dispensa</span>
              </div>
            </div>
          </div>

          {/* GERAÇÃO DE ALERTAS AUTOMÁTICOS QUANDO OS ITENS ATINGIREM O ESTOQUE MÍNIMO */}
          {(() => {
            const criticalItems = inventoryList.filter(i => i.stockCurrent <= i.stockMinimum);
            if (criticalItems.length === 0) return null;

            return (
              <div className="p-5 rounded-2xl bg-gradient-to-r from-rose-950 via-rose-900 to-slate-900 text-white shadow-lg border border-rose-700/60 space-y-4">
                <div className="flex items-start justify-between gap-3 border-b border-rose-800/80 pb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-xl bg-rose-500/20 border border-rose-400/40 text-rose-300 animate-pulse">
                      <AlertCircle className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-rose-100 flex items-center gap-2">
                        Alerta Automático de Estoque Mínimo Gerado pela IA ({criticalItems.length} {criticalItems.length === 1 ? 'insumo crítico' : 'insumos críticos'})
                      </h3>
                      <p className="text-xs text-rose-200/80 mt-0.5">
                        O motor de simulação identificou que os itens abaixo atingiram ou ultrapassaram a margem de segurança. Clique para reabastecer com 1 toque.
                      </p>
                    </div>
                  </div>

                  <span className="px-2.5 py-1 rounded-lg bg-rose-500/30 text-rose-200 border border-rose-400/30 text-[11px] font-bold shrink-0">
                    Ação Preventiva Necessária
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {criticalItems.map((item) => (
                    <div key={item.id} className="p-3.5 rounded-xl bg-white/10 backdrop-blur-xs border border-rose-400/30 flex flex-col justify-between gap-3">
                      <div>
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-xs text-white">{item.name}</span>
                          <span className="font-mono text-[10px] text-rose-200 bg-rose-900/60 px-2 py-0.5 rounded border border-rose-500/30">
                            {item.category}
                          </span>
                        </div>

                        <div className="mt-2 text-xs text-rose-100 flex items-center justify-between">
                          <span>Estoque Atual: <strong className="text-rose-300 font-bold text-sm">{item.stockCurrent} {item.unit}s</strong></span>
                          <span>Estoque Mínimo: <strong>{item.stockMinimum} {item.unit}s</strong></span>
                        </div>

                        <div className="w-full bg-rose-950/80 rounded-full h-2 mt-1.5 overflow-hidden border border-rose-800">
                          <div 
                            className="bg-rose-500 h-full rounded-full transition-all duration-300" 
                            style={{ width: `${Math.min(100, Math.max(5, (item.stockCurrent / item.stockMinimum) * 100))}%` }} 
                          />
                        </div>
                      </div>

                      <button
                        onClick={() => handleReorderAI(item)}
                        className="w-full py-2 bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-600 hover:to-emerald-700 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5"
                      >
                        <ShoppingCart className="w-4 h-4" />
                        🤖 Gerar Pedido de Reposição IA (+{item.suggestedPurchaseQty} {item.unit}s)
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            );
          })()}

          {/* Search & Category Filter Bar */}
          <div className="bg-white p-4 rounded-2xl border border-zinc-200/80 shadow-2xs flex flex-col md:flex-row items-center justify-between gap-3 text-xs">
            <div className="relative w-full md:w-80">
              <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Buscar por nome, lote (L-...) ou código..."
                value={inventorySearch}
                onChange={(e) => setInventorySearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-zinc-50 border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 font-medium"
              />
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
              <Filter className="w-4 h-4 text-zinc-400 shrink-0 mr-1" />
              {['Todos', 'Medicamento', 'Material Médico', 'Fralda', 'EPI', 'Apenas Crítico'].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setInventoryCategoryFilter(cat)}
                  className={`px-3 py-1.5 rounded-lg font-semibold shrink-0 transition-all ${
                    inventoryCategoryFilter === cat
                      ? 'bg-teal-600 text-white shadow-2xs'
                      : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Inventory Table with Batch & Expiration Control */}
          <div className="bg-white rounded-2xl border border-zinc-200/80 shadow-2xs overflow-hidden">
            <div className="p-4 border-b border-zinc-100 flex items-center justify-between">
              <span className="font-bold text-xs text-zinc-800 flex items-center gap-2">
                <Layers className="w-4 h-4 text-teal-600" />
                Catálogo de Insumos, Lotes Registrados & Validade FEFO
              </span>
              <span className="text-[11px] text-zinc-500">
                Apresentando {inventoryList.length} itens no controle geral
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-zinc-100/80 text-zinc-600 font-bold uppercase tracking-wider border-b border-zinc-200">
                  <tr>
                    <th className="p-3">Código / Item</th>
                    <th className="p-3">Categoria</th>
                    <th className="p-3">Estoque / Mínimo</th>
                    <th className="p-3">Lote (ANVISA)</th>
                    <th className="p-3">Validade & FEFO</th>
                    <th className="p-3">Autonomia Est.</th>
                    <th className="p-3 text-right">Ação de Reposição</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100">
                  {inventoryList
                    .filter((item) => {
                      const matchesSearch = item.name.toLowerCase().includes(inventorySearch.toLowerCase()) ||
                        item.batchNumber.toLowerCase().includes(inventorySearch.toLowerCase()) ||
                        item.code.toLowerCase().includes(inventorySearch.toLowerCase());
                      
                      if (!matchesSearch) return false;
                      if (inventoryCategoryFilter === 'Todos') return true;
                      if (inventoryCategoryFilter === 'Apenas Crítico') return item.stockCurrent <= item.stockMinimum;
                      return item.category === inventoryCategoryFilter;
                    })
                    .map((item) => {
                      const isLow = item.stockCurrent <= item.stockMinimum;
                      const isExpiringSoon = item.expirationDate.includes('2026');

                      return (
                        <tr key={item.id} className={`hover:bg-zinc-50/80 transition-colors ${isLow ? 'bg-rose-50/30' : ''}`}>
                          <td className="p-3 font-semibold text-zinc-900">
                            <div className="font-bold text-zinc-900">{item.name}</div>
                            <span className="text-[10px] text-zinc-400 font-mono">{item.code}</span>
                          </td>

                          <td className="p-3">
                            <span className="px-2 py-0.5 rounded-md text-[11px] font-semibold bg-zinc-100 text-zinc-700 border border-zinc-200">
                              {item.category}
                            </span>
                          </td>

                          <td className="p-3">
                            <div className="flex items-center gap-2">
                              <span className={`font-bold px-2 py-0.5 rounded text-xs ${
                                isLow ? 'bg-rose-100 text-rose-800 border border-rose-300' : 'bg-emerald-100 text-emerald-800'
                              }`}>
                                {item.stockCurrent} {item.unit}s
                              </span>
                              <span className="text-[10px] text-zinc-400">(Mín: {item.stockMinimum})</span>
                            </div>
                          </td>

                          <td className="p-3">
                            <div className="font-mono text-xs text-zinc-800 font-bold flex items-center gap-1">
                              <Tag className="w-3.5 h-3.5 text-teal-600" />
                              {item.batchNumber}
                            </div>
                            <span className="text-[10px] text-teal-700 font-semibold block">
                              Lote Rastreado
                            </span>
                          </td>

                          <td className="p-3">
                            <div className={`font-mono text-xs font-bold flex items-center gap-1 ${
                              isExpiringSoon ? 'text-amber-800' : 'text-zinc-700'
                            }`}>
                              <Calendar className="w-3.5 h-3.5 text-zinc-400" />
                              {item.expirationDate}
                            </div>
                            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded inline-block mt-0.5 ${
                              isExpiringSoon ? 'bg-amber-100 text-amber-800 border border-amber-300' : 'bg-teal-50 text-teal-800'
                            }`}>
                              {isExpiringSoon ? '⚠️ Validade Atenta (FEFO 1º)' : '✅ Dispensa Regular'}
                            </span>
                          </td>

                          <td className="p-3 font-bold text-amber-800">
                            ~{item.estimatedConsumptionDays} dias
                          </td>

                          <td className="p-3 text-right">
                            <button 
                              onClick={() => handleReorderAI(item)}
                              className={`px-3 py-1.5 font-bold rounded-lg shadow-2xs text-xs transition-all flex items-center gap-1 ml-auto ${
                                isLow 
                                  ? 'bg-rose-600 hover:bg-rose-700 text-white' 
                                  : 'bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200'
                              }`}
                            >
                              <RefreshCw className="w-3.5 h-3.5" />
                              {isLow ? `Repor IA (+${item.suggestedPurchaseQty})` : `+ Entrada Lote`}
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Render Modal Entrada de Insumo com Lote */}
          <AddInventoryModal
            isOpen={isAddInventoryOpen}
            onClose={() => setIsAddInventoryOpen(false)}
            onAdd={handleAddInventoryItem}
          />

        </div>
      )}

      {/* ABA 3: GESTÃO FINANCEIRA E FATURAMENTO */}
      {activeTab === 'financial' && (
        <div className="bg-white p-5 rounded-2xl border border-zinc-200/80 shadow-2xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-100 pb-3">
            <div>
              <h2 className="text-sm font-bold text-zinc-900 flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-emerald-600" />
                Faturamento Integrado, Mensalidades & Guias SUS / Convênio
              </h2>
              <p className="text-xs text-zinc-500 mt-0.5">
                Controle de receitas por mensalidades de residentes, repasses SUS, reembolsos de guias de convênio e boletos.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-zinc-700 bg-zinc-100 px-3 py-1.5 rounded-lg border border-zinc-200">
                Total a Receber: <strong>R$ 28.950,00</strong>
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {financialRecords.map((fin) => (
              <div key={fin.id} className="p-4 rounded-xl border border-zinc-200 bg-zinc-50/50 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-teal-800 bg-teal-50 px-2.5 py-0.5 rounded border border-teal-200">
                    {fin.type}
                  </span>
                  <span className={`px-2 py-0.5 rounded text-xs font-bold ${
                    fin.status === 'Pago' ? 'bg-emerald-100 text-emerald-800' :
                    fin.status === 'Pendente' ? 'bg-amber-100 text-amber-800' : 'bg-rose-100 text-rose-800'
                  }`}>
                    {fin.status}
                  </span>
                </div>

                <div>
                  <h3 className="text-xs font-bold text-zinc-900">{fin.residentName || 'Insumo Geral'}</h3>
                  <p className="text-xs text-zinc-500">Centro de Custo: {fin.costCenter}</p>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-zinc-200/60 text-xs">
                  <span className="font-extrabold text-zinc-900 text-sm">
                    R$ {fin.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </span>
                  <span className="text-zinc-500">
                    Vencimento: <strong>{fin.dueDate}</strong> | {fin.paymentMethod}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ABA 4: PORTAL DA FAMÍLIA */}
      {activeTab === 'family' && (
        <div className="bg-white p-5 rounded-2xl border border-zinc-200/80 shadow-2xs space-y-4">
          <div className="border-b border-zinc-100 pb-3">
            <h2 className="text-sm font-bold text-zinc-900 flex items-center gap-2">
              <HeartHandshake className="w-4 h-4 text-rose-600" />
              Portal de Comunicação e Engajamento Familiar
            </h2>
            <p className="text-xs text-zinc-500 mt-0.5">
              Canal auditado e moderado pela equipe multidisciplinar para recados familiares e agendamentos de visitas.
            </p>
          </div>

          <div className="space-y-4">
            {familyNotes.map((note) => {
              const residentName = residents.find(r => r.id === note.residentId)?.name || 'Residente N/A';

              return (
                <div key={note.id} className="p-4 rounded-xl border border-zinc-200 bg-zinc-50 space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <div>
                      <span className="font-bold text-zinc-900">{note.familyName}</span>
                      <span className="text-zinc-500"> ({note.kinship} de {residentName})</span>
                    </div>
                    <span className="text-zinc-400">{note.date}</span>
                  </div>

                  <p className="text-xs text-zinc-700 bg-white p-3 rounded-lg border border-zinc-200 italic">
                    "{note.message}"
                  </p>

                  {note.staffResponse ? (
                    <div className="p-3 bg-teal-50 rounded-lg border border-teal-200/80 text-xs text-teal-950 space-y-1">
                      <span className="font-bold block">Resposta Oficial da Equipe:</span>
                      <p>{note.staffResponse}</p>
                    </div>
                  ) : (
                    <div className="space-y-2 pt-1">
                      <input
                        type="text"
                        placeholder="Digite a resposta oficial da equipe..."
                        value={familyResponseInput[note.id] || ''}
                        onChange={(e) => setFamilyResponseInput({ ...familyResponseInput, [note.id]: e.target.value })}
                        className="w-full px-3 py-2 text-xs rounded-lg border border-zinc-300 focus:outline-none focus:ring-2 focus:ring-teal-500"
                      />
                      <button
                        onClick={() => handleSendFamilyReply(note.id)}
                        className="px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs rounded-lg flex items-center gap-1 shadow-2xs transition-colors"
                      >
                        <Send className="w-3.5 h-3.5" />
                        Responder Família
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ABA 5: BPMN WORKFLOWS & QUALIDADE */}
      {activeTab === 'bpmn_quality' && (
        <div className="space-y-6">
          
          {/* Workflows BPMN 2.0 */}
          <div className="bg-white p-5 rounded-2xl border border-zinc-200/80 shadow-2xs space-y-4">
            <div className="border-b border-zinc-100 pb-3">
              <h2 className="text-sm font-bold text-zinc-900 flex items-center gap-2">
                <GitMerge className="w-4 h-4 text-teal-600" />
                Motor de Workflows Clínicos BPMN 2.0
              </h2>
              <p className="text-xs text-zinc-500 mt-0.5">
                Execução autônoma e orquestrada de protocolos de queda, admissão e gerenciamento de crises.
              </p>
            </div>

            <div className="space-y-3">
              {bpmnWorkflows.map((flow) => (
                <div key={flow.id} className="p-4 rounded-xl border border-zinc-200 bg-zinc-50 space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-teal-800 bg-teal-100 px-2.5 py-0.5 rounded">
                      {flow.processName}
                    </span>
                    <span className="text-zinc-500">Iniciado em: {flow.startedAt}</span>
                  </div>

                  <div>
                    <h3 className="text-xs font-bold text-zinc-900">Residente: {flow.residentName}</h3>
                    <p className="text-xs text-zinc-600 mt-1">
                      Etapa Atual: <strong className="text-teal-700">{flow.currentState}</strong> | Responsável: <strong>{flow.assignedRole}</strong>
                    </p>
                  </div>

                  <div className="p-2.5 bg-white rounded-lg border border-zinc-200 text-xs">
                    <span className="font-semibold text-zinc-500 block mb-1">Passos Concluídos do Protocolo:</span>
                    <div className="flex flex-wrap gap-1.5">
                      {flow.stepsCompleted.map((step, idx) => (
                        <span key={idx} className="bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded text-[11px] font-medium flex items-center gap-1">
                          <Check className="w-3 h-3 text-emerald-600" />
                          {step}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Indicadores de Qualidade ONA */}
          <div className="bg-white p-5 rounded-2xl border border-zinc-200/80 shadow-2xs space-y-4">
            <div className="border-b border-zinc-100 pb-3">
              <h2 className="text-sm font-bold text-zinc-900 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-emerald-600" />
                Painel de Qualidade e Governança Clínica (KPIs ONA / ISO 9001)
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {qualityMetrics.map((kpi) => (
                <div key={kpi.id} className="p-4 rounded-xl border border-zinc-200 bg-zinc-50 space-y-2">
                  <span className="text-xs text-zinc-500 block font-semibold truncate" title={kpi.indicator}>{kpi.indicator}</span>
                  <div className="flex items-baseline justify-between">
                    <span className="text-2xl font-black text-zinc-900">{kpi.value}</span>
                    <span className="text-xs text-zinc-400">Meta: {kpi.target}</span>
                  </div>
                  <span className="inline-block px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[11px] font-bold rounded">
                    {kpi.status}
                  </span>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

      {/* ABA 6: GESTÃO DE TREINAMENTOS MULTIPROFISSIONAIS (NR32, BLS, LGPD) */}
      {activeTab === 'trainings' && (
        <div className="bg-white p-5 rounded-2xl border border-zinc-200/80 shadow-2xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-100 pb-3">
            <div>
              <h2 className="text-sm font-bold text-zinc-900 flex items-center gap-2">
                <GraduationCap className="w-4 h-4 text-teal-600" />
                Matriz de Capacitação, Treinamentos & Biossegurança (NR32 / BLS / LGPD)
              </h2>
              <p className="text-xs text-zinc-500 mt-0.5">
                Controle contínuo de reciclagem e certificações da equipe multidisciplinar.
              </p>
            </div>

            <button className="px-3.5 py-2 bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs rounded-xl transition-all shadow-2xs flex items-center gap-1.5 shrink-0">
              <Plus className="w-4 h-4" />
              + Registrar Treinamento
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {staffTrainings.map((train) => (
              <div key={train.id} className="p-4 rounded-xl border border-zinc-200 bg-zinc-50 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-zinc-900">{train.staffName}</span>
                  <span className={`px-2.5 py-0.5 rounded text-[11px] font-bold ${
                    train.status === 'Válido' ? 'bg-emerald-100 text-emerald-800' :
                    train.status === 'A Vencer' ? 'bg-amber-100 text-amber-800' : 'bg-rose-100 text-rose-800'
                  }`}>
                    {train.status}
                  </span>
                </div>

                <div>
                  <span className="text-xs font-bold text-teal-800 block">{train.topic}</span>
                  <span className="text-xs text-zinc-500 block">Cargo: {train.role}</span>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-zinc-200 text-xs text-zinc-500">
                  <span>Concluído: <strong>{train.completedDate}</strong></span>
                  <span>Validade: <strong>{train.expirationDate}</strong></span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modal Trilha de Auditoria LGPD */}
      <AuditLogViewerModal
        isOpen={isAuditModalOpen}
        onClose={() => setIsAuditModalOpen(false)}
        auditLogs={auditLogs}
      />

    </div>
  );
};
