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
        infoResenha.innerText = `${nome} - ${livro}`;
        popup.style.display = "flex";
        document.getElementById("comentario").value = "";
        textoEditado = false;
    };
});

fechar.onclick = tentarFechar;
cancelar.onclick = tentarFechar;

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

window.onclick = (e) => {
    if (e.target === popup) tentarFechar();

};

const form = document.getElementById('cadastro-form');
const toast = document.getElementById('toast');

form.addEventListener('submit', async e => {
    e.preventDefault();
    const nome = form.nome.value.trim();
    const senha = form.senha.value.trim();

    if (!nome || !senha) {
        showToast('preencha todos os campos', '#ff6961');
        return;
    }

    try {
        const res = await fetch('https://mogbook.onrender.com/cadastro-aluno', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                nome,
                senha
            })
        });

        if (res.ok) showToast('aluno cadastrado com sucesso', '#4CAF50');
        else showToast('erro ao cadastrar', '#ff6961')
    } catch {
        showToast('erro de conexão', '#ff6961');
    }

    form.reset();
});

function showToast(msg, bgColor = '#ff6961') {
    toast.textContent = msg;
    toast.style.background = bgColor;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 3000);
}

document.getElementById("form-premio").addEventListener("submit", async e => {
    e.preventDefault();

    const nome = document.getElementById("premio-nome").value.trim();
    const custo = Number(document.getElementById("premio-custo").value.trim());

    if (!nome || !custo || custo <= 0) {
        showToast("dados inválidos", '#ff6961');
        return;
    }

    const resp = await fetch("https://mogbook.onrender.com/premios", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nome, custo })
    });

    if (resp.ok) {
        showToast("prêmio criado", '#4CAF50');
        e.target.reset();
    } else showToast("erro", '#ff6961');
});

document.addEventListener('DOMContentLoaded', () => {
    const lista = document.getElementById('lista-leaderboard');
    const toggleBtn = document.getElementById('toggle-btn');
    let expanded = false;
    let alunos = [];

    async function carregarLeaderboard() {
        try {
            const res = await fetch('https://mogbook.onrender.com/leaderboard');
            alunos = await res.json();
            renderizar();
        } catch (err) {
            console.error("erro ao carregar leaderboard", err);
        }
    }

    function renderizar() {
        if (!lista || !toggleBtn) return;

        lista.innerHTML = '';
        const limite = expanded ? alunos.length : Math.min(10, alunos.length);

        alunos.slice(0, limite).forEach((a, i) => {
            const li = document.createElement('li');
            li.textContent = `${i + 1}. ${a.nome} - ${a.pontos} pts`;
            lista.appendChild(li);
        });

        if (alunos.length <= 10) {
            toggleBtn.style.display = 'none';
        } else {
            toggleBtn.style.display = 'inline-block';
            toggleBtn.textContent = expanded ? 'mostrar menos' : 'mostrar mais';
        }
    }

    if (toggleBtn) {
        toggleBtn.addEventListener('click', () => {
            expanded = !expanded;
            renderizar();
        });
    }

    carregarLeaderboard();

    const popup = document.getElementById("popup");
    const fechar = document.querySelector(".close");
    const cancelar = document.getElementById("cancelar");
    const enviar = document.getElementById("enviar");
    const infoResenha = document.getElementById("info-resenha");
    const comentarioEl = document.getElementById("comentario");
    let textoEditado = false;
    let notaSelecionada = 0;

    const estrelasController = initEstrelas("#popup .estrelas", v => notaSelecionada = v);

    function initEstrelas(selector, callback = () => {}) {
        const container = document.querySelector(selector);
        if (!container) return {
            getNota: () => 0,
            setNota: () => {}
        };
        const estrelas = Array.from(container.querySelectorAll(".estrela"));
        let nota = 0;

        function preencher(v) {
            estrelas.forEach(e => e.classList.toggle("ativa", Number(e.dataset.value) <= Number(v)));
        }

        estrelas.forEach(e => {
            e.addEventListener("mouseover", () => preencher(e.dataset.value));
            e.addEventListener("mouseout", () => preencher(nota));
            e.addEventListener("click", () => {
                nota = Number(e.dataset.value);
                preencher(nota);
                callback(nota);
            });
        });

        return {
            getNota: () => nota,
            setNota: v => {
                nota = v;
                preencher(nota);
            }
        };
    }

    function tentarFechar() {
        if (textoEditado && !confirm("tem certeza que quer sair sem salvar?")) return;
        popup.style.display = "none";
    }

    fechar.onclick = tentarFechar;
    cancelar.onclick = tentarFechar;
    window.onclick = e => {
        if (e.target === popup) tentarFechar();
    };

    comentarioEl.addEventListener("input", () => {
        textoEditado = true;
    });

    async function carregarResenhasPendentes() {
        const res = await fetch('https://mogbook.onrender.com/resenhas/pendentes');
        const resenhas = await res.json();
        const container = document.getElementById('pendentes');
        container.innerHTML = '';

        resenhas.forEach(r => {
            const div = document.createElement('div');
            div.className = 'resenha-item';
            div.innerHTML = `
                <p>${r.nomeLivro} - ${r.autor}</p>
                <button class="corrigir"
                    data-id="${r.id}"
                    data-livro="${r.nomeLivro}"
                    data-autor="${r.autor}"
                    data-alunonome="${r.alunoNome}"
                    data-alunoid="${r.idAluno}"
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
                    <strong>aluno:</strong> ${btn.dataset.alunonome}<br>
                    <strong>id do aluno:</strong> ${btn.dataset.alunoid}<br>
                    <strong>nota do aluno:</strong> ${btn.dataset.nota}<br>
                    <strong>páginas:</strong> ${btn.dataset.paginas}<br>
                `;

                document.getElementById("conteudo-aluno").value = decodeURIComponent(btn.dataset.conteudo);

                popup.style.display = "flex";
                comentarioEl.value = "";
                estrelasController.setNota(0);
                notaSelecionada = 0;
                textoEditado = false;

                enviar.onclick = async () => {
                    const comentario = comentarioEl.value.trim();
                    if (!comentario || !notaSelecionada) {
                        showToast("preencha comentário e nota", '#ff6961');
                        return;
                    }
                    try {
                        const resp = await fetch(`https://mogbook.onrender.com/resenhas/${id}/corrigir`, {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json'
                            },
                            body: JSON.stringify({
                                comentario,
                                notaProfessor: notaSelecionada
                            })
                        });
                        if (resp.ok) {
                            showToast("resenha corrigida!", '#4CAF50');
                            popup.style.display = "none";
                            carregarResenhasPendentes();
                        } else showToast("erro ao corrigir", '#ff6961');
                    } catch (e) {
                        console.error(e);
                        showToast("erro de conexão", '#ff6961');
                    }
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