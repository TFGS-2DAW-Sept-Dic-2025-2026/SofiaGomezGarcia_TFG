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

    }, descubrirSeries: async (req: Request, res: Response) => {
        try {
            const idUsuario = (req as any).user?.id;

            if (!idUsuario) {
                return res.status(400).json({ error: "ID de usuario es obligatorio" });
            }

            const usuario = await Usuario.findById(idUsuario)
                .populate("listas")
                .lean();

            if (!usuario) return res.status(404).json({ error: "Usuario no encontrado" });

            // 1️⃣ IDs a excluir
            const idsExcluidos = new Set<string>();

            if (Array.isArray(usuario.favoritas)) {
                usuario.favoritas.forEach(id => idsExcluidos.add(String(id)));
            }

            const seguimientos = await seguimientoSerie.find({ idUsuario }, "idSerieTMDB").lean();
            seguimientos.forEach(s => idsExcluidos.add(String(s.idSerieTMDB)));

            if (Array.isArray(usuario.listas)) {
                usuario.listas.forEach(lista => {
                    if (Array.isArray(lista)) {
                        lista.forEach((id: string) => idsExcluidos.add(String(id)));
                    }
                });
            }

            // 2️⃣ Géneros aleatorios
            const generos = [10759, 35, 18, 80, 9648, 10765]; // 16 animacion quitado
            const generosElegidos = generos.sort(() => 0.5 - Math.random()).slice(0, 3);

            const TOTAL_PAGINAS = 5;
            const allPromises: Promise<any>[] = [];

            // 3️⃣ Llamadas a TMDB
            for (const genre of generosElegidos) {
                for (let page = 1; page <= TOTAL_PAGINAS; page++) {
                    allPromises.push(
                        fetch(`${BASE_URL}/discover/tv?api_key=${API_KEY}&language=es-ES&with_genres=${genre}&sort_by=popularity.desc&page=${page}`)
                            .then(r => (r.ok ? r.json() : null))
                            .catch(() => null)
                    );
                }
            }

            const resultados = await Promise.all(allPromises);

            // 4️⃣ Unificar todos los resultados en un MAP para evitar duplicados
            const seriesMap = new Map<number, any>(); // <id TMDB, datos>

            resultados.forEach(r => {
                if (r?.results) {
                    r.results.forEach((serie: any) => {
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
            await Usuario.findByIdAndUpdate(idUsuario, {
                ultimaVezVistoEnDescubrir: new Date()
            });

            return res.json(series);

        } catch (error) {
            console.error("Error en descubrirSeries:", error);
            return res.status(500).json({ error: "Error cargando series para descubrir" });
        }
    }
}
