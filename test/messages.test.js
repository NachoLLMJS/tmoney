import test from 'node:test';
import assert from 'node:assert/strict';
import { BOT_COPY, bilingual } from '../src/messages.js';

test('every bot response contains English and Chinese', () => {
  for (const [key, value] of Object.entries(BOT_COPY)) {
    assert.match(value.en, /[A-Za-z]/, `${key} missing English`);
    assert.match(value.zh, /[\u3400-\u9fff]/u, `${key} missing Chinese`);
    const rendered = bilingual(key);
    assert.match(rendered, /EN:/);
    assert.match(rendered, /中文:/);
  }
});

test('accepted copy promises review without claiming an on-chain payment happened', () => {
  const copy = bilingual('accepted').toLowerCase();
  assert.match(copy, /everything looks correct/);
  assert.doesNotMatch(copy, /paid|transaction sent|已支付/);
});
