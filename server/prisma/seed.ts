import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
	const email = 'demo@sankey.app';
	const passwordHash = await bcrypt.hash('demo1234', 10);
	const user = await prisma.user.upsert({
		where: { email },
		update: {},
		create: { email, passwordHash }
	});

	const defaultCategories = [
		'Income',
		'Rent',
		'Groceries',
		'Entertainment',
		'Restaurants',
		'Clothing',
		'Transportation',
		'Savings',
		'Utilities',
		'Healthcare',
		'Subscriptions',
		'Miscellaneous'
	];
	for (const name of defaultCategories) {
		await prisma.category.upsert({ where: { name }, update: {}, create: { name } });
	}

	const incomeCat = await prisma.category.findUnique({ where: { name: 'Income' } });
	const groceriesCat = await prisma.category.findUnique({ where: { name: 'Groceries' } });
	const restaurantsCat = await prisma.category.findUnique({ where: { name: 'Restaurants' } });
	const utilitiesCat = await prisma.category.findUnique({ where: { name: 'Utilities' } });

	// Create a manual account
	const account = await prisma.account.upsert({
		where: { id: 'demo-account-1' },
		update: {},
		create: { id: 'demo-account-1', userId: user.id, name: 'Demo Checking', type: 'depository', currentBalance: 2500 }
	});

	// Seed a recent month
	const now = new Date();
	const txs = [
		{ date: new Date(now.getFullYear(), now.getMonth(), 1), amount: 4000, isIncome: true, merchant: 'Employer Inc', categoryId: incomeCat?.id },
		{ date: new Date(now.getFullYear(), now.getMonth(), 2), amount: 120.55, isIncome: false, merchant: 'Trader Joe\'s', categoryId: groceriesCat?.id },
		{ date: new Date(now.getFullYear(), now.getMonth(), 5), amount: 68.12, isIncome: false, merchant: 'Chipotle', categoryId: restaurantsCat?.id },
		{ date: new Date(now.getFullYear(), now.getMonth(), 7), amount: 95.76, isIncome: false, merchant: 'PG&E', categoryId: utilitiesCat?.id }
	];
	for (const t of txs) {
		await prisma.transaction.create({
			data: { userId: user.id, accountId: account.id, date: t.date, amount: t.amount, isIncome: t.isIncome, merchant: t.merchant!, categoryId: t.categoryId!, source: 'manual' }
		});
	}

	console.log('Seed complete');
}

main().finally(async () => {
	await prisma.$disconnect();
});
