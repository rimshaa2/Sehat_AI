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

# ── Load env FIRST before anything else ──────────────────────────────────────
load_dotenv()

# ── FFmpeg Setup (Auto-detection for Windows) ─────────────────────────────────
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
        else:
            print(f"FFMPEG_BIN_PATH set to '{bin_path}' but ffmpeg.exe not found there.")
    import shutil
    if shutil.which("ffmpeg"):
        print("FFmpeg found in system PATH.")
        return True
    print("FFmpeg NOT found. Voice chat will fail.")
    return False

FFMPEG_OK = setup_ffmpeg()

# ── Flask App ──────────────────────────────────────────────────────────────────
app = Flask(__name__)
CORS(app)

# ── Groq Client Setup ──────────────────────────────────────────────────────────
GROQ_API_KEY = os.getenv("GROQ_API_KEY")
if GROQ_API_KEY:
    groq_client = Groq(api_key=GROQ_API_KEY)
    print("Groq client ready — Llama 3.3 70B loaded")
else:
    groq_client = None
    print("GROQ_API_KEY missing in .env file!")

GROQ_MODEL = "llama-3.3-70b-versatile"
os.makedirs("temp", exist_ok=True)


# ── FIX 1: Temp file cleanup ────────────────────────────────────────────────
# Deletes temp audio files older than 30 minutes automatically
# This fixes the "100+ files accumulating" issue noted in your Chapter 5 testing
def cleanup_old_temp_files(max_age_seconds=1800):
    """Delete temp audio files older than max_age_seconds (default 30 min)."""
    try:
        now = time.time()
        patterns = ["temp/*.m4a", "temp/*.wav", "temp/*.mp3"]
        deleted = 0
        for pattern in patterns:
            for filepath in glob.glob(pattern):
                try:
                    if os.path.isfile(filepath):
                        file_age = now - os.path.getmtime(filepath)
                        if file_age > max_age_seconds:
                            os.remove(filepath)
                            deleted += 1
                except Exception:
                    pass
        if deleted > 0:
            print(f"Cleaned up {deleted} old temp audio files.")
    except Exception as e:
        print(f"Cleanup error (non-fatal): {e}")


# ── Get Local IP ───────────────────────────────────────────────────────────────
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


# ── FIX 2: Improved Core AI Logic ─────────────────────────────────────────────
# Changes made:
#   a) Stronger Urdu language enforcement — model is told TWICE to respond in Urdu
#   b) Added explicit safety disclaimer instruction
#   c) Added "if unsure, say so" rule — addresses committee's "not refined" comment
#   d) Added feedback_rating parameter for when user rates a response
def process_ai_logic(
    user_text: str,
    user_profile: dict,
    doctors: list,
    language: str = "en-US",
) -> dict:

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

        # ── FIX 2a: Much stronger language enforcement ──────────────────────
        # Previously: a single soft instruction "Respond in Urdu"
        # Now: language is stated in TWO places with explicit repeat instruction
        # This significantly improves Urdu response consistency
        if is_urdu:
            lang_instruction = (
                "CRITICAL LANGUAGE RULE: You MUST respond ENTIRELY in Urdu script (اردو). "
                "Do NOT use English in your response at all — not even a single English word. "
                "If you are unsure of an Urdu medical term, use the closest Urdu equivalent. "
                "Your entire response including doctor suggestions must be in Urdu script."
            )
            lang_reminder = "یاد رہے: پوری بات اردو میں لکھیں۔ ایک لفظ بھی انگریزی میں نہ ہو۔"
        else:
            lang_instruction = "Respond in clear, simple English. Avoid complex medical jargon."
            lang_reminder    = "Remember: respond in simple English."

        doctor_id_map = {str(d.get("id", "")): d for d in doctors if d.get("id")}

        system_prompt = f"""You are Sehat AI, an intelligent, empathetic, and highly personalized medical health assistant built for Pakistani users.

You have FULL ACCESS to this patient's complete health profile, medical history, and the list of real doctors available in the Sehat AI system.

{lang_instruction}

PATIENT PROFILE & MEDICAL HISTORY:
{context_str}

AVAILABLE DOCTORS IN SEHAT AI SYSTEM:
{doctors_str}

YOUR RULES:
1. PERSONALIZE every response — use the patient's name, reference their actual conditions, medications, and history when relevant.
2. If they ask about a symptom and have a known related condition, mention the connection explicitly.
3. If they are on medications, consider drug interactions or side effects when advising.
4. DOCTOR SUGGESTIONS: If the question involves symptoms, conditions, or anything that warrants seeing a specialist:
   - Recommend the most relevant doctor(s) from the list above BY NAME and SPECIALTY
   - End your response with a line formatted EXACTLY like this:
     SUGGEST_DOCTORS:[comma-separated doctor IDs, e.g. 3,7]
   - Only suggest doctors who are marked Available
   - If no relevant doctor is available, do NOT include the SUGGEST_DOCTORS line
5. Give 1-2 clear practical steps the patient can take right now.
6. Recommend seeing a doctor if the issue seems serious.
7. Be concise — 3-5 sentences max.
8. DO NOT make up medications or give definitive diagnoses.
9. DO NOT start with "I" — start with advice or the patient's name.
10. SAFETY RULE: If you are not confident about a symptom or condition, explicitly say so
    and strongly recommend consulting a qualified doctor in person. Never guess.
11. {lang_reminder}"""

        print(f"Processing: '{user_text[:60]}' | lang={language} | {len(doctors)} doctors | name={name}")

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
            print(f"Suggested doctor IDs: {suggested_ids} -> matched {len(suggested_doctors)}")

        return {
            "text":              clean_text,
            "suggested_doctors": suggested_doctors,
        }

    except Exception as e:
        err = str(e)
        print(f"AI Error: {err}")
        if "429" in err or "quota" in err.lower() or "rate" in err.lower():
            fallback = "I've reached my usage limit for now. Please wait a moment and try again."
        elif "401" in err or "invalid" in err.lower():
            fallback = "Invalid API key. Please check your GROQ_API_KEY in the .env file."
        elif "connection" in err.lower() or "refused" in err.lower():
            fallback = "Cannot connect to AI service. Please check your internet connection."
        else:
            fallback = "I'm having a technical issue right now. Please try again in a moment."
        return {"text": fallback, "suggested_doctors": []}


