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
const opinion_1 = require("../../../modelos/modelos_mongoose_orm/opinion");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const BASE_URL = "https://api.themoviedb.org/3";
const API_KEY = process.env.TMDB_API_KEY;
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
    }),
    obtenerOpinionesRecientes: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const opiniones = yield opinion_1.Opinion.find()
                .populate("idUsuario", "username fotoPerfil")
                .sort({ fecha: -1 })
                .limit(3);
            const opinionesConNombre = [];
            for (const op of opiniones) {
                const resp = yield fetch(`https://api.themoviedb.org/3/tv/${op.idSerie}?api_key=${API_KEY}&language=es-ES`);
                const data = yield resp.json();
                opinionesConNombre.push(Object.assign(Object.assign({}, op.toObject()), { nombreSerie: data.name || data.original_name || "[Sin nombre]" }));
            }
            res.status(200).json(opinionesConNombre);
        }
        catch (error) {
            console.error("Error al obtener opiniones recientes:", error);
            res.status(500).json({ msg: "Error al obtener opiniones recientes" });
        }
    }),
    obtenerUsuariosMasOpiniones: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const topUsuarios = yield opinion_1.Opinion.aggregate([
                {
                    $group: {
                        _id: "$idUsuario",
                        totalOpiniones: { $sum: 1 }
                    }
                },
                { $sort: { totalOpiniones: -1 } },
                { $limit: 3 },
                {
                    $lookup: {
                        from: "usuarios",
                        localField: "_id",
                        foreignField: "_id",
                        as: "usuario"
                    }
                },
                {
                    $addFields: {
                        usuario: { $arrayElemAt: ["$usuario", 0] }
                    }
                },
                {
                    $project: {
                        idUsuario: "$usuario._id",
                        username: "$usuario.username",
                        fotoPerfil: "$usuario.fotoPerfil",
                        totalOpiniones: 1
                    }
                }
            ]);
            res.status(200).json(topUsuarios);
        }
        catch (error) {
            console.error("Error al obtener usuarios con más opiniones:", error);
            res.status(500).json({ msg: "Error al obtener usuarios con más opiniones" });
        }
    })
};
