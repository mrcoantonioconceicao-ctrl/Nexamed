import { jsPDF } from 'jspdf';
import { Resident, ClinicalEvolution, MedicationMAR, ResidentReminder } from '../types';

export interface ClinicalPdfExportOptions {
  singleEvolutionId?: string;
  includeMedications?: boolean;
  includeReminders?: boolean;
  institutionName?: string;
  professionalName?: string;
  professionalRole?: string;
}

/**
 * Generates and downloads a clean, professional clinical PDF document
 * with the resident's summary, SOAP evolutions, active medications, and care plan.
 */
export function exportResidentClinicalSummaryPdf(
  resident: Resident,
  evolutions: ClinicalEvolution[],
  medications: MedicationMAR[] = [],
  reminders: ResidentReminder[] = [],
  options: ClinicalPdfExportOptions = {}
): void {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 14;
  const contentWidth = pageWidth - (margin * 2);
  let y = margin;

  const checkPageBreak = (neededHeight: number) => {
    if (y + neededHeight > pageHeight - 20) {
      doc.addPage();
      y = margin;
      renderHeader(true);
    }
  };

  const institution = options.institutionName || 'SERVIÇO DE RESIDÊNCIA TERAPÊUTICA (SRT) - SUS';
  const now = new Date();
  const emissionDate = now.toLocaleDateString('pt-BR');
  const emissionTime = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  // Filter evolutions if single evolution was requested
  const filteredEvolutions = options.singleEvolutionId
    ? evolutions.filter(e => e.id === options.singleEvolutionId)
    : evolutions;

  const renderHeader = (isContinuation = false) => {
    // Header Banner Box
    doc.setFillColor(15, 76, 79); // Deep Teal #0f4c4f
    doc.rect(margin, y, contentWidth, isContinuation ? 14 : 22, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(isContinuation ? 10 : 12);
    doc.text(institution, margin + 4, y + (isContinuation ? 6 : 8));

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    const subTitle = isContinuation
      ? `RELATÓRIO CLÍNICO MULTIPROFISSIONAL (Continuação) — ${resident.name}`
      : 'PRONTUÁRIO MULTIPROFISSIONAL & EVOLUÇÃO CLÍNICA (SOAP)';
    doc.text(subTitle, margin + 4, y + (isContinuation ? 11 : 14));

    doc.setFontSize(7);
    doc.text(`Emissão: ${emissionDate} às ${emissionTime}`, pageWidth - margin - 4, y + (isContinuation ? 6 : 8), { align: 'right' });
    doc.text(`Página ${doc.internal.pages.length - 1}`, pageWidth - margin - 4, y + (isContinuation ? 11 : 14), { align: 'right' });

    y += isContinuation ? 18 : 26;
  };

  // 1. Render First Header
  renderHeader(false);

  // 2. Resident Identification Card
  doc.setDrawColor(200, 215, 215);
  doc.setFillColor(248, 250, 250);
  doc.roundedRect(margin, y, contentWidth, 34, 2, 2, 'FD');

  doc.setTextColor(15, 76, 79);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text(resident.name.toUpperCase(), margin + 4, y + 6);

  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(60, 60, 60);

  const col1X = margin + 4;
  const col2X = margin + (contentWidth / 3);
  const col3X = margin + ((contentWidth / 3) * 2);

  // Row 1
  doc.text(`Quarto / Acomodação: ${resident.room || 'Não informado'}`, col1X, y + 12);
  doc.text(`Idade: ${resident.age} anos`, col2X, y + 12);
  doc.text(`Grau Dependência: ${resident.dependenceLevel}`, col3X, y + 12);

  // Row 2
  doc.text(`CPF: ${resident.cpf || 'Não informado'}`, col1X, y + 17);
  doc.text(`Admissão: ${resident.admissionsDate || 'N/D'}`, col2X, y + 17);
  doc.text(`Classificação Risco: ${resident.riskScore || 'Normal'}`, col3X, y + 17);

  // Row 3
  doc.setFont('helvetica', 'bold');
  doc.text('Diagnóstico Principal:', col1X, y + 23);
  doc.setFont('helvetica', 'normal');
  doc.text(`${resident.primaryDiagnosis || 'Não informado'}`, col1X + 32, y + 23);

  // Row 4 - Allergies & Emergency Contact
  const allergiesStr = (resident.allergies && resident.allergies.length > 0)
    ? resident.allergies.join(', ')
    : 'Nenhuma alergia relatada';
  doc.setTextColor(resident.allergies && resident.allergies.length > 0 ? 180 : 60, 20, 20);
  doc.setFont('helvetica', 'bold');
  doc.text(`Alergias: ${allergiesStr}`, col1X, y + 29);

  doc.setTextColor(60, 60, 60);
  doc.setFont('helvetica', 'normal');
  const emergencyStr = resident.emergencyContact
    ? `${resident.emergencyContact.name} (${resident.emergencyContact.relationship}) - Tel: ${resident.emergencyContact.phone}`
    : 'Nenhum contato registrado';
  doc.text(`Emergência: ${emergencyStr}`, col2X, y + 29);

  y += 38;

  // 3. Clinical Evolution (SOAP) Section
  checkPageBreak(25);
  doc.setFillColor(235, 243, 243);
  doc.rect(margin, y, contentWidth, 7, 'F');
  doc.setTextColor(15, 76, 79);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.text(`EVOLUÇÕES CLÍNICAS & REGISTRO MULTIPROFISSIONAL (SOAP) - ${filteredEvolutions.length} REGISTRO(S)`, margin + 3, y + 5);
  y += 10;

  if (filteredEvolutions.length === 0) {
    doc.setTextColor(120, 120, 120);
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(8);
    doc.text('Nenhuma evolução clínica registrada no prontuário até o momento.', margin + 4, y + 4);
    y += 10;
  } else {
    filteredEvolutions.forEach((evo, idx) => {
      checkPageBreak(45);

      // Evolution Card Container
      doc.setDrawColor(210, 220, 220);
      doc.setFillColor(255, 255, 255);
      
      const startEvoY = y;

      // Header of the single evolution
      doc.setFillColor(240, 245, 245);
      doc.rect(margin, y, contentWidth, 6.5, 'F');

      doc.setTextColor(20, 80, 80);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8.5);
      doc.text(`Evolução #${idx + 1} — Data: ${evo.date} às ${evo.time}`, margin + 3, y + 4.5);

      doc.setTextColor(80, 80, 80);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.text(`Profissional: ${evo.author} (${evo.role})`, pageWidth - margin - 3, y + 4.5, { align: 'right' });

      y += 8.5;

      // SOAP Components Breakdown
      const soapSections = [
        { label: 'S (Subjetivo):', text: evo.soap.subjective || 'Sem queixas relatadas.' },
        { label: 'O (Objetivo):', text: evo.soap.objective || 'Sinais vitais e parâmetros estáveis.' },
        { label: 'A (Avaliação):', text: evo.soap.assessment || 'Quadro clínico em acompanhamento.' },
        { label: 'P (Plano):', text: evo.soap.plan || 'Manter plano terapêutico vigente.' }
      ];

      soapSections.forEach(section => {
        checkPageBreak(12);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(8);
        doc.setTextColor(15, 76, 79);
        doc.text(section.label, margin + 4, y + 3);

        doc.setFont('helvetica', 'normal');
        doc.setTextColor(50, 50, 50);
        
        // Wrap long text
        const splitText = doc.splitTextToSize(section.text, contentWidth - 30);
        doc.text(splitText, margin + 26, y + 3);
        const textHeight = splitText.length * 3.5;
        y += Math.max(textHeight, 4.5) + 1.5;
      });

      // Bottom border for the evolution box
      doc.setDrawColor(210, 220, 220);
      doc.rect(margin, startEvoY, contentWidth, y - startEvoY);
      y += 4; // spacing between cards
    });
  }

  // 4. Medications MAR (Prescription Overview) - Optional / Included by default
  const residentMeds = medications.filter(m => m.residentId === resident.id);
  if (options.includeMedications !== false && residentMeds.length > 0) {
    checkPageBreak(25);
    doc.setFillColor(240, 245, 240);
    doc.rect(margin, y, contentWidth, 7, 'F');
    doc.setTextColor(20, 90, 50);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.text(`GRADE ATIVA DE MEDICAMENTOS (MAR / PRESCRIÇÃO MÉDICA) - ${residentMeds.length} ITEM(NS)`, margin + 3, y + 5);
    y += 9;

    // Table Header
    doc.setFillColor(245, 245, 245);
    doc.rect(margin, y, contentWidth, 5.5, 'F');
    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(60, 60, 60);

    doc.text('Medicamento & Dosagem', margin + 3, y + 4);
    doc.text('Via', margin + 70, y + 4);
    doc.text('Frequência', margin + 95, y + 4);
    doc.text('Horários Programados', margin + 130, y + 4);
    y += 6.5;

    residentMeds.forEach(med => {
      checkPageBreak(8);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);
      doc.setTextColor(40, 40, 40);

      const medTitle = `${med.medicationName} (${med.dosage})${med.isControlled ? ' [Psicotrópico]' : ''}`;
      doc.text(medTitle.substring(0, 45), margin + 3, y + 3.5);
      doc.text(med.route || 'Oral', margin + 70, y + 3.5);
      doc.text(med.frequency || '12/12h', margin + 95, y + 3.5);

      const dosesStr = med.scheduledDoses.map(d => `${d.time} (${d.status})`).join(', ');
      doc.text(dosesStr.substring(0, 40), margin + 130, y + 3.5);

      doc.setDrawColor(230, 230, 230);
      doc.line(margin, y + 5, margin + contentWidth, y + 5);
      y += 5.5;
    });
    y += 3;
  }

  // 5. Scheduled Reminders & External Appointments (CAPS, Doctors, Exams)
  const residentReminders = (resident.customReminders && resident.customReminders.length > 0)
    ? resident.customReminders
    : reminders.filter(r => r.residentId === resident.id);

  if (options.includeReminders !== false && residentReminders.length > 0) {
    checkPageBreak(25);
    doc.setFillColor(240, 245, 250);
    doc.rect(margin, y, contentWidth, 7, 'F');
    doc.setTextColor(20, 70, 110);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.text(`AGENDA, CONSULTAS EXTERNAS & ATIVIDADES TERAPÊUTICAS (${residentReminders.length})`, margin + 3, y + 5);
    y += 9;

    residentReminders.forEach(rem => {
      checkPageBreak(10);
      doc.setFontSize(7.5);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(30, 70, 100);
      doc.text(`• ${rem.title}`, margin + 3, y + 3.5);

      doc.setFont('helvetica', 'normal');
      doc.setTextColor(70, 70, 70);
      const remDetail = `Data: ${rem.date} ${rem.time} | Categoria: ${rem.category} | Local: ${rem.location || 'SRT'} | Status: ${rem.completed ? 'Concluído' : 'Pendente'}`;
      doc.text(remDetail, margin + 4, y + 7);
      y += 8.5;
    });
    y += 3;
  }

  // 6. Signatures and Clinical Legal Notice Box
  checkPageBreak(30);
  doc.setDrawColor(200, 210, 210);
  doc.line(margin, y + 2, margin + contentWidth, y + 2);
  y += 6;

  doc.setFontSize(7);
  doc.setTextColor(110, 110, 110);
  doc.setFont('helvetica', 'italic');
  doc.text(
    'Documento emitido eletronicamente para fins de prontuário, encaminhamento e auditoria em saúde mental.',
    margin + 3,
    y
  );

  y += 12;
  const sigColWidth = (contentWidth - 20) / 2;

  // Signature 1: Professional
  doc.setDrawColor(120, 120, 120);
  doc.line(margin + 5, y, margin + 5 + sigColWidth, y);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(50, 50, 50);
  const signerName = options.professionalName || 'Profissional Responsável / RT';
  const signerRole = options.professionalRole || 'Enfermagem / Equipe Multiprofissional';
  doc.text(signerName, margin + 5 + (sigColWidth / 2), y + 3.5, { align: 'center' });
  doc.text(signerRole, margin + 5 + (sigColWidth / 2), y + 6.5, { align: 'center' });

  // Signature 2: Direction / Coordination
  const sig2X = margin + sigColWidth + 20;
  doc.line(sig2X, y, sig2X + sigColWidth, y);
  doc.text('Coordenação Técnica & Direção SRT', sig2X + (sigColWidth / 2), y + 3.5, { align: 'center' });
  doc.text('Sistema de Gestão Clínica Integrada', sig2X + (sigColWidth / 2), y + 6.5, { align: 'center' });

  // Save the PDF file
  const sanitizedName = resident.name.toLowerCase().replace(/[^a-z0-9]/g, '_');
  const fileName = `prontuario_evolucao_${sanitizedName}_${now.toISOString().slice(0, 10)}.pdf`;
  doc.save(fileName);
}

