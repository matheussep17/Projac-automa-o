import { expect, Page } from '@playwright/test';

export class PlanoTrabalhoPage {
  constructor(private readonly page: Page) {}

  async iniciarCadastro(): Promise<void> {
    await this.abrirCadastro();
  }

  async abrirCadastro(): Promise<void> {
    await this.page
      .getByText('Cadastrar Plano de Trabalho Financeiro', {
        exact: true,
      })
      // O card expõe o mesmo texto no span interno e no conteúdo do card.
      .first()
      .click();

    await expect(this.page).toHaveURL(/plano-trabalho-financeiro\/new/);
  }

  async conferirESalvar(): Promise<void> {
    const conferirDados = this.page.getByRole('button', {
      name: 'Conferir Dados',
      exact: true,
    });
    const conferencia = this.page.getByRole('heading', {
      name: /Confer.*ncia de Dados/i,
      exact: true,
    });

    await expect(conferencia.or(conferirDados).first()).toBeVisible();
    if (!(await conferencia.isVisible())) {
      await conferirDados.click();
    }
    await expect(conferencia).toBeVisible();

    const salvar = this.page.getByRole('button', {
      name: /^Salvar$/,
    });
    await salvar.click();

    await expect(
      this.page.getByText('Registro salvo com sucesso!', {
        exact: true,
      }),
    ).toBeVisible();
  }

  async salvarRascunho(): Promise<void> {
    const salvarRascunho = this.page.getByRole('button', {
      name: /salvar.*rascunho|rascunho.*salvar/i,
    });

    await expect(salvarRascunho).toBeVisible();
    await salvarRascunho.click();
    await expect(this.page.getByText(/rascunho.*salvo|salvo.*rascunho/i).first()).toBeVisible();
    await expect(this.page.getByRole('heading', { name: /Confer/ })).toHaveCount(0);
  }

  async editarPlanoPorCodigo(codigo: string): Promise<void> {
    await this.page.goto('/projac/plano-trabalho-financeiro');
    await this.page
      .getByText(/Gerenciar.*Repercussão|Gerenciar Plano de Trabalho Financeiro/i)
      .first()
      .click();
    await expect(this.page.getByRole('table').first()).toBeVisible();
    await expect(this.page.getByRole('table').first()).not.toContainText('CARREGANDO', { timeout: 15_000 });
    await this.page.getByRole('button', { name: 'Filtros', exact: true }).click();
    const filtro = this.page.getByRole('textbox', { name: /código.*plano|c[oó]digo/i }).first();
    await expect(filtro).toBeVisible();
    await filtro.fill(codigo);
    await filtro.press('Enter');
    await expect(this.page.getByRole('table').first()).not.toContainText('CARREGANDO', { timeout: 15_000 });
    const tabela = this.page.getByRole('table').first();
    let linha = tabela.getByRole('row').filter({ hasText: codigo }).first();
    const proxima = this.page.getByRole('button', { name: /Próxima Página|próxima|next/i });
    while (
      !(await linha.count()) &&
      (await proxima.isVisible().catch(() => false)) &&
      !(await proxima.isDisabled().catch(() => true))
    ) {
      await proxima.click();
      await expect(tabela).not.toContainText('CARREGANDO', { timeout: 15_000 });
      linha = tabela.getByRole('row').filter({ hasText: codigo }).first();
    }
    await expect(linha).toBeVisible({ timeout: 10_000 });
    const realizarEdicao = linha.getByRole('button', { name: /Realizar EdiÃ§Ã£o|Realizar Edição/i });
    if (await realizarEdicao.isEnabled().catch(() => false)) {
      await realizarEdicao.click({ timeout: 10_000 });
    } else {
      await linha
        .getByRole('button', { name: /Visualizar AvaliaÃ§Ã£o|Visualizar Avaliação/i })
        .click({ force: true, noWaitAfter: true, timeout: 10_000 });
      await expect(
        this.page.getByRole('button', { name: 'Editar Plano de Trabalho Financeiro', exact: true }),
      ).toBeVisible();
      await this.page.getByRole('button', { name: 'Editar Plano de Trabalho Financeiro', exact: true }).click();
    }
    await expect(this.page.getByText('Documento Contratual', { exact: true }).last()).toBeVisible();
  }

