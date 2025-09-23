import { Router } from 'express';
import { prisma } from '../prisma';
import { requireAuth, AuthedRequest } from '../middleware/auth';

const router = Router();

router.get('/', requireAuth, async (req: AuthedRequest, res) => {
	const rules = await prisma.rule.findMany({ where: { userId: req.userId! }, include: { category: true } });
	res.json({ rules });
});

router.post('/', requireAuth, async (req: AuthedRequest, res) => {
	const { matchText, categoryId } = req.body as { matchText: string; categoryId: string };
	if (!matchText || !categoryId) return res.status(400).json({ error: 'Missing fields' });
	const rule = await prisma.rule.create({ data: { userId: req.userId!, matchText, categoryId } });
	res.json({ rule });
});

export default router;
