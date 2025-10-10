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
exports.subirFotoPerfil = exports.login = exports.register = exports.upload = void 0;
const usuario_1 = __importDefault(require("../../../modelos/modelos_mongoose_orm/usuario"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const usuario_2 = __importDefault(require("../../../modelos/modelos_mongoose_orm/usuario"));
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
//Controlador para JWT el token y la verificacion en general de los usuarios en el registro y login
// ===============================
// CONFIGURACIÓN DE MULTER
// ===============================
// Configuración del almacenamiento de archivos
const storage = multer_1.default.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = path_1.default.join(process.cwd(), "uploads");
        if (!fs_1.default.existsSync(uploadDir)) {
            fs_1.default.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
        cb(null, uniqueSuffix + path_1.default.extname(file.originalname));
    }
});
// Filtro para restringir tipos de archivo
const fileFilter = (req, file, cb) => {
    const allowedTypes = ["image/jpeg", "image/png", "image/jpg", "image/webp"];
    if (!allowedTypes.includes(file.mimetype)) {
        cb(new Error("Solo se permiten imágenes JPG, PNG o WEBP"));
    }
    else {
        cb(null, true);
    }
};
// Export del middleware de subida configurado
exports.upload = (0, multer_1.default)({
    storage,
    fileFilter
});
const register = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { username, email, password } = req.body;
        console.log('Datos recibidos:', req.body);
        // Verificar si ya existe
        const userExists = yield usuario_1.default.findOne({ email });
        if (userExists) {
            res.status(400).json({ msg: "El email ya está registrado" });
            return;
        }
        // Hashear contraseña
        const hashedPassword = yield bcrypt_1.default.hash(password, 10);
        // Crear usuario
        const newUser = new usuario_2.default({
            username,
            email,
            passwordHash: hashedPassword
        });
        // Crear token JWT
        const token = jsonwebtoken_1.default.sign({ id: newUser._id, username: newUser.username }, process.env.JWT_SECRET, { expiresIn: "1d" });
        const refreshToken = jsonwebtoken_1.default.sign({ id: newUser._id }, process.env.REFRESH_SECRET, { expiresIn: "7d" });
        newUser.refreshToken = refreshToken;
        // Guardar usuario en DB
        yield newUser.save();
        // Devolver token y datos de usuario
        res.status(201).json({
            msg: "Usuario registrado correctamente",
            token,
            refreshToken,
            user: { id: newUser._id, username: newUser.username, email: newUser.email }
        });
    }
    catch (err) {
        console.error('Error en register:', err);
        res.status(500).json({ msg: "Error en el servidor", error: err.message });
    }
});
exports.register = register;
const login = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, password } = req.body;
        console.log('Datos recibidos:', req.body);
        // Se busca el usuario
        const user = yield usuario_2.default.findOne({ email });
        if (!user) {
            res.status(400).json({ msg: "Usuario no encontrado" });
            return;
        }
        // Para validar la contra
        const isMatch = yield bcrypt_1.default.compare(password, user.passwordHash);
        if (!isMatch) {
            res.status(400).json({ msg: "Contraseña incorrecta" });
            return;
        }
        // token de sesion
        const token = jsonwebtoken_1.default.sign({ id: user._id, username: user.username }, process.env.JWT_SECRET, { expiresIn: "1d" });
        // Crear refresh token
        const refreshToken = jsonwebtoken_1.default.sign({ id: user._id }, process.env.REFRESH_SECRET, { expiresIn: "7d" });
        user.refreshToken = refreshToken;
        yield user.save();
        res.json({
            msg: "Login exitoso",
            token,
            refreshToken,
            usuario: { id: user._id, username: user.username, email: user.email, fotoPerfil: user.fotoPerfil }
        });
    }
    catch (err) {
        res.status(500).json({ msg: "Error en el servidor", error: err.message });
    }
});
exports.login = login;
const subirFotoPerfil = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // multer agrega el archivo a req.file
        if (!req.file) {
            res.status(400).json({ msg: "No se subió ningún archivo" });
            return;
        }
        const userId = req.body.userId; // enviado desde Angular
        if (!userId) {
            res.status(400).json({ msg: "Falta el ID del usuario" });
            return;
        }
        // Construimos la URL pública
        const imageUrl = `http://localhost:5000/uploads/${req.file.filename}`;
        // Actualizamos al usuario
        const user = yield usuario_1.default.findByIdAndUpdate(userId, { fotoPerfil: imageUrl }, { new: true });
        if (!user) {
            res.status(404).json({ msg: "Usuario no encontrado" });
            return;
        }
        res.status(200).json({
            msg: "Foto de perfil actualizada correctamente",
            url: imageUrl,
            usuario: user
        });
    }
    catch (err) {
        console.error("Error al subir la foto:", err);
        res.status(500).json({ msg: "Error en el servidor", error: err.message });
    }
});
exports.subirFotoPerfil = subirFotoPerfil;
