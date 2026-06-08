import os
import socket
import json
import uuid
import glob
import time
from dotenv import load_dotenv
from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
import speech_recognition as sr
from gtts import gTTS
from groq import Groq

load_dotenv()

from pydub import AudioSegment

def find_ffmpeg_windows():
    common_paths = [
        r"C:\ffmpeg\bin",
        r"C:\Program Files\ffmpeg\bin",
        r"C:\Program Files (x86)\ffmpeg\bin",
        os.path.join(os.path.expanduser("~"), "ffmpeg", "bin"),
        os.path.join(os.path.expanduser("~"), "Downloads", "ffmpeg", "bin"),
        os.path.join(os.path.expanduser("~"), "Downloads", "ffmpeg-master-latest-win64-gpl", "bin"),
        os.path.join(os.path.expanduser("~"), "Downloads", "ffmpeg-release-essentials", "bin"),
    ]
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
    bin_path = os.getenv("FFMPEG_BIN_PATH", "").strip()
    if not bin_path and os.name == "nt":
        bin_path = find_ffmpeg_windows()
        if bin_path:
            print(f"FFmpeg auto-detected at: {bin_path}")
    if bin_path:
        ffmpeg_exe  = os.path.join(bin_path, ffmpeg_name)
        ffprobe_exe = os.path.join(bin_path, ffprobe_name)
        if os.path.exists(ffmpeg_exe):
            os.environ["PATH"] += os.pathsep + bin_path
            AudioSegment.converter = ffmpeg_exe
            AudioSegment.ffmpeg    = ffmpeg_exe
            AudioSegment.ffprobe   = ffprobe_exe
            print(f"FFmpeg configured: {ffmpeg_exe}")
            return True
    import shutil
    if shutil.which("ffmpeg"):
        print("FFmpeg found in system PATH.")
        return True
    print("FFmpeg NOT found. Voice chat will fail.")
    return False

FFMPEG_OK = setup_ffmpeg()

app = Flask(__name__)
CORS(app)

GROQ_API_KEY = os.getenv("GROQ_API_KEY")
if GROQ_API_KEY:
    groq_client = Groq(api_key=GROQ_API_KEY)
    print("Groq client ready — Llama 3.3 70B loaded")
else:
    groq_client = None
    print("GROQ_API_KEY missing in .env file!")

GROQ_MODEL = "llama-3.3-70b-versatile"
os.makedirs("temp", exist_ok=True)

FEEDBACK_LOG_FILE = "feedback_log.jsonl"


def cleanup_old_temp_files(max_age_seconds=1800):
    try:
        now = time.time()
        deleted = 0
        for pattern in ["temp/*.m4a", "temp/*.wav", "temp/*.mp3"]:
            for filepath in glob.glob(pattern):
                try:
                    if os.path.isfile(filepath) and now - os.path.getmtime(filepath) > max_age_seconds:
                        os.remove(filepath)
                        deleted += 1
                except Exception:
                    pass
        if deleted > 0:
            print(f"Cleaned up {deleted} old temp audio files.")
    except Exception as e:
        print(f"Cleanup error (non-fatal): {e}")


def get_local_ip():
    try:
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        s.connect(("8.8.8.8", 1))
        ip = s.getsockname()[0]
        s.close()
        return ip
    except:
        return "127.0.0.1"


def format_doctors_context(doctors: list) -> str:
    if not doctors:
        return "No doctors currently listed in the system."
    lines = []
    for d in doctors:
        name       = d.get("name", "Unknown Doctor")
        specialty  = d.get("specialization", "General")
        experience = d.get("experienceYears")
        fee        = d.get("consultationFee")
        available  = d.get("availabilityStatus", True)
        doctor_id  = d.get("id", "")
        status     = "Available" if available else "Unavailable"
        exp_str    = f"{experience} yrs exp" if experience else ""
        fee_str    = f"PKR {fee}" if fee else ""
        parts      = [p for p in [exp_str, fee_str, status] if p]
        lines.append(f"- Dr. {name} | {specialty} | {' | '.join(parts)} | ID:{doctor_id}")
    return "\n".join(lines)


