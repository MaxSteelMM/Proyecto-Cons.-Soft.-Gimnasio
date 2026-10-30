
const express = require("express");
const cors = require("cors");
const mysql = require("mysql2");

const app = express();

app.use(cors());
app.use(express.json());

const conexion = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "1234",
  database: "gestion_gimnasio",
});

const PORT = 3000;

// ======================= CLIENTES =======================

app.post("/clientes", (req, res) => {
  const { nombre, contacto, direccion, fecha_registro, email } = req.body || {};
  const campos = { nombre, contacto, direccion, fecha_registro, email };

  if (
    Object.values(campos).some(
      (valor) => typeof valor !== "string" || valor.trim() === "",
    )
  ) {
    return res.status(400).json({ error: "Todos los campos son obligatorios" });
  }

  const datos = Object.fromEntries(
    Object.entries(campos).map(([campo, valor]) => [campo, valor.trim()]),
  );
  const limites = { nombre: 100, contacto: 100, direccion: 255, email: 100 };

  if (
    Object.entries(limites).some(
      ([campo, limite]) => datos[campo].length > limite,
    )
  ) {
    return res.status(400).json({ error: "Uno o más campos superan su longitud máxima" });
  }

  if (!/^\d{4}-\d{2}-\d{2}$/.test(datos.fecha_registro)) {
    return res.status(400).json({ error: "La fecha de registro no es válida" });
  }

  const [anio, mes, dia] = datos.fecha_registro.split("-").map(Number);
  const fecha = new Date(Date.UTC(anio, mes - 1, dia));

  if (
    anio < 1000 ||
    fecha.getUTCFullYear() !== anio ||
    fecha.getUTCMonth() !== mes - 1 ||
    fecha.getUTCDate() !== dia
  ) {
    return res.status(400).json({ error: "La fecha de registro no es válida" });
  }

  const consulta = `
    INSERT INTO CLIENTE (nombre, contacto, direccion, fecha_registro, email)
    VALUES (?, ?, ?, ?, ?)
  `;

  conexion.query(
    consulta,
    [
      datos.nombre,
      datos.contacto,
      datos.direccion,
      datos.fecha_registro,
      datos.email,
    ],
    (error, resultado) => {
      if (error) {
        console.error("Error al agregar el cliente:", error);
        return res.status(500).json({ error: "Error al agregar el perfil" });
      }

      res.status(201).json({
        mensaje: "Perfil agregado correctamente",
        id_usuario: resultado.insertId,
      });
    },
  );
});

// ======================= PRODUCTOS =======================

//obtenemos todos los productos
app.get("/productos", (req, res) => {
  const consulta = `SELECT * FROM PRODUCTO`;

  conexion.query(consulta, (error, resultado) => {
    if (error) {
      console.error("Error al obtener los productos:", error);
      return res.status(500).json({ error: "Error al obtener los productos" });
    }
    res.status(200).json(resultado);
  });
});

//obtenemos un producto por su id
app.get("/productos/:id", (req, res) => {
  const { id } = req.params;
  const consulta = `SELECT * FROM PRODUCTO WHERE id_producto = ?`;

  conexion.query(consulta, [id], (error, resultado) => {
    if (error) {
      console.error("Error al obtener el producto:", error);
      return res.status(500).json({ error: "Error al obtener el producto" });
    }
    if (resultado.length === 0) {
      return res.status(404).json({ error: "Producto no encontrado" });
    }
    res.status(200).json(resultado[0]);
  });
});

//agregar producto
app.post("/productos", (req, res) => {
  const { nombre, precio, stock, categoria, id_proveedor } = req.body;

  if (nombre === undefined || precio === undefined || stock === undefined) {
    return res
      .status(400)
      .json({ error: "El nombre, el precio y el stock son obligatorios" });
  }

  const consulta = `INSERT INTO PRODUCTO (nombre, precio, stock, categoria, id_proveedor) VALUES (?, ?, ?, ?, ?)`;

  conexion.query(
    consulta,
    [nombre, precio, stock, categoria ?? null, id_proveedor ?? null],
    (error, resultado) => {
      if (error) {
        console.error("Error al agregar el producto:", error);
        return res.status(500).json({ error: "Error al agregar" });
      }
      res.status(201).json({
        mensaje: "Producto creado correctamente",
        id_nuevo_producto: resultado.insertId,
      });
    },
  );
});

