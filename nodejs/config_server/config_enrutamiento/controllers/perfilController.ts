import { Request, Response, NextFunction } from "express";
import mongoose, { mongo } from "mongoose";
import usuario from "../../../modelos/modelos_mongoose_orm/usuario";
import { Lista } from "../../../modelos/modelos_mongoose_orm/lista";
import seguimientoSerie from "../../../modelos/modelos_mongoose_orm/seguimientoSerie";
import { Opinion } from "../../../modelos/modelos_mongoose_orm/opinion";

export default {
    obtenerFavoritas: async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { userId } = req.params;
            if (!mongoose.Types.ObjectId.isValid(userId)) {
                return res.status(400).json({ message: "ID de usuario no válido" });
            }
            const user = await usuario.findById(userId).select("perfilFavoritas");
            if (!user) {
                return res.status(404).json({ message: "Usuario no encontrado" });
            }
            res.status(200).json({ favoritas: user.perfilFavoritas });
        } catch (error) {
            console.log("Error al obtener favoritos perfil: ", error);
            res.status(500).json({ msg: 'Error al obtener favoritos perfil' });
        }
    },
    actualizarFavoritas: async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { userId } = req.params;
            const { favoritas } = req.body;
            if (!mongoose.Types.ObjectId.isValid(userId)) {
                return res.status(400).json({ message: "ID de usuario no válido" });
            }
            if (!Array.isArray(favoritas)) {
                return res.status(400).json({ message: "El campo 'favoritas' debe ser un array" });
            }
            const user = await usuario.findByIdAndUpdate(
                userId,
                { perfilFavoritas: favoritas },
                { new: true }
            ).select("perfilFavoritas");
            if (!user) {
                return res.status(404).json({ message: "Usuario no encontrado" });
            }
            res.status(200).json({ favoritas: user.perfilFavoritas });
        } catch (error) {
            console.log("Error al actualizar favoritos perfil: ", error);
            res.status(500).json({ msg: 'Error al actualizar favoritos perfil' });
        }
    },
    obtenerListasPublicas: async (req: Request, res: Response, next: NextFunction) => {
        try {
            const user = await usuario.findById(req.params.id).populate('listasPublicas');
            if (!user) return res.status(404).json({ msg: 'Usuario no encontrado' });
            res.json({ listasPublicas: user.listasPublicas });
        } catch (error) {
            res.status(500).json({ msg: 'Error al obtener listas públicas', error });
        }
    },
    actualizarListasPublicas: async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { listasPublicas } = req.body;
            const userId = req.params.id;
            const listas = await Lista.find({ usuarioCreador: userId });

            const actualizaciones = listas.map(async (lista) => {
                lista.publica = listasPublicas.includes(lista.id.toString());
                return lista.save();
            });

            await Promise.all(actualizaciones);

            //implementar updateMany
            const user = await usuario.findByIdAndUpdate(
                userId,
                { listasPublicas },
                { new: true }
            ).populate('listasPublicas');

            if (!user) return res.status(404).json({ msg: 'Usuario no encontrado' });

            res.json(user.listasPublicas);
        } catch (err) {
            console.error('Error al actualizar listas públicas:', err);
            res.status(500).json({ msg: 'Error al actualizar listas públicas', err });
        }

    },
    obtenerListaPublicaPorId: async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { id } = req.params;


            const lista = await Lista.findById(id).populate('series');
            if (!lista) {
                return res.status(404).json({ msg: 'Lista no encontrada' });
            }

            // Si la lista NO es pública, requiere autenticación
            if (!lista.publica) {
                const usuarioId = (req as any).user?.id;
                if (!usuarioId || lista.usuarioCreador.toString() !== usuarioId) {
                    return res.status(401).json({ msg: 'No autorizado' });
                }
            }

            return res.json(lista);
        } catch (error) {
            console.error('Error obteniendo lista:', error);
            return res.status(500).json({ msg: 'Error interno del servidor' });
        }

    },
    obtenerPerfilPublico: async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { username } = req.params;
            const Usuario = await usuario.findOne({ username })
                .select('username nombre perfilFavoritas actividad');

            if (!Usuario) return res.status(404).json({ msg: 'Usuario no encontrado' });

            res.json(Usuario);
        } catch (error) {
            console.error(error);
            res.status(500).json({ msg: 'Error interno del servidor' });
        }
    },
    obtenerFavoritasPublicas: async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { username } = req.params;
            const Usuario = await usuario.findOne({ username }).select('perfilFavoritas');
            if (!Usuario) return res.status(404).json({ msg: 'Usuario no encontrado' });

            res.json({ favoritas: Usuario.perfilFavoritas });
        } catch (error) {
            console.error(error);
            res.status(500).json({ msg: 'Error interno' });
        }
    },
    obtenerSeguimientosPublicos: async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { username } = req.params;
            const Usuario = await usuario.findOne({ username });

            if (!Usuario) {
                return res.status(404).json({ msg: "Usuario no encontrado" });
            }

            const seguimientos = await seguimientoSerie.find({ idUsuario: Usuario._id });
            res.json(seguimientos);
        } catch (err) {
            console.error(err);
            res.status(500).json({ msg: "Error obteniendo seguimientos del perfil público" });
        }
    }, obtenerOpinionesPublicas: async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { username } = req.params;

            const Usuario = await usuario.findOne({ username });
            if (!Usuario) {
                return res.status(404).json({ msg: 'Usuario no encontrado' });
            }

            const opinionesUsuario = await Opinion.find({ idUsuario: Usuario._id });

            if (!opinionesUsuario.length) {
                return res.json({ opiniones: [] });
            }

            const opinionesPublicas = opinionesUsuario.map(op => ({
                id: op._id,
                idSerie: op.idSerie,
                estrellas: op.estrellas,
                opinion: op.opinion,
                fecha: op.fecha,
            }));

            res.json({ opiniones: opinionesPublicas });
        } catch (err) {
            console.error('Error obteniendo opiniones públicas:', err);
            res.status(500).json({ msg: 'Error interno del servidor' });
        }
    }, seguirUsuario: async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { idUsuarioObjetivo } = req.params;
            const idSeguidor = (req as any).user.id;

            if (!mongoose.Types.ObjectId.isValid(idUsuarioObjetivo)) {
                return res.status(400).json({ msg: "ID de usuario no válido" });
            }

            const usuarioObjetivo = await usuario.findById(idUsuarioObjetivo);
            const seguidor = await usuario.findById(idSeguidor);

            if (!usuarioObjetivo || !seguidor) {
                return res.status(404).json({ msg: "Usuario no encontrado" });
            }

            if (usuarioObjetivo.seguidores.includes(idSeguidor)) {
                return res.status(400).json({ msg: "Ya sigues a este usuario" });
            }

            usuarioObjetivo.seguidores.push(new mongoose.Types.ObjectId(idSeguidor));
            seguidor.seguidos.push(new mongoose.Types.ObjectId(idUsuarioObjetivo));

            await usuarioObjetivo.save();
            await seguidor.save();

            res.status(200).json({ msg: "Usuario seguido correctamente" });

        } catch (error) {
            console.error("Error al seguir usuario:", error);
            res.status(500).json({ msg: "Error al seguir usuario" });
        }
    }, dejarSeguirUsuario: async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { idUsuarioObjetivo } = req.params;
            const idSeguidor = (req as any).user.id;

            if (!mongoose.Types.ObjectId.isValid(idUsuarioObjetivo)) {
                return res.status(400).json({ msg: "ID de usuario no válido" });
            }

            const usuarioObjetivo = await usuario.findById(idUsuarioObjetivo);
            const seguidor = await usuario.findById(idSeguidor);

            if (!usuarioObjetivo || !seguidor) {
                return res.status(404).json({ msg: "Usuario no encontrado" });
            }

            usuarioObjetivo.seguidores = usuarioObjetivo.seguidores.filter(
                (id: mongoose.Types.ObjectId) => id.toString() !== idSeguidor
            );
            seguidor.seguidos = seguidor.seguidos.filter(
                (id: mongoose.Types.ObjectId) => id.toString() !== idUsuarioObjetivo
            );

            await usuarioObjetivo.save();
            await seguidor.save();

            res.status(200).json({ msg: "Has dejado de seguir al usuario" });
        } catch (error) {
            console.error("Error al dejar de seguir usuario:", error);
            res.status(500).json({ msg: "Error al dejar de seguir usuario" });
        }
    },
    obtenerUsuariosSeguidos: async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { usuarioId } = req.params;

            if (!mongoose.Types.ObjectId.isValid(usuarioId)) {
                return res.status(400).json({ msg: "ID de usuario no válido" });
            }
            
            const user = await usuario.findById(usuarioId).populate('seguidos', 'username fotoPerfil');

            if (!user) {
                return res.status(404).json({ msg: "Usuario no encontrado" });
            }

            res.status(200).json(user.seguidos);
        } catch (error) {
            console.error("Error al obtener usuarios seguidos:", error);
            res.status(500).json({ msg: "Error interno del servidor" });
        }
    },
    



}