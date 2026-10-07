import { test as base } from '@playwright/test';
import { loginAsTae } from '../outputs/auth';

export const test = base.extend({
  page: async ({ page }, use) => {
    await page.goto('/projac/', { waitUntil: 'domcontentloaded' });
    await loginAsTae(page);
    await use(page);
  },
});

export { expect } from '@playwright/test';
