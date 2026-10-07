// Express entrega as páginas. JSON Server lê e grava os registros no arquivo JSON.
const express = require('express');
const jsonServer = require('json-server');
const path = require('path');
const fs = require('fs');

const app = express();
// DB_FILE é opcional: permite usar um disco persistente ou um arquivo de teste.
const arquivo = process.env.DB_FILE || path.join(__dirname, 'db.json');
if (!fs.existsSync(arquivo)) {
  fs.mkdirSync(path.dirname(arquivo), { recursive: true });
  fs.writeFileSync(arquivo, JSON.stringify({ pessoas: [] }, null, 2));
}
const router = jsonServer.router(arquivo);

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.get('/api/saude', (req, res) => res.json({ status: 'ok' }));

// A busca funciona tanto com 000.000.000-00 quanto com 00000000000.
app.get('/api/pessoas', (req, res, next) => {
  if (req.query.cpf !== undefined) {
    const cpf = String(req.query.cpf).replace(/\D/g, '');
    if (!/^\d{11}$/.test(cpf)) {
      return res.status(400).json({ erro: 'Informe um CPF com 11 números.' });
    }
    return res.json(router.db.get('pessoas').filter({ cpf: cpf }).value());
  }
  next();
});

// Conferimos os dados também no servidor, antes de gravar.
app.use('/api', (req, res, next) => {
  if (!['GET', 'POST', 'PUT', 'DELETE', 'HEAD'].includes(req.method)) {
    return res.status(405).json({ erro: 'Método não permitido.' });
  }
  if (req.method !== 'POST' && req.method !== 'PUT') return next();
  const dados = req.body;
  if (!dados || typeof dados !== 'object' || Array.isArray(dados)) {
    return res.status(400).json({ erro: 'Envie os dados em formato JSON.' });
  }
  const campos = ['nome', 'sobrenome', 'email', 'telefone', 'rua', 'bairro', 'cidade', 'estado', 'rg', 'cpf'];
  for (const campo of campos) {
    if (typeof dados[campo] !== 'string' || !dados[campo].trim()) {
      return res.status(400).json({ erro: 'Preencha o campo: ' + campo + '.' });
    }
    dados[campo] = dados[campo].trim();
  }
  dados.cpf = dados.cpf.replace(/\D/g, '');
  dados.estado = dados.estado.toUpperCase();
  if (!/^\d{11}$/.test(dados.cpf)) {
    return res.status(400).json({ erro: 'O CPF precisa ter 11 números.' });
  }
  if (!Number.isInteger(dados.idade) || dados.idade < 0 || dados.idade > 130) {
    return res.status(400).json({ erro: 'Informe uma idade inteira entre 0 e 130.' });
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(dados.email)) {
    return res.status(400).json({ erro: 'Informe um e-mail válido.' });
  }
  const estados = ['AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'];
  if (!estados.includes(dados.estado)) {
    return res.status(400).json({ erro: 'Selecione um estado válido.' });
  }
  const id = req.path.split('/')[2];
  const repetido = router.db.get('pessoas').value().find(pessoa =>
    pessoa.cpf === dados.cpf && (req.method === 'POST' || String(pessoa.id) !== id)
  );
  if (repetido) return res.status(409).json({ erro: 'Este CPF já está cadastrado.' });
  // Aceitamos somente os campos do formulário. O JSON Server cuida do ID.
  req.body = {};
  for (const campo of campos) req.body[campo] = dados[campo];
  req.body.idade = dados.idade;
  next();
});

app.use('/api', router);
app.use((erro, req, res, next) => {
  if (erro.type === 'entity.parse.failed') {
    return res.status(400).json({ erro: 'O JSON enviado está incorreto.' });
  }
  console.error(erro.message);
  res.status(500).json({ erro: 'Não foi possível completar a operação.' });
});

// O Render informa a porta pela variável PORT. Localmente usamos 3000.
if (require.main === module) {
  const porta = process.env.PORT || 3000;
  app.listen(porta, '0.0.0.0', () => console.log('Servidor disponível na porta ' + porta));
}
module.exports = app;
