import { Router } from 'express';
import { prisma } from '../prisma';
import { requireAuth, AuthedRequest } from '../middleware/auth';

const router = Router();

router.get('/', requireAuth, async (_req: AuthedRequest, res) => {
	const categories = await prisma.category.findMany({ orderBy: { name: 'asc' } });
	res.json({ categories });
});

export default router;
