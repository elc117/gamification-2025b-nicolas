// elementos
const form = document.querySelector('.login-container form');
const loading = document.getElementById('loading-overlay');
const toast = document.getElementById("toast");

// garante que overlay não fique visível ao voltar à página
window.addEventListener('pageshow', () => {
    loading.style.display = 'none';
});

// submit do login
form.addEventListener('submit', e => {
    e.preventDefault();

    const usuario = form.usuario.value.trim();
    const senha = form.senha.value.trim();

    if (!usuario || !senha) {
        showToast('usuário e senha obrigatórios');
        return;
    }

    // simulação de login: digitar "erro" falha, qualquer outro sucesso
    const loginSucesso = usuario.toLowerCase() !== 'erro';

    if (loginSucesso) {
        // mostra tela de loading
        loading.style.display = 'flex';

        setTimeout(() => {
            if (usuario.toLowerCase() === 'professor') {
                window.location.href = 'professor.html';
            } else {
                window.location.href = 'aluno.html';
            }
        }, 1500);
    } else {
        // mostra toast de erro
        showToast('login e/ou senha errado(s)');
    }
});

function showToast(msg) {
    toast.textContent = msg;
    toast.classList.add("show");
    setTimeout(() => {
        toast.classList.remove("show");
    }, 5000);
}
