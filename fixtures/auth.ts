import { timeouts } from '../config/timeouts';
import { expect, Page } from '@playwright/test';
import { ambiente, baseURL } from '../config/ambiente';
import { ambienteData } from '../test-data/ambientes';

function requiredCredential(name: string): string {
  const value = process.env[name] ?? process.env[`PROJAC_${ambiente.toUpperCase()}_${name.replace('PROJAC_', '')}`];
  if (!value) {
    throw new Error(
      `Credencial ausente para ${ambiente}. Defina ${name} ou a variável específica do ambiente no processo de execução.`,
    );
  }
  return value;
}

const LOGIN = requiredCredential('PROJAC_LOGIN');
const PASSWORD = requiredCredential('PROJAC_PASSWORD');
const HOME = `${baseURL}/projac/`;

export async function loginAsTae(page: Page): Promise<void> {
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

    await loginField.fill(LOGIN);
    const passwordField = page.getByRole('textbox', { name: 'Senha' });
    await passwordField.fill(PASSWORD);

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
  await menuButton.click();

  // O menu pode renderizar os perfis depois do botão do usuário.
  await expect(page.getByRole('radio').first()).toBeVisible({ timeout: timeouts.espera });

  const tae = page.getByRole('radio', {
    name: /Tae.*Técnico Administrativo/i,
  });
  await expect(tae).toBeVisible({ timeout: timeouts.espera });
  if (!(await tae.isChecked())) {
    await tae.check();
  }

  await expect(page.getByText(ambienteData.unidade, { exact: true })).toBeVisible();
  await expect(menuButton).toContainText('Tae');

  // Fecha o menu de perfil para não deixar o backdrop bloquear os testes.
  await page.keyboard.press('Escape');
}
