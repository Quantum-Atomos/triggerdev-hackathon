const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const axios = require('axios');
const app = express();

app.use(express.json());

const server = http.createServer(app);
const io = new Server(server);

// --- Realtime Task Stream ---

io.on('connection', (socket) => {
  console.log('Client connected');
  setInterval(() => {
    socket.emit('taskEvent', {
      taskId: Math.random().toString(36).substring(2, 8),
      status: 'Completed',
      timestamp: new Date().toISOString()
    });
  }, 3000);
});

// --- Trace Explorer API ---

app.get('/api/trace/:taskId', (req, res) => {
  const { taskId } = req.params;
  res.json([
    { step: 'Started', timestamp: new Date(Date.now() - 60000).toISOString() },
    { step: 'Processing', timestamp: new Date(Date.now() - 30000).toISOString() },
    { step: 'Completed', timestamp: new Date().toISOString() }
  ]);
});

// --- Retry & Concurrency Control API ---

let concurrencyLimit = 5;

app.post('/api/concurrency', (req, res) => {
  const { limit } = req.body;
  if (typeof limit === 'number' && limit > 0) {
    concurrencyLimit = limit;
    res.json({ message: 'Concurrency limit updated.', concurrencyLimit });
  } else {
    res.status(400).json({ error: 'Invalid concurrency limit.' });
  }
});

// --- Instagram Posting API ---

app.post('/api/instagram-post', async (req, res) => {
  const { imageUrl, caption } = req.body;
  const INSTAGRAM_ACCESS_TOKEN = process.env.INSTAGRAM_ACCESS_TOKEN;
  const INSTAGRAM_USER_ID = process.env.INSTAGRAM_USER_ID;

  if (!INSTAGRAM_ACCESS_TOKEN || !INSTAGRAM_USER_ID) {
    return res.status(500).json({ error: 'Instagram credentials missing.' });
  }

  try {
    const container
