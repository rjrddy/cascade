import { Router } from 'express';
import { prisma } from '../prisma';
import { requireAuth, AuthedRequest } from '../middleware/auth';

const router = Router();

router.get('/', requireAuth, async (req: AuthedRequest, res) => {
	const { month, year } = req.query as { month?: string; year?: string };
	const m = month ? Number(month) : new Date().getMonth() + 1;
	const y = year ? Number(year) : new Date().getFullYear();

	const budgets = await prisma.budget.findMany({
		where: { userId: req.userId!, month: m, year: y },
		include: { category: true }
	});

	const start = new Date(y, m - 1, 1);
	const end = new Date(y, m, 0, 23, 59, 59, 999);

	const txns = await prisma.transaction.groupBy({
		by: ['categoryId'],
		where: { userId: req.userId!, isIncome: false, isTransfer: false, date: { gte: start, lte: end } },
		_sum: { amount: true }
	});

	const spentByCat = new Map<string, number>();
	txns.forEach((g) => {
		if (g.categoryId) spentByCat.set(g.categoryId, Number(g._sum.amount || 0));
	});

	const data = budgets.map((b) => {
		const spent = spentByCat.get(b.categoryId) || 0;
		const percent = b.amount.toNumber() === 0 ? 0 : Math.min(100, Math.round((spent / b.amount.toNumber()) * 100));
		return {
			id: b.id,
			category: b.category.name,
			categoryId: b.categoryId,
			amount: b.amount.toNumber(),
			spent,
			remaining: Math.max(0, b.amount.toNumber() - spent),
			percent
		};
	});

	res.json({ budgets: data, month: m, year: y });
});

router.post('/', requireAuth, async (req: AuthedRequest, res) => {
	const { categoryId, month, year, amount } = req.body as {
		categoryId: string;
		month: number;
		year: number;
		amount: number;
	};
	if (!categoryId || !month || !year) return res.status(400).json({ error: 'Missing fields' });
	const b = await prisma.budget.upsert({
		where: { userId_categoryId_month_year: { userId: req.userId!, categoryId, month, year } },
		update: { amount },
		create: { userId: req.userId!, categoryId, month, year, amount }
	});
	res.json({ budget: b });
});

export default router;
