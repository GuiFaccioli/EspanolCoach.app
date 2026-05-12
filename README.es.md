# Espanol Coach.app

Entrenador de espanol tecnico para contextos profesionales, entrevistas, tecnologia y practica por voz.

[Portugues](README.md) | [English](README.en.md)

## Acerca del Proyecto

Espanol Coach.app es una aplicacion estatica creada con HTML, CSS y JavaScript puro. Ayuda a practicar espanol en situaciones reales de trabajo, con foco en tecnologia, desarrollo web, fintech, pagos, reuniones y entrevistas.

La aplicacion combina generacion de ejercicios, reproduccion de voz desde el navegador, reconocimiento de voz, prueba oral y feedback practico para apoyar la evolucion del usuario.

## Funcionalidades

- Entrenamientos por dificultad, tema y cantidad de frases.
- Modos de ejercicio para escuchar y repetir, traducir, completar espacios, responder preguntas y simular entrevistas.
- Reproductor de audio con controles individuales y globales usando Web Speech API.
- Seleccion de voz, velocidad de habla y volumen predeterminado.
- Prueba oral con preguntas en espanol, traduccion opcional, grabacion por voz, transcripcion y correccion neutral.
- Feedback con nota, correccion del espanol, variaciones de respuesta y evaluacion fonetica especializada opcional via Azure Speech.
- Interfaz dark mode con cards, badges, progreso visual y estilo de plataforma gamificada de entrenamiento.
- Banco local de preguntas y modelos dividido en modulos JavaScript.

## Como Usar

Abre el archivo `index.html` en el navegador.

Para acceder a la prueba oral, usa el boton `Ir para prova oral` en la pantalla principal o abre `prova.html` directamente.

## Deploy en Netlify

Este proyecto es estatico y no necesita una etapa de build.

Configuracion recomendada en Netlify:

- Build command: dejar vacio
- Publish directory: `.`
- Functions directory: `netlify/functions`

El archivo `netlify.toml` ya define esta configuracion para deploy automatico desde GitHub.

### Evaluacion fonetica especializada

La prueba oral funciona sin APIs externas. Para activar la evaluacion fonetica basada en audio, configura estas variables de entorno en Netlify:

- `AZURE_SPEECH_KEY`
- `AZURE_SPEECH_REGION`

Con estas variables, `netlify/functions/pronunciation-assessment.js` envia audio WAV PCM mono de 16 kHz a Azure Speech Pronunciation Assessment y devuelve notas de pronunciacion, precision, fluidez, completitud y palabras que necesitan mas atencion.

## Requisitos

- Navegador moderno con soporte para JavaScript.
- Para audio hablado: soporte para Web Speech API.
- Para reconocimiento de voz en la prueba oral: se recomienda usar Google Chrome.

## Estructura

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

## Notas

Sin las variables de Azure, la app usa solo la correccion local basada en la transcripcion del navegador. Con Azure configurado, el feedback tambien incluye evaluacion fonetica especializada del audio grabado.
