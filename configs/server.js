'use strict'

import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import { dbConnection } from "./mongo.js";
import limiter from '../src/middlewares/validar-cant-peticiones.js'
import { createCategory } from "../src/categorias/categoria.controller.js";
import { crateAdmin } from "../src/users/user.controller.js";
import authRoutes from '../src/auth/auth.routes.js'
import usuarioRoutes from '../src/users/user.routes.js'
import categoriaRoutes from '../src/categorias/categoria.routes.js'
import productoRoutes from '../src/productos/producto.routes.js'
import carritoRoutes from '../src/carritos/carrito.routes.js'
import compraRoutes from '../src/Compras-facturas/compra.routes.js'

const middlewares = (app) => {
    app.use(express.urlencoded({extended: false}));
    app.use(cors());
    app.use(express.json());
    app.use(helmet());
    app.use(morgan('dev'));
    app.use(limiter);
}

const routes = (app) =>{
        app.use("/proyectoFinal/v1/auth", authRoutes);
        app.use("/proyectoFinal/v1/usuario", usuarioRoutes);
        app.use("/proyectoFinal/v1/categoria", categoriaRoutes);
        app.use("/proyectoFinal/v1/producto", productoRoutes);
        app.use("/proyectoFinal/v1/carrito", carritoRoutes);
        app.use("/proyectoFinal/v1/compra", compraRoutes)
}

const conectarDB = async () => {
    try{
        await dbConnection();
        console.log("Conexión a la base de datos exitosa");
    }catch(error){
        console.error('Error al conectar con la base de datos', error);
        process.exit(1);
    }
}

export const initServer = async () => {
    const app = express();
    const port = process.env.PORT || 3001;
    try {
        middlewares(app);
        await conectarDB();
        routes(app);
        await createCategory();
        await crateAdmin();
        app.listen(port);
        console.log(`Server running on port: ${port}`);
    } catch (err) {
        console.log(`Server init failed: ${err}`);
    }
}