# Espanol Coach.app

https://espanol-coach.netlify.app/

Technical Spanish trainer for professional contexts, interviews, technology, web development, fintech, payments, meetings, and voice practice.

## About

Espanol Coach.app is a static web app built with plain HTML, CSS, and JavaScript. It helps users practice Spanish in realistic professional situations through generated exercises, browser-based audio playback, speech recognition, an oral exam mode, and practical feedback.

The app is designed as a dark mode training experience with a clean interface, focused cards, progress cues, and a subtle gamified feel.

## Features

- Training sessions by difficulty, topic, exercise mode, and number of phrases.
- Exercise modes for listen-and-repeat, translation, gap completion, question answering, and interview simulation.
- Audio player with individual and global controls using the Web Speech API.
- Voice selection, speech speed, and default volume controls.
- Oral exam with Spanish questions, optional translation, voice recording, transcription, and neutral language correction.
- Feedback with score, Spanish correction, response variations, and optional specialized phonetic assessment via Azure Speech.
- Response variation cards with playback controls and waveform-style visual feedback.
- Local question and phrase data organized into JavaScript modules.
- Netlify-ready static deployment with optional serverless function support.

## How to Use

Open `index.html` in a modern browser.

To access the oral exam, use the `Ir para prova oral` call-to-action on the main screen or open `prova.html` directly.

## Netlify Deploy

This project is static and does not require a build step.

Recommended Netlify settings:

- Build command: leave empty
- Publish directory: `.`
- Functions directory: `netlify/functions`

The `netlify.toml` file already defines this setup for automatic deploys from GitHub.

## Specialized Phonetic Assessment

The oral exam works without external APIs. By default, feedback is generated locally from the browser transcription.

To enable audio-based phonetic assessment, configure these environment variables in Netlify:

- `AZURE_SPEECH_KEY`
- `AZURE_SPEECH_REGION`

When those variables are available, `netlify/functions/pronunciation-assessment.js` sends 16 kHz mono PCM WAV audio to Azure Speech Pronunciation Assessment and returns pronunciation, accuracy, fluency, completeness, and words that may need more attention.

## Requirements

- Modern browser with JavaScript support.
- Web Speech API support for spoken audio.
- Google Chrome is recommended for speech recognition in the oral exam.
- Azure Speech credentials are optional and only required for specialized phonetic assessment.

## Project Structure

```text
.
|-- index.html
|-- prova.html
|-- netlify.toml
|-- RELATORIO_ANALISE_FONETICA.md
|-- css/
|   |-- style.css
|   `-- prova.css
|-- netlify/
|   `-- functions/
|       `-- pronunciation-assessment.js
`-- js/
    |-- main.js
    |-- prova.js
    |-- app.bundle.js
    |-- prova.bundle.js
    |-- data/
    |-- modules/
    `-- utils/
```

## Notes

Without Azure environment variables, the app keeps working with local correction based on the browser transcription. With Azure configured, the feedback also includes specialized phonetic assessment of the recorded audio.

The project intentionally avoids storing API keys in frontend JavaScript. External speech assessment is handled through a Netlify Function so credentials remain server-side.
