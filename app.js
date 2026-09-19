/**
 * Samsaaram AI - App Controller
 * Manages Speech Recognition, Speech Synthesis, Canvas Visualizer, Conversation Flow, and UI.
 */

// Initialize Engines
const tutor = new TutorEngine();
const pronunciation = new PronunciationEngine();
const gdRoom = new GDRoomEngine();
const dailyChallenge = new DailyChallengeEngine();
const translator = new TranslatorEngine();
const whatsappMode = new WhatsAppMode();
const shadowing = new ShadowingPlayer();
const vocabBook = new VocabBook();
const progressAnalytics = new ProgressAnalytics();

window.tutor = tutor;
window.whatsappMode = whatsappMode;
window.shadowing = shadowing;
window.vocabBook = vocabBook;
window.progressAnalytics = progressAnalytics;

// App State
const state = {
  scenarios: [],
  currentScenario: null,
  isListening: false,
  isSpeaking: false,
  isLiveCallMode: false,
  isContinuousHandsFree: localStorage.getItem("talkmalayali_hands_free") !== "false",
  voiceEngine: localStorage.getItem("talkmalayali_voice_engine") || "neural",
  speechRate: parseFloat(localStorage.getItem("talkmalayali_speech_rate") || "0.9"),
  voiceAccent: localStorage.getItem("talkmalayali_voice_accent") || "en-IN",
  recognition: null,
  selectedVoice: null,
  availableVoices: [],
  visualizerActive: true,
  visualizerIntensity: 0.1,
  // Live Voice Call State
  callTimerInterval: null,
  callSeconds: 0,
  isCallMuted: false,
  showCallSubtitles: true,
  lastTutorResponseEn: "Hello! I am Teacher Maya, your personal English speaking partner. Feel completely free to talk with me.",
  lastTutorResponseMl: "ഹലോ! ഞാൻ നിങ്ങളുടെ പേഴ്സണൽ ഇംഗ്ലീഷ് സ്പീക്കിംഗ് പാർട്ണർ മായ മിസ്സ് ആണ്. എന്നോട് ധൈര്യമായി സംസാരിക്കൂ.",
  // In-Car Drive Mode State
  isDriveMode: false,
  driveWakeLock: null,
  driveTimerInterval: null,
  driveSeconds: 0,
  isDriveMuted: false
};

// DOM Elements
const chatFeed = document.getElementById("chatFeed");
const chatInputForm = document.getElementById("chatInputForm");
const chatInputField = document.getElementById("chatInputField");
const micToggleBtn = document.getElementById("micToggleBtn");
const micTooltip = document.getElementById("micTooltip");
const micIcon = document.getElementById("micIcon");
const quickRepliesTray = document.getElementById("quickRepliesTray");
const teacherCard = document.getElementById("teacherCard");
const tutorStatusText = document.getElementById("tutorStatusText");
const scenariosContainer = document.getElementById("scenariosContainer");
const activeScenarioTitle = document.getElementById("activeScenarioTitle");
const activeScenarioIcon = document.getElementById("activeScenarioIcon");
const tabChatMode = document.getElementById("tabChatMode");
const tabLiveCallMode = document.getElementById("tabLiveCallMode");
const liveCallContainer = document.getElementById("liveCallContainer");
const callLiveCaptionsEn = document.getElementById("callLiveCaptionsEn");
const callLiveCaptionsMl = document.getElementById("callLiveCaptionsMl");
const callTimerPill = document.getElementById("callTimerPill");
const callDurationText = document.getElementById("callDurationText");
const callAiEngineBadge = document.getElementById("callAiEngineBadge");
const callAvatarStage = document.getElementById("callAvatarStage");
const callAvatarHalo = document.getElementById("callAvatarHalo");
const callStateBadge = document.getElementById("callStateBadge");
const callStateIcon = document.getElementById("callStateIcon");
const callStateText = document.getElementById("callStateText");
const callCaptionsCard = document.getElementById("callCaptionsCard");
const btnCallReplay = document.getElementById("btnCallReplay");
const btnCallSlowReplay = document.getElementById("btnCallSlowReplay");
const btnCallMute = document.getElementById("btnCallMute");
const callMuteIcon = document.getElementById("callMuteIcon");
const callMuteLabel = document.getElementById("callMuteLabel");
const btnCallSubtitles = document.getElementById("btnCallSubtitles");
const btnCallSpeed = document.getElementById("btnCallSpeed");
const callSpeedIcon = document.getElementById("callSpeedIcon");
const callSpeedLabel = document.getElementById("callSpeedLabel");
const btnCallMalayalamHint = document.getElementById("btnCallMalayalamHint");
const btnCallCarMode = document.getElementById("btnCallCarMode");
const btnCallEnd = document.getElementById("btnCallEnd");

// In-Car Drive Mode Elements
const carDriveModeBtn = document.getElementById("carDriveModeBtn");
const carDriveModeModal = document.getElementById("carDriveModeModal");
const exitCarDriveBtn = document.getElementById("exitCarDriveBtn");
const carDriveTimer = document.getElementById("carDriveTimer");
const carWakeLockBadge = document.getElementById("carWakeLockBadge");
const carOrbWrapper = document.getElementById("carOrbWrapper");
const carDriverState = document.getElementById("carDriverState");
const carStateIcon = document.getElementById("carStateIcon");
const carStateText = document.getElementById("carStateText");
const carDriveCaptionEn = document.getElementById("carDriveCaptionEn");
const carDriveCaptionMl = document.getElementById("carDriveCaptionMl");
const carDriveMuteBtn = document.getElementById("carDriveMuteBtn");
const carMuteIcon = document.getElementById("carMuteIcon");
const carMuteText = document.getElementById("carMuteText");
const carDriveReplayBtn = document.getElementById("carDriveReplayBtn");
const carDriveSlowReplayBtn = document.getElementById("carDriveSlowReplayBtn");
const canvas = document.getElementById("audioVisualizerCanvas");
const ctx = canvas.getContext("2d");

// Modals
const settingsModal = document.getElementById("settingsModal");
const settingsBtn = document.getElementById("settingsBtn");
const closeSettingsBtn = document.getElementById("closeSettingsBtn");
const cancelSettingsBtn = document.getElementById("cancelSettingsBtn");
const saveSettingsBtn = document.getElementById("saveSettingsBtn");
const geminiApiKeyInput = document.getElementById("geminiApiKeyInput");
const learnerLevelSelect = document.getElementById("learnerLevelSelect");
const voiceEngineSelect = document.getElementById("voiceEngineSelect");
const voiceAccentSelect = document.getElementById("voiceAccentSelect");
const speechRateSlider = document.getElementById("speechRateSlider");
const speechRateLabel = document.getElementById("speechRateLabel");

const tipsModal = document.getElementById("tipsModal");
const helpTipsBtn = document.getElementById("helpTipsBtn");
const closeTipsBtn = document.getElementById("closeTipsBtn");
const gotItTipsBtn = document.getElementById("gotItTipsBtn");
const askMalayalamBtn = document.getElementById("askMalayalamBtn");
const mobileMenuBtn = document.getElementById("mobileMenuBtn");
const sidebarPanel = document.getElementById("sidebarPanel");

/**
 * Bootstrapping
 */
document.addEventListener("DOMContentLoaded", async () => {
  setupAudioVisualizer();
  setupSpeechRecognition();
  setupSpeechSynthesis();
  setupEventListeners();
  await loadScenarios();
  loadSavedSettings();
  updateHeaderStreakUI();
  checkMobile();
  setupIOSAudioUnlock();
});

// iOS Safari audio unlock on first touch
function setupIOSAudioUnlock() {
  const unlock = () => {
    if ('speechSynthesis' in window) {
      const u = new SpeechSynthesisUtterance(' ');
      u.volume = 0.01;
      window.speechSynthesis.speak(u);
    }
    document.removeEventListener('touchstart', unlock);
    document.removeEventListener('click', unlock);
  };
  document.addEventListener('touchstart', unlock, { once: true });
  document.addEventListener('click', unlock, { once: true });
}

window.addEventListener("resize", checkMobile);

function checkMobile() {
  if (window.innerWidth <= 900) {
    if (mobileMenuBtn) mobileMenuBtn.style.display = "flex";
  } else {
    if (mobileMenuBtn) mobileMenuBtn.style.display = "none";
    if (sidebarPanel) sidebarPanel.classList.remove("drawer-open");
  }
}

/**
 * Load Scenarios from JSON or fallback
 */
async function loadScenarios() {
  try {
    const res = await fetch("scenarios.json");
    if (res.ok) {
      state.scenarios = await res.json();
    }
  } catch (e) {
    console.warn("Using default fallback scenarios:", e);
  }

  if (!state.scenarios || state.scenarios.length === 0) {
    state.scenarios = [
      {
        id: "free_talk",
        title: "Friendly Chit-Chat (സൗഹൃദ സംഭാഷണം)",
        icon: "💬",
        level: "All Levels",
        starterEnglish: "Hello! I'm Maya, your English practice partner. How was your day today? സുഖമാണോ?",
        starterMalayalam: "ഹലോ! ഞാൻ നിങ്ങളുടെ ഇംഗ്ലീഷ് പാർട്ണർ മായയാണ്. ഇന്ന് വിശേഷങ്ങൾ എങ്ങനെയുണ്ട്? സുഖമാണോ?",
        quickReplies: ["I am doing great, how are you?", "My day was quite busy.", "സുഖമായിരിക്കുന്നു, താങ്ക് യു!"]
      }
    ];
  }

  renderScenariosList();
  selectScenario(state.scenarios[0].id);
}

function renderScenariosList() {
  scenariosContainer.innerHTML = "";
  state.scenarios.forEach(sc => {
    const item = document.createElement("button");
    item.className = `scenario-card-item ${state.currentScenario?.id === sc.id ? "selected" : ""}`;
    item.innerHTML = `
      <div class="scenario-item-icon">${sc.icon}</div>
      <div class="scenario-item-info">
        <div class="scenario-item-name">${sc.title}</div>
        <div class="scenario-item-badge">${sc.level}</div>
      </div>
    `;
    item.addEventListener("click", () => {
      selectScenario(sc.id);
      if (window.innerWidth <= 900 && sidebarPanel) {
        sidebarPanel.classList.remove("drawer-open");
      }
    });
    scenariosContainer.appendChild(item);
  });
}

function selectScenario(scenarioId) {
  const sc = state.scenarios.find(s => s.id === scenarioId);
  if (!sc) return;

  state.currentScenario = sc;
  tutor.setScenario(scenarioId);

  // Update UI headers
  activeScenarioTitle.textContent = sc.title.split("(")[0].trim();
  activeScenarioIcon.textContent = sc.icon;

  // Highlight list item
  const allItems = scenariosContainer.querySelectorAll(".scenario-card-item");
  allItems.forEach((el, idx) => {
    el.classList.toggle("selected", state.scenarios[idx]?.id === scenarioId);
  });

  // Clear feed and insert starter dialogue
  chatFeed.innerHTML = "";
  appendTutorMessage({
    englishResponse: sc.starterEnglish,
    malayalamResponse: sc.starterMalayalam,
    feedback: "Welcome! Take a breath, press the mic or choose a quick reply to begin.",
    quickReplies: sc.quickReplies || ["Hello Maya!", "I want to practice today."]
  });

  updateCallModeDisplay(sc.starterEnglish, sc.starterMalayalam);
}

/**
 * Speech Recognition Setup (Web Speech API)
 */
function setupSpeechRecognition() {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) {
    micTooltip.textContent = "Voice speech not supported in this browser (Use Chrome or Edge)";
    console.warn("Web Speech Recognition API is not supported in this browser.");
    return;
  }

  const rec = new SpeechRecognition();
  rec.continuous = false;
  rec.interimResults = true;
  rec.maxAlternatives = 1;
  rec.lang = "en-IN"; // English (India) works great with Malayalam accents

  rec.onstart = () => {
    state.isListening = true;
    micToggleBtn.classList.add("recording");
    teacherCard.classList.add("is-listening");
    tutorStatusText.textContent = "Listening to you...";
    tutorStatusText.style.color = "var(--amber-400)";
    micTooltip.textContent = "Listening... Speak now";
    state.visualizerIntensity = 0.5;
    updateLiveCallStateUI("listening");
  };

  rec.onresult = (event) => {
    let interim = "";
    let finalTranscript = "";

    for (let i = event.resultIndex; i < event.results.length; ++i) {
      if (event.results[i].isFinal) {
        finalTranscript += event.results[i][0].transcript;
      } else {
        interim += event.results[i][0].transcript;
      }
    }

    if (interim) {
      chatInputField.value = interim;
      if (state.isLiveCallMode) {
        callLiveCaptionsEn.textContent = `"${interim}..."`;
        callLiveCaptionsMl.textContent = "നിങ്ങൾ സംസാരിക്കുന്നത് കേൾക്കുന്നു...";
      }
    }

    if (finalTranscript) {
      chatInputField.value = finalTranscript;
      handleUserSubmit(finalTranscript);
    }
  };

  rec.onerror = (event) => {
    console.warn("Speech recognition error:", event.error);
    stopListening();
    tutorStatusText.textContent = "Ready to Talk";
    tutorStatusText.style.color = "#a7f3d0";
    updateLiveCallStateUI("ready");
  };

  rec.onend = () => {
    stopListening();
  };

  state.recognition = rec;
}

function startListening() {
  if (state.isCallMuted && state.isLiveCallMode) return;

  if (state.isSpeaking) {
    window.speechSynthesis.cancel();
    stopSpeaking();
  }

  if (state.recognition) {
    try {
      state.recognition.start();
    } catch (e) {
      console.warn("Recognition already active", e);
    }
  }
}

function stopListening() {
  state.isListening = false;
  micToggleBtn.classList.remove("recording");
  teacherCard.classList.remove("is-listening");
  micTooltip.textContent = "Click to Speak";
  if (!state.isSpeaking) {
    tutorStatusText.textContent = "Ready to Talk";
    tutorStatusText.style.color = "#a7f3d0";
    state.visualizerIntensity = 0.1;
    updateLiveCallStateUI("ready");
  }
}

/**
 * Speech Synthesis Setup (Natural Voice)
 */
function setupSpeechSynthesis() {
  if (!("speechSynthesis" in window)) {
    console.warn("SpeechSynthesis not supported");
    return;
  }

  const loadVoices = () => {
    state.availableVoices = window.speechSynthesis.getVoices();
    pickBestVoice();
  };

  loadVoices();
  if (window.speechSynthesis.onvoiceschanged !== undefined) {
    window.speechSynthesis.onvoiceschanged = loadVoices;
  }
}

