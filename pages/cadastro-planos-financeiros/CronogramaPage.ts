import { expect, Page } from '@playwright/test';
import { cronogramaData } from '../../test-data/cronograma.data';
import { sharedData } from '../../test-data/shared.data';

export class CronogramaPage {
  constructor(private readonly page: Page) {}

  async alterarEtapa(atual: string, nova: string): Promise<void> {
    await this.page.getByText('Cronograma', { exact: true }).click();
    await expect(this.page.getByRole('heading', { name: 'Cronograma', exact: true })).toBeVisible();
    const linha = this.page.getByRole('row').filter({
      has: this.page.getByRole('cell', { name: atual, exact: true }),
    });
    await linha.getByRole('button', { name: 'Editar', exact: true }).click();
    const dialogo = this.page.getByRole('dialog');
    await dialogo.getByRole('spinbutton', { name: 'Etapa', exact: true }).fill(nova);
    const inicio = dialogo.getByRole('textbox', { name: 'Início Previsto', exact: true });
    const termino = dialogo.getByRole('textbox', { name: 'Término Previsto', exact: true });
    const inicioOriginal = await inicio.inputValue();
    const terminoOriginal = await termino.inputValue();
    // O campo carregado aparece inválido. Alterar o dia para 08 e restaurar 07 revalida a data.
    await inicio.fill(inicioOriginal.replace(/^\d{2}/, '08'));
    await inicio.fill(inicioOriginal);
    // A mudança do início recalcula o término; preservamos o período cadastrado.
    await termino.fill(terminoOriginal);
    await dialogo.getByRole('button', { name: /Atualizar|Adicionar/i, exact: true }).click({ timeout: 15_000 });
    await expect(dialogo).toBeHidden();
    const alterada = this.page.getByRole('row').filter({
      has: this.page.getByRole('cell', { name: nova, exact: true }),
    });
    await expect(alterada).toContainText(inicioOriginal);
    await expect(alterada).toContainText(terminoOriginal);
  }

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
