import { themeLabels } from "../data/templates.js";
import { escapeHtml, estimateDuration, formatTime } from "../utils/helpers.js";

let uiElements = {};
let getRate = () => 0.85;
let getDefaultVolume = () => 1;

export function initUI(elements, options = {}) {
  uiElements = elements;
  getRate = options.getRate || getRate;
  getDefaultVolume = options.getDefaultVolume || getDefaultVolume;
}

export function renderTrainingCards(items) {
  uiElements.trainingGrid.innerHTML = "";

  if (!items.length) {
    uiElements.globalPlayerWrap.classList.remove("show");
    uiElements.trainingCount.textContent = "Clique em Gerar novo treino para começar.";
    uiElements.trainingGrid.innerHTML = '<div class="empty-state panel">Seu treino aparece aqui.</div>';
    return;
  }

  items.forEach((item, index) => {
    const card = document.createElement("article");
    card.className = "training-card panel";
    card.innerHTML = createCardMarkup(item, index);
    uiElements.trainingGrid.appendChild(card);
  });

  uiElements.globalPlayerWrap.classList.add("show");
  uiElements.trainingCount.textContent = `${items.length} item${items.length === 1 ? "" : "s"} gerado${items.length === 1 ? "" : "s"}.`;
}

function createCardMarkup(item, index) {
  return `
    <div class="card-top">
      <span class="badge">${index + 1}</span>
      <span class="tag">${themeLabels[item.theme] || "Misturado"}</span>
    </div>
    ${createExerciseContent(item, index)}
    ${renderAudioPlayer(index, item.es)}
    <div class="card-actions">
      <button class="button-light" type="button" data-action="copy" data-index="${index}">Copiar frase</button>
    </div>
  `;
}

function createExerciseContent(item, index) {
  if (item.mode === "translate-pt") {
    return `
      <p class="main-text">${escapeHtml(item.es)}</p>
      <div id="answer-${index}" class="answer-box"><p class="answer-text">${escapeHtml(item.pt)}</p></div>
      <button class="button-light" type="button" data-action="toggle-answer" data-index="${index}">Mostrar tradução</button>
    `;
  }

  if (item.mode === "translate-es") {
    return `
      <p class="main-text">${escapeHtml(item.pt)}</p>
      <div id="answer-${index}" class="answer-box"><p class="answer-text">${escapeHtml(item.es)}</p></div>
      <button class="button-light" type="button" data-action="toggle-answer" data-index="${index}">Mostrar resposta</button>
    `;
  }

  if (item.mode === "gap") {
    return `
      <p class="main-text">${escapeHtml(item.prompt)}</p>
      <p class="secondary-text">${escapeHtml(item.pt)}</p>
      <div id="answer-${index}" class="answer-box"><p class="answer-text">Resposta: ${escapeHtml(item.answer)}</p></div>
      <button class="button-light" type="button" data-action="toggle-answer" data-index="${index}">Mostrar resposta</button>
    `;
  }

  if (item.mode === "question" || item.mode === "interview") {
    return `
      <p class="main-text">${escapeHtml(item.es)}</p>
      <p class="secondary-text">${escapeHtml(item.pt)}</p>
      <textarea placeholder="Escreva sua resposta em espanhol..."></textarea>
    `;
  }

  return `
    <p class="main-text">${escapeHtml(item.es)}</p>
    <p class="secondary-text">${escapeHtml(item.pt)}</p>
  `;
}

export function renderAudioPlayer(index, text) {
  return `
    <div class="audio-player" data-player="phrase" data-index="${index}">
      <div class="player-top">
        <div class="player-buttons" aria-label="Player da frase ${index + 1}">
          <button class="player-button play" type="button" data-action="play" data-index="${index}" aria-label="Play frase ${index + 1}">▶</button>
          <button class="player-button" type="button" data-action="pause" data-index="${index}" aria-label="Pause frase ${index + 1}">Ⅱ</button>
          <button class="player-button stop" type="button" data-action="stop" data-index="${index}" aria-label="Stop frase ${index + 1}">■</button>
        </div>
        <span class="status" data-role="status">Parado</span>
      </div>
      <div class="progress-row">
        <div class="progress-container" aria-hidden="true">
          <div class="progress-bar" data-role="progress"></div>
        </div>
        <span class="time-label" data-role="time">00:00 / ${formatTime(estimateDuration(text, getRate()))}</span>
      </div>
      <div class="player-bottom">
        <div class="volume-control">
          <label for="volume-${index}">Volume</label>
          <input id="volume-${index}" type="range" min="0" max="1" step="0.1" value="${getDefaultVolume()}" data-role="volume" data-index="${index}">
        </div>
      </div>
    </div>
  `;
}

