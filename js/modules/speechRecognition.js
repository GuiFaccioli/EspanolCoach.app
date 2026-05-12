let recognition = null;
let finalTranscript = "";

export function isSpeechRecognitionSupported() {
  return Boolean(window.SpeechRecognition || window.webkitSpeechRecognition);
}

export function startRecognition(language = "es-MX", onResult, onError, onStart, onEnd) {
  if (!isSpeechRecognitionSupported()) {
    onError?.("Seu navegador não suporta reconhecimento de voz. Tente usar o Google Chrome.");
    return;
  }

  stopRecognition();
  finalTranscript = "";

  const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  recognition = new Recognition();
  recognition.lang = language || "es-MX";
  recognition.continuous = true;
  recognition.interimResults = true;
  recognition.maxAlternatives = 3;

  recognition.onstart = () => onStart?.();
  recognition.onerror = (event) => onError?.(event.error || "Erro no reconhecimento de voz.");
  recognition.onend = () => onEnd?.();
  recognition.onresult = (event) => {
    let interimTranscript = "";

    for (let index = event.resultIndex; index < event.results.length; index += 1) {
      const result = event.results[index];
      const alternative = getBestAlternative(result);

      if (result.isFinal) {
        finalTranscript = `${finalTranscript} ${alternative.transcript}`.trim();
      } else {
        interimTranscript = `${interimTranscript} ${alternative.transcript}`.trim();
      }
    }

    const transcript = `${finalTranscript} ${interimTranscript}`.trim();
    onResult?.(transcript, Boolean(finalTranscript) && !interimTranscript);
  };

  try {
    recognition.start();
  } catch (error) {
    onError?.("NÃ£o foi possÃ­vel iniciar o reconhecimento de voz. Tente novamente.");
  }
}

export function stopRecognition() {
  if (recognition) {
    recognition.stop();
    recognition = null;
  }
}

function getBestAlternative(result) {
  return Array.from(result)
    .sort((first, second) => (second.confidence || 0) - (first.confidence || 0))[0] || result[0];
}

export function normalizeText(text) {
  return String(text || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[¿?¡!.,;:()"]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}
