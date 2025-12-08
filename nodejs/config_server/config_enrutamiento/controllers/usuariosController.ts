import { Request, Response, NextFunction } from "express";
import mongoose, { mongo } from "mongoose";
import usuario from "../../../modelos/modelos_mongoose_orm/usuario";

export default {
    obtenerUsuarios: async (req: Request, res: Response, next: NextFunction) => {
        try {
            // Se obtienen todos los usuarios pero sin recoger los datos sensibles como las contraseñas
            const usuarios = await usuario.find().select("-passwordHash -refreshToken -__v");
            res.status(200).json({ usuarios });
        } catch (error) {
            console.error("Error obteniendo usuarios:", error);
            res.status(500).json({ msg: "Error en el servidor", error });
        }
    },
    obtenerUsuariosByID: async (req: Request, res: Response, next: NextFunction) => {
        try {
            const userId = req.params.id; // ✅ usar el ID de los parámetros
            const user = await usuario.findById(userId).select("-passwordHash -refreshToken -__v");

            if (!user) {
                return res.status(404).json({ msg: "Usuario no encontrado" });
            }

            res.status(200).json(user);
        } catch (error) {
            console.error("Error obteniendo usuario por ID:", error);
            res.status(500).json({ msg: "Error en el servidor", error });
        }
    },
    obtenerUsuariosPorUsername: async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { username } = req.params;

            if (!username) {
                return res.status(400).json({ msg: "Username es obligatorio" });
            }

            const user = await usuario.findOne({ username }).select("-passwordHash -refreshToken -__v");

            if (!user) {
                return res.status(404).json({ msg: "Usuario no encontrado" });
            }

            res.status(200).json(user);
        } catch (error) {
            console.error("Error obteniendo usuario por username:", error);
            res.status(500).json({ msg: "Error en el servidor", error });
        }
    }
}