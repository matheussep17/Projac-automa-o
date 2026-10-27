import { expect, Page } from '@playwright/test';

export class PerfilPage {
  constructor(private readonly page: Page) {}

  async trocarPara(perfil: 'TAE' | 'Gestor Financeiro' | 'Direção Fundação'): Promise<void> {
    const menu = this.page.getByRole('button', { name: /Example icon-button/ });
    await menu.click();
    const nomePerfil = perfil === 'TAE'
      ? 'Tae.*Técnico Administrativo'
      : perfil === 'Direção Fundação'
        ? 'Direção.*Fundação'
        : 'Gestor Financeiro';
    const radio = this.page.getByRole('radio', { name: new RegExp(nomePerfil, 'i') });
    await radio.scrollIntoViewIfNeeded();
    await expect(radio).toBeVisible({ timeout: 10_000 });
    await radio.check();
    await expect(menu).toContainText(new RegExp(perfil === 'TAE' ? 'Tae' : nomePerfil, 'i'));
  }
}
