let idSelecionado = null;
const formulario = document.getElementById('formulario');
const busca = document.getElementById('cpf-busca');

async function carregarPessoa() {
  idSelecionado = null;
  formulario.hidden = true;
  busca.disabled = true;
  document.getElementById('buscar').disabled = true;
  mostrarMensagem('Buscando cadastro...');
  try {
    const pessoa = await buscarPorCpf(busca.value);
    idSelecionado = pessoa.id;
    for (const campo of ['nome', 'sobrenome', 'cpf', 'email', 'idade', 'telefone', 'rua', 'bairro', 'cidade', 'estado', 'rg']) {
      document.getElementById(campo).value = pessoa[campo];
    }
    formulario.hidden = false;
    mostrarMensagem('Cadastro encontrado. Edite os campos e salve.');
  } catch (erro) {
    mostrarMensagem(erro.message, 'erro');
  } finally {
    busca.disabled = false;
    document.getElementById('buscar').disabled = false;
  }
}
document.getElementById('form-busca').addEventListener('submit', function (evento) {
  evento.preventDefault();
  carregarPessoa();
});
busca.addEventListener('input', function () {
  idSelecionado = null;
  formulario.hidden = true;
  mostrarMensagem('Busque o CPF para carregar o cadastro.');
});
formulario.addEventListener('submit', async function (evento) {
  evento.preventDefault();
  if (idSelecionado === null) return;
  const dados = lerFormulario();
  document.getElementById('salvar').disabled = true;
  document.getElementById('buscar').disabled = true;
  busca.disabled = true;
  try {
    await requisicao('/api/pessoas/' + idSelecionado, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dados)
    });
    busca.value = dados.cpf;
    mostrarMensagem('Cadastro atualizado com sucesso!', 'sucesso');
  } catch (erro) {
    mostrarMensagem(erro.message, 'erro');
  } finally {
    document.getElementById('salvar').disabled = false;
    document.getElementById('buscar').disabled = false;
    busca.disabled = false;
  }
});
// O link da página Consultar pode trazer o CPF na URL.
const cpfUrl = new URLSearchParams(window.location.search).get('cpf');
if (cpfUrl) {
  busca.value = cpfUrl;
  carregarPessoa();
}
