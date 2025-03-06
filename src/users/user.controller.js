import { hash } from "argon2";
import Usuario from "./user.model.js";

export const getUsers = async (req, res) => {
    try {
        const { limite = 10, desde = 0 } = req.query;
        const query = { state: true };
        if (req.user.role !== "ADMIN_ROLE") {
            return res.status(403).json({
                success: false,
                msg: "Usted puede ver unicamente sus datos"
            });
        }
        const [total, users] = await Promise.all([
            Usuario.countDocuments(query),
            Usuario.find(query)
                .skip(Number(desde))
                .limit(Number(limite))
        ]);
        res.status(200).json({
            success: true,
            total,
            users
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            msg: "Error al obtener usuarios",
            error
        });
    }
};

export const getUserById = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await Usuario.findById(id);
        if (!user) {
            return res.status(404).json({
                success: false,
                msg: 'Usuario no encontrado'
            });
        }
        res.status(200).json({
            success: true,
            user
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            msg: 'Error al obtener usuario',
            error
        });
    }
};

export const updateUser = async (req, res) => {
    try {
        const { id } = req.params;
        const { _id, password, email, role, ...data } = req.body;
        if (role && req.user.role !== "ADMIN_ROLE") {
            return res.status(403).json({
                success: false,
                msg: "Solo un administrador puede actualizar roles"
            });
        }
        if (password) {
            data.password = await hash(password);
        }
        const user = await Usuario.findByIdAndUpdate(id, data, { new: true });
        res.status(200).json({
            success: true,
            msg: 'Usuario actualizado',
            user
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            msg: 'Error al actualizar usuario',
            error
        });
    }
};

export const deleteUser = async (req, res) => {
    try {
        const { id } = req.params;
        if (req.user._id.toString() !== id && req.user.role !== "ADMIN_ROLE") {
            return res.status(403).json({
                success: false,
                msg: "No puede eliminar a otro usuario"
            });
        }
        const user = await Usuario.findByIdAndUpdate(id, { state: false }, { new: true });
        res.status(200).json({
            success: true,
            msg: 'Usuario eliminado',
            user
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            msg: 'Error al eliminar usuario',
            error
        });
    }
};