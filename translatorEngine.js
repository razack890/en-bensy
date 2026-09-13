/**
 * Bilingual Live Translator Engine (English ⇄ Malayalam & Manglish)
 * Uses Google Translate client endpoint with Gemini and offline fallback.
 */

class TranslatorEngine {
  constructor() {
    this.sourceLang = "en"; // "en" or "ml"
    this.targetLang = "ml"; // "ml" or "en"
  }

  swapLanguages() {
    const temp = this.sourceLang;
    this.sourceLang = this.targetLang;
    this.targetLang = temp;
    return {
      sourceLang: this.sourceLang,
      targetLang: this.targetLang
    };
  }

  /**
   * Translate text between English and Malayalam
   */
  async translate(text, sl = null, tl = null) {
    const source = sl || this.sourceLang;
    const target = tl || this.targetLang;
    const cleanText = text.trim();

    if (!cleanText) {
      return { translatedText: "", sourceLang: source, targetLang: target };
    }

    // 1. Try Google Translate public client endpoint
    try {
      const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${source}&tl=${target}&dt=t&q=${encodeURIComponent(cleanText)}`;
      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        if (data && data[0]) {
          const translatedText = data[0].map(item => item[0]).join("");
          if (translatedText) {
            return {
              translatedText: translatedText.trim(),
              sourceLang: source,
              targetLang: target,
              engine: "Google Translate"
            };
          }
        }
      }
    } catch (e) {
      console.warn("Google Translate endpoint failed, falling back to secondary engine:", e);
    }

    // 2. Try MyMemory Translation API
    try {
      const langpair = `${source}|${target}`;
      const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(cleanText)}&langpair=${langpair}`;
      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        if (data && data.responseData && data.responseData.translatedText) {
          return {
            translatedText: data.responseData.translatedText.trim(),
            sourceLang: source,
            targetLang: target,
            engine: "MyMemory"
          };
        }
      }
    } catch (e) {
      console.warn("MyMemory endpoint failed, falling back to local dictionary:", e);
    }

