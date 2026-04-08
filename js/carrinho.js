let carrinho = JSON.parse(localStorage.getItem("carrinho")) || [];

function abrirCarrinho() {
  document.getElementById("carrinhoLateral").classList.add("ativo");
}

function fecharCarrinho() {
  document.getElementById("carrinhoLateral").classList.remove("ativo");
}

document.addEventListener("click", function (e) {
  let carrinhoDiv = document.getElementById("carrinhoLateral");

  if (
    carrinhoDiv.classList.contains("ativo") &&
    !carrinhoDiv.contains(e.target) &&
    !e.target.closest(".btn-carrinho")
  ) {
    fecharCarrinho();
  }
});

function adicionarCarrinho(nome, preco) {
  let itemExistente = carrinho.find(item => item.nome === nome);

  if (itemExistente) {
    itemExistente.qtd++;
  } else {
    carrinho.push({ nome, preco, qtd: 1 });
  }

  atualizarCarrinho();
  mostrarNotificacao();
}

function atualizarCarrinho() {
  const itensDiv = document.getElementById("itensCarrinho");

   if (carrinho.length === 0) {

    itensDiv.innerHTML = "<p>Seu carrinho está vazio 🛒<br>Adicione produtos para continuar</p>";

    document.getElementById("contadorCarrinho").innerText = 0;
    document.getElementById("contadorFlutuante").innerText = 0;

    atualizarTotalFinal();
    return;
  }

  let total = 0;
  let html = "";

  carrinho.forEach((item, index) => {
    total += item.preco * item.qtd;

    html += `
      <div style="padding:10px; border-bottom:1px solid #ccc;">
        <p>${item.nome}</p>
        <strong>R$ ${item.preco.toFixed(2)} x ${item.qtd}</strong>
        <br>
        <button onclick="removerItem(${index})"
          style="margin-top:5px; background:red; color:white; border:none; padding:5px; border-radius:4px;">
          Remover
        </button>
      </div>
    `;
  });

  itensDiv.innerHTML = html;

  // CONTADORES
  const totalItens = carrinho.reduce((t, i) => t + i.qtd, 0);

  document.getElementById("contadorCarrinho").innerText = totalItens; // ✅ topo
  document.getElementById("contadorFlutuante").innerText = totalItens; // ✅ flutuante

  localStorage.setItem("carrinho", JSON.stringify(carrinho));

  atualizarTotalFinal();
}

function removerItem(index) {
  if (carrinho[index].qtd > 1) {
    carrinho[index].qtd--;
  } else {
    carrinho.splice(index, 1);
  }

  alert("Produto removido do carrinho 🗑️");

  atualizarCarrinho();
}

function mostrarNotificacao() {
  const notif = document.getElementById("notificacao");

  notif.classList.add("ativo");

  setTimeout(() => {
    notif.classList.remove("ativo");
  }, 2000);
}

function limparCarrinho() {

  if (carrinho.length === 0) {
    alert("O carrinho já está vazio 🛒");
    return;
  }

  const confirmar = confirm("Deseja limpar todo o carrinho?");

  if (!confirmar) return;

  carrinho = [];
  atualizarCarrinho();

  alert("Carrinho limpo com sucesso 🗑️");
}