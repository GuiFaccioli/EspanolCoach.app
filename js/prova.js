import { examThemeLabels } from "./data/examQuestions.js";
import {
  isSpeechRecognitionSupported,
  normalizeText,
  startRecognition,
  stopRecognition
} from "./modules/speechRecognition.js";
import {
  evaluateAnswer,
  finishExam,
  getCurrentQuestion,
  getExamState,
  getNextQuestion,
  startExam
} from "./modules/oralExam.js";
import { loadPreferences, loadTrainingHistory, saveTrainingHistory } from "./modules/storage.js";
import { escapeHtml } from "./utils/helpers.js";

window.__spanishOralExamModuleLoaded = true;

const elements = {
  difficulty: document.getElementById("examDifficulty"),
  theme: document.getElementById("examTheme"),
  count: document.getElementById("examCount"),
  startButton: document.getElementById("startExamButton"),
  questionArea: document.getElementById("questionArea"),
  questionCounter: document.getElementById("questionCounter"),
  questionTheme: document.getElementById("questionTheme"),
  questionText: document.getElementById("questionText"),
  translationBox: document.getElementById("translationBox"),
  toggleTranslation: document.getElementById("toggleTranslationButton"),
  listenQuestion: document.getElementById("listenQuestionButton"),
  recordButton: document.getElementById("recordButton"),
  stopRecordButton: document.getElementById("stopRecordButton"),
  recordingStatus: document.getElementById("recordingStatus"),
  transcriptText: document.getElementById("transcriptText"),
  feedbackContent: document.getElementById("feedbackContent"),
  nextButton: document.getElementById("nextQuestionButton"),
  resultArea: document.getElementById("resultArea"),
  resultContent: document.getElementById("resultContent"),
  supportWarning: document.getElementById("supportWarning"),
  progressBar: document.getElementById("examProgressBar"),
  progressText: document.getElementById("examProgressText")
};

let finalTranscript = "";
let currentPartial = "";
let lastEvaluation = null;
let activeVariation = null;
let pronunciationCapture = null;
let pronunciationBlob = null;
let evaluationInProgress = false;

function getConfig() {
  return {
    difficulty: elements.difficulty.value,
    theme: elements.theme.value,
    count: elements.count.value
  };
}

function handleStartExam() {
  const firstQuestion = startExam(getConfig());
  finalTranscript = "";
  currentPartial = "";
  lastEvaluation = null;
  pronunciationBlob = null;
  elements.resultArea.classList.remove("show");
  elements.resultContent.innerHTML = "O resultado aparece ao terminar a prova.";
  updateExamProgress(0, 0);
  renderQuestion(firstQuestion);
}

function renderQuestion(question) {
  const state = getExamState();

  if (!question) {
    renderFinalResult();
    return;
  }

  finalTranscript = "";
  currentPartial = "";
  lastEvaluation = null;
  pronunciationBlob = null;
  stopVariationAudio();
  elements.questionCounter.textContent = `${state.currentIndex + 1}/${state.questions.length}`;
  updateExamProgress(state.currentIndex + 1, state.questions.length);
  elements.questionTheme.textContent = examThemeLabels[question.theme] || "Misturado";
  elements.questionText.textContent = question.questionEs;
  elements.translationBox.textContent = question.questionPt;
  elements.translationBox.classList.remove("show");
  elements.toggleTranslation.textContent = "Mostrar tradução";
  elements.toggleTranslation.disabled = false;
  elements.listenQuestion.disabled = false;
  elements.recordButton.disabled = !isSpeechRecognitionSupported();
  elements.stopRecordButton.disabled = true;
  elements.nextButton.disabled = true;
  elements.transcriptText.textContent = "Sua resposta transcrita aparece aqui.";
  elements.feedbackContent.className = "feedback-content empty-state";
  elements.feedbackContent.textContent = "Responda a pergunta para receber feedback.";
  setRecording(false);
}

