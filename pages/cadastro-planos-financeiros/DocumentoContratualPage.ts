import { Page } from '@playwright/test';
import { sharedData } from '../../test-data/shared.data';
import { documentoContratualData } from '../../test-data/documento-contratual.data';

export class DocumentoContratualPage {
  constructor(private readonly page: Page) {}

  async adicionarAcordoDeParceria(numeroProcessoSei = documentoContratualData.numeroProcessoSei): Promise<void> {
    await this.page.getByText('Documento Contratual', { exact: true }).last().click();
    await this.page.getByRole('button', { name: 'Adicionar' }).click();
    await this.page.getByText('Acordo de Parceria', { exact: true }).click();
    await this.page.getByLabel('Número do instrumento').fill(documentoContratualData.numeroInstrumento);
    await this.page.getByLabel('Número do processo SEI').fill(numeroProcessoSei);
    await this.page.getByLabel('Início da vigência do contrato').fill(sharedData.inicio);
    await this.page.getByLabel('Fim da vigência do contrato').fill(sharedData.fim);
    await this.page.getByText('Não', { exact: true }).click();
    await this.page.getByLabel('Vice-coordenador').click();
    await this.page.getByRole('option').first().click();
    await this.page.getByLabel('Fiscal').click();
    await this.page.getByRole('option').first().click();
    const valorInstrumento = this.page.getByLabel('Valor do instrumento de formalização');
    await valorInstrumento.fill('');
    await valorInstrumento.pressSequentially(sharedData.valorPlano);
    await this.page
      .getByRole('dialog')
      .getByRole('button', { name: 'Adicionar' })
      .evaluate((button) => (button as HTMLButtonElement).click());
  }

  async preencherProcessoSei(processoSei: string): Promise<void> {
    await this.page.getByText('Documento Contratual', { exact: true }).last().click();
    const campo = this.page.getByLabel('Número do processo SEI');
    if (await campo.count()) {
      await campo.fill(processoSei);
      await this.page.getByRole('button', { name: /salvar|adicionar/i }).last().click();
    }
  }
}
