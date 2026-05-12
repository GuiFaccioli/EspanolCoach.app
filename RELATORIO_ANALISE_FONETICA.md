# Relatorio de implementacao: analise fonetica especializada

## Objetivo

Adicionar ao Espanol Coach.app uma avaliacao de pronuncia mais precisa do que a analise baseada apenas na transcricao do navegador.

Antes, o app usava a Web Speech API para transformar a fala em texto e fazia o feedback com base nessa transcricao. Isso continua existindo como fallback, mas agora o app tambem consegue capturar o audio real da resposta e enviar para uma API especializada.

## O que foi criado

### 1. Captura de audio real

Arquivo: `js/prova.js`

Foi adicionada uma captura paralela ao reconhecimento de voz:

- a Web Speech API continua fazendo a transcricao;
- o `AudioContext` captura o microfone;
- o app junta os blocos de audio em memoria;
- o audio e convertido para WAV PCM mono em 16 kHz;
- esse formato e enviado para a Netlify Function.

Funcoes principais:

- `startPronunciationCapture()`
- `stopPronunciationCapture()`
- `mergeAudioChunks()`
- `downsampleBuffer()`
- `encodeWav()`
- `blobToBase64()`

## 2. Function da Netlify

Arquivo: `netlify/functions/pronunciation-assessment.js`

Essa funcao recebe:

- audio em base64;
- texto de referencia, usando a propria transcricao;
- idioma `es-ES`.

Depois envia para o Azure Speech Pronunciation Assessment.

Ela retorna um objeto normalizado com:

- nota geral de pronuncia;
- precisao;
- fluencia;
- completude;
- palavras com baixa pontuacao;
- mensagem resumida para o usuario.

## 3. Interface do feedback

Arquivos:

- `js/prova.js`
- `css/prova.css`

Foi criado um bloco opcional chamado `Analise fonetica especializada`.

Ele so aparece quando a API retorna resultado valido. Se a Azure nao estiver configurada, o app continua funcionando normalmente e nao mostra esse bloco.

Classes criadas:

- `.pronunciation-block`
- `.pronunciation-score-grid`
- `.pronunciation-metric`
- `.pronunciation-word-list`

## 4. Configuracao de deploy

Arquivo: `netlify.toml`

Foi adicionada a configuracao:

```toml
[build]
  functions = "netlify/functions"
```

Isso informa para a Netlify onde ficam as serverless functions.

## Variaveis necessarias na Netlify

Para ativar a API especializada, configure:

```text
AZURE_SPEECH_KEY=sua_chave_da_azure
AZURE_SPEECH_REGION=sua_regiao
```

Exemplo de regiao:

```text
eastus
```

## Fluxo tecnico

1. Usuario clica em `Gravar resposta`.
2. O app inicia a transcricao pelo navegador.
3. Ao mesmo tempo, o app captura o audio bruto do microfone.
4. Usuario clica em `Parar gravacao`.
5. O app gera o feedback local imediatamente.
6. O audio WAV e enviado para `/.netlify/functions/pronunciation-assessment`.
7. A Function chama a Azure Speech.
8. O card de feedback e atualizado com a analise fonetica.

## Por que a chave fica na Function

A chave da Azure nao deve ficar no JavaScript do navegador, porque qualquer pessoa poderia abrir o DevTools e copiar a chave.

Por isso, a chamada real para a Azure fica no backend da Netlify Function. O navegador chama apenas a Function do seu projeto.

## Fontes tecnicas usadas

- Microsoft Learn: Azure Speech Pronunciation Assessment
- Microsoft Learn: Speech to text REST API for short audio

Pontos importantes da documentacao:

- Pronunciation Assessment avalia precisao e fluencia da fala.
- A API REST curta aceita audio de ate 30 segundos para avaliacao de pronuncia.
- O formato aceito inclui WAV PCM 16 kHz mono.
- O idioma espanhol pode ser testado com locales como `es-ES` e `es-MX`.

## Limites atuais

- A analise fonetica depende da configuracao da Azure.
- O app usa a transcricao como texto de referencia.
- Para respostas muito longas, a API REST curta pode nao ser ideal.
- Para avaliacao continua ou gravacoes longas, o melhor caminho futuro e usar o Speech SDK em modo continuo.

## Como evoluir depois

Possiveis melhorias futuras:

- escolher entre `es-ES`, `es-MX` ou outro locale no app;
- mostrar fonemas individuais com menor pontuacao;
- destacar palavras no texto com cores;
- salvar a nota fonetica no historico;
- usar modo continuo do Speech SDK para respostas maiores;
- comparar pronuncia entre a resposta do usuario e uma variacao recomendada.
