import Elysia from "elysia";
import { cors } from "@elysiajs/cors";
import { swaggerConfig } from "./config/swagger";
import { authRoutes } from "./routes/auth";
import { productsRoutes } from "./routes/products";
import { uploadRoutes } from "./routes/upload";
import { ordersRoutes } from "./routes/oders";

// Configuração de porta
const port = process.env.PORT || 3335;
const isDev = process.env.NODE_ENV !== 'production';

// Configuração CORS - URLs permitidas
const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || [];

const app = new Elysia()
.use(cors({
  origin: allowedOrigins,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true
}))
.use(swaggerConfig)
.get("/", () => ({ 
  message: "E-commerce API", 
  version: "1.0.0",
  environment: process.env.NODE_ENV || 'development'
}))
.get("/health", () => ({ 
  status: "ok", 
  timestamp: new Date().toISOString()
}))
.get("/user/:id", ({ params }) => `User ID: ${params.id}`)
.get("/login", ({body}) => {
    return {message: "Login Successful", body}
})
.use(authRoutes)
.use(productsRoutes)
.use(uploadRoutes)
.use(ordersRoutes)
.listen(port);

console.log(`🚀 Server running on port ${port}`);
console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);

if (isDev) {
  console.log(`📚 API Docs: http://localhost:${port}/docs`);
  console.log(`🌐 API Base: http://localhost:${port}`);
} else {
  console.log(`✅ Production server started successfully`);
}