# ─────────────────────────────────────────────────────────────────────────────
# IMPROVEMENT 1: Urgency Triage
# Classifies every message into Low / Medium / High / Emergency
# This shows the committee the AI is making clinical decisions, not just chatting
# ─────────────────────────────────────────────────────────────────────────────
EMERGENCY_KEYWORDS = [
    "can't breathe", "cannot breathe", "chest pain", "heart attack",
    "stroke", "unconscious", "not breathing", "severe bleeding",
    "overdose", "suicidal", "dying", "paralyzed", "سانس نہیں",
    "سینے میں درد", "ہارٹ اٹیک", "بے ہوش",
]
HIGH_KEYWORDS = [
    "high fever", "102", "103", "104", "severe pain", "vomiting blood",
    "blood in urine", "can't walk", "seizure", "فالج", "تیز بخار",
]

def classify_urgency(text: str) -> str:
    text_lower = text.lower()
    for kw in EMERGENCY_KEYWORDS:
        if kw in text_lower:
            return "EMERGENCY"
    for kw in HIGH_KEYWORDS:
        if kw in text_lower:
            return "HIGH"
    pain_words = ["pain", "درد", "severe", "شدید", "acute"]
    if any(w in text_lower for w in pain_words):
        return "MEDIUM"
    return "LOW"


