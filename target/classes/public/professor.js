
const popup = document.getElementById("popup");
const fechar = document.querySelector(".close");
const cancelar = document.getElementById("cancelar");
const enviar = document.getElementById("enviar");
const infoResenha = document.getElementById("info-resenha");
let textoEditado = false;

document.querySelectorAll(".corrigir").forEach(btn => {
    btn.onclick = () => {
        const nome = btn.dataset.nome;
        const livro = btn.dataset.livro;
        infoResenha.innerText = `${nome} — ${livro}`;
        popup.style.display = "flex";
        document.getElementById("comentario").value = "";
        textoEditado = false;
    };
});

fechar.onclick = tentarFechar;
cancelar.onclick = tentarFechar;

enviar.onclick = () => {
    const texto = document.getElementById("comentario").value.trim();
    if (texto) {
        alert("correção enviada (mock)");
        popup.style.display = "none";
    } else {
        alert("escreva algo antes de enviar");
    }
};

document.getElementById("comentario").addEventListener("input", () => {
    textoEditado = true;
});

function tentarFechar() {
    if (textoEditado && confirm("tem certeza que quer sair sem salvar?")) {
        popup.style.display = "none";
    } else if (!textoEditado) {
        popup.style.display = "none";
    }
}

window.onclick = (e) => { if (e.target === popup) tentarFechar();
    
};

const form = document.getElementById('cadastro-form');
const toast = document.getElementById('toast');

form.addEventListener('submit', async e => {
    e.preventDefault();
    const nome = form.nome.value.trim();
    const senha = form.senha.value.trim();

    if (!nome || !senha) {
        showToast('preencha todos os campos');
        return;
    }

    try {
        const res = await fetch('/cadastro-aluno', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nome, senha })
        });

        if (res.ok) showToast('aluno cadastrado com sucesso');
        else showToast('erro ao cadastrar');
    } catch {
        showToast('erro de conexão');
    }

    form.reset();
});

function showToast(msg) {
    toast.textContent = msg;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 3000);
}


async function carregarResenhasPendentes() {
    console.log("DOM carregado");
    const res = await fetch('/resenhas/pendentes');
    const resenhas = await res.json();

    const container = document.getElementById('pendentes');
    container.innerHTML = '';

    resenhas.forEach(r => {
        const div = document.createElement('div');
        div.className = 'resenha-item';
        div.innerHTML = `
            <p>${r.nomeLivro} — ${r.autor}</p>
            <button class="corrigir" data-id="${r.id}" data-livro="${r.nomeLivro}" data-autor="${r.autor}">corrigir</button>
        `;
        container.appendChild(div);
    });

    container.querySelectorAll('.corrigir').forEach(btn => {
        btn.onclick = () => {
            const livro = btn.dataset.livro;
            const autor = btn.dataset.autor;
            const id = btn.dataset.id;

            infoResenha.innerText = `${livro} — ${autor}`;
            popup.style.display = "flex";
            document.getElementById("comentario").value = "";
            textoEditado = false;

            enviar.onclick = async () => {
                const comentario = document.getElementById("comentario").value.trim();
                if (!comentario) { 
                    alert("escreva algo antes de enviar"); 
                    return; 
                }

                try {
                    const resp = await fetch(`/resenhas/${id}/corrigir`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ comentario })
                    });

                    if (resp.ok) {
                        alert("resenha corrigida com sucesso!");
                        popup.style.display = "none";
                        carregarResenhasPendentes(); // atualiza a lista
                    } else {
                        alert("erro ao corrigir resenha");
                    }
                } catch (err) {
                    console.error(err);
                    alert("erro de conexão");
                }
            };
        };
    });
}

document.addEventListener('DOMContentLoaded', async () => {
    const lista = document.getElementById('lista-leaderboard');
    const toggleBtn = document.getElementById('toggle-btn');
    let expanded = false;
    let alunos = [];

    const user = JSON.parse(localStorage.getItem('usuario'));
    if (user) {
        document.querySelector('header div strong').textContent = user.nome;
    } else {
        window.location.href = 'index.html';
    }

    async function carregarLeaderboard() {
        const res = await fetch('/leaderboard');
        alunos = await res.json();
        renderizar();
    }

    function renderizar() {
        lista.innerHTML = '';
        const limite = expanded ? alunos.length : Math.min(10, alunos.length);
        alunos.slice(0, limite).forEach((a, i) => {
            const li = document.createElement('li');
            li.textContent = `${i + 1}. ${a.nome} - ${a.pontos} pts`;
            lista.appendChild(li);
        });
        if(alunos.length > 10){
            toggleBtn.style.display = 'block';
        }
        else {
            toggleBtn.style.display = 'none';
        }
        toggleBtn.textContent = expanded ? 'mostrar menos' : 'mostrar mais';
    }

    toggleBtn.addEventListener('click', () => {
        expanded = !expanded;
        renderizar();
    });

    // chama as funções quando a página carrega
    carregarLeaderboard();
    carregarResenhasPendentes(); // <-- chama aqui
});


document.getElementById("logout-btn").addEventListener("click", () => {
    localStorage.removeItem("usuario");
    window.location.href = "index.html";
});
