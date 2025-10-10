import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export interface AuthRequest extends Request {
  user?: any;
}

export const authMiddleware = (req: AuthRequest, res: Response, next: NextFunction) => {
  const token = req.headers["authorization"]?.split(" ")[1];
  if (!token) return res.status(401).json({ msg: "Acceso denegado" });

  try {
    const verified = jwt.verify(token, process.env.JWT_SECRET as string);
    req.user = verified;
    next();
  } catch (err) {
    res.status(403).json({ msg: "Token inválido o expirado" });
  }
};