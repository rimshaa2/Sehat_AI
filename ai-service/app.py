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

# ── FFmpeg Setup (Auto-detection for Windows) ────────────────────────────────
from pydub import AudioSegment

def find_ffmpeg_windows():
    """Search common Windows locations for ffmpeg.exe automatically."""
    common_paths = [
        r"C:\ffmpeg\bin",
        r"C:\Program Files\ffmpeg\bin",
        r"C:\Program Files (x86)\ffmpeg\bin",
        os.path.join(os.path.expanduser("~"), "ffmpeg", "bin"),
        os.path.join(os.path.expanduser("~"), "Downloads", "ffmpeg", "bin"),
        os.path.join(os.path.expanduser("~"), "Downloads", "ffmpeg-master-latest-win64-gpl", "bin"),
        os.path.join(os.path.expanduser("~"), "Downloads", "ffmpeg-release-essentials", "bin"),
    ]
    # Also search one level deep inside Downloads for any ffmpeg folder
    downloads = os.path.join(os.path.expanduser("~"), "Downloads")
    if os.path.exists(downloads):
        for folder in os.listdir(downloads):
            if "ffmpeg" in folder.lower():
                candidate = os.path.join(downloads, folder, "bin")
                if os.path.exists(os.path.join(candidate, "ffmpeg.exe")):
                    common_paths.insert(0, candidate)

    for path in common_paths:
        if os.path.exists(os.path.join(path, "ffmpeg.exe")):
            return path
    return None

def setup_ffmpeg():
    ffmpeg_name  = "ffmpeg.exe"  if os.name == "nt" else "ffmpeg"
    ffprobe_name = "ffprobe.exe" if os.name == "nt" else "ffprobe"

    # 1️⃣ Try .env value first
    bin_path = os.getenv("FFMPEG_BIN_PATH", "").strip()

    # 2️⃣ Auto-detect on Windows if .env not set
    if not bin_path and os.name == "nt":
        bin_path = find_ffmpeg_windows()
        if bin_path:
            print(f"🔍 FFmpeg auto-detected at: {bin_path}")

    if bin_path:
        ffmpeg_exe  = os.path.join(bin_path, ffmpeg_name)
        ffprobe_exe = os.path.join(bin_path, ffprobe_name)

        if os.path.exists(ffmpeg_exe):
            os.environ["PATH"] += os.pathsep + bin_path
            AudioSegment.converter = ffmpeg_exe
            AudioSegment.ffmpeg    = ffmpeg_exe
            AudioSegment.ffprobe   = ffprobe_exe
            print(f"✅ FFmpeg configured: {ffmpeg_exe}")
            return True
        else:
            print(f"⚠️  FFMPEG_BIN_PATH set to '{bin_path}' but ffmpeg.exe not found there.")

    # 3️⃣ Check if ffmpeg is already in system PATH
    import shutil
    if shutil.which("ffmpeg"):
        print("✅ FFmpeg found in system PATH.")
        return True

    print("❌ FFmpeg NOT found. Voice chat will fail.")
    print("   Fix: Set FFMPEG_BIN_PATH in your .env file, e.g.:")
    print(r"   FFMPEG_BIN_PATH=C:\ffmpeg\bin")
    return False

FFMPEG_OK = setup_ffmpeg()

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


# ── Format doctors list for system prompt ─────────────────────────────────────
def format_doctors_context(doctors: list) -> str:
    if not doctors:
        return "No doctors currently listed in the system."

    lines = []
    for d in doctors:
        name        = d.get("name", "Unknown Doctor")
        specialty   = d.get("specialization", "General")
        experience  = d.get("experienceYears")
        fee         = d.get("consultationFee")
        available   = d.get("availabilityStatus", True)
        doctor_id   = d.get("id", "")

        status  = "✅ Available" if available else "❌ Unavailable"
        exp_str = f"{experience} yrs exp" if experience else ""
        fee_str = f"PKR {fee}" if fee else ""

        parts = [p for p in [exp_str, fee_str, status] if p]
        lines.append(f"- Dr. {name} | {specialty} | {' | '.join(parts)} | ID:{doctor_id}")

    return "\n".join(lines)


