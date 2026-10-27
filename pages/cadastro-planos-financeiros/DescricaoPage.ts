import { expect, Page } from '@playwright/test';
import { sharedData } from '../../test-data/shared.data';
import { descricaoData } from '../../test-data/descricao';

export type ConfiguracaoDescricao = {
  emExecucao: boolean;
  comFundacao: boolean;
};

export class DescricaoPage {
  constructor(private readonly page: Page) {}

  async preencher(config: ConfiguracaoDescricao): Promise<void> {
    const usuariosAssistentes = this.page.getByRole('combobox', {
      name: 'Usuários assistentes',
    });
    await usuariosAssistentes.click();
    await usuariosAssistentes.fill('');
    await usuariosAssistentes.pressSequentially(descricaoData.usuarioAssistenteBusca);
    const isabelaTerceirizada = this.page.getByRole('option', {
      name: /Isabela De Souza Neiva\s*\(65357\s*-\s*Servi(?:ço|co)\s+Terceirizado\)/i,
    });
    await expect(isabelaTerceirizada).toBeVisible({ timeout: 15_000 });
    await isabelaTerceirizada.click();
    await expect(
      this.page.getByText(descricaoData.usuarioAssistenteNome, {
        exact: true,
      }),
    ).toBeVisible();

    if (config.emExecucao) {
      await this.page.getByRole('checkbox', { name: 'Plano de Trabalho Financeiro em Execução' }).check();
    } else {
      await expect(
        this.page.getByRole('checkbox', { name: 'Plano de Trabalho Financeiro em Execução' }),
      ).not.toBeChecked();
    }

    await this.page
      .getByLabel('Objetivo(s) do Plano de Trabalho Financeiro')
      .fill(descricaoData.objetivo);
    await this.page.getByLabel('Entidade financiadora').click({ force: true });
    const bancoDoBrasil = this.page.getByRole('option', {
      name: 'Banco do Brasil',
      exact: true,
    });
    if (await bancoDoBrasil.count()) {
      await bancoDoBrasil.click();
    } else {
      await this.page
        .getByRole('option', {
          name: 'Caixa Econômica Federal',
          exact: true,
        })
        .click();
    }
    const valor = this.page.getByLabel('Valor disponibilizado para o Plano de Trabalho');
    await valor.fill('');
    await valor.pressSequentially(sharedData.valorPlano);
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

    await this.page.getByLabel('Início previsto').fill(sharedData.inicio);
    await this.page.getByLabel('Término previsto').fill(sharedData.fim);
  }

  async preencherDadosInstitucionais(): Promise<void> {
    await this.page.getByRole('radio', { name: 'Sim', exact: true }).last().check();
    await this.page.getByLabel('Referencial do valor da bolsa pelo concedente').fill(descricaoData.referencialBolsa);
    await this.page.getByLabel('Telefone Institucional').fill(descricaoData.telefoneInstitucional);
    await this.page.getByRole('button', { name: 'Próxima Etapa' }).click();
  }
}
