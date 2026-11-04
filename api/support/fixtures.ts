import { test as base, expect, request } from '@playwright/test';
import { readFile } from 'node:fs/promises';
import { baseURL } from '../../config/ambiente';
import { apiStorageState, apiMetadata } from './auth-state';
import { timeouts } from '../../config/timeouts';
import { ProjacApi, Dto } from './client';
import { withGatewaySession } from './gateway-session';

export const test = base.extend<{ api: ProjacApi }>({
  api: async ({}, use) => {
    const metadata: { gateway: string; perfis: Dto[] } = JSON.parse(
      await readFile(apiMetadata, 'utf8'),
    );
    const context = await request.newContext({
      baseURL: metadata.gateway,
      storageState: apiStorageState,
      timeout: timeouts.espera,
      extraHTTPHeaders: { Accept: 'application/json', Origin: baseURL, Referer: `${baseURL}/projac/` },
    });
    try {
      const api = new ProjacApi(withGatewaySession(context, metadata.gateway), metadata.perfis);
      await api.perfil('TAE');
      await use(api);
    } finally { await context.dispose(); }
  },
});
export { expect };
