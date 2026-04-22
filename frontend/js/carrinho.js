let carrinho = JSON.parse(localStorage.getItem("carrinho")) || [];

function adicionarCarrinho(id, nome, preco) {
  const item = carrinho.find(p => p.id === id);

  if (item) {
    item.qtd++;
  } else {
    carrinho.push({ id, nome, preco, qtd: 1 });
  }

  atualizarCarrinho();
}

function removerItem(index) {
  carrinho.splice(index, 1);
  atualizarCarrinho();
}

function atualizarCarrinho() {
  const div = document.getElementById("itensCarrinho");

  if (carrinho.length === 0) {
    div.innerHTML = "<p>Vazio</p>";
    return;
  }

  let html = "";
  let total = 0;

  carrinho.forEach((item, i) => {
    total += item.preco * item.qtd;

    html += `
      <div>
        <p>${item.nome}</p>
        <p>${item.qtd}x - R$ ${item.preco}</p>
        <button onclick="removerItem(${i})">Remover</button>
      </div>
    `;
  });

  html += `<h3>Total: R$ ${total.toFixed(2)}</h3>`;

  div.innerHTML = html;

  localStorage.setItem("carrinho", JSON.stringify(carrinho));
}

atualizarCarrinho();