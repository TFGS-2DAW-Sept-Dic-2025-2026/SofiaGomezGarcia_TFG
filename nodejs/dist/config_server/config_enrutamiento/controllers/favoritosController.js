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
    agregarFavorito: (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        var _a;
        try {
            const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
            const { serieId } = req.params;
            const user = yield usuario_1.default.findById(userId);
            if (!user)
                return res.status(404).json({ msg: 'Usuario no encontrado' });
            const index = user.favoritas.indexOf(serieId);
            if (index === -1) {
                // Si no está, la agrega
                user.favoritas.push(serieId);
            }
            else {
                //en vez de hacer un enpoint para borrar la serie con esto directamente se borra
                user.favoritas.splice(index, 1);
            }
            yield user.save();
            res.json({ favoritas: user.favoritas });
        }
        catch (error) {
            console.error(error);
            res.status(500).json({ msg: 'Error al actualizar favoritos' });
        }
    }),
    obtenerFavoritos: (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        var _a;
        try {
            const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
            const user = yield usuario_1.default.findById(userId).select('favoritas');
            if (!user) {
                return res.status(404).json({ msg: 'Usuario no encontrado' });
            }
            console.log('Favoritas del usuario:', user.favoritas);
            // devolvemos el array de favoritas
            res.json({ favoritas: user.favoritas });
        }
        catch (error) {
            console.error(error);
            res.status(500).json({ msg: 'Error al obtener favoritas' });
        }
    })
};
