import mongoose, { Schema, Document } from "mongoose";

export interface ISeguimientoSerie extends Document {
  idUsuario: mongoose.Types.ObjectId;
  idSerieTMDB: number;
  titulo?: string;
  poster_path?: string;
  totalTemporadas?: number;
  capitulosVistos: number;
  ultimoCapitulo: {
    temporada: number;
    numero: number;
    nombre?: string;
  } | null;
  estado: "noComenzada" | "siguiendo" | "completada";
  fechaActualizacion: Date;
}

const SeguimientoSerieSchema = new Schema<ISeguimientoSerie>({
  idUsuario: { type: Schema.Types.ObjectId, ref: "Usuario", required: true },
  idSerieTMDB: { type: Number, required: true },
  titulo: { type: String },
  poster_path: { type: String },
  totalTemporadas: { type: Number },
  capitulosVistos: { type: Number, default: 0 },
  ultimoCapitulo: {
    temporada: { type: Number },
    numero: { type: Number },
    nombre: { type: String },
  },
  estado: {
    type: String,
    enum: ["noComenzada", "siguiendo", "completada"], 
    default: "noComenzada",
  },
  fechaActualizacion: { type: Date, default: Date.now },
});

// Para evitar duplicados (un usuario no puede tener la misma serie dos veces)
SeguimientoSerieSchema.index({ idUsuario: 1, idSerieTMDB: 1 }, { unique: true });

export default mongoose.model<ISeguimientoSerie>("SeguimientoSerie", SeguimientoSerieSchema);