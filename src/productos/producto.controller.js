import Producto from "./producto.model.js"
import Categoria from "../categorias/categoria.model.js"

export const saveProducto = async (req, res) => {
    try {
        if (req.usuario.role !== "ADMIN_ROLE") {
            return res.status(403).json({
                success: false,
                msg: "Solo un administrador puede crear productos",
            });
        }
        const { name, price, description, category, stock } = req.body;
        const categoria = await Categoria.findById(category);
        if (!categoria) {
            return res.status(404).json({
                success: false,
                msg: "Categoría no encontrada",
            });
        }
        const productoExistente = await Producto.findOne({ name });
        if (productoExistente) {
            return res.status(400).json({
                success: false,
                msg: "El producto ya existe",
            });
        }
        const producto = new Producto({
            name,
            price,
            description,
            category: categoria._id,
            stock,
            state: true,
        });
        await producto.save();
        res.status(201).json({
            success: true,
            msg: "Producto creado exitosamente",
            producto,
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            msg: "Error al crear el producto",
            error: error.message,
        });
    }
};

export const getProductos = async (req, res) => {
    try {
        const productos = await Producto.find()
       .populate('category', 'name');
        res.status(200).json({
            success: true,
            msg: "Productos obtenidos correctamente",
            productos
        });
       } catch (error) {
        console.error(error);
        res.status(500).json({
            msg: "Hubo un error en la obtención de productos",
            error: error.message
        });
       }
}

export const updateProducto = async (req, res) => {
    try {
        if (req.usuario.role !== "ADMIN_ROLE") {
            return res.status(403).json({
                success: false,
                msg: "No tienes permisos para actualizar un producto",
            });
        }
        const { id } = req.params;
        const { name, description, price, category, stock } = req.body;
        const producto = await Producto.findById(id);
        if (!producto) {
            return res.status(404).json({
                success: false,
                msg: "Producto no encontrado",
            });
        }
        if (!producto.state) {
            return res.status(400).json({
                success: false,
                msg: "No se puede actualizar un producto eliminado",
            });
        }
        if (category) {
            const categoriaExiste = await Categoria.findById(category);
            if (!categoriaExiste) {
                return res.status(404).json({
                    success: false,
                    msg: "Categoría no encontrada",
                });
            }
        }
        const productoActualizado = await Producto.findByIdAndUpdate(
            id,
            { name, description, price, category, stock },
            { new: true }
        )

        res.status(200).json({
            success: true,
            msg: "Producto actualizado correctamente",
            producto: productoActualizado,
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            msg: "Error al actualizar el producto",
            error: error.message,
        });
    }
};

export const deleteProducto = async (req, res) => {
    try {
        if (req.usuario.role !== "ADMIN_ROLE") {
            return res.status(403).json({
                success: false,
                msg: "Usted no puede eliminar productos"
            });
        }
        const { id } = req.params;
        const producto = await Producto.findByIdAndUpdate(id, { state: false }, { new: true });
        if (!producto) {
            return res.status(404).json({
                success: false,
                msg: "Producto no encontrado"
            });
        }
        res.status(200).json({
            success: true,
            msg: "Producto eliminado correctamente",
            producto
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            msg: "Error al eliminar el producto",
            error: error.message
        });
    }
};

export const productosAgotados = async (req, res) => {
    try {
        if (req.usuario.role !== "ADMIN_ROLE") {
            return res.status(403).json({
                success: false,
                msg: "Usted no puede ver productos agotados"
            });
        }
        const productos = await Producto.find({ stock: 0, state: true });
        if (productos.length === 0) {
            return res.status(200).json({
                success: true,
                msg: "No hay productos agotados en este momento",
                productos: []
            });
        }
        res.status(200).json({
            success: true,
            total: productos.length,
            productos
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            msg: "Error al obtener los productos agotados",
            error: error.message
        });
    }
};

export const comprarProducto = async (req, res) => {
    try {
        const { id } = req.params;
        const { cantidad } = req.body;
        if (!cantidad || cantidad <= 0) {
            return res.status(400).json({
                success: false,
                msg: "La cantidad debe ser mayor a 0"
            });
        }
        const producto = await Producto.findById(id);
        if (!producto) {
            return res.status(404).json({
                success: false,
                msg: "Producto no encontrado"
            });
        }
        if (producto.stock < cantidad) {
            return res.status(400).json({
                success: false,
                msg: "Stock insuficiente"
            });
        }
        producto.stock -= cantidad;
        producto.numVenta += cantidad;
        await producto.save();
        res.status(200).json({
            success: true,
            msg: "Compra realizada exitosamente",
            producto
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            msg: "Error al realizar la compra",
            error: error.message
        });
    }
};

export const productosMasVendidos = async (req, res) => {
    try {
        const productos = await Producto.find()
            .sort({ numVenta: -1 })
            .limit(10);

        res.status(200).json({
            success: true,
            msg: "Productos mas vendidos",
            productos
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            msg: "Error al obtener los productos mas vendidos",
            error: error.message
        });
    }
};