# Testes de API — planos financeiros

Suíte independente da interface, com 23 cenários de negócio e um contrato adicional de acesso sem sessão. Os testes usam `APIRequestContext` para cadastrar, avaliar, ajustar e consultar os registros. Somente a autenticação CAS usa um navegador headless para obter os cookies.

## Executar

```powershell
npm.cmd run test:api:dev
npm.cmd run test:api:homolog
```

Uma funcionalidade ou um cenário:

```powershell
npm.cmd run test:api:dev -- api/cadastro-planos-financeiros
npm.cmd run test:api:dev -- api/avaliacao-planos-financeiros/CT03_devolve_para_ajustes_pelo_tae_com_fundacao.spec.ts
npm.cmd run test:api:dev -- api/avaliacao-remanejamento
npm.cmd run report:api
```

Os testes de interface continuam nos comandos `test:dev:headed` e `test:homolog:headed`. As duas suítes não devem executar simultaneamente com a mesma sessão de autenticação.

Cada CT fica em seu próprio arquivo `.spec.ts`, organizado por funcionalidade. A numeração de cadastro na API é independente da interface em `e2e/`. Ao informar o caminho completo, somente aquele CT será executado. Sem filtro, o comando executa a suíte completa.

## Cobertura

| Grupo         | CT        | Verificação                                                                |
| ------------- | --------- | -------------------------------------------------------------------------- |
| Cadastro      | CT01–CT02 | Plano em execução com instrumento, com e sem fundação                      |
| Cadastro      | CT03–CT04 | Plano pendente de avaliação, com e sem fundação                            |
| Cadastro      | CT05–CT06 | Gravação e consulta de rascunho, com e sem fundação                        |
| Cadastro      | CT07      | Cadastro sem identificar a pessoa do participante                          |
| Avaliação     | CT01–CT02 | Aprovação, processo SEI e instrumento contratual                           |
| Avaliação     | CT03      | Devoluções do gestor e da fundação, ajustes do TAE e aprovação             |
| Avaliação     | CT04–CT07 | Reprovação pelo gestor, fundação e gestor final                            |
| Avaliação     | CT08      | Edição pelos avaliadores e aceite das diferenças pelo TAE                  |
| Avaliação     | CT09–CT10 | Aprovação sem instrumento; plano permanece aprovado                        |
| Remanejamento | CT01–CT02 | Aprovação e persistência da nova etapa do cronograma                       |
| Remanejamento | CT03–CT04 | Reprovação preserva a etapa do plano em execução                           |
| Remanejamento | CT05–CT06 | Devolução, consulta de pendências, reenvio e aprovação final               |
| Autenticação  | Adicional | Acesso sem cookies deve receber resposta de autenticação, sem erro interno |

Além do status HTTP, os cenários consultam a persistência pelo ID/código retornado, verificam situação, valores, documentos e etapas conforme o fluxo. Não escolhem o último registro de uma lista e não usam IDs fixos de planos ou cadastros auxiliares.

## Estrutura e dados

- `support/auth.setup.ts`: login CAS e descoberta do gateway/perfis autorizados.
- `support/fixtures.ts`: contexto HTTP isolado por teste, com cookies e timeout de 30 segundos.
- `support/gateway-session.ts`: renova o cookie curto do gateway antes de expirar, pela mesma rota usada pela interface, sem repetir chamadas de cadastro ou decisão.
- `support/client.ts`: consultas, multipart, troca de perfil e verificação de situação.
- `support/plano.factory.ts`: monta o corpo do cadastro consultando as referências do ambiente.
- `support/flows.ts`: cadastro, decisões, documentos e ajustes na avaliação.
- `support/remanejamento.ts`: solicitações, decisões e reenvios de remanejamento.

Os valores são compartilhados com a interface em `test-data/`, incluindo o orçamento centralizado. Projeto, natureza e fundação vêm de `test-data/ambientes/`. Login e senha são compartilhados com a interface em `fixtures/auth.ts`, sem necessidade de carregar um arquivo `.env`.

O gateway é descoberto durante o login, sem fixar domínio de DEV em chamadas de homologação. Credenciais e cookies ficam fora do Git em `playwright/.auth/`. A API usa seu próprio arquivo de sessão (`*-api-session.json`), separado da interface.

Cada teste cria seu próprio plano e o código é anexado ao relatório como `plano-api`. Os registros criados permanecem no ambiente; a suíte não remove planos aprovados, históricos ou processos SEI.

## Relatórios e limites

A rodada de validação está em [RESULTADOS.md](RESULTADOS.md). As divergências reproduzidas no DEV e os comandos para investigá-las estão em [PENDENCIAS.md](PENDENCIAS.md).

- HTML: `playwright-report/api/index.html`.
- JSON: `test-results/api-results.json`.
- Evidências de falhas: `test-results/api/`.
- Um worker, sem repetição automática de mutações. Uma falha HTTP ou de negócio não é escondida por retries.

A suíte de API não substitui as verificações de campos obrigatórios, mensagens, botões e navegação feitas na interface. O cenário de payload vazio foi removido da suíte de API.

O serviço retorna a situação de execução como `null` no detalhe de alguns planos. A situação é validada pela listagem de gerenciamento, filtrada pelo código exato, enquanto valores e estrutura são validados no detalhe.

Na aprovação após ajustes, o cronograma alterado é aceito explicitamente. Os cenários verificam o número efetivamente persistido, e não apenas o sucesso do envio.

Os testes usam as permissões existentes da conta para trocar entre TAE, Gestor Financeiro e Direção Fundação. Isso valida o fluxo autorizado; não representa uma auditoria completa de autorização ou de segurança.
