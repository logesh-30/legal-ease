import { Response } from "express";
import { SignJWT } from "jose";

export type JwtPayload = {
  id: string;
  role: "user" | "admin";
};

export const createToken = async (payload: JwtPayload, secret: string) => {
  const secretKey = new TextEncoder().encode(secret);
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(secretKey);
};

export const setAuthCookie = (res: Response, token: string) => {
  res.cookie("token", token, {
    httpOnly: true,
    sameSite: "lax",
    secure: false,
    maxAge: 7 * 24 * 60 * 60 * 1000
  });
};