function speakQuestion() {
  const question = getCurrentQuestion();

  if (!question || !("speechSynthesis" in window)) {
    return;
  }

  stopVariationAudio();
  const utterance = new SpeechSynthesisUtterance(question.questionEs);
  const voices = window.speechSynthesis.getVoices();
  const spanishVoice = voices.find((voice) => voice.lang === "es-MX")
    || voices.find((voice) => voice.lang === "es-US")
    || voices.find((voice) => voice.lang.toLowerCase().startsWith("es"));
  utterance.lang = spanishVoice ? spanishVoice.lang : "es-MX";
  utterance.rate = 0.88;

  if (spanishVoice) {
    utterance.voice = spanishVoice;
  }

  window.speechSynthesis.speak(utterance);
}

async function startRecording() {
  const question = getCurrentQuestion();

  if (!question) {
    return;
  }

  finalTranscript = "";
  currentPartial = "";
  elements.transcriptText.textContent = "Escutando...";
  elements.feedbackContent.className = "feedback-content empty-state";
  elements.feedbackContent.textContent = "Grave sua resposta e clique em Parar gravação.";

  try {
    pronunciationBlob = null;
    await startPronunciationCapture();
  } catch (error) {
    elements.supportWarning.textContent = "Nao consegui capturar o audio bruto para analise fonetica especializada. A correcao por transcricao continua ativa.";
    elements.supportWarning.classList.add("show");
  }

  startRecognition(
    "es-MX",
    (transcript, isFinal) => {
      currentPartial = transcript;
      elements.transcriptText.textContent = transcript || "Escutando...";

      if (isFinal && transcript) {
        finalTranscript = transcript;
      }
    },
    (error) => {
      elements.supportWarning.textContent = typeof error === "string" ? error : "Erro ao reconhecer a fala.";
      elements.supportWarning.classList.add("show");
      setRecording(false);
      stopPronunciationCapture();
    },
    () => setRecording(true),
    async () => {
      setRecording(false);
      pronunciationBlob = await stopPronunciationCapture();
      if (!lastEvaluation && (finalTranscript || currentPartial)) {
        evaluateCurrentAnswer();
      }
    }
  );
}

async function stopRecording() {
  stopRecognition();
  setRecording(false);
  pronunciationBlob = await stopPronunciationCapture();
  evaluateCurrentAnswer();
}

async function evaluateCurrentAnswer() {
  const question = getCurrentQuestion();
  const transcript = finalTranscript || currentPartial;

  if (evaluationInProgress || lastEvaluation) {
    return;
  }

  if (!question || !transcript.trim()) {
    elements.feedbackContent.className = "feedback-content empty-state";
    elements.feedbackContent.textContent = "Não encontrei uma transcrição. Tente gravar novamente.";
    return;
  }

  evaluationInProgress = true;
  lastEvaluation = evaluateAnswer(transcript, question);
  const activeEvaluation = lastEvaluation;
  elements.transcriptText.textContent = transcript;
  renderFeedback(lastEvaluation);
  elements.nextButton.disabled = false;

  if (pronunciationBlob) {
    lastEvaluation.pronunciationStatus = "loading";
    renderFeedback(lastEvaluation);
    const assessment = await requestPronunciationAssessment(pronunciationBlob, transcript);

    if (lastEvaluation === activeEvaluation) {
      lastEvaluation.pronunciationAssessment = assessment;
      lastEvaluation.pronunciationStatus = "done";
      renderFeedback(lastEvaluation);
    }
  }

  evaluationInProgress = false;
}

