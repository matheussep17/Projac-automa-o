import { APIRequestContext, APIResponse, expect, test } from '@playwright/test';
import { readFile } from 'node:fs/promises';
import { timeouts } from '../../config/timeouts';

// DTOs retornados pelo serviço contêm subdocumentos diferentes por operação.
// As propriedades de negócio são verificadas nos cenários e nas consultas.
// A API possui respostas polimórficas e subdocumentos variáveis por operação.
// A validação de negócio permanece nos fluxos; este alias mantém a fronteira
// HTTP compatível enquanto os DTOs específicos são introduzidos gradualmente.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Dto = Record<string, any>;
export type ApiResponseBody = Dto & { data?: Dto; asErros?: boolean };
export type PaginatedResponse = Dto & {
  content?: Dto[];
  last?: boolean;
  data?: Dto & { content?: Dto[] };
};
export type Perfil = 'TAE' | 'Gestor Financeiro' | 'Direção Fundação';
const nomesPerfil: Record<Perfil, string> = {
  TAE: 'PROJAC_TAE',
  'Gestor Financeiro': 'PROJAC_GESTOR_FINANCEIRO',
  'Direção Fundação': 'PROJAC_DIRECAO_FUNDACAO',
};
export const planosPath = '/projac-comum-service/repercussao-financeira';
export const avaliacoesPath = '/projac-comum-service/avaliacao-repercussao-financeira';
export const solicitacoesPath = `${planosPath}/solicitacao-alteracao`;

export class ProjacApi {
  constructor(
    readonly request: APIRequestContext,
    private readonly perfis: Dto[],
  ) {}

  async perfil(perfil: Perfil): Promise<void> {
    await test.step(`API: selecionar ${perfil}`, async () => {
      const escolhido = this.perfis.find((p) => p.nome === nomesPerfil[perfil]);
      expect(escolhido, `Perfil autorizado: ${perfil}`).toBeTruthy();
      await this.ok(
        await this.request.post('/comum-service/perfil/sagui/define_perfil', {
          data: { perfilSelecionado: escolhido, tokenName: 'projac-session-token' },
        }),
      );
      const usuario = await this.get('/projac-comum-service/projeto-academico/usuario-cas');
      expect(usuario.perfilAtual.nome).toBe(nomesPerfil[perfil]);
    });
  }

  async ok(response: APIResponse): Promise<APIResponse> {
    expect(response.ok(), `${response.status()} ${response.url()}: ${(await response.text()).slice(0, 1500)}`).toBe(
      true,
    );
    return response;
  }

  async get<T extends Dto = ApiResponseBody>(
    path: string,
    params?: Record<string, string | number | boolean>,
  ): Promise<T> {
    const response = await this.ok(await this.request.get(path, { params }));
    return response.json();
  }

  async entity(path: string): Promise<ApiResponseBody> {
    const result = await this.get(path);
    expect(result.asErros, `Consulta ${path}`).not.toBe(true);
    return result.data ?? result;
  }

  async list(path: string, params?: Record<string, string | number | boolean>): Promise<Dto[]> {
    const result = await this.get<PaginatedResponse>(path, { page: 0, size: 100, ...params });
    const data = result.data;
    const content = result.content ?? data?.content ?? data ?? result;
    expect(Array.isArray(content), `Listagem ${path}`).toBe(true);
    return content as Dto[];
  }

  async multipart(
    method: 'post' | 'put' | 'patch',
    path: string,
    field: string,
    entity: Dto,
    files: string[] = [],
  ): Promise<APIResponse> {
    const multipart: Record<string, { name: string; mimeType: string; buffer: Buffer }> = {
      [field]: { name: 'blob', mimeType: 'application/json', buffer: Buffer.from(JSON.stringify(entity)) },
    };
    for (const name of files)
      multipart[name] = {
        name: 'anexo-teste.pdf',
        mimeType: 'application/pdf',
        buffer: await readFile('work/anexo-teste.pdf'),
      };
    return this.request[method](path, { multipart });
  }

  async plano(id: number): Promise<Dto> {
    return this.entity(`${planosPath}/${id}`);
  }

  async conferirSituacao(id: number, situacao: string): Promise<Dto> {
    const plano = await this.plano(id);
    // O detalhe serializa EXECUCAO como null neste serviço; a listagem calcula
    // a situação usada pelo gerenciamento. Validamos esse contrato explicitamente.
    await expect
      .poll(
        async () => {
          const rows = await this.list(`${planosPath}/minhas-repercussoes`, { search_codigo: plano.codigo });
          return rows.find((row) => row.id === id)?.situacaoAvaliacao;
        },
        {
          timeout: timeouts.espera,
          intervals: [250, 500, 1000],
          message: `Plano ${id}: situação ${situacao}`,
        },
      )
      .toBe(situacao);
    return this.plano(id);
  }
}
