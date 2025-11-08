const form = document.querySelector('.login-container form');
const loading = document.getElementById('loading-overlay');
const toast = document.getElementById("toast");

window.addEventListener('pageshow', () => {
    loading.style.display = 'none';
});

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
        const response = await fetch('/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ usuario, senha })
            })
            .then(async res => {
            if (res.ok) {
                const user = await res.json();
                localStorage.setItem('usuario', JSON.stringify(user));
                if (user.tipo === 'professor') {
                window.location.href = 'professor.html';
                } else {
                window.location.href = 'aluno.html';
                }
            } else {
                alert('usuário ou senha inválidos');
            }
        });

        if (response.ok) {
            const data = await response.json();
            if (data.tipo === 'professor') {
                window.location.href = 'professor.html';
            } else if (data.tipo === 'aluno') {
                window.location.href = 'aluno.html';
            } else {
                showToast('tipo de usuário desconhecido');
            }
        } else if (response.status === 401) {
            showToast('login e/ou senha errado(s)');
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