export function getPhrasePlayer(index) {
  return uiElements.trainingGrid.querySelector(`.audio-player[data-index="${index}"]`);
}

export function getPlayerElements(player) {
  return {
    progress: player.querySelector('[data-role="progress"]'),
    status: player.querySelector('[data-role="status"]'),
    time: player.querySelector('[data-role="time"]')
  };
}

export function setPhraseProgress(index, elapsed, duration) {
  const player = getPhrasePlayer(index);

  if (!player) {
    return;
  }

  const playerElements = getPlayerElements(player);
  const percentage = duration > 0 ? Math.min(100, (elapsed / duration) * 100) : 0;
  playerElements.progress.style.width = `${percentage}%`;
  playerElements.time.textContent = `${formatTime(elapsed)} / ${formatTime(duration)}`;
}

export function updatePlayerStatus(index, status, items = []) {
  resetPlayers(items, index);
  const player = getPhrasePlayer(index);

  if (!player) {
    return;
  }

  const playerElements = getPlayerElements(player);
  playerElements.status.textContent = status;
  playerElements.status.classList.toggle("playing", status === "Tocando");
  player.classList.toggle("is-playing", status === "Tocando");
}

export function resetPlayer(index, items = [], status = "Parado") {
  const player = getPhrasePlayer(index);

  if (!player) {
    return;
  }

  const duration = items[index] ? estimateDuration(items[index].es, getRate()) : 0;
  const playerElements = getPlayerElements(player);
  playerElements.progress.style.width = "0%";
  playerElements.time.textContent = `00:00 / ${formatTime(duration)}`;
  playerElements.status.textContent = status;
  playerElements.status.classList.remove("playing");
  player.classList.remove("is-playing");
}

export function resetPlayers(items = [], exceptIndex = null) {
  items.forEach((item, index) => {
    if (index !== exceptIndex) {
      resetPlayer(index, items);
    }
  });
}

export function updateGlobalPlayer(status, elapsed, duration) {
  const percentage = duration > 0 ? Math.min(100, (elapsed / duration) * 100) : 0;
  uiElements.globalProgressBar.style.width = `${percentage}%`;
  uiElements.globalTimeLabel.textContent = `${formatTime(elapsed)} / ${formatTime(duration)}`;
  uiElements.globalStatus.textContent = status;
  uiElements.globalStatus.classList.toggle("playing", status === "Tocando");
  uiElements.globalPlayer.classList.toggle("is-playing", status === "Tocando");
}

export function resetGlobalPlayer(duration = 0, status = "Parado") {
  uiElements.globalProgressBar.style.width = "0%";
  uiElements.globalTimeLabel.textContent = `00:00 / ${formatTime(duration)}`;
  uiElements.globalStatus.textContent = status;
  uiElements.globalStatus.classList.remove("playing");
  uiElements.globalCurrentPhrase.textContent = "Nenhuma frase em reprodução.";
  uiElements.globalPlayer.classList.remove("is-playing");
}

export function toggleAnswer(index, button, item) {
  const answer = document.getElementById(`answer-${index}`);

  if (!answer) {
    return;
  }

  const isVisible = answer.classList.toggle("show");
  button.textContent = isVisible ? "Esconder resposta" : "Mostrar resposta";

  if (item?.mode === "translate-pt") {
    button.textContent = isVisible ? "Esconder tradução" : "Mostrar tradução";
  }
}

export function showMessage(text) {
  uiElements.message.textContent = text;
  uiElements.message.classList.add("show");
}

export function hideMessage() {
  uiElements.message.textContent = "";
  uiElements.message.classList.remove("show");
}

export function renderHistory(history) {
  uiElements.historyList.innerHTML = "";
  uiElements.historyPanel.classList.toggle("show", history.length > 0);

  history.forEach((entry, index) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "history-button";
    button.dataset.historyIndex = String(index);
    button.textContent = `${entry.date} - ${entry.config.difficulty}, ${entry.config.theme}, ${entry.config.mode}, ${entry.items.length} itens`;
    uiElements.historyList.appendChild(button);
  });
}
