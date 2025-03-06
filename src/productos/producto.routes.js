import { Router } from "express";
import { saveProducto, getProductos, updateProducto, deleteProducto, productosAgotados } from "./producto.controller.js";
import { validarJWT } from "../middlewares/validar-jwt.js";
import { tieneRole } from "../middlewares/validar-roles.js";
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

router.get("/", validarJWT, productosAgotados);

//router.get("/", );

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

export default router;