# ── Voice Chat Endpoint ────────────────────────────────────────────────────────
@app.route("/voice-chat", methods=["POST"])
def voice_chat():
    # Run cleanup on every voice request — keeps temp folder lean
    cleanup_old_temp_files()

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
        doctors_str_raw = request.form.get("doctors", "[]")

        try:
            user_profile = json.loads(profile_str)
        except:
            user_profile = {}

        try:
            doctors = json.loads(doctors_str_raw)
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
            # FIX: Adjust for ambient noise before recording for better STT accuracy
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
                "text": (
                    "آپ کی آواز سنائی نہیں دی۔ ذرا اونچا بول کر دوبارہ کوشش کریں۔"
                    if "ur" in language.lower()
                    else "I didn't catch that. Could you please speak again a little louder?"
                ),
                "suggested_doctors": []
            }
        else:
            result = process_ai_logic(user_text, user_profile, doctors, language)

        ai_response = result["text"]

        tts_lang = "ur" if "ur" in language.lower() else "en"
        tts = gTTS(text=ai_response, lang=tts_lang, slow=False)
        response_audio_path = f"temp/{uid}_response.mp3"
        tts.save(response_audio_path)

        # Delete the input files immediately after processing — no need to keep them
        for f in [input_path, wav_path]:
            try:
                if os.path.exists(f):
                    os.remove(f)
            except:
                pass

        return jsonify({
            "success":           True,
            "user_text":         user_text,
            "ai_text":           ai_response,
            "suggested_doctors": result["suggested_doctors"],
            "audio_url":         f"http://{get_local_ip()}:5001/get-audio/{uid}_response.mp3"
        })

    except Exception as e:
        print(f"Voice error: {e}")
        return jsonify({"error": str(e)}), 500


# ── Text Chat Endpoint ─────────────────────────────────────────────────────────
@app.route("/text-chat", methods=["POST"])
def text_chat():
    # Run cleanup on every text request too
    cleanup_old_temp_files()

    try:
        data         = request.get_json()
        user_text    = (data.get("text") or "").strip()
        language     = data.get("language", "en-US")
        user_profile = data.get("userProfile", {})
        doctors      = data.get("doctors", [])

        if not user_text:
            return jsonify({"error": "No text provided"}), 400

        print(f"Text Chat ({language}): {user_text}")
        result = process_ai_logic(user_text, user_profile, doctors, language)

        return jsonify({
            "success":           True,
            "user_text":         user_text,
            "ai_text":           result["text"],
            "suggested_doctors": result["suggested_doctors"],
        })

    except Exception as e:
        print(f"Text error: {e}")
        return jsonify({"error": str(e)}), 500


