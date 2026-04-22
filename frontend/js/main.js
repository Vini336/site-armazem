  document.addEventListener("DOMContentLoaded", () => {
  const container = document.getElementById("listaProdutos");
  const paginacao = document.getElementById("paginacao");

  let paginaAtual = 1;

  async function carregarProdutos() {
    try {
      const resposta = await fetch(`${API}/produtos?page=${paginaAtual}`);
      const data = await resposta.json();
      const produtos = data.produtos;

      container.innerHTML = "";

      produtos.forEach(produto => {
        const card = document.createElement("div");

        card.innerHTML = `
          <img src="${produto.imagem}">
          <h3>${produto.nome}</h3>
          <p>R$ ${produto.preco.toFixed(2)}</p>

          ${
            produto.estoque <= 0
              ? "<p style='color:red'>Esgotado</p>"
              : ""
          }

          <button 
            ${produto.estoque <= 0 ? "disabled" : ""}
            onclick="adicionarCarrinho('${produto.id}', '${produto.nome}', ${produto.preco})"
          >
            ${produto.estoque <= 0 ? "Esgotado" : "🛒 Adicionar"}
          </button>
        `;

        container.appendChild(card);
      });

      criarPaginacao(data.totalPaginas);

    } catch {
      container.innerHTML = "<p>Erro ao carregar produtos</p>";
    }
  }

  function criarPaginacao(totalPaginas) {
    paginacao.innerHTML = "";

    for (let i = 1; i <= totalPaginas; i++) {
      const btn = document.createElement("button");
      btn.innerText = i;

      btn.onclick = () => {
        paginaAtual = i;
        carregarProdutos();
      };

      paginacao.appendChild(btn);
    }
  }

  carregarProdutos();
});