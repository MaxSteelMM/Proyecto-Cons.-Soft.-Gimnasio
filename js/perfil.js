document.addEventListener('DOMContentLoaded', () => {
    const formulario = document.getElementById('formulario');
    const mensaje = document.getElementById('mensaje-formulario');
    const titulo = document.getElementById('titulo');
    const modeToggle = document.getElementById('mode-toggle');
    const accountPrompt = document.getElementById('account-prompt');
    const submitButton = formulario.querySelector('[type="submit"]');
    const resetButton = formulario.querySelector('[type="reset"]');
    const registrationFields = formulario.querySelectorAll('[data-registration-field]');
    let isLoginMode = false;

    const setMode = (loginMode) => {
        isLoginMode = loginMode;
        formulario.classList.toggle('is-login-mode', loginMode);
        titulo.textContent = loginMode ? 'Iniciar sesión' : 'Perfil del Atleta';
        submitButton.textContent = loginMode ? 'Iniciar sesión' : 'Agregar perfil';
        resetButton.hidden = loginMode;
        accountPrompt.textContent = loginMode ? '¿Todavía no tenés cuenta?' : '¿Ya tenés una cuenta?';
        modeToggle.textContent = loginMode ? 'Crear perfil' : 'Iniciá sesión';

        registrationFields.forEach((field) => {
            field.hidden = loginMode;
            field.querySelector('input').disabled = loginMode;
        });

        const passwordInput = formulario.elements.contrasena;
        passwordInput.autocomplete = loginMode ? 'current-password' : 'new-password';
        passwordInput.required = true;
        mensaje.textContent = '';
    };

    modeToggle.addEventListener('click', () => {
        setMode(!isLoginMode);
    });

    formulario.addEventListener('reset', () => {
        mensaje.textContent = '';
        if (isLoginMode) {
            setMode(false);
        }
    });

    formulario.addEventListener('submit', async (event) => {
        event.preventDefault();
        mensaje.textContent = '';

        if (isLoginMode) {
            mensaje.textContent = 'El inicio de sesión no está conectado al servidor.';
            return;
        }

        const datosFormulario = new FormData(formulario);
        datosFormulario.delete('contrasena');
        const datos = Object.fromEntries(datosFormulario.entries());

        try {
            const respuesta = await fetch('http://localhost:3000/clientes', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(datos)
            });
            const resultado = await respuesta.json();

            if (!respuesta.ok) {
                throw new Error(resultado.error || 'No se pudo agregar el perfil.');
            }

            mensaje.textContent = `Perfil agregado correctamente. ID: ${resultado.id_usuario}. La contraseña no se guardó.`;
            formulario.reset();
        } catch (error) {
            console.error('Error al agregar el perfil:', error);
            mensaje.textContent = error.message || 'No se pudo conectar con el servidor.';
        }
    });
});
