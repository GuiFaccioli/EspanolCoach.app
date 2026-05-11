# Espanol Coach.app

Espanol Coach.app e um treinador de espanhol profissional feito com HTML, CSS e JavaScript puro. O foco do projeto e ajudar no treino de espanhol para contextos de trabalho, tecnologia, suporte, desenvolvimento web, fintech, pagamentos, entrevistas e reunioes.

## Recursos

- Geracao de treinos por dificuldade, tema e quantidade de frases.
- Modos de exercicio para ouvir e repetir, traduzir, completar lacunas, responder perguntas e simular entrevista.
- Player de audio com controles individuais e globais usando Web Speech API.
- Selecao de voz, velocidade de fala e volume padrao.
- Prova oral com perguntas em espanhol, traducao opcional, gravacao por voz e feedback aproximado.
- Banco local de perguntas e modelos dividido em modulos JavaScript.

## Como usar

Abra o arquivo `index.html` no navegador.

Para a prova oral, use o botao `Ir para prova oral` na tela principal ou abra `prova.html` diretamente.

## Deploy na Netlify

Este projeto e estatico e nao precisa de etapa de build.

Configuracao recomendada na Netlify:

- Build command: deixe vazio
- Publish directory: `.`

O arquivo `netlify.toml` ja define essa configuracao para deploy automatico a partir do GitHub.

## Requisitos

- Navegador moderno com suporte a JavaScript.
- Para audio falado: suporte a Web Speech API.
- Para reconhecimento de voz na prova oral: recomendado usar Google Chrome.

## Estrutura

```text
.
|-- index.html
|-- prova.html
|-- css/
|   |-- style.css
|   `-- prova.css
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

A correcao da prova oral e aproximada, baseada na transcricao feita pelo navegador. Para uma avaliacao fonetica mais precisa, seria necessario integrar uma API especializada de fala.
