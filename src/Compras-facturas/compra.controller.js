import Compra from "../Compras-facturas/compra.model.js"
import Carrito from "../carritos/carrito.model.js"
import Producto from "../productos/producto.model.js"

export const compraCarrito = async (req, res) => {
    try {
        const usuarioId = req.usuario._id;
        const carrito = await Carrito.findOne({ usuario: usuarioId }).populate("productos.producto");
        if (!carrito || carrito.productos.length === 0) {
            return res.status(400).json({
                success: false,
                message: "El carrito esta vacio, no se puede realizar la compra"
            });
        }
        let total = 0;
        const productosCompra = [];

        for (const item of carrito.productos) {
            total += item.producto.price * item.cantidad;
            productosCompra.push({
                producto: item.producto._id,
                cantidad: item.cantidad,
                price: item.producto.price
            });
            await Producto.findByIdAndUpdate(item.producto._id, {
                $inc: { numVenta: item.cantidad }
            });
        }
        const nuevaCompra = new Compra({
            usuario: usuarioId,
            productos: productosCompra,
            total
        });
        await nuevaCompra.save();

        await Carrito.findOneAndUpdate({ usuario: usuarioId }, { productos: [] });
        res.status(200).json({
            success: true,
            message: "Compra realizada",
            factura: {
                idCompra: nuevaCompra._id,
                usuario: req.usuario.nombre,
                productos: productosCompra.map(p => ({
                    nombre: p.producto.name,
                    cantidad: p.cantidad,
                    precioUnitario: p.price,
                    subtotal: p.cantidad * p.price
                })),
                total,
                fecha: nuevaCompra.fecha
            }
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error al procesar la compra",
            error: error.message
        });
    }
};

export const misFacturas = async (req, res) => {
    try {
        const usuarioAutenticado = req.usuario;
        let usuarioId = usuarioAutenticado._id;
        if (usuarioAutenticado.role === "ADMIN_ROLE" && req.params.usuarioId) {
            usuarioId = req.params.usuarioId;
        }
        const compras = await Compra.find({ usuario: usuarioId })
            .populate("productos.producto", "name price")
            .populate("usuario", "nombre email");

        if (!compras || compras.length === 0) {
            return res.status(404).json({
                success: false,
                message: "No se encontraron facturas para este usuario"
            });
        }
        const facturas = compras.map(compra => ({
            idCompra: compra._id,
            usuario: compra.usuario.nombre,
            email: compra.usuario.email,
            productos: compra.productos.map(p => ({
                nombre: p.producto.name,
                cantidad: p.cantidad,
                precioUnitario: p.producto.price,
                subtotal: p.cantidad * p.producto.price
            })),
            total: compra.total,
            fecha: compra.fecha
        }));

        res.status(200).json({
            success: true,
            message: "Facturas obtenidas correctamente",
            facturas
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error al obtener las facturas",
            error: error.message
        });
    }
};

export const miFacturaById = async (req, res) => {
    try {
        const usuarioAutenticado = req.usuario;
        const { facturaId } = req.params;
        const factura = await Compra.findById(facturaId)
            .populate("productos.producto", "name price")
            .populate("usuario", "nombre email");
        if (!factura) {
            return res.status(404).json({
                success: false,
                message: "Factura no encontrada"
            });
        }
        if (usuarioAutenticado.role !== "ADMIN_ROLE" && factura.usuario._id.toString() !== usuarioAutenticado._id.toString()) {
            return res.status(403).json({
                success: false,
                message: "No tienes permisos para ver esta factura"
            });
        }
        const facturaResponse = {
            idCompra: factura._id,
            usuario: factura.usuario.nombre,
            email: factura.usuario.email,
            productos: factura.productos.map(p => ({
                nombre: p.producto.name,
                cantidad: p.cantidad,
                precioUnitario: p.producto.price,
                subtotal: p.cantidad * p.producto.price
            })),
            total: factura.total,
            fecha: factura.fecha
        };

        res.status(200).json({
            success: true,
            message: "Factura obtenida correctamente",
            factura: facturaResponse
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error al obtener la factura",
            error: error.message
        });
    }
};

export const historialMisFacturas = async (req, res) => {
    try {
        const usuarioAutenticado = req.usuario;
        if (usuarioAutenticado.role !== "CLIENT_ROLE") {
            return res.status(403).json({
                success: false,
                message: "No tienes permisos para acceder al historial de facturas"
            });
        }
        const compras = await Compra.find({ usuario: usuarioAutenticado._id })
            .populate("productos.producto", "name price")
            .populate("usuario", "nombre email");
        if (!compras || compras.length === 0) {
            return res.status(404).json({
                success: false,
                message: "No tienes facturas disponibles"
            });
        }
        const facturas = compras.map(compra => ({
            idCompra: compra._id,
            productos: compra.productos.map(p => ({
                nombre: p.producto.name,
                cantidad: p.cantidad,
                precioUnitario: p.producto.price,
                subtotal: p.cantidad * p.producto.price
            })),
            total: compra.total,
            fecha: compra.fecha
        }));

        res.status(200).json({
            success: true,
            message: "Historial de facturas obtenido correctamente",
            facturas
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error al obtener el historial de facturas",
            error: error.message
        });
    }
};



