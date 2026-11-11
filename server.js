
const express = require("express");
const cors = require("cors");
const mysql = require("mysql2");
const session = require("express-session");
const MySQLStore = require("express-mysql-session")(session);
const bcrypt = require("bcryptjs");
const crypto = require("node:crypto");

require("dotenv").config();

const app = express();

const dbConfig = {
  host: process.env.DB_HOST || "127.0.0.1",
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD ?? "",
  database: process.env.DB_NAME || "gestion_gimnasio",
};
const allowedOrigins = (
  process.env.FRONTEND_ORIGINS ||
  "http://localhost:5500,http://127.0.0.1:5500"
)
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);
const isLocalDevelopmentOrigin = (origin) => {
  if (process.env.NODE_ENV === "production") return false;
  try {
    const url = new URL(origin);
    return (
      url.protocol === "http:" &&
      (url.hostname === "localhost" || url.hostname === "127.0.0.1")
    );
  } catch {
    return false;
  }
};
const sessionSecret = process.env.SESSION_SECRET || crypto.randomBytes(32).toString("hex");

if (process.env.NODE_ENV === "production" && !process.env.SESSION_SECRET) {
  throw new Error("SESSION_SECRET es obligatorio en producción");
}
if (process.env.NODE_ENV === "production") {
  app.set("trust proxy", 1);
}

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.includes(origin) || isLocalDevelopmentOrigin(origin)) {
        return callback(null, true);
      }
      return callback(null, false);
    },
    credentials: true,
  }),
);
app.use(express.json());

const conexion = mysql.createConnection({
  ...dbConfig,
});
const sessionStore = new MySQLStore(dbConfig);

sessionStore.on("error", (error) => {
  console.error("Error en el almacenamiento de sesiones:", error);
});

app.use(
  session({
    name: "gym-mls.sid",
    secret: sessionSecret,
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 8 * 60 * 60 * 1000,
    },
  }),
);

const PORT = 3000;

const requireAdmin = (req, res, next) => {
  if (req.session.role !== "admin") {
    return res.status(401).json({ error: "Iniciá sesión como administrador" });
  }
  next();
};

const requireClient = (req, res, next) => {
  if (req.session.role !== "client" || !Number.isInteger(req.session.userId)) {
    return res.status(401).json({ error: "Iniciá sesión para continuar" });
  }
  next();
};

const startClientSession = (req, res, client) => {
  req.session.regenerate((error) => {
    if (error) {
      console.error("Error al iniciar la sesión del cliente:", error);
      return res.status(500).json({ error: "No se pudo iniciar la sesión" });
    }

    req.session.role = "client";
    req.session.userId = Number(client.id_usuario);
    req.session.save((saveError) => {
      if (saveError) {
        console.error("Error al guardar la sesión del cliente:", saveError);
        return res.status(500).json({ error: "No se pudo guardar la sesión" });
      }
      res.status(200).json({ authenticated: true });
    });
  });
};

const isValidProductId = (id) =>
  /^[1-9]\d*$/.test(id) && Number(id) <= 2147483647;

const validateProduct = (body) => {
  const { nombre, precio, stock, categoria, id_proveedor } = body || {};

  if (typeof nombre !== "string" || nombre.trim() === "" || nombre.trim().length > 100) {
    return "El nombre es obligatorio y no puede superar los 100 caracteres";
  }
  if (
    typeof precio !== "number" ||
    !Number.isFinite(precio) ||
    precio < 0 ||
    precio > 99999999.99 ||
    Math.round(precio * 100) / 100 !== precio
  ) {
    return "El precio debe ser un número entre 0 y 99.999.999,99 con hasta dos decimales";
  }
  if (!Number.isInteger(stock) || stock < 0 || stock > 2147483647) {
    return "El stock debe ser un entero mayor o igual a cero";
  }
  if (
    categoria !== undefined &&
    categoria !== null &&
    (typeof categoria !== "string" || categoria.trim().length > 50)
  ) {
    return "La categoría no puede superar los 50 caracteres";
  }
  if (
    id_proveedor !== undefined &&
    id_proveedor !== null &&
    (!Number.isInteger(id_proveedor) || id_proveedor <= 0 || id_proveedor > 2147483647)
  ) {
    return "El proveedor seleccionado no es válido";
  }
  return null;
};

const productValues = (body) => [
  body.nombre.trim(),
  body.precio,
  body.stock,
  typeof body.categoria === "string" && body.categoria.trim()
    ? body.categoria.trim()
    : null,
  body.id_proveedor ?? null,
];

// ======================= ADMINISTRACIÓN =======================

app.get("/admin/session", (req, res) => {
  res.status(200).json({
    authenticated: req.session.role === "admin",
    username: req.session.role === "admin" ? req.session.username : null,
  });
});

