const STORAGE_KEYS = {
  preferences: "spanishTrainerPreferences",
  history: "spanishTrainerHistory"
};

export function savePreferences(preferences) {
  localStorage.setItem(STORAGE_KEYS.preferences, JSON.stringify(preferences));
}

export function loadPreferences() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.preferences)) || {};
  } catch (error) {
    return {};
  }
}

export function saveTrainingHistory(entry) {
  const history = loadTrainingHistory();
  localStorage.setItem(STORAGE_KEYS.history, JSON.stringify([entry, ...history].slice(0, 5)));
}

export function loadTrainingHistory() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.history)) || [];
  } catch (error) {
    return [];
  }
}
