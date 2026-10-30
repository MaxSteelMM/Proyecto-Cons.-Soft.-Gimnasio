document.addEventListener('DOMContentLoaded', () => {
    const formulario = document.getElementById('formulario');
    const mensaje = document.getElementById('mensaje-formulario');

    formulario.addEventListener('submit', async (event) => {
        event.preventDefault();
        mensaje.textContent = '';

        const datos = Object.fromEntries(new FormData(formulario).entries());

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

            mensaje.textContent = `Perfil agregado correctamente. ID: ${resultado.id_usuario}`;
            formulario.reset();
        } catch (error) {
            console.error('Error al agregar el perfil:', error);
            mensaje.textContent = error.message || 'No se pudo conectar con el servidor.';
        }
    });
});
