import { Request, Response, NextFunction } from "express";
import mongoose, { mongo } from "mongoose";
import usuario from "../../../modelos/modelos_mongoose_orm/usuario";

export default {
    agregarFavorito: async (req: Request, res: Response, next: NextFunction) => {
        try {

            const userId = (req as any).user?.id;
            const { serieId } = req.params;

            const user = await usuario.findById(userId);
            if (!user) return res.status(404).json({ msg: 'Usuario no encontrado' });

            const index = user.favoritas.indexOf(serieId);

            if (index === -1) {
                // Si no está, la agrega
                user.favoritas.push(serieId);
            } else {
                //en vez de hacer un enpoint para borrar la serie con esto directamente se borra
                user.favoritas.splice(index, 1);
            }

            await user.save();
            res.json({ favoritas: user.favoritas });


        } catch (error) {
            console.error(error);
            res.status(500).json({ msg: 'Error al actualizar favoritos' });
        }
    },
    obtenerFavoritos: async (req: Request, res: Response, next: NextFunction) => {
        try {
            const userId = (req as any).user?.id;
            const user = await usuario.findById(userId).select('favoritas'); 

            if (!user) {
                return res.status(404).json({ msg: 'Usuario no encontrado' });
            }
            
            console.log('Favoritas del usuario:', user.favoritas);
            // devolvemos el array de favoritas
            res.json({ favoritas: user.favoritas });

        } catch (error) {
            console.error(error);
            res.status(500).json({ msg: 'Error al obtener favoritas' });
        }
    }
}