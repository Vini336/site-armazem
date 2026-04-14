const API = "http://localhost:3000";

let pagina = 1;
let carregando = false;
let acabou = false;

// 🔥 QUANDO SITE CARREGAR
document.addEventListener("DOMContentLoaded", () => {
  console.log("Site carregado 🚀");

  carregarProdutos();
  atualizarUsuario();

  const busca = document.getElementById("busca");

  // 🔥 PREENCHER AUTOMÁTICO
  document.getElementById("nomeCliente").value =
    localStorage.getItem("nomeCliente") || "";

  document.getElementById("telefoneCliente").value =
    localStorage.getItem("telefoneCliente") || "";

  document.getElementById("enderecoCliente").value =
    localStorage.getItem("enderecoCliente") || "";

  // 🔥 SALVAR AUTOMÁTICO
  document.getElementById("nomeCliente").addEventListener("input", e => {
    localStorage.setItem("nomeCliente", e.target.value);
  });

  document.getElementById("telefoneCliente").addEventListener("input", e => {
    localStorage.setItem("telefoneCliente", e.target.value);
  });

  document.getElementById("enderecoCliente").addEventListener("input", e => {
    localStorage.setItem("enderecoCliente", e.target.value);
  });

  if (busca) {
    busca.addEventListener("input", function () {
  const termo = this.value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

  const cards = document.querySelectorAll(".card");

  let encontrou = false;

  cards.forEach(card => {
    const nome = card.querySelector("h3").innerText
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");

    if (nome.includes(termo)) {
      card.style.display = "block";
      encontrou = true;
    } else {
      card.style.display = "none";
    }
  });

  const container = document.getElementById("listaProdutos");

  // remove mensagem antiga
  const msgAntiga = document.getElementById("semResultado");
  if (msgAntiga) msgAntiga.remove();

  // se não encontrou nada
  if (!encontrou) {
    const msg = document.createElement("p");
    msg.id = "semResultado";
    msg.innerText = "Nenhum produto encontrado 😢";
    msg.style.textAlign = "center";
    msg.style.marginTop = "20px";

    container.appendChild(msg);
  }
});
  }

  async function carregarProdutos() {
  if (carregando || acabou) return;

  carregando = true;

  const resposta = await fetch(`${API}/produtos?page=${pagina}`)

  if (!resposta.ok) {
    alert("Erro ao carregar produtos");
    return;
  }

  const produtos = await resposta.json();

  const container = document.querySelector("#listaProdutos");

  if (produtos.length === 0) {
    acabou = true;
    return;
  }

  produtos.forEach(produto => {
    container.innerHTML += `
      <div class="card">
  ${produto.promocao ? '<span class="badge">PROMOÇÃO</span>' : ''}

  <img src="${produto.imagem || 'img/sem-imagem.png'}" />

  <h3>${produto.nome}</h3>

  ${
    produto.promocao
      ? `
        <p class="preco-antigo">R$ ${(produto.preco * 1.2).toFixed(2)}</p>
        <p class="preco">R$ ${produto.preco.toFixed(2)}</p>
      `
      : `
        <p class="preco">R$ ${produto.preco.toFixed(2)}</p>
      `
  }

 <button 
  ${produto.stock <= 0 ? 'disabled' : ''}
  onclick="adicionarCarrinho('${produto.nome}', ${produto.preco})"
>
  ${produto.stock <= 0 ? 'Indisponível ❌' : '🛒 Adicionar'}
</button>
  <button onclick="comprarWhatsApp('${produto.nome}', ${produto.preco})">
  💬 WhatsApp
</button>
</div>
    `;
  });

  pagina++;
  carregando = false;
}

  atualizarTotalFinal(); // 🔥 NOVO

  recuperarPedido();
});

