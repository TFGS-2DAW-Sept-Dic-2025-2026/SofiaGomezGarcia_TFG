import { Request, Response } from "express";
import User, { IUser } from "../../../modelos/modelos_mongoose_orm/usuario";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import usuario from "../../../modelos/modelos_mongoose_orm/usuario";


//Controlador para JWT el token y la verificacion en general de los usuarios en el registro y login


export const register = async (req: Request, res: Response): Promise<void> => {

  try {
    const { username, email, password } = req.body;
    console.log('Datos recibidos:', req.body);

    // Verificar si ya existe
    const userExists = await User.findOne({ email });
    if (userExists) {
      res.status(400).json({ msg: "El email ya está registrado" });
      return;
    }

    // Hashear contraseña
    const hashedPassword = await bcrypt.hash(password, 10);

    // Crear usuario
    const newUser: IUser = new usuario({
      username,
      email,
      passwordHash: hashedPassword
    });

    

    // Crear token JWT
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
    // Guardar usuario en DB
    await newUser.save();

    // Devolver token y datos de usuario
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

    // Se busca el usuario
    const user = await usuario.findOne({ email });
    if (!user) {
      res.status(400).json({ msg: "Usuario no encontrado" });
      return;
    }

    // Para validar la contra
    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      res.status(400).json({ msg: "Contraseña incorrecta" });
      return;
    }

    // token de sesion
    const token = jwt.sign(
      { id: user._id, username: user.username },
      process.env.JWT_SECRET as string,
      { expiresIn: "1d" }
    );

    // Crear refresh token
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
      usuario: { id: user._id, username: user.username, email: user.email }
    });
  } catch (err: any) {
    res.status(500).json({ msg: "Error en el servidor", error: err.message });
  }
};