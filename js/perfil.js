document.addEventListener('DOMContentLoaded', () => {
    // 1. Seleccionar elementos
    const titulo = document.getElementById('titulo');
    const nombre = document.getElementById('nombre');
    const password = document.getElementById('password');
    const foto = document.getElementById('foto');

    const btnEditar = document.getElementById('btnEditar');
    const btnOcultar = document.getElementById('btnOcultar');
    const btnPassword = document.getElementById('btnPassword');
    const btnColor = document.getElementById('btnColor');
    const btnClase = document.getElementById('btnClase');
    const btnInfo = document.getElementById('btnInfo');

    // 2. Editar título
    btnEditar.addEventListener('click', () => {
        titulo.contentEditable = true;
        console.log("El título ahora se puede editar desde la página");
    });

    // 3. Ocultar / Mostrar título
    btnOcultar.addEventListener('click', () => {
        titulo.classList.toggle('oculto');
    });

    // 4. Mostrar/ocultar contraseña
    btnPassword.addEventListener('click', () => {
        if (password.type === 'password') {
            password.type = 'text';
        } else {
            password.type = 'password';
        }
    });

    // 5. Cambiar estilos
    btnColor.addEventListener('click', () => {
        titulo.style.color = 'var(--VerdeF)';
        titulo.style.backgroundColor = 'var(--gray)';
        titulo.style.fontSize = '3rem';
        titulo.style.border = '2px solid var(--VerdeF)';
    });

    // 6. Modificar clases
    btnClase.addEventListener('click', () => {
        titulo.classList.add('destacado');
        titulo.classList.remove('principal');
        titulo.classList.toggle('rojo');

        if (titulo.classList.contains('destacado')) {
            console.log("El título tiene la clase destacado");
        } else {
            console.log("El título NO tiene la clase destacado");
        }

        if (titulo.classList.contains('titulo')) {
            titulo.classList.replace('titulo', 'tituloEditado');
            console.log("El título fue editado (clase remplazada)");
        }
    });

    // 7. Mostrar info en consola
    btnInfo.addEventListener('click', () => {
        console.log("--- Información del Elemento ---");
        console.log("Clase:", nombre.className);
        console.log("ID:", nombre.id);
        console.log("Valor:", nombre.value);
        console.log("Tipo:", nombre.type);
        console.log("Acepta:", foto.accept);
        console.log("Form ID:", nombre.form ? nombre.form.id : "No está en un formulario");
    });
});
