const AZURE_SUPPORTED_CONTENT_TYPE = "audio/wav; codecs=audio/pcm; samplerate=16000";

exports.handler = async function handler(event) {
  if (event.httpMethod !== "POST") {
    return jsonResponse(405, { available: false, message: "Metodo nao permitido." });
  }

  const key = process.env.AZURE_SPEECH_KEY;
  const region = process.env.AZURE_SPEECH_REGION;

  if (!key || !region) {
    return jsonResponse(200, {
      available: false,
      message: "Analise fonetica especializada inativa. Configure AZURE_SPEECH_KEY e AZURE_SPEECH_REGION na Netlify."
    });
  }

  let payload;

  try {
    payload = JSON.parse(event.body || "{}");
  } catch (error) {
    return jsonResponse(400, { available: false, message: "Payload invalido." });
  }

  const audioBase64 = payload.audioBase64;
  const referenceText = String(payload.referenceText || "").trim();
  const language = payload.language || "es-ES";

  if (!audioBase64 || !referenceText) {
    return jsonResponse(400, {
      available: false,
      message: "Audio e texto de referencia sao obrigatorios para a avaliacao fonetica."
    });
  }

  const pronunciationConfig = {
    ReferenceText: referenceText,
    GradingSystem: "HundredMark",
    Granularity: "Phoneme",
    Dimension: "Comprehensive",
    EnableMiscue: "False"
  };

  const endpoint = new URL(`https://${region}.stt.speech.microsoft.com/speech/recognition/conversation/cognitiveservices/v1`);
  endpoint.searchParams.set("language", language);
  endpoint.searchParams.set("format", "detailed");

  try {
    const azureResponse = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Accept": "application/json",
        "Content-Type": AZURE_SUPPORTED_CONTENT_TYPE,
        "Ocp-Apim-Subscription-Key": key,
        "Pronunciation-Assessment": Buffer.from(JSON.stringify(pronunciationConfig)).toString("base64")
      },
      body: Buffer.from(audioBase64, "base64")
    });

    const rawText = await azureResponse.text();
    const data = parseJson(rawText);

    if (!azureResponse.ok) {
      return jsonResponse(azureResponse.status, {
        available: false,
        message: data.error?.message || "A Azure Speech nao conseguiu avaliar o audio.",
        providerStatus: azureResponse.status
      });
    }

    return jsonResponse(200, normalizeAzurePronunciationResult(data));
  } catch (error) {
    return jsonResponse(500, {
      available: false,
      message: "Falha ao consultar a API especializada de pronuncia.",
      detail: error.message
    });
  }
};

function normalizeAzurePronunciationResult(data) {
  const best = data.NBest?.[0] || {};
  const assessment = best.PronunciationAssessment || {};
  const weakWords = (best.Words || [])
    .map((word) => ({
      word: word.Word,
      accuracy: roundScore(word.PronunciationAssessment?.AccuracyScore),
      errorType: word.PronunciationAssessment?.ErrorType || "None"
    }))
    .filter((word) => word.word && (word.accuracy < 70 || word.errorType !== "None"))
    .slice(0, 6);

  return {
    available: true,
    provider: "Azure Speech Pronunciation Assessment",
    recognizedText: best.Display || data.DisplayText || "",
    scores: {
      pronunciation: roundScore(assessment.PronScore),
      accuracy: roundScore(assessment.AccuracyScore),
      fluency: roundScore(assessment.FluencyScore),
      completeness: roundScore(assessment.CompletenessScore)
    },
    weakWords,
    message: buildMessage(assessment, weakWords)
  };
}

function buildMessage(assessment, weakWords) {
  const parts = [];

  if (Number.isFinite(assessment.AccuracyScore)) {
    parts.push(`Precisao fonetica: ${roundScore(assessment.AccuracyScore)}/100.`);
  }

  if (Number.isFinite(assessment.FluencyScore)) {
    parts.push(`Fluencia: ${roundScore(assessment.FluencyScore)}/100.`);
  }

  if (weakWords.length) {
    parts.push(`Treine com mais atencao: ${weakWords.map((item) => item.word).join(", ")}.`);
  } else {
    parts.push("Nao encontrei palavras criticas na avaliacao fonetica.");
  }

  return parts.join(" ");
}

function roundScore(value) {
  const number = Number(value);
  return Number.isFinite(number) ? Math.round(number * 10) / 10 : 0;
}

function parseJson(text) {
  try {
    return text ? JSON.parse(text) : {};
  } catch (error) {
    return {};
  }
}

function jsonResponse(statusCode, body) {
  return {
    statusCode,
    headers: {
      "Content-Type": "application/json; charset=utf-8"
    },
    body: JSON.stringify(body)
  };
}
