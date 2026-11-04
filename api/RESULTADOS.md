# Validação da suíte de API

Execução completa no DEV em 03/11/2026, com `npm.cmd run test:api:dev`.

**25 testes executados: 22 passaram e 3 falharam.** Sem testes ignorados, sem resultados intermitentes na rodada final e sem repetição automática. Duração: aproximadamente 3 minutos e 5 segundos.

| Grupo | Passaram | Falharam |
| --- | --- | --- |
| Cadastro de planos financeiros | 7 | 1 |
| Avaliação de planos financeiros | 9 | 1 |
| Avaliação de remanejamento | 6 | 0 |
| Contrato de autenticação | 0 | 1 |

## Falhas reproduzidas

| Cenário | Esperado | Observado |
| --- | --- | --- |
| Avaliação CT03 | Etapa 1234 persistida após os ajustes | Etapa 1 na consulta final |
| Cadastro CT05 | Payload vazio rejeitado com validação 4xx | HTTP 500 |
| Acesso sem sessão | 401/403 ou redirecionamento de autenticação | HTTP 500 |

As requisições e os comandos de reprodução estão em [PENDENCIAS.md](PENDENCIAS.md). A divergência da etapa também foi conferida em um plano produzido pelo fluxo de interface. Nenhuma dessas falhas foi transformada em sucesso ou desabilitada na suíte.

## Evidências e checagens

- Relatório completo: `playwright-report/api/index.html`.
- Resultado estruturado: `test-results/api-results.json`.
- Traces de falhas: `test-results/api/`.
- TypeScript: `npm.cmd run typecheck` passou.
- Descoberta em homologação: 25 testes reconhecidos; execução no ambiente não realizada.
- Interface: os 24 testes continuam reconhecidos pela configuração original.

Abrir o relatório:

```powershell
npm.cmd run report:api
```

As mudanças foram deixadas no diretório de trabalho para revisão, sem commit ou push.

## Revalidacao de remanejamento em 04/11/2026

Executado `npm.cmd run test:api:dev -- api/avaliacao-remanejamento`: **6 passaram**, em aproximadamente 1 minuto e 20 segundos. O relatorio HTML e o JSON atuais correspondem a esta rodada parcial.

Na rodada anterior, o cookie `sagui-gw-bearer` expirou durante a preparacao do CT03; os CT04 a CT06 receberam HTTP 401 na selecao inicial de perfil. O contexto HTTP agora renova esse cookie pela rota `/comum-service/api/gateway/token` antes da expiracao, usando o cookie de sessao existente, sem repetir operacoes de negocio. TypeScript validado com `npm.cmd run typecheck`.

## Atualização da cobertura em 04/11/2026

O antigo CT05 de cadastro (payload vazio) foi removido a pedido. Os antigos CT06, CT07 e CT08 foram renumerados para CT05, CT06 e CT07 na API. A suíte atual tem 23 cenários de negócio e um contrato de autenticação (24 testes). Os resultados anteriores acima são históricos e incluem o cenário removido; os testes de interface mantêm a numeração original.
