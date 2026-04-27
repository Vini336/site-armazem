let carrinho = JSON.parse(localStorage.getItem("carrinho")) || [];

const carrinhoDiv = document.getElementById("carrinho");
const overlay = document.getElementById("overlay");
const itensDiv = document.getElementById("itensCarrinho");
const btnCarrinho = document.getElementById("btnCarrinho");

// 🔥 ADICIONAR
function adicionarCarrinho(id, nome, preco) {
  const item = carrinho.find(p => p.id === id);

  if (item) {
    item.qtd++;
  } else {
    carrinho.push({ id, nome, preco, qtd: 1 });
  }

  atualizarCarrinho();
}

// 🔥 REMOVER
function removerItem(index) {
  carrinho.splice(index, 1);
  atualizarCarrinho();
}

// 🔥 ATUALIZAR UI
function atualizarCarrinho() {
  if (!itensDiv) return;

  itensDiv.innerHTML = "";

  if (carrinho.length === 0) {
    itensDiv.innerHTML = "<p>Vazio</p>";
    return;
  }

  let total = 0;

  carrinho.forEach((item, i) => {
    total += item.preco * item.qtd;

    const div = document.createElement("div");

    div.innerHTML = `
      <p>${item.nome}</p>
      <p>${item.qtd}x - R$ ${item.preco}</p>
    `;

    const btn = document.createElement("button");
    btn.innerText = "Remover";

    btn.addEventListener("click", () => {
      removerItem(i);
    });

    div.appendChild(btn);
    itensDiv.appendChild(div);
  });

  const totalEl = document.createElement("h3");
  totalEl.innerText = `Total: R$ ${total.toFixed(2)}`;

  itensDiv.appendChild(totalEl);

  localStorage.setItem("carrinho", JSON.stringify(carrinho));
}

// 🔥 ABRIR
function abrirCarrinho() {
  carrinhoDiv.classList.add("ativo");
  overlay.classList.add("ativo");
}

// 🔥 FECHAR
function fecharCarrinho() {
  carrinhoDiv.classList.remove("ativo");
  overlay.classList.remove("ativo");
}

// 🔥 EVENTOS (AGORA CORRETO)
btnCarrinho.addEventListener("click", abrirCarrinho);

overlay.addEventListener("click", fecharCarrinho);

// 🔥 INICIAR
atualizarCarrinho();