function _getToastEl() {
  return document.getElementById("toast");
}

function toast(msg) {
  const t = _getToastEl();
  if (!t) return console.warn("toast element not found");
  t.textContent = msg;
  t.classList.add("show");
  setTimeout(() => t.classList.remove("show"), 3000);
}

function abrirPopupId(popupId) {
  const p = document.getElementById(popupId);
  if (!p) return console.warn("popup not found:", popupId);
  p.style.display = "flex";
}
function fecharPopupId(popupId, textoEditado = false) {
  const p = document.getElementById(popupId);
  if (!p) return console.warn("popup not found:", popupId);
  if (textoEditado && !confirm("tem certeza que quer sair sem salvar?")) return;
  p.style.display = "none";
}

function initEstrelas(selectorOrElement, callback = () => {}) {
  let container;
  if (typeof selectorOrElement === "string") container = document.querySelector(selectorOrElement);
  else container = selectorOrElement;
  if (!container) return { getNota: () => 0, setNota: () => {} };

  const estrelas = Array.from(container.querySelectorAll(".estrela"));
  let nota = 0;

  function preencher(v) {
    const num = Number(v) || 0;
    estrelas.forEach(e => {
      const val = Number(e.dataset.value) || 0;
      e.classList.toggle("ativa", val <= num);
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
    setNota: v => { nota = Number(v) || 0; preencher(nota); }
  };
}

function initLogout() {
  const btn = document.getElementById("logout-btn");
  if (!btn) return;
  btn.addEventListener("click", () => {
    localStorage.removeItem("usuario");
    localStorage.removeItem("user");
    window.location.href = "index.html";
  });
}

function initLeaderboardIfPresent(fetchUrl = "/leaderboard") {
  const lista = document.getElementById('lista-leaderboard');
  const toggleBtn = document.getElementById('toggle-btn');
  if (!lista || !toggleBtn) return;

  let expanded = false;
  let alunos = [];

  async function carregar() {
    try {
      const res = await fetch(fetchUrl);
      if (!res.ok) return;
      alunos = await res.json();
      render();
    } catch (err) { console.error("leaderboard fetch failed", err); }
  }

  function render() {
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

  toggleBtn.addEventListener('click', () => { expanded = !expanded; render(); });
  carregar();
}

function getUsuarioFromStorage() {
  const keys = ["usuario", "user"];
  for (const k of keys) {
    try {
      const j = localStorage.getItem(k);
      if (!j) continue;
      return JSON.parse(j);
    } catch (e) { continue; }
  }
  return null;
}
