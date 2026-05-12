# Espanol Coach.app

https://espanol-coach.netlify.app/

Treinador de espanhol tecnico para contextos profissionais, entrevistas, tecnologia e pratica por voz.

[English](README.en.md) | [Espanol](README.es.md)

## Sobre

Espanol Coach.app e um app estatico feito com HTML, CSS e JavaScript puro. Ele ajuda a praticar espanhol em situacoes reais de trabalho, com foco em tecnologia, desenvolvimento web, fintech, pagamentos, reunioes e entrevistas.

O app combina geracao de exercicios, reproducao de voz pelo navegador, reconhecimento de fala, prova oral e feedback pratico para apoiar a evolucao do usuario.

## Recursos

- Treinos por dificuldade, tema e quantidade de frases.
- Modos de exercicio para ouvir e repetir, traduzir, completar lacunas, responder perguntas e simular entrevista.
- Player de audio com controles individuais e globais usando Web Speech API.
- Selecao de voz, velocidade da fala e volume padrao.
- Prova oral com perguntas em espanhol, traducao opcional, gravacao por voz, transcricao e correcao neutra.
- Feedback com nota, correcao do espanhol, variacoes de resposta e analise fonetica especializada opcional via Azure Speech.
- Interface dark mode com cards, badges, progresso visual e estilo de plataforma gamificada de treino.
- Banco local de perguntas e modelos dividido em modulos JavaScript.

## Como Usar

Abra o arquivo `index.html` no navegador.

Para acessar a prova oral, use o botao `Ir para prova oral` na tela principal ou abra `prova.html` diretamente.

## Deploy na Netlify

Este projeto e estatico e nao precisa de etapa de build.

Configuracao recomendada na Netlify:

- Build command: deixe vazio
- Publish directory: `.`
- Functions directory: `netlify/functions`

O arquivo `netlify.toml` ja define essa configuracao para deploy automatico a partir do GitHub.

### Analise fonetica especializada

A prova oral funciona sem API externa. Para ativar a avaliacao fonetica por audio, configure estas variaveis de ambiente na Netlify:

- `AZURE_SPEECH_KEY`
- `AZURE_SPEECH_REGION`

Com essas variaveis, a funcao `netlify/functions/pronunciation-assessment.js` envia o audio WAV PCM 16 kHz para o Azure Speech Pronunciation Assessment e mostra notas de pronuncia, precisao, fluencia, completude e palavras que precisam de mais atencao.

## Requisitos

- Navegador moderno com suporte a JavaScript.
- Para audio falado: suporte a Web Speech API.
- Para reconhecimento de voz na prova oral: recomendado usar Google Chrome.

## Estrutura

```text
.
|-- index.html
|-- prova.html
|-- netlify.toml
|-- css/
|   |-- style.css
|   `-- prova.css
|-- netlify/
|   `-- functions/
`-- js/
    |-- main.js
    |-- prova.js
    |-- app.bundle.js
    |-- prova.bundle.js
    |-- data/
    |-- modules/
    `-- utils/
```

## Observacoes

Sem as variaveis da Azure, o app usa apenas a correcao local baseada na transcricao. Com a Azure configurada, o feedback tambem inclui avaliacao fonetica especializada do audio gravado.
