let paginaAtual = 1;
let termoBusca = "";
let categoriaSelecionada = "";

const container = document.getElementById("listaProdutos");
const paginacao = document.getElementById("paginacao");

// 🔥 debounce (evita várias requisições)
let timeoutBusca;

function debounceBusca(valor) {
  clearTimeout(timeoutBusca);

  timeoutBusca = setTimeout(() => {
    termoBusca = valor;
    paginaAtual = 1;
    carregarProdutos();
  }, 400);
}

async function carregarProdutos() {
  try {
    const res = await fetch(
      `${API}/produtos?page=${paginaAtual}&busca=${termoBusca}&categoria=${categoriaSelecionada}`
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

        <button ${p.estoque <= 0 ? "disabled" : ""}>
          ${p.estoque <= 0 ? "Esgotado" : "Adicionar"}
        </button>
      `;

      // 🔥 botão adicionar (sem onclick)
      const btn = card.querySelector("button");

      if (p.estoque > 0) {
        btn.addEventListener("click", () => {
          adicionarCarrinho(p.id, p.nome, p.preco);
        });
      }

      container.appendChild(card);
    });

    // 🔥 PAGINAÇÃO
    paginacao.innerHTML = "";

    for (let i = 1; i <= data.totalPaginas; i++) {
      const btn = document.createElement("button");
      btn.innerText = i;

      btn.addEventListener("click", () => {
        paginaAtual = i;
        carregarProdutos();
      });

      paginacao.appendChild(btn);
    }

  } catch (e) {
    container.innerHTML = "Erro ao carregar";
  }
}

// 🔥 EVENTOS (AGORA SIM CORRETO)
document.getElementById("busca").addEventListener("input", (e) => {
  debounceBusca(e.target.value);
});

document.getElementById("categoria").addEventListener("change", (e) => {
  categoriaSelecionada = e.target.value;
  paginaAtual = 1;
  carregarProdutos();
});

// 🔥 iniciar
carregarProdutos();