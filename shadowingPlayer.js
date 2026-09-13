/**
 * Shadowing Accent Player Engine
 * Implements the world-famous "Shadowing" technique for Malayalam speakers:
 * Listen to native pronunciation -> Countdown -> Repeat -> Word-by-word diff analysis.
 */

class ShadowingPlayer {
  constructor() {
    this.drills = [
      {
        id: "sh1",
        category: "Kerala Accent Traps",
        title: "P vs F & V vs W Traps",
        sentence: "We should focus on specific professional values.",
        malayalam: "നമ്മൾ കൃത്യമായ തൊഴിൽപരമായ മൂല്യങ്ങളിൽ ശ്രദ്ധ കേന്ദ്രീകരിക്കണം.",
        phoneticFocus: "Focus (ഫോക്കസ് - not പോക്കസ്), Specific (സ്പെസിഫിക് - not പെസിഫിക്), Values (വാಲ್ಯൂസ്)",
        difficulty: "Intermediate"
      },
      {
        id: "sh2",
        category: "Confidence & Meetings",
        title: "Sharing Your Opinion Politely",
        sentence: "In my opinion, this approach will save us significant time.",
        malayalam: "എന്റെ അഭിപ്രായത്തിൽ, ഈ സമീപനം നമുക്ക് വളരെയധികം സമയം ലാഭിക്കും.",
        phoneticFocus: "Significant (സിഗ്നിഫിക്കന്റ്), Approach (അപ്പ്രോച്ച്)",
        difficulty: "Intermediate"
      },
      {
        id: "sh3",
        category: "Daily Life & Travel",
        title: "Ordering Coffee & Asking Questions",
        sentence: "Could you please tell me how long the flight will take?",
        malayalam: "ഫ്ലൈറ്റിന് എത്ര സമയം എടുക്കും എന്ന് ദയവായി പറയാമോ?",
        phoneticFocus: "Could (കുഡ് - silent 'l'), Flight (ഫ്ലൈറ്റ്)",
        difficulty: "Beginner"
      },
      {
        id: "sh4",
        category: "Job Interview",
        title: "Explaining Your Background",
        sentence: "I have been working as a software developer for the past three years.",
        malayalam: "കഴിഞ്ഞ മൂന്ന് വർഷമായി ഞാൻ സോഫ്റ്റ്‌വെയർ ഡെവലപ്പറായി ജോലി ചെയ്യുന്നു.",
        phoneticFocus: "Have been working (കഴിഞ്ഞ സമയം മുതൽ ഇപ്പോഴും തുടരുന്നു), Three (ത്രീ - not ട്രീ)",
        difficulty: "Advanced"
      },
      {
        id: "sh5",
        category: "Daily Idiomatic Spoken English",
        title: "Natural Daily Expression",
        sentence: "I am really looking forward to meeting you all tomorrow.",
        malayalam: "നാളെ നിങ്ങളെ എല്ലാവരെയും കാണാൻ ഞാൻ വളരെ ആകാംക്ഷയോടെ കാത്തിരിക്കുന്നു.",
        phoneticFocus: "Looking forward to (വളരെ പ്രതീക്ഷയോടെ കാത്തിരിക്കുന്നു)",
        difficulty: "Beginner"
      }
    ];

    this.currentDrillIndex = 0;
  }

  getDrills() {
    return this.drills;
  }

  getCurrentDrill() {
    return this.drills[this.currentDrillIndex];
  }

  setDrillIndex(index) {
    if (index >= 0 && index < this.drills.length) {
      this.currentDrillIndex = index;
    }
    return this.getCurrentDrill();
  }

  /**
   * Word-by-word comparison between target and recognized transcript
   */
  evaluateShadowing(spokenText) {
    const target = this.getCurrentDrill().sentence;
    const clean = str => str.toLowerCase().replace(/[^\w\s]/g, "").trim();

    const targetWords = clean(target).split(/\s+/);
    const spokenWords = clean(spokenText).split(/\s+/);

    const results = [];
    let matchCount = 0;

    targetWords.forEach((word, idx) => {
      const spokenWord = spokenWords[idx] || "";
      const isMatch = spokenWord === word;
      if (isMatch) {
        matchCount++;
        results.push({ word: target.split(/\s+/)[idx], status: "correct" });
      } else if (spokenWords.includes(word)) {
        matchCount += 0.8;
        results.push({ word: target.split(/\s+/)[idx], status: "close" });
      } else {
        results.push({ word: target.split(/\s+/)[idx], status: "missed" });
      }
    });

    const accuracy = Math.min(100, Math.round((matchCount / targetWords.length) * 100));

    let feedbackMalayalam = "";
    if (accuracy >= 85) {
      feedbackMalayalam = "ഗംഭീരം! ഉച്ചാരണം വളരെ മികച്ചതും ഒഴുക്കുള്ളതുമായിരുന്നു! 🎉";
    } else if (accuracy >= 65) {
      feedbackMalayalam = "വളരെ നല്ല ശ്രമം! ചുവന്ന നിറത്തിലുള്ള വാക്കുകൾ ഒന്നുകൂടി ശ്രദ്ധിച്ച് പറഞ്ഞുനോക്കൂ. 👍";
    } else {
      feedbackMalayalam = "കുഴപ്പമില്ല! മായ മിസ്സ് പറയുന്നത് ഒന്നുകൂടി കേട്ട് പതുക്കെ ആവർത്തിക്കൂ. 😊";
    }

    return {
      accuracy,
      wordAnalysis: results,
      spokenText,
      feedbackMalayalam,
      phoneticFocus: this.getCurrentDrill().phoneticFocus
    };
  }
}

window.ShadowingPlayer = ShadowingPlayer;
