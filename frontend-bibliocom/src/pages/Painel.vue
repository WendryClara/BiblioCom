<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { api, ApiError } from '../api';
import type { RelatorioE063 } from '../types';

const dados = ref<RelatorioE063>();
const totalObras = ref<number>();
const erro = ref('');

onMounted(async () => {
  try {
    const [rel, pag] = await Promise.all([api.relatorios(), api.listarObras(1, 1)]);
    dados.value = rel;
    totalObras.value = pag.meta.total;
  } catch (e) {
    erro.value = e instanceof ApiError ? e.message : 'Erro ao carregar o painel.';
  }
});

const semObra = computed(() => dados.value?.comparativoAutoresSemObra.leftJoinIsNull.dados ?? []);
const totalExemplares = computed(() =>
  (dados.value?.exemplaresPorEstado ?? []).reduce((s, e) => s + Number(e.total), 0),
);
const porCategoria = computed(() =>
  (dados.value?.obrasPorCategoria ?? []).map((c) => ({ rotulo: c.categoria, valor: Number(c.totalObras) })),
);
const porEstado = computed(() =>
  (dados.value?.exemplaresPorEstado ?? []).map((e) => ({ rotulo: e.estado, valor: Number(e.total) })),
);

function largura(valor: number, itens: { valor: number }[]) {
  const max = Math.max(1, ...itens.map((i) => i.valor));
  return `${(valor / max) * 100}%`;
}
</script>

<template>
  <div v-if="erro" class="msg erro">{{ erro }}</div>
  <p v-else-if="!dados" class="vazio">Carregando…</p>
  <template v-else>
    <h1>Painel</h1>
    <div class="grade">
      <div class="cartao">
        <div style="color: var(--muted)">Obras no acervo</div>
        <div class="metrica">{{ totalObras }}</div>
      </div>
      <div class="cartao">
        <div style="color: var(--muted)">Exemplares físicos</div>
        <div class="metrica">{{ totalExemplares }}</div>
      </div>
      <div class="cartao">
        <div style="color: var(--muted)">Autores sem obra</div>
        <div class="metrica">{{ semObra.length }}</div>
      </div>
    </div>

    <div class="grade">
      <div class="cartao">
        <h3>Obras por categoria</h3>
        <div v-for="i in porCategoria" :key="i.rotulo" class="barra-h">
          <span>{{ i.rotulo }}</span>
          <div class="trilho"><div class="preen" :style="{ width: largura(i.valor, porCategoria) }" /></div>
          <strong>{{ i.valor }}</strong>
        </div>
      </div>
      <div class="cartao">
        <h3>Exemplares por estado de conservação</h3>
        <div v-for="i in porEstado" :key="i.rotulo" class="barra-h">
          <span>{{ i.rotulo }}</span>
          <div class="trilho"><div class="preen" :style="{ width: largura(i.valor, porEstado) }" /></div>
          <strong>{{ i.valor }}</strong>
        </div>
      </div>
    </div>

    <div class="cartao">
      <h3>Autores sem obra cadastrada</h3>
      <p v-if="semObra.length === 0" class="vazio">Nenhum autor sem obra.</p>
      <span v-for="a in semObra" :key="a.id" class="selo">
        {{ a.nome }}{{ a.nacionalidade ? ` · ${a.nacionalidade}` : '' }}
      </span>
    </div>
  </template>
</template>
