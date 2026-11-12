<script setup lang="ts">
import { ref } from 'vue';
import { api, ApiError } from '../api';
import type { Autor, Categoria, Obra } from '../types';

const props = defineProps<{
  obra?: Obra; // presente => edição
  categorias: Categoria[];
  autores: Autor[];
}>();
const emit = defineEmits<{ fechar: []; salvo: [] }>();

const editando = !!props.obra;
const titulo = ref(props.obra?.titulo ?? '');
const isbn = ref(props.obra?.isbn ?? '');
const ano = ref(String(props.obra?.anoPublicacao ?? ''));
const editora = ref(props.obra?.editora ?? '');
const categoriaId = ref(props.obra?.categoria.id ?? '');
const autoresIds = ref<string[]>([]);
const erro = ref('');
const salvando = ref(false);

async function enviar() {
  erro.value = '';
  salvando.value = true;
  try {
    if (props.obra) {
      await api.atualizarObra(props.obra.id, {
        titulo: titulo.value,
        editora: editora.value || undefined,
        anoPublicacao: Number(ano.value),
      });
    } else {
      await api.criarObra({
        titulo: titulo.value,
        isbn: isbn.value.trim() || null,
        anoPublicacao: Number(ano.value),
        editora: editora.value || undefined,
        categoriaId: categoriaId.value,
        autoresIds: autoresIds.value,
      });
    }
    emit('salvo');
  } catch (e) {
    erro.value = e instanceof ApiError ? e.message : 'Erro inesperado.';
  } finally {
    salvando.value = false;
  }
}
</script>

<template>
  <div class="fundo-modal" @click="emit('fechar')">
    <div class="modal" @click.stop>
      <h2>{{ editando ? 'Editar obra' : 'Nova obra' }}</h2>
      <div v-if="erro" class="msg erro">{{ erro }}</div>
      <form @submit.prevent="enviar">
        <label>
          Título
          <input v-model="titulo" maxlength="200" required />
        </label>
        <label>
          Ano de publicação
          <input v-model="ano" type="number" required />
        </label>
        <label>
          Editora
          <input v-model="editora" maxlength="120" />
        </label>
        <template v-if="!editando">
          <label>
            ISBN (opcional)
            <input v-model="isbn" maxlength="20" />
          </label>
          <label>
            Categoria
            <select v-model="categoriaId" required>
              <option value="">Selecione…</option>
              <option v-for="c in categorias" :key="c.id" :value="c.id">{{ c.nome }}</option>
            </select>
          </label>
          <label>
            Autores (Ctrl/Cmd para vários)
            <select v-model="autoresIds" multiple>
              <option v-for="a in autores" :key="a.id" :value="a.id">{{ a.nome }}</option>
            </select>
          </label>
        </template>
        <div class="rodape">
          <button type="button" class="sec" @click="emit('fechar')">Cancelar</button>
          <button type="submit" :disabled="salvando">{{ salvando ? 'Salvando…' : 'Salvar' }}</button>
        </div>
      </form>
    </div>
  </div>
</template>
