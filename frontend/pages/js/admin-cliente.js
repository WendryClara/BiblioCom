const BASE = "http://200.133.17.234:5000";  

document.addEventListener("DOMContentLoaded", () => {
  carregarClientes();

  // cadastrar
  document.getElementById("form-clientes").addEventListener("submit", async (e) => {
    e.preventDefault();
    const novo = {
      nome:     document.getElementById("nome").value.trim(),
      cpfCnpj:  document.getElementById("cpfCnpj").value.trim(),
      email:    document.getElementById("email").value.trim(),
      endereco: document.getElementById("endereco").value.trim()
    };
    await fetch(`${BASE}/clientes`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(novo)
    });
    e.target.reset();
    carregarClientes();
  });

  // filtros
  document.getElementById("btn-filtrar-clientes")
          .addEventListener("click", carregarClientes);
});

async function carregarClientes() {
  const nome = document.getElementById("filtro-nome").value.trim();
  const cpf  = document.getElementById("filtro-cpf").value.trim();
  let url = `${BASE}/clientes`;
  const q = [];
  if (nome) q.push(`nome=${encodeURIComponent(nome)}`);
  if (cpf)  q.push(`cpfCnpj=${encodeURIComponent(cpf)}`);
  if (q.length) url += "?" + q.join("&");

  const lista = await fetch(url).then(r => r.json());
  console.log("clientes carregados:", lista);   // DEBUG

  const tbody = document.querySelector("#tabela-clientes tbody");
  tbody.innerHTML = "";
  lista.forEach(c => {
    tbody.insertAdjacentHTML(
      "beforeend",
      `<tr>
         <td>${c.nome}</td>
         <td>${c.cpfCnpj}</td>
         <td>${c.email}</td>
         <td>${c.endereco}</td>
       </tr>`
    );
  });
}