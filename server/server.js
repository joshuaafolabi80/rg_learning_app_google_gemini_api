// Load environment variables from .env file
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const app = express();
const port = process.env.PORT || 3001; // Use port 3001 or whatever is available

// Initialize Google Gemini AI
// Ensure GOOGLE_API_KEY is loaded from your .env file
if (!process.env.GOOGLE_API_KEY) {
  console.error("Error: GOOGLE_API_KEY is not set in your .env file.");
  process.exit(1); // Exit if API key is missing
}
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
// You can choose different models. 'gemini-pro' is good for text generation.
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

// Middleware
app.use(cors()); // Enables Cross-Origin Resource Sharing (CORS)
app.use(express.json()); // Parses incoming JSON requests

// API endpoint for generating explanations
app.post('/api/generate-explanation', async (req, res) => {
  try {
    const { question, options, correctAnswer } = req.body;

    if (!question || !correctAnswer) {
      return res.status(400).json({ error: 'Question and correct answer are required.' });
    }

    // Construct the prompt for the AI
    // You can refine this prompt based on the quality of explanations you get
    let prompt = `Provide a concise, clear, and educational explanation for the following quiz question and its correct answer. Focus on why the correct answer is correct and briefly explain why others are not if relevant. Keep it under 150 words.

    Question: ${question}
    `;
    if (options && options.length > 0) {
      prompt += `Options: ${options.map(o => o.text).join(', ')}\n`;
    }
    prompt += `Correct Answer: ${correctAnswer}

    Explanation:`;

    console.log("Sending prompt to Gemini:", prompt); // For debugging

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text(); // This is the generated explanation

    console.log("Received explanation from Gemini:", text); // For debugging
    res.json({ explanation: text });

  } catch (error) {
    console.error('Error generating explanation:', error.message);
    // Provide a more generic error message to the client
    res.status(500).json({ error: 'Failed to generate explanation. Please try again.' });
  }
});

// Simple test route
app.get('/', (req, res) => {
  res.send('Gemini Explanation Backend is running!');
});

// Start the server
app.listen(port, () => {
  console.log(`Gemini Explanation Backend listening on http://localhost:${port}`);
});