function pickBestVoice() {
  if (!state.availableVoices.length) return;

  const accent = state.voiceAccent || "en-IN";

  // Prioritize natural female English voices
  let voice = state.availableVoices.find(v => v.lang === accent && /female|natural|google|zira|sangeeta|veena/i.test(v.name));
  if (!voice) {
    voice = state.availableVoices.find(v => v.lang.startsWith(accent.split("-")[0]));
  }
  if (!voice) {
    voice = state.availableVoices.find(v => v.lang.startsWith("en"));
  }

  state.selectedVoice = voice || state.availableVoices[0];
}

let currentAudioElement = null;
let audioPlayId = 0;

function splitTextIntoAudioChunks(text, maxLength = 160) {
  // Break text into natural sentences or conversational phrases
  const sentences = text.match(/[^.!?]+[.!?]+|[^.!?]+$/g) || [text];
  const chunks = [];

  for (let s of sentences) {
    s = s.trim();
    if (!s) continue;
    if (s.length <= maxLength) {
      chunks.push(s);
    } else {
      const words = s.split(/\s+/);
      let current = "";
      for (const word of words) {
        if ((current + " " + word).trim().length <= maxLength) {
          current = (current + " " + word).trim();
        } else {
          if (current) chunks.push(current);
          current = word;
        }
      }
      if (current) chunks.push(current);
    }
  }

  return chunks.length ? chunks : [text.slice(0, maxLength)];
}

function playNeuralAudioChunks(chunks, lang = "en", customRate = null, onStart, onComplete, onError) {
  const thisPlayId = ++audioPlayId;
  let index = 0;
  let hasStarted = false;

  function playNext() {
    if (thisPlayId !== audioPlayId) return; // Cancelled
    if (index >= chunks.length) {
      if (onComplete) onComplete();
      return;
    }

    const chunk = chunks[index++];
    const url = `https://translate.google.com/translate_tts?ie=UTF-8&tl=${encodeURIComponent(lang)}&client=tw-ob&q=${encodeURIComponent(chunk)}`;

    if (currentAudioElement) {
      try { currentAudioElement.pause(); } catch (e) {}
      currentAudioElement = null;
    }

    const audio = new Audio(url);
    currentAudioElement = audio;

    const rate = customRate || state.speechRate || 1.0;
    audio.playbackRate = Math.min(Math.max(rate, 0.7), 1.3);

    audio.onplay = () => {
      if (!hasStarted) {
        hasStarted = true;
        if (onStart) onStart();
      }
    };

    audio.onended = () => {
      if (thisPlayId !== audioPlayId) return;
      playNext();
    };

    audio.onerror = (err) => {
      console.warn("Google Neural audio failed for chunk, falling back:", err);
      if (onError) onError();
    };

    audio.play().catch(err => {
      console.warn("Google Neural audio autoplay error, falling back:", err);
      if (onError) onError();
    });
  }

  playNext();
}