function renderFeedback(result) {
  const scoreColor = getScoreColor(result.score);
  const scorePercent = getScorePercent(result.score);

  elements.feedbackContent.className = "feedback-content";
  elements.feedbackContent.innerHTML = `
    <div class="score-card dynamic-score" style="--score-color: ${scoreColor}; --score-percent: ${scorePercent}%;">
      <span class="score-label">Nota geral da resposta</span>
      <strong class="score-value">${formatScore(result.score)}/10</strong>
      <div class="score-bar" aria-hidden="true">
        <div class="score-bar-fill"></div>
      </div>
      <p class="score-meta">Avaliação geral da clareza, estrutura, naturalidade e correção da resposta.</p>
    </div>
    <div class="feedback-grid">
      <div class="feedback-block">
        <h3>Sua transcrição</h3>
        <p>${escapeHtml(result.transcript)}</p>
      </div>
      <div class="feedback-block">
        <h3>Correção do espanhol</h3>
        <p>${escapeHtml(result.correctionNotes.join(" "))}</p>
      </div>
      ${renderPronunciationAssessment(result)}
      <div class="feedback-block variation-section">
        <h3>5 variações possíveis para essa resposta</h3>
        ${renderVariationList(result.answerVariations)}
      </div>
    </div>
  `;
}

function renderPronunciationAssessment(result) {
  if (result.pronunciationStatus === "loading") {
    return `
      <div class="feedback-block pronunciation-block is-loading">
        <h3>Análise fonética</h3>
        <p>Enviando áudio para a avaliação especializada...</p>
      </div>
    `;
  }

  const assessment = result.pronunciationAssessment;

  if (!assessment?.available) {
    return "";
  }

  const scores = assessment.scores || {};
  const weakWords = assessment.weakWords || [];

  return `
    <div class="feedback-block pronunciation-block">
      <h3>Análise fonética especializada</h3>
      <div class="pronunciation-score-grid">
        ${renderPronunciationMetric("Pronúncia", scores.pronunciation)}
        ${renderPronunciationMetric("Precisão", scores.accuracy)}
        ${renderPronunciationMetric("Fluência", scores.fluency)}
        ${renderPronunciationMetric("Completude", scores.completeness)}
      </div>
      <p>${escapeHtml(assessment.message || "Avaliação fonética recebida com sucesso.")}</p>
      ${weakWords.length ? `<ul class="pronunciation-word-list">${weakWords.map((item) => `<li><span>${escapeHtml(item.word)}</span><strong>${formatPronunciationScore(item.accuracy)}/100</strong></li>`).join("")}</ul>` : ""}
    </div>
  `;
}

function renderPronunciationMetric(label, value) {
  return `
    <span class="pronunciation-metric">
      <small>${escapeHtml(label)}</small>
      <strong>${formatPronunciationScore(value)}</strong>
    </span>
  `;
}

function speakText(text, onStart, onEnd) {
  if (!text || !("speechSynthesis" in window)) {
    return;
  }

  window.speechSynthesis.cancel();
  const preferences = loadPreferences();
  const utterance = new SpeechSynthesisUtterance(text);
  const voices = window.speechSynthesis.getVoices();
  const preferredVoice = voices.find((voice) => `${voice.name}|${voice.lang}` === preferences.voiceKey);
  const spanishVoice = preferredVoice
    || voices.find((voice) => voice.lang === "es-MX")
    || voices.find((voice) => voice.lang === "es-US")
    || voices.find((voice) => voice.lang.toLowerCase().startsWith("es"));

  utterance.lang = spanishVoice ? spanishVoice.lang : "es-MX";
  utterance.rate = Number(preferences.rate || 0.88);
  utterance.volume = Number(preferences.volume || 1);

  if (spanishVoice) {
    utterance.voice = spanishVoice;
  }

  utterance.onstart = onStart;
  utterance.onend = onEnd;
  utterance.onerror = onEnd;
  window.speechSynthesis.speak(utterance);
}

function getScoreColor(score) {
  const normalized = Math.max(0, Math.min(10, Number(score) || 0)) / 10;
  const hue = Math.round(normalized * 120);
  return `hsl(${hue}, 75%, 60%)`;
}

function getScorePercent(score) {
  return Math.round(Math.max(0, Math.min(10, Number(score) || 0)) * 10);
}

function formatScore(score) {
  return Number.isInteger(score) ? score : Number(score).toFixed(1);
}

function formatPronunciationScore(score) {
  const number = Number(score);
  return Number.isFinite(number) ? Math.round(number) : 0;
}

