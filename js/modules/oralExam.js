import { examQuestions } from "../data/examQuestions.js";
import { normalizeText } from "./speechRecognition.js";

let examState = {
  questions: [],
  currentIndex: -1,
  answers: [],
  config: null
};

const commonErrors = [
  { wrong: "jo", correct: "yo", message: "Use 'yo', não 'jo'." },
  { wrong: "com", correct: "con", message: "O navegador entendeu 'com'. Em espanhol, use 'con'." },
  { wrong: "tecnologia", correct: "tecnología", message: "Treine a palavra 'tecnología' com tonicidade clara." },
  { wrong: "espanol", correct: "español", message: "Use 'español', com som de ñ." },
  { wrong: "aprendendo", correct: "aprendiendo", message: "Em espanhol, diga 'aprendiendo'." },
  { wrong: "suporte", correct: "soporte", message: "Em espanhol, a palavra é 'soporte'." },
  { wrong: "tempo", correct: "tiempo", message: "Em espanhol, diga 'tiempo'." },
  { wrong: "muitos", correct: "muchos", message: "Em espanhol, use 'muchos'." },
  { wrong: "processos", correct: "procesos", message: "Em espanhol, use 'procesos'." },
  { wrong: "sistema fina", correct: "sistema financiero", message: "A expressão 'sistema fina' ficou incompleta. O mais natural é 'sistema financiero'." },
  { wrong: "quiero me comunicar", correct: "quiero comunicarme", message: "A forma mais natural é 'quiero comunicarme'." }
];

export function startExam(config) {
  const filtered = examQuestions.filter((question) => {
    const difficultyMatch = question.difficulty === config.difficulty;
    const themeMatch = config.theme === "misturado" || question.theme === config.theme;
    return difficultyMatch && themeMatch;
  });
  const fallback = examQuestions.filter((question) => question.difficulty === config.difficulty);
  const source = filtered.length ? filtered : fallback;

  examState = {
    questions: shuffle(source).slice(0, Number(config.count)),
    currentIndex: -1,
    answers: [],
    config
  };

  return getNextQuestion();
}

export function getNextQuestion() {
  examState.currentIndex += 1;
  return getCurrentQuestion();
}

export function getCurrentQuestion() {
  return examState.questions[examState.currentIndex] || null;
}

export function getExamState() {
  return examState;
}

export function evaluateAnswer(userTranscript, question) {
  const feedback = generateFeedback(userTranscript, question);
  const scoreParts = calculateOpenAnswerScore(userTranscript, question, feedback.grammarIssues);
  const rawScore = (
    scoreParts.clarity * 0.25
    + scoreParts.language * 0.2
    + scoreParts.structure * 0.2
    + scoreParts.relevance * 0.25
    + scoreParts.grammar * 0.1
  ) * 10;
  const result = {
    question,
    transcript: userTranscript,
    score: Math.max(0, Math.min(10, Math.round(rawScore * 10) / 10)),
    scoreParts,
    ...feedback
  };

  examState.answers[examState.currentIndex] = result;
  return result;
}

export function calculateSimilarityScore(userTranscript, sampleAnswerEs) {
  const userWords = new Set(getMeaningfulTokens(userTranscript));
  const sampleWords = getMeaningfulTokens(sampleAnswerEs);

  if (!sampleWords.length) {
    return 0;
  }

  const sampleSet = new Set(sampleWords);
  const matches = sampleWords.filter((word) => userWords.has(word)).length;
  const denominator = userWords.size + sampleSet.size;
  return denominator ? (2 * matches) / denominator : 0;
}

export function generateFeedback(userTranscript, question) {
  const normalized = normalizeText(userTranscript);
  const grammarIssues = commonErrors.filter((error) => containsNormalizedTerm(normalized, error.wrong));
  const correctedText = applySimpleCorrections(userTranscript, grammarIssues);

  return {
    correctedText,
    correctionNotes: buildCorrectionNotes(userTranscript, grammarIssues),
    grammarIssues,
    answerVariations: buildAnswerVariations(correctedText || userTranscript, question),
    tips: question.tips
  };
}

export function finishExam() {
  return {
    ...calculateFinalScore(),
    answers: examState.answers.filter(Boolean),
    config: examState.config
  };
}

export function calculateFinalScore() {
  const answers = examState.answers.filter(Boolean);
  const average = answers.length
    ? answers.reduce((sum, answer) => sum + answer.score, 0) / answers.length
    : 0;
  const lowScores = answers.filter((answer) => answer.score < 7).length;

  return {
    average: Math.round(average * 10) / 10,
    answered: answers.length,
    total: examState.questions.length,
    recommendation: lowScores
      ? "Continue praticando respostas completas, com sujeito, verbo e complemento claros."
      : "Bom desempenho geral. Continue praticando naturalidade e pronúncia em respostas mais longas."
  };
}

