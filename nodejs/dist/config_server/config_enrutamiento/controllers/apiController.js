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
            const query = req.query.q; //Se recoge el campo query que es la serie que ha buscado el usuario
            if (!query) {
                return res.status(400).json({ error: "Debes introducir una Serie" });
            }
            const url = `${BASE_URL}/search/movie?api_key=${API_KEY}&language=es-ES&query=${encodeURIComponent(query)}&page=1`;
            const response = yield fetch(url); //Se conecta a la API y lanza la peticion
            if (!response.ok) {
                throw new Error(`Error en TMDb: ${response.statusText}`);
            }
            const data = yield response.json();
            res.json(data.results); // Devuelve solo el array de series
        }
        catch (error) {
            console.error(error);
            res.status(500).json({ error: "Error buscando películas" });
        }
    }),
    obtenerSeries: (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            // Página que pide el frontend (por defecto 1) por ejemplo si se quiere pasar a la siguiente pagina etc (cada vez que quiera mas series se ejecuta y pide otra pagina mas)
            const page = req.query.page ? Number(req.query.page) : 1;
            const url = `${BASE_URL}/discover/tv?api_key=${API_KEY}&language=es-ES&page=${page}`;
            const response = yield fetch(url);
            if (!response.ok) {
                throw new Error(`Error en TMDb: ${response.statusText}`);
            }
            const data = yield response.json();
            res.json({
                page: data.page, // Página actual
                total_pages: data.total_pages, // Total de páginas disponibles
                total_results: data.total_results, // Total de series en la DB
                results: data.results // Array de series
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
    })
};
