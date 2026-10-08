import { expect, Page } from '@playwright/test';

const LOGIN = process.env.PROJAC_LOGIN ?? 'igor_vieira';
const PASSWORD = process.env.PROJAC_PASSWORD ?? 'igor_vieira';

const BASE_URL =
  process.env.TEST_BASE_URL ??
  'https://projetosacademicos-dev.ufg.br';

const HOME = `${BASE_URL}/projac/`;

export async function loginAsTae(page: Page): Promise<void> {
  await page.goto(HOME, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(1000);

  const loginField = page.getByRole('textbox', {
    name: 'Informe seu login',
  });

  if (await loginField.isVisible().catch(() => false)) {
    const cookieButton = page.getByRole('button', {
      name: /OK, entendi/i,
    });

    if (await cookieButton.isVisible().catch(() => false)) {
      await cookieButton.click();
    }

    await loginField.fill(LOGIN);

    const passwordField = page.getByRole('textbox', {
      name: 'Senha',
    });

    await passwordField.fill(PASSWORD);

    const enterButton = page.getByRole('button', {
      name: /LOGIN/i,
    });

    await expect(enterButton).toBeVisible();
    await expect(enterButton).toBeEnabled();
    await enterButton.click({ force: true });

    await expect(loginField).toBeHidden({
      timeout: 15_000,
    });
  }

  const menuButton = page.getByRole('button', {
    name: /Example icon-button/,
  });

  await expect(menuButton).toBeVisible({
    timeout: 15_000,
  });

  await menuButton.click();

  const tae = page.getByRole('radio', {
    name: /Tae VÍNCULO: Técnico Administrativo/,
  });

  if (!(await tae.isChecked())) {
    await tae.check();
  }

  await expect(
    page.getByText('Centro De Recursos Computacionais').first(),
  ).toBeVisible();

  await expect(menuButton).toContainText('Tae');
}