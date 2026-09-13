/**
 * Daily 2-Minute Speaking Challenge & Canvas WhatsApp Share Card Generator
 */

const DAILY_CHALLENGES = [
  {
    day: 1,
    title: "Introduce Yourself Like a Pro",
    malayalamTitle: "സ്വയം ഗംഭീരമായി പരിചയപ്പെടുത്താം",
    target: "Speak for 60-90 seconds without saying 'Myself Rahul'. Use 'I am' or 'My name is' and talk about your hometown.",
    starterSentence: "Hello everyone, my name is [Your Name], and I was born and raised in [Your Hometown]...",
    samplePhrases: ["I hold a degree in...", "I am passionate about...", "In my spare time, I enjoy..."]
  },
  {
    day: 2,
    title: "Describe Your Favorite Kerala Dish",
    malayalamTitle: "ഏറ്റവും ഇഷ്ടപ്പെട്ട ഭക്ഷണത്തെക്കുറിച്ച് പറയാം",
    target: "Describe your favorite traditional dish (e.g. Appam & Stew, Biryani, or Sadhya) and why you love it.",
    starterSentence: "One of my absolute favorite traditional dishes from Kerala is...",
    samplePhrases: ["The aroma of spices...", "It is typically served with...", "What makes it special is..."]
  },
  {
    day: 3,
    title: "Your Dream Job or Next Big Goal",
    malayalamTitle: "നിങ്ങളുടെ സ്വപ്ന ജോലി അല്ലെങ്കിൽ ലക്ഷ്യം",
    target: "Explain your professional ambition and how you plan to achieve it over the next three years.",
    starterSentence: "My primary career objective over the next three years is to...",
    samplePhrases: ["I am currently upskilling in...", "This opportunity will allow me to...", "I look forward to..."]
  },
  {
    day: 4,
    title: "A Memorable Journey or Vacation",
    malayalamTitle: "മറക്കാനാവാത്ത ഒരു യാത്രയെക്കുറിച്ച്",
    target: "Speak about a trip to Wayanad, Munnar, Goa, or abroad. Describe the sights, weather, and feelings.",
    starterSentence: "One of the most memorable trips I have ever taken was to...",
    samplePhrases: ["The scenic hills and cool climate...", "We were mesmerized by...", "It was a refreshing break from..."]
  },
  {
    day: 5,
    title: "Why Learning English Matters to You",
    malayalamTitle: "ഇംഗ്ലീഷ് പഠിക്കുന്നത് എന്തിനാണ്?",
    target: "Speak honestly about your English speaking journey and how fluency will transform your life.",
    starterSentence: "Mastering spoken English is important to me because...",
    samplePhrases: ["It opens doors to global careers...", "It boosts my self-confidence...", "I want to express my ideas freely..."]
  }
];

class DailyChallengeEngine {
  constructor() {
    this.currentDay = parseInt(localStorage.getItem("samsaaram_current_day") || "1", 10);
    this.streak = parseInt(localStorage.getItem("samsaaram_streak") || "1", 10);
    this.todayCompleted = localStorage.getItem(`samsaaram_day_${this.currentDay}_done`) === "true";
  }

  getCurrentChallenge() {
    const index = (this.currentDay - 1) % DAILY_CHALLENGES.length;
    return DAILY_CHALLENGES[index];
  }

  markChallengeComplete(score = 92) {
    this.todayCompleted = true;
    localStorage.setItem(`samsaaram_day_${this.currentDay}_done`, "true");
    this.streak++;
    localStorage.setItem("samsaaram_streak", this.streak.toString());
    return this.streak;
  }

  /**
   * Generates a sleek 800x800 graphical share card on an HTML5 canvas
   */
  generateShareCard(canvas, userName = "Learner", score = 94) {
    const ctx = canvas.getContext("2d");
    const width = canvas.width;
    const height = canvas.height;

    // Background gradient: Rich Kerala Emerald & Midnight Slate
    const bgGrad = ctx.createLinearGradient(0, 0, width, height);
    bgGrad.addColorStop(0, "#090d16");
    bgGrad.addColorStop(0.5, "#0d1b2a");
    bgGrad.addColorStop(1, "#064e3b");
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, width, height);

    // Glowing border frame
    ctx.strokeStyle = "rgba(16, 185, 129, 0.4)";
    ctx.lineWidth = 4;
    ctx.strokeRect(16, 16, width - 32, height - 32);

    // Header Logo & Badge
    ctx.font = "bold 26px Outfit, sans-serif";
    ctx.fillStyle = "#34d399";
    ctx.fillText("🎙️ Samsaaram AI • സംസാരം", 40, 70);

    ctx.font = "14px Manrope, sans-serif";
    ctx.fillStyle = "#94a3b8";
    ctx.fillText("Live English AI Teacher for Malayalam Speakers", 40, 100);

    // Central circular score badge
    const centerX = width / 2;
    const centerY = height / 2 - 20;
    const radius = 90;

    // Glowing circle glow
    ctx.save();
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(16, 185, 129, 0.15)";
    ctx.fill();
    ctx.strokeStyle = "#10b981";
    ctx.lineWidth = 6;
    ctx.stroke();
    ctx.restore();

    // Fluency Score Number
    ctx.font = "bold 58px Outfit, sans-serif";
    ctx.fillStyle = "#ffffff";
    ctx.textAlign = "center";
    ctx.fillText(`${score}%`, centerX, centerY + 12);

    ctx.font = "bold 15px Manrope, sans-serif";
    ctx.fillStyle = "#a7f3d0";
    ctx.fillText("FLUENCY SCORE", centerX, centerY + 38);

    // Daily Challenge Title
    const challenge = this.getCurrentChallenge();
    ctx.font = "bold 28px Outfit, sans-serif";
    ctx.fillStyle = "#f8fafc";
    ctx.fillText(`Day ${this.currentDay} Challenge Completed! 🏆`, centerX, centerY + 140);

    ctx.font = "18px Manrope, sans-serif";
    ctx.fillStyle = "#cbd5e1";
    ctx.fillText(`"${challenge.title}"`, centerX, centerY + 175);

    // Streak and Confidence Pills
    ctx.font = "bold 18px Outfit, sans-serif";
    ctx.fillStyle = "#f59e0b";
    ctx.fillText(`🔥 ${this.streak} Day Speaking Streak • Verified Fluent`, centerX, centerY + 220);

    // Footer Motto & URL
    ctx.font = "14px Manrope, sans-serif";
    ctx.fillStyle = "#64748b";
    ctx.fillText("Master Spoken English with Teacher Maya • samsaaram.ai", centerX, height - 45);

    return canvas.toDataURL("image/png");
  }

  shareToWhatsApp(score = 94) {
    const challenge = this.getCurrentChallenge();
    const text = `🎙️ I scored ${score}% in today's English Speaking Challenge with Teacher Maya on Samsaaram AI! 🔥 Day ${this.streak} Streak Active. Topic: "${challenge.title}". Practice English with Malayalam support at http://localhost:8000!`;
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
    window.open(url, "_blank");
  }
}

window.DailyChallengeEngine = DailyChallengeEngine;
