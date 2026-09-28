import test from 'node:test';
import assert from 'node:assert/strict';
import { evaluateClaim, claimFingerprint, extractSubmissionText } from '../src/claimEvaluator.js';

const forwarded = (text = 'I found TMONEY — Telegram Money') => ({
  message_id: 88,
  text,
  date: 1790550000,
  chat: { id: 77 },
  from: { id: 42, username: 'alice' },
  forward_origin: {
    type: 'channel',
    date: 1790549000,
    message_id: 12,
    chat: { id: -100123, title: 'Memes', username: 'memes' }
  }
});

test('accepts a forwarded post that clearly mentions TMONEY', async () => {
  const result = await evaluateClaim(forwarded(), { aiReview: null });
  assert.equal(result.ok, true);
  assert.equal(result.reason, 'accepted_keyword');
});

test('rejects a message that was not forwarded', async () => {
  const result = await evaluateClaim({ ...forwarded(), forward_origin: undefined }, { aiReview: null });
  assert.deepEqual(result, { ok: false, reason: 'not_forwarded' });
});

test('rejects an unrelated forwarded post', async () => {
  const result = await evaluateClaim(forwarded('ordinary market update'), { aiReview: null });
  assert.equal(result.ok, false);
  assert.equal(result.reason, 'missing_tmoneymatch');
});

test('uses a caption when a forwarded post contains media', () => {
  const message = forwarded();
  delete message.text;
  message.caption = 'TMONEY meme video';
  assert.equal(extractSubmissionText(message), 'TMONEY meme video');
});

test('builds a stable fingerprint from the forward origin', () => {
  assert.equal(claimFingerprint(forwarded()), claimFingerprint(forwarded('different visible text')));
});