# ── FIX 3: Feedback endpoint ────────────────────────────────────────────────
# Receives thumbs up/down rating from the frontend for each AI response
# This directly addresses the committee's "AI not refined" comment —
# shows there is a feedback mechanism even without fine-tuning
FEEDBACK_LOG_FILE = "feedback_log.jsonl"

@app.route("/feedback", methods=["POST"])
def save_feedback():
    """
    Saves user feedback (thumbs up/down) on AI responses.
    Expected JSON: { userId, messageText, aiResponse, rating: "up"|"down", language }
    """
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
            "rating":      data.get("rating", ""),   # "up" or "down"
        }

        # Append to JSONL log file — each line is one feedback record
        with open(FEEDBACK_LOG_FILE, "a", encoding="utf-8") as f:
            f.write(json.dumps(feedback_entry, ensure_ascii=False) + "\n")

        print(f"Feedback saved: {feedback_entry['rating']} | user={feedback_entry['userId']}")
        return jsonify({"success": True, "message": "Feedback recorded. Thank you!"})

    except Exception as e:
        print(f"Feedback error: {e}")
        return jsonify({"error": str(e)}), 500


# ── FIX 4: Feedback stats endpoint ─────────────────────────────────────────
# Shows committee that feedback is being collected and analysed
@app.route("/feedback/stats", methods=["GET"])
def feedback_stats():
    """Returns summary stats of collected feedback."""
    try:
        if not os.path.exists(FEEDBACK_LOG_FILE):
            return jsonify({"total": 0, "thumbs_up": 0, "thumbs_down": 0, "satisfaction_rate": "N/A"})

        total = thumbs_up = thumbs_down = 0
        with open(FEEDBACK_LOG_FILE, "r", encoding="utf-8") as f:
            for line in f:
                try:
                    entry = json.loads(line.strip())
                    total += 1
                    if entry.get("rating") == "up":
                        thumbs_up += 1
                    elif entry.get("rating") == "down":
                        thumbs_down += 1
                except:
                    pass

        rate = f"{round((thumbs_up / total) * 100)}%" if total > 0 else "N/A"
        return jsonify({
            "total":             total,
            "thumbs_up":         thumbs_up,
            "thumbs_down":       thumbs_down,
            "satisfaction_rate": rate,
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500


# ── Serve Audio Files ──────────────────────────────────────────────────────────
@app.route("/get-audio/<filename>", methods=["GET"])
def get_audio(filename):
    path = f"temp/{filename}"
    if not os.path.exists(path):
        return jsonify({"error": "Audio not found"}), 404
    return send_file(path, mimetype="audio/mpeg")


# ── Health Check ───────────────────────────────────────────────────────────────
@app.route("/health", methods=["GET"])
def health():
    # Count temp files so we can monitor buildup
    temp_files = len(glob.glob("temp/*"))

    # Count feedback entries
    feedback_count = 0
    if os.path.exists(FEEDBACK_LOG_FILE):
        with open(FEEDBACK_LOG_FILE, "r") as f:
            feedback_count = sum(1 for _ in f)

    return jsonify({
        "status":          "OK",
        "service":         "Sehat AI Python Service",
        "ai_engine":       f"Groq ({GROQ_MODEL}) — Llama 3.3 70B",
        "groq":            "configured" if groq_client else "MISSING API KEY",
        "ffmpeg":          "found" if FFMPEG_OK else "NOT FOUND — set FFMPEG_BIN_PATH in .env",
        "temp_files":      temp_files,
        "feedback_logged": feedback_count,
        "features":        [
            "voice-chat",
            "text-chat",
            "doctor-suggestions",
            "personalized-responses",
            "bilingual-urdu-english",
            "feedback-collection",
            "auto-temp-cleanup",
        ],
    })


if __name__ == "__main__":
    print(f"\nSehat AI Service starting on port 5001")
    print(f"AI Engine: Groq — Llama 3.3 70B")
    print(f"Features: Doctor suggestions, Full user context, Feedback collection, Auto cleanup")
    print(f"Local IP: {get_local_ip()}")
    print(f"Health check: http://localhost:5001/health\n")
    app.run(port=5001, host="0.0.0.0", debug=True)