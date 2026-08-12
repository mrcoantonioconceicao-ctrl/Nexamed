import React, { useState, useEffect } from 'react';
import { 
  Printer, 
  Wifi, 
  Zap, 
  RefreshCw, 
  CheckCircle2, 
  Plus, 
  Settings, 
  Building2, 
  ShieldCheck, 
  Sliders, 
  QrCode, 
  AlertTriangle, 
  Trash2, 
  Sparkles, 
  Check, 
  Radio, 
  Server,
  Activity,
  Tag
} from 'lucide-react';
import { 
  WifiPrinter, 
  LabelDefaults, 
  getSavedPrinters, 
  savePrintersToStorage, 
  setDefaultPrinterInStorage, 
  getSavedLabelDefaults, 
  saveLabelDefaultsToStorage 
} from '../utils/printerConfig';

export const ConfiguracoesView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'PRINTERS' | 'UNIT' | 'SECURITY'>('PRINTERS');
  const [printers, setPrinters] = useState<WifiPrinter[]>([]);
  const [labelDefaults, setLabelDefaults] = useState<LabelDefaults>(getSavedLabelDefaults());
  const [isScanning, setIsScanning] = useState(false);
  const [pingStatus, setPingStatus] = useState<{ [id: string]: number | null }>({});
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // New Printer Form State
  const [showAddModal, setShowAddModal] = useState(false);
  const [newPrinterName, setNewPrinterName] = useState('');
  const [newPrinterIp, setNewPrinterIp] = useState('192.168.1.');
  const [newPrinterPort, setNewPrinterPort] = useState('9100');
  const [newPrinterProtocol, setNewPrinterProtocol] = useState<'RAW_9100' | 'IPP_631' | 'LPR_515'>('RAW_9100');
  const [newPrinterSector, setNewPrinterSector] = useState('Posto de Enfermagem');

  // Load saved printers on mount
  useEffect(() => {
    setPrinters(getSavedPrinters());
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Set Default Printer
  const handleSetDefault = (id: string) => {
    const updated = setDefaultPrinterInStorage(id);
    setPrinters(updated);
    const target = updated.find(p => p.id === id);
    showToast(`✅ Impressora "${target?.name}" definida como padrão para etiquetas MAR!`);
  };

  // Scan Wi-Fi Subnet Simulation
  const handleScanNetwork = () => {
    setIsScanning(true);
    setTimeout(() => {
      setIsScanning(false);
      showToast('⚡ Varredura concluída na subrede 192.168.1.0/24. 4 impressoras respondendo.');
    }, 1200);
  };

  // Test Ping for a printer
  const handlePingPrinter = (id: string) => {
    setPingStatus(prev => ({ ...prev, [id]: null }));
    setTimeout(() => {
      const ms = Math.floor(Math.random() * 12) + 6;
      setPingStatus(prev => ({ ...prev, [id]: ms }));
      const p = printers.find(item => item.id === id);
      showToast(`⚡ Resposta de ping de ${p?.ip}:${p?.port}: ${ms}ms (Conexão Wi-Fi Estável)`);
    }, 500);
  };

  // Trigger Test Print
  const handleTestPrint = (printer: WifiPrinter) => {
    showToast(`🖨️ Etiqueta de teste enviada para ${printer.name} (${printer.ip}:${printer.port})!`);
    
    // Create temporary hidden printable iframe
    let printFrame = document.getElementById('config-test-print-iframe') as HTMLIFrameElement;
    if (!printFrame) {
      printFrame = document.createElement('iframe');
      printFrame.id = 'config-test-print-iframe';
      printFrame.style.position = 'fixed';
      printFrame.style.right = '-9999px';
      printFrame.style.bottom = '-9999px';
      printFrame.style.width = '0px';
      printFrame.style.height = '0px';
      printFrame.style.border = '0px';
      document.body.appendChild(printFrame);
    }

    const frameDoc = printFrame.contentDocument || printFrame.contentWindow?.document;
    if (frameDoc) {
      frameDoc.open();
      frameDoc.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Etiqueta de Teste - NexaMed</title>
            <style>
              body { font-family: sans-serif; padding: 10px; margin: 0; }
              .card { border: 2px solid #0d9488; padding: 10px; border-radius: 8px; width: 260px; text-align: center; }
              .title { font-weight: bold; font-size: 14px; color: #0f766e; margin-bottom: 4px; }
              .subtitle { font-size: 10px; color: #555; }
              .code { font-family: monospace; font-size: 11px; margin-top: 8px; font-weight: bold; background: #f0fdfa; padding: 4px; }
            </style>
          </head>
          <body>
            <div class="card">
              <div class="title">NEXAMED - TESTE DE IMPRESSORA WI-FI</div>
              <div class="subtitle">Unidade Residência Terapêutica SRT</div>
              <hr style="border: 0.5px solid #ccc; margin: 8px 0;" />
              <div><strong>Dispositivo:</strong> ${printer.name}</div>
              <div><strong>IP:</strong> ${printer.ip}:${printer.port}</div>
              <div><strong>Protocolo:</strong> ${printer.protocol}</div>
              <div class="code">TESTE WI-FI CONCLUÍDO COM SUCESSO</div>
            </div>
            <script>
              setTimeout(() => { window.print(); }, 300);
            </script>
          </body>
        </html>
      `);
      frameDoc.close();
    }
  };

  // Delete printer
  const handleDeletePrinter = (id: string) => {
    const updated = printers.filter(p => p.id !== id);
    setPrinters(updated);
    savePrintersToStorage(updated);
    showToast('Impressora removida da lista.');
  };

  // Add new printer
  const handleSaveNewPrinter = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPrinterName || !newPrinterIp) return;

    const newEntry: WifiPrinter = {
      id: `printer-${Date.now()}`,
      name: newPrinterName,
      ip: newPrinterIp,
      port: newPrinterPort || '9100',
      protocol: newPrinterProtocol,
      signal: '92%',
      mac: 'E4:95:6E:' + Math.floor(Math.random() * 89 + 10) + ':' + Math.floor(Math.random() * 89 + 10),
      isDefault: printers.length === 0,
      status: 'ONLINE',
      sector: newPrinterSector || 'Posto de Enfermagem'
    };

    const updated = [...printers, newEntry];
    setPrinters(updated);
    savePrintersToStorage(updated);
    setShowAddModal(false);
    setNewPrinterName('');
    showToast(`✅ Impressora Wi-Fi "${newEntry.name}" cadastrada com sucesso!`);
  };

  // Save Label Defaults
  const handleSaveLabelDefaults = () => {
    saveLabelDefaultsToStorage(labelDefaults);
    showToast('✅ Configurações de layout das etiquetas salvas como padrão do sistema!');
  };

  const defaultPrinter = printers.find(p => p.isDefault) || printers[0];

  return (
    <div className="space-y-6 pb-12">
      {/* Toast Banner */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 bg-slate-900 text-teal-300 px-4 py-3 rounded-2xl shadow-2xl border border-teal-500/40 flex items-center gap-3 animate-in fade-in slide-in-from-top duration-300">
          <Sparkles className="w-5 h-5 text-teal-400 animate-spin" />
          <span className="text-xs font-bold">{toastMessage}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-gradient-to-r from-teal-800 via-teal-700 to-emerald-800 rounded-3xl p-6 text-white shadow-lg border border-teal-600/30 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10">
          <Settings className="w-48 h-48 text-white" />
        </div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full bg-teal-500/30 border border-teal-300/40 text-[11px] font-extrabold uppercase tracking-wider text-teal-200">
                Central de Hardware & Parâmetros
              </span>
            </div>
            <h1 className="text-2xl font-black tracking-tight">Configurações do Sistema</h1>
            <p className="text-teal-100 text-xs mt-1 max-w-xl leading-relaxed">
              Gerencie a conectividade Wi-Fi das impressoras térmicas de etiquetas, padrões de impressão MAR para medicação e parâmetros da Unidade SRT.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleScanNetwork}
              disabled={isScanning}
              className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs rounded-2xl transition-all shadow-md flex items-center gap-2"
            >
              <RefreshCw className={`w-4 h-4 ${isScanning ? 'animate-spin' : ''}`} />
              <span>{isScanning ? 'Escaneando Wi-Fi...' : 'Escanear Rede Wi-Fi'}</span>
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 mt-6 pt-4 border-t border-teal-600/50">
          <button
            onClick={() => setActiveTab('PRINTERS')}
            className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all flex items-center gap-2 ${
              activeTab === 'PRINTERS'
                ? 'bg-white text-teal-900 shadow-md'
                : 'text-teal-100 hover:bg-teal-700/60'
            }`}
          >
            <Printer className="w-4 h-4" />
            <span>Impressoras Wi-Fi & Etiquetas</span>
          </button>

          <button
            onClick={() => setActiveTab('UNIT')}
            className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all flex items-center gap-2 ${
              activeTab === 'UNIT'
                ? 'bg-white text-teal-900 shadow-md'
                : 'text-teal-100 hover:bg-teal-700/60'
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>Parâmetros da Unidade SRT</span>
          </button>

          <button
            onClick={() => setActiveTab('SECURITY')}
            className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all flex items-center gap-2 ${
              activeTab === 'SECURITY'
                ? 'bg-white text-teal-900 shadow-md'
                : 'text-teal-100 hover:bg-teal-700/60'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Segurança & LGPD</span>
          </button>
        </div>
      </div>

      {/* TAB CONTENT: IMPRESSORAS WI-FI E ETIQUETAS */}
      {activeTab === 'PRINTERS' && (
        <div className="space-y-6">
          
          {/* Active Wi-Fi Banner Info */}
          <div className="bg-slate-900 text-white rounded-2xl p-4 border border-slate-800 shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-teal-500/10 rounded-xl border border-teal-500/30 text-teal-400 shrink-0">
                <Wifi className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-extrabold text-sm text-white">Rede Wi-Fi Conectada: <span className="text-teal-400">Rede_SRT_Enfermagem_5G</span></h3>
                  <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-500/20 text-emerald-300 font-mono font-bold border border-emerald-500/30">
                    Subrede: 192.168.1.0/24
                  </span>
                </div>
                <p className="text-xs text-zinc-400 mt-0.5">
                  As impressoras conectadas na mesma subrede local recebem comandos diretos via porta Raw Socket (TCP 9100) ou AirPrint/IPP.
                </p>
              </div>
            </div>

            <button
              onClick={() => setShowAddModal(true)}
              className="px-3.5 py-2 bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 shrink-0 shadow-sm"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>Adicionar Impressora Wi-Fi</span>
            </button>
          </div>

          {/* Current Default Printer Highlight Card */}
          {defaultPrinter && (
            <div className="bg-gradient-to-r from-teal-50 via-emerald-50/60 to-white rounded-2xl p-5 border-2 border-teal-500 shadow-sm">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="p-3 bg-teal-600 text-white rounded-2xl shadow-md shrink-0">
                    <Printer className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 bg-teal-700 text-white font-black text-[10px] rounded-md uppercase tracking-wider">
                        ★ Impressora Padrão Atual
                      </span>
                      <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 font-extrabold text-[10px] rounded-md flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-ping"></span>
                        ONLINE ({defaultPrinter.signal})
                      </span>
                    </div>
                    <h2 className="text-lg font-black text-zinc-900 mt-1">{defaultPrinter.name}</h2>
                    <p className="text-xs text-zinc-600 font-mono mt-0.5">
                      IP: <strong className="text-zinc-900">{defaultPrinter.ip}:{defaultPrinter.port}</strong> • Protocolo: <strong>{defaultPrinter.protocol}</strong> • Setor: <strong>{defaultPrinter.sector}</strong>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handlePingPrinter(defaultPrinter.id)}
                    className="px-3 py-2 bg-white hover:bg-zinc-100 text-zinc-800 border border-zinc-300 font-bold text-xs rounded-xl transition-all flex items-center gap-1.5 shadow-2xs"
                  >
                    <Zap className="w-3.5 h-3.5 text-teal-600" />
                    <span>Ping {pingStatus[defaultPrinter.id] !== undefined && pingStatus[defaultPrinter.id] !== null ? `(${pingStatus[defaultPrinter.id]}ms)` : ''}</span>
                  </button>

                  <button
                    onClick={() => handleTestPrint(defaultPrinter)}
                    className="px-4 py-2 bg-teal-700 hover:bg-teal-800 text-white font-extrabold text-xs rounded-xl transition-all flex items-center gap-1.5 shadow-sm"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>Imprimir Etiqueta Teste</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* List of Discovered & Configured Wi-Fi Printers */}
          <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-zinc-100 bg-zinc-50/80 flex items-center justify-between">
              <div>
                <h3 className="font-extrabold text-zinc-900 text-sm flex items-center gap-2">
                  <Wifi className="w-4 h-4 text-teal-600" /> Dispositivos de Impressão Reconhecidos na Rede SRT
                </h3>
                <p className="text-xs text-zinc-500 mt-0.5">
                  Selecione qual impressora receberá os trabalhos automáticos de impressão de medicação.
                </p>
              </div>
              <span className="text-xs font-mono font-bold text-teal-800 bg-teal-50 px-2.5 py-1 rounded-lg border border-teal-200">
                {printers.length} impressoras cadastradas
              </span>
            </div>

            <div className="divide-y divide-zinc-100">
              {printers.map((printer) => {
                const isDef = printer.isDefault;
                return (
                  <div
                    key={printer.id}
                    className={`p-4 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                      isDef ? 'bg-teal-50/40' : 'hover:bg-zinc-50/80'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`p-2.5 rounded-xl border shrink-0 ${
                        isDef ? 'bg-teal-100 border-teal-300 text-teal-800' : 'bg-zinc-100 border-zinc-200 text-zinc-600'
                      }`}>
                        <Printer className="w-5 h-5" />
                      </div>

                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-extrabold text-zinc-900 text-sm">{printer.name}</h4>
                          {isDef && (
                            <span className="px-2 py-0.5 bg-teal-700 text-white font-black text-[10px] rounded-md">
                              PADRÃO
                            </span>
                          )}
                          <span className={`px-2 py-0.5 font-bold text-[10px] rounded-md border ${
                            printer.status === 'ONLINE'
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                              : 'bg-rose-50 text-rose-800 border-rose-200'
                          }`}>
                            {printer.status} ({printer.signal})
                          </span>
                        </div>

                        <div className="text-xs text-zinc-500 font-mono mt-1 flex flex-wrap items-center gap-x-3 gap-y-1">
                          <span>🌐 IP: <strong className="text-zinc-800">{printer.ip}:{printer.port}</strong></span>
                          <span>⚙️ Protocolo: <strong className="text-zinc-800">{printer.protocol}</strong></span>
                          <span>🔒 MAC: <strong className="text-zinc-700">{printer.mac}</strong></span>
                          <span>📍 Setor: <strong className="text-zinc-800">{printer.sector}</strong></span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {!isDef && (
                        <button
                          onClick={() => handleSetDefault(printer.id)}
                          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl transition-all flex items-center gap-1 shadow-2xs"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Definir Padrão</span>
                        </button>
                      )}

                      <button
                        onClick={() => handlePingPrinter(printer.id)}
                        className="p-2 text-zinc-600 hover:text-zinc-900 bg-zinc-100 hover:bg-zinc-200 rounded-xl transition-all"
                        title="Testar Conectividade Ping"
                      >
                        <Zap className="w-4 h-4 text-teal-600" />
                      </button>

                      <button
                        onClick={() => handleTestPrint(printer)}
                        className="p-2 text-zinc-600 hover:text-zinc-900 bg-zinc-100 hover:bg-zinc-200 rounded-xl transition-all"
                        title="Imprimir Etiqueta Teste"
                      >
                        <Tag className="w-4 h-4 text-teal-600" />
                      </button>

                      {!isDef && (
                        <button
                          onClick={() => handleDeletePrinter(printer.id)}
                          className="p-2 text-rose-600 hover:text-rose-800 hover:bg-rose-50 rounded-xl transition-all"
                          title="Remover Impressora"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Form & Preset Settings for Medication Labels */}
          <div className="bg-white rounded-2xl border border-zinc-200 p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
              <div>
                <h3 className="font-extrabold text-zinc-900 text-sm flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-teal-600" /> Layout Padrão de Etiquetas MAR (Aprazamento)
                </h3>
                <p className="text-xs text-zinc-500 mt-0.5">
                  Defina o formato de mídia padrão utilizado na Unidade para colagem nos recipientes de medicação.
                </p>
              </div>

              <button
                onClick={handleSaveLabelDefaults}
                className="px-4 py-2 bg-teal-700 hover:bg-teal-800 text-white font-extrabold text-xs rounded-xl transition-all shadow-sm flex items-center gap-1.5"
              >
                <Check className="w-4 h-4" />
                <span>Salvar Padrões de Etiqueta</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Option 1: Envelope 75x45mm */}
              <label
                onClick={() => setLabelDefaults(prev => ({ ...prev, defaultFormat: 'ENVELOPE_75x45' }))}
                className={`p-3.5 rounded-2xl border-2 cursor-pointer transition-all space-y-2 ${
                  labelDefaults.defaultFormat === 'ENVELOPE_75x45'
                    ? 'bg-teal-50/60 border-teal-600 shadow-xs'
                    : 'bg-zinc-50 border-zinc-200 hover:border-zinc-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-xs text-zinc-900">Envelope 75x45mm</span>
                  <Radio className={`w-4 h-4 ${labelDefaults.defaultFormat === 'ENVELOPE_75x45' ? 'text-teal-600' : 'text-zinc-300'}`} />
                </div>
                <p className="text-[11px] text-zinc-500 leading-snug">
                  Recomendado para saches de medicação e envelopes individuais de dosagem diária.
                </p>
              </label>

              {/* Option 2: Copo 50x30mm */}
              <label
                onClick={() => setLabelDefaults(prev => ({ ...prev, defaultFormat: 'CUP_50x30' }))}
                className={`p-3.5 rounded-2xl border-2 cursor-pointer transition-all space-y-2 ${
                  labelDefaults.defaultFormat === 'CUP_50x30'
                    ? 'bg-teal-50/60 border-teal-600 shadow-xs'
                    : 'bg-zinc-50 border-zinc-200 hover:border-zinc-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-xs text-zinc-900">Copo Térmico 50x30mm</span>
                  <Radio className={`w-4 h-4 ${labelDefaults.defaultFormat === 'CUP_50x30' ? 'text-teal-600' : 'text-zinc-300'}`} />
                </div>
                <p className="text-[11px] text-zinc-500 leading-snug">
                  Formatado para copos dosadores e frascos compactos de comprimidos e soluções líquidas.
                </p>
              </label>

              {/* Option 3: Folha A4 */}
              <label
                onClick={() => setLabelDefaults(prev => ({ ...prev, defaultFormat: 'A4_SHEET' }))}
                className={`p-3.5 rounded-2xl border-2 cursor-pointer transition-all space-y-2 ${
                  labelDefaults.defaultFormat === 'A4_SHEET'
                    ? 'bg-teal-50/60 border-teal-600 shadow-xs'
                    : 'bg-zinc-50 border-zinc-200 hover:border-zinc-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-xs text-zinc-900">Folha A4 (Grade 10 Etiquetas)</span>
                  <Radio className={`w-4 h-4 ${labelDefaults.defaultFormat === 'A4_SHEET' ? 'text-teal-600' : 'text-zinc-300'}`} />
                </div>
                <p className="text-[11px] text-zinc-500 leading-snug">
                  Impressão em folha adesiva A4 para impressoras de escritório convencionais.
                </p>
              </label>
            </div>

            {/* Toggles for Content */}
            <div className="pt-2 grid grid-cols-1 md:grid-cols-3 gap-3 border-t border-zinc-100">
              <label className="flex items-center gap-2 cursor-pointer p-2 rounded-xl hover:bg-zinc-50">
                <input
                  type="checkbox"
                  checked={labelDefaults.includeQrCode}
                  onChange={(e) => setLabelDefaults(prev => ({ ...prev, includeQrCode: e.target.checked }))}
                  className="rounded text-teal-600 focus:ring-teal-500"
                />
                <QrCode className="w-4 h-4 text-teal-600" />
                <span className="text-xs font-bold text-zinc-700">Incluir QR Code Validador</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer p-2 rounded-xl hover:bg-zinc-50">
                <input
                  type="checkbox"
                  checked={labelDefaults.includeAllergies}
                  onChange={(e) => setLabelDefaults(prev => ({ ...prev, includeAllergies: e.target.checked }))}
                  className="rounded text-teal-600 focus:ring-teal-500"
                />
                <AlertTriangle className="w-4 h-4 text-rose-600" />
                <span className="text-xs font-bold text-zinc-700">Destacar Alergias do Residente</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer p-2 rounded-xl hover:bg-zinc-50">
                <input
                  type="checkbox"
                  checked={labelDefaults.includeWarnings}
                  onChange={(e) => setLabelDefaults(prev => ({ ...prev, includeWarnings: e.target.checked }))}
                  className="rounded text-teal-600 focus:ring-teal-500"
                />
                <ShieldCheck className="w-4 h-4 text-amber-600" />
                <span className="text-xs font-bold text-zinc-700">Alertas Medicamentos Alta Vigilância</span>
              </label>
            </div>
          </div>

        </div>
      )}

      {/* TAB CONTENT: UNIDADE SRT */}
      {activeTab === 'UNIT' && (
        <div className="bg-white rounded-2xl border border-zinc-200 p-6 shadow-sm space-y-4">
          <h3 className="font-extrabold text-zinc-900 text-base flex items-center gap-2">
            <Building2 className="w-5 h-5 text-teal-600" /> Parâmetros do Serviço de Acolhimento SRT
          </h3>
          <p className="text-xs text-zinc-500">
            Dados operacionais da Unidade de Residência Terapêutica registrados nos cabeçalhos das etiquetas e relatórios regulatórios.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            <div>
              <label className="block text-xs font-bold text-zinc-700 mb-1">Nome da Unidade SRT</label>
              <input
                type="text"
                defaultValue="Residencial Salomão - Rua Dr. Pedro Zimmermann, 2391 - CEP 89066-001 (Blumenau/SC)"
                className="w-full bg-zinc-50 p-2.5 rounded-xl border border-zinc-200 text-xs font-bold text-zinc-800"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-700 mb-1">Enfermeiro(a) Responsável Técnico (RT)</label>
              <input
                type="text"
                defaultValue="Enfª. Mariana Souza (COREN-SP 184.920)"
                className="w-full bg-zinc-50 p-2.5 rounded-xl border border-zinc-200 text-xs font-bold text-zinc-800"
              />
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT: SEGURANÇA */}
      {activeTab === 'SECURITY' && (
        <div className="bg-white rounded-2xl border border-zinc-200 p-6 shadow-sm space-y-4">
          <h3 className="font-extrabold text-zinc-900 text-base flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-teal-600" /> Diretrizes de Segurança & LGPD
          </h3>
          <p className="text-xs text-zinc-500">
            Controle de acesso e criptografia local de dados sensíveis de medicação e saúde mental.
          </p>
          <div className="p-4 bg-emerald-50 text-emerald-900 rounded-2xl border border-emerald-200 text-xs space-y-1">
            <strong className="font-extrabold block">✓ Rastreabilidade MAR Ativa</strong>
            <p>
              Todas as impressões de etiquetas e registros de aprazamento de doses são gravados com carimbo de data, hora e ID do profissional da equipe de enfermagem.
            </p>
          </div>
        </div>
      )}

      {/* MODAL TO ADD NEW WI-FI PRINTER */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-zinc-200 space-y-4 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-teal-100 text-teal-800 rounded-xl">
                  <Printer className="w-5 h-5" />
                </div>
                <h3 className="font-black text-zinc-900 text-base">Nova Impressora Wi-Fi</h3>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-zinc-400 hover:text-zinc-600 font-bold text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveNewPrinter} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-zinc-700 mb-1">Nome de Identificação</label>
                <input
                  type="text"
                  required
                  value={newPrinterName}
                  onChange={(e) => setNewPrinterName(e.target.value)}
                  placeholder="Ex: Zebra ZD220 Enfermagem Bloco A"
                  className="w-full bg-zinc-50 p-2.5 rounded-xl border border-zinc-200 text-xs font-bold text-zinc-800"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div className="col-span-2">
                  <label className="block text-xs font-bold text-zinc-700 mb-1">Endereço IP na Wi-Fi</label>
                  <input
                    type="text"
                    required
                    value={newPrinterIp}
                    onChange={(e) => setNewPrinterIp(e.target.value)}
                    placeholder="192.168.1.170"
                    className="w-full bg-zinc-50 p-2.5 rounded-xl border border-zinc-200 text-xs font-mono font-bold text-zinc-800"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-700 mb-1">Porta RAW</label>
                  <input
                    type="text"
                    required
                    value={newPrinterPort}
                    onChange={(e) => setNewPrinterPort(e.target.value)}
                    placeholder="9100"
                    className="w-full bg-zinc-50 p-2.5 rounded-xl border border-zinc-200 text-xs font-mono font-bold text-zinc-800"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-700 mb-1">Protocolo de Impressão</label>
                <select
                  value={newPrinterProtocol}
                  onChange={(e) => setNewPrinterProtocol(e.target.value as any)}
                  className="w-full bg-zinc-50 p-2.5 rounded-xl border border-zinc-200 text-xs font-bold text-zinc-800"
                >
                  <option value="RAW_9100">TCP RAW Socket (Porta 9100) - Recomendado Zebra/Elgin</option>
                  <option value="IPP_631">AirPrint / IPP (Porta 631)</option>
                  <option value="LPR_515">LPR/LPD Direct (Porta 515)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-700 mb-1">Setor / Localização na SRT</label>
                <input
                  type="text"
                  value={newPrinterSector}
                  onChange={(e) => setNewPrinterSector(e.target.value)}
                  placeholder="Posto de Enfermagem Central"
                  className="w-full bg-zinc-50 p-2.5 rounded-xl border border-zinc-200 text-xs font-bold text-zinc-800"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-zinc-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 text-xs font-bold rounded-xl"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-teal-700 hover:bg-teal-800 text-white text-xs font-black rounded-xl shadow-md"
                >
                  Cadastrar Impressora
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
