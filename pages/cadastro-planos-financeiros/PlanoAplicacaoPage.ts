import { expect, Page } from '@playwright/test';
import { planoAplicacaoData } from '../../test-data';

export class PlanoAplicacaoPage {
  constructor(private readonly page: Page) {}

  async preencher(comFundacao: boolean): Promise<void> {
    await this.page.getByLabel('Justificativa').fill(planoAplicacaoData.justificativa);
    const dao = this.page.getByLabel('Valor DAO a ser aplicado');
    if (comFundacao) {
      await dao.fill('');
      await dao.pressSequentially(planoAplicacaoData.valorDao);
      await expect(dao).toHaveValue(this.valorMonetarioEsperado(planoAplicacaoData.valorDao));
    } else {
      await expect(dao).toBeDisabled();
    }

    await this.page.getByRole('button', { name: 'Adicionar' }).click();
    await this.page.getByRole('combobox', { name: 'Rubrica', exact: true }).first().click({ force: true });
    await this.page.getByRole('option', { name: 'Pessoal, encargos sociais e benefícios', exact: true }).click();
    await this.page.getByRole('combobox', { name: 'Rubrica', exact: true }).nth(1).click({ force: true });
    await this.page.getByRole('option', { name: 'Bolsas', exact: true }).click();
    const valor = this.page.getByRole('textbox', { name: 'Valor da Sub-rubrica', exact: true });
    await valor.fill('');
    const valorBolsas = comFundacao ? planoAplicacaoData.valorComFundacao : planoAplicacaoData.valorSemFundacao;
    await valor.pressSequentially(valorBolsas);
    await expect(valor).toHaveValue(this.valorMonetarioEsperado(valorBolsas));
    await this.page.getByRole('button', { name: 'Adicionar', exact: true }).last().click();

    const cipUfg = this.page.getByRole('textbox', { name: 'Custos indiretos para a UFG' });
    const cipUnidade = this.page.getByRole('textbox', { name: 'Custos indiretos para a UA/Órgão' });
    await cipUfg.fill('');
    await cipUfg.pressSequentially(planoAplicacaoData.zero);
    await cipUnidade.fill('');
    await cipUnidade.pressSequentially(planoAplicacaoData.zero);
    await this.page.getByRole('button', { name: 'Próxima Etapa' }).click();
  }

  private valorMonetarioEsperado(centavos: string): RegExp {
    const valor = (Number(centavos) / 100).toLocaleString('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
    return new RegExp(`(?:^|\\s)${valor.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`);
  }
}
