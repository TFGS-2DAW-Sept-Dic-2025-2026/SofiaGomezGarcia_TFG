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
                series: []
            });

            await nuevaLista.save();

            // se agrega la referencia de la lista al usuario
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

            const { id } = req.params; // ID de la lista
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
            const { id } = req.params; // ID de la lista
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

            const { id } = req.params; // ID de la lista
            const usuarioCreador = (req as any).user?.id;

            if (!usuarioCreador) {
                return res.status(401).json({ msg: 'Usuario no autenticado' });
            }

            const lista = await Lista.findOneAndDelete({ _id: id, usuarioCreador });

            if (!lista) {
                return res.status(404).json({ msg: 'Lista no encontrada' });
            }
            
            // se elimina la referencia de la lista en el usuario
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
            const { id } = req.params; // ID de la lista
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
    }

}