function speakCurrentText(text, customRate = null) {
  if (!text) return;

  // Cancel any ongoing audio and speech
  stopSpeaking();

  // Strip Malayalam scripts and emojis for clear English pronunciation
  const cleanEnglish = text.replace(/[\u0D00-\u0D7F]/g, "").replace(/[^\w\s.,!?'"-]/gi, " ").trim();
  if (!cleanEnglish) return;

  const onSpeechStart = () => {
    state.isSpeaking = true;
    teacherCard.classList.add("is-speaking");
    tutorStatusText.textContent = "Teacher Maya is Speaking...";
    tutorStatusText.style.color = "var(--emerald-400)";
    state.visualizerIntensity = 0.85;
    updateLiveCallStateUI("speaking");
  };

  const onSpeechEnd = () => {
    stopSpeaking();
    // Continuous Hands-Free Talk: Automatically listen when Teacher Maya finishes speaking!
    if (state.isContinuousHandsFree && (!state.isCallMuted || !state.isLiveCallMode)) {
      tutorStatusText.textContent = "Your turn to speak...";
      tutorStatusText.style.color = "var(--amber-400)";
      updateLiveCallStateUI("listening", "Your turn to speak...");
      setTimeout(() => {
        if (!state.isSpeaking && !state.isListening) {
          startListening();
        }
      }, 550);
    } else {
      updateLiveCallStateUI("ready");
    }
  };

  // If user selected Neural Voice (Default)
  if (state.voiceEngine !== "system") {
    const chunks = splitTextIntoAudioChunks(cleanEnglish);

    let ttsLang = "en";
    if (state.voiceAccent === "en-IN") ttsLang = "en-IN";
    else if (state.voiceAccent === "en-GB") ttsLang = "en-GB";
    else if (state.voiceAccent === "en-US") ttsLang = "en";

    playNeuralAudioChunks(
      chunks,
      ttsLang,
      customRate,
      onSpeechStart,
      onSpeechEnd,
      () => {
        // Fallback to local SpeechSynthesis if network issue or blocked
        speakWithSpeechSynthesis(cleanEnglish, customRate, onSpeechStart, onSpeechEnd);
      }
    );
  } else {
    // Local device SpeechSynthesis
    speakWithSpeechSynthesis(cleanEnglish, customRate, onSpeechStart, onSpeechEnd);
  }
}

function speakWithSpeechSynthesis(cleanEnglish, customRate, onStart, onEnd) {
  if (!("speechSynthesis" in window) || !cleanEnglish) return;
  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(cleanEnglish);
  if (state.selectedVoice) {
    utterance.voice = state.selectedVoice;
  }
  utterance.rate = customRate || state.speechRate || 0.9;
  utterance.pitch = 1.0; // Warm, natural human pitch (no metallic chipmunk tone)

  utterance.onstart = () => {
    if (onStart) onStart();
  };

  utterance.onend = () => {
    if (onEnd) onEnd();
  };

  utterance.onerror = () => {
    stopSpeaking();
  };

  window.speechSynthesis.speak(utterance);
}

function stopSpeaking() {
  audioPlayId++;
  if (currentAudioElement) {
    try {
      currentAudioElement.pause();
      currentAudioElement.currentTime = 0;
    } catch (e) {}
    currentAudioElement = null;
  }
  if ("speechSynthesis" in window) {
    window.speechSynthesis.cancel();
  }
  state.isSpeaking = false;
  teacherCard.classList.remove("is-speaking");
  tutorStatusText.textContent = "Ready to Talk";
  tutorStatusText.style.color = "#a7f3d0";
  state.visualizerIntensity = 0.1;
  updateLiveCallStateUI("ready");
}

/**
 * Dynamic Canvas Waveform Visualizer
 */
function setupAudioVisualizer() {
  let step = 0;

  function renderWave() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const width = canvas.width;
    const height = canvas.height;
    const centerY = height / 2;

    // Amplitude adjusts smoothly based on speaking / listening state
    const amplitude = (state.visualizerIntensity * 16) + 2;

    // Draw smooth multi-layered glowing sine waves
    const colors = [
      "rgba(16, 185, 129, 0.7)",  // Emerald
      "rgba(99, 102, 241, 0.5)",  // Indigo
      "rgba(52, 211, 153, 0.3)"   // Light Emerald
    ];

    colors.forEach((color, i) => {
      ctx.beginPath();
      ctx.lineWidth = 2.5 - i * 0.5;
      ctx.strokeStyle = color;

      for (let x = 0; x < width; x++) {
        const angle = (x / width) * Math.PI * 4 + step + (i * 0.8);
        const y = centerY + Math.sin(angle) * (amplitude * (1 - (i * 0.2)));
        if (x === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      }
      ctx.stroke();
    });

    step += state.isSpeaking ? 0.09 : (state.isListening ? 0.05 : 0.02);
    requestAnimationFrame(renderWave);
  }

  requestAnimationFrame(renderWave);
}

/**
 * Handle User Input Submission
 */
async function handleUserSubmit(userInput) {
  const text = userInput.trim();
  if (!text) return;

  chatInputField.value = "";

  // Append user message to chat feed
  appendUserMessage(text);

  // Update live call view
  if (state.isLiveCallMode) {
    callLiveCaptionsEn.textContent = `"${text}"`;
    callLiveCaptionsMl.textContent = "നിങ്ങളുടെ മറുപടി പരിശോധിക്കുന്നു...";
  }

  // Show thinking indicator
  tutorStatusText.textContent = "Teacher Maya is thinking...";
  state.visualizerIntensity = 0.4;
  updateLiveCallStateUI("thinking");

  try {
    const response = await tutor.generateResponse(text, state.currentScenario);
    state.lastTutorResponseEn = response.englishResponse;
    state.lastTutorResponseMl = response.malayalamResponse;

    appendTutorMessage(response);
    updateCallModeDisplay(response.englishResponse, response.malayalamResponse);

    // Speak response automatically
    speakCurrentText(response.englishResponse);

  } catch (err) {
    console.error("Error generating tutor response:", err);
    tutorStatusText.textContent = "Ready to Talk";
    updateLiveCallStateUI("ready");
  }
}

/**
 * Append User Message Card with Pronunciation & Accent Score Strip
 */
function appendUserMessage(text) {
  const row = document.createElement("div");
  row.className = "message-row user-message";

  // Real-time pronunciation evaluation
  const scoreData = pronunciation.evaluateSpeech(text);

  // Log to Progress Analytics Engine
  if (window.progressAnalytics) {
    progressAnalytics.logSpokenMessage(text, scoreData.clarityScore);
    updateHeaderStreakUI();
  }

  let phoneticsHtml = "";
  if (scoreData.phoneticTips && scoreData.phoneticTips.length > 0) {
    const tip = scoreData.phoneticTips[0];
    phoneticsHtml = `
      <div class="grammar-fix-card" style="background: rgba(251, 191, 36, 0.08); border-color: rgba(251, 191, 36, 0.3); margin-top: 6px;">
        <div class="grammar-fix-title" style="color: #fde047;">
          <span>🎙️</span> Pronunciation Guide (ഉച്ചാരണം):
        </div>
        <div class="correction-row">
          <div style="color: #fef08a;">Word: "${escapeHtml(tip.word)}"</div>
          <div class="correction-explanation">${escapeHtml(tip.en)}<br><span class="ml-font" style="color: #cbd5e1;">${escapeHtml(tip.ml)}</span></div>
        </div>
      </div>
    `;
  }

  row.innerHTML = `
    <div class="msg-avatar">👤</div>
    <div class="msg-content-wrapper">
      <div class="msg-bubble">
        ${escapeHtml(text)}
        <div class="pron-score-strip">
          <span>🎯 Fluency: <strong>${scoreData.fluencyScore}%</strong></span>
          <span>⚡ Pace: ${scoreData.paceWpm} WPM</span>
          <span>✨ Clarity: ${scoreData.clarityScore}%</span>
        </div>
      </div>
      ${phoneticsHtml}
    </div>
  `;
  chatFeed.appendChild(row);
  chatFeed.scrollTop = chatFeed.scrollHeight;
}

/**
 * Append Tutor Message Card with Malayalam Translation & Corrections
 */
function appendTutorMessage(data) {
  const row = document.createElement("div");
  row.className = "message-row tutor-message";

  let correctionHtml = "";
  if (data.grammarCorrection && data.grammarCorrection.detected) {
    if (window.progressAnalytics) {
      progressAnalytics.logGrammarFix();
    }
    correctionHtml = `
      <div class="grammar-fix-card">
        <div class="grammar-fix-title">
          <span>✨</span> Better Way to Say It:
        </div>
        <div class="correction-row">
          <div class="corrected-better">"${escapeHtml(data.grammarCorrection.suggested)}"</div>
          <div class="correction-explanation">${escapeHtml(data.grammarCorrection.explanation)}</div>
        </div>
      </div>
    `;
  }

  let feedbackHtml = "";
  if (data.feedback) {
    feedbackHtml = `
      <div style="font-size: 0.76rem; color: #a5b4fc; margin-top: 6px; display: flex; align-items: center; gap: 4px;">
        <span>💡</span> <em>${escapeHtml(data.feedback)}</em>
      </div>
    `;
  }

  row.innerHTML = `
    <div class="msg-avatar">👩‍🏫</div>
    <div class="msg-content-wrapper">
      <div class="msg-bubble">
        ${escapeHtml(data.englishResponse)}
        ${feedbackHtml}
        <div class="msg-audio-actions">
          <button class="btn-audio-listen" title="Listen to Teacher Maya">
            <span>🔊</span> Listen
          </button>
          <button class="btn-slow-replay" title="Listen at 0.75x slow speed for clear pronunciation">
            <span>🐢</span> Slow (0.75x)
          </button>
          <button class="btn-slow-replay btn-save-phrase" title="Save this phrase to your Vocab Book">
            <span>⭐️</span> Save
          </button>
        </div>
      </div>

      ${correctionHtml}

      <div class="ml-translation-card">
        <div class="ml-translation-header">
          <span>മലയാളം അർത്ഥം:</span>
        </div>
        <div class="ml-translation-text">
          ${escapeHtml(data.malayalamResponse)}
        </div>
      </div>
    </div>
  `;

  // Attach audio handlers
  const listenBtn = row.querySelector(".btn-audio-listen");
  listenBtn.addEventListener("click", () => speakCurrentText(data.englishResponse));

  const slowBtn = row.querySelector(".btn-slow-replay");
  slowBtn.addEventListener("click", () => speakCurrentText(data.englishResponse, 0.75));

  const saveBtn = row.querySelector(".btn-save-phrase");
  if (saveBtn) {
    saveBtn.addEventListener("click", () => {
      vocabBook.addPhrase(data.englishResponse, data.malayalamResponse, "Daily Spoken");
      if (window.progressAnalytics) progressAnalytics.logVocabSaved();
      saveBtn.innerHTML = "<span>✅</span> Saved!";
      setTimeout(() => saveBtn.innerHTML = "<span>⭐️</span> Save", 1500);
    });
  }

  chatFeed.appendChild(row);
  chatFeed.scrollTop = chatFeed.scrollHeight;

  // Update quick reply pills
  renderQuickReplies(data.quickReplies || []);
}

function updateHeaderStreakUI() {
  const headerStreakBadge = document.getElementById("headerStreakBadge");
  if (headerStreakBadge && window.progressAnalytics) {
    headerStreakBadge.textContent = `🔥 ${progressAnalytics.stats.streakCount}d`;
  }
}

function renderProgressDashboard() {
  if (!window.progressAnalytics) return;
  const stats = progressAnalytics.stats;
  const levelInfo = progressAnalytics.getLevelInfo();

  // Level & XP Hero
  const lvlBadge = document.getElementById("dashboardLevelBadge");
  const lvlTitle = document.getElementById("dashboardLevelTitle");
  const lvlTitleMl = document.getElementById("dashboardLevelTitleMl");
  const streakCount = document.getElementById("dashboardStreakCount");
  const xpText = document.getElementById("dashboardXpText");
  const xpFill = document.getElementById("dashboardXpFill");

  if (lvlBadge) lvlBadge.textContent = `Level ${levelInfo.level}`;
  if (lvlTitle) lvlTitle.textContent = levelInfo.title;
  if (lvlTitleMl) lvlTitleMl.textContent = levelInfo.titleMl;
  if (streakCount) streakCount.textContent = stats.streakCount;
  if (xpText) xpText.textContent = `${stats.xp} / ${levelInfo.nextLevelXp} XP`;
  if (xpFill) xpFill.style.width = `${levelInfo.progressPercent}%`;

  // 4-Grid Stats
  const statMins = document.getElementById("statMinutesSpoken");
  const statMsgs = document.getElementById("statMessagesSpoken");
  const statGrammar = document.getElementById("statGrammarFixes");
  const statVocab = document.getElementById("statVocabSaved");

  if (statMins) statMins.textContent = stats.totalMinutesSpoken.toFixed(1);
  if (statMsgs) statMsgs.textContent = stats.totalMessagesSpoken;
  if (statGrammar) statGrammar.textContent = stats.grammarFixesLearned;
  if (statVocab) statVocab.textContent = stats.vocabularyCount;

  // Phonetics Bars
  const phoneticsList = document.getElementById("phoneticsBarsList");
  if (phoneticsList) {
    phoneticsList.innerHTML = "";
    Object.keys(stats.accentMastery).forEach(key => {
      const item = stats.accentMastery[key];
      const color = item.score >= 90 ? "#10b981" : (item.score >= 75 ? "#f59e0b" : "#f43f5e");
      const row = document.createElement("div");
      row.className = "phonetic-row";
      row.innerHTML = `
        <div class="phonetic-header">
          <span>${item.label}</span>
          <span style="color: ${color}; font-weight: 700;">${item.score}% Mastered</span>
        </div>
        <div class="phonetic-track">
          <div class="phonetic-fill" style="width: ${item.score}%; background: ${color};"></div>
        </div>
      `;
      phoneticsList.appendChild(row);
    });
  }

  // Weekly Bars
  const weeklyContainer = document.getElementById("weeklyBarsContainer");
  if (weeklyContainer) {
    weeklyContainer.innerHTML = "";
    const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    const currentDayName = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][new Date().getDay()];
    const maxVal = Math.max(35, ...Object.values(stats.weeklyActivity));

    days.forEach(day => {
      const count = stats.weeklyActivity[day] || 0;
      const heightPct = Math.min(100, Math.max(12, Math.round((count / maxVal) * 100)));
      const isActive = day === currentDayName;

      const col = document.createElement("div");
      col.className = `weekly-day-col ${isActive ? "active" : ""}`;
      col.innerHTML = `
        <div class="weekly-bar-track" title="${day}: ${count} sentences spoken">
          <div class="weekly-bar-fill" style="height: ${heightPct}%;"></div>
        </div>
        <span class="weekly-day-label" style="${isActive ? 'color: #a7f3d0; font-weight: 800;' : ''}">${day}</span>
      `;
      weeklyContainer.appendChild(col);
    });
  }

  // Badges Grid
  const badgesList = document.getElementById("badgesGridList");
  if (badgesList) {
    badgesList.innerHTML = "";
    stats.badges.forEach(b => {
      const badgeEl = document.createElement("div");
      badgeEl.className = `badge-item ${b.unlocked ? 'unlocked' : 'locked'}`;
      badgeEl.innerHTML = `
        <div class="badge-icon">${b.icon}</div>
        <div class="badge-info">
          <div class="badge-title">${b.title} ${b.unlocked ? '✅' : '🔒'}</div>
          <div class="badge-desc">${b.desc}</div>
        </div>
      `;
      badgesList.appendChild(badgeEl);
    });
  }

  updateHeaderStreakUI();
}

function renderQuickReplies(replies) {
  quickRepliesTray.innerHTML = "";
  if (!replies || replies.length === 0) return;

  replies.forEach(reply => {
    const pill = document.createElement("button");
    pill.className = "quick-reply-pill";
    pill.innerHTML = `<span>✨</span> ${escapeHtml(reply)}`;
    pill.addEventListener("click", () => {
      handleUserSubmit(reply);
    });
    quickRepliesTray.appendChild(pill);
  });
}

function sendQuickReply(text) {
  handleUserSubmit(text);
}

function updateCallModeDisplay(enText, mlText) {
  if (callLiveCaptionsEn) callLiveCaptionsEn.textContent = `"${enText}"`;
  if (callLiveCaptionsMl) callLiveCaptionsMl.textContent = mlText;
}

/**
 * Update Call State Badge & Avatar Pulse Animations
 */
function updateLiveCallStateUI(status, customText = null) {
  if (callStateBadge) {
    if (status === "speaking") {
      if (callAvatarHalo) {
        callAvatarHalo.classList.add("is-speaking");
        callAvatarHalo.classList.remove("is-listening");
      }
      callStateBadge.className = "call-state-pill is-speaking";
      if (callStateIcon) callStateIcon.textContent = "👩‍🏫";
      if (callStateText) callStateText.textContent = customText || "Teacher Maya is Speaking...";
    } else if (status === "listening") {
      if (callAvatarHalo) {
        callAvatarHalo.classList.add("is-listening");
        callAvatarHalo.classList.remove("is-speaking");
      }
      callStateBadge.className = "call-state-pill is-listening";
      if (callStateIcon) callStateIcon.textContent = "🎙️";
      if (callStateText) callStateText.textContent = customText || "Listening to you... Speak now";
    } else if (status === "thinking") {
      if (callAvatarHalo) {
        callAvatarHalo.classList.remove("is-speaking", "is-listening");
      }
      callStateBadge.className = "call-state-pill is-thinking";
      if (callStateIcon) callStateIcon.textContent = "🧠";
      if (callStateText) callStateText.textContent = customText || "Teacher Maya is thinking...";
    } else {
      if (callAvatarHalo) {
        callAvatarHalo.classList.remove("is-speaking", "is-listening");
      }
      callStateBadge.className = "call-state-pill";
      if (callStateIcon) callStateIcon.textContent = "✨";
      if (callStateText) callStateText.textContent = customText || "Ready — Speak Anytime";
    }
  }

  // Also sync In-Car Drive Mode UI
  updateCarDriveUI(status, customText);
}

/**
 * In-Car Drive Mode (CarPlay & Bluetooth Driving Companion)
 */
async function requestWakeLock() {
  try {
    if ("wakeLock" in navigator) {
      state.driveWakeLock = await navigator.wakeLock.request("screen");
      if (carWakeLockBadge) carWakeLockBadge.innerHTML = "<span>🔆</span> Screen Kept Awake";
    }
  } catch (err) {
    console.warn("Screen wake lock error:", err);
  }
}

async function releaseWakeLock() {
  if (state.driveWakeLock) {
    try {
      await state.driveWakeLock.release();
      state.driveWakeLock = null;
    } catch (e) {}
  }
}

function startDriveTimer() {
  stopDriveTimer();
  state.driveSeconds = 0;
  if (carDriveTimer) carDriveTimer.textContent = "00:00";
  state.driveTimerInterval = setInterval(() => {
    state.driveSeconds++;
    const mins = String(Math.floor(state.driveSeconds / 60)).padStart(2, "0");
    const secs = String(state.driveSeconds % 60).padStart(2, "0");
    if (carDriveTimer) carDriveTimer.textContent = `${mins}:${secs}`;
  }, 1000);
}

function stopDriveTimer() {
  if (state.driveTimerInterval) {
    clearInterval(state.driveTimerInterval);
    state.driveTimerInterval = null;
  }
}

function updateCarDriveUI(status, customText = null) {
  if (!carDriverState) return;

  if (status === "speaking") {
    if (carOrbWrapper) {
      carOrbWrapper.classList.add("is-speaking");
      carOrbWrapper.classList.remove("is-listening");
    }
    if (carStateIcon) carStateIcon.textContent = "🟢";
    if (carStateText) carStateText.textContent = customText || "Teacher Maya is Speaking...";
  } else if (status === "listening") {
    if (carOrbWrapper) {
      carOrbWrapper.classList.add("is-listening");
      carOrbWrapper.classList.remove("is-speaking");
    }
    if (carStateIcon) carStateIcon.textContent = "🟡";
    if (carStateText) carStateText.textContent = customText || "Listening to Car Mic... Speak Now";
  } else if (status === "thinking") {
    if (carOrbWrapper) {
      carOrbWrapper.classList.remove("is-speaking", "is-listening");
    }
    if (carStateIcon) carStateIcon.textContent = "🔵";
    if (carStateText) carStateText.textContent = customText || "Maya is thinking...";
  } else {
    if (carOrbWrapper) {
      carOrbWrapper.classList.remove("is-speaking", "is-listening");
    }
    if (carStateIcon) carStateIcon.textContent = "⚪";
    if (carStateText) carStateText.textContent = customText || "Ready (Drive Hands-Free)";
  }

  // Sync captions
  if (carDriveCaptionEn && state.lastTutorResponseEn) {
    carDriveCaptionEn.textContent = `"${state.lastTutorResponseEn}"`;
  }
  if (carDriveCaptionMl && state.lastTutorResponseMl) {
    carDriveCaptionMl.textContent = state.lastTutorResponseMl;
  }
}

function startCarDriveMode() {
  state.isDriveMode = true;
  const modal = document.getElementById("carDriveModeModal");
  if (modal) {
    modal.classList.add("active");
  }

  requestWakeLock();
  startDriveTimer();
  updateCarDriveUI("ready");

  // Tune speech rate for road noise clarity
  if (state.lastTutorResponseEn) {
    speakCurrentText(state.lastTutorResponseEn, 0.85);
  }

  // Trigger hands-free continuous listening
  setTimeout(() => {
    if (state.isDriveMode && !state.isSpeaking && !state.isListening && !state.isDriveMuted) {
      startListening();
    }
  }, 600);
}

function exitCarDriveMode() {
  state.isDriveMode = false;
  const modal = document.getElementById("carDriveModeModal");
  if (modal) {
    modal.classList.remove("active");
  }

  releaseWakeLock();
  stopDriveTimer();
  if (window.progressAnalytics && state.driveSeconds > 0) {
    progressAnalytics.logCallDuration(state.driveSeconds);
    updateHeaderStreakUI();
  }
}

window.startCarDriveMode = startCarDriveMode;
window.exitCarDriveMode = exitCarDriveMode;

/**
 * Call Duration Timer (MM:SS)
 */
function startCallTimer() {
  stopCallTimer();
  state.callSeconds = 0;
  if (callDurationText) callDurationText.textContent = "00:00";
  state.callTimerInterval = setInterval(() => {
    state.callSeconds++;
    const mins = String(Math.floor(state.callSeconds / 60)).padStart(2, "0");
    const secs = String(state.callSeconds % 60).padStart(2, "0");
    if (callDurationText) callDurationText.textContent = `${mins}:${secs}`;
  }, 1000);
}

function stopCallTimer() {
  if (state.callTimerInterval) {
    clearInterval(state.callTimerInterval);
    state.callTimerInterval = null;
  }
}

/**
 * Start & End Live Voice Call Session
 */
function startLiveCall() {
  tabLiveCallMode.classList.add("active");
  tabChatMode.classList.remove("active");
  chatFeed.style.display = "none";
  liveCallContainer.classList.add("active");
  state.isLiveCallMode = true;

  startCallTimer();
  updateLiveCallStateUI("ready");

  if (callAiEngineBadge) {
    const model = tutor.getModelName ? tutor.getModelName() : "Gemini 3.6 Flash";
    callAiEngineBadge.textContent = `${model} • HD Voice`;
  }

  // Sync latest speech captions
  if (callLiveCaptionsEn && state.lastTutorResponseEn) {
    callLiveCaptionsEn.textContent = `"${state.lastTutorResponseEn}"`;
  }
  if (callLiveCaptionsMl && state.lastTutorResponseMl) {
    callLiveCaptionsMl.textContent = state.lastTutorResponseMl;
  }

  // Trigger continuous conversation if enabled
  if (state.isContinuousHandsFree && !state.isCallMuted) {
    setTimeout(() => {
      if (state.isLiveCallMode && !state.isSpeaking && !state.isListening) {
        startListening();
      }
    }, 450);
  }
}

function endLiveCall() {
  const finalMins = String(Math.floor(state.callSeconds / 60)).padStart(2, "0");
  const finalSecs = String(state.callSeconds % 60).padStart(2, "0");
  const callDurationFormatted = `${finalMins}:${finalSecs}`;

  if (window.progressAnalytics && state.callSeconds > 0) {
    progressAnalytics.logCallDuration(state.callSeconds);
    updateHeaderStreakUI();
  }

  stopCallTimer();
  if ("speechSynthesis" in window) window.speechSynthesis.cancel();
  stopSpeaking();
  if (state.recognition) {
    try { state.recognition.stop(); } catch (e) {}
    stopListening();
  }

  tabChatMode.classList.add("active");
  tabLiveCallMode.classList.remove("active");
  chatFeed.style.display = "flex";
  liveCallContainer.classList.remove("active");
  state.isLiveCallMode = false;

  // Insert stylish call summary badge into chat feed
  const callNotice = document.createElement("div");
  callNotice.className = "message-row system-call-summary";
  callNotice.style.cssText = "display:flex; justify-content:center; margin: 16px 0; width:100%;";
  callNotice.innerHTML = `
    <div style="background: rgba(16, 185, 129, 0.12); border: 1px solid rgba(16, 185, 129, 0.35); padding: 8px 18px; border-radius: 9999px; font-size: 0.84rem; color: #a7f3d0; display: inline-flex; align-items: center; gap: 8px; box-shadow: 0 4px 15px rgba(0,0,0,0.3);">
      <span>📞</span> <strong>Live Voice Call Ended</strong> • Duration: ${callDurationFormatted}
    </div>
  `;
  chatFeed.appendChild(callNotice);
  chatFeed.scrollTop = chatFeed.scrollHeight;
}

/**
 * Event Listeners & Modals
 */
function setupEventListeners() {
  // Progress Analytics Dashboard Modal
  const progressAnalyticsBtn = document.getElementById("progressAnalyticsBtn");
  const progressAnalyticsModal = document.getElementById("progressAnalyticsModal");
  const closeProgressModalBtn = document.getElementById("closeProgressModalBtn");
  const doneProgressModalBtn = document.getElementById("doneProgressModalBtn");

  if (progressAnalyticsBtn) {
    progressAnalyticsBtn.addEventListener("click", () => {
      renderProgressDashboard();
      if (progressAnalyticsModal) progressAnalyticsModal.classList.add("active");
    });
  }

  if (closeProgressModalBtn) {
    closeProgressModalBtn.addEventListener("click", () => {
      if (progressAnalyticsModal) progressAnalyticsModal.classList.remove("active");
    });
  }

  if (doneProgressModalBtn) {
    doneProgressModalBtn.addEventListener("click", () => {
      if (progressAnalyticsModal) progressAnalyticsModal.classList.remove("active");
    });
  }

  // Mic Toggle Button
  micToggleBtn.addEventListener("click", () => {
    if (state.isListening) {
      if (state.recognition) state.recognition.stop();
      stopListening();
    } else {
      startListening();
    }
  });

  // Hands-Free Continuous Mode Button
  const handsFreeToggleBtn = document.getElementById("handsFreeToggleBtn");
  const handsFreeLabel = document.getElementById("handsFreeLabel");

  function updateHandsFreeUI() {
    if (handsFreeToggleBtn && handsFreeLabel) {
      if (state.isContinuousHandsFree) {
        handsFreeToggleBtn.classList.add("active");
        handsFreeLabel.textContent = "Continuous: ON";
      } else {
        handsFreeToggleBtn.classList.remove("active");
        handsFreeLabel.textContent = "Continuous: OFF";
      }
    }
  }

  if (handsFreeToggleBtn) {
    updateHandsFreeUI();
    handsFreeToggleBtn.addEventListener("click", () => {
      state.isContinuousHandsFree = !state.isContinuousHandsFree;
      localStorage.setItem("talkmalayali_hands_free", state.isContinuousHandsFree.toString());
      updateHandsFreeUI();
      if (state.isContinuousHandsFree && !state.isListening && !state.isSpeaking) {
        startListening();
      }
    });
  }

  // Chat Form Submit
  chatInputForm.addEventListener("submit", (e) => {
    e.preventDefault();
    handleUserSubmit(chatInputField.value);
  });

  // View Mode Tabs
  tabChatMode.addEventListener("click", () => {
    endLiveCall();
  });

  tabLiveCallMode.addEventListener("click", () => {
    startLiveCall();
  });

  // In-Car Drive Mode Event Listeners
  if (carDriveModeBtn) {
    carDriveModeBtn.addEventListener("click", () => {
      startCarDriveMode();
    });
  }

  if (btnCallCarMode) {
    btnCallCarMode.addEventListener("click", () => {
      startCarDriveMode();
    });
  }

  if (exitCarDriveBtn) {
    exitCarDriveBtn.addEventListener("click", () => {
      exitCarDriveMode();
    });
  }

  if (carDriveMuteBtn) {
    carDriveMuteBtn.addEventListener("click", () => {
      state.isDriveMuted = !state.isDriveMuted;
      if (state.isDriveMuted) {
        if (state.recognition) {
          try { state.recognition.stop(); } catch (e) {}
          stopListening();
        }
        carDriveMuteBtn.classList.add("muted");
        if (carMuteIcon) carMuteIcon.textContent = "🔇";
        if (carMuteText) carMuteText.textContent = "Mic OFF (Muted)";
      } else {
        carDriveMuteBtn.classList.remove("muted");
        if (carMuteIcon) carMuteIcon.textContent = "🎙️";
        if (carMuteText) carMuteText.textContent = "Mic ON (Listening)";
        if (!state.isSpeaking) {
          startListening();
        }
      }
    });
  }

  if (carDriveReplayBtn) {
    carDriveReplayBtn.addEventListener("click", () => {
      if (state.lastTutorResponseEn) {
        speakCurrentText(state.lastTutorResponseEn, 0.85);
      }
    });
  }

  if (carDriveSlowReplayBtn) {
    carDriveSlowReplayBtn.addEventListener("click", () => {
      if (state.lastTutorResponseEn) {
        speakCurrentText(state.lastTutorResponseEn, 0.72);
      }
    });
  }

  // Live Voice Call Dock Controls
  if (btnCallMute) {
    btnCallMute.addEventListener("click", () => {
      state.isCallMuted = !state.isCallMuted;
      if (state.isCallMuted) {
        if (state.recognition) {
          try { state.recognition.stop(); } catch (e) {}
          stopListening();
        }
        btnCallMute.classList.add("muted");
        if (callMuteIcon) callMuteIcon.textContent = "🔇";
        if (callMuteLabel) callMuteLabel.textContent = "Unmute";
      } else {
        btnCallMute.classList.remove("muted");
        if (callMuteIcon) callMuteIcon.textContent = "🎙️";
        if (callMuteLabel) callMuteLabel.textContent = "Mute";
        if (!state.isSpeaking) {
          startListening();
        }
      }
    });
  }

  if (btnCallSubtitles) {
    btnCallSubtitles.addEventListener("click", () => {
      state.showCallSubtitles = !state.showCallSubtitles;
      btnCallSubtitles.classList.toggle("active", state.showCallSubtitles);
      if (callCaptionsCard) {
        callCaptionsCard.classList.toggle("hidden", !state.showCallSubtitles);
      }
    });
  }

  if (btnCallSpeed) {
    const speeds = [0.75, 0.9, 1.0, 1.25];
    btnCallSpeed.addEventListener("click", () => {
      let currIdx = speeds.indexOf(state.speechRate);
      if (currIdx === -1) currIdx = 1;
      const nextIdx = (currIdx + 1) % speeds.length;
      state.speechRate = speeds[nextIdx];
      localStorage.setItem("talkmalayali_speech_rate", state.speechRate.toString());
      if (callSpeedLabel) callSpeedLabel.textContent = `${state.speechRate}x`;
      if (speechRateSlider) speechRateSlider.value = state.speechRate;
      if (speechRateLabel) speechRateLabel.textContent = `${state.speechRate}x`;
    });
  }

  if (btnCallMalayalamHint) {
    btnCallMalayalamHint.addEventListener("click", () => {
      const query = prompt("നിങ്ങൾക്ക് ഇംഗ്ലീഷിൽ പറയാൻ ആഗ്രഹമുള്ള കാര്യം മലയാളത്തിലോ മംഗ്ലീഷിലോ എഴുതൂ (Type in Malayalam or Manglish):");
      if (query && query.trim()) {
        handleUserSubmit(query.trim());
      }
    });
  }

  if (btnCallEnd) {
    btnCallEnd.addEventListener("click", () => {
      endLiveCall();
    });
  }

  if (btnCallReplay) {
    btnCallReplay.addEventListener("click", () => {
      if (state.lastTutorResponseEn) {
        speakCurrentText(state.lastTutorResponseEn);
      }
    });
  }

  if (btnCallSlowReplay) {
    btnCallSlowReplay.addEventListener("click", () => {
      if (state.lastTutorResponseEn) {
        speakCurrentText(state.lastTutorResponseEn, 0.75);
      }
    });
  }

  // Malayalam Quick Help Trigger
  askMalayalamBtn.addEventListener("click", () => {
    const query = prompt("നിങ്ങൾക്ക് ഇംഗ്ലീഷിൽ പറയാൻ ആഗ്രഹമുള്ള കാര്യം മലയാളത്തിലോ മംഗ്ലീഷിലോ എഴുതൂ (Type in Malayalam or Manglish):");
    if (query && query.trim()) {
      handleUserSubmit(query.trim());
    }
  });

  // Settings Modal & Gemini Model Configuration
  const geminiModelSelect = document.getElementById("geminiModelSelect");
  const testGeminiKeyBtn = document.getElementById("testGeminiKeyBtn");
  const geminiKeyTestStatus = document.getElementById("geminiKeyTestStatus");

  settingsBtn.addEventListener("click", () => {
    geminiApiKeyInput.value = tutor.getApiKey();
    if (geminiModelSelect) geminiModelSelect.value = tutor.getModelName();
    if (geminiKeyTestStatus) geminiKeyTestStatus.textContent = "";
    learnerLevelSelect.value = tutor.userLevel;
    if (voiceEngineSelect) voiceEngineSelect.value = state.voiceEngine || "neural";
    voiceAccentSelect.value = state.voiceAccent;
    speechRateSlider.value = state.speechRate;
    speechRateLabel.textContent = `${state.speechRate}x`;
    settingsModal.classList.add("active");
  });

  if (testGeminiKeyBtn) {
    testGeminiKeyBtn.addEventListener("click", async () => {
      const key = geminiApiKeyInput.value.trim();
      let model = geminiModelSelect ? geminiModelSelect.value : "gemini-3.6-flash";
      if (model === "gemini-2.0-flash") model = "gemini-3.6-flash";
      if (!key) {
        if (geminiKeyTestStatus) {
          geminiKeyTestStatus.style.color = "#f43f5e";
          geminiKeyTestStatus.textContent = "⚠️ Please paste your API key first.";
        }
        return;
      }
      if (geminiKeyTestStatus) {
        geminiKeyTestStatus.style.color = "#fbbf24";
        geminiKeyTestStatus.textContent = `⏳ Testing connection to ${model}...`;
      }
      testGeminiKeyBtn.disabled = true;
      try {
        const res = await tutor.testApiKey(key, model);
        if (geminiKeyTestStatus) {
          geminiKeyTestStatus.style.color = "#34d399";
          geminiKeyTestStatus.textContent = `🟢 Connected successfully! Model: ${res.model} (${res.latency}ms latency)`;
        }
      } catch (err) {
        if (geminiKeyTestStatus) {
          geminiKeyTestStatus.style.color = "#f43f5e";
          geminiKeyTestStatus.textContent = `❌ ${err.message}`;
        }
      } finally {
        testGeminiKeyBtn.disabled = false;
      }
    });
  }

  closeSettingsBtn.addEventListener("click", () => settingsModal.classList.remove("active"));
  cancelSettingsBtn.addEventListener("click", () => settingsModal.classList.remove("active"));

  saveSettingsBtn.addEventListener("click", () => {
    tutor.setApiKey(geminiApiKeyInput.value);
    if (geminiModelSelect) tutor.setModelName(geminiModelSelect.value);
    tutor.setUserLevel(learnerLevelSelect.value);
    if (voiceEngineSelect) {
      state.voiceEngine = voiceEngineSelect.value;
      localStorage.setItem("talkmalayali_voice_engine", state.voiceEngine);
    }
    state.voiceAccent = voiceAccentSelect.value;
    state.speechRate = parseFloat(speechRateSlider.value);
    localStorage.setItem("talkmalayali_voice_accent", state.voiceAccent);
    localStorage.setItem("talkmalayali_speech_rate", state.speechRate.toString());
    pickBestVoice();
    settingsModal.classList.remove("active");
  });

  speechRateSlider.addEventListener("input", (e) => {
    speechRateLabel.textContent = `${e.target.value}x`;
  });

  // Tips Modal
  helpTipsBtn.addEventListener("click", () => tipsModal.classList.add("active"));
  closeTipsBtn.addEventListener("click", () => tipsModal.classList.remove("active"));
  gotItTipsBtn.addEventListener("click", () => tipsModal.classList.remove("active"));

  // Custom Subject Modal Handlers
  const customSubjectBtn = document.getElementById("customSubjectBtn");
  const customSubjectModal = document.getElementById("customSubjectModal");
  const customSubjectInput = document.getElementById("customSubjectInput");
  const closeCustomSubjectBtn = document.getElementById("closeCustomSubjectBtn");
  const cancelCustomSubjectBtn = document.getElementById("cancelCustomSubjectBtn");
  const startCustomSubjectBtn = document.getElementById("startCustomSubjectBtn");

  if (customSubjectBtn) {
    customSubjectBtn.addEventListener("click", () => {
      customSubjectInput.value = tutor.getCustomSubject() !== "Any Topic" ? tutor.getCustomSubject() : "";
      customSubjectModal.classList.add("active");
      setTimeout(() => customSubjectInput.focus(), 100);
    });
  }

  if (closeCustomSubjectBtn) {
    closeCustomSubjectBtn.addEventListener("click", () => customSubjectModal.classList.remove("active"));
  }
  if (cancelCustomSubjectBtn) {
    cancelCustomSubjectBtn.addEventListener("click", () => customSubjectModal.classList.remove("active"));
  }

  if (startCustomSubjectBtn) {
    startCustomSubjectBtn.addEventListener("click", () => {
      const val = customSubjectInput.value.trim() || "Artificial Intelligence & Technology";
      startDiscussionOnSubject(val);
    });
  }

  if (customSubjectInput) {
    customSubjectInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        const val = customSubjectInput.value.trim() || "Artificial Intelligence & Technology";
        startDiscussionOnSubject(val);
      }
    });
  }

  // Mobile Drawer Toggle with Backdrop
  const drawerBackdrop = document.getElementById("drawerBackdrop");
  if (mobileMenuBtn) {
    mobileMenuBtn.addEventListener("click", () => {
      const isOpen = sidebarPanel.classList.toggle("drawer-open");
      if (drawerBackdrop) drawerBackdrop.classList.toggle("active", isOpen);
    });
  }

  if (drawerBackdrop) {
    drawerBackdrop.addEventListener("click", () => {
      sidebarPanel.classList.remove("drawer-open");
      drawerBackdrop.classList.remove("active");
    });
  }

  // Header quick scenario selector button
  const scenarioSelectorBtn = document.getElementById("scenarioSelectorBtn");
  if (scenarioSelectorBtn) {
    scenarioSelectorBtn.addEventListener("click", () => {
      if (window.innerWidth <= 900) {
        const isOpen = sidebarPanel.classList.toggle("drawer-open");
        if (drawerBackdrop) drawerBackdrop.classList.toggle("active", isOpen);
      } else {
        customSubjectBtn.click();
      }
    });
  }

  // AI Group Discussion (GD) Room Handlers
  const gdRoomBtn = document.getElementById("gdRoomBtn");
  const gdModal = document.getElementById("gdModal");
  const closeGdBtn = document.getElementById("closeGdBtn");
  const nextTurnBtn = document.getElementById("nextTurnBtn");
  const userSpeakGdBtn = document.getElementById("userSpeakGdBtn");
  const gdTopicSelect = document.getElementById("gdTopicSelect");

  if (gdRoomBtn) {
    gdRoomBtn.addEventListener("click", () => {
      openGDRoom();
    });
  }
  if (closeGdBtn) {
    closeGdBtn.addEventListener("click", () => gdModal.classList.remove("active"));
  }
  if (gdTopicSelect) {
    gdTopicSelect.addEventListener("change", (e) => {
      gdRoom.setTopic(e.target.value);
      resetGDRoomView();
    });
  }
  if (nextTurnBtn) {
    nextTurnBtn.addEventListener("click", () => {
      advanceGDTurn();
    });
  }
  if (userSpeakGdBtn) {
    userSpeakGdBtn.addEventListener("click", () => {
      const p = prompt("Speak or type your point for the Group Discussion (ഇംഗ്ലീഷിൽ നിങ്ങളുടെ പോയിന്റ് പറയൂ):");
      if (p && p.trim()) {
        appendGDMessage("user", "You (Participant)", "👤", p.trim());
        setTimeout(() => {
          advanceGDTurn(p.trim());
        }, 800);
      }
    });
  }

  // Daily Challenge & WhatsApp Share Handlers
  const streakPillBtn = document.getElementById("streakPillBtn");
  const dailyChallengeModal = document.getElementById("dailyChallengeModal");
  const closeDailyChallengeBtn = document.getElementById("closeDailyChallengeBtn");
  const shareWhatsAppBtn = document.getElementById("shareWhatsAppBtn");
  const downloadCardBtn = document.getElementById("downloadCardBtn");

  if (streakPillBtn) {
    streakPillBtn.addEventListener("click", () => {
      openDailyChallenge();
    });
  }
  if (closeDailyChallengeBtn) {
    closeDailyChallengeBtn.addEventListener("click", () => dailyChallengeModal.classList.remove("active"));
  }
  if (shareWhatsAppBtn) {
    shareWhatsAppBtn.addEventListener("click", () => {
      const avg = pronunciation.getAverageScore();
      dailyChallenge.shareToWhatsApp(avg);
    });
  }
  if (downloadCardBtn) {
    downloadCardBtn.addEventListener("click", () => {
      const canvas = document.getElementById("shareCardCanvas");
      if (canvas) {
        const link = document.createElement("a");
        link.download = `Samsaaram_AI_Fluency_Day${dailyChallenge.currentDay}.png`;
        link.href = canvas.toDataURL("image/png");
        link.click();
      }
    });
  }

  // Quick Accent Switcher Handlers
  const accentQuickBtn = document.getElementById("accentQuickBtn");
  const accentModal = document.getElementById("accentModal");
  const closeAccentModalBtn = document.getElementById("closeAccentModalBtn");

  if (accentQuickBtn) {
    accentQuickBtn.addEventListener("click", () => {
      accentModal.classList.add("active");
    });
  }
  if (closeAccentModalBtn) {
    closeAccentModalBtn.addEventListener("click", () => accentModal.classList.remove("active"));
  }

  // ==========================================================================
  // 📱 ADVANCED PWA SERVICE WORKER, INSTALL MODAL & OFFLINE MANAGER
  // ==========================================================================
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('./sw.js')
        .then((reg) => {
          console.log('[Samsaaram PWA] Registered with scope:', reg.scope);
          // Check for service worker updates
          reg.addEventListener('updatefound', () => {
            const newWorker = reg.installing;
            if (newWorker) {
              newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  console.log('[Samsaaram PWA] New update installed! Refreshing cache.');
                }
              });
            }
          });
        })
        .catch(err => console.warn('[Samsaaram PWA] SW register notice:', err));
    });
  }

  let deferredPwaPrompt = null;
  const pwaInstallBtn = document.getElementById("pwaInstallBtn");
  const pwaInstallModal = document.getElementById("pwaInstallModal");
  const closePwaModalBtn = document.getElementById("closePwaModalBtn");
  const pwaDoneBtn = document.getElementById("pwaDoneBtn");
  const pwaNativeInstallBox = document.getElementById("pwaNativeInstallBox");
  const pwaTriggerNativeBtn = document.getElementById("pwaTriggerNativeBtn");
  const pwaIosGuideBox = document.getElementById("pwaIosGuideBox");

  // Check if running as standalone PWA
  const isStandalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;
  if (isStandalone && pwaInstallBtn) {
    pwaInstallBtn.innerHTML = '<span class="pwa-icon">✅</span> <span class="pwa-label">Installed</span>';
    pwaInstallBtn.classList.add("installed");
  }

  // Detect iOS Safari
  const isIos = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;

  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPwaPrompt = e;
    if (pwaNativeInstallBox) pwaNativeInstallBox.style.display = 'flex';
    if (pwaInstallBtn && !isStandalone) {
      pwaInstallBtn.classList.add("pulse");
    }
  });

  window.addEventListener('appinstalled', () => {
    console.log('[Samsaaram PWA] App installed successfully!');
    if (pwaInstallBtn) {
      pwaInstallBtn.innerHTML = '<span class="pwa-icon">✅</span> <span class="pwa-label">Installed</span>';
      pwaInstallBtn.classList.add("installed");
    }
    if (pwaInstallModal) pwaInstallModal.classList.remove("active");
  });

  function openPwaInstallModal() {
    if (!pwaInstallModal) return;
    pwaInstallModal.classList.add("active");
    if (deferredPwaPrompt && pwaNativeInstallBox) {
      pwaNativeInstallBox.style.display = 'flex';
    }
    if (isIos && pwaIosGuideBox) {
      pwaIosGuideBox.style.display = 'flex';
      pwaIosGuideBox.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }

  function closePwaInstallModal() {
    if (pwaInstallModal) pwaInstallModal.classList.remove("active");
  }

  if (pwaInstallBtn) {
    pwaInstallBtn.addEventListener("click", () => {
      if (deferredPwaPrompt) {
        deferredPwaPrompt.prompt();
        deferredPwaPrompt.userChoice.then((choiceResult) => {
          if (choiceResult.outcome === 'accepted') {
            console.log('[Samsaaram PWA] User accepted installation prompt');
          }
          deferredPwaPrompt = null;
        });
      } else {
        openPwaInstallModal();
      }
    });
  }

  if (pwaTriggerNativeBtn) {
    pwaTriggerNativeBtn.addEventListener("click", () => {
      if (deferredPwaPrompt) {
        deferredPwaPrompt.prompt();
        deferredPwaPrompt.userChoice.then((choiceResult) => {
          if (choiceResult.outcome === 'accepted') {
            console.log('[Samsaaram PWA] User accepted prompt from modal');
          }
          deferredPwaPrompt = null;
          closePwaInstallModal();
        });
      }
    });
  }

  if (closePwaModalBtn) closePwaModalBtn.addEventListener("click", closePwaInstallModal);
  if (pwaDoneBtn) pwaDoneBtn.addEventListener("click", closePwaInstallModal);

  // Online / Offline Detection & Toast Bar
  const offlineStatusBar = document.getElementById("offlineStatusBar");
  const offlineStatusText = document.getElementById("offlineStatusText");

  function handleOnlineStatus() {
    if (!offlineStatusBar) return;
    if (navigator.onLine) {
      if (offlineStatusText) offlineStatusText.innerHTML = '🟢 <strong>Back Online</strong> — Full AI sync & Gemini restored!';
      offlineStatusBar.style.background = 'linear-gradient(90deg, rgba(16, 185, 129, 0.25), rgba(6, 182, 212, 0.25))';
      offlineStatusBar.style.display = 'flex';
      setTimeout(() => {
        if (navigator.onLine) offlineStatusBar.style.display = 'none';
      }, 3500);
    } else {
      if (offlineStatusText) offlineStatusText.innerHTML = '📶 <strong>Offline Practice Mode Active</strong> — Speaking lessons & vocabulary ready without internet!';
      offlineStatusBar.style.background = 'linear-gradient(90deg, rgba(245, 158, 11, 0.25), rgba(239, 68, 68, 0.25))';
      offlineStatusBar.style.display = 'flex';
    }
  }

  window.addEventListener('online', handleOnlineStatus);
  window.addEventListener('offline', handleOnlineStatus);
  if (!navigator.onLine) handleOnlineStatus();

  // Handle PWA Shortcut URL Parameters (?mode=drive, ?mode=call, ?mode=progress, ?mode=vocab)
  const urlParams = new URLSearchParams(window.location.search);
  const pwaMode = urlParams.get('mode');
  if (pwaMode) {
    setTimeout(() => {
      if (pwaMode === 'drive' && window.startCarDriveMode) {
        window.startCarDriveMode();
      } else if (pwaMode === 'call' && window.startLiveCall) {
        window.startLiveCall();
      } else if (pwaMode === 'progress') {
        const progModal = document.getElementById("progressAnalyticsModal");
        if (progModal) progModal.classList.add("active");
      } else if (pwaMode === 'vocab') {
        const vModal = document.getElementById("vocabBookModal");
        if (vModal) vModal.classList.add("active");
      }
    }, 600);
  }

  // Bilingual Translator Handlers (Google Translate Style)
  const translatorBtn = document.getElementById("translatorBtn");
  const translatorModal = document.getElementById("translatorModal");
  const closeTranslatorBtn = document.getElementById("closeTranslatorBtn");
  const swapLangBtn = document.getElementById("swapLangBtn");
  const doTranslateBtn = document.getElementById("doTranslateBtn");
  const translatorInput = document.getElementById("translatorInput");
  const clearTranslatorInputBtn = document.getElementById("clearTranslatorInputBtn");
  const translatorMicBtn = document.getElementById("translatorMicBtn");
  const listenTranslationBtn = document.getElementById("listenTranslationBtn");
  const copyTranslationBtn = document.getElementById("copyTranslationBtn");
  const practiceWithMayaBtn = document.getElementById("practiceWithMayaBtn");

  if (translatorBtn) {
    translatorBtn.addEventListener("click", () => {
      translatorModal.classList.add("active");
      setTimeout(() => translatorInput.focus(), 100);
    });
  }
  if (closeTranslatorBtn) {
    closeTranslatorBtn.addEventListener("click", () => translatorModal.classList.remove("active"));
  }

  if (swapLangBtn) {
    swapLangBtn.addEventListener("click", () => {
      const swapped = translator.swapLanguages();
      document.getElementById("sourceLangLabel").textContent = swapped.sourceLang === "en" ? "English (ഇംഗ്ലീഷ്)" : "Malayalam (മലയാളം)";
      document.getElementById("targetLangLabel").textContent = swapped.targetLang === "en" ? "English (ഇംഗ്ലീഷ്)" : "Malayalam (മലയാളം)";
      if (translatorInput.value.trim()) {
        performLiveTranslation();
      }
    });
  }

  if (doTranslateBtn) {
    doTranslateBtn.addEventListener("click", () => performLiveTranslation());
  }

  if (translatorInput) {
    translatorInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        performLiveTranslation();
      }
    });
  }

  if (clearTranslatorInputBtn) {
    clearTranslatorInputBtn.addEventListener("click", () => {
      translatorInput.value = "";
      document.getElementById("translatorOutputText").textContent = "ഇവിടെ വിവർത്തനം തത്സമയം ലഭ്യമാകും...";
    });
  }

  if (translatorMicBtn) {
    let isTranslatingSpeech = false;
    let rec = null;

    translatorMicBtn.addEventListener("click", () => {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (!SpeechRecognition) {
        alert("Speech recognition not supported in this browser. Please use Google Chrome or Edge.");
        return;
      }

      if (isTranslatingSpeech && rec) {
        rec.stop();
        return;
      }

      rec = new SpeechRecognition();
      rec.continuous = false;
      rec.interimResults = true;
      rec.lang = translator.sourceLang === "en" ? "en-IN" : "ml-IN";

      rec.onstart = () => {
        isTranslatingSpeech = true;
        translatorMicBtn.style.color = "#ef4444";
        translatorMicBtn.style.transform = "scale(1.2)";
        translatorMicBtn.style.transition = "all 0.2s ease";
        translatorInput.placeholder = "Listening... Speak now (സംസാരിക്കൂ...)";
      };

      rec.onresult = (e) => {
        let transcript = "";
        for (let i = 0; i < e.results.length; i++) {
          transcript += e.results[i][0].transcript;
        }
        translatorInput.value = transcript;
        if (e.results[0].isFinal) {
          performLiveTranslation();
        }
      };

      rec.onerror = (e) => {
        console.warn("Translator speech recognition error:", e);
        isTranslatingSpeech = false;
        translatorMicBtn.style.color = "var(--text-secondary)";
        translatorMicBtn.style.transform = "scale(1)";
        translatorInput.placeholder = "Type or speak in English (or Malayalam / Manglish)...";
      };

      rec.onend = () => {
        isTranslatingSpeech = false;
        translatorMicBtn.style.color = "var(--text-secondary)";
        translatorMicBtn.style.transform = "scale(1)";
        translatorInput.placeholder = "Type or speak in English (or Malayalam / Manglish)...";
        if (translatorInput.value.trim()) {
          performLiveTranslation();
        }
      };

      rec.start();
    });
  }

  if (listenTranslationBtn) {
    listenTranslationBtn.addEventListener("click", () => {
      const outText = document.getElementById("translatorOutputText").textContent.trim();
      if (!outText || outText === "ഇവിടെ വിവർത്തനം തത്സമയം ലഭ്യമാകും...") return;

      const btn = listenTranslationBtn;
      const originalHtml = btn.innerHTML;
      btn.innerHTML = `<span>🔊</span> Playing...`;
      btn.style.opacity = "0.7";

      const resetBtn = () => {
        btn.innerHTML = originalHtml;
        btn.style.opacity = "1";
      };

      // If target language is English
      if (translator.targetLang === "en") {
        speakCurrentText(outText);
        setTimeout(resetBtn, 2000);
      } else {
        // Target is Malayalam
        // 1. Check if browser has a native Malayalam TTS voice
        const mlVoice = state.availableVoices.find(v => v.lang.startsWith("ml") || v.name.toLowerCase().includes("malayalam"));
        if (mlVoice && "speechSynthesis" in window) {
          window.speechSynthesis.cancel();
          const utt = new SpeechSynthesisUtterance(outText);
          utt.voice = mlVoice;
          utt.rate = 0.9;
          utt.onend = resetBtn;
          utt.onerror = resetBtn;
          window.speechSynthesis.speak(utt);
        } else {
          // 2. Play via Google TTS audio stream
          const audioUrl = `https://translate.google.com/translate_tts?ie=UTF-8&tl=ml&client=tw-ob&q=${encodeURIComponent(outText)}`;
          const audio = new Audio(audioUrl);
          audio.onended = resetBtn;
          audio.onerror = () => {
            // Fallback to SpeechSynthesis
            speakCurrentText(outText);
            setTimeout(resetBtn, 1500);
          };
          audio.play().catch(e => {
            console.warn("Audio playback error:", e);
            resetBtn();
          });
        }
      }
    });
  }

  if (copyTranslationBtn) {
    copyTranslationBtn.addEventListener("click", () => {
      const outText = document.getElementById("translatorOutputText").textContent.trim();
      if (outText) {
        navigator.clipboard.writeText(outText);
        copyTranslationBtn.textContent = "✅ Copied!";
        setTimeout(() => copyTranslationBtn.textContent = "📋 Copy", 1500);
      }
    });
  }

  if (practiceWithMayaBtn) {
    practiceWithMayaBtn.addEventListener("click", () => {
      const outText = document.getElementById("translatorOutputText").textContent.trim();
      const inText = translatorInput.value.trim();
      translatorModal.classList.remove("active");
      const phraseToPractice = translator.targetLang === "en" ? outText : inText;
      if (phraseToPractice) {
        handleUserSubmit(`How do I use this sentence naturally in conversation: "${phraseToPractice}"?`);
      }
    });
  }

  // ==========================================
  // 📸 Snap & Learn AI Camera Vision Handlers
  // ==========================================
  const snapLearnBtn = document.getElementById("snapLearnBtn");
  const snapLearnModal = document.getElementById("snapLearnModal");
  const closeSnapLearnBtn = document.getElementById("closeSnapLearnBtn");
  const cameraSwitchBtn = document.getElementById("cameraSwitchBtn");
  const cameraVideo = document.getElementById("cameraVideo");
  const cameraCanvas = document.getElementById("cameraCanvas");
  const cameraShutterBtn = document.getElementById("cameraShutterBtn");
  const cameraFileInput = document.getElementById("cameraFileInput");
  const cameraSampleBtn = document.getElementById("cameraSampleBtn");
  const cameraAnalyzingOverlay = document.getElementById("cameraAnalyzingOverlay");
  const cameraResultCard = document.getElementById("cameraResultCard");
  const snapObjectIcon = document.getElementById("snapObjectIcon");
  const snapObjectName = document.getElementById("snapObjectName");
  const snapObjectPronounce = document.getElementById("snapObjectPronounce");
  const snapListenObjectBtn = document.getElementById("snapListenObjectBtn");
  const snapObjectTip = document.getElementById("snapObjectTip");
  const snapSentencesList = document.getElementById("snapSentencesList");
  const snapStarterText = document.getElementById("snapStarterText");
  const snapTalkWithMayaBtn = document.getElementById("snapTalkWithMayaBtn");
  const cameraSamplesTray = document.getElementById("cameraSamplesTray");

  function openSnapLearnModal() {
    if (!snapLearnModal) return;
    snapLearnModal.classList.add("active");
    if (window.cameraVision && cameraVideo && cameraCanvas) {
      window.cameraVision.startCamera(cameraVideo, cameraCanvas).catch(err => {
        console.warn("[SnapLearn] Camera start note:", err);
      });
    }
  }

  function closeSnapLearnModal() {
    if (!snapLearnModal) return;
    snapLearnModal.classList.remove("active");
    if (window.cameraVision) {
      window.cameraVision.stopCamera();
    }
  }

  if (snapLearnBtn) snapLearnBtn.addEventListener("click", openSnapLearnModal);
  if (closeSnapLearnBtn) closeSnapLearnBtn.addEventListener("click", closeSnapLearnModal);

  if (cameraSwitchBtn) {
    cameraSwitchBtn.addEventListener("click", async () => {
      if (window.cameraVision) {
        cameraSwitchBtn.style.transform = "rotate(180deg)";
        await window.cameraVision.switchCamera();
        setTimeout(() => cameraSwitchBtn.style.transform = "none", 400);
      }
    });
  }

  async function processSnapAnalysis(base64Data) {
    if (!window.cameraVision) return;
    if (cameraAnalyzingOverlay) cameraAnalyzingOverlay.style.display = "flex";

    try {
      const apiKey = tutor.getApiKey ? tutor.getApiKey() : "";
      const result = await window.cameraVision.analyzeImage(base64Data, apiKey);
      renderSnapResult(result);
    } catch (e) {
      console.warn("[SnapLearn] Analysis error, showing fallback sample:", e);
      const fallback = window.cameraVision.getSampleById("coffee");
      renderSnapResult(fallback);
    } finally {
      if (cameraAnalyzingOverlay) cameraAnalyzingOverlay.style.display = "none";
    }
  }

  function renderSnapResult(result) {
    if (!result || !cameraResultCard) return;
    cameraResultCard.style.display = "flex";

    if (snapObjectIcon) snapObjectIcon.textContent = result.icon || "🔍";
    if (snapObjectName) snapObjectName.textContent = result.name || "Identified Object";
    if (snapObjectPronounce) snapObjectPronounce.textContent = result.pronunciation || "";
    if (snapObjectTip) snapObjectTip.textContent = result.phoneticTip || "Practice speaking clearly.";
    if (snapStarterText) snapStarterText.textContent = result.conversationStarter || "Let's talk about this!";

    // Listen object pronunciation
    if (snapListenObjectBtn) {
      snapListenObjectBtn.onclick = () => {
        speakCurrentText(result.name, 0.85);
      };
    }

    // Populate 3 Sentences
    if (snapSentencesList && result.sentences) {
      snapSentencesList.innerHTML = "";
      result.sentences.forEach((s) => {
        const item = document.createElement("div");
        item.className = "snap-sentence-item";
        item.innerHTML = `
          <div class="snap-sentence-texts">
            <div class="sentence-en">${s.en}</div>
            <div class="sentence-ml ml-font">${s.ml}</div>
            ${s.ipa ? `<div class="sentence-ipa">${s.ipa}</div>` : ""}
          </div>
          <button class="btn-sentence-audio" title="Listen Sentence">🔊</button>
        `;
        const audioBtn = item.querySelector(".btn-sentence-audio");
        if (audioBtn) {
          audioBtn.onclick = () => speakCurrentText(s.en, 0.88);
        }
        snapSentencesList.appendChild(item);
      });
    }

    cameraResultCard.scrollIntoView({ behavior: "smooth", block: "nearest" });

    // Track XP for Snap & Learn!
    if (window.progressAnalytics) {
      window.progressAnalytics.addXP(25, "Snap & Learn Vision");
      updateHeaderStreakUI();
    }
  }

  if (cameraShutterBtn) {
    cameraShutterBtn.addEventListener("click", () => {
      if (!window.cameraVision) return;
      const frame = window.cameraVision.captureFrame();
      if (frame) {
        processSnapAnalysis(frame);
      } else {
        const fallback = window.cameraVision.getSampleById("coffee");
        renderSnapResult(fallback);
      }
    });
  }

  if (cameraFileInput) {
    cameraFileInput.addEventListener("change", (e) => {
      const file = e.target.files && e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (evt) => {
          processSnapAnalysis(evt.target.result);
        };
        reader.readAsDataURL(file);
      }
    });
  }

  if (cameraSampleBtn) {
    cameraSampleBtn.addEventListener("click", () => {
      if (cameraSamplesTray) {
        cameraSamplesTray.scrollIntoView({ behavior: "smooth" });
      }
    });
  }

  // Sample pills click
  document.querySelectorAll(".sample-pill").forEach(pill => {
    pill.addEventListener("click", () => {
      const sampleId = pill.dataset.sample;
      if (window.cameraVision) {
        const sample = window.cameraVision.getSampleById(sampleId);
        renderSnapResult(sample);
      }
    });
  });

  // Talk to Maya button
  if (snapTalkWithMayaBtn) {
    snapTalkWithMayaBtn.addEventListener("click", () => {
      if (!window.cameraVision || !window.cameraVision.currentAnalysis) return;
      const curr = window.cameraVision.currentAnalysis;
      closeSnapLearnModal();
      handleUserSubmit(`Teacher Maya, I took a photo of "${curr.name}"! ${curr.conversationStarter || "Can you teach me how to talk about it in English?"}`);
    });
  }

  // ====================================================
  // 🗣️ 2-Way Live Walkie-Talkie Interpreter Handlers
  // ====================================================
  const twoWayInterpreterBtn = document.getElementById("twoWayInterpreterBtn");
  const twoWayInterpreterModal = document.getElementById("twoWayInterpreterModal");
  const closeInterpreterBtn = document.getElementById("closeInterpreterBtn");
  const interpreterAudioModeBtn = document.getElementById("interpreterAudioModeBtn");
  const audioModeIcon = document.getElementById("audioModeIcon");
  const audioModeText = document.getElementById("audioModeText");
  const btnMicEnglish = document.getElementById("btnMicEnglish");
  const statusLabelEn = document.getElementById("statusLabelEn");
  const transcriptEnBox = document.getElementById("transcriptEnBox");
  const placeholderEn = document.getElementById("placeholderEn");
  const textEnSpoken = document.getElementById("textEnSpoken");
  const textMlTranslated = document.getElementById("textMlTranslated");
  const replayMlAudioBtn = document.getElementById("replayMlAudioBtn");

  const btnMicMalayalam = document.getElementById("btnMicMalayalam");
  const statusLabelMl = document.getElementById("statusLabelMl");
  const transcriptMlBox = document.getElementById("transcriptMlBox");
  const placeholderMl = document.getElementById("placeholderMl");
  const textMlSpoken = document.getElementById("textMlSpoken");
  const textEnTranslated = document.getElementById("textEnTranslated");
  const replayEnAudioBtn = document.getElementById("replayEnAudioBtn");

  const autoWalkieTalkieToggle = document.getElementById("autoWalkieTalkieToggle");
  const clearInterpreterBtn = document.getElementById("clearInterpreterBtn");

  let isEarphoneMode = false;
  let interpreterActiveRec = null;
  let currentInterpretedMl = "";
  let currentInterpretedEn = "";

  function openInterpreterModal() {
    if (twoWayInterpreterModal) twoWayInterpreterModal.classList.add("active");
  }

  function closeInterpreterModal() {
    if (twoWayInterpreterModal) twoWayInterpreterModal.classList.remove("active");
    stopInterpreterListening();
  }

  if (twoWayInterpreterBtn) twoWayInterpreterBtn.addEventListener("click", openInterpreterModal);
  if (closeInterpreterBtn) closeInterpreterBtn.addEventListener("click", closeInterpreterModal);

  // Audio Mode toggle (Speakerphone / Earphones)
  if (interpreterAudioModeBtn) {
    interpreterAudioModeBtn.addEventListener("click", () => {
      isEarphoneMode = !isEarphoneMode;
      if (isEarphoneMode) {
        interpreterAudioModeBtn.classList.add("earphone");
        if (audioModeIcon) audioModeIcon.textContent = "🎧";
        if (audioModeText) audioModeText.textContent = "Earphones";
      } else {
        interpreterAudioModeBtn.classList.remove("earphone");
        if (audioModeIcon) audioModeIcon.textContent = "📢";
        if (audioModeText) audioModeText.textContent = "Speaker";
      }
    });
  }

  function stopInterpreterListening() {
    if (interpreterActiveRec) {
      try { interpreterActiveRec.stop(); } catch(e){}
      interpreterActiveRec = null;
    }
    if (btnMicEnglish) {
      btnMicEnglish.classList.remove("listening");
      if (statusLabelEn) statusLabelEn.textContent = "Ready";
    }
    if (btnMicMalayalam) {
      btnMicMalayalam.classList.remove("listening");
      if (statusLabelMl) statusLabelMl.textContent = "തയ്യാറാണ്";
    }
    document.getElementById("panelEnglish")?.classList.remove("active-speaking");
    document.getElementById("panelMalayalam")?.classList.remove("active-speaking");
  }

  // Listen to English Speaker
  function startListeningEnglish() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Speech recognition is not supported in this browser. Please use Chrome, Edge, or Safari.");
      return;
    }

    stopInterpreterListening();

    const rec = new SpeechRecognition();
    rec.lang = "en-US";
    rec.continuous = false;
    rec.interimResults = true;
    interpreterActiveRec = rec;

    if (btnMicEnglish) {
      btnMicEnglish.classList.add("listening");
      if (statusLabelEn) statusLabelEn.textContent = "Listening...";
    }
    document.getElementById("panelEnglish")?.classList.add("active-speaking");
    if (placeholderEn) placeholderEn.style.display = "none";
    if (textEnSpoken) {
      textEnSpoken.style.display = "block";
      textEnSpoken.textContent = "Listening to English speech...";
    }

    rec.onresult = async (e) => {
      let transcript = "";
      for (let i = 0; i < e.results.length; i++) {
        transcript += e.results[i][0].transcript;
      }
      if (textEnSpoken) textEnSpoken.textContent = transcript;

      if (e.results[0].isFinal) {
        stopInterpreterListening();
        if (textMlTranslated) textMlTranslated.textContent = "Translating to Malayalam...";
        const res = await translator.translate(transcript, "en", "ml");
        currentInterpretedMl = res.translatedText;
        if (textMlTranslated) textMlTranslated.textContent = currentInterpretedMl;

        // Speak aloud in Malayalam to the user
        translator.speakAudio(currentInterpretedMl, "ml", isEarphoneMode);

        if (window.progressAnalytics) {
          window.progressAnalytics.addXP(15, "Interpreter Practice");
          updateHeaderStreakUI();
        }

        // Auto Walkie-Talkie turn switch
        if (autoWalkieTalkieToggle && autoWalkieTalkieToggle.checked) {
          setTimeout(() => {
            if (twoWayInterpreterModal && twoWayInterpreterModal.classList.contains("active")) {
              startListeningMalayalam();
            }
          }, 3200);
        }
      }
    };

    rec.onerror = (err) => {
      console.warn("[Interpreter] EN speech error:", err);
      stopInterpreterListening();
    };

    rec.onend = () => {
      stopInterpreterListening();
    };

    rec.start();
  }

  // Listen to Malayalam Speaker
  function startListeningMalayalam() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Speech recognition is not supported in this browser.");
      return;
    }

    stopInterpreterListening();

    const rec = new SpeechRecognition();
    rec.lang = "ml-IN";
    rec.continuous = false;
    rec.interimResults = true;
    interpreterActiveRec = rec;

    if (btnMicMalayalam) {
      btnMicMalayalam.classList.add("listening");
      if (statusLabelMl) statusLabelMl.textContent = "കേൾക്കുന്നു...";
    }
    document.getElementById("panelMalayalam")?.classList.add("active-speaking");
    if (placeholderMl) placeholderMl.style.display = "none";
    if (textMlSpoken) {
      textMlSpoken.style.display = "block";
      textMlSpoken.textContent = "നിങ്ങൾ പറയുന്നത് കേൾക്കുന്നു...";
    }

    rec.onresult = async (e) => {
      let transcript = "";
      for (let i = 0; i < e.results.length; i++) {
        transcript += e.results[i][0].transcript;
      }
      if (textMlSpoken) textMlSpoken.textContent = transcript;

      if (e.results[0].isFinal) {
        stopInterpreterListening();
        if (textEnTranslated) textEnTranslated.textContent = "Translating to natural English...";
        const res = await translator.translate(transcript, "ml", "en");
        currentInterpretedEn = res.translatedText;
        if (textEnTranslated) textEnTranslated.textContent = currentInterpretedEn;

        // Speak aloud in fluent English to foreigner
        translator.speakAudio(currentInterpretedEn, "en", isEarphoneMode);

        if (window.progressAnalytics) {
          window.progressAnalytics.addXP(15, "Interpreter Practice");
          updateHeaderStreakUI();
        }

        // Auto Walkie-Talkie turn switch
        if (autoWalkieTalkieToggle && autoWalkieTalkieToggle.checked) {
          setTimeout(() => {
            if (twoWayInterpreterModal && twoWayInterpreterModal.classList.contains("active")) {
              startListeningEnglish();
            }
          }, 3200);
        }
      }
    };

    rec.onerror = (err) => {
      console.warn("[Interpreter] ML speech error:", err);
      stopInterpreterListening();
    };

    rec.onend = () => {
      stopInterpreterListening();
    };

    rec.start();
  }

  if (btnMicEnglish) btnMicEnglish.addEventListener("click", startListeningEnglish);
  if (btnMicMalayalam) btnMicMalayalam.addEventListener("click", startListeningMalayalam);

  if (replayMlAudioBtn) {
    replayMlAudioBtn.addEventListener("click", () => {
      if (currentInterpretedMl) translator.speakAudio(currentInterpretedMl, "ml", isEarphoneMode);
    });
  }

  if (replayEnAudioBtn) {
    replayEnAudioBtn.addEventListener("click", () => {
      if (currentInterpretedEn) translator.speakAudio(currentInterpretedEn, "en", isEarphoneMode);
    });
  }

  if (clearInterpreterBtn) {
    clearInterpreterBtn.addEventListener("click", () => {
      stopInterpreterListening();
      if (placeholderEn) placeholderEn.style.display = "block";
      if (textEnSpoken) textEnSpoken.style.display = "none";
      if (textMlTranslated) textMlTranslated.textContent = "Tap the mic below and ask the other person to speak in English.";
      if (placeholderMl) placeholderMl.style.display = "block";
      if (textMlSpoken) textMlSpoken.style.display = "none";
      if (textEnTranslated) textEnTranslated.textContent = "Speak in Malayalam; the app will speak it aloud in fluent English!";
      currentInterpretedMl = "";
      currentInterpretedEn = "";
    });
  }

  // ==========================================
  // WhatsApp Voice-Note Mode Event Handlers
  // ==========================================
  const whatsappModeBtn = document.getElementById("whatsappModeBtn");
  const whatsappModal = document.getElementById("whatsappModal");
  const closeWhatsAppBtn = document.getElementById("closeWhatsAppBtn");
  const waSpeedBtn = document.getElementById("waSpeedBtn");
  const waRecordBtn = document.getElementById("waRecordBtn");

  if (whatsappModeBtn) {
    whatsappModeBtn.addEventListener("click", () => {
      whatsappModal.classList.add("active");
      renderWhatsAppFeed();
    });
  }
  if (closeWhatsAppBtn) {
    closeWhatsAppBtn.addEventListener("click", () => whatsappModal.classList.remove("active"));
  }
  if (waSpeedBtn) {
    waSpeedBtn.addEventListener("click", () => {
      const newSpeed = whatsappMode.toggleSpeed();
      waSpeedBtn.textContent = `${newSpeed}x`;
    });
  }
  if (waRecordBtn) {
    let waRec = null;
    let waInterval = null;
    let waSeconds = 0;
    let waTranscript = "";

    waRecordBtn.addEventListener("click", () => {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (!SpeechRecognition) {
        alert("Speech recognition is not supported in this browser. Please use Chrome or Edge.");
        return;
      }

      if (whatsappMode.isRecording) {
        // Stop recording
        whatsappMode.isRecording = false;
        waRecordBtn.classList.remove("recording");
        document.getElementById("waRecIndicator").classList.remove("active");
        document.getElementById("waStatusHint").textContent = "Sending voice note...";
        clearInterval(waInterval);
        if (waRec) waRec.stop();

        setTimeout(async () => {
          const textToSend = waTranscript.trim() || "Hello Maya! I am practicing English with you.";
          document.getElementById("waStatusHint").textContent = "Tap mic to speak";
          document.getElementById("waTimerDisplay").textContent = "0:00";
          const res = await whatsappMode.sendUserVoiceNote(textToSend, waSeconds || 4);
          renderWhatsAppFeed();
          // Auto speak Maya's reply
          speakCurrentText(res.mayaMsg.audioText, whatsappMode.currentPlaybackRate);
        }, 500);

      } else {
        // Start recording
        whatsappMode.isRecording = true;
        waSeconds = 0;
        waTranscript = "";
        waRecordBtn.classList.add("recording");
        document.getElementById("waRecIndicator").classList.add("active");
        document.getElementById("waStatusHint").textContent = "Listening... Speak now";

        waInterval = setInterval(() => {
          waSeconds++;
          const mins = Math.floor(waSeconds / 60);
          const secs = waSeconds % 60;
          document.getElementById("waTimerDisplay").textContent = `${mins}:${secs < 10 ? "0" : ""}${secs}`;
        }, 1000);

        waRec = new SpeechRecognition();
        waRec.continuous = true;
        waRec.interimResults = true;
        waRec.lang = "en-IN";

        waRec.onresult = (e) => {
          let str = "";
          for (let i = 0; i < e.results.length; i++) {
            str += e.results[i][0].transcript;
          }
          waTranscript = str;
        };
        waRec.onerror = () => {
          whatsappMode.isRecording = false;
          waRecordBtn.classList.remove("recording");
          document.getElementById("waRecIndicator").classList.remove("active");
          clearInterval(waInterval);
        };
        waRec.start();
      }
    });
  }

  // ==========================================
  // Shadowing Accent Player Event Handlers
  // ==========================================
  const shadowingBtn = document.getElementById("shadowingBtn");
  const shadowingModal = document.getElementById("shadowingModal");
  const closeShadowingBtn = document.getElementById("closeShadowingBtn");
  const shadowingDrillSelect = document.getElementById("shadowingDrillSelect");
  const listenShadowingBtn = document.getElementById("listenShadowingBtn");
  const recordShadowingBtn = document.getElementById("recordShadowingBtn");

  if (shadowingBtn) {
    shadowingBtn.addEventListener("click", () => {
      shadowingModal.classList.add("active");
      renderShadowingDrill();
    });
  }
  if (closeShadowingBtn) {
    closeShadowingBtn.addEventListener("click", () => shadowingModal.classList.remove("active"));
  }
  if (shadowingDrillSelect) {
    shadowingDrillSelect.addEventListener("change", (e) => {
      shadowing.setDrillIndex(parseInt(e.target.value, 10));
      renderShadowingDrill();
    });
  }
  if (listenShadowingBtn) {
    listenShadowingBtn.addEventListener("click", () => {
      const drill = shadowing.getCurrentDrill();
      speakCurrentText(drill.sentence, 0.85);
    });
  }
  if (recordShadowingBtn) {
    recordShadowingBtn.addEventListener("click", () => {
      startShadowingWorkflow();
    });
  }

  // ==========================================
  // Smart Vocab Book Event Handlers
  // ==========================================
  const vocabBookBtn = document.getElementById("vocabBookBtn");
  const vocabModal = document.getElementById("vocabModal");
  const closeVocabBtn = document.getElementById("closeVocabBtn");
  const vocabListViewBtn = document.getElementById("vocabListViewBtn");
  const vocabFlashcardViewBtn = document.getElementById("vocabFlashcardViewBtn");
  const vocabFilterSelect = document.getElementById("vocabFilterSelect");
  const flashcardBox = document.getElementById("flashcardBox");
  const fcFlipBtn = document.getElementById("fcFlipBtn");
  const fcReviewBtn = document.getElementById("fcReviewBtn");
  const fcMasteredBtn = document.getElementById("fcMasteredBtn");
  const fcNextBtn = document.getElementById("fcNextBtn");
  const fcListenBtn = document.getElementById("fcListenBtn");

  if (vocabBookBtn) {
    vocabBookBtn.addEventListener("click", () => {
      vocabModal.classList.add("active");
      renderVocabBook();
    });
  }
  if (closeVocabBtn) {
    closeVocabBtn.addEventListener("click", () => vocabModal.classList.remove("active"));
  }
  if (vocabListViewBtn && vocabFlashcardViewBtn) {
    vocabListViewBtn.addEventListener("click", () => {
      vocabListViewBtn.classList.add("active");
      vocabFlashcardViewBtn.classList.remove("active");
      document.getElementById("vocabListContainer").style.display = "flex";
      document.getElementById("vocabFlashcardContainer").style.display = "none";
      renderVocabList();
    });
    vocabFlashcardViewBtn.addEventListener("click", () => {
      vocabFlashcardViewBtn.classList.add("active");
      vocabListViewBtn.classList.remove("active");
      document.getElementById("vocabListContainer").style.display = "none";
      document.getElementById("vocabFlashcardContainer").style.display = "flex";
      renderFlashcardView();
    });
  }
  if (vocabFilterSelect) {
    vocabFilterSelect.addEventListener("change", () => renderVocabList());
  }
  if (flashcardBox) {
    flashcardBox.addEventListener("click", () => toggleFlashcardFlip());
  }
  if (fcFlipBtn) {
    fcFlipBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      toggleFlashcardFlip();
    });
  }
  if (fcNextBtn) {
    fcNextBtn.addEventListener("click", () => nextFlashcard());
  }
  if (fcMasteredBtn) {
    fcMasteredBtn.addEventListener("click", () => {
      const card = currentFlashcards[currentCardIdx];
      if (card) vocabBook.setMastery(card.id, "mastered");
      nextFlashcard();
    });
  }
  if (fcReviewBtn) {
    fcReviewBtn.addEventListener("click", () => {
      const card = currentFlashcards[currentCardIdx];
      if (card) vocabBook.setMastery(card.id, "review");
      nextFlashcard();
    });
  }
  if (fcListenBtn) {
    fcListenBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      const card = currentFlashcards[currentCardIdx];
      if (card) speakCurrentText(card.english);
    });
  }

  // ==========================================
  // Cloud Deploy Modal Event Handlers
  // ==========================================
  const cloudDeployBtn = document.getElementById("cloudDeployBtn");
  const deployModal = document.getElementById("deployModal");
  const closeDeployBtn = document.getElementById("closeDeployBtn");
  const closeDeployModalBtn = document.getElementById("closeDeployModalBtn");

  if (cloudDeployBtn) {
    cloudDeployBtn.addEventListener("click", () => deployModal.classList.add("active"));
  }
  if (closeDeployBtn) {
    closeDeployBtn.addEventListener("click", () => deployModal.classList.remove("active"));
  }
  if (closeDeployModalBtn) {
    closeDeployModalBtn.addEventListener("click", () => deployModal.classList.remove("active"));
  }
}

