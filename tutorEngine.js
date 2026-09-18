/**
 * TutorEngine - Intelligent Bilingual (Malayalam - English) Conversational AI Teacher
 * Provides live human-like conversational feedback, Malayalam explanations, and optional Gemini LLM integration.
 */

const COMMON_MALAYALI_ERRORS = [
  {
    pattern: /\bmyself\s+([a-z]+)\b/i,
    replacement: "I am $1 / My name is $1",
    explanation: "In English, avoid starting with 'Myself'. Instead say 'I am...' or 'My name is...'. (മലയാളത്തിൽ 'ഞാൻ ഇന്നയാളാണ്' എന്ന് പറയുന്നതുപോലെ 'I am' എന്ന് ഉപയോഗിക്കുക)",
    ruleName: "Self Introduction"
  },
  {
    pattern: /\b([a-z]+)\s+only\b/i,
    replacement: "just $1 / $1",
    explanation: "Using 'only' for emphasis (e.g., 'yesterday only', 'now only') comes from Malayalam '-ആണ്' suffix ('ഇന്നലെയാണ്'). In English, use 'just yesterday' or simply 'yesterday'.",
    ruleName: "Direct translation of -ആണ് (Only)"
  },
  {
    pattern: /\bhave\s+(a\s+)?doubt\b/i,
    replacement: "have a question / need clarification",
    explanation: "Native English speakers say 'I have a question' rather than 'I have a doubt'. 'Doubt' sounds like you mistrust someone! (സംശയം ചോദിക്കാൻ 'I have a question' എന്ന് പറയൂ)",
    ruleName: "Doubt vs Question"
  },
  {
    pattern: /\bpassed?\s+out\s+from\b/i,
    replacement: "graduated from / completed my studies at",
    explanation: "In standard English, 'pass out' means to faint or lose consciousness! Use 'I graduated from college' instead. (കോളേജ് പഠനം കഴിഞ്ഞാൽ 'I graduated' എന്ന് പറയണം)",
    ruleName: "Pass out vs Graduate"
  },
  {
    pattern: /\bdid\s+(not|n't)?\s*(went|came|saw|told|ate|bought|wrote)\b/i,
    replacement: "did not go / come / see / tell / eat / buy / write",
    explanation: "After 'did' or 'didn't', always use the base present form of the verb (e.g., 'did not go', NOT 'did not went').",
    ruleName: "Past Tense with 'Did'"
  },
  {
    pattern: /\bprepone\b/i,
    replacement: "reschedule / bring forward",
    explanation: "'Prepone' is Indian English. In international English or MNCs, use 'bring the meeting forward' or 'move it earlier'.",
    ruleName: "Prepone"
  },
  {
    pattern: /\brevert\s+back\b/i,
    replacement: "reply / get back to you",
    explanation: "Use 'revert' alone or simply 'I will get back to you' or 'reply'. 'Revert back' is redundant.",
    ruleName: "Revert Back"
  },
  {
    pattern: /\bcousin\s+(brother|sister)\b/i,
    replacement: "cousin",
    explanation: "In English, simply say 'my cousin'. You can clarify gender with 'he' or 'she'. (കസിൻ ബ്രദർ എന്ന് വേണ്ട, 'cousin' എന്ന് മാത്രം മതി)",
    ruleName: "Cousin brother/sister"
  },
  {
    pattern: /\b(took|had)\s+my\s+food\b/i,
    replacement: "had lunch / had dinner / ate breakfast",
    explanation: "Instead of 'I took my food', say 'I had my lunch' or 'I have eaten'. (ഭക്ഷണം കഴിച്ചു എന്ന് പറയാൻ 'I had my lunch/dinner' എന്ന് പറയാം)",
    ruleName: "Took my food"
  },
  {
    pattern: /\bcut\s+the\s+call\b/i,
    replacement: "disconnect the call / hang up",
    explanation: "Instead of 'cut the call', say 'hang up' or 'disconnect'. (ഫോൺ വെക്കാൻ 'hang up' എന്ന് പറയാം)",
    ruleName: "Cut the call"
  },
  {
    pattern: /\bsleep\s+is\s+coming\b/i,
    replacement: "I am feeling sleepy / drowsy",
    explanation: "Literal translation of 'ഉറക്കം വരുന്നു'. In English, say 'I am feeling sleepy'.",
    ruleName: "Sleep is coming"
  },
  {
    pattern: /\bwhat\s+is\s+your\s+good\s+name\b/i,
    replacement: "May I have your name, please? / What is your name?",
    explanation: "'Good name' is a literal translation of 'ശുഭ് നാം / നല്ല പേര്'. In English, simply ask 'What is your name?' or 'May I know your name?'",
    ruleName: "Good name"
  },
  {
    pattern: /\b(go|going|went)\s+to\s+home\b/i,
    replacement: "$1 home",
    explanation: "In English, never say 'going to home'! Say 'I am going home'. 'Home' acts as an adverb of direction, so the preposition 'to' is never used. (വീട്ടിലേക്ക് പോകുന്നു എന്ന് പറയാൻ 'I am going home' എന്ന് പറയുക, 'to home' എന്ന് പറയരുത്).",
    ruleName: "Going to home vs Going home"
  }
];

// Manglish & Malayalam translation helper dictionary
const MANGLISH_PATTERNS = [
  {
    matches: ["nale varan pattilla", "naale varilla", "varaൻ pattilla", "നാളെ വരാൻ പറ്റില്ല", "വരാൻ കഴിയില്ല"],
    english: "I won't be able to come tomorrow. / I can't make it tomorrow.",
    malayalam: "എനിക്ക് നാളെ വരാൻ സാധിക്കില്ല.",
    tip: "Professional way to inform absence: 'I am afraid I won't be able to make it tomorrow.'"
  },
  {
    matches: ["kurachu kazhinju vilikkam", "pinne vilikkam", "kurach kazhinj vilikkam", "പിന്നെ വിളിക്കാം", "കുറച്ച് കഴിഞ്ഞ് വിളിക്കാം"],
    english: "I will call you in a bit. / I'll call you back shortly.",
    malayalam: "ഞാൻ കുറച്ച് കഴിഞ്ഞ് തിരിച്ചു വിളിക്കാം.",
    tip: "Use 'I'll call you back in a while' for casual chat, or 'I'll get back to you shortly' for office calls."
  },
  {
    matches: ["sukhamano", "sukham aano", "സുഖമാണോ", "vishesham entha", "enthokke undu vishesham", "എന്തൊക്കെയുണ്ട് വിശേഷങ്ങൾ"],
    english: "How are you doing? / How have you been?",
    malayalam: "വിശേഷങ്ങൾ എങ്ങനെയുണ്ട്? സുഖമാണോ?",
    tip: "Instead of always 'How are you?', try saying: 'How is it going?' or 'How have you been doing?'"
  },
  {
    matches: ["nanni", "valare nanni", "നന്ദി", "വളരെ നന്ദി"],
    english: "Thank you so much! / I really appreciate your help.",
    malayalam: "നിങ്ങളുടെ സഹായത്തിന് വളരെ നന്ദി.",
    tip: "'I really appreciate it' sounds much more warm and native than a plain 'Thanks'."
  },
  {
    matches: ["enikku doubt undu", "oru doubt undu", "doubt und", "ഒരു സംശയമുണ്ട്", "സംശയം ചോദിക്കാൻ"],
    english: "I have a quick question. / Could you please clarify this for me?",
    malayalam: "എനിക്ക് ഒരു കാര്യം ചോദിക്കാനുണ്ട് / വ്യക്തത വേണം.",
    tip: "Remember: Say 'I have a question' rather than 'I have a doubt'!"
  },
  {
    matches: ["parayan ariyilla", "parayan madi", "pediyanu", "samshayam", "പേടിയാണ്", "മടിയാണ്"],
    english: "I feel a bit hesitant to speak, but I want to practice and improve!",
    malayalam: "സംസാരിക്കാൻ ചെറിയ പേടിയുണ്ട്, പക്ഷെ എനിക്ക് പഠിക്കണം!",
    tip: "Don't worry about mistakes! Speaking with mistakes is the only way to become fluent. You are doing great."
  }
];

// Subject-specific knowledge base for learning and speaking about ANY topic
const SUBJECT_KNOWLEDGE_BASE = [
  {
    category: "Technology & AI",
    keywords: ["ai", "artificial intelligence", "tech", "technology", "coding", "software", "computer", "chatgpt", "machine learning", "internet", "robot"],
    title: "Artificial Intelligence & Technology (സാങ്കേതികവിദ്യ & AI)",
    englishIntro: "Artificial Intelligence (AI) refers to computer systems that can perform tasks normally requiring human intelligence, like problem-solving and language translation.",
    malayalamIntro: "മനുഷ്യന്റെ ബുദ്ധിശക്തി ആവശ്യമുള്ള കാര്യങ്ങൾ (ഭാഷാ വിവർത്തനം, പ്രശ്നപരിഹാരം എന്നിവ) ചെയ്യാൻ കമ്പ്യൂട്ടറുകളെ പ്രാപ്തമാക്കുന്ന സാങ്കേതികവിദ്യയാണ് ആർട്ടിഫിഷ്യൽ ഇന്റലിജൻസ് (AI).",
    keyVocab: "Key Term: 'Automation' (യാന്ത്രികമാക്കൽ) - using technology to do tasks with minimal human intervention.",
    speakingChallenge: "How do you think AI or smartphones have changed our daily lives in Kerala?",
    quickReplies: [
      "AI makes our work faster and more efficient.",
      "Smartphones have connected people across the world.",
      "What are the best tools to learn coding?",
      "Can AI replace human jobs in the future?"
    ]
  },
  {
    category: "Sports & Football",
    keywords: ["football", "sports", "cricket", "messi", "ronaldo", "match", "game", "kerala blasters", "world cup", "fitness", "workout"],
    title: "Sports & Football (കായികം & ഫുട്ബോൾ)",
    englishIntro: "Football is the most popular sport in Kerala! It teaches teamwork, perseverance, and rapid decision-making under high pressure.",
    malayalamIntro: "കേരളത്തിൽ ഏറ്റവും കൂടുതൽ ആളുകൾ ഇഷ്ടപ്പെടുന്ന കായിക വിനോദമാണ് ഫുട്ബോൾ. കഠിനാധ്വാനം, ഒത്തൊരുമ, പെട്ടെന്നുള്ള തീരുമാനങ്ങൾ എന്നിവ ഇത് നമ്മെ പഠിപ്പിക്കുന്നു.",
    keyVocab: "Key Term: 'Sportsmanship' (കായിക മനോഭാവം) - fair, respectful and generous behavior on the field.",
    speakingChallenge: "Who is your favorite football player or sports idol, and why do you admire them?",
    quickReplies: [
      "My favorite football player is Lionel Messi.",
      "I love playing football on weekends with my friends.",
      "Sports helps us stay physically and mentally fit.",
      "How was the last Kerala Blasters match?"
    ]
  },
  {
    category: "Science & Space",
    keywords: ["science", "space", "planet", "stars", "black hole", "gravity", "physics", "universe", "mars", "moon", "earth"],
    title: "Science & Space Exploration (ശാസ്ത്രം & ബഹിരാകാശം)",
    englishIntro: "Space is vast and constantly expanding. Did you know that light takes about 8 minutes and 20 seconds to travel from the Sun to Earth?",
    malayalamIntro: "ബഹിരാകാശം അനന്തമായി വികസിച്ചുകൊണ്ടിരിക്കുകയാണ്. സൂര്യനിൽ നിന്നുള്ള പ്രകാശം ഭൂമിയിലെത്താൻ ഏകദേശം 8 മിനിറ്റും 20 സെക്കന്റും എടുക്കുമെന്ന് അറിയാമോ?",
    keyVocab: "Key Term: 'Gravitational force' (ഗുരുത്വാകർഷണ ബലം) - the natural pull that keeps planets orbiting the Sun.",
    speakingChallenge: "If you were offered a chance to travel into space or visit Mars, would you go? Tell me why in English!",
    quickReplies: [
      "I would love to travel into space to see Earth from above.",
      "Space exploration is thrilling and mysterious.",
      "How do black holes form in space?",
      "Why is gravity important for life on Earth?"
    ]
  },
  {
    category: "Health & Nutrition",
    keywords: ["health", "food", "diet", "nutrition", "doctor", "medicine", "exercise", "yoga", "gym", "sleep", "water", "hospital"],
    title: "Health, Food & Fitness (ആരോഗ്യം & ഭക്ഷണം)",
    englishIntro: "Good health is a combination of nutritious food, daily physical activity, proper hydration, and restful sleep.",
    malayalamIntro: "നല്ല ഭക്ഷണം, കൃത്യമായ വ്യായാമം, ആവശ്യത്തിന് വെള്ളം കുടിക്കൽ, നല്ല ഉറക്കം എന്നിവയാണ് ആരോഗ്യത്തിന്റെ അടിസ്ഥാനം.",
    keyVocab: "Key Term: 'Balanced diet' (സമീകൃതാഹാരം) - eating meals that provide all essential vitamins and nutrients.",
    speakingChallenge: "What is your morning routine to stay energetic and healthy throughout the day?",
    quickReplies: [
      "I make sure to drink plenty of water every morning.",
      "Eating fresh home-cooked food keeps me healthy.",
      "Walking every day is great for heart health.",
      "How to politely schedule a doctor appointment?"
    ]
  },
  {
    category: "Business & Finance",
    keywords: ["business", "money", "finance", "startup", "investment", "job", "career", "salary", "marketing", "sales", "gulf"],
    title: "Business & Career Growth (ബിസിനസ്സ് & കരിയർ)",
    englishIntro: "Successful businesses focus on solving real customer problems with honesty, excellent service, and clear communication.",
    malayalamIntro: "ഉപഭോക്താക്കളുടെ പ്രശ്നങ്ങൾക്ക് കൃത്യമായ പരിഹാരം കാണുന്നതിലൂടെയും മികച്ച സേവനത്തിലൂടെയുമാണ് നല്ല ബിസിനസ്സുകൾ വിജയിക്കുന്നത്.",
    keyVocab: "Key Term: 'Entrepreneur' (സംരംഭകൻ) - a person who creates a new business, taking risks in pursuit of profit.",
    speakingChallenge: "If you had the capital to start any business in Kerala or Dubai, what business would you choose?",
    quickReplies: [
      "I would love to launch a tech startup.",
      "Customer satisfaction is the most important factor in business.",
      "How do I present a project to international investors?",
      "What are the best tips to negotiate salary?"
    ]
  },
  {
    category: "Cinema & Music",
    keywords: ["movie", "cinema", "film", "music", "song", "actor", "mohanlal", "mammootty", "hollywood", "direction", "story"],
    title: "Cinema & Arts (സിനിമ & സംഗീതം)",
    englishIntro: "Cinema is a powerful storytelling medium. Malayalam cinema is renowned across the nation for realistic scripts and heartfelt performances.",
    malayalamIntro: "മനോഹരമായ കഥകൾ പറയുന്ന ഒരു മാധ്യമമാണ് സിനിമ. സ്വാഭാവികമായ കഥാപാത്രങ്ങളിലൂടെയും തിരക്കഥകളിലൂടെയും മലയാള സിനിമ ഇന്ന് ഇന്ത്യ മുഴുവൻ ശ്രദ്ധിക്കപ്പെടുന്നു.",
    keyVocab: "Key Term: 'Cinematography' (ഛായാഗ്രഹണം) - the art of capturing moving pictures with lighting and camera angles.",
    speakingChallenge: "What is the most memorable movie you watched recently, and what did you love about it?",
    quickReplies: [
      "I love movies that have strong, realistic storylines.",
      "The background music elevated the entire scene.",
      "Who is your all-time favorite actor?",
      "How do I describe a movie plot in English?"
    ]
  }
];

class TutorEngine {
  constructor() {
    this.apiKey = localStorage.getItem("talkmalayali_gemini_key") || "";
    let storedModel = localStorage.getItem("talkmalayali_gemini_model");
    if (storedModel === "gemini-2.0-flash") {
      storedModel = "gemini-3.6-flash";
      localStorage.setItem("talkmalayali_gemini_model", storedModel);
    }
    this.modelName = storedModel || "gemini-3.6-flash";
    this.currentScenarioId = "any_subject";
    this.customSubject = localStorage.getItem("talkmalayali_custom_subject") || "Any Topic";
    this.history = [];
    this.userLevel = localStorage.getItem("talkmalayali_level") || "beginner";
  }

  setApiKey(key) {
    this.apiKey = key ? key.trim() : "";
    if (this.apiKey) {
      localStorage.setItem("talkmalayali_gemini_key", this.apiKey);
    } else {
      localStorage.removeItem("talkmalayali_gemini_key");
    }
  }

  getApiKey() {
    return this.apiKey;
  }

  setModelName(model) {
    this.modelName = (model && model !== "gemini-2.0-flash") ? model : "gemini-3.6-flash";
    localStorage.setItem("talkmalayali_gemini_model", this.modelName);
  }

  getModelName() {
    return this.modelName;
  }

  /**
   * Test Gemini API connection and measure latency
   */
  async testApiKey(testKey, model = "gemini-3.6-flash") {
    const key = testKey ? testKey.trim() : this.apiKey;
    if (!key) throw new Error("Please enter your Gemini API key first.");
    
    let targetModel = model || this.modelName;
    if (targetModel === "gemini-2.0-flash") {
      targetModel = "gemini-3.6-flash";
    }
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${targetModel}:generateContent?key=${key}`;
    const startTime = performance.now();

    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ role: "user", parts: [{ text: "Hello! Respond with: {\"status\":\"ready\"}" }] }],
        generationConfig: {
          maxOutputTokens: 30,
          response_mime_type: "application/json"
        }
      })
    });

    const latency = Math.round(performance.now() - startTime);

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.error?.message || `Gemini API error (Status ${response.status})`);
    }

    return { success: true, latency, model: targetModel };
  }

  setUserLevel(level) {
    this.userLevel = level;
    localStorage.setItem("talkmalayali_level", level);
  }

  setScenario(scenarioId) {
    this.currentScenarioId = scenarioId;
    this.history = [];
  }

  setCustomSubject(subject) {
    this.customSubject = subject ? subject.trim() : "Any Topic";
    localStorage.setItem("talkmalayali_custom_subject", this.customSubject);
    this.currentScenarioId = "any_subject";
    this.history = [];
  }

  getCustomSubject() {
    return this.customSubject;
  }

  /**
   * Check for common Malayalam learner grammatical slip-ups
   */
  detectGrammarIssues(text) {
    for (const item of COMMON_MALAYALI_ERRORS) {
      if (item.pattern.test(text)) {
        const corrected = text.replace(item.pattern, item.replacement);
        return {
          detected: true,
          original: text,
          suggested: corrected,
          rule: item.ruleName,
          explanation: item.explanation
        };
      }
    }
    return null;
  }

  /**
   * Check if input contains Malayalam script or common Manglish phrases
   */
  detectMalayalamOrManglish(text) {
    const clean = text.toLowerCase().trim();
    // Check Malayalam Unicode range \u0D00-\u0D7F
    const hasMalayalamScript = /[\u0D00-\u0D7F]/.test(text);

    for (const pattern of MANGLISH_PATTERNS) {
      for (const phrase of pattern.matches) {
        if (clean.includes(phrase.toLowerCase())) {
          return {
            isManglishOrMalayalam: true,
            hasScript: hasMalayalamScript,
            matchedPhrase: phrase,
            englishEquivalent: pattern.english,
            malayalam: pattern.malayalam,
            tip: pattern.tip
          };
        }
      }
    }

    if (hasMalayalamScript) {
      return {
        isManglishOrMalayalam: true,
        hasScript: true,
        matchedPhrase: text,
        englishEquivalent: "How do I express this in English?",
        malayalam: text,
        tip: "Great! Let's translate this thought into natural spoken English."
      };
    }

    return null;
  }

  /**
   * Main method to generate teacher response
   */
  async generateResponse(userInput, scenarioData) {
    const trimmed = userInput.trim();
    const grammarFeedback = this.detectGrammarIssues(trimmed);
    const malayalamDetection = this.detectMalayalamOrManglish(trimmed);

    // If Gemini API Key is configured, use online LLM for dynamic responses
    if (this.apiKey) {
      try {
        const onlineResult = await this.callGeminiApi(trimmed, scenarioData, grammarFeedback, malayalamDetection);
        if (onlineResult) {
          this.history.push({ role: "user", content: trimmed });
          this.history.push({ role: "assistant", content: onlineResult.englishResponse });
          return onlineResult;
        }
      } catch (err) {
        console.warn("Gemini API call encountered an error. Falling back to built-in smart engine:", err);
      }
    }

    // Built-in Smart Tutor Engine (Offline / Instant / Zero Setup)
    return this.generateBuiltinResponse(trimmed, scenarioData, grammarFeedback, malayalamDetection);
  }

  /**
   * Built-in dynamic conversational tutor engine
   */
  generateBuiltinResponse(userInput, scenarioData, grammarFeedback, malayalamDetection) {
    const lower = userInput.toLowerCase();
    const scenarioId = scenarioData?.id || this.currentScenarioId;

    let englishResponse = "";
    let malayalamResponse = "";
    let fluencyTip = "";
    let quickReplies = [];

    // Check if input matches any specific subject in our Subject Knowledge Base
    const matchedSubject = SUBJECT_KNOWLEDGE_BASE.find(sub => 
      sub.keywords.some(kw => lower.includes(kw))
    );

    // Case 1: User asked something in Malayalam or Manglish
    if (malayalamDetection) {
      englishResponse = `Here is how you say that naturally in English: "${malayalamDetection.englishEquivalent}". Try repeating this sentence aloud after me!`;
      malayalamResponse = `ഇത് ഇംഗ്ലീഷിൽ സ്വാഭാവികമായി ഇങ്ങനെ പറയാം: "${malayalamDetection.englishEquivalent}". എന്നോടൊപ്പം ഇത് ഉച്ചത്തിൽ പറഞ്ഞു നോക്കൂ!`;
      fluencyTip = malayalamDetection.tip;
      quickReplies = [
        malayalamDetection.englishEquivalent.split("/")[0].trim(),
        "Could you say that once more slowly?",
        "How can I use this in an office situation?",
        "Teach me another daily English phrase."
      ];
    }
    // Case 2: Date & Time Spontaneous Questions
    else if (lower.includes("date today") || lower.includes("what date") || lower.includes("what is the date") || lower.includes("today date") || lower.includes("innathe date")) {
      const now = new Date();
      const dateStr = now.toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" });
      englishResponse = `Today is ${dateStr}. In English, you can answer: "Today is ${dateStr}." Are you planning anything special for today?`;
      malayalamResponse = `ഇന്ന് ${dateStr} ആണ്. ഇംഗ്ലീഷിൽ തീയതി പറയുമ്പോൾ "Today is..." എന്ന് തുടങ്ങുക. ഇന്ന് എന്തെങ്കിലും പ്രത്യേക പരിപാടികൾ ഉണ്ടോ?`;
      fluencyTip = "Date Tip: In English, write 'September 12th' or '12 September'. When speaking, say 'September twelfth'.";
      quickReplies = [
        "Today is a regular working day for me.",
        "I am planning to meet my friends today.",
        "What day of the week is tomorrow?",
        "Could you teach me how to ask for the time?"
      ];
    }
    else if (lower.includes("what time") || lower.includes("time is it") || lower.includes("what is the time") || lower.includes("samayam ethra")) {
      const now = new Date();
      const timeStr = now.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });
      englishResponse = `Right now, the time is ${timeStr}. You can naturally say: "It's ${timeStr}" or "The time is ${timeStr}".`;
      malayalamResponse = `ഇപ്പോൾ സമയം ${timeStr} ആണ്. സമയം പറയാൻ "It is..." എന്ന് ഉപയോഗിക്കാം.`;
      fluencyTip = "Time Tip: Instead of saying 'time is 7 PM', native speakers say 'It's seven o'clock' or 'It's seven in the evening'.";
      quickReplies = [
        "Thank you for letting me know the time.",
        "I need to leave in thirty minutes.",
        "How do I say 'quarter past five' in English?",
        "What time do you usually wake up?"
      ];
    }
    // Case 3: Going Home / Traveling / Commuting
    else if (lower.includes("going home") || lower.includes("going to home") || lower.includes("reach home") || lower.includes("veettil pokunnu")) {
      englishResponse = "Have a safe journey home! When you arrive, make sure to take good rest and enjoy your evening with family. What do you usually do once you get home?";
      malayalamResponse = "വീട്ടിലേക്ക് സുരക്ഷിതമായി എത്തട്ടെ! വീട്ടിലെത്തിയാൽ നന്നായി വിശ്രമിക്കൂ. സാധാരണ വീട്ടിൽ ചെന്നാൽ എന്തൊക്കെയാണ് ചെയ്യാറുള്ളത്?";
      fluencyTip = "Grammar Rule: Remember to say 'I am going home', NEVER 'going to home'!";
      quickReplies = [
        "I will relax and have dinner with my family.",
        "I have to complete some pending work tonight.",
        "Traffic is usually quite heavy at this time.",
        "I am looking forward to a good night's sleep."
      ];
    }
    // Case 4: Subject-specific discussion (AI, Sports, Science, Space, Health, Movies, Business, etc.)
    else if (matchedSubject) {
      const subject = matchedSubject;
      englishResponse = `${subject.englishIntro} ${subject.speakingChallenge}`;
      malayalamResponse = `${subject.malayalamIntro} ${subject.keyVocab}`;
      fluencyTip = subject.keyVocab;
      quickReplies = subject.quickReplies;
    }
    // Case 5: Greeting
    else if (lower.includes("hello") || lower.includes("hi maya") || lower.includes("hi teacher") || lower.includes("hey")) {
      englishResponse = "Hello there! It's so good to hear your voice. I'm proud of you for taking time to practice English today. What would you like to talk about?";
      malayalamResponse = "ഹലോ! ഇന്ന് ഇംഗ്ലീഷ് സംസാരിക്കാൻ സമയം കണ്ടെത്തിയതിൽ വളരെ സന്തോഷം. ഇന്ന് നമുക്ക് എന്തിനെക്കുറിച്ചാണ് സംസാരിക്കേണ്ടത്?";
      fluencyTip = "Tip: When someone greets you warmly, smiling while speaking naturally makes your voice sound confident!";
      quickReplies = [
        "I want to practice my self-introduction.",
        "Can we talk about my daily routine?",
        "I want to prepare for a job interview.",
        "How was your day, Maya?"
      ];
    }
    // Case 3: Self-introduction / Job Interview responses
    else if (scenarioId === "job_interview" || lower.includes("myself") || lower.includes("my name is") || lower.includes("graduated")) {
      englishResponse = "That was a great start! Speaking clearly and keeping good eye contact creates a strong impression. Could you tell me about your biggest strength or a project you enjoyed working on?";
      malayalamResponse = "വളരെ നല്ല തുടക്കം! ശാന്തമായി വ്യക്തതയോടെ സംസാരിക്കുന്നത് ഇന്റർവ്യൂവിൽ വലിയ മതിപ്പുണ്ടാക്കും. നിങ്ങളുടെ പ്രധാന കഴിവുകളെക്കുറിച്ചോ വിജയകരമായി ചെയ്ത ഒരു പ്രൊജക്റ്റിനെക്കുറിച്ചോ പറയാമോ?";
      fluencyTip = "Interview Tip: Always structure your answers with: Situation -> Action -> Result (STAR method).";
      quickReplies = [
        "My biggest strength is my problem-solving ability.",
        "I enjoy working in a team and learning new skills.",
        "I completed a challenging project under tight deadlines.",
        "Could you suggest a better way to introduce myself?"
      ];
    }
    // Case 4: Office Meeting / Daily Standup
    else if (scenarioId === "office_meeting" || lower.includes("meeting") || lower.includes("client") || lower.includes("report")) {
      englishResponse = "Understood! In meetings, it helps to be concise and proactive. When you need help, say: 'Could you help me clarify this requirement?' What are your top priorities for today?";
      malayalamResponse = "മനസ്സിലായി! മീറ്റിംഗുകളിൽ ചുരുക്കി എന്നാൽ കൃത്യമായി കാര്യങ്ങൾ അവതരിപ്പിക്കുന്നത് ആളുകൾ ശ്രദ്ധിക്കാൻ സഹായിക്കും. ഇന്ന് ഏറ്റവും പ്രധാനമായി ചെയ്യേണ്ട കാര്യങ്ങൾ എന്തൊക്കെയാണ്?";
      fluencyTip = "Corporate Phrase: Instead of 'I didn't understand', politely say 'Could you please elaborate on that point?'.";
      quickReplies = [
        "I will complete the documentation by 3 PM.",
        "I'd like to sync up with the lead on this.",
        "Everything is on track from my side.",
        "How do I politely disagree with a colleague?"
      ];
    }
    // Case 5: Airport / Travel
    else if (scenarioId === "airport_travel" || lower.includes("ticket") || lower.includes("passport") || lower.includes("dubai") || lower.includes("flight")) {
      englishResponse = "Thank you. Your documents are verified. Are you carrying any liquids or sharp items in your hand baggage? And do you prefer a window or aisle seat?";
      malayalamResponse = "നന്ദി. രേഖകൾ പരിശോധിച്ചു. നിങ്ങളുടെ കൈവശമുള്ള ബാഗിൽ എന്തെങ്കിലും ദ്രാവകങ്ങൾ ഉണ്ടോ? നിങ്ങൾക്ക് വിൻഡോ സീറ്റ് വേണമോ അതോ ഐൽ (aisle) സീറ്റോ?";
      fluencyTip = "Pronunciation Tip: 'Aisle' is pronounced as 'eye-l' (the 's' is completely silent!).";
      quickReplies = [
        "I prefer a window seat, please.",
        "No liquids or prohibited items in my bag.",
        "How many kilograms of check-in luggage is allowed?",
        "What time does the boarding begin?"
      ];
    }
    // Case 6: Cafe / Restaurant
    else if (scenarioId === "restaurant_shopping" || lower.includes("coffee") || lower.includes("bill") || lower.includes("order") || lower.includes("tea")) {
      englishResponse = "Certainly! I'd be happy to prepare that for you. Would you like that with sugar or without? And would you like any snacks to go with it?";
      malayalamResponse = "തീർച്ചയായും! പഞ്ചസാരയോടു കൂടിയാണോ അതോ പഞ്ചസാരയില്ലാതെയാണോ വേണ്ടത്? കൂടെ എന്തെങ്കിലും ലഘുഭക്ഷണം കഴിക്കാൻ ആഗ്രഹിക്കുന്നുണ്ടോ?";
      fluencyTip = "Polite English: Always use 'Could I please have...' instead of demanding 'Give me coffee'.";
      quickReplies = [
        "With less sugar, please.",
        "Could you also get me a blueberry muffin?",
        "Can I pay via card?",
        "How much is the total amount?"
      ];
    }
    // General conversational fallback with intelligent branching
    else {
      const dynamicPrompts = [
        {
          en: `I hear you! That's a very natural thought. To make your English sound even smoother, try connecting your thoughts with words like 'Actually', 'In fact', or 'On the other hand'. What do you think about that?`,
          ml: `തീർച്ചയായും! ആ ആശയം വളരെ നന്നായി പറഞ്ഞു. സംസാരിക്കുമ്പോൾ 'Actually', 'In fact' തുടങ്ങിയ വാക്കുകൾ ഉപയോഗിച്ചാൽ സംസാരം കൂടുതൽ ഒഴുക്കുള്ളതാവും. ഇതിനെക്കുറിച്ച് എന്തു തോന്നുന്നു?`,
          tip: "Using connector words helps you pause naturally without awkward silence or 'uhhh'."
        },
        {
          en: `You expressed that nicely! Never hesitate if you feel you made a mistake—native speakers make mistakes too. Tell me more about what you normally enjoy doing on weekends in Kerala?`,
          ml: `വളരെ നന്നായി പറഞ്ഞു! ചെറിയ തെറ്റുകൾ വരുമോ എന്ന് പേടിക്കാതെ ധൈര്യമായി സംസാരിക്കൂ. ഒഴിവുദിവസങ്ങളിൽ സാധാരണ എന്തൊക്കെ ചെയ്യാനാണ് കൂടുതൽ ഇഷ്ടം?`,
          tip: "Confidence comes from speaking every day, even for 5 minutes. Consistency is key!"
        },
        {
          en: `Great effort! I really admire how clearly you are articulating your words. Could you describe a favorite place in your hometown to me in English?`,
          ml: `വളരെ നല്ല ശ്രമം! നിങ്ങളുടെ ഉച്ചാരണം വളരെ വ്യക്തമാണ്. നിങ്ങളുടെ നാട്ടിലെ ഏറ്റവും ഇഷ്ടപ്പെട്ട ഒരു സ്ഥലത്തെക്കുറിച്ച് ഇംഗ്ലീഷിൽ ഒന്ന് വിവരിക്കാമോ?`,
          tip: "Describing familiar places helps your brain switch to thinking directly in English without translating from Malayalam."
        }
      ];

      const chosen = dynamicPrompts[Math.floor(Math.random() * dynamicPrompts.length)];
      englishResponse = chosen.en;
      malayalamResponse = chosen.ml;
      fluencyTip = chosen.tip;
      quickReplies = [
        "I usually love spending time with my family.",
        "My hometown is surrounded by lush green hills.",
        "Could you check my sentence for any grammar mistakes?",
        "Teach me a useful idiom for daily conversation."
      ];
    }

    const result = {
      englishResponse,
      malayalamResponse,
      feedback: fluencyTip,
      grammarCorrection: grammarFeedback,
      quickReplies
    };

    this.history.push({ role: "user", content: userInput });
    this.history.push({ role: "assistant", content: englishResponse });

    return result;
  }

  /**
   * Gemini API call with structured instruction
   */
  async callGeminiApi(userInput, scenarioData, grammarFeedback, malayalamDetection) {
    const scenarioPrompt = scenarioData?.systemInstruction || "You are Teacher Maya, a warm Malayalam-English mentor.";
    
    const systemPrompt = `
You are "Teacher Maya" (മായ മിസ്സ്), a friendly, patient, and warm bilingual English mentor from Kerala helping Malayalam speakers master fluent spoken English.
Learner Level: ${this.userLevel}
Current Scenario: ${scenarioData?.title || "Daily Conversation"}
Target Subject / Topic: ${this.customSubject || "Any Subject chosen by user"}
Scenario Context: ${scenarioPrompt}

CRITICAL GUIDELINES:
1. If the user asks about ANY subject (Science, AI, Space, History, Sports, Cooking, Movies, Medicine, etc.), explain the subject clearly in simple conversational English (2-3 sentences max).
2. Teach them 1 key English vocabulary word related to this subject with its Malayalam meaning.
3. Challenge the learner by asking a question so they practice SPEAKING about this subject in English!
4. You MUST provide an accurate Malayalam translation of your response.
5. If the user makes a grammar mistake or uses literal Malayalam translations, explain gently how to say it naturally.
6. If the user speaks in Malayalam or Manglish, translate it to natural English and encourage them to repeat it.
7. Provide 3-4 natural quick reply options the user can say aloud.

RESPONSE JSON SCHEMA:
{
  "englishResponse": "Your spoken reply in natural English (keep it under 40 words)",
  "malayalamResponse": "The same reply translated accurately into Malayalam script (മലയാളം ലിപിയിൽ)",
  "feedback": "A short, actionable pronunciation, grammar, or fluency tip tailored to Malayalam speakers",
  "correctedSentence": "If the user made a grammar error, provide the corrected natural English sentence here, otherwise null",
  "quickReplies": ["Option 1", "Option 2", "Option 3"]
}
`;

    const url = `https://generativelanguage.googleapis.com/v1beta/models/${this.modelName}:generateContent?key=${this.apiKey}`;
    
    // Build conversation context
    const contents = [];

    // Append last 6 messages for conversational context
    const recentHistory = this.history.slice(-6);
    for (const msg of recentHistory) {
      contents.push({
        role: msg.role === "assistant" ? "model" : "user",
        parts: [{ text: msg.content }]
      });
    }

    contents.push({
      role: "user",
      parts: [{ text: `Learner says: "${userInput}"` }]
    });

    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        system_instruction: {
          parts: [{ text: systemPrompt }]
        },
        contents,
        generationConfig: {
          temperature: 0.7,
          topP: 0.95,
          maxOutputTokens: 800,
          response_mime_type: "application/json"
        }
      })
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.error?.message || `Gemini API error status: ${response.status}`);
    }

    const data = await response.json();
    const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!rawText) return null;

    // Parse JSON
    const cleanJson = rawText.replace(/```json/g, "").replace(/```/g, "").trim();
    const parsed = JSON.parse(cleanJson);

    return {
      englishResponse: parsed.englishResponse || "Let's keep practicing!",
      malayalamResponse: parsed.malayalamResponse || "നമുക്ക് തുടർന്നും പരിശീലിക്കാം!",
      feedback: parsed.feedback || "Good effort!",
      grammarCorrection: parsed.correctedSentence ? {
        detected: true,
        original: userInput,
        suggested: parsed.correctedSentence,
        rule: "Grammar Improvement",
        explanation: parsed.feedback || "A more natural way to phrase this in English."
      } : grammarFeedback,
      quickReplies: Array.isArray(parsed.quickReplies) ? parsed.quickReplies : ["Yes, let's continue!"]
    };
  }
}

// Export singleton instance
window.TutorEngine = TutorEngine;
