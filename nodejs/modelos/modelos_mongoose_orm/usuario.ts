import mongoose from "mongoose";
import { Schema, model, Document, Types } from "mongoose";

export interface IUser extends Document {
  username: string;
  email: string;
  passwordHash: string;
  fotoPerfil?: string;
  biografia?: string;
  fechaRegistro: Date;
  refreshToken?: string;

  // relaciones
  seguidores: Types.ObjectId[]; // referencia a otros usuarios
  seguidos: Types.ObjectId[]; // referencia a otros usuarios
  listas: Types.ObjectId[]; // referencia a coleccion Listas
  favoritas: string[];
  perfilFavoritas: string[];
  listasPublicas: Types.ObjectId[]; 
}

const UsuarioSchema = new Schema<IUser>(
  {
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true }, //poner algun tipo de restriccion de gmail
    passwordHash: { type: String, required: true }, //poner algun tipo de restriccion 
    refreshToken: { type:String },
    fotoPerfil: { type: String },
    biografia: { type: String, maxlength: 300 },
    fechaRegistro: { type: Date, default: Date.now },

    //relaciones

    seguidores: [{ type: Schema.Types.ObjectId, ref: "usuario" }], 
    seguidos: [{ type: Schema.Types.ObjectId, ref: "usuario" }],
    listas: [{ type: Schema.Types.ObjectId, ref: "lista" }],
    favoritas: [{ type: String }], 
    perfilFavoritas: [{ type: String }], 
    listasPublicas: [{ type: Schema.Types.ObjectId, ref: 'lista' }]
  },
  {
    timestamps: true, 
  }
);



export default model<IUser>("usuario", UsuarioSchema, "usuarios");

