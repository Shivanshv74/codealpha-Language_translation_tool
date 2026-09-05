# Tongue — Language Translation Tool

A simple, no-build web app for translating text between languages, 
built as part of my internship project.

## Features
- Enter text and translate between 24+ languages
- Select source and target languages independently
- Swap languages with one click
- Listen to source or translated text (Text-to-Speech)
- Copy translated text to clipboard
- Character counter and error handling

## Tech Stack
- HTML, CSS, JavaScript (vanilla, no frameworks)
- Google Translate endpoint for translations
- Web Speech API for text-to-speech

## Getting Started
1. Clone this repo
2. Open the folder in VS Code
3. Start the `Launch Chrome against localhost` debug configuration. VS Code starts the local server automatically.

You can also open `index.html` directly in a browser; no build step is required.

## Project Structure
├── index.html    # Page structure
├── style.css     # Styling
└── script.js     # Translation logic, API calls, TTS, copy

## Limitations
- Translation availability depends on access to the Google Translate endpoint (capped at 500 characters here)