const formulario = document.getElementById('formulario');

formulario.addEventListener('submit', async function (evento) {
  evento.preventDefault(); // Evita recarregar a página ao enviar o formulário.
  const botao = document.getElementById('salvar');
  botao.disabled = true;
  mostrarMensagem('Salvando cadastro...');
  try {
    await requisicao('/api/pessoas', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(lerFormulario())
    });
    formulario.reset();
    mostrarMensagem('Cadastro realizado! Acesse Consultar para visualizar.', 'sucesso');
  } catch (erro) {
    mostrarMensagem(erro.message, 'erro');
  } finally {
    botao.disabled = false;
  }
});
