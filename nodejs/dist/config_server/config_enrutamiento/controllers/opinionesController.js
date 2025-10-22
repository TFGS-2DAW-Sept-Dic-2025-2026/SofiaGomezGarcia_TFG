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
Object.defineProperty(exports, "__esModule", { value: true });
const opinion_1 = require("../../../modelos/modelos_mongoose_orm/opinion");
exports.default = {
    obtenerOpinionesSerie: (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const { idSerie } = req.params;
            if (!idSerie)
                return res.status(400).json({ msg: "ID de la serie es obligatorio" });
            const opiniones = yield opinion_1.Opinion.find({ idSerie: idSerie })
                .populate("idUsuario", "username") // Para obtener los datos concretos de los usuarios, en este caso para obtener el nombre de usuario
                .sort({ fecha: -1 });
            res.status(200).json(opiniones);
        }
        catch (error) {
            console.log("Error al obtener opiniones de la serie:", error);
            res.status(500).json({ msg: "Error al obtener opiniones de la serie" });
        }
    }),
    crearOpinion: (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        var _a;
        try {
            const { idSerie } = req.params;
            const { estrellas, opinion } = req.body;
            const idUsuario = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
            if (!idUsuario)
                return res.status(401).json({ msg: "Usuario no autenticado" });
            if (!idSerie)
                return res.status(400).json({ msg: "ID de la serie es obligatorio" });
            if (!estrellas || estrellas < 1 || estrellas > 5)
                return res.status(400).json({ msg: "Las estrellas deben ser un número entre 1 y 5" });
            const nuevaOpinion = new opinion_1.Opinion({
                idUsuario: idUsuario,
                idSerie,
                estrellas,
                opinion,
                fecha: new Date(),
                meGusta: 0
            });
            yield nuevaOpinion.save();
            res.status(201).json(nuevaOpinion);
        }
        catch (error) {
            console.log("Error al crear la opinión:", error);
            res.status(500).json({ msg: "Error al crear la opinión" });
        }
    }),
    meGustaOpinion: (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        var _a;
        try {
            const { idOpinion } = req.params;
            const idUsuario = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
            if (!idUsuario)
                return res.status(401).json({ msg: "Usuario no autenticado" });
            if (!idOpinion)
                return res.status(400).json({ msg: "ID de la opinión es obligatorio" });
            const opinion = yield opinion_1.Opinion.findById(idOpinion);
            if (!opinion)
                return res.status(404).json({ msg: "Opinión no encontrada" });
            const index = opinion.usuariosMeGusta.findIndex(u => u.toString() === idUsuario);
            if (index === -1) {
                opinion.meGusta += 1;
                opinion.usuariosMeGusta.push(idUsuario);
            }
            else {
                opinion.meGusta -= 1;
                opinion.usuariosMeGusta.splice(index, 1);
            }
            yield opinion.save();
            res.status(200).json(opinion);
        }
        catch (error) {
            console.log("Error al dar me gusta a la opinión:", error);
            res.status(500).json({ msg: "Error al dar me gusta a la opinión" });
        }
    }),
    obtenerOpinionesUsuario: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const { idUsuario } = req.params;
            // const idUsuario = (req as any).user?.id;
            if (!idUsuario) {
                return res.status(400).json({ msg: "ID de usuario es obligatorio" });
            }
            const opiniones = yield opinion_1.Opinion.find({ idUsuario })
                .populate("idUsuario", "username")
                .sort({ fecha: -1 });
            res.status(200).json(opiniones);
        }
        catch (error) {
            console.error("Error al obtener opiniones del usuario:", error);
            res.status(500).json({ msg: "Error al obtener opiniones del usuario" });
        }
    })
};
