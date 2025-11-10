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
const lista_1 = require("../../../modelos/modelos_mongoose_orm/lista");
const seguimientoSerie_1 = __importDefault(require("../../../modelos/modelos_mongoose_orm/seguimientoSerie"));
const opinion_1 = require("../../../modelos/modelos_mongoose_orm/opinion");
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
    }),
    obtenerListasPublicas: (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const user = yield usuario_1.default.findById(req.params.id).populate('listasPublicas');
            if (!user)
                return res.status(404).json({ msg: 'Usuario no encontrado' });
            res.json({ listasPublicas: user.listasPublicas });
        }
        catch (error) {
            res.status(500).json({ msg: 'Error al obtener listas públicas', error });
        }
    }),
    actualizarListasPublicas: (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const { listasPublicas } = req.body;
            const userId = req.params.id;
            const listas = yield lista_1.Lista.find({ usuarioCreador: userId });
            const actualizaciones = listas.map((lista) => __awaiter(void 0, void 0, void 0, function* () {
                lista.publica = listasPublicas.includes(lista.id.toString());
                return lista.save();
            }));
            yield Promise.all(actualizaciones);
            //implementar updateMany
            const user = yield usuario_1.default.findByIdAndUpdate(userId, { listasPublicas }, { new: true }).populate('listasPublicas');
            if (!user)
                return res.status(404).json({ msg: 'Usuario no encontrado' });
            res.json(user.listasPublicas);
        }
        catch (err) {
            console.error('Error al actualizar listas públicas:', err);
            res.status(500).json({ msg: 'Error al actualizar listas públicas', err });
        }
    }),
    obtenerListaPublicaPorId: (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        var _a;
        try {
            const { id } = req.params;
            const lista = yield lista_1.Lista.findById(id).populate('series');
            if (!lista) {
                return res.status(404).json({ msg: 'Lista no encontrada' });
            }
            // Si la lista NO es pública, requiere autenticación
            if (!lista.publica) {
                const usuarioId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
                if (!usuarioId || lista.usuarioCreador.toString() !== usuarioId) {
                    return res.status(401).json({ msg: 'No autorizado' });
                }
            }
            return res.json(lista);
        }
        catch (error) {
            console.error('Error obteniendo lista:', error);
            return res.status(500).json({ msg: 'Error interno del servidor' });
        }
    }),
    obtenerPerfilPublico: (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const { username } = req.params;
            const Usuario = yield usuario_1.default.findOne({ username })
                .select('username nombre perfilFavoritas actividad');
            if (!Usuario)
                return res.status(404).json({ msg: 'Usuario no encontrado' });
            res.json(Usuario);
        }
        catch (error) {
            console.error(error);
            res.status(500).json({ msg: 'Error interno del servidor' });
        }
    }),
    obtenerFavoritasPublicas: (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const { username } = req.params;
            const Usuario = yield usuario_1.default.findOne({ username }).select('perfilFavoritas');
            if (!Usuario)
                return res.status(404).json({ msg: 'Usuario no encontrado' });
            res.json({ favoritas: Usuario.perfilFavoritas });
        }
        catch (error) {
            console.error(error);
            res.status(500).json({ msg: 'Error interno' });
        }
    }),
    obtenerSeguimientosPublicos: (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const { username } = req.params;
            const Usuario = yield usuario_1.default.findOne({ username });
            if (!Usuario) {
                return res.status(404).json({ msg: "Usuario no encontrado" });
            }
            const seguimientos = yield seguimientoSerie_1.default.find({ idUsuario: Usuario._id });
            res.json(seguimientos);
        }
        catch (err) {
            console.error(err);
            res.status(500).json({ msg: "Error obteniendo seguimientos del perfil público" });
        }
    }), obtenerOpinionesPublicas: (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const { username } = req.params;
            const Usuario = yield usuario_1.default.findOne({ username });
            if (!Usuario) {
                return res.status(404).json({ msg: 'Usuario no encontrado' });
            }
            const opinionesUsuario = yield opinion_1.Opinion.find({ idUsuario: Usuario._id });
            if (!opinionesUsuario.length) {
                return res.json({ opiniones: [] });
            }
            const opinionesPublicas = opinionesUsuario.map(op => ({
                id: op._id,
                idSerie: op.idSerie,
                estrellas: op.estrellas,
                opinion: op.opinion,
                fecha: op.fecha,
            }));
            res.json({ opiniones: opinionesPublicas });
        }
        catch (err) {
            console.error('Error obteniendo opiniones públicas:', err);
            res.status(500).json({ msg: 'Error interno del servidor' });
        }
    })
};