    // 3. Local Smart Dictionary & Manglish Fallback
    const localResult = this.translateLocal(cleanText, source, target);
    return {
      translatedText: localResult,
      sourceLang: source,
      targetLang: target,
      engine: "Local Dictionary"
    };
  }

  translateLocal(text, source, target) {
    const lower = text.toLowerCase().trim();
    
    // English to Malayalam local dictionary
    const enToMl = {
      "hello": "ഹലോ / നമസ്കാരം",
      "how are you": "സുഖമാണോ? / വിശേഷങ്ങൾ എന്തൊക്കെ?",
      "good morning": "സുപ്രഭാതം",
      "good night": "ശുഭരാത്രി",
      "thank you": "വളരെ നന്ദി",
      "what is your name": "നിങ്ങളുടെ പേരെന്താണ്?",
      "my name is rahul": "എന്റെ പേര് രാഹുൽ എന്നാണ്",
      "where is the airport": "എയർപോർട്ട് എവിടെയാണ്?",
      "how much does this cost": "ഇതിന് എത്ര രൂപയാകും?",
      "i am sorry": "എന്നോട് ക്ഷമിക്കണം",
      "i need help": "എനിക്ക് ഒരു സഹായം വേണം",
      "i will come tomorrow": "ഞാൻ നാളെ വരാം",
      "i cannot come tomorrow": "എനിക്ക് നാളെ വരാൻ സാധിക്കില്ല",
      "call me later": "എന്നെ കുറച്ചു കഴിഞ്ഞ് വിളിക്കൂ",
      "see you later": "പിന്നെ കാണാം",
      "i love kerala": "എനിക്ക് കേരളം വളരെ ഇഷ്ടമാണ്",
      "where is the nearest hospital": "ഏറ്റവും അടുത്തുള്ള ഹോസ്പിറ്റൽ എവിടെയാണ്?",
      "i have severe chest pain": "എനിക്ക് കഠിനമായ നെഞ്ചുവേദനയുണ്ട്",
      "please call an ambulance": "ദയവായി ഒരു ആംബുലൻസ് വിളിക്കൂ",
      "i lost my baggage at the airport": "എയർപോർട്ടിൽ എന്റെ ബാഗ് നഷ്ടപ്പെട്ടു",
      "how much to the city center": "സിറ്റി സെന്ററിലേക്ക് പോകാൻ എത്ര രൂപയാകും?",
      "could you speak a bit slower": "അല്പം പതുക്കെ സംസാരിക്കാമോ?",
      "is this vegetarian": "ഇത് വെജിറ്റേറിയൻ ഭക്ഷണമാണോ?"
    };

    // Malayalam / Manglish to English local dictionary
    const mlToEn = {
      "സുഖമാണോ": "How are you doing?",
      "നമസ്കാരം": "Hello / Greetings",
      "നന്ദി": "Thank you very much",
      "നാളെ വരാൻ പറ്റില്ല": "I won't be able to come tomorrow.",
      "കുറച്ച് കഴിഞ്ഞ് വിളിക്കാം": "I will call you back in a bit.",
      "എനിക്ക് ഒരു സംശയമുണ്ട്": "I have a question.",
      "nale varan pattilla": "I can't make it tomorrow.",
      "kurachu kazhinju vilikkam": "I'll call you shortly.",
      "enikku doubt undu": "I have a question.",
      "എനിക്ക് ഒരു ഡോക്ടറെ കാണണം": "I need to see a doctor urgently.",
      "എനിക്ക് നെഞ്ചുവേദനയുണ്ട്": "I have severe chest pain.",
      "ആംബുലൻസ് വിളിക്കൂ": "Please call an ambulance immediately.",
      "എന്റെ ലഗേജ് നഷ്ടപ്പെട്ടു": "My luggage is missing.",
      "എയർപോർട്ടിലേക്ക് എങ്ങനെ പോകണം": "How do I get to the airport?",
      "ഇതിന് എത്ര രൂപയാകും": "How much does this cost?",
      "വെജിറ്റേറിയൻ ഭക്ഷണം ഉണ്ടോ": "Do you have vegetarian food options?",
      "കുറച്ച് പതുക്കെ പറയാമോ": "Could you please speak a little slower?"
    };

    if (source === "en") {
      return enToMl[lower] || "വിവർത്തനം ലഭ്യമാക്കാൻ ഇന്റർനെറ്റ് കണക്ട് ചെയ്യുക.";
    } else {
      return mlToEn[lower] || "Please connect to internet for complete live translation.";
    }
  }

  /**
   * Speak translation audio aloud (Speakerphone or Earphone whisper)
   */
  speakAudio(text, lang = "en", isEarphoneMode = false) {
    if (!('speechSynthesis' in window) || !text) return;
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = isEarphoneMode ? 0.95 : 0.88;
    utterance.pitch = 1.0;
    utterance.volume = isEarphoneMode ? 0.45 : 1.0;

    const voices = window.speechSynthesis.getVoices();
    if (lang === "ml") {
      utterance.lang = "ml-IN";
      const mlVoice = voices.find(v => v.lang.startsWith("ml"));
      if (mlVoice) utterance.voice = mlVoice;
      else {
        // Fallback to Indian English voice for transliterated text
        const inVoice = voices.find(v => v.lang === "en-IN");
        if (inVoice) utterance.voice = inVoice;
      }
    } else {
      utterance.lang = "en-US";
      const enVoice = voices.find(v => v.lang.startsWith("en-") && (v.name.includes("Google") || v.name.includes("Natural")));
      if (enVoice) utterance.voice = enVoice;
    }

    window.speechSynthesis.speak(utterance);
    return utterance;
  }
}

window.TranslatorEngine = TranslatorEngine;