/**
 * Open a formatted print preview window for physical printing or Save as PDF via browser
 */
export function printResidentClinicalSummary(
  resident: Resident,
  evolutions: ClinicalEvolution[],
  medications: MedicationMAR[] = [],
  reminders: ResidentReminder[] = [],
  options: ClinicalPdfExportOptions = {}
): void {
  const filteredEvolutions = options.singleEvolutionId
    ? evolutions.filter(e => e.id === options.singleEvolutionId)
    : evolutions;

  const residentMeds = medications.filter(m => m.residentId === resident.id);
  const residentReminders = (resident.customReminders && resident.customReminders.length > 0)
    ? resident.customReminders
    : reminders.filter(r => r.residentId === resident.id);

  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    alert('Por favor, permita pop-ups para imprimir o prontuário clínico.');
    return;
  }

  const now = new Date().toLocaleString('pt-BR');

  const htmlContent = `
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
      <meta charset="utf-8" />
      <title>Prontuário e Evolução Clínica - ${resident.name}</title>
      <style>
        @page {
          size: A4 portrait;
          margin: 12mm 15mm 15mm 15mm;
        }
        body {
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
          color: #1a202c;
          line-height: 1.4;
          font-size: 11pt;
          margin: 0;
          padding: 0;
        }
        .header-box {
          background-color: #0f4c4f;
          color: #ffffff;
          padding: 12px 16px;
          border-radius: 6px;
          margin-bottom: 14px;
        }
        .header-title {
          font-size: 14pt;
          font-weight: bold;
          margin: 0;
          letter-spacing: 0.5px;
        }
        .header-sub {
          font-size: 9pt;
          opacity: 0.9;
          margin-top: 2px;
        }
        .header-meta {
          font-size: 8pt;
          text-align: right;
          float: right;
        }
        .info-card {
          border: 1px solid #cbd5e1;
          background-color: #f8fafc;
          border-radius: 6px;
          padding: 10px 14px;
          margin-bottom: 16px;
        }
        .info-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 6px 12px;
          font-size: 9.5pt;
        }
        .info-label {
          font-weight: 600;
          color: #475569;
        }
        .info-val {
          color: #0f172a;
        }
        .section-title {
          font-size: 11pt;
          font-weight: bold;
          color: #0f4c4f;
          background-color: #e6fffa;
          padding: 6px 10px;
          border-left: 4px solid #0d9488;
          border-radius: 4px;
          margin: 16px 0 10px 0;
        }
        .soap-card {
          border: 1px solid #e2e8f0;
          border-radius: 6px;
          padding: 10px;
          margin-bottom: 12px;
          background: #ffffff;
          page-break-inside: avoid;
        }
        .soap-header {
          display: flex;
          justify-content: space-between;
          border-bottom: 1px solid #e2e8f0;
          padding-bottom: 4px;
          margin-bottom: 8px;
          font-size: 9pt;
          color: #334155;
          font-weight: bold;
        }
        .soap-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 8px;
        }
        .soap-block {
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 4px;
          padding: 6px 8px;
          font-size: 9pt;
        }
        .soap-letter {
          font-weight: bold;
          color: #0f4c4f;
          font-size: 8.5pt;
          text-transform: uppercase;
          margin-bottom: 2px;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          font-size: 8.5pt;
          margin-top: 6px;
        }
        th, td {
          border: 1px solid #cbd5e1;
          padding: 5px 8px;
          text-align: left;
        }
        th {
          background-color: #f1f5f9;
          font-weight: 600;
          color: #334155;
        }
        .signatures {
          display: flex;
          justify-content: space-around;
          margin-top: 35px;
          page-break-inside: avoid;
        }
        .signature-line {
          width: 40%;
          text-align: center;
          border-top: 1px solid #475569;
          padding-top: 4px;
          font-size: 8.5pt;
          color: #334155;
        }
        @media print {
          body {
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          .no-print {
            display: none !important;
          }
        }
      </style>
    </head>
    <body>
      <div class="no-print" style="background:#0d9488; color:white; padding:10px; text-align:center; font-weight:bold; margin-bottom:15px; border-radius:6px; cursor:pointer;" onclick="window.print()">
        🖨️ Clique Aqui para Imprimir ou Salvar como PDF
      </div>

      <div class="header-box">
        <div class="header-meta">
          Emissão: ${now}
        </div>
        <h1 class="header-title">${options.institutionName || 'SERVIÇO DE RESIDÊNCIA TERAPÊUTICA (SRT) - SUS'}</h1>
        <div class="header-sub">RELATÓRIO CLÍNICO & PRONTUÁRIO MULTIPROFISSIONAL (SOAP)</div>
      </div>

      <div class="info-card">
        <div style="font-size: 13pt; font-weight: bold; color: #0f4c4f; margin-bottom: 6px;">
          ${resident.name}
        </div>
        <div class="info-grid">
          <div><span class="info-label">Quarto:</span> <span class="info-val">${resident.room || 'N/D'}</span></div>
          <div><span class="info-label">Idade:</span> <span class="info-val">${resident.age} anos</span></div>
          <div><span class="info-label">Dependência:</span> <span class="info-val">${resident.dependenceLevel}</span></div>
          <div><span class="info-label">CPF:</span> <span class="info-val">${resident.cpf || 'N/D'}</span></div>
          <div><span class="info-label">Admissão:</span> <span class="info-val">${resident.admissionsDate || 'N/D'}</span></div>
          <div><span class="info-label">Risco Clínico:</span> <span class="info-val">${resident.riskScore || 'Normal'}</span></div>
          <div style="grid-column: span 3;"><span class="info-label">Diagnóstico Principal:</span> <span class="info-val">${resident.primaryDiagnosis || 'N/D'}</span></div>
          <div style="grid-column: span 3;"><span class="info-label">Alergias:</span> <span class="info-val" style="color:red; font-weight:bold;">${resident.allergies?.join(', ') || 'Nenhuma relatada'}</span></div>
          <div style="grid-column: span 3;"><span class="info-label">Contato de Emergência:</span> <span class="info-val">${resident.emergencyContact ? `${resident.emergencyContact.name} (${resident.emergencyContact.relationship}) - ${resident.emergencyContact.phone}` : 'N/D'}</span></div>
        </div>
      </div>

      <div class="section-title">
        HISTÓRICO DE EVOLUÇÕES CLÍNICAS (SOAP) — ${filteredEvolutions.length} REGISTRO(S)
      </div>

      ${filteredEvolutions.length === 0 ? '<p style="color:#64748b; font-style:italic;">Nenhuma evolução clínica registrada.</p>' : ''}

      ${filteredEvolutions.map((evo, i) => `
        <div class="soap-card">
          <div class="soap-header">
            <span>Evolução #${i + 1} • Data: ${evo.date} às ${evo.time}</span>
            <span>Profissional: ${evo.author} (${evo.role})</span>
          </div>
          <div class="soap-grid">
            <div class="soap-block">
              <div class="soap-letter">S - Subjetivo</div>
              <div>${evo.soap.subjective || 'Sem queixas relatadas.'}</div>
            </div>
            <div class="soap-block">
              <div class="soap-letter">O - Objetivo</div>
              <div>${evo.soap.objective || 'Parâmetros estáveis.'}</div>
            </div>
            <div class="soap-block">
              <div class="soap-letter">A - Avaliação</div>
              <div>${evo.soap.assessment || 'Quadro clínico estável.'}</div>
            </div>
            <div class="soap-block">
              <div class="soap-letter">P - Plano</div>
              <div>${evo.soap.plan || 'Manter condutas vigentes.'}</div>
            </div>
          </div>
        </div>
      `).join('')}

      ${residentMeds.length > 0 ? `
        <div class="section-title">PRESCRIÇÃO MEDICAMENTOSA ATIVA (MAR)</div>
        <table>
          <thead>
            <tr>
              <th>Medicamento / Dosagem</th>
              <th>Via</th>
              <th>Frequência</th>
              <th>Horários & Status</th>
            </tr>
          </thead>
          <tbody>
            ${residentMeds.map(m => `
              <tr>
                <td><strong>${m.medicationName}</strong> (${m.dosage}) ${m.isControlled ? '<span style="color:#c2410c;">[Controlado]</span>' : ''}</td>
                <td>${m.route}</td>
                <td>${m.frequency}</td>
                <td>${m.scheduledDoses.map(d => `${d.time} (${d.status})`).join(', ')}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      ` : ''}

      ${residentReminders.length > 0 ? `
        <div class="section-title">CONSULTAS, EXAMES & ATIVIDADES AGENDADAS</div>
        <table>
          <thead>
            <tr>
              <th>Título / Atividade</th>
              <th>Categoria</th>
              <th>Data & Hora</th>
              <th>Local / Profissional</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            ${residentReminders.map(r => `
              <tr>
                <td><strong>${r.title}</strong></td>
                <td>${r.category}</td>
                <td>${r.date} ${r.time}</td>
                <td>${r.location || 'SRT'} ${r.professionalOrOrganizer ? `(${r.professionalOrOrganizer})` : ''}</td>
                <td>${r.completed ? '✓ Concluído' : '⏳ Pendente'}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      ` : ''}

      <div class="signatures">
        <div class="signature-line">
          <strong>${options.professionalName || 'Profissional de Referência / RT'}</strong><br />
          Equipe Multiprofissional SRT
        </div>
        <div class="signature-line">
          <strong>Coordenação Geral & Direção Técnica</strong><br />
          Serviço Residencial Terapêutico
        </div>
      </div>

      <script>
        window.onload = function() {
          setTimeout(function() {
            window.print();
          }, 300);
        };
      </script>
    </body>
    </html>
  `;

  printWindow.document.open();
  printWindow.document.write(htmlContent);
  printWindow.document.close();
}
