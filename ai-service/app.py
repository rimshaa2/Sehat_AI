import os
import socket
import json
import uuid
from dotenv import load_dotenv
from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
import speech_recognition as sr
from gtts import gTTS
from groq import Groq

# ── Load env FIRST before anything else ──────────────────────────────────────
load_dotenv()

# ── FFmpeg Setup (Cross-platform friendly) ───────────────────────────────────
from pydub import AudioSegment

FFMPEG_BIN_PATH = os.getenv("FFMPEG_BIN_PATH", "").strip()
ffmpeg_name = "ffmpeg.exe" if os.name == "nt" else "ffmpeg"
ffprobe_name = "ffprobe.exe" if os.name == "nt" else "ffprobe"

if FFMPEG_BIN_PATH:
    os.environ["PATH"] += os.pathsep + FFMPEG_BIN_PATH
    ffmpeg_path = os.path.join(FFMPEG_BIN_PATH, ffmpeg_name)
    ffprobe_path = os.path.join(FFMPEG_BIN_PATH, ffprobe_name)
    AudioSegment.converter = ffmpeg_path
    AudioSegment.ffmpeg = ffmpeg_path
    AudioSegment.ffprobe = ffprobe_path

if AudioSegment.converter and os.path.exists(AudioSegment.converter):
    print(f"✅ FFmpeg found at {AudioSegment.converter}")
else:
    print("⚠️ FFmpeg path not explicitly configured. Falling back to system PATH.")

# ── Flask App ─────────────────────────────────────────────────────────────────
app = Flask(__name__)
CORS(app)

# ── Groq Client Setup ─────────────────────────────────────────────────────────
GROQ_API_KEY = os.getenv("GROQ_API_KEY")
if GROQ_API_KEY:
    groq_client = Groq(api_key=GROQ_API_KEY)
    print("✅ Groq client ready — Llama 3.3 70B loaded")
else:
    groq_client = None
    print("❌ GROQ_API_KEY missing in .env file!")

GROQ_MODEL = "llama-3.3-70b-versatile"

os.makedirs("temp", exist_ok=True)

# ── Get Local IP ──────────────────────────────────────────────────────────────
def get_local_ip():
    try:
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        s.connect(("8.8.8.8", 1))
        ip = s.getsockname()[0]
        s.close()
        return ip
    except:
        return "127.0.0.1"

# ── Core AI Logic ─────────────────────────────────────────────────────────────
def process_ai_logic(user_text: str, user_profile: dict, language: str = "en-US") -> str:
    if not groq_client:
        return "AI service is not configured. Please add your GROQ_API_KEY to the .env file."

    try:
        # Extract profile fields safely
        age       = user_profile.get("age") or None
        gender    = user_profile.get("gender") or None
        history   = user_profile.get("conditions") or None
        allergies = user_profile.get("allergies") or None
        blood     = user_profile.get("bloodType") or None

        # Build patient context — only include known fields
        context_lines = []
        if age:       context_lines.append(f"- Age: {age} years old")
        if gender:    context_lines.append(f"- Gender: {gender}")
        if history:   context_lines.append(f"- Medical History: {history}")
        if allergies: context_lines.append(f"- Known Allergies: {allergies}")
        if blood:     context_lines.append(f"- Blood Type: {blood}")

        context_str = "\n".join(context_lines) if context_lines else "No health profile available."
        is_urdu     = "ur" in language.lower()
        lang_note   = "Respond in Urdu (native script)." if is_urdu else "Respond in clear English."

        prompt = f"""You are Sehat AI, an intelligent and empathetic medical health assistant.

PATIENT PROFILE:
{context_str}

USER'S QUESTION: "{user_text}"

INSTRUCTIONS:
1. PERSONALIZE: Tailor your answer to the patient's age, gender, and medical history if available.
2. BE HELPFUL: Give a real, useful answer. Never refuse to help or say you cannot assist.
3. BE EMPATHETIC: Acknowledge concern if the user seems worried or in pain.
4. STRUCTURE your response:
   - Address the main concern directly
   - Mention any connection to their medical history if relevant
   - Give 1-2 practical steps they can take right now
   - Recommend seeing a doctor if the issue seems serious
5. LENGTH: 3-4 sentences max. Be concise but complete.
6. LANGUAGE: {lang_note}
7. DO NOT make up specific medications or give definitive diagnoses.
8. DO NOT start your response with "I" — start with the advice directly."""

        print(f"🧠 Processing: '{user_text[:50]}' | age={age}, gender={gender}, history={history}")

        # ── Groq API Call ─────────────────────────────────────────────────────
        response = groq_client.chat.completions.create(
            model=GROQ_MODEL,
            messages=[
                {
                    "role": "system",
                    "content": "You are Sehat AI, a helpful, empathetic, and knowledgeable medical health assistant. You give personalized, practical health advice based on the patient's profile."
                },
                {
                    "role": "user",
                    "content": prompt
                }
            ],
            max_tokens=300,
            temperature=0.7,
        )

        result = response.choices[0].message.content.strip()
        print(f"✅ AI Response: {result[:80]}...")
        return result

    except Exception as e:
        err = str(e)
        print(f"❌ AI Error: {err}")

        if "429" in err or "quota" in err.lower() or "rate" in err.lower():
            return "I've reached my usage limit for now. Please wait a moment and try again."
        elif "401" in err or "invalid" in err.lower():
            return "Invalid API key. Please check your GROQ_API_KEY in the .env file."
        elif "connection" in err.lower() or "refused" in err.lower():
            return "Cannot connect to AI service. Please check your internet connection."
        else:
            return "I'm having a technical issue right now. Please try again in a moment."


