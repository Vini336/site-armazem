let carrinho = JSON.parse(localStorage.getItem("carrinho")) || [];

function adicionarCarrinho(id, nome, preco) {
  let itemExistente = carrinho.find(item => item.id === id);

  if (itemExistente) {
    itemExistente.qtd++;
  } else {
    carrinho.push({ id, nome, preco, qtd: 1 });
  }

  atualizarCarrinho();
}

function atualizarCarrinho() {
  const itensDiv = document.getElementById("itensCarrinho");

  if (carrinho.length === 0) {
    itensDiv.innerHTML = "<p>Carrinho vazio</p>";
    return;
  }

  let total = 0;
  let html = "";

  carrinho.forEach((item, index) => {
    total += item.preco * item.qtd;

    html += `
      <div>
        <p>${item.nome}</p>
        <p>R$ ${item.preco} x ${item.qtd}</p>
        <button onclick="removerItem(${index})">Remover</button>
      </div>
    `;
  });

  itensDiv.innerHTML = html;

  localStorage.setItem("carrinho", JSON.stringify(carrinho));
}

function removerItem(index) {
  carrinho.splice(index, 1);
  atualizarCarrinho();
}

async function finalizarCompra() {
  const nome = document.getElementById("nomeCliente").value;
  const telefone = document.getElementById("telefoneCliente").value;
  const endereco = document.getElementById("enderecoCliente").value;

  const total = carrinho.reduce((t, i) => t + i.preco * i.qtd, 0);

  const resposta = await fetch("https://site-armazem.onrender.com/pedido", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      nome,
      telefone,
      endereco,
      total,
      itens: carrinho.map(item => ({
        id: item.id,
        qtd: item.qtd
      }))
    })
  });

  if (!resposta.ok) {
    const erro = await resposta.text();
    alert(erro);
    return;
  }

  alert("Pedido realizado!");

  carrinho = [];
  localStorage.removeItem("carrinho");
  atualizarCarrinho();
}