export type Ambiente = 'dev' | 'homolog';

const nome = process.env.TEST_ENV ?? 'dev';
if (nome !== 'dev' && nome !== 'homolog') {
  throw new Error(`TEST_ENV invalido: ${nome}. Use dev ou homolog.`);
}

export const ambiente: Ambiente = nome;
export const baseURL = process.env.TEST_BASE_URL ?? (
  ambiente === 'dev'
    ? 'https://projetosacademicos-dev.ufg.br'
    : 'https://projetosacademicos-homolog.ufg.br'
);
export const storageState = `playwright/.auth/${ambiente}.json`;
