const corpo = document.getElementById('tabela-corpo');
const campos = ['nome', 'sobrenome', 'cpf', 'email', 'idade', 'telefone', 'rua', 'bairro', 'cidade', 'estado', 'rg'];

async function listarPessoas(cpf = '') {
  corpo.replaceChildren();
  mostrarMensagem('Carregando cadastros...');
  document.getElementById('buscar').disabled = true;
  document.getElementById('listar').disabled = true;
  try {
    const url = cpf ? '/api/pessoas?cpf=' + encodeURIComponent(limparCpf(cpf)) : '/api/pessoas';
    const pessoas = await requisicao(url);
    document.getElementById('quantidade').textContent = pessoas.length + ' cadastro(s) encontrado(s)';
    for (const pessoa of pessoas) {
      const linha = document.createElement('tr');
      for (const campo of campos) {
        const celula = document.createElement('td');
        // textContent mostra os dados como texto, sem executar HTML digitado.
        celula.textContent = campo === 'cpf' ? formatarCpf(pessoa.cpf) : pessoa[campo];
        linha.appendChild(celula);
      }
      const acoes = document.createElement('td');
      for (const operacao of ['put', 'delete']) {
        const link = document.createElement('a');
        link.href = '/' + operacao + '/' + operacao + '.html?cpf=' + encodeURIComponent(pessoa.cpf);
        link.textContent = operacao === 'put' ? 'Editar' : 'Excluir';
        acoes.appendChild(link);
      }
      linha.appendChild(acoes);
      corpo.appendChild(linha);
    }
    mostrarMensagem(pessoas.length ? '' : 'Nenhum cadastro encontrado. Use a página Cadastrar para adicionar uma pessoa.');
  } catch (erro) {
    document.getElementById('quantidade').textContent = 'Não foi possível carregar os cadastros';
    mostrarMensagem(erro.message, 'erro');
  } finally {
    document.getElementById('buscar').disabled = false;
    document.getElementById('listar').disabled = false;
  }
}
document.getElementById('form-busca').addEventListener('submit', function (evento) {
  evento.preventDefault();
  listarPessoas(document.getElementById('cpf-busca').value);
});
document.getElementById('listar').addEventListener('click', function () {
  document.getElementById('cpf-busca').value = '';
  listarPessoas();
});
listarPessoas();
