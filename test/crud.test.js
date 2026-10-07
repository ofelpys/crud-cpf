// Os testes usam um arquivo temporário, sem alterar o db.json do projeto.
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const os = require('os');
const path = require('path');

test('CRUD completo, busca, validação e gravação no arquivo', async () => {
  const pasta = fs.mkdtempSync(path.join(os.tmpdir(), 'crud-cpf-'));
  process.env.DB_FILE = path.join(pasta, 'db.json');
  const app = require('../server');
  const servidor = app.listen(0, '127.0.0.1');
  await new Promise(resolve => servidor.once('listening', resolve));
  const base = 'http://127.0.0.1:' + servidor.address().port;
  async function enviar(metodo, rota, dados) {
    return fetch(base + rota, {
      method: metodo,
      headers: { 'Content-Type': 'application/json' },
      body: dados === undefined ? undefined : JSON.stringify(dados)
    });
  }
  const pessoa = {
    nome: 'Pessoa', sobrenome: 'Teste', email: 'teste@example.com', idade: 22,
    telefone: '(11) 90000-0000', rua: 'Rua de Teste', bairro: 'Centro',
    cidade: 'São Paulo', estado: 'SP', rg: 'TESTE-01', cpf: '000.000.000-01'
  };
  try {
    for (const rota of ['/', '/post/post.html', '/get/get.html', '/put/put.html', '/delete/delete.html', '/style.css', '/comum.js', '/post/post.js', '/get/get.js', '/put/put.js', '/delete/delete.js']) {
      assert.equal((await fetch(base + rota)).status, 200, rota);
    }
    assert.equal((await fetch(base + '/db.json')).status, 404);
    assert.deepEqual(await (await fetch(base + '/api/pessoas')).json(), []);
    let resposta = await enviar('POST', '/api/pessoas', pessoa);
    assert.equal(resposta.status, 201);
    const criada = await resposta.json();
    assert.equal(criada.cpf, '00000000001');
    assert.equal(typeof criada.idade, 'number');
    assert.equal((await enviar('POST', '/api/pessoas', pessoa)).status, 409);
    for (const cpf of ['00000000001', '000.000.000-01']) {
      const resultado = await (await fetch(base + '/api/pessoas?cpf=' + cpf)).json();
      assert.equal(resultado[0].id, criada.id);
    }
    assert.deepEqual(await (await fetch(base + '/api/pessoas?cpf=00000000009')).json(), []);
    assert.equal((await fetch(base + '/api/pessoas?cpf=123')).status, 400);
    for (const invalida of [{ nome: '' }, { idade: -1 }, { idade: 2.5 }, { idade: '22' }, { cpf: '123' }, { email: 'invalido' }, { estado: 'ZZ' }]) {
      assert.equal((await enviar('POST', '/api/pessoas', { ...pessoa, ...invalida })).status, 400);
    }
    resposta = await enviar('PUT', '/api/pessoas/' + criada.id, { ...pessoa, nome: 'Pessoa editada', idade: 23 });
    assert.equal(resposta.status, 200);
    assert.equal((await resposta.json()).nome, 'Pessoa editada');
    const segunda = await (await enviar('POST', '/api/pessoas', { ...pessoa, cpf: '00000000002' })).json();
    assert.equal((await enviar('PUT', '/api/pessoas/' + segunda.id, pessoa)).status, 409);
    // Um CPF alterado deve ser encontrado apenas pelo novo valor.
    resposta = await enviar('PUT', '/api/pessoas/' + criada.id, { ...pessoa, cpf: '00000000003' });
    assert.equal(resposta.status, 200);
    assert.deepEqual(await (await fetch(base + '/api/pessoas?cpf=00000000001')).json(), []);
    const gravadas = JSON.parse(fs.readFileSync(process.env.DB_FILE, 'utf8')).pessoas;
    assert.equal(gravadas.length, 2);
    assert.equal(gravadas[0].cpf, '00000000003');
    assert.equal(gravadas[0].rua, pessoa.rua);
    assert.equal((await enviar('DELETE', '/api/pessoas/' + criada.id)).status, 200);
    assert.equal((await fetch(base + '/api/pessoas/' + criada.id)).status, 404);
    assert.equal((await enviar('PUT', '/api/pessoas/999999', { ...pessoa, cpf: '00000000004' })).status, 404);
    assert.equal((await enviar('DELETE', '/api/pessoas/999999')).status, 404);
    assert.equal((await enviar('DELETE', '/api/pessoas/' + segunda.id)).status, 200);
    assert.deepEqual(JSON.parse(fs.readFileSync(process.env.DB_FILE, 'utf8')).pessoas, []);
  } finally {
    await new Promise(resolve => servidor.close(resolve));
    fs.rmSync(pasta, { recursive: true });
  }
});
