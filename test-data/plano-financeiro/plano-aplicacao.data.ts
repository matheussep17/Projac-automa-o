import { orcamentoData } from './orcamento.data';

export const planoAplicacaoData = {
  justificativa: 'Não se aplicam custos indiretos para este cenário.',
  valorDao: orcamentoData.comFundacao.dao,
  valorComFundacao: orcamentoData.comFundacao.bolsas,
  valorSemFundacao: orcamentoData.semFundacao.bolsas,
  zero: orcamentoData.custosIndiretos,
};
