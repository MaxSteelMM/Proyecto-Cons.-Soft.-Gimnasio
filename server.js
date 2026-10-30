const express = require ('express');
const cors = require ('cors')
const mysql = require('mysql2')

const app = express()

app.use(cors())
app.use(express.json())

const conexion =mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '1234',
    database: 'gestion_gimnasio'
})

const PORT=3000
app.get("/productos", (req, res) => {
    const consulta = `
        SELECT producto.id_producto, producto.nombre, producto.precio,
            producto.stock, producto.categoria,
            COALESCE(ventas.unidades_vendidas, 0) AS popularidad
        FROM PRODUCTO AS producto
        LEFT JOIN (
            SELECT id_producto, SUM(cantidad) AS unidades_vendidas
            FROM COMPRA
            GROUP BY id_producto
        ) AS ventas ON ventas.id_producto = producto.id_producto
        ORDER BY producto.nombre
    `

    conexion.query(consulta, (error, resultados) => {
        if (error) {
            console.error("Error al consultar los productos:", error)
            return res.status(500).json({ error: "Error al consultar los productos" })
        }

        res.json(resultados)
    })
})

//compra
app.post("/compras", (req,res)=>{
    const { id_usuario, id_producto, cantidad } = req.body

    if (!Number.isInteger(id_usuario) || id_usuario <= 0 ||
        !Number.isInteger(id_producto) || id_producto <= 0 ||
        !Number.isInteger(cantidad) || cantidad <= 0) {
        return res.status(400).json({
            error: "id_usuario, id_producto y cantidad deben ser enteros positivos"
        })
    }

    conexion.beginTransaction((error) => {
        if (error) {
            console.error("Error al iniciar la compra:", error)
            return res.status(500).json({ error: "Error al registrar la compra" })
        }

        const abortarCompra = (status, message, queryError) => {
            if (queryError) {
                console.error("Error al registrar la compra:", queryError)
            }
            conexion.rollback((rollbackError) => {
                if (rollbackError) {
                    console.error("Error al cancelar la compra:", rollbackError)
                }
                res.status(status).json({ error: message })
            })
        }

        conexion.query(
            "UPDATE PRODUCTO SET stock = stock - ? WHERE id_producto = ? AND stock >= ?",
            [cantidad, id_producto, cantidad],
            (stockError, stockResult) => {
                if (stockError) {
                    return abortarCompra(500, "Error al actualizar el stock", stockError)
                }

                if (stockResult.affectedRows === 0) {
                    return conexion.query(
                        "SELECT id_producto FROM PRODUCTO WHERE id_producto = ?",
                        [id_producto],
                        (productError, productResult) => {
                            if (productError) {
                                return abortarCompra(
                                    500,
                                    "Error al consultar el producto",
                                    productError
                                )
                            }
                            if (productResult.length === 0) {
                                return abortarCompra(404, "No se encontró el producto")
                            }
                            return abortarCompra(409, "Stock insuficiente para el producto")
                        }
                    )
                }

                const consulta = `
                    INSERT INTO COMPRA (id_usuario, id_producto, cantidad, precio_unitario, fecha)
                    SELECT cliente.id_usuario, producto.id_producto, ?, producto.precio, CURDATE()
                    FROM CLIENTE AS cliente
                    JOIN PRODUCTO AS producto ON producto.id_producto = ?
                    WHERE cliente.id_usuario = ?
                `

                conexion.query(
                    consulta,
                    [cantidad, id_producto, id_usuario],
                    (purchaseError, purchaseResult) => {
                        if (purchaseError) {
                            return abortarCompra(
                                500,
                                "Error al registrar la compra",
                                purchaseError
                            )
                        }

                        if (purchaseResult.affectedRows === 0) {
                            return abortarCompra(404, "No se encontró el cliente")
                        }

                        conexion.commit((commitError) => {
                            if (commitError) {
                                return abortarCompra(
                                    500,
                                    "Error al confirmar la compra",
                                    commitError
                                )
                            }

                            res.status(201).json({
                                mensaje: "Compra registrada correctamente",
                                id_compra: purchaseResult.insertId
                            })
                        })
                    }
                )
            }
        )
    })
})

app.listen( PORT,()=>{
    console.log(`servidor escuchando en http://localhost:${PORT}`)
})
