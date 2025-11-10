"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const UsuarioSchema = new mongoose_1.Schema({
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true }, //poner algun tipo de restriccion de gmail
    passwordHash: { type: String, required: true }, //poner algun tipo de restriccion 
    refreshToken: { type: String },
    fotoPerfil: { type: String },
    biografia: { type: String, maxlength: 300 },
    fechaRegistro: { type: Date, default: Date.now },
    //relaciones
    seguidores: [{ type: mongoose_1.Schema.Types.ObjectId, ref: "usuario" }], //se guarda el id del amigo y con eso se cargan
    seguidos: [{ type: mongoose_1.Schema.Types.ObjectId, ref: "usuario" }],
    listas: [{ type: mongoose_1.Schema.Types.ObjectId, ref: "lista" }], //referencia a la tabla donde se guardan todas las listas
    favoritas: [{ type: String }], // array de IDs de series externas 
    perfilFavoritas: [{ type: String }],
    listasPublicas: [{ type: mongoose_1.Schema.Types.ObjectId, ref: 'lista' }]
}, {
    timestamps: true, // agrega createdAt y updatedAt
});
exports.default = (0, mongoose_1.model)("usuario", UsuarioSchema, "usuarios");
// export default mongoose.model("usuario", UsuarioSchema, "usuarios");
