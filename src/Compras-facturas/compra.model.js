import { Schema, model } from "mongoose";

const compraSchema = Schema(
    {
        usuario: {
            type: Schema.Types.ObjectId,
            ref: 'Usuario',
            required: true
        },
        productos: [
            {
                producto: {
                    type: Schema.Types.ObjectId,
                    ref: 'Producto',
                    required: true
                },
                cantidad: {
                    type: Number,
                    required: true,
                    min: 1
                },
                price: {
                    type: Number,
                    required: true
                }
            }
        ],
        total: {
            type: Number,
            required: true
        },
        fecha: {
            type: Date,
            default: Date.now
        }

    });

    compraSchema.methods.toJSON = function() {
        const { __v, ...compra } = this.toObject();
        return compra;
    };
    
    export default model("Compra", compraSchema);