# GYM-MLS

Sitio web del gimnasio con catálogo conectado a MySQL, registro de clientes y carrito de compras.

## Requisitos

- Node.js y npm
- MySQL con la base `gestion_gimnasio`

## Puesta en marcha

1. Iniciá MySQL e importá `BDGYM.sql` si la base de datos todavía no existe.
2. Instalá las dependencias con `npm install`.
3. Iniciá la API con `npm start`. El servidor escucha en `http://localhost:3000`.
4. Abrí `Index.html` con una extensión de servidor estático de VS Code, como Live Server. La tienda y el perfil consultan la API local en el puerto 3000.

La conexión a MySQL conserva la configuración existente en `server.js`. Asegurate de que coincida con tu entorno local.

## Funcionalidades

- El catálogo, los clientes y las compras se obtienen o guardan en la base de datos existente.
- El carrito se conserva localmente en el navegador; los pedidos se envían al servidor al confirmarlos.
- El checkout registra un cliente y una compra por cada producto. Si una compra falla después de registrar otras, el checkout muestra las referencias recibidas para que puedas revisar el estado antes de reintentar.
- El sitio no procesa pagos ni guarda datos financieros.

El backend actual registra compras, pero no actualiza automáticamente el stock. El inventario debe verificarse y mantenerse desde el sistema que administra la base de datos.

## Catálogo de demostración

Se añadieron diez productos al catálogo de la base local mediante el endpoint existente. Sus precios y cantidades son valores de demostración: verificá y actualizá esos datos antes de usar la tienda con inventario o ventas reales. Para nuevas instalaciones, los mismos artículos están incluidos en `BDGYM.sql`.

Las imágenes de producto están guardadas localmente en `Img/productos/`:

- `barra-olimpica.jpg`: Airman 1st Class Jovante Johnson / U.S. Air Force, dominio público. [Fuente](https://commons.wikimedia.org/wiki/File:Watch_me_lift_(5048019).jpg).
- `bandas-elasticas.png`: Everkinetic, [CC BY-SA 3.0](https://creativecommons.org/licenses/by-sa/3.0/). [Fuente](https://commons.wikimedia.org/wiki/File:Back-flyes-with-resistance-bands-1.png).
- `cuerda-saltar.jpg`: CDC / Debora Cartagena, dominio público. [Fuente](https://commons.wikimedia.org/wiki/File:Exercise_equipment_(rubber_ball,_light-weight_dumbbells,_jump_rope).jpg).