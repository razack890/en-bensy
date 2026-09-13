/**
 * AI Group Discussion (GD) Room Simulation
 * Features Moderator Maya, Arjun (Logical/Tech), and Sneha (Diplomatic) for campus & corporate GD prep.
 */

const GD_TOPICS = [
  {
    id: "ai_jobs",
    title: "Will AI Replace Human Jobs or Create New Careers?",
    malayalamTitle: "AI മനുഷ്യരുടെ തൊഴിലുകൾ ഇല്ലാതാക്കുമോ അതോ പുതിയ അവസരങ്ങൾ സൃഷ്ടിക്കുമോ?",
    moderatorIntro: "Welcome everyone to today's Group Discussion. The topic is: 'Will AI Replace Human Jobs or Create New Careers?' You have 10 minutes to discuss constructively. Arjun, please start us off.",
    arjunPoint1: "Thank you, Maya. Looking at the numbers, automation undoubtedly disrupts routine manual tasks. However, historically, every technological revolution—from the steam engine to personal computers—has created vastly more jobs than it destroyed. Prompt engineers, AI trainers, and data analysts are already in huge demand.",
    snehaPoint1: "I agree with Arjun's optimism, but we cannot ignore the transition phase. In developing economies like India, millions depend on entry-level BPO and repetitive administrative roles. Reskilling entire workforces takes time and capital. We must focus on how ethics and human empathy can coexist with AI.",
    userPrompt: "Arjun highlighted economic history, while Sneha pointed out the human transition challenge. What is your perspective on this?",
    quickContributions: [
      "I agree with Sneha; reskilling our youth in Kerala with practical AI skills is urgent.",
      "In my opinion, AI will be a co-pilot, enhancing human productivity rather than replacing humans.",
      "If I may add, creativity and emotional connection can never be automated by machines.",
      "To summarize, embracing AI tools while protecting workers is the right balanced approach."
    ]
  },
  {
    id: "remote_work",
    title: "Work From Home vs Returning to Office: What is the Future?",
    malayalamTitle: "വർക്ക് ഫ്രം ഹോം അതോ ഓഫീസിലേക്ക് മടങ്ങലോ: ഭാവി എന്താണ്?",
    moderatorIntro: "Good morning team. Today's topic is 'Work From Home vs Office Culture'. Let us hear your balanced thoughts. Sneha, would you like to begin?",
    snehaPoint1: "Thank you, Maya. Remote work has democratized employment. Skilled professionals in Kerala, tier-2 cities, and working mothers can now access global MNC salaries without relocating. It saves thousands of hours wasted in commuting traffic.",
    arjunPoint1: "While flexibility is valuable, deep innovation and team camaraderie suffer over video calls. Complex problem-solving, serendipitous whiteboard discussions, and junior mentorship happen ten times faster when teams share a physical room.",
    userPrompt: "Sneha brought up work-life balance and accessibility, while Arjun emphasized company culture and teamwork. Where do you stand?",
    quickContributions: [
      "A hybrid model with 2 days in office and 3 days remote is the ideal solution.",
      "I believe clear results matter more than where an employee sits with a laptop.",
      "For fresh graduates, in-person training in an office is indispensable.",
      "Remote work has significantly boosted the local economy in Kerala's smaller towns."
    ]
  },
  {
    id: "abroad_vs_india",
    title: "Higher Studies & Careers Abroad vs Growing in India / Kerala",
    malayalamTitle: "വിദേശത്ത് പഠനവും ജോലിയും അതോ നാട്ടിൽ കരിയർ വളർത്തലോ?",
    moderatorIntro: "Welcome participants. A very relevant topic today: 'Higher Studies & Careers Abroad vs Building a Career in India'. Arjun, please share your opening thoughts.",
    arjunPoint1: "India's economy is currently the fastest growing major economy. With booming tech startups, UPI infrastructure, and digital growth, the career upside here over the next two decades is immense. Moving abroad now involves massive debt and strict visa caps.",
    snehaPoint1: "That is true, but global exposure and high research standards in Europe or the US teach cross-cultural leadership. Furthermore, higher wages in Gulf countries and Western nations still offer superior savings power for young families.",
    userPrompt: "Both Arjun and Sneha raised strong points about domestic growth versus global savings. How do you see this decision for Kerala's youth?",
    quickContributions: [
      "Gaining 3 to 5 years of international experience and returning to India is a great plan.",
      "With remote global jobs, one can earn international wages while living peacefully in Kerala.",
      "The choice ultimately depends on an individual's financial background and career domain.",
      "To conclude, neither path is universally superior; each requires clear planning."
    ]
  }
];

class GDRoomEngine {
  constructor() {
    this.currentTopic = GD_TOPICS[0];
    this.activeSpeaker = "moderator"; // moderator, arjun, sneha, user
    this.stageIndex = 0;
  }

  setTopic(topicId) {
    const found = GD_TOPICS.find(t => t.id === topicId);
    if (found) {
      this.currentTopic = found;
      this.stageIndex = 0;
      this.activeSpeaker = "moderator";
    }
  }

  getTopic() {
    return this.currentTopic;
  }

  getAllTopics() {
    return GD_TOPICS;
  }

  /**
   * Advance conversation step in GD Room
   */
  getNextTurn(userResponse = null) {
    this.stageIndex++;

    if (this.stageIndex === 1) {
      this.activeSpeaker = "arjun";
      return {
        speaker: "arjun",
        name: "Arjun (Tech/Data)",
        avatar: "👨‍💻",
        text: this.currentTopic.arjunPoint1,
        tip: "Observe how Arjun uses factual transitions ('Looking at the numbers...', 'Historically...')."
      };
    } else if (this.stageIndex === 2) {
      this.activeSpeaker = "sneha";
      return {
        speaker: "sneha",
        name: "Sneha (Diplomatic/Strategy)",
        avatar: "👩‍💼",
        text: this.currentTopic.snehaPoint1,
        tip: "Notice Sneha's polite disagreement technique ('I agree with the optimism, but...')."
      };
    } else if (this.stageIndex === 3) {
      this.activeSpeaker = "moderator";
      return {
        speaker: "moderator",
        name: "Teacher Maya (Moderator)",
        avatar: "👩‍🏫",
        text: `Excellent arguments from Arjun and Sneha. Now let's hear from our participant. ${this.currentTopic.userPrompt}`,
        tip: "Your turn! Use one of the quick polite phrases or speak naturally with your opinion.",
        quickReplies: this.currentTopic.quickContributions
      };
    } else {
      // Evaluation from Maya on user's contribution
      this.activeSpeaker = "moderator";
      return {
        speaker: "moderator",
        name: "Teacher Maya (Moderator)",
        avatar: "👩‍🏫",
        text: "Well expressed! You maintained a calm tone, acknowledged previous points, and added a constructive perspective. That is exactly what GD evaluators in corporate MNCs look for!",
        tip: "GD Score: 95/100 (Politeness: 10/10, Relevance: 9.5/10, Vocabulary: 9.5/10)",
        quickReplies: [
          "Let's discuss another GD topic!",
          "How can I improve my GD summary?",
          "Teach me more GD interruption phrases."
        ]
      };
    }
  }
}

window.GDRoomEngine = GDRoomEngine;
