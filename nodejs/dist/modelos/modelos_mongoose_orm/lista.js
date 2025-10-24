"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Lista = void 0;
const mongoose_1 = require("mongoose");
const ListaSchema = new mongoose_1.Schema({
    nombre: { type: String, required: true },
    descripcion: { type: String },
    // Relación con el usuario
    usuarioCreador: { type: mongoose_1.Schema.Types.ObjectId, ref: "usuario", required: true },
    // IDs de series externas
    series: [{ type: String }],
    publica: { type: Boolean, default: false },
    fechaCreacion: { type: Date, default: Date.now }
}, {
    timestamps: true
});
exports.Lista = (0, mongoose_1.model)("lista", ListaSchema);
