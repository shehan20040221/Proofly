import express from 'express';
import dotenv from 'dotenv';

const app = express();
const PORT = 4000;

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});