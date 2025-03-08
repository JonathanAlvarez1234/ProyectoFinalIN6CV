import { Route } from "express";
import { agregarAlCarrito, getMyCarrito, eliminarProdDeCarrito, vaciarCarrito } from "./carrito.controller.js";
import { validarJWT } from "../middlewares/validar-jwt.js";
import { validarCampos } from "../middlewares/validar-campos.js";

const router = Route();

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
    "/:id",
    [
        validarJWT,
        validarCampos
    ],
    eliminarProdDeCarrito
);

router.delete(
    "/vaciar",
    [
        validarJWT,
        validarCampos
    ],
    vaciarCarrito
);

export default router;