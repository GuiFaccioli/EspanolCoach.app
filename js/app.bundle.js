(function () {
  "use strict";

  if (window.__spanishTrainerModuleLoaded) {
    return;
  }

  var voicePriority = ["es-MX", "es-US", "es-CO", "es-AR", "es-419"];
  var labels = {
    general: "Geral",
    entrevista: "Entrevista",
    reuniao: "Reunião",
    suporte: "Suporte",
    desenvolvimento: "Web",
    financeiro: "Financeiro",
    fiserv: "Fiserv / fintech"
  };
  var bank = {
    basico: [
      item("Trabajo con tecnología.", "Eu trabalho com tecnologia.", "general"),
      item("Estudio español todos los días.", "Eu estudo espanhol todos os dias.", "general"),
      item("Necesito ayuda con el sistema.", "Eu preciso de ajuda com o sistema.", "suporte"),
      item("Tengo una reunión hoy.", "Eu tenho uma reunião hoje.", "reuniao"),
      item("Quiero aprender más sobre APIs.", "Eu quero aprender mais sobre APIs.", "desenvolvimento"),
      item("Reviso transacciones en el sistema.", "Eu reviso transações no sistema.", "financeiro"),
      item("Fiserv es una empresa de tecnología financiera.", "A Fiserv é uma empresa de tecnologia financeira.", "fiserv")
    ],
    intermediario: [
      item("Estoy estudiando desarrollo web para mejorar mis oportunidades profesionales.", "Estou estudando desenvolvimento web para melhorar minhas oportunidades profissionais.", "desenvolvimento"),
      item("Tengo experiencia con soporte técnico y atención a usuarios.", "Tenho experiência com suporte técnico e atendimento a usuários.", "suporte"),
      item("Me gustaría trabajar en una empresa de tecnología financiera.", "Eu gostaria de trabalhar em uma empresa de tecnologia financeira.", "fiserv"),
      item("Puedo analizar errores del sistema y explicar la solución con claridad.", "Posso analisar erros do sistema e explicar a solução com clareza.", "suporte"),
      item("El cliente reportó un error al procesar una transacción.", "O cliente relatou um erro ao processar uma transação.", "financeiro"),
      item("En una reunión, intento escuchar bien antes de responder.", "Em uma reunião, tento escutar bem antes de responder.", "reuniao")
    ],
    avancado: [
      item("Me interesa trabajar en Fiserv porque quiero desarrollarme en el sector de tecnología financiera.", "Tenho interesse em trabalhar na Fiserv porque quero me desenvolver no setor de tecnologia financeira.", "fiserv"),
      item("Tengo experiencia resolviendo problemas técnicos, comunicándome con usuarios y colaborando con equipos de desarrollo.", "Tenho experiência resolvendo problemas técnicos, comunicando-me com usuários e colaborando com equipes de desenvolvimento.", "suporte"),
      item("Si una transacción falla, intento analizar el problema, revisar los datos y comunicar la situación con claridad.", "Se uma transação falha, tento analisar o problema, revisar os dados e comunicar a situação com clareza.", "financeiro"),
      item("Durante una reunión técnica, procuro confirmar los requisitos antes de proponer una solución.", "Durante uma reunião técnica, procuro confirmar os requisitos antes de propor uma solução.", "reuniao"),
      item("Si una API devuelve un error inesperado, reviso la solicitud, la respuesta y el contexto de negocio.", "Se uma API retorna um erro inesperado, reviso a requisição, a resposta e o contexto de negócio.", "desenvolvimento")
    ],
    entrevista: [
      item("Háblame de ti.", "Fale-me sobre você.", "entrevista"),
      item("¿Por qué quieres aprender español?", "Por que você quer aprender espanhol?", "entrevista"),
      item("¿Qué experiencia tienes con soporte técnico?", "Que experiência você tem com suporte técnico?", "suporte"),
      item("¿Por qué te interesa el sector financiero?", "Por que você se interessa pelo setor financeiro?", "financeiro"),
      item("¿Por qué te gustaría trabajar en Fiserv?", "Por que você gostaria de trabalhar na Fiserv?", "fiserv"),
      item("¿Cómo explicarías una API a una persona no técnica?", "Como você explicaria uma API para uma pessoa não técnica?", "desenvolvimento")
    ]
  };
  var extra = [
    item("El usuario no puede iniciar sesión en el sistema.", "O usuário não consegue entrar no sistema.", "suporte"),
    item("Voy a revisar los registros para entender el error.", "Vou revisar os registros para entender o erro.", "suporte"),
    item("La transacción fue aprobada por el sistema.", "A transação foi aprovada pelo sistema.", "financeiro"),
    item("El pago fue rechazado por falta de autorización.", "O pagamento foi recusado por falta de autorização.", "financeiro"),
    item("Estoy creando una interfaz con HTML, CSS y JavaScript.", "Estou criando uma interface com HTML, CSS e JavaScript.", "desenvolvimento"),
    item("La API devuelve una respuesta en formato JSON.", "A API retorna uma resposta em formato JSON.", "desenvolvimento"),
    item("Buenos días, gracias por participar en la reunión.", "Bom dia, obrigado por participar da reunião.", "reuniao"),
    item("Voy a compartir una actualización del proyecto.", "Vou compartilhar uma atualização do projeto.", "reuniao"),
    item("Fiserv ofrece soluciones de tecnología financiera para comercios.", "A Fiserv oferece soluções de tecnologia financeira para comércios.", "fiserv"),
    item("El sector de pagos combina tecnología, seguridad y servicio.", "O setor de pagamentos combina tecnologia, segurança e serviço.", "fiserv")
  ];

  var els = {};
  var voices = [];
  var generated = [];
  var active = null;
  var timer = null;
  var startedAt = 0;
  var elapsedBeforePause = 0;
  var activeDuration = 0;
  var globalIndex = 0;
  var token = 0;

  function item(es, pt, theme) {
    return { es: es, pt: pt, theme: theme };
  }

  function $(id) {
    return document.getElementById(id);
  }

  function initElements() {
    els = {
      difficulty: $("difficultySelect"),
      theme: $("themeSelect"),
      mode: $("modeSelect"),
      count: $("countSelect"),
      voice: $("voiceSelect"),
      rate: $("rateRange"),
      rateValue: $("rateValue"),
      defaultVolume: $("defaultVolume"),
      volumeValue: $("volumeValue"),
      globalVolume: $("globalVolume"),
      generateButton: $("generateButton"),
      listenAllButton: $("listenAllButton"),
      stopAllButton: $("stopAllButton"),
      message: $("message"),
      grid: $("trainingGrid"),
      trainingCount: $("trainingCount"),
      globalWrap: $("globalPlayerWrap"),
      globalPlayer: $("globalPlayer"),
      globalProgress: $("globalProgressBar"),
      globalTime: $("globalTimeLabel"),
      globalStatus: $("globalStatus"),
      globalPhrase: $("globalCurrentPhrase"),
      historyPanel: $("historyPanel"),
      historyList: $("historyList")
    };
  }

  function random(array) {
    return array[Math.floor(Math.random() * array.length)];
  }

  function shuffle(array) {
    return array.slice().sort(function () { return Math.random() - 0.5; });
  }

  function allItems() {
    return Object.keys(bank).reduce(function (acc, key) { return acc.concat(bank[key]); }, []).concat(extra);
  }

  function pool() {
    var theme = els.theme.value;
    var difficulty = els.difficulty.value;
    var base = (bank[difficulty] || bank.basico).concat(extra);
    if (theme === "misturado") return allItems();
    if (theme === "entrevista") return bank.entrevista;
    if (theme === "general") return base;
    return allItems().filter(function (x) { return x.theme === theme; }).concat(base.filter(function (x) { return x.theme === theme; }));
  }

  function makeTemplate() {
    var subjects = [["Trabajo", "Eu trabalho"], ["Aprendo", "Eu aprendo"], ["Practico", "Eu pratico"], ["Documento", "Eu documento"]];
    var objects = [["con APIs financieras", "com APIs financeiras", "desenvolvimento"], ["con sistemas de pago", "com sistemas de pagamento", "financeiro"], ["con usuarios internos", "com usuários internos", "suporte"], ["en reuniones técnicas", "em reuniões técnicas", "reuniao"]];
    var endings = [["para mejorar mi comunicación profesional.", "para melhorar minha comunicação profissional."], ["porque quiero crecer en tecnología.", "porque quero crescer em tecnologia."]];
    var s = random(subjects);
    var o = random(objects);
    var e = random(endings);
    return item(s[0] + " " + o[0] + " " + e[0], s[1] + " " + o[1] + " " + e[1], o[2]);
  }

  function generate() {
    stop(false);
    hideMessage();
    var count = Number(els.count.value);
    var mode = els.mode.value;
    var source = mode === "question" || mode === "interview" ? bank.entrevista : pool();
    var used = {};
    generated = [];
    var attempts = 0;
    while (generated.length < count && attempts < count * 20) {
      var base = mode === "question" || mode === "interview" ? random(bank.entrevista) : (Math.random() < 0.25 ? makeTemplate() : random(source));
      if (!used[base.es]) {
        used[base.es] = true;
        generated.push(exercise(base, mode, generated.length));
      }
      attempts += 1;
    }
    shuffle(source).forEach(function (base) {
      if (generated.length < count && !used[base.es]) {
        used[base.es] = true;
        generated.push(exercise(base, mode, generated.length));
      }
    });
    render();
    savePrefs();
    saveHistory();
  }

  function exercise(base, mode, index) {
    var words = base.es.split(" ");
    var gap = words.findIndex(function (word) { return word.replace(/[¿?.,]/g, "").length >= 6; });
    if (gap < 0) gap = Math.floor(words.length / 2);
    var prompt = words.slice();
    var answer = prompt[gap].replace(/[¿?.,]/g, "");
    prompt[gap] = "_____";
    return {
      id: Date.now() + "-" + index,
      es: base.es,
      pt: base.pt,
      theme: base.theme,
      mode: mode,
      prompt: prompt.join(" "),
      answer: answer
    };
  }

  function render() {
    els.grid.innerHTML = "";
    if (!generated.length) {
      els.globalWrap.classList.remove("show");
      els.trainingCount.textContent = "Clique em Gerar novo treino para começar.";
      els.grid.innerHTML = '<div class="empty-state panel">Seu treino aparece aqui.</div>';
      return;
    }
    generated.forEach(function (it, i) {
      var card = document.createElement("article");
      card.className = "training-card panel";
      card.innerHTML = cardHtml(it, i);
      els.grid.appendChild(card);
    });
    els.globalWrap.classList.add("show");
    els.trainingCount.textContent = generated.length + " itens gerados.";
    resetPlayers();
    renderHistory();
  }

  function cardHtml(it, i) {
    return '<div class="card-top"><span class="badge">' + (i + 1) + '</span><span class="tag">' + (labels[it.theme] || "Misturado") + '</span></div>' + contentHtml(it, i) + playerHtml(i, it.es) + '<div class="card-actions"><button class="button-light" type="button" data-action="copy" data-index="' + i + '">Copiar frase</button></div>';
  }

  function contentHtml(it, i) {
    if (it.mode === "translate-pt") return '<p class="main-text">' + esc(it.es) + '</p><div id="answer-' + i + '" class="answer-box"><p class="answer-text">' + esc(it.pt) + '</p></div><button class="button-light" type="button" data-action="toggle-answer" data-index="' + i + '">Mostrar tradução</button>';
    if (it.mode === "translate-es") return '<p class="main-text">' + esc(it.pt) + '</p><div id="answer-' + i + '" class="answer-box"><p class="answer-text">' + esc(it.es) + '</p></div><button class="button-light" type="button" data-action="toggle-answer" data-index="' + i + '">Mostrar resposta</button>';
    if (it.mode === "gap") return '<p class="main-text">' + esc(it.prompt) + '</p><p class="secondary-text">' + esc(it.pt) + '</p><div id="answer-' + i + '" class="answer-box"><p class="answer-text">Resposta: ' + esc(it.answer) + '</p></div><button class="button-light" type="button" data-action="toggle-answer" data-index="' + i + '">Mostrar resposta</button>';
    if (it.mode === "question" || it.mode === "interview") return '<p class="main-text">' + esc(it.es) + '</p><p class="secondary-text">' + esc(it.pt) + '</p><textarea placeholder="Escreva sua resposta em espanhol..."></textarea>';
    return '<p class="main-text">' + esc(it.es) + '</p><p class="secondary-text">' + esc(it.pt) + '</p>';
  }

  function playerHtml(i, text) {
    return '<div class="audio-player" data-index="' + i + '"><div class="player-top"><div class="player-buttons"><button class="player-button play" type="button" data-action="play" data-index="' + i + '">▶</button><button class="player-button" type="button" data-action="pause" data-index="' + i + '">Ⅱ</button><button class="player-button stop" type="button" data-action="stop" data-index="' + i + '">■</button></div><span class="status" data-role="status">Parado</span></div><div class="progress-row"><div class="progress-container"><div class="progress-bar" data-role="progress"></div></div><span class="time-label" data-role="time">00:00 / ' + format(estimate(text)) + '</span></div><div class="player-bottom"><div class="volume-control"><label for="volume-' + i + '">Volume</label><input id="volume-' + i + '" type="range" min="0" max="1" step="0.1" value="' + els.defaultVolume.value + '" data-role="volume" data-index="' + i + '"></div></div></div>';
  }

  function loadVoices() {
    if (!("speechSynthesis" in window)) {
      els.voice.innerHTML = '<option value="">Web Speech API indisponível</option>';
      return;
    }
    voices = speechSynthesis.getVoices().slice().sort(function (a, b) { return rank(a) - rank(b) || a.name.localeCompare(b.name); });
    els.voice.innerHTML = "";
    if (!voices.length) {
      els.voice.innerHTML = '<option value="">Nenhuma voz carregada ainda</option>';
      return;
    }
    voices.forEach(function (v, i) {
      var option = document.createElement("option");
      option.value = i;
      option.textContent = v.name + " (" + v.lang + ")";
      els.voice.appendChild(option);
    });
    var first = voices.findIndex(function (v) { return rank(v) <= voicePriority.length; });
    els.voice.value = String(first >= 0 ? first : 0);
  }

  function rank(voice) {
    var idx = voicePriority.indexOf(voice.lang || "");
    if (idx >= 0) return idx;
    return (voice.lang || "").toLowerCase().startsWith("es") ? voicePriority.length : voicePriority.length + 1;
  }

  function play(index) {
    if (!("speechSynthesis" in window)) return showMessage("Seu navegador não oferece suporte à Web Speech API.");
    if (active && active.type === "phrase" && active.index === index && speechSynthesis.paused) return resume();
    stop(false);
    token += 1;
    var current = token;
    active = { type: "phrase", index: index };
    activeDuration = estimate(generated[index].es);
    elapsedBeforePause = 0;
    status(index, "Tocando");
    var utterance = utter(generated[index].es, volume(index));
    utterance.onend = function () { if (current === token) finish(index); };
    utterance.onerror = function () { if (current === token) stop(true); };
    start();
    speechSynthesis.speak(utterance);
  }

  function speakAll() {
    if (!generated.length) return showMessage("Gere um treino antes de usar o player global.");
    if (active && active.type === "global" && speechSynthesis.paused) return resume();
    stop(false);
    token += 1;
    var current = token;
    active = { type: "global" };
    globalIndex = 0;
    elapsedBeforePause = 0;
    activeDuration = globalDuration();
    updateGlobal("Tocando", 0);
    nextGlobal(current);
  }

  function nextGlobal(current) {
    if (!active || active.type !== "global" || current !== token) return;
    if (globalIndex >= generated.length) return finishGlobal();
    var text = generated[globalIndex].es;
    activeDuration = estimate(text);
    elapsedBeforePause = 0;
    els.globalPhrase.textContent = "Frase " + (globalIndex + 1) + ": " + text;
    var u = utter(text, els.globalVolume.value);
    u.onend = function () { if (current === token) { globalIndex += 1; nextGlobal(current); } };
    u.onerror = function () { if (current === token) stop(true); };
    start();
    speechSynthesis.speak(u);
  }

  function utter(text, vol) {
    var u = new SpeechSynthesisUtterance(text);
    var v = voices[Number(els.voice.value)];
    u.lang = v ? v.lang : "es-MX";
    u.voice = v || null;
    u.rate = Number(els.rate.value || 0.85);
    u.volume = Number(vol);
    return u;
  }

  function pause() {
    if (!active || speechSynthesis.paused) return;
    elapsedBeforePause = elapsed();
    clearInterval(timer);
    speechSynthesis.pause();
    active.type === "phrase" ? status(active.index, "Pausado") : updateGlobal("Pausado", completedGlobal() + elapsedBeforePause);
  }

  function resume() {
    speechSynthesis.resume();
    start();
    active.type === "phrase" ? status(active.index, "Tocando") : updateGlobal("Tocando", completedGlobal() + elapsedBeforePause);
  }

  function stop(mark) {
    token += 1;
    clearInterval(timer);
    if ("speechSynthesis" in window) speechSynthesis.cancel();
    if (mark && active && active.type === "phrase") resetPlayer(active.index);
    if (mark && active && active.type === "global") resetGlobal();
    active = null;
    globalIndex = 0;
    elapsedBeforePause = 0;
  }

  function start() {
    clearInterval(timer);
    startedAt = Date.now();
    timer = setInterval(progress, 120);
    progress();
  }

  function progress() {
    if (!active) return;
    var e = Math.min(elapsed(), activeDuration);
    if (active.type === "phrase") setProgress(active.index, e, activeDuration);
    else updateGlobal("Tocando", Math.min(completedGlobal() + e, globalDuration()));
  }

  function finish(index) {
    clearInterval(timer);
    setProgress(index, activeDuration, activeDuration);
    status(index, "Finalizado");
    active = null;
  }

  function finishGlobal() {
    clearInterval(timer);
    updateGlobal("Finalizado", globalDuration());
    els.globalPhrase.textContent = "Todas as frases foram reproduzidas.";
    active = null;
    globalIndex = 0;
  }

  function status(index, text) {
    resetPlayers(index);
    var p = player(index);
    if (!p) return;
    p.querySelector('[data-role="status"]').textContent = text;
    p.querySelector('[data-role="status"]').classList.toggle("playing", text === "Tocando");
    p.classList.toggle("is-playing", text === "Tocando");
  }

  function setProgress(index, e, d) {
    var p = player(index);
    if (!p) return;
    p.querySelector('[data-role="progress"]').style.width = (d ? Math.min(100, e / d * 100) : 0) + "%";
    p.querySelector('[data-role="time"]').textContent = format(e) + " / " + format(d);
  }

  function resetPlayer(index) {
    var p = player(index);
    if (!p) return;
    setProgress(index, 0, estimate(generated[index].es));
    p.querySelector('[data-role="status"]').textContent = "Parado";
    p.querySelector('[data-role="status"]').classList.remove("playing");
    p.classList.remove("is-playing");
  }

  function resetPlayers(except) {
    generated.forEach(function (_, i) { if (i !== except) resetPlayer(i); });
    resetGlobal();
  }

  function updateGlobal(text, e) {
    var d = globalDuration();
    els.globalProgress.style.width = (d ? Math.min(100, e / d * 100) : 0) + "%";
    els.globalTime.textContent = format(e) + " / " + format(d);
    els.globalStatus.textContent = text;
    els.globalStatus.classList.toggle("playing", text === "Tocando");
    els.globalPlayer.classList.toggle("is-playing", text === "Tocando");
  }

  function resetGlobal() {
    updateGlobal("Parado", 0);
    els.globalPhrase.textContent = "Nenhuma frase em reprodução.";
  }

  function bind() {
    els.generateButton.addEventListener("click", generate);
    els.listenAllButton.addEventListener("click", speakAll);
    els.stopAllButton.addEventListener("click", function () { stop(true); });
    els.rate.addEventListener("input", function () { els.rateValue.textContent = Number(els.rate.value).toFixed(2); savePrefs(); resetPlayers(); });
    els.defaultVolume.addEventListener("input", function () { els.volumeValue.textContent = Number(els.defaultVolume.value).toFixed(1); els.globalVolume.value = els.defaultVolume.value; savePrefs(); });
    els.grid.addEventListener("click", function (ev) {
      var b = ev.target.closest("button");
      if (!b) return;
      var i = Number(b.dataset.index);
      if (b.dataset.action === "play") play(i);
      if (b.dataset.action === "pause") pause();
      if (b.dataset.action === "stop") stop(true);
      if (b.dataset.action === "toggle-answer") toggle(i, b);
      if (b.dataset.action === "copy") copy(i, b);
    });
    els.globalPlayer.addEventListener("click", function (ev) {
      var b = ev.target.closest("button");
      if (!b) return;
      if (b.dataset.globalAction === "play") speakAll();
      if (b.dataset.globalAction === "pause") pause();
      if (b.dataset.globalAction === "stop") stop(true);
    });
    els.historyList.addEventListener("click", function (ev) {
      var b = ev.target.closest("button[data-history-index]");
      if (!b) return;
      var h = history()[Number(b.dataset.historyIndex)];
      if (!h) return;
      generated = h.items;
      Object.keys(h.config).forEach(function (k) {
        var map = { difficulty: els.difficulty, theme: els.theme, mode: els.mode, count: els.count };
        if (map[k]) map[k].value = h.config[k];
      });
      render();
    });
  }

  function toggle(index, button) {
    var box = $("answer-" + index);
    if (!box) return;
    var visible = box.classList.toggle("show");
    button.textContent = generated[index].mode === "translate-pt" ? (visible ? "Esconder tradução" : "Mostrar tradução") : (visible ? "Esconder resposta" : "Mostrar resposta");
  }

  function copy(index, button) {
    var text = generated[index].es;
    var done = navigator.clipboard && navigator.clipboard.writeText ? navigator.clipboard.writeText(text) : Promise.reject();
    done.catch(function () {
      var ta = document.createElement("textarea");
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
    }).finally(function () {
      var old = button.textContent;
      button.textContent = "Copiado";
      setTimeout(function () { button.textContent = old; }, 1200);
    });
  }

  function savePrefs() {
    localStorage.setItem("spanishTrainerPreferences", JSON.stringify({ difficulty: els.difficulty.value, theme: els.theme.value, mode: els.mode.value, count: els.count.value, rate: els.rate.value, volume: els.defaultVolume.value }));
  }

  function restorePrefs() {
    try {
      var p = JSON.parse(localStorage.getItem("spanishTrainerPreferences")) || {};
      if (p.difficulty) els.difficulty.value = p.difficulty;
      if (p.theme) els.theme.value = p.theme;
      if (p.mode) els.mode.value = p.mode;
      if (p.count) els.count.value = p.count;
      if (p.rate) { els.rate.value = p.rate; els.rateValue.textContent = Number(p.rate).toFixed(2); }
      if (p.volume) { els.defaultVolume.value = p.volume; els.globalVolume.value = p.volume; els.volumeValue.textContent = Number(p.volume).toFixed(1); }
    } catch (e) {}
  }

  function saveHistory() {
    var h = history();
    h.unshift({ date: new Date().toLocaleString("pt-BR"), config: { difficulty: els.difficulty.value, theme: els.theme.value, mode: els.mode.value, count: els.count.value }, items: generated });
    localStorage.setItem("spanishTrainerHistory", JSON.stringify(h.slice(0, 5)));
    renderHistory();
  }

  function history() {
    try { return JSON.parse(localStorage.getItem("spanishTrainerHistory")) || []; } catch (e) { return []; }
  }

  function renderHistory() {
    var h = history();
    els.historyList.innerHTML = "";
    els.historyPanel.classList.toggle("show", h.length > 0);
    h.forEach(function (entry, i) {
      var b = document.createElement("button");
      b.className = "history-button";
      b.type = "button";
      b.dataset.historyIndex = i;
      b.textContent = entry.date + " - " + entry.config.difficulty + ", " + entry.config.theme + ", " + entry.items.length + " itens";
      els.historyList.appendChild(b);
    });
  }

  function player(index) { return els.grid.querySelector('.audio-player[data-index="' + index + '"]'); }
  function volume(index) { var input = els.grid.querySelector('input[data-role="volume"][data-index="' + index + '"]'); return input ? input.value : els.defaultVolume.value; }
  function estimate(text) { return Math.max(2.2, text.split(/\s+/).length * 0.52, text.length / 13) / Number(els.rate.value || 0.85); }
  function elapsed() { return elapsedBeforePause + ((Date.now() - startedAt) / 1000); }
  function globalDuration() { return generated.reduce(function (sum, it) { return sum + estimate(it.es); }, 0); }
  function completedGlobal() { return generated.slice(0, globalIndex).reduce(function (sum, it) { return sum + estimate(it.es); }, 0); }
  function format(sec) { sec = Math.max(0, Math.floor(sec)); return String(Math.floor(sec / 60)).padStart(2, "0") + ":" + String(sec % 60).padStart(2, "0"); }
  function esc(value) { return String(value).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&#039;"); }
  function showMessage(text) { els.message.textContent = text; els.message.classList.add("show"); }
  function hideMessage() { els.message.textContent = ""; els.message.classList.remove("show"); }

  initElements();
  restorePrefs();
  bind();
  renderHistory();
  loadVoices();
  if ("speechSynthesis" in window) speechSynthesis.onvoiceschanged = loadVoices;
})();