async function performLiveTranslation() {
  const input = document.getElementById("translatorInput");
  const output = document.getElementById("translatorOutputText");
  const badge = document.getElementById("translationEngineBadge");
  if (!input || !output) return;

  const text = input.value.trim();
  if (!text) return;

  output.textContent = "Translating... (വിവർത്തനം ചെയ്യുന്നു...)";
  const res = await translator.translate(text);
  output.textContent = res.translatedText;
  if (badge) badge.textContent = `Translated Output (${res.engine || "Google Translate"}):`;
}

window.quickTranslatePhrase = function(phrase) {
  const input = document.getElementById("translatorInput");
  if (input) {
    input.value = phrase;
    performLiveTranslation();
  }
};

// Global Accent Switcher Function
window.switchAccent = function(langCode, flag, name) {
  state.voiceAccent = langCode;
  localStorage.setItem("talkmalayali_voice_accent", langCode);

  const flagIcon = document.getElementById("accentFlagIcon");
  if (flagIcon) flagIcon.textContent = flag;

  const accentBtn = document.getElementById("accentQuickBtn");
  if (accentBtn) accentBtn.title = `Current Accent: ${name}`;

  const allItems = document.querySelectorAll(".accent-option-item");
  allItems.forEach(el => el.classList.remove("selected"));

  pickBestVoice();

  const modal = document.getElementById("accentModal");
  if (modal) modal.classList.remove("active");

  speakCurrentText(`Accent switched to ${name}. Let's continue practicing!`);
};

