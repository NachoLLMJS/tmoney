import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const root = new URL('../', import.meta.url);

async function text(path) {
  return readFile(new URL(path, root), 'utf8');
}

test('static deployment exposes only the public Telegram bot identity', async () => {
  const config = JSON.parse(await text('public/api/config.json'));
  assert.deepEqual(config, {
    botConfigured: true,
    botUsername: 'tmoneybnb_bot',
    botUrl: 'https://t.me/tmoneybnb_bot'
  });
  assert.doesNotMatch(JSON.stringify(config), /token|api[_-]?key|secret/i);
});

test('Vercel builds the public site into dist', async () => {
  const pkg = JSON.parse(await text('package.json'));
  const vercel = JSON.parse(await text('vercel.json'));
  assert.equal(pkg.scripts.build, 'node scripts/build-static.js');
  assert.equal(vercel.outputDirectory, 'dist');
  assert.equal(vercel.buildCommand, 'npm run build');
});

test('browser reads the deploy-safe public config file', async () => {
  const app = await text('public/app.js');
  assert.match(app, /fetch\('\/api\/config\.json'\)/);
});

test('published documentation contains no developer-specific local path', async () => {
  const readme = await text('README.md');
  assert.doesNotMatch(readme, /C:\\Users\\nacho|Users\/nacho/i);
});
