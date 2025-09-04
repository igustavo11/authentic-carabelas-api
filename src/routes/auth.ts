import { Elysia } from "elysia";
import { authPlugin } from "../utils/auth";
import { AuthController } from "../controllers/auth.controller";
import { registerSchema, loginSchema, profileSchema } from "../schemas/auth.schemas";

export const authRoutes = (app: Elysia) => 
    app
    .use(authPlugin)
    .post("/register", 
        ({ body, set }) => AuthController.register(body, set), 
        {
            ...registerSchema,
            detail: {
                tags: ["Auth"],
                summary: "Register user",
                description: "Create a new user account"
            }
        }
    )
    .post("/admin/login", 
        ({ body, jwt, set }) => AuthController.login(body, jwt, set), 
        {
            ...loginSchema,
            detail: {
                tags: ["Auth"],
                summary: "Admin login",
                description: "Authenticate admin user and receive JWT token"
            }
        }
    )
    .get("/admin/profile", 
        ({ jwt, headers, set }) => AuthController.profile(jwt, headers, set), 
        {
            ...profileSchema,
            detail: {
                tags: ["Auth"],
                summary: "Get admin profile",
                description: "Get authenticated admin user profile data"
            }
        }
    );