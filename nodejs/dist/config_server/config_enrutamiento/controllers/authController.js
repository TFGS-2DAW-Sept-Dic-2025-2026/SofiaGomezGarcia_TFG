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
exports.login = exports.register = void 0;
const usuario_1 = __importDefault(require("../../../modelos/modelos_mongoose_orm/usuario"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const usuario_2 = __importDefault(require("../../../modelos/modelos_mongoose_orm/usuario"));
//Controlador para JWT el token y la verificacion en general de los usuarios en el registro y login
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
            usuario: { id: user._id, username: user.username, email: user.email }
        });
    }
    catch (err) {
        res.status(500).json({ msg: "Error en el servidor", error: err.message });
    }
});
exports.login = login;