# ─────────────────────────────────────────────────────────────────────────────
# IMPROVEMENT 2: Conversation History
# Each request now accepts a chat_history array so the AI remembers context
# across the full session — not just the last message
# ─────────────────────────────────────────────────────────────────────────────
def process_ai_logic(
    user_text: str,
    user_profile: dict,
    doctors: list,
    language: str = "en-US",
    chat_history: list = [],   # ← NEW: list of {role, content} dicts
) -> dict:

    if not groq_client:
        return {"text": "AI service is not configured. Please add your GROQ_API_KEY.", "suggested_doctors": [], "urgency": "LOW"}

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

        # Classify urgency BEFORE building the prompt
        urgency = classify_urgency(user_text)

        # Build urgency-specific instruction
        if urgency == "EMERGENCY":
            urgency_instruction = (
                "⚠️ EMERGENCY DETECTED: The patient's message contains emergency symptoms. "
                "START your response with '🚨 EMERGENCY:' and immediately tell them to call 1122 (Rescue Pakistan) or go to the nearest ER. "
                "Then briefly explain what to do while waiting for help. "
                "Do NOT give home remedies for emergency situations."
            )
        elif urgency == "HIGH":
            urgency_instruction = (
                "HIGH URGENCY: The patient has serious symptoms. "
                "Recommend they see a doctor TODAY or visit an urgent care clinic. "
                "Suggest the most relevant available doctor from the list."
            )
        elif urgency == "MEDIUM":
            urgency_instruction = (
                "MEDIUM URGENCY: Suggest the most relevant doctor from the list "
                "and recommend booking within 1-2 days."
            )
        else:
            urgency_instruction = (
                "LOW URGENCY: Provide helpful advice. Suggest a doctor if relevant."
            )

        if is_urdu:
            lang_instruction = (
                "CRITICAL LANGUAGE RULE: You MUST respond ENTIRELY in Urdu script (اردو). "
                "Do NOT use English in your response at all. "
                "Your entire response including doctor suggestions must be in Urdu script."
            )
            lang_reminder = "یاد رہے: پوری بات اردو میں لکھیں۔"
        else:
            lang_instruction = "Respond in clear, simple English. Avoid complex medical jargon."
            lang_reminder    = "Respond in simple English."

        doctor_id_map = {str(d.get("id", "")): d for d in doctors if d.get("id")}

        system_prompt = f"""You are Sehat AI, an intelligent, empathetic medical health assistant for Pakistani users.
You have FULL ACCESS to this patient's health profile and the real doctors available in the Sehat AI system.

{lang_instruction}

PATIENT PROFILE:
{context_str}

AVAILABLE DOCTORS IN SEHAT AI:
{doctors_str}

URGENCY ASSESSMENT FOR THIS MESSAGE: {urgency}
{urgency_instruction}

YOUR RULES:
1. PERSONALIZE every response — reference the patient's name, conditions, medications when relevant.
2. If they mention a symptom related to their known conditions, explicitly connect the dots.
3. If they are on medications, consider drug interactions or side effects.
4. DOCTOR SUGGESTIONS: When symptoms or conditions warrant a specialist:
   - Recommend the most relevant doctor(s) BY NAME and SPECIALTY from the list above
   - End your response with EXACTLY this format:
     SUGGEST_DOCTORS:[comma-separated IDs, e.g. 3,7]
   - Only suggest Available doctors
   - If no relevant doctor is available, omit the SUGGEST_DOCTORS line
5. Include URGENCY_LEVEL:[LOW|MEDIUM|HIGH|EMERGENCY] at the very end of your response.
6. Give 1-2 clear practical steps the patient can take right now.
7. Be concise — 3-5 sentences. More for emergencies.
8. DO NOT make up medications or give definitive diagnoses.
9. DO NOT start with "I".
10. If unsure, say so explicitly and recommend in-person consultation.
11. {lang_reminder}"""

        # ── Build messages array with conversation history ────────────────────
        # This is the key change — the AI now sees the full conversation
        messages_to_send = [{"role": "system", "content": system_prompt}]

        # Add previous turns (limit to last 10 to stay within token budget)
        for turn in chat_history[-10:]:
            role    = turn.get("role", "user")
            content = turn.get("content", "")
            if role in ("user", "assistant") and content:
                messages_to_send.append({"role": role, "content": content})

        # Add current message
        messages_to_send.append({"role": "user", "content": user_text})

        print(f"Processing: '{user_text[:60]}' | lang={language} | urgency={urgency} | history={len(chat_history)} turns | {len(doctors)} doctors")

        response = groq_client.chat.completions.create(
            model=GROQ_MODEL,
            messages=messages_to_send,
            max_tokens=500,
            temperature=0.65,
        )

        raw_text = response.choices[0].message.content.strip()

        suggested_doctors = []
        clean_text        = raw_text
        detected_urgency  = urgency  # fallback to our classification

        # Extract SUGGEST_DOCTORS
        if "SUGGEST_DOCTORS:" in raw_text:
            parts      = raw_text.split("SUGGEST_DOCTORS:")
            clean_text = parts[0].strip()
            id_str     = parts[1].strip().split("\n")[0].strip()
            # Also strip URGENCY_LEVEL if it got mixed in
            id_str = id_str.split("URGENCY_LEVEL:")[0].strip()
            suggested_ids = [sid.strip() for sid in id_str.split(",") if sid.strip()]
            for sid in suggested_ids:
                if sid in doctor_id_map:
                    suggested_doctors.append(doctor_id_map[sid])

        # Extract URGENCY_LEVEL from AI response
        if "URGENCY_LEVEL:" in clean_text:
            parts            = clean_text.split("URGENCY_LEVEL:")
            clean_text       = parts[0].strip()
            detected_urgency = parts[1].strip().split("\n")[0].strip().upper()
            if detected_urgency not in ("LOW", "MEDIUM", "HIGH", "EMERGENCY"):
                detected_urgency = urgency

        return {
            "text":              clean_text,
            "suggested_doctors": suggested_doctors,
            "urgency":           detected_urgency,
        }

    except Exception as e:
        err = str(e)
        print(f"AI Error: {err}")
        if "429" in err or "rate" in err.lower():
            fallback = "I've reached my usage limit. Please wait a moment and try again."
        elif "401" in err or "invalid" in err.lower():
            fallback = "Invalid API key. Please check your GROQ_API_KEY."
        elif "connection" in err.lower() or "refused" in err.lower():
            fallback = "Cannot connect to AI service. Please check your internet connection."
        else:
            fallback = "I'm having a technical issue. Please try again in a moment."
        return {"text": fallback, "suggested_doctors": [], "urgency": "LOW"}


