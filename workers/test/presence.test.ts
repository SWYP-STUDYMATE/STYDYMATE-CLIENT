import { describe, it, expect, beforeAll } from 'vitest';
import { Miniflare } from 'miniflare';

const PRESENCE_CLASS = 'UserPresence';

describe('UserPresence Durable Object', () => {
  let mf: Miniflare;

  beforeAll(() => {
    mf = new Miniflare({
      scriptPath: './dist/index.mjs',
      modules: true,
      durableObjects: {
        USER_PRESENCE: PRESENCE_CLASS
      },
      kvNamespaces: ['CACHE'],
      d1Databases: ['DB']
    });
  });

  it('should set and retrieve presence state', async () => {
    const env = await mf.getBindings();
    const id = env.USER_PRESENCE.idFromName('user-1');
    const stub = env.USER_PRESENCE.get(id);

    const setResp = await stub.fetch('https://user-presence/set', {
      method: 'POST',
      body: JSON.stringify({ userId: 'user-1', status: 'ONLINE' })
    });
    expect(setResp.status).toBe(200);

    const statusResp = await stub.fetch('https://user-presence/status');
    const data = await statusResp.json();
    expect(data.status).toBe('ONLINE');
  });
});
