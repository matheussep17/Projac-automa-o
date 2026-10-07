import { test, expect } from '@playwright/test';
import path from 'node:path';
import { loginAsTae } from './auth';

test.describe('Plano de Trabalho Financeiro - repercussão financeira', () => {
  test('deve preencher, conferir e salvar o plano de trabalho financeiro', async ({ page }) => {
    const pdf = path.resolve('work/anexo-teste.pdf');

    await loginAsTae(page);
    await page.getByText('Cadastrar Plano de Trabalho Financeiro', { exact: true }).first().click();
    await expect(page).toHaveURL(/\/projac\/plano-trabalho-financeiro\/new/);

    // Projeto / aprovação
    await page.getByRole('tab', { name: 'Dados do Projeto' }).click();
    await page.getByRole('combobox', { name: 'Natureza' }).click();
    await page.getByRole('option', { name: 'Pesquisa', exact: true }).click();
    await page.getByRole('combobox', { name: 'Projeto' }).click();
    await page.getByRole('option').first().click();

    // Upload do extrato do projeto na aba Dados do Projeto.
    const extratoUpload = page.waitForEvent('filechooser');
    await page.getByRole('button', { name: 'Selecionar arquivo', exact: true }).click();
    await (await extratoUpload).setFiles(pdf);

    // Dados do(a) Coordenador(a)
    await page.getByRole('tab', { name: 'Dados do(a) Coordenador(a)' }).click();
    await expect(page.getByRole('combobox', { name: 'Coordenador(a)', exact: true })).toBeDisabled();
    await expect(page.getByLabel('Matrícula SIAPE coordenador(a)')).toHaveValue('2466314');
    await expect(page.getByLabel('E-mail coordenador(a)')).toHaveValue('laurorg@ufg.br');
    await page.getByRole('combobox', { name: 'Vice-Coordenador(a)' }).click({ force: true });
    await page.getByRole('option').first().click();
    await page.getByLabel('Matrícula SIAPE vice-coordenador(a)').fill('1866324');
    await page.getByLabel('E-mail vice-coordenador(a)').fill('vice.coordenador@ufg.br');
    await page.getByLabel('Telefone vice-coordenador(a)').fill('62988888888');

    // Dados da Aprovação
    await page.getByRole('tab', { name: 'Dados da Aprovação' }).click();
    await page.getByRole('combobox', { name: 'Unidade de aprovação' }).click();
    await page.getByRole('option').first().click();
    const approvalUpload = page.waitForEvent('filechooser');
    await page.getByRole('button', { name: /Selecionar arquivo|Alterar arquivo/ }).click();
    await (await approvalUpload).setFiles(pdf);

    await page.getByRole('button', { name: 'Próxima Etapa' }).click();

    await page.getByRole('checkbox', { name: 'Plano de Trabalho Financeiro em Execução' }).check();
    await page.getByLabel('Objetivo(s) do Plano de Trabalho Financeiro').fill(
      'Executar atividades de pesquisa e desenvolvimento para aprimoramento institucional.',
    );
    await page.getByLabel('Entidade financiadora').click({ force: true });
    await page.getByRole('option', { name: 'Banco do Brasil', exact: true }).click();
    const valorDisponibilizado = page.getByLabel('Valor disponibilizado para o Plano de Trabalho');
    await valorDisponibilizado.fill('');
    await valorDisponibilizado.pressSequentially('1000000');
    await page.getByRole('radio', { name: 'Público', exact: true }).check();
    await page.getByLabel('Tipo do instrumento do recurso financeiro').click({ force: true });
    await page.getByRole('option', { name: 'TED', exact: true }).click();
    await page.getByLabel('Tipo do recurso financeiro').click({ force: true });
    await page.getByRole('combobox', { name: 'Tipo do recurso financeiro' }).press('Enter');
    await page.getByRole('option', { name: 'Ministérios', exact: true }).click();
    await page.getByLabel('Será gerido por Fundação').click({ force: true });
    await page.getByRole('combobox', { name: 'Será gerido por Fundação' }).press('Enter');
    await page.getByRole('option', { name: 'Sim', exact: true }).click();
    await page.getByLabel('Fundação', { exact: true }).click({ force: true });
    await page.getByRole('combobox', { name: 'Fundação', exact: true }).press('Enter');
    await page.getByRole('option', { name: 'Fundação de Apoio à Pesquisa', exact: true }).click();
    await page.getByLabel('Início previsto').fill('07/10/2026');
    await page.getByLabel('Término previsto').fill('31/12/2026');
    await page.getByRole('radio', { name: 'Sim', exact: true }).last().check();
    await page.getByLabel('Referencial do valor da bolsa pelo concedente').fill('500');
    await page.getByLabel('Telefone Institucional').fill('5562999999999');
    await page.getByRole('button', { name: 'Próxima Etapa' }).click();

    // Cronograma
    await page.getByRole('button', { name: 'Adicionar' }).click();
    await page.getByLabel('Etapa').fill('1');
    await page.getByLabel('Descricao').fill('Planejamento e execução da pesquisa');
    await page.getByLabel('Unidade de Tempo').click({ force: true });
    await page.getByRole('combobox', { name: 'Unidade de Tempo' }).press('ArrowDown');
    await page.getByRole('combobox', { name: 'Unidade de Tempo' }).press('Enter');
    await page.getByLabel('Quantidade').fill('1');
    await page.getByLabel('Início Previsto').fill('07/10/2026');
    await page.getByLabel('Término Previsto').fill('31/12/2026');
    await page.getByRole('dialog').getByRole('button', { name: 'Adicionar' }).click();
    await page.getByRole('button', { name: 'Próxima Etapa' }).click();

    // Indicador e meta
    await page.getByRole('button', { name: 'Adicionar' }).click();
    await page.getByRole('textbox', { name: 'Meta', exact: true }).fill('Concluir a etapa de pesquisa');
    await page.getByLabel('Etapas Cronograma').click({ force: true });
    await page.getByRole('combobox', { name: 'Etapas Cronograma' }).press('Enter');
    await page.getByRole('option', { name: /^1\b/ }).last().click();
    await page.getByRole('textbox', { name: 'Indicador de cumprimento das metas', exact: true }).fill(
      'Percentual de execução da etapa',
    );
    await page.getByRole('dialog').getByRole('button', { name: 'Adicionar' }).click();
    await page.getByRole('button', { name: 'Próxima Etapa' }).click();

    // Desembolso
    await page.getByLabel('Detalhamento da receita').fill('Repasse para execução das atividades do projeto');
    await page.getByRole('button', { name: 'Adicionar' }).click();
    await page.getByLabel('Parcela').fill('1');
    await page.getByLabel('Início da Execução Financeira').fill('07/10/2026');
    const valorDesembolso = page.getByRole('textbox', { name: 'Valor', exact: true });
    await valorDesembolso.fill('');
    await valorDesembolso.pressSequentially('1000000');
    await page.getByRole('dialog').getByRole('button', { name: 'Adicionar' }).click();
    await page.getByRole('button', { name: 'Próxima Etapa' }).click();

    // Plano de aplicação: DAO = 10 e Bolsas = 9.900
    await page.getByLabel('Justificativa').fill('Não se aplicam custos indiretos para este cenário.');
    const valorDao = page.getByLabel('Valor DAO a ser aplicado');
    await valorDao.fill('');
    await valorDao.pressSequentially('1000');
    await page.getByRole('button', { name: 'Adicionar' }).click();
    await page.getByRole('combobox', { name: 'Rubrica', exact: true }).first().click({ force: true });
    await page.getByRole('option', { name: 'Pessoal, encargos sociais e benefícios', exact: true }).click();
    await page.getByRole('combobox', { name: 'Rubrica', exact: true }).nth(1).click({ force: true });
    await page.getByRole('option', { name: 'Bolsas', exact: true }).click();
    const valorSubrubrica = page.getByRole('textbox', { name: 'Valor da Sub-rubrica', exact: true });
    await valorSubrubrica.fill('');
    await valorSubrubrica.pressSequentially('990000');
    await page.getByRole('button', { name: 'Adicionar', exact: true }).last().click();
    await page.getByRole('button', { name: 'Próxima Etapa' }).click();

    // Recursos da UFG: ambos os campos são obrigatórios no sistema.
    await page.getByRole('button', { name: 'Próxima Etapa' }).click();
    await page.getByLabel('Justificativa').fill('Não se aplica ao cenário.');
    await page.getByRole('button', { name: 'Adicionar' }).click();
    await page.getByLabel('Quantidade').fill('1');
    await page.getByLabel('Descrição dos Recursos das IFES (Equipamentos, Laboratórios, Salas etc.)').fill(
      'Recursos institucionais da UFG utilizados na execução do projeto.',
    );
    await page.getByRole('dialog').getByRole('button', { name: 'Adicionar' }).click();
    await page.getByRole('button', { name: 'Próxima Etapa' }).click();

    // Quadro de pessoal
    await page
      .getByRole('combobox', { name: 'Tipos de participantes relacionados a este Plano de Trabalho Financeiro' })
      .click({ force: true });
    await page.getByRole('option', { name: 'Bolsista', exact: true }).click();
    await page.keyboard.press('Escape');
    await page
      .getByRole('combobox', { name: 'Tipos de participantes relacionados a este Plano de Trabalho Financeiro' })
      .press('Escape');
    await page.getByRole('button', { name: 'Adicionar' }).click();
    await page.getByRole('combobox', { name: 'Tipo de participante', exact: true }).press('Enter');
    await page.getByRole('combobox', { name: 'Instituição de vinculação' }).click({ force: true });
    await page.getByRole('combobox', { name: 'Instituição de vinculação' }).press('Enter');
    await page.getByRole('option', { name: 'Universidade Federal de Goiás', exact: true }).click();
    await page.getByRole('combobox', { name: 'Beneficiário' }).click({ force: true });
    await page.getByRole('combobox', { name: 'Beneficiário' }).press('Enter');
    await page.getByRole('option', { name: 'Servidor', exact: true }).click();
    await page.getByRole('combobox', { name: 'Nome do participante' }).click({ force: true });
    await page.getByRole('combobox', { name: 'Nome do participante' }).press('Enter');
    await page.getByRole('option', { name: /1866324\s*-\s*Abadia Dos Reis Nascimento/ }).click();
    // O mat-select de tipo permanece expandido em algumas execuções e deixa
    // o backdrop do CDK sobre os demais campos do modal.
    await page.keyboard.press('Escape');
    await expect(page.getByRole('dialog', { name: 'Adicionar Participante' })).toBeVisible();
    await page.getByRole('combobox', { name: 'Escolaridade e/ou Experiência' }).click({ force: true });
    await page.getByRole('combobox', { name: 'Escolaridade e/ou Experiência' }).press('ArrowDown');
    await page.getByRole('combobox', { name: 'Escolaridade e/ou Experiência' }).press('Enter');
    await page.getByLabel('Quantidade de meses').fill('1');
    const periodoParticipante = page.getByRole('group', { name: 'Período *' });
    const inicioParticipante = periodoParticipante.getByRole('textbox').first();
    const fimParticipante = periodoParticipante.getByRole('textbox').last();
    for (const input of [inicioParticipante, fimParticipante]) {
      await input.evaluate((element) => element.removeAttribute('readonly'));
      await input.fill('');
      await input.pressSequentially('102026');
      await input.press('Tab');
    }
    await page.getByLabel('Quantidade de bolsas').fill('1');
    await page.getByLabel('Carga horária mensal').fill('20');
    const valorMensal = page.getByLabel('Valor mensal');
    await valorMensal.fill('');
    await valorMensal.pressSequentially('990000');
    await expect(valorMensal).toHaveValue(/9\.900,00/);
    await expect(page.getByLabel('Valor total')).toHaveValue(/9\.900,00/);
    await page.keyboard.press('Escape');
    const adicionarParticipante = page.getByRole('dialog', { name: 'Adicionar Participante' })
      .getByRole('button', { name: 'Adicionar' });
    await adicionarParticipante.evaluate((button) => (button as HTMLButtonElement).click());
    await expect(page.getByRole('dialog', { name: 'Adicionar Participante' })).toBeHidden({ timeout: 10_000 });
    await page.getByLabel('Justificar os valores dos salários indicando os seus referenciais:').fill(
      'Valor definido conforme a disponibilidade da sub-rubrica de Bolsas.',
    );
    await page.getByLabel('Relatar a forma de seleção dos bolsistas:').fill(
      'Seleção realizada conforme os critérios acadêmicos e institucionais do projeto.',
    );
    await page.getByRole('button', { name: 'Próxima Etapa' }).click();

    // Tratamento tributário
    await page.getByText('Tratamento tributário', { exact: true }).last().click();
    await page.getByRole('combobox').first().click({ force: true });
    await page.getByRole('option', { name: 'Bolsa', exact: true }).click();
    const modalidadeBolsa = page.getByLabel('Modalidade de bolsa');
    await modalidadeBolsa.click({ force: true });
    await modalidadeBolsa.press('ArrowDown');
    await modalidadeBolsa.press('Enter');
    await page.getByLabel('Justificativa').fill(
      'Tratamento tributário definido conforme a modalidade de bolsa e a natureza do projeto.',
    );
    await page.keyboard.press('Escape');
    await page.getByRole('button', { name: 'Próxima Etapa' }).click({ force: true });

    // Documento contratual
    await page.getByText('Documento Contratual', { exact: true }).last().click();
    await page.getByRole('button', { name: 'Adicionar' }).click();
    await page.getByText('Acordo de Parceria', { exact: true }).click();
    await page.getByLabel('Número do instrumento').fill('AP-CT01');
    await page.getByLabel('Número do processo SEI').fill('23070.000001/2026-01');
    await page.getByLabel('Início da vigência do contrato').fill('07/10/2026');
    await page.getByLabel('Fim da vigência do contrato').fill('31/12/2026');
    await page.getByText('Não', { exact: true }).click();
    await page.getByLabel('Vice-coordenador').click();
    await page.getByRole('option').first().click();
    await page.getByLabel('Fiscal').click();
    await page.getByRole('option').first().click();
    const valorInstrumento = page.getByLabel('Valor do instrumento de formalização');
    await valorInstrumento.fill('');
    await valorInstrumento.pressSequentially('1000000');
    await page.getByRole('dialog').getByRole('button', { name: 'Adicionar' })
      .evaluate((button) => (button as HTMLButtonElement).click());

    // Conferência. O salvamento final fica fora deste teste durante a estabilização.
    await page.getByRole('button', { name: 'Conferir Dados', exact: true }).click();
    await expect(page.getByRole('heading', { name: 'Conferência de Dados' })).toBeVisible();
  });
});
