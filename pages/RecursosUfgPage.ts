import { Page } from '@playwright/test';

export class RecursosUfgPage {
  constructor(private readonly page: Page) {}

  async preencher(): Promise<void> {
    await this.page.getByRole('button', { name: 'Próxima Etapa' }).click();
    await this.page.getByLabel('Justificativa').fill('Não se aplica ao cenário.');
    await this.page.getByRole('button', { name: 'Adicionar' }).click();
    await this.page.getByLabel('Quantidade').fill('1');
    await this.page.getByLabel('Descrição dos Recursos das IFES (Equipamentos, Laboratórios, Salas etc.)').fill(
      'Recursos institucionais da UFG utilizados na execução do projeto.',
    );
    await this.page.getByRole('dialog').getByRole('button', { name: 'Adicionar' }).click();
    await this.page.getByRole('button', { name: 'Próxima Etapa' }).click();
  }
}
