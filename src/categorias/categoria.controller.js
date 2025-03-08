import Categoria from "../categorias/categoria.model.js";
import Producto from "../productos/producto.model.js"

export const saveCategoria = async (req, res) => {
    try {
        const { name, descripcion } = req.body;
        if (req.usuario.role !== "ADMIN_ROLE") {
            return res.status(403).json({
                success: false,
                msg: "Solo un administrador puede crear una nueva categoria"
            });
        }
        const categoriaExistente = await Categoria.findOne({ name });
        if (categoriaExistente) {
            return res.status(400).json({
                success: false,
                msg: "La categoría ya existe"
            });
        }
        if (!name || !descripcion) {
            return res.status(400).json({
                success: false,
                msg: "El nombre y la descripción son obligatorios"
            });
        }
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
        if (req.usuario.role !== "ADMIN_ROLE") {
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

export const deleteCategoria = async (req, res) => {
    try {
        const { id } = req.params;
        if (!req.usuario || req.usuario.role !== "ADMIN_ROLE") {
            return res.status(403).json({
                success: false,
                message: "Solo un administrador puede eliminar una categoría"
            });
        }
        const categoria = await Categoria.findById(id);
        if (!categoria) {
            return res.status(404).json({
                success: false,
                message: "Categoría no encontrada"
            });
        }
        const defaultCategory = await Categoria.findOne({ name: "General" });
        if (!defaultCategory) {
            return res.status(500).json({
                success: false,
                message: "No se encontro la categoria por defecto"
            });
        }
        await Producto.updateMany({ category: id }, { category: defaultCategory._id });
        await Categoria.findByIdAndUpdate(id, { state: false }, { new: true });
        res.status(200).json({
            success: true,
            message: "Categoria eliminada, productos cambiados de categoria"
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error al eliminar la categoria",
            error: error.message 
        });
    }
};

export const createCategory = async () => {
    try {
        const defaultCategory = await Categoria.findOne({ name: "General" });
        if (!defaultCategory) {
            await Categoria.create({ name: "General" });
            console.log("Categoria 'General' creada por defecto");
        } else {
            console.log("Categoria por defecto ya existente");
        }
    } catch (error) {
        console.error("Error al crear la categoria", error);
    }
};