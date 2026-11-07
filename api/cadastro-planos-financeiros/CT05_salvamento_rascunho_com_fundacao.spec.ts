import { test, expect } from '../support/fixtures';
import { montarPlano } from '../support/plano.factory';
import { planosPath } from '../support/client';

const [ct, comFundacao] = ['CT05', true] as const;

test(`${ct} - salva e consulta rascunho ${comFundacao ? 'com' : 'sem'} fundação @api @cadastro @rascunho`, async ({
  api,
}) => {
  const body = await montarPlano(api, { comFundacao });
  body.isDraft = true;
  const response = await api.ok(
    await api.multipart('post', `${planosPath}/draft`, 'entity', body, ['extratoProjeto', 'documentoAprovacaoProjeto']),
  );
  const result = await response.json();
  const draft = result.data ?? result;
  const id = draft.draftId ?? draft.id;
  expect(id).toBeTruthy();
  const persisted = await api.plano(id);
  expect(persisted.isDraft).toBe(true);
  expect(persisted.descricao.valorDisponibilizado).toBe(body.descricao.valorDisponibilizado);
});
