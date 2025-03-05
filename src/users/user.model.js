import { Schema, model } from "mongoose";

const UserSchema = Schema(
    {
        name: {
            type: String,
            required: [true, "Name is required"],
            maxLength: 20
        },
        surname: {
            type: String,
            required: [true, "Surname is required"],
            maxLength: 20
        },
        username: {
            type: String,
            unique: true
        },
        email: {
            type: String,
            required: [true, "El correo en necesario"],
            unique: true
        },
        password: {
            type: String,
            required: [true, "La contraseña es necesaria"],
            minLength: 8
        },
        phone: {
            type: String,
            minLength: 8,
            maxLength: 8,
            required: true,
        },
        role: {
            type: String,
            required: true,
            enum: ["ADMIN_ROLE", "CLIENT_ROLE"],
            default: "CLIENT_ROLE"
        },
        state: {
            type: Boolean,
            default: true,
        },
    },
        {
            timestamps: true,
            versionKey: false
        }
);

UserSchema.methods.toJSON = function () {
    const { __v, password, _id, ...usuario } = this.toObject();
    usuario.uid = _id;
    return usuario;
    
}

export default model('User', UserSchema);