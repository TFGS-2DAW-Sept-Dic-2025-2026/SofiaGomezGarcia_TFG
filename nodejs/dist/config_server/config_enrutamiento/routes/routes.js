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
const router = (0, express_1.Router)();
router.get("/obtenerSeries", apiController_1.default.obtenerSeries);
router.get("/serie/:id", apiController_1.default.obtenerSeriePorID);
router.post("/favoritas/:serieId", authMiddleware_1.authMiddleware, favoritosController_1.default.agregarFavorito);
router.get("/favoritas", authMiddleware_1.authMiddleware, favoritosController_1.default.obtenerFavoritos);
router.use("/listas", authMiddleware_1.authMiddleware); // Aplica el middleware de autenticación a todas las rutas de listas
router.post("/listas", listasController_1.default.crearLista);
router.get("/listas", listasController_1.default.obtenerListas);
router.post("/listas/:id/agregar", listasController_1.default.agregarSerieALista);
router.post("/listas/:id/eliminar", listasController_1.default.eliminarSerieDeLista); // Cambiado a POST para enviar el idSerie en el body
router.get("/listas/:id", listasController_1.default.obtenerListaPorId);
router.delete("/listas/:id", listasController_1.default.eliminarLista);
router.get('/series/descubrir', apiController_1.default.descubrirSeries);
router.get('/series/generos', apiController_1.default.obtenerGeneros);
router.get('/series/proveedores', apiController_1.default.obtenerProveedores);
exports.default = router;
