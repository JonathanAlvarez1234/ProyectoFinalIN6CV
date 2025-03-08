import { Schema, model } from "mongoose";

const productSchema = Schema(
    {
        name: {
            type: String,
            required: true
        },
        price: {
            type: Number,
            required: true,
            min: [0, "El precio tiene que ser arriba de 0"]
        },
        description: {
            type: String,
            required: true
        },
        category: {
            type: Schema.Types.ObjectId,
            ref: 'Categoria',
            required: true
        },
        stock: {
            type: Number,
            required: true,
            min: [0, "EL stock tiene que ser arriba de 0"]
        },
        numVenta: {
            type: Number,
            default: 0
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

productSchema.methods.toJSON = function () {
    const { __v, _id, ...producto } = this.toObject();
    producto.uid = _id;
    return producto;
}

export default model('Producto', productSchema);