import express, { Request, Response } from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
//E:\Proyecto TFG\showmeshows\nodejs\config_server\config_enrutamiento\routes\auth.ts
import authRoutes from "./config_server/config_enrutamiento/routes/auth";
import { authMiddleware } from "./config_server/authMiddleware";
import router from "./config_server/config_enrutamiento/routes/routes";
import path from "path";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Rutas para la verificacion en el registro
app.use("/auth", authRoutes);
app.use("/", router);
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

app.get("/profile", authMiddleware, (req, res) => {
  res.json({ msg: "Perfil de usuario", user: (req as any).user });
});


// Ruta de prueba
app.get("/", (req: Request, res: Response) => {
  res.send("Aplicacion ShowMeShows Servidor FUNCIONANDO!!!");
});

// Conexión con MongoDB
mongoose
  .connect(process.env.MONGO_URI as string)
  .then(() => console.log("MongoDB conectado"))
  .catch((err) => console.error(err));

// Servidor
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Servidor en http://localhost:${PORT}`));