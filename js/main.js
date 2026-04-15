document.addEventListener("DOMContentLoaded", () => {
    const container = document.getElementById("listaProdutos");
    const paginacao = document.getElementById("paginacao");

    let paginaAtual = 1;

    async function carregarProdutos() {
        try {
            const resposta = await fetch(
                `https://site-armazem.onrender.com/produtos?page=${paginaAtual}`
            );

            const data = await resposta.json();
            const produtos = data.produtos;

            console.log("Produtos recebidos:", produtos);

            container.innerHTML = "";

            if (!produtos.length) {
                container.innerHTML = "<p>Nenhum produto encontrado</p>";
                return;
            }

            produtos.forEach(produto => {
                const nome = produto.nome || "Sem nome";
                const preco = Number(produto.preco) || 0;

                const imagem = (produto.imagem && produto.imagem.startsWith("http"))
                    ? produto.imagem
                    : "https://i.imgur.com/1X6ZQZg.png";

                const card = document.createElement("div");
                card.classList.add("produto-card");

                card.innerHTML = `
                    <img src="${imagem}" 
                         onerror="this.src='https://i.imgur.com/1X6ZQZg.png'">
                    <h3>${nome}</h3>
                    <p class="preco">R$ ${preco.toFixed(2)}</p>
                    <button class="btn-add">🛒 Adicionar</button>
                    <button class="btn-whatsapp">💬 WhatsApp</button>
                `;

                container.appendChild(card);
            });

            criarPaginacao(data.totalPaginas);

        } catch (erro) {
            console.error("Erro ao carregar produtos:", erro);
            container.innerHTML = "<p>Erro ao carregar produtos</p>";
        }
    }

    function criarPaginacao(totalPaginas) {
        paginacao.innerHTML = "";

        for (let i = 1; i <= totalPaginas; i++) {
            const btn = document.createElement("button");
            btn.innerText = i;

            if (i === paginaAtual) {
                btn.style.background = "#ffd700";
            }

            btn.onclick = () => {
                paginaAtual = i;
                carregarProdutos();
            };

            paginacao.appendChild(btn);
        }
    }

    carregarProdutos();
});