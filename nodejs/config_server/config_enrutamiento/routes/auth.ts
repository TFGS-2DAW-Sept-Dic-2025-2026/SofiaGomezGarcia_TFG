import { Router } from "express";
import { register, login, subirFotoPerfil, upload } from "../controllers/authController";

const router = Router();

router.post("/register", register);
router.post("/login", login);
router.post("/foto", upload.single("foto"), subirFotoPerfil);

export default router;