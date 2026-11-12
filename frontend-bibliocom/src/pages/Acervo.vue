<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue';
import { api, ApiError } from '../api';
import type { Autor, Categoria, FiltrosBusca, Obra } from '../types';
import ObraForm from './ObraForm.vue';

const POR_PAGINA = 10;

const obras = ref<Obra[]>([]);
const pagina = ref(1);
const totalPaginas = ref(1);
const total = ref(0);
const filtros = ref<FiltrosBusca>({});
const rascunho = reactive({ titulo: '', autorNome: '', anoMax: '' });
const carregando = ref(true);
const erro = ref('');
const aviso = ref('');
const formAberto = ref(false);
const emEdicao = ref<Obra | undefined>();
const refs = ref<{ categorias: Categoria[]; autores: Autor[] }>({
  categorias: [],
  autores: [],
});

const filtrando = computed(() => Object.values(filtros.value).some(Boolean));

async function carregar() {
  carregando.value = true;
  erro.value = '';
  try {
    if (filtrando.value) {
      const lista = await api.buscarObras(filtros.value);
      obras.value = lista;
      total.value = lista.length;
      totalPaginas.value = 1;
    } else {
      const r = await api.listarObras(pagina.value, POR_PAGINA);
      obras.value = r.dados;
      total.value = r.meta.total;
      totalPaginas.value = r.meta.totalPaginas;
    }
  } catch (e) {
    erro.value = e instanceof ApiError ? e.message : 'Erro ao carregar obras.';
  } finally {
    carregando.value = false;
  }
}

function irParaPagina(p: number) {
  pagina.value = p;
  carregar();
}

async function abrirForm(obra?: Obra) {
  emEdicao.value = obra;
  formAberto.value = true;
  if (!obra && refs.value.categorias.length === 0) {
    try {
      refs.value = await api.carregarReferencias();
    } catch (e) {
      erro.value = e instanceof ApiError ? e.message : 'Erro ao carregar categorias.';
    }
  }
}

function buscar() {
  pagina.value = 1;
  filtros.value = {
    titulo: rascunho.titulo.trim() || undefined,
    autorNome: rascunho.autorNome.trim() || undefined,
    anoMax: rascunho.anoMax ? Number(rascunho.anoMax) : undefined,
  };
  carregar();
}

function limpar() {
  Object.assign(rascunho, { titulo: '', autorNome: '', anoMax: '' });
  filtros.value = {};
  pagina.value = 1;
  carregar();
}

async function remover(obra: Obra) {
  if (!confirm(`Remover "${obra.titulo}"?`)) return;
  aviso.value = '';
  erro.value = '';
  try {
    const r = await api.removerObra(obra.id);
    aviso.value = r.mensagem;
    carregar();
  } catch (e) {
    // 409 quando a obra ainda possui exemplares (FK RESTRICT)
    erro.value = e instanceof ApiError ? e.message : 'Erro ao remover.';
  }
}

function salvo() {
  formAberto.value = false;
  aviso.value = emEdicao.value ? 'Obra atualizada.' : 'Obra cadastrada.';
  carregar();
}

// A rota de busca com filtros não devolve exemplares.
function disponibilidade(o: Obra): { texto: string; classe: string } {
  if (!o.exemplares) return { texto: '—', classe: '' };
  const n = o.exemplares.length;
  if (n === 0) return { texto: 'sem exemplares', classe: 'erro' };
  const livres = o.exemplares.filter((e) => e.status === 'DISPONIVEL').length;
  return { texto: `${livres}/${n} disponíveis`, classe: livres > 0 ? 'ok' : 'warn' };
}

onMounted(carregar);
</script>

<template>
  <div class="barra" style="justify-content: space-between; margin-bottom: 1rem">
    <div>
      <h1>Acervo</h1>
      <span style="color: var(--muted)">
        {{ filtrando ? `${total} resultado(s)` : `${total} obras cadastradas` }}
      </span>
    </div>
    <button @click="abrirForm()">+ Nova obra</button>
  </div>

  <form class="cartao barra" @submit.prevent="buscar">
    <label class="cresce">Título <input v-model="rascunho.titulo" /></label>
    <label class="cresce">Autor <input v-model="rascunho.autorNome" /></label>
    <label>Publicada até <input v-model="rascunho.anoMax" type="number" style="width: 110px" /></label>
    <button type="submit">Buscar</button>
    <button type="button" class="sec" @click="limpar">Limpar</button>
  </form>

  <div v-if="erro" class="msg erro">{{ erro }}</div>
  <div v-if="aviso" class="msg ok">{{ aviso }}</div>

  <div class="cartao">
    <p v-if="carregando" class="vazio">Carregando…</p>
    <p v-else-if="obras.length === 0" class="vazio">Nenhuma obra encontrada.</p>
    <table v-else>
      <thead>
        <tr>
          <th>Título</th><th>Autores</th><th>Categoria</th><th>Ano</th><th>Exemplares</th><th></th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="o in obras" :key="o.id">
          <td>
            <strong>{{ o.titulo }}</strong>
            <div style="color: var(--muted); font-size: 0.82rem">
              {{ o.editora ?? 'Editora não informada' }} · {{ o.isbn ?? 'sem ISBN' }}
            </div>
          </td>
          <td>{{ o.autores.map((a) => a.nome).join(', ') || '—' }}</td>
          <td><span class="selo">{{ o.categoria.nome }}</span></td>
          <td>{{ o.anoPublicacao }}</td>
          <td>
            <span :class="['selo', disponibilidade(o).classe]">{{ disponibilidade(o).texto }}</span>
          </td>
          <td class="acoes">
            <button class="sec" @click="abrirForm(o)">Editar</button>
            <button class="perigo" @click="remover(o)">Remover</button>
          </td>
        </tr>
      </tbody>
    </table>

    <div v-if="!filtrando && totalPaginas > 1" class="paginacao">
      <button class="sec" :disabled="pagina <= 1" @click="irParaPagina(pagina - 1)">← Anterior</button>
      <span>Página {{ pagina }} de {{ totalPaginas }}</span>
      <button class="sec" :disabled="pagina >= totalPaginas" @click="irParaPagina(pagina + 1)">Próxima →</button>
    </div>
  </div>

  <ObraForm
    v-if="formAberto"
    :obra="emEdicao"
    :categorias="refs.categorias"
    :autores="refs.autores"
    @fechar="formAberto = false"
    @salvo="salvo"
  />
</template>
