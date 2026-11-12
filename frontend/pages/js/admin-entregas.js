const API_ENTREGAS = "http://200.133.17.234:5000";

async function preencherSelect(id, endpoint, texto) {
  const lista   = await fetch(`${API_ENTREGAS}${endpoint}`).then(r => r.json());
  const select  = document.getElementById(id);
  select.innerHTML = "<option value=''>Selecione</option>";
  lista.forEach(obj => {
    const opt = document.createElement("option");
    opt.value = obj.id || obj._id || obj.nome || obj.descricao || obj.origem;
    opt.textContent = texto(obj);
    select.appendChild(opt);
  });
}

async function carregarOpcoes() {
  await preencherSelect("cliente",
                        "/clientes",
                        c => `${c.nome} (${c.cpfCnpj})`);
  await preencherSelect("encomenda",
                        "/encomendas",
                        e => `${e.tipo} - ${e.peso}kg`);
  await preencherSelect("rota",
                        "/rotas",
                        r => `${r.origem} → ${r.destino}`);
}

async function carregarEntregas() {
  const cli   = document.getElementById("filtro-cliente").value.trim();
  const rota  = document.getElementById("filtro-rota").value.trim();
  const data  = document.getElementById("filtro-data").value;
  const stat  = document.getElementById("filtro-status").value;

  let url = `${API_ENTREGAS}/entregas`;
  const q = [];
  if (cli)  q.push(`cliente=${encodeURIComponent(cli)}`);
  if (rota) q.push(`rota=${encodeURIComponent(rota)}`);
  if (data) q.push(`data=${data}`);
  if (stat) q.push(`status=${stat}`);
  if (q.length) url += "?" + q.join("&");

  const entregas = await fetch(url).then(r => r.json());
  const tbody = document.querySelector("#tabela-entregas tbody");
  tbody.innerHTML = "";
  entregas.forEach(e => tbody.insertAdjacentHTML(
    "beforeend",
    `<tr><td>${e.cliente}</td><td>${e.encomenda}</td><td>${e.rota}</td><td>${e.dataEstimada}</td><td>${e.status || "em_preparo"}</td></tr>`));
}

document.addEventListener("DOMContentLoaded", async () => {
  await carregarOpcoes();
  carregarEntregas();

  document.getElementById("btn-filtrar-entregas")
          .addEventListener("click", carregarEntregas);

  document.getElementById("form-entregas").addEventListener("submit", async e => {
    e.preventDefault();
    const nova = {
      cliente: document.getElementById("cliente").value,
      encomenda: document.getElementById("encomenda").value,
      rota: document.getElementById("rota").value,
      dataEstimada: document.getElementById("data-estimada").value
    };
    await fetch(`${API_ENTREGAS}/entregas`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(nova)
    });
    e.target.reset();
    carregarEntregas();
  });
});
