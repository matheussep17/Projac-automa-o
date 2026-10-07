import { Page } from '@playwright/test';

export class DocumentoContratualPage {
  constructor(private readonly page: Page) {}

  async adicionarAcordoDeParceria(): Promise<void> {
    await this.page.getByText('Documento Contratual', { exact: true }).last().click();
    await this.page.getByRole('button', { name: 'Adicionar' }).click();
    await this.page.getByText('Acordo de Parceria', { exact: true }).click();
    await this.page.getByLabel('Número do instrumento').fill('AP-CT01');
    await this.page.getByLabel('Número do processo SEI').fill('23070.000001/2026-01');
    await this.page.getByLabel('Início da vigência do contrato').fill('07/10/2026');
    await this.page.getByLabel('Fim da vigência do contrato').fill('31/12/2026');
    await this.page.getByText('Não', { exact: true }).click();
    await this.page.getByLabel('Vice-coordenador').click();
    await this.page.getByRole('option').first().click();
    await this.page.getByLabel('Fiscal').click();
    await this.page.getByRole('option').first().click();
    const valorInstrumento = this.page.getByLabel('Valor do instrumento de formalização');
    await valorInstrumento.fill('');
    await valorInstrumento.pressSequentially('1000000');
    await this.page.getByRole('dialog').getByRole('button', { name: 'Adicionar' })
      .evaluate((button) => (button as HTMLButtonElement).click());
  }
}
