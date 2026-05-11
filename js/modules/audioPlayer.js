import { spanishVoicePriority } from "../data/templates.js";
import { estimateDuration } from "../utils/helpers.js";
import {
  resetGlobalPlayer,
  resetPlayer,
  resetPlayers as resetVisualPlayers,
  setPhraseProgress,
  showMessage,
  updateGlobalPlayer,
  updatePlayerStatus
} from "./ui.js";

let audioElements = {};
let getItems = () => [];
let getRate = () => 0.85;
let getSavedVoiceKey = () => "";
let onVoiceLoaded = () => {};

let availableVoices = [];
let activePlayer = null;
let activeUtterance = null;
let progressTimer = null;
let progressStartedAt = 0;
let progressElapsedBeforePause = 0;
let activeDuration = 0;
let activeSegmentDuration = 0;
let globalQueueIndex = 0;
let playbackToken = 0;

export function initAudioPlayer(options) {
  audioElements = options.elements;
  getItems = options.getItems;
  getRate = options.getRate;
  getSavedVoiceKey = options.getSavedVoiceKey;
  onVoiceLoaded = options.onVoiceLoaded;
}

export function isSpeechSupported() {
  return "speechSynthesis" in window;
}

export function loadVoices() {
  if (!isSpeechSupported()) {
    audioElements.voice.innerHTML = '<option value="">Web Speech API indisponível</option>';
    return;
  }

  const previousVoiceKey = getSavedVoiceKey();
  availableVoices = sortVoicesBySpanishPriority(window.speechSynthesis.getVoices());
  audioElements.voice.innerHTML = "";

  if (!availableVoices.length) {
    audioElements.voice.innerHTML = '<option value="">Nenhuma voz carregada ainda</option>';
    return;
  }

  availableVoices.forEach((voice, index) => {
    const option = document.createElement("option");
    option.value = String(index);
    option.textContent = `${voice.name} (${voice.lang})`;
    audioElements.voice.appendChild(option);
  });

  const savedIndex = availableVoices.findIndex((voice) => getVoiceKey(voice) === previousVoiceKey);
  const firstSpanishIndex = availableVoices.findIndex((voice) => getVoiceRank(voice) <= spanishVoicePriority.length);
  audioElements.voice.value = String(savedIndex >= 0 ? savedIndex : firstSpanishIndex >= 0 ? firstSpanishIndex : 0);
  onVoiceLoaded();
}

function sortVoicesBySpanishPriority(voices) {
  return [...voices].sort((firstVoice, secondVoice) => {
    const firstRank = getVoiceRank(firstVoice);
    const secondRank = getVoiceRank(secondVoice);
    return firstRank - secondRank || firstVoice.name.localeCompare(secondVoice.name);
  });
}

function getVoiceRank(voice) {
  const language = voice.lang || "";
  const priorityIndex = spanishVoicePriority.indexOf(language);

  if (priorityIndex !== -1) {
    return priorityIndex;
  }

  if (language.toLowerCase().startsWith("es")) {
    return spanishVoicePriority.length;
  }

  return spanishVoicePriority.length + 1;
}

export function getVoiceKey(voice = getSelectedVoice()) {
  return voice ? `${voice.name}|${voice.lang}` : "";
}

function getSelectedVoice() {
  const selectedIndex = Number(audioElements.voice.value);
  return Number.isInteger(selectedIndex) ? availableVoices[selectedIndex] : null;
}

function createUtterance(text, volume) {
  const utterance = new SpeechSynthesisUtterance(text);
  const selectedVoice = getSelectedVoice();
  utterance.lang = selectedVoice ? selectedVoice.lang : "es-MX";
  utterance.rate = Number(getRate() || 0.85);
  utterance.volume = Number(volume);

  if (selectedVoice) {
    utterance.voice = selectedVoice;
  }

  return utterance;
}

export function playPhrase(index) {
  if (!isSpeechSupported()) {
    showMessage("Seu navegador não oferece suporte à Web Speech API.");
    return;
  }

  const items = getItems();
  const item = items[index];

  if (!item) {
    return;
  }

  if (activePlayer?.type === "phrase" && activePlayer.index === index && window.speechSynthesis.paused) {
    resumeAudio();
    return;
  }

  stopAudio(false);
  playbackToken += 1;
  const currentToken = playbackToken;
  resetGlobalPlayer(getGlobalDuration(), "Parado");
  activePlayer = { type: "phrase", index };
  activeDuration = estimateDuration(item.es, getRate());
  activeSegmentDuration = activeDuration;
  progressElapsedBeforePause = 0;

  const utterance = createUtterance(item.es, getPhraseVolume(index));
  activeUtterance = utterance;
  utterance.onend = () => {
    if (currentToken === playbackToken) {
      finishPhrase(index);
    }
  };
  utterance.onerror = () => {
    if (currentToken === playbackToken) {
      stopAudio(true);
    }
  };

  updatePlayerStatus(index, "Tocando", items);
  startProgress();
  window.speechSynthesis.speak(utterance);
}

export function pauseAudio() {
  if (!isSpeechSupported() || !activePlayer || window.speechSynthesis.paused) {
    return;
  }

  progressElapsedBeforePause = getCurrentSegmentElapsed();
  clearInterval(progressTimer);
  window.speechSynthesis.pause();

  if (activePlayer.type === "phrase") {
    updatePlayerStatus(activePlayer.index, "Pausado", getItems());
  } else {
    updateGlobalPlayer("Pausado", getCompletedGlobalDuration() + progressElapsedBeforePause, getGlobalDuration());
  }
}

