import { phraseBank, templateParts } from "../data/templates.js";
import { getRandomItem, shuffleArray } from "../utils/helpers.js";

export function getAllTemplateItems() {
  return Object.values(phraseBank).flat();
}

export function getThemePool(theme, difficulty) {
  const difficultyPool = phraseBank[difficulty] || phraseBank.basico;
  const allItems = getAllTemplateItems();

  if (theme === "misturado") {
    return [...difficultyPool, ...allItems];
  }

  if (theme === "general") {
    return [...difficultyPool.filter((item) => item.theme === "general"), ...phraseBank.basico.filter((item) => item.theme === "general")];
  }

  const themedItems = allItems.filter((item) => item.theme === theme);
  const difficultyThemedItems = difficultyPool.filter((item) => item.theme === theme);
  return [...difficultyThemedItems, ...themedItems];
}

export function generatePhraseByDifficulty(difficulty) {
  return getRandomItem(phraseBank[difficulty] || phraseBank.basico);
}

export function generatePhraseByTheme(theme, difficulty) {
  const pool = getThemePool(theme, difficulty);
  return pool.length ? getRandomItem(pool) : generatePhraseByDifficulty(difficulty);
}

export function generateTemplateCombination() {
  const subject = getRandomItem(templateParts.subjects);
  const object = getRandomItem(templateParts.objects);
  const ending = getRandomItem(templateParts.endings);

  return {
    es: `${subject[0]} ${object[0]} ${ending[0]}`,
    pt: `${subject[1]} ${object[1]} ${ending[1]}`,
    theme: object[2]
  };
}

export function getQuestionPool(theme) {
  if (theme === "misturado" || theme === "entrevista") {
    return phraseBank.entrevista;
  }

  const themedQuestions = phraseBank.entrevista.filter((item) => item.theme === theme);
  return [...themedQuestions, ...phraseBank.entrevista];
}

export function generateInterviewQuestion(theme) {
  return getRandomItem(getQuestionPool(theme));
}

export function generateGapExercise(item) {
  const words = item.es.split(" ");
  const candidateIndex = words.findIndex((word) => word.replace(/[¿?.,]/g, "").length >= 6);
  const gapIndex = candidateIndex >= 0 ? candidateIndex : Math.max(0, Math.floor(words.length / 2));
  const answer = words[gapIndex].replace(/[¿?.,]/g, "");
  const promptWords = [...words];
  promptWords[gapIndex] = "_____";

  return {
    ...item,
    prompt: promptWords.join(" "),
    answer
  };
}

export function avoidDuplicates(items, targetCount, factory) {
  const result = [];
  const used = new Set();
  let attempts = 0;

  while (result.length < targetCount && attempts < targetCount * 20) {
    const item = factory();
    const key = item.es.toLowerCase();

    if (!used.has(key)) {
      result.push(item);
      used.add(key);
    }

    attempts += 1;
  }

  for (const item of shuffleArray(items)) {
    if (result.length >= targetCount) {
      break;
    }

    const key = item.es.toLowerCase();
    if (!used.has(key)) {
      result.push(item);
      used.add(key);
    }
  }

  return result;
}

export function generateTraining(config) {
  const { difficulty, theme, mode, count } = config;
  const basePool = getThemePool(theme, difficulty);
  const duplicatePool = mode === "interview" || mode === "question" ? getQuestionPool(theme) : basePool;

  const factory = () => {
    if (mode === "interview" || mode === "question") {
      return generateInterviewQuestion(theme);
    }

    if (Math.random() < 0.24) {
      return generateTemplateCombination();
    }

    return generatePhraseByTheme(theme, difficulty);
  };

  return avoidDuplicates(duplicatePool, Number(count), factory).map((item, index) => {
    const exercise = mode === "gap" ? generateGapExercise(item) : item;

    return {
      id: `${Date.now()}-${index}-${Math.random().toString(16).slice(2)}`,
      es: exercise.es,
      pt: exercise.pt,
      prompt: exercise.prompt || exercise.es,
      answer: exercise.answer || exercise.es,
      theme: exercise.theme || theme,
      mode
    };
  });
}
