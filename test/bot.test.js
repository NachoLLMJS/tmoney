import test from 'node:test';
import assert from 'node:assert/strict';
import { createMessageHandler } from '../src/bot.js';

function forwardedMessage() {
  return {
    message_id: 10,
    date: 1790550000,
    text: 'TMONEY is Telegram Money',
    chat: { id: 77 },
    from: { id: 42, username: 'alice', first_name: 'Alice' },
    forward_origin: {
      type: 'channel',
      date: 1790549000,
      message_id: 9,
      chat: { id: -100123, title: 'Meme Channel', username: 'memes' }
    }
  };
}

test('message handler replies bilingually and queues a valid forward', async () => {
  const calls = [];
  const claims = [];
  const handler = createMessageHandler({
    telegram: async (method, payload) => { calls.push({ method, payload }); },
    store: {
      add: async (claim) => {
        claims.push(claim);
        return { created: true, claim };
      }
    },
    aiReview: null
  });

  await handler(forwardedMessage());

  assert.equal(claims.length, 1);
  assert.equal(claims[0].status, 'pending_review');
  assert.equal(claims[0].origin.sourceChatUsername, 'memes');
  assert.equal(calls.length, 2);
  assert.match(calls[0].payload.text, /EN:.*中文:/s);
  assert.match(calls[1].payload.text, /Everything looks correct/);
});

test('message handler refuses copied text without forward origin', async () => {
  const replies = [];
  const handler = createMessageHandler({
    telegram: async (_method, payload) => replies.push(payload.text),
    store: { add: async () => { throw new Error('must not store'); } },
    aiReview: null
  });
  const message = forwardedMessage();
  delete message.forward_origin;

  await handler(message);

  assert.equal(replies.length, 2);
  assert.match(replies[1], /original message forwarded/i);
});
