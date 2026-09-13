/**
 * Smart Vocabulary & Saved Phrases Book
 * With Spaced Repetition Flashcards and Malayalam Meanings
 */

class VocabBook {
  constructor() {
    this.storageKey = "talkmalayali_vocab_book";
    this.items = this.loadFromStorage();
    if (!this.items.length) {
      this.seedInitialItems();
    }
  }

  loadFromStorage() {
    try {
      const data = localStorage.getItem(this.storageKey);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.warn("Could not load vocab book from storage:", e);
      return [];
    }
  }

  saveToStorage() {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.items));
    } catch (e) {
      console.warn("Could not save vocab book to storage:", e);
    }
  }

  seedInitialItems() {
    this.items = [
      {
        id: "v1",
        english: "I am going home",
        malayalam: "ഞാൻ വീട്ടിലേക്ക് പോകുന്നു (not 'going to home')",
        tag: "Grammar Pitfall",
        mastery: "review",
        savedAt: new Date().toLocaleDateString()
      },
      {
        id: "v2",
        english: "Could you please elaborate?",
        malayalam: "അതൊന്നു കുറച്ചുകൂടി വിശദീകരിക്കാമോ?",
        tag: "Job & Meeting",
        mastery: "new",
        savedAt: new Date().toLocaleDateString()
      },
      {
        id: "v3",
        english: "I have a question",
        malayalam: "എനിക്കൊരു ചോദ്യമുണ്ട് (better than 'I have a doubt')",
        tag: "Grammar Pitfall",
        mastery: "mastered",
        savedAt: new Date().toLocaleDateString()
      },
      {
        id: "v4",
        english: "I won't be able to make it today.",
        malayalam: "എനിക്ക് ഇന്ന് വരാൻ സാധിക്കില്ല.",
        tag: "Daily Spoken",
        mastery: "new",
        savedAt: new Date().toLocaleDateString()
      }
    ];
    this.saveToStorage();
  }

  getItems(filterTag = "all") {
    if (filterTag === "all") return this.items;
    return this.items.filter(item => item.tag.toLowerCase().includes(filterTag.toLowerCase()));
  }

  addPhrase(english, malayalam, tag = "Daily Spoken") {
    const cleanEn = english.trim();
    if (!cleanEn) return null;

    // Avoid duplicates
    const exists = this.items.find(i => i.english.toLowerCase() === cleanEn.toLowerCase());
    if (exists) {
      exists.malayalam = malayalam || exists.malayalam;
      this.saveToStorage();
      return exists;
    }

    const newItem = {
      id: "v_" + Date.now(),
      english: cleanEn,
      malayalam: malayalam || "മലയാളം അർത്ഥം ലഭിക്കാൻ ട്രാൻസ്ലേറ്റർ ഉപയോഗിക്കാം",
      tag: tag,
      mastery: "new",
      savedAt: new Date().toLocaleDateString()
    };
    this.items.unshift(newItem);
    this.saveToStorage();
    return newItem;
  }

  deletePhrase(id) {
    this.items = this.items.filter(i => i.id !== id);
    this.saveToStorage();
  }

  setMastery(id, status) {
    const item = this.items.find(i => i.id === id);
    if (item) {
      item.mastery = status; // "new" | "review" | "mastered"
      this.saveToStorage();
    }
  }

  getFlashcardList() {
    return [...this.items].sort(() => 0.5 - Math.random());
  }
}

window.VocabBook = VocabBook;
