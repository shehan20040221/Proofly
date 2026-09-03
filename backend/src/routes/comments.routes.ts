import { Router } from 'express';
import { prisma } from '../lib/prisma.js';
import { requireAuth } from '../middleware/auth.middleware.js';

const router = Router();

// list comments for a file
router.get('/', requireAuth, async (req, res) => {
  const { fileId } = req.query;

  const comments = await prisma.comment.findMany({
    where: { fileId: fileId as string },
    include: { author: { select: { name: true, role: true } } },
    orderBy: { createdAt: 'asc' },
  });

  res.json(comments);
});

// create a pinned comment
router.post('/', requireAuth, async (req, res) => {
  try {
    const { fileId, posX, posY, text } = req.body;

    const comment = await prisma.comment.create({
      data: {
        fileId,
        authorId: req.user!.userId,
        posX,
        posY,
        text,
      },
      include: { author: { select: { name: true, role: true } } },
    });

    console.log('Comment created:', comment.id);

    // find the project this comment belongs to, via its file
    const file = await prisma.file.findUnique({
      where: { id: fileId },
      include: { project: true },
    });

    console.log('File lookup result:', file ? 'found' : 'NOT FOUND');

    if (file) {
      const recipientId =
        req.user!.userId === file.project.designerId
          ? file.project.clientId
          : file.project.designerId;

      console.log('Creating notification for recipientId:', recipientId);

      const notification = await prisma.notification.create({
        data: {
          userId: recipientId,
          projectId: file.project.id,
          message: `${comment.author.name} left feedback on "${file.project.title}"`,
        },
      });

      console.log('Notification created:', notification.id);
    }

    res.status(201).json(comment);
  } catch (err) {
    console.error('ERROR in comment creation:', err);
    res.status(400).json({ error: 'Failed to add comment' });
  }
});

// resolve/unresolve a comment
router.patch('/:id', requireAuth, async (req, res) => {
  try {
    const { resolved } = req.body;

    const comment = await prisma.comment.update({
      where: { id: req.params.id },
      data: { resolved },
      include: { author: { select: { name: true, role: true } } },
    });

    res.json(comment);
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: 'Failed to update comment' });
  }
});

export default router;