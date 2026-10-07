import { Page } from '@playwright/test';

export class CronogramaPage {
  constructor(private readonly page: Page) {}

  async adicionarEtapa(): Promise<void> {
    await this.page.getByRole('button', { name: 'Adicionar' }).click();
    await this.page.getByLabel('Etapa').fill('1');
    await this.page.getByLabel('Descricao').fill('Planejamento e execução da pesquisa');
    await this.page.getByLabel('Unidade de Tempo').click({ force: true });
    await this.page.getByRole('combobox', { name: 'Unidade de Tempo' }).press('ArrowDown');
    await this.page.getByRole('combobox', { name: 'Unidade de Tempo' }).press('Enter');
    await this.page.getByLabel('Quantidade').fill('1');
    await this.page.getByLabel('Início Previsto').fill('07/10/2026');
    await this.page.getByLabel('Término Previsto').fill('31/12/2026');
    await this.page.getByRole('dialog').getByRole('button', { name: 'Adicionar' }).click();
    await this.page.getByRole('button', { name: 'Próxima Etapa' }).click();
  }
}
