import { Router } from "express";
import apiController from "../controllers/apiController";
import { authMiddleware } from "../../authMiddleware";
import favoritosController from "../controllers/favoritosController";
import listasController from "../controllers/listasController";
import seguimientoController from "../controllers/seguimientoController";
import perfilController from "../controllers/perfilController";
import opinionesController from "../controllers/opinionesController";


const router = Router();

//Rutas para buscar y obtener series

router.get("/obtenerSeries", apiController.obtenerSeries);
router.get("/serie/:id", apiController.obtenerSeriePorID);
router.get('/serie/:id/temporada/:seasonNumber', apiController.obtenerTemporada);

//Rutas para favoritos

router.post("/favoritas/:serieId", authMiddleware, favoritosController.agregarFavorito);
router.get("/favoritas", authMiddleware, favoritosController.obtenerFavoritos);


//Rutas para listas

router.use("/listas", authMiddleware); // Aplica el middleware de autenticación a todas las rutas de listas
router.post("/listas", listasController.crearLista);
router.get("/listas", listasController.obtenerListas);
router.post("/listas/:id/agregar", listasController.agregarSerieALista);
router.post("/listas/:id/eliminar", listasController.eliminarSerieDeLista); // Cambiado a POST para enviar el idSerie en el body
router.get("/listas/:id", listasController.obtenerListaPorId);
router.delete("/listas/:id", listasController.eliminarLista);
router.get('/listas/conEstado/:idSerie', listasController.obtenerListasConEstado);


//Rutas para componente descubrir series

router.get('/series/descubrir', apiController.descubrirSeries);
router.get('/series/generos', apiController.obtenerGeneros);
router.get('/series/proveedores', apiController.obtenerProveedores);

// Rutas para seguimiento de series

router.post("/seguimiento", authMiddleware, seguimientoController.agregarSeguimiento);
router.get("/seguimiento", authMiddleware, seguimientoController.obtenerSeguimientos);
router.patch("/seguimiento/:idSerieTMDB", authMiddleware, seguimientoController.actualizarSeguimiento);
router.delete("/seguimiento/:idSerieTMDB", authMiddleware, seguimientoController.eliminarSeguimiento);

// Ruta para obtener el perfil del usuario y las series favoritas del perfil

router.get("/perfil/:userId/favoritas", authMiddleware, perfilController.obtenerFavoritas);
router.put("/perfil/:userId/favoritas", authMiddleware, perfilController.actualizarFavoritas);
router.get('/perfil/:id/listas-publicas', perfilController.obtenerListasPublicas);
router.put('/perfil/:id/listas-publicas', perfilController.actualizarListasPublicas);


//Rutas para las reseñas de las series
router.get("/series/:idSerie/opiniones", authMiddleware, opinionesController.obtenerOpinionesSerie);
router.post("/series/:idSerie/opiniones", authMiddleware, opinionesController.crearOpinion);
router.post("/opiniones/:idOpinion/meGusta", authMiddleware, opinionesController.meGustaOpinion);
router.get("/opiniones/:idUsuario", authMiddleware, opinionesController.obtenerOpinionesUsuario);


export default router;