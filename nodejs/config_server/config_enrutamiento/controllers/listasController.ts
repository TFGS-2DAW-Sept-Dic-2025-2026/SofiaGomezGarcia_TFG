import { Request, Response, NextFunction } from "express";
import mongoose, { mongo } from "mongoose";
import usuario from "../../../modelos/modelos_mongoose_orm/usuario";
import { Lista } from "../../../modelos/modelos_mongoose_orm/lista";

export default {
    crearLista: async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { nombre, descripcion } = req.body;
            const usuarioCreador = (req as any).user?.id;

            if (!usuarioCreador) {
                return res.status(401).json({ msg: 'Usuario no autenticado' });
            }

            if (!nombre) {
                return res.status(400).json({ msg: 'El nombre de la lista es obligatorio' });
            }

            const nuevaLista = new Lista({
                nombre,
                descripcion,
                usuarioCreador,
                series: [],
                publica: false
            });

            await nuevaLista.save();


            await usuario.findByIdAndUpdate(usuarioCreador, {
                $push: { listas: nuevaLista._id },
            })

            res.status(201).json(nuevaLista);



        } catch (error) {
            console.log("Error al crear la lista: ", error);
            res.status(500).json({ msg: 'Error al crear la listaa' });

        }
    },
    obtenerListas: async (req: Request, res: Response, next: NextFunction) => {
        try {
            const usuarioCreador = (req as any).user?.id;
            if (!usuarioCreador) {
                return res.status(401).json({ msg: 'Usuario no autenticado' });
            }

            // El sort ordena por orden de creacion, en este caso de mas reciente a mas antiguo
            const listas = await Lista.find({ usuarioCreador }).sort({ createdAt: -1 });
            res.status(200).json(listas);


        } catch (error) {
            console.log("Error al obtener las listas: ", error);
            res.status(500).json({ msg: 'Error al obtener las listas' });

        }
    },
    agregarSerieALista: async (req: Request, res: Response, next: NextFunction) => {
        try {

            const { id } = req.params;
            const { idSerie } = req.body;
            const usuarioCreador = (req as any).user?.id;

            if (!usuarioCreador) {
                return res.status(401).json({ msg: 'Usuario no autenticado' });
            }

            if (!idSerie) {
                return res.status(400).json({ msg: 'El ID de la serie es obligatorio' });
            }


            const lista = await Lista.findOne({ _id: id, usuarioCreador });
            if (!lista) {
                return res.status(404).json({ msg: 'Lista no encontrada' });
            }

            if (lista.series.includes(idSerie)) {
                return res.status(400).json({ msg: 'La serie ya está en la lista' });
            }

            lista.series.push(idSerie);
            await lista.save();
            res.status(200).json(lista);

        } catch (error) {
            console.log("Error al agregar la serie a la lista: ", error);
            res.status(500).json({ msg: 'Error al agregar la serie a la lista' });

        }
    },
    eliminarSerieDeLista: async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { id } = req.params;
            const { idSerie } = req.body;
            const usuarioCreador = (req as any).user?.id;

            if (!usuarioCreador) {
                return res.status(401).json({ msg: 'Usuario no autenticado' });
            }

            if (!idSerie) {
                return res.status(400).json({ msg: 'El ID de la serie es obligatorio' });
            }


            const lista = await Lista.findOne({ _id: id, usuarioCreador });
            if (!lista) {
                return res.status(404).json({ msg: 'Lista no encontrada' });
            }

            const index = lista.series.indexOf(idSerie);
            if (index === -1) {
                return res.status(400).json({ msg: 'La serie no está en la lista' });
            }

            lista.series.splice(index, 1);
            await lista.save();
            res.status(200).json(lista);


        } catch (error) {
            console.log("Error al eliminar la serie de la lista: ", error);
            res.status(500).json({ msg: 'Error al eliminar la serie de la lista' });

        }
    },
    eliminarLista: async (req: Request, res: Response, next: NextFunction) => {
        try {

            const { id } = req.params;
            const usuarioCreador = (req as any).user?.id;

            if (!usuarioCreador) {
                return res.status(401).json({ msg: 'Usuario no autenticado' });
            }

            const lista = await Lista.findOneAndDelete({ _id: id, usuarioCreador });

            if (!lista) {
                return res.status(404).json({ msg: 'Lista no encontrada' });
            }

            await usuario.findByIdAndUpdate(usuarioCreador, {
                $pull: { listas: id },
            });

            res.status(200).json({ msg: 'Lista eliminada correctamente' });

        } catch (error) {
            console.log("Error al eliminar la lista: ", error);
            res.status(500).json({ msg: 'Error al eliminar la lista' });

        }
    },
    obtenerListaPorId: async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { id } = req.params;
            const usuarioCreador = (req as any).user?.id;
            if (!usuarioCreador) {
                return res.status(401).json({ msg: 'Usuario no autenticado' });
            }

            const lista = await Lista.findOne({ _id: id, usuarioCreador });
            if (!lista) {
                return res.status(404).json({ msg: 'Lista no encontrada' });
            }
            res.status(200).json(lista);


        } catch (error) {
            console.log("Error al obtener la lista: ", error);
            res.status(500).json({ msg: 'Error al obtener la lista' });

        }
    },


    obtenerListasConEstado: async (req: Request, res: Response, next: NextFunction) => {
        try {
            const usuarioCreador = (req as any).user?.id;
            const { idSerie } = req.params;

            if (!usuarioCreador) return res.status(401).json({ msg: 'Usuario no autenticado' });
            if (!idSerie) return res.status(400).json({ msg: 'ID de la serie es obligatorio' });

            const listas = await Lista.find({ usuarioCreador }).sort({ createdAt: -1 });

            //Metodo para saber si la lista contiene esa serie o no para el modal de agregar serie a la lista

            const listasConEstado = listas.map(lista => ({
                _id: lista._id,
                nombre: lista.nombre,
                descripcion: lista.descripcion,
                series: lista.series,
                contieneSerie: lista.series.includes(idSerie),
                fechaCreacion: lista.fechaCreacion
            }));

            res.status(200).json(listasConEstado);
        } catch (error) {
            console.log("Error al obtener listas con estado:", error);
            res.status(500).json({ msg: 'Error al obtener listas con estado' });
        }
    },
    obtenerListasPublicasPorUsername: async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { username } = req.params;

            if (!username) {
                return res.status(400).json({ mensaje: 'Username es requerido' });
            }

            const Usuario = await usuario.findOne({ username });
            if (!usuario) {
                return res.status(404).json({ mensaje: 'Usuario no encontrado' });
            }

            const listasPublicas = await Lista.find({
                _id: { $in: Usuario?.listasPublicas }
            }).populate('series');

            return res.json({ listasPublicas });
        } catch (error) {
            console.error('Error obteniendo listas públicas por username:', error);
            return res.status(500).json({ mensaje: 'Error interno del servidor' });
        }
    },
    darLikeLista: async (req: Request, res: Response, next: NextFunction) => {
        try {
            const idLista = req.params.id;
            const idUsuario = (req as any).user?.id;

            if (!idUsuario) {
                return res.status(401).json({ msg: 'Usuario no autenticado' });
            }

            if (!idLista) {
                return res.status(400).json({ msg: 'ID de la lista es obligatorio' });
            }

            const lista = await Lista.findById(idLista);
            if (!lista) {
                return res.status(404).json({ msg: 'Lista no encontrada' });
            }

            // Inicializamos los campos si no existen
            if (!lista.usuariosQueDieronLike) lista.usuariosQueDieronLike = [];
            if (lista.likes === undefined) lista.likes = 0;

            const yaDioLike = lista.usuariosQueDieronLike.includes(idUsuario);

            if (yaDioLike) {

                lista.usuariosQueDieronLike = lista.usuariosQueDieronLike.filter(u => u.toString() !== idUsuario);
                lista.likes = Math.max(0, lista.likes - 1);
            } else {

                lista.usuariosQueDieronLike.push(idUsuario);
                lista.likes += 1;
            }

            await lista.save();

            res.status(200).json({
                likes: lista.likes,
                dioLike: !yaDioLike
            });

        } catch (error) {
            console.log("Error al dar like a la lista:", error);
            res.status(500).json({ msg: 'Error al dar like a la lista', error });
        }
    },
    obtenerListasPublicasPopulares: async (req: Request, res: Response) => {
        try {
            const listas = await Lista.find({ publica: true })
                .populate('usuarioCreador', 'username fotoPerfil')
                .populate('series', '_id')
                .sort({ likes: -1 })
                .limit(50);

            const listasHome = listas.map(l => ({
                id: l._id,
                nombre: l.nombre,
                descripcion: l.descripcion,
                likes: l.likes ?? 0,
                seriesCount: l.series?.length || 0,
                usuario: l.usuarioCreador
                    ? {
                        username: (l.usuarioCreador as any).username,
                        fotoPerfil: (l.usuarioCreador as any).fotoPerfil
                    }
                    : null
            }));


            res.status(200).json(listasHome);
        } catch (error) {
            console.error("Error al obtener listas públicas populares:", error);
            res.status(500).json({ msg: "Error al obtener listas públicas populares" });
        }
    }


}