# ── Voice Chat Endpoint ───────────────────────────────────────────────────────
@app.route("/voice-chat", methods=["POST"])
def voice_chat():
    try:
        if "audio" not in request.files:
            return jsonify({"error": "No audio file provided"}), 400

        audio_file  = request.files["audio"]
        language    = request.form.get("language", "en-US")
        profile_str = request.form.get("userProfile", "{}")

        try:
            user_profile = json.loads(profile_str)
        except:
            user_profile = {}

        # Save and convert audio
        uid        = str(uuid.uuid4())
        input_path = f"temp/{uid}.m4a"
        wav_path   = f"temp/{uid}.wav"
        audio_file.save(input_path)

        track = AudioSegment.from_file(input_path, format="m4a")
        track.export(wav_path, format="wav")

        # Speech to Text
        recognizer = sr.Recognizer()
        with sr.AudioFile(wav_path) as source:
            audio_data = recognizer.record(source)
            try:
                user_text = recognizer.recognize_google(audio_data, language=language)
            except sr.UnknownValueError:
                user_text = "..."
            except sr.RequestError:
                user_text = "Error connecting to speech service"

        print(f"🗣️ User Said ({language}): {user_text}")

        if user_text == "...":
            ai_response = "I didn't catch that. Could you please speak again a little louder?"
        else:
            ai_response = process_ai_logic(user_text, user_profile, language)

        # Text to Speech
        tts_lang = "ur" if "ur" in language.lower() else "en"
        tts = gTTS(text=ai_response, lang=tts_lang)
        response_audio_path = f"temp/{uid}_response.mp3"
        tts.save(response_audio_path)

        return jsonify({
            "success": True,
            "user_text": user_text,
            "ai_text": ai_response,
            "audio_url": f"http://{get_local_ip()}:5001/get-audio/{uid}_response.mp3"
        })

    except Exception as e:
        print(f"❌ Voice error: {e}")
        return jsonify({"error": str(e)}), 500


# ── Text Chat Endpoint ────────────────────────────────────────────────────────
@app.route("/text-chat", methods=["POST"])
def text_chat():
    try:
        data         = request.get_json()
        user_text    = (data.get("text") or "").strip()
        language     = data.get("language", "en-US")
        user_profile = data.get("userProfile", {})

        if not user_text:
            return jsonify({"error": "No text provided"}), 400

        print(f"💬 Text Chat ({language}): {user_text}")
        ai_response = process_ai_logic(user_text, user_profile, language)

        return jsonify({
            "success": True,
            "user_text": user_text,
            "ai_text": ai_response,
        })

    except Exception as e:
        print(f"❌ Text error: {e}")
        return jsonify({"error": str(e)}), 500


# ── Serve Audio Files ─────────────────────────────────────────────────────────
@app.route("/get-audio/<filename>", methods=["GET"])
def get_audio(filename):
    path = f"temp/{filename}"
    if not os.path.exists(path):
        return jsonify({"error": "Audio not found"}), 404
    return send_file(path, mimetype="audio/mpeg")


# ── Health Check ──────────────────────────────────────────────────────────────
@app.route("/health", methods=["GET"])
def health():
    return jsonify({
        "status": "OK",
        "service": "Sehat AI Python Service",
        "ai_engine": f"Groq ({GROQ_MODEL}) — Llama 3.3 70B",
        "groq": "configured" if groq_client else "MISSING API KEY",
        "ffmpeg": "found" if os.path.exists(AudioSegment.converter) else "NOT FOUND",
    })


if __name__ == "__main__":
    print(f"\n🚀 Sehat AI Service starting on port 5001")
    print(f"🤖 AI Engine: Groq — Llama 3.3 70B")
    print(f"📡 Local IP: {get_local_ip()}")
    print(f"🔗 Health check: http://localhost:5001/health\n")
    app.run(port=5001, host="0.0.0.0", debug=True)