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
const mongoose_1 = __importDefault(require("mongoose"));
const usuario_1 = __importDefault(require("../../../modelos/modelos_mongoose_orm/usuario"));
exports.default = {
    obtenerFavoritas: (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const { userId } = req.params;
            if (!mongoose_1.default.Types.ObjectId.isValid(userId)) {
                return res.status(400).json({ message: "ID de usuario no válido" });
            }
            const user = yield usuario_1.default.findById(userId).select("perfilFavoritas");
            if (!user) {
                return res.status(404).json({ message: "Usuario no encontrado" });
            }
            res.status(200).json({ favoritas: user.perfilFavoritas });
        }
        catch (error) {
            console.log("Error al obtener favoritos perfil: ", error);
            res.status(500).json({ msg: 'Error al obtener favoritos perfil' });
        }
    }),
    actualizarFavoritas: (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const { userId } = req.params;
            const { favoritas } = req.body;
            if (!mongoose_1.default.Types.ObjectId.isValid(userId)) {
                return res.status(400).json({ message: "ID de usuario no válido" });
            }
            if (!Array.isArray(favoritas)) {
                return res.status(400).json({ message: "El campo 'favoritas' debe ser un array" });
            }
            const user = yield usuario_1.default.findByIdAndUpdate(userId, { perfilFavoritas: favoritas }, { new: true }).select("perfilFavoritas");
            if (!user) {
                return res.status(404).json({ message: "Usuario no encontrado" });
            }
            res.status(200).json({ favoritas: user.perfilFavoritas });
        }
        catch (error) {
            console.log("Error al actualizar favoritos perfil: ", error);
            res.status(500).json({ msg: 'Error al actualizar favoritos perfil' });
        }
    })
};
