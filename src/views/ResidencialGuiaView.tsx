import React, { useState } from 'react';
import { 
  Home, 
  Heart, 
  Users, 
  CheckCircle2, 
  XCircle, 
  ShieldCheck, 
  Stethoscope, 
  Sparkles, 
  BookOpen, 
  AlertTriangle, 
  FileText, 
  Building2, 
  UserCheck, 
  Activity, 
  Compass, 
  Scale, 
  HelpCircle,
  ArrowRight,
  Info
} from 'lucide-react';

export const ResidencialGuiaView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'conceito' | 'regras' | 'elegibilidade' | 'equipe' | 'portaria'>('conceito');

  return (
    <div className="space-y-6 pb-16 animate-in fade-in duration-200">
      {/* Header Banner */}
      <div className="p-6 bg-gradient-to-r from-teal-900 via-teal-800 to-emerald-900 text-white rounded-3xl shadow-md relative overflow-hidden">
        <div className="absolute right-0 top-0 opacity-10 pointer-events-none transform translate-x-8 -translate-y-8">
          <Building2 className="w-96 h-96 text-white" />
        </div>

        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="flex items-center gap-2">
            <span className="p-2 bg-teal-700/60 rounded-xl border border-teal-500/40">
              <Home className="w-5 h-5 text-teal-200" />
            </span>
            <span className="text-[10px] font-extrabold text-teal-200 bg-teal-800/80 px-2.5 py-0.5 rounded-md border border-teal-600/50 uppercase tracking-wider">
              Diretrizes Técnicas e Regulatórias (Portaria MS Nº 106/2000 & RAPS)
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
            Manual do Residencial Terapêutico (SRT)
          </h1>

          <p className="text-xs sm:text-sm text-teal-100 leading-relaxed">
            Guia de orientação sobre o funcionamento, direitos dos residentes, regras de convivência, perfil de elegibilidade e equipe multidisciplinar obrigatória nas Residências Terapêuticas.
          </p>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto border-b border-zinc-200 pb-2 no-scrollbar text-xs font-bold">
        <button
          onClick={() => setActiveTab('conceito')}
          className={`px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 shrink-0 ${
            activeTab === 'conceito'
              ? 'bg-teal-700 text-white shadow-xs'
              : 'bg-white text-zinc-600 hover:bg-zinc-100 border border-zinc-200'
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>O que é e Como Funciona</span>
        </button>

        <button
          onClick={() => setActiveTab('regras')}
          className={`px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 shrink-0 ${
            activeTab === 'regras'
              ? 'bg-teal-700 text-white shadow-xs'
              : 'bg-white text-zinc-600 hover:bg-zinc-100 border border-zinc-200'
          }`}
        >
          <Scale className="w-4 h-4" />
          <span>O que PODE e NÃO PODE</span>
        </button>

        <button
          onClick={() => setActiveTab('elegibilidade')}
          className={`px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 shrink-0 ${
            activeTab === 'elegibilidade'
              ? 'bg-teal-700 text-white shadow-xs'
              : 'bg-white text-zinc-600 hover:bg-zinc-100 border border-zinc-200'
          }`}
        >
          <UserCheck className="w-4 h-4" />
          <span>Residentes Aptos (Elegibilidade)</span>
        </button>

        <button
          onClick={() => setActiveTab('equipe')}
          className={`px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 shrink-0 ${
            activeTab === 'equipe'
              ? 'bg-teal-700 text-white shadow-xs'
              : 'bg-white text-zinc-600 hover:bg-zinc-100 border border-zinc-200'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Equipe Obrigatória e Funções</span>
        </button>
      </div>

      {/* TAB 1: O QUE É E COMO FUNCIONA */}
      {activeTab === 'conceito' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-5 bg-white border border-teal-200/90 rounded-2xl shadow-2xs space-y-2">
              <div className="p-2.5 bg-teal-50 w-fit rounded-xl text-teal-700 border border-teal-100">
                <Home className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-black text-zinc-900">Moradia Inclusiva e Humana</h3>
              <p className="text-xs text-zinc-600 leading-relaxed">
                O Serviço de Residência Terapêutica (SRT) é uma moradia inserida na comunidade, destinada a pessoas com transtornos mentais graves egressas de internações psiquiátricas prolongadas ou sem vínculos familiares preservados.
              </p>
            </div>

            <div className="p-5 bg-white border border-emerald-200/90 rounded-2xl shadow-2xs space-y-2">
              <div className="p-2.5 bg-emerald-50 w-fit rounded-xl text-emerald-700 border border-emerald-100">
                <Heart className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-black text-zinc-900">Para que Serve?</h3>
              <p className="text-xs text-zinc-600 leading-relaxed">
                Visa à reconstrução da autonomia, reinserção social e resgate da cidadania do residente, substituindo o modelo asilar/hospitalar por um espaço acolhedor e comunitário de reabilitação psicossocial.
              </p>
            </div>

            <div className="p-5 bg-white border border-purple-200/90 rounded-2xl shadow-2xs space-y-2">
              <div className="p-2.5 bg-purple-50 w-fit rounded-xl text-purple-700 border border-purple-100">
                <Compass className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-black text-zinc-900">Como Funciona no Dia a Dia?</h3>
              <p className="text-xs text-zinc-600 leading-relaxed">
                Funciona como uma casa convencional, onde até 8 a 10 residentes compartilham o lar sob o acompanhamento contínuo de cuidadores e equipe de enfermagem, articulados à rede de saúde mental (CAPS).
              </p>
            </div>
          </div>

          {/* Detailed Concept Breakdown */}
          <div className="p-6 bg-white border border-zinc-200/90 rounded-2xl shadow-xs space-y-4">
            <h2 className="text-base font-black text-zinc-900 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-teal-700" />
              <span>Pilares Fundamentais do Residencial Terapêutico</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-4 bg-zinc-50 border border-zinc-200 rounded-xl space-y-1">
                <span className="font-extrabold text-teal-800 text-xs block">1. Não Hospitalar (Espaço de Vida)</span>
                <p className="text-zinc-600 leading-relaxed">
                  O SRT não é um hospital nem uma clínica psiquiátrica de internação. É a residência do cidadão, onde ele possui seu quarto, pertences pessoais, liberdade de convivência e rotina doméstica.
                </p>
              </div>

              <div className="p-4 bg-zinc-50 border border-zinc-200 rounded-xl space-y-1">
                <span className="font-extrabold text-teal-800 text-xs block">2. Articulação com o CAPS</span>
                <p className="text-zinc-600 leading-relaxed">
                  O tratamento clínico e psiquiátrico ocorre nos Centros de Atenção Psicossocial (CAPS) e na rede de Atenção Básica, garantindo o acompanhamento médico e terapêutico fora do domicílio.
                </p>
              </div>

              <div className="p-4 bg-zinc-50 border border-zinc-200 rounded-xl space-y-1">
                <span className="font-extrabold text-teal-800 text-xs block">3. Gestão Compartilhada do Lar</span>
                <p className="text-zinc-600 leading-relaxed">
                  Os moradores participam no planejamento das refeições, escolha de vestuário, atividades de lazer e passeios comunitários, estimulando sua independência funcional e tomada de decisão.
                </p>
              </div>

              <div className="p-4 bg-zinc-50 border border-zinc-200 rounded-xl space-y-1">
                <span className="font-extrabold text-teal-800 text-xs block">4. Suporte de Enfermagem e Cuidados 24h</span>
                <p className="text-zinc-600 leading-relaxed">
                  Cuidadores e auxiliares de enfermagem prestam auxílio no aprazamento e administração de medicações (MAR 12/12h), rotinas de higiene, alimentação balanceada e segurança diária.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: O QUE PODE E O QUE NÃO PODE */}
      {activeTab === 'regras' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* O QUE PODE */}
          <div className="p-6 bg-emerald-50/60 border border-emerald-200 rounded-2xl space-y-4">
            <div className="flex items-center gap-2 border-b border-emerald-200/80 pb-3">
              <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" />
              <div>
                <h2 className="text-base font-black text-emerald-950">O que É PERMITIDO / INCENTIVADO (PODE)</h2>
                <p className="text-xs text-emerald-800">Direitos garantidos e estímulos de reabilitação psicossocial</p>
              </div>
            </div>

            <ul className="space-y-3 text-xs text-emerald-950">
              <li className="flex items-start gap-2.5">
                <span className="p-1 bg-emerald-200/80 text-emerald-900 rounded-md font-bold text-[10px] shrink-0 mt-0.5">01</span>
                <div>
                  <strong>Direito à Livre Circulação e Cidadania:</strong>
                  <p className="text-emerald-800 text-[11px] mt-0.5">Entrar e sair da residência para passeios, consultas no CAPS, compras e lazer, respeitando o plano terapêutico e acompanhamento quando necessário.</p>
                </div>
              </li>

              <li className="flex items-start gap-2.5">
                <span className="p-1 bg-emerald-200/80 text-emerald-900 rounded-md font-bold text-[10px] shrink-0 mt-0.5">02</span>
                <div>
                  <strong>Personalização do Espaço e Pertences:</strong>
                  <p className="text-emerald-800 text-[11px] mt-0.5">Ter roupas próprias, objetos pessoais, decoração no quarto e guarda individual de seus pertences com privacidade.</p>
                </div>
              </li>

              <li className="flex items-start gap-2.5">
                <span className="p-1 bg-emerald-200/80 text-emerald-900 rounded-md font-bold text-[10px] shrink-0 mt-0.5">03</span>
                <div>
                  <strong>Receber Visitas de Familiares e Amigos:</strong>
                  <p className="text-emerald-800 text-[11px] mt-0.5">Manter e reforçar laços afetivos e familiares através de visitas periódicas na residência ou passeios externos.</p>
                </div>
              </li>

              <li className="flex items-start gap-2.5">
                <span className="p-1 bg-emerald-200/80 text-emerald-900 rounded-md font-bold text-[10px] shrink-0 mt-0.5">04</span>
                <div>
                  <strong>Participação nas Decisões Domésticas:</strong>
                  <p className="text-emerald-800 text-[11px] mt-0.5">Apoiar no planejamento das refeições, atividades de arte, oficinas de estímulo cognitivo e organização do lar.</p>
                </div>
              </li>

              <li className="flex items-start gap-2.5">
                <span className="p-1 bg-emerald-200/80 text-emerald-900 rounded-md font-bold text-[10px] shrink-0 mt-0.5">05</span>
                <div>
                  <strong>Expressar Recusa Informada de Medicação:</strong>
                  <p className="text-emerald-800 text-[11px] mt-0.5">O residente tem o direito de recusar medicações, o que deve ser acolhido, registrado em prontuário com justificativa e informado à equipe médica do CAPS.</p>
                </div>
              </li>
            </ul>
          </div>

          {/* O QUE NÃO PODE */}
          <div className="p-6 bg-rose-50/60 border border-rose-200 rounded-2xl space-y-4">
            <div className="flex items-center gap-2 border-b border-rose-200/80 pb-3">
              <XCircle className="w-6 h-6 text-rose-600 shrink-0" />
              <div>
                <h2 className="text-base font-black text-rose-950">O que É PROIBIDO (NÃO PODE)</h2>
                <p className="text-xs text-rose-800">Práticas vedadas pela legislação antimanicomial e diretrizes do SUS</p>
              </div>
            </div>

            <ul className="space-y-3 text-xs text-rose-950">
              <li className="flex items-start gap-2.5">
                <span className="p-1 bg-rose-200/80 text-rose-900 rounded-md font-bold text-[10px] shrink-0 mt-0.5">01</span>
                <div>
                  <strong>PROIBIDO Contenção Física Arbitrária ou Isolamento:</strong>
                  <p className="text-rose-800 text-[11px] mt-0.5">É estritamente vedado amarrar residentes, trancá-los em quartos ou aplicar castigos/isolamento disciplinar.</p>
                </div>
              </li>

              <li className="flex items-start gap-2.5">
                <span className="p-1 bg-rose-200/80 text-rose-900 rounded-md font-bold text-[10px] shrink-0 mt-0.5">02</span>
                <div>
                  <strong>PROIBIDA Apropriação Indébita de Benefícios (BPC):</strong>
                  <p className="text-rose-800 text-[11px] mt-0.5">O benefício previdenciário/assistencial pertence ao residente e não pode ser tomado integralmente pela instituição ou terceiros sem prestação de contas.</p>
                </div>
              </li>

              <li className="flex items-start gap-2.5">
                <span className="p-1 bg-rose-200/80 text-rose-900 rounded-md font-bold text-[10px] shrink-0 mt-0.5">03</span>
                <div>
                  <strong>PROIBIDO Transformar a Residência em Hospital:</strong>
                  <p className="text-rose-800 text-[11px] mt-0.5">Não é permitido colocar grades excessivas, utilizar jalecos de forma opressiva ou criar ambiente hospitalar que descaracterize a moradia.</p>
                </div>
              </li>

              <li className="flex items-start gap-2.5">
                <span className="p-1 bg-rose-200/80 text-rose-900 rounded-md font-bold text-[10px] shrink-0 mt-0.5">04</span>
                <div>
                  <strong>PROIBIDA Superlotação do Imóvel:</strong>
                  <p className="text-rose-800 text-[11px] mt-0.5">Cada Residência Terapêutica deve abrigar no máximo de 8 a 10 residentes, garantindo espaço físico adequado, quartos privativos e conforto.</p>
                </div>
              </li>

              <li className="flex items-start gap-2.5">
                <span className="p-1 bg-rose-200/80 text-rose-900 rounded-md font-bold text-[10px] shrink-0 mt-0.5">05</span>
                <div>
                  <strong>PROIBIDA Administração Medicamentosa Sem Prescrição:</strong>
                  <p className="text-rose-800 text-[11px] mt-0.5">Toda medicação deve ter prescrição médica vigente. É vedado 'dopar' ou sedar residentes como forma de controle comportamental.</p>
                </div>
              </li>
            </ul>
          </div>
        </div>
      )}

      {/* TAB 3: ELEGIBILIDADE DE RESIDENTES */}
      {activeTab === 'elegibilidade' && (
        <div className="space-y-6">
          <div className="p-6 bg-white border border-zinc-200/90 rounded-2xl shadow-xs space-y-4">
            <div className="flex items-center gap-3 border-b border-zinc-100 pb-3">
              <div className="p-2.5 bg-teal-100 text-teal-800 rounded-xl font-bold">
                <UserCheck className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-black text-zinc-900">Perfil dos Residentes Aptos ao Residencial Terapêutico</h2>
                <p className="text-xs text-zinc-500">Critérios de admissão e elegibilidade regulamentados pelo Ministério da Saúde</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-xl space-y-2">
                <span className="font-extrabold text-emerald-900 text-sm flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>1. Egressos de Internação Psiquiátrica de Longa Permanência</span>
                </span>
                <p className="text-emerald-900 leading-relaxed text-[11px]">
                  Pessoas que permaneceram por 2 anos ou mais ininterruptos internadas em hospitais psiquiátricos, colônias ou asilos e perderam o suporte familiar direto.
                </p>
              </div>

              <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-xl space-y-2">
                <span className="font-extrabold text-emerald-900 text-sm flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>2. Transtorno Mental Grave com Vulnerabilidade Social</span>
                </span>
                <p className="text-emerald-900 leading-relaxed text-[11px]">
                  Indivíduos com diagnóstico de Esquizofrenia, Transtorno Bipolar grave, Transtorno Esquizoafetivo ou condições neuropsiquiátricas crônicas sem moradia estruturada.
                </p>
              </div>

              <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-xl space-y-2">
                <span className="font-extrabold text-emerald-900 text-sm flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>3. Estabilidade Clínica / Sem Necessidade Hospitalar Aguda</span>
                </span>
                <p className="text-emerald-900 leading-relaxed text-[11px]">
                  O residente deve estar em fase de estabilização do quadro psiquiátrico agudo, não necessitando de suporte de UTI ou cuidados hospitalares invasivos ininterruptos.
                </p>
              </div>

              <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-xl space-y-2">
                <span className="font-extrabold text-emerald-900 text-sm flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>4. Encaminhamento e PTS Aprovado pelo CAPS</span>
                </span>
                <p className="text-emerald-900 leading-relaxed text-[11px]">
                  A vaga exige relatório prévio da equipe multidisciplinar do CAPS de referência com Projeto Terapêutico Singular (PTS) focado na reabilitação no lar.
                </p>
              </div>
            </div>
          </div>

          {/* Quem NÃO é elegível para o SRT Tipo I/II */}
          <div className="p-5 bg-amber-50/80 border border-amber-200 rounded-2xl space-y-3 text-xs">
            <h3 className="font-extrabold text-amber-900 text-sm flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              <span>Casos em que o Residencial Terapêutico NÃO é Indicado:</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-amber-950 text-[11px]">
              <div className="p-3 bg-white/90 rounded-xl border border-amber-200">
                <strong>Surtos Psycóticos Agudos:</strong> Necessitam de acolhimento de urgência em leito psiquiátrico de hospital geral ou CAPS III.
              </div>
              <div className="p-3 bg-white/90 rounded-xl border border-amber-200">
                <strong>Dependência Química Exclusiva sem Transtorno Psíquico Associado:</strong> Devem ser direcionados às Comunidades Terapêuticas ou CAPS AD.
              </div>
              <div className="p-3 bg-white/90 rounded-xl border border-amber-200">
                <strong>Pacientes Acamados de Alta Complexidade Clínica:</strong> Requerem suporte de Unidade de Acolhimento de Cuidados Continuados ou ILPI de grau III.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: EQUIPE OBRIGATÓRIA E FUNÇÕES */}
      {activeTab === 'equipe' && (
        <div className="space-y-6">
          <div className="p-6 bg-white border border-zinc-200/90 rounded-2xl shadow-xs space-y-4">
            <div className="flex items-center gap-3 border-b border-zinc-100 pb-3">
              <div className="p-2.5 bg-teal-100 text-teal-800 rounded-xl font-bold">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-black text-zinc-900">Equipe Multidisciplinar Obrigatória no SRT</h2>
                <p className="text-xs text-zinc-500">Profissionais necessários conforme a RDC da ANVISA e diretrizes do Ministério da Saúde</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Profissional 1: Cuidador de Saúde Mental */}
              <div className="p-4 bg-zinc-50 border border-zinc-200 rounded-xl space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-teal-900 text-sm flex items-center gap-2">
                    <Heart className="w-4 h-4 text-teal-600" />
                    <span>Cuidadores de Saúde Mental / Monitores (24h)</span>
                  </span>
                  <span className="text-[10px] font-extrabold px-2 py-0.5 rounded bg-teal-100 text-teal-800 border border-teal-200">
                    Obrigatório no Lar
                  </span>
                </div>
                <p className="text-zinc-600 leading-relaxed text-[11px]">
                  <strong>Por que é obrigatório:</strong> Garante apoio diário nas atividades domésticas, higiene, preparo das refeições, acompanhamento em passeios comunitários e prevenção de acidentes durante os turnos de 12x36h ou 24h.
                </p>
              </div>

              {/* Profissional 2: Enfermeiro Responsável Técnico (RT) */}
              <div className="p-4 bg-zinc-50 border border-zinc-200 rounded-xl space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-teal-900 text-sm flex items-center gap-2">
                    <Stethoscope className="w-4 h-4 text-teal-600" />
                    <span>Enfermeiro Responsável Técnico (RT) / Tec. Enfermagem</span>
                  </span>
                  <span className="text-[10px] font-extrabold px-2 py-0.5 rounded bg-teal-100 text-teal-800 border border-teal-200">
                    Supervisão Semanal/Diária
                  </span>
                </div>
                <p className="text-zinc-600 leading-relaxed text-[11px]">
                  <strong>Por que é obrigatório:</strong> Responsável pelo aprazamento seguro de medicamentos (Cartão MAR 12/12h), monitoramento dos sinais vitais, cálculo da escala NEWS2 e curativos de enfermagem.
                </p>
              </div>

              {/* Profissional 3: Psicólogo Clínico */}
              <div className="p-4 bg-zinc-50 border border-zinc-200 rounded-xl space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-teal-900 text-sm flex items-center gap-2">
                    <Activity className="w-4 h-4 text-teal-600" />
                    <span>Psicólogo Clínico / Reabilitação Psicossocial</span>
                  </span>
                  <span className="text-[10px] font-extrabold px-2 py-0.5 rounded bg-teal-100 text-teal-800 border border-teal-200">
                    CAPS / Referência
                  </span>
                </div>
                <p className="text-zinc-600 leading-relaxed text-[11px]">
                  <strong>Por que é obrigatório:</strong> Acompanha o desenvolvimento das habilidades socioemocionais, media conflitos de convivência entre os moradores e constrói a autonomia interpessoal do residente.
                </p>
              </div>

              {/* Profissional 4: Assistente Social */}
              <div className="p-4 bg-zinc-50 border border-zinc-200 rounded-xl space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-teal-900 text-sm flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-teal-600" />
                    <span>Assistente Social</span>
                  </span>
                  <span className="text-[10px] font-extrabold px-2 py-0.5 rounded bg-teal-100 text-teal-800 border border-teal-200">
                    Apoio Cidadania
                  </span>
                </div>
                <p className="text-zinc-600 leading-relaxed text-[11px]">
                  <strong>Por que é obrigatório:</strong> Assegura a regularização de documentos (RG, CPF), viabilização de benefícios como BPC/Loas, busca ativa de laços familiares e reinserção comunitária.
                </p>
              </div>

              {/* Profissional 5: Médico Psiquiatra de Referência */}
              <div className="p-4 bg-zinc-50 border border-zinc-200 rounded-xl space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-teal-900 text-sm flex items-center gap-2">
                    <Stethoscope className="w-4 h-4 text-teal-600" />
                    <span>Médico Psiquiatra / Clínico Geral</span>
                  </span>
                  <span className="text-[10px] font-extrabold px-2 py-0.5 rounded bg-teal-100 text-teal-800 border border-teal-200">
                    Acompanhamento CAPS
                  </span>
                </div>
                <p className="text-zinc-600 leading-relaxed text-[11px]">
                  <strong>Por que é obrigatório:</strong> Revisa periodicamente o esquema terapêutico, prescreve medicamentos controlados, avalia a necessidade de ajustes de medicação e atesta a estabilidade do quadro.
                </p>
              </div>

              {/* Profissional 6: Terapeuta Ocupacional */}
              <div className="p-4 bg-zinc-50 border border-zinc-200 rounded-xl space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-teal-900 text-sm flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-teal-600" />
                    <span>Terapeuta Ocupacional (T.O.)</span>
                  </span>
                  <span className="text-[10px] font-extrabold px-2 py-0.5 rounded bg-teal-100 text-teal-800 border border-teal-200">
                    Estímulo Cognitivo
                  </span>
                </div>
                <p className="text-zinc-600 leading-relaxed text-[11px]">
                  <strong>Por que é obrigatório:</strong> Desenvolve oficinas de trabalho, habilidades manuais, treino de Atividades da Vida Diária (AVDs) e estímulo à neuroplasticidade e coordenação motora.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Footer Banner */}
      <div className="p-5 bg-teal-50 border border-teal-200 rounded-2xl flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Info className="w-5 h-5 text-teal-700 shrink-0" />
          <p className="text-xs text-teal-950 font-medium">
            O NexaMed integra todas as ferramentas necessárias para a gestão do Residencial Terapêutico em conformidade com as exigências da Vigilância Sanitária e Ministério da Saúde.
          </p>
        </div>
      </div>
    </div>
  );
};
