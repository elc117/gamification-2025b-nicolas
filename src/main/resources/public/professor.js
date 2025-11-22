
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

document.addEventListener('DOMContentLoaded', () => {
    const popup = document.getElementById("popup");
    const fechar = document.querySelector(".close");
    const cancelar = document.getElementById("cancelar");
    const enviar = document.getElementById("enviar");
    const infoResenha = document.getElementById("info-resenha");
    const comentarioEl = document.getElementById("comentario");
    let textoEditado = false;
    let notaSelecionada = 0;

    // inicializa estrelas
    const estrelasController = initEstrelas("#popup .estrelas", v => notaSelecionada = v);

    function initEstrelas(selector, callback = () => {}) {
        const container = document.querySelector(selector);
        if (!container) return { getNota: () => 0, setNota: () => {} };
        const estrelas = Array.from(container.querySelectorAll(".estrela"));
        let nota = 0;

        function preencher(v) {
            estrelas.forEach(e => e.classList.toggle("ativa", Number(e.dataset.value) <= Number(v)));
        }

        estrelas.forEach(e => {
            e.addEventListener("mouseover", () => preencher(e.dataset.value));
            e.addEventListener("mouseout", () => preencher(nota));
            e.addEventListener("click", () => { nota = Number(e.dataset.value); preencher(nota); callback(nota); });
        });

        return { getNota: () => nota, setNota: v => { nota = v; preencher(nota); } };
    }

    function tentarFechar() {
        if (textoEditado && !confirm("tem certeza que quer sair sem salvar?")) return;
        popup.style.display = "none";
    }

    fechar.onclick = tentarFechar;
    cancelar.onclick = tentarFechar;
    window.onclick = e => { if (e.target === popup) tentarFechar(); };

    comentarioEl.addEventListener("input", () => { textoEditado = true; });

    async function carregarResenhasPendentes() {
        const res = await fetch('/resenhas/pendentes');
        const resenhas = await res.json();
        const container = document.getElementById('pendentes');
        container.innerHTML = '';

        resenhas.forEach(r => {
            const div = document.createElement('div');
            div.className = 'resenha-item';
            div.innerHTML = `
                <p>${r.nomeLivro} — ${r.autor}</p>
                <button class="corrigir"
                    data-id="${r.id}"
                    data-livro="${r.nomeLivro}"
                    data-autor="${r.autor}"
                    data-aluno="${r.aluno}"
                    data-aluno-id="${r.alunoId}"
                    data-nota="${r.nota}"
                    data-paginas="${r.paginas}"
                    data-conteudo="${encodeURIComponent(r.conteudo)}"
                >corrigir</button>
            `;
            container.appendChild(div);
        });

        container.querySelectorAll('.corrigir').forEach(btn => {
            btn.onclick = () => {
                const id = btn.dataset.id;

                infoResenha.innerHTML = `
                    <strong>livro:</strong> ${btn.dataset.livro}<br>
                    <strong>autor:</strong> ${btn.dataset.autor}<br>
                    <strong>aluno:</strong> ${btn.dataset.aluno}<br>
                    <strong>id do aluno:</strong> ${btn.dataset.alunoId}<br>
                    <strong>nota do aluno:</strong> ${btn.dataset.nota}<br>
                    <strong>páginas:</strong> ${btn.dataset.paginas}<br>
                    <strong>conteúdo:</strong><br>${decodeURIComponent(btn.dataset.conteudo)}
                `;

                popup.style.display = "flex";
                comentarioEl.value = "";
                estrelasController.setNota(0);
                notaSelecionada = 0;
                textoEditado = false;

                enviar.onclick = async () => {
                    const comentario = comentarioEl.value.trim();
                    if (!comentario || !notaSelecionada) { alert("preencha comentário e nota"); return; }
                    try {
                        const resp = await fetch(`/resenhas/${id}/corrigir`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ comentario, notaProfessor: notaSelecionada })
                        });
                        if (resp.ok) {
                            alert("resenha corrigida!");
                            popup.style.display = "none";
                            carregarResenhasPendentes();
                        } else alert("erro ao corrigir");
                    } catch(e) { console.error(e); alert("erro de conexão"); }
                };
            };
        });
    }

    carregarResenhasPendentes();
});

document.getElementById("logout-btn").addEventListener("click", () => {
    localStorage.removeItem("usuario");
    window.location.href = "index.html";
});
