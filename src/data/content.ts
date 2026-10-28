/**
 * Textos institucionais de DEMONSTRAÇÃO (Sobre nós, perguntas frequentes e
 * páginas informativas). Substitua pelo conteúdo real do negócio.
 *
 * As páginas legais são modelos para preencher — não constituem
 * aconselhamento jurídico. Confirme-as com um profissional antes de publicar.
 */

export const aboutContent = {
  title: 'A nossa história',
  intro:
    'A SweetBite nasceu da vontade de criar um cantinho onde os doces fossem escolhidos com o mesmo cuidado com que se oferecem. Acreditamos que os pequenos prazeres tornam os dias mais felizes — e que um doce bem escolhido é sempre um bom motivo para juntar pessoas.',
  paragraphs: [
    'Reunimos chocolates, gomas, rebuçados, bolachas e especialidades de vários pontos do mundo, sempre com atenção à qualidade, à apresentação e à variedade.',
    'Para além da loja, preparamos caixas de oferta e combos para festas, aniversários e datas especiais. Se procura algo diferente, fale connosco: tentamos sempre encontrar a melhor solução.',
  ],
  values: [
    {
      title: 'Seleção cuidada',
      text: 'Escolhemos cada produto a pensar no sabor, na apresentação e na variedade da loja.',
    },
    {
      title: 'Variedade',
      text: 'Dos clássicos de sempre às novidades e especialidades importadas.',
    },
    {
      title: 'Atendimento próximo',
      text: 'Confirmamos cada encomenda pessoalmente e ajudamos a escolher.',
    },
  ],
  closing: 'O nosso maior objetivo? Ver-te sorrir.',
}

export const faqs = [
  {
    q: 'Como faço uma encomenda?',
    a: 'Adicione os produtos ao carrinho, clique em "Finalizar encomenda", preencha os seus dados e escolha entre levantamento na loja ou entrega. No fim, o pedido é enviado para o nosso WhatsApp com todos os detalhes.',
  },
  {
    q: 'A encomenda fica logo confirmada?',
    a: 'Não. O envio pelo WhatsApp é um pedido de encomenda. A loja responde para confirmar disponibilidade, data, custo de entrega (se aplicável) e forma de pagamento.',
  },
  {
    q: 'Quais são os métodos de pagamento?',
    a: 'O site não processa pagamentos. A forma de pagamento é combinada com a loja na confirmação da encomenda. [Indicar aqui os métodos aceites, ex.: MB WAY, transferência, numerário no levantamento.]',
  },
  {
    q: 'Fazem entregas? Quanto custa?',
    a: 'Sim, dentro da zona de entrega da loja. O custo e o prazo dependem da morada e são indicados na confirmação. [Atualizar com as zonas e preços reais.]',
  },
  {
    q: 'Posso fazer uma encomenda personalizada?',
    a: 'Sim! Caixas de oferta, mesas de doces e combos para festas podem ser personalizados. Use o formulário de encomendas personalizadas na página de contactos.',
  },
  {
    q: 'Têm opções sem glúten ou sem lactose?',
    a: 'Alguns produtos podem ser adequados, mas a informação deve ser sempre confirmada na rotulagem. Contacte-nos antes de encomendar se tiver alguma alergia ou intolerância.',
  },
]

export interface InfoPage {
  slug: string
  title: string
  intro: string
  sections: { heading: string; body: string[] }[]
}

const pendingNote =
  'Modelo de demonstração. Substitua os textos entre [parênteses retos] pelas condições reais do negócio e confirme o conteúdo com um profissional.'

export const infoPages: InfoPage[] = [
  {
    slug: 'entregas',
    title: 'Entregas e levantamentos',
    intro: 'Pode levantar a sua encomenda na loja ou recebê-la em casa, dentro da zona de entrega.',
    sections: [
      {
        heading: 'Levantamento na loja',
        body: [
          'Após a confirmação da encomenda, combinamos consigo o dia e a hora de levantamento.',
          '[Indicar morada, horário de levantamento e prazo mínimo de preparação.]',
        ],
      },
      {
        heading: 'Entrega ao domicílio',
        body: [
          'As entregas são feitas dentro da zona de entrega da loja. O custo e o prazo são indicados na confirmação da encomenda.',
          '[Indicar zonas, custos, valor mínimo para entrega gratuita (se existir) e prazos.]',
        ],
      },
    ],
  },
  {
    slug: 'encomendas',
    title: 'Condições de encomenda',
    intro: pendingNote,
    sections: [
      {
        heading: 'Pedido e confirmação',
        body: [
          'O envio de um pedido através do site abre uma conversa no WhatsApp com o resumo da encomenda. O pedido só é considerado aceite depois de confirmado pela loja.',
          'Os preços apresentados no site incluem IVA à taxa legal em vigor [confirmar]. O custo de entrega, quando aplicável, é comunicado na confirmação.',
        ],
      },
      {
        heading: 'Pagamento',
        body: ['[Indicar os métodos de pagamento aceites e o momento do pagamento.]'],
      },
      {
        heading: 'Alterações e cancelamentos',
        body: ['[Indicar até quando o cliente pode alterar ou cancelar uma encomenda e em que condições.]'],
      },
      {
        heading: 'Produtos alimentares',
        body: [
          '[Indicar as regras aplicáveis a devoluções de produtos alimentares e perecíveis, bem como os dados do livro de reclamações eletrónico.]',
        ],
      },
    ],
  },
  {
    slug: 'alergenios',
    title: 'Informação sobre alergénios',
    intro:
      'A informação sobre alergénios apresentada no site é indicativa. Confirme sempre a rotulagem do produto e contacte-nos em caso de dúvida.',
    sections: [
      {
        heading: 'Antes de encomendar',
        body: [
          'Muitos doces podem conter ou ter estado em contacto com glúten, leite, ovo, soja, frutos de casca rija, amendoim e outros alergénios.',
          'Se tiver alguma alergia ou intolerância, indique-o nas observações da encomenda ou fale connosco antes de encomendar.',
        ],
      },
      {
        heading: 'Responsabilidade da informação',
        body: [
          '[Indicar como a loja disponibiliza a informação de alergénios de cada produto, por exemplo na loja física ou mediante pedido.]',
        ],
      },
    ],
  },
  {
    slug: 'privacidade',
    title: 'Política de privacidade',
    intro: pendingNote,
    sections: [
      {
        heading: 'Responsável pelo tratamento',
        body: ['[Nome da empresa, NIF, morada e contacto para questões de privacidade.]'],
      },
      {
        heading: 'Dados recolhidos',
        body: [
          'Para processar um pedido de encomenda recolhemos: nome, telemóvel, email (opcional), morada de entrega (quando aplicável) e observações.',
          'O carrinho de compras é guardado apenas no seu navegador (localStorage) e não é enviado para nenhum servidor.',
          '[Se o Firebase estiver ativo: o pedido é também registado numa base de dados (Google Firebase / Firestore) para gestão interna da loja. Indicar o prazo de conservação.]',
        ],
      },
      {
        heading: 'WhatsApp',
        body: [
          'Ao enviar o pedido, é aberta uma conversa no WhatsApp, um serviço de terceiros sujeito à sua própria política de privacidade.',
        ],
      },
      {
        heading: 'Os seus direitos',
        body: [
          '[Indicar como exercer os direitos de acesso, retificação, apagamento e oposição, e o direito de reclamação junto da CNPD.]',
        ],
      },
    ],
  },
]
