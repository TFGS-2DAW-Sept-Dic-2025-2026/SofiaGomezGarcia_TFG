import { Router } from "express";
import apiController from "../controllers/apiController";
import { authMiddleware } from "../../authMiddleware";
import favoritosController from "../controllers/favoritosController";
import listasController from "../controllers/listasController";

const router = Router();

router.get("/obtenerSeries", apiController.obtenerSeries);
router.get("/serie/:id", apiController.obtenerSeriePorID);
router.post("/favoritas/:serieId", authMiddleware, favoritosController.agregarFavorito);
router.get("/favoritas", authMiddleware, favoritosController.obtenerFavoritos);

router.use("/listas", authMiddleware); // Aplica el middleware de autenticación a todas las rutas de listas
router.post("/listas", listasController.crearLista);
router.get("/listas", listasController.obtenerListas);
router.post("/listas/:id/agregar", listasController.agregarSerieALista);
router.post("/listas/:id/eliminar", listasController.eliminarSerieDeLista); // Cambiado a POST para enviar el idSerie en el body
router.get("/listas/:id", listasController.obtenerListaPorId);
router.delete("/listas/:id", listasController.eliminarLista);


export default router;