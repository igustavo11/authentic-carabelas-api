import Elysia from "elysia";
import { authRoutes } from "./routes/auth";

const app = new Elysia()
.get("/", () => "Hello World")
.get("/user/:id", ({ params }) => `User ID: ${params.id}`)
.get("/login", ({body}) => {
    return {message: "Login Successful", body}
})
.use(authRoutes)
.listen(3335);

console.log("Server running at http://localhost:3335");