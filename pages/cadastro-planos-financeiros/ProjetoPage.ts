import { timeouts } from '../../config/timeouts';
import { ambienteData } from '../../test-data/ambientes';
import { expect, Page } from '@playwright/test';

export class ProjetoPage {
  constructor(private readonly page: Page) {}

  async selecionarNaturezaEProjeto(): Promise<void> {
    await this.page.getByRole('tab', { name: 'Dados do Projeto' }).click();
    const natureza = this.page.getByRole('combobox', { name: 'Natureza' });
    await expect(natureza).toBeVisible();
    if ((await natureza.innerText()).trim() !== ambienteData.natureza) {
      await expect(natureza).toBeEnabled();
      await natureza.focus();
      await natureza.press('Enter');
      await expect(natureza).toHaveAttribute('aria-expanded', 'true');
      const opcaoNatureza = this.page.getByRole('listbox').getByRole('option', {
        name: ambienteData.natureza,
        exact: true,
      });
      await expect(opcaoNatureza).toBeVisible();
      await opcaoNatureza.click();
    }
    await expect(natureza).toHaveText(ambienteData.natureza);
    await expect(natureza).toHaveAttribute('aria-expanded', 'false');
    const projeto = this.page.getByRole('combobox', { name: 'Projeto' });
    await projeto.click();
    await projeto.fill(ambienteData.projeto);
    const nomeProjeto = ambienteData.projeto.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const nomeComCodigoOpcional = new RegExp(`^(?:[A-Z]+\\d+-\\d{4}\\s*-\\s*)?${nomeProjeto}$`);
    const opcao = this.page.getByRole('option', { name: nomeComCodigoOpcional });
    await expect(opcao).toBeVisible({ timeout: timeouts.espera });
    await opcao.click();
    await expect(projeto).toHaveValue(nomeComCodigoOpcional);
  }

  async anexarExtrato(arquivo: string): Promise<void> {
    const chooser = this.page.waitForEvent('filechooser');
    await this.page.getByRole('button', { name: 'Selecionar arquivo', exact: true }).click();
    await (await chooser).setFiles(arquivo);
  }
}
