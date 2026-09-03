import { Router } from 'express';
import { v2 as cloudinary } from 'cloudinary';
import { prisma } from '../lib/prisma';
import { requireAuth } from '../middleware/auth.middleware.js';
import { requireRole } from '../middleware/role.middleware.js';

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

const router = Router();

router.get('/', requireAuth, async (req, res) => {
  const { projectId } = req.query;

  const files = await prisma.file.findMany({
    where: { projectId: projectId as string },
    orderBy: { createdAt: 'desc' },
  });

  res.json(files);
});

// Step 1: generate a signature the frontend can use to upload directly
router.get('/sign', requireAuth, requireRole('DESIGNER'), (req, res) => {
  const timestamp = Math.round(Date.now() / 1000);

  const signature = cloudinary.utils.api_sign_request(
    { timestamp, folder: 'proofly' },
    process.env.CLOUDINARY_API_SECRET!
  );

  res.json({
    timestamp,
    signature,
    cloudName: process.env.CLOUDINARY_CLOUD_NAME,
    apiKey: process.env.CLOUDINARY_API_KEY,
  });
});

// Step 3: save the uploaded file's URL as a File record
router.post('/', requireAuth, requireRole('DESIGNER'), async (req, res) => {
  try {
    const { projectId, fileUrl } = req.body;

    const file = await prisma.file.create({
      data: {
        projectId,
        uploadedById: req.user!.userId,
        fileUrl,
      },
    });

    res.status(201).json(file);
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: 'Failed to save file' });
  }
});

export default router;