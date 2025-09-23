import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../env';

export interface AuthedRequest extends Request {
	userId?: string;
}

export function requireAuth(req: AuthedRequest, res: Response, next: NextFunction) {
	const header = req.headers.authorization;
	if (!header) return res.status(401).json({ error: 'Missing Authorization header' });
	const token = header.replace('Bearer ', '');
	try {
		const payload = jwt.verify(token, env.JWT_SECRET) as { uid: string };
		req.userId = payload.uid;
		next();
	} catch (e) {
		return res.status(401).json({ error: 'Invalid token' });
	}
}
