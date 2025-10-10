"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const mongoose_1 = __importDefault(require("mongoose"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
//E:\Proyecto TFG\showmeshows\nodejs\config_server\config_enrutamiento\routes\auth.ts
const auth_1 = __importDefault(require("./config_server/config_enrutamiento/routes/auth"));
const authMiddleware_1 = require("./config_server/authMiddleware");
const routes_1 = __importDefault(require("./config_server/config_enrutamiento/routes/routes"));
dotenv_1.default.config();
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.use(express_1.default.json());
// Rutas para la verificacion en el registro
app.use("/auth", auth_1.default);
app.use("/", routes_1.default);
app.get("/profile", authMiddleware_1.authMiddleware, (req, res) => {
    res.json({ msg: "Perfil de usuario", user: req.user });
});
// Ruta de prueba
app.get("/", (req, res) => {
    res.send("Aplicacion ShowMeShows Servidor FUNCIONANDO!!!");
});
// Conexión con MongoDB
mongoose_1.default
    .connect(process.env.MONGO_URI)
    .then(() => console.log("MongoDB conectado"))
    .catch((err) => console.error(err));
// Servidor
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Servidor en http://localhost:${PORT}`));
