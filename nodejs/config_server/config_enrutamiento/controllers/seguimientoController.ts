import { Request, Response } from "express";
import seguimientoSerie from "../../../modelos/modelos_mongoose_orm/seguimientoSerie";

export default {
  agregarSeguimiento: async (req: Request, res: Response) => {
    try {
      const idUsuario = (req as any).user?.id;
      const { idSerieTMDB, titulo, poster_path, totalTemporadas } = req.body;

      const existente = await seguimientoSerie.findOne({ idUsuario, idSerieTMDB });
      if (existente) return res.status(400).json({ error: "Ya sigues esta serie" });

      const nuevo = new seguimientoSerie({
        idUsuario,
        idSerieTMDB,
        titulo,
        poster_path,
        totalTemporadas,
      });

      await nuevo.save();
      res.status(201).json(nuevo);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Error al agregar seguimiento" });
    }
  },
  obtenerSeguimientos: async (req: Request, res: Response) => {
    try {
      const idUsuario = (req as any).user?.id;
      const seguimientos = await seguimientoSerie.find({ idUsuario }).sort({ fechaActualizacion: -1 });
      res.json(seguimientos);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Error al obtener seguimientos" });
    }
  },
  actualizarSeguimiento: async (req: Request, res: Response) => {
    try {
      const idUsuario = (req as any).user?.id;
      const { idSerieTMDB } = req.params;
      const { capitulosVistos, ultimoCapitulo, estado } = req.body;

      const seguimiento = await seguimientoSerie.findOneAndUpdate(
        { idUsuario, idSerieTMDB },
        {
          $set: {
            capitulosVistos,
            ultimoCapitulo,
            estado,
            fechaActualizacion: new Date(),
          },
        },
        { new: true }
      );

      if (!seguimiento) return res.status(404).json({ error: "Seguimiento no encontrado" });
      res.json(seguimiento);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Error al actualizar seguimiento" });
    }
  },
  eliminarSeguimiento: async (req: Request, res: Response) => {
    try {
      const idUsuario = (req as any).user?.id;
      const { idSerieTMDB } = req.params;

      const eliminado = await seguimientoSerie.findOneAndDelete({ idUsuario, idSerieTMDB });
      if (!eliminado) return res.status(404).json({ error: "Seguimiento no encontrado" });

      res.json({ mensaje: "Seguimiento eliminado correctamente" });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Error al eliminar seguimiento" });
    }
  }

}

