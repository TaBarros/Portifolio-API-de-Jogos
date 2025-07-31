const API_BASE_URL = "http://localhost:5000/api";



function registrar() {
    const username = document.getElementById("username").value;
    const email = document.getElementById("emailRegistro").value;
    const password = document.getElementById("passwordRegistro").value;

    if (!username || !email || !password) {
        alert("Por favor, preencha todos os campos de registro.");
        return;
    }

    fetch(`${API_BASE_URL}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, email, password })
    })
        .then(async res => { 
            const data = await res.json();
            if (res.ok) { 
                alert(data.message || "Cadastro realizado!");
                window.location.href = "login.html";
            } else {
                alert("Erro: " + (data.message || "Erro desconhecido."));
            }
            console.log("Resposta de Registro:", data);
        })
        .catch(error => {
            console.error("Erro ao registrar:", error);
            alert("Erro de conexão com o servidor ao registrar. Verifique se o backend está rodando.");
        });
}

function login() {
    const username = document.getElementById("usernameLogin").value;
    const password = document.getElementById("passwordLogin").value;

    if (!username || !password) {
        alert("Por favor, preencha todos os campos de login.");
        return;
    }

    fetch(`${API_BASE_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password })
    })
        .then(async res => { 
            const data = await res.json();
            if (res.ok) { 
                localStorage.setItem("token", data.token);
                alert("Login realizado!");
                window.location.href = "index.html";
            } else {
                alert(data.message || "Erro: Credenciais inválidas.");
            }
            console.log("Resposta de Login:", data);
        })
        .catch(error => {
            console.error("Erro:", error);
            alert("Erro de conexão com o servidor ao fazer login. Verifique se o backend está rodando.");
        });
}

function logout() {
    localStorage.removeItem("token");
    alert("Deslogado");
    window.location.href = "login.html";
}


async function carregarJogos() {
    const token = localStorage.getItem("token");
    const container = document.getElementById("jogos");
    if (!container) return; 

    if (!token) {
        container.innerHTML = "<p style='color: red;'>Por favor, faça login para ver os jogos.</p>";
        return;
    }

    try {
        const res = await fetch(`${API_BASE_URL}/games`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        if (!res.ok) {
            const errorData = await res.json();
            container.innerHTML = `<p style='color: red;'>Erro ao carregar jogos: ${errorData.message || errorData.erro || 'Erro desconhecido'}</p>`;
            if (res.status === 401 || res.status === 403) {
                alert("Sessão expirada ou não autorizado. Faça login novamente.");
                logout();
            }
            return;
        }

        const jogos = await res.json();
        container.innerHTML = ""; 

        if (jogos.length === 0) {
            container.innerHTML = "<p>Nenhum jogo cadastrado ainda.</p>";
            return;
        }

        jogos.forEach(jogo => {
            container.innerHTML += `
                <div class="game-item">
                    <h3>${jogo.titulo}</h3>
                    <p>${jogo.descricao || 'Sem descrição'}</p>
                    <p>Categoria: ${jogo.categoria || 'N/A'}</p>
                    <p>Ano: ${jogo.lancamento || 'N/A'}</p>
                    <p>Criado por: ${jogo.criadoPor ? jogo.criadoPor.username : 'Desconhecido'}</p>
                    <a href="detalhes.html?id=${jogo._id}" class="details-link">Ver detalhes</a>
                </div>
                <hr/>
            `;
        });
    } catch (error) {
        console.error("Erro ao carregar jogos:", error);
        container.innerHTML = "<p style='color: red;'>Erro de conexão ao carregar jogos.</p>";
    }
}

async function enviarNovoJogo() {
    const titulo = document.getElementById("titulo").value;
    const descricao = document.getElementById("descricao").value;
    const categoria = document.getElementById("categoria").value;
    const lancamento = parseInt(document.getElementById("lancamento").value);
    const mensagemElement = document.getElementById("mensagem"); 

    const token = localStorage.getItem('token');

    if (!token) {
        mensagemElement.textContent = "❌ Você precisa estar logado para enviar um jogo!";
        mensagemElement.style.color = "tomato";
        return;
    }

  
    if (!titulo || isNaN(lancamento)) {
        mensagemElement.textContent = "❌ Título e Ano de Lançamento são obrigatórios e válidos!";
        mensagemElement.style.color = "tomato";
        return;
    }
    if (lancamento < 1900 || lancamento > new Date().getFullYear() + 5) {
        mensagemElement.textContent = "❌ Ano de Lançamento inválido!";
        mensagemElement.style.color = "tomato";
        return;
    }

    try {
        const resposta = await fetch(`${API_BASE_URL}/games`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({ titulo, descricao, categoria, lancamento })
        });

        const dados = await resposta.json();
        console.log("Resposta do servidor:", dados);

        if (resposta.ok) {
            mensagemElement.textContent = "✅ Jogo enviado com sucesso!";
            mensagemElement.style.color = "limegreen";
            document.getElementById("jogoForm").reset(); 
            carregarJogos(); 
        } else {
            mensagemElement.textContent = "❌ Erro ao enviar jogo: " + (dados.message || dados.error || "Erro desconhecido.");
            mensagemElement.style.color = "tomato";
            if (resposta.status === 401 || resposta.status === 403) {
                alert("Sessão expirada ou não autorizado. Faça login novamente.");
                logout();
            }
        }
    } catch (erro) {
        console.error("Erro de conexão ou requisição:", erro);
        mensagemElement.textContent = "❌ Erro de conexão com o servidor. Verifique se o backend está rodando.";
        mensagemElement.style.color = "tomato";
    }
}



