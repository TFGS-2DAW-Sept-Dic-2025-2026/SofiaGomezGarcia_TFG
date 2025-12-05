import { Request, Response, NextFunction } from "express";
import mongoose, { mongo } from "mongoose";
import Usuario from "../../../modelos/modelos_mongoose_orm/usuario";
import dotenv from 'dotenv';
import { Opinion } from "../../../modelos/modelos_mongoose_orm/opinion";
import seguimientoSerie from "../../../modelos/modelos_mongoose_orm/seguimientoSerie";
import { Lista } from "../../../modelos/modelos_mongoose_orm/lista";




dotenv.config();


const BASE_URL = "https://api.themoviedb.org/3";
const API_KEY = process.env.TMDB_API_KEY;

type Agg = { _id: any; puntos: number };


export default {
    obtenerPopulares: async (req: Request, res: Response) => {

        try {
            const opiniones: Agg[] = await Opinion.aggregate([
                {
                    $group: {
                        _id: "$idSerie",
                        puntos: { $sum: { $add: [4, "$meGusta"] } }
                    }
                }
            ]).exec();

            const favoritos: Agg[] = await Usuario.aggregate([
                { $unwind: "$favoritas" },
                {
                    $group: {
                        _id: "$favoritas.idSerie",
                        puntos: { $sum: 5 }
                    }
                }
            ]).exec();

            const seguimiento: Agg[] = await seguimientoSerie.aggregate([
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

            const listas: Agg[] = await Lista.aggregate([
                { $unwind: "$series" },
                {
                    $group: {
                        _id: "$series",
                        puntos: { $sum: 3 }
                    }
                }
            ]).exec();

            const mapa = new Map<string, number>();

            const añadir = (arr: Agg[] = []) => {
                arr.forEach((a: Agg) => {
                    const id = String(a._id ?? "");
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
            const tmdbPromises = popularesOrdenadas.map(item =>
                fetch(`${BASE_URL}/tv/${item.id}?api_key=${API_KEY}&language=es-ES`)
                    .then(resp => (resp.ok ? resp.json() : null))
                    .catch(() => null)
            );

            const tmdbResults = (await Promise.all(tmdbPromises)).filter(Boolean);

            return res.json(tmdbResults);
        } catch (error) {
            console.error("Error obteniendo populares:", error);
            return res.status(500).json({ error: "Error obteniendo series populares" });
        }

        //     try {
        //         // ===== 1. OPINIONES =====
        //         const opiniones = await Opinion.aggregate([
        //             {
        //                 $group: {
        //                     _id: "$idSerie",
        //                     puntos: {
        //                         $sum: { $add: [4, "$meGusta"] } // 4 por op + me gusta
        //                     }
        //                 }
        //             }
        //         ]);

        //         // ===== 2. FAVORITOS =====
        //         const favoritos = await Usuario.aggregate([
        //             { $unwind: "$favoritas" },
        //             {
        //                 $group: {
        //                     _id: "$favoritas.idSerie",
        //                     puntos: { $sum: 5 }
        //                 }
        //             }
        //         ]);

        //         // ===== 3. SERIES SEGUIDAS =====
        //         const seguimiento = await seguimientoSerie.aggregate([
        //             {
        //                 $group: {
        //                     _id: "$idSerieTMDB",
        //                     puntos: {
        //                         $sum: {
        //                             $cond: [
        //                                 { $eq: ["$estado", "completada"] },
        //                                 6,
        //                                 4
        //                             ]
        //                         }
        //                     }
        //                 }
        //             }
        //         ]);

        //         // ===== 4. LISTAS =====
        //         const listas = await Lista.aggregate([
        //             { $unwind: "$series" },
        //             {
        //                 $group: {
        //                     _id: "$series",
        //                     puntos: { $sum: 3 }
        //                 }
        //             }
        //         ]);

        //         // ===== 5. UNIFICAR TODO =====
        //         const mapa = new Map();

        //         const añadir = (arr: any[]) => {
        //             arr.forEach(a => {
        //                 mapa.set(a._id, (mapa.get(a._id) || 0) + a.puntos);
        //             });
        //         }

        //         añadir(opiniones);
        //         añadir(favoritos);
        //         añadir(seguimiento);
        //         añadir(listas);

        //         // Convertimos a array ordenado
        //         const populares = [...mapa.entries()]
        //             .sort((a,b) => b[1] - a[1])
        //             .slice(0, 20) // top 20
        //             .map(([id, puntos]) => ({ id, puntos }));

        //         // ===== 6. obtener datos reales de TMDB =====
        //         const results = [];
        //         for (const serie of populares) {
        //             const url = `${BASE_URL}/tv/${serie.id}?api_key=${API_KEY}&language=es-ES`;
        //             const resp = await fetch(url);
        //             const data = await resp.json();
        //             results.push(data);
        //         }

        //         res.json(results);

        //     } catch (error) {
        //         console.error(error);
        //         res.status(500).json({ error: "Error obteniendo series populares" });
        //     }
        // }
    }
}