import { Router } from 'express';
import { prisma } from '../lib/prisma.js';
import { requireAuth } from '../middleware/auth.middleware.js';
import { requireRole } from '../middleware/role.middleware.js';

const router = Router();

// get the invoice for a project (if one exists)
router.get('/:projectId', requireAuth, async (req, res) => {
  const invoice = await prisma.invoice.findUnique({
    where: { projectId: req.params.projectId },
  });

  if (!invoice) {
    return res.status(404).json({ error: 'No invoice for this project yet' });
  }

  res.json(invoice);
});

// create an invoice — designer only
router.post('/:projectId', requireAuth, requireRole('DESIGNER'), async (req, res) => {
  try {
    const { items } = req.body;

    const total = items.reduce((sum: number, item: any) => sum + item.amount, 0);

    const invoice = await prisma.invoice.create({
      data: {
        projectId: req.params.projectId,
        items,
        total,
      },
    });

    res.status(201).json(invoice);
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: 'Failed to create invoice' });
  }
});

// update an invoice — designer only
router.patch('/:projectId', requireAuth, requireRole('DESIGNER'), async (req, res) => {
  try {
    const { items, status } = req.body;

    const data: any = {};
    if (items) {
      data.items = items;
      data.total = items.reduce((sum: number, item: any) => sum + item.amount, 0);
    }
    if (status) {
      data.status = status;
    }

    const invoice = await prisma.invoice.update({
      where: { projectId: req.params.projectId },
      data,
    });

    res.json(invoice);
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: 'Failed to update invoice' });
  }
});

export default router;