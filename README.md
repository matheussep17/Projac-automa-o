# Testes automatizados - Projetos Acadêmicos

## Instalação

```bash
npm install
npx playwright install chromium
```

Login e senha de DEV e homologação estão definidos em `fixtures/auth.ts`. Não é necessário carregar um arquivo `.env` para executar os testes.

## Execução

```bash
npm test
npm run test:headed
npm run test:ui
npm run test:debug
```

Os testes estão em `e2e/`. O relatório HTML é gerado em `playwright-report/`.

## Organização

Os [testes de API](api/README.md) têm configuração, execução e relatório próprios:

```powershell
npm.cmd run test:api:dev
npm.cmd run test:api:homolog
npm.cmd run report:api
```

| Pasta           | Conteúdo                                                                  |
| --------------- | ------------------------------------------------------------------------- |
| `e2e/`          | Casos de teste por funcionalidade                                         |
| `api/`          | Cenários de negócio por HTTP, correspondentes aos CTs da interface        |
| `flows/`        | Sequências reutilizáveis de cadastro, avaliação e remanejamento           |
| `pages/`        | Seletores, preenchimento e verificações das telas                         |
| `test-data/`    | Valores usados nos cadastros; veja o [guia de dados](test-data/README.md) |
| `fixtures/`     | Preparação da sessão e autenticação                                       |
| `config/`       | Configurações compartilhadas                                              |
| `work/`         | Arquivos de apoio, incluindo o PDF anexado aos planos                     |
| `test-results/` | Evidências das execuções                                                  |

## Executar em DEV

No PowerShell, use `npm.cmd` para evitar restrições de execução de scripts:

```powershell
npm.cmd run test:dev:headed -- CT05_ajusta CT06_ajusta
npm.cmd run test:dev:headed -- e2e/avaliacao-remanejamento
npm.cmd run typecheck
npx.cmd playwright test --list
```

Para homologação, use `test:homolog:headed`.

## Limites de duração

Os limites totais estão em [config/timeouts.ts](config/timeouts.ts).
Cada cenário escolhe um limite conforme suas etapas, incluindo cadastro, avaliações e reenvios.
As esperas por elementos continuam nas páginas, próximas da operação que pode falhar.
Aumentar o limite total não corrige um seletor incorreto.

Ações, navegações, verificações de tela e consultas com `expect.poll` usam
`timeouts.espera` (30 segundos). As esperas de eventos e respostas da página
usam o limite padrão de ações. O contexto de autenticação do `globalSetup`
recebe os mesmos limites explicitamente.
São limites máximos: a execução continua assim que a condição é atendida.
O tempo restante do cenário pode encerrar uma espera antes desses 30 segundos.
