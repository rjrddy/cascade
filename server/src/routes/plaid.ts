import { Router } from 'express';
import { Configuration, PlaidApi, PlaidEnvironments } from 'plaid';
import { env } from '../env';
import { prisma } from '../prisma';
import { requireAuth, AuthedRequest } from '../middleware/auth';

const router = Router();

const config = new Configuration({
	basePath: PlaidEnvironments[env.PLAID_ENV],
	headers: {
		'PLAID-CLIENT-ID': env.PLAID_CLIENT_ID || '',
		'PLAID-SECRET': env.PLAID_SECRET || ''
	}
});
const plaid = new PlaidApi(config);

const plaidPrimaryToCategory: Record<string, string> = {
	FOOD_AND_DRINK: 'Restaurants',
	GROCERIES: 'Groceries',
	RENT_AND_UTILITIES: 'Utilities',
	TRANSPORTATION: 'Transportation',
	SHOPPING: 'Clothing',
	ENTERTAINMENT: 'Entertainment',
	HEALTHCARE: 'Healthcare',
	BANK_FEES: 'Miscellaneous',
	GENERAL_SERVICES: 'Miscellaneous',
	INCOME: 'Income',
	TRAVEL: 'Transportation',
	SUBSCRIPTIONS: 'Subscriptions',
	PERSONAL_CARE: 'Miscellaneous',
	SAVINGS: 'Savings',
	TRANSFER: 'Miscellaneous'
};

router.post('/link/token/create', requireAuth, async (req: AuthedRequest, res) => {
	const tokenRes = await plaid.linkTokenCreate({
		client_name: 'Sankey Wallet',
		language: 'en',
		country_codes: ['US'],
		user: { client_user_id: req.userId! },
		products: ['transactions']
	});
	res.json(tokenRes.data);
});

router.post('/item/public_token/exchange', requireAuth, async (req: AuthedRequest, res) => {
	const { public_token } = req.body as { public_token: string };
	const exchange = await plaid.itemPublicTokenExchange({ public_token });
	const { access_token, item_id } = exchange.data;
	const item = await prisma.plaidItem.create({ data: { userId: req.userId!, accessToken: access_token, itemId: item_id } });
	res.json({ ok: true, itemId: item.id });
});

router.post('/transactions/sync', requireAuth, async (req: AuthedRequest, res) => {
	const items = await prisma.plaidItem.findMany({ where: { userId: req.userId! } });
	let imported = 0;

	const categories = await prisma.category.findMany();
	const nameToId = new Map(categories.map((c) => [c.name.toLowerCase(), c.id]));

	for (const item of items) {
		let cursor: string | null = null;
		while (true) {
			const resp = await plaid.transactionsSync({ access_token: item.accessToken, cursor: cursor || undefined, count: 500 });
			const added = resp.data.added || [];

			// Ensure accounts exist
			const accountsResp = await plaid.accountsGet({ access_token: item.accessToken });
			for (const acc of accountsResp.data.accounts) {
				await prisma.account.upsert({
					where: { id: acc.account_id },
					create: {
						id: acc.account_id,
						userId: req.userId!,
						plaidItemId: item.id,
						name: acc.name || acc.official_name || 'Account',
						officialName: acc.official_name || null,
						mask: acc.mask || null,
						type: acc.type,
						subtype: acc.subtype || null,
						currentBalance: Number(acc.balances.current || 0)
					},
					update: { name: acc.name || acc.official_name || 'Account', currentBalance: Number(acc.balances.current || 0) }
				});
			}

			// Fetch rules for categorization overrides
			const rules = await prisma.rule.findMany({ where: { userId: req.userId! }, select: { matchText: true, categoryId: true } });

			for (const tx of added) {
				// Skip pending
				if (tx.pending) continue;

				// Identify transfers like credit card payments to avoid double counting
				const isTransfer = (tx.personal_finance_category?.primary === 'TRANSFER' || tx.transaction_code === 'transfer') ? true : false;

				const existing = await prisma.transaction.findUnique({ where: { plaidTxId: tx.transaction_id } });
				if (existing) continue;

				let categoryId: string | undefined = undefined;
				// Apply user rules first
				const hay = `${tx.merchant_name || ''} ${tx.name || ''}`;
				for (const r of rules) {
					if (hay.toLowerCase().includes(r.matchText.toLowerCase())) {
						categoryId = r.categoryId;
						break;
					}
				}

				// If no rule, map by Plaid primary category
				if (!categoryId && tx.personal_finance_category?.primary) {
					const mappedName = plaidPrimaryToCategory[tx.personal_finance_category.primary];
					if (mappedName) categoryId = nameToId.get(mappedName.toLowerCase());
				}

				await prisma.transaction.create({
					data: {
						userId: req.userId!,
						accountId: tx.account_id,
						date: new Date(tx.date),
						amount: Math.abs(tx.amount),
						merchant: tx.merchant_name || null,
						description: tx.name || null,
						isIncome: tx.amount < 0, // Plaid negative amounts are credits
						categoryId: categoryId || null,
						plaidTxId: tx.transaction_id,
						source: 'plaid',
						isTransfer
					}
				});
				imported++;
			}

			cursor = resp.data.next_cursor || null;
			if (!resp.data.has_more) break;
		}
	}
	res.json({ ok: true, imported });
});

export default router;
