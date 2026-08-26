import { ResidentReminder, ReminderCategory, ReminderPriority } from '../types';

// Web Audio API chime specifically for scheduled reminders
export function playReminderNotificationChime() {
  try {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    const now = ctx.currentTime;

    // Harmonious alert chime (523.25Hz -> 659.25Hz -> 783.99Hz / C5 -> E5 -> G5)
    const notes = [523.25, 659.25, 783.99];
    notes.forEach((freq, index) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + index * 0.12);

      gain.gain.setValueAtTime(0, now + index * 0.12);
      gain.gain.linearRampToValueAtTime(0.2, now + index * 0.12 + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.001, now + index * 0.12 + 0.4);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + index * 0.12);
      osc.stop(now + index * 0.12 + 0.45);
    });
  } catch (err) {
    console.warn('Erro ao emitir som de lembrete:', err);
  }
}

// Dispatch browser notification for a reminder
export function sendBrowserReminderNotification(
  reminder: ResidentReminder,
  onClick?: () => void
) {
  if (typeof window === 'undefined' || !('Notification' in window)) return;

  if (Notification.permission === 'granted') {
    const title = `📅 Lembrete SRT: ${reminder.residentName}`;
    const body = `${reminder.title}\n⏰ Horário: ${reminder.time} | ${reminder.location || 'Residencial'}\n👤 Responsável: ${reminder.responsibleStaff || 'Equipe'}`;

    try {
      const n = new Notification(title, {
        body,
        icon: '/favicon.ico',
        tag: `reminder-${reminder.id}`,
        requireInteraction: reminder.priority === 'Crítica' || reminder.priority === 'Alta',
      });

      n.onclick = () => {
        window.focus();
        if (onClick) onClick();
      };
    } catch (e) {
      console.warn('Falha ao disparar Notification API:', e);
    }
  }
}

export interface ReminderPresetTemplate {
  title: string;
  category: ReminderCategory;
  defaultTime: string;
  defaultLocation: string;
  defaultProfessional: string;
  defaultStaff: string;
  priority: ReminderPriority;
  notes: string;
}

