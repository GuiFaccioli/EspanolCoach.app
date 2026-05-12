# Espanol Coach.app

Technical Spanish trainer for professional contexts, interviews, technology topics, and voice practice.

[Português](README.md) | [Español](README.es.md)

## About

Espanol Coach.app is a static app built with plain HTML, CSS, and JavaScript. It helps users practice Spanish in real workplace situations, with a focus on technology, support, web development, fintech, payments, meetings, and interviews.

The app combines exercise generation, browser voice playback, speech recognition, an oral exam mode, and practical feedback to support steady progress.

## Features

- Training sessions by difficulty, topic, and number of phrases.
- Exercise modes for listen and repeat, translation, gap completion, question answering, and interview simulation.
- Audio player with individual and global controls using the Web Speech API.
- Voice selection, speech speed, and default volume controls.
- Oral exam with Spanish questions, optional translation, voice recording, transcription, and approximate correction.
- Feedback with score, expected vocabulary, found words, missing words, and a more natural sample answer.
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

The `netlify.toml` file already defines this configuration for automatic deploys from GitHub.

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

The oral exam correction is approximate and based on the browser transcription. For more precise phonetic evaluation, a specialized speech API would be required.
