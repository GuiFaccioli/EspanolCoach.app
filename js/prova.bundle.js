(function () {
  "use strict";

  if (window.__spanishOralExamModuleLoaded) return;

  var questions = [
    q("b1", "basico", "entrevista", "¿Cómo te llamas?", "Como você se chama?", ["me", "llamo", "soy"], "Me llamo Gabriel y soy brasileño."),
    q("b2", "basico", "suporte", "¿Tienes experiencia con soporte técnico?", "Você tem experiência com suporte técnico?", ["tengo", "experiencia", "soporte"], "Tengo experiencia con soporte técnico y atención a usuarios."),
    q("b3", "basico", "desenvolvimento", "¿Qué tecnologías estás aprendiendo?", "Quais tecnologias você está aprendendo?", ["html", "css", "javascript"], "Estoy aprendiendo HTML, CSS y JavaScript."),
    q("b4", "basico", "financeiro", "¿Qué es una transacción?", "O que é uma transação?", ["transacción", "pago", "sistema"], "Una transacción es una operación de pago en el sistema."),
    q("b5", "basico", "fiserv", "¿Qué sabes sobre Fiserv?", "O que você sabe sobre a Fiserv?", ["fiserv", "tecnología", "financiera"], "Fiserv es una empresa de tecnología financiera."),
    q("i1", "intermediario", "entrevista", "Cuéntame sobre tu experiencia con tecnología.", "Conte-me sobre sua experiência com tecnologia.", ["experiencia", "tecnología", "soporte"], "Tengo experiencia con soporte técnico, usuarios y sistemas."),
    q("i2", "intermediario", "suporte", "¿Cómo explicas un problema técnico a un usuario?", "Como você explica um problema técnico a um usuário?", ["explico", "problema", "usuario"], "Explico el problema con claridad y uso palabras simples."),
    q("i3", "intermediario", "desenvolvimento", "¿Qué haces si una API devuelve un error?", "O que você faz se uma API retorna um erro?", ["api", "error", "respuesta"], "Reviso la solicitud, la respuesta y los registros del sistema."),
    q("i4", "intermediario", "financeiro", "¿Cómo revisarías una transacción rechazada?", "Como você revisaria uma transação recusada?", ["revisaría", "transacción", "datos"], "Revisaría los datos, el estado del pago y el mensaje del sistema."),
    q("i5", "intermediario", "fiserv", "¿Qué esperas aprender en una fintech?", "O que você espera aprender em uma fintech?", ["aprender", "pagos", "tecnología"], "Espero aprender sobre pagos, tarjetas y tecnología financiera."),
    q("a1", "avancado", "financeiro", "¿Cómo resolverías un problema en una transacción fallida?", "Como você resolveria um problema em uma transação com falha?", ["resolvería", "transacción", "datos", "sistema"], "Analizaría los datos, revisaría los registros del sistema y comunicaría el impacto."),
    q("a2", "avancado", "desenvolvimento", "¿Cómo comunicarías un error técnico a un equipo de desarrollo?", "Como você comunicaria um erro técnico a uma equipe de desenvolvimento?", ["comunicaría", "error", "equipo"], "Comunicaría el error con evidencias, pasos para reproducirlo y prioridad."),
    q("a3", "avancado", "fiserv", "¿Por qué te interesa el sector financiero y empresas como Fiserv?", "Por que você se interessa pelo setor financeiro e empresas como a Fiserv?", ["interesa", "sector", "fiserv", "pagos"], "Me interesa porque combina tecnología, pagos, seguridad e impacto real."),
    q("a4", "avancado", "suporte", "¿Cómo transformarías tu experiencia en soporte técnico en valor para un equipo de tecnología?", "Como você transformaria sua experiência em suporte técnico em valor para uma equipe de tecnologia?", ["soporte", "valor", "usuarios"], "Aportaría valor entendiendo usuarios, documentando problemas y colaborando con desarrollo."),
    q("a5", "avancado", "reuniao", "¿Cómo presentarías riesgos técnicos en una reunión ejecutiva?", "Como você apresentaria riscos técnicos em uma reunião executiva?", ["riesgos", "impacto", "acciones"], "Presentaría los riesgos, el impacto para el negocio y las acciones recomendadas.")
  ];
  var labels = { entrevista: "Entrevista", suporte: "Suporte técnico", desenvolvimento: "Desenvolvimento web", financeiro: "Sistema financeiro", fiserv: "Fintech / Fiserv", reuniao: "Reunião", comunicacao: "Comunicação profissional", misturado: "Misturado" };
  var els = {};
  var exam = { list: [], index: -1, answers: [] };
  var recognition = null;
  var partial = "";
  var finalText = "";

  function q(id, difficulty, theme, questionEs, questionPt, expectedKeywords, sampleAnswerEs) {
    return { id: id, difficulty: difficulty, theme: theme, questionEs: questionEs, questionPt: questionPt, expectedKeywords: expectedKeywords, sampleAnswerEs: sampleAnswerEs };
  }

  function $(id) { return document.getElementById(id); }
  function initEls() {
    els = {
      difficulty: $("examDifficulty"), theme: $("examTheme"), count: $("examCount"),
      start: $("startExamButton"), counter: $("questionCounter"), tag: $("questionTheme"),
      question: $("questionText"), translation: $("translationBox"), toggle: $("toggleTranslationButton"),
      listen: $("listenQuestionButton"), record: $("recordButton"), stop: $("stopRecordButton"),
      status: $("recordingStatus"), transcript: $("transcriptText"), feedback: $("feedbackContent"),
      next: $("nextQuestionButton"), result: $("resultArea"), resultContent: $("resultContent"), warning: $("supportWarning"),
      progressBar: $("examProgressBar"), progressText: $("examProgressText")
    };
  }

  function startExam() {
    var pool = questions.filter(function (x) { return x.difficulty === els.difficulty.value && (els.theme.value === "misturado" || x.theme === els.theme.value); });
    if (!pool.length) pool = questions.filter(function (x) { return x.difficulty === els.difficulty.value; });
    exam = { list: shuffle(pool).slice(0, Number(els.count.value)), index: -1, answers: [] };
    updateProgress(0, 0);
    nextQuestion();
  }

  function nextQuestion() {
    exam.index += 1;
    if (exam.index >= exam.list.length) return finish();
    var item = exam.list[exam.index];
    finalText = ""; partial = "";
    els.counter.textContent = (exam.index + 1) + "/" + exam.list.length;
    updateProgress(exam.index + 1, exam.list.length);
    els.tag.textContent = labels[item.theme] || "Misturado";
    els.question.textContent = item.questionEs;
    els.translation.textContent = item.questionPt;
    els.translation.classList.remove("show");
    els.toggle.disabled = false; els.listen.disabled = false; els.record.disabled = !supported(); els.stop.disabled = true; els.next.disabled = true;
    els.transcript.textContent = "Sua resposta transcrita aparece aqui.";
    els.feedback.className = "feedback-content empty-state";
    els.feedback.textContent = "Responda a pergunta para receber feedback.";
    setRecording(false);
  }

  function speak() {
    var item = exam.list[exam.index];
    if (!item || !("speechSynthesis" in window)) return;
    speechSynthesis.cancel();
    var u = new SpeechSynthesisUtterance(item.questionEs);
    var voices = speechSynthesis.getVoices();
    var voice = voices.find(function (v) { return /^es/.test(v.lang); });
    u.lang = voice ? voice.lang : "es-MX";
    if (voice) u.voice = voice;
    u.rate = 0.88;
    speechSynthesis.speak(u);
  }

  function startRec() {
    if (!supported()) {
      els.warning.textContent = "Seu navegador não suporta reconhecimento de voz. Tente usar o Google Chrome.";
      els.warning.classList.add("show");
      return;
    }
    var R = window.SpeechRecognition || window.webkitSpeechRecognition;
    recognition = new R();
    recognition.lang = "es-MX";
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;
    recognition.onstart = function () { setRecording(true); };
    recognition.onerror = function () { setRecording(false); };
    recognition.onend = function () { setRecording(false); if (finalText || partial) evaluate(); };
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
    var found = item.expectedKeywords.filter(function (k) { return norm(text).includes(norm(k)); });
    var missing = item.expectedKeywords.filter(function (k) { return !norm(text).includes(norm(k)); });
    var score = Math.round((found.length / item.expectedKeywords.length * 7 + similarity(text, item.sampleAnswerEs) * 3) * 10) / 10;
    var result = { transcript: text, score: score, found: found, missing: missing, question: item };
    exam.answers[exam.index] = result;
    els.feedback.className = "feedback-content";
    els.feedback.innerHTML = '<div class="score-card"><span class="hint">Nota da pergunta</span><strong class="score-number">' + score + '/10</strong></div><div class="feedback-grid"><div class="feedback-block"><h3>Sua transcrição</h3><p>' + esc(text) + '</p></div><div class="feedback-block"><h3>Correção</h3><p>' + esc(corrections(text, missing)) + '</p></div><div class="feedback-block"><h3>Resposta mais natural</h3><p>' + esc(item.sampleAnswerEs) + '</p></div><div class="feedback-block"><h3>Pronúncia provável</h3><p>' + esc(missing.length ? "Treine: " + missing.join(", ") + "." : "As palavras principais foram reconhecidas.") + '</p></div></div><div class="feedback-block"><h3>Vocabulário esperado encontrado</h3><p>' + esc(found.join(", ") || "Nenhum.") + '</p></div><div class="feedback-block"><h3>Palavras importantes que faltaram</h3><p>' + esc(missing.join(", ") || "Nenhuma.") + '</p></div>';
    els.next.disabled = false;
  }

  function finish() {
    var answers = exam.answers.filter(Boolean);
    var avg = answers.length ? Math.round((answers.reduce(function (s, a) { return s + a.score; }, 0) / answers.length) * 10) / 10 : 0;
    var missing = [];
    answers.forEach(function (a) { missing = missing.concat(a.missing); });
    els.result.classList.add("show");
    els.question.textContent = "Prova finalizada.";
    els.counter.textContent = answers.length + "/" + exam.list.length;
    updateProgress(exam.list.length, exam.list.length);
    els.resultContent.className = "feedback-content";
    els.resultContent.innerHTML = '<div class="score-card"><span class="hint">Nota média</span><strong class="score-number">' + avg + '/10</strong><p>' + answers.length + ' perguntas respondidas.</p></div><div class="feedback-block"><h3>Pontos para melhorar</h3><p>Você precisa treinar mais: ' + esc(unique(missing).join(", ") || "respostas mais completas") + '.</p></div>';
  }

  function bind() {
    els.start.addEventListener("click", startExam);
    els.listen.addEventListener("click", speak);
    els.record.addEventListener("click", startRec);
    els.stop.addEventListener("click", stopRec);
    els.next.addEventListener("click", nextQuestion);
    els.toggle.addEventListener("click", function () {
      var show = els.translation.classList.toggle("show");
      els.toggle.textContent = show ? "Esconder tradução" : "Mostrar tradução";
    });
  }

  function supported() { return Boolean(window.SpeechRecognition || window.webkitSpeechRecognition); }
  function updateProgress(current, total) { var percent = total > 0 ? Math.round((current / total) * 100) : 0; if (els.progressBar) els.progressBar.style.width = percent + "%"; if (els.progressText) els.progressText.textContent = percent + "%"; }
  function setRecording(on) { els.status.textContent = on ? "Gravando" : "Parado"; els.status.classList.toggle("is-recording", on); els.record.disabled = on || !supported(); els.stop.disabled = !on; }
  function norm(t) { return String(t || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[¿?¡!.,;:()"]/g, " ").replace(/\s+/g, " ").trim(); }
  function similarity(a, b) { var aw = new Set(norm(a).split(" ")); var bw = norm(b).split(" ").filter(function (w) { return w.length > 3; }); return bw.length ? bw.filter(function (w) { return aw.has(w); }).length / bw.length : 0; }
  function corrections(text, missing) { return (text || "").replace(/\bcom\b/gi, "con").replace(/\bjo\b/gi, "yo").replace(/\bsuporte\b/gi, "soporte") + (missing.length ? " | Inclua: " + missing.join(", ") : ""); }
  function shuffle(a) { return a.slice().sort(function () { return Math.random() - 0.5; }); }
  function unique(a) { return Array.from(new Set(a)); }
  function esc(v) { return String(v).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&#039;"); }

  initEls();
  bind();
  if (!supported()) {
    els.warning.textContent = "Seu navegador não suporta reconhecimento de voz. Tente usar o Google Chrome.";
    els.warning.classList.add("show");
  }
})();
