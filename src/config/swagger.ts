import { swagger } from "@elysiajs/swagger";

export const swaggerConfig = swagger({
    documentation: {
        info: {
            title: "Authentic Caravelas API",
            version: "1.0.0",
            description: "Elysia + Prisma (MongoDB) API documentation"
        },
        tags: [
            { name: "Auth", description: "Authentication endpoints" },
            { name: "Products", description: "Public products endpoints" },
            { name: "Admin", description: "Admin protected endpoints" }
        ]
    },
    path: "/docs"
});
