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
  const keywordScore = calculateKeywordScore(userTranscript, question.expectedKeywords);
  const similarityScore = calculateSimilarityScore(userTranscript, question.sampleAnswerEs);
  const lengthScore = normalizeText(userTranscript).split(" ").filter(Boolean).length >= 4 ? 1 : 0.45;
  const rawScore = (keywordScore * 0.5 + similarityScore * 0.35 + lengthScore * 0.15) * 10;
  const feedback = generateFeedback(userTranscript, question, keywordScore, similarityScore);
  const result = {
    question,
    transcript: userTranscript,
    score: Math.max(0, Math.min(10, Math.round(rawScore * 10) / 10)),
    keywordScore,
    similarityScore,
    ...feedback
  };

  examState.answers[examState.currentIndex] = result;
  return result;
}

export function calculateKeywordScore(userTranscript, expectedKeywords) {
  if (!expectedKeywords.length) {
    return 1;
  }

  const normalized = normalizeText(userTranscript);
  const found = expectedKeywords.filter((keyword) => normalized.includes(normalizeText(keyword)));
  return found.length / expectedKeywords.length;
}

export function calculateSimilarityScore(userTranscript, sampleAnswerEs) {
  const userWords = new Set(normalizeText(userTranscript).split(" ").filter(Boolean));
  const sampleWords = normalizeText(sampleAnswerEs).split(" ").filter((word) => word.length > 3);

  if (!sampleWords.length) {
    return 0;
  }

  const matches = sampleWords.filter((word) => userWords.has(word));
  return matches.length / sampleWords.length;
}

export function detectMissingKeywords(userTranscript, expectedKeywords) {
  const normalized = normalizeText(userTranscript);
  return expectedKeywords.filter((keyword) => !normalized.includes(normalizeText(keyword)));
}

export function generateFeedback(userTranscript, question, keywordScore = calculateKeywordScore(userTranscript, question.expectedKeywords), similarityScore = calculateSimilarityScore(userTranscript, question.sampleAnswerEs)) {
  const normalized = normalizeText(userTranscript);
  const missingKeywords = detectMissingKeywords(userTranscript, question.expectedKeywords);
  const foundKeywords = question.expectedKeywords.filter((keyword) => !missingKeywords.includes(keyword));
  const grammarIssues = commonErrors.filter((error) => normalized.includes(normalizeText(error.wrong)));
  const correctedText = applySimpleCorrections(userTranscript, grammarIssues);
  const pronunciationNotes = missingKeywords.map((keyword) => `Talvez a pronúncia de '${keyword}' não tenha ficado clara, porque essa palavra era esperada, mas não apareceu na transcrição.`);
  const strengths = [];
  const improvements = [];

  if (keywordScore >= 0.65) strengths.push("Você usou boa parte do vocabulário esperado.");
  if (similarityScore >= 0.35) strengths.push("Sua resposta ficou relacionada ao modelo esperado.");
  if (normalizeText(userTranscript).split(" ").length >= 8) strengths.push("Você tentou construir uma resposta completa.");
  if (!strengths.length) strengths.push("Você respondeu em espanhol e já tem material para revisar.");

  if (missingKeywords.length) improvements.push(`Inclua palavras importantes: ${missingKeywords.join(", ")}.`);
  if (grammarIssues.length) improvements.push(...grammarIssues.map((issue) => issue.message));
  if (similarityScore < 0.25) improvements.push("Tente responder mais diretamente ao tema da pergunta.");

  return {
    correctedText,
    foundKeywords,
    missingKeywords,
    grammarIssues,
    pronunciationNotes,
    strengths,
    improvements,
    naturalAnswer: question.sampleAnswerEs,
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
  const missingCounts = {};

  answers.forEach((answer) => {
    answer.missingKeywords.forEach((keyword) => {
      missingCounts[keyword] = (missingCounts[keyword] || 0) + 1;
    });
  });

  const topMissing = Object.entries(missingCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([keyword]) => keyword);

  return {
    average: Math.round(average * 10) / 10,
    answered: answers.length,
    total: examState.questions.length,
    topMissing,
    recommendation: topMissing.length
      ? `Você precisa treinar mais: ${topMissing.join(", ")}.`
      : "Continue praticando respostas mais completas em espanhol."
  };
}

function applySimpleCorrections(text, issues) {
  let corrected = text || "";

  issues.forEach((issue) => {
    corrected = corrected.replace(new RegExp(issue.wrong, "gi"), issue.correct);
  });

  return corrected ? capitalizeFirst(corrected.trim()) : "";
}

function capitalizeFirst(text) {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

function shuffle(array) {
  return [...array].sort(() => Math.random() - 0.5);
}
