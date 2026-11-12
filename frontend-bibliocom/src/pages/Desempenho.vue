<script setup lang="ts">
import { ref } from 'vue';
import { api, ApiError } from '../api';
import type { RelatorioE063, ResultadoN1 } from '../types';

const ruim = ref<ResultadoN1>();
const boa = ref<ResultadoN1>();
const rel = ref<RelatorioE063>();
const rodando = ref(false);
const erro = ref('');

async function executar() {
  rodando.value = true;
  erro.value = '';
  try {
    // Em sequência para um não interferir no tempo do outro.
    ruim.value = await api.nPlusUmRuim();
    boa.value = await api.nPlusUmBoa();
    rel.value = await api.relatorios();
  } catch (e) {
    erro.value = e instanceof ApiError ? e.message : 'Erro ao executar o comparativo.';
  } finally {
    rodando.value = false;
  }
}
</script>

<template>
  <div class="barra" style="justify-content: space-between; margin-bottom: 1rem">
    <div>
      <h1>Desempenho das consultas</h1>
      <span style="color: var(--muted)">Compara abordagens do backend (exercícios E06.2 e E06.3).</span>
    </div>
    <button :disabled="rodando" @click="executar">
      {{ rodando ? 'Executando…' : 'Executar comparativo' }}
    </button>
  </div>

  <div v-if="erro" class="msg erro">{{ erro }}</div>

  <div v-if="ruim && boa" class="cartao">
    <h3>N+1 vs. carregamento com relations ({{ boa.quantidadeObras }} obras)</h3>
    <table>
      <thead><tr><th>Versão</th><th>Consultas</th><th>Tempo</th></tr></thead>
      <tbody>
        <tr v-for="r in [ruim, boa]" :key="r.versao">
          <td>{{ r.versao }}</td><td>{{ r.consultasDisparadas }}</td><td>{{ r.tempoMs }} ms</td>
        </tr>
      </tbody>
    </table>
  </div>

  <div v-if="rel" class="cartao">
    <h3>Autores sem obra: LEFT JOIN … IS NULL vs. NOT IN</h3>
    <table>
      <thead><tr><th>Estratégia</th><th>Encontrados</th><th>Tempo</th></tr></thead>
      <tbody>
        <tr>
          <td>LEFT JOIN … IS NULL</td>
          <td>{{ rel.comparativoAutoresSemObra.leftJoinIsNull.encontrados }}</td>
          <td>{{ rel.comparativoAutoresSemObra.leftJoinIsNull.tempoMs }} ms</td>
        </tr>
        <tr>
          <td>NOT IN (subquery)</td>
          <td>{{ rel.comparativoAutoresSemObra.notInSubquery.encontrados }}</td>
          <td>{{ rel.comparativoAutoresSemObra.notInSubquery.tempoMs }} ms</td>
        </tr>
      </tbody>
    </table>
  </div>

  <p v-if="!ruim && !rodando" class="vazio">Clique em “Executar comparativo” para medir.</p>
</template>
