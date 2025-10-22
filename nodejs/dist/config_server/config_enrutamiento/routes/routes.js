"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const apiController_1 = __importDefault(require("../controllers/apiController"));
const authMiddleware_1 = require("../../authMiddleware");
const favoritosController_1 = __importDefault(require("../controllers/favoritosController"));
const listasController_1 = __importDefault(require("../controllers/listasController"));
const seguimientoController_1 = __importDefault(require("../controllers/seguimientoController"));
const perfilController_1 = __importDefault(require("../controllers/perfilController"));
const opinionesController_1 = __importDefault(require("../controllers/opinionesController"));
const router = (0, express_1.Router)();
//Rutas para buscar y obtener series
router.get("/obtenerSeries", apiController_1.default.obtenerSeries);
router.get("/serie/:id", apiController_1.default.obtenerSeriePorID);
router.get('/serie/:id/temporada/:seasonNumber', apiController_1.default.obtenerTemporada);
//Rutas para favoritos
router.post("/favoritas/:serieId", authMiddleware_1.authMiddleware, favoritosController_1.default.agregarFavorito);
router.get("/favoritas", authMiddleware_1.authMiddleware, favoritosController_1.default.obtenerFavoritos);
//Rutas para listas
router.use("/listas", authMiddleware_1.authMiddleware); // Aplica el middleware de autenticación a todas las rutas de listas
router.post("/listas", listasController_1.default.crearLista);
router.get("/listas", listasController_1.default.obtenerListas);
router.post("/listas/:id/agregar", listasController_1.default.agregarSerieALista);
router.post("/listas/:id/eliminar", listasController_1.default.eliminarSerieDeLista); // Cambiado a POST para enviar el idSerie en el body
router.get("/listas/:id", listasController_1.default.obtenerListaPorId);
router.delete("/listas/:id", listasController_1.default.eliminarLista);
router.get('/listas/conEstado/:idSerie', listasController_1.default.obtenerListasConEstado);
//Rutas para componente descubrir series
router.get('/series/descubrir', apiController_1.default.descubrirSeries);
router.get('/series/generos', apiController_1.default.obtenerGeneros);
router.get('/series/proveedores', apiController_1.default.obtenerProveedores);
// Rutas para seguimiento de series
router.post("/seguimiento", authMiddleware_1.authMiddleware, seguimientoController_1.default.agregarSeguimiento);
router.get("/seguimiento", authMiddleware_1.authMiddleware, seguimientoController_1.default.obtenerSeguimientos);
router.patch("/seguimiento/:idSerieTMDB", authMiddleware_1.authMiddleware, seguimientoController_1.default.actualizarSeguimiento);
router.delete("/seguimiento/:idSerieTMDB", authMiddleware_1.authMiddleware, seguimientoController_1.default.eliminarSeguimiento);
// Ruta para obtener el perfil del usuario y las series favoritas del perfil
router.get("/perfil/:userId/favoritas", authMiddleware_1.authMiddleware, perfilController_1.default.obtenerFavoritas);
router.put("/perfil/:userId/favoritas", authMiddleware_1.authMiddleware, perfilController_1.default.actualizarFavoritas);
router.get('/perfil/:id/listas-publicas', perfilController_1.default.obtenerListasPublicas);
router.put('/perfil/:id/listas-publicas', perfilController_1.default.actualizarListasPublicas);
//Rutas para las reseñas de las series
router.get("/series/:idSerie/opiniones", authMiddleware_1.authMiddleware, opinionesController_1.default.obtenerOpinionesSerie);
router.post("/series/:idSerie/opiniones", authMiddleware_1.authMiddleware, opinionesController_1.default.crearOpinion);
router.post("/opiniones/:idOpinion/meGusta", authMiddleware_1.authMiddleware, opinionesController_1.default.meGustaOpinion);
router.get("/opiniones/:idUsuario", authMiddleware_1.authMiddleware, opinionesController_1.default.obtenerOpinionesUsuario);
exports.default = router;
