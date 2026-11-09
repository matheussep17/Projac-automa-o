import { timeouts } from '../../config/timeouts';
import { expect, Page } from '@playwright/test';

export type Perfil = 'TAE' | 'Gestor Financeiro' | 'Direção Fundação';

export class PerfilPage {
  constructor(private readonly page: Page) {}

  async trocarPara(perfil: Perfil): Promise<void> {
    const menu = this.page.getByRole('button', { name: /Example icon-button/ });
    await menu.click();
    const nomePerfil =
      perfil === 'TAE'
        ? 'Tae.*Técnico Administrativo'
        : perfil === 'Direção Fundação'
          ? 'Direção.*Fundação'
          : 'Gestor Financeiro';
    const radio = this.page.getByRole('radio', { name: new RegExp(nomePerfil, 'i') });
    await radio.scrollIntoViewIfNeeded();
    await expect(radio).toBeVisible({ timeout: timeouts.espera });
    if (!(await radio.isChecked())) {
      const [resposta] = await Promise.all([
        this.page.waitForResponse(response =>
          response.request().method() === 'POST' &&
          new URL(response.url()).pathname.endsWith('/perfil/sagui/define_perfil')),
        radio.check(),
      ]);
      expect(resposta.ok(), 'Troca de perfil deve ser aceita pelo servidor').toBe(true);
    }
    await expect(menu).toContainText(new RegExp(perfil === 'TAE' ? 'Tae' : nomePerfil, 'i'));
    await this.confirmarAtual(perfil);
    await this.page.keyboard.press('Escape');
  }

  async confirmarAtual(perfil: Perfil): Promise<void> {
    const nomes = {
      TAE: 'PROJAC_TAE',
      'Gestor Financeiro': 'PROJAC_GESTOR_FINANCEIRO',
      'Direção Fundação': 'PROJAC_DIRECAO_FUNDACAO',
    };
    await expect.poll(async () => {
      const gateway = await this.page.evaluate(() => {
        const menu = performance.getEntriesByType('resource').find(entry =>
          new URL(entry.name).pathname === '/comum-service/menu');
        return menu ? new URL(menu.name).origin : undefined;
      });
      expect(gateway, 'Gateway observado no carregamento do menu').toBeTruthy();
      const url = new URL('/projac-comum-service/projeto-academico/usuario-cas', gateway).href;
      const resposta = await this.page.request.get(url);
      expect(resposta.ok()).toBe(true);
      return (await resposta.json()).perfilAtual?.nome;
    }, { timeout: timeouts.espera, message: `Perfil ativo no servidor deve ser ${perfil}` }).toBe(nomes[perfil]);
  }
}
