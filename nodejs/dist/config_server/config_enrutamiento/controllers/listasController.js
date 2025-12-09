"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const usuario_1 = __importDefault(require("../../../modelos/modelos_mongoose_orm/usuario"));
const lista_1 = require("../../../modelos/modelos_mongoose_orm/lista");
exports.default = {
    crearLista: (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        var _a;
        try {
            const { nombre, descripcion } = req.body;
            const usuarioCreador = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
            if (!usuarioCreador) {
                return res.status(401).json({ msg: 'Usuario no autenticado' });
            }
            if (!nombre) {
                return res.status(400).json({ msg: 'El nombre de la lista es obligatorio' });
            }
            const nuevaLista = new lista_1.Lista({
                nombre,
                descripcion,
                usuarioCreador,
                series: [],
                publica: false
            });
            yield nuevaLista.save();
            yield usuario_1.default.findByIdAndUpdate(usuarioCreador, {
                $push: { listas: nuevaLista._id },
            });
            res.status(201).json(nuevaLista);
        }
        catch (error) {
            console.log("Error al crear la lista: ", error);
            res.status(500).json({ msg: 'Error al crear la listaa' });
        }
    }),
    obtenerListas: (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        var _a;
        try {
            const usuarioCreador = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
            if (!usuarioCreador) {
                return res.status(401).json({ msg: 'Usuario no autenticado' });
            }
            // El sort ordena por orden de creacion, en este caso de mas reciente a mas antiguo
            const listas = yield lista_1.Lista.find({ usuarioCreador }).sort({ createdAt: -1 });
            res.status(200).json(listas);
        }
        catch (error) {
            console.log("Error al obtener las listas: ", error);
            res.status(500).json({ msg: 'Error al obtener las listas' });
        }
    }),
    agregarSerieALista: (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        var _a;
        try {
            const { id } = req.params;
            const { idSerie } = req.body;
            const usuarioCreador = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
            if (!usuarioCreador) {
                return res.status(401).json({ msg: 'Usuario no autenticado' });
            }
            if (!idSerie) {
                return res.status(400).json({ msg: 'El ID de la serie es obligatorio' });
            }
            const lista = yield lista_1.Lista.findOne({ _id: id, usuarioCreador });
            if (!lista) {
                return res.status(404).json({ msg: 'Lista no encontrada' });
            }
            if (lista.series.includes(idSerie)) {
                return res.status(400).json({ msg: 'La serie ya está en la lista' });
            }
            lista.series.push(idSerie);
            yield lista.save();
            res.status(200).json(lista);
        }
        catch (error) {
            console.log("Error al agregar la serie a la lista: ", error);
            res.status(500).json({ msg: 'Error al agregar la serie a la lista' });
        }
    }),
    eliminarSerieDeLista: (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        var _a;
        try {
            const { id } = req.params;
            const { idSerie } = req.body;
            const usuarioCreador = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
            if (!usuarioCreador) {
                return res.status(401).json({ msg: 'Usuario no autenticado' });
            }
            if (!idSerie) {
                return res.status(400).json({ msg: 'El ID de la serie es obligatorio' });
            }
            const lista = yield lista_1.Lista.findOne({ _id: id, usuarioCreador });
            if (!lista) {
                return res.status(404).json({ msg: 'Lista no encontrada' });
            }
            const index = lista.series.indexOf(idSerie);
            if (index === -1) {
                return res.status(400).json({ msg: 'La serie no está en la lista' });
            }
            lista.series.splice(index, 1);
            yield lista.save();
            res.status(200).json(lista);
        }
        catch (error) {
            console.log("Error al eliminar la serie de la lista: ", error);
            res.status(500).json({ msg: 'Error al eliminar la serie de la lista' });
        }
    }),
    eliminarLista: (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        var _a;
        try {
            const { id } = req.params;
            const usuarioCreador = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
            if (!usuarioCreador) {
                return res.status(401).json({ msg: 'Usuario no autenticado' });
            }
            const lista = yield lista_1.Lista.findOneAndDelete({ _id: id, usuarioCreador });
            if (!lista) {
                return res.status(404).json({ msg: 'Lista no encontrada' });
            }
            yield usuario_1.default.findByIdAndUpdate(usuarioCreador, {
                $pull: { listas: id },
            });
            res.status(200).json({ msg: 'Lista eliminada correctamente' });
        }
        catch (error) {
            console.log("Error al eliminar la lista: ", error);
            res.status(500).json({ msg: 'Error al eliminar la lista' });
        }
    }),
    obtenerListaPorId: (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        var _a;
        try {
            const { id } = req.params;
            const usuarioCreador = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
            if (!usuarioCreador) {
                return res.status(401).json({ msg: 'Usuario no autenticado' });
            }
            const lista = yield lista_1.Lista.findOne({ _id: id, usuarioCreador });
            if (!lista) {
                return res.status(404).json({ msg: 'Lista no encontrada' });
            }
            res.status(200).json(lista);
        }
        catch (error) {
            console.log("Error al obtener la lista: ", error);
            res.status(500).json({ msg: 'Error al obtener la lista' });
        }
    }),
    obtenerListasConEstado: (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        var _a;
        try {
            const usuarioCreador = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
            const { idSerie } = req.params;
            if (!usuarioCreador)
                return res.status(401).json({ msg: 'Usuario no autenticado' });
            if (!idSerie)
                return res.status(400).json({ msg: 'ID de la serie es obligatorio' });
            const listas = yield lista_1.Lista.find({ usuarioCreador }).sort({ createdAt: -1 });
            //Metodo para saber si la lista contiene esa serie o no para el modal de agregar serie a la lista
            const listasConEstado = listas.map(lista => ({
                _id: lista._id,
                nombre: lista.nombre,
                descripcion: lista.descripcion,
                series: lista.series,
                contieneSerie: lista.series.includes(idSerie),
                fechaCreacion: lista.fechaCreacion
            }));
            res.status(200).json(listasConEstado);
        }
        catch (error) {
            console.log("Error al obtener listas con estado:", error);
            res.status(500).json({ msg: 'Error al obtener listas con estado' });
        }
    }),
    obtenerListasPublicasPorUsername: (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const { username } = req.params;
            if (!username) {
                return res.status(400).json({ mensaje: 'Username es requerido' });
            }
            const Usuario = yield usuario_1.default.findOne({ username });
            if (!usuario_1.default) {
                return res.status(404).json({ mensaje: 'Usuario no encontrado' });
            }
            const listasPublicas = yield lista_1.Lista.find({
                _id: { $in: Usuario === null || Usuario === void 0 ? void 0 : Usuario.listasPublicas }
            }).populate('series');
            return res.json({ listasPublicas });
        }
        catch (error) {
            console.error('Error obteniendo listas públicas por username:', error);
            return res.status(500).json({ mensaje: 'Error interno del servidor' });
        }
    }),
    darLikeLista: (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        var _a;
        try {
            const idLista = req.params.id;
            const idUsuario = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
            if (!idUsuario) {
                return res.status(401).json({ msg: 'Usuario no autenticado' });
            }
            if (!idLista) {
                return res.status(400).json({ msg: 'ID de la lista es obligatorio' });
            }
            const lista = yield lista_1.Lista.findById(idLista);
            if (!lista) {
                return res.status(404).json({ msg: 'Lista no encontrada' });
            }
            // Inicializamos los campos si no existen
            if (!lista.usuariosQueDieronLike)
                lista.usuariosQueDieronLike = [];
            if (lista.likes === undefined)
                lista.likes = 0;
            const yaDioLike = lista.usuariosQueDieronLike.includes(idUsuario);
            if (yaDioLike) {
                lista.usuariosQueDieronLike = lista.usuariosQueDieronLike.filter(u => u.toString() !== idUsuario);
                lista.likes = Math.max(0, lista.likes - 1);
            }
            else {
                lista.usuariosQueDieronLike.push(idUsuario);
                lista.likes += 1;
            }
            yield lista.save();
            res.status(200).json({
                likes: lista.likes,
                dioLike: !yaDioLike
            });
        }
        catch (error) {
            console.log("Error al dar like a la lista:", error);
            res.status(500).json({ msg: 'Error al dar like a la lista', error });
        }
    }),
    obtenerListasPublicasPopulares: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const listas = yield lista_1.Lista.find({ publica: true })
                .populate('usuarioCreador', 'username fotoPerfil')
                .populate('series', '_id')
                .sort({ likes: -1 })
                .limit(50);
            const listasHome = listas.map(l => {
                var _a, _b;
                return ({
                    id: l._id,
                    nombre: l.nombre,
                    descripcion: l.descripcion,
                    likes: (_a = l.likes) !== null && _a !== void 0 ? _a : 0,
                    seriesCount: ((_b = l.series) === null || _b === void 0 ? void 0 : _b.length) || 0,
                    usuario: l.usuarioCreador
                        ? {
                            username: l.usuarioCreador.username,
                            fotoPerfil: l.usuarioCreador.fotoPerfil
                        }
                        : null
                });
            });
            res.status(200).json(listasHome);
        }
        catch (error) {
            console.error("Error al obtener listas públicas populares:", error);
            res.status(500).json({ msg: "Error al obtener listas públicas populares" });
        }
    })
};
