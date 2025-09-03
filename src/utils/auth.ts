import Elysia from "elysia";
import { jwt } from "@elysiajs/jwt";
import { prisma } from "../db/prisma";

export interface JWTPayload {
    id: string;
    email: string;
    role: string;
  }
  
export interface LoginData {
    email: string;
    password: string;
  }

export const authPlugin = new Elysia()
  .use(
    jwt({
      name: 'jwt',
      secret: process.env.JWT_SECRET || 'key',
      exp: '7d'
    })
  );

export const authService = {
  async login(data: LoginData, jwt: any) {
    const user = await prisma.user.findUnique({
      where: {
        email: data.email
      }
    });
    
    if (!user) {
      return { success: false, message: "User not found" };
    }


    if (user.password !== data.password) {
      return { success: false, message: "Invalid credentials" };
    }

    const token = await jwt.sign({
      id: user.id,
      email: user.email,
      role: user.role
    });

    return {
      success: true,
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role
      }
    };
  },

  async verifyToken(authHeader: string | undefined, jwt: any): Promise<JWTPayload | null> {
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null;
    }

    const token = authHeader.replace('Bearer ', '');
    const payload = await jwt.verify(token) as JWTPayload | false;
    
    return payload || null;
  }
};