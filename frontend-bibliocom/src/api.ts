import type {
  AtualizarObra,
  Autor,
  Categoria,
  FiltrosBusca,
  NovaObra,
  Obra,
  PaginaObras,
  RelatorioE063,
  ResultadoN1,
} from './types';

const BASE = import.meta.env.VITE_API_BASE ?? '/api';

export class ApiError extends Error {
  constructor(
    public status: number,
    mensagem: string,
    public detalhe?: string,
  ) {
    super(mensagem);
  }
}

async function requisicao<T>(caminho: string, init?: RequestInit): Promise<T> {
  let res: Response;
  try {
    res = await fetch(BASE + caminho, {
      headers: { 'Content-Type': 'application/json' },
      ...init,
    });
  } catch {
    throw new ApiError(0, 'Não foi possível conectar à API. O backend está rodando?');
  }

  if (!res.ok) {
    // O backend responde em dois formatos: { mensagem, detalhe } (filtro do
    // TypeORM) e { message } (exceções padrão do Nest, que pode ser array).
    const corpo = await res.json().catch(() => ({}));
    const msg = corpo.mensagem ?? corpo.message ?? `Erro ${res.status}`;
    throw new ApiError(
      res.status,
      Array.isArray(msg) ? msg.join(', ') : msg,
      corpo.detalhe,
    );
  }
  return res.json() as Promise<T>;
}

export const api = {
  listarObras: (pagina = 1, limite = 10) =>
    requisicao<PaginaObras>(`/obras?page=${pagina}&limit=${limite}`),

  buscarObras: (f: FiltrosBusca) => {
    const p = new URLSearchParams();
    if (f.titulo) p.set('titulo', f.titulo);
    if (f.autorNome) p.set('autorNome', f.autorNome);
    if (f.anoMax) p.set('anoMax', String(f.anoMax));
    return requisicao<Obra[]>(`/obras/busca/filtros?${p}`);
  },

  obterObra: (id: string) => requisicao<Obra>(`/obras/${id}`),

  criarObra: (corpo: NovaObra) =>
    requisicao<Obra>('/obras', { method: 'POST', body: JSON.stringify(corpo) }),

  atualizarObra: (id: string, corpo: AtualizarObra) =>
    requisicao<Obra>(`/obras/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(corpo),
    }),

  removerObra: (id: string) =>
    requisicao<{ mensagem: string }>(`/obras/${id}`, { method: 'DELETE' }),

  relatorios: () => requisicao<RelatorioE063>('/obras/exercicios/e06-3'),
  nPlusUmRuim: () => requisicao<ResultadoN1>('/obras/exercicios/e06-2/ruim'),
  nPlusUmBoa: () => requisicao<ResultadoN1>('/obras/exercicios/e06-2/boa'),

  /**
   * O backend ainda não expõe /categorias nem /autores. Para popular os
   * selects do formulário, percorremos a listagem paginada (máx. 50 por
   * página) e deduplicamos categorias e autores das obras existentes.
   */
  async carregarReferencias(): Promise<{
    categorias: Categoria[];
    autores: Autor[];
  }> {
    const categorias = new Map<string, Categoria>();
    const autores = new Map<string, Autor>();
    let pagina = 1;
    let totalPaginas = 1;
    do {
      const r = await this.listarObras(pagina, 50);
      totalPaginas = r.meta.totalPaginas;
      for (const o of r.dados) {
        categorias.set(o.categoria.id, o.categoria);
        o.autores.forEach((a) => autores.set(a.id, a));
      }
      pagina++;
    } while (pagina <= totalPaginas);

    const porNome = (a: { nome: string }, b: { nome: string }) =>
      a.nome.localeCompare(b.nome, 'pt-BR');
    return {
      categorias: [...categorias.values()].sort(porNome),
      autores: [...autores.values()].sort(porNome),
    };
  },
};
