import { Schema, model, Document, Types } from "mongoose";

export interface ILista extends Document {
  nombre: string;
  descripcion?: string;
  usuarioCreador: Types.ObjectId;
  series: string[];
  fechaCreacion: Date;
  publica: boolean;
  likes: number;
  usuariosQueDieronLike: Types.ObjectId[];
}

const ListaSchema = new Schema<ILista>(
  {
    nombre: { type: String, required: true },
    descripcion: { type: String },
    usuarioCreador: { type: Schema.Types.ObjectId, ref: "usuario", required: true },
    series: [{ type: String }],
    publica: { type: Boolean, default: false },
    likes: { type: Number, default: 0 },
    usuariosQueDieronLike: [{ type: Schema.Types.ObjectId, ref: "usuario" }],
    fechaCreacion: { type: Date, default: Date.now }
  },
  {
    timestamps: true
  }
);

export const Lista = model<ILista>("lista", ListaSchema);