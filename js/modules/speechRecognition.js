let recognition = null;

export function isSpeechRecognitionSupported() {
  return Boolean(window.SpeechRecognition || window.webkitSpeechRecognition);
}

export function startRecognition(language = "es-MX", onResult, onError, onStart, onEnd) {
  if (!isSpeechRecognitionSupported()) {
    onError?.("Seu navegador não suporta reconhecimento de voz. Tente usar o Google Chrome.");
    return;
  }

  stopRecognition();

  const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  recognition = new Recognition();
  recognition.lang = language || "es-MX";
  recognition.continuous = false;
  recognition.interimResults = true;
  recognition.maxAlternatives = 1;

  recognition.onstart = () => onStart?.();
  recognition.onerror = (event) => onError?.(event.error || "Erro no reconhecimento de voz.");
  recognition.onend = () => onEnd?.();
  recognition.onresult = (event) => {
    let transcript = "";
    let isFinal = false;

    for (let index = event.resultIndex; index < event.results.length; index += 1) {
      transcript += event.results[index][0].transcript;
      isFinal = event.results[index].isFinal || isFinal;
    }

    onResult?.(transcript.trim(), isFinal);
  };

  recognition.start();
}

export function stopRecognition() {
  if (recognition) {
    recognition.stop();
    recognition = null;
  }
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
