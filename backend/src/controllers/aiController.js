const axios = require('axios'); // You might need to run: npm install axios

// Reference: SDS 3.3.4 - Component Interaction Patterns (AI Services Workflow)
exports.analyzeSymptoms = async (req, res) => {
  try {
    const { symptoms } = req.body;

    // Call the Python Microservice
    const pythonServiceUrl = 'http://127.0.0.1:5001/analyze-symptoms';
    
    const response = await axios.post(pythonServiceUrl, { symptoms });

    // Return Python's answer to the Frontend
    res.json(response.data);

  } catch (error) {
    console.error('AI Service Error:', error.message);
    res.status(503).json({ 
      error: 'AI Service Unavailable', 
      details: 'Ensure Python server is running on port 5001' 
    });
  }
};