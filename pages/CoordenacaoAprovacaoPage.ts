import { Page } from '@playwright/test';
import { sharedData } from '../test-data/shared.data';

export class CoordenacaoAprovacaoPage {
  constructor(private readonly page: Page) {}

  async preencherViceCoordenador(): Promise<void> {
    await this.page.getByRole('tab', { name: 'Dados do(a) Coordenador(a)' }).click();
    await this.page.getByRole('combobox', { name: 'Vice-Coordenador(a)' }).click({ force: true });
    await this.page.getByRole('option').first().click();
    await this.page.getByLabel('Matrícula SIAPE vice-coordenador(a)').fill(sharedData.matriculaViceCoordenador);
    await this.page.getByLabel('E-mail vice-coordenador(a)').fill(sharedData.emailViceCoordenador);
    await this.page.getByLabel('Telefone vice-coordenador(a)').fill(sharedData.telefoneViceCoordenador);
  }

  async preencherAprovacao(arquivo: string): Promise<void> {
    await this.page.getByRole('tab', { name: 'Dados da Aprovação' }).click();
    await this.page.getByRole('combobox', { name: 'Unidade de aprovação' }).click();
    await this.page.getByRole('option').first().click();
    const chooser = this.page.waitForEvent('filechooser');
    await this.page.getByRole('button', { name: /Selecionar arquivo|Alterar arquivo/ }).click();
    await (await chooser).setFiles(arquivo);
  }

  async avancar(): Promise<void> {
    await this.page.getByRole('button', { name: 'Próxima Etapa' }).click();
  }
}
