import { Page } from '@playwright/test';

export class CoordenacaoAprovacaoPage {
  constructor(private readonly page: Page) {}

  async preencherViceCoordenador(): Promise<void> {
    await this.page.getByRole('tab', { name: 'Dados do(a) Coordenador(a)' }).click();
    await this.page.getByRole('combobox', { name: 'Vice-Coordenador(a)' }).click({ force: true });
    await this.page.getByRole('option').first().click();
    await this.page.getByLabel('Matrícula SIAPE vice-coordenador(a)').fill('1866324');
    await this.page.getByLabel('E-mail vice-coordenador(a)').fill('vice.coordenador@ufg.br');
    await this.page.getByLabel('Telefone vice-coordenador(a)').fill('62988888888');
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
