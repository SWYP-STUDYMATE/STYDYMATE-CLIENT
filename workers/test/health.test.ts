import { describe, it, expect } from 'vitest';
import app from '../src/index';

describe('Workers API smoke', () => {
    it('GET / should return API info', async () => {
        const res = await app.request('/');
        expect(res.status).toBe(200);
        const json = await res.json();
        expect(json?.success).toBe(true);
        expect(json?.data?.name).toBe('STUDYMATE API');
    });

    it('GET /health should be healthy', async () => {
        const res = await app.request('/health');
        expect(res.status).toBe(200);
        const json = await res.json();
        expect(json?.success).toBe(true);
        expect(json?.data?.status).toBe('healthy');
    });
});

