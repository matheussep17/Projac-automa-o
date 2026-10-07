import { expect, Page } from '@playwright/test';

export class QuadroPessoalPage {
  constructor(private readonly page: Page) {}

  async adicionarBolsista(valorMensal: string): Promise<void> {
    await this.page.getByRole('combobox', { name: 'Tipos de participantes relacionados a este Plano de Trabalho Financeiro' }).click({ force: true });
    await this.page.getByRole('option', { name: 'Bolsista', exact: true }).click();
    await this.page.keyboard.press('Escape');
    await this.page.getByRole('button', { name: 'Adicionar' }).click();
    await this.page.getByRole('combobox', { name: 'Tipo de participante', exact: true }).press('Enter');
    await this.page.getByRole('combobox', { name: 'Instituição de vinculação' }).click({ force: true });
    await this.page.getByRole('combobox', { name: 'Instituição de vinculação' }).press('Enter');
    await this.page.getByRole('option', { name: 'Universidade Federal de Goiás', exact: true }).click({ force: true });
    await this.page.getByRole('combobox', { name: 'Beneficiário' }).click({ force: true });
    await this.page.getByRole('combobox', { name: 'Beneficiário' }).press('Enter');
    await this.page.getByRole('option', { name: 'Servidor', exact: true }).click();
    await this.page.getByRole('combobox', { name: 'Nome do participante' }).click({ force: true });
    await this.page.getByRole('combobox', { name: 'Nome do participante' }).press('Enter');
    await this.page.getByRole('option', { name: /1866324\s*-\s*Abadia Dos Reis Nascimento/ }).click();
    await pageEscape(this.page);
    await this.page.getByRole('combobox', { name: 'Escolaridade e/ou Experiência' }).click({ force: true });
    await this.page.getByRole('combobox', { name: 'Escolaridade e/ou Experiência' }).press('ArrowDown');
    await this.page.getByRole('combobox', { name: 'Escolaridade e/ou Experiência' }).press('Enter');
    await this.page.getByLabel('Quantidade de meses').fill('1');
    const periodo = this.page.getByRole('group', { name: 'Período *' }).getByRole('textbox');
    for (const input of [periodo.first(), periodo.last()]) {
      await input.evaluate((element) => element.removeAttribute('readonly'));
      await input.fill('');
      await input.pressSequentially('102026');
      await input.press('Tab');
    }
    await this.page.getByLabel('Quantidade de bolsas').fill('1');
    await this.page.getByLabel('Carga horária mensal').fill('20');
    const mensal = this.page.getByLabel('Valor mensal');
    await mensal.fill('');
    await mensal.pressSequentially(valorMensal);
    await expect(this.page.getByLabel('Valor total')).toHaveValue(/9\.900,00|10\.000,00/);
    await this.page.keyboard.press('Escape');
    const adicionar = this.page.getByRole('dialog', { name: 'Adicionar Participante' }).getByRole('button', { name: 'Adicionar' });
    await adicionar.evaluate((button) => (button as HTMLButtonElement).click());
    await expect(this.page.getByRole('dialog', { name: 'Adicionar Participante' })).toBeHidden({ timeout: 10_000 });
    await this.page.getByLabel('Justificar os valores dos salários indicando os seus referenciais:').fill('Valor definido conforme a disponibilidade da sub-rubrica de Bolsas.');
    await this.page.getByLabel('Relatar a forma de seleção dos bolsistas:').fill('Seleção realizada conforme os critérios acadêmicos e institucionais do projeto.');
  }

  async validarEAvancar(): Promise<void> {
    await expect(this.page.getByRole('row', { name: /Abadia Dos Reis Nascimento.*Bolsista/ })).toContainText('20 mensal');
    await this.page.getByRole('button', { name: 'Próxima Etapa' }).click();
  }
}

async function pageEscape(page: Page): Promise<void> {
  await page.keyboard.press('Escape');
}