function renderVariationList(variations) {
  if (!variations?.length) {
    return "<p>Nenhuma variação disponível.</p>";
  }

  return `<div class="variation-list">${variations.map((variation, index) => renderVariationCard(variation, index)).join("")}</div>`;
}

function renderVariationCard(variation, index) {
  const normalized = normalizeVariation(variation);
  const duration = estimateSpeechDuration(normalized.audioText);
  const bars = Array.from({ length: 14 }, (_, barIndex) => `<span class="wave-bar" style="--bar-index: ${barIndex};"></span>`).join("");

  return `
    <article class="variation-card" style="--variation-duration: ${duration}s;">
      <div class="variation-header">
        <span class="variation-type">${escapeHtml(normalized.type)}</span>
        <span class="variation-level">${escapeHtml(normalized.level)}</span>
      </div>
      <p class="variation-text">${escapeHtml(normalized.text)}</p>
      <p class="variation-explanation">${escapeHtml(normalized.explanation)}</p>
      <div class="variation-audio-row">
        <button class="variation-play-btn" type="button" data-variation-index="${index}" aria-label="Ouvir variação ${index + 1}">
          <span class="play-icon">▶</span>
        </button>
        <div class="variation-waveform" aria-hidden="true">${bars}</div>
        <span class="variation-duration">${formatDuration(duration)}</span>
      </div>
    </article>
  `;
}

function normalizeVariation(variation) {
  if (typeof variation === "string") {
    return {
      type: "Variação",
      level: "Treino",
      text: variation,
      explanation: "Frase alternativa para repetir em voz alta.",
      audioText: variation
    };
  }

  return {
    type: variation.type || "Variação",
    level: variation.level || "Treino",
    text: variation.text || "",
    explanation: variation.explanation || "Frase alternativa para repetir em voz alta.",
    audioText: variation.audioText || variation.text || ""
  };
}

function estimateSpeechDuration(text) {
  const words = String(text || "").trim().split(/\s+/).filter(Boolean).length;
  return Math.max(2, Math.round((words / 2.5) * 10) / 10);
}

function formatDuration(seconds) {
  return `0:${String(Math.max(1, Math.round(seconds))).padStart(2, "0")}`;
}

function handleFeedbackClick(event) {
  const playButton = event.target.closest("[data-variation-index]");

  if (!playButton || !lastEvaluation?.answerVariations) {
    return;
  }

  const index = Number(playButton.dataset.variationIndex);
  const variation = normalizeVariation(lastEvaluation.answerVariations[index]);

  speakVariation(variation, playButton);
}

function speakVariation(variation, playButton) {
  const card = playButton.closest(".variation-card");
  const duration = estimateSpeechDuration(variation.audioText);

  stopVariationAudio();
  activeVariation = { card, playButton };

  speakText(
    variation.audioText,
    () => {
      card?.style.setProperty("--variation-duration", `${duration}s`);
      card?.classList.add("is-playing");
      playButton.classList.add("is-playing");
      playButton.querySelector(".play-icon").textContent = "■";
    },
    () => stopVariationAudio(false)
  );
}

function stopVariationAudio(cancelSpeech = true) {
  if (cancelSpeech && "speechSynthesis" in window) {
    window.speechSynthesis.cancel();
  }

  if (activeVariation) {
    activeVariation.card?.classList.remove("is-playing");
    activeVariation.playButton?.classList.remove("is-playing");
    const icon = activeVariation.playButton?.querySelector(".play-icon");

    if (icon) {
      icon.textContent = "▶";
    }
  }

  activeVariation = null;
}

