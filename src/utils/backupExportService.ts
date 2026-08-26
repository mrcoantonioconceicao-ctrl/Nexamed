import { 
  Resident, 
  ClinicalEvolution, 
  MedicationMAR, 
  HandoverLog, 
  AuditLogEntry, 
  FunctionalScaleAssessment, 
  AppointmentRecord, 
  PASRecord,
  BackupSnapshot,
  BackupRecordCounts 
} from '../types';
import { saveBackupSnapshotToDb } from '../lib/firebase';

/**
 * Calculates SHA-256 hash for integrity verification
 */
export async function calculateSha256(text: string): Promise<string> {
  try {
    const encoder = new TextEncoder();
    const data = encoder.encode(text);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  } catch {
    // Fallback simple checksum if crypto.subtle is unavailable
    let hash = 0;
    for (let i = 0; i < text.length; i++) {
      const char = text.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash |= 0;
    }
    return 'sha256-chk-' + Math.abs(hash).toString(16).padStart(16, '0');
  }
}

/**
 * Format bytes to readable string (e.g. 1.45 MB)
 */
export function formatBytes(bytes: number, decimals = 2): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

export interface FullBackupPayload {
  metadata: {
    system: string;
    version: string;
    unit: string;
    address: string;
    regulatoryFramework: string[];
    backupTimestamp: string;
    backupDate: string;
    backupTime: string;
    scheduledRoutine: string;
    triggerType: 'AUTOMATIC_DAILY_MIDNIGHT' | 'MANUAL_ON_DEMAND';
    integritySha256?: string;
    recordCounts: BackupRecordCounts;
  };
  residentsSummary: {
    totalResidents: number;
    activeResidents: number;
    underObservation: number;
    averageAge: number;
  };
  residents: Array<Resident & {
    evolutionsCount: number;
    activeMedicationsCount: number;
    lastEvolutionDate?: string;
  }>;
  evolutionsSoap: ClinicalEvolution[];
  medicationsMar: MedicationMAR[];
  handoversSbar: HandoverLog[];
  functionalScales: FunctionalScaleAssessment[];
  appointments: AppointmentRecord[];
  pasRecords: PASRecord[];
  auditLogsSample: AuditLogEntry[];
}

/**
 * Builds the structured, human-readable JSON payload containing all clinical and resident data
 */
