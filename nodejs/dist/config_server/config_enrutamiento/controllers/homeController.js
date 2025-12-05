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
                .populate("listas")
                .lean();
            if (!usuario)
                return res.status(404).json({ error: "Usuario no encontrado" });
            // 1️⃣ IDs a excluir
            const idsExcluidos = new Set();
            if (Array.isArray(usuario.favoritas)) {
                usuario.favoritas.forEach(id => idsExcluidos.add(String(id)));
            }
            const seguimientos = yield seguimientoSerie_1.default.find({ idUsuario }, "idSerieTMDB").lean();
            seguimientos.forEach(s => idsExcluidos.add(String(s.idSerieTMDB)));
            if (Array.isArray(usuario.listas)) {
                usuario.listas.forEach(lista => {
                    if (Array.isArray(lista)) {
                        lista.forEach((id) => idsExcluidos.add(String(id)));
                    }
                });
            }
            // 2️⃣ Géneros aleatorios
            const generos = [10759, 35, 18, 80, 9648, 10765]; // 16 animacion quitado
            const generosElegidos = generos.sort(() => 0.5 - Math.random()).slice(0, 3);
            const TOTAL_PAGINAS = 5;
            const allPromises = [];
            // 3️⃣ Llamadas a TMDB
            for (const genre of generosElegidos) {
                for (let page = 1; page <= TOTAL_PAGINAS; page++) {
                    allPromises.push(fetch(`${BASE_URL}/discover/tv?api_key=${API_KEY}&language=es-ES&with_genres=${genre}&sort_by=popularity.desc&page=${page}`)
                        .then(r => (r.ok ? r.json() : null))
                        .catch(() => null));
                }
            }
            const resultados = yield Promise.all(allPromises);
            // 4️⃣ Unificar todos los resultados en un MAP para evitar duplicados
            const seriesMap = new Map(); // <id TMDB, datos>
            resultados.forEach(r => {
                if (r === null || r === void 0 ? void 0 : r.results) {
                    r.results.forEach((serie) => {
                        if (!seriesMap.has(serie.id)) {
                            seriesMap.set(serie.id, serie);
                        }
                    });
                }
            });
            // Convertir a array
            let series = [...seriesMap.values()];
            // 5️⃣ Filtrar excluidas por usuario
            series = series.filter(s => !idsExcluidos.has(String(s.id)));
            // 6️⃣ Aleatorizar y limitar
            const MAX_RECOMENDADAS = 30; // 🔥 Cambia esto si quieres más/menos
            series = series.sort(() => 0.5 - Math.random()).slice(0, MAX_RECOMENDADAS);
            // 7️⃣ Guardar fecha última visita
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
