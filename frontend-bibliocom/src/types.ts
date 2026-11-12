export interface Categoria {
  id: string;
  nome: string;
  descricao: string | null;
}

export interface Autor {
  id: string;
  nome: string;
  nacionalidade: string | null;
}

export type EstadoConservacao =
  | 'NOVO'
  | 'BOM'
  | 'DESGASTADO'
  | 'DESCARTADO'
  | 'DANIFICADO';

export type StatusExemplar =
  | 'DISPONIVEL'
  | 'EMPRESTADO'
  | 'MANUTENCAO'
  | 'BAIXADO';

export interface Exemplar {
  id: string;
  codigoTombo: string;
  estadoConservacao: EstadoConservacao;
  status: StatusExemplar;
}

export interface Obra {
  id: string;
  titulo: string;
  isbn: string | null;
  anoPublicacao: number;
  editora: string | null;
  categoria: Categoria;
  autores: Autor[];
  exemplares?: Exemplar[];
}

export interface PaginaObras {
  dados: Obra[];
  meta: {
    total: number;
    pagina: number;
    limite: number;
    totalPaginas: number;
  };
}

export interface NovaObra {
  titulo: string;
  isbn?: string | null;
  anoPublicacao: number;
  editora?: string;
  categoriaId: string;
  autoresIds?: string[];
}

export interface AtualizarObra {
  titulo?: string;
  editora?: string;
  anoPublicacao?: number;
}

export interface FiltrosBusca {
  titulo?: string;
  anoMax?: number;
  autorNome?: string;
}

export interface RelatorioE063 {
  comparativoAutoresSemObra: {
    leftJoinIsNull: { encontrados: number; tempoMs: number; dados: Autor[] };
    notInSubquery: { encontrados: number; tempoMs: number; dados: Autor[] };
  };
  obrasPorCategoria: { categoria: string; totalObras: string }[];
  exemplaresPorEstado: { estado: EstadoConservacao; total: string }[];
}

export interface ResultadoN1 {
  versao: string;
  quantidadeObras: number;
  consultasDisparadas: number;
  tempoMs: number;
}
