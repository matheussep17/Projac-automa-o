import { expect, Locator, Page } from '@playwright/test';

export class RemanejamentoPage {
  constructor(private readonly page: Page) {}

  async abrirPlanoNaLista(codigo: string): Promise<Locator> {
    await this.page.goto('/projac/plano-trabalho-financeiro');
    await this.page.getByText('Gerenciar Plano de Trabalho Financeiro', { exact: true }).first().click();
    await this.page.getByRole('button', { name: 'Filtros', exact: true }).click();
    await this.page.getByRole('textbox', { name: /código.*plano/i }).fill(codigo);
    await this.page.getByRole('button', { name: 'Filtrar', exact: true }).click();
    const linha = this.page.getByRole('row').filter({
      has: this.page.getByRole('cell', { name: codigo, exact: true }),
    });
    await expect(linha).toBeVisible({ timeout: 15_000 });
    return linha;
  }

  async solicitar(codigo: string): Promise<void> {
    const linha = await this.abrirPlanoNaLista(codigo);
    await expect(linha.getByRole('cell', { name: 'Em execução', exact: true })).toBeVisible();
    await linha.getByRole('button', { name: 'Solicitar Remanejamento', exact: true }).click();
    await expect(this.page.getByRole('heading', { name: 'Alterar Plano de Trabalho Financeiro', exact: true })).toBeVisible();
  }

  async salvarSolicitacao(justificativa: string): Promise<void> {
    await this.page.getByRole('button', { name: 'Conferir Dados', exact: true }).click();
    await expect(this.page.getByRole('heading', { name: 'Conferência de Dados', exact: true })).toBeVisible();
    await this.page.getByRole('textbox', { name: 'Justificativa das Alterações', exact: true }).fill(justificativa);
    await this.page.getByRole('button', { name: 'Solicitar Alteração', exact: true }).click();
    await this.confirmar();
    await expect(this.page.getByText(/sucesso/i).first()).toBeVisible();
  }

  async abrirAvaliacao(codigo: string): Promise<void> {
    await this.page.goto('/projac/plano-trabalho-financeiro');
    await this.page.getByText('Avaliação de Alterações', { exact: true }).first().click();
    await expect(this.page.getByRole('tab', { name: 'Pendente', exact: true })).toHaveAttribute('aria-selected', 'true');
    const tabela = this.page.getByRole('tabpanel', { name: 'Pendente', exact: true }).getByRole('table');
    const linha = tabela.getByRole('row').filter({
      has: this.page.getByRole('cell', { name: codigo, exact: true }),
    });
    const proxima = this.page.getByRole('button', { name: 'Próxima Página', exact: true });
    await expect(tabela).not.toContainText('CARREGANDO', { timeout: 15_000 });
    while (!(await linha.count()) && await proxima.isEnabled()) {
      const anterior = await tabela.innerText();
      await proxima.click();
      await expect(tabela).not.toHaveText(anterior);
      await expect(tabela).not.toContainText('CARREGANDO', { timeout: 15_000 });
    }
    if (!(await linha.count())) {
      // A solicitação pode levar alguns segundos para entrar na fila do
      // avaliador após o salvamento feito pelo TAE.
      await expect.poll(
        async () => {
          if (await linha.count()) return true;
          await this.page.goto('/projac/plano-trabalho-financeiro');
          await this.page.getByText('Avaliação de Alterações', { exact: true }).first().click();
          await expect(this.page.getByRole('tab', { name: 'Pendente', exact: true })).toHaveAttribute('aria-selected', 'true');
          const tabelaAtualizada = this.page.getByRole('tabpanel', { name: 'Pendente', exact: true }).getByRole('table');
          await expect(tabelaAtualizada).not.toContainText('CARREGANDO', { timeout: 15_000 });
          return (await tabelaAtualizada.getByRole('row').filter({ has: this.page.getByRole('cell', { name: codigo, exact: true }) }).count()) > 0;
        },
        { timeout: 15_000, intervals: [500, 1_000, 2_000] },
      ).toBe(true);
    }
    await expect(linha).toBeVisible({ timeout: 15_000 });
    await linha.getByRole('button', { name: 'Avaliar', exact: true }).click();
    await expect(this.page.getByRole('heading', { name: 'Avaliar Plano de Trabalho', exact: true })).toBeVisible();
  }

  async aprovarCronograma(justificativa: string): Promise<void> {
    const titulo = 'Cronograma Previsto para Execução Financeira';
    await this.page.getByRole('button', { name: titulo, exact: true }).click();
    const diferencas = this.page.getByRole('region', { name: titulo, exact: true });
    await expect(diferencas.getByRole('cell', { name: '12', exact: true })).toBeVisible();
    const aceitar = diferencas.getByRole('checkbox', { name: 'Aceitar diferenças', exact: true });
    await aceitar.check();
    await expect(aceitar).toBeChecked();
    await this.page.getByRole('radio', { name: 'Aprovado', exact: true }).check();
    await this.page.getByRole('textbox', { name: 'Justificativa', exact: true }).fill(justificativa);
  }

  async reprovarCronograma(justificativa: string): Promise<void> {
    await this.page.getByRole('button', { name: /Cronograma Previsto para Execu/ }).click();
    const diferencas = this.page.getByRole('region', { name: /Cronograma Previsto para Execu/ });
    await expect(diferencas.getByRole('cell', { name: '12', exact: true })).toBeVisible();
    await this.page.getByRole('radio', { name: 'Reprovado', exact: true }).check();
    await this.page.getByRole('textbox', { name: 'Justificativa', exact: true }).fill(justificativa);
  }

  async salvarAvaliacao(): Promise<void> {
    await this.page.getByRole('button', { name: /Atualizar|Salvar/i, exact: true }).click();
    await this.confirmar();
    await expect(this.page.getByText('Avaliação do Plano de Trabalho salvo(a) com sucesso!', { exact: true })).toBeVisible();
  }

  async enviarParaSei(): Promise<string> {
    const enviar = this.page.getByRole('button', { name: 'Enviar para o SEI', exact: true });
    // A tela recalcula o aceite das diferenças com debounce antes de habilitar o envio.
    await expect(enviar).toBeEnabled();
    await enviar.click();
    const [resposta] = await Promise.all([
      this.page.waitForResponse((response) =>
        response.request().method() === 'POST' &&
        new URL(response.url()).pathname.includes('/solicitacao-alteracao/enviar-plano-financeiro-para-sei/'),
      ),
      this.confirmar(),
    ]);
    const retorno = await resposta.text();
    expect(resposta.status(), `Falha ao enviar remanejamento ao SEI: ${retorno}`).toBe(200);
    const mensagem = this.page.getByText(/O Plano de Trabalho Financeiro foi enviado ao processo/i);
    await expect(mensagem).toBeVisible({ timeout: 15_000 });
    const processo = (await mensagem.innerText()).match(/\d{5}\.\d{6}\/\d{4}-\d{2}/)?.[0];
    expect(processo).toBeDefined();
    return processo!;
  }

  private async confirmar(): Promise<void> {
    const dialogo = this.page.getByRole('dialog');
    await expect(dialogo).toBeVisible();
    await dialogo.getByRole('button', { name: 'Sim', exact: true }).click();
    await expect(dialogo).toBeHidden();
  }
}
