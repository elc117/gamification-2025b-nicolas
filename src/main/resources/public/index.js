const form = document.querySelector('.login-container form');
const loading = document.getElementById('loading-overlay');
const toast = document.getElementById("toast");
const senhaInput = document.getElementById('senha');
const toggleSenha = document.getElementById('toggle-senha');

window.addEventListener('pageshow', () => {
    loading.style.display = 'none';
});

if (toggleSenha && senhaInput) {
    toggleSenha.addEventListener('click', () => {
        const type = senhaInput.type === 'password' ? 'text' : 'password';
        senhaInput.type = type;
        toggleSenha.textContent = type === 'password' ? '👁️' : '🙈';
    });
}

form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const usuario = form.usuario.value.trim();
    const senha = form.senha.value.trim();

    if (!usuario || !senha) {
        showToast('usuário e senha obrigatórios');
        return;
    }

    loading.style.display = 'flex';

    try {
        const res = await fetch('/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ usuario, senha })
        });

        if (res.ok) {
            const user = await res.json();
            localStorage.setItem('usuario', JSON.stringify(user));
            window.location.href = user.tipo === 'professor' ? 'professor.html' : 'aluno.html';
        } else if (res.status === 401) {
            showToast('login e/ou senha errado(s)');
            senhaInput.value = '';
        } else {
            showToast('erro inesperado no servidor');
        }
    } catch (err) {
        console.error(err);
        showToast('falha ao conectar ao servidor');
    } finally {
        loading.style.display = 'none';
    }
});

function showToast(msg) {
    toast.textContent = msg;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 4000);
}
