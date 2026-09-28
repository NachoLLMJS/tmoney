import dotenv from 'dotenv';
import { join } from 'node:path';
import { homedir } from 'node:os';

export const ENV_PATH = process.env.TMONEY_ENV_FILE || join(homedir(), 'Desktop', 'TMONEY.env');
dotenv.config({ path: ENV_PATH, quiet: true });

export function config() {
  return {
    port: Number(process.env.PORT || 4173),
    botToken: process.env.TELEGRAM_BOT_TOKEN || '',
    botUsername: String(process.env.TELEGRAM_BOT_USERNAME || '').replace(/^@/, ''),
    botEnabled: process.env.BOT_ENABLED === 'true',
    openaiApiKey: process.env.OPENAI_API_KEY || '',
    openaiModel: process.env.OPENAI_MODEL || 'gpt-4o-mini',
    claimsFile: process.env.CLAIMS_FILE || join(process.cwd(), 'data', 'claims.json')
  };
}