app.post("/admin/login", async (req, res) => {
  const adminUsername = process.env.ADMIN_USERNAME;
  const passwordHash = process.env.ADMIN_PASSWORD_HASH;

  if (!adminUsername || !passwordHash) {
    return res.status(503).json({
      error: "El administrador no está configurado. Revisá las variables del archivo .env.",
    });
  }
  if (
    typeof req.body?.username !== "string" ||
    typeof req.body?.password !== "string" ||
    req.body.username.length > 100 ||
    req.body.password.length > 200
  ) {
    return res.status(400).json({ error: "Ingresá un usuario y una contraseña válidos" });
  }
  if (!/^\$2[aby]\$\d{2}\$[./A-Za-z0-9]{53}$/.test(passwordHash)) {
    console.error("ADMIN_PASSWORD_HASH no contiene un hash bcrypt válido");
    return res.status(503).json({ error: "La configuración de acceso del administrador no es válida" });
  }

  try {
    const passwordMatches = await bcrypt.compare(req.body.password, passwordHash);
    if (req.body.username !== adminUsername || !passwordMatches) {
      return res.status(401).json({ error: "Usuario o contraseña incorrectos" });
    }

    req.session.regenerate((error) => {
      if (error) {
        console.error("Error al iniciar la sesión del administrador:", error);
        return res.status(500).json({ error: "No se pudo iniciar la sesión" });
      }
      req.session.role = "admin";
      req.session.username = adminUsername;
      req.session.save((saveError) => {
        if (saveError) {
          console.error("Error al guardar la sesión del administrador:", saveError);
          return res.status(500).json({ error: "No se pudo guardar la sesión" });
        }
        res.status(200).json({ authenticated: true, username: adminUsername });
      });
    });
  } catch (error) {
    console.error("Error al validar el acceso del administrador:", error);
    res.status(500).json({ error: "No se pudo validar el acceso" });
  }
});

app.post("/admin/logout", (req, res) => {
  req.session.destroy((error) => {
    if (error) {
      console.error("Error al cerrar la sesión del administrador:", error);
      return res.status(500).json({ error: "No se pudo cerrar la sesión" });
    }
    res.clearCookie("gym-mls.sid", {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
    });
    res.status(200).json({ mensaje: "Sesión cerrada" });
  });
});

// ======================= ACCESO DE CLIENTES =======================

app.get("/auth/session", (req, res) => {
  if (req.session.role !== "client" || !Number.isInteger(req.session.userId)) {
    return res.status(200).json({ authenticated: false, user: null });
  }

  conexion.query(
    `SELECT id_usuario, nombre, contacto, direccion, fecha_registro, email
     FROM CLIENTE
     WHERE id_usuario = ? AND password_hash IS NOT NULL`,
    [req.session.userId],
    (error, rows) => {
      if (error) {
        console.error("Error al consultar la sesión del cliente:", error);
        return res.status(500).json({ error: "No se pudo consultar la sesión" });
      }
      if (rows.length === 0) {
        return res.status(200).json({ authenticated: false, user: null });
      }
      res.status(200).json({ authenticated: true, user: rows[0] });
    },
  );
});

app.post("/auth/register", async (req, res) => {
  const { nombre, contacto, direccion, email, password } = req.body || {};
  const fields = { nombre, contacto, direccion };
  if (
    Object.values(fields).some(
      (value) => typeof value !== "string" || value.trim() === "",
    ) ||
    typeof email !== "string" ||
    typeof password !== "string"
  ) {
    return res.status(400).json({ error: "Completá todos los campos obligatorios" });
  }

  const client = {
    nombre: nombre.trim(),
    contacto: contacto.trim(),
    direccion: direccion.trim(),
    email: email.trim().toLowerCase(),
  };
  if (
    client.nombre.length > 100 ||
    client.contacto.length > 100 ||
    client.direccion.length > 255 ||
    client.email.length > 100 ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(client.email)
  ) {
    return res.status(400).json({ error: "Revisá los datos ingresados y el correo electrónico" });
  }
  if (
    password.length < 8 ||
    Buffer.byteLength(password, "utf8") > 72
  ) {
    return res.status(400).json({
      error: "La contraseña debe tener al menos 8 caracteres y no superar los 72 bytes",
    });
  }

  try {
    const passwordHash = await bcrypt.hash(password, 12);
    conexion.query(
      `INSERT INTO CLIENTE (nombre, contacto, direccion, fecha_registro, email, password_hash)
       VALUES (?, ?, ?, CURDATE(), ?, ?)`,
      [client.nombre, client.contacto, client.direccion, client.email, passwordHash],
      (error, result) => {
        if (error) {
          if (error.code === "ER_DUP_ENTRY") {
            return res.status(409).json({ error: "Ya existe una cuenta con ese correo" });
          }
          console.error("Error al registrar la cuenta del cliente:", error);
          return res.status(500).json({ error: "No se pudo crear la cuenta" });
        }
        startClientSession(req, res, { id_usuario: result.insertId });
      },
    );
  } catch (error) {
    console.error("Error al proteger la contraseña del cliente:", error);
    res.status(500).json({ error: "No se pudo crear la cuenta" });
  }
});