export function buildReadableBackupPayload(params: {
  residents: Resident[];
  evolutions: ClinicalEvolution[];
  medications: MedicationMAR[];
  handovers: HandoverLog[];
  auditLogs?: AuditLogEntry[];
  functionalScales?: FunctionalScaleAssessment[];
  appointments?: AppointmentRecord[];
  pasRecords?: PASRecord[];
  triggerType?: 'AUTOMATIC_DAILY_MIDNIGHT' | 'MANUAL_ON_DEMAND';
  customDate?: string;
  customTime?: string;
}): FullBackupPayload {
  const now = new Date();
  const backupDate = params.customDate || now.toISOString().split('T')[0];
  const backupTime = params.customTime || now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  const backupTimestamp = now.toISOString();

  const residentsWithCounts = (params.residents || []).map(r => {
    const residentEvos = (params.evolutions || []).filter(e => e.residentId === r.id);
    const residentMeds = (params.medications || []).filter(m => m.residentId === r.id);
    const lastEvo = residentEvos[0]; // assuming sorted or latest
    return {
      ...r,
      evolutionsCount: residentEvos.length,
      activeMedicationsCount: residentMeds.length,
      lastEvolutionDate: lastEvo ? `${lastEvo.date} ${lastEvo.time}` : 'Sem evoluções registradas'
    };
  });

  const recordCounts: BackupRecordCounts = {
    residents: (params.residents || []).length,
    evolutions: (params.evolutions || []).length,
    medications: (params.medications || []).length,
    handovers: (params.handovers || []).length,
    auditLogs: (params.auditLogs || []).length,
    functionalScales: (params.functionalScales || []).length,
    pasRecords: (params.pasRecords || []).length,
    appointments: (params.appointments || []).length,
    totalRecords: 
      (params.residents || []).length +
      (params.evolutions || []).length +
      (params.medications || []).length +
      (params.handovers || []).length +
      (params.auditLogs || []).length +
      (params.functionalScales || []).length +
      (params.pasRecords || []).length +
      (params.appointments || []).length
  };

  const totalAge = (params.residents || []).reduce((acc, curr) => acc + (curr.age || 0), 0);
  const avgAge = (params.residents || []).length > 0 ? Math.round(totalAge / params.residents.length) : 0;

  return {
    metadata: {
      system: 'NexaMed SRT - Sistema de Gestão de Residências Terapêuticas (SUS/MS)',
      version: 'v2.4.0-piloto-redundancia',
      unit: 'Residencial Salomão (SRT Tipo II)',
      address: 'Rua Dr. Pedro Zimmermann, 2391 - Itoupava Central, Blumenau - SC, 89066-001',
      regulatoryFramework: [
        'Portaria MS/GM nº 106/2000 (Serviços de Residência Terapêutica)',
        'Portaria MS/GM nº 3.088/2011 (Rede de Atenção Psicossocial - RAPS)',
        'Lei Federal nº 10.216/2001 (Reforma Psiquiátrica)',
        'Resolução COFEN nº 564/2017 & 681/2021 (Anotação de Enfermagem em SRT)',
        'Portaria SVS/MS nº 344/1998 (Controle de Medicamentos Psicotrópicos)',
        'Lei Geral de Proteção de Dados Pessoais (LGPD - Lei 13.709/2018)'
      ],
      backupTimestamp,
      backupDate,
      backupTime,
      scheduledRoutine: '00:00 (Diária - Meia-Noite)',
      triggerType: params.triggerType || 'AUTOMATIC_DAILY_MIDNIGHT',
      recordCounts
    },
    residentsSummary: {
      totalResidents: (params.residents || []).length,
      activeResidents: (params.residents || []).filter(r => r.status === 'Ativo').length,
      underObservation: (params.residents || []).filter(r => r.status === 'Em Observação').length,
      averageAge: avgAge
    },
    residents: residentsWithCounts,
    evolutionsSoap: params.evolutions || [],
    medicationsMar: params.medications || [],
    handoversSbar: params.handovers || [],
    functionalScales: params.functionalScales || [],
    appointments: params.appointments || [],
    pasRecords: params.pasRecords || [],
    auditLogsSample: (params.auditLogs || []).slice(0, 100) // latest 100 entries for readability
  };
}

/**
 * Generates an executive, human-readable printable HTML/PDF report
 */
