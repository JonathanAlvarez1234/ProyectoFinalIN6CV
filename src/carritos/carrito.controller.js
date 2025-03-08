import Carrito from "../carritos/carrito.model.js"
import Producto from "../productos/producto.model.js"

export const agregarAlCarrito = async (req, res) => {
    try {
        const usuarioId = req.usuario._id;
        const { productoId, cantidad } = req.body;

        const producto = await Producto.findById(productoId);
        if (!producto) {
            return res.status(404).json({
                success: false,
                message: "Producto no encontrado"
            });
        }
        if (producto.stock < cantidad) {
            return res.status(400).json({
                success: false,
                message: "Stock insuficiente"
            });
        }
        let carrito = await Carrito.findOne({ usuario: usuarioId });
        if (!carrito) {
            carrito = new Carrito({
                usuario: usuarioId,
                productos: [{ producto: productoId, cantidad }],
                total: producto.price * cantidad
            });
        } else {
            const itemIndex = carrito.productos.findIndex(
                (item) => item.producto.toString() === productoId
            );
            if (itemIndex !== -1) {
                carrito.productos[itemIndex].cantidad += cantidad;
            } else {
                carrito.productos.push({ producto: productoId, cantidad });
            }

            carrito.total = carrito.productos.reduce(
                async (acc, item) => {
                    const prod = await Producto.findById(item.producto);
                    return acc + prod.price * item.cantidad;
                },
                0
            );
        }
        await carrito.save();
        res.status(200).json({
            success: true,
            message: "Producto agregado al carrito",
            carrito
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error al agregar producto al carrito",
            error: error.message
        });
    }
};

export const getMyCarrito = async (req, res) => {
    try {
        const usuarioId = req.usuario._id;
        const carrito = await Carrito.findOne({ usuario: usuarioId }) 
            .populate("productos.producto", "name price description stock category");

        if (!carrito) {
            return res.status(404).json({
                success: false,
                msg: "El usuario no tiene un carrito"
            });
        }
        res.status(200).json({
            success: true,
            msg: "Este es tu carrito",
            carrito
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            msg: "Error al obtener el carrito",
            error: error.message
        });
    }
}

export const eliminarProdDeCarrito = async (req, res) => {
    try {
        const usuarioId = req.usuario._id;
        const { productoId } = req.params;
        const carrito = await Carrito.findOne({ usuario: usuarioId });
        if (!carrito) {
            return res.status(404).json({
                success: false,
                msg: "El usuario no tiene un carrito activo"
            });
        }
        const nuevoCarrito = carrito.productos.filter(prod => prod.producto.toString() !== productoId);
        if (nuevoCarrito.length === carrito.productos.length) {
            return res.status(404).json({
                success: false,
                msg: "El producto no se encontró en el carrito"
            });
        }
        carrito.productos = nuevoCarrito;
        await carrito.save();
        res.status(200).json({
            success: true,
            msg: "Producto eliminado del carrito correctamente",
            carrito
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            msg: "Error al eliminar el producto del carrito",
            error: error.message
        });
    }
};

export const vaciarCarrito = async (req, res) => {
    try {
        const usuarioId = req.usuario._id;
        const carrito = await Carrito.findOne({ usuario: usuarioId });
        if (!carrito) {
            return res.status(404).json({
                success: false,
                msg: "Carrito no encontrado"
            });
        }
        carrito.productos = [];
        await carrito.save();
        res.status(200).json({
            success: true,
            msg: "Carrito vaciado correctamente"
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            msg: "Hubo un error al vaciar el carrito",
            error: error.message
        });
    }
};