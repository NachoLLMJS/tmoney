import express from 'express';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { config, ENV_PATH } from './config.js';
import { createClaimStore } from './claimStore.js';
import { startBot } from './bot.js';

const settings = config();
const app = express();
const currentDir = dirname(fileURLToPath(import.meta.url));
const publicDir = join(currentDir, '..', 'public');
const store = createClaimStore(settings.claimsFile);

app.disable('x-powered-by');
app.use(express.json({ limit: '32kb' }));
app.use(express.static(publicDir, { extensions: ['html'] }));

app.get('/api/config', (_request, response) => {
  response.json({
    botConfigured: Boolean(settings.botUsername),
    botUsername: settings.botUsername || null,
    botUrl: settings.botUsername ? `https://t.me/${settings.botUsername}` : null
  });
});

app.get('/api/health', async (_request, response) => {
  const claims = await store.list();
  response.json({
    ok: true,
    botEnabled: settings.botEnabled,
    botConfigured: Boolean(settings.botToken && settings.botUsername),
    openaiConfigured: Boolean(settings.openaiApiKey),
    pendingClaims: claims.filter((claim) => claim.status === 'pending_review').length
  });
});

app.use((_request, response) => {
  response.status(404).sendFile(join(publicDir, '404.html'));
});

const server = app.listen(settings.port, '127.0.0.1', () => {
  console.log(`TMONEY web running at http://127.0.0.1:${settings.port}`);
  console.log(`Environment file: ${ENV_PATH}`);
});

if (settings.botEnabled) {
  if (!settings.botToken) {
    console.warn('BOT_ENABLED=true but TELEGRAM_BOT_TOKEN is empty; bot not started');
  } else {
    startBot(settings).catch((error) => console.error(`Bot stopped: ${error.message}`));
  }
}

process.on('SIGTERM', () => server.close());