export const REMINDER_PRESET_TEMPLATES: ReminderPresetTemplate[] = [
  {
    title: 'Consulta Psiquiátrica no CAPS II',
    category: 'Consulta Médica',
    defaultTime: '14:00',
    defaultLocation: 'CAPS II Blumenau - Setor de Saúde Mental',
    defaultProfessional: 'Dr. Fernando Alencar (Médico Psiquiatra)',
    defaultStaff: 'Enf. Mariana Castro (RT)',
    priority: 'Alta',
    notes: 'Avaliar estabilização de humor, tolerância aos psicotrópicos e levar espelho da medicação MAR.'
  },
  {
    title: 'Oficina Terapêutica & Arteterapia',
    category: 'Atividade Agendada',
    defaultTime: '15:30',
    defaultLocation: 'Sala Multiuso / Jardim Terapêutico SRT',
    defaultProfessional: 'Dra. Juliana Prado (Terapeuta Ocupacional)',
    defaultStaff: 'Cuidadora de Plantão',
    priority: 'Normal',
    notes: 'Estimulação de autonomia, expressão corporal e socialização em grupo.'
  },
  {
    title: 'Coleta de Exames Laboratoriais (Sangue/Urina)',
    category: 'Exame Laboratorial',
    defaultTime: '07:30',
    defaultLocation: 'Enfermaria SRT / Coleta Domiciliar',
    defaultProfessional: 'Laboratório Central Municipal',
    defaultStaff: 'Tec. Enfermagem Ana Paula',
    priority: 'Alta',
    notes: 'Verificar se há necessidade de jejum de 8h a 12h e suspensão pontual de dose pré-coleta.'
  },
  {
    title: 'Visita Familiar Programada',
    category: 'Visita Familiar',
    defaultTime: '15:00',
    defaultLocation: 'Sala de Visitas / Espaço de Convivência',
    defaultProfessional: 'Serviço Social SRT',
    defaultStaff: 'Cuidador de Referência',
    priority: 'Normal',
    notes: 'Acolhimento familiar e reforço do vínculo socioafetivo conforme PTS.'
  },
  {
    title: 'Renovação de Receituário de Controle Especial (Port. 344)',
    category: 'Renovação Receita',
    defaultTime: '11:00',
    defaultLocation: 'Farmácia Central / Policlínica Municipal',
    defaultProfessional: 'Dr. Fernando Alencar',
    defaultStaff: 'Enf. Mariana Castro (RT)',
    priority: 'Alta',
    notes: 'Garantir renovação de receitas B1 (Notificação Azul) e C1 (Branca em 2 vias) antes do esgotamento do estoque.'
  },
  {
    title: 'Atendimento Odontológico / Saúde Bucal',
    category: 'Consulta Médica',
    defaultTime: '09:30',
    defaultLocation: 'CEO - Centro de Especialidades Odontológicas',
    defaultProfessional: 'Dr. Roberto Mendes (Cirurgião Dentista)',
    defaultStaff: 'Cuidador Acompanhante',
    priority: 'Normal',
    notes: 'Acompanhar morador no transporte sanitário com apoio físico e carteira de identificação SUS.'
  },
  {
    title: 'Fisioterapia Motora & Prevenção de Quedas',
    category: 'Atividade Agendada',
    defaultTime: '10:00',
    defaultLocation: 'Pátio Externo / Área de Exercícios',
    defaultProfessional: 'Dr. Lucas Silveira (Fisioterapeuta)',
    defaultStaff: 'Cuidador de Plantão',
    priority: 'Normal',
    notes: 'Treinamento de marcha, fortalecimento de membros inferiores e transferência segura.'
  },
  {
    title: 'Cuidados Específicos de Enfermagem (Curativo / Glicemia)',
    category: 'Cuidado Específico',
    defaultTime: '08:30',
    defaultLocation: 'Quarto do Residente / Leito',
    defaultProfessional: 'Equipe de Enfermagem SRT',
    defaultStaff: 'Técnico de Enfermagem',
    priority: 'Alta',
    notes: 'Realizar procedimento asséptico, registrar aspecto em evolução de enfermagem e anotar valores.'
  }
];

export function getCategoryBadgeStyle(category: ReminderCategory): { bg: string; text: string; border: string } {
  switch (category) {
    case 'Consulta Médica':
      return { bg: 'bg-sky-50', text: 'text-sky-800', border: 'border-sky-200' };
    case 'Atividade Agendada':
      return { bg: 'bg-teal-50', text: 'text-teal-800', border: 'border-teal-200' };
    case 'Exame Laboratorial':
      return { bg: 'bg-purple-50', text: 'text-purple-800', border: 'border-purple-200' };
    case 'Visita Familiar':
      return { bg: 'bg-emerald-50', text: 'text-emerald-800', border: 'border-emerald-200' };
    case 'Renovação Receita':
      return { bg: 'bg-amber-50', text: 'text-amber-800', border: 'border-amber-200' };
    case 'Cuidado Específico':
      return { bg: 'bg-rose-50', text: 'text-rose-800', border: 'border-rose-200' };
    default:
      return { bg: 'bg-zinc-50', text: 'text-zinc-800', border: 'border-zinc-200' };
  }
}

export function getPriorityBadgeStyle(priority: ReminderPriority): { bg: string; text: string; border: string } {
  switch (priority) {
    case 'Crítica':
      return { bg: 'bg-rose-100', text: 'text-rose-900', border: 'border-rose-300' };
    case 'Alta':
      return { bg: 'bg-orange-50', text: 'text-orange-900', border: 'border-orange-200' };
    case 'Média':
      return { bg: 'bg-amber-50', text: 'text-amber-900', border: 'border-amber-200' };
    default:
      return { bg: 'bg-zinc-100', text: 'text-zinc-700', border: 'border-zinc-200' };
  }
}
