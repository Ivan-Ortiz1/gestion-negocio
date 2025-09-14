// -------------------- Sidebar --------------------
const sidebar = document.getElementById('sidebar');
const btnToggle = document.getElementById('btn-toggle-sidebar');

btnToggle.addEventListener('click', () => {
  sidebar.classList.toggle('hidden');
});

// Navegación SPA
document.querySelectorAll('#sidebar button[data-section]').forEach(btn => {
  btn.addEventListener('click', () => {
    const section = btn.dataset.section;
    document.querySelectorAll('.section').forEach(sec => sec.classList.add('hidden'));
    document.getElementById(section).classList.remove('hidden');
  });
});

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
      const res = await fetch('http://localhost:3000/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ usuario, contrasena })
      });
      const data = await res.json();
      if(data.success){
        localStorage.setItem('usuario', data.usuario);
        window.location.href = 'ventas.html';
      } else {
        errorLogin.textContent = data.message;
        errorLogin.classList.remove('hidden');
      }
    } catch(err){
      errorLogin.textContent = 'Error de conexión al servidor';
      errorLogin.classList.remove('hidden');
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
      const res = await fetch('http://localhost:3000/registrar-admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ usuario, contrasena })
      });
      const data = await res.json();
      if(data.success){
        alert('Administrador registrado correctamente!');
        formRegistro.reset();
        formRegistro.classList.add('hidden');
        formLogin.classList.remove('hidden');
      } else {
        errorRegistro.textContent = data.message;
        errorRegistro.classList.remove('hidden');
      }
    } catch(err){
      errorRegistro.textContent = 'Error de conexión con el servidor';
      errorRegistro.classList.remove('hidden');
    }
  });
}