  async filtrarPlanoEmExecucao(codigo?: string): Promise<void> {
    const botaoFiltros = this.page.getByRole('button', { name: 'Filtros', exact: true });
    const filtroCodigo = codigo ? this.page.getByRole('textbox', { name: /c[oó]digo.*plano/i }).first() : undefined;
    if (filtroCodigo && !(await filtroCodigo.isVisible().catch(() => false))) {
      await botaoFiltros.click();
    }
    const filtro = this.page.getByRole('combobox', { name: /filtro|situação|status/i }).first();
    if (codigo) {
      const filtroCodigo = this.page.getByRole('textbox', { name: /c[oó]digo.*plano/i }).first();
      await expect(filtroCodigo).toBeVisible();
      await filtroCodigo.fill(codigo);
      await filtroCodigo.press('Enter');
    }
    if (await filtro.count()) {
      await filtro.click();
      await this.page.getByRole('option', { name: /em execução/i }).click();
      if (codigo) {
        await expect(
          this.page.getByRole('table').first().getByRole('row').filter({ hasText: codigo }).first(),
        ).toContainText(/em .*execu/i);
      }
    }
  }

  async filtrarPlanoReprovado(codigo: string): Promise<void> {
    await this.page.goto('/projac/plano-trabalho-financeiro');
    await this.page
      .getByText(/Gerenciar.*Plano de Trabalho Financeiro/i)
      .first()
      .click();
    await expect(this.page.getByRole('table').first()).toBeVisible();
    await expect(this.page.getByRole('table').first()).not.toContainText('CARREGANDO', { timeout: 15_000 });

    const filtros = this.page.getByRole('button', { name: 'Filtros', exact: true });
    const filtroCodigo = this.page.getByRole('textbox', { name: /c[oó]digo.*plano/i }).first();
    if (!(await filtroCodigo.isVisible().catch(() => false))) {
      await filtros.click();
    }
    await expect(filtroCodigo).toBeVisible();
    await filtroCodigo.fill(codigo);
    await filtroCodigo.press('Enter');
    await expect(this.page.getByRole('table').first()).not.toContainText('CARREGANDO', { timeout: 15_000 });

    const filtroSituacao = this.page.getByRole('combobox', { name: /filtro|situa[cç][aã]o|status/i }).first();
    await expect(filtroSituacao).toBeVisible();
    await filtroSituacao.click();
    await this.page.getByRole('option', { name: /reprovad/i }).click();

    const linha = this.page.getByRole('table').first().getByRole('row').filter({ hasText: codigo }).first();
    await expect(linha).toBeVisible({ timeout: 15_000 });
    await expect(linha).toContainText(/reprovad/i);
  }

  async filtrarPlanoAprovado(codigo: string): Promise<void> {
    await this.page.goto('/projac/plano-trabalho-financeiro');
    await this.page
      .getByText(/Gerenciar.*Plano de Trabalho Financeiro/i)
      .first()
      .click();
    await expect(this.page.getByRole('table').first()).toBeVisible();
    await expect(this.page.getByRole('table').first()).not.toContainText('CARREGANDO', { timeout: 15_000 });

    const filtros = this.page.getByRole('button', { name: 'Filtros', exact: true });
    const filtroCodigo = this.page.getByRole('textbox', { name: /código.*plano/i }).first();
    if (!(await filtroCodigo.isVisible().catch(() => false))) {
      await filtros.click();
    }
    await expect(filtroCodigo).toBeVisible();
    await filtroCodigo.fill(codigo);
    await filtroCodigo.press('Enter');
    await expect(this.page.getByRole('table').first()).not.toContainText('CARREGANDO', { timeout: 15_000 });

    const filtroSituacao = this.page.getByRole('combobox', { name: /filtro|situa[cç][aã]o|status/i }).first();
    await expect(filtroSituacao).toBeVisible();
    await filtroSituacao.click();
    await this.page.getByRole('option', { name: /aprovad/i }).click();

    const linha = this.page.getByRole('table').first().getByRole('row').filter({ hasText: codigo }).first();
    await expect(linha).toBeVisible({ timeout: 15_000 });
    await expect(linha).toContainText(/aprovad/i);
    await expect(linha).not.toContainText(/em .*execu/i);
  }

  async solicitarAlteracao(justificativa: string): Promise<void> {
    await this.page.getByRole('button', { name: 'Conferir Dados', exact: true }).click();
    await expect(this.page.getByRole('heading', { name: /Confer.*ncia de Dados/i })).toBeVisible();
    await this.page.getByRole('textbox', { name: 'Justificativa das Alterações', exact: true }).fill(justificativa);
    await this.page.getByRole('button', { name: 'Solicitar Alteração', exact: true }).click();
    const dialogo = this.page.getByRole('dialog');
    await expect(dialogo).toBeVisible();
    await dialogo.getByRole('button', { name: 'Sim', exact: true }).click();
    await expect(this.page.getByText(/sucesso/i).first()).toBeVisible({ timeout: 15_000 });
  }
}
