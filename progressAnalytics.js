/**
 * Samsaaram AI - Daily Streak, XP & Pronunciation Progress Analytics Engine
 * Tracks user speaking activity, XP leveling, daily streaks, Malayalam accent diagnostics, and unlocks.
 */

class ProgressAnalytics {
  constructor() {
    this.storageKey = "samsaaram_progress_stats";
    this.loadStats();
    this.checkDailyStreak();
  }

  getDefaultStats() {
    return {
      xp: 120,
      totalMessagesSpoken: 8,
      totalMinutesSpoken: 6,
      streakCount: 3,
      lastActiveDate: new Date().toISOString().split("T")[0],
      weeklyActivity: {
        Mon: 15,
        Tue: 25,
        Wed: 30,
        Thu: 0,
        Fri: 0,
        Sat: 0,
        Sun: 0
      },
      accentMastery: {
        v_w: { label: "/v/ vs /w/ (Very vs Water)", score: 92, count: 6 },
        f_p: { label: "/f/ vs /p/ (Office vs Police)", score: 96, count: 8 },
        th_d: { label: "/θ/ vs /d/ (Think vs Then)", score: 88, count: 5 },
        s_sh: { label: "/s/ vs /ʃ/ (Special vs School)", score: 94, count: 7 },
        z_j: { label: "/z/ vs /dʒ/ (Zero vs Judge)", score: 90, count: 4 }
      },
      grammarFixesLearned: 5,
      vocabularyCount: 6,
      badges: [
        { id: "first_chat", title: "First Words", icon: "🌱", desc: "Started your English speaking journey", unlocked: true },
        { id: "streak_3", title: "3-Day Streak", icon: "🔥", desc: "Practiced 3 days continuously", unlocked: true },
        { id: "clarity_90", title: "Clarity Pro", icon: "🎯", desc: "Achieved 90%+ pronunciation score", unlocked: true },
        { id: "live_call", title: "Phone Call Star", icon: "📞", desc: "Completed Live Voice Call simulation", unlocked: true },
        { id: "vocab_collector", title: "Word Master", icon: "📚", desc: "Saved 5+ phrases to Vocab Book", unlocked: true },
        { id: "streak_7", title: "Week Champion", icon: "🏆", desc: "Practice 7 consecutive days", unlocked: false }
      ]
    };
  }

  loadStats() {
    try {
      const saved = localStorage.getItem(this.storageKey);
      if (saved) {
        this.stats = { ...this.getDefaultStats(), ...JSON.parse(saved) };
      } else {
        this.stats = this.getDefaultStats();
        this.saveStats();
      }
    } catch (e) {
      console.warn("Failed to load progress stats:", e);
      this.stats = this.getDefaultStats();
    }
  }

