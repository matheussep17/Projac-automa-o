import { expect, Page } from '@playwright/test';

export class AvaliacaoPlanoPage {
  constructor(private readonly page: Page) {}

  async abrirPendentes(): Promise<void> {
    const card = this.page.getByText('Avaliar Novo Plano de Trabalho Financeiro', { exact: true }).first();
    if (!(await card.isVisible().catch(() => false))) {
      await this.page.goto('/projac/plano-trabalho-financeiro');
    }
    await card.click();
    await expect(this.page.getByText(/Pendentes de avalia/i)).toBeVisible();
  }

  private async abrirAvaliacao(codigo?: string): Promise<string> {
    const tabela = this.page.getByRole('table').first();
    await expect(tabela).not.toContainText('CARREGANDO', { timeout: 15_000 });
    const linhas = tabela.getByRole('row');
    const ultima = codigo
      ? linhas.filter({ hasText: codigo }).first()
      : linhas.filter({ hasText: /PTFPQ-\d+/ }).last();
    const proxima = this.page.getByRole('button', { name: /próxima|next/i });
    while ((!codigo || !(await ultima.count())) && await proxima.isVisible().catch(() => false) && !(await proxima.isDisabled().catch(() => true))) {
      await proxima.click();
      await expect(tabela).not.toContainText('CARREGANDO', { timeout: 15_000 });
    }
    await expect(ultima).toBeVisible();
    const codigoPlano = (await ultima.getByRole('cell').first().innerText()).trim();
    expect(codigoPlano).toMatch(/^PTFPQ-\d+$/);
    await ultima.getByRole('button', { name: /avaliar/i }).click();
    await expect(this.page.getByRole('heading', { name: 'Avaliar Plano de Trabalho Financeiro' })).toBeVisible();
    return codigoPlano;
  }

  private async preencherAprovacao(justificativa: string): Promise<void> {
    await this.page.getByRole('radio', { name: 'Aprovado', exact: true }).check();
    await this.page.getByRole('textbox', { name: 'Justificativa', exact: true }).fill(justificativa);
  }

  private async confirmarSalvamento(): Promise<void> {
    const confirmacao = this.page.getByRole('dialog');
    await expect(confirmacao).toBeVisible();
    await confirmacao.getByRole('button', { name: 'Sim', exact: true }).click();
  }

  async abrirParaEnvio(codigo?: string): Promise<string> {
    const codigoPlano = await this.abrirAvaliacao(codigo);
    await this.preencherAprovacao('Plano aprovado e pronto para criação do processo SEI.');
    return codigoPlano;
  }

  async avaliarUltimo(justificativa: string, arquivo?: string, codigoAlvo?: string): Promise<string> {
    const codigo = await this.abrirAvaliacao(codigoAlvo);
    if (arquivo) {
      const chooser = this.page.waitForEvent('filechooser');
      await this.page.getByRole('button', { name: /selecionar|anexar|arquivo/i }).click();
      await (await chooser).setFiles(arquivo);
    }
    await this.preencherAprovacao(justificativa);
    await this.page.getByRole('button', { name: 'Salvar', exact: true }).click();
    await this.confirmarSalvamento();
    await expect(this.page.getByText(/sucesso|avaliado/i).first()).toBeVisible({ timeout: 15_000 });
    return codigo;
  }

  async avaliarPendente(justificativa: string, codigoAlvo?: string): Promise<string> {
    const codigo = await this.abrirAvaliacao(codigoAlvo);
    await this.page.getByRole('radio', { name: /Pendente de ajuste/i }).check();
    await this.page.getByRole('textbox', { name: 'Justificativa', exact: true }).fill(justificativa);
    await this.page.getByRole('button', { name: 'Salvar', exact: true }).click();
    await this.confirmarSalvamento();
    await expect(this.page.getByText(/sucesso|avaliado/i).first()).toBeVisible({ timeout: 15_000 });
    return codigo;
  }

  async aprovar(justificativa: string, codigoAlvo?: string): Promise<string> {
    const codigo = await this.abrirAvaliacao(codigoAlvo);
    await this.preencherAprovacao(justificativa);
    await this.page.getByRole('button', { name: 'Salvar', exact: true }).click();
    await this.confirmarSalvamento();
    await expect(this.page.getByText(/sucesso|avaliado/i).first()).toBeVisible({ timeout: 15_000 });
    return codigo;
  }

  async enviarParaSei(): Promise<string> {
    await this.page.getByRole('button', { name: /Salvar e Criar Processo SEI/i }).click();
    await this.confirmarSalvamento();
    await expect(this.page.getByText(/sucesso/i).first()).toBeVisible();
    const mensagem = this.page.getByText(/processo.*foi criado com sucesso/i).first();
    await expect(mensagem).toBeVisible({ timeout: 10_000 });
    const texto = (await mensagem.textContent()) ?? '';
    const numero = texto.match(/\d{5}\.\d{6}\/\d{4}-\d{2}/)?.[0];
    expect(numero).toBeDefined();
    return numero!;
  }
}
