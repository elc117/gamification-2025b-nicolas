/* aluno.js — específico do aluno, usa common.js */
document.addEventListener("DOMContentLoaded", () => {
  const popupId = "popup";
  let textoEditado = false;

  // elementos defensivos
  const abrirBtn = document.getElementById("abrir-popup");
  const fecharBtn = document.querySelector("#popup .close");
  const cancelarBtn = document.getElementById("cancelar");
  const enviarBtn = document.getElementById("enviar");
  const textoEl = document.getElementById("texto-resenha");

  // autenticação e UI inicial
  const usuario = getUsuarioFromStorage();
  if (!usuario) { window.location.href = "index.html"; return; }

  const nomeEl = document.getElementById("nome-aluno");
  const pontosEl = document.getElementById("pontos");
  if (nomeEl) nomeEl.textContent = usuario.nome || "aluno(a)";
  if (pontosEl) pontosEl.textContent = usuario.pontos ?? 0;

  // leaderboard + logout
  initLeaderboardIfPresent();
  initLogout();

  // abrir popup — apenas se botão existir
  if (abrirBtn) {
    abrirBtn.addEventListener("click", () => {
      abrirPopupId(popupId);
      ["livro", "autor", "paginas", "texto-resenha"].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.value = "";
      });
      textoEditado = false;
      // reset estrelas via controle retornado
      if (estrelasController && typeof estrelasController.setNota === "function") {
        estrelasController.setNota(0);
      }
    });
  }

  // fechar popup handlers
  if (fecharBtn) fecharBtn.addEventListener("click", () => fecharPopupId(popupId, textoEditado));
  if (cancelarBtn) cancelarBtn.addEventListener("click", () => fecharPopupId(popupId, textoEditado));
  window.addEventListener("click", e => { if (e.target && e.target.id === popupId) fecharPopupId(popupId, textoEditado); });

  if (textoEl) {
    textoEl.addEventListener("input", () => { textoEditado = true; });
  }

  // estrelas: inicializa no container exato (garante que só afete as do aluno)
  const estrelasContainer = document.querySelector("#popup .estrelas");
  let notaSelecionada = 0;
  let estrelasController = null;
  if (estrelasContainer) {
    estrelasController = initEstrelas(estrelasContainer, v => { notaSelecionada = Number(v) || 0; });
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
        toast("preencha todos os campos!");
        return;
      }

      const data = {
        alunoId: usuario.id,
        livro, autor, paginas, nota: notaSelecionada, conteudo
      };

      try {
        const resp = await fetch('/resenha', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        });
        if (resp.ok) {
          toast("resenha enviada com sucesso!");
          fecharPopupId(popupId, false);
        } else {
          toast("erro ao enviar resenha");
        }
      } catch (err) {
        console.error(err);
        toast("erro ao enviar resenha");
      }
    });
  }
});