# ── Core AI Logic ─────────────────────────────────────────────────────────────
def process_ai_logic(user_text: str, user_profile: dict, doctors: list, language: str = "en-US") -> dict:
    if not groq_client:
        return {
            "text": "AI service is not configured. Please add your GROQ_API_KEY to the .env file.",
            "suggested_doctors": []
        }

    try:
        name             = user_profile.get("name") or "the patient"
        age              = user_profile.get("age")
        gender           = user_profile.get("gender")
        conditions       = user_profile.get("conditions")
        allergies        = user_profile.get("allergies")
        blood            = user_profile.get("bloodType")
        weight           = user_profile.get("weight")
        height           = user_profile.get("height")
        dob              = user_profile.get("dateOfBirth")
        emergency        = user_profile.get("emergencyContact")
        recent_medicines = user_profile.get("recentMedicines")
        recent_records   = user_profile.get("recentRecords")
        recent_wellness  = user_profile.get("recentWellness")

        def line(label, value):
            return f"- {label}: {value}" if value else None

        context_lines = list(filter(None, [
            line("Name", name),
            line("Age", f"{age} years old" if age else None),
            line("Gender", gender),
            line("Blood Type", blood),
            line("Date of Birth", dob),
            line("Weight", f"{weight} kg" if weight else None),
            line("Height", f"{height} cm" if height else None),
            line("Medical History / Conditions", conditions),
            line("Known Allergies", allergies),
            line("Emergency Contact", emergency),
            line("Current Medications", recent_medicines),
            line("Recent Health Records", recent_records),
            line("Mental Wellness Activity", recent_wellness),
        ]))

        context_str = "\n".join(context_lines) if context_lines else "No health profile available."
        doctors_str = format_doctors_context(doctors)
        is_urdu     = "ur" in language.lower()
        lang_note   = "Respond in Urdu (native script)." if is_urdu else "Respond in clear English."

        doctor_id_map = {str(d.get("id", "")): d for d in doctors if d.get("id")}

        system_prompt = f"""You are Sehat AI, an intelligent, empathetic, and highly personalized medical health assistant built for Pakistani users.

You have FULL ACCESS to this patient's complete health profile, medical history, and the list of real doctors available in the Sehat AI system.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PATIENT PROFILE & MEDICAL HISTORY:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
{context_str}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
AVAILABLE DOCTORS IN SEHAT AI SYSTEM:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
{doctors_str}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
YOUR RULES:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
1. PERSONALIZE every response — use the patient's name, reference their actual conditions, medications, and history when relevant.
2. If they ask about a symptom and have a known related condition, mention the connection explicitly.
3. If they are on medications, consider drug interactions or side effects when advising.
4. DOCTOR SUGGESTIONS: If the question involves symptoms, conditions, or anything that warrants seeing a specialist:
   - Recommend the most relevant doctor(s) from the list above BY NAME and SPECIALTY
   - End your response with a line formatted EXACTLY like this (do not change the format):
     SUGGEST_DOCTORS:[comma-separated doctor IDs from the list, e.g. 3,7]
   - Only suggest doctors who are marked ✅ Available
   - If no relevant doctor is available, do NOT include the SUGGEST_DOCTORS line
5. Give 1-2 clear practical steps the patient can take right now.
6. Recommend seeing a doctor if the issue seems serious.
7. Be concise — 3-5 sentences max for the main response.
8. DO NOT make up medications or give definitive diagnoses.
9. DO NOT start with "I" — start with the advice or the patient's name.
10. LANGUAGE: {lang_note}"""

        print(f"🧠 Processing: '{user_text[:60]}' | {len(doctors)} doctors available | name={name}")

        response = groq_client.chat.completions.create(
            model=GROQ_MODEL,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user",   "content": user_text},
            ],
            max_tokens=450,
            temperature=0.65,
        )

        raw_text = response.choices[0].message.content.strip()
        print(f"✅ Raw AI Response: {raw_text[:100]}...")

        suggested_doctors = []
        clean_text        = raw_text

        if "SUGGEST_DOCTORS:" in raw_text:
            parts      = raw_text.split("SUGGEST_DOCTORS:")
            clean_text = parts[0].strip()
            id_str     = parts[1].strip().split("\n")[0].strip()

            suggested_ids = [sid.strip() for sid in id_str.split(",") if sid.strip()]
            for sid in suggested_ids:
                if sid in doctor_id_map:
                    suggested_doctors.append(doctor_id_map[sid])

            print(f"🏥 Suggested doctor IDs: {suggested_ids} → matched {len(suggested_doctors)}")

        return {
            "text":              clean_text,
            "suggested_doctors": suggested_doctors,
        }

    except Exception as e:
        err = str(e)
        print(f"❌ AI Error: {err}")

        fallback = (
            "I've reached my usage limit for now. Please wait a moment and try again."
            if ("429" in err or "quota" in err.lower() or "rate" in err.lower())
            else "Invalid API key. Please check your GROQ_API_KEY in the .env file."
            if ("401" in err or "invalid" in err.lower())
            else "Cannot connect to AI service. Please check your internet connection."
            if ("connection" in err.lower() or "refused" in err.lower())
            else "I'm having a technical issue right now. Please try again in a moment."
        )
        return {"text": fallback, "suggested_doctors": []}