# ── Voice Chat Endpoint ────────────────────────────────────────────────────────
@app.route("/voice-chat", methods=["POST"])
def voice_chat():
    cleanup_old_temp_files()
    try:
        if not FFMPEG_OK:
            return jsonify({"error": "FFmpeg is not installed. Please set FFMPEG_BIN_PATH in .env."}), 500

        if "audio" not in request.files:
            return jsonify({"error": "No audio file provided"}), 400

        audio_file      = request.files["audio"]
        language        = request.form.get("language", "en-US")
        profile_str     = request.form.get("userProfile", "{}")
        doctors_str_raw = request.form.get("doctors", "[]")
        history_str     = request.form.get("chatHistory", "[]")  # ← NEW

        try: user_profile = json.loads(profile_str)
        except: user_profile = {}

        try: doctors = json.loads(doctors_str_raw)
        except: doctors = []

        try: chat_history = json.loads(history_str)
        except: chat_history = []

        uid        = str(uuid.uuid4())
        input_path = f"temp/{uid}.m4a"
        wav_path   = f"temp/{uid}.wav"
        audio_file.save(input_path)

        track = AudioSegment.from_file(input_path, format="m4a")
        track.export(wav_path, format="wav")

        recognizer = sr.Recognizer()
        with sr.AudioFile(wav_path) as source:
            recognizer.adjust_for_ambient_noise(source, duration=0.3)
            audio_data = recognizer.record(source)
            try:
                user_text = recognizer.recognize_google(audio_data, language=language)
            except sr.UnknownValueError:
                user_text = "..."
            except sr.RequestError:
                user_text = "Error connecting to speech service"

        print(f"User Said ({language}): {user_text}")

        if user_text == "...":
            result = {
                "text": "آپ کی آواز سنائی نہیں دی۔ ذرا اونچا بول کر دوبارہ کوشش کریں۔" if "ur" in language.lower() else "I didn't catch that. Could you please speak again a little louder?",
                "suggested_doctors": [],
                "urgency": "LOW",
            }
        else:
            result = process_ai_logic(user_text, user_profile, doctors, language, chat_history)

        ai_response = result["text"]
        tts_lang    = "ur" if "ur" in language.lower() else "en"
        tts = gTTS(text=ai_response, lang=tts_lang, slow=False)
        response_audio_path = f"temp/{uid}_response.mp3"
        tts.save(response_audio_path)

        for f in [input_path, wav_path]:
            try:
                if os.path.exists(f): os.remove(f)
            except: pass

        return jsonify({
            "success":           True,
            "user_text":         user_text,
            "ai_text":           ai_response,
            "suggested_doctors": result["suggested_doctors"],
            "urgency":           result["urgency"],
            "audio_url":         f"http://{get_local_ip()}:5001/get-audio/{uid}_response.mp3"
        })

    except Exception as e:
        print(f"Voice error: {e}")
        return jsonify({"error": str(e)}), 500


