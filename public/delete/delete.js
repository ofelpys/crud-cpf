let pessoaSelecionada = null;
const busca = document.getElementById('cpf-busca');
const resultado = document.getElementById('resultado');

async function carregarPessoa() {
  pessoaSelecionada = null;
  resultado.hidden = true;
  busca.disabled = true;
  document.getElementById('buscar').disabled = true;
  mostrarMensagem('Buscando cadastro...');
  try {
    pessoaSelecionada = await buscarPorCpf(busca.value);
    document.getElementById('nome-pessoa').textContent = pessoaSelecionada.nome + ' ' + pessoaSelecionada.sobrenome;
    document.getElementById('cpf-pessoa').textContent = formatarCpf(pessoaSelecionada.cpf);
    document.getElementById('email-pessoa').textContent = pessoaSelecionada.email;
    resultado.hidden = false;
    mostrarMensagem('Confira os dados antes de excluir.');
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
  pessoaSelecionada = null;
  resultado.hidden = true;
  mostrarMensagem('Busque o CPF para carregar o cadastro.');
});
document.getElementById('excluir').addEventListener('click', async function () {
  if (!pessoaSelecionada) return;
  if (!confirm('Excluir o cadastro de ' + pessoaSelecionada.nome + '? Esta ação não pode ser desfeita.')) return;
  this.disabled = true;
  busca.disabled = true;
  document.getElementById('buscar').disabled = true;
  try {
    await requisicao('/api/pessoas/' + pessoaSelecionada.id, { method: 'DELETE' });
    pessoaSelecionada = null;
    resultado.hidden = true;
    busca.value = '';
    mostrarMensagem('Cadastro excluído com sucesso.', 'sucesso');
  } catch (erro) {
    mostrarMensagem(erro.message, 'erro');
  } finally {
    this.disabled = false;
    busca.disabled = false;
    document.getElementById('buscar').disabled = false;
  }
});
const cpfUrl = new URLSearchParams(window.location.search).get('cpf');
if (cpfUrl) {
  busca.value = cpfUrl;
  carregarPessoa();
}
