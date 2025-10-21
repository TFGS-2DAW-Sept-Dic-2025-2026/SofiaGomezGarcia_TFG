import mongoose, { Schema, model, Document, Types } from "mongoose";

export interface IOpinion extends Document {
  idUsuario: Types.ObjectId;
  idSerie: Types.ObjectId;
  estrellas: number;
  opinion?: string;                 
  fecha: Date;
  meGusta: number;
}

const OpinionSchema = new mongoose.Schema({
  idUsuario: { type: mongoose.Schema.Types.ObjectId, ref: 'usuario', required: true },
  idSerie: { type: String, required: true },
  estrellas: { type: Number, min: 1, max: 5, required: true },
  opinion: { type: String },
  fecha: { type: Date, default: Date.now },
  meGusta: { type: Number, default: 0 },
});

export const Opinion = model<IOpinion>("opinion", OpinionSchema);