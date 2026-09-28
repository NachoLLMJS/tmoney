import { mkdir, readFile, rename, writeFile } from 'node:fs/promises';
import { dirname } from 'node:path';

async function readClaims(filePath) {
  try {
    const parsed = JSON.parse(await readFile(filePath, 'utf8'));
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    if (error.code === 'ENOENT') return [];
    throw error;
  }
}

export function createClaimStore(filePath) {
  let queue = Promise.resolve();

  const locked = (operation) => {
    const result = queue.then(operation, operation);
    queue = result.then(() => undefined, () => undefined);
    return result;
  };

  return {
    list() {
      return locked(() => readClaims(filePath));
    },
    add(claim) {
      return locked(async () => {
        const claims = await readClaims(filePath);
        const existing = claims.find((item) => item.fingerprint === claim.fingerprint);
        if (existing) return { created: false, claim: existing };

        const next = [...claims, claim];
        await mkdir(dirname(filePath), { recursive: true });
        const temporary = `${filePath}.tmp`;
        await writeFile(temporary, `${JSON.stringify(next, null, 2)}\n`, 'utf8');
        await rename(temporary, filePath);
        return { created: true, claim };
      });
    }
  };
}
