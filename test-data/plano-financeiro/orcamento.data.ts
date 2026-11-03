// Valores em centavos, sem separadores, para os campos com máscara monetária.
// Esta é a única referência de valores para plano, desembolso, aplicação e bolsas.
const total = '1000000';
const bolsasComFundacao = '990000';

export const orcamentoData = {
  total,
  comFundacao: {
    bolsas: bolsasComFundacao,
    dao: '1000',
  },
  semFundacao: {
    bolsas: total,
    dao: '0',
  },
  custosIndiretos: '0',
};
