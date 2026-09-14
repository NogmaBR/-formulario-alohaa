// As perguntas do formulário Aloha Recovery.
// q1..q25 na ordem exata do original (docs/referencia/FORMMULARIO/...pdf);
// q26 e q27 adicionadas pela Nogma.
//
// { id, titulo, dica?, placeholder }
//  - titulo: a pergunta, como no formulário original
//  - dica: complemento/exemplo exibido abaixo do título (opcional)
//  - placeholder: sugestão dentro da caixa de resposta

export const QUESTIONS = [
  {
    id: 'q1',
    titulo: 'Descreva o tom do Aloha em 3 ou 5 palavras.',
    dica: 'Ex.: Jovem, Profissional, Descontraído',
    placeholder: 'Ex.: Acolhedor, jovem, direto, profissional…',
  },
  {
    id: 'q2',
    titulo: 'Horários de funcionamento do Aloha (por dia da semana).',
    dica: 'Liste dia a dia, inclusive fins de semana e feriados.',
    placeholder: 'Segunda a sexta: 08h às 21h\nSábado: 09h às 18h\nDomingo: fechado',
  },
  {
    id: 'q3',
    titulo: 'Quais os serviços que o Aloha Recovery de CWB tem e quais os valores? (atualmente)',
    dica: 'Um serviço por linha, com o valor atual.',
    placeholder: 'Recovery completo — R$ 120\nSauna — R$ 60\n…',
  },
  {
    id: 'q4',
    titulo: 'Quanto tempo de duração tem cada serviço?',
    placeholder: 'Recovery completo — 60 min\nSauna — 30 min\n…',
  },
  {
    id: 'q5',
    titulo: 'Quais os locais conveniados?',
    dica: 'Academias, clubes, empresas, times etc.',
    placeholder: 'Nome do local — tipo de convênio…',
  },
  {
    id: 'q6',
    titulo: 'Quais os valores de cada serviço para os locais conveniados?',
    placeholder: 'Local X: recovery R$ 100, sauna R$ 50\n…',
  },
  {
    id: 'q7',
    titulo: 'O que é feito em cada serviço?',
    dica: 'Descreva o passo a passo de cada um, do jeito que você explicaria para um cliente novo.',
    placeholder: 'Recovery completo: começa com…\nSauna: …',
  },
  {
    id: 'q8',
    titulo: 'Quais os pacotes que vocês vendem hoje, o que vem em cada um e quais os valores?',
    placeholder: 'Pacote 4 sessões — inclui… — R$ …\n…',
  },
  {
    id: 'q9',
    titulo: 'Quais as informações o agente deve recolher do cliente antes de passar para vocês como qualificado?',
    dica: 'Ex.: nome, objetivo, lesão/dor, frequência de treino, disponibilidade…',
    placeholder: 'Nome completo, telefone, objetivo principal…',
  },
  {
    id: 'q10',
    titulo: 'Qual o endereço? Costuma usar algum ponto de referência para localizar o Aloha? Se sim, qual?',
    placeholder: 'Rua…, nº…, bairro — Curitiba/PR. Referência: …',
  },
  {
    id: 'q11',
    titulo: 'Quantas saunas existem, dias e horários de funcionamento e duração de cada sessão?',
    placeholder: '2 saunas. Ter a sáb, 10h às 20h. Sessão de 30 min…',
  },
  {
    id: 'q12',
    titulo: 'Qual o intervalo entre uma sessão e outra e quantas pessoas cabem por horário?',
    placeholder: 'Intervalo de 15 min. Até 4 pessoas por horário…',
  },
  {
    id: 'q13',
    titulo: 'A sessão é compartilhada ou quem reserva bloqueia o horário todo? Acompanhante ocupa vaga?',
    placeholder: 'Compartilhada até X pessoas. Acompanhante…',
  },
  {
    id: 'q14',
    titulo: 'Antecedência mínima e máxima para agendar, prazo de cancelamento e o que acontece se o cliente faltar?',
    placeholder: 'Mínimo 2h antes, máximo 30 dias. Cancelamento até… Falta: …',
  },
  {
    id: 'q15',
    titulo: 'Qual o valor da sessão avulsa e o pagamento é antecipado ou no local?',
    placeholder: 'Avulsa R$ …. Pagamento: antecipado via Pix / no local…',
  },
  {
    id: 'q16',
    titulo: 'Existe algum plano ou pacote que já inclua a sauna, ou ela é sempre vendida à parte?',
    placeholder: 'A sauna está inclusa no pacote… / é sempre à parte…',
  },
  {
    id: 'q17',
    titulo: 'Idade mínima, alguma restrição de saúde e o que o cliente precisa saber antes de ir?',
    placeholder: 'Idade mínima…, contraindicações…, orientações prévias…',
  },
  {
    id: 'q18',
    titulo: 'Quais as formas de pagamento que vocês aceitam?',
    placeholder: 'Pix, cartão de crédito (até Xx), débito, dinheiro…',
  },
  {
    id: 'q19',
    titulo: 'Existe alguma política de cancelamento/no-show? (Multa ou aviso)',
    placeholder: 'Cancelamento com menos de Xh: cobra…% / apenas aviso…',
  },
  {
    id: 'q20',
    titulo: 'O agente pode sugerir upsell? Se sim, quais?',
    dica: 'Ex.: super recovery, pacote com sauna, sessão extra…',
    placeholder: 'Sim — sugerir super recovery quando… / Não sugerir…',
  },
  {
    id: 'q21',
    titulo: 'Qual seria a mensagem de confirmação ideal? (enviada 2h ou 1h antes do serviço)',
    dica: 'Escreva a mensagem do jeito que você gostaria que o cliente recebesse.',
    placeholder: 'Oi {nome}! Passando para confirmar seu recovery hoje às {hora}…',
  },
  {
    id: 'q22',
    titulo: 'O que você gostaria que fosse falado no follow-up de avaliação após o recovery? Colocar o link de avaliação do Google junto.',
    placeholder: 'Mensagem de follow-up… + link do Google: https://g.page/r/…',
  },
  {
    id: 'q23',
    titulo: 'O que é recomendado levar para fazer o recovery e sauna? (roupa ou algo do tipo)',
    placeholder: 'Roupa de banho, toalha, chinelo, garrafa de água…',
  },
  {
    id: 'q24',
    titulo: 'O agente deve se identificar como assistente virtual? Se sim, em qual momento?',
    dica: 'Sempre no início, só quando perguntarem ou nunca.',
    placeholder: 'Sempre no início / só quando perguntarem / nunca — e por quê…',
  },
  {
    id: 'q25',
    titulo: 'Qual deve ser o nome do agente (como ele se apresenta nas mensagens)?',
    placeholder: 'Ex.: "Oi, eu sou a Lua, assistente do Aloha…"',
  },
  {
    id: 'q26',
    titulo: 'O que te preocupa com a IA no atendimento?',
    dica: 'Receios, limites, situações em que o agente não deve agir sozinho.',
    placeholder: 'Ex.: tom robótico, informar preço errado, não saber quando chamar uma pessoa…',
  },
  {
    id: 'q27',
    titulo: 'O que a gente não perguntou que você acha importante?',
    dica: 'Qualquer detalhe do dia a dia do Aloha que o agente precise saber.',
    placeholder: 'Fique à vontade — tudo ajuda a deixar o agente mais preciso.',
  },
];

export const QUESTION_IDS = QUESTIONS.map((q) => q.id);
export const TOTAL_QUESTIONS = QUESTIONS.length;
