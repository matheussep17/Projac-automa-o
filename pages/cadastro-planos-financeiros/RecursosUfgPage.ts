import { Page } from '@playwright/test';
import { recursosUfgData } from '../../test-data/recursos-ufg.data';

export class RecursosUfgPage {
  constructor(private readonly page: Page) {}

  async preencher(): Promise<void> {
    await this.page.getByRole('button', { name: 'Próxima Etapa' }).click();
    await this.page.getByLabel('Justificativa').fill(recursosUfgData.justificativa);
    await this.page.getByRole('button', { name: 'Adicionar' }).click();
    await this.page.getByLabel('Quantidade').fill(recursosUfgData.quantidade);
    await this.page
      .getByLabel('Descrição dos Recursos das IFES (Equipamentos, Laboratórios, Salas etc.)')
      .fill(recursosUfgData.descricao);
    await this.page.getByRole('dialog').getByRole('button', { name: 'Adicionar' }).click();
    await this.page.getByRole('button', { name: 'Próxima Etapa' }).click();
  }
}
