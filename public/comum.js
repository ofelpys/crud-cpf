// Estas funções são usadas em mais de uma página.
function mostrarMensagem(texto, tipo = '') {
  const mensagem = document.getElementById('mensagem');
  mensagem.textContent = texto;
  mensagem.className = 'mensagem ' + tipo;
}

function limparCpf(cpf) {
  return cpf.replace(/\D/g, '');
}

function formatarCpf(cpf) {
  return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
}

// fetch envia uma requisição HTTP. Conferimos o status antes de usar a resposta.
async function requisicao(url, opcoes = {}) {
  let resposta;
  try {
    resposta = await fetch(url, opcoes);
  } catch (erro) {
    throw new Error('Não foi possível conectar. Verifique se o servidor está ligado.');
  }
  const dados = await resposta.json();
  if (!resposta.ok) {
    throw new Error(dados.erro || 'Registro não encontrado ou operação indisponível.');
  }
  return dados;
}

async function buscarPorCpf(cpf) {
  cpf = limparCpf(cpf);
  if (cpf.length !== 11) throw new Error('Informe um CPF com 11 números.');
  const pessoas = await requisicao('/api/pessoas?cpf=' + encodeURIComponent(cpf));
  if (pessoas.length === 0) throw new Error('Nenhum cadastro encontrado para este CPF.');
  return pessoas[0];
}

function lerFormulario() {
  return {
    nome: document.getElementById('nome').value.trim(),
    sobrenome: document.getElementById('sobrenome').value.trim(),
    email: document.getElementById('email').value.trim(),
    idade: Number(document.getElementById('idade').value),
    telefone: document.getElementById('telefone').value.trim(),
    rua: document.getElementById('rua').value.trim(),
    bairro: document.getElementById('bairro').value.trim(),
    cidade: document.getElementById('cidade').value.trim(),
    estado: document.getElementById('estado').value,
    rg: document.getElementById('rg').value.trim(),
    cpf: limparCpf(document.getElementById('cpf').value)
  };
}