// GD Room View Controller
function openGDRoom() {
  const modal = document.getElementById("gdModal");
  if (modal) {
    modal.classList.add("active");
    resetGDRoomView();
  }
}

function resetGDRoomView() {
  const feed = document.getElementById("gdFeedBox");
  if (!feed) return;
  feed.innerHTML = "";

  const topic = gdRoom.getTopic();
  appendGDMessage("moderator", "Teacher Maya (Moderator)", "👩‍🏫", topic.moderatorIntro);
  speakCurrentText(topic.moderatorIntro);

  renderGDQuickPhrases(topic.quickContributions || []);
  highlightGDSpeaker("moderator");
}

function advanceGDTurn(userPoint = null) {
  const turn = gdRoom.getNextTurn(userPoint);
  appendGDMessage(turn.speaker, turn.name, turn.avatar, turn.text, turn.tip);
  highlightGDSpeaker(turn.speaker);
  speakCurrentText(turn.text);

  if (turn.quickReplies) {
    renderGDQuickPhrases(turn.quickReplies);
  }
}

function appendGDMessage(speakerClass, name, avatar, text, tip = null) {
  const feed = document.getElementById("gdFeedBox");
  if (!feed) return;

  const div = document.createElement("div");
  div.className = `gd-msg-card speaker-${speakerClass}`;
  
  let tipHtml = "";
  if (tip) {
    tipHtml = `<div style="font-size: 0.75rem; color: #a7f3d0; margin-top: 4px; font-style: italic;">💡 ${escapeHtml(tip)}</div>`;
  }

  div.innerHTML = `
    <div class="gd-speaker-header">
      <span>${avatar}</span>
      <span>${escapeHtml(name)}</span>
    </div>
    <div style="color: #f8fafc;">${escapeHtml(text)}</div>
    ${tipHtml}
  `;

  feed.appendChild(div);
  feed.scrollTop = feed.scrollHeight;
}

