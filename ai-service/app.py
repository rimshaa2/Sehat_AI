import os
import sys
import socket
from dotenv import load_dotenv
from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
import speech_recognition as sr
from gtts import gTTS
import uuid
import google.generativeai as genai
import json

# Load environment variables
load_dotenv()

# 🔴 FIX 1: Hardcode FFmpeg for Windows Stability
# Ensure you extracted ffmpeg here: C:/ffmpeg/
FFMPEG_BIN_PATH = "C:/ffmpeg-8.0.1-essentials_build/bin" 
os.environ["PATH"] += os.pathsep + FFMPEG_BIN_PATH
from pydub import AudioSegment

# Set paths for BOTH ffmpeg and ffprobe
AudioSegment.converter = os.path.join(FFMPEG_BIN_PATH, "ffmpeg.exe")
AudioSegment.ffmpeg = os.path.join(FFMPEG_BIN_PATH, "ffmpeg.exe")
AudioSegment.ffprobe = os.path.join(FFMPEG_BIN_PATH, "ffprobe.exe")
if not os.path.exists(AudioSegment.converter):
    print(f"❌ CRITICAL ERROR: FFmpeg not found at {AudioSegment.converter}")
    print("Please check the path in app.py again!")
else:
    print(f"✅ FFmpeg found at {AudioSegment.converter}")
app = Flask(__name__)
CORS(app)

# Initialize Generative AI
api_key = os.getenv("GOOGLE_API_KEY")
if not api_key:
    print("❌ ERROR: GOOGLE_API_KEY is missing. Create a .env file!")
else:
    genai.configure(api_key=api_key)

# Ensure 'temp' folder exists
os.makedirs("temp", exist_ok=True)

# 🔴 FIX 2: Dynamic IP Detection
def get_local_ip():
    try:
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        s.connect(('8.8.8.8', 1))
        IP = s.getsockname()[0]
        s.close()
        return IP
    except Exception as e:
        print(f"IP Detection Error: {e}")
        return '127.0.0.1'

def process_ai_logic(user_text, full_user_profile):
    try:
        model = genai.GenerativeModel('gemini-2.5-flash')
        
        # 🛡️ PRIVACY STEP: Anonymize the data
        # Only keep clinical fields. Drop Name/Email/ID.
        clinical_profile = {
            "age": full_user_profile.get('age', 'Unknown'),
            "gender": full_user_profile.get('gender', 'Unknown'),
            "history": full_user_profile.get('conditions', 'None'),
            "allergies": full_user_profile.get('allergies', 'None')
        }
        
        # System Prompt with Context
        system_prompt = f"""
        You are Sehat AI, an empathetic, highly knowledgeable, and professional virtual medical assistant.
        
        PATIENT CONTEXT:
        - Age: {clinical_profile['age']}
        - Gender: {clinical_profile['gender']}
        - Medical History: {clinical_profile['history']}
        - Allergies: {clinical_profile['allergies']}
        
        User Query: "{user_text}"
        
        INSTRUCTIONS:
        1. **Persona**: Speak in a warm, empathetic, and professional tone. Acknowledge the user's feelings or discomfort.
        2. **Personalization**: Explicitly consider their age ({clinical_profile['age']}), gender ({clinical_profile['gender']}), and medical history ({clinical_profile['history']}) in your assessment. If they have allergies ({clinical_profile['allergies']}), warn them about relevant triggers or medications.
        3. **Structure your response**:
           - **Empathy & Assessment**: Briefly acknowledge their query and provide a potential high-level assessment.
           - **Actionable Advice**: Give 2-3 practical, safe home remedies or immediate steps they can take.
           - **When to see a doctor**: Clearly state the "red flag" symptoms that require immediate medical attention.
        4. **Disclaimer**: Always end with a brief reminder that you are an AI, not a substitute for a human doctor.
        5. Keep your response concise but comprehensive (around 3-4 short paragraphs). Use bullet points for readability. DO NOT mention the patient's name.
        """
        
        print(f"🧠 AI Context: {clinical_profile}") # Debug log
        
        response = model.generate_content(system_prompt)
        return response.text
        
    except Exception as e:
        print(f"AI Error: {e}")
        return "I am unable to connect to the brain."

