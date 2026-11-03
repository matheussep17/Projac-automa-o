import { storageState } from '../config/ambiente';
import { timeouts } from '../config/timeouts';
import { chromium } from '@playwright/test';
import path from 'node:path';
import { mkdir, writeFile } from 'node:fs/promises';
import { loginAsTae } from './auth';

export default async function globalSetup(): Promise<void> {
  const browser = await chromium.launch();
  try {
    const context = await browser.newContext();
    // O contexto do globalSetup não herda as opções use do runner.
    context.setDefaultTimeout(timeouts.espera);
    context.setDefaultNavigationTimeout(timeouts.espera);
    const page = await context.newPage();
    try {
      await loginAsTae(page);
    } catch (error) {
      await mkdir('test-results', { recursive: true });
      await page.screenshot({ path: 'test-results/auth-failure.png' });
      await writeFile('test-results/auth-failure.txt', await page.locator('body').ariaSnapshot());
      throw error;
    }
    await context.storageState({ path: path.resolve(storageState) });
  } finally {
    await browser.close();
  }
}
