import Elysia from "elysia";
import { swaggerConfig } from "./config/swagger";
import { authRoutes } from "./routes/auth";
import { productsRoutes } from "./routes/products";
import { uploadRoutes } from "./routes/upload";

const app = new Elysia()
.use(swaggerConfig)
.get("/", () => "Hello World")
.get("/user/:id", ({ params }) => `User ID: ${params.id}`)
.get("/login", ({body}) => {
    return {message: "Login Successful", body}
})
.use(authRoutes)
.use(productsRoutes)
.use(uploadRoutes)
.listen(3335);

console.log("Server running at http://localhost:3335");
console.log("Docs running at http://localhost:3335/docs");