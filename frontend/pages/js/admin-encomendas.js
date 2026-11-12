const API_ENCOMENDAS = "http://200.133.17.234:5000";

async function carregarEncomendas() {
  const tipo     = document.getElementById("filtro-tipo").value;
  const pesoMin  = document.getElementById("filtro-peso-min").value || 0;
  const pesoMax  = document.getElementById("filtro-peso-max").value || 9999;

  let url = `${API_ENCOMENDAS}/encomendas?pesoMin=${pesoMin}&pesoMax=${pesoMax}`;
  if (tipo) url += `&tipo=${tipo}`;

  const res        = await fetch(url); 
  const encomendas = await res.json();

  const tbody = document.querySelector("#tabela-encomendas tbody");
  tbody.innerHTML = "";
  encomendas.forEach(e => {
    tbody.insertAdjacentHTML(
      "beforeend",
      `<tr>
         <td>${e.peso}</td>
         <td>${e.tipo}</td>
         <td>${e.descricao || "-"}</td>
         <td>${e.enderecoEntrega}</td>
       </tr>`
    );
  });
}

document.addEventListener("DOMContentLoaded", () => {
  carregarEncomendas(); 

  document.getElementById("btn-filtrar-encomendas")
          .addEventListener("click", carregarEncomendas);

  document.getElementById("form-encomendas").addEventListener("submit", async (e) => {
    e.preventDefault();
    const encomenda = {
      peso: parseFloat(document.getElementById("peso").value),
      tipo: document.getElementById("tipo").value,
      descricao: document.getElementById("descricao").value,
      enderecoEntrega: document.getElementById("endereco-entrega").value
    };
    await fetch(`${API_ENCOMENDAS}/encomendas`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(encomenda)
    });
    e.target.reset();
    carregarEncomendas();
  });
});
