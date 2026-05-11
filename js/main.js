import { generateTraining } from "./modules/generator.js";
import {
  getVoiceKey,
  initAudioPlayer,
  isSpeechSupported,
  loadVoices,
  pauseAudio,
  playPhrase,
  resetPlayers,
  speakAll,
  stopAudio
} from "./modules/audioPlayer.js";
import { loadPreferences, loadTrainingHistory, savePreferences, saveTrainingHistory } from "./modules/storage.js";
import {
  hideMessage,
  initUI,
  renderHistory,
  renderTrainingCards,
  showMessage,
  toggleAnswer
} from "./modules/ui.js";

window.__spanishTrainerModuleLoaded = true;

const elements = {
  difficulty: document.getElementById("difficultySelect"),
  theme: document.getElementById("themeSelect"),
  mode: document.getElementById("modeSelect"),
  count: document.getElementById("countSelect"),
  voice: document.getElementById("voiceSelect"),
  rate: document.getElementById("rateRange"),
  rateValue: document.getElementById("rateValue"),
  defaultVolume: document.getElementById("defaultVolume"),
  volumeValue: document.getElementById("volumeValue"),
  globalVolume: document.getElementById("globalVolume"),
  generateButton: document.getElementById("generateButton"),
  listenAllButton: document.getElementById("listenAllButton"),
  stopAllButton: document.getElementById("stopAllButton"),
  message: document.getElementById("message"),
  trainingGrid: document.getElementById("trainingGrid"),
  trainingCount: document.getElementById("trainingCount"),
  globalPlayerWrap: document.getElementById("globalPlayerWrap"),
  globalPlayer: document.getElementById("globalPlayer"),
  globalProgressBar: document.getElementById("globalProgressBar"),
  globalTimeLabel: document.getElementById("globalTimeLabel"),
  globalStatus: document.getElementById("globalStatus"),
  globalCurrentPhrase: document.getElementById("globalCurrentPhrase"),
  historyPanel: document.getElementById("historyPanel"),
  historyList: document.getElementById("historyList")
};

let generatedItems = [];

function getCurrentConfig() {
  return {
    difficulty: elements.difficulty.value,
    theme: elements.theme.value,
    mode: elements.mode.value,
    count: elements.count.value
  };
}

function getPreferencePayload() {
  return {
    ...getCurrentConfig(),
    voiceKey: getVoiceKey(),
    rate: elements.rate.value,
    volume: elements.defaultVolume.value
  };
}

function persistPreferences() {
  savePreferences(getPreferencePayload());
}

function applyConfig(config = {}) {
  elements.difficulty.value = config.difficulty || elements.difficulty.value;
  elements.theme.value = config.theme || elements.theme.value;
  elements.mode.value = config.mode || elements.mode.value;
  elements.count.value = config.count || elements.count.value;
}

function restorePreferences() {
  const preferences = loadPreferences();
  applyConfig(preferences);

  if (preferences.rate) {
    elements.rate.value = preferences.rate;
    elements.rateValue.textContent = Number(preferences.rate).toFixed(2);
  }

  if (preferences.volume) {
    elements.defaultVolume.value = preferences.volume;
    elements.globalVolume.value = preferences.volume;
    elements.volumeValue.textContent = Number(preferences.volume).toFixed(1);
  }
}

function generateNewTraining() {
  hideMessage();
  stopAudio(false);
  generatedItems = generateTraining(getCurrentConfig());
  renderTrainingCards(generatedItems);
  resetPlayers();
  persistPreferences();
  saveTrainingHistory({
    id: Date.now(),
    date: new Date().toLocaleString("pt-BR"),
    config: getCurrentConfig(),
    items: generatedItems
  });
  renderHistory(loadTrainingHistory());
}

function loadHistoryItem(index) {
  const entry = loadTrainingHistory()[index];

  if (!entry) {
    return;
  }

  stopAudio(false);
  applyConfig(entry.config);
  generatedItems = entry.items;
  renderTrainingCards(generatedItems);
  resetPlayers();
  persistPreferences();
}

