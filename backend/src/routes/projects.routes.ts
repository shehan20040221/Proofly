import { Router } from 'express';
import { prisma } from '../lib/prisma.js';
import { requireAuth } from '../middleware/auth.middleware.js';
import { requireRole } from '../middleware/role.middleware.js';

const router = Router();

// CREATE — designer only
router.post('/', requireAuth, requireRole('DESIGNER'), async (req, res) => {
  try {
    const { title, description, clientEmail } = req.body;

    const client = await prisma.user.findUnique({ where: { email: clientEmail } });
    if (!client || client.role !== 'CLIENT') {
      return res.status(400).json({ error: 'No client found with that email' });
    }

    const project = await prisma.project.create({
      data: {
        title,
        description,
        designerId: req.user!.userId,
        clientId: client.id,
      },
    });

    res.status(201).json(project);
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: 'Failed to create project' });
  }
});

// LIST — filtered by role
router.get('/', requireAuth, async (req, res) => {
  const { userId, role } = req.user!;

  const projects = await prisma.project.findMany({
    where: role === 'DESIGNER' ? { designerId: userId } : { clientId: userId },
    orderBy: { updatedAt: 'desc' },
  });

  res.json(projects);
});

// GET ONE
router.get('/:id', requireAuth, async (req, res) => {
  const project = await prisma.project.findUnique({ where: { id: req.params.id as string } });

  if (!project) return res.status(404).json({ error: 'Project not found' });

  const { userId } = req.user!;
  if (project.designerId !== userId && project.clientId !== userId) {
    return res.status(403).json({ error: 'Not your project' });
  }

  res.json(project);
});

// UPDATE
router.patch('/:id', requireAuth, async (req, res) => {
  const project = await prisma.project.findUnique({ where: { id: req.params.id } });

  if (!project) return res.status(404).json({ error: 'Project not found' });

  const { userId } = req.user!;
  if (project.designerId !== userId && project.clientId !== userId) {
    return res.status(403).json({ error: 'Not your project' });
  }

  const { title, description, stage } = req.body;

  const updated = await prisma.project.update({
    where: { id: req.params.id },
    data: { title, description, stage },
  });

  res.json(updated);
});

export default router;