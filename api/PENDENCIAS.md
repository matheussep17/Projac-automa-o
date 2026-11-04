# Divergências encontradas no DEV

Validação em 03/11/2026. Estes casos permanecem como testes com falha, sem `skip`, sem falha esperada e sem aceitar erro interno como sucesso.

## Avaliação CT03 — etapa do cronograma não é aplicada

Fluxo: cadastrar com fundação, gestor devolver para ajustes, TAE reenviar etapa 123, gestor aprovar, fundação devolver, TAE reenviar etapa 1234 e os avaliadores aprovarem até a execução.

Esperado: a consulta final do plano deve conter etapa 1234.

Observado: a situação passa para “Em execução”, mas `GET /projac-comum-service/repercussao-financeira/{id}` retorna etapa 1.

A divergência também foi conferida em um plano criado pelo fluxo de interface: `PTFPQ-260863` estava “Em execução” e a consulta retornou etapa 1. Esse código é apenas evidência da investigação; nenhum teste depende dele.

O teste de interface existente verifica a situação ao final, mas não verifica o número final da etapa. A nova cobertura de API faz essa verificação. O envio por API mantém coerentes as referências de cronograma e metas e aceita explicitamente a diferença de cronograma durante a aprovação.

Reproduzir:

```powershell
npm.cmd run test:api:dev -- api/avaliacao-planos-financeiros --grep CT03
```

Revisar no backend a criação/aplicação da versão reenviada durante a avaliação inicial. O fluxo de edição pelos avaliadores (CT08) e os ajustes de remanejamento são cenários distintos.

## Autenticação — acesso sem cookies retorna HTTP 500

Requisição: `GET /projac-comum-service/repercussao-financeira/minhas-repercussoes` em contexto HTTP com `storageState` explicitamente vazio e redirecionamentos desativados.

Esperado: HTTP 401/403 ou redirecionamento de autenticação.

Observado: HTTP 500, com mensagem de que não foi possível obter os dados do usuário autenticado. Isso demonstra um problema de tratamento do acesso sem sessão; não demonstra exposição de planos privados.

```powershell
npm.cmd run test:api:dev -- api/contratos
```

## Particularidade do contrato de consulta

O detalhe do plano pode retornar `situacaoAvaliacao: null` quando ele está em execução. A listagem de gerenciamento retorna “Em execução”. Os testes consultam a situação nessa listagem, pelo código exato, e consultam os demais dados pelo ID.

A rota de consulta de uma decisão salva é `/avaliacao-repercussao-financeira/{id}/detalhes`, conforme o cliente da aplicação. A suíte usa essa rota para conferir a decisão persistida.

Estas pendências exigem análise do serviço/aplicação. O repositório atual contém a automação, não a implementação do backend.
