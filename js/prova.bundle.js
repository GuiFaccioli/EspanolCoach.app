(function () {
  "use strict";

  if (window.__spanishOralExamModuleLoaded) return;

  var questions = [



    q(
      "a5",
      "avancado",
      "reuniao",
      "¿Cómo presentarías riesgos técnicos en una reunión ejecutiva?",
      "Como você apresentaria riscos técnicos em uma reunião executiva?",
      ["riesgos", "impacto", "acciones"],
      "Presentaría los riesgos, el impacto para el negocio y las acciones recomendadas.",
    ),
  ];
  var labels = {
    entrevista: "Entrevista",
    desenvolvimento: "Desenvolvimento web",
    financeiro: "Sistema financeiro",
    fintech: "Fintech / fintech",
    reuniao: "Reunião",
    comunicacao: "Comunicação profissional",
    misturado: "Misturado",
  };
  var els = {};
  var exam = { list: [], index: -1, answers: [] };
  var recognition = null;
  var partial = "";
  var finalText = "";
  var activeVariation = null;

  function q(
    id,
    difficulty,
    theme,
    questionEs,
    questionPt,
    expectedKeywords,
    sampleAnswerEs,
  ) {
    return {
      id: id,
      difficulty: difficulty,
      theme: theme,
      questionEs: questionEs,
      questionPt: questionPt,
      expectedKeywords: expectedKeywords,
      sampleAnswerEs: sampleAnswerEs,
    };
  }

  function $(id) {
    return document.getElementById(id);
  }
  function initEls() {
    els = {
      difficulty: $("examDifficulty"),
      theme: $("examTheme"),
      count: $("examCount"),
      start: $("startExamButton"),
      counter: $("questionCounter"),
      tag: $("questionTheme"),
      question: $("questionText"),
      translation: $("translationBox"),
      toggle: $("toggleTranslationButton"),
      listen: $("listenQuestionButton"),
      record: $("recordButton"),
      stop: $("stopRecordButton"),
      status: $("recordingStatus"),
      transcript: $("transcriptText"),
      feedback: $("feedbackContent"),
      next: $("nextQuestionButton"),
      result: $("resultArea"),
      resultContent: $("resultContent"),
      warning: $("supportWarning"),
      progressBar: $("examProgressBar"),
      progressText: $("examProgressText"),
    };
  }

  function startExam() {
    var pool = questions.filter(function (x) {
      return (
        x.difficulty === els.difficulty.value &&
        (els.theme.value === "misturado" || x.theme === els.theme.value)
      );
    });
    if (!pool.length)
      pool = questions.filter(function (x) {
        return x.difficulty === els.difficulty.value;
      });
    exam = {
      list: shuffle(pool).slice(0, Number(els.count.value)),
      index: -1,
      answers: [],
    };
    updateProgress(0, 0);
    nextQuestion();
  }

  function nextQuestion() {
    stopVariationAudio();
    exam.index += 1;
    if (exam.index >= exam.list.length) return finish();
    var item = exam.list[exam.index];
    finalText = "";
    partial = "";
    els.counter.textContent = exam.index + 1 + "/" + exam.list.length;
    updateProgress(exam.index + 1, exam.list.length);
    els.tag.textContent = labels[item.theme] || "Misturado";
    els.question.textContent = item.questionEs;
    els.translation.textContent = item.questionPt;
    els.translation.classList.remove("show");
    els.toggle.disabled = false;
    els.listen.disabled = false;
    els.record.disabled = !supported();
    els.stop.disabled = true;
    els.next.disabled = true;
    els.transcript.textContent = "Sua resposta transcrita aparece aqui.";
    els.feedback.className = "feedback-content empty-state";
    els.feedback.textContent = "Responda a pergunta para receber feedback.";
    setRecording(false);
  }

  function speak() {
    var item = exam.list[exam.index];
    if (!item || !("speechSynthesis" in window)) return;
    stopVariationAudio();
    var u = new SpeechSynthesisUtterance(item.questionEs);
    var voices = speechSynthesis.getVoices();
    var voice = voices.find(function (v) {
      return /^es/.test(v.lang);
    });
    u.lang = voice ? voice.lang : "es-MX";
    if (voice) u.voice = voice;
    u.rate = 0.88;
    speechSynthesis.speak(u);
  }

  function startRec() {
    if (!supported()) {
      els.warning.textContent =
        "Seu navegador não suporta reconhecimento de voz. Tente usar o Google Chrome.";
      els.warning.classList.add("show");
      return;
    }
    var R = window.SpeechRecognition || window.webkitSpeechRecognition;
    recognition = new R();
    recognition.lang = "es-MX";
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;
    recognition.onstart = function () {
      setRecording(true);
    };
    recognition.onerror = function () {
      setRecording(false);
    };
    recognition.onend = function () {
      setRecording(false);
      if (finalText || partial) evaluate();
    };
    recognition.onresult = function (event) {
      var text = "";
      for (var i = event.resultIndex; i < event.results.length; i += 1) {
        text += event.results[i][0].transcript;
        if (event.results[i].isFinal) finalText = text;
      }
      partial = text.trim();
      els.transcript.textContent = partial || "Escutando...";
    };
    recognition.start();
  }

  function stopRec() {
    if (recognition) recognition.stop();
    evaluate();
  }

  function evaluate() {
    var item = exam.list[exam.index];
    var text = finalText || partial;
    if (!item || !text.trim()) return;
    var feedback = buildFeedback(text, item);
    var score = scoreOpenAnswer(text, item, feedback.issues);
    var result = {
      transcript: text,
      score: score,
      question: item,
      feedback: feedback,
    };
    exam.answers[exam.index] = result;
    var scoreColor = getScoreColor(score);
    var scorePercent = getScorePercent(score);
    els.feedback.className = "feedback-content";
    els.feedback.innerHTML =
      '<div class="score-card dynamic-score" style="--score-color: ' +
      scoreColor +
      "; --score-percent: " +
      scorePercent +
      '%;"><span class="score-label">Nota geral da resposta</span><strong class="score-value">' +
      formatScore(score) +
      '/10</strong><div class="score-bar" aria-hidden="true"><div class="score-bar-fill"></div></div><p class="score-meta">Avaliação geral da clareza, estrutura, naturalidade e correção da resposta.</p></div><div class="feedback-grid"><div class="feedback-block"><h3>Sua transcrição</h3><p>' +
      esc(text) +
      '</p></div><div class="feedback-block"><h3>Correção do espanhol</h3><p>' +
      esc(feedback.correction) +
      '</p></div><div class="feedback-block variation-section"><h3>5 variações possíveis para essa resposta</h3>' +
      renderVariationCards(feedback.variations) +
      '</div></div>';
    els.next.disabled = false;
  }

  function finish() {
    var answers = exam.answers.filter(Boolean);
    var avg = answers.length
      ? Math.round(
          (answers.reduce(function (s, a) {
            return s + a.score;
          }, 0) /
            answers.length) *
            10,
        ) / 10
      : 0;
    var recommendation =
      avg >= 7
        ? "Bom desempenho geral. Continue praticando naturalidade e pronúncia em respostas mais longas."
        : "Continue praticando respostas completas, com sujeito, verbo e complemento claros.";
    els.result.classList.add("show");
    els.question.textContent = "Prova finalizada.";
    els.counter.textContent = answers.length + "/" + exam.list.length;
    updateProgress(exam.list.length, exam.list.length);
    els.resultContent.className = "feedback-content";
    els.resultContent.innerHTML =
      '<div class="score-card"><span class="hint">Nota média</span><strong class="score-number">' +
      avg +
      "/10</strong><p>" +
      answers.length +
      ' perguntas respondidas.</p></div><div class="feedback-grid"><div class="feedback-block"><h3>Melhores pontos</h3><p>' +
      esc(avg >= 7 ? "Boa clareza geral, respostas compreensíveis e boa adequação ao tema." : "Você conseguiu praticar respostas reais e já tem uma base para melhorar.") +
      '</p></div><div class="feedback-block"><h3>Pontos para melhorar</h3><p>' +
      esc(recommendation) +
      "</p></div></div>";
  }

  function bind() {
    els.start.addEventListener("click", startExam);
    els.listen.addEventListener("click", speak);
    els.record.addEventListener("click", startRec);
    els.stop.addEventListener("click", stopRec);
    els.next.addEventListener("click", nextQuestion);
    els.feedback.addEventListener("click", handleFeedbackClick);
    els.toggle.addEventListener("click", function () {
      var show = els.translation.classList.toggle("show");
      els.toggle.textContent = show ? "Esconder tradução" : "Mostrar tradução";
    });
  }

  function supported() {
    return Boolean(window.SpeechRecognition || window.webkitSpeechRecognition);
  }

  function handleFeedbackClick(event) {
    var button = event.target.closest("[data-variation-index]");
    if (!button) return;
    var answer = exam.answers[exam.index];
    if (!answer || !answer.feedback || !answer.feedback.variations) return;
    var variation = normalizeVariation(answer.feedback.variations[Number(button.dataset.variationIndex)]);
    speakVariation(variation, button);
  }

  function speakVariation(variation, button) {
    if (!variation.audioText || !("speechSynthesis" in window)) return;
    stopVariationAudio();
    var card = button.closest(".variation-card");
    var duration = estimateSpeechDuration(variation.audioText);
    activeVariation = { card: card, button: button };
    var u = new SpeechSynthesisUtterance(variation.audioText);
    var voices = speechSynthesis.getVoices();
    var voice = voices.find(function (v) { return /^es/.test(v.lang); });
    u.lang = voice ? voice.lang : "es-MX";
    if (voice) u.voice = voice;
    u.rate = 0.88;
    u.onstart = function () {
      if (card) {
        card.style.setProperty("--variation-duration", duration + "s");
        card.classList.add("is-playing");
      }
      button.classList.add("is-playing");
      var icon = button.querySelector(".play-icon");
      if (icon) icon.textContent = "\u25a0";
    };
    u.onend = function () { stopVariationAudio(false); };
    u.onerror = function () { stopVariationAudio(false); };
    speechSynthesis.speak(u);
  }

  function stopVariationAudio(cancelSpeech) {
    if (cancelSpeech !== false && "speechSynthesis" in window) speechSynthesis.cancel();
    if (activeVariation) {
      if (activeVariation.card) activeVariation.card.classList.remove("is-playing");
      if (activeVariation.button) {
        activeVariation.button.classList.remove("is-playing");
        var icon = activeVariation.button.querySelector(".play-icon");
        if (icon) icon.textContent = "\u25b6";
      }
    }
    activeVariation = null;
  }

  function updateProgress(current, total) {
    var percent = total > 0 ? Math.round((current / total) * 100) : 0;
    if (els.progressBar) els.progressBar.style.width = percent + "%";
    if (els.progressText) els.progressText.textContent = percent + "%";
  }
  function setRecording(on) {
    els.status.textContent = on ? "Gravando" : "Parado";
    els.status.classList.toggle("is-recording", on);
    els.record.disabled = on || !supported();
    els.stop.disabled = !on;
  }
  function norm(t) {
    return String(t || "")
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[¿?¡!.,;:()"]/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  }
  function similarity(a, b) {
    var aw = new Set(norm(a).split(" "));
    var bw = norm(b)
      .split(" ")
      .filter(function (w) {
        return w.length > 3;
      });
    return bw.length
      ? bw.filter(function (w) {
          return aw.has(w);
        }).length / bw.length
      : 0;
  }
  function buildFeedback(text, item) {
    var normalized = norm(text);
    var issues = commonIssues().filter(function (issue) {
      return hasTerm(normalized, issue.wrong);
    });
    var corrected = applyCorrections(text, issues);
    return {
      issues: issues,
      correction: correctionText(text, issues),
      variations: variationObjects(corrected || text, item),
    };
  }
  function scoreOpenAnswer(text, item, issues) {
    var tokens = tokensOf(text, 1);
    var clarity = Math.min(1, tokens.length / 10);
    var language = spanishSignal(text);
    var structure = structureSignal(text);
    var relevance = Math.max(similarity(text, item.questionEs), similarity(text, item.sampleAnswerEs) * 0.85, 0.2);
    var grammar = Math.max(0.35, 1 - issues.length * 0.18);
    var raw = (clarity * 0.25 + language * 0.2 + structure * 0.2 + relevance * 0.25 + grammar * 0.1) * 10;
    return Math.max(0, Math.min(10, Math.round(raw * 10) / 10));
  }
  function commonIssues() {
    return [
      { wrong: "jo", correct: "yo", message: "Use 'yo', não 'jo'." },
      { wrong: "com", correct: "con", message: "O navegador entendeu 'com'. Em espanhol, use 'con'." },
      { wrong: "aprendendo", correct: "aprendiendo", message: "Em espanhol, diga 'aprendiendo'." },
      { wrong: "tempo", correct: "tiempo", message: "Em espanhol, diga 'tiempo'." },
      { wrong: "processos", correct: "procesos", message: "Em espanhol, use 'procesos'." },
      { wrong: "sistema fina", correct: "sistema financiero", message: "A expressão 'sistema fina' ficou incompleta. O mais natural é 'sistema financiero'." },
      { wrong: "quiero me comunicar", correct: "quiero comunicarme", message: "A forma mais natural é 'quiero comunicarme'." },
    ];
  }
  function hasTerm(text, term) {
    var normalizedTerm = norm(term);
    return normalizedTerm.indexOf(" ") >= 0
      ? text.indexOf(normalizedTerm) >= 0
      : tokensOf(text, 1).indexOf(normalizedTerm) >= 0;
  }
  function tokensOf(text, minLength) {
    return norm(text)
      .split(" ")
      .filter(function (word) {
        return word.length >= (minLength || 3);
      });
  }
  function spanishSignal(text) {
    var tokens = tokensOf(text, 1);
    var markers = [
      "yo", "me", "mi", "soy", "estoy", "tengo", "quiero", "puedo", "necesito",
      "para", "con", "en", "el", "la", "los", "las", "que", "porque",
      "trabajo", "reviso", "explico", "sistema", "usuario", "tecnologia",
      "financiera", "financiero", "pagos", "desarrollo", "equipo",
    ];
    var matches = tokens.filter(function (token) {
      return markers.indexOf(token) >= 0;
    }).length;
    return tokens.length ? Math.min(1, 0.45 + matches / Math.max(6, tokens.length)) : 0;
  }
  function structureSignal(text) {
    var normalized = norm(text);
    var tokens = tokensOf(text, 1);
    var hasVerb = /\b(es|soy|estoy|tengo|quiero|puedo|necesito|trabajo|reviso|explico|aprendo|mejoro|presento|analizo|confirmo|comunico|relaciono|espero)\b/.test(normalized);
    var hasConnector = /\b(para|porque|con|en|sobre|cuando|si|y|pero)\b/.test(normalized);
    if (tokens.length < 3) return 0.35;
    return Math.min(1, 0.45 + (hasVerb ? 0.3 : 0) + (hasConnector ? 0.2 : 0) + (tokens.length >= 8 ? 0.15 : 0));
  }
  function applyCorrections(text, issues) {
    return issues.reduce(function (current, issue) {
      return current.replace(new RegExp("\\b" + escapeRegExp(issue.wrong) + "\\b", "gi"), issue.correct);
    }, text || "");
  }
  function correctionText(text, issues) {
    var notes = issues.map(function (issue) {
      return issue.message;
    });
    if (looksIncomplete(text)) notes.push("A frase parece incompleta ou cortada no final. Tente terminar a ideia com um complemento claro.");
    if (tokensOf(text, 1).length < 6) notes.push("A resposta está curta. Para soar mais natural, tente formar uma frase completa com contexto.");
    return notes.length ? notes.join(" ") : "A frase está compreensível. O próximo passo é deixá-la mais natural e específica.";
  }
  function variationObjects(text, item) {
    var cleaned = String(text || "").trim();
    var direct = cleaned && !looksIncomplete(cleaned) ? punctuate(capitalize(cleaned)).replace(/^Yo trabajo\b/i, "Trabajo") : item.sampleAnswerEs;
    var ctx = contextFor(item.theme);
    var level = item.difficulty === "basico" ? "Básico" : item.difficulty === "intermediario" ? "Intermediário" : "Avançado";
    var advanced = item.difficulty === "avancado";
    var mid = item.difficulty === "intermediario";
    return uniqueVariationObjects([
      makeVariation("Corrección directa", level, direct, "Mantém sua ideia original com correção gramatical."),
      makeVariation("Mais natural", level, mid || advanced ? "Trabajo con " + ctx.area + " y también estoy aprendiendo " + ctx.skill + "." : "Trabajo en el área de " + ctx.area + ".", "Soa mais fluida e comum para um falante de espanhol."),
      makeVariation("Mais profissional", level, advanced ? "En mi experiencia, he trabajado con " + ctx.area + " resolviendo problemas, analizando errores y colaborando con equipos técnicos." : "En mi trabajo, uso " + ctx.area + " para resolver problemas y apoyar al equipo.", "Adapta a resposta para entrevistas, trabalho e tecnologia."),
      makeVariation("Mais completa", level, advanced ? "Trabajo con " + ctx.area + " y he desarrollado experiencia resolviendo problemas, analizando errores y apoyando a usuarios en situaciones reales." : "Trabajo con " + ctx.area + " y estoy aprendiendo " + ctx.skill + " para mejorar mi perfil profesional.", "Expande a resposta com mais contexto para prática oral."),
      makeVariation("Mais avançada", level, advanced ? "Mi experiencia en " + ctx.area + " me ha permitido combinar análisis técnico, comunicación con usuarios y aprendizaje continuo en " + ctx.skill + "." : "Además de trabajar con " + ctx.area + ", quiero comunicar mejor mis ideas en un ambiente profesional.", "Usa uma estrutura mais sofisticada para o seu nível."),
    ]);
  }

  function makeVariation(type, level, text, explanation) {
    var audioText = punctuate(text);
    return { type: type, level: level, text: audioText, explanation: explanation, audioText: audioText };
  }

  function contextFor(theme) {
    var contexts = {
      entrevista: { area: "tecnología", skill: "entrevistas técnicas" },
      desenvolvimento: { area: "desarrollo web", skill: "JavaScript, APIs y proyectos prácticos" },
      financeiro: { area: "sistemas financieros", skill: "pagos, transacciones y análisis de errores" },
      fintech: { area: "tecnología financiera", skill: "pagos digitales y productos fintech" },
      reuniao: { area: "reuniones profesionales", skill: "comunicación clara con equipos" },
      comunicacao: { area: "comunicación profesional", skill: "explicación de ideas técnicas" },
    };
    return contexts[theme] || { area: "tecnología", skill: "desarrollo profesional" };
  }

  function uniqueVariationObjects(items) {
    var unique = [];
    items.forEach(function (item) {
      if (unique.some(function (previous) { return variationSimilarity(previous.text, item.text) > 0.8; })) {
        item.text = "En un contexto profesional, " + lowercase(item.text);
        item.audioText = item.text;
      }
      unique.push(item);
    });
    return unique;
  }

  function variationSimilarity(a, b) {
    var aw = tokensOf(a, 1);
    var bw = tokensOf(b, 1);
    var shared = aw.filter(function (word) { return bw.indexOf(word) >= 0; }).length;
    return Math.min(aw.length, bw.length) ? shared / Math.min(aw.length, bw.length) : 0;
  }

  function answerVariations(text, item) {
    var cleaned = String(text || "").trim();
    var base = cleaned && !looksIncomplete(cleaned) ? punctuate(capitalize(cleaned)) : item.sampleAnswerEs;
    return [
      base,
      "También puedes decir: " + item.sampleAnswerEs,
      "En una entrevista, diría: " + lowercase(item.sampleAnswerEs),
      "Una respuesta más breve sería: " + item.sampleAnswerEs,
      "Una versión más profesional sería: " + item.sampleAnswerEs,
    ];
  }
  function looksIncomplete(text) {
    var tokens = tokensOf(text, 1);
    var last = tokens[tokens.length - 1] || "";
    return Boolean(last && last.length <= 3 && tokens.length >= 4);
  }
  function capitalize(text) {
    return text.charAt(0).toUpperCase() + text.slice(1);
  }
  function lowercase(text) {
    return text.charAt(0).toLowerCase() + text.slice(1);
  }
  function punctuate(text) {
    return /[.!?]$/.test(text) ? text : text + ".";
  }
  function escapeRegExp(text) {
    return String(text).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  }
  function shuffle(a) {
    return a.slice().sort(function () {
      return Math.random() - 0.5;
    });
  }
  function esc(v) {
    return String(v)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }
  function getScoreColor(score) {
    var normalized = Math.max(0, Math.min(10, Number(score) || 0)) / 10;
    var hue = Math.round(normalized * 120);
    return "hsl(" + hue + ", 75%, 60%)";
  }
  function getScorePercent(score) {
    return Math.round(Math.max(0, Math.min(10, Number(score) || 0)) * 10);
  }
  function formatScore(score) {
    return Number.isInteger(score) ? score : Number(score).toFixed(1);
  }

  function renderVariationCards(variations) {
    if (!variations || !variations.length) return "<p>Nenhuma variação disponível.</p>";
    return '<div class="variation-list">' + variations.map(renderVariationCard).join("") + "</div>";
  }

  function renderVariationCard(variation, index) {
    var item = normalizeVariation(variation);
    var duration = estimateSpeechDuration(item.audioText);
    var bars = "";
    for (var i = 0; i < 14; i += 1) {
      bars += '<span class="wave-bar" style="--bar-index: ' + i + ';"></span>';
    }
    return '<article class="variation-card" style="--variation-duration: ' + duration + 's;"><div class="variation-header"><span class="variation-type">' +
      esc(item.type) +
      '</span><span class="variation-level">' +
      esc(item.level) +
      '</span></div><p class="variation-text">' +
      esc(item.text) +
      '</p><p class="variation-explanation">' +
      esc(item.explanation) +
      '</p><div class="variation-audio-row"><button class="variation-play-btn" type="button" data-variation-index="' +
      index +
      '" aria-label="Ouvir variação ' +
      (index + 1) +
      '"><span class="play-icon">\u25b6</span></button><div class="variation-waveform" aria-hidden="true">' +
      bars +
      '</div><span class="variation-duration">' +
      formatDuration(duration) +
      "</span></div></article>";
  }

  function normalizeVariation(variation) {
    if (typeof variation === "string") {
      return {
        type: "Variação",
        level: "Treino",
        text: variation,
        explanation: "Frase alternativa para repetir em voz alta.",
        audioText: variation,
      };
    }
    return {
      type: variation.type || "Variação",
      level: variation.level || "Treino",
      text: variation.text || "",
      explanation: variation.explanation || "Frase alternativa para repetir em voz alta.",
      audioText: variation.audioText || variation.text || "",
    };
  }

  function estimateSpeechDuration(text) {
    var words = String(text || "").trim().split(/\s+/).filter(Boolean).length;
    return Math.max(2, Math.round((words / 2.5) * 10) / 10);
  }

  function formatDuration(seconds) {
    return "0:" + String(Math.max(1, Math.round(seconds))).padStart(2, "0");
  }

  function renderVariations(variations) {
    if (!variations || !variations.length) return "<p>Nenhuma variação disponível.</p>";
    return '<ol class="variation-list">' + variations.map(function (variation) {
      return "<li>" + esc(variation) + "</li>";
    }).join("") + "</ol>";
  }

  initEls();
  bind();
  if (!supported()) {
    els.warning.textContent =
      "Seu navegador não suporta reconhecimento de voz. Tente usar o Google Chrome.";
    els.warning.classList.add("show");
  }
})();
