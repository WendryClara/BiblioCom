import { createApp } from 'vue';
import { createRouter, createWebHistory } from 'vue-router';
import App from './App.vue';
import Acervo from './pages/Acervo.vue';
import Painel from './pages/Painel.vue';
import Desempenho from './pages/Desempenho.vue';
import NaoEncontrada from './pages/NaoEncontrada.vue';
import './styles.css';

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', redirect: '/acervo' },
    { path: '/acervo', component: Acervo },
    { path: '/painel', component: Painel },
    { path: '/desempenho', component: Desempenho },
    { path: '/:resto(.*)*', component: NaoEncontrada },
  ],
});

createApp(App).use(router).mount('#root');