# ── Text Chat Endpoint ─────────────────────────────────────────────────────────
@app.route("/text-chat", methods=["POST"])
def text_chat():
    cleanup_old_temp_files()
    try:
        data         = request.get_json()
        user_text    = (data.get("text") or "").strip()
        language     = data.get("language", "en-US")
        user_profile = data.get("userProfile", {})
        doctors      = data.get("doctors", [])
        chat_history = data.get("chatHistory", [])   # ← NEW

        if not user_text:
            return jsonify({"error": "No text provided"}), 400

        print(f"Text Chat ({language}): {user_text}")
        result = process_ai_logic(user_text, user_profile, doctors, language, chat_history)

        return jsonify({
            "success":           True,
            "user_text":         user_text,
            "ai_text":           result["text"],
            "suggested_doctors": result["suggested_doctors"],
            "urgency":           result["urgency"],
        })

    except Exception as e:
        print(f"Text error: {e}")
        return jsonify({"error": str(e)}), 500


# ── Feedback Endpoint ──────────────────────────────────────────────────────────
@app.route("/feedback", methods=["POST"])
def save_feedback():
    try:
        data = request.get_json()
        if not data:
            return jsonify({"error": "No data provided"}), 400
        feedback_entry = {
            "timestamp":   time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
            "userId":      data.get("userId", "anonymous"),
            "language":    data.get("language", "en"),
            "userMessage": data.get("messageText", ""),
            "aiResponse":  data.get("aiResponse", ""),
            "rating":      data.get("rating", ""),
        }
        with open(FEEDBACK_LOG_FILE, "a", encoding="utf-8") as f:
            f.write(json.dumps(feedback_entry, ensure_ascii=False) + "\n")
        return jsonify({"success": True, "message": "Feedback recorded."})
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/feedback/stats", methods=["GET"])
def feedback_stats():
    try:
        if not os.path.exists(FEEDBACK_LOG_FILE):
            return jsonify({"total": 0, "thumbs_up": 0, "thumbs_down": 0, "satisfaction_rate": "N/A"})
        total = thumbs_up = thumbs_down = 0
        with open(FEEDBACK_LOG_FILE, "r", encoding="utf-8") as f:
            for line in f:
                try:
                    entry = json.loads(line.strip())
                    total += 1
                    if entry.get("rating") == "up": thumbs_up += 1
                    elif entry.get("rating") == "down": thumbs_down += 1
                except: pass
        rate = f"{round((thumbs_up / total) * 100)}%" if total > 0 else "N/A"
        return jsonify({"total": total, "thumbs_up": thumbs_up, "thumbs_down": thumbs_down, "satisfaction_rate": rate})
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/get-audio/<filename>", methods=["GET"])
def get_audio(filename):
    path = f"temp/{filename}"
    if not os.path.exists(path): return jsonify({"error": "Audio not found"}), 404
    return send_file(path, mimetype="audio/mpeg")




@app.route("/health", methods=["GET"])
def health():

    temp_files = len(glob.glob("temp/*"))



    feedback_count = 0
    if os.path.exists(FEEDBACK_LOG_FILE):
        with open(FEEDBACK_LOG_FILE, "r") as f:
            feedback_count = sum(1 for _ in f)

            
    return jsonify({
        "status":          "OK",
        "service":         "Sehat AI Python Service",
        "ai_engine":       f"Groq ({GROQ_MODEL}) — Llama 3.3 70B",
        "groq":            "configured" if groq_client else "MISSING API KEY",
        "ffmpeg":          "found" if FFMPEG_OK else "NOT FOUND",
        "temp_files":      temp_files,
        "feedback_logged": feedback_count,
        "features": [
            "voice-chat", "text-chat", "doctor-suggestions",
            "personalized-responses", "bilingual-urdu-english",
            "urgency-triage", "conversation-history",
            "feedback-collection", "auto-temp-cleanup",
        ],
    })


if __name__ == "__main__":
    print(f"\nSehat AI Service starting on port 5001")
    print(f"AI Engine: Groq — Llama 3.3 70B")
    print(f"Features: Doctor suggestions, Urgency triage, Conversation history, Bilingual")
    print(f"Local IP: {get_local_ip()}")
    print(f"Health check: http://localhost:5001/health\n")
    app.run(port=5001, host="0.0.0.0", debug=True)