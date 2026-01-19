from flask import Flask, request, jsonify
from flask_cors import CORS
import random

app = Flask(__name__)
CORS(app)

# Reference: SDS 3.4.1.3 - Receive AI-Powered Preliminary Diagnosis
@app.route('/analyze-symptoms', methods=['POST'])
def analyze_symptoms():
    data = request.json
    symptoms = data.get('symptoms', [])
    
    if not symptoms:
        return jsonify({"error": "No symptoms provided"}), 400

    print(f"🧠 AI Analyzing: {symptoms}")

    # --- AI LOGIC PLACEHOLDER ---
    # In the future, you will load your TensorFlow/HuggingFace model here.
    # For now, we simulate the "Symptom Analysis Service" logic.
    
    # Simple Rule-Based Mock for Testing
    diagnosis = "General Viral Infection"
    confidence = 0.85
    specialist_needed = "General Physician"
    
    if "chest pain" in symptoms or "shortness of breath" in symptoms:
        diagnosis = "Potential Cardiac Issue"
        confidence = 0.92
        specialist_needed = "Cardiologist"
    elif "tooth" in symptoms:
        diagnosis = "Dental Caries"
        confidence = 0.98
        specialist_needed = "Dentist"

    response = {
        "success": True,
        "analysis": {
            "possibleCondition": diagnosis,
            "confidenceScore": confidence,
            "recommendedSpecialist": specialist_needed,
            "disclaimer": "This is an AI prediction, not a medical diagnosis."
        }
    }
    
    return jsonify(response)

@app.route('/', methods=['GET'])
def health_check():
    return "Sehat AI - Python Service is Running!"

if __name__ == '__main__':
    # Run on Port 5001 (Since Node is on 5000)
    app.run(port=5001, debug=True)