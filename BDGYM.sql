

CREATE DATABASE IF NOT EXISTS gestion_gimnasio;
USE gestion_gimnasio;

-- 1. Tabla EMPLEADOS
CREATE TABLE EMPLEADOS (
    id_empleado INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    puesto VARCHAR(50),
    contacto VARCHAR(100),
    email VARCHAR(100) UNIQUE
) ENGINE=InnoDB;

CREATE TABLE CLIENTE (
    id_usuario INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) ,
    contacto VARCHAR(100),
    direccion VARCHAR(255),
    fecha_registro DATE ,
    email VARCHAR(100) 
) ENGINE=InnoDB;

CREATE TABLE CONSULTA (
    id_consulta INT AUTO_INCREMENT PRIMARY KEY,
    detalle TEXT ,
    fecha DATE ,
    estado VARCHAR(20) DEFAULT 'Pendiente',
    id_usuario INT ,
    CONSTRAINT fk_consulta_cliente FOREIGN KEY (id_usuario)
        REFERENCES CLIENTE(id_usuario) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE TURNO (
    id_turno INT AUTO_INCREMENT PRIMARY KEY,
    fecha_hora DATETIME,
    estado VARCHAR(20) DEFAULT 'Programado',
    id_usuario INT NOT NULL,
    id_empleado INT NOT NULL,
    CONSTRAINT fk_turno_cliente FOREIGN KEY (id_usuario)
        REFERENCES CLIENTE(id_usuario) ON DELETE CASCADE,
    CONSTRAINT fk_turno_empleado FOREIGN KEY (id_empleado)
        REFERENCES EMPLEADOS(id_empleado) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE PROVEEDOR (
    id_proveedor INT AUTO_INCREMENT PRIMARY KEY,
    nombre_empresa VARCHAR(150) NOT NULL,
    contacto VARCHAR(100),
    telefono VARCHAR(20)
) ENGINE=InnoDB;

CREATE TABLE PRODUCTO (
    id_producto INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    precio DECIMAL(10, 2) NOT NULL,
    stock INT NOT NULL DEFAULT 0,
    categoria VARCHAR(50),
    id_proveedor INT,
    CONSTRAINT fk_producto_proveedor FOREIGN KEY (id_proveedor)
        REFERENCES PROVEEDOR(id_proveedor) ON DELETE SET NULL
) ENGINE=InnoDB;

CREATE TABLE COMPRA (
    id_compra INT AUTO_INCREMENT PRIMARY KEY,
    id_usuario INT NOT NULL,
    id_producto INT NOT NULL,
    cantidad INT NOT NULL DEFAULT 1,
    precio_unitario DECIMAL(10, 2) NOT NULL,
    fecha DATE NOT NULL,
    CONSTRAINT fk_compra_cliente FOREIGN KEY (id_usuario)
        REFERENCES CLIENTE(id_usuario) ON DELETE CASCADE,
    CONSTRAINT fk_compra_producto FOREIGN KEY (id_producto)
        REFERENCES PRODUCTO(id_producto) ON DELETE CASCADE
) ENGINE=InnoDB;


INSERT INTO EMPLEADOS (nombre, puesto, contacto) VALUES
('Juan Pérez', 'Entrenador Personal', '123456789'),
('Ana García', 'Recepcionista', '987654321');

INSERT INTO CLIENTE (nombre, contacto, direccion, fecha_registro) VALUES
('Carlos Gómez', '555-123', 'Calle Falsa 123', '2023-01-15'),
('María López', '555-456', 'Av. Principal 456', '2023-02-20');

INSERT INTO PROVEEDOR (nombre_empresa, contacto) VALUES
('SportEq Ltda', 'ventas@sporteq.com'),
('NutriHealth', 'info@nutrihealth.com');

INSERT INTO PRODUCTO (nombre, precio, stock, categoria, id_proveedor) VALUES
('Proteína Whey 2kg', 45.00, 20, 'Suplementos', 2),
('Mancuernas 5kg', 25.00, 10, 'Equipamiento', 1),
('Remera deportiva MLS', 30.00, 15, 'Indumentaria', 1);

INSERT INTO TURNO (fecha_hora, estado, id_usuario, id_empleado) VALUES
('2026-10-25 10:00:00', 'Programado', 1, 1);

INSERT INTO CONSULTA (detalle, fecha, estado, id_usuario) VALUES
('Quisiera saber los horarios de Crossfit', '2026-10-23', 'Pendiente', 2);

INSERT INTO COMPRA (id_usuario, id_producto, cantidad, precio_unitario, fecha) VALUES
(1, 1, 1, 45.00, '2026-10-23');
