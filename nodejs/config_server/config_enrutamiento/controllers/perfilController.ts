import { Request, Response, NextFunction } from "express";
import mongoose, { mongo } from "mongoose";
import usuario from "../../../modelos/modelos_mongoose_orm/usuario";
import { Lista } from "../../../modelos/modelos_mongoose_orm/lista";

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

            const user = await usuario.findByIdAndUpdate(
                req.params.id,
                { listasPublicas },
                { new: true }
            ).populate('listasPublicas');

            if (!user) {
                return res.status(404).json({ msg: 'Usuario no encontrado' });
            }

            res.json(user.listasPublicas);
        } catch (err) {
            console.error('Error al actualizar listas públicas:', err);
            res.status(500).json({ msg: 'Error al actualizar listas públicas', err });
        }
    }


}