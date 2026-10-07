import { expect, Page } from '@playwright/test';

const LOGIN = process.env.PROJAC_LOGIN ?? 'igor_vieira';
const PASSWORD = process.env.PROJAC_PASSWORD ?? 'igor_vieira';
const HOME = 'https://projetosacademicos-dev.ufg.br/projac/';

export async function loginAsTae(page: Page): Promise<void> {
  await page.goto(HOME, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(1000);

  const loginField = page.getByRole('textbox', { name: 'Informe seu login' });
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
    await expect(loginField).toBeHidden({ timeout: 15_000 });
  }

  await expect(page.getByRole('button', { name: 'Example icon-button com um menu' }).or(
    page.getByRole('button', { name: 'Example icon-button with a menu' }),
  )).toBeVisible({ timeout: 15_000 });

  const menuButton = page.getByRole('button', { name: /Example icon-button/ });
  await menuButton.click();

  const tae = page.getByRole('radio', {
    name: /Tae VÍNCULO: Técnico Administrativo/,
  });
  if (!(await tae.isChecked())) {
    await tae.check();
  }

  await expect(page.getByText('Centro De Recursos Computacionais').first()).toBeVisible();
  await expect(menuButton).toContainText('Tae');
}
