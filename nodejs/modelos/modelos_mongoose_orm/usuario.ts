import mongoose from "mongoose";
import { Schema, model, Document, Types } from "mongoose";

//Con mongoose ya viene de por si el ID asi que no hace falta declararlo aqui

export interface IUser extends Document {
  username: string;
  email: string;
  passwordHash: string;
  fotoPerfil?: string;
  biografia?: string;
  fechaRegistro: Date;
  refreshToken?: string;

  // relaciones
  amigos: Types.ObjectId[]; // referencia a otros usuarios
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

    amigos: [{ type: Schema.Types.ObjectId, ref: "usuario" }], //se guarda el id del amigo y con eso se cargan
    listas: [{ type: Schema.Types.ObjectId, ref: "lista" }],//referencia a la tabla donde se guardan todas las listas
    favoritas: [{ type: String }], // array de IDs de series externas 
    perfilFavoritas: [{ type: String }], 
    listasPublicas: [{ type: Schema.Types.ObjectId, ref: 'lista' }]
  },
  {
    timestamps: true, // agrega createdAt y updatedAt
  }
);



export default mongoose.model("usuario", UsuarioSchema, "usuarios");