function highlightGDSpeaker(speaker) {
  const badges = {
    moderator: document.getElementById("badgeMaya"),
    arjun: document.getElementById("badgeArjun"),
    sneha: document.getElementById("badgeSneha"),
    user: document.getElementById("badgeUser")
  };

  Object.values(badges).forEach(b => {
    if (b) b.classList.remove("active");
  });

  if (badges[speaker]) {
    badges[speaker].classList.add("active");
  }
}

function renderGDQuickPhrases(phrases) {
  const tray = document.getElementById("gdQuickPhrases");
  if (!tray) return;
  tray.innerHTML = "";

  phrases.forEach(phrase => {
    const pill = document.createElement("button");
    pill.className = "quick-reply-pill";
    pill.innerHTML = `<span>💬</span> ${escapeHtml(phrase)}`;
    pill.addEventListener("click", () => {
      appendGDMessage("user", "You (Participant)", "👤", phrase);
      setTimeout(() => advanceGDTurn(phrase), 800);
    });
    tray.appendChild(pill);
  });
}

// Daily Challenge View Controller
function openDailyChallenge() {
  const modal = document.getElementById("dailyChallengeModal");
  if (!modal) return;

  const challenge = dailyChallenge.getCurrentChallenge();
  const dayNum = document.getElementById("challengeDayNum");
  const title = document.getElementById("challengeTitleText");
  const target = document.getElementById("challengeTargetText");

  if (dayNum) dayNum.textContent = dailyChallenge.currentDay;
  if (title) title.textContent = challenge.title;
  if (target) target.textContent = `${challenge.target} (${challenge.malayalamTitle})`;

  // Generate Canva Card
  const canvas = document.getElementById("shareCardCanvas");
  if (canvas) {
    const avgScore = pronunciation.getAverageScore();
    dailyChallenge.generateShareCard(canvas, "Learner", avgScore);
  }

  modal.classList.add("active");
}

