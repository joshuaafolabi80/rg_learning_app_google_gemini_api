import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import axios from 'axios';
import { createProxyMiddleware } from 'http-proxy-middleware';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';

// Configuration
dotenv.config();
const API_PORT = process.env.API_PORT || 5000;
const DB_PORT = 3001;
const VITE_PORT = 5173;

const app = express();

// Security Middleware
app.use(helmet());
app.use(cors({
  origin: [
    `http://localhost:${VITE_PORT}`,
    `http://127.0.0.1:${VITE_PORT}`
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json({ limit: '10kb' }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true
});
app.use(limiter);

// JSON Server Proxy
app.use('/db', createProxyMiddleware({
  target: `http://localhost:${DB_PORT}`,
  changeOrigin: true,
  pathRewrite: { '^/db': '' },
  timeout: 5000
}));

// Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    services: {
      api: `http://localhost:${API_PORT}`,
      database: `http://localhost:${DB_PORT}`,
      frontend: `http://localhost:${VITE_PORT}`
    }
  });
});

// Hugging Face AI Endpoint
app.post('/api/ask', async (req, res) => {
  try {
    const { question } = req.body;
    
    if (!question || typeof question !== 'string' || question.length > 2000) {
      return res.status(400).json({ error: 'Invalid question format' });
    }

    const response = await axios.post(
      'https://api-inference.huggingface.co/models/gpt2',
      { inputs: question },
      {
        headers: {
          Authorization: `Bearer ${process.env.VITE_HUGGING_FACE_TOKEN}`,
          'Content-Type': 'application/json'
        },
        timeout: 20000
      }
    );

    let answer = response.data[0]?.generated_text || "I'm still learning! Try asking again later.";
    
    // Clean up response
    const questionIndex = answer.indexOf(question);
    if (questionIndex !== -1) {
      answer = answer.slice(questionIndex + question.length).trim();
    }

    answer = answer.replace(/[^.!?]+$/, '').trim();
    res.json({ answer });

  } catch (error) {
    console.error('HF Error:', error.message);
    const statusCode = error.response?.status || 500;
    const errorMessage = error.response?.data?.error || 
      (error.code === 'ECONNABORTED' ? 'Request timed out' : 'AI service unavailable');
    
    res.status(statusCode).json({ error: errorMessage });
  }
});

// Root Route
app.get('/', (req, res) => {
  res.send(`
    <h1>Welcome to the Quiz API Server</h1>
    <p>Available endpoints:</p>
    <ul>
      <li><strong>GET /api/health</strong> - Service status check</li>
      <li><strong>POST /api/ask</strong> - AI explanation service</li>
      <li><strong>/db/*</strong> - Proxied to JSON Server</li>
    </ul>
  `);
});

// 404 Handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Server Start
app.listen(API_PORT, () => {
  console.log(`
  ==================================
     🔥 Server Started Successfully
  ==================================
  API Server:    http://localhost:${API_PORT}
  JSON Server:   http://localhost:${DB_PORT}
  Vite Frontend: http://localhost:${VITE_PORT}
  `);
});