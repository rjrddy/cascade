import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const EnvSchema = z.object({
	DATABASE_URL: z.string().url(),
	JWT_SECRET: z.string().min(10),
	PLAID_CLIENT_ID: z.string().optional(),
	PLAID_SECRET: z.string().optional(),
	PLAID_ENV: z.enum(['sandbox', 'development', 'production']).default('sandbox'),
	SERVER_PORT: z.string().default('4000'),
	SERVER_ORIGIN: z.string().url().default('http://localhost:3000')
});

export const env = EnvSchema.parse(process.env);