async function carregarDetalhes(id) {
    const token = localStorage.getItem("token");
    const div = document.getElementById("detalhes");
    if (!div) return;

    if (!token) {
        div.innerHTML = "<p style='color: red;'>Por favor, faça login para ver os detalhes.</p>";
        return;
    }

    try {
        const res = await fetch(`${API_BASE_URL}/games/${id}`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        if (!res.ok) {
            const errorData = await res.json();
            div.innerHTML = `<p style='color: red;'>Erro ao carregar detalhes: ${errorData.message || errorData.erro || 'Jogo não encontrado.'}</p>`;
            if (res.status === 401 || res.status === 403) {
                alert("Sessão expirada ou não autorizado. Faça login novamente.");
                logout();
            }
            return;
        }

        const jogo = await res.json();
        div.innerHTML = `
            <h2>${jogo.titulo}</h2>
            <p><strong>Descrição:</strong> ${jogo.descricao || 'N/A'}</p>
            <p><strong>Categoria:</strong> ${jogo.categoria || 'N/A'}</p>
            <p><strong>Lançamento:</strong> ${jogo.lancamento || 'N/A'}</p>
            <p><strong>Criado por:</strong> ${jogo.criadoPor ? jogo.criadoPor.username : 'Desconhecido'}</p>
        `;
    } catch (error) {
        console.error("Erro ao carregar detalhes do jogo:", error);
        div.innerHTML = "<p style='color: red;'>Erro de conexão ao carregar detalhes do jogo.</p>";
    }
}

async function carregarMedia(id) {
    const token = localStorage.getItem("token");
    const mediaDiv = document.getElementById("media");
    if (!mediaDiv) return;

    if (!token) {
        mediaDiv.innerHTML = "<p style='color: red;'>Por favor, faça login para ver a média.</p>";
        return;
    }

    try {
        const res = await fetch(`${API_BASE_URL}/ratings/${id}/media`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        if (!res.ok) {
            const errorData = await res.json();
            mediaDiv.innerHTML = `<p style='color: red;'>Não foi possível carregar a média: ${errorData.message || errorData.erro || 'Erro desconhecido'}</p>`;
            if (res.status === 401 || res.status === 403) {
                alert("Sessão expirada ou não autorizado. Faça login novamente.");
                logout();
            }
            return;
        }

        const data = await res.json();
        mediaDiv.innerText = `Média: ${parseFloat(data.media).toFixed(1)} (${data.total} avaliações)`;
    } catch (error) {
        console.error("Erro ao carregar média:", error);
        mediaDiv.innerHTML = "<p style='color: red;'>Erro de conexão ao carregar média.</p>";
    }
}

async function avaliar() {
    const notaInput = document.getElementById("nota");
    const nota = parseFloat(notaInput.value);
    const feedbackDiv = document.getElementById("feedbackAvaliacao"); 

    if (isNaN(nota) || nota < 0 || nota > 10) {
        if (feedbackDiv) {
            feedbackDiv.style.color = 'red';
            feedbackDiv.textContent = "Por favor, insira uma nota válida entre 0 e 10.";
        } else {
            alert("Por favor, insira uma nota válida entre 0 e 10.");
        }
        return;
    }

    const params = new URLSearchParams(window.location.search);
    const id = params.get("id"); 

    if (!id) {
        if (feedbackDiv) {
            feedbackDiv.style.color = 'red';
            feedbackDiv.textContent = "ID do jogo não encontrado para avaliação.";
        } else {
            alert("ID do jogo não encontrado para avaliação.");
        }
        return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
        if (feedbackDiv) {
            feedbackDiv.style.color = 'red';
            feedbackDiv.textContent = "Você precisa estar logado para avaliar.";
        } else {
            alert("Você precisa estar logado para avaliar.");
        }
        return;
    }

    try {
        const res = await fetch(`${API_BASE_URL}/ratings/${id}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({ nota })
        });

        const data = await res.json();
        if (res.ok) {
            if (feedbackDiv) {
                feedbackDiv.style.color = 'green';
                feedbackDiv.textContent = data.mensagem || "Avaliação enviada com sucesso!";
            } else {
                alert(data.mensagem || "Avaliação enviada com sucesso!");
            }
            notaInput.value = '';
            carregarMedia(id); 
        } else {
            if (feedbackDiv) {
                feedbackDiv.style.color = 'red';
                feedbackDiv.textContent = data.mensagem || "Erro ao enviar avaliação.";
            } else {
                alert(data.mensagem || "Erro ao enviar avaliação.");
            }
        }
        console.log("Resposta de Avaliação:", data);
    } catch (error) {
        console.error("Erro ao enviar avaliação:", error);
        if (feedbackDiv) {
            feedbackDiv.style.color = 'red';
            feedbackDiv.textContent = "Erro de conexão com o servidor ao enviar avaliação.";
        } else {
            alert("Erro de conexão com o servidor ao enviar avaliação.");
        }
    }
}