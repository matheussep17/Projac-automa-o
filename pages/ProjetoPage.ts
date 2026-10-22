import { expect, Page } from '@playwright/test';

export class ProjetoPage {
  constructor(private readonly page: Page) {}

  async selecionarNaturezaEProjeto(): Promise<void> {
    await this.page.getByRole('tab', { name: 'Dados do Projeto' }).click();
    const natureza = this.page.getByRole('combobox', { name: 'Natureza' });
    const pesquisa = this.page.getByRole('option', { name: 'Pesquisa', exact: true });
    let naturezaAberta = false;
    for (let tentativa = 0; tentativa < 3 && !naturezaAberta; tentativa += 1) {
      await natureza.click();
      await natureza.press('ArrowDown');
      naturezaAberta = await pesquisa.isVisible().catch(() => false);
    }
    await expect(pesquisa).toBeVisible({ timeout: 10_000 });
    await pesquisa.click();
    const projeto = this.page.getByRole('combobox', { name: 'Projeto' });
    await projeto.click();
    // O projeto é definido pelo primeiro resultado retornado pelo ambiente de teste.
    const primeiraOpcaoProjeto = this.page.getByRole('option').first();
    await expect(primeiraOpcaoProjeto).toBeVisible();
    await primeiraOpcaoProjeto.click();
    await expect(projeto).toHaveValue(/.+/);
  }

  async anexarExtrato(arquivo: string): Promise<void> {
    const chooser = this.page.waitForEvent('filechooser');
    await this.page.getByRole('button', { name: 'Selecionar arquivo', exact: true }).click();
    await (await chooser).setFiles(arquivo);
  }
}
