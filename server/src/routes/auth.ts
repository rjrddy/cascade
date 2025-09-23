import { Router } from 'express';
import { prisma } from '../prisma';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { env } from '../env';

const router = Router();

router.post('/signup', async (req, res) => {
	try {
		const { email, password } = req.body as { email: string; password: string };
		if (!email || !password) return res.status(400).json({ error: 'Missing fields' });
		const existing = await prisma.user.findUnique({ where: { email } });
		if (existing) return res.status(409).json({ error: 'Email already registered' });
		const passwordHash = await bcrypt.hash(password, 10);
		const user = await prisma.user.create({ data: { email, passwordHash } });
		const token = jwt.sign({ uid: user.id }, env.JWT_SECRET, { expiresIn: '7d' });
		res.json({ token });
	} catch (e) {
		res.status(500).json({ error: 'Signup failed' });
	}
});

router.post('/login', async (req, res) => {
	try {
		const { email, password } = req.body as { email: string; password: string };
		const user = await prisma.user.findUnique({ where: { email } });
		if (!user) return res.status(401).json({ error: 'Invalid credentials' });
		const ok = await bcrypt.compare(password, user.passwordHash);
		if (!ok) return res.status(401).json({ error: 'Invalid credentials' });
		const token = jwt.sign({ uid: user.id }, env.JWT_SECRET, { expiresIn: '7d' });
		res.json({ token });
	} catch (e) {
		res.status(500).json({ error: 'Login failed' });
	}
});

export default router;
