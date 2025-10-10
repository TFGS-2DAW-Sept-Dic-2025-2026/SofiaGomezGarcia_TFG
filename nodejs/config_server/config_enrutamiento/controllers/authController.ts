import { Request, Response } from "express";
import User, { IUser } from "../../../modelos/modelos_mongoose_orm/usuario";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import usuario from "../../../modelos/modelos_mongoose_orm/usuario";
import multer, { StorageEngine, FileFilterCallback } from "multer";
import path from "path";
import fs from "fs";


//Controlador para JWT el token y la verificacion en general de los usuarios en el registro y login

//multer es un middleware para manejar la subida de archivos en este caso para gestionar las imagenes de las fotos de perfil
//este guarda las imagenes en una carpeta llamada uploads
//y luego se guarda la url en la base de datos del usuario

// ===============================
// CONFIGURACIÓN DE MULTER
// ===============================

const storage: StorageEngine = multer.diskStorage({
  destination: (req: Request, file: Express.Multer.File, cb: (error: Error | null, destination: string) => void) => {
    const uploadDir = path.join(process.cwd(), "uploads");
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req: Request, file: Express.Multer.File, cb: (error: Error | null, filename: string) => void) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

// Filtro para restringir tipos de archivo y que solo se suban fotos
const fileFilter = (req: Request, file: Express.Multer.File, cb: FileFilterCallback): void => {
  const allowedTypes = ["image/jpeg", "image/png", "image/jpg", "image/webp"];
  if (!allowedTypes.includes(file.mimetype)) {
    cb(new Error("Solo se permiten imágenes JPG, PNG o WEBP"));
  } else {
    cb(null, true);
  }
};


export const upload = multer({
  storage,
  fileFilter
});

export const register = async (req: Request, res: Response): Promise<void> => {

  try {
    const { username, email, password } = req.body;
    console.log('Datos recibidos:', req.body);

    
    const userExists = await User.findOne({ email });
    if (userExists) {
      res.status(400).json({ msg: "El email ya está registrado" });
      return;
    }

    
    const hashedPassword = await bcrypt.hash(password, 10);

    
    const newUser: IUser = new usuario({
      username,
      email,
      passwordHash: hashedPassword
    });



    
    const token = jwt.sign(
      { id: newUser._id, username: newUser.username },
      process.env.JWT_SECRET as string,
      { expiresIn: "1d" }
    );

    const refreshToken = jwt.sign(
      { id: newUser._id },
      process.env.REFRESH_SECRET as string,
      { expiresIn: "7d" }
    );

    newUser.refreshToken = refreshToken;
    
    await newUser.save();

    
    res.status(201).json({
      msg: "Usuario registrado correctamente",
      token,
      refreshToken,
      user: { id: newUser._id, username: newUser.username, email: newUser.email }
    });

  } catch (err: any) {
    console.error('Error en register:', err);
    res.status(500).json({ msg: "Error en el servidor", error: err.message });
  }
}

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;
    console.log('Datos recibidos:', req.body);

    
    const user = await usuario.findOne({ email });
    if (!user) {
      res.status(400).json({ msg: "Usuario no encontrado" });
      return;
    }

    
    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      res.status(400).json({ msg: "Contraseña incorrecta" });
      return;
    }

    
    const token = jwt.sign(
      { id: user._id, username: user.username },
      process.env.JWT_SECRET as string,
      { expiresIn: "1d" }
    );

    
    const refreshToken = jwt.sign(
      { id: user._id },
      process.env.REFRESH_SECRET as string,
      { expiresIn: "7d" }
    );

    user.refreshToken = refreshToken;
    await user.save();


    res.json({
      msg: "Login exitoso",
      token,
      refreshToken,
      usuario: { id: user._id, username: user.username, email: user.email, fotoPerfil: user.fotoPerfil } 
    });
  } catch (err: any) {
    res.status(500).json({ msg: "Error en el servidor", error: err.message });
  }
};
export const subirFotoPerfil = async (req: Request, res: Response): Promise<void> => {
  try {
    
    //endpoint para subir la foto de perfil

    if (!req.file) {
      res.status(400).json({ msg: "No se subió ningún archivo" });
      return;
    }

    const userId = req.body.userId; 
    if (!userId) {
      res.status(400).json({ msg: "Falta el ID del usuario" });
      return;
    }

    
    const imageUrl = `http://localhost:5000/uploads/${req.file.filename}`;

   
    const user = await User.findByIdAndUpdate(
      userId,
      { fotoPerfil: imageUrl },
      { new: true }
    );

    if (!user) {
      res.status(404).json({ msg: "Usuario no encontrado" });
      return;
    }

    res.status(200).json({
      msg: "Foto de perfil actualizada correctamente",
      url: imageUrl,
      usuario: user
    });
  } catch (err: any) {
    console.error("Error al subir la foto:", err);
    res.status(500).json({ msg: "Error en el servidor", error: err.message });
  }
};