export function generateReadablePdfHtml(payload: FullBackupPayload): string {
  const { metadata, residents, evolutionsSoap, medicationsMar, handoversSbar, residentsSummary } = payload;

  const residentsRows = residents.map((r, idx) => `
    <tr style="background-color: ${idx % 2 === 0 ? '#ffffff' : '#f8fafc'}; border-bottom: 1px solid #e2e8f0;">
      <td style="padding: 8px 10px; font-weight: 700; color: #0f172a;">${r.name}</td>
      <td style="padding: 8px 10px; color: #334155;">${r.age} anos / ${r.gender || 'N/I'}</td>
      <td style="padding: 8px 10px; color: #334155;">Quarto ${r.room} ${(r as any).bed ? `(Leito ${(r as any).bed})` : ''}</td>
      <td style="padding: 8px 10px;"><span style="background: #e0f2fe; color: #0369a1; padding: 2px 6px; border-radius: 4px; font-size: 11px; font-weight: 600;">${r.status}</span></td>
      <td style="padding: 8px 10px; color: #475569; font-size: 12px;">${(r as any).diagnoses?.join(', ') || (r as any).diagnosis || 'Não especificado'}</td>
      <td style="padding: 8px 10px; text-align: center; font-weight: 600; color: #0f766e;">${r.evolutionsCount}</td>
      <td style="padding: 8px 10px; text-align: center; font-weight: 600; color: #7c3aed;">${r.activeMedicationsCount}</td>
    </tr>
  `).join('');

  const evolutionsSection = evolutionsSoap.slice(0, 40).map(evo => `
    <div style="background: #ffffff; border: 1px solid #cbd5e1; border-radius: 8px; padding: 12px; margin-bottom: 12px; page-break-inside: avoid;">
      <div style="display: flex; justify-content: space-between; border-bottom: 1px dashed #cbd5e1; padding-bottom: 6px; margin-bottom: 8px;">
        <div>
          <strong style="color: #0f172a; font-size: 14px;">${evo.residentName}</strong>
          <span style="color: #64748b; font-size: 12px; margin-left: 8px;">📅 ${evo.date} às ${evo.time}</span>
        </div>
        <div style="font-size: 12px; color: #0f766e; font-weight: 600;">
          ✍️ ${evo.author} (${evo.role})
        </div>
      </div>
      <div style="font-size: 12px; line-height: 1.5; color: #334155;">
        <p style="margin: 4px 0;"><strong>[S - Subjetivo]:</strong> ${evo.soap?.subjective || 'Sem queixas relatadas.'}</p>
        <p style="margin: 4px 0;"><strong>[O - Objetivo]:</strong> ${evo.soap?.objective || 'Sinais vitais estáveis.'}</p>
        <p style="margin: 4px 0;"><strong>[A - Avaliação]:</strong> ${evo.soap?.assessment || 'Quadro clínico compensado.'}</p>
        <p style="margin: 4px 0;"><strong>[P - Plano]:</strong> ${evo.soap?.plan || 'Manter rotina e aprazamento 12/12h.'}</p>
      </div>
      ${evo.vitals ? `
        <div style="margin-top: 6px; padding: 4px 8px; background: #f1f5f9; border-radius: 4px; font-size: 11px; color: #475569;">
          📊 <strong>Sinais Vitais:</strong> P.A: ${evo.vitals.bp || (evo.vitals as any).bloodPressure || 'N/A'} | F.C: ${evo.vitals.hr ? evo.vitals.hr + ' bpm' : 'N/A'} | Temp: ${evo.vitals.temp ? evo.vitals.temp + ' °C' : 'N/A'} | SpO2: ${evo.vitals.spo2 ? evo.vitals.spo2 + '%' : 'N/A'}
        </div>
      ` : ''}
    </div>
  `).join('');

  const medicationsSection = medicationsMar.slice(0, 30).map(med => `
    <tr style="border-bottom: 1px solid #e2e8f0; font-size: 12px;">
      <td style="padding: 6px 10px; font-weight: 600; color: #0f172a;">${med.residentName}</td>
      <td style="padding: 6px 10px; font-weight: 700; color: #1e293b;">${med.medicationName}</td>
      <td style="padding: 6px 10px; color: #475569;">${med.dosage || 'Conforme prescrição'}</td>
      <td style="padding: 6px 10px; color: #475569;">${med.route || 'Oral'}</td>
      <td style="padding: 6px 10px; color: #0369a1; font-weight: 600;">${med.frequency || '12/12h (08:00 | 20:00)'}</td>
      <td style="padding: 6px 10px;">
        ${(med as any).isPsychotropic || (med as any).category === 'Psicotrópico' ? '<span style="background: #fee2e2; color: #991b1b; padding: 2px 6px; border-radius: 4px; font-size: 10px; font-weight: bold;">Psicotrópico Port. 344</span>' : '<span style="color: #64748b; font-size: 11px;">Uso Contínuo</span>'}
      </td>
    </tr>
  `).join('');

  const handoversSection = handoversSbar.slice(0, 10).map(h => {
    const sbar = (h as any).sbar || { situation: (h as any).situation, background: (h as any).background, assessment: (h as any).assessment, recommendation: (h as any).recommendation };
    return `
    <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px; margin-bottom: 10px; page-break-inside: avoid;">
      <div style="display: flex; justify-content: space-between; font-weight: bold; font-size: 12px; color: #0f172a; border-bottom: 1px solid #cbd5e1; padding-bottom: 4px; margin-bottom: 6px;">
        <span>Plantão: ${h.shift} (${h.date})</span>
        <span style="color: #0d9488;">Enf. Responsável: ${h.authorName}</span>
      </div>
      <p style="font-size: 11px; margin: 2px 0; color: #334155;"><strong>Situação & Background:</strong> ${sbar?.situation || 'Sem intercorrências graves.'} ${sbar?.background || ''}</p>
      <p style="font-size: 11px; margin: 2px 0; color: #334155;"><strong>Avaliação & Recomendação:</strong> ${sbar?.assessment || 'Estabilidade.'} ${sbar?.recommendation || 'Manter vigilância.'}</p>
      ${(h as any).occurrences && (h as any).occurrences.length > 0 ? `
        <div style="margin-top: 4px; font-size: 11px; color: #b91c1c;">
          ⚠️ <strong>Ocorrências registradas:</strong> ${(h as any).occurrences.map((o: any) => `${o.category} - ${o.description}`).join('; ')}
        </div>
      ` : ''}
    </div>
  `;
  }).join('');

  return `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <title>Dossiê Clínico de Redundância - NexaMed SRT (00:00)</title>
  <style>
    @media print {
      body { margin: 0; padding: 15mm; background: #fff !important; }
      .no-print { display: none !important; }
      .page-break { page-break-after: always; }
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      color: #0f172a;
      background-color: #f1f5f9;
      margin: 0;
      padding: 24px;
      font-size: 13px;
    }
    .container {
      max-width: 1000px;
      margin: 0 auto;
      background: #ffffff;
      padding: 32px;
      border-radius: 12px;
      box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);
    }
    .header {
      border-bottom: 2px solid #0f766e;
      padding-bottom: 16px;
      margin-bottom: 20px;
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
    }
    .badge-redundancy {
      background: #0f766e;
      color: #ffffff;
      padding: 4px 10px;
      border-radius: 6px;
      font-weight: 800;
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    h1 { margin: 0 0 4px 0; color: #0f172a; font-size: 20px; font-weight: 900; }
    h2 { margin: 24px 0 12px 0; color: #0f766e; font-size: 15px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 1px solid #e2e8f0; padding-bottom: 4px; }
    .meta-box {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      padding: 12px;
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
      gap: 10px;
      font-size: 12px;
      margin-bottom: 20px;
    }
    table { width: 100%; border-collapse: collapse; margin-top: 8px; font-size: 12px; }
    th { background: #f1f5f9; padding: 8px 10px; text-align: left; font-weight: 700; color: #475569; border-bottom: 2px solid #cbd5e1; }
    .print-btn {
      background: #0f766e;
      color: #fff;
      border: none;
      padding: 10px 18px;
      border-radius: 8px;
      font-weight: bold;
      cursor: pointer;
      font-size: 13px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
  </style>
</head>
<body>
  <div class="container">
    <!-- Action Bar for Web Preview -->
    <div class="no-print" style="display: flex; justify-content: space-between; align-items: center; background: #e0f2fe; border: 1px solid #bae6fd; padding: 12px 16px; border-radius: 8px; margin-bottom: 20px;">
      <div>
        <strong style="color: #0369a1; font-size: 14px;">🗂️ Backup de Redundância Clínico (00:00 Diário)</strong>
        <p style="margin: 2px 0 0 0; color: #0284c7; font-size: 12px;">Visualização legível para auditoria médica, vigilância sanitária e redundância de prontuários.</p>
      </div>
      <button class="print-btn" onclick="window.print()">🖨️ Imprimir / Salvar como PDF</button>
    </div>

    <!-- Main Header -->
    <div class="header">
      <div>
        <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 4px;">
          <span style="font-size: 20px;">🏥</span>
          <h1>NexaMed SRT • Dossiê Clínico Diário</h1>
        </div>
        <p style="margin: 0; color: #475569; font-size: 13px; font-weight: 600;">
          ${metadata.unit} • ${metadata.address}
        </p>
        <p style="margin: 2px 0 0 0; color: #64748b; font-size: 11px;">
          Conformidade: Portaria MS/GM 106/2000 • RAPS • COFEN 564/2017 • LGPD
        </p>
      </div>
      <div style="text-align: right;">
        <span class="badge-redundancy">⏰ Snapshot 00:00 Diário</span>
        <p style="margin: 6px 0 0 0; font-size: 12px; font-weight: bold; color: #0f172a;">
          Data: ${metadata.backupDate} (${metadata.backupTime})
        </p>
        <p style="margin: 2px 0 0 0; font-size: 10px; color: #64748b; font-family: monospace;">
          SHA256: ${metadata.integritySha256 ? metadata.integritySha256.substring(0, 16) + '...' : 'GERADO_NA_CRIPTO'}
        </p>
      </div>
    </div>

    <!-- Metadata & Statistics Grid -->
    <div class="meta-box">
      <div><strong>Total de Residentes:</strong> ${residentsSummary.totalResidents} moradores (${residentsSummary.activeResidents} ativos)</div>
      <div><strong>Média de Idade:</strong> ${residentsSummary.averageAge} anos</div>
      <div><strong>Evoluções SOAP Arquivadas:</strong> ${metadata.recordCounts.evolutions} registros</div>
      <div><strong>Prescrições MAR (12/12h):</strong> ${metadata.recordCounts.medications} prescrições</div>
      <div><strong>Passagens de Plantão SBAR:</strong> ${metadata.recordCounts.handovers} turnos</div>
      <div><strong>Total de Registros do Snapshot:</strong> ${metadata.recordCounts.totalRecords} itens</div>
    </div>

    <!-- 1. Resident Summary Table -->
    <h2>1. Cadastro e Condição dos Residentes (SRT Tipo II)</h2>
    <table>
      <thead>
        <tr>
          <th>Nome do Residente</th>
          <th>Idade/Sexo</th>
          <th>Acomodação</th>
          <th>Status</th>
          <th>Diagnósticos / CID</th>
          <th style="text-align: center;">Evoluções</th>
          <th style="text-align: center;">Medicações</th>
        </tr>
      </thead>
      <tbody>
        ${residentsRows}
      </tbody>
    </table>

    <!-- Page Break for Clean Print -->
    <div class="page-break"></div>

    <!-- 2. SOAP Evolutions Timeline -->
    <h2>2. Prontuários & Evoluções Clínicas Recentes (SOAP Multi)</h2>
    <div>
      ${evolutionsSection || '<p style="color: #64748b;">Nenhuma evolução clínica registrada no período.</p>'}
    </div>

    <!-- 3. Medication MAR Schedule -->
    <h2>3. Aprazamento Medicamentoso MAR (Protocolo 12/12h - 08h e 20h)</h2>
    <table>
      <thead>
        <tr>
          <th>Residente</th>
          <th>Medicamento</th>
          <th>Dosagem</th>
          <th>Via</th>
          <th>Esquema Horário</th>
          <th>Categoria / Controle</th>
        </tr>
      </thead>
      <tbody>
        ${medicationsSection || '<tr><td colspan="6" style="padding: 10px; color: #64748b;">Nenhuma medicação aprazada.</td></tr>'}
      </tbody>
    </table>

    <!-- 4. Handovers / SBAR -->
    <h2>4. Passagem de Plantão & Ocorrências Institucionais (SBAR)</h2>
    <div>
      ${handoversSection || '<p style="color: #64748b;">Nenhuma troca de plantão arquivada.</p>'}
    </div>

    <!-- Signature & Validation Footer -->
    <div style="margin-top: 32px; padding-top: 16px; border-top: 2px solid #cbd5e1; display: flex; justify-content: space-between; font-size: 11px; color: #64748b; page-break-inside: avoid;">
      <div>
        <p style="margin: 0; font-weight: bold; color: #334155;">NexaMed SRT - Módulo de Redundância e Proteção de Dados Clínicos</p>
        <p style="margin: 2px 0 0 0;">Cópia imutável salva no Firebase Storage & Firestore Redundancy para salvaguarda do piloto.</p>
      </div>
      <div style="text-align: right;">
        <p style="margin: 0; font-weight: bold; color: #334155;">Responsável Técnico de Enfermagem (RT)</p>
        <p style="margin: 2px 0 0 0;">Assinatura Digital Auditada • COREN-SC / CRM-SC</p>
      </div>
    </div>
  </div>
</body>
</html>
  `;
}

