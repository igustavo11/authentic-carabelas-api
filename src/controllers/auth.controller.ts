import { prisma } from "../db/prisma";
import { authService } from "../utils/auth";

export class AuthController {
    static async register(body: any, set: any) {
        try {
            // Verificar se email já existe usando operação raw
            const existingUser = await prisma.$runCommandRaw({
                find: "User",
                filter: { email: body.email },
                limit: 1
            });

            if ((existingUser as any).cursor?.firstBatch?.length > 0) {
                set.status = 400;
                return { message: "Email already exists" };
            }

            // Criar usuário usando operação raw do MongoDB (sem transações)
            const insertResult = await prisma.$runCommandRaw({
                insert: "User",
                documents: [{
                    email: body.email,
                    password: body.password,
                    role: body.role || "admin"
                }]
            });

            if (!insertResult.ok || insertResult.n === 0) {
                set.status = 500;
                return { message: "Failed to create user" };
            }

            // Buscar o usuário criado usando operação raw
            const userResult = await prisma.$runCommandRaw({
                find: "User",
                filter: { email: body.email },
                limit: 1
            });

            if (!(userResult as any).cursor?.firstBatch?.length) {
                set.status = 500;
                return { message: "Failed to retrieve created user" };
            }

            const user = (userResult as any).cursor.firstBatch[0];

            // Converter ObjectId para string de forma mais robusta
            let userId: string;
            if (typeof user._id === 'string') {
                userId = user._id;
            } else if (user._id && user._id.$oid) {
                userId = user._id.$oid;
            } else if (user._id && typeof user._id.toString === 'function') {
                userId = user._id.toString();
            } else {
                userId = String(user._id);
            }

            set.status = 201;
            return {
                message: "User created successfully",
                user: {
                    id: userId,
                    email: user.email,
                    role: user.role
                }
            };
        } catch (error) {
            console.error("Erro ao criar usuário:", error);
            set.status = 500;
            return { 
                message: "Failed to create user",
                error: error instanceof Error ? error.message : "Unknown error"
            };
        }
    }

    static async login(body: any, jwt: any, set: any) {
        const result = await authService.login(body, jwt);
        
        if (!result.success) {
            set.status = result.message === "User not found" ? 404 : 401;
            return { message: result.message };
        }

        return {
            message: "Login successful",
            token: result.token,
            user: result.user
        };
    }

    static async profile(jwt: any, headers: any, set: any) {
        const user = await authService.verifyToken(headers.authorization, jwt);
        
        if (!user) {
            set.status = 401;
            return { message: "Invalid or expired token" };
        }

        return {
            message: "Profile data",
            user
        };
    }
}
