import { expect, Locator, Page } from '@playwright/test';

export class QuadroPessoalPage {
  constructor(private readonly page: Page) {}

  async adicionarBolsista(valorMensal: string): Promise<void> {
    const tipoParticipante = this.page.getByRole('combobox', {
      name: 'Tipos de participantes relacionados a este Plano de Trabalho Financeiro',
    });
    await this.selecionarOpcao(tipoParticipante, 'Bolsista');

    await this.page.getByRole('button', { name: 'Adicionar Participante', exact: true }).click();
    const dialog = this.page.getByRole('dialog', { name: 'Adicionar Participante' });
    await expect(dialog).toBeVisible();

    const tipo = dialog.getByRole('combobox', { name: 'Tipo de participante', exact: true });
    await this.selecionarOpcao(tipo, 'Bolsista');
    await expect(tipo).toContainText('Bolsista');

    const instituicao = dialog.getByRole('combobox', { name: 'Instituição de vinculação' });
    await this.selecionarOpcao(instituicao, 'Universidade Federal de Goiás');

    const beneficiario = dialog.getByRole('combobox', { name: 'Beneficiário' });
    await this.selecionarOpcao(beneficiario, 'Servidor');

    const nomeParticipante = dialog.getByRole('combobox', { name: 'Nome do participante' });
    await expect(nomeParticipante).toBeEnabled({ timeout: 10_000 });
    await nomeParticipante.fill('Abadia Dos Reis Nascimento');
    const participante = this.page.getByRole('listbox').getByRole('option', {
      name: /1866324\s*-\s*Abadia Dos Reis Nascimento/,
    });
    await expect(participante).toBeVisible({ timeout: 10_000 });
    await participante.click();
    await expect(nomeParticipante).toHaveValue(/Abadia Dos Reis Nascimento/);

    const escolaridade = dialog.getByRole('combobox', { name: 'Escolaridade e/ou Experiência' });
    await this.selecionarOpcao(escolaridade, /^(Ensino Superior|Superior Completo)$/);

    await dialog.getByLabel('Quantidade de meses').fill('1');
    const periodo = dialog.getByRole('group', { name: 'Período *' });
    const periodoInicio = periodo.locator('input:visible').first();
    await this.preencherPeriodo(periodoInicio, '10/2026');
    const periodoFim = periodo.locator('input:visible').last();
    await this.preencherPeriodo(periodoFim, '10/2026');
    await expect(periodoInicio).toHaveValue('10/2026');
    await expect(periodoFim).toHaveValue('10/2026');

    await dialog.getByLabel('Quantidade de bolsas').fill('1');
    await dialog.getByLabel('Carga horária mensal').fill('20');
    const valor = dialog.getByLabel('Valor mensal');
    await valor.fill('');
    await valor.pressSequentially(valorMensal);
    await valor.press('Tab');
    const valorEsperado = (Number(valorMensal) / 100).toLocaleString('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
    await expect(valor).toHaveValue(new RegExp(this.escaparRegex(valorEsperado) + '$'));
    await expect(dialog.getByLabel('Valor total')).toHaveValue(
      new RegExp(this.escaparRegex(valorEsperado) + '$'),
    );

    await dialog.getByRole('button', { name: 'Adicionar', exact: true }).click();
    await expect(dialog).toBeHidden({ timeout: 10_000 });
    await expect(this.linhaBolsista()).toContainText('20 mensal');

    await this.page
      .getByLabel('Justificar os valores dos salários indicando os seus referenciais:')
      .fill('Valor definido conforme a disponibilidade da sub-rubrica de Bolsas.');
    await this.page
      .getByLabel('Relatar a forma de seleção dos bolsistas:')
      .fill('Seleção realizada conforme os critérios acadêmicos e institucionais do projeto.');
  }

  async validarEAvancar(): Promise<void> {
    await expect(this.linhaBolsista()).toContainText('20 mensal');
    await this.page.getByRole('button', { name: 'Próxima Etapa' }).click();
  }

  private async selecionarOpcao(combobox: Locator, nomeOpcao: string | RegExp): Promise<void> {
    await expect(combobox).toBeEnabled({ timeout: 10_000 });
    // O rótulo do Material intercepta cliques no centro do select.
    await combobox.focus();
    await combobox.press('Enter');
    await expect(combobox).toHaveAttribute('aria-expanded', 'true');
    // Há duas opções "Ensino Superior"; preserva a primeira correspondência.
    const opcao = this.page.getByRole('listbox').getByRole('option', {
      name: nomeOpcao,
      exact: true,
    }).first();
    await expect(opcao).toBeVisible({ timeout: 10_000 });
    // Não desmarca uma opção já selecionada em um mat-select múltiplo.
    if ((await opcao.getAttribute('aria-selected')) !== 'true') {
      await opcao.click();
    }
    if ((await combobox.getAttribute('aria-expanded')) === 'true') {
      await combobox.press('Escape');
    }
    await expect(combobox).toHaveAttribute('aria-expanded', 'false');
    await expect(combobox).toContainText(nomeOpcao, { timeout: 10_000 });
  }

  private linhaBolsista(): Locator {
    return this.page
      .getByRole('row')
      .filter({ hasText: 'Abadia Dos Reis Nascimento' })
      .filter({ hasText: 'Bolsista' });
  }

  private escaparRegex(valor: string): string {
    return valor.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  private async preencherPeriodo(campo: Locator, valor: string): Promise<void> {
    await campo.focus();
    await campo.evaluate((element) => element.removeAttribute('readonly'));
    await campo.fill(valor);
    await campo.press('Tab');
    await expect(campo).toHaveValue(valor);
  }
}
