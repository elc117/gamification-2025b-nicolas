document.addEventListener("DOMContentLoaded", () => {
    const popupId = "popup";
    let textoEditado = false;
    let notaSelecionada = 0;

    // elementos defensivos
    const abrirBtn = document.getElementById("abrir-popup");
    const fecharBtn = document.querySelector("#popup .close");
    const cancelarBtn = document.getElementById("cancelar");
    const enviarBtn = document.getElementById("enviar");
    const textoEl = document.getElementById("texto-resenha");

    // autenticação e UI inicial
    const usuario = getUsuarioFromStorage();
    if (!usuario) {
        window.location.href = "index.html";
        return;
    }

    async function atualizarUsuario() {
        try {
            const r = await fetch(`/usuario/${usuario.id}`);
            if (r.ok) {
                const data = await r.json();
                localStorage.setItem("usuario", JSON.stringify(data));

                document.getElementById("nome-aluno").textContent = data.nome;
                document.getElementById("pontos").textContent = data.pontos;
            } else {
                // fallback caso o backend não responda
                document.getElementById("nome-aluno").textContent = usuario.nome;
                document.getElementById("pontos").textContent = usuario.pontos;
            }
        } catch (e) {
            document.getElementById("nome-aluno").textContent = usuario.nome;
            document.getElementById("pontos").textContent = usuario.pontos;
        }
    }

    atualizarUsuario();

    // leaderboard + logout
    initLeaderboardIfPresent();
    initLogout();

    // inicializa estrelas
    const estrelasController = initEstrelas(".estrelas", v => {
        notaSelecionada = v;
    });

    // abrir popup - apenas se botão existir
    if (abrirBtn) {
        abrirBtn.addEventListener("click", () => {
            abrirPopupId(popupId);
            ["livro", "autor", "paginas", "texto-resenha"].forEach(id => {
                const el = document.getElementById(id);
                if (el) el.value = "";
            });
            textoEditado = false;
            notaSelecionada = 0;
            if (estrelasController) estrelasController.setNota(0);
        });
    }

    // fechar popup handlers
    if (fecharBtn) fecharBtn.addEventListener("click", () => fecharPopupId(popupId, textoEditado));
    if (cancelarBtn) cancelarBtn.addEventListener("click", () => fecharPopupId(popupId, textoEditado));
    window.addEventListener("click", e => {
        if (e.target && e.target.id === popupId) fecharPopupId(popupId, textoEditado);
    });

    if (textoEl) {
        textoEl.addEventListener("input", () => {
            textoEditado = true;
        });
    }

    function initEstrelas(selectorOrElement, callback = () => {}) {
        let container;
        if (typeof selectorOrElement === "string") container = document.querySelector(selectorOrElement);
        else container = selectorOrElement;
        if (!container) return {
            getNota: () => 0,
            setNota: () => {}
        };

        const estrelas = Array.from(container.querySelectorAll(".estrela"));
        let nota = 0;

        function preencher(v) {
            const num = Number(v) || 0;
            estrelas.forEach(e => {
                const val = Number(e.dataset.value) || 0;
                if (val <= num) e.classList.add("ativa");
                else e.classList.remove("ativa");
            });
        }

        estrelas.forEach(e => {
            e.addEventListener("mouseover", () => preencher(e.dataset.value));
            e.addEventListener("mouseout", () => preencher(nota));
            e.addEventListener("click", () => {
                nota = Number(e.dataset.value) || 0;
                preencher(nota);
                callback(nota);
            });
        });

        return {
            getNota: () => nota,
            setNota: v => {
                nota = Number(v) || 0;
                preencher(nota);
            }
        };
    }

    // toast dinâmico
    function toast(msg, tipo = "erro") {
        const el = document.getElementById("toast");
        if (!el) return;

        el.textContent = msg;

        // muda cor de fundo dependendo do tipo
        if (tipo === "sucesso") el.style.background = "#4CAF50"; // verde
        else el.style.background = "#ff6961"; // vermelho

        el.classList.add("show");
        setTimeout(() => el.classList.remove("show"), 3000);
    }

    // enviar resenha
    if (enviarBtn) {
        enviarBtn.addEventListener("click", async () => {
            const livro = (document.getElementById('livro')?.value || "").trim();
            const autor = (document.getElementById('autor')?.value || "").trim();
            const paginasRaw = (document.getElementById('paginas')?.value || "").trim();
            const paginas = paginasRaw ? parseInt(paginasRaw, 10) : NaN;
            const conteudo = (document.getElementById('texto-resenha')?.value || "").trim();

            if (!livro || !autor || !paginas || !notaSelecionada || !conteudo) {
                toast("preencha todos os campos!", "erro");
                return;
            }

            const data = {
                alunoId: usuario.id,
                livro,
                autor,
                paginas,
                nota: notaSelecionada,
                conteudo
            };

            try {
                const resp = await fetch('/resenha', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(data)
                });
                if (resp.ok) {
                    toast("resenha enviada com sucesso!", "sucesso");
                    fecharPopupId(popupId, false);
                } else {
                    toast("erro ao enviar resenha", "erro");
                }
            } catch (err) {
                console.error(err);
                toast("erro ao enviar resenha", "erro");
            }
        });
    }
    async function carregarHistorico() {
        const histEl = document.getElementById("historico");
        if (!histEl) return;

        try {
            const resp = await fetch(`/resenhas/${usuario.id}`);
            if (!resp.ok) {
                histEl.innerHTML = "<div class='resenha-item'>erro ao carregar histórico</div>";
                return;
            }

            const lista = await resp.json();
            histEl.innerHTML = "";

            lista.forEach(r => {
                const el = document.createElement("div");
                el.className = "resenha-item";

                const statusClass = r.status.toLowerCase() === "corrigida" ? "status-ok" : "status-pendente";

                el.innerHTML = `
                <span class="resenha-click-area">
                ${r.nomeLivro}
                </span>
                -
                <span class="status-badge ${statusClass} resenha-click-area">
                ${r.status}
                </span>
            `;

                el.querySelectorAll(".resenha-click-area").forEach(clickEl => {
                    clickEl.addEventListener("click", e => {
                        e.stopPropagation();
                        abrirDetalhe(r);
                    });
                });

                histEl.appendChild(el);
            });


        } catch (err) {
            histEl.innerHTML = "<div class='resenha-item'>erro ao carregar histórico</div>";
        }
    }

    function abrirDetalhe(r) {
        document.getElementById("detalhe-livro").textContent = r.nomeLivro;
        document.getElementById("detalhe-autor").textContent = r.autor;
        document.getElementById("detalhe-paginas").textContent = r.paginas;
        document.getElementById("detalhe-nota").textContent = r.nota;
        document.getElementById("detalhe-conteudo").textContent = r.conteudo;

        abrirPopupId("popup-detalhe");
    }

    const fecharDetalheBtn = document.querySelector(".close-detalhe");
    if (fecharDetalheBtn) {
        fecharDetalheBtn.addEventListener("click", () => fecharPopupId("popup-detalhe", false));
    }

    window.addEventListener("click", e => {
        if (e.target && e.target.id === "popup-detalhe") {
            fecharPopupId("popup-detalhe", false);
        }
    });

    carregarHistorico();

    async function carregarPremios() {
        const el = document.getElementById("troca-pontos");
        const r = await fetch("/premios");
        const premios = await r.json();

        el.innerHTML = "";

        premios.forEach(p => {
            const div = document.createElement("div");
            div.className = "premio-item";
            div.innerHTML = `
                <span>${p.nome}</span>
                <span>${p.custo} pts</span>
                <button data-id="${p.id}">trocar</button>
            `;

            div.querySelector("button").onclick = async () => {
                const resp = await fetch("/trocar", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ alunoId: usuario.id, premioId: p.id })
                });

                if (resp.ok) {
                    const data = await resp.json();

                    toast("troca feita!", "sucesso");
                    atualizarUsuario();

                    window.open(`http://localhost:7000/recibo/${data.arquivo}`, "_blank");
                } else {
                    toast("erro ou pontos insuficientes");
                }
            };


            el.appendChild(div);
        });
    }

    carregarPremios();

});