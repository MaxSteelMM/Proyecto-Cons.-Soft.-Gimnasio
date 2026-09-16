document.addEventListener('DOMContentLoaded', () => {
    const btnFocus = document.getElementById('btnFocus');
    const btnDim = document.getElementById('btnDim');
    const btnReset = document.getElementById('btnReset');
    const cards = document.querySelectorAll('.routine-card');

    // Destacar Rutinas usando classList.toggle
    btnFocus.addEventListener('click', () => {
        cards.forEach(card => {
            card.classList.toggle('highlight-routine');
        });
    });

    // Modo Concentración usando classList.add/remove
    btnDim.addEventListener('click', () => {
        cards.forEach((card, index) => {
            // Solo dejamos una visible (la primera) y dimmeamos las demás
            if (index !== 0) {
                card.classList.add('dimmed');
            } else {
                card.classList.remove('dimmed');
            }
        });
        console.log("Modo concentración activado: enfocando la rutina principal");
    });

    // Restablecer Vista usando removeAttribute y classList.remove
    btnReset.addEventListener('click', () => {
        cards.forEach(card => {
            card.classList.remove('highlight-routine', 'dimmed');
            // Ejemplo de setAttribute: añadimos un atributo de datos para marcar que fue reseteada
            card.setAttribute('data-status', 'reset');
        });
        console.log("Vista restablecida y atributos actualizados");
    });
});
