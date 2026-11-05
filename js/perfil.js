document.addEventListener('DOMContentLoaded', () => {
    const formulario = document.getElementById('formulario');
    const mensaje = document.getElementById('mensaje-formulario');
    const submitButton = formulario.querySelector('[type="submit"]');
    const resetButton = formulario.querySelector('[type="reset"]');
    const apiBase = 'http://localhost:3000';

    formulario.addEventListener('reset', () => {
        mensaje.textContent = '';
    });

    formulario.addEventListener('submit', async (event) => {
        event.preventDefault();
        mensaje.textContent = '';
        submitButton.disabled = true;
        resetButton.disabled = true;
        const datos = Object.fromEntries(new FormData(formulario).entries());

        try {
            const respuesta = await fetch(`${apiBase}/clientes`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(datos)
            });
            const resultado = await respuesta.json().catch(() => ({}));

            if (!respuesta.ok) {
                throw new Error(resultado.error || 'No se pudo agregar el perfil.');
            }

            formulario.reset();
            mensaje.textContent = `Perfil registrado correctamente. Número de cliente: ${resultado.id_usuario}.`;
        } catch (error) {
            console.error('Error al agregar el perfil:', error);
            mensaje.textContent = error.message || 'No se pudo conectar con el servidor.';
        } finally {
            submitButton.disabled = false;
            resetButton.disabled = false;
        }
    });
});
