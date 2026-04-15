document.addEventListener("DOMContentLoaded", () => {
    const container = document.getElementById("listaProdutos");

    async function carregarProdutos() {
        try {
            const resposta = await fetch("https://site-armazem.onrender.com/produtos");
            const produtos = await resposta.json();

            console.log("Produtos recebidos:", produtos);

            container.innerHTML = "";

            if (!produtos.length) {
                container.innerHTML = "<p>Nenhum produto encontrado</p>";
                return;
            }

            produtos.forEach(produto => {
                console.log("Produto individual:", produto);

                const nome = produto.nome || "Sem nome";
                const preco = produto.preco || 0;
                const imagem = produto.imagem || "img/sem-imagem.png";

                const card = document.createElement("div");
                card.classList.add("produto-card");

                card.innerHTML = `
                    <img src="${imagem}" onerror="this.src='img/sem-imagem.png'">
                    <h3>${nome}</h3>
                    <p class="preco">R$ ${preco.toFixed(2)}</p>
                    <button class="btn-add">🛒 Adicionar</button>
                    <button class="btn-whatsapp">💬 WhatsApp</button>
                `;

                container.appendChild(card);
            });

        } catch (erro) {
            console.error("Erro ao carregar produtos:", erro);
            container.innerHTML = "<p>Erro ao carregar produtos</p>";
        }
    }

    carregarProdutos();
});