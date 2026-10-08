import { chromium, FullConfig } from '@playwright/test';
import path from 'node:path';
import { loginAsTae } from '../outputs/auth';

export default async function globalSetup(
  config: FullConfig,
): Promise<void> {
  const environment = process.env.TEST_ENV ?? 'dev';

  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();

  await loginAsTae(page);

  await context.storageState({
    path: path.resolve(
      `playwright/.auth/${environment}.json`,
    ),
  });

  await browser.close();
}