@app.route('/voice-chat', methods=['POST'])
def voice_chat():
    try:
        if 'audio' not in request.files:
            return jsonify({"error": "No audio file provided"}), 400

        audio_file = request.files['audio']
        language_code = request.form.get('language', 'en-US')

        user_profile_str = request.form.get('userProfile', '{}')
        try:
            user_profile = json.loads(user_profile_str)
        except Exception as e:
            print(f"User profile json parse error: {e}")
            user_profile = {} # Fallback if parsing fails

        filename = f"temp/{uuid.uuid4()}"
        input_path = f"{filename}.m4a"
        wav_path = f"{filename}.wav"
        
        audio_file.save(input_path)
        
        # Convert m4a to wav
        track = AudioSegment.from_file(input_path, format="m4a")
        track.export(wav_path, format="wav")

        recognizer = sr.Recognizer()
        with sr.AudioFile(wav_path) as source:
            audio_data = recognizer.record(source)
            try:
                user_text = recognizer.recognize_google(audio_data, language=language_code)
            except sr.UnknownValueError:
                user_text = "..." # No speech detected
            except sr.RequestError:
                user_text = "Error connecting to speech service"

        print(f"🗣️ User Said ({language_code}): {user_text}")

        # Clean up temporary input files to prevent disk space leaks
        try:
            if os.path.exists(input_path):
                os.remove(input_path)
            if os.path.exists(wav_path):
                os.remove(wav_path)
        except Exception as e:
            print(f"Cleanup Error: {e}")

        # If silence, skip AI
        if user_text == "...":
            ai_response_text = "I didn't catch that. Could you say it again?"
        else:
            ai_response_text = process_ai_logic(user_text, user_profile)

        tts = gTTS(text=ai_response_text, lang='en' if 'en' in language_code else 'ur')
        response_audio_path = f"{filename}_response.mp3"
        tts.save(response_audio_path)

        current_ip = get_local_ip()
        
        return jsonify({
            "success": True,
            "user_text": user_text,
            "ai_text": ai_response_text,
            "audio_url": f"http://{current_ip}:5001/get-audio/{os.path.basename(response_audio_path)}"
        })

    except Exception as e:
        print("Server Error:", e)
        return jsonify({"error": str(e)}), 500

@app.route('/text-chat', methods=['POST'])
def text_chat():
    try:
        data = request.json
        if not data or 'text' not in data:
            return jsonify({"error": "No text provided"}), 400
            
        user_text = data['text']
        language_code = data.get('language', 'en-US')
        user_profile = data.get('userProfile', {})
        
        print(f"💬 User Text ({language_code}): {user_text}")
        
        ai_response_text = process_ai_logic(user_text, user_profile)
        
        # Generate TTS audio for the text as well
        filename = f"temp/{uuid.uuid4()}"
        tts = gTTS(text=ai_response_text, lang='en' if 'en' in language_code else 'ur')
        response_audio_path = f"{filename}_response.mp3"
        tts.save(response_audio_path)
        
        current_ip = get_local_ip()
        
        return jsonify({
            "success": True,
            "user_text": user_text,
            "ai_text": ai_response_text,
            "audio_url": f"http://{current_ip}:5001/get-audio/{os.path.basename(response_audio_path)}"
        })
    except Exception as e:
        print("Server Error:", e)
        return jsonify({"error": str(e)}), 500

@app.route('/get-audio/<filename>', methods=['GET'])
def get_audio(filename):
    return send_file(f"temp/{filename}", mimetype="audio/mpeg")

if __name__ == '__main__':
    app.run(port=5001, host='0.0.0.0', debug=True)