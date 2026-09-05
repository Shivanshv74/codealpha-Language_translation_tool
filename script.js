// ---------------------------------------------------------------
// Language list: [ code, label, speech-synthesis locale ]
// Codes are accepted by the translation provider and speech synthesis.
// ---------------------------------------------------------------
const LANGUAGES = [
  ["en", "English", "en-US"],
  ["hi", "Hindi", "hi-IN"],
  ["es", "Spanish", "es-ES"],
  ["fr", "French", "fr-FR"],
  ["de", "German", "de-DE"],
  ["it", "Italian", "it-IT"],
  ["pt", "Portuguese", "pt-PT"],
  ["ru", "Russian", "ru-RU"],
  ["ja", "Japanese", "ja-JP"],
  ["ko", "Korean", "ko-KR"],
  ["zh-CN", "Chinese (Simplified)", "zh-CN"],
  ["ar", "Arabic", "ar-SA"],
  ["bn", "Bengali", "bn-IN"],
  ["ta", "Tamil", "ta-IN"],
  ["te", "Telugu", "te-IN"],
  ["mr", "Marathi", "mr-IN"],
  ["gu", "Gujarati", "gu-IN"],
  ["pa", "Punjabi", "pa-IN"],
  ["ur", "Urdu", "ur-PK"],
  ["tr", "Turkish", "tr-TR"],
  ["vi", "Vietnamese", "vi-VN"],
  ["th", "Thai", "th-TH"],
  ["nl", "Dutch", "nl-NL"],
  ["pl", "Polish", "pl-PL"],
];

const el = (id) => document.getElementById(id);

const sourceLangSelect = el("sourceLang");
const targetLangSelect = el("targetLang");
const sourceText = el("sourceText");
const targetText = el("targetText");
const translateBtn = el("translateBtn");
const swapBtn = el("swapBtn");
const copyBtn = el("copyBtn");
const copyLabel = el("copyLabel");
const speakSourceBtn = el("speakSource");
const speakTargetBtn = el("speakTarget");
const charCount = el("charCount");
const statusLine = el("statusLine");

let lastTranslation = ""; // plain text of the most recent translation, for copy/speak

// ---------------------------------------------------------------
// Setup
// ---------------------------------------------------------------
function populateLanguageSelects() {
  LANGUAGES.forEach(([code, label]) => {
    sourceLangSelect.add(new Option(label, code));
    targetLangSelect.add(new Option(label, code));
  });
  sourceLangSelect.value = "en";
  targetLangSelect.value = "hi";
}

function localeFor(code) {
  const entry = LANGUAGES.find(([c]) => c === code);
  return entry ? entry[2] : "en-US";
}

populateLanguageSelects();

// ---------------------------------------------------------------
// Character counter
// ---------------------------------------------------------------
sourceText.addEventListener("input", () => {
  charCount.textContent = `${sourceText.value.length} / 500`;
});

// ---------------------------------------------------------------
// Status helper
// ---------------------------------------------------------------
function setStatus(message, isError = false) {
  statusLine.textContent = message;
  statusLine.classList.toggle("is-error", isError);
}

function translationFromGoogle(data) {
  const segments = Array.isArray(data?.[0]) ? data[0] : [];
  const result = segments
    .filter((segment) => Array.isArray(segment) && typeof segment[0] === "string")
    .map((segment) => segment[0])
    .join("");

  if (!result.trim()) {
    throw new Error("Unexpected response from translation service.");
  }

  return result;
}

// ---------------------------------------------------------------
// Translate
// ---------------------------------------------------------------
async function translate() {
  const text = sourceText.value.trim();
  const from = sourceLangSelect.value;
  const to = targetLangSelect.value;

  if (!text) {
    setStatus("Type something to translate first.", true);
    sourceText.focus();
    return;
  }

  if (from === to) {
    setStatus("Source and target languages are the same.", true);
    return;
  }

  translateBtn.disabled = true;
  translateBtn.textContent = "Translating…";
  setStatus("Contacting translation service…");

  try {
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${encodeURIComponent(from)}&tl=${encodeURIComponent(to)}&dt=t&q=${encodeURIComponent(text)}`;
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Request failed with status ${response.status}`);
    }

    const data = await response.json();
    const result = translationFromGoogle(data);
    lastTranslation = result;
    targetText.textContent = result;
    setStatus("Translated.");
  } catch (err) {
    console.error(err);
    targetText.innerHTML = '<span class="placeholder">Translation failed. Please try again.</span>';
    lastTranslation = "";
    setStatus("Translation service unavailable. Check your connection and try again.", true);
  } finally {
    translateBtn.disabled = false;
    translateBtn.textContent = "Translate";
  }
}

translateBtn.addEventListener("click", translate);

// Allow Ctrl/Cmd + Enter inside the textarea to trigger translation
sourceText.addEventListener("keydown", (e) => {
  if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
    e.preventDefault();
    translate();
  }
});

// ---------------------------------------------------------------
// Swap languages (and their text, if a translation already exists)
// ---------------------------------------------------------------
swapBtn.addEventListener("click", () => {
  const tempLang = sourceLangSelect.value;
  sourceLangSelect.value = targetLangSelect.value;
  targetLangSelect.value = tempLang;

  if (lastTranslation) {
    const tempText = sourceText.value;
    sourceText.value = lastTranslation;
    charCount.textContent = `${sourceText.value.length} / 500`;
    targetText.textContent = tempText;
    lastTranslation = tempText;
  }

  setStatus("Languages swapped.");
});

// ---------------------------------------------------------------
// Copy translated text
// ---------------------------------------------------------------
copyBtn.addEventListener("click", async () => {
  if (!lastTranslation) {
    setStatus("Nothing to copy yet — translate something first.", true);
    return;
  }
  try {
    await navigator.clipboard.writeText(lastTranslation);
    copyLabel.textContent = "Copied";
    setStatus("Translation copied to clipboard.");
    setTimeout(() => (copyLabel.textContent = "Copy"), 1800);
  } catch (err) {
    console.error(err);
    setStatus("Couldn't copy automatically — please select and copy the text manually.", true);
  }
});

// ---------------------------------------------------------------
// Text-to-speech
// ---------------------------------------------------------------
function speak(text, langCode, button) {
  if (!text) {
    setStatus("There's no text to read aloud yet.", true);
    return;
  }
  if (!("speechSynthesis" in window)) {
    setStatus("Text-to-speech isn't supported in this browser.", true);
    return;
  }

  window.speechSynthesis.cancel(); // stop anything currently playing

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = localeFor(langCode);

  button.disabled = true;
  utterance.onend = () => (button.disabled = false);
  utterance.onerror = () => (button.disabled = false);

  window.speechSynthesis.speak(utterance);
}

speakSourceBtn.addEventListener("click", () => {
  speak(sourceText.value.trim(), sourceLangSelect.value, speakSourceBtn);
});

speakTargetBtn.addEventListener("click", () => {
  speak(lastTranslation, targetLangSelect.value, speakTargetBtn);
});