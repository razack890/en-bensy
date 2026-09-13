/**
 * WhatsApp Voice-Note Mode Simulator
 * Allows Malayalam learners to practice English voice notes in a familiar WhatsApp interface.
 */

class WhatsAppMode {
  constructor() {
    this.messages = [
      {
        id: "w1",
        sender: "maya",
        name: "Teacher Maya 👩‍🏫",
        time: "10:30 AM",
        duration: "0:14",
        audioText: "Hello! Welcome to WhatsApp Voice Practice. Send me a voice note about your day or ask me any question in English!",
        feedback: "സ്വാഗതം! നിങ്ങളുടെ ഇന്നത്തെ ദിവസത്തെക്കുറിച്ചോ ഏതെങ്കിലും സംശയമോ ഒരു ചെറിയ വോയ്‌സ് നോട്ടായി അയക്കൂ.",
        played: false
      }
    ];
    this.isRecording = false;
    this.recordingDuration = 0;
    this.recordTimer = null;
    this.currentPlaybackRate = 1.0;
  }

  getMessages() {
    return this.messages;
  }

  async sendUserVoiceNote(transcript, durationSeconds) {
    const mins = Math.floor(durationSeconds / 60);
    const secs = durationSeconds % 60;
    const durationStr = `${mins}:${secs < 10 ? "0" : ""}${secs}`;
    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

    const userMsg = {
      id: "u_" + Date.now(),
      sender: "user",
      name: "You",
      time: timeStr,
      duration: durationStr,
      audioText: transcript,
      feedback: null,
      played: true
    };
    this.messages.push(userMsg);

    // Generate Maya's AI reply
    let mayaReplyText = "";
    let malayalamTip = "";

    if (window.tutor) {
      const response = await window.tutor.generateResponse(transcript, { id: "whatsapp_mode", title: "WhatsApp Voice Practice" });
      mayaReplyText = response.englishResponse;
      malayalamTip = response.malayalamResponse;
      if (response.malayaliPitfallDetected && response.correction) {
        malayalamTip = `💡 ${response.correction}\n${response.malayalamResponse}`;
      }
    } else {
      mayaReplyText = `That's great! You said: "${transcript}". Keep practicing your speaking confidence!`;
      malayalamTip = "വളരെ നന്നായി സംസാരിച്ചു! ദിവസവും ഇത്തരത്തിൽ 1 മിനിറ്റ് വോയ്‌സ് നോട്ട് അയക്കുന്നത് നിങ്ങളുടെ ഫ്ലുവൻസി വർദ്ധിപ്പിക്കും.";
    }

    const mayaMsg = {
      id: "m_" + Date.now(),
      sender: "maya",
      name: "Teacher Maya 👩‍🏫",
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      duration: "0:18",
      audioText: mayaReplyText,
      feedback: malayalamTip,
      played: false
    };
    this.messages.push(mayaMsg);

    return { userMsg, mayaMsg };
  }

  toggleSpeed() {
    const speeds = [1.0, 1.5, 2.0];
    const currentIndex = speeds.indexOf(this.currentPlaybackRate);
    this.currentPlaybackRate = speeds[(currentIndex + 1) % speeds.length];
    return this.currentPlaybackRate;
  }
}

window.WhatsAppMode = WhatsAppMode;
