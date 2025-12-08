"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const usuario_1 = __importDefault(require("../../../modelos/modelos_mongoose_orm/usuario"));
exports.default = {
    obtenerUsuarios: (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            // Se obtienen todos los usuarios pero sin recoger los datos sensibles como las contraseñas
            const usuarios = yield usuario_1.default.find().select("-passwordHash -refreshToken -__v");
            res.status(200).json({ usuarios });
        }
        catch (error) {
            console.error("Error obteniendo usuarios:", error);
            res.status(500).json({ msg: "Error en el servidor", error });
        }
    }),
    obtenerUsuariosByID: (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const userId = req.params.id; // ✅ usar el ID de los parámetros
            const user = yield usuario_1.default.findById(userId).select("-passwordHash -refreshToken -__v");
            if (!user) {
                return res.status(404).json({ msg: "Usuario no encontrado" });
            }
            res.status(200).json(user);
        }
        catch (error) {
            console.error("Error obteniendo usuario por ID:", error);
            res.status(500).json({ msg: "Error en el servidor", error });
        }
    }),
    obtenerUsuariosPorUsername: (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const { username } = req.params;
            if (!username) {
                return res.status(400).json({ msg: "Username es obligatorio" });
            }
            const user = yield usuario_1.default.findOne({ username }).select("-passwordHash -refreshToken -__v");
            if (!user) {
                return res.status(404).json({ msg: "Usuario no encontrado" });
            }
            res.status(200).json(user);
        }
        catch (error) {
            console.error("Error obteniendo usuario por username:", error);
            res.status(500).json({ msg: "Error en el servidor", error });
        }
    })
};
