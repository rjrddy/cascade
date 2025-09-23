import { Router } from 'express';
import { prisma } from '../prisma';
import { requireAuth, AuthedRequest } from '../middleware/auth';

const router = Router();

router.get('/', requireAuth, async (req: AuthedRequest, res) => {
	const accounts = await prisma.account.findMany({ where: { userId: req.userId! } });
	res.json({ accounts });
});

export default router;
