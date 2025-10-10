import { Schema, model, Document, Types } from "mongoose";

export interface ILista extends Document {
  nombre: string;
  descripcion?: string;
  usuarioCreador: Types.ObjectId;   
  series: string[];                 
  fechaCreacion: Date;
}

const ListaSchema = new Schema<ILista>(
  {
    nombre: { type: String, required: true },
    descripcion: { type: String },
    // Relación con el usuario
    usuarioCreador: { type: Schema.Types.ObjectId, ref: "usuario", required: true },
    
    // IDs de series externas
    series: [{ type: String }],

    fechaCreacion: { type: Date, default: Date.now }
  },
  {
    timestamps: true 
  }
);

export const Lista = model<ILista>("lista", ListaSchema);