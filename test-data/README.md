# Onde editar os dados de cadastro

Os testes de cadastro, avaliação e remanejamento reutilizam estes dados para preparar os planos.
Páginas e fluxos importam os valores pelo `test-data/index.ts`.

| Informação                                                       | Arquivo                                          |
| ---------------------------------------------------------------- | ------------------------------------------------ |
| Orçamento total, bolsas com/sem fundação, DAO e custos indiretos | `plano-financeiro/orcamento.data.ts`             |
| Início e fim do plano e dados do vice-coordenador                | `comum/plano.data.ts`                            |
| Objetivo, assistente e telefone institucional                    | `plano-financeiro/descricao.data.ts`             |
| Etapa, descrição e quantidade do cronograma                      | `plano-financeiro/cronograma.data.ts`            |
| Indicador e meta                                                 | `plano-financeiro/indicador-meta.data.ts`        |
| Parcela, receita e valor do desembolso                           | `plano-financeiro/desembolso.data.ts`            |
| Distribuição dos valores com e sem fundação                      | `plano-financeiro/plano-aplicacao.data.ts`       |
| Recursos da UFG                                                  | `plano-financeiro/recursos-ufg.data.ts`          |
| Bolsista, período, bolsas, carga horária e remuneração           | `plano-financeiro/quadro-pessoal.data.ts`        |
| Justificativa tributária                                         | `plano-financeiro/tratamento-tributario.data.ts` |
| Instrumento e processo SEI de referência                         | `plano-financeiro/documento-contratual.data.ts`  |
| Valores e ano dos encargos                                       | `plano-financeiro/encargos.data.ts`              |

## Como editar

- Datas completas usam `DD/MM/AAAA`; o período do bolsista usa `MM/AAAA`. Mantenha o período dentro da vigência do plano.
- Valores digitados com máscara monetária usam centavos sem separadores: `'1000000'` representa R$ 10.000,00. Encargos usa valores com vírgula.
- Altere os valores financeiros somente em `plano-financeiro/orcamento.data.ts`. O total alimenta o plano e o desembolso; as bolsas alimentam o plano de aplicação e a remuneração do bolsista. Sem fundação, as bolsas usam o total automaticamente.
- Com fundação, total, bolsas e DAO são valores explícitos: não presumimos uma fórmula de desconto. Os valores atuais foram preservados (R$ 10.000,00 de total, R$ 9.900,00 de bolsas e R$ 10,00 de DAO). Ao mudar o total, revise a distribuição com fundação nesse mesmo arquivo.
- A remuneração atual considera uma bolsa por um mês. Se alterar a quantidade de bolsas ou de meses, revise o valor mensal para manter o total compatível com a sub-rubrica.
- Alterar um dado compartilhado afeta todos os testes que o utilizam. Opções como `comFundacao` e `emExecucao` ficam no próprio teste em `e2e/`.
- Projeto, natureza, fundação e unidade ficam em `ambientes/dev.ts` e `ambientes/homolog.ts`. A seleção usa o nome configurado, sem escolher o primeiro resultado. Os valores de homologação começam com as mesmas referências de DEV e devem corresponder aos registros disponíveis naquele ambiente.
- Os números de etapa dos ciclos de ajustes ficam nos fluxos de avaliação e remanejamento; confira-os ao mudar a etapa inicial.
- `encargos.data.ts` está disponível como referência, mas atualmente não é consumido pelas páginas ou fluxos.

## Importação

```ts
import { cronogramaData, sharedData } from '../../test-data';
```

Para adicionar dados, crie um arquivo `*.data.ts` na pasta do domínio e exporte-o no `index.ts`.

## Configuração por ambiente

`TEST_ENV` aceita `dev` ou `homolog`. Os scripts `test:dev` e `test:homolog` já definem o ambiente.
`config/ambiente.ts` centraliza a URL e o arquivo de sessão utilizado.

É possível substituir os dados sem editar os arquivos usando `PROJAC_PROJETO`, `PROJAC_NATUREZA`, `PROJAC_FUNDACAO` e `PROJAC_UNIDADE`.
Para autenticação, use `PROJAC_DEV_LOGIN` / `PROJAC_DEV_PASSWORD` ou `PROJAC_HOMOLOG_LOGIN` / `PROJAC_HOMOLOG_PASSWORD`.
As variáveis genéricas `PROJAC_LOGIN` / `PROJAC_PASSWORD` continuam válidas como alternativa. A implementação está em `fixtures/auth.ts`.
Defina essas variáveis no terminal ou no ambiente de execução; arquivos `.env` não são carregados automaticamente.

## Código do plano criado

`cadastrarPlanoFinanceiro` retorna o código recebido da API e o anexa ao relatório como `plano-criado`.
Use esse código nas avaliações e consultas. Salvar como rascunho mantém o retorno vazio, pois não inicia a avaliação.

```ts
const codigoPlano = await cadastrarPlanoFinanceiro(page, {
  emExecucao: false,
  comFundacao: true,
});
await avaliarPlanoFinanceiro(page, { comFundacao: true, codigoPlano });
```
