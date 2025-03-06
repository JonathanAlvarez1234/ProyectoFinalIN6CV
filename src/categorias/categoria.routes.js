import { Router } from "express";
import { saveCategoria, getCategorias, updateCategoria, deleteCategoria } from "./categoria.controller.js";
import { validarJWT } from "../middlewares/validar-jwt.js";
import { validarCampos } from "../middlewares/validar-campos.js";

const router = Router();

router.post(
    "/",
    [
        validarJWT,
        validarCampos
    ],
    saveCategoria
);

router.get("/", getCategorias);

router.put(
    "/:id",
    [
        validarJWT,
        validarCampos
    ],
    updateCategoria
);

router.delete(
    "/:id",
    [
        validarJWT,
        validarCampos
    ],
    deleteCategoria
);

export default router;