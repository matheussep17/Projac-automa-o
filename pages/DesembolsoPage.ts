import { Page } from '@playwright/test';
import { desembolsoData } from '../test-data/desembolso.data';
import { sharedData } from '../test-data/shared.data';

export class DesembolsoPage {
  constructor(private readonly page: Page) {}

  async adicionarParcela(): Promise<void> {
    await this.page.getByLabel('Detalhamento da receita').fill(desembolsoData.detalhamentoReceita);
    await this.page.getByRole('button', { name: 'Adicionar' }).click();
    await this.page.getByLabel('Parcela').fill(desembolsoData.parcela);
    await this.page.getByLabel('Início da Execução Financeira').fill(sharedData.inicio);
    const valorDesembolso = this.page.getByRole('textbox', { name: 'Valor', exact: true });
    await valorDesembolso.fill('');
    await valorDesembolso.pressSequentially(desembolsoData.valor);
    await this.page.getByRole('dialog').getByRole('button', { name: 'Adicionar' }).click();
    await this.page.getByRole('button', { name: 'Próxima Etapa' }).click();
  }
}
