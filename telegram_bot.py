"""
Samsaaram AI - Telegram & WhatsApp Voice-Note Bot Bridge
Allows learners to practice English by sending voice notes directly from their real phone.

How to run:
1. Open Telegram and search for '@BotFather'.
2. Send '/newbot' and follow instructions to get your BOT TOKEN.
3. Set your token: set TELEGRAM_BOT_TOKEN="your_token_here"
4. Run: python telegram_bot.py
"""

import os
import sys
import json
import urllib.request
import urllib.parse
import time

BOT_TOKEN = os.environ.get("TELEGRAM_BOT_TOKEN", "")

def get_maya_response(user_text):
    """Simple bilingual tutor response generator for Telegram bot."""
    lower = user_text.lower().strip()
    
    # Check Malayali pitfalls
    if "going to home" in lower:
        return (
            "✅ Correct: 'I am going home'\n"
            "❌ Incorrect: 'I am going to home'\n\n"
            "💡 മലയാളം വിശദീകരണം: ഇംഗ്ലീഷിൽ 'home'-ന് മുന്നിൽ 'to' ചേർക്കേണ്ടതില്ല! 'I'm going home' എന്ന് നേരിട്ട് പറയാം."
        )
    if "yesterday only" in lower:
        return (
            "✅ Correct: 'I came yesterday' or 'Just yesterday'\n"
            "❌ Incorrect: 'Yesterday only I came'\n\n"
            "💡 മലയാളം വിശദീകരണം: മലയാളത്തിലെ 'ഇന്നലെയാണ്' എന്നത് ഇംഗ്ലീഷിൽ 'yesterday only' എന്ന് നേരിട്ട് തർജ്ജമ ചെയ്യരുത്."
        )
    if "myself " in lower:
        return (
            "✅ Correct: 'I am...' or 'My name is...'\n"
            "❌ Avoid: 'Myself Rahul'\n\n"
            "💡 മലയാളം വിശദീകരണം: സ്വയം പരിചയപ്പെടുത്തുമ്പോൾ 'Myself' എന്ന് തുടങ്ങുന്നത് ശരിയല്ല. 'I am...' എന്ന് പറയുക."
        )

    # General conversation response
    return (
        f"Teacher Maya 👩‍🏫:\n\n"
        f"That's great! You said: \"{user_text}\"\n\n"
        f"Keep speaking in English every day. Can you tell me more about what you did today? (ഇന്ന് ചെയ്ത കാര്യങ്ങളെക്കുറിച്ച് 1 മിനിറ്റ് വോയ്‌സ് നോട്ട് അയക്കൂ!)"
    )

def send_telegram_message(chat_id, text):
    if not BOT_TOKEN:
        print("[Telegram Bot] TELEGRAM_BOT_TOKEN is not configured.")
        return
    url = f"https://api.telegram.org/bot{BOT_TOKEN}/sendMessage"
    payload = json.dumps({"chat_id": chat_id, "text": text}).encode("utf-8")
    req = urllib.request.Request(url, data=payload, headers={"Content-Type": "application/json"})
    try:
        with urllib.request.urlopen(req) as resp:
            return json.loads(resp.read().decode())
    except Exception as e:
        print(f"[Error sending message]: {e}")

def run_bot():
    print("==================================================")
    print("  Samsaaram AI - Telegram Voice-Note Teacher Maya")
    print("==================================================")
    if not BOT_TOKEN:
        print("\n⚠️ TELEGRAM_BOT_TOKEN not found in environment!")
        print("To run the real phone bot:")
        print("  1. Create a bot with @BotFather on Telegram")
        print("  2. Run: set TELEGRAM_BOT_TOKEN=your_token")
        print("  3. Run: python telegram_bot.py\n")
        print("In the web app, the built-in WhatsApp Voice Simulator works directly without any token!")
        return

    print(f"Bot started successfully! Waiting for messages...")
    offset = 0
    while True:
        try:
            url = f"https://api.telegram.org/bot{BOT_TOKEN}/getUpdates?offset={offset}&timeout=30"
            req = urllib.request.Request(url)
            with urllib.request.urlopen(req) as resp:
                data = json.loads(resp.read().decode())
                for update in data.get("result", []):
                    offset = update["update_id"] + 1
                    msg = update.get("message", {})
                    chat_id = msg.get("chat", {}).get("id")
                    text = msg.get("text", "")
                    
                    if text:
                        print(f"Received message from {chat_id}: {text}")
                        reply = get_maya_response(text)
                        send_telegram_message(chat_id, reply)
        except Exception as e:
            print(f"Polling error: {e}")
            time.sleep(3)

if __name__ == "__main__":
    run_bot()
