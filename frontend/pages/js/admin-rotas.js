const API_ROTAS = "http://200.133.17.234:5000";

async function carregarRotas() {
  const origem   = document.getElementById("filtro-origem").value.trim();
  const destino  = document.getElementById("filtro-destino").value.trim();
  let url = `${API_ROTAS}/rotas`;
  const q = [];
  if (origem)  q.push(`origem=${encodeURIComponent(origem)}`);
  if (destino) q.push(`destino=${encodeURIComponent(destino)}`);
  if (q.length) url += "?" + q.join("&");

  const rotas = await fetch(url).then(r => r.json());
  const tbody = document.querySelector("#tabela-rotas tbody");
  tbody.innerHTML = "";
  rotas.forEach(r => tbody.insertAdjacentHTML(
    "beforeend",
    `<tr><td>${r.origem}</td><td>${r.destino}</td><td>${r.distancia}</td><td>${r.tempoEstimado || "-"}</td></tr>`));
}

document.addEventListener("DOMContentLoaded", () => {
  carregarRotas();
  document.getElementById("btn-filtrar-rotas")
          .addEventListener("click", carregarRotas);

  document.getElementById("form-rotas").addEventListener("submit", async e => {
    e.preventDefault();
    const rota = {
      origem:     document.getElementById("origem").value,
      destino:    document.getElementById("destino").value,
      distancia:  parseFloat(document.getElementById("distancia").value),
      tempoEstimado: parseFloat(document.getElementById("tempo").value) || null
    };
    await fetch(`${API_ROTAS}/rotas`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(rota)
    });
    e.target.reset();
    carregarRotas();
  });
});