async function startPronunciationCapture() {
  if (!navigator.mediaDevices?.getUserMedia || !(window.AudioContext || window.webkitAudioContext)) {
    throw new Error("Audio capture unavailable");
  }

  await stopPronunciationCapture();

  const stream = await navigator.mediaDevices.getUserMedia({
    audio: {
      channelCount: 1,
      echoCancellation: true,
      noiseSuppression: true
    }
  });
  const AudioContextClass = window.AudioContext || window.webkitAudioContext;
  const context = new AudioContextClass();
  const source = context.createMediaStreamSource(stream);
  const processor = context.createScriptProcessor(4096, 1, 1);
  const chunks = [];

  processor.onaudioprocess = (event) => {
    if (!pronunciationCapture?.isRecording) {
      return;
    }

    const input = event.inputBuffer.getChannelData(0);
    chunks.push(new Float32Array(input));

    const output = event.outputBuffer.getChannelData(0);
    output.fill(0);
  };

  source.connect(processor);
  processor.connect(context.destination);

  pronunciationCapture = {
    isRecording: true,
    stream,
    context,
    source,
    processor,
    chunks,
    sampleRate: context.sampleRate
  };
}

async function stopPronunciationCapture() {
  if (!pronunciationCapture) {
    return null;
  }

  const capture = pronunciationCapture;
  pronunciationCapture = null;
  capture.isRecording = false;

  try {
    capture.processor.disconnect();
    capture.source.disconnect();
  } catch (error) {
    // Nothing to clean up if the node was already disconnected.
  }

  capture.stream.getTracks().forEach((track) => track.stop());

  if (capture.context.state !== "closed") {
    await capture.context.close();
  }

  if (!capture.chunks.length) {
    return null;
  }

  const samples = mergeAudioChunks(capture.chunks);
  const wavBuffer = encodeWav(downsampleBuffer(samples, capture.sampleRate, 16000), 16000);
  return new Blob([wavBuffer], { type: "audio/wav" });
}

async function requestPronunciationAssessment(audioBlob, transcript) {
  try {
    const audioBase64 = await blobToBase64(audioBlob);
    const response = await fetch("/.netlify/functions/pronunciation-assessment", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        audioBase64,
        referenceText: transcript,
        language: "es-ES"
      })
    });

    return await response.json();
  } catch (error) {
    return {
      available: false,
      message: "Nao foi possivel consultar a avaliacao fonetica especializada."
    };
  }
}

function mergeAudioChunks(chunks) {
  const length = chunks.reduce((sum, chunk) => sum + chunk.length, 0);
  const result = new Float32Array(length);
  let offset = 0;

  chunks.forEach((chunk) => {
    result.set(chunk, offset);
    offset += chunk.length;
  });

  return result;
}

function downsampleBuffer(buffer, inputSampleRate, outputSampleRate) {
  if (outputSampleRate === inputSampleRate) {
    return buffer;
  }

  const ratio = inputSampleRate / outputSampleRate;
  const newLength = Math.round(buffer.length / ratio);
  const result = new Float32Array(newLength);
  let offsetResult = 0;
  let offsetBuffer = 0;

  while (offsetResult < result.length) {
    const nextOffsetBuffer = Math.round((offsetResult + 1) * ratio);
    let accumulator = 0;
    let count = 0;

    for (let index = offsetBuffer; index < nextOffsetBuffer && index < buffer.length; index += 1) {
      accumulator += buffer[index];
      count += 1;
    }

    result[offsetResult] = accumulator / count;
    offsetResult += 1;
    offsetBuffer = nextOffsetBuffer;
  }

  return result;
}

function encodeWav(samples, sampleRate) {
  const buffer = new ArrayBuffer(44 + samples.length * 2);
  const view = new DataView(buffer);

  writeString(view, 0, "RIFF");
  view.setUint32(4, 36 + samples.length * 2, true);
  writeString(view, 8, "WAVE");
  writeString(view, 12, "fmt ");
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, 1, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true);
  view.setUint16(32, 2, true);
  view.setUint16(34, 16, true);
  writeString(view, 36, "data");
  view.setUint32(40, samples.length * 2, true);

  let offset = 44;
  samples.forEach((sample) => {
    const clamped = Math.max(-1, Math.min(1, sample));
    view.setInt16(offset, clamped < 0 ? clamped * 0x8000 : clamped * 0x7fff, true);
    offset += 2;
  });

  return buffer;
}

function writeString(view, offset, string) {
  for (let index = 0; index < string.length; index += 1) {
    view.setUint8(offset + index, string.charCodeAt(index));
  }
}

