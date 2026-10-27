import { Page } from '@playwright/test';
import { cronogramaData } from '../../test-data/cronograma.data';
import { sharedData } from '../../test-data/shared.data';

export class CronogramaPage {
  constructor(private readonly page: Page) {}

  async adicionarEtapa(): Promise<void> {
    await this.page.getByRole('button', { name: 'Adicionar' }).click();
    await this.page.getByLabel('Etapa').fill(cronogramaData.etapa);
    await this.page.getByLabel('Descricao').fill(cronogramaData.descricaoEtapa);
    await this.page.getByLabel('Unidade de Tempo').click({ force: true });
    await this.page.getByRole('combobox', { name: 'Unidade de Tempo' }).press('ArrowDown');
    await this.page.getByRole('combobox', { name: 'Unidade de Tempo' }).press('Enter');
    await this.page.getByLabel('Quantidade').fill(cronogramaData.quantidade);
    await this.page.getByLabel('Início Previsto').fill(sharedData.inicio);
    await this.page.getByLabel('Término Previsto').fill(sharedData.fim);
    await this.page.getByRole('dialog').getByRole('button', { name: 'Adicionar' }).click();
    await this.page.getByRole('button', { name: 'Próxima Etapa' }).click();
  }
}
