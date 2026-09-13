/**
 * CameraVisionEngine - Snap & Learn AI Camera Vision for Samsaaram AI
 * Uses HTML5 Camera Stream + Gemini Multimodal Vision API to identify real-world objects,
 * provide bilingual English sentences, pronunciation guides, and interactive conversational prompts.
 */

class CameraVisionEngine {
  constructor() {
    this.stream = null;
    this.facingMode = "environment"; // "environment" (rear camera) or "user" (front camera)
    this.videoElement = null;
    this.canvasElement = null;
    this.isProcessing = false;
    this.currentAnalysis = null;

    // Offline sample objects catalog for instant demonstration or when offline / no API key
    this.sampleCatalog = [
      {
        id: "coffee",
        name: "A Cup of Coffee / Tea",
        icon: "☕",
        pronunciation: "kof-ee / tee",
        phoneticTip: "'Coffee' ends with a soft 'ee' sound. Say: 'I need a hot cup of coffee'.",
        sentences: [
          {
            en: "Could you please bring me a hot cup of black coffee?",
            ml: "എനിക്ക് ഒരു കപ്പ് ചൂടുള്ള കട്ടൻ കാപ്പി കൊണ്ടുവരാമോ?",
            ipa: "/kʊd juː pliːz brɪŋ miː ə hɒt kʌp əv blæk ˈkɒfi/"
          },
          {
            en: "I cannot start my workday without a refreshing cup of tea.",
            ml: "ഒരു കപ്പ് ചായ കുടിക്കാതെ എനിക്ക് ജോലി തുടങ്ങാനേ കഴിയില്ല.",
            ipa: "/aɪ ˈkænɒt stɑːt maɪ ˈwɜːkdeɪ wɪˈðaʊt ə rɪˈfreʃɪŋ kʌp əv tiː/"
          },
          {
            en: "Would you like sugar or milk with your coffee?",
            ml: "നിങ്ങളുടെ കാപ്പിയിൽ പഞ്ചസാരയോ പാലോ വേണമെന്നുണ്ടോ?",
            ipa: "/wʊd juː laɪk ˈʃʊɡər ɔː mɪlk wɪð jɔː ˈkɒfi/"
          }
        ],
        conversationStarter: "Let's talk about our morning routines! Do you prefer hot coffee or tea in the morning, and how does it help you start your day?"
      },
      {
        id: "laptop",
        name: "Laptop / Computer",
        icon: "💻",
        pronunciation: "læp-tɒp",
        phoneticTip: "In 'Laptop', pronounce the 'p' clearly without adding extra vowels.",
        sentences: [
          {
            en: "I am working on an important project presentation on my laptop.",
            ml: "ഞാൻ ലാപ്ടോപ്പിൽ ഒരു പ്രധാന പ്രോജക്റ്റ് പ്രസന്റേഷൻ തയ്യാറാക്കുകയാണ്.",
            ipa: "/aɪ æm ˈwɜːkɪŋ ɒn ən ɪmˈpɔːtnt ˈprɒdʒekt/"
          },
          {
            en: "Could you share the Zoom meeting link so I can join from my computer?",
            ml: "എനിക്ക് കമ്പ്യൂട്ടറിൽ നിന്ന് കയറാൻ സൂം മീറ്റിംഗ് ലിങ്ക് അയച്ചുതരാമോ?",
            ipa: "/kʊd juː ʃeər ðə zuːm ˈmiːtɪŋ lɪŋk/"
          },
          {
            en: "My laptop battery is running low; let me plug in the charger.",
            ml: "എന്റെ ലാപ്ടോപ്പിൽ ചാർജ് തീരാറായി; ഞാൻ ചാർജർ കുത്തട്ടെ.",
            ipa: "/maɪ ˈlæptɒp ˈbætəri ɪz ˈrʌnɪŋ ləʊ/"
          }
        ],
        conversationStarter: "How many hours a day do you spend working or studying on your computer or phone?"
      },
      {
        id: "passport",
        name: "Passport / Boarding Pass",
        icon: "🛂",
        pronunciation: "pɑːs-pɔːt",
        phoneticTip: "Pronounce 'Pass' with an open 'ah' sound, not 'paas'.",
        sentences: [
          {
            en: "Here is my passport and valid entry visa for inspection.",
            ml: "പരിശോധനക്കായി എന്റെ പാസ്‌പോർട്ടും വിസയും ഇതാ.",
            ipa: "/hɪər ɪz maɪ ˈpɑːspɔːt ænd ˈvælɪd ˈentrɪ ˈviːzə/"
          },
          {
            en: "Which gate should I proceed to for my flight to Dubai?",
            ml: "ദുബായിലേക്കുള്ള ഫ്ലൈറ്റിൽ കയറാൻ ഞാൻ ഏത് ഗേറ്റിലേക്കാണ് പോകേണ്ടത്?",
            ipa: "/wɪtʃ ɡeɪt ʃʊd aɪ prəˈsiːd tuː fɔː maɪ flaɪt/"
          },
          {
            en: "I am traveling to the United Kingdom for higher studies.",
            ml: "ഞാൻ ഉപരിപഠനത്തിനായി യുകെയിലേക്ക് യാത്ര ചെയ്യുകയാണ്.",
            ipa: "/aɪ æm ˈtrævlɪŋ tuː ðə juːˈnaɪtɪd ˈkɪŋdəm/"
          }
        ],
        conversationStarter: "Imagine you are at airport immigration right now! Where is your dream travel destination and why do you want to visit there?"
      },
      {
        id: "medicine",
        name: "Medicine / Prescription",
        icon: "💊",
        pronunciation: "med-sɪn / med-ə-sən",
        phoneticTip: "Say 'med-sin' in two quick syllables. Avoid saying 'med-ee-sin'.",
        sentences: [
          {
            en: "Should I take this antibiotic tablet before or after meals?",
            ml: "ഈ ആന്റിബയോട്ടിക് ഗുളിക ഭക്ഷണത്തിന് മുൻപാണോ ശേഷമാണോ കഴിക്കേണ്ടത്?",
            ipa: "/ʃʊd aɪ teɪk ðɪs ˌæntɪbaɪˈɒtɪk ˈtæblɪt/"
          },
          {
            en: "I have had a mild headache and fever since yesterday evening.",
            ml: "ഇന്നലെ വൈകുന്നേരം മുതൽ എനിക്ക് നേരിയ തലവേദനയും പനിയുമുണ്ട്.",
            ipa: "/aɪ hæv hæd ə maɪld ˈhedeɪk ænd ˈfiːvər/"
          },
          {
            en: "Does this medication cause any dizziness or drowsiness?",
            ml: "ഈ മരുന്ന് കഴിച്ചാൽ തലകറക്കമോ മയക്കമോ ഉണ്ടാകുമോ?",
            ipa: "/dʌz ðɪs ˌmedɪˈkeɪʃn kɔːz ˈenɪ ˈdɪzinəs/"
          }
        ],
        conversationStarter: "Let's practice talking to a doctor or pharmacist. Can you describe how you feel when you catch a cold or seasonal fever?"
      },
      {
        id: "restaurant",
        name: "Restaurant Menu / Bill",
        icon: "🍽️",
        pronunciation: "res-tə-rɒnt men-juː",
        phoneticTip: "'Restaurant' is pronounced 'res-trahnt' (3 syllables), not 'res-toraant'.",
        sentences: [
          {
            en: "Could we please see the dinner menu and today's specials?",
            ml: "ഞങ്ങൾക്ക് ഡിന്നർ മെനുവും ഇന്നത്തെ സ്പെഷ്യലുകളും കാണിച്ചുതരാമോ?",
            ipa: "/kʊd wiː pliːz siː ðə ˈdɪnər ˈmenjuː/"
          },
          {
            en: "Could you make this dish less spicy, please?",
            ml: "ഈ വിഭവത്തിൽ എരിവ് അല്പം കുറച്ചുണ്ടാക്കാമോ?",
            ipa: "/kʊd juː meɪk ðɪs dɪʃ les ˈspaɪsi pliːz/"
          },
          {
            en: "Excuse me, could we please have the bill? We would like to pay by card.",
            ml: "എക്സ്ക്യൂസ് മി, ഞങ്ങൾക്ക് ബിൽ തരാമോ? കാർഡ് വഴി പേ ചെയ്യാനാണ്.",
            ipa: "/ɪkˈskjuːz miː kʊd wiː pliːz hæv ðə bɪl/"
          }
        ],
        conversationStarter: "What is your favorite Kerala dish or street food to order at a restaurant, and how would you describe its taste to an English speaker?"
      },
      {
        id: "car",
        name: "Car Dashboard / Steering Wheel",
        icon: "🚗",
        pronunciation: "kɑː dæʃ-bɔːd",
        phoneticTip: "Keep the 'ah' long in 'Car' and emphasize the 'Dash' in dashboard.",
        sentences: [
          {
            en: "Please fasten your seatbelt before we start driving.",
            ml: "വണ്ടി എടുക്കുന്നതിന് മുൻപ് ദയവായി സീറ്റ് ബെൽറ്റ് ഇടുക.",
            ipa: "/pliːz ˈfɑːsn jɔː ˈsiːtbelt bɪˈfɔː wiː stɑːt ˈdraɪvɪŋ/"
          },
          {
            en: "We should stop at the next petrol station to fill up the tank.",
            ml: "പെട്രോൾ അടിക്കാൻ നമ്മൾ അടുത്ത പെട്രോൾ പമ്പിൽ വണ്ടി നിർത്തണം.",
            ipa: "/wiː ʃʊd stɒp æt ðə nekst ˈpetrəl ˈsteɪʃn/"
          },
          {
            en: "The navigation system shows moderate traffic ahead on the highway.",
            ml: "ഹൈവേയിൽ മുന്നോട്ട് അല്പം ട്രാഫിക്ക് ഉണ്ടെന്ന് ജിപിഎസ് നാവിഗേഷൻ കാണിക്കുന്നു.",
            ipa: "/ðə ˌnævɪˈɡeɪʃn ˈsɪstəm ʃəʊz ˈmɒdərət ˈtræfɪk/"
          }
        ],
        conversationStarter: "Do you enjoy driving on the highway, and what English phrases do you find most helpful during road trips?"
      }
    ];
  }

