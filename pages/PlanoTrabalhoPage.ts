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

    await this.page
      .getByRole('button', {
        name: /^Salvar$/,
      })
      .click();

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
    await expect(
      this.page.getByText(/rascunho.*salvo|salvo.*rascunho/i).first(),
    ).toBeVisible();
    await expect(
      this.page.getByRole('heading', { name: /Confer/ }),
    ).toHaveCount(0);
  }
}
