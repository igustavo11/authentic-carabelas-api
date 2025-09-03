import {Elysia, t} from "elysia";
import {authPlugin, authService} from "../utils/auth";

export const authRoutes = (app: Elysia) => 
    app
    .use(authPlugin)
    .post("/admin/login", async ({ body, jwt, set }) => {
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
    }, {
        body: t.Object({
            email: t.String(),
            password: t.String(),
        })
    })
    .get("/admin/profile", async ({ jwt, headers, set }) => {
        const user = await authService.verifyToken(headers.authorization, jwt);
        
        if (!user) {
            set.status = 401;
            return { message: "Invalid or expired token" };
        }

        return {
            message: "Profile data",
            user
        };
    })