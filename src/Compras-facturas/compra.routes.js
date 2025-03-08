import { Router } from "express";
import { compraCarrito, misFacturas, miFacturaById, historialMisFacturas } from "./compra.controller.js";
import { validarCampos } from "../middlewares/validar-campos.js"; 
import { validarJWT } from "../middlewares/validar-jwt.js";

const router = Router();

router.post(
    "/comprarCarrito",
    [
        validarJWT,
        validarCampos
    ],
    compraCarrito
);

router.get(
    "/facturas",
    [
        validarJWT
    ],
    misFacturas
);

router.get(
    "/factura/:facturaId",
    [
        validarJWT
    ],
    miFacturaById
);

router.get(
    "/historial",
    [
        validarJWT
    ],
    historialMisFacturas
);

export default router;