async function copyPhrase(index, button) {
  const item = generatedItems[index];

  if (!item) {
    return;
  }

  let copied = false;

  try {
    await navigator.clipboard.writeText(item.es);
    copied = true;
  } catch (error) {
    copied = copyWithFallback(item.es);
  }

  if (!copied) {
    showMessage("Não foi possível copiar automaticamente. Selecione a frase e copie manualmente.");
    return;
  }

  const originalText = button.textContent;
  button.textContent = "Copiado";
  setTimeout(() => {
    button.textContent = originalText;
  }, 1200);
}

function copyWithFallback(text) {
  const temporaryInput = document.createElement("textarea");
  temporaryInput.value = text;
  temporaryInput.setAttribute("readonly", "");
  temporaryInput.style.position = "fixed";
  temporaryInput.style.left = "-9999px";
  document.body.appendChild(temporaryInput);
  temporaryInput.select();

  try {
    return document.execCommand("copy");
  } finally {
    document.body.removeChild(temporaryInput);
  }
}

function bindEvents() {
  elements.generateButton.addEventListener("click", generateNewTraining);
  elements.listenAllButton.addEventListener("click", speakAll);
  elements.stopAllButton.addEventListener("click", () => stopAudio(true));

  [elements.difficulty, elements.theme, elements.mode, elements.count, elements.voice].forEach((control) => {
    control.addEventListener("change", persistPreferences);
  });

  elements.rate.addEventListener("input", () => {
    elements.rateValue.textContent = Number(elements.rate.value).toFixed(2);
    persistPreferences();
    resetPlayers();
  });

  elements.defaultVolume.addEventListener("input", () => {
    elements.volumeValue.textContent = Number(elements.defaultVolume.value).toFixed(1);
    elements.globalVolume.value = elements.defaultVolume.value;
    persistPreferences();
  });

  elements.globalVolume.addEventListener("input", () => {
    elements.defaultVolume.value = elements.globalVolume.value;
    elements.volumeValue.textContent = Number(elements.globalVolume.value).toFixed(1);
    persistPreferences();
  });

  elements.trainingGrid.addEventListener("click", (event) => {
    const button = event.target.closest("button");

    if (!button) {
      return;
    }

    const index = Number(button.dataset.index);

    if (button.dataset.action === "play") {
      playPhrase(index);
    }

    if (button.dataset.action === "pause") {
      pauseAudio();
    }

    if (button.dataset.action === "stop") {
      stopAudio(true);
    }

    if (button.dataset.action === "copy") {
      copyPhrase(index, button);
    }

    if (button.dataset.action === "toggle-answer") {
      toggleAnswer(index, button, generatedItems[index]);
    }
  });

  elements.globalPlayer.addEventListener("click", (event) => {
    const button = event.target.closest("button");

    if (!button) {
      return;
    }

    if (button.dataset.globalAction === "play") {
      speakAll();
    }

    if (button.dataset.globalAction === "pause") {
      pauseAudio();
    }

    if (button.dataset.globalAction === "stop") {
      stopAudio(true);
    }
  });

  elements.historyList.addEventListener("click", (event) => {
    const button = event.target.closest("button[data-history-index]");

    if (button) {
      loadHistoryItem(Number(button.dataset.historyIndex));
    }
  });
}

function initializeApp() {
  restorePreferences();
  initUI(elements, {
    getRate: () => elements.rate.value,
    getDefaultVolume: () => elements.defaultVolume.value
  });
  initAudioPlayer({
    elements,
    getItems: () => generatedItems,
    getRate: () => elements.rate.value,
    getSavedVoiceKey: () => loadPreferences().voiceKey,
    onVoiceLoaded: persistPreferences
  });
  bindEvents();
  renderHistory(loadTrainingHistory());

  if (isSpeechSupported()) {
    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;
  } else {
    elements.voice.innerHTML = '<option value="">Web Speech API indisponível</option>';
    showMessage("Seu navegador não oferece suporte à Web Speech API.");
  }
}

initializeApp();
