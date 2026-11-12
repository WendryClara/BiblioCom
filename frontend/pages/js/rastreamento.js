const API_ENTREGAS = 'http://200.133.17.234:5000';

document.getElementById('form-rastreamento').addEventListener('submit', async (e) => {
  e.preventDefault();
  const codigo = document.getElementById('codigo').value.trim();
  if (!codigo) return;

  try {
    // 1. Buscar todas as entregas
    const entregas = await fetch(`${API_ENTREGAS}/entregas`).then(r => r.json());

    // 2. Procurar a entrega com o código informado
    const entrega = entregas.find(e => e.codigo_rastreamento === codigo);

    if (!entrega) {
      alert('Código de rastreamento não encontrado.');
      return;
    }

    // 3. Mostrar o status
    document.getElementById('status').textContent = entrega.status || 'Status não disponível';

    // 4. Mostrar o histórico (já vem direto no objeto no seu db.json!)
    const ul = document.getElementById('historico');
    ul.innerHTML = '';
    if (entrega.historico && entrega.historico.length) {
      entrega.historico.forEach(h => {
        const li = document.createElement('li');
        li.textContent = `${h.data} - ${h.status} (${h.local || 'sem local'})`;
        ul.appendChild(li);
      });
    } else {
      ul.innerHTML = '<li>Sem histórico disponível</li>';
    }
  } catch (error) {
    alert('Erro ao buscar rastreamento');
    console.error(error);
  }
});