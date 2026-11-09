# GYM-MLS

Sitio web del gimnasio con catálogo conectado a MySQL, registro de clientes y carrito de compras.

## Requisitos

- Node.js y npm
- MySQL con la base `gestion_gimnasio`

## Puesta en marcha

1. Iniciá el servicio de MySQL e importá `BDGYM.sql` si la base de datos todavía no existe.
2. Instalá las dependencias con `npm install`.
3. Copiá `.env.example` a `.env` y configurá el acceso a tu base de datos. Con XAMPP, el valor predeterminado es `127.0.0.1:3306`, usuario `root` y contraseña vacía; si definiste una contraseña para MySQL, escribila en `DB_PASSWORD`. Si MySQL escucha en otro puerto, cambiá `DB_PORT`. Configurá también el usuario y la contraseña del administrador. Para crear un hash de contraseña, ejecutá este comando y escribí una contraseña segura cuando te la pida:

   ```sh
   node -e "const r=require('node:readline').createInterface({input:process.stdin,output:process.stdout});r.question('Contraseña de admin: ',p=>require('bcryptjs').hash(p,12).then(h=>{console.log(h);r.close()}))"
   ```

   Pegá el hash generado en `ADMIN_PASSWORD_HASH`. También configurá `SESSION_SECRET` con un valor aleatorio largo; podés generarlo con `node -e "console.log(require('node:crypto').randomBytes(32).toString('hex'))"`. El archivo `.env` está excluido de Git.
4. Iniciá la API con `npm start`. El servidor escucha en `http://localhost:3000`.
5. Abrí `Index.html` con una extensión de servidor estático de VS Code, como Live Server. La tienda y el perfil consultan la API local en el puerto 3000. Si Live Server usa otros orígenes, agregalos a `FRONTEND_ORIGINS` en `.env`, separados por comas.

La API verifica la conexión a MySQL antes de empezar a escuchar en el puerto 3000. Si falla, revisá el error que muestra la terminal y confirmá que MySQL esté iniciado y que las variables `DB_HOST`, `DB_USER`, `DB_PASSWORD` y `DB_NAME` en `.env` sean correctas.

## Funcionalidades

- El catálogo, los clientes y las compras se obtienen o guardan en la base de datos existente.
- El carrito se conserva localmente en el navegador; los pedidos se envían al servidor al confirmarlos.
- El checkout registra un cliente y una compra por cada producto. Si una compra falla después de registrar otras, el checkout muestra las referencias recibidas para que puedas revisar el estado antes de reintentar.
- El panel [Admin.html](./Admin.html) permite iniciar sesión como administrador, agregar productos, editar sus datos o eliminar productos sin compras asociadas. Las rutas de escritura también están protegidas en el servidor.
- Para eliminar un producto con compras registradas, primero deben conservarse esas compras: el servidor impide su eliminación para no borrar el historial.
- El sitio no procesa pagos ni guarda datos financieros.

Para una base ya creada, aplicá esta migración para conservar el historial también ante una eliminación directa desde MySQL:

```sql
USE gestion_gimnasio;
ALTER TABLE COMPRA DROP FOREIGN KEY fk_compra_producto;
ALTER TABLE COMPRA
    ADD CONSTRAINT fk_compra_producto FOREIGN KEY (id_producto)
    REFERENCES PRODUCTO(id_producto) ON DELETE RESTRICT;
```

El backend actual registra compras, pero no actualiza automáticamente el stock. El inventario debe verificarse y mantenerse desde el sistema que administra la base de datos.

## Catálogo de demostración

Se añadieron diez productos al catálogo de la base local mediante el endpoint existente. Sus precios y cantidades son valores de demostración: verificá y actualizá esos datos antes de usar la tienda con inventario o ventas reales. Para nuevas instalaciones, los mismos artículos están incluidos en `BDGYM.sql`.

Las imágenes de producto están guardadas localmente en `Img/productos/`:

- `barra-olimpica.jpg`: Airman 1st Class Jovante Johnson / U.S. Air Force, dominio público. [Fuente](https://commons.wikimedia.org/wiki/File:Watch_me_lift_(5048019).jpg).
- `bandas-elasticas.png`: Everkinetic, [CC BY-SA 3.0](https://creativecommons.org/licenses/by-sa/3.0/). [Fuente](https://commons.wikimedia.org/wiki/File:Back-flyes-with-resistance-bands-1.png).
- `cuerda-saltar.jpg`: CDC / Debora Cartagena, dominio público. [Fuente](https://commons.wikimedia.org/wiki/File:Exercise_equipment_(rubber_ball,_light-weight_dumbbells,_jump_rope).jpg).