import { expect, Page } from '@playwright/test';

export type ConfiguracaoDescricao = {
  emExecucao: boolean;
  comFundacao: boolean;
};

export class DescricaoPage {
  constructor(private readonly page: Page) {}

  async preencher(config: ConfiguracaoDescricao): Promise<void> {
    if (config.emExecucao) {
      await this.page.getByRole('checkbox', { name: 'Plano de Trabalho Financeiro em Execução' }).check();
    } else {
      await expect(this.page.getByRole('checkbox', { name: 'Plano de Trabalho Financeiro em Execução' })).not.toBeChecked();
    }

    await this.page.getByLabel('Objetivo(s) do Plano de Trabalho Financeiro').fill(
      'Executar atividades de pesquisa e desenvolvimento para aprimoramento institucional.',
    );
    await this.page.getByLabel('Entidade financiadora').click({ force: true });
    await this.page.getByRole('option', { name: 'Banco do Brasil', exact: true }).click();
    const valor = this.page.getByLabel('Valor disponibilizado para o Plano de Trabalho');
    await valor.fill('');
    await valor.pressSequentially('1000000');
    await expect(valor).toHaveValue(/10\.000,00/);
    await this.page.getByRole('radio', { name: 'Público', exact: true }).check();

    await this.page.getByLabel('Tipo do instrumento do recurso financeiro').click({ force: true });
    await this.page.getByRole('option', { name: 'TED', exact: true }).click();
    await this.page.getByLabel('Tipo do recurso financeiro').click({ force: true });
    await this.page.getByRole('combobox', { name: 'Tipo do recurso financeiro' }).press('Enter');
    await this.page.getByRole('option', { name: 'Ministérios', exact: true }).click();

    await this.page.getByLabel('Será gerido por Fundação').click({ force: true });
    await this.page.getByRole('combobox', { name: 'Será gerido por Fundação' }).press('Enter');
    await this.page.getByRole('option', { name: config.comFundacao ? 'Sim' : 'Não', exact: true }).click();
    if (config.comFundacao) {
      await this.page.getByLabel('Fundação', { exact: true }).click({ force: true });
      await this.page.getByRole('combobox', { name: 'Fundação', exact: true }).press('Enter');
      await this.page.getByRole('option', { name: 'Fundação de Apoio à Pesquisa', exact: true }).click();
    } else {
      await expect(this.page.getByLabel('Fundação', { exact: true })).toBeHidden();
    }

    await this.page.getByLabel('Início previsto').fill('07/10/2026');
    await this.page.getByLabel('Término previsto').fill('31/12/2026');
  }

  async preencherDadosInstitucionais(): Promise<void> {
    await this.page.getByRole('radio', { name: 'Sim', exact: true }).last().check();
    await this.page.getByLabel('Referencial do valor da bolsa pelo concedente').fill('500');
    await this.page.getByLabel('Telefone Institucional').fill('5562999999999');
    await this.page.getByRole('button', { name: 'Próxima Etapa' }).click();
  }
}