// 🛒 FINALIZAR COMPRA
async function finalizarCompra() {

  const btn = document.getElementById("btnFinalizar");
  btn.disabled = true;
  btn.innerText = "Enviando...";

  const carrinho = JSON.parse(localStorage.getItem('carrinho')) || [];

  if (carrinho.length === 0) {
    alert("Seu carrinho está vazio 🛒");

    btn.disabled = false;
    btn.innerText = "Finalizar Compra";
    return;
  }

  const nome = document.getElementById("nomeCliente").value.trim();
  const telefone = document.getElementById("telefoneCliente").value.trim();
  let endereco = document.getElementById("enderecoCliente").value.trim();

// 🚚 / 🏪 TIPO DE ENTREGA
const tipoEntrega = document.querySelector('input[name="tipoEntrega"]:checked').value;

if (tipoEntrega === "retirada") {
  endereco = "";
}

  // validações
  if (nome.length < 3) {
    alert("Digite um nome válido!");

    btn.disabled = false;
    btn.innerText = "Finalizar Compra";
    return;
  }

  if (!telefone.match(/^\d{10,11}$/)) {
    alert("Digite um WhatsApp válido (apenas números)!");

    btn.disabled = false;
    btn.innerText = "Finalizar Compra";
    return;
  }

  if (tipoEntrega === "entrega" && endereco.length < 5) {
  alert("Digite um endereço completo!");

    btn.disabled = false;
    btn.innerText = "Finalizar Compra";
    return;
  }

  // salvar dados
  localStorage.setItem("nomeCliente", nome);
  localStorage.setItem("telefoneCliente", telefone);
  localStorage.setItem("enderecoCliente", endereco);

  const total = carrinho.reduce((acc, item) => acc + (item.preco * item.qtd), 0);

  let frete = Number(localStorage.getItem("frete")) || calcularFrete(endereco);

  const totalFinal = total + frete;

  // resumo
  let resumo = "🧾 CONFIRMAR PEDIDO:\n\n";

  carrinho.forEach(item => {
    resumo += `${item.nome} (x${item.qtd}) - R$ ${(item.preco * item.qtd).toFixed(2)}\n`;
  });

  resumo += `\n📦 Frete: R$ ${frete}`;
  resumo += `\n💰 Total: R$ ${totalFinal.toFixed(2)}`;
  resumo += `\n\n📍 Endereço: ${endereco}`;
  resumo += `\n👤 Nome: ${nome}`;
  resumo += `\n📞 WhatsApp: ${telefone}`;

  const confirmar = confirm(resumo + "\n\nDeseja finalizar o pedido?");

  if (!confirmar) {
    btn.disabled = false;
    btn.innerText = "Finalizar Compra";
    return;
  }

  localStorage.setItem("ultimoPedido", JSON.stringify({
  nome,
  telefone,
  endereco,
  itens: carrinho,
  total: totalFinal
}));

const Token = localStorage.getItem("token");

  // enviar pro backend
  await fetch(`${API}/pedido`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: Token
    },
    body: JSON.stringify({
      nome,
      telefone,
      endereco,
      itens: carrinho,
      total: totalFinal,
      frete,
      tipoEntrega
    })
  });

  // mensagem WhatsApp
  let mensagem = `🛒 *Novo Pedido*\n\n`;

  carrinho.forEach(item => {
    mensagem += `• ${item.nome} (x${item.qtd}) - R$ ${(item.preco * item.qtd).toFixed(2)}\n`;
  });

  mensagem += `\n💰 Total: R$ ${totalFinal.toFixed(2)}`;
  mensagem += `\n🚚 Frete: R$ ${frete}`;
  mensagem += `\n📍 Endereço: ${endereco}`;
  mensagem += `\n👤 Nome: ${nome}`;
  mensagem += `\n📞 WhatsApp: ${telefone}`;
  mensagem += `\n💳 Pix: armcomercio2021@gmail.com`;

  const mensagemFormatada = encodeURIComponent(mensagem);
  const numero = "5581985626440";

  window.open(`https://wa.me/${numero}?text=${mensagemFormatada}`, "_blank");

  const chavePix = "armcomercio2021@gmail.com";

// 🔥 GERAR PIX COM VALOR
const codigoPix = gerarPix(
  totalFinal,
  "ARMAZEM HORA CERTA",
  "RECIFE",
  chavePix
);

// 🔥 GERAR QR CODE
const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(codigoPix)}`;

// 🔥 ABRIR JANELA
const janela = window.open("", "Pix", "width=300,height=500");

janela.document.write(`
  <div style="text-align:center;font-family:Arial;padding:20px;">
    <h3>Pagamento via Pix 💰</h3>
    <p>Valor: R$ ${totalFinal.toFixed(2)}</p>

    <img src="${qrCodeUrl}" />

    <p style="margin-top:10px;">Ou copie:</p>

    <textarea id="pixCode" style="width:100%;height:80px;">${codigoPix}</textarea>

    <button onclick="copiarPix()" 
      style="margin-top:10px;padding:10px;width:100%;background:#25D366;color:white;border:none;border-radius:6px;cursor:pointer;">
      📋 Copiar código Pix
    </button>

    <p id="msgCopiado" style="color:green;display:none;margin-top:10px;">
      Copiado com sucesso ✅
    </p>

    <p style="margin-top:10px;">Envie o comprovante no WhatsApp 📲</p>
  </div>

  <script>
    function copiarPix() {
      const textarea = document.getElementById("pixCode");
      textarea.select();
      textarea.setSelectionRange(0, 99999);

      document.execCommand("copy");

      document.getElementById("msgCopiado").style.display = "block";
    }
  </script>
