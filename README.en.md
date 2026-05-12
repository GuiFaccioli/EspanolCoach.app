# Espanol Coach.app

Technical Spanish trainer for professional contexts, interviews, technology topics, and voice practice.

[Português](README.md) | [Español](README.es.md)

## About

Espanol Coach.app is a static app built with plain HTML, CSS, and JavaScript. It helps users practice Spanish in real workplace situations, with a focus on technology, web development, fintech, payments, meetings, and interviews.

The app combines exercise generation, browser voice playback, speech recognition, an oral exam mode, and practical feedback to support steady progress.

## Features

- Training sessions by difficulty, topic, and number of phrases.
- Exercise modes for listen and repeat, translation, gap completion, question answering, and interview simulation.
- Audio player with individual and global controls using the Web Speech API.
- Voice selection, speech speed, and default volume controls.
- Oral exam with Spanish questions, optional translation, voice recording, transcription, and neutral correction.
- Feedback with score, Spanish correction, response variations, and optional specialized phonetic assessment via Azure Speech.
- Dark mode interface with cards, badges, visual progress, and a gamified training-platform feel.
- Local question and template data split into JavaScript modules.

## How to Use

Open `index.html` in your browser.

To access the oral exam, use the `Ir para prova oral` button on the main screen or open `prova.html` directly.

## Netlify Deploy

This is a static project and does not require a build step.

Recommended Netlify settings:

- Build command: leave empty
- Publish directory: `.`
- Functions directory: `netlify/functions`

The `netlify.toml` file already defines this configuration for automatic deploys from GitHub.

### Specialized Phonetic Assessment

The oral exam works without external APIs. To enable audio-based phonetic assessment, configure these environment variables in Netlify:

- `AZURE_SPEECH_KEY`
- `AZURE_SPEECH_REGION`

With these variables, `netlify/functions/pronunciation-assessment.js` sends 16 kHz mono PCM WAV audio to Azure Speech Pronunciation Assessment and returns pronunciation, accuracy, fluency, completeness, and words that need more attention.

## Requirements

- Modern browser with JavaScript support.
- For spoken audio: Web Speech API support.
- For speech recognition in the oral exam: Google Chrome is recommended.

## Structure

```text
.
|-- index.html
|-- prova.html
|-- netlify.toml
|-- css/
|   |-- style.css
|   `-- prova.css
|-- netlify/
|   `-- functions/
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

Without the Azure variables, the app uses only the local correction based on browser transcription. With Azure configured, the feedback also includes specialized phonetic assessment of the recorded audio.
