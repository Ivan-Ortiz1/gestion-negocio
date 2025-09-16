// -------------------- Sidebar --------------------
const sidebar = document.getElementById('sidebar');
const btnToggle = document.getElementById('btn-toggle-sidebar');

btnToggle.addEventListener('click', () => {
    sidebar.classList.toggle('-translate-x-full');
});

// Navegación SPA
document.querySelectorAll('#sidebar button[data-section]').forEach(btn => {
    btn.addEventListener('click', () => {
        const section = btn.dataset.section;
        document.querySelectorAll('.section').forEach(sec => sec.classList.add('hidden'));
        document.getElementById(section).classList.remove('hidden');
        // Marcar sección activa
        document.querySelectorAll('#sidebar button[data-section]').forEach(b => b.classList.remove('font-bold', 'text-blue-400'));
        btn.classList.add('font-bold', 'text-blue-400');
    });
});

// -------------------- Mensajes centralizados --------------------
function mostrarMensaje(tipo, texto, tiempo = 3000) {
    let div = document.getElementById('mensaje');
    div.textContent = texto;
    div.className = `mensaje ${tipo}`;
    div.style.display = 'block';
    setTimeout(() => div.style.display = 'none', tiempo);
}

// -------------------- Login y Registro --------------------
const formLogin = document.getElementById('form-login');
const formRegistro = document.getElementById('form-registro');
const btnShowRegister = document.getElementById('btn-show-register');
const btnShowLogin = document.getElementById('btn-show-login');
const errorLogin = document.getElementById('errorLogin');
const errorRegistro = document.getElementById('errorRegistro');

// Alternar formularios
if(btnShowRegister && btnShowLogin) {
    btnShowRegister.addEventListener('click', () => {
        formLogin.classList.add('hidden');
        formRegistro.classList.remove('hidden');
        errorLogin.classList.add('hidden');
    });

    btnShowLogin.addEventListener('click', () => {
        formRegistro.classList.add('hidden');
        formLogin.classList.remove('hidden');
        errorRegistro.classList.add('hidden');
    });
}

// Login
if(formLogin) {
    formLogin.addEventListener('submit', async e => {
        e.preventDefault();
        const usuario = document.getElementById('usuarioLogin').value;
        const contrasena = document.getElementById('contrasenaLogin').value;

        try {
            const res = await fetch('http://localhost:3000/api/admin/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ usuario, contrasena })
            });
            const data = await res.json();
            if(data.success){
                sessionStorage.setItem('usuario', data.usuario);
                mostrarMensaje('success', 'Login exitoso! Redirigiendo...');
                setTimeout(() => window.location.href = 'ventas.html', 1000);
            } else {
                mostrarMensaje('error', data.message);
            }
        } catch(err){
            mostrarMensaje('error', 'No se pudo conectar al servidor');
        }
    });
}

// Registro
if(formRegistro) {
    formRegistro.addEventListener('submit', async e => {
        e.preventDefault();
        const usuario = document.getElementById('usuarioRegistro').value;
        const contrasena = document.getElementById('contrasenaRegistro').value;

        try {
            const res = await fetch('http://localhost:3000/api/admin/registrar-admin', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ usuario, contrasena })
            });
            const data = await res.json();
            if(data.success){
                formRegistro.reset();
                formRegistro.classList.add('hidden');
                formLogin.classList.remove('hidden');
                mostrarMensaje('success', 'Administrador registrado correctamente!');
            } else {
                mostrarMensaje('error', data.message);
            }
        } catch(err){
            mostrarMensaje('error', 'No se pudo conectar al servidor');
        }
    });
}

// -------------------- Logout --------------------
const btnLogout = document.getElementById('btn-logout');
if(btnLogout){
    btnLogout.addEventListener('click', () => {
        sessionStorage.removeItem('usuario');
        mostrarMensaje('info', 'Cerrando sesión...');
        setTimeout(() => window.location.href = 'index.html', 1000);
    });
}
