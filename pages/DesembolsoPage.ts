import { Page } from '@playwright/test';

export class DesembolsoPage {
  constructor(private readonly page: Page) {}

  async adicionarParcela(): Promise<void> {
    await this.page.getByLabel('Detalhamento da receita').fill('Repasse para execução das atividades do projeto');
    await this.page.getByRole('button', { name: 'Adicionar' }).click();
    await this.page.getByLabel('Parcela').fill('1');
    await this.page.getByLabel('Início da Execução Financeira').fill('07/10/2026');
    const valorDesembolso = this.page.getByRole('textbox', { name: 'Valor', exact: true });
    await valorDesembolso.fill('');
    await valorDesembolso.pressSequentially('1000000');
    await this.page.getByRole('dialog').getByRole('button', { name: 'Adicionar' }).click();
    await this.page.getByRole('button', { name: 'Próxima Etapa' }).click();
  }
}
