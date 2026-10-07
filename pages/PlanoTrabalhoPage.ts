import { expect, Page } from '@playwright/test';
import { loginAsTae } from '../outputs/auth';

export class PlanoTrabalhoPage {
  constructor(private readonly page: Page) {}

  async iniciarCadastro(): Promise<void> {
    await loginAsTae(this.page);
    await this.abrirCadastro();
  }

  async abrirCadastro(): Promise<void> {
    await this.page.getByText('Cadastrar Plano de Trabalho Financeiro', { exact: true }).first().click();
    await expect(this.page).toHaveURL(/plano-trabalho-financeiro\/new/);
  }

  async conferirESalvar(): Promise<void> {
    await this.page.getByRole('button', { name: 'Conferir Dados', exact: true }).click();
    await expect(this.page.getByRole('heading', { name: 'Conferência de Dados' })).toBeVisible();
    await this.page.getByRole('button', { name: /^Salvar$/ }).click();
    await expect(this.page.getByText('Registro salvo com sucesso!', { exact: true })).toBeVisible();
  }
}