//actualizar producto
app.put("/productos/:id", (req, res) => {
  const { id } = req.params;
  const { nombre, precio, stock, categoria, id_proveedor } = req.body;

  if (nombre === undefined || precio === undefined || stock === undefined) {
    return res
      .status(400)
      .json({ error: "El nombre, el precio y el stock son obligatorios" });
  }

  const consulta = `UPDATE PRODUCTO SET nombre = ?, precio = ?, stock = ?, categoria = ?, id_proveedor = ? WHERE id_producto = ?`;

  conexion.query(
    consulta,
    [nombre, precio, stock, categoria ?? null, id_proveedor ?? null, id],
    (error, resultado) => {
      if (error) {
        console.error("Error al actualizar el producto:", error);
        return res.status(500).json({ error: "Error al actualizar" });
      }
      if (resultado.affectedRows === 0) {
        //affectedRows indica cuántas filas fueron afectadas por la consulta
        return res.status(404).json({ error: "Producto no encontrado" });
      }
      res.status(200).json({ mensaje: "Producto actualizado correctamente" });
    },
  );
});

//eliminar producto
app.delete("/productos/:id", (req, res) => {
  const { id } = req.params;
  const consulta = `DELETE FROM PRODUCTO WHERE id_producto = ?`;

  conexion.query(consulta, [id], (error, resultado) => {
    if (error) {
      console.error("Error al eliminar el producto:", error);
      return res.status(500).json({ error: "Error al eliminar" });
    }
    if (resultado.affectedRows === 0) {
      return res.status(404).json({ error: "Producto no encontrado" });
    }
    res.status(200).json({ mensaje: "Producto eliminado correctamente" });
  });
});

// ======================= COMPRAS =======================

//compra
app.post("/compras", (req, res) => {
  const { id_usuario, id_producto, cantidad } = req.body;

  if (
    !Number.isInteger(id_usuario) ||
    id_usuario <= 0 ||
    !Number.isInteger(id_producto) ||
    id_producto <= 0 ||
    !Number.isInteger(cantidad) ||
    cantidad <= 0
  ) {
    return res.status(400).json({
      error: "id_usuario, id_producto y cantidad deben ser enteros positivos",
    });
  }

  const consulta = `
        INSERT INTO COMPRA (id_usuario, id_producto, cantidad, precio_unitario, fecha)
        SELECT cliente.id_usuario, producto.id_producto, ?, producto.precio, CURDATE()
        FROM CLIENTE AS cliente
        JOIN PRODUCTO AS producto ON producto.id_producto = ?
        WHERE cliente.id_usuario = ?
    `;

  conexion.query(
    consulta,
    [cantidad, id_producto, id_usuario],
    (error, resultado) => {
      if (error) {
        console.error("Error al registrar la compra:", error);
        return res.status(500).json({ error: "Error al registrar la compra" });
      }

      if (resultado.affectedRows === 0) {
        return res.status(404).json({
          error: "No se encontró el cliente o el producto",
        });
      }

      res.status(201).json({
        mensaje: "Compra registrada correctamente",
        id_compra: resultado.insertId,
      });
    },
  );
});

// ======================= CONSULTAS (SELECT) =======================

app.get("/consultas/clientes/:id/compras", (req, res) => {
  const { id } = req.params;

  const consulta = `
        SELECT c.id_compra, c.fecha, p.nombre AS producto, c.cantidad, c.precio_unitario,
               c.cantidad * c.precio_unitario AS total
        FROM COMPRA AS c
        JOIN PRODUCTO AS p ON p.id_producto = c.id_producto
        WHERE c.id_usuario = ?
        ORDER BY c.fecha DESC
    `;

  conexion.query(consulta, [id], (error, resultado) => {
    if (error) {
      console.error("Error en la consulta:", error);
      return res
        .status(500)
        .json({ error: "Error al obtener las compras del cliente" });
    }
    res.status(200).json(resultado);
  });
});

app.get("/consultas/total-por-cliente", (req, res) => {
  const consulta = `
        SELECT cl.id_usuario, cl.nombre,
               COUNT(c.id_compra) AS cantidad_compras,
               COALESCE(SUM(c.cantidad * c.precio_unitario), 0) AS total_gastado
        FROM CLIENTE AS cl
        LEFT JOIN COMPRA AS c ON c.id_usuario = cl.id_usuario
        GROUP BY cl.id_usuario, cl.nombre
        ORDER BY total_gastado DESC
    `;

  conexion.query(consulta, (error, resultado) => {
    if (error) {
      console.error("Error en la consulta:", error);
      return res
        .status(500)
        .json({ error: "Error al obtener el total por cliente" });
    }
    res.status(200).json(resultado);
  });
});

