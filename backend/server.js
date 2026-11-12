const express = require('express');
const cors = require('cors');
const app = express();
app.use(express.json());

app.use(cors());
app.use(express.json());

// Dados simulados em memória
let clientes = [];
let encomendas = [];
let rotas = [];
let entregas = [];
let historicoEntregas = {}; // { entregaId: [ { data, status } ] }

let idCounter = 1;
const gerarId = () => idCounter++;

// CLIENTES
app.get('/api/clientes', (req, res) => {
  const { nome, cpfCnpj } = req.query;
  let resultado = clientes;
  if (nome) resultado = resultado.filter(c => c.nome.includes(nome));
  if (cpfCnpj) resultado = resultado.filter(c => c.cpfCnpj.includes(cpfCnpj));
  res.json(resultado);
});

app.post('/api/clientes', (req, res) => {
  const novo = { id: gerarId(), ...req.body };
  clientes.push(novo);
  res.status(201).json(novo);
});

// ENCOMENDAS
app.get('/api/encomendas', (req, res) => {
  const { tipo, pesoMin = 0, pesoMax = 99999 } = req.query;
  let resultado = encomendas.filter(e => e.peso >= pesoMin && e.peso <= pesoMax);
  if (tipo) resultado = resultado.filter(e => e.tipo === tipo);
  res.json(resultado);
});

app.post('/api/encomendas', (req, res) => {
  const novo = { id: gerarId(), ...req.body };
  encomendas.push(novo);
  res.status(201).json(novo);
});

// ROTAS
app.get('/api/rotas', (req, res) => {
  const { origem, destino } = req.query;
  let resultado = rotas;
  if (origem) resultado = resultado.filter(r => r.origem.includes(origem));
  if (destino) resultado = resultado.filter(r => r.destino.includes(destino));
  res.json(resultado);
});

app.post('/api/rotas', (req, res) => {
  const novo = { id: gerarId(), ...req.body };
  rotas.push(novo);
  res.status(201).json(novo);
});

// ENTREGAS
app.get('/api/entregas', (req, res) => {
  const { cliente, rota, dataEstimada, status } = req.query;
  let resultado = entregas;
  if (cliente) resultado = resultado.filter(e => e.clienteId == cliente);
  if (rota) resultado = resultado.filter(e => e.rotaId == rota);
  if (dataEstimada) resultado = resultado.filter(e => e.dataEstimada === dataEstimada);
  if (status) resultado = resultado.filter(e => e.status === status);

  resultado = resultado.map(e => ({
    ...e,
    clienteNome: clientes.find(c => c.id == e.clienteId)?.nome,
    encomendaDescricao: encomendas.find(en => en.id == e.encomendaId)?.descricao,
    rotaResumo: `${rotas.find(r => r.id == e.rotaId)?.origem} → ${rotas.find(r => r.id == e.rotaId)?.destino}`,
  }));

  res.json(resultado);
});

app.post('/api/entregas', (req, res) => {
  const novo = { id: gerarId(), status: 'em_preparo', ...req.body };
  entregas.push(novo);
  historicoEntregas[novo.id] = [
    { data: new Date().toISOString().split('T')[0], status: 'em_preparo' }
  ];
  res.status(201).json(novo);
});

// RASTREAMENTO
app.get('/api/entregas/:id', (req, res) => {
  const entrega = entregas.find(e => e.id == req.params.id);
  if (!entrega) return res.status(404).json({ erro: 'Entrega não encontrada' });
  res.json(entrega);
});

app.get('/api/entregas/:id/historico', (req, res) => {
  const historico = historicoEntregas[req.params.id];
  if (!historico) return res.status(404).json({ erro: 'Histórico não encontrado' });
  res.json(historico);
});

app.use(express.static('pages'));

app.listen(5500, () => {
  console.log(`Servidor rodando em http://localhost:5500`);
});