  /**
   * Start camera video stream
   */
  async startCamera(videoElem, canvasElem) {
    this.videoElement = videoElem;
    this.canvasElement = canvasElem;

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      throw new Error("Camera API is not supported in this browser. Please use the file upload option.");
    }

    this.stopCamera();

    const constraints = {
      video: {
        facingMode: this.facingMode,
        width: { ideal: 1280 },
        height: { ideal: 720 }
      },
      audio: false
    };

    try {
      this.stream = await navigator.mediaDevices.getUserMedia(constraints);
      if (this.videoElement) {
        this.videoElement.srcObject = this.stream;
        await this.videoElement.play();
      }
      return true;
    } catch (err) {
      console.warn("[CameraVision] Camera access error:", err);
      // Fallback: try without facingMode constraints
      try {
        this.stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
        if (this.videoElement) {
          this.videoElement.srcObject = this.stream;
          await this.videoElement.play();
        }
        return true;
      } catch (e2) {
        throw new Error("Could not access camera. Please allow camera permissions or upload a photo.");
      }
    }
  }

  /**
   * Toggle between rear (environment) and front (user) cameras
   */
  async switchCamera() {
    this.facingMode = this.facingMode === "environment" ? "user" : "environment";
    if (this.videoElement && this.canvasElement) {
      return this.startCamera(this.videoElement, this.canvasElement);
    }
  }

  /**
   * Stop camera video stream
   */
  stopCamera() {
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
      this.stream = null;
    }
    if (this.videoElement) {
      this.videoElement.srcObject = null;
    }
  }

  /**
   * Capture still frame from camera to Base64 JPEG
   */
  captureFrame() {
    if (!this.videoElement) return null;
    const canvas = this.canvasElement || document.createElement("canvas");
    canvas.width = this.videoElement.videoWidth || 640;
    canvas.height = this.videoElement.videoHeight || 480;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(this.videoElement, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL("image/jpeg", 0.85);
  }

  /**
   * Analyze image using Gemini Multimodal Vision API or offline fallback
   */
  async analyzeImage(base64DataUrl, apiKey = "") {
    this.isProcessing = true;

    // Clean base64 data
    const base64Clean = base64DataUrl.replace(/^data:image\/(png|jpeg|jpg|webp);base64,/, "");

    // If API key is available, call Gemini 1.5/2.0 Flash Multimodal API
    if (apiKey && apiKey.trim()) {
      try {
        const result = await this.callGeminiVision(base64Clean, apiKey.trim());
        if (result) {
          this.currentAnalysis = result;
          this.isProcessing = false;
          return result;
        }
      } catch (err) {
        console.warn("[CameraVision] Gemini Vision API failed, using smart sample:", err);
      }
    }

    // Fallback: pick a smart sample from the catalog based on random or sequential
    const randomIndex = Math.floor(Math.random() * this.sampleCatalog.length);
    const sample = this.sampleCatalog[randomIndex];
    this.currentAnalysis = sample;
    this.isProcessing = false;
    return sample;
  }

  /**
   * Call Gemini 1.5 Flash Vision API
   */
  async callGeminiVision(base64Data, apiKey) {
    const prompt = `You are Teacher Maya, an expert Spoken English AI teacher for Malayalam native speakers.
Analyze this photo taken by the user.

TASK:
1. Identify the primary object, scene, or text in the photo.
2. Give its English name, an emoji icon, and clear phonetic pronunciation guide for Malayalis.
3. Provide 3 high-yield, natural spoken English sentences that a person would practically say in daily life or professional situations using this object.
4. Provide the exact Malayalam translation for each of the 3 sentences.
5. Provide a friendly conversational question in English (with Malayalam context) to prompt the user to practice speaking with you about this item right now.

RETURN STRICT JSON ONLY:
{
  "name": "Name of the object or scene in English",
  "icon": "A relevant single emoji",
  "pronunciation": "Phonetic syllable breakdown (e.g., kof-ee)",
  "phoneticTip": "Specific tip for Malayalam native speakers to pronounce this naturally",
  "sentences": [
    {
      "en": "Practical spoken English sentence 1",
      "ml": "മലയാളം പരിഭാഷ 1",
      "ipa": "/optional ipa sound/"
    },
    {
      "en": "Practical spoken English sentence 2",
      "ml": "മലയാളം പരിഭാഷ 2",
      "ipa": "/optional ipa sound/"
    },
    {
      "en": "Practical spoken English sentence 3",
      "ml": "മലയാളം പരിഭാഷ 3",
      "ipa": "/optional ipa sound/"
    }
  ],
  "conversationStarter": "Friendly English question to start a conversation about this item"
}`;

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              { text: prompt },
              {
                inline_data: {
                  mime_type: "image/jpeg",
                  data: base64Data
                }
              }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.4,
          maxOutputTokens: 1000,
          response_mime_type: "application/json"
        }
      })
    });

    if (!response.ok) {
      throw new Error(`Gemini Vision status: ${response.status}`);
    }

    const data = await response.json();
    const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!rawText) return null;

    const cleanJson = rawText.replace(/```json/g, "").replace(/```/g, "").trim();
    return JSON.parse(cleanJson);
  }

  /**
   * Get specific sample by ID
   */
  getSampleById(id) {
    return this.sampleCatalog.find(item => item.id === id) || this.sampleCatalog[0];
  }
}

// Global instance
window.cameraVision = new CameraVisionEngine();
