
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