// Global function to pick subject tag
window.selectSubjectTag = function(subjectName) {
  const input = document.getElementById("customSubjectInput");
  if (input) {
    input.value = subjectName;
    startDiscussionOnSubject(subjectName);
  }
};

function startDiscussionOnSubject(subjectName) {
  const modal = document.getElementById("customSubjectModal");
  if (modal) modal.classList.remove("active");

  tutor.setCustomSubject(subjectName);
  activeScenarioTitle.textContent = subjectName.length > 25 ? subjectName.substring(0, 22) + "..." : subjectName;
  activeScenarioIcon.textContent = "🎯";

  // Feed message
  chatFeed.innerHTML = "";
  appendUserMessage(`I want to learn and practice speaking in English about: ${subjectName}`);

  // Have Maya explain the topic and give speaking challenges
  setTimeout(async () => {
    tutorStatusText.textContent = "Teacher Maya is thinking...";
    state.visualizerIntensity = 0.4;
    const response = await tutor.generateResponse(`Tell me about ${subjectName} and ask me a speaking question`, { id: "any_subject", title: subjectName });
    appendTutorMessage(response);
    updateCallModeDisplay(response.englishResponse, response.malayalamResponse);
    speakCurrentText(response.englishResponse);
  }, 400);
}

function loadSavedSettings() {
  geminiApiKeyInput.value = tutor.getApiKey();
  learnerLevelSelect.value = tutor.userLevel;
  voiceAccentSelect.value = state.voiceAccent;
}

