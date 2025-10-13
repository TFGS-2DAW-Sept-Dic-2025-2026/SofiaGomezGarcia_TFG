import { Request, Response, NextFunction } from "express";
import mongoose, { mongo } from "mongoose";
import dotenv from 'dotenv';


dotenv.config();


const BASE_URL = "https://api.themoviedb.org/3";
const API_KEY = process.env.TMDB_API_KEY;

export default {
    buscarSeries: async (req: Request, res: Response, next: NextFunction) => {
        try {
            const query = req.query.q as string;
            if (!query) {
                return res.status(400).json({ error: "Debes introducir una Serie" });
            }

            const url = `${BASE_URL}/search/movie?api_key=${API_KEY}&language=es-ES&query=${encodeURIComponent(query)}&page=1`;

            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`Error en TMDb: ${response.statusText}`);
            }

            const data = await response.json();
            res.json(data.results);

        } catch (error) {
            console.error(error);
            res.status(500).json({ error: "Error buscando películas" });
        }
    },
    obtenerSeries: async (req: Request, res: Response, next: NextFunction) => {
        try {
            const page = req.query.page ? Number(req.query.page) : 1;

            const url = `${BASE_URL}/discover/tv?api_key=${API_KEY}&language=es-ES&page=${page}`;

            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`Error en TMDb: ${response.statusText}`);
            }

            const data = await response.json();

            res.json({
                page: data.page,
                total_pages: data.total_pages,
                total_results: data.total_results,
                results: data.results
            });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: "error obteniendo series" });
        }
    },
    obtenerSeriePorID: async (req: Request, res: Response, next: NextFunction) => {
        try {
            const id = req.params.id;
            const url = `${BASE_URL}/tv/${id}?api_key=${API_KEY}&language=es-ES`;

            const response = await fetch(url);

            if (!response.ok) {
                throw new Error(`Error en TMDb: ${response.statusText}`)
            }

            const data = await response.json();
            res.json(data);


        } catch (error) {
            console.log(error);
            res.status(500).json({ error: "Error obteniendo detalles de la serie por ID" });

        }
    },
    obtenerGeneros: async (req: Request, res: Response, next: NextFunction) => {
        try {
            const url = `${BASE_URL}/genre/tv/list?api_key=${API_KEY}&language=es-ES`;
            const response = await fetch(url);

            if (!response.ok) {
                throw new Error(`Error en TMDb: ${response.statusText}`);
            }
            const data = await response.json();
            res.json(data);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: "Error obteniendo géneros" });
        }
    },
    obtenerProveedores: async (req: Request, res: Response, next: NextFunction) => {
        try {
            const url = `${BASE_URL}/watch/providers/tv?api_key=${API_KEY}&language=es-ES&watch_region=ES`;
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`Error en TMDb: ${response.statusText}`);
            }
            const data = await response.json();
            res.json(data);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: "Error obteniendo proveedores" });
        }
    },
    descubrirSeries: async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { query, with_genres, with_original_language, with_watch_providers, page } = req.query;

            const baseEndpoint = query ? "search/tv" : "discover/tv";


            const pageNum = page ? Number(page) : 1;

            let url = `${BASE_URL}/${baseEndpoint}?api_key=${API_KEY}&language=es-ES&page=${pageNum}`;

            if (query) url += `&query=${encodeURIComponent(query as string)}`;
            if (with_genres) url += `&with_genres=${encodeURIComponent(with_genres as string)}`;
            if (with_original_language) url += `&with_original_language=${encodeURIComponent(with_original_language as string)}`;
            if (with_watch_providers) url += `&with_watch_providers=${encodeURIComponent(with_watch_providers as string)}&watch_region=ES`;

            const response = await fetch(url);
            if (!response.ok) throw new Error(`Error en TMDb: ${response.statusText}`);

            const data = await response.json();

            res.json({
                page: data.page || pageNum,
                total_pages: data.total_pages || 1,
                total_results: data.total_results || 0,
                results: data.results || []
            });

        } catch (error) {
            console.error(error);
            res.status(500).json({ error: "Error descubriendo series" });
        }
    },
    obtenerTemporada: async (req: Request, res: Response) => {
        try {
            const idSerie = req.params.id;              
            const numeroTemporada = req.params.seasonNumber; 
            const url = `${BASE_URL}/tv/${idSerie}/season/${numeroTemporada}?api_key=${API_KEY}&language=es-ES`;
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`Error en TMDb: ${response.statusText}`);
            }
            const data = await response.json();
            res.json(data);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: "Error obteniendo detalles de la temporada" });
        }
    }

}