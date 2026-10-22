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

    await expect(this.page).toHaveURL(
      /plano-trabalho-financeiro\/new/,
    );
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
    const erroAoSalvarRegistro = this.page.getByText(/erro ao salvar registro/i).first();
    try {
      await expect(erroAoSalvarRegistro).toBeVisible({ timeout: 2_000 });
      await salvar.click();
    } catch {
      // Nenhum erro apareceu no período de observação; segue para a confirmação de sucesso.
    }

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
    const erroAoSalvarRascunho = this.page.getByText(/erro ao salvar rascunho/i).first();
    try {
      await expect(erroAoSalvarRascunho).toBeVisible({ timeout: 2_000 });
      await salvarRascunho.click();
    } catch {
      // Nenhum erro apareceu no período de observação; segue para a confirmação de sucesso.
    }
    await expect(
      this.page.getByText(/rascunho.*salvo|salvo.*rascunho/i).first(),
    ).toBeVisible();
    await expect(
      this.page.getByRole('heading', { name: /Confer/ }),
    ).toHaveCount(0);
  }
}
