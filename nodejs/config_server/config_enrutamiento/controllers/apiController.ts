import { Request, Response, NextFunction } from "express";
import mongoose, { mongo } from "mongoose";
import dotenv from 'dotenv';

dotenv.config();


const BASE_URL = "https://api.themoviedb.org/3";
const API_KEY = process.env.TMDB_API_KEY;

export default {
    buscarSeries: async (req: Request, res: Response, next: NextFunction) => {
        try {
            const query = req.query.q as string; //Se recoge el campo query que es la serie que ha buscado el usuario
            if (!query) {
                return res.status(400).json({ error: "Debes introducir una Serie" });
            }

            const url = `${BASE_URL}/search/movie?api_key=${API_KEY}&language=es-ES&query=${encodeURIComponent(query)}&page=1`;

            const response = await fetch(url); //Se conecta a la API y lanza la peticion
            if (!response.ok) {
                throw new Error(`Error en TMDb: ${response.statusText}`);
            }

            const data = await response.json();
            res.json(data.results); // Devuelve solo el array de series

        } catch (error) {
            console.error(error);
            res.status(500).json({ error: "Error buscando películas" });
        }
    },
    obtenerSeries: async (req: Request, res: Response, next: NextFunction) => {
        try {
            // Página que pide el frontend (por defecto 1) por ejemplo si se quiere pasar a la siguiente pagina etc (cada vez que quiera mas series se ejecuta y pide otra pagina mas)
            const page = req.query.page ? Number(req.query.page) : 1;

            const url = `${BASE_URL}/discover/tv?api_key=${API_KEY}&language=es-ES&page=${page}`;

            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`Error en TMDb: ${response.statusText}`);
            }

            const data = await response.json();

            res.json({
                page: data.page,                 // Página actual
                total_pages: data.total_pages,   // Total de páginas disponibles
                total_results: data.total_results, // Total de series en la DB
                results: data.results            // Array de series
            });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: "error obteniendo series" });
        }
    },
    obtenerSeriePorID: async( req:Request, res: Response, next: NextFunction) => {
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
    }
}