  saveStats() {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.stats));
    } catch (e) {
      console.warn("Failed to save progress stats:", e);
    }
  }

  checkDailyStreak() {
    const today = new Date().toISOString().split("T")[0];
    if (!this.stats.lastActiveDate) {
      this.stats.lastActiveDate = today;
      this.stats.streakCount = 1;
      this.saveStats();
      return;
    }

    if (this.stats.lastActiveDate === today) {
      return; // Already logged today
    }

    const lastDate = new Date(this.stats.lastActiveDate);
    const currDate = new Date(today);
    const diffDays = Math.round((currDate - lastDate) / (1000 * 60 * 60 * 24));

    if (diffDays === 1) {
      // Consecutive day! Increment streak
      this.stats.streakCount += 1;
      this.addXp(30); // Streak bonus
    } else if (diffDays > 1) {
      // Streak broken
      this.stats.streakCount = 1;
    }

    this.stats.lastActiveDate = today;
    this.saveStats();
  }

  getLevelInfo() {
    const xp = this.stats.xp;
    if (xp < 200) {
      return {
        level: 1,
        title: "Beginner Explorer",
        titleMl: "തുടക്കക്കാരൻ (Level 1)",
        currLevelXp: xp,
        nextLevelXp: 200,
        progressPercent: Math.min(100, Math.round((xp / 200) * 100))
      };
    } else if (xp < 500) {
      return {
        level: 2,
        title: "Confident Speaker",
        titleMl: "ആത്മവിശ്വാസമുള്ള സ്പീക്കർ (Level 2)",
        currLevelXp: xp - 200,
        nextLevelXp: 300,
        progressPercent: Math.min(100, Math.round(((xp - 200) / 300) * 100))
      };
    } else if (xp < 1000) {
      return {
        level: 3,
        title: "Fluent Conversationalist",
        titleMl: "ഇംഗ്ലീഷ് സ്പീക്കിംഗ് മാസ്റ്റർ (Level 3)",
        currLevelXp: xp - 500,
        nextLevelXp: 500,
        progressPercent: Math.min(100, Math.round(((xp - 500) / 500) * 100))
      };
    } else if (xp < 2000) {
      return {
        level: 4,
        title: "Corporate & Global Ready",
        titleMl: "ഓഫീസ് & ഗൾഫ് റെഡി (Level 4)",
        currLevelXp: xp - 1000,
        nextLevelXp: 1000,
        progressPercent: Math.min(100, Math.round(((xp - 1000) / 1000) * 100))
      };
    } else {
      return {
        level: 5,
        title: "Master Orator",
        titleMl: "ഇംഗ്ലീഷ് പ്രോ (Level 5)",
        currLevelXp: xp,
        nextLevelXp: xp,
        progressPercent: 100
      };
    }
  }

  addXp(amount) {
    this.stats.xp += amount;
    this.saveStats();
  }

  logSpokenMessage(text, pronunciationScore = 90) {
    this.stats.totalMessagesSpoken += 1;
    let earnedXp = 10;

    if (pronunciationScore >= 90) {
      earnedXp += 15;
    }

    // Add speaking minutes estimate (approx 0.25 min per sentence)
    this.stats.totalMinutesSpoken = parseFloat((this.stats.totalMinutesSpoken + 0.25).toFixed(1));

    // Update today day in weekly activity
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const currentDay = days[new Date().getDay()];
    if (this.stats.weeklyActivity[currentDay] !== undefined) {
      this.stats.weeklyActivity[currentDay] += 1;
    }

    // Evaluate accent phonetics
    const lower = text.toLowerCase();
    if (lower.includes("v") || lower.includes("w")) {
      this.updatePhoneticStat("v_w", pronunciationScore);
    }
    if (lower.includes("f") || lower.includes("p")) {
      this.updatePhoneticStat("f_p", pronunciationScore);
    }
    if (lower.includes("th")) {
      this.updatePhoneticStat("th_d", pronunciationScore);
    }
    if (lower.includes("sp") || lower.includes("st") || lower.includes("sh")) {
      this.updatePhoneticStat("s_sh", pronunciationScore);
    }

    this.addXp(earnedXp);
    this.checkBadges();
    return earnedXp;
  }

  logCallDuration(seconds) {
    const mins = Math.max(1, Math.round(seconds / 60));
    this.stats.totalMinutesSpoken = parseFloat((this.stats.totalMinutesSpoken + mins).toFixed(1));
    this.addXp(mins * 20);
    this.checkBadges();
  }

  logGrammarFix() {
    this.stats.grammarFixesLearned += 1;
    this.addXp(15);
    this.checkBadges();
  }

  logVocabSaved() {
    this.stats.vocabularyCount += 1;
    this.addXp(10);
    this.checkBadges();
  }

  updatePhoneticStat(key, score) {
    if (this.stats.accentMastery[key]) {
      const item = this.stats.accentMastery[key];
      item.score = Math.round((item.score * item.count + score) / (item.count + 1));
      item.count += 1;
      this.saveStats();
    }
  }

  checkBadges() {
    let changed = false;
    this.stats.badges.forEach(badge => {
      if (!badge.unlocked) {
        if (badge.id === "streak_7" && this.stats.streakCount >= 7) {
          badge.unlocked = true;
          this.addXp(100);
          changed = true;
        }
      }
    });
    if (changed) this.saveStats();
  }

  getWeeklyActivityData() {
    return this.stats.weeklyActivity;
  }
}

window.ProgressAnalytics = ProgressAnalytics;
