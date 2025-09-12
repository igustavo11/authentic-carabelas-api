import { Elysia, t } from "elysia";
import { authPlugin } from "../utils/auth";
import { ProductsController } from "../controllers/products.controller";
import { listProductsSchema, createProductSchema, updateProductSchema, toggleOutOfStockSchema } from "../schemas/products.schemas";

export const productsRoutes = (app: Elysia) =>
    app
    // Public: list products with optional filters
    .get("/products", 
        ({ query, set }) => ProductsController.listProducts(query, set), 
        {
            ...listProductsSchema,
            detail: {
                tags: ["Products"],
                summary: "List products",
                description: "List all products with optional filters for category and text search"
            }
        }
    )
    // Public: get product by id
    .get("/products/:id", 
        ({ params, set }) => ProductsController.getProduct(params, set), 
        {
            params: t.Object({ id: t.String() }),
            detail: { tags: ["Products"], summary: "Get product by id" }
        }
    )
    // Admin protected block
    .use(authPlugin)
    // Admin: list products
    .get("/admin/products", 
        ({ jwt, headers, set }) => ProductsController.listAdminProducts(jwt, headers, set), 
        {
            detail: { tags: ["Admin", "Products"], summary: "Admin list products" }
        }
    )
    // Admin: create product
    .post("/admin/products", 
        ({ body, jwt, headers, set }) => ProductsController.createProduct(body, jwt, headers, set), 
        {
            ...createProductSchema,
            detail: { 
                tags: ["Admin", "Products"], 
                summary: "Create product",
                description: "Create a new product (Admin only)"
            }
        }
    )
    // Admin: update product
    .put("/admin/products/:id", 
        ({ params, body, jwt, headers, set }) => ProductsController.updateProduct(params, body, jwt, headers, set), 
        {
            ...updateProductSchema,
            detail: { tags: ["Admin", "Products"], summary: "Update product" }
        }
    )
    // Admin: delete product
    .delete("/admin/products/:id", 
        ({ params, jwt, headers, set }) => ProductsController.deleteProduct(params, jwt, headers, set), 
        {
            params: t.Object({ id: t.String() }),
            detail: { tags: ["Admin", "Products"], summary: "Delete product" }
        }
    )
    // Admin: toggle out of stock status
    .patch("/admin/products/:id/toggle-out-of-stock", 
        ({ params, jwt, headers, set }) => ProductsController.toggleOutOfStock(params, jwt, headers, set), 
        {
            ...toggleOutOfStockSchema,
            detail: { 
                tags: ["Admin", "Products"], 
                summary: "Toggle product out of stock status",
                description: "Toggle the out of stock status of a product (Admin only)"
            }
        }
    );

export type ProductsRoutes = typeof productsRoutes;