import { test as base } from '@playwright/test';
import { loginComPerfil } from './auth';
import { Perfil } from '../pages/avaliacao-planos-financeiros/PerfilPage';

export const test = base.extend<{ perfilInicial: Perfil }>({
  perfilInicial: ['TAE', { option: true }],
  page: async ({ page, perfilInicial }, use) => {
    await base.step(`Autenticar e selecionar perfil ${perfilInicial}`, () => loginComPerfil(page, perfilInicial));

    await use(page);
  },
});

export { expect } from '@playwright/test';
