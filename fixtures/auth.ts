import { timeouts } from '../config/timeouts';
import { expect, Page } from '@playwright/test';
import { ambiente, baseURL } from '../config/ambiente';
import { ambienteData } from '../test-data/ambientes';
import { Perfil, PerfilPage } from '../pages/avaliacao-planos-financeiros/PerfilPage';
import path from 'node:path';
import { loadEnvFile } from 'node:process';

try {
  const projectEnv = path.resolve(__dirname, '..', '.env');
  loadEnvFile(projectEnv);
} catch (error) {
  // O .env é opcional; em CI, as credenciais podem vir do ambiente do processo.
  if ((error as NodeJS.ErrnoException).code !== 'ENOENT') {
    throw error;
  }
}

function requiredCredential(name: string): string {
  const value = process.env[name] ?? process.env[`PROJAC_${ambiente.toUpperCase()}_${name.replace('PROJAC_', '')}`];
  if (!value) {
    throw new Error(
      `Credencial ausente para ${ambiente}. Defina ${name} ou a variável específica do ambiente no processo de execução.`,
    );
  }
  return value;
}

const HOME = `${baseURL}/projac/`;

export async function loginAsTae(page: Page): Promise<void> {
  await loginComPerfil(page, 'TAE');
}

export async function loginComPerfil(page: Page, perfil: Perfil): Promise<void> {
  const login = requiredCredential('PROJAC_LOGIN');
  const password = requiredCredential('PROJAC_PASSWORD');

  await page.goto(HOME, { waitUntil: 'domcontentloaded' });
  const loginField = page.getByRole('textbox', { name: 'Informe seu login' });
  await expect(
    loginField.or(page.getByRole('button', { name: /Example icon-button/ }).filter({ hasText: /\S/ })),
  ).toBeVisible({ timeout: timeouts.espera });
  if (await loginField.isVisible().catch(() => false)) {
    const cookieButton = page.getByRole('button', { name: /OK, entendi/i });
    if (await cookieButton.isVisible().catch(() => false)) {
      await cookieButton.click();
    }

    await loginField.fill(login);
    const passwordField = page.getByRole('textbox', { name: 'Senha' });
    await passwordField.fill(password);

    // O botão do formulário CAS nem sempre expõe o nome acessível corretamente.
    const enterButton = page.getByRole('button', { name: /LOGIN/i });
    await expect(enterButton).toBeVisible();
    await expect(enterButton).toBeEnabled();
    await enterButton.click({ force: true });

    // Confirma que o clique foi efetivado e que a autenticação terminou.
    await expect(loginField).toBeHidden({ timeout: timeouts.espera });
  }

  await expect(
    page
      .getByRole('button', { name: 'Example icon-button com um menu' })
      .or(page.getByRole('button', { name: 'Example icon-button with a menu' })),
  ).toBeVisible({ timeout: timeouts.espera });

  const menuButton = page.getByRole('button', { name: /Example icon-button/ });
  await expect(menuButton).toContainText(/\S/, { timeout: timeouts.espera });
  await new PerfilPage(page).trocarPara(perfil);
  if (perfil === 'TAE') {
    await expect(page.getByText(ambienteData.unidade, { exact: true })).toBeVisible();
  }
}