function calculateOpenAnswerScore(userTranscript, question, grammarIssues) {
  const tokens = getMeaningfulTokens(userTranscript, 1);
  const meaningfulTokens = getMeaningfulTokens(userTranscript);
  const clarity = Math.min(1, tokens.length / 10);
  const language = calculateSpanishSignal(userTranscript);
  const structure = calculateStructureScore(userTranscript);
  const relevance = Math.max(
    calculateSimilarityScore(userTranscript, question.questionEs),
    calculateSimilarityScore(userTranscript, question.sampleAnswerEs) * 0.85
  );
  const grammar = Math.max(0.35, 1 - grammarIssues.length * 0.18);

  return {
    clarity: tokens.length >= 4 ? clarity : Math.min(clarity, 0.55),
    language: meaningfulTokens.length ? language : 0,
    structure,
    relevance: Math.max(0.2, relevance),
    grammar
  };
}

function calculateSpanishSignal(text) {
  const tokens = getMeaningfulTokens(text, 1);

  if (!tokens.length) {
    return 0;
  }

  const spanishMarkers = new Set([
    "yo", "me", "mi", "mis", "soy", "estoy", "tengo", "quiero", "puedo", "necesito",
    "para", "con", "en", "el", "la", "los", "las", "una", "un", "que", "porque",
    "reviso", "trabajo", "aprendo", "explico", "sistema", "usuario", "tecnologia",
    "financiera", "financiero", "pagos", "soporte", "equipo"
  ]);
  const matches = tokens.filter((token) => spanishMarkers.has(token)).length;

  return Math.min(1, 0.45 + matches / Math.max(6, tokens.length));
}

function calculateStructureScore(text) {
  const tokens = getMeaningfulTokens(text, 1);
  const normalized = normalizeText(text);
  const hasVerb = /\b(es|soy|estoy|tengo|quiero|puedo|necesito|trabajo|reviso|explico|aprendo|mejoro|presento|analizo|confirmo|comunico|relaciono|espero)\b/.test(normalized);
  const hasConnector = /\b(para|porque|con|en|sobre|cuando|si|y|pero)\b/.test(normalized);

  if (tokens.length < 3) {
    return 0.35;
  }

  return Math.min(1, 0.45 + (hasVerb ? 0.3 : 0) + (hasConnector ? 0.2 : 0) + (tokens.length >= 8 ? 0.15 : 0));
}

function buildCorrectionNotes(userTranscript, grammarIssues) {
  const notes = [];

  if (grammarIssues.length) {
    notes.push(...grammarIssues.map((issue) => issue.message));
  }

  if (looksIncomplete(userTranscript)) {
    notes.push("A frase parece incompleta ou cortada no final. Tente terminar a ideia com um complemento claro.");
  }

  if (getMeaningfulTokens(userTranscript, 1).length < 6) {
    notes.push("A resposta está curta. Para soar mais natural, tente formar uma frase completa com contexto.");
  }

  if (!notes.length) {
    notes.push("A frase está compreensível. O próximo passo é deixá-la mais natural e específica.");
  }

  return notes;
}

function buildAnswerVariations(text, question) {
  const cleaned = text.trim();
  const baseAnswer = question.sampleAnswerEs;

  const base = cleaned && !looksIncomplete(cleaned)
    ? ensureSpanishPunctuation(capitalizeFirst(cleaned))
    : baseAnswer;

  const variations = [
    base,
    `También puedes decir: ${baseAnswer}`,
    `En una entrevista, diría: ${lowercaseFirst(baseAnswer)}`,
    `Una respuesta más breve sería: ${baseAnswer}`,
    `Una versión más profesional sería: ${baseAnswer}`
  ];

  return variations;
}

function applySimpleCorrections(text, issues) {
  let corrected = text || "";

  issues.forEach((issue) => {
    corrected = corrected.replace(new RegExp(`\\b${escapeRegExp(issue.wrong)}\\b`, "gi"), issue.correct);
  });

  return corrected ? capitalizeFirst(corrected.trim()) : "";
}

function capitalizeFirst(text) {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

function lowercaseFirst(text) {
  return text.charAt(0).toLowerCase() + text.slice(1);
}

function shuffle(array) {
  const copy = [...array];

  for (let index = copy.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1));
    [copy[index], copy[randomIndex]] = [copy[randomIndex], copy[index]];
  }

  return copy;
}

function containsNormalizedTerm(text, term) {
  const normalizedText = normalizeText(text);
  const normalizedTerm = normalizeText(term);

  if (!normalizedTerm) {
    return false;
  }

  if (normalizedTerm.includes(" ")) {
    return normalizedText.includes(normalizedTerm);
  }

  return getMeaningfulTokens(normalizedText, 1).includes(normalizedTerm);
}

function getMeaningfulTokens(text, minLength = 3) {
  return normalizeText(text)
    .split(" ")
    .filter((word) => word.length >= minLength);
}

function looksIncomplete(text) {
  const tokens = normalizeText(text).split(" ").filter(Boolean);
  const lastToken = tokens.at(-1) || "";
  return Boolean(lastToken && lastToken.length <= 3 && tokens.length >= 4);
}

function ensureSpanishPunctuation(text) {
  return /[.!?]$/.test(text) ? text : `${text}.`;
}

function escapeRegExp(text) {
  return String(text).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
