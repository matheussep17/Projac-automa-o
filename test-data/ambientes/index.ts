import { ambiente } from '../../config/ambiente';
import { devData } from './dev';
import { homologData } from './homolog';

const dados = ambiente === 'dev' ? devData : homologData;

export const ambienteData = {
  ...dados,
  projeto: process.env.PROJAC_PROJETO ?? dados.projeto,
  natureza: process.env.PROJAC_NATUREZA ?? dados.natureza,
  fundacao: process.env.PROJAC_FUNDACAO ?? dados.fundacao,
  unidade: process.env.PROJAC_UNIDADE ?? dados.unidade,
};
