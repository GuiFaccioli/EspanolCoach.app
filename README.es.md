# Espanol Coach.app

Entrenador de español técnico para contextos profesionales, entrevistas, tecnología y práctica por voz.

[Português](README.md) | [English](README.en.md)

## Acerca del Proyecto

Espanol Coach.app es una aplicación estática creada con HTML, CSS y JavaScript puro. Ayuda a practicar español en situaciones reales de trabajo, con foco en tecnología, soporte, desarrollo web, fintech, pagos, reuniones y entrevistas.

La aplicación combina generación de ejercicios, reproducción de voz desde el navegador, reconocimiento de voz, prueba oral y feedback práctico para apoyar la evolución del usuario.

## Funcionalidades

- Entrenamientos por dificultad, tema y cantidad de frases.
- Modos de ejercicio para escuchar y repetir, traducir, completar espacios, responder preguntas y simular entrevistas.
- Reproductor de audio con controles individuales y globales usando Web Speech API.
- Selección de voz, velocidad de habla y volumen predeterminado.
- Prueba oral con preguntas en español, traducción opcional, grabación por voz, transcripción y corrección aproximada.
- Feedback con nota, vocabulario esperado, palabras encontradas, palabras ausentes y sugerencia de respuesta más natural.
- Interfaz dark mode con cards, badges, progreso visual y estilo de plataforma gamificada de entrenamiento.
- Banco local de preguntas y modelos dividido en módulos JavaScript.

## Cómo Usar

Abre el archivo `index.html` en el navegador.

Para acceder a la prueba oral, usa el botón `Ir para prova oral` en la pantalla principal o abre `prova.html` directamente.

## Deploy en Netlify

Este proyecto es estático y no necesita una etapa de build.

Configuración recomendada en Netlify:

- Build command: dejar vacío
- Publish directory: `.`

El archivo `netlify.toml` ya define esta configuración para deploy automático desde GitHub.

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

La corrección de la prueba oral es aproximada y se basa en la transcripción realizada por el navegador. Para una evaluación fonética más precisa, sería necesario integrar una API especializada de voz.
