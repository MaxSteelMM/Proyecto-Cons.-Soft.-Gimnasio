document.addEventListener('DOMContentLoaded', () => {
    // Seleccionar elementos (Ejercicio 1)
    const couponInput = document.getElementById('coupon-input');
    const couponBtn = document.getElementById('coupon-btn');
    const couponResult = document.getElementById('coupon-result');

    couponBtn.addEventListener('click', () => {
        // 1. Obtener el atributo type del input
        const type = couponInput.getAttribute('type');

        // 2. Mostrar en consola el tipo
        console.log("El tipo de input es: " + type);

        // 3. Cambiar el input de text a password (Simulando un campo secreto de cupón)
        couponInput.setAttribute('type', 'password');

        // 4. Eliminar el placeholder
        couponInput.removeAttribute('placeholder');

        // Lógica adicional para el proyecto
        if (couponInput.value.toUpperCase() === 'MLS2026') {
            couponResult.innerText = "¡Cupón Aplicado! 20% de descuento activado.";
            couponResult.style.color = "var(--VerdeF)";
        } else {
            couponResult.innerText = "Cupón no válido. Intente con MLS2026";
            couponResult.style.color = "var(--red-error)";
        }
    });
});
