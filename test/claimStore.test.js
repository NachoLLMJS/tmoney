import test from 'node:test';
import assert from 'node:assert/strict';
import { createClaimStore } from '../src/claimStore.js';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

test('stores one pending claim and refuses a duplicate fingerprint', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'tmoney-test-'));
  try {
    const store = createClaimStore(join(dir, 'claims.json'));
    const claim = { fingerprint: 'origin:1:2', status: 'pending_review', userId: 42 };
    assert.equal((await store.add(claim)).created, true);
    assert.equal((await store.add(claim)).created, false);
    assert.equal((await store.list()).length, 1);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});
