import Categoria from "../categorias/categoria.model.js";
import Producto from "../productos/producto.model.js"
import mongoose from "mongoose";

export const saveCategoria = async (req, res) => {
    try {
        if (req.user.role !== "ADMIN_ROLE") {
            return res.status(403).json({
                success: false,
                msg: "Solo un administrador puede crear una nueva categoria"
            });
        }
        const { name, descripcion } = req.body;
        const categoria = new Categoria({ name, descripcion });
        await categoria.save();

        res.status(201).json({
            success: true,
            msg: "Categoría creada exitosamente",
            categoria
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            msg: "Error al crear la categoria",
            error: error.message
        });
    }
};

export const getCategorias = async (req, res) => {
    try {
        const categorias = await Categoria.find({ state: true });
        res.status(200).json({
            success: true,
            total: categorias.length,
            categorias
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            msg: "Error al obtener las categorias",
            error: error.message
        });
    }
};

export const updateCategoria = async (req, res) => {
    try {
        if (req.user.role !== "ADMIN_ROLE") {
            return res.status(403).json({
                success: false,
                msg: "No tienes permisos para actualizar una categoria"
            });
        }
        const { id } = req.params;
        const { name, descripcion } = req.body;
        const categoria = await Categoria.findByIdAndUpdate(
            id,
            { name, descripcion },
            { new: true }
        );
        if (!categoria) {
            return res.status(404).json({
                success: false,
                msg: "Categoria no encontrada"
            });
        }
        res.status(200).json({
            success: true,
            msg: "Categoria actualizada correctamente",
            categoria
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            msg: "Error al actualizar la categoria",
            error: error.message
        });
    }
};

const CATEGORIA_GENERAL = "General";

export const deleteCategoria = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        if (req.user.role !== "ADMIN_ROLE") {
            await session.abortTransaction();
            session.endSession();
            return res.status(403).json({
                success: false,
                msg: "Solo un administrador puede eliminar una categoria"
            });
        }
        const { id } = req.params;
        const categoria = await Categoria.findByIdAndUpdate(id, { state: false }, { new: true }).setOptions({ session });
        if (!categoria) {
            await session.abortTransaction();
            session.endSession();
            return res.status(404).json({
                success: false,
                msg: "Categoria no encontrada"
            });
        }
        let categoriaGeneral = await Categoria.findOne({ name: CATEGORIA_GENERAL }).setOptions({ session });
        if (!categoriaGeneral) {
            categoriaGeneral = new Categoria({
                name: CATEGORIA_GENERAL,
                descripcion: "Categoria predeterminada"
            });
            await categoriaGeneral.save({ session });
        }
        await Producto.updateMany(
            { category: id },
            { category: categoriaGeneral._id }
        ).setOptions({ session });
        await session.commitTransaction();
        session.endSession();
        res.status(200).json({
            success: true,
            msg: "Categoria eliminada y productos reasignados a 'General'",
            categoria
        });
    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        res.status(500).json({
            success: false,
            msg: "Error al eliminar la categoria",
            error: error.message
        });
    }
};

export const createCategory = async () => {
    try {
        while (mongoose.connection.readyState !== 1) {
            console.warn("Conexión a Mongoose");
            await new Promise((resolve) => setTimeout(resolve, 1000));
        }
        const categoria = await Categoria.findOneAndUpdate(
            { name: CATEGORIA_GENERAL },
            { name: CATEGORIA_GENERAL, descripcion: "Categoria por defecto" },
            { upsert: true, new: true }
        );
        console.log(`Categoria '${CATEGORIA_GENERAL}' creada`);
    } catch (error) {
        console.error("Error al crear la categoria 'General':", error);
    }
};