"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const mongoose_2 = require("mongoose");
const UsuarioSchema = new mongoose_2.Schema({
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true }, //poner algun tipo de restriccion de gmail
    passwordHash: { type: String, required: true }, //poner algun tipo de restriccion 
    refreshToken: { type: String },
    fotoPerfil: { type: String },
    biografia: { type: String, maxlength: 300 },
    fechaRegistro: { type: Date, default: Date.now },
    //relaciones
    amigos: [{ type: mongoose_2.Schema.Types.ObjectId, ref: "usuario" }], //se guarda el id del amigo y con eso se cargan
    listas: [{ type: mongoose_2.Schema.Types.ObjectId, ref: "lista" }], //referencia a la tabla donde se guardan todas las listas
    favoritas: [{ type: String }], // array de IDs de series externas 
    perfilFavoritas: [{ type: String }]
}, {
    timestamps: true, // agrega createdAt y updatedAt
});
exports.default = mongoose_1.default.model("Usuario", UsuarioSchema, "usuarios");
//
/**
 * Un Usuario tiene los siguientes datos:
 * --Datos personales: - ID unico
 *                     - Nombre de usuario
 *                     - Gmail
 *                     - Contra Hash
 *                     - Foto de perfil
 *                     - Fecha de Registro
 *
 * --Otros datos relacionados con otras tablas:
 *                     - Listas
 *                     - Amigos
 *                     - Favoritas
 *                     -
 *                     -
 *                     -
 *                     -
 *
 */ 
