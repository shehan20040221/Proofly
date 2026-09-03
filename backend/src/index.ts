import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.routes.js';
import cookieParser from 'cookie-parser';
import projectsRoutes from './routes/projects.routes.js';
import filesRoutes from './routes/files.routes.js';
import commentsRoutes from './routes/comments.routes.js';
import notificationsRoutes from './routes/notifications.routes.js';
import invoicesRoutes from './routes/invoices.routes.js';

dotenv.config();

const app = express();
const PORT = 4000;

app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));

app.use(cookieParser());
app.use(express.json());
app.use('/api/files', filesRoutes);
app.use('/api/projects', projectsRoutes);
app.use('/api/comments', commentsRoutes);
app.use('/api/notifications', notificationsRoutes);
app.use('/api/invoices', invoicesRoutes);

app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Backend is running!' });
});

app.use('/api/auth', authRoutes);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});