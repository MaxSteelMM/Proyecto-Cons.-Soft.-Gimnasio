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

    const consulta = `
        INSERT INTO COMPRA (id_usuario, id_producto, cantidad, precio_unitario, fecha)
        SELECT cliente.id_usuario, producto.id_producto, ?, producto.precio, CURDATE()
        FROM CLIENTE AS cliente
        JOIN PRODUCTO AS producto ON producto.id_producto = ?
        WHERE cliente.id_usuario = ?
    `

    conexion.query(consulta, [cantidad, id_producto, id_usuario], (error, resultado) => {
        if (error) {
            console.error("Error al registrar la compra:", error)
            return res.status(500).json({ error: "Error al registrar la compra" })
        }

        if (resultado.affectedRows === 0) {
            return res.status(404).json({
                error: "No se encontró el cliente o el producto"
            })
        }

        res.status(201).json({
            mensaje: "Compra registrada correctamente",
            id_compra: resultado.insertId
        })
    })
})

app.listen( PORT,()=>{
    console.log(`servidor escuchando en http://localhost:${PORT}`)
})
