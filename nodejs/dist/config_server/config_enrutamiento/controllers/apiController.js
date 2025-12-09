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
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const BASE_URL = "https://api.themoviedb.org/3";
const API_KEY = process.env.TMDB_API_KEY;
exports.default = {
    buscarSeries: (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const query = req.query.q;
            if (!query) {
                return res.status(400).json({ error: "Debes introducir una Serie" });
            }
            const page = req.query.page || 1;
            const url = `${BASE_URL}/search/movie?api_key=${API_KEY}&language=es-ES&query=${encodeURIComponent(query)}&page=${page}`;
            const response = yield fetch(url);
            if (!response.ok) {
                throw new Error(`Error en TMDb: ${response.statusText}`);
            }
            const data = yield response.json();
            res.json({
                page: data.page,
                total_pages: data.total_pages,
                results: data.results
            });
        }
        catch (error) {
            console.error(error);
            res.status(500).json({ error: "Error buscando películas" });
        }
    }),
    obtenerSeries: (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const page = req.query.page ? Number(req.query.page) : 1;
            const url = `${BASE_URL}/discover/tv?api_key=${API_KEY}&language=es-ES&page=${page}`;
            const response = yield fetch(url);
            if (!response.ok) {
                throw new Error(`Error en TMDb: ${response.statusText}`);
            }
            const data = yield response.json();
            res.json({
                page: data.page,
                total_pages: data.total_pages,
                total_results: data.total_results,
                results: data.results
            });
        }
        catch (error) {
            console.error(error);
            res.status(500).json({ error: "error obteniendo series" });
        }
    }),
    obtenerSeriePorID: (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const id = req.params.id;
            const url = `${BASE_URL}/tv/${id}?api_key=${API_KEY}&language=es-ES`;
            const response = yield fetch(url);
            if (!response.ok) {
                throw new Error(`Error en TMDb: ${response.statusText}`);
            }
            const data = yield response.json();
            res.json(data);
        }
        catch (error) {
            console.log(error);
            res.status(500).json({ error: "Error obteniendo detalles de la serie por ID" });
        }
    }),
    obtenerGeneros: (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const url = `${BASE_URL}/genre/tv/list?api_key=${API_KEY}&language=es-ES`;
            const response = yield fetch(url);
            if (!response.ok) {
                throw new Error(`Error en TMDb: ${response.statusText}`);
            }
            const data = yield response.json();
            res.json(data);
        }
        catch (error) {
            console.error(error);
            res.status(500).json({ error: "Error obteniendo géneros" });
        }
    }),
    obtenerProveedores: (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const url = `${BASE_URL}/watch/providers/tv?api_key=${API_KEY}&language=es-ES&watch_region=ES`;
            const response = yield fetch(url);
            if (!response.ok) {
                throw new Error(`Error en TMDb: ${response.statusText}`);
            }
            const data = yield response.json();
            res.json(data);
        }
        catch (error) {
            console.error(error);
            res.status(500).json({ error: "Error obteniendo proveedores" });
        }
    }),
    obtenerProveedoresPorSerie: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        var _a, _b;
        try {
            const id = req.params.id;
            const url = `${BASE_URL}/tv/${id}/watch/providers?api_key=${API_KEY}`;
            const response = yield fetch(url);
            if (!response.ok)
                throw new Error("Error obteniendo proveedores por serie");
            const data = yield response.json();
            const providers = ((_b = (_a = data.results) === null || _a === void 0 ? void 0 : _a.ES) === null || _b === void 0 ? void 0 : _b.flatrate) || [];
            res.json(providers);
        }
        catch (error) {
            console.error(error);
            res.status(500).json({ error: "Error obteniendo proveedores por serie" });
        }
    }),
    descubrirSeries: (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const { query, with_genres, with_original_language, with_watch_providers, page } = req.query;
            const baseEndpoint = query ? "search/tv" : "discover/tv";
            const pageNum = page ? Number(page) : 1;
            let url = `${BASE_URL}/${baseEndpoint}?api_key=${API_KEY}&language=es-ES&page=${pageNum}`;
            if (query)
                url += `&query=${encodeURIComponent(query)}`;
            if (with_genres)
                url += `&with_genres=${encodeURIComponent(with_genres)}`;
            if (with_original_language)
                url += `&with_original_language=${encodeURIComponent(with_original_language)}`;
            if (with_watch_providers)
                url += `&with_watch_providers=${encodeURIComponent(with_watch_providers)}&watch_region=ES`;
            const response = yield fetch(url);
            if (!response.ok)
                throw new Error(`Error en TMDb: ${response.statusText}`);
            const data = yield response.json();
            res.json({
                page: data.page || pageNum,
                total_pages: data.total_pages || 1,
                total_results: data.total_results || 0,
                results: data.results || []
            });
        }
        catch (error) {
            console.error(error);
            res.status(500).json({ error: "Error descubriendo series" });
        }
    }),
    obtenerTemporada: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const idSerie = req.params.id;
            const numeroTemporada = req.params.seasonNumber;
            const url = `${BASE_URL}/tv/${idSerie}/season/${numeroTemporada}?api_key=${API_KEY}&language=es-ES`;
            const response = yield fetch(url);
            if (!response.ok) {
                throw new Error(`Error en TMDb: ${response.statusText}`);
            }
            const data = yield response.json();
            res.json(data);
        }
        catch (error) {
            console.error(error);
            res.status(500).json({ error: "Error obteniendo detalles de la temporada" });
        }
    }),
    obtenerTrailer: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const id = req.params.id;
            const url = `${BASE_URL}/tv/${id}/videos?api_key=${API_KEY}&language=es-ES`;
            const response = yield fetch(url);
            if (!response.ok)
                throw new Error("Error obteniendo videos");
            const data = yield response.json();
            const trailer = data.results.find((v) => v.type === "Trailer" && v.site === "YouTube");
            res.json({ key: trailer ? trailer.key : null });
        }
        catch (error) {
            console.error(error);
            res.status(500).json({ error: "Error obteniendo trailer" });
        }
    }),
    obtenerTendencias: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const url = `${BASE_URL}/trending/tv/day?api_key=${API_KEY}&language=es-ES`;
            const response = yield fetch(url);
            if (!response.ok)
                throw new Error("Error obteniendo tendencias");
            const data = yield response.json();
            res.json(data);
        }
        catch (error) {
            console.error(error);
            res.status(500).json({ error: "Error obteniendo tendencias" });
        }
    })
};