app.get("/consultas/productos-proveedor", (req, res) => {
  const consulta = `
        SELECT p.id_producto, p.nombre, p.precio, p.stock, p.categoria,
               pr.nombre_empresa AS proveedor
        FROM PRODUCTO AS p
        LEFT JOIN PROVEEDOR AS pr ON pr.id_proveedor = p.id_proveedor
        ORDER BY p.nombre
    `;

  conexion.query(consulta, (error, resultado) => {
    if (error) {
      console.error("Error en la consulta:", error);
      return res
        .status(500)
        .json({ error: "Error al obtener los productos con proveedor" });
    }
    res.status(200).json(resultado);
  });
});

app.get("/consultas/stock-bajo", (req, res) => {
  const minimo = req.query.minimo === undefined ? 5 : Number(req.query.minimo);

  if (!Number.isInteger(minimo) || minimo < 0) {
    return res
      .status(400)
      .json({ error: "minimo debe ser un entero mayor o igual a 0" });
  }

  const consulta = `SELECT id_producto, nombre, stock FROM PRODUCTO WHERE stock <= ? ORDER BY stock ASC`;

  conexion.query(consulta, [minimo], (error, resultado) => {
    if (error) {
      console.error("Error en la consulta:", error);
      return res
        .status(500)
        .json({ error: "Error al obtener los productos con stock bajo" });
    }
    res.status(200).json(resultado);
  });
});

app.get("/consultas/buscar-productos", (req, res) => {
  const { texto, categoria } = req.query;

  let consulta = `SELECT id_producto, nombre, precio, stock, categoria FROM PRODUCTO WHERE 1=1`;
  const parametros = [];

  if (texto) {
    consulta += ` AND nombre LIKE ?`;
    parametros.push(`%${texto}%`);
  }
  if (categoria) {
    consulta += ` AND categoria = ?`;
    parametros.push(categoria);
  }

  conexion.query(consulta, parametros, (error, resultado) => {
    if (error) {
      console.error("Error en la consulta:", error);
      return res.status(500).json({ error: "Error al buscar productos" });
    }
    res.status(200).json(resultado);
  });
});

app.get("/consultas/mas-vendidos", (req, res) => {
  const limite = req.query.limite === undefined ? 5 : Number(req.query.limite);

  if (!Number.isInteger(limite) || limite <= 0) {
    return res
      .status(400)
      .json({ error: "limite debe ser un entero positivo" });
  }

  const consulta = `
        SELECT p.id_producto, p.nombre,
               SUM(c.cantidad) AS unidades_vendidas,
               SUM(c.cantidad * c.precio_unitario) AS ingresos
        FROM COMPRA AS c
        JOIN PRODUCTO AS p ON p.id_producto = c.id_producto
        GROUP BY p.id_producto, p.nombre
        ORDER BY unidades_vendidas DESC
        LIMIT ?
    `;

  conexion.query(consulta, [limite], (error, resultado) => {
    if (error) {
      console.error("Error en la consulta:", error);
      return res
        .status(500)
        .json({ error: "Error al obtener los más vendidos" });
    }
    res.status(200).json(resultado);
  });
});

app.get("/consultas/turnos", (req, res) => {
  const { estado } = req.query;

  let consulta = `
        SELECT t.id_turno, t.fecha_hora, t.estado,
               cl.nombre AS cliente, e.nombre AS empleado, e.puesto
        FROM TURNO AS t
        JOIN CLIENTE AS cl ON cl.id_usuario = t.id_usuario
        JOIN EMPLEADOS AS e ON e.id_empleado = t.id_empleado
    `;
  const parametros = [];

  if (estado) {
    consulta += ` WHERE t.estado = ?`;
    parametros.push(estado);
  }
  consulta += ` ORDER BY t.fecha_hora`;

  conexion.query(consulta, parametros, (error, resultado) => {
    if (error) {
      console.error("Error en la consulta:", error);
      return res.status(500).json({ error: "Error al obtener los turnos" });
    }
    res.status(200).json(resultado);
  });
});

app.get("/consultas/mensajes-pendientes", (req, res) => {
  const consulta = `
        SELECT q.id_consulta, q.detalle, q.fecha, cl.nombre AS cliente, cl.contacto
        FROM CONSULTA AS q
        JOIN CLIENTE AS cl ON cl.id_usuario = q.id_usuario
        WHERE q.estado = 'Pendiente'
        ORDER BY q.fecha
    `;

  conexion.query(consulta, (error, resultado) => {
    if (error) {
      console.error("Error en la consulta:", error);
      return res
        .status(500)
        .json({ error: "Error al obtener los mensajes pendientes" });
    }
    res.status(200).json(resultado);
  });
});

app.listen(PORT, () => {
  console.log(`servidor escuchando en http://localhost:${PORT}`);
});
