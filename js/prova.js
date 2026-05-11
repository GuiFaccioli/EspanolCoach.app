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
import { loadTrainingHistory, saveTrainingHistory } from "./modules/storage.js";
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

  window.speechSynthesis.cancel();
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

function startRecording() {
  const question = getCurrentQuestion();

  if (!question) {
    return;
  }

  finalTranscript = "";
  currentPartial = "";
  elements.transcriptText.textContent = "Escutando...";
  elements.feedbackContent.className = "feedback-content empty-state";
  elements.feedbackContent.textContent = "Grave sua resposta e clique em Parar gravação.";

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
    },
    () => setRecording(true),
    () => {
      setRecording(false);
      if (!lastEvaluation && (finalTranscript || currentPartial)) {
        evaluateCurrentAnswer();
      }
    }
  );
}

function stopRecording() {
  stopRecognition();
  setRecording(false);
  evaluateCurrentAnswer();
}

function evaluateCurrentAnswer() {
  const question = getCurrentQuestion();
  const transcript = finalTranscript || currentPartial;

  if (!question || !transcript.trim()) {
    elements.feedbackContent.className = "feedback-content empty-state";
    elements.feedbackContent.textContent = "Não encontrei uma transcrição. Tente gravar novamente.";
    return;
  }

  lastEvaluation = evaluateAnswer(transcript, question);
  elements.transcriptText.textContent = transcript;
  renderFeedback(lastEvaluation);
  elements.nextButton.disabled = false;
}

function renderFeedback(result) {
  elements.feedbackContent.className = "feedback-content";
  elements.feedbackContent.innerHTML = `
    <div class="score-card">
      <span class="hint">Nota da pergunta</span>
      <strong class="score-number">${result.score}/10</strong>
    </div>
    <div class="feedback-grid">
      <div class="feedback-block">
        <h3>Sua transcrição</h3>
        <p>${escapeHtml(result.transcript)}</p>
      </div>
      <div class="feedback-block">
        <h3>O que você quis dizer</h3>
        <p>${escapeHtml(result.correctedText || result.transcript)}</p>
      </div>
      <div class="feedback-block">
        <h3>Correção</h3>
        <p>${escapeHtml(result.improvements.join(" ") || "Boa resposta. Tente deixá-la mais completa.")}</p>
      </div>
      <div class="feedback-block">
        <h3>Resposta mais natural</h3>
        <p>${escapeHtml(result.naturalAnswer)}</p>
      </div>
      <div class="feedback-block">
        <h3>Pronúncia provável</h3>
        <p>${escapeHtml(result.pronunciationNotes.join(" ") || "As palavras principais foram reconhecidas com clareza razoável.")}</p>
      </div>
      <div class="feedback-block">
        <h3>Pontos fortes</h3>
        <p>${escapeHtml(result.strengths.join(" "))}</p>
      </div>
    </div>
    <div class="feedback-block">
      <h3>Vocabulário esperado encontrado</h3>
      ${renderKeywordList(result.foundKeywords)}
    </div>
    <div class="feedback-block">
      <h3>Palavras importantes que faltaram</h3>
      ${renderKeywordList(result.missingKeywords, true)}
    </div>
  `;
}

function renderKeywordList(words, missing = false) {
  if (!words.length) {
    return "<p>Nenhuma.</p>";
  }

  return `<ul class="keyword-list">${words.map((word) => `<li class="${missing ? "missing" : ""}">${escapeHtml(word)}</li>`).join("")}</ul>`;
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
        <p>${result.average >= 7 ? "Boa relação com o vocabulário esperado e respostas compreensíveis." : "Você conseguiu praticar respostas reais e já tem uma base para melhorar."}</p>
      </div>
      <div class="feedback-block">
        <h3>Pontos para melhorar</h3>
        <p>${escapeHtml(result.recommendation)}</p>
      </div>
    </div>
    <div class="feedback-block">
      <h3>Palavras que mais faltaram</h3>
      ${renderKeywordList(result.topMissing, true)}
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
      missing: result.topMissing
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
