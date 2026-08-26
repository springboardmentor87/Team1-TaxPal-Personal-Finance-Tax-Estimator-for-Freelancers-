const dotenv = require('dotenv');
const { z } = require('zod');

// Load environment variables from .env file
dotenv.config();

const envSchema = z.object({
  PORT: z.coerce.number().default(5000),
  DB_DIALECT: z.enum(['sqlite', 'mysql']).default('sqlite'),
  SQLITE_DB_PATH: z.string().optional(),
  DB_HOST: z.string().default('localhost'),
  DB_USER: z.string().default('root'),
  DB_PASSWORD: z.string().default(''),
  DB_NAME: z.string().default('taxpal'),
  DB_PORT: z.coerce.number().default(3306),
  JWT_SECRET: z.string().default('taxpal_secure_jwt_secret_token_key_2026'),
  JWT_EXPIRES: z.string().default('15m'),
  REFRESH_SECRET: z.string().default('taxpal_secure_refresh_secret_token_key_2026'),
  REFRESH_EXPIRES: z.string().default('7d'),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  GEMINI_API_KEY: z.string().optional(),
  OPENAI_API_KEY: z.string().optional(),
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.coerce.number().optional(),
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),
  SMTP_FROM: z.string().optional(),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('❌ Invalid environment variables Configuration:');
  console.error(JSON.stringify(parsed.error.format(), null, 2));
  process.exit(1);
}

module.exports = {
  env: parsed.data,
};
