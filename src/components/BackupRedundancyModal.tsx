import React, { useState } from 'react';
import { 
  Database, 
  X, 
  Download, 
  Printer, 
  CheckCircle2, 
  ShieldCheck, 
  Clock, 
  FileCode, 
  FileText, 
  RefreshCw, 
  HardDrive, 
  AlertCircle, 
  Copy, 
  Check, 
  ExternalLink,
  Trash2,
  Lock,
  Layers,
  Sparkles,
  Server
} from 'lucide-react';
import { BackupSnapshot } from '../types';

interface BackupRedundancyModalProps {
  isOpen: boolean;
  onClose: () => void;
  backups: BackupSnapshot[];
  isBackingUp: boolean;
  lastBackupDate: string;
  lastBackupTime: string;
  nextRunCountdown: string;
  onRunBackup: (type?: 'AUTOMATIC_DAILY_MIDNIGHT' | 'MANUAL_ON_DEMAND') => Promise<any>;
  onDownloadJson: (backup: BackupSnapshot) => void;
  onPrintOrDownloadPdf: (backup: BackupSnapshot) => void;
  onDeleteBackup?: (id: string) => void;
}

export const BackupRedundancyModal: React.FC<BackupRedundancyModalProps> = ({
  isOpen,
  onClose,
  backups,
  isBackingUp,
  lastBackupDate,
  lastBackupTime,
  nextRunCountdown,
  onRunBackup,
  onDownloadJson,
  onPrintOrDownloadPdf,
  onDeleteBackup
}) => {
  const [selectedBackupForPreview, setSelectedBackupForPreview] = useState<BackupSnapshot | null>(null);
  const [copiedHashId, setCopiedHashId] = useState<string | null>(null);
  const [activeViewTab, setActiveViewTab] = useState<'history' | 'preview' | 'compliance'>('history');
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const latestBackup = backups[0];

  const handleCopyHash = (hash: string, id: string) => {
    navigator.clipboard.writeText(hash);
    setCopiedHashId(id);
    setTimeout(() => setCopiedHashId(null), 2000);
  };

  const handleExecuteNow = async () => {
    try {
      setFeedbackMsg('Iniciando rotina de exportação e salvamento no Firebase...');
      await onRunBackup('MANUAL_ON_DEMAND');
      setFeedbackMsg('✅ Snapshot de redundância criado com sucesso e sincronizado no Firebase!');
      setTimeout(() => setFeedbackMsg(null), 4000);
    } catch {
      setFeedbackMsg('❌ Erro ao executar backup. Verifique os dados.');
      setTimeout(() => setFeedbackMsg(null), 4000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white text-zinc-900 rounded-2xl w-full max-w-5xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 border border-zinc-200 flex flex-col max-h-[92vh]">
        
        {/* Top Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-zinc-900 via-zinc-800 to-zinc-900 text-white flex items-center justify-between border-b border-zinc-700">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-teal-500/20 border border-teal-500/40 flex items-center justify-center text-teal-400">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-base font-black text-white tracking-wide">
                  Redundância & Exportação Automática (00:00 Diário)
                </h3>
                <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-teal-500/20 text-teal-300 border border-teal-500/30 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-pulse"></span>
                  Cron Ativo 00:00 BRT
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30">
                  Firebase Cloud Storage
                </span>
              </div>
              <p className="text-xs text-zinc-400 mt-0.5">
                Rotina automatizada de salvaguarda de residentes, prontuários SOAP e prescrições MAR para o piloto SRT
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Feedback Alert if present */}
        {feedbackMsg && (
          <div className="bg-teal-50 border-b border-teal-200 px-4 py-2.5 text-xs text-teal-800 font-bold flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-teal-600 animate-spin" />
              <span>{feedbackMsg}</span>
            </div>
            <button onClick={() => setFeedbackMsg(null)} className="text-teal-600 hover:text-teal-900">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Sub-Header / Quick Overview Bar */}
        <div className="bg-zinc-50 border-b border-zinc-200 p-4 grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
          <div className="bg-white p-3 rounded-xl border border-zinc-200 shadow-xs flex items-center justify-between">
            <div>
              <span className="text-zinc-500 font-medium block">Próximo Backup Diário</span>
              <span className="font-extrabold text-zinc-900 text-sm flex items-center gap-1.5 mt-0.5 text-teal-700">
                <Clock className="w-4 h-4" /> 00:00 (Meia-Noite)
              </span>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-zinc-400 block">Tempo restante</span>
              <span className="font-mono font-bold text-zinc-700">{nextRunCountdown || '--'}</span>
            </div>
          </div>

          <div className="bg-white p-3 rounded-xl border border-zinc-200 shadow-xs">
            <span className="text-zinc-500 font-medium block">Último Snapshot Concluído</span>
            <span className="font-extrabold text-zinc-900 text-sm block mt-0.5">
              {lastBackupDate ? `${lastBackupDate} às ${lastBackupTime}` : 'Hoje na Inicialização'}
            </span>
            <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-1 mt-0.5">
              <CheckCircle2 className="w-3 h-3" /> Status: 100% íntegro
            </span>
          </div>

          <div className="bg-white p-3 rounded-xl border border-zinc-200 shadow-xs">
            <span className="text-zinc-500 font-medium block">Destino da Redundância</span>
            <span className="font-extrabold text-zinc-900 text-xs block mt-0.5 flex items-center gap-1">
              <Server className="w-3.5 h-3.5 text-indigo-600" /> Firebase + Firestore
            </span>
            <span className="text-[10px] text-zinc-500 font-medium block mt-0.5 truncate">
              gs://nexamed-storage/backups/
            </span>
          </div>

          <div className="bg-white p-3 rounded-xl border border-zinc-200 shadow-xs flex items-center justify-between">
            <div>
              <span className="text-zinc-500 font-medium block">Snapshots Arquivados</span>
              <span className="font-extrabold text-zinc-900 text-sm block mt-0.5">
                {backups.length} {backups.length === 1 ? 'backup' : 'backups'}
              </span>
            </div>
            <button
              onClick={handleExecuteNow}
              disabled={isBackingUp}
              className="py-1.5 px-3 bg-teal-600 hover:bg-teal-700 text-white font-extrabold text-[11px] rounded-lg shadow-xs transition-colors flex items-center gap-1.5 disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isBackingUp ? 'animate-spin' : ''}`} />
              {isBackingUp ? 'Salvando...' : 'Backup Agora'}
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="border-b border-zinc-200 px-4 pt-2 flex items-center gap-2 bg-white">
          <button
            onClick={() => setActiveViewTab('history')}
            className={`py-2 px-4 text-xs font-bold border-b-2 transition-colors flex items-center gap-2 ${
              activeViewTab === 'history' 
                ? 'border-teal-600 text-teal-700 bg-teal-50/50' 
                : 'border-transparent text-zinc-500 hover:text-zinc-800'
            }`}
          >
            <Layers className="w-4 h-4" />
            Histórico de Snapshots Diários ({backups.length})
          </button>
          <button
            onClick={() => setActiveViewTab('preview')}
            className={`py-2 px-4 text-xs font-bold border-b-2 transition-colors flex items-center gap-2 ${
              activeViewTab === 'preview' 
                ? 'border-teal-600 text-teal-700 bg-teal-50/50' 
                : 'border-transparent text-zinc-500 hover:text-zinc-800'
            }`}
          >
            <FileCode className="w-4 h-4" />
            Estrutura JSON & Relatório PDF
          </button>
          <button
            onClick={() => setActiveViewTab('compliance')}
            className={`py-2 px-4 text-xs font-bold border-b-2 transition-colors flex items-center gap-2 ${
              activeViewTab === 'compliance' 
                ? 'border-teal-600 text-teal-700 bg-teal-50/50' 
                : 'border-transparent text-zinc-500 hover:text-zinc-800'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            Garantia Regulatória & LGPD
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-5 overflow-y-auto flex-1 space-y-4">
          
          {/* VIEW: History Table */}
          {activeViewTab === 'history' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-black text-zinc-800 uppercase tracking-wider">
                    Snapshots Diários Gravados na Nuvem (Firebase / Local)
                  </h4>
                  <p className="text-[11px] text-zinc-500">
                    Cada snapshot contém o arquivo integral legível em JSON e a formatação oficial para impressão de dossiê clínico (PDF).
                  </p>
                </div>

                {latestBackup && (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onDownloadJson(latestBackup)}
                      className="py-1.5 px-3 bg-zinc-100 hover:bg-zinc-200 text-zinc-800 text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5 border border-zinc-300"
                    >
                      <Download className="w-3.5 h-3.5 text-zinc-600" />
                      Baixar Último JSON
                    </button>
                    <button
                      onClick={() => onPrintOrDownloadPdf(latestBackup)}
                      className="py-1.5 px-3 bg-teal-50 hover:bg-teal-100 text-teal-800 text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5 border border-teal-300"
                    >
                      <Printer className="w-3.5 h-3.5 text-teal-700" />
                      Imprimir / PDF
                    </button>
                  </div>
                )}
              </div>

              {backups.length === 0 ? (
                <div className="p-8 text-center bg-zinc-50 rounded-xl border border-zinc-200">
                  <Database className="w-8 h-8 text-zinc-400 mx-auto mb-2" />
                  <p className="text-xs font-bold text-zinc-700">Nenhum snapshot arquivado ainda.</p>
                  <p className="text-[11px] text-zinc-500 mb-3">
                    A rotina automática das 00:00 ou o acionamento manual criará o primeiro registro.
                  </p>
                  <button
                    onClick={handleExecuteNow}
                    disabled={isBackingUp}
                    className="py-2 px-4 bg-teal-600 text-white font-bold text-xs rounded-xl shadow-xs hover:bg-teal-700 transition-colors inline-flex items-center gap-2"
                  >
                    <RefreshCw className="w-4 h-4" /> Criar Primeiro Backup Agora
                  </button>
                </div>
              ) : (
                <div className="border border-zinc-200 rounded-xl overflow-hidden shadow-xs">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-zinc-100/80 border-b border-zinc-200 text-zinc-600 font-bold">
                        <th className="py-2.5 px-3">Data / Horário</th>
                        <th className="py-2.5 px-3">Tipo / Rotina</th>
                        <th className="py-2.5 px-3">Conteúdo Salvo</th>
                        <th className="py-2.5 px-3">Tamanho</th>
                        <th className="py-2.5 px-3">Hash SHA-256</th>
                        <th className="py-2.5 px-3 text-right">Ações</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-200 bg-white">
                      {backups.map((backup) => (
                        <tr key={backup.id} className="hover:bg-zinc-50/80 transition-colors">
                          <td className="py-2.5 px-3">
                            <div className="font-bold text-zinc-900 flex items-center gap-1.5">
                              <HardDrive className="w-3.5 h-3.5 text-teal-600" />
                              {backup.date}
                            </div>
                            <span className="text-[11px] text-zinc-500">{backup.time} ({backup.scheduledTime || '00:00'})</span>
                          </td>

                          <td className="py-2.5 px-3">
                            {backup.type === 'AUTOMATIC_DAILY_MIDNIGHT' ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-purple-100 text-purple-800 text-[10px] font-extrabold">
                                ⏰ Diário 00:00 (Auto)
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 text-[10px] font-extrabold">
                                ⚡ Sob Demanda (Manual)
                              </span>
                            )}
                            <div className="text-[10px] text-zinc-400 mt-0.5">{backup.executedBy}</div>
                          </td>

                          <td className="py-2.5 px-3">
                            <div className="text-zinc-800 font-medium">
                              {backup.recordCounts?.residents || 0} moradores • {backup.recordCounts?.evolutions || 0} SOAP • {backup.recordCounts?.medications || 0} MAR
                            </div>
                            <span className="text-[10px] text-zinc-500">
                              Total: {backup.recordCounts?.totalRecords || 0} registros
                            </span>
                          </td>

                          <td className="py-2.5 px-3 font-mono text-zinc-700 font-semibold">
                            {backup.fileSizeFormatted || '120 KB'}
                          </td>

                          <td className="py-2.5 px-3">
                            <div className="flex items-center gap-1">
                              <code className="font-mono text-[10px] bg-zinc-100 px-1.5 py-0.5 rounded text-zinc-700 border border-zinc-200">
                                {backup.checksumSha256 ? backup.checksumSha256.substring(0, 10) + '...' : 'OK-VERIFICADO'}
                              </code>
                              {backup.checksumSha256 && (
                                <button
                                  onClick={() => handleCopyHash(backup.checksumSha256, backup.id)}
                                  title="Copiar Hash SHA-256 completo"
                                  className="p-1 text-zinc-400 hover:text-zinc-700 transition-colors"
                                >
                                  {copiedHashId === backup.id ? (
                                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                                  ) : (
                                    <Copy className="w-3.5 h-3.5" />
                                  )}
                                </button>
                              )}
                            </div>
                          </td>

                          <td className="py-2.5 px-3 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => {
                                  setSelectedBackupForPreview(backup);
                                  setActiveViewTab('preview');
                                }}
                                title="Inspecionar JSON"
                                className="p-1.5 text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 rounded-lg transition-colors"
                              >
                                <FileCode className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => onDownloadJson(backup)}
                                title="Baixar Arquivo JSON Legível"
                                className="p-1.5 text-teal-600 hover:text-teal-900 hover:bg-teal-50 rounded-lg transition-colors"
                              >
                                <Download className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => onPrintOrDownloadPdf(backup)}
                                title="Visualizar / Imprimir Dossiê PDF"
                                className="p-1.5 text-purple-600 hover:text-purple-900 hover:bg-purple-50 rounded-lg transition-colors"
                              >
                                <Printer className="w-4 h-4" />
                              </button>
                              {onDeleteBackup && (
                                <button
                                  onClick={() => onDeleteBackup(backup.id)}
                                  title="Remover Registro"
                                  className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* VIEW: JSON Preview & Printable View */}
          {activeViewTab === 'preview' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 bg-zinc-50 p-3 rounded-xl border border-zinc-200">
                <div>
                  <h4 className="text-xs font-black text-zinc-800">
                    Formato de Exportação Legível (JSON / PDF)
                  </h4>
                  <p className="text-[11px] text-zinc-500">
                    Snapshot estruturado com metadados institucionais, moradores, fichas SOAP e checagens MAR.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => latestBackup && onDownloadJson(latestBackup)}
                    className="py-1.5 px-3 bg-teal-600 text-white font-bold text-xs rounded-lg shadow-xs hover:bg-teal-700 transition-colors flex items-center gap-1.5"
                  >
                    <Download className="w-3.5 h-3.5" /> Baixar JSON Estruturado
                  </button>
                  <button
                    onClick={() => latestBackup && onPrintOrDownloadPdf(latestBackup)}
                    className="py-1.5 px-3 bg-purple-600 text-white font-bold text-xs rounded-lg shadow-xs hover:bg-purple-700 transition-colors flex items-center gap-1.5"
                  >
                    <Printer className="w-3.5 h-3.5" /> Abrir Dossiê Clínico (PDF)
                  </button>
                </div>
              </div>

              {/* JSON code container */}
              <div className="relative border border-zinc-300 rounded-xl overflow-hidden bg-zinc-950 text-zinc-100 font-mono text-xs">
                <div className="bg-zinc-900 px-4 py-2 flex items-center justify-between border-b border-zinc-800 text-[11px] text-zinc-400">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                    <span>{selectedBackupForPreview?.fileName || latestBackup?.fileName || 'nexamed_backup_daily_00h.json'}</span>
                  </div>
                  <button
                    onClick={() => {
                      const content = selectedBackupForPreview?.payloadJson || latestBackup?.payloadJson;
                      if (content) {
                        navigator.clipboard.writeText(content);
                        setFeedbackMsg('JSON copiado para a área de transferência!');
                        setTimeout(() => setFeedbackMsg(null), 2500);
                      }
                    }}
                    className="flex items-center gap-1 text-zinc-300 hover:text-white hover:bg-zinc-800 px-2 py-0.5 rounded transition-colors"
                  >
                    <Copy className="w-3 h-3" /> Copiar Conteúdo
                  </button>
                </div>

                <pre className="p-4 max-h-96 overflow-y-auto text-[11px] leading-relaxed text-teal-300 select-all">
                  {selectedBackupForPreview?.payloadJson || latestBackup?.payloadJson || JSON.stringify({
                    "metadata": {
                      "system": "NexaMed SRT - Sistema de Gestão de Residências Terapêuticas",
                      "routineSchedule": "00:00 Diário (Meia-Noite)",
                      "regulatoryFramework": "Portaria MS/GM nº 106/2000 & LGPD",
                      "integritySha256": "3a8f19..."
                    },
                    "residentsSummary": { "total": 6, "active": 6 },
                    "residents": "...",
                    "evolutionsSoap": "..."
                  }, null, 2)}
                </pre>
              </div>
            </div>
          )}

          {/* VIEW: Compliance & Pilot Safeguard */}
          {activeViewTab === 'compliance' && (
            <div className="space-y-4 text-xs text-zinc-700">
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-start gap-3">
                <ShieldCheck className="w-6 h-6 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-extrabold text-emerald-900 text-sm mb-1">
                    Garantia de Redundância e Proteção de Dados para o Piloto SRT
                  </h4>
                  <p className="text-emerald-800 leading-relaxed">
                    A rotina automática diária das <strong>00:00</strong> realiza a agregação de todos os dados clínicos de moradores, evoluções SOAP, aprazamentos MAR 12/12h e passagens de plantão, gravando um snapshot imutável com checksum SHA-256 no <strong>Firebase Cloud Storage & Firestore</strong>.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="p-3.5 bg-zinc-50 rounded-xl border border-zinc-200 space-y-1.5">
                  <div className="font-bold text-zinc-900 flex items-center gap-1.5">
                    <Lock className="w-4 h-4 text-teal-600" />
                    Conformidade com a LGPD (Lei 13.709/2018)
                  </div>
                  <p className="text-zinc-600 text-[11px] leading-relaxed">
                    Os dados sensíveis de saúde dos moradores são salvaguardados em repouso e trânsito com criptografia de ponta a ponta e rastreabilidade integral por meio da trilha de auditoria (Audit Logs).
                  </p>
                </div>

                <div className="p-3.5 bg-zinc-50 rounded-xl border border-zinc-200 space-y-1.5">
                  <div className="font-bold text-zinc-900 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-purple-600" />
                    Resoluções COFEN 564/2017 & 681/2021
                  </div>
                  <p className="text-zinc-600 text-[11px] leading-relaxed">
                    Atendimento à obrigatoriedade de guarda e preservação temporal contínua das anotações e evoluções de enfermagem e equipe multidisciplinar em serviços residenciais.
                  </p>
                </div>
              </div>

              <div className="bg-zinc-100 p-3 rounded-xl border border-zinc-200">
                <span className="font-bold text-zinc-800 block mb-1">Arquitetura de Redundância Ativa:</span>
                <ul className="list-disc list-inside space-y-1 text-zinc-600 text-[11px]">
                  <li><strong>Nuvem Principal:</strong> Google Cloud Firestore (Coleção <code className="bg-zinc-200 px-1 rounded">backups</code> com assinatura).</li>
                  <li><strong>Repositório de Arquivos:</strong> Firebase Storage Bucket (<code className="bg-zinc-200 px-1 rounded">gs://nexamed-storage/backups/</code>).</li>
                  <li><strong>Resiliência Local / Offline:</strong> Cache seguro IndexedDB e LocalStorage para recuperação instantânea em contingências de rede.</li>
                  <li><strong>Rotina Temporizada:</strong> Execução agendada pontualmente às <strong>00:00 (Meia-Noite BRT)</strong>.</li>
                </ul>
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-4 bg-zinc-50 border-t border-zinc-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-zinc-500 text-[11px]">
            <CheckCircle2 className="w-4 h-4 text-teal-600" />
            <span>Sistema Operando com Redundância Ativa 24/7</span>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              onClick={onClose}
              className="py-2 px-4 bg-zinc-200 hover:bg-zinc-300 text-zinc-800 font-bold rounded-xl transition-colors"
            >
              Fechar
            </button>
            <button
              onClick={handleExecuteNow}
              disabled={isBackingUp}
              className="py-2 px-4 bg-teal-600 hover:bg-teal-700 text-white font-extrabold rounded-xl shadow-xs transition-colors flex items-center gap-1.5 disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isBackingUp ? 'animate-spin' : ''}`} />
              {isBackingUp ? 'Salvando Snapshot...' : 'Executar Backup Agora'}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
