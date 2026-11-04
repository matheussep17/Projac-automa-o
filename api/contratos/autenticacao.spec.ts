import { request } from '@playwright/test';
import { readFile } from 'node:fs/promises';
import { test, expect } from '../support/fixtures';
import { apiMetadata } from '../support/auth-state';
import { timeouts } from '../../config/timeouts';

test('nega acesso sem sessão com resposta de autenticação @api @seguranca', async () => {
  const { gateway } = JSON.parse(await readFile(apiMetadata, 'utf8'));
  const anonymous = await request.newContext({
    baseURL: gateway, timeout: timeouts.espera,
    storageState: { cookies: [], origins: [] },
  });
  try {
    expect((await anonymous.storageState()).cookies).toHaveLength(0);
    const response = await anonymous.get('/projac-comum-service/repercussao-financeira/minhas-repercussoes', { maxRedirects: 0 });
    expect([401, 403, 302, 303, 307, 308]).toContain(response.status());
    if (response.status() >= 300 && response.status() < 400) {
      expect(response.headers().location).toMatch(/auth|login|cas|sso/i);
    }
  } finally { await anonymous.dispose(); }
});
