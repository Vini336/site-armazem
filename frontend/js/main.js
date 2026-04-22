let paginaAtual = 1;
let termoBusca = "";

async function carregarProdutos() {
  const container = document.getElementById("listaProdutos");
  const paginacao = document.getElementById("paginacao");

  try {
    const res = await fetch(
      `${API}/produtos?page=${paginaAtual}&busca=${termoBusca}`
    );

    const data = await res.json();

    container.innerHTML = "";

    data.produtos.forEach(p => {
      const card = document.createElement("div");
      card.className = "card";

      card.innerHTML = `
        <img src="${p.imagem || '/img/sem-imagem.png'}">
        <h4>${p.nome}</h4>
        <p class="preco">R$ ${Number(p.preco).toFixed(2)}</p>

        ${p.estoque <= 0 ? "<p style='color:red'>Esgotado</p>" : ""}

        <button 
          ${p.estoque <= 0 ? "disabled" : ""}
          onclick="adicionarCarrinho('${p.id}', '${p.nome}', ${p.preco})"
        >
          ${p.estoque <= 0 ? "Esgotado" : "Adicionar"}
        </button>
      `;

      container.appendChild(card);
    });

    // PAGINAÇÃO
    paginacao.innerHTML = "";

    for (let i = 1; i <= data.totalPaginas; i++) {
      const btn = document.createElement("button");
      btn.innerText = i;

      btn.onclick = () => {
        paginaAtual = i;
        carregarProdutos();
      };

      paginacao.appendChild(btn);
    }

  } catch (e) {
    container.innerHTML = "Erro ao carregar";
  }
}

function buscarProdutos() {
  termoBusca = document.getElementById("busca").value;
  paginaAtual = 1;
  carregarProdutos();
}

carregarProdutos();