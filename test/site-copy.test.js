import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const root = new URL('../', import.meta.url);
const html = await readFile(new URL('public/index.html', root), 'utf8');
const css = await readFile(new URL('public/styles.css', root), 'utf8');
const app = await readFile(new URL('public/app.js', root), 'utf8');

test('hero uses the exact requested headline', () => {
  assert.match(html, /WORK FOR<br>UR BAGS<br>AND GEET<br><span>TMONEY<\/span>/);
  assert.doesNotMatch(html, /THE CHAT<br>IS THE/);
});

test('site is Chinese-first while preserving the requested English headline', () => {
  assert.match(html, /<html lang="zh-CN">/);
  assert.match(html, /宣传部/);
  assert.match(html, /申领你的份额/);
  assert.match(app, /机器人信息待配置/);
});

test('Twitter placeholder appears immediately before memes and has no invented URL', () => {
  const twitterIndex = html.indexOf('id="twitter-link"');
  const memesIndex = html.indexOf('href="#memes"');
  assert.ok(twitterIndex > 0 && twitterIndex < memesIndex);
  assert.doesNotMatch(html, /id="twitter-link"[^>]+href=/);
});

test('removed copy cannot return', () => {
  assert.doesNotMatch(html, /human retweets/i);
  assert.doesNotMatch(html, /A meme machine for people/i);
});

test('the public dialog never exposes a local Windows path', () => {
  assert.doesNotMatch(html, /C:\\\\Users\\\\nacho/i);
  assert.doesNotMatch(html, /TMONEY\.env/i);
});

test('desktop hero is constrained to the first viewport', () => {
  assert.match(css, /height:\s*calc\(100svh - 82px\)/);
  assert.match(css, /max-height:\s*calc\(100svh - 150px\)/);
});

test('authored visible copy has no terminal full stops', () => {
  const visibleText = html
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<[^>]+>/g, '\n')
    .split(/\n+/)
    .map((line) => line.trim())
    .filter(Boolean);
  const terminalFullStops = visibleText.filter((line) => /[。.]$/u.test(line));
  assert.deepEqual(terminalFullStops, []);
  assert.doesNotMatch(app, /'[^'\n]*[。.]'/u);
});
