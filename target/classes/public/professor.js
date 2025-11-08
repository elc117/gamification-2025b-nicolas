
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