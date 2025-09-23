import express from 'express';
import cors from 'cors';
import { env } from './env';
import { prisma } from './prisma';

import authRouter from './routes/auth';
import plaidRouter from './routes/plaid';
import transactionsRouter from './routes/transactions';
import budgetsRouter from './routes/budgets';
import categoriesRouter from './routes/categories';
import rulesRouter from './routes/rules';
import accountsRouter from './routes/accounts';

const app = express();
app.use(express.json());
app.use(
	cors({
		origin: env.SERVER_ORIGIN,
		credentials: true
	})
);

app.get('/health', async (_req, res) => {
	await prisma.$queryRaw`SELECT 1`;
	res.json({ ok: true });
});

app.use('/auth', authRouter);
app.use('/plaid', plaidRouter);
app.use('/transactions', transactionsRouter);
app.use('/budgets', budgetsRouter);
app.use('/categories', categoriesRouter);
app.use('/rules', rulesRouter);
app.use('/accounts', accountsRouter);

app.use((err: any, _req: any, res: any, _next: any) => {
	console.error(err);
	res.status(500).json({ error: 'Internal Server Error' });
});

app.listen(Number(env.SERVER_PORT), () => {
	console.log(`Server running on :${env.SERVER_PORT}`);
});
