const popup = document.getElementById("popup");
const abrir = document.getElementById("abrir-popup");
const fechar = document.querySelector(".close");
const cancelar = document.getElementById("cancelar");
const enviar = document.getElementById("enviar");
const toast = document.getElementById("toast");

let textoEditado = false;
let nota = 0;

abrir.onclick = () => {
    popup.style.display = "flex";
    document.getElementById("texto-resenha").value = "";
    document.getElementById("livro").value = "";
    document.getElementById("autor").value = "";
    document.getElementById("paginas").value = "";
    nota = 0;
    preencherEstrelas(nota);
    textoEditado = false;
};

fechar.onclick = fecharPopup;
cancelar.onclick = fecharPopup;
window.onclick = e => { if (e.target === popup) fecharPopup(); }

function fecharPopup() {
    if (textoEditado && !confirm("tem certeza que quer sair sem salvar?")) return;
    popup.style.display = "none";
}

document.getElementById("texto-resenha").addEventListener("input", () => {
    textoEditado = true;
});

const estrelas = document.querySelectorAll('.estrela');

estrelas.forEach(e => {
    e.addEventListener('mouseover', () => preencherEstrelas(e.dataset.value));
    e.addEventListener('click', () => { nota = e.dataset.value; preencherEstrelas(nota); });
    e.addEventListener('mouseout', () => preencherEstrelas(nota));
});

function preencherEstrelas(valor) {
    estrelas.forEach(e => e.classList.toggle('ativa', e.dataset.value <= valor));
}

function showToast(msg) {
    toast.textContent = msg;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 3000);
}

function validarCampos() {
    const livro = document.getElementById("livro").value.trim();
    const autor = document.getElementById("autor").value.trim();
    const paginas = document.getElementById("paginas").value.trim();
    const resenha = document.getElementById("texto-resenha").value.trim();
    if (!livro || !autor || !paginas || !resenha || nota == 0) return false;
    return true;
}

enviar.onclick = () => {
    if (!validarCampos()) {
        showToast("Preencha todos os campos!");
        return;
    }

    const livro = document.getElementById("livro").value.trim();
    const autor = document.getElementById("autor").value.trim();
    const paginas = document.getElementById("paginas").value.trim();
    const resenha = document.getElementById("texto-resenha").value.trim();

    alert(`resenha enviada (simulação)\n\nLivro: ${livro}\nAutor: ${autor}\nPáginas: ${paginas}\nNota: ${nota} estrelas\n\n${resenha}`);
    popup.style.display = "none";
};

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
    toggleBtn.style.display = alunos.length > 10 ? 'block' : 'none';
    toggleBtn.textContent = expanded ? 'mostrar menos' : 'mostrar mais';
    }

    toggleBtn.addEventListener('click', () => {
    expanded = !expanded;
    renderizar();
    });

    carregarLeaderboard();
});

document.getElementById("logout-btn").addEventListener("click", () => {
    localStorage.removeItem("usuario");
    window.location.href = "index.html";
});

const usuario = JSON.parse(localStorage.getItem('usuario'));

if (usuario) {
    document.getElementById('nome-aluno').textContent = usuario.nome;

    document.getElementById('pontos').textContent = usuario.pontos;
} else {
    window.location.href = 'index.html';
}

const enviarBtn = document.getElementById('enviar');
const estrelas = document.querySelectorAll('.estrela');
let notaSelecionada = 0;

estrelas.forEach(e => {
    e.addEventListener('click', () => {
        notaSelecionada = parseInt(e.dataset.value);
        estrelas.forEach(s => s.classList.remove('selecionada'));
        for (let i = 0; i < notaSelecionada; i++) estrelas[i].classList.add('selecionada');
    });
});

enviarBtn.addEventListener('click', async () => {
    const livro = document.getElementById('livro').value.trim();
    const autor = document.getElementById('autor').value.trim();
    const paginas = parseInt(document.getElementById('paginas').value);
    const conteudo = document.getElementById('texto-resenha').value.trim();
    const aluno = JSON.parse(localStorage.getItem('user'));

    if (!livro || !autor || !paginas || !notaSelecionada || !conteudo) {
        mostrarToast("Preencha todos os campos!");
        return;
    }

    const data = { alunoId: aluno.id, livro, autor, paginas, nota: notaSelecionada, conteudo };

    const resp = await fetch('/resenha', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });

    if (resp.ok) {
        mostrarToast("resenha enviada com sucesso!");
        fecharPopup();
    } else {
        mostrarToast("erro ao enviar resenha");
    }
});
