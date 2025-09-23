import { Router } from 'express';
import { prisma } from '../prisma';
import { requireAuth, AuthedRequest } from '../middleware/auth';

const router = Router();

function applyRules(merchant: string | null | undefined, description: string | null | undefined, rules: { matchText: string; categoryId: string }[]) {
	const hay = `${merchant ?? ''} ${description ?? ''}`.toLowerCase();
	for (const r of rules) {
		if (hay.includes(r.matchText.toLowerCase())) return r.categoryId;
	}
	return undefined;
}

router.get('/', requireAuth, async (req: AuthedRequest, res) => {
	const { from, to } = req.query as { from?: string; to?: string };
	const where: any = { userId: req.userId };
	if (from || to) where.date = { gte: from ? new Date(from) : undefined, lte: to ? new Date(to) : undefined };
	const txns = await prisma.transaction.findMany({ where, orderBy: { date: 'desc' }, include: { category: true, account: true } });
	res.json({ transactions: txns });
});

router.post('/manual', requireAuth, async (req: AuthedRequest, res) => {
	const { date, amount, categoryId, merchant, description, isIncome, accountId } = req.body as {
		date: string;
		amount: number;
		categoryId?: string;
		merchant?: string;
		description?: string;
		isIncome?: boolean;
		accountId?: string;
	};
	if (!date || amount === undefined) return res.status(400).json({ error: 'Missing fields' });

	let finalCategoryId = categoryId;
	if (!finalCategoryId) {
		const rules = await prisma.rule.findMany({ where: { userId: req.userId! }, select: { matchText: true, categoryId: true } });
		finalCategoryId = applyRules(merchant, description, rules);
	}

	const txn = await prisma.transaction.create({
		data: {
			userId: req.userId!,
			date: new Date(date),
			amount,
			merchant,
			description,
			isIncome: Boolean(isIncome),
			categoryId: finalCategoryId,
			accountId: accountId || null,
			source: 'manual'
		}
	});
	res.json({ transaction: txn });
});

router.put('/:id', requireAuth, async (req: AuthedRequest, res) => {
	const { id } = req.params as { id: string };
	const { date, amount, categoryId, merchant, description, isIncome, accountId, isTransfer } = req.body as any;
	const txn = await prisma.transaction.update({
		where: { id },
		data: { date: date ? new Date(date) : undefined, amount, categoryId, merchant, description, isIncome, accountId, isTransfer }
	});
	res.json({ transaction: txn });
});

router.delete('/:id', requireAuth, async (req: AuthedRequest, res) => {
	const { id } = req.params as { id: string };
	await prisma.transaction.delete({ where: { id } });
	res.json({ ok: true });
});

export default router;
