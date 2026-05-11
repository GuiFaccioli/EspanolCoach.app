export const spanishVoicePriority = ["es-MX", "es-US", "es-CO", "es-AR", "es-419"];

export const themeLabels = {
  general: "Geral",
  entrevista: "Entrevista",
  reuniao: "Reunião",
  suporte: "Suporte",
  desenvolvimento: "Web",
  financeiro: "Financeiro",
  fiserv: "Fiserv / fintech",
  sistemas: "Sistemas"
};

export const phraseBank = {
  basico: [
    { es: "Trabajo con tecnología.", pt: "Eu trabalho com tecnologia.", theme: "general" },
    { es: "Estudio español todos los días.", pt: "Eu estudo espanhol todos os dias.", theme: "general" },
    { es: "Tengo una reunión hoy.", pt: "Eu tenho uma reunião hoje.", theme: "reuniao" },
    { es: "Necesito ayuda con el sistema.", pt: "Eu preciso de ajuda com o sistema.", theme: "suporte" },
    { es: "Quiero aprender más sobre APIs.", pt: "Eu quero aprender mais sobre APIs.", theme: "desenvolvimento" },
    { es: "Trabajo con soporte técnico.", pt: "Eu trabalho com suporte técnico.", theme: "suporte" },
    { es: "Reviso transacciones en el sistema.", pt: "Eu reviso transações no sistema.", theme: "financeiro" },
    { es: "Uso herramientas de desarrollo web.", pt: "Eu uso ferramentas de desenvolvimento web.", theme: "desenvolvimento" },
    { es: "Hablo con usuarios todos los días.", pt: "Eu falo com usuários todos os dias.", theme: "suporte" },
    { es: "Fiserv es una empresa de tecnología financiera.", pt: "A Fiserv é uma empresa de tecnologia financeira.", theme: "fiserv" }
  ],
  intermediario: [
    { es: "Estoy estudiando desarrollo web para mejorar mis oportunidades profesionales.", pt: "Estou estudando desenvolvimento web para melhorar minhas oportunidades profissionais.", theme: "desenvolvimento" },
    { es: "Tengo experiencia con soporte técnico y atención a usuarios.", pt: "Tenho experiência com suporte técnico e atendimento a usuários.", theme: "suporte" },
    { es: "Me gustaría trabajar en una empresa de tecnología financiera.", pt: "Eu gostaria de trabalhar em uma empresa de tecnologia financeira.", theme: "fiserv" },
    { es: "Puedo analizar errores del sistema y explicar la solución con claridad.", pt: "Posso analisar erros do sistema e explicar a solução com clareza.", theme: "suporte" },
    { es: "En una reunión, intento escuchar bien antes de responder.", pt: "Em uma reunião, tento escutar bem antes de responder.", theme: "reuniao" },
    { es: "Quiero entender mejor cómo funcionan los pagos digitales.", pt: "Quero entender melhor como funcionam os pagamentos digitais.", theme: "financeiro" },
    { es: "El equipo de desarrollo revisó el problema de la API.", pt: "A equipe de desenvolvimento revisou o problema da API.", theme: "desenvolvimento" },
    { es: "El cliente reportó un error al procesar una transacción.", pt: "O cliente relatou um erro ao processar uma transação.", theme: "financeiro" },
    { es: "Puedo colaborar con equipos de soporte, producto y desarrollo.", pt: "Posso colaborar com equipes de suporte, produto e desenvolvimento.", theme: "reuniao" },
    { es: "Fiserv trabaja con soluciones para pagos y tecnología financiera.", pt: "A Fiserv trabalha com soluções para pagamentos e tecnologia financeira.", theme: "fiserv" }
  ],
  avancado: [
    { es: "Me interesa trabajar en Fiserv porque quiero desarrollarme en el sector de tecnología financiera.", pt: "Tenho interesse em trabalhar na Fiserv porque quero me desenvolver no setor de tecnologia financeira.", theme: "fiserv" },
    { es: "Tengo experiencia resolviendo problemas técnicos, comunicándome con usuarios y colaborando con equipos de desarrollo.", pt: "Tenho experiência resolvendo problemas técnicos, comunicando-me com usuários e colaborando com equipes de desenvolvimento.", theme: "suporte" },
    { es: "Si una transacción falla, intento analizar el problema, revisar los datos y comunicar la situación con claridad.", pt: "Se uma transação falha, tento analisar o problema, revisar os dados e comunicar a situação com clareza.", theme: "financeiro" },
    { es: "Durante una reunión técnica, procuro confirmar los requisitos antes de proponer una solución.", pt: "Durante uma reunião técnica, procuro confirmar os requisitos antes de propor uma solução.", theme: "reuniao" },
    { es: "Cuando investigo un incidente, documento evidencias, hipótesis y próximos pasos.", pt: "Quando investigo um incidente, documento evidências, hipóteses e próximos passos.", theme: "suporte" },
    { es: "En sistemas financieros, la confiabilidad y la trazabilidad son fundamentales para proteger la operación.", pt: "Em sistemas financeiros, a confiabilidade e a rastreabilidade são fundamentais para proteger a operação.", theme: "financeiro" },
    { es: "Si una API devuelve un error inesperado, reviso la solicitud, la respuesta y el contexto de negocio.", pt: "Se uma API retorna um erro inesperado, reviso a requisição, a resposta e o contexto de negócio.", theme: "desenvolvimento" },
    { es: "Me gustaría participar en proyectos que mejoren la experiencia de pago para comercios y usuarios.", pt: "Eu gostaria de participar de projetos que melhorem a experiência de pagamento para comércios e usuários.", theme: "fiserv" },
    { es: "En entrevistas, intento responder con ejemplos reales, resultados y aprendizajes.", pt: "Em entrevistas, tento responder com exemplos reais, resultados e aprendizados.", theme: "entrevista" },
    { es: "Cuando trabajo con un equipo remoto, priorizo mensajes claros, contexto suficiente y seguimiento constante.", pt: "Quando trabalho com uma equipe remota, priorizo mensagens claras, contexto suficiente e acompanhamento constante.", theme: "reuniao" }
  ],
  entrevista: [
    { es: "Háblame de ti.", pt: "Fale-me sobre você.", theme: "entrevista" },
    { es: "¿Por qué quieres aprender español?", pt: "Por que você quer aprender espanhol?", theme: "entrevista" },
    { es: "¿Qué experiencia tienes con soporte técnico?", pt: "Que experiência você tem com suporte técnico?", theme: "suporte" },
    { es: "¿Por qué te interesa el sector financiero?", pt: "Por que você se interessa pelo setor financeiro?", theme: "financeiro" },
    { es: "¿Cómo resuelves problemas técnicos?", pt: "Como você resolve problemas técnicos?", theme: "suporte" },
    { es: "¿Qué sabes sobre tecnología financiera?", pt: "O que você sabe sobre tecnologia financeira?", theme: "fiserv" },
    { es: "¿Por qué te gustaría trabajar en Fiserv?", pt: "Por que você gostaria de trabalhar na Fiserv?", theme: "fiserv" },
    { es: "¿Cómo explicarías una API a una persona no técnica?", pt: "Como você explicaria uma API para uma pessoa não técnica?", theme: "desenvolvimento" },
    { es: "¿Qué harías si un pago falla en producción?", pt: "O que você faria se um pagamento falhasse em produção?", theme: "financeiro" },
    { es: "¿Cómo colaboras con un equipo de desarrollo?", pt: "Como você colabora com uma equipe de desenvolvimento?", theme: "reuniao" }
  ],
  suporte: [
    { es: "El usuario no puede iniciar sesión en el sistema.", pt: "O usuário não consegue entrar no sistema.", theme: "suporte" },
    { es: "Voy a revisar los registros para entender el error.", pt: "Vou revisar os registros para entender o erro.", theme: "suporte" },
    { es: "Necesito confirmar si el problema ocurre con otros usuarios.", pt: "Preciso confirmar se o problema ocorre com outros usuários.", theme: "suporte" },
    { es: "El incidente fue registrado con prioridad alta.", pt: "O incidente foi registrado com prioridade alta.", theme: "suporte" },
    { es: "Estamos investigando la causa raíz del problema.", pt: "Estamos investigando a causa raiz do problema.", theme: "suporte" },
    { es: "Voy a escalar el caso al equipo responsable.", pt: "Vou escalar o caso para a equipe responsável.", theme: "suporte" }
  ],
  financeiro: [
    { es: "La transacción fue aprobada por el sistema.", pt: "A transação foi aprovada pelo sistema.", theme: "financeiro" },
    { es: "El pago fue rechazado por falta de autorización.", pt: "O pagamento foi recusado por falta de autorização.", theme: "financeiro" },
    { es: "Necesitamos validar los datos de la tarjeta.", pt: "Precisamos validar os dados do cartão.", theme: "financeiro" },
    { es: "La conciliación mostró una diferencia en los valores.", pt: "A conciliação mostrou uma diferença nos valores.", theme: "financeiro" },
    { es: "La autorización depende de la respuesta del banco.", pt: "A autorização depende da resposta do banco.", theme: "financeiro" },
    { es: "El sistema financiero debe ser estable y seguro.", pt: "O sistema financeiro deve ser estável e seguro.", theme: "financeiro" }
  ],
  desenvolvimento: [
    { es: "Estoy creando una interfaz con HTML, CSS y JavaScript.", pt: "Estou criando uma interface com HTML, CSS e JavaScript.", theme: "desenvolvimento" },
    { es: "La API devuelve una respuesta en formato JSON.", pt: "A API retorna uma resposta em formato JSON.", theme: "desenvolvimento" },
    { es: "Necesito corregir un error en el formulario.", pt: "Preciso corrigir um erro no formulário.", theme: "desenvolvimento" },
    { es: "El componente debe funcionar en dispositivos móviles.", pt: "O componente deve funcionar em dispositivos móveis.", theme: "desenvolvimento" },
    { es: "El código debe ser claro y fácil de mantener.", pt: "O código deve ser claro e fácil de manter.", theme: "desenvolvimento" },
    { es: "La documentación explica cómo usar el endpoint.", pt: "A documentação explica como usar o endpoint.", theme: "desenvolvimento" }
  ],
  reuniao: [
    { es: "Buenos días, gracias por participar en la reunión.", pt: "Bom dia, obrigado por participar da reunião.", theme: "reuniao" },
    { es: "Voy a compartir una actualización del proyecto.", pt: "Vou compartilhar uma atualização do projeto.", theme: "reuniao" },
    { es: "¿Podrías repetir la última parte, por favor?", pt: "Você poderia repetir a última parte, por favor?", theme: "reuniao" },
    { es: "Necesito confirmar los próximos pasos con el equipo.", pt: "Preciso confirmar os próximos passos com a equipe.", theme: "reuniao" },
    { es: "Tengo una duda sobre el alcance del proyecto.", pt: "Tenho uma dúvida sobre o escopo do projeto.", theme: "reuniao" },
    { es: "Voy a enviar un resumen después de la reunión.", pt: "Vou enviar um resumo depois da reunião.", theme: "reuniao" }
  ],
  fiserv: [
    { es: "Fiserv ofrece soluciones de tecnología financiera para comercios.", pt: "A Fiserv oferece soluções de tecnologia financeira para comércios.", theme: "fiserv" },
    { es: "Me interesa aprender sobre pagos digitales en Fiserv.", pt: "Tenho interesse em aprender sobre pagamentos digitais na Fiserv.", theme: "fiserv" },
    { es: "Quiero desarrollarme en una empresa global de fintech.", pt: "Quero me desenvolver em uma empresa global de fintech.", theme: "fiserv" },
    { es: "El sector de pagos combina tecnología, seguridad y servicio.", pt: "O setor de pagamentos combina tecnologia, segurança e serviço.", theme: "fiserv" },
    { es: "Los pagos electrónicos requieren sistemas confiables.", pt: "Os pagamentos eletrônicos exigem sistemas confiáveis.", theme: "fiserv" },
    { es: "El ecosistema de pagos tiene bancos, comercios, tarjetas y plataformas.", pt: "O ecossistema de pagamentos tem bancos, comércios, cartões e plataformas.", theme: "fiserv" }
  ]
};

export const templateParts = {
  subjects: [
    ["Trabajo", "Eu trabalho"],
    ["Colaboro", "Eu colaboro"],
    ["Aprendo", "Eu aprendo"],
    ["Practico", "Eu pratico"],
    ["Investigo", "Eu investigo"],
    ["Documento", "Eu documento"]
  ],
  objects: [
    ["con sistemas de pago", "com sistemas de pagamento", "financeiro"],
    ["con APIs financieras", "com APIs financeiras", "desenvolvimento"],
    ["con usuarios internos", "com usuários internos", "suporte"],
    ["en reuniones técnicas", "em reuniões técnicas", "reuniao"],
    ["con proyectos de desarrollo web", "com projetos de desenvolvimento web", "desenvolvimento"],
    ["en contextos de tecnología financiera", "em contextos de tecnologia financeira", "fiserv"]
  ],
  endings: [
    ["para mejorar mi comunicación profesional.", "para melhorar minha comunicação profissional."],
    ["porque quiero crecer en tecnología.", "porque quero crescer em tecnologia."],
    ["para resolver problemas con más claridad.", "para resolver problemas com mais clareza."],
    ["mientras desarrollo mi vocabulario en español.", "enquanto desenvolvo meu vocabulário em espanhol."]
  ]
};
