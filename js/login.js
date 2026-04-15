const API = "https://site-armazem.onrender.com"; // ou seu backend online

function abrirLogin() {
  document.getElementById("loginModal").classList.add("ativo");
}

function fecharLogin() {
  document.getElementById("loginModal").classList.remove("ativo");
}

function esqueceuSenha() {
  alert("Entre em contato pelo WhatsApp 📲");
}

function atualizarUsuario() {
  const usuario = localStorage.getItem("usuario");
  const botaoLogin = document.querySelector(".btn-login");

  if (usuario) {
    botaoLogin.innerHTML = `
      ${usuario} | <span onclick="logout()" style="cursor:pointer;">Sair</span>
    `;
  } else {
    botaoLogin.innerText = "Entrar";
  }
}

function logout() {
  localStorage.removeItem("usuario");
  localStorage.removeItem("token");
  localStorage.removeItem("tipo");
  atualizarUsuario();
}

async function fazerLogin() {
  const email = document.getElementById("emailModal").value;
  const senha = document.getElementById("senhaModal").value;

  if (!email || !senha) {
    alert("Preencha email e senha!");
    return;
  }

  try {
    const resposta = await fetch(`${API}/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ email, senha })
    });

    if (!resposta.ok) {
      const erro = await resposta.text();
      alert(erro || "Email ou senha inválidos");
      return;
    }

    const data = await resposta.json();

    localStorage.setItem("usuario", email);
    localStorage.setItem("token", data.token);
    localStorage.setItem("tipo", data.tipo);

    atualizarUsuario();
    fecharLogin();

    if (data.tipo === "admin") {
      window.location.href = "admin.html";
    }

  } catch (erro) {
    alert("Erro ao fazer login");
  }
}