import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { env, adminAddresses } from "../config/env.js";
import { UnauthorizedError } from "../utils/errors.js";

export interface AuthenticatedRequest extends Request {
  adminAddress?: string;
}

export function requireAdmin(
  req: AuthenticatedRequest,
  _res: Response,
  next: NextFunction
) {
  const token = req.cookies?.admin_token;

  if (!token) {
    return next(new UnauthorizedError("Authentication required"));
  }

  try {
    const payload = jwt.verify(token, env.JWT_SECRET) as { address: string };

    if (!adminAddresses.includes(payload.address.toLowerCase())) {
      return next(new UnauthorizedError("Not an authorized admin"));
    }

    req.adminAddress = payload.address;
    next();
  } catch {
    next(new UnauthorizedError("Invalid or expired session"));
  }
}
