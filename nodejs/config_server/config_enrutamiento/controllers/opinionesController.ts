import { Request, Response, NextFunction } from "express";
import mongoose, { mongo } from "mongoose";
import usuario from "../../../modelos/modelos_mongoose_orm/usuario";
import { Opinion } from "../../../modelos/modelos_mongoose_orm/opinion";
import dotenv from 'dotenv';


dotenv.config();


const BASE_URL = "https://api.themoviedb.org/3";
const API_KEY = process.env.TMDB_API_KEY;

export default {
  obtenerOpinionesSerie: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { idSerie } = req.params;
      if (!idSerie) return res.status(400).json({ msg: "ID de la serie es obligatorio" });

      const opiniones = await Opinion.find({ idSerie: idSerie })
        .populate("idUsuario", "username") // Para obtener los datos concretos de los usuarios, en este caso para obtener el nombre de usuario
        .sort({ fecha: -1 });

      res.status(200).json(opiniones);

    } catch (error) {
      console.log("Error al obtener opiniones de la serie:", error);
      res.status(500).json({ msg: "Error al obtener opiniones de la serie" });
    }
  },

  crearOpinion: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { idSerie } = req.params;
      const { estrellas, opinion } = req.body;
      const idUsuario = (req as any).user?.id;

      if (!idUsuario) return res.status(401).json({ msg: "Usuario no autenticado" });
      if (!idSerie) return res.status(400).json({ msg: "ID de la serie es obligatorio" });
      if (!estrellas || estrellas < 1 || estrellas > 5)
        return res.status(400).json({ msg: "Las estrellas deben ser un número entre 1 y 5" });

      const nuevaOpinion = new Opinion({
        idUsuario: idUsuario,
        idSerie,
        estrellas,
        opinion,
        fecha: new Date(),
        meGusta: 0
      });

      await nuevaOpinion.save();

      res.status(201).json(nuevaOpinion);

    } catch (error) {
      console.log("Error al crear la opinión:", error);
      res.status(500).json({ msg: "Error al crear la opinión" });
    }
  },

  meGustaOpinion: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { idOpinion } = req.params;
      const idUsuario = (req as any).user?.id;

      if (!idUsuario) return res.status(401).json({ msg: "Usuario no autenticado" });
      if (!idOpinion) return res.status(400).json({ msg: "ID de la opinión es obligatorio" });

      const opinion = await Opinion.findById(idOpinion);
      if (!opinion) return res.status(404).json({ msg: "Opinión no encontrada" });

      const index = opinion.usuariosMeGusta.findIndex(u => u.toString() === idUsuario);

      if (index === -1) {
        opinion.meGusta += 1;
        opinion.usuariosMeGusta.push(idUsuario);
      } else {
        opinion.meGusta -= 1;
        opinion.usuariosMeGusta.splice(index, 1);
      }

      await opinion.save();

      res.status(200).json(opinion);

    } catch (error) {
      console.log("Error al dar me gusta a la opinión:", error);
      res.status(500).json({ msg: "Error al dar me gusta a la opinión" });
    }
  },
  obtenerOpinionesUsuario: async (req: Request, res: Response) => {
    try {
      const { idUsuario } = req.params;

      if (!idUsuario) {
        return res.status(400).json({ msg: "ID de usuario es obligatorio" });
      }

      const opiniones = await Opinion.find({ idUsuario })
        .populate("idUsuario", "username")
        .sort({ fecha: -1 });

      res.status(200).json(opiniones);
    } catch (error) {
      console.error("Error al obtener opiniones del usuario:", error);
      res.status(500).json({ msg: "Error al obtener opiniones del usuario" });
    }
  },
  obtenerOpinionesRecientes: async (req: Request, res: Response) => {
    try {
      const opiniones = await Opinion.find()
        .populate("idUsuario", "username fotoPerfil")
        .sort({ fecha: -1 })
        .limit(3);

      const opinionesConNombre = [];

      for (const op of opiniones) {
        const resp = await fetch(
          `https://api.themoviedb.org/3/tv/${op.idSerie}?api_key=${API_KEY}&language=es-ES`
        );

        const data = await resp.json();

        opinionesConNombre.push({
          ...op.toObject(),
          nombreSerie: data.name || data.original_name || "[Sin nombre]"
        });
      }

      res.status(200).json(opinionesConNombre);

    } catch (error) {
      console.error("Error al obtener opiniones recientes:", error);
      res.status(500).json({ msg: "Error al obtener opiniones recientes" });
    }
  },
 obtenerUsuariosMasOpiniones: async (req: Request, res: Response) => {
  try {
    const topUsuarios = await Opinion.aggregate([
      {
        $group: {
          _id: "$idUsuario",
          totalOpiniones: { $sum: 1 }
        }
      },
      { $sort: { totalOpiniones: -1 } },
      { $limit: 3 },
      {
        $lookup: {
          from: "usuarios",          
          localField: "_id",
          foreignField: "_id",
          as: "usuario"
        }
      },
      {
        $addFields: {
          usuario: { $arrayElemAt: ["$usuario", 0] }  
        }
      },
      {
        $project: {
          idUsuario: "$usuario._id",
          username: "$usuario.username",
          fotoPerfil: "$usuario.fotoPerfil",
          totalOpiniones: 1
        }
      }
    ]);

    res.status(200).json(topUsuarios);
  } catch (error) {
    console.error("Error al obtener usuarios con más opiniones:", error);
    res.status(500).json({ msg: "Error al obtener usuarios con más opiniones" });
  }
}


}