app.post("/auth/login", (req, res) => {
  const { email, password } = req.body || {};
  if (
    typeof email !== "string" ||
    typeof password !== "string" ||
    email.length > 100 ||
    password.length > 200
  ) {
    return res.status(400).json({ error: "Ingresá un correo y una contraseña válidos" });
  }

  conexion.query(
    `SELECT id_usuario, password_hash
     FROM CLIENTE
     WHERE email_login = LOWER(?) AND password_hash IS NOT NULL
     LIMIT 1`,
    [email.trim()],
    async (error, rows) => {
      if (error) {
        console.error("Error al buscar la cuenta del cliente:", error);
        return res.status(500).json({ error: "No se pudo validar el acceso" });
      }

      try {
        const passwordMatches = rows.length > 0 &&
          await bcrypt.compare(password, rows[0].password_hash);
        if (!passwordMatches) {
          return res.status(401).json({ error: "Correo o contraseña incorrectos" });
        }
        startClientSession(req, res, rows[0]);
      } catch (validationError) {
        console.error("Error al validar el acceso del cliente:", validationError);
        res.status(500).json({ error: "No se pudo validar el acceso" });
      }
    },
  );
});

app.post("/auth/logout", (req, res) => {
  req.session.destroy((error) => {
    if (error) {
      console.error("Error al cerrar la sesión del cliente:", error);
      return res.status(500).json({ error: "No se pudo cerrar la sesión" });
    }
    res.clearCookie("gym-mls.sid", {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
    });
    res.status(200).json({ mensaje: "Sesión cerrada" });
  });
});

app.get("/auth/purchases", requireClient, (req, res) => {
  conexion.query(
    `SELECT c.id_compra, c.fecha, p.nombre AS producto, c.cantidad,
            c.precio_unitario, c.cantidad * c.precio_unitario AS total
     FROM COMPRA AS c
     JOIN PRODUCTO AS p ON p.id_producto = c.id_producto
     WHERE c.id_usuario = ?
     ORDER BY c.fecha DESC, c.id_compra DESC`,
    [req.session.userId],
    (error, rows) => {
      if (error) {
        console.error("Error al obtener las compras del cliente:", error);
        return res.status(500).json({ error: "No se pudo obtener el historial de compras" });
      }
      res.status(200).json(rows);
    },
  );
});

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
  if (!isValidProductId(id)) {
    return res.status(400).json({ error: "El ID del producto no es válido" });
  }
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

app.get("/proveedores", (req, res) => {
  conexion.query(
    "SELECT id_proveedor, nombre_empresa FROM PROVEEDOR ORDER BY nombre_empresa",
    (error, resultado) => {
      if (error) {
        console.error("Error al obtener los proveedores:", error);
        return res.status(500).json({ error: "Error al obtener los proveedores" });
      }
      res.status(200).json(resultado);
    },
  );
});

//agregar producto
app.post("/productos", requireAdmin, (req, res) => {
  const validationError = validateProduct(req.body);
  if (validationError) {
    return res.status(400).json({ error: validationError });
  }

  const consulta = `INSERT INTO PRODUCTO (nombre, precio, stock, categoria, id_proveedor) VALUES (?, ?, ?, ?, ?)`;

  conexion.query(
    consulta,
    productValues(req.body),
    (error, resultado) => {
      if (error) {
        console.error("Error al agregar el producto:", error);
        if (error.code === "ER_NO_REFERENCED_ROW_2") {
          return res.status(400).json({ error: "El proveedor seleccionado no existe" });
        }
        return res.status(500).json({ error: "Error al agregar el producto" });
      }
      res.status(201).json({
        mensaje: "Producto creado correctamente",
        id_nuevo_producto: resultado.insertId,
      });
    },
  );
});

