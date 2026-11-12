<template>
  <header class="topo">
    <strong>📚 BiblioCom</strong>
    <nav>
      <RouterLink to="/acervo" active-class="active">Acervo</RouterLink>
      <RouterLink to="/painel" active-class="active">Painel</RouterLink>
      <RouterLink to="/desempenho" active-class="active">Desempenho</RouterLink>
    </nav>
  </header>
  <main>
    <RouterView />
  </main>
</template>
