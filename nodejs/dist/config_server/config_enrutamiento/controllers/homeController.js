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
const dotenv_1 = __importDefault(require("dotenv"));
const opinion_1 = require("../../../modelos/modelos_mongoose_orm/opinion");
const seguimientoSerie_1 = __importDefault(require("../../../modelos/modelos_mongoose_orm/seguimientoSerie"));
const lista_1 = require("../../../modelos/modelos_mongoose_orm/lista");
dotenv_1.default.config();
const BASE_URL = "https://api.themoviedb.org/3";
const API_KEY = process.env.TMDB_API_KEY;
exports.default = {
    obtenerPopulares: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const opiniones = yield opinion_1.Opinion.aggregate([
                {
                    $group: {
                        _id: "$idSerie",
                        puntos: { $sum: { $add: [4, "$meGusta"] } }
                    }
                }
            ]).exec();
            const favoritos = yield usuario_1.default.aggregate([
                { $unwind: "$favoritas" },
                {
                    $group: {
                        _id: "$favoritas.idSerie",
                        puntos: { $sum: 5 }
                    }
                }
            ]).exec();
            const seguimiento = yield seguimientoSerie_1.default.aggregate([
                {
                    $group: {
                        _id: "$idSerieTMDB",
                        puntos: {
                            $sum: {
                                $switch: {
                                    branches: [
                                        { case: { $eq: ["$estado", "completada"] }, then: 6 },
                                        { case: { $eq: ["$estado", "siguiendo"] }, then: 4 }
                                    ],
                                    default: 0
                                }
                            }
                        }
                    }
                }
            ]).exec();
            const listas = yield lista_1.Lista.aggregate([
                { $unwind: "$series" },
                {
                    $group: {
                        _id: "$series",
                        puntos: { $sum: 3 }
                    }
                }
            ]).exec();
            const mapa = new Map();
            const añadir = (arr = []) => {
                arr.forEach((a) => {
                    var _a;
                    const id = String((_a = a._id) !== null && _a !== void 0 ? _a : "");
                    const puntos = typeof a.puntos === "number" ? a.puntos : Number(a.puntos) || 0;
                    mapa.set(id, (mapa.get(id) || 0) + puntos);
                });
            };
            añadir(opiniones);
            añadir(favoritos);
            añadir(seguimiento);
            añadir(listas);
            const popularesOrdenadas = [...mapa.entries()]
                .sort((a, b) => b[1] - a[1])
                .slice(0, 20)
                .map(([id, puntos]) => ({ id, puntos }));
            // Obtener datos de TMDB en paralelo (limitado a top 20)
            const tmdbPromises = popularesOrdenadas.map(item => fetch(`${BASE_URL}/tv/${item.id}?api_key=${API_KEY}&language=es-ES`)
                .then(resp => (resp.ok ? resp.json() : null))
                .catch(() => null));
            const tmdbResults = (yield Promise.all(tmdbPromises)).filter(Boolean);
            return res.json(tmdbResults);
        }
        catch (error) {
            console.error("Error obteniendo populares:", error);
            return res.status(500).json({ error: "Error obteniendo series populares" });
        }
    }), descubrirSeries: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        var _a;
        try {
            const idUsuario = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
            if (!idUsuario) {
                return res.status(400).json({ error: "ID de usuario es obligatorio" });
            }
            const usuario = yield usuario_1.default.findById(idUsuario)
                .populate("listas") // ahora listas tienen un campo "series"
                .lean();
            if (!usuario)
                return res.status(404).json({ error: "Usuario no encontrado" });
            // 1️⃣ IDs de series ya vistas / en seguimiento / listas / favoritas
            const idsExcluidos = new Set();
            // ⭐ Favoritas (simple array de strings)
            if (Array.isArray(usuario.favoritas)) {
                usuario.favoritas.forEach(id => {
                    idsExcluidos.add(String(id));
                });
            }
            // ⭐ Seguiendo / Completadas
            const seguimientos = yield seguimientoSerie_1.default.find({ idUsuario }, "idSerieTMDB").lean();
            seguimientos.forEach(s => idsExcluidos.add(String(s.idSerieTMDB)));
            // ⭐ Listas del usuario (ya vienen pobladas)
            if (Array.isArray(usuario.listas)) {
                usuario.listas.forEach((lista) => {
                    if (Array.isArray(lista.series)) {
                        lista.series.forEach((id) => idsExcluidos.add(String(id)));
                    }
                });
            }
            // 2️⃣ Selección de géneros aleatorios
            const generos = [10759, 35, 18, 80, 9648, 16, 10765]; // acción, comedia, drama, etc.
            const generosElegidos = generos.sort(() => 0.5 - Math.random()).slice(0, 3);
            // 3️⃣ Llamadas a TMDB (discover)
            const promises = generosElegidos.map(genre => fetch(`${BASE_URL}/discover/tv?api_key=${API_KEY}&language=es-ES&with_genres=${genre}&sort_by=popularity.desc`)
                .then(resp => (resp.ok ? resp.json() : null))
                .catch(() => null));
            const resultados = yield Promise.all(promises);
            // Unificar resultados
            let series = [];
            resultados.forEach(r => {
                if (r === null || r === void 0 ? void 0 : r.results)
                    series.push(...r.results);
            });
            // 4️⃣ Filtrar series ya vistas / favoritas / listas / siguiendo
            series = series.filter(s => !idsExcluidos.has(String(s.id)));
            // 5️⃣ Aleatorizar y limitar a 10
            series = series.sort(() => 0.5 - Math.random()).slice(0, 10);
            // 6️⃣ Guardar fecha de última visita
            yield usuario_1.default.findByIdAndUpdate(idUsuario, {
                ultimaVezVistoEnDescubrir: new Date()
            });
            return res.json(series);
        }
        catch (error) {
            console.error("Error en descubrirSeries:", error);
            return res.status(500).json({ error: "Error cargando series para descubrir" });
        }
    })
};
