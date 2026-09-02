import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.routes.js';
import cookieParser from 'cookie-parser';
import projectsRoutes from './routes/projects.routes.js';
import filesRoutes from './routes/files.routes.js';

dotenv.config();

const app = express();
const PORT = 4000;

// Enable CORS for frontend requests
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));

app.use('/api/files', filesRoutes);
app.use(express.json()); 
app.use(cookieParser()); 
app.use('/api/projects', projectsRoutes);

app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Backend is running!' });
});

app.use('/api/auth', authRoutes); 

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});