# ── Voice Chat Endpoint ───────────────────────────────────────────────────────
@app.route("/voice-chat", methods=["POST"])
def voice_chat():
    try:
        if not FFMPEG_OK:
            return jsonify({
                "error": "FFmpeg is not installed or not found. Please set FFMPEG_BIN_PATH in your .env file."
            }), 500

        if "audio" not in request.files:
            return jsonify({"error": "No audio file provided"}), 400

        audio_file   = request.files["audio"]
        language     = request.form.get("language", "en-US")
        profile_str  = request.form.get("userProfile", "{}")
        doctors_str  = request.form.get("doctors", "[]")

        try:
            user_profile = json.loads(profile_str)
        except:
            user_profile = {}

        try:
            doctors = json.loads(doctors_str)
        except:
            doctors = []

        uid        = str(uuid.uuid4())
        input_path = f"temp/{uid}.m4a"
        wav_path   = f"temp/{uid}.wav"
        audio_file.save(input_path)

        track = AudioSegment.from_file(input_path, format="m4a")
        track.export(wav_path, format="wav")

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
            result = {
                "text": "I didn't catch that. Could you please speak again a little louder?",
                "suggested_doctors": []
            }
        else:
            result = process_ai_logic(user_text, user_profile, doctors, language)

        ai_response = result["text"]

        tts_lang = "ur" if "ur" in language.lower() else "en"
        tts = gTTS(text=ai_response, lang=tts_lang)
        response_audio_path = f"temp/{uid}_response.mp3"
        tts.save(response_audio_path)

        return jsonify({
            "success":           True,
            "user_text":         user_text,
            "ai_text":           ai_response,
            "suggested_doctors": result["suggested_doctors"],
            "audio_url":         f"http://{get_local_ip()}:5001/get-audio/{uid}_response.mp3"
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
        doctors      = data.get("doctors", [])

        if not user_text:
            return jsonify({"error": "No text provided"}), 400

        print(f"💬 Text Chat ({language}): {user_text}")
        result = process_ai_logic(user_text, user_profile, doctors, language)

        return jsonify({
            "success":           True,
            "user_text":         user_text,
            "ai_text":           result["text"],
            "suggested_doctors": result["suggested_doctors"],
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
        "status":     "OK",
        "service":    "Sehat AI Python Service",
        "ai_engine":  f"Groq ({GROQ_MODEL}) — Llama 3.3 70B",
        "groq":       "configured" if groq_client else "MISSING API KEY",
        "ffmpeg":     "found" if FFMPEG_OK else "NOT FOUND — set FFMPEG_BIN_PATH in .env",
        "features":   ["voice-chat", "text-chat", "doctor-suggestions", "personalized-responses"],
    })


if __name__ == "__main__":
    print(f"\n🚀 Sehat AI Service starting on port 5001")
    print(f"🤖 AI Engine: Groq — Llama 3.3 70B")
    print(f"🏥 Features: Doctor suggestions, Full user context")
    print(f"📡 Local IP: {get_local_ip()}")
    print(f"🔗 Health check: http://localhost:5001/health\n")
    app.run(port=5001, host="0.0.0.0", debug=True)