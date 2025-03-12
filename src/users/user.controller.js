import Usuario from "./user.model.js";
import { hash } from "argon2";
import mongoose from "mongoose";

export const getUsers = async (req, res) => {
    try {
        const { limite = 10, desde = 0 } = req.query;
        const query = { state: true };
        if (req.usuario.role !== "ADMIN_ROLE") {
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
        if (!mongoose.isValidObjectId(id)) {
            return res.status(400).json({
                success: false,
                msg: "ID de usuario invalido"
            });
        }
        if (req.usuario._id.toString() !== id && req.usuario.role !== "ADMIN_ROLE") {
            return res.status(403).json({
                success: false,
                msg: "No tiene permisos para ver los datos de otro usuario"
            });
        }
        const user = await Usuario.findById(id);
        if (!user) {
            return res.status(404).json({
                success: false,
                msg: "Usuario no encontrado"
            });
        }
        res.status(200).json({
            success: true,
            user
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            msg: "Error al obtener el usuario",
            error: error.message
        });
    }
};

export const updateUser = async (req, res) => {
    try {
        const { id } = req.params;
        const { _id, password, email, role, ...data } = req.body;
        if (req.usuario._id.toString() !== id && req.usuario.role !== "ADMIN_ROLE") {
            return res.status(403).json({
                success: false,
                msg: "Solo un administrador puede actualizar roles"
            });
        }
        if (email) {
            data.email = email;
        }
        const user = await Usuario.findByIdAndUpdate(id, data, { 
            new: true, 
            runValidators: true 
        });
        if (!user) {
            return res.status(404).json({
                success: false,
                msg: "Usuario no encontrado"
            });
        }
        res.status(200).json({
            success: true,
            msg: "Usuario actualizado",
            user
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            msg: "Error al actualizar usuario",
            error: error.message
        });
    }
};

export const deleteUser = async (req, res) => {
    try {
        const { id } = req.params;
        if (req.usuario._id.toString() !== id && req.usuario.role !== "ADMIN_ROLE") {
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

export const crateAdmin = async () => {
    try {
        const adminD = await Usuario.findOne({ role: "ADMIN_ROLE" });
        if(!adminD){
            const passwordEncrypted = await hash("Jonas360");
            const admin = new Usuario({
                name: "Admin",
                surname: "istrador",
                username: "4dmin",
                email: "admin@gmail.com",
                password: passwordEncrypted,
                phone: "51316646",
                role: "ADMIN_ROLE",
            });
            await admin.save();
            console.log("Administrador iniciado");
        } else {
            console.log("Administrador activo");
        }
    } catch (error) {
        console.error("Error creando administrador:", error);
    }
};