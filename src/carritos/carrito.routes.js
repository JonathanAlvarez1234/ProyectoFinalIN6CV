import { Router } from "express";
import { agregarAlCarrito, getMyCarrito, eliminarProdDeCarrito, vaciarCarrito } from "./carrito.controller.js";
import { validarJWT } from "../middlewares/validar-jwt.js";
import { validarCampos } from "../middlewares/validar-campos.js";

const router = Router();

router.get(
    "/",
    [
        validarJWT
    ],
    getMyCarrito
);

router.post(
    "/addP",
    [
        validarJWT,
        validarCampos
    ],
    agregarAlCarrito
);

router.delete(
    "/:productoId",
    [
        validarJWT,
        validarCampos
    ],
    eliminarProdDeCarrito
);

router.delete(
    "/vaciar/:usuarioId",
    [
        validarJWT,
        validarCampos
    ],
    vaciarCarrito
);

export default router;