function escapeHtml(string) {
  if (!string) return "";
  const div = document.createElement("div");
  div.textContent = string;
  return div.innerHTML;
}

// ==========================================
// WhatsApp Voice-Note Controller Functions
// ==========================================
function renderWhatsAppFeed() {
  const feed = document.getElementById("whatsappFeed");
  if (!feed) return;
  feed.innerHTML = "";

  const messages = whatsappMode.getMessages();
  messages.forEach((msg) => {
    const bubble = document.createElement("div");
    bubble.className = `wa-bubble ${msg.sender}`;

    // Waveform simulation bars
    const barHeights = [8, 14, 20, 10, 16, 22, 12, 18, 14, 20, 10, 16, 12, 18, 10];
    const barsHtml = barHeights.map(h => `<div class="wa-bar" style="height: ${h}px;"></div>`).join("");

    let feedbackHtml = "";
    if (msg.feedback) {
      feedbackHtml = `<div class="wa-feedback-box">${escapeHtml(msg.feedback)}</div>`;
    }

    bubble.innerHTML = `
      <div style="font-size: 0.72rem; font-weight: 700; color: ${msg.sender === 'maya' ? '#25d366' : '#93c5fd'}; margin-bottom: 2px;">
        ${escapeHtml(msg.name)}
      </div>
      <div class="wa-voice-row">
        <button class="wa-play-btn" title="Play Voice Note">▶</button>
        <div class="wa-waveform">${barsHtml}</div>
        <span style="font-size: 0.75rem; color: #8696a0; font-weight: 600;">${msg.duration}</span>
      </div>
      <div style="font-size: 0.8rem; color: #e9edef; font-style: italic; margin-top: 2px;">
        "${escapeHtml(msg.audioText)}"
      </div>
      ${feedbackHtml}
      <div class="wa-meta">
        <span>Voice Message</span>
        <span>${msg.time} ${msg.sender === 'user' ? '✓✓' : ''}</span>
      </div>
    `;

    // Attach voice playback
    const playBtn = bubble.querySelector(".wa-play-btn");
    playBtn.addEventListener("click", () => {
      speakCurrentText(msg.audioText, whatsappMode.currentPlaybackRate);
    });

    feed.appendChild(bubble);
  });

  feed.scrollTop = feed.scrollHeight;
}

window.quickWhatsAppTopic = function(topicPrompt) {
  const feed = document.getElementById("whatsappFeed");
  if (!feed) return;

  // Add prompt from Maya
  whatsappMode.messages.push({
    id: "m_" + Date.now(),
    sender: "maya",
    name: "Teacher Maya 👩‍🏫",
    time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    duration: "0:09",
    audioText: topicPrompt,
    feedback: "ഈ വിഷയത്തെക്കുറിച്ച് 30 സെക്കൻഡ് സംസാരിച്ച് വോയ്‌സ് നോട്ട് അയക്കൂ!",
    played: false
  });
  renderWhatsAppFeed();
  speakCurrentText(topicPrompt, whatsappMode.currentPlaybackRate);
};

// ==========================================
// Shadowing Accent Player Controllers
// ==========================================
function renderShadowingDrill() {
  const drill = shadowing.getCurrentDrill();
  const select = document.getElementById("shadowingDrillSelect");
  const catBadge = document.getElementById("shadowingCategoryBadge");
  const targetText = document.getElementById("shadowingTargetText");
  const targetMl = document.getElementById("shadowingTargetMl");
  const phoneticPill = document.getElementById("shadowingPhoneticPill");
  const analysisBox = document.getElementById("shadowingAnalysisBox");

  if (select) select.value = shadowing.currentDrillIndex.toString();
  if (catBadge) catBadge.textContent = drill.category;
  if (targetText) targetText.textContent = `"${drill.sentence}"`;
  if (targetMl) targetMl.textContent = drill.malayalam;
  if (phoneticPill) phoneticPill.innerHTML = `🎯 Focus: <span>${escapeHtml(drill.phoneticFocus)}</span>`;
  if (analysisBox) analysisBox.style.display = "none";
}

function startShadowingWorkflow() {
  const countdownEl = document.getElementById("shadowingCountdown");
  const recordBtn = document.getElementById("recordShadowingBtn");
  const analysisBox = document.getElementById("shadowingAnalysisBox");
  if (!countdownEl || !recordBtn) return;

  // Step 1: 3-2-1 Countdown
  countdownEl.style.display = "flex";
  let count = 3;
  countdownEl.textContent = count;
  recordBtn.disabled = true;

  const countInterval = setInterval(() => {
    count--;
    if (count > 0) {
      countdownEl.textContent = count;
    } else {
      clearInterval(countInterval);
      countdownEl.style.display = "none";
      recordBtn.disabled = false;
      // Start Recording
      triggerShadowingRecognition();
    }
  }, 900);
}

function triggerShadowingRecognition() {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) {
    alert("Speech recognition not supported in this browser.");
    return;
  }

  const recordBtn = document.getElementById("recordShadowingBtn");
  recordBtn.innerHTML = `<span>🎙️</span> Listening... Speak Now!`;
  recordBtn.style.background = "#ef4444";

  const rec = new SpeechRecognition();
  rec.continuous = false;
  rec.interimResults = false;
  rec.lang = "en-IN";

  rec.onresult = (e) => {
    const spoken = e.results[0][0].transcript;
    const evalResult = shadowing.evaluateShadowing(spoken);
    displayShadowingEvaluation(evalResult);
  };

  rec.onerror = (e) => {
    console.warn("Shadowing error:", e);
    recordBtn.innerHTML = `<span>🎙️</span> 2. Echo & Repeat (കൂടെപ്പറയൂ)`;
    recordBtn.style.background = "linear-gradient(135deg, #ec4899, #a855f7)";
  };

  rec.onend = () => {
    recordBtn.innerHTML = `<span>🎙️</span> 2. Echo & Repeat (കൂടെപ്പറയൂ)`;
    recordBtn.style.background = "linear-gradient(135deg, #ec4899, #a855f7)";
  };

  rec.start();
}

function displayShadowingEvaluation(result) {
  const analysisBox = document.getElementById("shadowingAnalysisBox");
  const scoreBadge = document.getElementById("shadowingScoreBadge");
  const flow = document.getElementById("shadowingWordsFlow");
  const tipMl = document.getElementById("shadowingTipMl");
  if (!analysisBox || !flow) return;

  analysisBox.style.display = "flex";
  scoreBadge.textContent = `${result.accuracy}% Match`;
  scoreBadge.style.background = result.accuracy >= 80 ? "#10b981" : (result.accuracy >= 60 ? "#f59e0b" : "#ef4444");

  flow.innerHTML = "";
  result.wordAnalysis.forEach(item => {
    const pill = document.createElement("span");
    pill.className = `word-pill ${item.status}`;
    const icon = item.status === "correct" ? "✓" : (item.status === "close" ? "~" : "✗");
    pill.innerHTML = `<span>${icon}</span> ${escapeHtml(item.word)}`;
    flow.appendChild(pill);
  });

  if (tipMl) {
    tipMl.innerHTML = `
      <div style="font-weight: 700; color: #a7f3d0; margin-bottom: 4px;">നിങ്ങൾ പറഞ്ഞത്: "${escapeHtml(result.spokenText)}"</div>
      <div>${escapeHtml(result.feedbackMalayalam)}</div>
      <div style="font-size: 0.78rem; color: #fde68a; margin-top: 4px;">ശ്രദ്ധിക്കേണ്ട ഉച്ചാരണം: ${escapeHtml(result.phoneticFocus)}</div>
    `;
  }
}

// ==========================================
// Smart Vocab Book & Flashcards Controllers
// ==========================================
let currentFlashcards = [];
let currentCardIdx = 0;

function renderVocabBook() {
  const totalCount = document.getElementById("vocabTotalCount");
  if (totalCount) {
    totalCount.textContent = vocabBook.items.length;
  }
  renderVocabList();
}

function renderVocabList() {
  const container = document.getElementById("vocabListContainer");
  const filter = document.getElementById("vocabFilterSelect")?.value || "all";
  if (!container) return;

  const items = vocabBook.getItems(filter);
  container.innerHTML = "";

  if (items.length === 0) {
    container.innerHTML = `<div style="text-align: center; color: #8696a0; padding: 20px;">ഈ വിഭാഗത്തിൽ ഇതുവരെ വാക്കുകൾ ചേർത്തിട്ടില്ല. ചാറ്റിലെ ⭐️ ബട്ടൺ വഴി സേവ് ചെയ്യാം!</div>`;
    return;
  }

  items.forEach(item => {
    const card = document.createElement("div");
    card.className = "vocab-item-card";
    card.innerHTML = `
      <div>
        <span class="vocab-meta-tag">${escapeHtml(item.tag)}</span>
        <div style="font-weight: 700; font-size: 1rem; color: #f8fafc;">${escapeHtml(item.english)}</div>
        <div style="font-family: var(--font-malayalam); font-size: 0.85rem; color: #a7f3d0; margin-top: 2px;">
          ${escapeHtml(item.malayalam)}
        </div>
      </div>
      <div style="display: flex; gap: 8px; align-items: center;">
        <button class="btn-audio-listen" title="Listen Pronunciation"><span>🔊</span></button>
        <button class="btn-icon-subtle" style="color: #ef4444; font-size: 0.85rem;" title="Remove word">🗑️</button>
      </div>
    `;

    card.querySelector(".btn-audio-listen").addEventListener("click", () => speakCurrentText(item.english));
    card.querySelector(".btn-icon-subtle").addEventListener("click", () => {
      vocabBook.deletePhrase(item.id);
      renderVocabBook();
    });

    container.appendChild(card);
  });
}

function renderFlashcardView() {
  currentFlashcards = vocabBook.getFlashcardList();
  currentCardIdx = 0;
  displayFlashcard();
}

function displayFlashcard() {
  if (!currentFlashcards.length) return;
  const card = currentFlashcards[currentCardIdx];
  const inner = document.getElementById("flashcardInner");
  const counter = document.getElementById("fcCounter");
  const frontTag = document.getElementById("fcFrontTag");
  const frontText = document.getElementById("fcFrontText");
  const backText = document.getElementById("fcBackText");

  if (inner) inner.classList.remove("flipped");
  if (counter) counter.textContent = `Card ${currentCardIdx + 1} of ${currentFlashcards.length}`;
  if (frontTag) frontTag.textContent = card.tag;
  if (frontText) frontText.textContent = card.english;
  if (backText) backText.textContent = card.malayalam;
}

function toggleFlashcardFlip() {
  const inner = document.getElementById("flashcardInner");
  if (inner) inner.classList.toggle("flipped");
}

function nextFlashcard() {
  if (!currentFlashcards.length) return;
  currentCardIdx = (currentCardIdx + 1) % currentFlashcards.length;
  displayFlashcard();
}