function blobToBase64(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(String(reader.result).split(",")[1] || "");
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

function goToNextQuestion() {
  const nextQuestion = getNextQuestion();

  if (!nextQuestion) {
    renderFinalResult();
    return;
  }

  renderQuestion(nextQuestion);
}

function renderFinalResult() {
  const result = finishExam();
  elements.resultArea.classList.add("show");
  elements.nextButton.disabled = true;
  elements.recordButton.disabled = true;
  elements.stopRecordButton.disabled = true;
  elements.listenQuestion.disabled = true;
  elements.toggleTranslation.disabled = true;
  elements.questionText.textContent = "Prova finalizada.";
  elements.questionCounter.textContent = `${result.answered}/${result.total}`;
  updateExamProgress(result.total, result.total);
  elements.resultContent.className = "feedback-content";
  elements.resultContent.innerHTML = `
    <div class="score-card">
      <span class="hint">Nota média</span>
      <strong class="score-number">${result.average}/10</strong>
      <p>${result.answered} pergunta${result.answered === 1 ? "" : "s"} respondida${result.answered === 1 ? "" : "s"}.</p>
    </div>
    <div class="feedback-grid">
      <div class="feedback-block">
        <h3>Melhores pontos</h3>
        <p>${result.average >= 7 ? "Boa clareza geral, respostas compreensíveis e boa adequação ao tema." : "Você conseguiu praticar respostas reais e já tem uma base para melhorar."}</p>
      </div>
      <div class="feedback-block">
        <h3>Pontos para melhorar</h3>
        <p>${escapeHtml(result.recommendation)}</p>
      </div>
    </div>
  `;
  saveExamResult(result);
}

function saveExamResult(result) {
  saveTrainingHistory({
    id: Date.now(),
    date: new Date().toLocaleString("pt-BR"),
    config: {
      difficulty: elements.difficulty.value,
      theme: elements.theme.value,
      mode: "prova oral",
      count: elements.count.value
    },
    items: [{
      es: `Prova oral - nota ${result.average}/10`,
      pt: result.recommendation,
      theme: elements.theme.value,
      mode: "exam"
    }],
    examResult: {
      average: result.average,
      recommendation: result.recommendation
    }
  });
  loadTrainingHistory();
}

function updateExamProgress(current, total) {
  if (!elements.progressBar || !elements.progressText) {
    return;
  }

  const percent = total > 0 ? Math.round((current / total) * 100) : 0;
  elements.progressBar.style.width = `${percent}%`;
  elements.progressText.textContent = `${percent}%`;
}

function setRecording(isRecording) {
  elements.recordingStatus.textContent = isRecording ? "Gravando" : "Parado";
  elements.recordingStatus.classList.toggle("is-recording", isRecording);
  elements.recordButton.disabled = isRecording || !isSpeechRecognitionSupported();
  elements.stopRecordButton.disabled = !isRecording;
}

function toggleTranslation() {
  const isVisible = elements.translationBox.classList.toggle("show");
  elements.toggleTranslation.textContent = isVisible ? "Esconder tradução" : "Mostrar tradução";
}

function bindEvents() {
  elements.startButton.addEventListener("click", handleStartExam);
  elements.listenQuestion.addEventListener("click", speakQuestion);
  elements.recordButton.addEventListener("click", startRecording);
  elements.stopRecordButton.addEventListener("click", stopRecording);
  elements.nextButton.addEventListener("click", goToNextQuestion);
  elements.toggleTranslation.addEventListener("click", toggleTranslation);
  elements.feedbackContent.addEventListener("click", handleFeedbackClick);
}

function initialize() {
  bindEvents();

  if (!isSpeechRecognitionSupported()) {
    elements.supportWarning.textContent = "Seu navegador não suporta reconhecimento de voz. Tente usar o Google Chrome.";
    elements.supportWarning.classList.add("show");
  }

  if ("speechSynthesis" in window) {
    window.speechSynthesis.getVoices();
  }
}

initialize();
