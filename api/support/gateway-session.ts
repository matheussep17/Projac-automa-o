import { APIRequestContext } from '@playwright/test';

const tokenPath = '/comum-service/api/gateway/token';
const httpMethods = new Set(['get', 'post', 'put', 'patch', 'delete', 'head', 'fetch']);

// O gateway usa um cookie curto, renovado pelo interceptor HTTP da interface.
// Renova antes da chamada para evitar repetir cadastros ou decisões após um 401.
export function withGatewaySession(context: APIRequestContext, gateway: string): APIRequestContext {
  return new Proxy(context, {
    get(target, property) {
      const member = Reflect.get(target, property);
      if (typeof member !== 'function') return member;
      if (!httpMethods.has(String(property))) return member.bind(target);
      return async (...args: unknown[]) => {
        const { cookies } = await target.storageState();
        const host = new URL(gateway).hostname;
        const cookie = cookies.find(c => c.name === 'sagui-gw-bearer'
          && (host === c.domain.replace(/^\./, '') || host.endsWith(`.${c.domain.replace(/^\./, '')}`)));
        if (!cookie || (cookie.expires > 0 && cookie.expires * 1000 <= Date.now() + 5000)) {
          const response = await target.post(tokenPath, { data: {} });
          try {
            if (!response.ok()) {
              throw new Error(`Falha ao renovar a sessao do gateway: HTTP ${response.status()}`);
            }
          } finally {
            await response.dispose();
          }
        }
        return member.apply(target, args);
      };
    },
  });
}
