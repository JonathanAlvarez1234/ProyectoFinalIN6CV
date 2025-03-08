import { Router } from "express";
import { saveProducto, getProductos, updateProducto, deleteProducto, productosAgotados, productosMasVendidos } from "./producto.controller.js";
import { validarJWT } from "../middlewares/validar-jwt.js";
import { validarCampos } from "../middlewares/validar-campos.js";

const router = Router();

router.post(
    "/",
    [
        validarJWT,
        validarCampos
    ],
    saveProducto
);

router.get("/", getProductos);

router.get("/agotados", validarJWT, productosAgotados);

router.put(
    "/:id",
    [
        validarJWT,
        validarCampos
    ],
    updateProducto
);

router.delete(
    "/:id",
    [
        validarJWT
    ],
    deleteProducto
);

router.get("/masVendidos", validarJWT ,productosMasVendidos)

export default router;