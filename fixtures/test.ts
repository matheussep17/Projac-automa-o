import { test as base } from '@playwright/test';
import { loginAsTae } from './auth';

export const test = base.extend({
  page: async ({ page }, use) => {
    await base.step('Autenticar e selecionar perfil TAE', () => loginAsTae(page));

    await use(page);
  },
});

export { expect } from '@playwright/test';