export function resumeAudio() {
  if (!isSpeechSupported() || !activePlayer) {
    return;
  }

  window.speechSynthesis.resume();
  startProgress();

  if (activePlayer.type === "phrase") {
    updatePlayerStatus(activePlayer.index, "Tocando", getItems());
  } else {
    updateGlobalPlayer("Tocando", getCompletedGlobalDuration() + progressElapsedBeforePause, getGlobalDuration());
  }
}

export function stopAudio(markStopped = true) {
  playbackToken += 1;
  clearInterval(progressTimer);
  progressTimer = null;

  if (isSpeechSupported()) {
    window.speechSynthesis.cancel();
  }

  if (markStopped && activePlayer?.type === "phrase") {
    resetPlayer(activePlayer.index, getItems(), "Parado");
  }

  if (markStopped && activePlayer?.type === "global") {
    resetGlobalPlayer(getGlobalDuration(), "Parado");
  }

  activeUtterance = null;
  activePlayer = null;
  activeDuration = 0;
  activeSegmentDuration = 0;
  progressElapsedBeforePause = 0;
  globalQueueIndex = 0;
}

export function speakAll() {
  if (!isSpeechSupported()) {
    showMessage("Seu navegador não oferece suporte à Web Speech API.");
    return;
  }

  const items = getItems();

  if (!items.length) {
    showMessage("Gere um treino antes de usar o player global.");
    return;
  }

  if (activePlayer?.type === "global" && window.speechSynthesis.paused) {
    resumeAudio();
    return;
  }

  stopAudio(false);
  playbackToken += 1;
  const currentToken = playbackToken;
  activePlayer = { type: "global" };
  globalQueueIndex = 0;
  progressElapsedBeforePause = 0;
  activeDuration = getGlobalDuration();
  activeSegmentDuration = 0;
  resetPlayers();
  updateGlobalPlayer("Tocando", 0, activeDuration);
  speakNextGlobalPhrase(currentToken);
}

function speakNextGlobalPhrase(currentToken) {
  const items = getItems();

  if (!activePlayer || activePlayer.type !== "global" || currentToken !== playbackToken) {
    return;
  }

  if (globalQueueIndex >= items.length) {
    finishGlobal();
    return;
  }

  const item = items[globalQueueIndex];
  activeSegmentDuration = estimateDuration(item.es, getRate());
  progressElapsedBeforePause = 0;

  const utterance = createUtterance(item.es, Number(audioElements.globalVolume.value));
  activeUtterance = utterance;
  audioElements.globalCurrentPhrase.textContent = `Frase ${globalQueueIndex + 1}: ${item.es}`;
  utterance.onend = () => {
    if (currentToken !== playbackToken) {
      return;
    }

    globalQueueIndex += 1;
    speakNextGlobalPhrase(currentToken);
  };
  utterance.onerror = () => {
    if (currentToken === playbackToken) {
      stopAudio(true);
    }
  };

  startProgress();
  window.speechSynthesis.speak(utterance);
}

export function updateProgress() {
  if (!activePlayer) {
    return;
  }

  const elapsed = getCurrentSegmentElapsed();

  if (activePlayer.type === "phrase") {
    setPhraseProgress(activePlayer.index, elapsed, activeDuration);
    return;
  }

  updateGlobalPlayer("Tocando", Math.min(getCompletedGlobalDuration() + elapsed, getGlobalDuration()), getGlobalDuration());
}

export function resetPlayers() {
  resetVisualPlayers(getItems());
  resetGlobalPlayer(getGlobalDuration(), "Parado");
}

function startProgress() {
  clearInterval(progressTimer);
  progressStartedAt = Date.now();
  progressTimer = setInterval(updateProgress, 120);
  updateProgress();
}

function getCurrentElapsed() {
  return progressElapsedBeforePause + ((Date.now() - progressStartedAt) / 1000);
}

function getCurrentSegmentElapsed() {
  const segmentLimit = activePlayer?.type === "global" ? activeSegmentDuration : activeDuration;
  return Math.min(getCurrentElapsed(), segmentLimit);
}

function finishPhrase(index) {
  clearInterval(progressTimer);
  setPhraseProgress(index, activeDuration, activeDuration);
  updatePlayerStatus(index, "Finalizado", getItems());
  activeUtterance = null;
  activePlayer = null;
  activeSegmentDuration = 0;
  progressElapsedBeforePause = 0;
}

function finishGlobal() {
  clearInterval(progressTimer);
  updateGlobalPlayer("Finalizado", getGlobalDuration(), getGlobalDuration());
  audioElements.globalCurrentPhrase.textContent = "Todas as frases foram reproduzidas.";
  activeUtterance = null;
  activePlayer = null;
  activeSegmentDuration = 0;
  progressElapsedBeforePause = 0;
  globalQueueIndex = 0;
}

function getPhraseVolume(index) {
  const volumeInput = audioElements.trainingGrid.querySelector(`input[data-role="volume"][data-index="${index}"]`);
  return volumeInput ? Number(volumeInput.value) : Number(audioElements.defaultVolume.value);
}

function getGlobalDuration() {
  return getItems().reduce((total, item) => total + estimateDuration(item.es, getRate()), 0);
}

function getCompletedGlobalDuration() {
  return getItems()
    .slice(0, globalQueueIndex)
    .reduce((total, item) => total + estimateDuration(item.es, getRate()), 0);
}