//actualizar producto
app.put("/productos/:id", requireAdmin, (req, res) => {
  const { id } = req.params;
  if (!isValidProductId(id)) {
    return res.status(400).json({ error: "El ID del producto no es válido" });
  }
  const validationError = validateProduct(req.body);
  if (validationError) {
    return res.status(400).json({ error: validationError });
  }

  const consulta = `UPDATE PRODUCTO SET nombre = ?, precio = ?, stock = ?, categoria = ?, id_proveedor = ? WHERE id_producto = ?`;

  conexion.query(
    consulta,
    [...productValues(req.body), id],
    (error, resultado) => {
      if (error) {
        console.error("Error al actualizar el producto:", error);
        if (error.code === "ER_NO_REFERENCED_ROW_2") {
          return res.status(400).json({ error: "El proveedor seleccionado no existe" });
        }
        return res.status(500).json({ error: "Error al actualizar el producto" });
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
app.delete("/productos/:id", requireAdmin, (req, res) => {
  const { id } = req.params;
  if (!isValidProductId(id)) {
    return res.status(400).json({ error: "El ID del producto no es válido" });
  }

  conexion.query(
    "SELECT COUNT(*) AS cantidad FROM COMPRA WHERE id_producto = ?",
    [id],
    (countError, filas) => {
      if (countError) {
        console.error("Error al verificar las compras del producto:", countError);
        return res.status(500).json({ error: "No se pudo verificar el historial del producto" });
      }
      if (Number(filas[0].cantidad) > 0) {
        return res.status(409).json({
          error: "No se puede eliminar un producto con compras registradas; editá su stock o nombre para conservar el historial",
        });
      }

      conexion.query(
        "DELETE FROM PRODUCTO WHERE id_producto = ?",
        [id],
        (error, resultado) => {
          if (error) {
            console.error("Error al eliminar el producto:", error);
            if (error.code === "ER_ROW_IS_REFERENCED_2") {
              return res.status(409).json({
                error: "No se puede eliminar un producto con compras registradas",
              });
            }
            return res.status(500).json({ error: "Error al eliminar el producto" });
          }
          if (resultado.affectedRows === 0) {
            return res.status(404).json({ error: "Producto no encontrado" });
          }
          res.status(200).json({ mensaje: "Producto eliminado correctamente" });
        },
      );
    },
  );
});

// ======================= COMPRAS =======================

//compra
app.post("/compras", (req, res) => {
  const { id_usuario, id_producto, cantidad } = req.body || {};

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
  if (
    req.session.role === "client" &&
    req.session.userId !== id_usuario
  ) {
    return res.status(403).json({ error: "No podés registrar una compra para otra cuenta" });
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
  if (!/^[1-9]\d*$/.test(id) || Number(id) > 2147483647) {
    return res.status(400).json({ error: "El ID del cliente no es válido" });
  }
  if (
    req.session.role !== "admin" &&
    (req.session.role !== "client" || req.session.userId !== Number(id))
  ) {
    return res.status(req.session.role === "client" ? 403 : 401).json({
      error: "No tenés permiso para consultar este historial",
    });
  }

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

const ensureClientAuthSchema = async () => {
  const database = conexion.promise();
  const [columns] = await database.query(
    `SELECT COLUMN_NAME
     FROM information_schema.COLUMNS
     WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'CLIENTE'`,
  );
  const columnNames = new Set(columns.map((column) => column.COLUMN_NAME));

  if (!columnNames.has("password_hash")) {
    await database.query(
      "ALTER TABLE CLIENTE ADD COLUMN password_hash VARCHAR(255) NULL",
    );
  }
  if (!columnNames.has("email_login")) {
    await database.query(
      `ALTER TABLE CLIENTE
       ADD COLUMN email_login VARCHAR(100)
       GENERATED ALWAYS AS (
         CASE
           WHEN password_hash IS NULL OR email IS NULL THEN NULL
           ELSE LOWER(email)
         END
       ) STORED`,
    );
  }

  const [indexes] = await database.query(
    `SELECT INDEX_NAME
     FROM information_schema.STATISTICS
     WHERE TABLE_SCHEMA = DATABASE()
       AND TABLE_NAME = 'CLIENTE'
       AND INDEX_NAME = 'uq_cliente_email_login'
     LIMIT 1`,
  );
  if (indexes.length === 0) {
    await database.query(
      "ALTER TABLE CLIENTE ADD UNIQUE KEY uq_cliente_email_login (email_login)",
    );
  }
};

conexion.connect((error) => {
  if (error) {
    console.error(
      `No se pudo conectar a MySQL en ${dbConfig.host} con el usuario ${dbConfig.user}. Revisá que MySQL esté iniciado y que DB_HOST, DB_USER, DB_PASSWORD y DB_NAME sean correctos.`,
      error,
    );
    process.exit(1);
  }

  ensureClientAuthSchema()
    .then(() => {
      app.listen(PORT, () => {
        console.log(`servidor escuchando en http://localhost:${PORT}`);
      });
    })
    .catch((schemaError) => {
      console.error("No se pudo preparar la base para el acceso de clientes:", schemaError);
      process.exit(1);
    });
});
