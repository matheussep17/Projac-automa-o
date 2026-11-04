import { chromium } from '@playwright/test';
import { mkdir, writeFile } from 'node:fs/promises';
import { apiStorageState, apiMetadata } from './auth-state';
import { timeouts } from '../../config/timeouts';
import { loginAsTae } from '../../fixtures/auth';

// CAS exige navegação para estabelecer os cookies. Só o login usa navegador;
// cadastros, decisões, consultas e ajustes são executados por HTTP.
export default async function setupApi(): Promise<void> {
  const browser = await chromium.launch();
  try {
    const context = await browser.newContext();
    context.setDefaultTimeout(timeouts.espera);
    const page = await context.newPage();
    const menuResponse = page.waitForResponse(r =>
      new URL(r.url()).pathname === '/comum-service/menu' && r.ok(),
    ).then(async response => ({ gateway: new URL(response.url()).origin, menu: await response.json() }));
    const [{ gateway, menu }] = await Promise.all([menuResponse, loginAsTae(page)]);
    await mkdir('playwright/.auth', { recursive: true });
    await context.storageState({ path: apiStorageState });
    await writeFile(apiMetadata, JSON.stringify({
      gateway,
      perfis: menu.data.perfis,
    }));
  } finally {
    await browser.close();
  }
}
