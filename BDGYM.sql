

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
        REFERENCES PRODUCTO(id_producto) ON DELETE RESTRICT
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
('Remera deportiva MLS', 30.00, 15, 'Indumentaria', 1),
('Short deportivo MLS', 26.00, 12, 'Indumentaria', 1),
('Barra olimpica estandar 20 kg', 180.00, 5, 'Equipamiento', 1),
('Discos olimpicos 10 kg (par)', 80.00, 8, 'Equipamiento', 1),
('Kettlebell 12 kg', 38.00, 8, 'Equipamiento', 1),
('Bandas elasticas de resistencia (set de 5)', 18.00, 12, 'Accesorios', 1),
('Cuerda para saltar con rulemanes', 15.00, 10, 'Accesorios', 1),
('Guantes de entrenamiento antideslizantes', 20.00, 12, 'Accesorios', 1),
('Colchoneta fitness antideslizante', 24.00, 10, 'Accesorios', 1),
('Botella deportiva 750 ml', 12.00, 15, 'Accesorios', 1);

INSERT INTO PRODUCTO (nombre, precio, stock, categoria, id_proveedor) VALUES
('Mancuernas ajustables 2 a 24 kg (par)', 120.00, 8, 'Equipamiento', 1),
('Mancuernas hexagonales 10 kg (par)', 42.00, 12, 'Equipamiento', 1),
('Discos bumper 5 kg (par)', 32.00, 10, 'Equipamiento', 1),
('Discos olímpicos 15 kg (par)', 105.00, 6, 'Equipamiento', 1),
('Barra curl EZ cromada 1,2 m', 48.00, 7, 'Equipamiento', 1),
('Banco de pesas ajustable reforzado', 95.00, 5, 'Equipamiento', 1),
('Rack para sentadillas con soportes', 220.00, 3, 'Equipamiento', 1),
('Kettlebell de hierro 16 kg', 48.00, 8, 'Equipamiento', 1),
('Kettlebell de hierro 20 kg', 62.00, 6, 'Equipamiento', 1),
('Chaleco lastrado de 10 kg', 70.00, 5, 'Equipamiento', 1),
('Barra de dominadas para puerta', 55.00, 9, 'Equipamiento', 1),
('Mancuernas hexagonales 15 kg (par)', 64.00, 8, 'Equipamiento', 1),
('Mancuernas hexagonales 20 kg (par)', 88.00, 5, 'Equipamiento', 1),
('Discos olímpicos 20 kg (par)', 135.00, 4, 'Equipamiento', 1),
('Set de collarines olímpicos metálicos', 18.00, 14, 'Equipamiento', 1),
('Remera manga larga dry fit', 34.00, 16, 'Indumentaria', 1),
('Musculosa deportiva transpirable', 24.00, 18, 'Indumentaria', 1),
('Calza deportiva de compresion', 38.00, 12, 'Indumentaria', 1),
('Legging de cintura alta', 42.00, 14, 'Indumentaria', 1),
('Jogger deportivo liviano', 46.00, 10, 'Indumentaria', 1),
('Buzo con capucha para entrenamiento', 58.00, 8, 'Indumentaria', 1),
('Top deportivo de soporte medio', 29.00, 15, 'Indumentaria', 1),
('Pantaloneta de entrenamiento liviana', 32.00, 13, 'Indumentaria', 1),
('Medias deportivas acolchadas (par)', 9.00, 30, 'Indumentaria', 1),
('Guantes de entrenamiento con muñequera', 22.00, 12, 'Indumentaria', 1),
('Camiseta térmica de compresión', 39.00, 9, 'Indumentaria', 1),
('Short de ciclismo con badana', 44.00, 7, 'Indumentaria', 1),
('Pantalon jogger de algodon', 49.00, 11, 'Indumentaria', 1),
('Gorra deportiva liviana', 18.00, 20, 'Indumentaria', 1),
('Campera rompeviento deportiva', 68.00, 6, 'Indumentaria', 1),
('Proteína vegetal de arveja 1 kg', 32.00, 12, 'Suplementos', 2),
('Proteína whey sabor chocolate 1 kg', 36.00, 14, 'Suplementos', 2),
('Creatina monohidratada 300 g', 25.00, 18, 'Suplementos', 2),
('Creatina micronizada 500 g', 39.00, 10, 'Suplementos', 2),
('Avena instantánea integral 1 kg', 8.00, 24, 'Suplementos', 2),
('Mantequilla de maní natural 500 g', 12.00, 16, 'Suplementos', 2),
('Barritas de proteína (caja de 12)', 22.00, 15, 'Suplementos', 2),
('Galletas de avena y proteína (pack)', 11.00, 18, 'Suplementos', 2),
('Bebida isotónica en polvo 500 g', 17.00, 13, 'Suplementos', 2),
('Pre entreno sabor frutos rojos 300 g', 28.00, 9, 'Suplementos', 2),
('Sales de hidratación y electrolitos (pack)', 14.00, 20, 'Suplementos', 2),
('Granola con frutos secos 750 g', 13.00, 17, 'Suplementos', 2),
('Harina de avena instantánea 1 kg', 9.00, 22, 'Suplementos', 2),
('Mix de frutos secos sin sal 500 g', 16.00, 14, 'Suplementos', 2),
('Proteina caseína sabor vainilla 900 g', 43.00, 8, 'Suplementos', 2);

INSERT INTO TURNO (fecha_hora, estado, id_usuario, id_empleado) VALUES
('2026-10-25 10:00:00', 'Programado', 1, 1);

INSERT INTO CONSULTA (detalle, fecha, estado, id_usuario) VALUES
('Quisiera saber los horarios de Crossfit', '2026-10-23', 'Pendiente', 2);

INSERT INTO COMPRA (id_usuario, id_producto, cantidad, precio_unitario, fecha) VALUES
(1, 1, 1, 45.00, '2026-10-23');