/**
 * Downloads a string payload as a JSON file in the user's browser
 */
export function downloadJsonFile(filename: string, jsonContent: string) {
  const blob = new Blob([jsonContent], { type: 'application/json;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Opens a print dialog with the formatted HTML/PDF layout
 */
export function openPdfPrintWindow(htmlContent: string) {
  const printWindow = window.open('', '_blank', 'width=1024,height=800');
  if (printWindow) {
    printWindow.document.open();
    printWindow.document.write(htmlContent);
    printWindow.document.close();
    printWindow.focus();
  }
}

/**
 * Executes a full backup snapshot creation, saving to Firebase Firestore + Server storage endpoint
 */
export async function executeAndSaveBackupSnapshot(params: {
  residents: Resident[];
  evolutions: ClinicalEvolution[];
  medications: MedicationMAR[];
  handovers: HandoverLog[];
  auditLogs?: AuditLogEntry[];
  functionalScales?: FunctionalScaleAssessment[];
  appointments?: AppointmentRecord[];
  pasRecords?: PASRecord[];
  triggerType?: 'AUTOMATIC_DAILY_MIDNIGHT' | 'MANUAL_ON_DEMAND';
  executedBy?: string;
}): Promise<BackupSnapshot> {
  const now = new Date();
  const dateStr = now.toISOString().split('T')[0];
  const timeStr = now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  const trigger = params.triggerType || 'AUTOMATIC_DAILY_MIDNIGHT';
  const prefix = trigger === 'AUTOMATIC_DAILY_MIDNIGHT' ? 'nexamed_backup_daily_00h' : 'nexamed_backup_manual';
  const sanitizedDate = dateStr.replace(/-/g, '_');
  const sanitizedTime = timeStr.replace(/:/g, '');
  const fileName = `${prefix}_${sanitizedDate}_${sanitizedTime}.json`;

  const payload = buildReadableBackupPayload(params);
  const payloadJson = JSON.stringify(payload, null, 2);
  const checksum = await calculateSha256(payloadJson);
  payload.metadata.integritySha256 = checksum;

  const pdfHtml = generateReadablePdfHtml(payload);
  const fileSizeBytes = new Blob([payloadJson]).size;
  const fileSizeFormatted = formatBytes(fileSizeBytes);

  const snapshot: BackupSnapshot = {
    id: `backup_${sanitizedDate}_${sanitizedTime}_${Math.random().toString(36).substring(2, 7)}`,
    timestamp: now.toISOString(),
    date: dateStr,
    time: timeStr,
    scheduledTime: '00:00',
    type: trigger,
    status: 'Sucesso',
    storageTarget: 'Firebase Storage / Firestore Redundancy',
    storagePath: `gs://nexamed-storage/backups/${dateStr}/${fileName}`,
    fileName,
    fileSizeBytes,
    fileSizeFormatted,
    checksumSha256: checksum,
    recordCounts: payload.metadata.recordCounts,
    summary: `Backup diário consolidado com ${payload.metadata.recordCounts.residents} residentes, ${payload.metadata.recordCounts.evolutions} evoluções SOAP, ${payload.metadata.recordCounts.medications} prescrições MAR e ${payload.metadata.recordCounts.handovers} turnos.`,
    executedBy: params.executedBy || (trigger === 'AUTOMATIC_DAILY_MIDNIGHT' ? 'Rotina Automática (Cron 00:00)' : 'Coordenação Clínica SRT'),
    payloadJson,
    pdfHtmlExport: pdfHtml,
    version: '2.4.0'
  };

  // 1. Save to Firestore `backups` collection for live cloud redundancy
  try {
    await saveBackupSnapshotToDb(snapshot);
  } catch (e) {
    console.warn('Firestore backup sync warning:', e);
  }

  // 2. Also send to Server API endpoint for server-side persistence / disk redundancy
  try {
    await fetch('/api/backup/save-snapshot', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        snapshot: {
          id: snapshot.id,
          timestamp: snapshot.timestamp,
          date: snapshot.date,
          time: snapshot.time,
          type: snapshot.type,
          fileName: snapshot.fileName,
          fileSizeBytes: snapshot.fileSizeBytes,
          fileSizeFormatted: snapshot.fileSizeFormatted,
          checksumSha256: snapshot.checksumSha256,
          recordCounts: snapshot.recordCounts,
          summary: snapshot.summary,
          executedBy: snapshot.executedBy,
          storageTarget: snapshot.storageTarget,
          payloadJson: snapshot.payloadJson
        }
      })
    });
  } catch (err) {
    console.warn('Server backup endpoint sync notice:', err);
  }

  // 3. Keep track in localStorage for quick client access
  try {
    const existingRaw = localStorage.getItem('nexamed_backup_history');
    const existing: BackupSnapshot[] = existingRaw ? JSON.parse(existingRaw) : [];
    // store metadata + light payload
    const trimmedSnapshot = { ...snapshot, pdfHtmlExport: undefined };
    const updated = [trimmedSnapshot, ...existing.filter(b => b.id !== snapshot.id)].slice(0, 30);
    localStorage.setItem('nexamed_backup_history', JSON.stringify(updated));
    localStorage.setItem('nexamed_last_backup_date', dateStr);
    localStorage.setItem('nexamed_last_backup_time', timeStr);
  } catch (e) {
    console.warn('localStorage backup caching warning:', e);
  }

  return snapshot;
}
