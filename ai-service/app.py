import os
from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
import speech_recognition as sr
from gtts import gTTS
from pydub import AudioSegment
import uuid

app = Flask(__name__)
CORS(app)

# Ensure 'temp' folder exists
os.makedirs("temp", exist_ok=True)

def process_ai_logic(text):
    """
    FE-1: NLP Processing (Mocked for now)
    """
    text = text.lower()
    if "fever" in text or "bukhar" in text:
        return "It sounds like you have a fever. Please monitor your temperature and stay hydrated. Do you want to book a doctor?"
    elif "appointment" in text:
        return "I can help with that. Which specialist do you need?"
    elif "hello" in text or "salam" in text:
        return "Walaikum Assalam. I am Sehat AI. How can I help you today?"
    else:
        return "I understood: " + text + ". However, I am still learning medical terms."

@app.route('/voice-chat', methods=['POST'])
def voice_chat():
    try:
        # 1. Check if audio file is present
        if 'audio' not in request.files:
            return jsonify({"error": "No audio file provided"}), 400

        audio_file = request.files['audio']
        language_code = request.form.get('language', 'en-US') # FE-2: Multilingual Support

        # 2. Save and Convert Audio (Mobile formats -> WAV)
        filename = f"temp/{uuid.uuid4()}"
        input_path = f"{filename}.m4a"
        wav_path = f"{filename}.wav"
        
        audio_file.save(input_path)
        
        # Convert m4a/aac to wav for SpeechRecognition
        track = AudioSegment.from_file(input_path)
        track.export(wav_path, format="wav")

        # 3. Speech to Text (STT) - FE-3: Recognizes Accents
        recognizer = sr.Recognizer()
        with sr.AudioFile(wav_path) as source:
            audio_data = recognizer.record(source)
            # Supports 'ur-PK' (Urdu) and 'en-US' (English)
            user_text = recognizer.recognize_google(audio_data, language=language_code)

        print(f"🗣️ User Said ({language_code}): {user_text}")

        # 4. Process Logic (NLP)
        ai_response_text = process_ai_logic(user_text)

        # 5. Text to Speech (TTS) - FE-5
        # Generate audio response
        tts = gTTS(text=ai_response_text, lang='en' if 'en' in language_code else 'ur')
        response_audio_path = f"{filename}_response.mp3"
        tts.save(response_audio_path)

        # 6. Return Data
        # In a real production app, upload MP3 to cloud (Firebase/S3) and return URL.
        # For localhost, we return the text now, and the frontend can request the audio.
        
        return jsonify({
            "success": True,
            "user_text": user_text,
            "ai_text": ai_response_text,
            "audio_url": f"http://192.168.1.15:5001/get-audio/{os.path.basename(response_audio_path)}" 
            # 🔴 REPLACE IP with your computer's IP
        })

    except Exception as e:
        print("Error:", e)
        return jsonify({"error": str(e)}), 500

@app.route('/get-audio/<filename>', methods=['GET'])
def get_audio(filename):
    return send_file(f"temp/{filename}", mimetype="audio/mpeg")

if __name__ == '__main__':
    app.run(port=5001, host='0.0.0.0', debug=True)