`);

  // limpar carrinho
  localStorage.removeItem('carrinho');
  localStorage.removeItem('frete');

  atualizarCarrinho();

  // destravar botão
  btn.disabled = false;
  btn.innerText = "Finalizar Compra";
}

// 📱 MENU
function toggleMenu() {
  const menu = document.getElementById("menu");
  const overlay = document.getElementById("overlay");

  menu.classList.toggle("ativo");
  overlay.classList.toggle("ativo");
}

function fecharMenu() {
  const menu = document.getElementById("menu");
  const overlay = document.getElementById("overlay");

  menu.classList.remove("ativo");
  overlay.classList.remove("ativo");
}

// 🚚 FRETE POR BAIRRO (fallback)
function calcularFrete(endereco) {
  if (!endereco) return 0;

  const e = endereco.toLowerCase();

  if (e.includes("centro")) return 35;
  if (e.includes("boa viagem")) return 40;
  if (e.includes("casa amarela")) return 30;

  return 50;
}

// 📍 BOTÃO GPS
function usarLocalizacao() {
  if (!navigator.geolocation) {
    alert("Geolocalização não suportada");
    return;
  }

  navigator.geolocation.getCurrentPosition(
    (pos) => {
      const lat = pos.coords.latitude;
      const lon = pos.coords.longitude;

      calcularFreteGPS(lat, lon);
    },
    () => {
      alert("Permita o acesso à localização");
    }
  );
}

// 📍 CALCULAR FRETE COM GPS
function calcularFreteGPS(latCliente, lonCliente) {

  // 🔥 COLOCA A LOCALIZAÇÃO DA SUA LOJA AQUI
  const latLoja = -8.0403;
  const lonLoja = -34.9157;

  const distancia = calcularKm(latLoja, lonLoja, latCliente, lonCliente);

  let frete = 35;

  if (distancia > 5) {
    frete += (distancia - 5) * 5;
  }

  frete = Math.round(frete);

  // salva para usar na compra
  localStorage.setItem("frete", frete);

// 🔥 NOVO
document.getElementById("freteValor").innerText =
  `Frete: R$ ${frete} (${distancia.toFixed(2)} km)`;

atualizarTotalFinal();
}

// 📏 CÁLCULO DE DISTÂNCIA (HAVERSINE)
function calcularKm(lat1, lon1, lat2, lon2) {
  const R = 6371;

  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;

  const a =
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) *
    Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon/2) * Math.sin(dLon/2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

  return R * c;
}

function atualizarTotalFinal() {
  const carrinho = JSON.parse(localStorage.getItem('carrinho')) || [];

  const subtotal = carrinho.reduce((acc, item) => acc + (item.preco * item.qtd), 0);

  const frete = Number(localStorage.getItem("frete")) || 0;

  const total = subtotal + frete;

  document.getElementById("subtotalValor").innerText =
    `Subtotal: R$ ${subtotal.toFixed(2)}`;

  document.getElementById("freteValor").innerText =
    `Frete: R$ ${frete}`;

  document.getElementById("totalFinal").innerText =
    `Total: R$ ${total.toFixed(2)}`;
}

function gerarPix(valor, nome, cidade, chave) {

  function format(id, value) {
    return id + value.length.toString().padStart(2, '0') + value;
  }

  function crc16(str) {
    let crc = 0xFFFF;

    for (let i = 0; i < str.length; i++) {
      crc ^= str.charCodeAt(i) << 8;

      for (let j = 0; j < 8; j++) {
        if ((crc & 0x8000) !== 0) {
          crc = (crc << 1) ^ 0x1021;
        } else {
          crc <<= 1;
        }
      }
    }

    return (crc & 0xFFFF).toString(16).toUpperCase().padStart(4, '0');
  }

  const payload =
    format("00", "01") +
    format("26",
      format("00", "BR.GOV.BCB.PIX") +
      format("01", chave)
    ) +
    format("52", "0000") +
    format("53", "986") +
    format("54", valor.toFixed(2)) +
    format("58", "BR") +
    format("59", nome.substring(0, 25)) +
    format("60", cidade.substring(0, 15)) +
    format("62",
      format("05", "***")
    );

  const payloadFinal = payload + "6304";

  const crc = crc16(payloadFinal);

  return payloadFinal + crc;
}
function comprarWhatsApp(nome, preco) {

  const numero = "5581985626440";

  let mensagem = `🛒 *Compra rápida*\n\n`;
  mensagem += `Produto: ${nome}\n`;
  mensagem += `Preço: R$ ${preco.toFixed(2)}\n\n`;
  mensagem += `Olá! Quero comprar esse produto 👍`;

  const link = `https://wa.me/${numero}?text=${encodeURIComponent(mensagem)}`;

  window.open(link, "_blank");
}
function recuperarPedido() {
  const pedido = JSON.parse(localStorage.getItem("ultimoPedido"));

  if (!pedido) return;

  const confirmar = confirm("Você tem um pedido não finalizado. Deseja recuperar?");

  if (!confirmar) return;

  localStorage.setItem("carrinho", JSON.stringify(pedido.itens));

  document.getElementById("nomeCliente").value = pedido.nome;
  document.getElementById("telefoneCliente").value = pedido.telefone;
  document.getElementById("enderecoCliente").value = pedido.endereco;

  atualizarCarrinho();
}
window.addEventListener("scroll", () => {
  if (
    window.innerHeight + window.scrollY >= document.body.offsetHeight - 200
  ) {
    carregarProdutos();
  }
});