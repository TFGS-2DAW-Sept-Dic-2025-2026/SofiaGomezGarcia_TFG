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
const seguimientoSerie_1 = __importDefault(require("../../../modelos/modelos_mongoose_orm/seguimientoSerie"));
exports.default = {
    agregarSeguimiento: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        var _a;
        try {
            const idUsuario = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
            const { idSerieTMDB, titulo, poster_path, totalTemporadas } = req.body;
            const existente = yield seguimientoSerie_1.default.findOne({ idUsuario, idSerieTMDB });
            if (existente)
                return res.status(400).json({ error: "Ya sigues esta serie" });
            const nuevo = new seguimientoSerie_1.default({
                idUsuario,
                idSerieTMDB,
                titulo,
                poster_path,
                totalTemporadas,
            });
            yield nuevo.save();
            res.status(201).json(nuevo);
        }
        catch (error) {
            console.error(error);
            res.status(500).json({ error: "Error al agregar seguimiento" });
        }
    }),
    obtenerSeguimientos: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        var _a;
        try {
            const idUsuario = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
            const seguimientos = yield seguimientoSerie_1.default.find({ idUsuario }).sort({ fechaActualizacion: -1 });
            res.json(seguimientos);
        }
        catch (error) {
            console.error(error);
            res.status(500).json({ error: "Error al obtener seguimientos" });
        }
    }),
    actualizarSeguimiento: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        var _a;
        try {
            const idUsuario = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
            const { idSerieTMDB } = req.params;
            const { capitulosVistos, ultimoCapitulo, estado } = req.body;
            const seguimiento = yield seguimientoSerie_1.default.findOneAndUpdate({ idUsuario, idSerieTMDB }, {
                $set: {
                    capitulosVistos,
                    ultimoCapitulo,
                    estado,
                    fechaActualizacion: new Date(),
                },
            }, { new: true });
            if (!seguimiento)
                return res.status(404).json({ error: "Seguimiento no encontrado" });
            res.json(seguimiento);
        }
        catch (error) {
            console.error(error);
            res.status(500).json({ error: "Error al actualizar seguimiento" });
        }
    }),
    eliminarSeguimiento: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        var _a;
        try {
            const idUsuario = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
            const { idSerieTMDB } = req.params;
            const eliminado = yield seguimientoSerie_1.default.findOneAndDelete({ idUsuario, idSerieTMDB });
            if (!eliminado)
                return res.status(404).json({ error: "Seguimiento no encontrado" });
            res.json({ mensaje: "Seguimiento eliminado correctamente" });
        }
        catch (error) {
            console.error(error);
            res.status(500).json({ error: "Error al eliminar seguimiento" });
        }
    })
};
